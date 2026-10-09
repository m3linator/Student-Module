import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** @brief Props of IconButton; `label` becomes the accessible name. */
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  children: ReactNode;
}

/**
 * @brief Square icon-only button with a 44 px touch target and an aria-label.
 * @param props Accessible label, icon and native button props.
 * @returns The rendered button.
 */
export function IconButton({
  label,
  className,
  type = 'button',
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-gray-700 transition-colors duration-150 hover:bg-gray-100 disabled:opacity-40',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
