import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeModule, makeSlot } from '@/test/fixtures';
import { renderWithData } from '@/test/renderWithData';
import { TimetableSection } from './TimetableSection';

const routes = (
  <Routes>
    <Route path="/" element={<TimetableSection />} />
    <Route path="/module/:id" element={<p>Modulseite</p>} />
  </Routes>
);

describe('TimetableSection', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders an entry with title, time and room and opens the module on click', async () => {
    renderWithData(routes, {
      modules: [
        makeModule({
          id: 'm1',
          name: 'Mathe 1',
          lectures: [makeSlot(2, '10:00', '11:30')],
          exercises: [makeSlot(3, '14:00', '15:30', 'A 1.04')],
        }),
      ],
    });
    const grid = screen.getByRole('group', { name: 'Wochenstundenplan' });
    const entry = within(grid).getByRole('link', {
      name: 'Übung Mathe 1, Mittwoch 14:00 bis 15:30, Raum A 1.04',
    });
    expect(entry).toHaveTextContent('Mathe 1-Ü');
    expect(entry).toHaveTextContent('14:00–15:30');
    expect(entry).toHaveTextContent('A 1.04');
    // Without a room the room line is left out.
    expect(
      within(grid).getByRole('link', { name: 'Vorlesung Mathe 1, Dienstag 10:00 bis 11:30' }),
    ).toHaveTextContent(/^Mathe 1\s*10:00–11:30$/);

    await userEvent.click(entry);
    expect(screen.getByText('Modulseite')).toBeInTheDocument();
  });

  it('positions entries to the minute in the default 8–18 range', () => {
    renderWithData(routes, {
      modules: [makeModule({ id: 'm1', lectures: [makeSlot(1, '10:00', '11:30')] })],
    });
    const entry = screen.getByRole('link');
    expect(entry.style.top).toBe('calc(2 * var(--hour) + 1px)');
    expect(entry.style.height).toBe('calc(1.5 * var(--hour) - 2px)');
  });

  it('shows the current-time line only in today’s column', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    // Tuesday, 10:30 in Berlin.
    vi.setSystemTime(new Date('2026-10-13T08:30:00Z'));
    renderWithData(routes, {
      modules: [makeModule({ id: 'm1', lectures: [makeSlot(1, '10:00', '11:30')] })],
    });
    const line = screen.getByTestId('now-line');
    expect(line.style.top).toBe('calc(2.5 * var(--hour))');
    expect(screen.getByText('Di')).toHaveClass('font-bold');
  });

  it('shows a hint instead of the grid without appointments', () => {
    renderWithData(routes, { modules: [makeModule({ id: 'm1' })] });
    expect(
      screen.getByText('Noch keine Termine – trage sie in einem Modul ein'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Wochenstundenplan' })).not.toBeInTheDocument();
  });
});
