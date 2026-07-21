// Tassa di soggiorno — logica condivisa fra la pagina /admin/tax e il report
// automatico /api/tax/report, così i due non possono divergere.
//
// ==== COSTANTI MODIFICABILI ====

/** Euro dovuti per ogni ospite pagante, per ogni notte. */
export const TAX_PER_NIGHT = 6;

/** Paga chi ha almeno questa età (anni compiuti) alla data di check-in. */
export const PAYING_AGE_MIN = 13;

/** Nominativi prenotazione esclusi dal calcolo (match case-insensitive). */
export const EXCLUDED_GUESTS = ['Boundless Travel srl'];

// ================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { dateOnly, toISODate } from './dates';

const IT_MONTHS = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
];

export interface TaxRow {
  booking_id: string;
  guest_name: string;
  apartment_label: string;
  checkin_date: string;
  checkout_date: string;
  /** Notti della prenotazione che cadono nel mese selezionato. */
  nights_in_month: number;
  /** Ospiti registrati con età >= PAYING_AGE_MIN al check-in. */
  paying: number;
  /** Ospiti registrati sotto la soglia di età. */
  exempt: number;
  /** false se la prenotazione non ha righe in booking_guests. */
  registered: boolean;
  /** null quando gli ospiti non sono ancora registrati (≠ zero). */
  tax: number | null;
}

export interface TaxReport {
  /** YYYY-MM */
  month: string;
  /** e.g. "giugno 2026" */
  month_label: string;
  rows: TaxRow[];
  total_tax: number;
  /** Somma di paganti × notti nel mese. */
  total_paying_nights: number;
  /** Prenotazioni senza righe in booking_guests. */
  unregistered: TaxRow[];
}

/** Primo e ultimo giorno (ISO) del mese YYYY-MM. */
export function monthBounds(month: string): { start: string; end: string } {
  const [y, m] = month.split('-').map(Number);
  return {
    start: toISODate(new Date(Date.UTC(y, m - 1, 1))),
    end: toISODate(new Date(Date.UTC(y, m, 0))),
  };
}

/** e.g. "2026-06" -> "giugno 2026". */
export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${IT_MONTHS[m - 1]} ${y}`;
}

/** YYYY-MM del mese corrente (Rome). */
export function currentMonth(todayISO: string): string {
  return todayISO.slice(0, 7);
}

/** YYYY-MM del mese precedente rispetto a `month`. */
export function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return toISODate(d).slice(0, 7);
}

/** Numero di notti della prenotazione che cadono nel mese YYYY-MM. */
export function nightsInMonth(checkin: string, checkout: string, month: string): number {
  // Le notti sono i giorni [checkin, checkout), quindi il checkout non conta.
  const start = dateOnly(checkin);
  const end = dateOnly(checkout);
  let count = 0;
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    if (toISODate(d).slice(0, 7) === month) count += 1;
  }
  return count;
}

/** Anni compiuti alla data di riferimento. */
export function ageAt(birthdate: string, refDate: string): number {
  const b = dateOnly(birthdate);
  const r = dateOnly(refDate);
  let age = r.getUTCFullYear() - b.getUTCFullYear();
  const beforeBirthday =
    r.getUTCMonth() < b.getUTCMonth() ||
    (r.getUTCMonth() === b.getUTCMonth() && r.getUTCDate() < b.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/**
 * Match tollerante: Kalisi a volte accoda un suffisso al nominativo
 * ("Boundless Travel srl - Booking.com"), quindi basta che il nome escluso
 * compaia nel nominativo della prenotazione.
 */
function isExcluded(guestName: string): boolean {
  const n = guestName.trim().toLowerCase();
  return EXCLUDED_GUESTS.some((e) => {
    const needle = e.trim().toLowerCase();
    return needle.length > 0 && n.includes(needle);
  });
}

/**
 * Calcola la tassa di soggiorno per il mese `month` (YYYY-MM).
 * Considera ogni prenotazione non cancellata con almeno una notte nel mese,
 * escludendo i nominativi in EXCLUDED_GUESTS.
 */
export async function computeTaxReport(
  supabase: SupabaseClient,
  month: string,
): Promise<TaxReport> {
  const { start, end } = monthBounds(month);

  // Prenotazioni che si sovrappongono al mese: check-in entro fine mese e
  // check-out dopo l'inizio (il giorno di check-out non è una notte).
  const { data: rawBookings } = await supabase
    .from('bookings_cache')
    .select('id, guest_name, apartment_label, checkin_date, checkout_date, status')
    .lte('checkin_date', end)
    .gt('checkout_date', start)
    .order('checkin_date', { ascending: true });

  const bookings = (rawBookings ?? []).filter(
    (b: any) => b.status !== 'cancelled' && !isExcluded(b.guest_name ?? ''),
  );

  // Ospiti registrati per queste prenotazioni.
  const ids = bookings.map((b: any) => b.id);
  const guestsByBooking = new Map<string, { birthdate: string | null }[]>();
  if (ids.length) {
    const { data: guestRows } = await supabase
      .from('booking_guests')
      .select('booking_id, birthdate')
      .in('booking_id', ids);
    for (const g of (guestRows ?? []) as any[]) {
      const list = guestsByBooking.get(g.booking_id) ?? [];
      list.push({ birthdate: g.birthdate });
      guestsByBooking.set(g.booking_id, list);
    }
  }

  const rows: TaxRow[] = [];
  for (const b of bookings as any[]) {
    const nights = nightsInMonth(b.checkin_date, b.checkout_date, month);
    if (nights === 0) continue;

    const guests = guestsByBooking.get(b.id) ?? [];
    const registered = guests.length > 0;

    let paying = 0;
    let exempt = 0;
    for (const g of guests) {
      // Senza data di nascita non si può stabilire l'esenzione: conta come pagante.
      if (!g.birthdate || ageAt(g.birthdate, b.checkin_date) >= PAYING_AGE_MIN) paying += 1;
      else exempt += 1;
    }

    rows.push({
      booking_id: b.id,
      guest_name: b.guest_name ?? 'Ospite',
      apartment_label: b.apartment_label ?? '—',
      checkin_date: b.checkin_date,
      checkout_date: b.checkout_date,
      nights_in_month: nights,
      paying,
      exempt,
      registered,
      tax: registered ? paying * nights * TAX_PER_NIGHT : null,
    });
  }

  const total_tax = rows.reduce((s, r) => s + (r.tax ?? 0), 0);
  const total_paying_nights = rows.reduce(
    (s, r) => s + (r.registered ? r.paying * r.nights_in_month : 0),
    0,
  );

  return {
    month,
    month_label: monthLabel(month),
    rows,
    total_tax,
    total_paying_nights,
    unregistered: rows.filter((r) => !r.registered),
  };
}
