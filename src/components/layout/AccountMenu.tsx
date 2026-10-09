import { useEffect, useRef, useState } from 'react';
import { AccountIcon, LogoutIcon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';

/**
 * @brief Small account menu (icon button + dropdown) used in the mobile header.
 * @param props.onSignOut Called when "Abmelden" is chosen.
 * @returns The menu trigger and, when open, the dropdown.
 */
export function AccountMenu({ onSignOut }: { onSignOut: () => void }) {
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
        label="Konto"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <AccountIcon className="size-6" />
      </IconButton>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-30 mt-1 min-w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-[15px] hover:bg-gray-100"
          >
            <LogoutIcon className="size-5 text-gray-500" />
            Abmelden
          </button>
        </div>
      )}
    </div>
  );
}
