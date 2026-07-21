export const prerender = false;
export const config = { maxDuration: 60 };

import type { APIRoute } from 'astro';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabase } from '../../../lib/supabase-client';
import { createKalisiClient, fetchOrderGuests, type KalisiClient } from '../../../lib/kalisi-client';
import { sendTelegramMessage } from '../../../lib/telegram';
import { formatNewBooking, formatSyncError } from '../../../lib/telegram-messages';
import { env } from '../../../lib/env';
import { today, addDays, toISODate } from '../../../lib/dates';
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

    try {
      await client.login();
    } catch (loginErr) {
      const loginMessage = loginErr instanceof Error ? loginErr.message : String(loginErr);
      console.error('[kalisi] login() failed:', loginMessage);

      if (logId) {
        await supabase
          .from('sync_log')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: `Login failed: ${loginMessage}`,
          })
          .eq('id', logId);
      }

      return json(
        {
          ok: false,
          stage: 'login',
          error: loginMessage,
          detail: 'Kalisi login did not complete; sync aborted (no auto-retry this request).',
        },
        502,
      );
    }

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

    // Schedine ospiti (tassa di soggiorno). Non deve mai far fallire il sync.
    let guestsResult: unknown = null;
    try {
      guestsResult = await syncBookingGuests(supabase, client);
    } catch (guestsErr) {
      const m = guestsErr instanceof Error ? guestsErr.message : String(guestsErr);
      console.error('[kalisi] booking_guests sync failed:', m);
      guestsResult = { ok: false, error: m };
    }

    return json({
      ok: true,
      synced: orders.length,
      new: newOrders.length,
      updated: orders.length - newOrders.length,
      guests: guestsResult,
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

// ==== Schedine ospiti (booking_guests) ====

/** Pausa fra le fetch a Kalisi, per non stressare il loro admin. */
const GUESTS_RATE_LIMIT_MS = 500;

/** Tetto di fetch per run: il backlog si smaltisce sulle run successive. */
const GUESTS_MAX_PER_RUN = 40;

/**
 * Scarica le schedine ospiti da /admin/orders/{id}/guests per ogni prenotazione
 * con check-out dal primo giorno del mese precedente in poi, e le salva in
 * booking_guests. Le prenotazioni già registrate e ormai concluse vengono
 * saltate: le loro schedine non cambiano più.
 */
async function syncBookingGuests(
  supabase: SupabaseClient,
  client: KalisiClient,
): Promise<Record<string, unknown>> {
  const todayDate = today();
  const from = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() - 1, 1));
  const fromISO = toISODate(from);
  const todayISO = toISODate(todayDate);

  const { data: candidateRows, error: candidatesError } = await supabase
    .from('bookings_cache')
    .select('id, kalisi_id, checkout_date, status')
    .gte('checkout_date', fromISO)
    .order('checkin_date', { ascending: true });
  if (candidatesError) throw new Error(`booking_guests candidates: ${candidatesError.message}`);

  const candidates = (candidateRows ?? []).filter((b: any) => b.status !== 'cancelled');

  // Chi ha già schedine salvate.
  const withGuests = new Set<string>();
  if (candidates.length) {
    const { data: existingGuests } = await supabase
      .from('booking_guests')
      .select('booking_id')
      .in('booking_id', candidates.map((b: any) => b.id));
    for (const g of (existingGuests ?? []) as { booking_id: string }[]) withGuests.add(g.booking_id);
  }

  // Una prenotazione conclusa e già registrata non va più interrogata.
  const pending = candidates.filter(
    (b: any) => !(withGuests.has(b.id) && b.checkout_date < todayISO),
  );

  const batch = pending.slice(0, GUESTS_MAX_PER_RUN);
  const result = {
    candidates: candidates.length,
    pending: pending.length,
    fetched: 0,
    with_guests: 0,
    rows_upserted: 0,
    not_registered: 0,
    deferred: Math.max(0, pending.length - batch.length),
    errors: [] as { kalisi_id: number; error: string }[],
  };

  for (const b of batch as any[]) {
    try {
      const guests = await fetchOrderGuests(client.sessionCookie ?? '', b.kalisi_id);
      result.fetched += 1;

      // Solo gli ospiti effettivamente registrati (birthdate valorizzato).
      const registered = guests.filter((g) => g.birthdate !== null);
      if (registered.length === 0) {
        result.not_registered += 1;
        continue;
      }

      const records = registered.map((g) => ({
        booking_id: b.id,
        first_name: g.first_name,
        last_name: g.last_name,
        birthdate: g.birthdate,
      }));

      const { error } = await supabase
        .from('booking_guests')
        .upsert(records, { onConflict: 'booking_id,first_name,last_name,birthdate' });
      if (error) throw new Error(error.message);

      result.with_guests += 1;
      result.rows_upserted += records.length;
    } catch (err) {
      result.errors.push({
        kalisi_id: b.kalisi_id,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    await new Promise((r) => setTimeout(r, GUESTS_RATE_LIMIT_MS));
  }

  return result;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
