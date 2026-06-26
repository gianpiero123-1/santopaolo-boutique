// Date helpers. The business runs in Europe/Rome; serverless runs in UTC, so
// "today" is always computed against the Rome timezone.

export const TZ = 'Europe/Rome';

const IT_WEEKDAYS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const IT_WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const IT_MONTHS = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
];
const IT_MONTHS_SHORT = [
  'gen', 'feb', 'mar', 'apr', 'mag', 'giu',
  'lug', 'ago', 'set', 'ott', 'nov', 'dic',
];

/** Y/M/D parts of `date` as seen in the Rome timezone. */
function romeParts(date: Date): { y: number; m: number; d: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [y, m, d] = fmt.format(date).split('-').map(Number);
  return { y, m, d };
}

/** A date-only Date (UTC midnight) representing today in Rome. */
export function today(): Date {
  const { y, m, d } = romeParts(new Date());
  return new Date(Date.UTC(y, m - 1, d));
}

/** Build a date-only Date (UTC midnight) from a YYYY-MM-DD string. */
export function dateOnly(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Add `n` days to a date-only Date. */
export function addDays(date: Date, n: number): Date {
  const r = new Date(date);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

/** Whole-day difference b - a. */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** YYYY-MM-DD of a date-only Date. */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** DD/MM/YYYY of a date-only Date (Kalisi query format). */
export function toDDMMYYYY(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
}

/** Parse DD/MM/YYYY (or DD-MM-YYYY) into a date-only Date, or null. */
export function parseDDMMYYYY(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = value.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (!m) return null;
  let [, dd, mm, yyyy] = m;
  let year = Number(yyyy);
  if (year < 100) year += 2000;
  return new Date(Date.UTC(year, Number(mm) - 1, Number(dd)));
}

export function weekdayShort(date: Date): string {
  return IT_WEEKDAYS_SHORT[date.getUTCDay()];
}

export function weekdayLong(date: Date): string {
  return IT_WEEKDAYS[date.getUTCDay()];
}

export function isWeekend(date: Date): boolean {
  const d = date.getUTCDay();
  return d === 0 || d === 6;
}

export function monthShort(monthIndex: number): string {
  return IT_MONTHS_SHORT[monthIndex];
}

/** e.g. "26 giugno" */
export function formatDayMonth(date: Date): string {
  return `${date.getUTCDate()} ${IT_MONTHS[date.getUTCMonth()]}`;
}

/** e.g. "venerdì 26 giugno" */
export function formatWeekdayDayMonth(date: Date): string {
  return `${weekdayLong(date).toLowerCase()} ${formatDayMonth(date)}`;
}

/** e.g. "26 giu" — first of month adds the month, e.g. "1 lug". */
export function formatShortDay(date: Date, withMonthIfFirst = true): string {
  const d = date.getUTCDate();
  if (withMonthIfFirst && d === 1) {
    return `${d} ${IT_MONTHS_SHORT[date.getUTCMonth()]}`;
  }
  return String(d);
}

/** e.g. "26 giu — 25 lug 2026" */
export function formatRange(start: Date, end: Date): string {
  const s = `${start.getUTCDate()} ${IT_MONTHS_SHORT[start.getUTCMonth()]}`;
  const e = `${end.getUTCDate()} ${IT_MONTHS_SHORT[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
  return `${s} — ${e}`;
}

/** Hour (0-23) of a timestamptz as seen in Rome. */
export function romeHourMinute(iso: string): { hour: number; minute: number } {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const [hh, mm] = fmt.format(new Date(iso)).split(':').map(Number);
  return { hour: hh, minute: mm };
}

/** HH:MM of a timestamptz as seen in Rome. */
export function formatTime(iso: string): string {
  const { hour, minute } = romeHourMinute(iso);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** YYYY-MM-DD of a timestamptz as seen in Rome. */
export function romeDateOf(iso: string): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(new Date(iso));
}

/** Format an amount like 2450 -> "2.450€" (Italian grouping, no decimals). */
export function formatEuro(amount: number | null | undefined): string {
  if (amount == null) return '—';
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('it-IT')}€`;
}
