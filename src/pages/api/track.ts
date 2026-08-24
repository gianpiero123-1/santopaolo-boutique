export const prerender = false;

import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { createServerSupabase } from '../../lib/supabase-client';
import { env } from '../../lib/env';

type Lang = 'it' | 'en';
type SourceType = 'direct' | 'organic' | 'social' | 'referral' | 'paid' | 'internal';
type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';

interface PageViewInsert {
  visitor_hash: string;
  session_id: string | null;
  is_new_visitor: boolean;
  path: string;
  page_title: string | null;
  lang: Lang;
  is_entry: boolean;
  referrer: string | null;
  referrer_domain: string | null;
  source_type: SourceType;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  browser_lang: string | null;
  device_type: DeviceType;
  os: string | null;
  browser: string | null;
  screen_w: number | null;
  screen_h: number | null;
  viewport_w: number | null;
  viewport_h: number | null;
}

/* ------------------------------------------------------------- user agent */

const BOT_RE = /bot|crawler|spider|headless|lighthouse|preview|gptbot/i;

interface UAInfo {
  device_type: DeviceType;
  os: string | null;
  browser: string | null;
}

function parseUserAgent(ua: string): UAInfo {
  if (!ua) return { device_type: 'unknown', os: null, browser: null };

  let os: string | null = null;
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser: string | null = null;
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/Firefox\/|FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/Chrome\/|CriOS/i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua)) browser = 'Safari';

  if (BOT_RE.test(ua)) return { device_type: 'bot', os, browser };

  let device_type: DeviceType = 'desktop';
  if (/iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) device_type = 'tablet';
  else if (/iPhone/i.test(ua) || (/Android/i.test(ua) && /Mobile/i.test(ua))) device_type = 'mobile';

  return { device_type, os, browser };
}

/* ------------------------------------------------------------- source type */

const SEARCH_TOKENS = [
  'google', 'bing', 'duckduckgo', 'yahoo', 'ecosia', 'brave',
  'yandex', 'baidu', 'perplexity', 'chatgpt', 'openai',
];

const SOCIAL_TOKENS = [
  'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin',
  'pinterest', 'twitter', 'threads', 'reddit', 'whatsapp',
];

function stripWww(host: string): string {
  return host.replace(/^www\./, '');
}

function referrerHostname(referrer: string): string | null {
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function classifySource(
  refHost: string | null,
  requestHost: string,
  utmMedium: string | null,
): SourceType {
  if (utmMedium && /cpc|ppc|paid/i.test(utmMedium)) return 'paid';
  if (!refHost) return 'direct';
  if (stripWww(refHost) === stripWww(requestHost.toLowerCase())) return 'internal';
  const bare = stripWww(refHost);
  if (bare === 'x.com' || bare.endsWith('.x.com')) return 'social';
  if (SEARCH_TOKENS.some(t => refHost.includes(t))) return 'organic';
  if (SOCIAL_TOKENS.some(t => refHost.includes(t))) return 'social';
  return 'referral';
}

/* ---------------------------------------------------------------- helpers */

function str(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed || null;
}

function intOrNull(value: unknown, max: number): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(Math.round(n), max);
}

function computeVisitorHash(ip: string, ua: string, salt: string): string {
  // The current UTC date makes the hash rotate daily, so it is never a
  // persistent identifier and no cookie banner is required.
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return createHash('sha256').update(ip + ua + salt + day).digest('hex');
}

function decodeGeo(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/* --------------------------------------------------------------- endpoint */

export const POST: APIRoute = async ctx => {
  try {
    let body: unknown;
    try {
      body = await ctx.request.json();
    } catch {
      return new Response(null, { status: 204 });
    }
    if (typeof body !== 'object' || body === null) {
      return new Response(null, { status: 204 });
    }
    const b = body as Record<string, unknown>;

    const supabase = createServerSupabase();

    // Second beacon: the client sends back the row id plus the time on page,
    // so this is an update of the existing row, not a new view.
    if (b.duration_ms !== undefined && b.id !== undefined) {
      const id = typeof b.id === 'string' || typeof b.id === 'number' ? b.id : null;
      const duration = intOrNull(b.duration_ms, 21_600_000);
      if (id !== null && duration !== null) {
        const { error } = await supabase
          .from('page_views')
          .update({ duration_ms: duration })
          .eq('id', id);
        if (error) console.error('[track] update duration failed', error.message);
      }
      return new Response(null, { status: 204 });
    }

    const headers = ctx.request.headers;
    const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
    const ua = headers.get('user-agent') ?? '';
    const uaInfo = parseUserAgent(ua);

    const referrer = str(b.referrer, 2000);
    const refHost = referrer ? referrerHostname(referrer) : null;
    const requestHost = ctx.url.hostname;
    const utmMedium = str(b.utm_medium, 200);

    const row: PageViewInsert = {
      visitor_hash: computeVisitorHash(ip, ua, env('TRACK_SALT')),
      session_id: str(b.session_id, 100),
      is_new_visitor: b.is_new_visitor === true,
      path: str(b.path, 500) ?? '/',
      page_title: str(b.page_title, 500),
      lang: b.lang === 'en' ? 'en' : 'it',
      is_entry: b.is_entry === true,
      referrer,
      referrer_domain: refHost,
      source_type: classifySource(refHost, requestHost, utmMedium),
      utm_source: str(b.utm_source, 200),
      utm_medium: utmMedium,
      utm_campaign: str(b.utm_campaign, 200),
      utm_content: str(b.utm_content, 200),
      utm_term: str(b.utm_term, 200),
      country: headers.get('x-vercel-ip-country'),
      region: headers.get('x-vercel-ip-country-region'),
      city: decodeGeo(headers.get('x-vercel-ip-city')),
      browser_lang: str(b.browser_lang, 35),
      device_type: uaInfo.device_type,
      os: uaInfo.os,
      browser: uaInfo.browser,
      screen_w: intOrNull(b.screen_w, 20_000),
      screen_h: intOrNull(b.screen_h, 20_000),
      viewport_w: intOrNull(b.viewport_w, 20_000),
      viewport_h: intOrNull(b.viewport_h, 20_000),
    };

    const { data, error } = await supabase
      .from('page_views')
      .insert(row)
      .select('id')
      .single();

    if (error || !data) {
      console.error('[track] insert failed', error?.message);
      return new Response(null, { status: 204 });
    }

    // The id goes back to the client so the duration beacon can target the row.
    return new Response(JSON.stringify({ id: data.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[track] unexpected error', err instanceof Error ? err.message : err);
    return new Response(null, { status: 204 });
  }
};
