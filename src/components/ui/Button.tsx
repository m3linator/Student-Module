import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** @brief Visual style of a Button. */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-400',
  secondary: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
  ghost: 'text-gray-700 hover:bg-gray-100',
};

/** @brief Props of Button: native button props plus a visual variant. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/**
 * @brief Text button with a 44 px minimum touch target.
 * @param props Native button props and the visual variant (default: primary).
 * @returns The rendered button.
 */
export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-[15px] font-medium transition-colors duration-150 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
