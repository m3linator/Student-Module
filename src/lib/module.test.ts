import { describe, expect, it } from 'vitest';
import { formatEcts, formatOpenCount, parseEcts } from './module';

describe('formatEcts', () => {
  it('formats with German decimal comma', () => {
    expect(formatEcts(5)).toBe('5 ECTS');
    expect(formatEcts(7.5)).toBe('7,5 ECTS');
  });
});

describe('parseEcts', () => {
  it('accepts comma or dot and empty input', () => {
    expect(parseEcts('5')).toBe(5);
    expect(parseEcts('7,5')).toBe(7.5);
    expect(parseEcts(' 2.5 ')).toBe(2.5);
    expect(parseEcts('')).toBeNull();
  });

  it('rejects negative or non-numeric input', () => {
    expect(parseEcts('-1')).toBeUndefined();
    expect(parseEcts('abc')).toBeUndefined();
  });
});

describe('formatOpenCount', () => {
  it('describes the number of open tasks', () => {
    expect(formatOpenCount(0)).toBe('Keine offen');
    expect(formatOpenCount(3)).toBe('3 offen');
  });
});
