import { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';

/** @brief Props of HabitNameSheet. */
export interface HabitNameSheetProps {
  open: boolean;
  name: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

/**
 * @brief Pop-up for renaming the habit. Mount with a fresh `key` per opening.
 * @param props See HabitNameSheetProps.
 * @returns The sheet.
 */
export function HabitNameSheet({ open, name, onClose, onSave }: HabitNameSheetProps) {
  const [value, setValue] = useState(name);
  const trimmed = value.trim();
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Habit umbenennen"
      onSubmit={() => trimmed && onSave(trimmed)}
      submitDisabled={!trimmed}
    >
      <TextField
        label="Name"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoFocus
      />
    </Sheet>
  );
}
