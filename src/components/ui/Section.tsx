import type { ReactNode } from 'react';
import { PlusIcon } from './icons';
import { IconButton } from './IconButton';

/** @brief Props of Section. */
export interface SectionProps {
  title: string;
  /** When set, a "+" button is shown next to the heading. */
  onAdd?: () => void;
  /** Accessible label of the "+" button. */
  addLabel?: string;
  /** Optional extra content on the right of the heading. */
  aside?: ReactNode;
  children: ReactNode;
}

/**
 * @brief Page section with a heading and an optional "+" action on the right.
 * @param props See SectionProps.
 * @returns The section.
 */
export function Section({ title, onAdd, addLabel, aside, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-2" aria-label={title}>
      <div className="flex min-h-11 items-center justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <div className="flex items-center gap-1">
          {aside}
          {onAdd && (
            <IconButton
              label={addLabel ?? `${title}: hinzufügen`}
              onClick={onAdd}
              className="-mr-2"
            >
              <PlusIcon className="size-6" />
            </IconButton>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
