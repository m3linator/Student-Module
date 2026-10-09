/**
 * @file useData.ts
 * @brief Hooks reading derived data from the store and exposing the actions.
 */
import { useContext, useMemo, useSyncExternalStore } from 'react';
import { DataContext, type DataContextValue } from '@/context/data-context';
import type { Actions } from '@/data/actions';
import {
  selectCheckedDates,
  selectCompletedTasks,
  selectHabit,
  selectLinks,
  selectModules,
  selectOpenCountByModule,
  selectOpenTasks,
} from '@/data/selectors';
import type { DataState } from '@/data/store';
import { useToday } from './useToday';

/**
 * @brief Accesses the data context.
 * @returns Store, actions and reload function.
 * @throws Error when used outside of a DataProvider.
 */
function useDataContext(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) throw new Error('Data hooks must be used inside <DataProvider>');
  return context;
}

/**
 * @brief Subscribes to the whole (immutable) store state.
 * @returns Current state; changes identity on every store update.
 */
export function useDataState(): DataState {
  const { store } = useDataContext();
  return useSyncExternalStore(store.subscribe, store.getState);
}

/**
 * @brief Returns all data actions (stable between renders).
 * @returns Action API.
 */
export function useActions(): Actions {
  return useDataContext().actions;
}

/**
 * @brief Returns the reload function (used after reconnects).
 * @returns Async reload function.
 */
export function useReload(): () => Promise<void> {
  return useDataContext().reload;
}

/**
 * @brief Open and completed tasks in display order.
 * @returns Loading flag plus both task lists.
 */
export function useTasks() {
  const { status, tables } = useDataState();
  const today = useToday();
  const open = useMemo(() => selectOpenTasks(tables, today), [tables, today]);
  const completed = useMemo(() => selectCompletedTasks(tables), [tables]);
  return { loading: status === 'loading', open, completed, today };
}

/**
 * @brief Modules with their open-task counts.
 * @returns Loading flag, sorted modules, lookup by id and open counts.
 */
export function useModules() {
  const { status, tables } = useDataState();
  const modules = useMemo(() => selectModules(tables), [tables]);
  const openCounts = useMemo(() => selectOpenCountByModule(tables), [tables]);
  return { loading: status === 'loading', modules, byId: tables.modules, openCounts };
}

/**
 * @brief One module with its links.
 * @param id Module id from the route.
 * @returns Loading flag, the module (undefined if missing) and its sorted links.
 */
export function useModule(id: string) {
  const { status, tables } = useDataState();
  const links = useMemo(() => selectLinks(tables, id), [tables, id]);
  return { loading: status === 'loading', module: tables.modules[id], links };
}

/**
 * @brief The single habit and its checked days.
 * @returns Loading flag, habit (null until created) and checked ISO dates.
 */
export function useHabit() {
  const { status, tables } = useDataState();
  const habit = useMemo(() => selectHabit(tables), [tables]);
  const checked = useMemo(
    () => (habit ? selectCheckedDates(tables, habit.id) : new Set<string>()),
    [tables, habit],
  );
  return { loading: status === 'loading', habit, checked };
}
