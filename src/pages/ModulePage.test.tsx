import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { makeLink, makeModule } from '@/test/fixtures';
import { renderWithData } from '@/test/renderWithData';
import { ModulePage } from './ModulePage';

vi.mock('@/components/layout/AppHeader', () => ({ AppHeader: () => null }));

const module = makeModule({
  id: 'm1',
  name: 'Mathematik 1',
  professor: 'Prof. Dr. Euler',
  ects: 7.5,
  lecture_room: 'H-1.10',
  lecture_time: 'Di 10:00–11:30',
  notes: '# Klausur\n- [ ] Blatt 1',
});

const routes = (
  <Routes>
    <Route path="/" element={<p>Übersicht</p>} />
    <Route path="/module/:id" element={<ModulePage />} />
  </Routes>
);

/**
 * @brief Renders the module page for module m1 with two links.
 * @returns Render result with store and mocked actions.
 */
const renderPage = () =>
  renderWithData(
    routes,
    {
      modules: [module],
      module_links: [
        makeLink({
          id: 'l2',
          module_id: 'm1',
          title: 'Skript',
          url: 'https://b.example',
          position: 1,
        }),
        makeLink({
          id: 'l1',
          module_id: 'm1',
          title: 'Moodle',
          url: 'https://a.example',
          position: 0,
        }),
      ],
    },
    '/module/m1',
  );

describe('ModulePage', () => {
  it('shows the module facts and hides empty fields', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Mathematik 1' })).toBeInTheDocument();
    expect(screen.getByText('Prof. Dr. Euler')).toBeInTheDocument();
    expect(screen.getByText('7,5 ECTS')).toBeInTheDocument();
    expect(screen.getByText('H-1.10 · Di 10:00–11:30')).toBeInTheDocument();
    expect(screen.queryByText('Übung')).not.toBeInTheDocument();
  });

  it('lists links by name only, in order, opening in the browser', () => {
    renderPage();
    const list = screen.getByRole('list');
    const links = within(list).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(['Moodle', 'Skript']);
    expect(links[0]).toHaveAttribute('href', 'https://a.example');
    expect(screen.queryByText('https://a.example')).not.toBeInTheDocument();
  });

  it('adds a link and completes a missing https://', async () => {
    const { actions } = renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Neuer Link' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Bibliothek');
    await userEvent.type(screen.getByLabelText('URL'), 'bib.h-brs.de{Enter}');
    expect(actions.addLink).toHaveBeenCalledWith('m1', {
      title: 'Bibliothek',
      url: 'https://bib.h-brs.de',
    });
  });

  it('asks before deleting and then returns to the overview', async () => {
    const { actions } = renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Modul löschen' }));
    const dialog = screen.getByRole('dialog', { name: 'Modul löschen?' });
    expect(dialog).toHaveTextContent(
      'Modul ‚Mathematik 1‘ löschen? Links und Notizen werden gelöscht. Zugehörige Aufgaben bleiben erhalten, aber ohne Modul.',
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Löschen' }));
    expect(actions.deleteModule).toHaveBeenCalledWith('m1');
    expect(screen.getByText('Übersicht')).toBeInTheDocument();
  });

  it('renders the notes preview', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Vorschau' }));
    expect(screen.getByRole('heading', { name: 'Klausur' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('shows a hint for unknown modules', () => {
    renderWithData(routes, {}, '/module/unknown');
    expect(screen.getByText('Modul nicht gefunden')).toBeInTheDocument();
  });
});
