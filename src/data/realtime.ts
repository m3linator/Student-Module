/**
 * @file realtime.ts
 * @brief Live sync: Supabase Realtime (postgres_changes) → store actions.
 */
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { TableName } from '@/types/database';
import type { DataAction, RowOf, UpsertAction } from './store';

/** @brief All tables that are kept in sync. */
export const SYNCED_TABLES: readonly TableName[] = [
  'modules',
  'module_links',
  'tasks',
  'habits',
  'habit_checks',
];

/** @brief Minimal shape of a postgres_changes payload used here. */
export interface ChangePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: object;
  old: object;
}

/**
 * @brief Converts one Realtime change into a store action.
 * @details With RLS enabled, DELETE events only carry the primary key – that is all we need.
 * @param table Table the change belongs to.
 * @param payload Realtime payload.
 * @returns Store action, or null if the payload cannot be applied.
 */
export function realtimeToAction(table: TableName, payload: ChangePayload): DataAction | null {
  if (payload.eventType !== 'DELETE') {
    return { type: 'upsert', table, row: payload.new as RowOf<typeof table> } as UpsertAction;
  }
  const old = payload.old as Record<string, unknown>;
  if (table === 'habit_checks') {
    const { habit_id: habitId, date } = old;
    return typeof habitId === 'string' && typeof date === 'string'
      ? { type: 'remove', table, key: `${habitId}|${date}` }
      : null;
  }
  return typeof old.id === 'string' ? { type: 'remove', table, key: old.id } : null;
}

/** @brief Callbacks of subscribeToChanges. */
export interface RealtimeHandlers {
  /** Receives every change as a store action. */
  onAction: (action: DataAction) => void;
  /**
   * Called whenever the channel is (re)subscribed. Changes made between the initial load (or a
   * connection loss) and this moment were not delivered, so the data should be reloaded.
   */
  onSubscribed: () => void;
}

/**
 * @brief Subscribes to changes of all synced tables of the signed-in user.
 * @details No row filter is used: RLS already restricts INSERT/UPDATE events to own rows, and
 * DELETE events cannot be filtered anyway.
 * @param handlers Change and reconnect callbacks.
 * @returns Unsubscribe function.
 */
export function subscribeToChanges({ onAction, onSubscribed }: RealtimeHandlers): () => void {
  let channel: RealtimeChannel = supabase.channel('db-changes');
  for (const table of SYNCED_TABLES) {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      const action = realtimeToAction(table, payload as ChangePayload);
      if (action) onAction(action);
    });
  }

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') onSubscribed();
  });

  return () => {
    void supabase.removeChannel(channel);
  };
}
