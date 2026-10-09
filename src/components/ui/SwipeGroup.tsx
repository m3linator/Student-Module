import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { SwipeContext } from './swipe-context';

/** @brief How long (ms) a click following an outside tap is swallowed. */
const SWALLOW_CLICK_MS = 600;

/**
 * @brief Coordinates swipe rows: at most one open row; a tap anywhere else only closes it.
 * @param props.children Subtree containing SwipeRows.
 * @returns Context provider.
 */
export function SwipeGroup({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (openId === null) return;

    /**
     * @brief Closes the open row on a tap outside of it and swallows that tap's click,
     *        so tapping elsewhere does not also trigger e.g. the edit pop-up.
     * @param event Pointer event from anywhere in the document.
     */
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest(`[data-swipe-id="${CSS.escape(openId)}"]`)) return;
      setOpenId(null);
      const swallow = (click: MouseEvent) => {
        click.stopPropagation();
        click.preventDefault();
      };
      document.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(
        () => document.removeEventListener('click', swallow, { capture: true }),
        SWALLOW_CLICK_MS,
      );
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenId(null);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKey);
    };
  }, [openId]);

  const value = useMemo(() => ({ openId, setOpenId }), [openId]);
  return <SwipeContext.Provider value={value}>{children}</SwipeContext.Provider>;
}
