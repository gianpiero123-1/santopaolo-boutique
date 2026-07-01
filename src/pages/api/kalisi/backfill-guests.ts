export const prerender = false;
export const config = { maxDuration: 60 };

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { loginKalisi, fetchGuestsList, fetchGuestDetail } from '../../../lib/kalisi-client';
import { env } from '../../../lib/env';

const RATE_LIMIT_MS = 500;

export const GET: APIRoute = async ({ url }) => {
  const secret = url.searchParams.get('secret');
  if (secret !== env('CRON_SECRET')) {
    return new Response('unauthorized', { status: 401 });
  }

  const supabase = createServerSupabase();
  const startedAt = Date.now();
  const log: any = { synced: 0, skipped: 0, errors: [] as any[] };

  try {
    const cookies = await loginKalisi();
    const list = await fetchGuestsList(cookies, 500);
    log.total_in_kalisi = list.length;

    const heads = list.filter((g) => g.is_head);
    log.heads = heads.length;

    for (const row of heads) {
      try {
        const detail = await fetchGuestDetail(cookies, row.kalisi_guest_id);
        const record = {
          kalisi_guest_id: row.kalisi_guest_id,
          order_kalisi_id: row.order_kalisi_id,
          order_code: row.order_code,
          apartment_id: row.apartment_id,
          apartment_label: row.apartment_label,
          typology: row.typology,
          is_head: row.is_head,
          checkin_date: row.checkin_date,
          checkout_date: row.checkout_date,
          ...detail,
          raw_data: detail,
        };
        const { error } = await supabase
          .from('guests')
          .upsert(record, { onConflict: 'kalisi_guest_id' });
        if (error) throw error;
        log.synced += 1;
        await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
      } catch (err: any) {
        log.errors.push({ guest_id: row.kalisi_guest_id, error: err.message });
        if (log.errors.length > 10) break; // safety
      }
    }
  } catch (err: any) {
    log.fatal = err.message;
  }

  log.elapsed_ms = Date.now() - startedAt;
  return new Response(JSON.stringify(log, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
