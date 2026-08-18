export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../../lib/supabase-client';
import { isAuthenticated } from '../../../../lib/auth';
import { REQUEST_STATUSES, type RequestStatus } from '../../../../lib/booking-request';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/** Azioni ammesse dal Cockpit. kalisi_blocked non tocca lo status. */
const ACTIONS = [
  'quoted',
  'confirmed_awaiting_payment',
  'paid',
  'rejected',
  'cancelled',
  'kalisi_blocked',
] as const;

/** Cambio di stato di una richiesta secondo le regole del Cockpit. */
export const POST: APIRoute = async ({ request, params }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const id = params.id ?? '';
  if (!id) return json({ error: 'missing id' }, 400);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  const action = body.action;
  if (typeof action !== 'string' || !(ACTIONS as readonly string[]).includes(action)) {
    return json({ error: `action must be one of: ${ACTIONS.join(', ')}` }, 400);
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = { updated_at: now };

  if (action === 'kalisi_blocked') {
    update.kalisi_blocked_at = now;
  } else {
    // Ogni azione qui coincide con lo status di arrivo: va comunque validato
    // contro la lista consentita prima di scriverlo.
    if (!(REQUEST_STATUSES as readonly string[]).includes(action)) {
      return json({ error: `invalid status: ${action}` }, 400);
    }
    update.status = action as RequestStatus;

    if (action === 'quoted') update.quote_sent_at = now;
    if (action === 'paid') update.paid_at = now;
    if (action === 'rejected') {
      const reason = typeof body.rejected_reason === 'string' ? body.rejected_reason.trim().slice(0, 500) : '';
      if (!reason) return json({ error: 'rejected_reason is required' }, 400);
      update.rejected_reason = reason;
    }
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('booking_requests')
    .update(update)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!data) return json({ error: 'not found' }, 404);
  return json({ request: data });
};
