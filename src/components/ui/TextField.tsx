import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { FIELD_CONTROL, FIELD_LABEL } from './fieldStyles';

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
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={inputId} className={FIELD_LABEL}>
        {label}
      </label>
      <input id={inputId} className={cn(FIELD_CONTROL, className)} {...props} />
    </div>
  );
}
