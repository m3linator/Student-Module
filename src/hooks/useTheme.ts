/**
 * @file useTheme.ts
 * @brief Shared appearance state: user preference plus live system dark-mode changes.
 */
import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  applyTheme,
  readThemePreference,
  resolveTheme,
  writeThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';
const listeners = new Set<() => void>();
let preference: ThemePreference = readThemePreference();

/**
 * @brief Subscribes to preference and system changes.
 * @param listener Change callback.
 * @returns Unsubscribe function.
 */
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', listener);
  return () => {
    listeners.delete(listener);
    media.removeEventListener('change', listener);
  };
}

/**
 * @brief Snapshot combining preference and system state (stable string for React).
 * @returns E.g. "system|dark".
 */
function getSnapshot(): string {
  return `${preference}|${resolveTheme(preference, window.matchMedia(DARK_QUERY).matches)}`;
}

/** @brief Return value of useTheme. */
export interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
}

/**
 * @brief Reads and changes the appearance; also applies it to the document.
 * @returns Preference, resolved theme and setter.
 */
export function useTheme(): ThemeState {
  const [current, resolved] = useSyncExternalStore(subscribe, getSnapshot).split('|') as [
    ThemePreference,
    ResolvedTheme,
  ];

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    preference = next;
    writeThemePreference(next);
    listeners.forEach((listener) => listener());
  }, []);

  return { preference: current, resolved, setPreference };
}
