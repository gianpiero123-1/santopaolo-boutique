export const prerender = false;
export const config = { maxDuration: 60 };

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { isAuthenticated } from '../../../lib/auth';
import { env } from '../../../lib/env';
import { today, toISODate } from '../../../lib/dates';
import { computeTaxReport, currentMonth, previousMonth } from '../../../lib/tax';
import { buildTaxWorkbook, buildTaxCaption, taxFilename } from '../../../lib/tax-report';

const TELEGRAM_CHAT_ID = '850394176';

/**
 * Report tassa di soggiorno: genera l'xlsx del mese e lo invia su Telegram.
 *
 * GET /api/tax/report?secret=CRON_SECRET&month=YYYY-MM
 *   month  opzionale — default mese corrente; `prev` = mese precedente.
 *
 * Auth: ?secret=CRON_SECRET (cron esterno) oppure sessione admin valida —
 * il bottone "Invia report" in /admin/tax non conosce il secret.
 */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);

  const cronSecret = env('CRON_SECRET');
  const querySecret = url.searchParams.get('secret');
  const auth = request.headers.get('authorization');
  const viaSecret =
    !cronSecret || querySecret === cronSecret || auth === `Bearer ${cronSecret}`;
  if (!viaSecret && !isAuthenticated(request)) {
    return json({ ok: false, error: 'unauthorized' }, 401);
  }

  const todayISO = toISODate(today());
  const monthParam = url.searchParams.get('month');
  let month: string;
  if (!monthParam) month = currentMonth(todayISO);
  else if (monthParam === 'prev') month = previousMonth(currentMonth(todayISO));
  else if (/^\d{4}-\d{2}$/.test(monthParam)) month = monthParam;
  else return json({ ok: false, error: 'month must be YYYY-MM or "prev"' }, 400);

  try {
    const supabase = createServerSupabase();
    const report = await computeTaxReport(supabase, month);

    const buffer = await buildTaxWorkbook(report);
    const filename = taxFilename(month);
    const caption = buildTaxCaption(report);

    const sent = await sendTelegramDocument(buffer, filename, caption);

    return json(
      {
        ok: sent.success,
        month,
        filename,
        caption,
        rows: report.rows.length,
        total_tax: report.total_tax,
        total_paying_nights: report.total_paying_nights,
        unregistered: report.unregistered.length,
        telegram: sent.success ? 'sent' : sent.response,
      },
      sent.success ? 200 : 502,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[tax] report failed:', message);
    return json({ ok: false, error: message }, 500);
  }
};

/** Invia il file su Telegram con sendDocument. */
async function sendTelegramDocument(
  buffer: Buffer,
  filename: string,
  caption: string,
): Promise<{ success: boolean; response: unknown }> {
  const token = env('TELEGRAM_BOT_TOKEN');
  if (!token) return { success: false, response: 'TELEGRAM_BOT_TOKEN not configured' };

  const form = new FormData();
  form.append('chat_id', TELEGRAM_CHAT_ID);
  form.append('caption', caption);
  form.append(
    'document',
    new Blob([new Uint8Array(buffer)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    filename,
  );

  const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: 'POST',
    body: form,
  });
  const response = await res.json().catch(() => null);
  const success = res.ok && (response as { ok?: boolean } | null)?.ok === true;
  return { success, response };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
