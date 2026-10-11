import { useId, useState } from 'react';
import { Calendar } from '@/components/ui/Calendar';
import { FIELD_LABEL } from '@/components/ui/fieldStyles';
import { CalendarIcon, CloseIcon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { SelectField } from '@/components/ui/SelectField';
import { Sheet } from '@/components/ui/Sheet';
import { Switch } from '@/components/ui/Switch';
import { TextField } from '@/components/ui/TextField';
import type { TaskInput } from '@/data/actions';
import type { IsoDate } from '@/lib/berlinDate';
import { formatDueDateLong } from '@/lib/deadline';
import type { ModuleRow, TaskRow } from '@/types/database';

/** @brief Props of TaskSheet. */
export interface TaskSheetProps {
  open: boolean;
  /** Task to edit, or null to create a new one. */
  task: TaskRow | null;
  modules: ModuleRow[];
  today: IsoDate;
  onClose: () => void;
  onSave: (input: TaskInput) => void;
}

/**
 * @brief Pop-up for creating or editing a task. Only the title is required.
 * @details Mount with a fresh `key` per opening so the form starts from the given task.
 * @param props See TaskSheetProps.
 * @returns The sheet.
 */
export function TaskSheet({ open, task, modules, today, onClose, onSave }: TaskSheetProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [dueDate, setDueDate] = useState<IsoDate | null>(task?.due_date ?? null);
  const [finishDayBefore, setFinishDayBefore] = useState(task?.finish_day_before ?? true);
  const [moduleId, setModuleId] = useState(task?.module_id ?? '');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const dueLabelId = useId();

  const trimmed = title.trim();

  /** @brief Validates and hands the form values to the caller. */
  function handleSubmit() {
    if (!trimmed) return;
    onSave({
      title: trimmed,
      due_date: dueDate,
      finish_day_before: finishDayBefore,
      module_id: moduleId || null,
    });
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={task ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}
      onSubmit={handleSubmit}
      submitDisabled={!trimmed}
    >
      <div className="flex flex-col gap-5">
        <TextField
          label="Aufgabe"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="z. B. Übungsblatt 3"
          autoFocus={!task}
          required
          enterKeyHint="done"
        />

        <div className="flex flex-col gap-1.5">
          <span id={dueLabelId} className={FIELD_LABEL}>
            Abgabetag
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-labelledby={dueLabelId}
              aria-expanded={calendarOpen}
              aria-describedby={`${dueLabelId}-value`}
              onClick={() => setCalendarOpen((value) => !value)}
              className="bg-fill text-label hover:bg-fill-strong flex min-h-11 flex-1 items-center gap-2 rounded-xl px-3.5 text-left text-base"
            >
              <CalendarIcon className="text-link size-5" />
              <span id={`${dueLabelId}-value`} className={dueDate ? '' : 'text-label-2'}>
                {dueDate ? formatDueDateLong(dueDate) : 'Kein Datum'}
              </span>
            </button>
            {dueDate && (
              <IconButton
                label="Datum entfernen"
                onClick={() => {
                  setDueDate(null);
                  setCalendarOpen(false);
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </div>
          {calendarOpen && (
            <div className="animate-row-in bg-fill flex justify-center rounded-xl p-2">
              <Calendar
                value={dueDate}
                today={today}
                onChange={(date) => {
                  setDueDate(date);
                  setCalendarOpen(false);
                }}
              />
            </div>
          )}
        </div>

        {dueDate && (
          <Switch
            label="Bis Vorabend fertig"
            description="Countdown zählt bis zum Tag vor der Abgabe."
            checked={finishDayBefore}
            onChange={setFinishDayBefore}
          />
        )}

        <SelectField
          label="Modul"
          value={moduleId}
          onChange={(event) => setModuleId(event.target.value)}
        >
          <option value="">Kein Modul</option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.name}
            </option>
          ))}
        </SelectField>
      </div>
    </Sheet>
  );
}
