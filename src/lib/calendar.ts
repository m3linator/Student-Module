/**
 * @file calendar.ts
 * @brief Month grid helpers shared by the date picker and the habit tracker.
 */
import { format, getDaysInMonth, getISODay } from 'date-fns';
import { de } from 'date-fns/locale';
import type { IsoDate } from './berlinDate';

/** @brief A calendar month; `month` is 1-based (1 = January). */
export interface YearMonth {
  year: number;
  month: number;
}

/** @brief German weekday abbreviations, Monday first. */
export const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

/**
 * @brief Formats year, month and day as ISO date.
 * @param year Full year.
 * @param month Month (1–12).
 * @param day Day of month.
 * @returns `YYYY-MM-DD`.
 */
export function toIsoDate(year: number, month: number, day: number): IsoDate {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * @brief Extracts the month of an ISO date.
 * @param date ISO date.
 * @returns Year and 1-based month.
 */
export function monthOf(date: IsoDate): YearMonth {
  const [year = 0, month = 1] = date.split('-').map(Number);
  return { year, month };
}

/**
 * @brief Moves a month forwards or backwards.
 * @param value Starting month.
 * @param delta Number of months (negative = back).
 * @returns Resulting month.
 */
export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/**
 * @brief Builds a Monday-first grid of weeks for one month.
 * @param value Month to render.
 * @returns Weeks of seven cells; days outside the month are null.
 */
export function buildMonthGrid({ year, month }: YearMonth): (IsoDate | null)[][] {
  const first = new Date(year, month - 1, 1);
  const leading = getISODay(first) - 1;
  const cells: (IsoDate | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= getDaysInMonth(first); day++) cells.push(toIsoDate(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (IsoDate | null)[][] = [];
  for (let start = 0; start < cells.length; start += 7) weeks.push(cells.slice(start, start + 7));
  return weeks;
}

/**
 * @brief Formats a month for headings ("Oktober 2026").
 * @param value Month.
 * @returns German month name and year.
 */
export function formatMonthYear({ year, month }: YearMonth): string {
  return format(new Date(year, month - 1, 1), 'LLLL yyyy', { locale: de });
}
