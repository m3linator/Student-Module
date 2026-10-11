import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeModule } from '@/test/fixtures';
import { ModuleSheet } from './ModuleSheet';

/**
 * @brief Returns the field group of one appointment by its legend.
 * @param name Legend text, e.g. "Vorlesung 2".
 * @returns The fieldset element.
 */
const group = (name: string) => screen.getByRole('group', { name });

describe('ModuleSheet', () => {
  it('adds any number of lectures and exercises', async () => {
    const onSave = vi.fn();
    render(<ModuleSheet open module={null} onClose={vi.fn()} onSave={onSave} />);
    await userEvent.type(screen.getByLabelText('Modulname'), 'Physik');

    await userEvent.type(within(group('Vorlesung')).getByLabelText('Raum'), 'H-1.10');
    await userEvent.type(within(group('Vorlesung')).getByLabelText('Uhrzeit'), 'Di 10:00');
    await userEvent.click(screen.getByRole('button', { name: 'Vorlesung' }));
    expect(within(group('Vorlesung 2')).getByLabelText('Raum')).toHaveFocus();
    await userEvent.type(within(group('Vorlesung 2')).getByLabelText('Uhrzeit'), 'Fr 8:00');

    await userEvent.type(within(group('Übung')).getByLabelText('Uhrzeit'), 'Do 14:00');
    await userEvent.click(screen.getByRole('button', { name: 'Speichern' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Physik',
        lectures: [
          { room: 'H-1.10', time: 'Di 10:00' },
          { room: '', time: 'Fr 8:00' },
        ],
        exercises: [{ room: '', time: 'Do 14:00' }],
      }),
    );
  });

  it('removes a lecture whose time was cleared', async () => {
    const onSave = vi.fn();
    const module = makeModule({
      id: 'm',
      name: 'Mathe',
      lectures: [
        { room: 'A', time: 'Mo 8:00' },
        { room: 'B', time: 'Mi 12:00' },
      ],
    });
    render(<ModuleSheet open module={module} onClose={vi.fn()} onSave={onSave} />);
    await userEvent.clear(within(group('Vorlesung 1')).getByLabelText('Uhrzeit'));
    // The entry stays visible while editing …
    expect(group('Vorlesung 1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Speichern' }));
    // … and is dropped on save.
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ lectures: [{ room: 'B', time: 'Mi 12:00' }], exercises: [] }),
    );
  });

  it('starts with one empty lecture and exercise for a new module', () => {
    render(<ModuleSheet open module={null} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(group('Vorlesung')).toBeInTheDocument();
    expect(group('Übung')).toBeInTheDocument();
    expect(
      screen.getByText('Einträge ohne Uhrzeit werden beim Speichern entfernt.'),
    ).toBeInTheDocument();
  });
});
