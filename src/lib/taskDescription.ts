/**
 * @file taskDescription.ts
 * @brief Accessible (screen reader) description of a task row.
 */
import type { TaskRow } from '@/types/database';
import type { IsoDate } from './berlinDate';
import { describeRemaining, formatDueDate, getRemainingDays } from './deadline';

/** @brief Input of describeTask. */
export interface TaskDescriptionInput {
  task: TaskRow;
  moduleName: string | undefined;
  today: IsoDate;
}

/**
 * @brief Builds the accessible name of a task row.
 * @param input Task, module name and current Berlin day.
 * @returns Sentence such as "Blatt 3, Mathe, Abgabe Mi, 14.10., noch 3 Tage".
 */
export function describeTask({ task, moduleName, today }: TaskDescriptionInput): string {
  const remaining = getRemainingDays(task.due_date, task.finish_day_before, today);
  return [
    task.title,
    moduleName,
    task.due_date ? `Abgabe ${formatDueDate(task.due_date)}` : null,
    describeRemaining(remaining),
  ]
    .filter(Boolean)
    .join(', ');
}
