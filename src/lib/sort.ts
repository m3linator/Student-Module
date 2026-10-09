/**
 * @file sort.ts
 * @brief Ordering rules for task lists.
 */
import type { TaskRow } from '@/types/database';
import type { IsoDate } from './berlinDate';
import { getRemainingDays } from './deadline';

/**
 * @brief Sorts open tasks: fewest remaining days first, tasks without date last,
 *        ties broken by creation time (oldest first).
 * @param tasks Open tasks (not mutated).
 * @param today Current Berlin calendar day.
 * @returns New, sorted array.
 */
export function sortOpenTasks(tasks: readonly TaskRow[], today: IsoDate): TaskRow[] {
  const remaining = new Map(
    tasks.map((task) => [task.id, getRemainingDays(task.due_date, task.finish_day_before, today)]),
  );
  return [...tasks].sort((a, b) => {
    const ra = remaining.get(a.id) ?? null;
    const rb = remaining.get(b.id) ?? null;
    if (ra !== rb) {
      if (ra === null) return 1;
      if (rb === null) return -1;
      return ra - rb;
    }
    return a.created_at.localeCompare(b.created_at);
  });
}

/**
 * @brief Sorts completed tasks by completion time, newest first.
 * @param tasks Completed tasks (not mutated).
 * @returns New, sorted array.
 */
export function sortCompletedTasks(tasks: readonly TaskRow[]): TaskRow[] {
  return [...tasks].sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''));
}
