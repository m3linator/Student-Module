import type { ReactNode } from 'react';
import type { SwipeAction } from '@/components/ui/SwipeRow';
import { SwipeRow } from '@/components/ui/SwipeRow';
import type { IsoDate } from '@/lib/berlinDate';
import { cn } from '@/lib/cn';
import type { ModuleRow, TaskRow } from '@/types/database';
import { describeTask } from '@/lib/taskDescription';
import { TASK_GRID, TaskRowContent } from './TaskRowContent';

/** @brief Props of TaskList. */
export interface TaskListProps {
  tasks: TaskRow[];
  modules: Record<string, ModuleRow>;
  today: IsoDate;
  /** Completed list: grey rows. */
  done?: boolean;
  /** Builds the swipe/hover actions of a task. */
  actionsFor: (task: TaskRow) => SwipeAction[];
  onOpen: (task: TaskRow) => void;
  /** Shown instead of the table when there are no tasks. */
  empty?: ReactNode;
  /** Show the column header row. */
  showHeader?: boolean;
}

/**
 * @brief Bordered task table with column header and swipeable rows.
 * @param props See TaskListProps.
 * @returns The list or its empty state.
 */
export function TaskList({
  tasks,
  modules,
  today,
  done = false,
  actionsFor,
  onOpen,
  empty,
  showHeader = true,
}: TaskListProps) {
  if (tasks.length === 0) return <>{empty}</>;
  return (
    <div className="card overflow-hidden">
      {showHeader && (
        <div
          aria-hidden="true"
          className={cn(
            TASK_GRID,
            'border-separator text-label-2 border-b-[0.5px] pt-2.5 pb-2 text-xs font-medium',
          )}
        >
          <span>Aufgabe</span>
          <span>Modul</span>
          <span className="text-right">verbl. Tage</span>
        </div>
      )}
      <ul className="divide-separator divide-y-[0.5px]">
        {tasks.map((task) => {
          const moduleName = task.module_id ? modules[task.module_id]?.name : undefined;
          return (
            <li key={task.id} className="animate-row-in">
              <SwipeRow
                id={task.id}
                label={describeTask({ task, moduleName, today })}
                actions={actionsFor(task)}
                onTap={() => onOpen(task)}
              >
                <TaskRowContent task={task} moduleName={moduleName} today={today} done={done} />
              </SwipeRow>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
