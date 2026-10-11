import { useState } from 'react';
import { PlusIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/TextField';
import { slotLabel } from '@/lib/slots';
import type { TimeSlot } from '@/types/database';

/** @brief Props of SlotListField. */
export interface SlotListFieldProps {
  /** Kind of entry, e.g. "Vorlesung" or "Übung". */
  kind: string;
  slots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  /** Placeholder of the time field. */
  timePlaceholder: string;
}

/**
 * @brief Editable list of appointments (room + time) with a full-width "+" button below.
 * @details Entries are never removed while typing; an entry whose time is empty is dropped when
 * the form is saved (see cleanSlots()).
 * @param props See SlotListFieldProps.
 * @returns The field group.
 */
export function SlotListField({ kind, slots, onChange, timePlaceholder }: SlotListFieldProps) {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  /**
   * @brief Changes one field of one entry.
   * @param index Entry position.
   * @param patch Changed field.
   */
  const update = (index: number, patch: Partial<TimeSlot>) =>
    onChange(slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));

  /** @brief Appends an empty entry and focuses its room field. */
  const add = () => {
    setFocusIndex(slots.length);
    onChange([...slots, { room: '', time: '' }]);
  };

  return (
    <div className="flex flex-col gap-3">
      {slots.map((slot, index) => (
        <fieldset key={index} className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-[15px] font-semibold text-label">
            {slotLabel(kind, index, slots.length)}
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Raum"
              value={slot.room}
              onChange={(event) => update(index, { room: event.target.value })}
              autoFocus={index === focusIndex}
            />
            <TextField
              label="Uhrzeit"
              value={slot.time}
              placeholder={timePlaceholder}
              onChange={(event) => update(index, { time: event.target.value })}
            />
          </div>
        </fieldset>
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
