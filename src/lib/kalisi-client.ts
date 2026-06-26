import { parse as parseHtml } from 'node-html-parser';
import { apartmentLabel, type BookingStatus } from './constants';
import { parseDDMMYYYY, toDDMMYYYY, toISODate } from './dates';
import { requireEnv, env } from './env';

export interface KalisiConfig {
  baseUrl: string;
  email: string;
  password: string;
  orgCode: string;
  loginPath: string;
}

/** Raw DataTables row from /admin/orders.json (shape is provider-defined). */
type RawOrder = Record<string, unknown>;

/** Normalized order matching the bookings_cache upsert shape. */
export interface NormalizedOrder {
  kalisi_id: number;
  apartment_id: number;
  apartment_label: string;
  guest_name: string;
  guest_count: number;
  guest_phone: string | null;
  guest_email: string | null;
  checkin_date: string; // YYYY-MM-DD
  checkout_date: string; // YYYY-MM-DD
  ota: string | null;
  ota_booking_code: string | null;
  total_amount: number | null;
  commission: number | null;
  status: BookingStatus;
  raw_payload: RawOrder;
}

const SESSION_MAX_AGE_MS = 18 * 60 * 60 * 1000; // 18h

export class KalisiClient {
  private cfg: KalisiConfig;
  sessionCookie: string | null = null;
  private loggedInAt = 0;

  constructor(cfg: KalisiConfig) {
    this.cfg = cfg;
  }

  private url(path: string): string {
    return `${this.cfg.baseUrl.replace(/\/$/, '')}${path}`;
  }

  /** True if there is no cookie or the session is older than 18h. */
  private needsLogin(): boolean {
    return !this.sessionCookie || Date.now() - this.loggedInAt > SESSION_MAX_AGE_MS;
  }

  /** Collect `name=value` pairs from a Set-Cookie header list. */
  private static collectCookies(setCookies: string[]): string {
    const jar = new Map<string, string>();
    for (const sc of setCookies) {
      const first = sc.split(';')[0];
      const eq = first.indexOf('=');
      if (eq > 0) {
        jar.set(first.slice(0, eq).trim(), first.slice(eq + 1).trim());
      }
    }
    return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  /**
   * Authenticate against the Kalisi/Italianway admin. Scrapes the CSRF token
   * from the sign-in form, posts credentials, and stores the session cookie.
   * Throws if login does not result in a redirect with a session cookie.
   */
  async login(): Promise<void> {
    const loginUrl = this.url(this.cfg.loginPath);

    // 1) GET the sign-in page, capture CSRF token + any initial cookies.
    const getRes = await fetch(loginUrl, { headers: { Accept: 'text/html' } });
    const html = await getRes.text();
    const root = parseHtml(html);

    const token =
      root.querySelector('input[name="authenticity_token"]')?.getAttribute('value') ??
      root.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (!token) {
      throw new Error('Kalisi login: authenticity_token not found on sign-in page');
    }

    const initialCookies = KalisiClient.collectCookies(getRes.headers.getSetCookie?.() ?? []);

    // 2) POST credentials as form-urlencoded.
    const form = new URLSearchParams({
      'staff[organization_code]': this.cfg.orgCode,
      'staff[email]': this.cfg.email,
      'staff[password]': this.cfg.password,
      'staff[remember_me]': '1',
      authenticity_token: token,
      commit: 'Log in',
    });

    const postRes = await fetch(loginUrl, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(initialCookies ? { Cookie: initialCookies } : {}),
      },
      body: form.toString(),
    });

    const sessionCookies = KalisiClient.collectCookies(postRes.headers.getSetCookie?.() ?? []);

    // Devise redirects (302/303) on success. Treat a redirect + cookie as OK.
    const isRedirect = postRes.status === 301 || postRes.status === 302 || postRes.status === 303;
    if (!isRedirect) {
      throw new Error(`Kalisi login failed: expected redirect, got HTTP ${postRes.status}`);
    }
    if (!sessionCookies) {
      throw new Error('Kalisi login failed: no session cookie returned');
    }

    this.sessionCookie = sessionCookies;
    this.loggedInAt = Date.now();
  }

  /** Ensure a fresh session, logging in if needed. */
  private async ensureSession(): Promise<void> {
    if (this.needsLogin()) {
      await this.login();
    }
  }

  /**
   * Fetch orders whose check-out falls within [fromDate, toDate]. Returns
   * normalized orders ready to upsert.
   */
  async fetchOrders(fromDate: Date, toDate: Date): Promise<NormalizedOrder[]> {
    await this.ensureSession();

    const range = `${toDDMMYYYY(fromDate)} - ${toDDMMYYYY(toDate)}`;
    const ordersUrl = `${this.url('/admin/orders.json')}?custom_search[check_out]=${encodeURIComponent(range)}`;

    const res = await fetch(ordersUrl, {
      headers: {
        Accept: 'application/json',
        Cookie: this.sessionCookie ?? '',
      },
    });

    if (res.status === 401 || res.status === 403) {
      // Session expired mid-flight — re-login once and retry.
      await this.login();
      return this.fetchOrders(fromDate, toDate);
    }
    if (!res.ok) {
      throw new Error(`Kalisi fetchOrders failed: HTTP ${res.status}`);
    }

    const payload = (await res.json()) as { data?: unknown };
    const rows = Array.isArray(payload?.data) ? (payload.data as RawOrder[]) : [];

    return rows
      .map((raw) => this.normalizeOrder(raw))
      .filter((o): o is NormalizedOrder => o !== null);
  }

  /**
   * Map a raw DataTables row to the bookings_cache schema. Field names are
   * looked up defensively across likely candidates because the provider payload
   * is not strongly typed. Returns null if the row lacks an id or valid dates.
   */
  normalizeOrder(raw: RawOrder): NormalizedOrder | null {
    const kalisiId = toInt(pick(raw, ['id', 'order_id', 'reference_id']));
    if (kalisiId == null) return null;

    const apartmentId =
      toInt(pick(raw, ['apartment_id', 'property_id', 'listing_id', 'accommodation_id'])) ?? 0;

    const checkin = parseDDMMYYYY(toStr(pick(raw, ['check_in', 'checkin', 'check_in_date', 'arrival'])));
    const checkout = parseDDMMYYYY(toStr(pick(raw, ['check_out', 'checkout', 'check_out_date', 'departure'])));
    if (!checkin || !checkout) return null;

    return {
      kalisi_id: kalisiId,
      apartment_id: apartmentId,
      apartment_label: apartmentLabel(apartmentId),
      guest_name: toStr(pick(raw, ['client_full_name', 'guest_name', 'customer_name', 'client_name'])) || 'Ospite',
      guest_count: toInt(pick(raw, ['guest_count', 'guests', 'pax', 'number_of_guests'])) ?? 1,
      guest_phone: toStr(pick(raw, ['customer_phone', 'guest_phone', 'phone'])) || null,
      guest_email: toStr(pick(raw, ['customer_email', 'guest_email', 'email'])) || null,
      checkin_date: toISODate(checkin),
      checkout_date: toISODate(checkout),
      ota: normalizeChannel(toStr(pick(raw, ['ota', 'channel', 'source', 'portal']))),
      ota_booking_code: toStr(pick(raw, ['ota_booking_code', 'channel_reference', 'booking_code', 'reservation_code'])) || null,
      total_amount: parseAmount(pick(raw, ['total_amount', 'total', 'amount', 'price', 'total_price'])),
      commission: parseAmount(pick(raw, ['commission', 'channel_commission', 'fee'])),
      status: normalizeStatus(toStr(pick(raw, ['status', 'state', 'order_status']))),
      raw_payload: raw,
    };
  }
}

/** Build a KalisiClient from environment variables. */
export function createKalisiClient(): KalisiClient {
  return new KalisiClient({
    baseUrl: requireEnv('KALISI_BASE_URL'),
    email: requireEnv('KALISI_EMAIL'),
    password: requireEnv('KALISI_PASSWORD'),
    orgCode: requireEnv('KALISI_ORG_CODE'),
    loginPath: env('KALISI_LOGIN_PATH') || '/admin/sign_in',
  });
}

// ---- field helpers ----

function pick(raw: RawOrder, keys: string[]): unknown {
  for (const k of keys) {
    if (raw[k] != null && raw[k] !== '') return raw[k];
  }
  return undefined;
}

function toStr(v: unknown): string {
  if (v == null) return '';
  return String(v).trim();
}

function toInt(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = parseInt(String(v).replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

/** Parse a money value that may be "1.180,00€", "1,180.00", "1180" etc. */
function parseAmount(v: unknown): number | null {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;

  let s = String(v).replace(/[^\d.,-]/g, '').trim();
  if (!s) return null;

  const hasDot = s.includes('.');
  const hasComma = s.includes(',');

  if (hasDot && hasComma) {
    // Whichever separator is last is the decimal separator.
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.'); // Italian: 1.180,00
    } else {
      s = s.replace(/,/g, ''); // US: 1,180.00
    }
  } else if (hasComma) {
    s = s.replace(',', '.'); // 1180,50
  }
  // Only-dot is left as-is (treated as decimal point).

  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function normalizeChannel(raw: string): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes('booking')) return 'Booking';
  if (s.includes('airbnb')) return 'Airbnb';
  if (s.includes('vrbo') || s.includes('homeaway') || s.includes('expedia')) return 'Vrbo';
  if (s.includes('direct') || s.includes('dirett') || s.includes('website') || s.includes('sito')) return 'Diretto';
  return raw;
}

function normalizeStatus(raw: string): BookingStatus {
  const s = raw.toLowerCase();
  if (s.includes('cancel') || s.includes('annull')) return 'cancelled';
  if (s.includes('no_show') || s.includes('no-show') || s.includes('noshow')) return 'no_show';
  return 'confirmed';
}
