export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../lib/supabase-client';
import { sendTelegramMessage } from '../../lib/telegram';
import { env } from '../../lib/env';
import { dateOnly, daysBetween, toDDMMYYYY, toISODate, today } from '../../lib/dates';
import {
  APP_CAPACITY,
  APP_LABELS,
  APP_TO_KALISI,
  MAX_UNITS,
  type RequestUnitInput,
} from '../../lib/booking-request';

type Lang = 'it' | 'en';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/* ------------------------------------------------------------- messages */

const MESSAGES = {
  it: {
    invalidBody: 'Richiesta non valida.',
    name: 'Il nome è obbligatorio.',
    email: 'Indirizzo email non valido.',
    noUnits: 'Seleziona almeno una unità.',
    tooManyUnits: `Massimo ${MAX_UNITS} unità per richiesta.`,
    badApp: 'Appartamento non valido.',
    badDates: 'Date non valide.',
    checkinPast: 'La data di check-in non può essere nel passato.',
    checkoutOrder: 'Il check-out deve essere successivo al check-in.',
    badGuests: 'Numero di ospiti non valido.',
    capacity: (label: string, max: number) => `${label} ospita al massimo ${max} persone.`,
    rateLimited: 'Troppe richieste. Attendi qualche minuto e riprova.',
    serverError: 'Non siamo riusciti a registrare la richiesta. Riprova tra poco.',
  },
  en: {
    invalidBody: 'Invalid request.',
    name: 'Name is required.',
    email: 'Invalid email address.',
    noUnits: 'Select at least one unit.',
    tooManyUnits: `A maximum of ${MAX_UNITS} units per request.`,
    badApp: 'Invalid apartment.',
    badDates: 'Invalid dates.',
    checkinPast: 'The check-in date cannot be in the past.',
    checkoutOrder: 'Check-out must be after check-in.',
    badGuests: 'Invalid number of guests.',
    capacity: (label: string, max: number) => `${label} sleeps a maximum of ${max} guests.`,
    rateLimited: 'Too many requests. Please wait a few minutes and try again.',
    serverError: 'We could not record your request. Please try again shortly.',
  },
} as const;

/* ------------------------------------------------------------ rate limit */

const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 5;
const rateHits = new Map<string, number[]>();

/** Simple per-instance in-memory limit: max 5 requests per IP per 10 minutes. */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateHits.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    rateHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  rateHits.set(ip, hits);
  if (rateHits.size > 1000) {
    for (const [key, times] of rateHits) {
      if (times.every(t => now - t >= RATE_WINDOW_MS)) rateHits.delete(key);
    }
  }
  return false;
}

/* ------------------------------------------------------------ validation */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface ValidUnit extends RequestUnitInput {
  nights: number;
}

interface ValidPayload {
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  guest_country: string | null;
  notes: string | null;
  lang: Lang;
  units: ValidUnit[];
}

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Validate the raw body; returns the clean payload or a localized error. */
function validate(body: unknown, lang: Lang): { payload?: ValidPayload; error?: string } {
  const m = MESSAGES[lang];
  if (typeof body !== 'object' || body === null) return { error: m.invalidBody };
  const b = body as Record<string, unknown>;

  const guest_name = str(b.guest_name, 200);
  if (!guest_name) return { error: m.name };

  const guest_email = str(b.guest_email, 200);
  if (!EMAIL_RE.test(guest_email)) return { error: m.email };

  if (!Array.isArray(b.units) || b.units.length === 0) return { error: m.noUnits };
  if (b.units.length > MAX_UNITS) return { error: m.tooManyUnits };

  const todayDate = today();
  const units: ValidUnit[] = [];

  for (const raw of b.units) {
    if (typeof raw !== 'object' || raw === null) return { error: m.invalidBody };
    const u = raw as Record<string, unknown>;

    const app_number = Number(u.app_number);
    if (!Number.isInteger(app_number) || !(app_number in APP_TO_KALISI)) {
      return { error: m.badApp };
    }

    const check_in = str(u.check_in, 10);
    const check_out = str(u.check_out, 10);
    if (!DATE_RE.test(check_in) || !DATE_RE.test(check_out)) return { error: m.badDates };
    const ci = dateOnly(check_in);
    const co = dateOnly(check_out);
    // Round-trip catches impossible dates such as 2026-02-31.
    if (toISODate(ci) !== check_in || toISODate(co) !== check_out) return { error: m.badDates };
    if (ci < todayDate) return { error: m.checkinPast };
    if (co <= ci) return { error: m.checkoutOrder };

    const adults = Number(u.adults);
    const children = Number(u.children);
    if (!Number.isInteger(adults) || adults < 1) return { error: m.badGuests };
    if (!Number.isInteger(children) || children < 0) return { error: m.badGuests };
    const cap = APP_CAPACITY[app_number];
    if (adults + children > cap) {
      return { error: m.capacity(APP_LABELS[app_number], cap) };
    }

    units.push({ app_number, check_in, check_out, adults, children, nights: daysBetween(ci, co) });
  }

  return {
    payload: {
      guest_name,
      guest_email,
      guest_phone: str(b.guest_phone, 50) || null,
      guest_country: str(b.guest_country, 100) || null,
      notes: str(b.notes, 2000) || null,
      lang,
      units,
    },
  };
}

/* -------------------------------------------------------------- telegram */

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function guestsLabel(adults: number, children: number): string {
  const parts = [adults === 1 ? '1 adulto' : `${adults} adulti`];
  if (children > 0) parts.push(children === 1 ? '1 bambino' : `${children} bambini`);
  return parts.join(', ');
}

/** Plain text, comma separators, one fact per line, per the Cockpit conventions. */
function buildTelegramText(code: string, p: ValidPayload): string {
  const lines = [
    `Nuova richiesta preventivo, ${code}`,
    '',
    p.guest_name,
    p.guest_email,
  ];
  if (p.guest_phone) lines.push(p.guest_phone);
  if (p.guest_country) lines.push(p.guest_country);
  lines.push('');
  for (const u of p.units) {
    lines.push(
      `App ${u.app_number}, ${toDDMMYYYY(dateOnly(u.check_in))}, ${toDDMMYYYY(dateOnly(u.check_out))}, ` +
      `${u.nights} ${u.nights === 1 ? 'notte' : 'notti'}, ${guestsLabel(u.adults, u.children)}`,
    );
  }
  if (p.notes) lines.push('', `Note, ${p.notes}`);
  return escapeHtml(lines.join('\n'));
}

/* ----------------------------------------------------------------- email */

const EMAIL_COPY = {
  it: {
    subject: (code: string) => `Richiesta ricevuta, ${code}`,
    title: 'Richiesta ricevuta',
    intro: 'Abbiamo ricevuto la tua richiesta di preventivo.',
    codeLabel: 'Codice richiesta',
    summary: 'Riepilogo del soggiorno',
    night: 'notte',
    nights: 'notti',
    adult: 'adulto',
    adults: 'adulti',
    child: 'bambino',
    children: 'bambini',
    promise: 'Rispondiamo entro 2 ore, dalle 9 alle 22.',
    address: 'Vico Santa Maria a Cappella Vecchia 8b, Chiaia, Napoli',
  },
  en: {
    subject: (code: string) => `Request received, ${code}`,
    title: 'Request received',
    intro: 'We have received your quote request.',
    codeLabel: 'Request code',
    summary: 'Stay summary',
    night: 'night',
    nights: 'nights',
    adult: 'adult',
    adults: 'adults',
    child: 'child',
    children: 'children',
    promise: 'We reply within 2 hours, 9am to 10pm.',
    address: 'Vico Santa Maria a Cappella Vecchia 8b, Chiaia, Naples',
  },
} as const;

function buildReceiptHtml(code: string, p: ValidPayload): string {
  const c = EMAIL_COPY[p.lang];
  const unitRows = p.units
    .map(u => {
      const guests = [
        `${u.adults} ${u.adults === 1 ? c.adult : c.adults}`,
        u.children > 0 ? `${u.children} ${u.children === 1 ? c.child : c.children}` : '',
      ].filter(Boolean).join(', ');
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #2A2A2A;">
            <p style="margin:0 0 4px;color:#F5F2EC;font-size:15px;">${APP_LABELS[u.app_number]}</p>
            <p style="margin:0;color:#8A8580;font-size:13px;">
              ${toDDMMYYYY(dateOnly(u.check_in))} &rarr; ${toDDMMYYYY(dateOnly(u.check_out))},
              ${u.nights} ${u.nights === 1 ? c.night : c.nights}, ${guests}
            </p>
          </td>
        </tr>`;
    })
    .join('');

  return `<!doctype html>
<html lang="${p.lang}">
<body style="margin:0;padding:0;background-color:#0E0E0E;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0E0E0E;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#1C1C1C;border:1px solid #2A2A2A;">
          <tr>
            <td style="padding:32px 32px 24px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 24px;color:#8A8580;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
                Santopaolo Boutique Apartments
              </p>
              <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;color:#F5F2EC;font-size:26px;">
                ${c.title}
              </h1>
              <p style="margin:0 0 20px;color:#F5F2EC;font-size:15px;line-height:1.6;">
                ${c.intro}
              </p>
              <p style="margin:0 0 4px;color:#8A8580;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${c.codeLabel}</p>
              <p style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;color:#F5F2EC;font-size:22px;">${code}</p>
              <p style="margin:0 0 8px;color:#8A8580;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${c.summary}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #2A2A2A;">
                ${unitRows}
              </table>
              <p style="margin:24px 0 0;color:#F5F2EC;font-size:15px;line-height:1.6;">
                ${c.promise}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;border-top:1px solid #2A2A2A;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 4px;color:#8A8580;font-size:13px;">+39 331 322 5577</p>
              <p style="margin:0;color:#8A8580;font-size:13px;">${c.address}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendReceiptEmail(code: string, p: ValidPayload): Promise<void> {
  const apiKey = env('RESEND_API_KEY');
  if (!apiKey) {
    console.error('[booking-request] RESEND_API_KEY not configured, receipt email skipped');
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Santopaolo Boutique Apartments <richieste@santopaoloapartments.com>',
      to: [p.guest_email],
      reply_to: 'gianpiero@santopaoloboutiqueapartments.com',
      subject: EMAIL_COPY[p.lang].subject(code),
      html: buildReceiptHtml(code, p),
    }),
  });
  if (!res.ok) {
    console.error('[booking-request] resend failed', res.status, await res.text().catch(() => ''));
  }
}

/* -------------------------------------------------------------- endpoint */

export const POST: APIRoute = async ctx => {
  let lang: Lang = 'it';

  let body: unknown;
  try {
    body = await ctx.request.json();
  } catch {
    return json({ ok: false, error: MESSAGES[lang].invalidBody }, 400);
  }
  if (typeof body === 'object' && body !== null && (body as { lang?: unknown }).lang === 'en') {
    lang = 'en';
  }

  let ip = ctx.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  if (!ip) {
    try {
      ip = ctx.clientAddress;
    } catch {
      ip = 'unknown';
    }
  }
  if (isRateLimited(ip)) {
    return json({ ok: false, error: MESSAGES[lang].rateLimited }, 429);
  }

  const { payload, error } = validate(body, lang);
  if (!payload) return json({ ok: false, error }, 400);

  const supabase = createServerSupabase();

  // Parent row: request_code comes from the database default, never from here.
  const { data: requestRow, error: requestError } = await supabase
    .from('booking_requests')
    .insert({
      guest_name: payload.guest_name,
      guest_email: payload.guest_email,
      guest_phone: payload.guest_phone,
      guest_country: payload.guest_country,
      notes: payload.notes,
      lang: payload.lang,
    })
    .select('id, request_code')
    .single();

  if (requestError || !requestRow) {
    console.error('[booking-request] insert booking_requests failed', requestError?.message);
    return json({ ok: false, error: MESSAGES[lang].serverError }, 500);
  }

  const requestId: string = requestRow.id;
  const requestCode: string = requestRow.request_code;

  // Unit rows. `nights` is a generated column, the database computes it.
  const { error: unitsError } = await supabase.from('booking_request_units').insert(
    payload.units.map(u => ({
      request_id: requestId,
      app_number: u.app_number,
      kalisi_apartment_id: APP_TO_KALISI[u.app_number],
      check_in: u.check_in,
      check_out: u.check_out,
      adults: u.adults,
      children: u.children,
      // The form does not distinguish children under 13, so paying guests
      // stays equal to adults for now.
      paying_guests: u.adults,
    })),
  );

  if (unitsError) {
    console.error('[booking-request] insert booking_request_units failed', unitsError.message);
    await supabase.from('booking_requests').delete().eq('id', requestId);
    return json({ ok: false, error: MESSAGES[lang].serverError }, 500);
  }

  // Notifications are best effort: a Telegram or email failure must never fail
  // the request itself.
  try {
    await sendTelegramMessage(buildTelegramText(requestCode, payload), 'booking_request', requestId);
  } catch (err) {
    console.error('[booking-request] telegram failed', err instanceof Error ? err.message : err);
  }

  try {
    await sendReceiptEmail(requestCode, payload);
  } catch (err) {
    console.error('[booking-request] receipt email failed', err instanceof Error ? err.message : err);
  }

  return json({ ok: true, request_code: requestCode });
};
