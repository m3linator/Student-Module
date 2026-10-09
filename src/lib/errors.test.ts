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

  it('recognises network failures in Chrome, Safari and Firefox', () => {
    expect(toGermanMessage(new TypeError('Failed to fetch'))).toMatch(/Keine Verbindung/);
    expect(toGermanMessage(new TypeError('Load failed'))).toMatch(/Keine Verbindung/);
    expect(
      toGermanMessage(new TypeError('NetworkError when attempting to fetch resource.')),
    ).toMatch(/Keine Verbindung/);
  });

  it('points to the configuration for an invalid API key', () => {
    expect(toGermanMessage({ message: 'Invalid API key' })).toMatch(/\.env/);
    expect(toGermanMessage({ code: 'bad_jwt', message: 'invalid JWT' })).not.toMatch(/\.env/);
  });

  it('recognises rate limits', () => {
    expect(toGermanMessage({ code: 'over_request_rate_limit' })).toMatch(/Zu viele Versuche/);
  });

  it('falls back to the generic or a custom message', () => {
    expect(toGermanMessage('weird')).toBe(GENERIC_ERROR);
    expect(toGermanMessage(null, 'Speichern fehlgeschlagen.')).toBe('Speichern fehlgeschlagen.');
  });
});
