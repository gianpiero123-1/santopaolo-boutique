export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { sendTelegramMessage } from '../../../lib/telegram';
import { formatTaskReminder } from '../../../lib/telegram-messages';
import { cronGuard, cronJson } from '../../../lib/cron';
import type { Task } from '../../../lib/constants';

export const GET: APIRoute = async ({ request }) => {
  const denied = cronGuard(request);
  if (denied) return denied;

  const supabase = createServerSupabase();
  const nowISO = new Date().toISOString();

  // Due reminders that haven't been sent yet.
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .lte('telegram_reminder_at', nowISO)
    .eq('telegram_sent', false)
    .eq('status', 'pending')
    .not('telegram_reminder_at', 'is', null);

  const tasks = (data as Task[]) ?? [];
  let sent = 0;

  for (const t of tasks) {
    const result = await sendTelegramMessage(formatTaskReminder(t), 'task_reminder', t.id);
    if (result.success) {
      await supabase
        .from('tasks')
        .update({ telegram_sent: true, telegram_sent_at: new Date().toISOString() })
        .eq('id', t.id);
      sent++;
    }
  }

  return cronJson({ ok: true, candidates: tasks.length, sent });
};
