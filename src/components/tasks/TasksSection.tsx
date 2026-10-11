import { useCallback, useState } from 'react';
import { CheckIcon, RestoreIcon, TrashIcon } from '@/components/ui/icons';
import { Section } from '@/components/ui/Section';
import { Skeleton } from '@/components/ui/Skeleton';
import type { SwipeAction } from '@/components/ui/SwipeRow';
import { UNDO_TOAST_MS } from '@/config/app';
import type { TaskInput } from '@/data/actions';
import { useActions, useModules, useTasks } from '@/hooks/useData';
import { useShortcut } from '@/hooks/useShortcut';
import { useToast } from '@/hooks/useToast';
import type { TaskRow } from '@/types/database';
import { CompletedTasks } from './CompletedTasks';
import { TaskList } from './TaskList';
import { TaskSheet } from './TaskSheet';

/** @brief State of the task pop-up; `key` remounts the form for every opening. */
interface SheetState {
  open: boolean;
  task: TaskRow | null;
  key: number;
}

/**
 * @brief "Aufgaben" section: open tasks, completed tasks and the task pop-up.
 * @returns The section.
 */
export function TasksSection() {
  const { loading, open, completed, today } = useTasks();
  const { modules, byId } = useModules();
  const actions = useActions();
  const toast = useToast();
  const [sheet, setSheet] = useState<SheetState>({ open: false, task: null, key: 0 });

  const openSheet = useCallback(
    (task: TaskRow | null) => setSheet((s) => ({ open: true, task, key: s.key + 1 })),
    [],
  );
  const closeSheet = () => setSheet((s) => ({ ...s, open: false }));

  useShortcut('n', () => openSheet(null));

  /**
   * @brief Creates or updates the task from the pop-up.
   * @param input Form values.
   */
  function handleSave(input: TaskInput) {
    if (sheet.task) void actions.updateTask(sheet.task.id, input);
    else void actions.addTask(input);
    closeSheet();
  }

  /**
   * @brief Deletes a task permanently and offers a 5 s undo.
   * @param task Task to delete.
   */
  async function handleDelete(task: TaskRow) {
    if (!(await actions.deleteTask(task.id))) return;
    toast.show('Aufgabe gelöscht', {
      duration: UNDO_TOAST_MS,
      action: { label: 'Rückgängig', onAction: () => void actions.restoreDeletedTask(task) },
    });
  }

  /**
   * @brief Builds the red "delete" action shared by both lists.
   * @param task Task the action belongs to.
   * @returns Swipe action.
   */
  const deleteAction = (task: TaskRow): SwipeAction => ({
    label: 'Löschen',
    icon: <TrashIcon />,
    tone: 'red',
    exit: true,
    onClick: () => void handleDelete(task),
  });

  return (
    <Section title="Aufgaben" onAdd={() => openSheet(null)} addLabel="Neue Aufgabe">
      {loading ? (
        <div className="flex flex-col gap-2" aria-label="Aufgaben werden geladen" role="status">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <TaskList
            tasks={open}
            modules={byId}
            today={today}
            onOpen={openSheet}
            empty={
              <p className="card px-4 py-6 text-center text-label-2">Keine offenen Aufgaben 🎉</p>
            }
            actionsFor={(task) => [
              deleteAction(task),
              {
                label: 'Abhaken',
                icon: <CheckIcon />,
                tone: 'green',
                exit: true,
                onClick: () => void actions.setTaskCompleted(task.id, true),
              },
            ]}
          />
          <CompletedTasks count={completed.length}>
            <TaskList
              tasks={completed}
              modules={byId}
              today={today}
              done
              showHeader={false}
              onOpen={openSheet}
              empty={<p className="px-1 text-sm text-label-2">Noch nichts erledigt.</p>}
              actionsFor={(task) => [
                deleteAction(task),
                {
                  label: 'Wiederherstellen',
                  icon: <RestoreIcon />,
                  tone: 'green',
                  exit: true,
                  onClick: () => void actions.setTaskCompleted(task.id, false),
                },
              ]}
            />
          </CompletedTasks>
        </div>
      )}
      <TaskSheet
        key={sheet.key}
        open={sheet.open}
        task={sheet.task}
        modules={modules}
        today={today}
        onClose={closeSheet}
        onSave={handleSave}
      />
    </Section>
  );
}
