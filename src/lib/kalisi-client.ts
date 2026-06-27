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
const LOGIN_RETRY_COOLDOWN_MS = 30 * 1000; // 30s — guard against rapid re-attempts

export class KalisiClient {
  private cfg: KalisiConfig;
  sessionCookie: string | null = null;
  private loggedInAt = 0;
  /** Timestamp of the last login *attempt* (success or failure). */
  private lastLoginAttemptAt = 0;

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
    // Anti-retry guard: skip if we attempted a login less than 30s ago.
    const sinceLast = Date.now() - this.lastLoginAttemptAt;
    if (this.lastLoginAttemptAt && sinceLast < LOGIN_RETRY_COOLDOWN_MS) {
      console.log(`[kalisi] Login skipped: recent attempt ${Math.round(sinceLast / 1000)}s ago (cooldown 30s)`);
      throw new Error('Kalisi login skipped: recent attempt (<30s)');
    }
    this.lastLoginAttemptAt = Date.now();

    const loginUrl = this.url(this.cfg.loginPath);

    // 1) GET the sign-in page, capture CSRF token + any initial cookies.
    console.log(`[kalisi] Login, step 1: GET sign_in page -> ${loginUrl}`);
    const getRes = await fetch(loginUrl, { headers: { Accept: 'text/html' } });
    console.log(`[kalisi] Step 1 GET status: ${getRes.status}`);
    const html = await getRes.text();

    const tokenFromInput = html.match(/<input[^>]+name=["']authenticity_token["'][^>]+value=["']([^"']+)["']/i);
    const tokenFromMeta = html.match(/<meta[^>]+name=["']csrf-token["'][^>]+content=["']([^"']+)["']/i);
    const token = tokenFromInput?.[1] ?? tokenFromMeta?.[1];

    if (!token) {
      console.log('[kalisi] authenticity_token NOT found on sign-in page');
      throw new Error('Kalisi login: authenticity_token not found on sign-in page');
    }
    console.log(`[kalisi] authenticity_token found: length=${token.length}, prefix=${token.slice(0, 8)}...`);

    const initialCookies = KalisiClient.collectCookies(getRes.headers.getSetCookie?.() ?? []);
    console.log(`[kalisi] Step 1 initial cookies: ${initialCookies ? maskCookie(initialCookies) : '(none)'}`);

    // 2) POST credentials as form-urlencoded.
    console.log('[kalisi] Login, step 2: POST sign_in');
    const form = new URLSearchParams({
      'staff[organization_code]': this.cfg.orgCode,
      'staff[email]': this.cfg.email,
      'staff[password]': this.cfg.password,
      'staff[remember_me]': '1',
      authenticity_token: token,
      commit: 'Log in',
    });
    console.log(
      `[kalisi] Step 2 form fields: staff[organization_code]=${this.cfg.orgCode}, ` +
        `staff[email]=${maskEmail(this.cfg.email)}, staff[password]=(hidden), ` +
        `staff[remember_me]=1, authenticity_token=${token.slice(0, 8)}..., commit=Log in`,
    );

    const postRes = await fetch(loginUrl, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(initialCookies ? { Cookie: initialCookies } : {}),
      },
      body: form.toString(),
    });
    console.log(`[kalisi] Step 2 POST status: ${postRes.status}`);

    const rawSetCookies = postRes.headers.getSetCookie?.() ?? [];
    console.log(
      `[kalisi] Step 2 set-cookie received: ${
        rawSetCookies.length ? rawSetCookies.map((c) => c.split(';')[0].split('=')[0]).join(', ') : '(none)'
      }`,
    );
    const sessionCookies = KalisiClient.collectCookies(rawSetCookies);

    // Devise redirects (302/303) on success. Treat a redirect + cookie as OK.
    const isRedirect = postRes.status === 301 || postRes.status === 302 || postRes.status === 303;
    if (!isRedirect) {
      // On a non-redirect, the body usually carries the failure reason.
      const body = await postRes.text().catch(() => '');
      if (/locked/i.test(body)) console.log('[kalisi] POST body indicates account "Locked"');
      if (/invalid/i.test(body)) console.log('[kalisi] POST body indicates "Invalid" credentials');
      throw new Error(`Kalisi login failed: expected redirect, got HTTP ${postRes.status}`);
    }
    if (!sessionCookies) {
      console.log('[kalisi] Login failed: redirect received but no session cookie');
      throw new Error('Kalisi login failed: no session cookie returned');
    }

    console.log('[kalisi] Login success: session cookie stored');
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
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: this.url('/admin/orders'),
        Cookie: this.sessionCookie ?? '',
      },
    });

    // ---- verbose debug logging ----
    console.log(`[kalisi] fetchOrders URL: ${ordersUrl}`);
    console.log(`[kalisi] fetchOrders status: ${res.status}`);
    console.log(`[kalisi] fetchOrders content-type: ${res.headers.get('content-type') ?? '(none)'}`);

    if (res.status === 401 || res.status === 403) {
      // Session rejected mid-flight. Do NOT auto re-login/retry within the same
      // request — surface the error so the caller decides on the next run.
      console.log(`[kalisi] fetchOrders got HTTP ${res.status} — not retrying (auto re-login disabled)`);
      throw new Error(`Kalisi fetchOrders unauthorized: HTTP ${res.status} (session rejected, no auto-retry)`);
    }
    if (!res.ok) {
      throw new Error(`Kalisi fetchOrders failed: HTTP ${res.status}`);
    }

    // Read the raw body first so we can log it before parsing.
    const bodyText = await res.text();
    console.log(`[kalisi] fetchOrders body (first 800 chars): ${bodyText.slice(0, 800)}`);

    let payload: { data?: unknown };
    try {
      payload = JSON.parse(bodyText) as { data?: unknown };
    } catch (err) {
      console.log(`[kalisi] fetchOrders JSON.parse failed: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('Kalisi fetchOrders: response was not valid JSON');
    }

    console.log(
      `[kalisi] fetchOrders payload top-level keys: ${
        payload && typeof payload === 'object' ? Object.keys(payload).join(', ') || '(none)' : '(not an object)'
      }`,
    );
    console.log(
      `[kalisi] fetchOrders data: ${
        Array.isArray(payload?.data) ? `array length=${payload.data.length}` : `not an array (${typeof payload?.data})`
      }`,
    );

    const rows = Array.isArray(payload?.data) ? (payload.data as RawOrder[]) : [];

    console.log('[kalisi] sample record keys:', rows.length > 0 ? Object.keys(rows[0]).join(', ') : '(empty)');
    console.log('[kalisi] sample record 0 (first 500 chars):', JSON.stringify(rows[0]).slice(0, 500));
    console.log('[kalisi] sample checkin_date raw:', rows[0]?.checkin_date, 'checkout_date raw:', rows[0]?.checkout_date);

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
    const kalisiId = toInt(pick(raw, ['id', 'order_id', 'reservation_id']));
    if (kalisiId == null) {
      console.log('[kalisi] skipped order, missing id or dates:', { id: raw.id, hasCheckin: !!raw.checkin_date, hasCheckout: !!raw.checkout_date });
      return null;
    }

    // apartment_id often arrives as an HTML link like /admin/apartments/16799.
    const apartmentId =
      extractApartmentId(raw['apartment']) ??
      toInt(pick(raw, ['apartment_id', 'property_id'])) ??
      0;

    // Dates may arrive as HTML and in DD/MM/YYYY or ISO form, so strip + flex-parse.
    const checkin = parseFlexibleDate(stripHtml(pick(raw, ['checkin_date', 'check_in', 'checkin', 'arrival'])));
    const checkout = parseFlexibleDate(stripHtml(pick(raw, ['checkout_date', 'check_out', 'checkout', 'departure'])));
    if (!checkin || !checkout) {
      console.log('[kalisi] skipped order, missing id or dates:', { id: raw.id, hasCheckin: !!raw.checkin_date, hasCheckout: !!raw.checkout_date });
      return null;
    }

    const cancelled = raw.cancelled === true;

    return {
      kalisi_id: kalisiId,
      apartment_id: apartmentId,
      apartment_label: apartmentLabel(apartmentId),
      guest_name: stripHtml(pick(raw, ['client_full_name', 'guest_name', 'customer_name'])) || 'Ospite',
      guest_count: toInt(stripHtml(pick(raw, ['guests_num', 'guest_count', 'guests', 'pax']))) ?? 1,
      guest_phone: stripHtml(pick(raw, ['customer_phone', 'guest_phone', 'phone'])) || null,
      guest_email: stripHtml(pick(raw, ['customer_email', 'guest_email', 'email'])) || null,
      checkin_date: toISODate(checkin),
      checkout_date: toISODate(checkout),
      ota: normalizeChannel(stripHtml(pick(raw, ['ota', 'source', 'channel', 'portal']))),
      ota_booking_code: stripHtml(pick(raw, ['ota_booking_code', 'code', 'channel_reference', 'booking_code'])) || null,
      total_amount: parseAmount(stripHtml(pick(raw, ['total_amount', 'total', 'amount', 'price']))),
      commission: parseAmount(stripHtml(pick(raw, ['commission', 'channel_commission', 'fee']))),
      status: cancelled ? 'cancelled' : normalizeStatus(stripHtml(pick(raw, ['status', 'state', 'order_status']))),
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

// ---- logging helpers ----

/** Mask an email for logs: "mario.rossi@x.com" -> "ma***@x.com". */
function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  const local = email.slice(0, at);
  const domain = email.slice(at);
  return `${local.slice(0, 2)}***${domain}`;
}

/** Mask cookie values for logs: keep names, redact values. */
function maskCookie(cookieHeader: string): string {
  return cookieHeader
    .split('; ')
    .map((pair) => {
      const eq = pair.indexOf('=');
      return eq > 0 ? `${pair.slice(0, eq)}=***` : pair;
    })
    .join('; ');
}

// ---- field helpers ----

function pick(raw: RawOrder, keys: string[]): unknown {
  for (const k of keys) {
    if (raw[k] != null && raw[k] !== '') return raw[k];
  }
  return undefined;
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

/** Strip HTML tags and collapse whitespace, returning the plain text. */
function stripHtml(s: unknown): string {
  if (s == null) return '';
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Extract an apartment id from an HTML link like /admin/apartments/16799. */
function extractApartmentId(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw);
  const m = s.match(/\/admin\/apartments\/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/** Parse a date that may be DD/MM/YYYY or ISO YYYY-MM-DD. */
function parseFlexibleDate(s: string): Date | null {
  if (!s) return null;
  const ddmmyy = s.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (ddmmyy) {
    const day = parseInt(ddmmyy[1], 10);
    const month = parseInt(ddmmyy[2], 10);
    const year = 2000 + parseInt(ddmmyy[3], 10);
    const d = new Date(Date.UTC(year, month - 1, day));
    if (!isNaN(d.getTime())) return d;
  }
  const ddmm = parseDDMMYYYY(s);
  if (ddmm) return ddmm;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}
