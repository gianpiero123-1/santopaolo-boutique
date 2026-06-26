// Shared constants and types for the Cockpit admin dashboard.

/** Kalisi apartment_id -> display label + metadata. */
export interface ApartmentInfo {
  label: string;
  /** Short label used in compact UI, e.g. "App 1". */
  short: string;
  sqm: number;
  guests: number;
}

export const APARTMENTS: Record<number, ApartmentInfo> = {
  16799: { label: 'Santopaolo 1', short: 'App 1', sqm: 90, guests: 6 },
  16784: { label: 'Santopaolo 2', short: 'App 2', sqm: 60, guests: 2 },
  16788: { label: 'Santopaolo 3', short: 'App 3', sqm: 70, guests: 4 },
  15813: { label: 'Santopaolo 4', short: 'App 4', sqm: 60, guests: 4 },
  16786: { label: 'Santopaolo 5', short: 'App 5', sqm: 45, guests: 2 },
};

/** Ordered list of apartments as shown in the calendar / filters. */
export const APARTMENT_ORDER: number[] = [16799, 16784, 16788, 15813, 16786];

export function apartmentLabel(apartmentId: number): string {
  return APARTMENTS[apartmentId]?.label ?? `Apt ${apartmentId}`;
}

export function apartmentShort(apartmentId: number): string {
  return APARTMENTS[apartmentId]?.short ?? `Apt ${apartmentId}`;
}

/** Default check-in / check-out times (Italian local time). */
export const DEFAULT_CHECKIN_HOUR = 15;
export const DEFAULT_CHECKOUT_HOUR = 11;

export const CHANNELS = ['Booking', 'Airbnb', 'Vrbo', 'Diretto'] as const;
export type Channel = (typeof CHANNELS)[number];

export type BookingStatus =
  | 'confirmed'
  | 'cancelled'
  | 'checked_in'
  | 'checked_out'
  | 'no_show';

export type TaskType =
  | 'cleaning'
  | 'laundry'
  | 'tax'
  | 'checkin'
  | 'checkout'
  | 'maintenance'
  | 'other';

export type TaskStatus = 'pending' | 'completed' | 'cancelled';

export type Recurring = 'daily' | 'weekly' | 'monthly';

/** Row shape of bookings_cache. */
export interface Booking {
  id: string;
  kalisi_id: number;
  apartment_id: number;
  apartment_label: string;
  guest_name: string;
  guest_count: number;
  guest_phone: string | null;
  guest_email: string | null;
  checkin_date: string; // YYYY-MM-DD
  checkout_date: string; // YYYY-MM-DD
  nights: number;
  ota: string | null;
  ota_booking_code: string | null;
  total_amount: number | null;
  commission: number | null;
  status: BookingStatus;
  raw_payload: unknown;
  created_at: string;
  updated_at: string;
}

/** Row shape of tasks. */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_at: string; // ISO timestamptz
  apartment_ids: number[];
  task_type: TaskType;
  booking_id: string | null;
  status: TaskStatus;
  telegram_reminder_at: string | null;
  telegram_sent: boolean;
  telegram_sent_at: string | null;
  recurring: Recurring | null;
  recurring_end_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Row shape of notes. */
export interface Note {
  id: string;
  booking_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

/** Row shape of sync_log. */
export interface SyncLog {
  id: string;
  source: string;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'success' | 'failed';
  records_synced: number;
  records_new: number;
  records_updated: number;
  error_message: string | null;
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  cleaning: 'Pulizie',
  laundry: 'Lavanderia',
  tax: 'Tasse',
  checkin: 'Check-in',
  checkout: 'Check-out',
  maintenance: 'Manutenzione',
  other: 'Altro',
};
