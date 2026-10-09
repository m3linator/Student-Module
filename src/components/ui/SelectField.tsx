import { useId, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

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
      <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'min-h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white pr-9 pl-3 text-base text-gray-900 focus:border-gray-900 focus:outline-none',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
