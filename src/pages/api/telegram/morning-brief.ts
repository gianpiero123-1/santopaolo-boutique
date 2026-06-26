export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { sendTelegramMessage } from '../../../lib/telegram';
import { formatMorningBrief } from '../../../lib/telegram-messages';
import { cronGuard, cronJson } from '../../../lib/cron';
import { today, addDays, toISODate, romeDateOf } from '../../../lib/dates';
import { getCheckins, getCheckouts, getTasksBetween } from '../../../lib/queries';

export const GET: APIRoute = async ({ request }) => {
  const denied = cronGuard(request);
  if (denied) return denied;

  const supabase = createServerSupabase();
  const todayDate = today();
  const todayISO = toISODate(todayDate);

  const [checkins, checkouts, tasksWindow] = await Promise.all([
    getCheckins(supabase, todayISO),
    getCheckouts(supabase, todayISO),
    // generous UTC window, filtered to the Rome calendar day
    getTasksBetween(supabase, toISODate(addDays(todayDate, -1)), toISODate(addDays(todayDate, 2)), 'pending'),
  ]);

  const tasks = tasksWindow.filter((t) => romeDateOf(t.due_at) === todayISO);

  const text = formatMorningBrief(todayDate, checkins, checkouts, tasks);
  const result = await sendTelegramMessage(text, 'morning_brief');

  return cronJson({ ok: result.success, checkins: checkins.length, checkouts: checkouts.length, tasks: tasks.length });
};
