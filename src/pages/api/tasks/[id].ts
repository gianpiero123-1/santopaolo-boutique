export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { isAuthenticated } from '../../../lib/auth';
import type { TaskStatus, TaskType, Recurring } from '../../../lib/constants';

const TASK_STATUSES: TaskStatus[] = ['pending', 'completed', 'cancelled'];
const TASK_TYPES: TaskType[] = ['cleaning', 'laundry', 'tax', 'checkin', 'checkout', 'maintenance', 'other'];
const RECURRING: Recurring[] = ['daily', 'weekly', 'monthly'];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export const GET: APIRoute = async ({ request, params }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from('tasks').select('*').eq('id', params.id).maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!data) return json({ error: 'not found' }, 404);
  return json({ task: data });
};

export const PATCH: APIRoute = async ({ request, params }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const supabase = createServerSupabase();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  const update: Record<string, unknown> = {};

  if (typeof body.status === 'string' && TASK_STATUSES.includes(body.status as TaskStatus)) {
    update.status = body.status;
    // Completing sets completed_at; reopening clears it.
    update.completed_at = body.status === 'completed' ? new Date().toISOString() : null;
  }
  if (typeof body.title === 'string' && body.title.trim()) update.title = body.title.trim();
  if ('description' in body) {
    update.description = typeof body.description === 'string' && body.description.trim() ? body.description.trim() : null;
  }
  if (typeof body.due_at === 'string' && !Number.isNaN(Date.parse(body.due_at))) {
    update.due_at = new Date(body.due_at).toISOString();
  }
  if (Array.isArray(body.apartment_ids)) {
    update.apartment_ids = body.apartment_ids.map((n) => Number(n)).filter((n) => Number.isInteger(n));
  }
  if (typeof body.task_type === 'string' && TASK_TYPES.includes(body.task_type as TaskType)) {
    update.task_type = body.task_type;
  }
  if ('recurring' in body) {
    update.recurring = RECURRING.includes(body.recurring as Recurring) ? body.recurring : null;
  }
  if (typeof body.telegram_reminder_minutes === 'number' && update.due_at) {
    update.telegram_reminder_at =
      body.telegram_reminder_minutes > 0
        ? new Date(Date.parse(update.due_at as string) - body.telegram_reminder_minutes * 60_000).toISOString()
        : null;
    update.telegram_sent = false;
  }

  if (Object.keys(update).length === 0) return json({ error: 'no valid fields to update' }, 400);

  const { data, error } = await supabase.from('tasks').update(update).eq('id', params.id).select('*').maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!data) return json({ error: 'not found' }, 404);
  return json({ task: data });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!isAuthenticated(request)) return json({ error: 'unauthorized' }, 401);
  const supabase = createServerSupabase();
  const { error } = await supabase.from('tasks').delete().eq('id', params.id);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
};
