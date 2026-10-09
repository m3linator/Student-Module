import {
  useContext,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent,
} from 'react';
import { cn } from '@/lib/cn';
import { leaveDuration } from '@/lib/motion';
import { SwipeContext } from './swipe-context';

/** @brief Width (px) of one action button. */
const ACTION_WIDTH = 64;
/** @brief Movement (px) before a gesture is classified as horizontal or vertical. */
const AXIS_LOCK_PX = 8;
/** @brief Accumulated trackpad deltaX (px) that opens or closes a row. */
const WHEEL_THRESHOLD = 40;

/** @brief Colour of an action button. */
export type SwipeTone = 'green' | 'red' | 'gray';

const TONE_CLASSES: Record<SwipeTone, string> = {
  green: 'bg-green-600 hover:bg-green-700',
  red: 'bg-red-600 hover:bg-red-700',
  gray: 'bg-gray-500 hover:bg-gray-600',
};

/** @brief One action revealed by swiping or hovering. */
export interface SwipeAction {
  label: string;
  icon: ReactNode;
  tone: SwipeTone;
  onClick: () => void;
  /** Collapse the row (≈200 ms) before running onClick – for complete/delete. */
  exit?: boolean;
}

/** @brief Props of SwipeRow. */
export interface SwipeRowProps {
  /** Unique id within the SwipeGroup. */
  id: string;
  /** Actions from left to right (the right-most is closest to the edge). */
  actions: SwipeAction[];
  /** Tap/click on the row content (e.g. open the edit pop-up). */
  onTap?: () => void;
  /** Accessible name of the row content button. */
  label: string;
  children: ReactNode;
}

/** @brief Internal gesture bookkeeping (no re-renders). */
interface Gesture {
  pointerId: number;
  startX: number;
  startY: number;
  base: number;
  axis: 'x' | 'y' | null;
}

/**
 * @brief List row with actions revealed by swiping left (touch, mouse drag, trackpad) or by
 *        hovering on desktop. Actions never run automatically – only a tap on a button does.
 * @param props See SwipeRowProps.
 * @returns The row.
 */
export function SwipeRow({ id, actions, onTap, label, children }: SwipeRowProps) {
  const group = useContext(SwipeContext);
  const [localOpenId, setLocalOpenId] = useState<string | null>(null);
  const openId = group ? group.openId : localOpenId;
  const setOpenId = group ? group.setOpenId : setLocalOpenId;

  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [exiting, setExiting] = useState(false);
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const wheel = useRef({ sum: 0, timer: 0 });

  const width = actions.length * ACTION_WIDTH;
  const open = openId === id;
  const offset = dragOffset ?? (open ? -width : 0);

  /**
   * @brief Starts tracking a potential swipe.
   * @param event Pointer down on the row content.
   */
  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      base: open ? -width : 0,
      axis: null,
    };
  }

  /**
   * @brief Follows the finger/mouse once the gesture is clearly horizontal.
   * @param event Pointer move.
   */
  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    if (!g || g.pointerId !== event.pointerId) return;
    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;
    if (g.axis === null) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (g.axis === 'x') event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (g.axis !== 'x') return;
    // Slight rubber band past the fully opened position.
    const raw = g.base + dx;
    setDragOffset(raw < -width ? -width + (raw + width) / 3 : Math.min(0, raw));
  }

  /**
   * @brief Snaps the row open or closed after a horizontal gesture.
   * @param event Pointer up/cancel.
   */
  function handlePointerEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    gesture.current = null;
    if (!g || g.pointerId !== event.pointerId || g.axis !== 'x' || dragOffset === null) {
      setDragOffset(null);
      return;
    }
    suppressClick.current = true;
    setOpenId(dragOffset < -width / 2 ? id : null);
    setDragOffset(null);
  }

  /** @brief Handles a tap: closes an open row, otherwise forwards to onTap. */
  function handleClick() {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (open) setOpenId(null);
    else onTap?.();
  }

  /**
   * @brief Two-finger horizontal trackpad swipe (Mac) opens/closes the row.
   * @param event Wheel event.
   */
  function handleWheel(event: WheelEvent<HTMLButtonElement>) {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    const state = wheel.current;
    state.sum += event.deltaX;
    window.clearTimeout(state.timer);
    state.timer = window.setTimeout(() => (state.sum = 0), 200);
    if (state.sum > WHEEL_THRESHOLD && !open) {
      state.sum = 0;
      setOpenId(id);
    } else if (state.sum < -WHEEL_THRESHOLD && open) {
      state.sum = 0;
      setOpenId(null);
    }
  }

  /**
   * @brief Runs an action, optionally after the collapse animation.
   * @param action Action to run.
   */
  function runAction(action: SwipeAction) {
    setOpenId(null);
    if (!action.exit) {
      action.onClick();
      return;
    }
    setExiting(true);
    window.setTimeout(action.onClick, leaveDuration());
  }

  return (
    <div
      data-swipe-id={id}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
        exiting ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]',
      )}
    >
      <div className="group relative overflow-hidden">
        <div
          data-open={open || dragOffset !== null}
          className="can-hover:opacity-0 can-hover:group-focus-within:z-20 can-hover:group-focus-within:opacity-100 can-hover:group-hover:z-20 can-hover:group-hover:opacity-100 can-hover:data-[open=true]:opacity-100 absolute inset-y-0 right-0 z-0 flex transition-opacity duration-150"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              aria-label={action.label}
              title={action.label}
              tabIndex={0}
              onClick={() => runAction(action)}
              style={{ width: ACTION_WIDTH }}
              className={cn(
                'flex h-full items-center justify-center text-white transition-colors duration-150',
                TONE_CLASSES[action.tone],
              )}
            >
              {action.icon}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label={label}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onWheel={handleWheel}
          onClick={handleClick}
          style={{ transform: `translateX(${offset}px)` }}
          className={cn(
            'can-hover:hover:bg-gray-50 relative z-10 block w-full touch-pan-y bg-white text-left select-none',
            dragOffset === null && 'transition-transform duration-200 ease-out',
          )}
        >
          {children}
        </button>
      </div>
    </div>
  );
}
