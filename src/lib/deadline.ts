/**
 * @file deadline.ts
 * @brief "Remaining days" logic for tasks.
 *
 * deadline  = finish_day_before ? due_date − 1 day : due_date
 * remaining = calendar days from today (Berlin) to deadline; times of day are ignored.
 */
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import type { IsoDate } from './berlinDate';

/** @brief Tasks with this many remaining days or fewer are highlighted in red. */
export const URGENT_DAYS = 2;

/**
 * @brief Computes the working deadline of a task.
 * @param dueDate Submission day (ISO date, YYYY-MM-DD).
 * @param finishDayBefore Whether the task must be finished by the evening before.
 * @returns Deadline as ISO date.
 */
export function getDeadline(dueDate: IsoDate, finishDayBefore: boolean): IsoDate {
  if (!finishDayBefore) return dueDate;
  return format(addDays(parseISO(dueDate), -1), 'yyyy-MM-dd');
}

/**
 * @brief Calculates the remaining calendar days until the working deadline.
 * @param dueDate Submission day (ISO date) or null if none is set.
 * @param finishDayBefore Whether the task must be finished by the evening before.
 * @param today Current Berlin calendar day (ISO date), see todayInBerlin().
 * @returns Remaining calendar days (negative = overdue), or null without a due date.
 */
export function getRemainingDays(
  dueDate: IsoDate | null,
  finishDayBefore: boolean,
  today: IsoDate,
): number | null {
  if (!dueDate) return null;
  return differenceInCalendarDays(parseISO(getDeadline(dueDate, finishDayBefore)), parseISO(today));
}

/**
 * @brief Formats remaining days for the "verbl. Tage" column.
 * @param remaining Result of getRemainingDays().
 * @returns "N Tage", "1 Tag", "Heute", "−N" (overdue) or "–" (no date).
 */
export function formatRemaining(remaining: number | null): string {
  if (remaining === null) return '–';
  if (remaining < 0) return `−${Math.abs(remaining)}`;
  if (remaining === 0) return 'Heute';
  if (remaining === 1) return '1 Tag';
  return `${remaining} Tage`;
}

/**
 * @brief Decides whether a task is due soon enough to be shown in red.
 * @param remaining Result of getRemainingDays().
 * @returns True for ≤ 2 days, today and overdue; false without a date.
 */
export function isUrgent(remaining: number | null): boolean {
  return remaining !== null && remaining <= URGENT_DAYS;
}

/**
 * @brief Formats a due date for the task row ("Mi, 14.10.").
 * @param dueDate ISO date.
 * @returns Short German weekday plus day and month.
 */
export function formatDueDate(dueDate: IsoDate): string {
  return format(parseISO(dueDate), 'EEEEEE, dd.MM.', { locale: de });
}

/**
 * @brief Formats a due date including the year ("Mi, 14.10.2026") for the date picker field.
 * @param dueDate ISO date.
 * @returns Short German weekday, day, month and year.
 */
export function formatDueDateLong(dueDate: IsoDate): string {
  return format(parseISO(dueDate), 'EEEEEE, dd.MM.yyyy', { locale: de });
}

/**
 * @brief Describes the remaining days in words for screen readers.
 * @param remaining Result of getRemainingDays().
 * @returns E.g. "noch 3 Tage", "heute fällig", "2 Tage überfällig".
 */
export function describeRemaining(remaining: number | null): string {
  if (remaining === null) return 'kein Abgabetag';
  if (remaining === 0) return 'heute fällig';
  const days = Math.abs(remaining);
  const unit = days === 1 ? 'Tag' : 'Tage';
  return remaining < 0 ? `${days} ${unit} überfällig` : `noch ${days} ${unit}`;
}
