import { describe, expect, it, vi } from 'vitest';
import type { HabitCheckRow, ModuleRow, TaskRow } from '@/types/database';
import { createDataStore, emptyTables, reduce, rowKey, type DataState } from './store';

const task: TaskRow = {
  id: 't1',
  user_id: 'u',
  title: 'Blatt 1',
  due_date: null,
  finish_day_before: true,
  module_id: 'm1',
  completed_at: null,
  created_at: '2026-10-01T00:00:00Z',
};

const module: ModuleRow = {
  id: 'm1',
  user_id: 'u',
  name: 'Mathe',
  professor: null,
  ects: 5,
  lectures: [],
  exercises: [],
  notes: '',
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

const check: HabitCheckRow = { habit_id: 'h1', user_id: 'u', date: '2026-10-10' };

const ready: DataState = reduce(
  { status: 'loading', tables: emptyTables() },
  {
    type: 'loaded',
    rows: { ...emptyRows(), tasks: [task], modules: [module], habit_checks: [check] },
  },
);

/** @brief Empty row arrays for every table. */
function emptyRows() {
  return { modules: [], module_links: [], tasks: [], habits: [], habit_checks: [] };
}

describe('rowKey', () => {
  it('uses the id for regular tables and habit_id|date for habit checks', () => {
    expect(rowKey('tasks', task)).toBe('t1');
    expect(rowKey('habit_checks', check)).toBe('h1|2026-10-10');
  });
});

describe('reduce', () => {
  it('indexes loaded rows and becomes ready', () => {
    expect(ready.status).toBe('ready');
    expect(ready.tables.tasks.t1).toEqual(task);
    expect(ready.tables.habit_checks['h1|2026-10-10']).toEqual(check);
  });

  it('upserts a new or changed row', () => {
    const next = reduce(ready, { type: 'upsert', table: 'tasks', row: { ...task, title: 'Neu' } });
    expect(next.tables.tasks.t1?.title).toBe('Neu');
    expect(next.tables.modules).toBe(ready.tables.modules); // untouched tables keep identity
  });

  it('removes rows and ignores unknown keys', () => {
    const next = reduce(ready, { type: 'remove', table: 'tasks', key: 't1' });
    expect(next.tables.tasks.t1).toBeUndefined();
    expect(reduce(next, { type: 'remove', table: 'tasks', key: 'nope' })).toBe(next);
  });

  it('applies batches in order', () => {
    const next = reduce(ready, {
      type: 'batch',
      actions: [
        { type: 'remove', table: 'modules', key: 'm1' },
        { type: 'upsert', table: 'tasks', row: { ...task, module_id: null } },
      ],
    });
    expect(next.tables.modules.m1).toBeUndefined();
    expect(next.tables.tasks.t1?.module_id).toBeNull();
  });

  it('can switch into the error state', () => {
    expect(reduce(ready, { type: 'failed' }).status).toBe('error');
  });
});

describe('createDataStore', () => {
  it('notifies subscribers on change only', () => {
    const store = createDataStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.dispatch({ type: 'remove', table: 'tasks', key: 'missing' });
    expect(listener).not.toHaveBeenCalled();
    store.dispatch({ type: 'upsert', table: 'tasks', row: task });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.dispatch({ type: 'remove', table: 'tasks', key: 't1' });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
