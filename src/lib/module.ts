/**
 * @file module.ts
 * @brief Formatting and parsing helpers for module fields.
 */

const numberFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });

/**
 * @brief Formats credit points for display.
 * @param ects Credit points.
 * @returns E.g. "5 ECTS" or "7,5 ECTS".
 */
export function formatEcts(ects: number): string {
  return `${numberFormat.format(ects)} ECTS`;
}

/**
 * @brief Parses the ECTS input field (comma or dot as decimal separator).
 * @param input Raw field value.
 * @returns Number, null for an empty field, or undefined if invalid.
 */
export function parseEcts(input: string): number | null | undefined {
  const value = input.trim().replace(',', '.');
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/**
 * @brief Describes the number of open tasks on a module tile.
 * @param count Open task count.
 * @returns E.g. "3 offen".
 */
export function formatOpenCount(count: number): string {
  return count === 0 ? 'Keine offen' : `${count} offen`;
}
