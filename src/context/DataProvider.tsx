import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createActions, loadAllRows } from '@/data/actions';
import { subscribeToChanges } from '@/data/realtime';
import { createDataStore } from '@/data/store';
import { useToast } from '@/hooks/useToast';
import { toGermanMessage } from '@/lib/errors';
import { DataContext, type DataContextValue } from './data-context';

/** @brief After this long in the background, data is reloaded on return (sockets may be dead). */
const STALE_AFTER_MS = 30_000;

/**
 * @brief Loads all tables of the signed-in user, keeps them live via Realtime and provides the
 *        store plus actions.
 * @param props.userId Id of the signed-in user (new store per user).
 * @param props.children Subtree that may use the data hooks.
 * @returns Context provider wrapping the children.
 */
export function DataProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const { showError } = useToast();
  const [store] = useState(createDataStore);

  const actions = useMemo(
    () => createActions({ store, userId, onError: showError }),
    [store, userId, showError],
  );

  const reload = useCallback(async () => {
    try {
      store.dispatch({ type: 'loaded', rows: await loadAllRows() });
    } catch (error) {
      if (store.getState().status === 'loading') store.dispatch({ type: 'failed' });
      showError(toGermanMessage(error, 'Daten konnten nicht geladen werden.'));
    }
  }, [store, showError]);

  // Initial load + live updates.
  useEffect(() => {
    void reload();
    return subscribeToChanges({
      onAction: store.dispatch,
      onSubscribed: () => void reload(),
    });
  }, [reload, store]);

  // Catch up after the app was in the background or offline.
  useEffect(() => {
    let hiddenAt = 0;
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > STALE_AFTER_MS) void reload();
    };
    const handleOnline = () => void reload();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
    };
  }, [reload]);

  const value = useMemo<DataContextValue>(
    () => ({ store, actions, reload }),
    [store, actions, reload],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
