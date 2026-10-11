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
 * @brief iOS switch (green when on) with label and optional helper text.
 * @param props See SwitchProps.
 * @returns The switch row.
 */
export function Switch({ label, checked, onChange, description }: SwitchProps) {
  const labelId = useId();
  const descriptionId = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5 pt-2.5">
        <span id={labelId} className="text-label text-base">
          {label}
        </span>
        {description && (
          <span id={descriptionId} className="text-label-2 text-[13px]">
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
            'relative h-[31px] w-[51px] rounded-full transition-colors duration-200',
            checked ? 'bg-success' : 'bg-fill-strong',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)] transition-transform duration-200',
              checked && 'translate-x-5',
            )}
          />
        </span>
      </button>
    </div>
  );
}
