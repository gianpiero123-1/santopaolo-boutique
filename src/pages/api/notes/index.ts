export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { isAuthenticated } from '../../../lib/auth';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/**
 * Create or update a note. Accepts JSON (returns JSON) or a form submission
 * (returns a 302 to the `redirect` field) — the booking detail panel uses the
 * latter. When an `id` is supplied the existing note is updated.
 */
export const POST: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const supabase = createServerSupabase();

  const contentType = request.headers.get('content-type') ?? '';
  const isForm = contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');

  let bookingId: string | null = null;
  let noteId: string | null = null;
  let content = '';
  let redirect: string | null = null;

  if (isForm) {
    const form = await request.formData();
    bookingId = (form.get('booking_id') as string) || null;
    noteId = (form.get('id') as string) || null;
    content = ((form.get('content') as string) || '').trim();
    redirect = (form.get('redirect') as string) || null;
  } else {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'invalid JSON' }, 400);
    }
    bookingId = typeof body.booking_id === 'string' ? body.booking_id : null;
    noteId = typeof body.id === 'string' ? body.id : null;
    content = typeof body.content === 'string' ? body.content.trim() : '';
  }

  const respond = (status: number, payload: unknown) => {
    if (redirect) return new Response(null, { status: 302, headers: { Location: redirect } });
    return json(payload, status);
  };

  if (!content) {
    // Empty content: delete the note if it exists, otherwise no-op.
    if (noteId) await supabase.from('notes').delete().eq('id', noteId);
    return respond(200, { ok: true, deleted: !!noteId });
  }

  if (noteId) {
    const { data, error } = await supabase.from('notes').update({ content }).eq('id', noteId).select('*').maybeSingle();
    if (error) return respond(500, { error: error.message });
    return respond(200, { note: data });
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({ booking_id: bookingId, content })
    .select('*')
    .single();
  if (error) return respond(500, { error: error.message });
  return respond(201, { note: data });
};
