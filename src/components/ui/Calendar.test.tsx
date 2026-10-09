import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from './Calendar';

describe('Calendar', () => {
  it('shows the month of the selected day and marks it', () => {
    render(<Calendar value="2026-11-03" onChange={vi.fn()} today="2026-10-10" />);
    expect(screen.getByText('November 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /, 3\. November 2026/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('marks today and picks a day', async () => {
    const onChange = vi.fn();
    render(<Calendar value={null} onChange={onChange} today="2026-10-10" />);
    expect(screen.getByRole('button', { name: /, 10\. Oktober 2026/ })).toHaveAttribute(
      'aria-current',
      'date',
    );
    await userEvent.click(screen.getByRole('button', { name: /, 14\. Oktober 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-10-14');
  });

  it('navigates months with the arrow buttons', async () => {
    render(<Calendar value={null} onChange={vi.fn()} today="2026-12-10" />);
    await userEvent.click(screen.getByRole('button', { name: 'Nächster Monat' }));
    expect(screen.getByText('Januar 2027')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Vorheriger Monat' }));
    await userEvent.click(screen.getByRole('button', { name: 'Vorheriger Monat' }));
    expect(screen.getByText('November 2026')).toBeInTheDocument();
  });

  it('moves keyboard focus with the arrow keys across months', () => {
    render(<Calendar value="2026-10-31" onChange={vi.fn()} today="2026-10-10" />);
    fireEvent.keyDown(screen.getByRole('button', { name: /, 31\. Oktober/ }), {
      key: 'ArrowRight',
    });
    expect(screen.getByText('November 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /, 1\. November/ })).toHaveFocus();
  });
});
