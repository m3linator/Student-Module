import { useId, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import type { ModuleInput } from '@/data/actions';
import { parseEcts } from '@/lib/module';
import type { ModuleRow } from '@/types/database';

/** @brief Props of ModuleSheet. */
export interface ModuleSheetProps {
  open: boolean;
  /** Module to edit, or null to create one. */
  module: ModuleRow | null;
  onClose: () => void;
  onSave: (input: ModuleInput) => void;
}

/** @brief Text fields of the form (ECTS is handled separately). */
type TextKey =
  'name' | 'professor' | 'lecture_room' | 'lecture_time' | 'exercise_room' | 'exercise_time';

/**
 * @brief Converts an optional text field to its database value.
 * @param value Raw input.
 * @returns Trimmed text, or null when empty.
 */
const optional = (value: string) => value.trim() || null;

/**
 * @brief Pop-up for creating or editing a module. Only the name is required.
 * @details Mount with a fresh `key` per opening so the form starts from the given module.
 * @param props See ModuleSheetProps.
 * @returns The sheet.
 */
export function ModuleSheet({ open, module, onClose, onSave }: ModuleSheetProps) {
  const [fields, setFields] = useState<Record<TextKey, string>>({
    name: module?.name ?? '',
    professor: module?.professor ?? '',
    lecture_room: module?.lecture_room ?? '',
    lecture_time: module?.lecture_time ?? '',
    exercise_room: module?.exercise_room ?? '',
    exercise_time: module?.exercise_time ?? '',
  });
  const [ects, setEcts] = useState(
    module?.ects != null ? String(module.ects).replace('.', ',') : '',
  );

  const ectsErrorId = useId();
  const parsedEcts = parseEcts(ects);
  const ectsInvalid = parsedEcts === undefined;
  const valid = fields.name.trim() !== '' && !ectsInvalid;

  /**
   * @brief Builds props for one text field bound to the form state.
   * @param key Field key.
   * @param label Visible label.
   * @param placeholder Optional placeholder.
   * @returns TextField props.
   */
  const bind = (key: TextKey, label: string, placeholder?: string) => ({
    label,
    placeholder,
    value: fields[key],
    onChange: (event: { target: { value: string } }) =>
      setFields((current) => ({ ...current, [key]: event.target.value })),
  });

  /** @brief Validates and hands the form values to the caller. */
  function handleSubmit() {
    if (!valid || parsedEcts === undefined) return;
    onSave({
      name: fields.name.trim(),
      professor: optional(fields.professor),
      ects: parsedEcts,
      lecture_room: optional(fields.lecture_room),
      lecture_time: optional(fields.lecture_time),
      exercise_room: optional(fields.exercise_room),
      exercise_time: optional(fields.exercise_time),
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
      <div className="flex flex-col gap-4">
        <TextField
          {...bind('name', 'Modulname', 'z. B. Mathematik 1')}
          autoFocus={!module}
          required
        />
        <div className="grid grid-cols-[1fr_6rem] gap-3">
          <TextField {...bind('professor', 'Prof-Name')} autoComplete="off" />
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
          <p id={ectsErrorId} className="-mt-2 text-sm text-red-700">
            Bitte eine Zahl eingeben, z. B. 5 oder 7,5.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <TextField {...bind('lecture_room', 'Vorlesung: Raum')} />
          <TextField {...bind('lecture_time', 'Vorlesung: Uhrzeit', 'Di 10:00–11:30')} />
          <TextField {...bind('exercise_room', 'Übung: Raum')} />
          <TextField {...bind('exercise_time', 'Übung: Uhrzeit', 'Do 14:00–15:30')} />
        </div>
      </div>
    </Sheet>
  );
}
