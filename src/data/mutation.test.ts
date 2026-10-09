import { describe, expect, it, vi } from 'vitest';
import type { TaskRow } from '@/types/database';
import { allRequests, runMutation } from './mutation';
import { createDataStore } from './store';

const row: TaskRow = {
  id: 't1',
  user_id: 'u',
  title: 'Blatt 1',
  due_date: null,
  finish_day_before: true,
  module_id: null,
  completed_at: null,
  created_at: '2026-10-01T00:00:00Z',
};

describe('runMutation', () => {
  it('keeps the optimistic change on success', async () => {
    const store = createDataStore();
    const onError = vi.fn();
    const ok = await runMutation(store, onError, {
      apply: { type: 'upsert', table: 'tasks', row },
      rollback: { type: 'remove', table: 'tasks', key: 't1' },
      request: () => Promise.resolve({ error: null }),
      errorMessage: 'x',
    });
    expect(ok).toBe(true);
    expect(store.getState().tables.tasks.t1).toEqual(row);
    expect(onError).not.toHaveBeenCalled();
  });

  it('applies before the request resolves', () => {
    const store = createDataStore();
    void runMutation(store, vi.fn(), {
      apply: { type: 'upsert', table: 'tasks', row },
      rollback: { type: 'remove', table: 'tasks', key: 't1' },
      request: () => new Promise(() => undefined),
      errorMessage: 'x',
    });
    expect(store.getState().tables.tasks.t1).toBeDefined();
  });

  it('rolls back and reports a German message on error', async () => {
    const store = createDataStore();
    const onError = vi.fn();
    const ok = await runMutation(store, onError, {
      apply: { type: 'upsert', table: 'tasks', row },
      rollback: { type: 'remove', table: 'tasks', key: 't1' },
      request: () => Promise.resolve({ error: { message: 'boom' } }),
      errorMessage: 'Aufgabe konnte nicht gespeichert werden.',
    });
    expect(ok).toBe(false);
    expect(store.getState().tables.tasks.t1).toBeUndefined();
    expect(onError).toHaveBeenCalledWith('Aufgabe konnte nicht gespeichert werden.');
  });

  it('rolls back when the request throws (e.g. offline)', async () => {
    const store = createDataStore();
    const onError = vi.fn();
    await runMutation(store, onError, {
      apply: { type: 'upsert', table: 'tasks', row },
      rollback: { type: 'remove', table: 'tasks', key: 't1' },
      request: () => Promise.reject(new TypeError('Failed to fetch')),
      errorMessage: 'x',
    });
    expect(store.getState().tables.tasks.t1).toBeUndefined();
    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/Keine Verbindung/));
  });
});

describe('allRequests', () => {
  it('reports the first error', async () => {
    const result = await allRequests([
      Promise.resolve({ error: null }),
      Promise.resolve({ error: 'second' }),
      Promise.resolve({ error: 'third' }),
    ]);
    expect(result.error).toBe('second');
  });

  it('reports null when all succeed', async () => {
    expect((await allRequests([Promise.resolve({ error: null })])).error).toBeNull();
  });
});
