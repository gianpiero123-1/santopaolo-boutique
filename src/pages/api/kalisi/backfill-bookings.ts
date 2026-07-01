export const prerender = false;
export const config = { maxDuration: 60 };

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { createKalisiClient } from '../../../lib/kalisi-client';
import { env } from '../../../lib/env';
import { today, dateOnly, addDays } from '../../../lib/dates';

export const GET: APIRoute = async ({ url }) => {
  const secret = url.searchParams.get('secret');
  if (secret !== env('CRON_SECRET')) {
    return new Response('unauthorized', { status: 401 });
  }

  const supabase = createServerSupabase();
  const startedAt = Date.now();
  const log: any = { synced: 0, errors: [] as any[] };

  try {
    const client = createKalisiClient();
    await client.login();

    // Wide range: from the start of the season to 90 days ahead.
    const from = dateOnly('2026-04-01');
    const to = addDays(today(), 90);
    const orders = await client.fetchOrders(from, to);
    log.total_in_kalisi = orders.length;

    if (orders.length) {
      const { error } = await supabase
        .from('bookings_cache')
        .upsert(orders, { onConflict: 'kalisi_id' });
      if (error) throw error;
      log.synced = orders.length;
    }
  } catch (err: any) {
    log.fatal = err.message;
  }

  log.elapsed_ms = Date.now() - startedAt;
  return new Response(JSON.stringify(log, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
