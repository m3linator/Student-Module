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
      <p className="animate-toast-in bg-elevated text-label-2 ring-separator flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] shadow-lg ring-1">
        <OfflineIcon className="text-label-3 size-4" />
        Offline – Änderungen werden erst mit Verbindung gespeichert
      </p>
    </div>
  );
}
