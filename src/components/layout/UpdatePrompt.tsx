import { useRegisterSW } from 'virtual:pwa-register/react';

/** @brief Interval (ms) for polling the server for a new service worker. */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * @brief Registers the service worker and shows a banner once a new app version is available.
 * @details Installed web apps on iOS rarely re-check for updates on their own, so the worker is
 * polled hourly and every time the app comes back to the foreground.
 * @returns The update banner, or nothing while the app is up to date.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const check = () => void registration.update().catch(() => undefined);
      setInterval(check, UPDATE_CHECK_INTERVAL_MS);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)]"
    >
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white py-2 pr-2 pl-4 text-sm shadow-sm">
        <span>Neue Version verfügbar</span>
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className="min-h-11 rounded-lg bg-gray-900 px-4 font-medium text-white hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          Neu laden
        </button>
      </div>
    </div>
  );
}
