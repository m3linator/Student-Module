/**
 * @file env.ts
 * @brief Validation of the Supabase environment variables.
 *
 * A wrong value (e.g. a description copied instead of the URL, or `/rest/v1/` appended) would
 * make the Supabase client throw on start-up and leave a blank page. With these checks the app
 * shows its setup hint instead.
 */

/**
 * @brief Tells whether a value is a usable Supabase project URL.
 * @param value Raw value of `VITE_SUPABASE_URL`.
 * @returns True for an http(s) URL without path, query or hash,
 *          e.g. `https://abcd1234.supabase.co`.
 */
export function isValidSupabaseUrl(value: string | undefined): boolean {
  if (!value || value.trim() !== value) return false;
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      url.pathname === '/' &&
      url.search === '' &&
      url.hash === '' &&
      !value.endsWith('/')
    );
  } catch {
    return false;
  }
}

/**
 * @brief Tells whether a value looks like a public Supabase key.
 * @param value Raw value of `VITE_SUPABASE_ANON_KEY`.
 * @returns True for a publishable key (`sb_publishable_…`) or a legacy anon JWT (`eyJ…`)
 *          without spaces.
 */
export function isValidSupabaseKey(value: string | undefined): boolean {
  return !!value && /^(sb_publishable_|eyJ)\S+$/.test(value);
}
