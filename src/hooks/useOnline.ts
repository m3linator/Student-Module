import { useSyncExternalStore } from 'react';

/**
 * @brief Subscribes to browser connectivity changes.
 * @param listener Callback for online/offline events.
 * @returns Unsubscribe function.
 */
function subscribe(listener: () => void): () => void {
  window.addEventListener('online', listener);
  window.addEventListener('offline', listener);
  return () => {
    window.removeEventListener('online', listener);
    window.removeEventListener('offline', listener);
  };
}

/**
 * @brief Tracks whether the device currently has a network connection.
 * @returns True while online.
 */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, () => navigator.onLine);
}
