/**
 * @file habit.ts
 * @brief Streak calculation for the activity section.
 */
import { addDays, format, parseISO } from 'date-fns';
import type { IsoDate } from './berlinDate';

/**
 * @brief Shifts an ISO date by whole calendar days.
 * @param date ISO date.
 * @param days Offset (negative = earlier).
 * @returns Shifted ISO date.
 */
function shiftDay(date: IsoDate, days: number): IsoDate {
  return format(addDays(parseISO(date), days), 'yyyy-MM-dd');
}

/**
 * @brief Length of the current streak of consecutive checked days.
 * @details The streak ends today, or yesterday if today is not checked yet – so it does not
 * look broken in the morning before today's check.
 * @param checked Checked ISO dates.
 * @param today Current Berlin day.
 * @returns Number of consecutive days.
 */
export function currentStreak(checked: ReadonlySet<IsoDate>, today: IsoDate): number {
  let day = checked.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (checked.has(day)) {
    streak++;
    day = shiftDay(day, -1);
  }
  return streak;
}

/**
 * @brief Text shown next to the habit grid.
 * @param streak Result of currentStreak().
 * @returns E.g. "🔥 5 Tage in Folge".
 */
export function formatStreak(streak: number): string {
  if (streak === 0) return 'Noch keine Serie';
  return `🔥 ${streak} ${streak === 1 ? 'Tag' : 'Tage'} in Folge`;
}
