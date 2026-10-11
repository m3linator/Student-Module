import { useId, useState } from 'react';
import { PlusIcon } from '@/components/ui/icons';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { WEEKDAY_LABELS } from '@/lib/calendar';
import { draftStatus, EMPTY_DRAFT, missingFields, slotLabel, type SlotDraft } from '@/lib/slots';

/** @brief Props of SlotListField. */
export interface SlotListFieldProps {
  /** Kind of entry, e.g. "Vorlesung" or "Übung". */
  kind: string;
  slots: SlotDraft[];
  onChange: (slots: SlotDraft[]) => void;
}

/** @brief Props of SlotRow. */
interface SlotRowProps {
  legend: string;
  draft: SlotDraft;
  onChange: (patch: Partial<SlotDraft>) => void;
  autoFocus: boolean;
}

/**
 * @brief Hint below an entry: old free text, missing fields or an end before the start.
 * @param draft Form entry.
 * @returns Hint text, or null when nothing needs to be said.
 */
function hintFor(draft: SlotDraft): string | null {
  const status = draftStatus(draft);
  const legacy = draft.legacy ? `Bisher: „${draft.legacy}“. ` : '';
  if (status === 'invalid-range') return 'Das Ende muss nach dem Beginn liegen.';
  if (status === 'incomplete') return `${legacy}Es fehlt: ${missingFields(draft).join(', ')}.`;
  if (status === 'empty' && legacy) {
    return `${legacy}Bitte Tag, Beginn und Ende eintragen – sonst wird der Eintrag beim Speichern entfernt.`;
  }
  return null;
}

/**
 * @brief One appointment: weekday, start and end in the first line, room in the second.
 * @param props See SlotRowProps.
 * @returns The field group.
 */
function SlotRow({ legend, draft, onChange, autoFocus }: SlotRowProps) {
  const hintId = useId();
  const status = draftStatus(draft);
  const hint = hintFor(draft);
  const describedBy = hint ? hintId : undefined;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-[15px] font-semibold text-label">{legend}</legend>
      <div className="grid grid-cols-[5rem_1fr_1fr] gap-2">
        <SelectField
          label="Tag"
          value={draft.weekday}
          onChange={(event) => onChange({ weekday: event.target.value })}
          autoFocus={autoFocus}
          aria-describedby={describedBy}
        >
          <option value="">–</option>
          {WEEKDAY_LABELS.map((label, index) => (
            <option key={label} value={String(index + 1)}>
              {label}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Beginn"
          type="time"
          step={300}
          value={draft.start}
          onChange={(event) => onChange({ start: event.target.value })}
          aria-describedby={describedBy}
        />
        <TextField
          label="Ende"
          type="time"
          step={300}
          value={draft.end}
          onChange={(event) => onChange({ end: event.target.value })}
          aria-invalid={status === 'invalid-range'}
          aria-describedby={describedBy}
        />
      </div>
      <TextField
        label="Raum (optional)"
        value={draft.room}
        onChange={(event) => onChange({ room: event.target.value })}
      />
      {hint && (
        <p
          id={hintId}
          className={
            status === 'invalid-range' ? 'text-[13px] text-danger-ink' : 'text-[13px] text-label-2'
          }
        >
          {hint}
        </p>
      )}
    </fieldset>
  );
}

/**
 * @brief Editable list of appointments (weekday, start, end, room) with a full-width "+" button.
 * @details Entries are never removed while typing; an entry without weekday, start and end is
 * dropped when the form is saved (see cleanSlots()). Half-filled entries show a hint.
 * @param props See SlotListFieldProps.
 * @returns The field group.
 */
export function SlotListField({ kind, slots, onChange }: SlotListFieldProps) {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  /**
   * @brief Changes fields of one entry.
   * @param index Entry position.
   * @param patch Changed fields.
   */
  const update = (index: number, patch: Partial<SlotDraft>) =>
    onChange(slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));

  /** @brief Appends an empty entry and focuses its weekday field. */
  const add = () => {
    setFocusIndex(slots.length);
    onChange([...slots, EMPTY_DRAFT]);
  };

  return (
    <div className="flex flex-col gap-4">
      {slots.map((draft, index) => (
        <SlotRow
          key={index}
          legend={slotLabel(kind, index, slots.length)}
          draft={draft}
          onChange={(patch) => update(index, patch)}
          autoFocus={index === focusIndex}
        />
      ))}
      <button
        type="button"
        onClick={add}
        className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-fill text-[15px] font-medium text-link transition-colors duration-150 hover:bg-fill-strong"
      >
        <PlusIcon className="size-4" strokeWidth={2.5} />
        {kind}
      </button>
    </div>
  );
}
