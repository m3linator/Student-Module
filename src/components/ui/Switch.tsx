import { useId } from 'react';
import { cn } from '@/lib/cn';

/** @brief Props of Switch. */
export interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Optional helper text below the label. */
  description?: string;
}

/**
 * @brief iOS-style on/off switch with label and optional helper text.
 * @param props See SwitchProps.
 * @returns The switch row.
 */
export function Switch({ label, checked, onChange, description }: SwitchProps) {
  const labelId = useId();
  const descriptionId = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5 pt-2.5">
        <span id={labelId} className="text-[15px] text-gray-900">
          {label}
        </span>
        {description && (
          <span id={descriptionId} className="text-sm text-gray-500">
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={() => onChange(!checked)}
        className="flex min-h-11 shrink-0 items-center rounded-full"
      >
        <span
          className={cn(
            'relative h-7 w-12 rounded-full transition-colors duration-200',
            checked ? 'bg-gray-900' : 'bg-gray-300',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform duration-200',
              checked && 'translate-x-5',
            )}
          />
        </span>
      </button>
    </div>
  );
}
