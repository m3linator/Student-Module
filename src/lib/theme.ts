/**
 * @file theme.ts
 * @brief Light/dark appearance: preference storage, resolution and application to the page.
 *
 * The same logic runs as a tiny inline script in index.html before the first paint, so the page
 * never flashes in the wrong colours.
 */

/** @brief What the user picked. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** @brief What is actually shown. */
export type ResolvedTheme = 'light' | 'dark';

/** @brief localStorage key of the preference (must match the script in index.html). */
export const THEME_STORAGE_KEY = 'uni-app:theme';

/** @brief Page background per theme – used for the browser/status bar colour. */
export const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: '#f2f2f7',
  dark: '#000000',
};

const PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system'];

/**
 * @brief Decides which theme to show.
 * @param preference User preference.
 * @param systemDark Whether the operating system is in dark mode.
 * @returns "light" or "dark".
 */
export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  if (preference === 'system') return systemDark ? 'dark' : 'light';
  return preference;
}

/**
 * @brief Reads the stored preference.
 * @returns Stored value, or "system" if none/invalid or storage is blocked.
 */
export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return PREFERENCES.includes(stored as ThemePreference) ? (stored as ThemePreference) : 'system';
  } catch {
    return 'system';
  }
}

/**
 * @brief Stores the preference on this device.
 * @param preference Preference to store.
 */
export function writeThemePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage unavailable – the choice then only lasts for this session.
  }
}

/**
 * @brief Applies a theme to the document (CSS class, native controls, browser bar colour).
 * @param theme Theme to show.
 */
export function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => (meta.content = THEME_COLORS[theme]));
}
