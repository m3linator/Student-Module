import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAutosaveDraft } from './useAutosaveDraft';

describe('useAutosaveDraft', () => {
  let save: ReturnType<typeof vi.fn<(value: string) => Promise<boolean>>>;

  beforeEach(() => {
    vi.useFakeTimers();
    save = vi.fn<(value: string) => Promise<boolean>>(() => Promise.resolve(true));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * @brief Renders the hook with a controllable server value.
   * @param server Initial server value.
   */
  const setup = (server = 'alt') =>
    renderHook(({ value }) => useAutosaveDraft(value, save, 800), {
      initialProps: { value: server },
    });

  it('saves the latest text once after the debounce delay', async () => {
    const { result } = setup();
    act(() => result.current.onFocus());
    act(() => result.current.onChange('a'));
    act(() => result.current.onChange('ab'));
    expect(result.current.status).toBe('saving');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(799);
    });
    expect(save).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('ab');
    expect(result.current.status).toBe('saved');
  });

  it('saves immediately when the field is left', async () => {
    const { result } = setup();
    act(() => result.current.onFocus());
    act(() => result.current.onChange('neu'));
    await act(async () => {
      result.current.onBlur();
      await Promise.resolve();
    });
    expect(save).toHaveBeenCalledWith('neu');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('does not overwrite the text while the user is typing', () => {
    const { result, rerender } = setup();
    act(() => result.current.onFocus());
    act(() => result.current.onChange('mein Text'));
    rerender({ value: 'Text vom anderen Gerät' });
    expect(result.current.draft).toBe('mein Text');
  });

  it('keeps the focused, unchanged text until the field is left, then adopts the remote text', () => {
    const { result, rerender } = setup();
    act(() => result.current.onFocus());
    rerender({ value: 'remote' });
    expect(result.current.draft).toBe('alt');
    act(() => result.current.onBlur());
    expect(result.current.draft).toBe('remote');
  });

  it('adopts remote changes right away when not editing', () => {
    const { result, rerender } = setup();
    rerender({ value: 'remote' });
    expect(result.current.draft).toBe('remote');
  });

  it('reports failed saves', async () => {
    save.mockResolvedValueOnce(false);
    const { result } = setup();
    act(() => result.current.onChange('x'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    expect(result.current.status).toBe('error');
  });

  it('flushes pending text when the app goes to the background', async () => {
    const { result } = setup();
    act(() => result.current.onFocus());
    act(() => result.current.onChange('kurz vor dem Schließen'));
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
    });
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    expect(save).toHaveBeenCalledWith('kurz vor dem Schließen');
  });
});
