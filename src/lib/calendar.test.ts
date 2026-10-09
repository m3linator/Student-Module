import { describe, expect, it } from 'vitest';
import { buildMonthGrid, formatMonthYear, monthOf, shiftMonth, WEEKDAY_LABELS } from './calendar';

describe('buildMonthGrid', () => {
  it('starts weeks on Monday and pads with null', () => {
    // 1 Oct 2026 is a Thursday → three leading blanks (Mo, Di, Mi).
    const weeks = buildMonthGrid({ year: 2026, month: 10 });
    expect(weeks[0]).toEqual([
      null,
      null,
      null,
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
    expect(weeks.at(-1)).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      null,
    ]);
  });

  it('contains exactly the days of the month', () => {
    const days = (year: number, month: number) =>
      buildMonthGrid({ year, month }).flat().filter(Boolean).length;
    expect(days(2026, 2)).toBe(28);
    expect(days(2028, 2)).toBe(29);
    expect(days(2026, 4)).toBe(30);
    expect(days(2026, 12)).toBe(31);
  });

  it('always produces full weeks of seven', () => {
    for (let month = 1; month <= 12; month++) {
      buildMonthGrid({ year: 2026, month }).forEach((week) => expect(week).toHaveLength(7));
    }
  });

  it('handles a month starting on Monday without leading blanks', () => {
    // 1 Jun 2026 is a Monday.
    expect(buildMonthGrid({ year: 2026, month: 6 })[0]?.[0]).toBe('2026-06-01');
  });
});

describe('month helpers', () => {
  it('extracts the month of an ISO date', () => {
    expect(monthOf('2026-10-14')).toEqual({ year: 2026, month: 10 });
  });

  it('shifts months across year boundaries', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth({ year: 2026, month: 10 }, -13)).toEqual({ year: 2025, month: 9 });
  });

  it('formats month and year in German', () => {
    expect(formatMonthYear({ year: 2026, month: 10 })).toBe('Oktober 2026');
    expect(formatMonthYear({ year: 2027, month: 3 })).toBe('März 2027');
  });

  it('labels weekdays Monday first', () => {
    expect(WEEKDAY_LABELS).toEqual(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
  });
});
