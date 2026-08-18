// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

// Routes that carry `noindex` and must therefore stay out of the sitemap:
// /404, the whole authenticated admin area (AdminLayout sets noindex,nofollow)
// and the Operations stub pages (OperationsStub sets noindex,follow until the
// real content lands; /operations and /operations/production stay indexable).
const NOINDEX_ROUTES = [
  /^\/404\/?$/,
  /^\/admin(\/|$)/,
  /^\/(en\/)?operations\/(private-stays|local-desk|partners)\/?$/,
];

export default defineConfig({
  // Must match the host the site is actually served on (www), otherwise every
  // absolute URL we generate (canonical, og:url, hreflang, sitemap) points at a
  // redirecting origin.
  site: 'https://www.santopaoloapartments.com',
  // Public site stays static; /admin/* and /api/* opt into SSR via `export const prerender = false`.
  output: 'static',
  adapter: vercel(),
  // The old booking pages now 301 to the request form (Vercel handles these at
  // the platform level, no meta refresh).
  redirects: {
    '/book': { status: 301, destination: '/richiesta' },
    '/en/book': { status: 301, destination: '/en/request' },
  },
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      // Pairs each IT page with its /en/ counterpart as xhtml:link alternate.
      // Keys must match the locale segments used by the routing above; `it` has
      // no prefix, so unprefixed URLs are treated as Italian. Values are
      // language-only tags, matching <html lang> and the JSON-LD inLanguage.
      i18n: {
        defaultLocale: 'it',
        locales: {
          it: 'it',
          en: 'en',
        },
      },
      filter: page => {
        const { pathname } = new URL(page);
        return !NOINDEX_ROUTES.some(route => route.test(pathname));
      },
    }),
  ],
});
