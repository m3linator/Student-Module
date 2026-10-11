import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** @brief One option of a SegmentedControl. */
export interface Segment<T extends string> {
  value: T;
  label: string;
  /** Optional icon shown before the label. */
  icon?: ReactNode;
}

/** @brief Props of SegmentedControl. */
export interface SegmentedControlProps<T extends string> {
  /** Accessible name of the group. */
  label: string;
  options: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Stretch to the full width with equal segments. */
  fullWidth?: boolean;
}

/**
 * @brief iOS segmented control (e.g. "Bearbeiten | Vorschau", "Hell | Dunkel | System").
 * @param props See SegmentedControlProps.
 * @returns Group of toggle buttons; the selected one is raised.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  fullWidth = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('bg-fill rounded-[9px] p-0.5 text-[13px]', fullWidth ? 'flex' : 'inline-flex')}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex min-h-8 items-center justify-center gap-1.5 rounded-[7px] px-3 font-medium transition duration-150',
              fullWidth && 'flex-1',
              active
                ? 'bg-segment text-label shadow-[0_3px_8px_rgb(0_0_0/0.12),0_1px_1px_rgb(0_0_0/0.04)]'
                : 'text-label hover:bg-fill',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
