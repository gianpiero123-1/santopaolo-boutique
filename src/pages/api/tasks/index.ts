export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { isAuthenticated } from '../../../lib/auth';
import type { TaskType, Recurring } from '../../../lib/constants';

const TASK_TYPES: TaskType[] = ['cleaning', 'laundry', 'tax', 'checkin', 'checkout', 'maintenance', 'other'];
const RECURRING: Recurring[] = ['daily', 'weekly', 'monthly'];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export const GET: APIRoute = async ({ request, url }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const supabase = createServerSupabase();

  let q = supabase.from('tasks').select('*').order('due_at', { ascending: true });

  const status = url.searchParams.get('status');
  if (status) q = q.eq('status', status);
  const from = url.searchParams.get('from');
  if (from) q = q.gte('due_at', from);
  const to = url.searchParams.get('to');
  if (to) q = q.lte('due_at', to);

  const { data, error } = await q;
  if (error) return json({ error: error.message }, 500);
  return json({ tasks: data });
};

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const supabase = createServerSupabase();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const dueAt = typeof body.due_at === 'string' ? body.due_at : '';
  if (!title) return json({ error: 'title is required' }, 400);
  if (!dueAt || Number.isNaN(Date.parse(dueAt))) return json({ error: 'valid due_at is required' }, 400);

  const taskType = TASK_TYPES.includes(body.task_type as TaskType) ? (body.task_type as TaskType) : 'other';
  const recurring = RECURRING.includes(body.recurring as Recurring) ? (body.recurring as Recurring) : null;
  const apartmentIds = Array.isArray(body.apartment_ids)
    ? body.apartment_ids.map((n) => Number(n)).filter((n) => Number.isInteger(n))
    : [];

  // telegram_reminder_at = due_at - reminder minutes
  let reminderAt: string | null = null;
  const mins = body.telegram_reminder_minutes;
  if (typeof mins === 'number' && mins > 0) {
    reminderAt = new Date(Date.parse(dueAt) - mins * 60_000).toISOString();
  }

  const insert = {
    title,
    description: typeof body.description === 'string' && body.description.trim() ? body.description.trim() : null,
    due_at: new Date(dueAt).toISOString(),
    apartment_ids: apartmentIds,
    task_type: taskType,
    booking_id: typeof body.booking_id === 'string' && body.booking_id ? body.booking_id : null,
    telegram_reminder_at: reminderAt,
    recurring,
  };

  const { data, error } = await supabase.from('tasks').insert(insert).select('*').single();
  if (error) return json({ error: error.message }, 500);
  return json({ task: data }, 201);
};
