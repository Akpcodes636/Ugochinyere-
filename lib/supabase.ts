import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
export const STORAGE_BUCKET = 'media';

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('YOUR-PROJECT'));

/** Server-side, read-only client for public pages (no session). Row Level Security controls access. */
export function serverClient(accessToken?: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}

let browser: SupabaseClient | null = null;
/** Browser client for the admin panel (keeps the login session). Created lazily. */
export function browserClient(): SupabaseClient | null {
  if (!isConfigured) return null;
  if (!browser) browser = createClient(SUPABASE_URL, SUPABASE_KEY);
  return browser;
}
