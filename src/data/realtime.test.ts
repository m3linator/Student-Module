import { describe, expect, it } from 'vitest';
import type { TaskRow } from '@/types/database';
import { realtimeToAction } from './realtime';

const task: TaskRow = {
  id: 't1',
  user_id: 'u',
  title: 'Blatt 1',
  due_date: null,
  finish_day_before: true,
  module_id: null,
  completed_at: null,
  created_at: '2026-10-01T00:00:00Z',
};

describe('realtimeToAction', () => {
  it('upserts inserted and updated rows', () => {
    expect(realtimeToAction('tasks', { eventType: 'INSERT', new: task, old: {} })).toEqual({
      type: 'upsert',
      table: 'tasks',
      row: task,
    });
    expect(
      realtimeToAction('tasks', { eventType: 'UPDATE', new: { ...task, title: 'x' }, old: {} }),
    ).toEqual({ type: 'upsert', table: 'tasks', row: { ...task, title: 'x' } });
  });

  it('removes deleted rows by primary key (RLS only sends the key)', () => {
    expect(realtimeToAction('tasks', { eventType: 'DELETE', new: {}, old: { id: 't1' } })).toEqual({
      type: 'remove',
      table: 'tasks',
      key: 't1',
    });
    expect(
      realtimeToAction('habit_checks', {
        eventType: 'DELETE',
        new: {},
        old: { habit_id: 'h1', date: '2026-10-10' },
      }),
    ).toEqual({ type: 'remove', table: 'habit_checks', key: 'h1|2026-10-10' });
  });

  it('ignores deletes without a usable key', () => {
    expect(realtimeToAction('tasks', { eventType: 'DELETE', new: {}, old: {} })).toBeNull();
    expect(
      realtimeToAction('habit_checks', { eventType: 'DELETE', new: {}, old: { habit_id: 'h1' } }),
    ).toBeNull();
  });
});
