import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeModule, makeTask } from '@/test/fixtures';
import { renderWithData } from '@/test/renderWithData';
import { ModulesSection } from './ModulesSection';

describe('ModulesSection', () => {
  it('renders tiles with name, ECTS, professor and open task count', () => {
    renderWithData(<ModulesSection />, {
      modules: [makeModule({ id: 'm1', name: 'Algorithmen', ects: 5, professor: 'Prof. Knuth' })],
      tasks: [
        makeTask({ id: 'a', module_id: 'm1' }),
        makeTask({ id: 'b', module_id: 'm1' }),
        makeTask({ id: 'c', module_id: 'm1', completed_at: '2026-10-01T00:00:00Z' }),
      ],
    });
    const tile = screen.getByRole('link', { name: /Algorithmen/ });
    expect(tile).toHaveAttribute('href', '/module/m1');
    expect(tile).toHaveTextContent('5 ECTS');
    expect(tile).toHaveTextContent('Prof. Knuth');
    expect(tile).toHaveTextContent('2 offen');
  });

  it('shows the empty state and creates a module via the pop-up', async () => {
    const { actions } = renderWithData(<ModulesSection />);
    expect(screen.getByText('Noch keine Module – tippe auf +')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Neues Modul' }));
    await userEvent.type(screen.getByLabelText('Modulname'), 'Physik');
    await userEvent.type(screen.getByLabelText('ECTS'), '7,5{Enter}');
    expect(actions.addModule).toHaveBeenCalledWith({
      name: 'Physik',
      professor: null,
      ects: 7.5,
      lectures: [],
      exercises: [],
    });
  });

  it('rejects invalid ECTS values', async () => {
    renderWithData(<ModulesSection />);
    await userEvent.click(screen.getByRole('button', { name: 'Neues Modul' }));
    await userEvent.type(screen.getByLabelText('Modulname'), 'Physik');
    await userEvent.type(screen.getByLabelText('ECTS'), 'viel');
    expect(screen.getByText(/Bitte eine Zahl eingeben/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeDisabled();
  });
});
