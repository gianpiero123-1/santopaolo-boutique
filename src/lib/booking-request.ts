// Shared constants for the booking request flow (public form + API endpoint).

/** Public unit number (1-5) -> Kalisi apartment_id. */
export const APP_TO_KALISI: Record<number, number> = {
  1: 16799,
  2: 16784,
  3: 16788,
  4: 15813,
  5: 16786,
};

/** Public unit number (1-5) -> maximum guests (adults + children). */
export const APP_CAPACITY: Record<number, number> = {
  1: 6,
  2: 2,
  3: 4,
  4: 4,
  5: 2,
};

/** Public unit number (1-5) -> display label. */
export const APP_LABELS: Record<number, string> = {
  1: 'Santopaolo 1',
  2: 'Santopaolo 2',
  3: 'Santopaolo 3',
  4: 'Santopaolo 4',
  5: 'Santopaolo 5',
};

export const APP_NUMBERS = [1, 2, 3, 4, 5] as const;

/** Maximum unit blocks per request. */
export const MAX_UNITS = 5;

/** Unit block as submitted by the form. */
export interface RequestUnitInput {
  app_number: number;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  adults: number;
  children: number;
}

/** Payload of POST /api/booking-request. */
export interface BookingRequestInput {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  guest_country?: string;
  notes?: string;
  lang: 'it' | 'en';
  units: RequestUnitInput[];
}

/** Allowed values of booking_requests.status. */
export const REQUEST_STATUSES = [
  'pending',
  'quoted',
  'confirmed_awaiting_payment',
  'paid',
  'expired',
  'rejected',
  'cancelled',
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** Allowed values of booking_requests.quote_channel. */
export const QUOTE_CHANNELS = ['email', 'whatsapp', 'both'] as const;

export type QuoteChannel = (typeof QUOTE_CHANNELS)[number];

/** Naples tourist tax, euro per paying guest per night. */
export const TOURIST_TAX_PER_NIGHT = 6;
