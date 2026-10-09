import { describe, expect, it } from 'vitest';
import {
  describeRemaining,
  formatDueDate,
  formatDueDateLong,
  formatRemaining,
  getDeadline,
  getRemainingDays,
  isUrgent,
} from './deadline';

describe('getDeadline', () => {
  it('is the day before the due date when "finish the evening before" is on', () => {
    expect(getDeadline('2026-10-14', true)).toBe('2026-10-13');
  });

  it('is the due date itself when the switch is off', () => {
    expect(getDeadline('2026-10-14', false)).toBe('2026-10-14');
  });

  it('crosses month and year boundaries', () => {
    expect(getDeadline('2026-11-01', true)).toBe('2026-10-31');
    expect(getDeadline('2027-01-01', true)).toBe('2026-12-31');
    expect(getDeadline('2028-03-01', true)).toBe('2028-02-29'); // leap year
  });

  it('is not affected by the DST switch', () => {
    expect(getDeadline('2026-10-26', true)).toBe('2026-10-25');
    expect(getDeadline('2026-03-30', true)).toBe('2026-03-29');
  });
});

describe('getRemainingDays', () => {
  const today = '2026-10-10'; // Saturday

  it('returns null without a due date', () => {
    expect(getRemainingDays(null, true, today)).toBeNull();
  });

  it('counts calendar days to the deadline (evening before on)', () => {
    // Due Wed 14 Oct, finish by Tue 13 Oct → 3 days.
    expect(getRemainingDays('2026-10-14', true, today)).toBe(3);
  });

  it('counts calendar days to the due date (evening before off)', () => {
    expect(getRemainingDays('2026-10-14', false, today)).toBe(4);
  });

  it('is 0 on the deadline day', () => {
    expect(getRemainingDays('2026-10-11', true, today)).toBe(0);
    expect(getRemainingDays('2026-10-10', false, today)).toBe(0);
  });

  it('is negative when overdue', () => {
    expect(getRemainingDays('2026-10-10', true, today)).toBe(-1);
    expect(getRemainingDays('2026-10-01', false, today)).toBe(-9);
  });

  it('works across month and year boundaries', () => {
    expect(getRemainingDays('2026-11-02', false, '2026-10-30')).toBe(3);
    expect(getRemainingDays('2027-01-02', true, '2026-12-30')).toBe(2);
  });

  it('counts whole days across the October DST switch', () => {
    // 25 Oct 2026 has 25 hours – still one calendar day.
    expect(getRemainingDays('2026-10-27', false, '2026-10-24')).toBe(3);
    expect(getRemainingDays('2026-10-26', true, '2026-10-25')).toBe(0);
  });

  it('counts whole days across the March DST switch', () => {
    // 29 Mar 2026 has 23 hours – still one calendar day.
    expect(getRemainingDays('2026-03-31', false, '2026-03-28')).toBe(3);
    expect(getRemainingDays('2026-03-30', false, '2026-03-29')).toBe(1);
  });
});

describe('formatRemaining', () => {
  it.each([
    [null, '–'],
    [-3, '−3'],
    [-1, '−1'],
    [0, 'Heute'],
    [1, '1 Tag'],
    [2, '2 Tage'],
    [14, '14 Tage'],
  ])('formats %s as "%s"', (remaining, expected) => {
    expect(formatRemaining(remaining)).toBe(expected);
  });
});

describe('isUrgent', () => {
  it.each([
    [null, false],
    [-5, true],
    [0, true],
    [1, true],
    [2, true],
    [3, false],
  ])('%s → %s', (remaining, expected) => {
    expect(isUrgent(remaining)).toBe(expected);
  });
});

describe('formatDueDate', () => {
  it('formats as short German weekday and day.month.', () => {
    expect(formatDueDate('2026-10-14')).toBe('Mi, 14.10.');
    expect(formatDueDate('2027-01-03')).toBe('So, 03.01.');
  });
});

describe('formatDueDateLong', () => {
  it('includes the year', () => {
    expect(formatDueDateLong('2026-10-14')).toBe('Mi, 14.10.2026');
  });
});

describe('describeRemaining', () => {
  it.each([
    [null, 'kein Abgabetag'],
    [-1, '1 Tag überfällig'],
    [-4, '4 Tage überfällig'],
    [0, 'heute fällig'],
    [1, 'noch 1 Tag'],
    [5, 'noch 5 Tage'],
  ])('describes %s as "%s"', (remaining, expected) => {
    expect(describeRemaining(remaining)).toBe(expected);
  });
});
