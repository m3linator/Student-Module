import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** @brief Props of TextField: native input props plus a visible label. */
export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/**
 * @brief Labelled single-line input (16 px font so iOS does not zoom on focus).
 * @param props Label and native input props.
 * @returns The rendered label + input pair.
 */
export function TextField({ label, className, id, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          'min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none',
          className,
        )}
        {...props}
      />
    </div>
  );
}
