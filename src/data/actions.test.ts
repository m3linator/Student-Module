import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ModuleLinkRow, ModuleRow, TaskRow } from '@/types/database';
import { createActions } from './actions';
import { createDataStore, emptyTables, type DataStore } from './store';

/** @brief Every Supabase call as [table, method, ...args]. */
const calls: unknown[][] = [];
let nextError: unknown = null;

/**
 * @brief Creates a chainable, awaitable fake of the PostgREST query builder.
 * @param table Table name passed to from().
 * @returns Fake builder.
 */
function fakeBuilder(table: string) {
  const builder = {
    then(resolve: (value: { error: unknown }) => void) {
      resolve({ error: nextError });
    },
  } as Record<string, unknown>;
  for (const method of ['insert', 'update', 'delete', 'eq', 'select', 'upsert']) {
    builder[method] = (...args: unknown[]) => {
      calls.push([table, method, ...args]);
      return builder;
    };
  }
  return builder;
}

vi.mock('@/lib/supabase', () => ({
  supabase: { from: (table: string) => fakeBuilder(table) },
}));

const mod: ModuleRow = {
  id: 'm1',
  user_id: 'u',
  name: 'Mathe',
  professor: null,
  ects: 5,
  lecture_room: null,
  lecture_time: null,
  exercise_room: null,
  exercise_time: null,
  notes: 'Notiz',
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

const task: TaskRow = {
  id: 't1',
  user_id: 'u',
  title: 'Blatt 1',
  due_date: '2026-10-14',
  finish_day_before: true,
  module_id: 'm1',
  completed_at: null,
  created_at: '2026-10-01T00:00:00Z',
};

/**
 * @brief Builds a link row.
 * @param id Link id.
 * @param position Sort position.
 * @returns Link row.
 */
const link = (id: string, position: number): ModuleLinkRow => ({
  id,
  user_id: 'u',
  module_id: 'm1',
  title: id,
  url: 'https://example.com',
  position,
  created_at: '2026-10-01T00:00:00Z',
});

let store: DataStore;
let onError: ReturnType<typeof vi.fn<(message: string) => void>>;
let actions: ReturnType<typeof createActions>;

beforeEach(() => {
  calls.length = 0;
  nextError = null;
  store = createDataStore();
  store.dispatch({
    type: 'loaded',
    rows: {
      ...{ modules: [], module_links: [], tasks: [], habits: [], habit_checks: [] },
      modules: [mod],
      tasks: [task],
      module_links: [link('a', 0), link('b', 1), link('c', 2)],
    },
  });
  onError = vi.fn<(message: string) => void>();
  actions = createActions({ store, userId: 'u', onError });
});

describe('task actions', () => {
  it('adds a task optimistically with client id and timestamps', async () => {
    await actions.addTask({
      title: 'Neu',
      due_date: null,
      finish_day_before: true,
      module_id: null,
    });
    const added = Object.values(store.getState().tables.tasks).find((t) => t.title === 'Neu');
    expect(added?.user_id).toBe('u');
    expect(added?.completed_at).toBeNull();
    expect(calls[0]?.[0]).toBe('tasks');
    expect(calls[0]?.[1]).toBe('insert');
  });

  it('completes and restores a task', async () => {
    await actions.setTaskCompleted('t1', true);
    expect(store.getState().tables.tasks.t1?.completed_at).not.toBeNull();
    await actions.setTaskCompleted('t1', false);
    expect(store.getState().tables.tasks.t1?.completed_at).toBeNull();
  });

  it('rolls back a failed completion and reports an error', async () => {
    nextError = { message: 'boom' };
    expect(await actions.setTaskCompleted('t1', true)).toBe(false);
    expect(store.getState().tables.tasks.t1?.completed_at).toBeNull();
    expect(onError).toHaveBeenCalledWith('Die Aufgabe konnte nicht gespeichert werden.');
  });

  it('deletes and restores a task with the same id', async () => {
    await actions.deleteTask('t1');
    expect(store.getState().tables.tasks.t1).toBeUndefined();
    await actions.restoreDeletedTask(task);
    expect(store.getState().tables.tasks.t1).toEqual(task);
    expect(calls.at(-1)).toEqual(['tasks', 'insert', task]);
  });

  it('restores without module when the module was deleted meanwhile', async () => {
    await actions.deleteTask('t1');
    await actions.deleteModule('m1');
    await actions.restoreDeletedTask(task);
    expect(store.getState().tables.tasks.t1?.module_id).toBeNull();
  });
});

describe('module actions', () => {
  it('deletes a module with its links and keeps its tasks without module', async () => {
    await actions.deleteModule('m1');
    const { tables } = store.getState();
    expect(tables.modules.m1).toBeUndefined();
    expect(Object.keys(tables.module_links)).toHaveLength(0);
    expect(tables.tasks.t1?.module_id).toBeNull();
  });

  it('restores module, links and task references when deleting fails', async () => {
    nextError = { message: 'boom' };
    await actions.deleteModule('m1');
    const { tables } = store.getState();
    expect(tables.modules.m1).toEqual(mod);
    expect(Object.keys(tables.module_links)).toHaveLength(3);
    expect(tables.tasks.t1?.module_id).toBe('m1');
  });

  it('returns the new module id', async () => {
    const id = await actions.addModule({
      name: 'Physik',
      professor: null,
      ects: null,
      lecture_room: null,
      lecture_time: null,
      exercise_room: null,
      exercise_time: null,
    });
    expect(id && store.getState().tables.modules[id]?.name).toBe('Physik');
  });
});

describe('link actions', () => {
  it('appends new links at the end', async () => {
    await actions.addLink('m1', { title: 'Moodle', url: 'https://moodle.example' });
    const added = Object.values(store.getState().tables.module_links).find(
      (l) => l.title === 'Moodle',
    );
    expect(added?.position).toBe(3);
  });

  it('only updates links whose position changed', async () => {
    await actions.reorderLinks('m1', ['b', 'a', 'c']);
    const updates = calls.filter((call) => call[1] === 'update');
    expect(updates).toEqual([
      ['module_links', 'update', { position: 0 }],
      ['module_links', 'update', { position: 1 }],
    ]);
    expect(store.getState().tables.module_links.b?.position).toBe(0);
  });
});

describe('habit actions', () => {
  it('toggles a day on and off', async () => {
    await actions.toggleHabitCheck('h1', '2026-10-10');
    expect(store.getState().tables.habit_checks['h1|2026-10-10']).toBeDefined();
    await actions.toggleHabitCheck('h1', '2026-10-10');
    expect(store.getState().tables.habit_checks['h1|2026-10-10']).toBeUndefined();
    expect(calls.at(-3)?.[1]).toBe('delete');
  });

  it('ignores updates for unknown rows', async () => {
    expect(await actions.renameHabit('missing', 'x')).toBe(false);
    expect(emptyTables().habits).toEqual({});
  });
});
