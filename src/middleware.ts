import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE_NAME, verifySession } from './lib/auth';
import { env } from './lib/env';

/**
 * Guards the admin dashboard. Every /admin/* request (except the login page) is
 * checked for a valid signed session cookie; invalid sessions are redirected to
 * the login page. Public pages and API routes pass through untouched (API routes
 * enforce their own auth).
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const isLogin = pathname === '/admin/login';

  if (!isAdmin || isLogin) {
    return next();
  }

  const token = context.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySession(token, env('ADMIN_SESSION_SECRET'));

  if (!session) {
    return context.redirect('/admin/login', 302);
  }

  return next();
});
