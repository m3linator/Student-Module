/**
 * @file errors.ts
 * @brief Translates technical errors (Supabase, network) into short German UI messages.
 */

/** @brief Generic fallback shown when nothing more specific is known. */
export const GENERIC_ERROR = 'Etwas ist schiefgelaufen. Bitte versuche es erneut.';

/**
 * @brief Reads a string property from an unknown error-like value.
 * @param error Any thrown value.
 * @param key Property name to read.
 * @returns The property value if it is a string, otherwise undefined.
 */
function readString(error: unknown, key: string): string | undefined {
  if (typeof error !== 'object' || error === null || !(key in error)) return undefined;
  const value: unknown = (error as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

/**
 * @brief Maps an error to a user-friendly German message.
 * @param error Any thrown value or Supabase error object.
 * @param fallback Message used when the error is not recognised.
 * @returns German message suitable for a toast or form hint.
 */
export function toGermanMessage(error: unknown, fallback: string = GENERIC_ERROR): string {
  const code = readString(error, 'code');
  const message = (readString(error, 'message') ?? '').toLowerCase();

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'E-Mail oder Passwort ist falsch.';
  }
  if (code === 'email_not_confirmed') return 'Diese E-Mail-Adresse ist noch nicht bestätigt.';
  if (code === 'over_request_rate_limit' || message.includes('rate limit')) {
    return 'Zu viele Versuche. Bitte warte kurz.';
  }
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung.';
  }
  if (code === 'PGRST301' || message.includes('jwt')) {
    return 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.';
  }
  return fallback;
}
