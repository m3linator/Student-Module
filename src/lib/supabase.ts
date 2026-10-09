/**
 * @file supabase.ts
 * @brief Single shared Supabase client, configured from Vite environment variables.
 *
 * Only the public anon/publishable key is used here. The service_role key must never reach the
 * frontend – all access control happens through Row Level Security.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** @brief True when both Supabase environment variables are present. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * @brief Typed Supabase client.
 * @details Falls back to a harmless placeholder when the env variables are missing, so the app
 * still builds and can show a setup hint instead of crashing.
 */
export const supabase = createClient<Database>(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
);
