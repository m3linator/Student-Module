import { useId, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import type { ModuleInput } from '@/data/actions';
import { parseEcts } from '@/lib/module';
import { cleanSlots, normalizeSlots } from '@/lib/slots';
import type { ModuleRow, TimeSlot } from '@/types/database';
import { SlotListField } from './SlotListField';

/** @brief Props of ModuleSheet. */
export interface ModuleSheetProps {
  open: boolean;
  /** Module to edit, or null to create one. */
  module: ModuleRow | null;
  onClose: () => void;
  onSave: (input: ModuleInput) => void;
}

/**
 * @brief Slots shown in the form: the stored ones, or one empty entry to start typing.
 * @param value Stored slot list.
 * @returns Editable slot list.
 */
function initialSlots(value: unknown): TimeSlot[] {
  const slots = normalizeSlots(value);
  return slots.length > 0 ? slots : [{ room: '', time: '' }];
}

/**
 * @brief Pop-up for creating or editing a module. Only the name is required.
 * @details Any number of lectures and exercises can be added; entries without a time are removed
 * on save. Mount with a fresh `key` per opening so the form starts from the given module.
 * @param props See ModuleSheetProps.
 * @returns The sheet.
 */
export function ModuleSheet({ open, module, onClose, onSave }: ModuleSheetProps) {
  const [name, setName] = useState(module?.name ?? '');
  const [professor, setProfessor] = useState(module?.professor ?? '');
  const [ects, setEcts] = useState(
    module?.ects != null ? String(module.ects).replace('.', ',') : '',
  );
  const [lectures, setLectures] = useState(() => initialSlots(module?.lectures));
  const [exercises, setExercises] = useState(() => initialSlots(module?.exercises));
  const ectsErrorId = useId();

  const parsedEcts = parseEcts(ects);
  const ectsInvalid = parsedEcts === undefined;
  const valid = name.trim() !== '' && !ectsInvalid;

  /** @brief Validates and hands the form values to the caller. */
  function handleSubmit() {
    if (!valid || parsedEcts === undefined) return;
    onSave({
      name: name.trim(),
      professor: professor.trim() || null,
      ects: parsedEcts,
      lectures: cleanSlots(lectures),
      exercises: cleanSlots(exercises),
    });
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={module ? 'Modul bearbeiten' : 'Neues Modul'}
      onSubmit={handleSubmit}
      submitDisabled={!valid}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <TextField
            label="Modulname"
            placeholder="z. B. Mathematik 1"
            value={name}
            onChange={(event) => setName(event.target.value)}
            data-autofocus={module ? undefined : ''}
            required
          />
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <TextField
              label="Prof-Name"
              value={professor}
              onChange={(event) => setProfessor(event.target.value)}
              autoComplete="off"
            />
            <TextField
              label="ECTS"
              inputMode="decimal"
              value={ects}
              onChange={(event) => setEcts(event.target.value)}
              aria-invalid={ectsInvalid}
              aria-describedby={ectsInvalid ? ectsErrorId : undefined}
            />
          </div>
          {ectsInvalid && (
            <p id={ectsErrorId} className="-mt-2 text-[13px] text-danger-ink">
              Bitte eine Zahl eingeben, z. B. 5 oder 7,5.
            </p>
          )}
        </div>

        <SlotListField
          kind="Vorlesung"
          slots={lectures}
          onChange={setLectures}
          timePlaceholder="Di 10:00–11:30"
        />
        <SlotListField
          kind="Übung"
          slots={exercises}
          onChange={setExercises}
          timePlaceholder="Do 14:00–15:30"
        />

        <p className="-mt-2 text-[13px] text-label-2">
          Einträge ohne Uhrzeit werden beim Speichern entfernt.
        </p>
      </div>
    </Sheet>
  );
}
