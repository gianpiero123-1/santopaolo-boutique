export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { isAuthenticated } from '../../../lib/auth';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/** Lista servizi extra, dal più recente. */
export const GET: APIRoute = async ({ request, url }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const supabase = createServerSupabase();

  let q = supabase
    .from('extra_services')
    .select('*')
    .order('service_date', { ascending: false })
    .order('created_at', { ascending: false });

  const from = url.searchParams.get('from');
  if (from) q = q.gte('service_date', from);
  const to = url.searchParams.get('to');
  if (to) q = q.lte('service_date', to);
  const paid = url.searchParams.get('paid');
  if (paid === 'true' || paid === 'false') q = q.eq('paid', paid === 'true');

  const { data, error } = await q;
  if (error) return json({ error: error.message }, 500);
  return json({ services: data });
};

/** Crea un servizio extra. */
export const POST: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const supabase = createServerSupabase();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  const serviceDate = typeof body.service_date === 'string' ? body.service_date.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate) || Number.isNaN(Date.parse(serviceDate))) {
    return json({ error: 'service_date must be YYYY-MM-DD' }, 400);
  }

  const clientName = typeof body.client_name === 'string' ? body.client_name.trim() : '';
  if (!clientName) return json({ error: 'client_name is required' }, 400);

  const apartment = Number(body.apartment);
  if (!Number.isInteger(apartment) || apartment < 1 || apartment > 5) {
    return json({ error: 'apartment must be an integer 1-5' }, 400);
  }

  const service = typeof body.service === 'string' ? body.service.trim() : '';
  if (!service) return json({ error: 'service is required' }, 400);

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    return json({ error: 'amount must be a non-negative number' }, 400);
  }

  const insert = {
    service_date: serviceDate,
    client_name: clientName,
    apartment,
    service,
    // Gli importi in euro si fermano ai centesimi.
    amount: Math.round(amount * 100) / 100,
    paid: body.paid === true,
  };

  const { data, error } = await supabase.from('extra_services').insert(insert).select('*').single();
  if (error) return json({ error: error.message }, 500);
  return json({ service: data }, 201);
};
