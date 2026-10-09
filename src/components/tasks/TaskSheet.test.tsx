import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeModule, makeTask } from '@/test/fixtures';
import { TaskSheet } from './TaskSheet';

const modules = [makeModule({ id: 'm1', name: 'Mathe' })];

describe('TaskSheet', () => {
  it('requires a title and saves defaults for a new task', async () => {
    const onSave = vi.fn();
    render(
      <TaskSheet
        open
        task={null}
        modules={modules}
        today="2026-10-10"
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );
    const save = screen.getByRole('button', { name: 'Speichern' });
    expect(save).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Aufgabe'), '  Blatt 1  {Enter}');
    expect(onSave).toHaveBeenCalledWith({
      title: 'Blatt 1',
      due_date: null,
      finish_day_before: true,
      module_id: null,
    });
  });

  it('shows the "evening before" switch only with a due date (default on)', async () => {
    const onSave = vi.fn();
    render(
      <TaskSheet
        open
        task={null}
        modules={modules}
        today="2026-10-10"
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Abgabetag/ }));
    await userEvent.click(screen.getByRole('button', { name: /, 14\. Oktober 2026/ }));
    expect(screen.getByText('Mi, 14.10.2026')).toBeInTheDocument();
    const toggle = screen.getByRole('switch', { name: 'Bis Vorabend fertig' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Countdown zählt bis zum Tag vor der Abgabe.')).toBeInTheDocument();

    await userEvent.click(toggle);
    await userEvent.selectOptions(screen.getByLabelText('Modul'), 'Mathe');
    await userEvent.type(screen.getByLabelText('Aufgabe'), 'Blatt 2');
    await userEvent.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(onSave).toHaveBeenCalledWith({
      title: 'Blatt 2',
      due_date: '2026-10-14',
      finish_day_before: false,
      module_id: 'm1',
    });
  });

  it('pre-fills an existing task and can remove its date', async () => {
    const onSave = vi.fn();
    const task = makeTask({ id: 't', title: 'Alt', due_date: '2026-10-20', module_id: 'm1' });
    render(
      <TaskSheet
        open
        task={task}
        modules={modules}
        today="2026-10-10"
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );
    expect(screen.getByRole('dialog', { name: 'Aufgabe bearbeiten' })).toBeInTheDocument();
    expect(screen.getByLabelText('Aufgabe')).toHaveValue('Alt');
    expect(screen.getByLabelText('Modul')).toHaveValue('m1');
    await userEvent.click(screen.getByRole('button', { name: 'Datum entfernen' }));
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ due_date: null }));
  });
});
