import { env } from './env';

/**
 * Optional protection for cron endpoints. Vercel can be configured to send
 * `Authorization: Bearer <CRON_SECRET>`. If CRON_SECRET is unset, endpoints are
 * open (Vercel cron calls them server-side). Returns a 401 Response if the
 * request is rejected, otherwise null.
 */
export function cronGuard(request: Request): Response | null {
  const secret = env('CRON_SECRET');
  if (!secret) return null;
  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return null;
  return new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function cronJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
