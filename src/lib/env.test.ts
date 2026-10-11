import { describe, expect, it } from 'vitest';
import { isValidSupabaseKey, isValidSupabaseUrl } from './env';

describe('isValidSupabaseUrl', () => {
  it('accepts project URLs', () => {
    expect(isValidSupabaseUrl('https://abcd1234.supabase.co')).toBe(true);
    expect(isValidSupabaseUrl('http://127.0.0.1:54321')).toBe(true);
  });

  it('rejects missing or wrong values', () => {
    expect(isValidSupabaseUrl(undefined)).toBe(false);
    expect(isValidSupabaseUrl('')).toBe(false);
    expect(isValidSupabaseUrl('deine Project URL aus Schritt 1.6')).toBe(false);
    expect(isValidSupabaseUrl('abcd1234.supabase.co')).toBe(false);
    expect(isValidSupabaseUrl('https://abcd1234.supabase.co/rest/v1/')).toBe(false);
    expect(isValidSupabaseUrl('https://abcd1234.supabase.co/')).toBe(false);
    expect(isValidSupabaseUrl(' https://abcd1234.supabase.co')).toBe(false);
    expect(isValidSupabaseUrl('"https://abcd1234.supabase.co"')).toBe(false);
  });
});

describe('isValidSupabaseKey', () => {
  it('accepts publishable keys and legacy anon keys', () => {
    expect(isValidSupabaseKey('sb_publishable_abc123')).toBe(true);
    expect(isValidSupabaseKey('eyJhbGciOiJIUzI1NiJ9.e30.sig')).toBe(true);
  });

  it('rejects missing or wrong values', () => {
    expect(isValidSupabaseKey(undefined)).toBe(false);
    expect(isValidSupabaseKey('dein Publishable/anon Key aus Schritt 1.6')).toBe(false);
    expect(isValidSupabaseKey('sb_publishable_abc 123')).toBe(false);
  });
});
