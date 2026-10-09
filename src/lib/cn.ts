/**
 * @brief Joins CSS class names, skipping falsy values.
 * @param classes Class names or falsy placeholders for conditional classes.
 * @returns Space-separated class string.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
