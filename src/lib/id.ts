/**
 * @file id.ts
 * @brief Client-side UUID generation for optimistic inserts.
 */

/**
 * @brief Creates a random RFC 4122 version-4 UUID.
 * @details `crypto.randomUUID` only exists in secure contexts (HTTPS/localhost). When testing on
 * the iPhone via `http://<LAN-IP>` it is missing, so a getRandomValues-based fallback is used.
 * @returns UUID string, e.g. `3b241101-e2bb-4255-8caf-4136c566a962`.
 */
export function createId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40; // version 4
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
