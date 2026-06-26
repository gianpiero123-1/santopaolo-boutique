export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../lib/supabase-client';
import { sendTelegramMessage, alreadySent } from '../../../lib/telegram';
import { formatCheckinReminder } from '../../../lib/telegram-messages';
import { cronGuard, cronJson } from '../../../lib/cron';
import { today, toISODate, romeHourMinute } from '../../../lib/dates';
import { DEFAULT_CHECKIN_HOUR, type Booking } from '../../../lib/constants';

export const GET: APIRoute = async ({ request }) => {
  const denied = cronGuard(request);
  if (denied) return denied;

  const supabase = createServerSupabase();
  const todayISO = toISODate(today());

  // Today's confirmed arrivals.
  const { data } = await supabase
    .from('bookings_cache')
    .select('*')
    .eq('checkin_date', todayISO)
    .eq('status', 'confirmed');
  const bookings = (data as Booking[]) ?? [];

  // Current Rome time in minutes.
  const { hour, minute } = romeHourMinute(new Date().toISOString());
  const nowMinutes = hour * 60 + minute;
  const checkinMinutes = DEFAULT_CHECKIN_HOUR * 60;

  let sent = 0;
  // Send when we are within 1h of the default check-in time, once per booking.
  if (nowMinutes + 60 >= checkinMinutes) {
    for (const b of bookings) {
      if (await alreadySent('checkin_reminder', b.id)) continue;
      const result = await sendTelegramMessage(formatCheckinReminder(b), 'checkin_reminder', b.id);
      if (result.success) sent++;
    }
  }

  return cronJson({ ok: true, arrivals: bookings.length, sent });
};
