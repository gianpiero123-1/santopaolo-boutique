export const prerender = false;

import type { APIRoute } from 'astro';
import { sendTelegramMessage } from '../../lib/telegram';
import { env } from '../../lib/env';

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
    name: 'Il referente è obbligatorio.',
    email: 'Indirizzo email non valido.',
    rateLimited: 'Troppe richieste. Attendi qualche minuto e riprova.',
    serverError: 'Trasmissione non riuscita. Riprova tra poco.',
  },
  en: {
    invalidBody: 'Invalid request.',
    name: 'The contact name is required.',
    email: 'Invalid email address.',
    rateLimited: 'Too many requests. Please wait a few minutes and try again.',
    serverError: 'Submission failed. Please try again shortly.',
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

interface BriefPayload {
  company: string;
  name: string;
  email: string;
  phone: string;
  project_type: string;
  dates: string;
  beds: string;
  vehicles: string;
  notes: string;
  lang: Lang;
}

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Validate the raw body; returns the clean payload or a localized error. */
function validate(body: unknown, lang: Lang): { payload?: BriefPayload; error?: string } {
  const m = MESSAGES[lang];
  if (typeof body !== 'object' || body === null) return { error: m.invalidBody };
  const b = body as Record<string, unknown>;

  const name = str(b.name, 200);
  if (!name) return { error: m.name };

  const email = str(b.email, 200);
  if (!EMAIL_RE.test(email)) return { error: m.email };

  return {
    payload: {
      company: str(b.company, 200),
      name,
      email,
      phone: str(b.phone, 50),
      project_type: str(b.project_type, 100),
      dates: str(b.dates, 200),
      beds: str(b.beds, 200),
      vehicles: str(b.vehicles, 200),
      notes: str(b.notes, 3000),
      lang,
    },
  };
}

/* ----------------------------------------------------------------- email */

/** Plain text, one form field per line, Italian labels for the recipient. */
function buildEmailText(p: BriefPayload): string {
  return [
    'Nuovo brief dalla pagina production base.',
    '',
    `Referente: ${p.name}`,
    `Produzione o società: ${p.company}`,
    `Email: ${p.email}`,
    `Telefono: ${p.phone}`,
    `Tipo di lavorazione: ${p.project_type}`,
    `Periodo: ${p.dates}`,
    `Ospiti: ${p.beds}`,
    `Mezzi in rimessaggio: ${p.vehicles}`,
    `Esigenze di superficie e note: ${p.notes}`,
    `Lingua: ${p.lang}`,
  ].join('\n');
}

/** Same Resend pattern as booking-request.ts: direct API call, same sender domain. */
async function sendBriefEmail(p: BriefPayload): Promise<boolean> {
  const apiKey = env('RESEND_API_KEY');
  if (!apiKey) {
    console.error('[brief] RESEND_API_KEY not configured');
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Santopaolo Boutique Apartments <richieste@santopaoloapartments.com>',
      to: ['gianpiero@santopaoloboutiqueapartments.com'],
      reply_to: p.email,
      subject: `Brief production base, ${p.name}`,
      text: buildEmailText(p),
    }),
  });
  if (!res.ok) {
    console.error('[brief] resend failed', res.status, await res.text().catch(() => ''));
    return false;
  }
  return true;
}

/* -------------------------------------------------------------- telegram */

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Plain text, one fact per line, only filled fields, per the Cockpit conventions. */
function buildTelegramText(p: BriefPayload): string {
  const lines = ['Nuovo brief production base', '', p.name];
  if (p.company) lines.push(p.company);
  lines.push(p.email);
  if (p.phone) lines.push(p.phone);
  if (p.project_type) lines.push(p.project_type);
  if (p.dates) lines.push(`Periodo: ${p.dates}`);
  if (p.beds) lines.push(`Ospiti: ${p.beds}`);
  if (p.vehicles) lines.push(`Mezzi: ${p.vehicles}`);
  if (p.notes) lines.push(`Note: ${p.notes}`);
  return escapeHtml(lines.join('\n'));
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

  console.log('[brief]', JSON.stringify(body));

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

  // Delivery is the whole point of this endpoint: a failure must surface as a
  // 500, never as a 200 that silently drops the brief.
  let emailOk = false;
  try {
    emailOk = await sendBriefEmail(payload);
  } catch (err) {
    console.error('[brief] email failed', err instanceof Error ? err.message : err);
  }
  if (!emailOk) return json({ ok: false, error: MESSAGES[lang].serverError }, 500);

  const telegram = await sendTelegramMessage(buildTelegramText(payload), 'production_brief');
  if (!telegram.success) {
    console.error('[brief] telegram failed', JSON.stringify(telegram.response));
    return json({ ok: false, error: MESSAGES[lang].serverError }, 500);
  }

  return json({ ok: true });
};
