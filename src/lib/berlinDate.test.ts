import { describe, expect, it } from 'vitest';
import { msUntilNextBerlinMidnight, todayInBerlin } from './berlinDate';

describe('todayInBerlin', () => {
  it('uses the Berlin calendar day, not UTC', () => {
    // 22:30 UTC on 14 Oct = 00:30 CEST on 15 Oct.
    expect(todayInBerlin(new Date('2026-10-14T22:30:00Z'))).toBe('2026-10-15');
    expect(todayInBerlin(new Date('2026-10-14T21:30:00Z'))).toBe('2026-10-14');
  });

  it('handles the switch to winter time (last Sunday in October)', () => {
    // 25 Oct 2026, clocks go back at 03:00 CEST → 02:00 CET.
    expect(todayInBerlin(new Date('2026-10-25T22:30:00Z'))).toBe('2026-10-25'); // 23:30 CET
    expect(todayInBerlin(new Date('2026-10-25T23:00:00Z'))).toBe('2026-10-26'); // 00:00 CET
  });

  it('handles the switch to summer time (last Sunday in March)', () => {
    // 29 Mar 2026, clocks go forward at 02:00 CET → 03:00 CEST.
    expect(todayInBerlin(new Date('2026-03-28T23:00:00Z'))).toBe('2026-03-29'); // 00:00 CET
    expect(todayInBerlin(new Date('2026-03-29T21:59:00Z'))).toBe('2026-03-29'); // 23:59 CEST
    expect(todayInBerlin(new Date('2026-03-29T22:00:00Z'))).toBe('2026-03-30'); // 00:00 CEST
  });
});

describe('msUntilNextBerlinMidnight', () => {
  const HOUR = 60 * 60 * 1000;

  it('counts down to the next Berlin midnight', () => {
    // 23:00 CEST → 1 hour left.
    expect(msUntilNextBerlinMidnight(new Date('2026-10-14T21:00:00Z'))).toBe(HOUR);
  });

  it('accounts for the 25-hour day in October', () => {
    // 00:00 CEST on 25 Oct → next midnight is 25 real hours later.
    expect(msUntilNextBerlinMidnight(new Date('2026-10-24T22:00:00Z'))).toBe(25 * HOUR);
  });

  it('accounts for the 23-hour day in March', () => {
    // 00:00 CET on 29 Mar → next midnight is 23 real hours later.
    expect(msUntilNextBerlinMidnight(new Date('2026-03-28T23:00:00Z'))).toBe(23 * HOUR);
  });
});
