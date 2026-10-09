/**
 * @file fixtures.ts
 * @brief Row builders for component tests.
 */
import type { HabitRow, ModuleLinkRow, ModuleRow, TaskRow } from '@/types/database';

/**
 * @brief Builds a task row.
 * @param overrides Fields to override (id required).
 * @returns Task row.
 */
export function makeTask(overrides: Partial<TaskRow> & { id: string }): TaskRow {
  return {
    user_id: 'u',
    title: overrides.id,
    due_date: null,
    finish_day_before: true,
    module_id: null,
    completed_at: null,
    created_at: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * @brief Builds a module row.
 * @param overrides Fields to override (id required).
 * @returns Module row.
 */
export function makeModule(overrides: Partial<ModuleRow> & { id: string }): ModuleRow {
  return {
    user_id: 'u',
    name: overrides.id,
    professor: null,
    ects: null,
    lecture_room: null,
    lecture_time: null,
    exercise_room: null,
    exercise_time: null,
    notes: '',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * @brief Builds a link row.
 * @param overrides Fields to override (id and module_id required).
 * @returns Link row.
 */
export function makeLink(
  overrides: Partial<ModuleLinkRow> & { id: string; module_id: string },
): ModuleLinkRow {
  return {
    user_id: 'u',
    title: overrides.id,
    url: 'https://example.com',
    position: 0,
    created_at: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

/** @brief Default habit row. */
export const habit: HabitRow = {
  id: 'h1',
  user_id: 'u',
  name: 'Fokus',
  created_at: '2026-10-01T00:00:00Z',
};
