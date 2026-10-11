import { describe, expect, it } from 'vitest';
import type { ModuleLinkRow, ModuleRow, TaskRow } from '@/types/database';
import {
  selectCheckedDates,
  selectCompletedTasks,
  selectHabit,
  selectLinks,
  selectModules,
  selectOpenCountByModule,
  selectOpenTasks,
} from './selectors';
import { emptyTables, type Tables } from './store';

/**
 * @brief Builds a task row.
 * @param id Task id.
 * @param extra Overrides.
 * @returns Task row.
 */
const task = (id: string, extra: Partial<TaskRow> = {}): TaskRow => ({
  id,
  user_id: 'u',
  title: id,
  due_date: null,
  finish_day_before: true,
  module_id: null,
  completed_at: null,
  created_at: '2026-10-01T00:00:00Z',
  ...extra,
});

/**
 * @brief Builds a module row.
 * @param id Module id.
 * @param createdAt Creation timestamp.
 * @returns Module row.
 */
const mod = (id: string, createdAt: string): ModuleRow => ({
  id,
  user_id: 'u',
  name: id,
  professor: null,
  ects: null,
  lectures: [],
  exercises: [],
  notes: '',
  created_at: createdAt,
  updated_at: createdAt,
});

/**
 * @brief Builds a link row.
 * @param id Link id.
 * @param moduleId Owning module.
 * @param position Sort position.
 * @returns Link row.
 */
const link = (id: string, moduleId: string, position: number): ModuleLinkRow => ({
  id,
  user_id: 'u',
  module_id: moduleId,
  title: id,
  url: 'https://example.com',
  position,
  created_at: '2026-10-01T00:00:00Z',
});

const tables: Tables = {
  ...emptyTables(),
  tasks: {
    a: task('a', { due_date: '2026-10-20', module_id: 'm1' }),
    b: task('b', { due_date: '2026-10-12', module_id: 'm1' }),
    c: task('c', { completed_at: '2026-10-05T00:00:00Z', module_id: 'm1' }),
    d: task('d', { completed_at: '2026-10-08T00:00:00Z' }),
    e: task('e', { module_id: 'm2' }),
  },
  modules: { m2: mod('m2', '2026-10-02T00:00:00Z'), m1: mod('m1', '2026-10-01T00:00:00Z') },
  module_links: { l1: link('l1', 'm1', 1), l0: link('l0', 'm1', 0), lx: link('lx', 'm2', 0) },
  habits: {
    h2: { id: 'h2', user_id: 'u', name: 'B', created_at: '2026-10-02T00:00:00Z' },
    h1: { id: 'h1', user_id: 'u', name: 'Fokus', created_at: '2026-10-01T00:00:00Z' },
  },
  habit_checks: {
    'h1|2026-10-01': { habit_id: 'h1', user_id: 'u', date: '2026-10-01' },
    'h2|2026-10-02': { habit_id: 'h2', user_id: 'u', date: '2026-10-02' },
  },
};

describe('selectors', () => {
  it('splits open and completed tasks with their sort orders', () => {
    expect(selectOpenTasks(tables, '2026-10-10').map((t) => t.id)).toEqual(['b', 'a', 'e']);
    expect(selectCompletedTasks(tables).map((t) => t.id)).toEqual(['d', 'c']);
  });

  it('orders modules by creation time', () => {
    expect(selectModules(tables).map((m) => m.id)).toEqual(['m1', 'm2']);
  });

  it('counts only open tasks per module', () => {
    const counts = selectOpenCountByModule(tables);
    expect(counts.get('m1')).toBe(2);
    expect(counts.get('m2')).toBe(1);
  });

  it('returns the links of one module by position', () => {
    expect(selectLinks(tables, 'm1').map((l) => l.id)).toEqual(['l0', 'l1']);
  });

  it('picks the oldest habit and its checked days', () => {
    expect(selectHabit(tables)?.id).toBe('h1');
    expect([...selectCheckedDates(tables, 'h1')]).toEqual(['2026-10-01']);
    expect(selectHabit(emptyTables())).toBeNull();
  });
});
