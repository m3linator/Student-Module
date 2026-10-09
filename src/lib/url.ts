/**
 * @file url.ts
 * @brief Normalisation and validation of user-entered link URLs.
 */

/** @brief Schemes a link may use; everything else (javascript:, data:, …) is rejected. */
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

/**
 * @brief Cleans up a URL typed by the user and adds `https://` when the scheme is missing.
 * @param input Raw input, e.g. "moodle.h-brs.de".
 * @returns Safe absolute URL, or null if the input is empty or not a usable link.
 */
export function normalizeUrl(input: string): string | null {
  let value = input.trim();
  if (!value) return null;
  if (value.startsWith('//')) value = value.slice(2);
  if (!/^[a-z][a-z\d+.-]*:/i.test(value)) value = `https://${value}`;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return null;
  if (
    parsed.protocol !== 'mailto:' &&
    !parsed.hostname.includes('.') &&
    parsed.hostname !== 'localhost'
  ) {
    return null;
  }
  return value;
}
