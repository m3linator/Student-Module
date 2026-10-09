import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useToday } from './useToday';

/** @brief Renders the current day as text. */
function Probe() {
  return <p>{useToday()}</p>;
}

describe('useToday', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('switches to the next day right after Berlin midnight', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(new Date('2026-10-14T21:59:00Z')); // 23:59 CEST
    render(<Probe />);
    expect(screen.getByText('2026-10-14')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2 * 60 * 1000));
    expect(screen.getByText('2026-10-15')).toBeInTheDocument();
  });
});
