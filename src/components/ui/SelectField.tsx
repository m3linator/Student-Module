import { useId, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { FIELD_CONTROL, FIELD_LABEL } from './fieldStyles';

/** @brief Props of SelectField: native select props plus a visible label. */
export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

/**
 * @brief Labelled native dropdown (native picker on iOS, 16 px font against zoom).
 * @param props Label, options (children) and native select props.
 * @returns The rendered label + select pair.
 */
export function SelectField({ label, className, id, children, ...props }: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className={FIELD_LABEL}>
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className={cn(FIELD_CONTROL, 'appearance-none pr-9', className)}
          {...props}
        >
          {children}
        </select>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-label-3"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
