import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** @brief Props of IconButton; `label` becomes the accessible name. */
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  children: ReactNode;
}

/**
 * @brief Square icon-only button (44 px touch target, iOS blue by default) with an aria-label.
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
        'inline-flex size-11 shrink-0 items-center justify-center rounded-full text-link transition-colors duration-150 hover:bg-fill disabled:opacity-30',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
