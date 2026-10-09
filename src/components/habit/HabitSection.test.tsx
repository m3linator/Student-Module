import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { habit } from '@/test/fixtures';
import { renderWithData } from '@/test/renderWithData';
import { HabitSection } from './HabitSection';

vi.mock('@/hooks/useToday', () => ({ useToday: () => '2026-10-10' }));

const rows = {
  habits: [habit],
  habit_checks: ['2026-10-08', '2026-10-09', '2026-10-10', '2026-09-30'].map((date) => ({
    habit_id: 'h1',
    user_id: 'u',
    date,
  })),
};

describe('HabitSection', () => {
  it('shows the habit name, month and streak', () => {
    renderWithData(<HabitSection />, rows);
    expect(screen.getByRole('button', { name: 'Habit „Fokus“ umbenennen' })).toBeInTheDocument();
    expect(screen.getByText('Oktober 2026')).toBeInTheDocument();
    expect(screen.getByText('🔥 3 Tage in Folge')).toBeInTheDocument();
  });

  it('renders one square per day of the month without day numbers', () => {
    renderWithData(<HabitSection />, rows);
    const days = screen.getAllByRole('button', { name: /Oktober/ });
    expect(days).toHaveLength(31);
    days.forEach((day) => expect(day).toBeEmptyDOMElement());
  });

  it('marks today, checked and future days', () => {
    renderWithData(<HabitSection />, rows);
    const today = screen.getByRole('button', { name: /10\. Oktober \(heute\)/ });
    expect(today).toHaveAttribute('aria-current', 'date');
    expect(today).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /, 1\. Oktober/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: /11\. Oktober/ })).toBeDisabled();
  });

  it('toggles a past day', async () => {
    const { actions } = renderWithData(<HabitSection />, rows);
    await userEvent.click(screen.getByRole('button', { name: /, 5\. Oktober/ }));
    expect(actions.toggleHabitCheck).toHaveBeenCalledWith('h1', '2026-10-05');
  });

  it('browses to past months but not into the future', async () => {
    renderWithData(<HabitSection />, rows);
    expect(screen.getByRole('button', { name: 'Nächster Monat' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Vorheriger Monat' }));
    expect(screen.getByText('September 2026')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /September/ })).toHaveLength(30);
    expect(screen.getByRole('button', { name: /30\. September/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('renames the habit', async () => {
    const { actions } = renderWithData(<HabitSection />, rows);
    await userEvent.click(screen.getByRole('button', { name: /umbenennen/ }));
    const input = screen.getByLabelText('Name');
    await userEvent.clear(input);
    await userEvent.type(input, 'Lernen{Enter}');
    expect(actions.renameHabit).toHaveBeenCalledWith('h1', 'Lernen');
  });
});
