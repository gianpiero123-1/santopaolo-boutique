export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { isAuthenticated } from '../../../lib/auth';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/**
 * Aggiorna un servizio extra. Con `{ paid: boolean }` imposta il valore;
 * senza corpo fa il toggle del valore corrente.
 */
export const PATCH: APIRoute = async ({ request, params }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const supabase = createServerSupabase();

  let body: Record<string, unknown> = {};
  try {
    const raw = await request.text();
    if (raw.trim()) body = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  let paid: boolean;
  if (typeof body.paid === 'boolean') {
    paid = body.paid;
  } else {
    // Toggle: serve il valore attuale.
    const { data: current, error: readError } = await supabase
      .from('extra_services')
      .select('paid')
      .eq('id', params.id)
      .maybeSingle();
    if (readError) return json({ error: readError.message }, 500);
    if (!current) return json({ error: 'not found' }, 404);
    paid = !current.paid;
  }

  const { data, error } = await supabase
    .from('extra_services')
    .update({ paid })
    .eq('id', params.id)
    .select('*')
    .maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!data) return json({ error: 'not found' }, 404);
  return json({ service: data });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const supabase = createServerSupabase();
  const { error } = await supabase.from('extra_services').delete().eq('id', params.id);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
};
