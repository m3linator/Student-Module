/**
 * @file useTimetable.ts
 * @brief Timetable events derived from the modules in the store.
 */
import { useMemo } from 'react';
import { buildTimetableEvents } from '@/lib/timetable';
import { useModules } from './useData';

/**
 * @brief All lectures and exercises of all modules as timetable events (realtime via the store).
 * @returns Loading flag and events.
 */
export function useTimetable() {
  const { loading, modules } = useModules();
  const events = useMemo(() => buildTimetableEvents(modules), [modules]);
  return { loading, events };
}
