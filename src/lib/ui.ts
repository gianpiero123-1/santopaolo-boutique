import type { Booking } from './constants';
import { DEFAULT_CHECKIN_HOUR, DEFAULT_CHECKOUT_HOUR } from './constants';
import { dateOnly, today, toISODate } from './dates';

export interface DisplayStatus {
  cls: string; // CSS modifier for .status
  label: string;
}

/**
 * Derive the human display status of a booking relative to today (Rome).
 * Computed, not stored — only confirmed/cancelled live in the DB.
 */
export function bookingDisplayStatus(booking: Booking, todayISO?: string): DisplayStatus {
  if (booking.status === 'cancelled') {
    return { cls: 'cancellata', label: 'Cancellata' };
  }
  const t = todayISO ?? toISODate(today());
  const ci = booking.checkin_date;
  const co = booking.checkout_date;

  if (co < t) return { cls: 'passata', label: 'Completata' };
  if (co === t) return { cls: 'check-out', label: 'Check-out oggi' };
  if (ci > t) return { cls: 'futura', label: 'Futura' };
  if (ci === t) return { cls: 'in-arrivo', label: 'In arrivo' };
  return { cls: 'in-casa', label: 'In casa' }; // ci < t < co
}

/** "26 giu, 15:00" style date+time for the default check-in/out hours. */
export function checkinTimeLabel(): string {
  return `${String(DEFAULT_CHECKIN_HOUR).padStart(2, '0')}:00`;
}
export function checkoutTimeLabel(): string {
  return `${String(DEFAULT_CHECKOUT_HOUR).padStart(2, '0')}:00`;
}

/** Per-night amount, rounded. */
export function perNight(booking: Booking): number | null {
  if (booking.total_amount == null || booking.nights <= 0) return null;
  return Math.round(booking.total_amount / booking.nights);
}

/** Guest name with "+N" guest suffix, e.g. "James O'Connor +5". */
export function guestWithCount(booking: Booking): string {
  const extra = booking.guest_count > 1 ? ` +${booking.guest_count - 1}` : '';
  return `${booking.guest_name}${extra}`;
}

/** Whether a channel string is a direct booking. */
export function isDirect(ota: string | null): boolean {
  return (ota ?? '').toLowerCase().includes('diretto');
}

/** Column index (1-based offset from the range start) for a date in the grid. */
export function dayColumn(iso: string, rangeStartISO: string): number {
  const start = dateOnly(rangeStartISO).getTime();
  const d = dateOnly(iso).getTime();
  return Math.round((d - start) / 86_400_000);
}
