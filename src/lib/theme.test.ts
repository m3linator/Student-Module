import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyTheme,
  readThemePreference,
  resolveTheme,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  writeThemePreference,
} from './theme';

describe('resolveTheme', () => {
  it('follows the system only for "system"', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('theme preference storage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('defaults to "system" and round-trips valid values', () => {
    expect(readThemePreference()).toBe('system');
    writeThemePreference('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(readThemePreference()).toBe('dark');
  });

  it('ignores invalid values and blocked storage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'pink');
    expect(readThemePreference()).toBe('system');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readThemePreference()).toBe('system');
  });
});

describe('applyTheme', () => {
  it('toggles the dark class and updates the browser theme colour', () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);

    applyTheme('dark');
    expect(document.documentElement).toHaveClass('dark');
    expect(meta.content).toBe(THEME_COLORS.dark);

    applyTheme('light');
    expect(document.documentElement).not.toHaveClass('dark');
    expect(meta.content).toBe(THEME_COLORS.light);
    meta.remove();
  });
});
