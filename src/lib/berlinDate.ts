/**
 * @file berlinDate.ts
 * @brief Calendar-day helpers pinned to the Europe/Berlin time zone.
 *
 * Dates are passed around as ISO strings (`YYYY-MM-DD`) – the same format Postgres uses for the
 * `date` type – so no time-of-day or device time zone can leak into the calculations.
 */
import { TZDate } from '@date-fns/tz';
import { addDays, format, startOfDay } from 'date-fns';
import { TIME_ZONE } from '@/config/app';

/** @brief Calendar date in ISO format, e.g. `2026-10-14`. */
export type IsoDate = string;

/**
 * @brief Returns the current calendar day in Berlin.
 * @param now Instant to evaluate (defaults to the current time).
 * @returns Berlin calendar day as `YYYY-MM-DD`.
 */
export function todayInBerlin(now: Date = new Date()): IsoDate {
  return format(new TZDate(now, TIME_ZONE), 'yyyy-MM-dd');
}

/**
 * @brief Milliseconds until the next midnight in Berlin (DST-aware: days can have 23 or 25 h).
 * @param now Instant to evaluate (defaults to the current time).
 * @returns Positive number of milliseconds.
 */
export function msUntilNextBerlinMidnight(now: Date = new Date()): number {
  const berlinNow = new TZDate(now, TIME_ZONE);
  const nextMidnight = startOfDay(addDays(berlinNow, 1));
  return nextMidnight.getTime() - now.getTime();
}
