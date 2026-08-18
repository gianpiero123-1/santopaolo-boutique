export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { isAuthenticated } from '../../../lib/auth';
import { QUOTE_CHANNELS } from '../../../lib/booking-request';

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

/** Salva importi e canale del preventivo. grand_total viene ricalcolato qui. */
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

  const accommodation = parseMoney(body.accommodation_total);
  if (accommodation === false) return json({ error: 'accommodation_total must be a non-negative number' }, 400);
  if (accommodation !== undefined) update.accommodation_total = accommodation;

  const touristTax = parseMoney(body.tourist_tax_total);
  if (touristTax === false) return json({ error: 'tourist_tax_total must be a non-negative number' }, 400);
  if (touristTax !== undefined) update.tourist_tax_total = touristTax;

  if (body.quote_channel !== undefined) {
    if (body.quote_channel === null || body.quote_channel === '') {
      update.quote_channel = null;
    } else if (
      typeof body.quote_channel === 'string' &&
      (QUOTE_CHANNELS as readonly string[]).includes(body.quote_channel)
    ) {
      update.quote_channel = body.quote_channel;
    } else {
      return json({ error: `quote_channel must be one of: ${QUOTE_CHANNELS.join(', ')}` }, 400);
    }
  }

  if (Object.keys(update).length === 0) return json({ error: 'no editable fields in body' }, 400);

  const supabase = createServerSupabase();

  // Servono i valori correnti per ricalcolare grand_total quando arriva un solo importo.
  const { data: current, error: currentError } = await supabase
    .from('booking_requests')
    .select('accommodation_total, tourist_tax_total')
    .eq('id', id)
    .maybeSingle();
  if (currentError) return json({ error: currentError.message }, 500);
  if (!current) return json({ error: 'not found' }, 404);

  if (accommodation !== undefined || touristTax !== undefined) {
    const acc = accommodation !== undefined ? accommodation : (current.accommodation_total as number | null);
    const tax = touristTax !== undefined ? touristTax : (current.tourist_tax_total as number | null);
    update.grand_total =
      acc == null && tax == null ? null : Math.round(((acc ?? 0) + (tax ?? 0)) * 100) / 100;
  }
  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('booking_requests')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();
  if (error) return json({ error: error.message }, 500);
  return json({ request: data });
};
