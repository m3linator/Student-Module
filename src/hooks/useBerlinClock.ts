/**
 * @file useBerlinClock.ts
 * @brief Current Berlin weekday and time of day, updated every minute.
 */
import { useEffect, useState } from 'react';
import { clockInBerlin, type BerlinClock } from '@/lib/berlinDate';

/** @brief One minute in milliseconds. */
const MINUTE_MS = 60_000;

/**
 * @brief Berlin weekday and minutes since midnight; re-renders at the start of every minute and
 *        when the app returns to the foreground (timers may pause in the background).
 * @returns Current clock.
 */
export function useBerlinClock(): BerlinClock {
  const [clock, setClock] = useState(clockInBerlin);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    /** @brief Updates the clock and arms the timer for the next full minute. */
    const tick = () => {
      setClock(clockInBerlin());
      clearTimeout(timer);
      timer = setTimeout(tick, MINUTE_MS - (Date.now() % MINUTE_MS) + 50);
    };

    /** @brief Catches up after the app was in the background. */
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };

    timer = setTimeout(tick, MINUTE_MS - (Date.now() % MINUTE_MS) + 50);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return clock;
}
