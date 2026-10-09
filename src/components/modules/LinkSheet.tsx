import { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import type { LinkInput } from '@/data/actions';
import { normalizeUrl } from '@/lib/url';
import type { ModuleLinkRow } from '@/types/database';

/** @brief Props of LinkSheet. */
export interface LinkSheetProps {
  open: boolean;
  /** Link to edit, or null to add one. */
  link: ModuleLinkRow | null;
  onClose: () => void;
  onSave: (input: LinkInput) => void;
}

/**
 * @brief Pop-up asking for link name and URL; a missing `https://` is added automatically.
 * @details Mount with a fresh `key` per opening.
 * @param props See LinkSheetProps.
 * @returns The sheet.
 */
export function LinkSheet({ open, link, onClose, onSave }: LinkSheetProps) {
  const [title, setTitle] = useState(link?.title ?? '');
  const [url, setUrl] = useState(link?.url ?? '');
  const [touched, setTouched] = useState(false);

  const normalized = normalizeUrl(url);
  const urlInvalid = url.trim() !== '' && normalized === null;
  const valid = title.trim() !== '' && normalized !== null;

  /** @brief Validates and hands the normalised values to the caller. */
  function handleSubmit() {
    setTouched(true);
    if (!valid || !normalized) return;
    onSave({ title: title.trim(), url: normalized });
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={link ? 'Link bearbeiten' : 'Neuer Link'}
      onSubmit={handleSubmit}
      submitDisabled={!valid}
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="Name"
          placeholder="z. B. Moodle-Kurs"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus={!link}
          required
        />
        <TextField
          label="URL"
          type="url"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="moodle.h-brs.de/course/…"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={touched && urlInvalid}
          required
        />
        {touched && urlInvalid && (
          <p role="alert" className="-mt-2 text-sm text-red-700">
            Bitte eine gültige Adresse eingeben.
          </p>
        )}
      </div>
    </Sheet>
  );
}
