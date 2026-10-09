/**
 * @file data-context.ts
 * @brief React context object for the synced data store (kept separate for fast refresh).
 */
import { createContext } from 'react';
import type { Actions } from '@/data/actions';
import type { DataStore } from '@/data/store';

/** @brief Value exposed by the DataProvider. */
export interface DataContextValue {
  store: DataStore;
  actions: Actions;
  /** @brief Reloads all tables from Supabase. */
  reload: () => Promise<void>;
}

/** @brief Data context; null outside of a DataProvider. */
export const DataContext = createContext<DataContextValue | null>(null);
