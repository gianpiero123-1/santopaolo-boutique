export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { isAuthenticated } from '../../../lib/auth';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/**
 * Importo in euro dal body: undefined = campo non toccato, null/'' = svuota,
 * numero = arrotondato ai centesimi. Ritorna false se non valido.
 */
function parseMoney(value: unknown): number | null | undefined | false {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return false;
  return Math.round(n * 100) / 100;
}

/** Salva tariffa a notte e subtotale di una singola unità della richiesta. */
export const PATCH: APIRoute = async ({ request, params }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const id = params.id ?? '';
  if (!id) return json({ error: 'missing id' }, 400);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  const update: Record<string, unknown> = {};

  const nightlyRate = parseMoney(body.nightly_rate);
  if (nightlyRate === false) return json({ error: 'nightly_rate must be a non-negative number' }, 400);
  if (nightlyRate !== undefined) update.nightly_rate = nightlyRate;

  const subtotal = parseMoney(body.subtotal);
  if (subtotal === false) return json({ error: 'subtotal must be a non-negative number' }, 400);
  if (subtotal !== undefined) update.subtotal = subtotal;

  if (Object.keys(update).length === 0) return json({ error: 'no editable fields in body' }, 400);

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('booking_request_units')
    .update(update)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!data) return json({ error: 'not found' }, 404);
  return json({ unit: data });
};
