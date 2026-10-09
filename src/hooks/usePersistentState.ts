import { useCallback, useState } from 'react';

/**
 * @brief Boolean UI state remembered in localStorage (e.g. a collapsed section).
 * @details Storage can be unavailable (private mode, blocked site data); the hook then simply
 * behaves like useState.
 * @param key localStorage key.
 * @param initial Value used when nothing is stored.
 * @returns Current value and setter.
 */
export function usePersistentFlag(
  key: string,
  initial: boolean,
): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? initial : stored === 'true';
    } catch {
      return initial;
    }
  });

  const update = useCallback(
    (next: boolean) => {
      setValue(next);
      try {
        localStorage.setItem(key, String(next));
      } catch {
        // Storage unavailable – keep the in-memory value only.
      }
    },
    [key],
  );

  return [value, update];
}
