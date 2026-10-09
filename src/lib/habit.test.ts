import { describe, expect, it } from 'vitest';
import { currentStreak, formatStreak } from './habit';

describe('currentStreak', () => {
  const today = '2026-10-10';

  it('counts consecutive checked days ending today', () => {
    const checked = new Set(['2026-10-08', '2026-10-09', '2026-10-10']);
    expect(currentStreak(checked, today)).toBe(3);
  });

  it('keeps yesterday’s streak alive while today is not checked yet', () => {
    const checked = new Set(['2026-10-08', '2026-10-09']);
    expect(currentStreak(checked, today)).toBe(2);
  });

  it('breaks on a gap', () => {
    const checked = new Set(['2026-10-06', '2026-10-07', '2026-10-09', '2026-10-10']);
    expect(currentStreak(checked, today)).toBe(2);
    expect(currentStreak(new Set(['2026-10-08']), today)).toBe(0);
  });

  it('continues across month, year and DST boundaries', () => {
    const checked = new Set(['2026-12-30', '2026-12-31', '2027-01-01']);
    expect(currentStreak(checked, '2027-01-01')).toBe(3);
    const dst = new Set(['2026-10-24', '2026-10-25', '2026-10-26']);
    expect(currentStreak(dst, '2026-10-26')).toBe(3);
  });

  it('is 0 without checks', () => {
    expect(currentStreak(new Set(), today)).toBe(0);
  });
});

describe('formatStreak', () => {
  it.each([
    [0, 'Noch keine Serie'],
    [1, '🔥 1 Tag in Folge'],
    [12, '🔥 12 Tage in Folge'],
  ])('%s → %s', (streak, text) => {
    expect(formatStreak(streak)).toBe(text);
  });
});
