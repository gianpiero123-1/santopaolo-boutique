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
  const log: any = { synced: 0, checked: 0, errors: [] as any[] };

  try {
    const cookies = await loginKalisi();
    const list = await fetchGuestsList(cookies, 500);
    const heads = list.filter((g) => g.is_head);
    log.checked = heads.length;

    const { data: existing } = await supabase
      .from('guests')
      .select('kalisi_guest_id');
    const existingIds = new Set((existing ?? []).map((r) => r.kalisi_guest_id));

    const missing = heads.filter((h) => !existingIds.has(h.kalisi_guest_id));
    log.missing = missing.length;

    for (const row of missing) {
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
