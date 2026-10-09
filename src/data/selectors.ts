/**
 * @file selectors.ts
 * @brief Pure functions deriving view data from the store tables.
 */
import type { IsoDate } from '@/lib/berlinDate';
import { sortCompletedTasks, sortOpenTasks } from '@/lib/sort';
import type { HabitRow, ModuleLinkRow, ModuleRow, TaskRow } from '@/types/database';
import type { Tables } from './store';

/**
 * @brief Open tasks in display order.
 * @param tables Store tables.
 * @param today Current Berlin calendar day.
 * @returns Sorted open tasks.
 */
export function selectOpenTasks(tables: Tables, today: IsoDate): TaskRow[] {
  return sortOpenTasks(
    Object.values(tables.tasks).filter((task) => task.completed_at === null),
    today,
  );
}

/**
 * @brief Completed tasks, most recently completed first.
 * @param tables Store tables.
 * @returns Sorted completed tasks.
 */
export function selectCompletedTasks(tables: Tables): TaskRow[] {
  return sortCompletedTasks(
    Object.values(tables.tasks).filter((task) => task.completed_at !== null),
  );
}

/**
 * @brief All modules in creation order.
 * @param tables Store tables.
 * @returns Sorted modules.
 */
export function selectModules(tables: Tables): ModuleRow[] {
  return Object.values(tables.modules).sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/**
 * @brief Number of open tasks per module id.
 * @param tables Store tables.
 * @returns Map module id → open task count (modules without open tasks are absent).
 */
export function selectOpenCountByModule(tables: Tables): Map<string, number> {
  const counts = new Map<string, number>();
  for (const task of Object.values(tables.tasks)) {
    if (task.completed_at !== null || task.module_id === null) continue;
    counts.set(task.module_id, (counts.get(task.module_id) ?? 0) + 1);
  }
  return counts;
}

/**
 * @brief Links of one module ordered by position, then creation time.
 * @param tables Store tables.
 * @param moduleId Module id.
 * @returns Sorted links.
 */
export function selectLinks(tables: Tables, moduleId: string): ModuleLinkRow[] {
  return Object.values(tables.module_links)
    .filter((link) => link.module_id === moduleId)
    .sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at));
}

/**
 * @brief The user's single habit (oldest one, should duplicates ever exist).
 * @param tables Store tables.
 * @returns Habit row or null while none exists.
 */
export function selectHabit(tables: Tables): HabitRow | null {
  const habits = Object.values(tables.habits).sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
  return habits[0] ?? null;
}

/**
 * @brief Checked days of a habit.
 * @param tables Store tables.
 * @param habitId Habit id.
 * @returns Set of ISO dates.
 */
export function selectCheckedDates(tables: Tables, habitId: string): Set<IsoDate> {
  return new Set(
    Object.values(tables.habit_checks)
      .filter((check) => check.habit_id === habitId)
      .map((check) => check.date),
  );
}
