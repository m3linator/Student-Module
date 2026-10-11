import { useId, type ReactNode } from 'react';
import { usePersistentFlag } from '@/hooks/usePersistentState';
import { cn } from '@/lib/cn';

/**
 * @brief Collapsible "Erledigte Aufgaben (n)" section; collapsed by default, state remembered.
 * @param props.count Number of completed tasks.
 * @param props.children The completed task list.
 * @returns Toggle row plus the animated, collapsible content.
 */
export function CompletedTasks({ count, children }: { count: number; children: ReactNode }) {
  const [expanded, setExpanded] = usePersistentFlag('uni-app:completed-expanded', false);
  const contentId = useId();
  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded(!expanded)}
        className="text-label-2 hover:bg-fill -mx-2 flex min-h-11 items-center gap-2 self-start rounded-lg px-2 text-[15px]"
      >
        <span aria-hidden="true" className="w-3 text-center">
          {expanded ? '▾' : '▸'}
        </span>
        Erledigte Aufgaben ({count})
      </button>
      <div
        id={contentId}
        inert={!expanded}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
