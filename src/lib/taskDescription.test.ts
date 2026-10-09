import { describe, expect, it } from 'vitest';
import type { TaskRow } from '@/types/database';
import { describeTask } from './taskDescription';

const task: TaskRow = {
  id: 't',
  user_id: 'u',
  title: 'Blatt 3',
  due_date: '2026-10-14',
  finish_day_before: true,
  module_id: 'm',
  completed_at: null,
  created_at: '2026-10-01T00:00:00Z',
};

describe('describeTask', () => {
  it('combines title, module, due date and remaining days', () => {
    expect(describeTask({ task, moduleName: 'Mathe', today: '2026-10-10' })).toBe(
      'Blatt 3, Mathe, Abgabe Mi, 14.10., noch 3 Tage',
    );
  });

  it('skips missing module and date', () => {
    expect(
      describeTask({
        task: { ...task, due_date: null },
        moduleName: undefined,
        today: '2026-10-10',
      }),
    ).toBe('Blatt 3, kein Abgabetag');
  });
});
