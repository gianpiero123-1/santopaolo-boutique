// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  // Must match the host the site is actually served on (www), otherwise every
  // absolute URL we generate (canonical, og:url, hreflang, sitemap) points at a
  // redirecting origin.
  site: 'https://www.santopaoloapartments.com',
  // Public site stays static; /admin/* and /api/* opt into SSR via `export const prerender = false`.
  output: 'static',
  adapter: vercel(),
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
  integrations: [sitemap()],
});
