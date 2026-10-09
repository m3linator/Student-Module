/**
 * @file useToday.ts
 * @brief Shared "today in Berlin" value that flips at midnight and when the app is reopened.
 */
import { useSyncExternalStore } from 'react';
import { msUntilNextBerlinMidnight, todayInBerlin, type IsoDate } from '@/lib/berlinDate';

const listeners = new Set<() => void>();
let today: IsoDate = todayInBerlin();
let timer: ReturnType<typeof setTimeout> | undefined;

/** @brief Recomputes today and notifies subscribers when the day changed. */
function refresh() {
  const next = todayInBerlin();
  if (next !== today) {
    today = next;
    listeners.forEach((listener) => listener());
  }
  schedule();
}

/** @brief Arms a timer for one second after the next Berlin midnight. */
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(refresh, msUntilNextBerlinMidnight() + 1000);
}

/** @brief Handles the app returning to the foreground (timers may not fire in background). */
function handleVisibility() {
  if (document.visibilityState === 'visible') refresh();
}

/**
 * @brief Subscribes to day changes; the timer only runs while someone listens.
 * @param listener Callback invoked when the day changes.
 * @returns Unsubscribe function.
 */
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    refresh();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', refresh);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', refresh);
    }
  };
}

/**
 * @brief Current Berlin calendar day; re-renders the component when the day changes.
 * @returns ISO date (`YYYY-MM-DD`).
 */
export function useToday(): IsoDate {
  return useSyncExternalStore(subscribe, () => today);
}
