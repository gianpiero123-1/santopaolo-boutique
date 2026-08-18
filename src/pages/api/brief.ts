export const prerender = false;

import type { APIRoute } from 'astro';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Operations brief form. Placeholder for now: logs the payload and returns
 * 200, persistence and notifications come later.
 */
export const POST: APIRoute = async ({ request }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  console.log('[brief]', JSON.stringify(payload));
  return json({ ok: true });
};
