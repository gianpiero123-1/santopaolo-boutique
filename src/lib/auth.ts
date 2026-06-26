import crypto from 'node:crypto';
import { serialize, parse } from 'cookie';
import { env, requireEnv } from './env';

export const SESSION_COOKIE_NAME = 'cockpit_session';

/** 30 days, in seconds. */
const REMEMBER_MAX_AGE = 30 * 24 * 60 * 60;

export interface SessionData {
  authenticated: boolean;
  issued_at: number; // unix ms
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function hmac(payload: string, secret: string): string {
  return base64url(crypto.createHmac('sha256', secret).update(payload).digest());
}

/** Sign a session payload, returning a `payload.signature` token. */
export function signSession(data: SessionData, secret: string): string {
  const payload = base64url(JSON.stringify(data));
  const signature = hmac(payload, secret);
  return `${payload}.${signature}`;
}

/**
 * Verify a signed token. Returns the decoded session on success, or null if the
 * token is malformed or the signature does not match.
 */
export function verifySession(token: string | undefined, secret: string): SessionData | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;

  const expected = hmac(payload, secret);
  const sigBuf = fromBase64url(signature);
  const expBuf = fromBase64url(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const data = JSON.parse(fromBase64url(payload).toString('utf8')) as SessionData;
    if (!data || data.authenticated !== true) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Build a Set-Cookie string for an authenticated session. With `remember` the
 * cookie persists 30 days; otherwise it is a session cookie.
 */
export function createSessionCookie(remember: boolean): string {
  const secret = requireEnv('ADMIN_SESSION_SECRET');
  const token = signSession({ authenticated: true, issued_at: Date.now() }, secret);

  return serialize(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    ...(remember ? { maxAge: REMEMBER_MAX_AGE } : {}),
  });
}

/**
 * True if the request carries a valid signed session cookie. Used by the
 * data API routes (tasks, notes), which are not covered by the page middleware.
 */
export function isAuthenticated(request: Request): boolean {
  const header = request.headers.get('cookie');
  if (!header) return false;
  const token = parse(header)[SESSION_COOKIE_NAME];
  return verifySession(token, env('ADMIN_SESSION_SECRET')) !== null;
}

/** Build a Set-Cookie string that clears the session. */
export function clearSessionCookie(): string {
  return serialize(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
