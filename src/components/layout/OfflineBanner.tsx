import { OfflineIcon } from '@/components/ui/icons';
import { useOnline } from '@/hooks/useOnline';

/**
 * @brief Subtle hint shown while the device is offline (the app needs a connection).
 * @returns The banner, or nothing while online.
 */
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)]"
    >
      <p className="flex animate-toast-in items-center gap-2 rounded-full bg-elevated px-3.5 py-2 text-[13px] text-label-2 shadow-lg ring-1 ring-separator">
        <OfflineIcon className="size-4 text-label-3" />
        Offline – Änderungen werden erst mit Verbindung gespeichert
      </p>
    </div>
  );
}
