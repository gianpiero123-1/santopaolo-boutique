export const prerender = false;

import type { APIRoute } from 'astro';
import { createSessionCookie } from '../../../lib/auth';
import { env } from '../../../lib/env';

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const password = String(form.get('password') ?? '');
  const remember = form.get('remember_me') != null;

  const expected = env('ADMIN_PASSWORD');

  if (!expected || password !== expected) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/login?error=1' },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin',
      'Set-Cookie': createSessionCookie(remember),
    },
  });
};

// A GET to the login endpoint just bounces to the login page.
export const GET: APIRoute = () =>
  new Response(null, { status: 302, headers: { Location: '/admin/login' } });
