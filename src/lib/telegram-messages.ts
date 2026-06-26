// Plain-text Telegram message builders. Conventions: no emoji, no markdown,
// commas as separators (never dashes), one fact per line.

import type { Booking, Task } from './constants';
import { APARTMENT_ORDER, apartmentShort, TASK_TYPE_LABELS } from './constants';
import {
  dateOnly, formatDayMonth, formatWeekdayDayMonth, formatEuro, formatTime,
} from './dates';
import { guestWithCount, checkinTimeLabel, checkoutTimeLabel } from './ui';

const SITE = 'admin.santopaoloapartments.com';

export function formatNewBooking(b: Booking): string {
  const ci = dateOnly(b.checkin_date);
  const co = dateOnly(b.checkout_date);
  const lines = [
    `Nuova prenotazione, ${b.apartment_label}`,
    '',
    `${guestWithCount(b)} ospiti`,
    `Check-in, ${formatDayMonth(ci)} ore ${checkinTimeLabel()}`,
    `Check-out, ${formatDayMonth(co)} ore ${checkoutTimeLabel()}`,
    `${b.nights} notti, ${formatEuro(b.total_amount)}, ${b.ota || 'Diretto'}`,
  ];
  if (b.ota_booking_code) lines.push(`Codice OTA, ${b.ota_booking_code}`);
  lines.push('', `${SITE}/bookings`);
  return lines.join('\n');
}

export function formatCheckinReminder(b: Booking): string {
  const lines = [
    'Check-in tra 1 ora',
    '',
    `${guestWithCount(b)} ospiti`,
    `${b.apartment_label}, alle ${checkinTimeLabel()}`,
    `${b.nights} notti, ${formatEuro(b.total_amount)}, ${b.ota || 'Diretto'}`,
  ];
  if (b.ota_booking_code) lines.push(`Codice OTA, ${b.ota_booking_code}`);
  lines.push('', `${SITE}/calendar`);
  return lines.join('\n');
}

function taskUnitLabel(t: Task): string {
  if (!t.apartment_ids || t.apartment_ids.length === 0) return 'Tutte le unità';
  if (t.apartment_ids.length === APARTMENT_ORDER.length) return 'Tutte le unità';
  return t.apartment_ids.map(apartmentShort).join(', ');
}

export function formatTaskReminder(t: Task): string {
  const lines = [
    'Promemoria Cockpit',
    '',
    t.title,
    `${taskUnitLabel(t)}, alle ${formatTime(t.due_at)}`,
  ];
  if (t.description) lines.push(t.description);
  lines.push('', `${SITE}/tasks`);
  return lines.join('\n');
}

export function formatMorningBrief(
  todayDate: Date,
  checkins: Booking[],
  checkouts: Booking[],
  tasks: Task[],
): string {
  const lines: string[] = [];
  lines.push(`Santopaolo Cockpit, mattina di ${formatWeekdayDayMonth(todayDate)}`);
  lines.push('');

  lines.push(`Check-in oggi, ${checkins.length}`);
  for (const b of checkins) {
    lines.push(`${checkinTimeLabel()}, ${apartmentShort(b.apartment_id)}, ${guestWithCount(b)}, ${b.nights} notti, ${b.ota || 'Diretto'}`);
  }
  lines.push('');

  lines.push(`Check-out oggi, ${checkouts.length}`);
  for (const b of checkouts) {
    lines.push(`${checkoutTimeLabel()}, ${apartmentShort(b.apartment_id)}, ${guestWithCount(b)}, ${b.nights} notti, ${b.ota || 'Diretto'}`);
  }
  lines.push('');

  lines.push(`Task del giorno, ${tasks.length}`);
  for (const t of tasks) {
    lines.push(`${formatTime(t.due_at)}, ${t.title}${t.task_type !== 'other' ? `, ${TASK_TYPE_LABELS[t.task_type]}` : ''}`);
  }
  lines.push('');

  lines.push(SITE);
  return lines.join('\n');
}

export function formatSyncError(lastError: string | null): string {
  return [
    'Errore sync Kalisi, 2 tentativi falliti',
    '',
    `Ultimo errore, ${lastError || 'causa sconosciuta'}`,
    'Verificare credenziali su Vercel env',
    '',
    SITE,
  ].join('\n');
}
