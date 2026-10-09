import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createActions, loadAllRows } from '@/data/actions';
import { createDataStore } from '@/data/store';
import { useToast } from '@/hooks/useToast';
import { toGermanMessage } from '@/lib/errors';
import { DataContext, type DataContextValue } from './data-context';

/**
 * @brief Loads all tables of the signed-in user and provides the store plus actions.
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

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<DataContextValue>(
    () => ({ store, actions, reload }),
    [store, actions, reload],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
