export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { isAuthenticated } from '../../../lib/auth';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export const PATCH: APIRoute = async ({ request, params }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const supabase = createServerSupabase();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!content) return json({ error: 'content is required' }, 400);

  const { data, error } = await supabase.from('notes').update({ content }).eq('id', params.id).select('*').maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!data) return json({ error: 'not found' }, 404);
  return json({ note: data });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const supabase = createServerSupabase();
  const { error } = await supabase.from('notes').delete().eq('id', params.id);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
};
