import { useCallback, useId } from 'react';
import { NOTES_SAVE_DEBOUNCE_MS } from '@/config/app';
import { useAutosaveDraft, type SaveStatus } from '@/hooks/useAutosaveDraft';
import { useActions } from '@/hooks/useData';
import { usePersistentFlag } from '@/hooks/usePersistentState';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { cn } from '@/lib/cn';
import type { ModuleRow } from '@/types/database';
import { MarkdownPreview } from './MarkdownPreview';

/** @brief Text of the small grey save indicator. */
const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Speichert…',
  saved: 'Gespeichert',
  error: 'Nicht gespeichert',
};

/** @brief Options of the edit/preview toggle. */
const VIEW_OPTIONS: readonly Segment<'edit' | 'preview'>[] = [
  { value: 'edit', label: 'Bearbeiten' },
  { value: 'preview', label: 'Vorschau' },
];

/**
 * @brief Markdown notes of a module with edit/preview toggle and autosave (~800 ms).
 * @param props.module Module whose notes are edited.
 * @returns The notes section, filling the remaining height.
 */
export function NotesSection({ module }: { module: ModuleRow }) {
  const actions = useActions();
  const [preview, setPreview] = usePersistentFlag('uni-app:notes-preview', false);
  const textareaId = useId();

  const save = useCallback(
    (notes: string) => actions.saveNotes(module.id, notes),
    [actions, module.id],
  );
  const { draft, status, onChange, onFocus, onBlur } = useAutosaveDraft(
    module.notes,
    save,
    NOTES_SAVE_DEBOUNCE_MS,
  );

  return (
    <section aria-label="Notizen" className="flex min-h-[60dvh] flex-1 flex-col gap-2.5 lg:min-h-0">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[22px] font-bold tracking-tight">
            <label htmlFor={textareaId}>Notizen</label>
          </h2>
          <span
            aria-live="polite"
            className={cn('text-[13px]', status === 'error' ? 'text-danger-ink' : 'text-label-2')}
          >
            {STATUS_TEXT[status]}
          </span>
        </div>
        <SegmentedControl
          label="Ansicht"
          options={VIEW_OPTIONS}
          value={preview ? 'preview' : 'edit'}
          onChange={(view) => setPreview(view === 'preview')}
        />
      </div>
      {preview ? (
        <div className="flex-1 overflow-y-auto card p-4">
          <MarkdownPreview source={draft} />
        </div>
      ) : (
        <textarea
          id={textareaId}
          value={draft}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={'# Überschrift\n- Stichpunkt\n- [ ] Aufgabe\n\n**fett**, [Link](https://…)'}
          spellCheck
          className="min-h-[50dvh] w-full flex-1 resize-none card p-4 text-base leading-relaxed text-label placeholder:text-label-2 focus:ring-2 focus:ring-link focus-visible:outline-none lg:min-h-0"
        />
      )}
    </section>
  );
}
