import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useVisualViewport } from './useVisualViewport';

/**
 * @brief Minimal fake of window.visualViewport.
 * @param height Initial visible height.
 * @param offsetTop Initial offset of the visible area.
 * @returns Fake viewport with a helper to change its size.
 */
function fakeViewport(height: number, offsetTop = 0) {
  const target = new EventTarget();
  const viewport = Object.assign(target, { height, offsetTop });
  vi.stubGlobal('visualViewport', viewport);
  return {
    change(nextHeight: number, nextOffset: number) {
      viewport.height = nextHeight;
      viewport.offsetTop = nextOffset;
      viewport.dispatchEvent(new Event('resize'));
    },
  };
}

describe('useVisualViewport', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports the visible area and follows the on-screen keyboard', () => {
    const viewport = fakeViewport(844);
    const { result } = renderHook(() => useVisualViewport(true));
    expect(result.current).toEqual({ height: 844, offsetTop: 0 });
    act(() => viewport.change(500, 120));
    expect(result.current).toEqual({ height: 500, offsetTop: 120 });
  });

  it('falls back to the window height without visualViewport', () => {
    vi.stubGlobal('visualViewport', undefined);
    const { result } = renderHook(() => useVisualViewport(true));
    expect(result.current).toEqual({ height: window.innerHeight, offsetTop: 0 });
  });
});
