import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IconButton } from '@/components/ui/IconButton';

/** @brief Props of HeaderMenu. */
export interface HeaderMenuProps {
  /** Accessible name of the trigger button. */
  label: string;
  /** Icon shown on the trigger button. */
  icon: ReactNode;
  /** Menu content; receives a function that closes the menu. */
  children: (close: () => void) => ReactNode;
}

/**
 * @brief Small drop-down menu anchored to an icon button in the header.
 * @details Closes on a tap outside, on Escape and when an item calls `close`.
 * @param props See HeaderMenuProps.
 * @returns The trigger and, when open, the menu panel.
 */
export function HeaderMenu({ label, icon, children }: HeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {icon}
      </IconButton>
      {open && (
        <div
          role="menu"
          aria-label={label}
          className="absolute top-full right-0 z-30 mt-1 w-[19rem] animate-toast-in rounded-[14px] bg-elevated p-1.5 shadow-xl ring-1 ring-separator"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
