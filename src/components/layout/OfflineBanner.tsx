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
      <p className="animate-toast-in flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm">
        <OfflineIcon className="size-4 text-gray-500" />
        Offline – Änderungen werden erst mit Verbindung gespeichert
      </p>
    </div>
  );
}
