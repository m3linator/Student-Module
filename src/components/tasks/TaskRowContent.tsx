import { cn } from '@/lib/cn';
import type { IsoDate } from '@/lib/berlinDate';
import { formatDueDate, formatRemaining, getRemainingDays, isUrgent } from '@/lib/deadline';
import type { TaskRow } from '@/types/database';

/** @brief Shared column layout of the task table (header and rows). */
export const TASK_GRID =
  'grid grid-cols-[minmax(0,1fr)_minmax(0,5.5rem)_4.5rem] items-center gap-3 px-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,8rem)_5rem]';

/** @brief Props of TaskRowContent. */
export interface TaskRowContentProps {
  task: TaskRow;
  moduleName: string | undefined;
  today: IsoDate;
  /** Completed tasks are greyed out and never red. */
  done?: boolean;
}

/**
 * @brief Visual content of one task row: title (+ due date), module, remaining days.
 * @param props See TaskRowContentProps.
 * @returns Row content (phrasing elements only, it lives inside a button).
 */
export function TaskRowContent({ task, moduleName, today, done = false }: TaskRowContentProps) {
  const remaining = getRemainingDays(task.due_date, task.finish_day_before, today);
  const urgent = !done && isUrgent(remaining);
  return (
    <span className={cn(TASK_GRID, 'min-h-14 py-2.5', done ? 'text-label-2' : 'text-label')}>
      <span className="flex min-w-0 flex-col">
        <span className="text-[15px] leading-snug break-words">{task.title}</span>
        {task.due_date && (
          <span className="text-label-2 text-[13px]">Abgabe: {formatDueDate(task.due_date)}</span>
        )}
      </span>
      <span className="text-label-2 truncate text-sm">{moduleName ?? ''}</span>
      <span
        className={cn(
          'justify-self-end rounded-lg px-2 py-1 text-sm whitespace-nowrap tabular-nums',
          urgent ? 'bg-danger-tint text-danger-ink font-semibold' : 'text-label-2',
        )}
      >
        {formatRemaining(remaining)}
      </span>
    </span>
  );
}
