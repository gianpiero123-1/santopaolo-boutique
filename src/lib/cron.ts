import { env } from './env';

/**
 * Optional protection for cron endpoints. Accepts either the Vercel cron header
 * (`Authorization: Bearer <CRON_SECRET>`) or a `?secret=<CRON_SECRET>` query param
 * (external cron such as cron-job.org). If CRON_SECRET is unset, endpoints are
 * open (Vercel cron calls them server-side). Returns a 401 Response if the
 * request is rejected, otherwise null.
 */
export function cronGuard(request: Request): Response | null {
  const secret = env('CRON_SECRET');
  if (!secret) return null;
  // Accept either the Vercel cron header (Authorization: Bearer <CRON_SECRET>)
  // or a ?secret=<CRON_SECRET> query param (external cron, e.g. cron-job.org).
  const auth = request.headers.get('authorization');
  const querySecret = new URL(request.url).searchParams.get('secret');
  if (auth === `Bearer ${secret}` || querySecret === secret) return null;
  return new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function cronJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
