import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeModule, makeTask } from '@/test/fixtures';
import { renderWithData } from '@/test/renderWithData';
import { TasksSection } from './TasksSection';

vi.mock('@/hooks/useToday', () => ({ useToday: () => '2026-10-10' }));

const rows = {
  modules: [makeModule({ id: 'm1', name: 'Mathematik für Informatiker' })],
  tasks: [
    makeTask({ id: 'later', title: 'Referat', due_date: '2026-10-30', module_id: 'm1' }),
    makeTask({ id: 'soon', title: 'Blatt 3', due_date: '2026-10-12' }),
    makeTask({ id: 'none', title: 'Bibliothek' }),
    makeTask({ id: 'done', title: 'Blatt 1', completed_at: '2026-10-05T10:00:00Z' }),
  ],
};

describe('TasksSection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lists open tasks sorted by remaining days with red urgency', () => {
    renderWithData(<TasksSection />, rows);
    const list = screen.getAllByRole('list')[0] as HTMLElement;
    const titles = within(list)
      .getAllByRole('button', { name: /,/ })
      .map((row) => row.getAttribute('aria-label')?.split(',')[0]);
    expect(titles).toEqual(['Blatt 3', 'Referat', 'Bibliothek']);
    expect(screen.getByText('1 Tag')).toHaveClass('text-danger-ink');
    expect(screen.getByText('19 Tage')).not.toHaveClass('text-danger-ink');
    expect(screen.getByText('Abgabe: Mo, 12.10.')).toBeInTheDocument();
  });

  it('shows the collapsed completed section with its count', async () => {
    renderWithData(<TasksSection />, rows);
    const toggle = screen.getByRole('button', { name: /Erledigte Aufgaben \(1\)/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveTextContent('▾');
  });

  it('completes a task via its action', () => {
    vi.useFakeTimers();
    const { actions } = renderWithData(<TasksSection />, rows);
    fireEvent.click(screen.getAllByRole('button', { name: 'Abhaken' })[0] as HTMLElement);
    act(() => vi.advanceTimersByTime(250));
    expect(actions.setTaskCompleted).toHaveBeenCalledWith('soon', true);
  });

  it('deletes with an undo toast', async () => {
    vi.useFakeTimers();
    const { actions } = renderWithData(<TasksSection />, rows);
    fireEvent.click(screen.getAllByRole('button', { name: 'Löschen' })[0] as HTMLElement);
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    expect(actions.deleteTask).toHaveBeenCalledWith('soon');
    expect(screen.getByText('Aufgabe gelöscht')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Rückgängig' }));
    expect(actions.restoreDeletedTask).toHaveBeenCalledWith(rows.tasks[1]);
  });

  it('opens the edit pop-up on tap and the new pop-up with "+" or N', async () => {
    renderWithData(<TasksSection />, rows);
    await userEvent.click(screen.getByRole('button', { name: /^Referat,/ }));
    expect(screen.getByRole('dialog', { name: 'Aufgabe bearbeiten' })).toBeInTheDocument();
  });

  it('shows a friendly empty state', () => {
    renderWithData(<TasksSection />, { tasks: [] });
    expect(screen.getByText('Keine offenen Aufgaben 🎉')).toBeInTheDocument();
  });
});
