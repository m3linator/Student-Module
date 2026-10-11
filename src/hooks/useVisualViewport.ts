import { useEffect, useState } from 'react';

/** @brief Size and position of the area actually visible on screen. */
export interface ViewportBox {
  /** Visible height in CSS pixels (shrinks while the iOS keyboard is open). */
  height: number;
  /** Distance of the visible area from the top of the layout viewport. */
  offsetTop: number;
}

/**
 * @brief Reads the current visual viewport (falls back to the window size).
 * @returns Visible height and top offset.
 */
function readViewport(): ViewportBox {
  const viewport = window.visualViewport;
  return viewport
    ? { height: viewport.height, offsetTop: viewport.offsetTop }
    : { height: window.innerHeight, offsetTop: 0 };
}

/**
 * @brief Tracks the visual viewport, i.e. the part of the page not covered by the keyboard.
 * @details iOS Safari does not shrink the layout when the keyboard opens – only the visual
 * viewport changes. Fixed overlays (bottom sheets) must follow it to stay above the keyboard.
 * @param active Only listen while true (e.g. while a sheet is open).
 * @returns Visible height and top offset in CSS pixels.
 */
export function useVisualViewport(active: boolean): ViewportBox {
  const [box, setBox] = useState<ViewportBox>(readViewport);

  useEffect(() => {
    if (!active) return;
    const viewport = window.visualViewport;
    const update = () => setBox(readViewport());
    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [active]);

  return box;
}
