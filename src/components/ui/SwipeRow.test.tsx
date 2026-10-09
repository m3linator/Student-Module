import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SwipeGroup } from './SwipeGroup';
import { SwipeRow, type SwipeAction } from './SwipeRow';

/**
 * @brief Renders two rows inside one group.
 * @param actions Actions for the first row.
 * @param onTap Tap handler for the first row.
 */
function renderRows(actions: SwipeAction[], onTap = vi.fn()) {
  render(
    <SwipeGroup>
      <SwipeRow id="a" label="Zeile A" actions={actions} onTap={onTap}>
        A
      </SwipeRow>
      <SwipeRow id="b" label="Zeile B" actions={actions}>
        B
      </SwipeRow>
      <button type="button">Woanders</button>
    </SwipeGroup>,
  );
  return { onTap };
}

/**
 * @brief Simulates a horizontal swipe on a row.
 * @param element Row content button.
 * @param dx Horizontal distance (negative = to the left).
 */
function swipe(element: HTMLElement, dx: number) {
  fireEvent.pointerDown(element, { pointerId: 1, clientX: 200, clientY: 10, button: 0 });
  fireEvent.pointerMove(element, { pointerId: 1, clientX: 200 + dx / 2, clientY: 10 });
  fireEvent.pointerMove(element, { pointerId: 1, clientX: 200 + dx, clientY: 10 });
  fireEvent.pointerUp(element, { pointerId: 1, clientX: 200 + dx, clientY: 10 });
  fireEvent.click(element);
}

const translateOf = (name: string) =>
  (screen.getByRole('button', { name }).parentElement as HTMLElement).style.transform;

describe('SwipeRow', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const makeActions = () => [
    { label: 'Löschen', icon: 'x', tone: 'red' as const, onClick: vi.fn() },
    { label: 'Erledigt', icon: '✓', tone: 'green' as const, onClick: vi.fn(), exit: true },
  ];

  it('forwards a plain tap', () => {
    const { onTap } = renderRows(makeActions());
    fireEvent.click(screen.getByRole('button', { name: 'Zeile A' }));
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it('opens on a left swipe without running an action or the tap handler', () => {
    const actions = makeActions();
    const { onTap } = renderRows(actions);
    swipe(screen.getByRole('button', { name: 'Zeile A' }), -120);
    expect(translateOf('Zeile A')).toBe('translateX(-128px)');
    expect(onTap).not.toHaveBeenCalled();
    actions.forEach((action) => expect(action.onClick).not.toHaveBeenCalled());
  });

  it('snaps back after a short swipe', () => {
    renderRows(makeActions());
    swipe(screen.getByRole('button', { name: 'Zeile A' }), -30);
    expect(translateOf('Zeile A')).toBe('translateX(0px)');
  });

  it('keeps only one row open at a time', () => {
    renderRows(makeActions());
    swipe(screen.getByRole('button', { name: 'Zeile A' }), -120);
    swipe(screen.getByRole('button', { name: 'Zeile B' }), -120);
    expect(translateOf('Zeile A')).toBe('translateX(0px)');
    expect(translateOf('Zeile B')).toBe('translateX(-128px)');
  });

  it('closes on a tap elsewhere without triggering that tap', () => {
    const { onTap } = renderRows(makeActions());
    swipe(screen.getByRole('button', { name: 'Zeile B' }), -120);
    const rowA = screen.getByRole('button', { name: 'Zeile A' });
    fireEvent.pointerDown(rowA);
    fireEvent.click(rowA);
    expect(translateOf('Zeile B')).toBe('translateX(0px)');
    expect(onTap).not.toHaveBeenCalled();
  });

  it('ignores vertical scroll gestures', () => {
    renderRows(makeActions());
    const row = screen.getByRole('button', { name: 'Zeile A' });
    fireEvent.pointerDown(row, { pointerId: 1, clientX: 200, clientY: 10 });
    fireEvent.pointerMove(row, { pointerId: 1, clientX: 190, clientY: 80 });
    fireEvent.pointerUp(row, { pointerId: 1, clientX: 100, clientY: 80 });
    expect(translateOf('Zeile A')).toBe('translateX(0px)');
  });

  it('runs exit actions after the collapse animation', () => {
    vi.useFakeTimers();
    const actions = makeActions();
    renderRows(actions);
    fireEvent.click(screen.getAllByRole('button', { name: 'Erledigt' })[0] as HTMLElement);
    expect(actions[1]?.onClick).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(250));
    expect(actions[1]?.onClick).toHaveBeenCalledTimes(1);
  });

  it('runs non-exit actions immediately', () => {
    const actions = makeActions();
    renderRows(actions);
    fireEvent.click(screen.getAllByRole('button', { name: 'Löschen' })[0] as HTMLElement);
    expect(actions[0]?.onClick).toHaveBeenCalledTimes(1);
  });

  it('opens with a horizontal trackpad swipe', () => {
    renderRows(makeActions());
    const row = screen.getByRole('button', { name: 'Zeile A' });
    fireEvent.wheel(row, { deltaX: 30, deltaY: 2 });
    fireEvent.wheel(row, { deltaX: 30, deltaY: 1 });
    expect(translateOf('Zeile A')).toBe('translateX(-128px)');
    fireEvent.wheel(row, { deltaX: -50, deltaY: 0 });
    expect(translateOf('Zeile A')).toBe('translateX(0px)');
  });
});

describe('SwipeRow as link', () => {
  it('renders a safe external link and blocks navigation right after a swipe', () => {
    render(
      <SwipeRow id="l" label="Moodle" href="https://moodle.example" actions={[]}>
        Moodle
      </SwipeRow>,
    );
    const link = screen.getByRole('link', { name: 'Moodle' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    fireEvent.pointerDown(link, { pointerId: 1, clientX: 200, clientY: 10, button: 0 });
    fireEvent.pointerMove(link, { pointerId: 1, clientX: 150, clientY: 10 });
    fireEvent.pointerUp(link, { pointerId: 1, clientX: 150, clientY: 10 });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
  });
});
