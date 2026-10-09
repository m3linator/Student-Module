import { describe, expect, it } from 'vitest';
import { GENERIC_ERROR, toGermanMessage } from './errors';

describe('toGermanMessage', () => {
  it('recognises wrong credentials by code', () => {
    expect(toGermanMessage({ code: 'invalid_credentials', message: 'x' })).toBe(
      'E-Mail oder Passwort ist falsch.',
    );
  });

  it('recognises wrong credentials by message', () => {
    expect(toGermanMessage(new Error('Invalid login credentials'))).toBe(
      'E-Mail oder Passwort ist falsch.',
    );
  });

  it('recognises network failures', () => {
    expect(toGermanMessage(new TypeError('Failed to fetch'))).toMatch(/Keine Verbindung/);
  });

  it('recognises rate limits', () => {
    expect(toGermanMessage({ code: 'over_request_rate_limit' })).toMatch(/Zu viele Versuche/);
  });

  it('falls back to the generic or a custom message', () => {
    expect(toGermanMessage('weird')).toBe(GENERIC_ERROR);
    expect(toGermanMessage(null, 'Speichern fehlgeschlagen.')).toBe('Speichern fehlgeschlagen.');
  });
});
