import { useCallback, useId } from 'react';
import { NOTES_SAVE_DEBOUNCE_MS } from '@/config/app';
import { useAutosaveDraft, type SaveStatus } from '@/hooks/useAutosaveDraft';
import { useActions } from '@/hooks/useData';
import { usePersistentFlag } from '@/hooks/usePersistentState';
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
    <section aria-label="Notizen" className="flex min-h-[60dvh] flex-1 flex-col gap-2 lg:min-h-0">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            <label htmlFor={textareaId}>Notizen</label>
          </h2>
          <span
            aria-live="polite"
            className={cn('text-sm', status === 'error' ? 'text-red-700' : 'text-gray-500')}
          >
            {STATUS_TEXT[status]}
          </span>
        </div>
        <div
          className="flex rounded-lg bg-gray-100 p-0.5 text-sm"
          role="group"
          aria-label="Ansicht"
        >
          {[
            { label: 'Bearbeiten', active: !preview, value: false },
            { label: 'Vorschau', active: preview, value: true },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={option.active}
              onClick={() => setPreview(option.value)}
              className={cn(
                'min-h-9 rounded-md px-3 transition-colors duration-150',
                option.active
                  ? 'bg-white font-medium text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {preview ? (
        <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 p-4">
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
          className="min-h-[50dvh] w-full flex-1 resize-none rounded-xl border border-gray-200 p-4 text-base leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none lg:min-h-0"
        />
      )}
    </section>
  );
}
