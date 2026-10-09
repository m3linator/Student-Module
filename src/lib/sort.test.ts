import { describe, expect, it } from 'vitest';
import type { TaskRow } from '@/types/database';
import { sortCompletedTasks, sortOpenTasks } from './sort';

/**
 * @brief Builds a task row with sensible defaults.
 * @param overrides Fields to override.
 * @returns Task row.
 */
function task(overrides: Partial<TaskRow> & { id: string }): TaskRow {
  return {
    user_id: 'u',
    title: overrides.id,
    due_date: null,
    finish_day_before: true,
    module_id: null,
    completed_at: null,
    created_at: '2026-10-01T10:00:00Z',
    ...overrides,
  };
}

describe('sortOpenTasks', () => {
  const today = '2026-10-10';

  it('puts the fewest remaining days first and tasks without date last', () => {
    const tasks = [
      task({ id: 'no-date' }),
      task({ id: 'in-5', due_date: '2026-10-15', finish_day_before: false }),
      task({ id: 'overdue', due_date: '2026-10-08', finish_day_before: false }),
      task({ id: 'today', due_date: '2026-10-11', finish_day_before: true }),
    ];
    expect(sortOpenTasks(tasks, today).map((t) => t.id)).toEqual([
      'overdue',
      'today',
      'in-5',
      'no-date',
    ]);
  });

  it('takes the "evening before" switch into account', () => {
    const tasks = [
      task({ id: 'due-14-off', due_date: '2026-10-14', finish_day_before: false }), // 4
      task({ id: 'due-15-on', due_date: '2026-10-15', finish_day_before: true }), // 4
      task({ id: 'due-14-on', due_date: '2026-10-14', finish_day_before: true }), // 3
    ];
    expect(sortOpenTasks(tasks, today)[0]?.id).toBe('due-14-on');
  });

  it('breaks ties by creation time (oldest first)', () => {
    const tasks = [
      task({ id: 'newer', due_date: '2026-10-12', created_at: '2026-10-05T00:00:00Z' }),
      task({ id: 'older', due_date: '2026-10-12', created_at: '2026-10-01T00:00:00Z' }),
      task({ id: 'nd-newer', created_at: '2026-10-03T00:00:00Z' }),
      task({ id: 'nd-older', created_at: '2026-10-02T00:00:00Z' }),
    ];
    expect(sortOpenTasks(tasks, today).map((t) => t.id)).toEqual([
      'older',
      'newer',
      'nd-older',
      'nd-newer',
    ]);
  });

  it('does not mutate the input', () => {
    const tasks = [task({ id: 'b' }), task({ id: 'a', due_date: '2026-10-12' })];
    sortOpenTasks(tasks, today);
    expect(tasks.map((t) => t.id)).toEqual(['b', 'a']);
  });
});

describe('sortCompletedTasks', () => {
  it('shows the most recently completed first', () => {
    const tasks = [
      task({ id: 'first', completed_at: '2026-10-01T08:00:00Z' }),
      task({ id: 'last', completed_at: '2026-10-09T08:00:00Z' }),
      task({ id: 'middle', completed_at: '2026-10-05T08:00:00Z' }),
    ];
    expect(sortCompletedTasks(tasks).map((t) => t.id)).toEqual(['last', 'middle', 'first']);
  });
});
