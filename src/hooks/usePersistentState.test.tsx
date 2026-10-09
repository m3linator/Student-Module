import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePersistentFlag } from './usePersistentState';

describe('usePersistentFlag', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('starts with the initial value and persists changes', () => {
    const { result } = renderHook(() => usePersistentFlag('k', false));
    expect(result.current[0]).toBe(false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem('k')).toBe('true');
  });

  it('restores a stored value', () => {
    localStorage.setItem('k', 'true');
    const { result } = renderHook(() => usePersistentFlag('k', false));
    expect(result.current[0]).toBe(true);
  });

  it('works without storage access', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => usePersistentFlag('k', false));
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
  });
});
