/**
 * @file store.ts
 * @brief Minimal immutable in-memory store holding all synced tables.
 *
 * All changes – initial load, optimistic updates, rollbacks and Realtime events – go through the
 * pure `reduce` function, so the merge rules are testable without React or Supabase.
 */
import type { Database, TableName } from '@/types/database';

/** @brief Row type per table name. */
export type RowOf<T extends TableName> = Database['public']['Tables'][T]['Row'];

/** @brief Rows of every table, indexed by row key. */
export type Tables = { [T in TableName]: Record<string, RowOf<T>> };

/** @brief Row arrays of every table, as returned by the initial load. */
export type TableRows = { [T in TableName]: RowOf<T>[] };

/** @brief Complete store state. */
export interface DataState {
  status: 'loading' | 'ready' | 'error';
  tables: Tables;
}

/** @brief Inserts or replaces one row (discriminated per table for type safety). */
export type UpsertAction = {
  [T in TableName]: { type: 'upsert'; table: T; row: RowOf<T> };
}[TableName];

/** @brief Every change the store understands. */
export type DataAction =
  | { type: 'loaded'; rows: TableRows }
  | { type: 'failed' }
  | UpsertAction
  | { type: 'remove'; table: TableName; key: string }
  | { type: 'batch'; actions: DataAction[] };

/**
 * @brief Creates empty indexes for all tables.
 * @returns Tables object without rows.
 */
export function emptyTables(): Tables {
  return { modules: {}, module_links: {}, tasks: {}, habits: {}, habit_checks: {} };
}

/**
 * @brief Computes the unique key of a row.
 * @param table Table the row belongs to.
 * @param row The row.
 * @returns `id`, or `habit_id|date` for habit checks (composite primary key).
 */
export function rowKey<T extends TableName>(table: T, row: RowOf<T>): string {
  if (table === 'habit_checks') {
    const check = row as RowOf<'habit_checks'>;
    return `${check.habit_id}|${check.date}`;
  }
  return (row as { id: string }).id;
}

/**
 * @brief Builds a key → row index.
 * @param table Table name (for key computation).
 * @param rows Rows to index.
 * @returns Index object.
 */
function indexRows<T extends TableName>(table: T, rows: RowOf<T>[]): Record<string, RowOf<T>> {
  return Object.fromEntries(rows.map((row) => [rowKey(table, row), row]));
}

/**
 * @brief Pure reducer applying one action to the state.
 * @param state Current state (not mutated).
 * @param action Change to apply.
 * @returns New state, or the same object if nothing changed.
 */
export function reduce(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'loaded':
      return {
        status: 'ready',
        tables: {
          modules: indexRows('modules', action.rows.modules),
          module_links: indexRows('module_links', action.rows.module_links),
          tasks: indexRows('tasks', action.rows.tasks),
          habits: indexRows('habits', action.rows.habits),
          habit_checks: indexRows('habit_checks', action.rows.habit_checks),
        },
      };
    case 'failed':
      return { ...state, status: 'error' };
    case 'upsert': {
      const key = rowKey(action.table, action.row);
      return {
        ...state,
        tables: {
          ...state.tables,
          [action.table]: { ...state.tables[action.table], [key]: action.row },
        },
      };
    }
    case 'remove': {
      if (!(action.key in state.tables[action.table])) return state;
      const rest = Object.fromEntries(
        Object.entries(state.tables[action.table]).filter(([key]) => key !== action.key),
      );
      return { ...state, tables: { ...state.tables, [action.table]: rest } };
    }
    case 'batch':
      return action.actions.reduce(reduce, state);
  }
}

/** @brief Observable store wrapping `reduce`. */
export interface DataStore {
  getState: () => DataState;
  dispatch: (action: DataAction) => void;
  /** @returns Unsubscribe function. */
  subscribe: (listener: () => void) => () => void;
}

/**
 * @brief Creates a new store (one per signed-in session).
 * @returns Store in the loading state.
 */
export function createDataStore(): DataStore {
  let state: DataState = { status: 'loading', tables: emptyTables() };
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    dispatch(action) {
      const next = reduce(state, action);
      if (next === state) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
