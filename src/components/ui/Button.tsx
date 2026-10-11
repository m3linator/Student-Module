import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** @brief Visual style of a Button. */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:brightness-110 active:brightness-95',
  secondary: 'bg-fill text-link hover:bg-fill-strong',
  danger: 'bg-danger-solid text-white hover:brightness-110 active:brightness-95',
  ghost: 'text-link hover:bg-fill',
};

/** @brief Props of Button: native button props plus a visual variant. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/**
 * @brief iOS-style text button with a 44 px minimum touch target.
 * @param props Native button props and the visual variant (default: primary).
 * @returns The rendered button.
 */
export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-base font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
