import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from './env';

/**
 * Server-side Supabase client using the service_role key (full access, bypasses
 * RLS). Never expose this to the browser — it is only imported in SSR pages and
 * API routes.
 */
export function createServerSupabase(): SupabaseClient {
  const url = requireEnv('SUPABASE_URL');
  const serviceKey = requireEnv('SUPABASE_SERVICE_KEY');

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
