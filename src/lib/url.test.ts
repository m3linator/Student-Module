import { describe, expect, it } from 'vitest';
import { normalizeUrl } from './url';

describe('normalizeUrl', () => {
  it('adds https:// when the scheme is missing', () => {
    expect(normalizeUrl('moodle.h-brs.de')).toBe('https://moodle.h-brs.de');
    expect(normalizeUrl('  www.example.com/kurs?id=3 ')).toBe('https://www.example.com/kurs?id=3');
    expect(normalizeUrl('//example.com')).toBe('https://example.com');
  });

  it('keeps http, https and mailto links', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeUrl('HTTP://example.com/a')).toBe('HTTP://example.com/a');
    expect(normalizeUrl('mailto:prof@example.com')).toBe('mailto:prof@example.com');
  });

  it('rejects empty input, other schemes and invalid hosts', () => {
    expect(normalizeUrl('')).toBeNull();
    expect(normalizeUrl('   ')).toBeNull();
    expect(normalizeUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeUrl('data:text/html,hi')).toBeNull();
    expect(normalizeUrl('nur text')).toBeNull();
  });
});
