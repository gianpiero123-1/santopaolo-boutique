export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { createKalisiClient } from '../../../lib/kalisi-client';
import { sendTelegramMessage } from '../../../lib/telegram';
import { formatNewBooking, formatSyncError } from '../../../lib/telegram-messages';
import { env } from '../../../lib/env';
import { today, addDays } from '../../../lib/dates';
import type { Booking } from '../../../lib/constants';

export const GET: APIRoute = async ({ request }) => {
  // Optional cron protection: only enforced if CRON_SECRET is configured.
  // Accept either the Vercel cron header (Authorization: Bearer <CRON_SECRET>)
  // or a ?secret=<CRON_SECRET> query param (external cron, e.g. cron-job.org).
  const cronSecret = env('CRON_SECRET');
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    const querySecret = new URL(request.url).searchParams.get('secret');
    if (auth !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
      return json({ error: 'unauthorized' }, 401);
    }
  }

  const supabase = createServerSupabase();

  // Open a running sync_log row.
  const { data: logRow } = await supabase
    .from('sync_log')
    .insert({ source: 'kalisi', status: 'running' })
    .select('id')
    .single();
  const logId = logRow?.id as string | undefined;

  try {
    const client = createKalisiClient();
    await client.login();

    const from = today();
    const to = addDays(from, 90);
    const orders = await client.fetchOrders(from, to);

    // Determine which kalisi_ids already exist (to flag new arrivals).
    const ids = orders.map((o) => o.kalisi_id);
    const existing = new Set<number>();
    if (ids.length) {
      const { data: existingRows } = await supabase
        .from('bookings_cache')
        .select('kalisi_id')
        .in('kalisi_id', ids);
      for (const r of (existingRows as { kalisi_id: number }[]) ?? []) existing.add(r.kalisi_id);
    }

    const newOrders = orders.filter((o) => !existing.has(o.kalisi_id));

    // Upsert all orders by kalisi_id.
    if (orders.length) {
      const { error: upsertError } = await supabase
        .from('bookings_cache')
        .upsert(orders, { onConflict: 'kalisi_id' });
      if (upsertError) throw new Error(`Upsert failed: ${upsertError.message}`);
    }

    // Re-read the freshly inserted new bookings to get their ids for Telegram.
    let newBookings: Booking[] = [];
    if (newOrders.length) {
      const { data: rows } = await supabase
        .from('bookings_cache')
        .select('*')
        .in('kalisi_id', newOrders.map((o) => o.kalisi_id));
      newBookings = (rows as Booking[]) ?? [];
    }

    if (logId) {
      await supabase
        .from('sync_log')
        .update({
          status: 'success',
          completed_at: new Date().toISOString(),
          records_synced: orders.length,
          records_new: newOrders.length,
          records_updated: orders.length - newOrders.length,
        })
        .eq('id', logId);
    }

    // Notify for each genuinely new (non-cancelled) booking.
    for (const b of newBookings) {
      if (b.status !== 'cancelled') {
        await sendTelegramMessage(formatNewBooking(b), 'new_booking', b.id);
      }
    }

    return json({
      ok: true,
      synced: orders.length,
      new: newOrders.length,
      updated: orders.length - newOrders.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (logId) {
      await supabase
        .from('sync_log')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: message,
        })
        .eq('id', logId);
    }

    // If the two most recent syncs both failed, alert via Telegram.
    const { data: recent } = await supabase
      .from('sync_log')
      .select('status, error_message')
      .order('started_at', { ascending: false })
      .limit(2);
    const last2 = (recent as { status: string; error_message: string | null }[]) ?? [];
    if (last2.length === 2 && last2.every((l) => l.status === 'failed')) {
      await sendTelegramMessage(formatSyncError(message), 'sync_error');
    }

    return json({ ok: false, error: message }, 500);
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
