import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeModule, makeSlot } from '@/test/fixtures';
import { ModuleSheet } from './ModuleSheet';

/**
 * @brief Returns the field group of one appointment by its legend.
 * @param name Legend text, e.g. "Vorlesung 2".
 * @returns The fieldset element.
 */
const group = (name: string) => screen.getByRole('group', { name });

/**
 * @brief Fills weekday, start and end of one appointment.
 * @param name Legend of the appointment.
 * @param weekday Visible weekday label, e.g. "Di".
 * @param start Start as `HH:MM`.
 * @param end End as `HH:MM`.
 */
async function fillSlot(name: string, weekday: string, start: string, end: string) {
  await userEvent.selectOptions(within(group(name)).getByLabelText('Tag'), weekday);
  // user-event cannot type into time inputs reliably in jsdom; set the value directly.
  fireEvent.change(within(group(name)).getByLabelText('Beginn'), { target: { value: start } });
  fireEvent.change(within(group(name)).getByLabelText('Ende'), { target: { value: end } });
}

/** @brief The submit button of the sheet. */
const saveButton = () => screen.getByRole('button', { name: 'Speichern' });

describe('ModuleSheet', () => {
  it('adds any number of lectures and exercises with weekday, start and end', async () => {
    const onSave = vi.fn();
    render(<ModuleSheet open module={null} onClose={vi.fn()} onSave={onSave} />);
    await userEvent.type(screen.getByLabelText('Modulname'), 'Physik');

    await fillSlot('Vorlesung', 'Di', '10:00', '11:30');
    await userEvent.type(within(group('Vorlesung')).getByLabelText('Raum (optional)'), 'H-1.10');
    await userEvent.click(screen.getByRole('button', { name: 'Vorlesung' }));
    expect(within(group('Vorlesung 2')).getByLabelText('Tag')).toHaveFocus();
    await fillSlot('Vorlesung 2', 'Fr', '08:00', '09:30');
    await fillSlot('Übung', 'Mi', '14:15', '15:45');
    await userEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Physik',
        lectures: [makeSlot(2, '10:00', '11:30', 'H-1.10'), makeSlot(5, '08:00', '09:30')],
        exercises: [makeSlot(3, '14:15', '15:45')],
      }),
    );
  });

  it('removes an appointment whose weekday and times were cleared', async () => {
    const onSave = vi.fn();
    const module = makeModule({
      id: 'm',
      name: 'Mathe',
      lectures: [makeSlot(1, '08:00', '09:00', 'A'), makeSlot(3, '12:00', '13:00', 'B')],
    });
    render(<ModuleSheet open module={module} onClose={vi.fn()} onSave={onSave} />);
    await userEvent.selectOptions(within(group('Vorlesung 1')).getByLabelText('Tag'), '–');
    fireEvent.change(within(group('Vorlesung 1')).getByLabelText('Beginn'), {
      target: { value: '' },
    });
    fireEvent.change(within(group('Vorlesung 1')).getByLabelText('Ende'), {
      target: { value: '' },
    });
    // The entry stays visible while editing …
    expect(group('Vorlesung 1')).toBeInTheDocument();
    await userEvent.click(saveButton());
    // … and is dropped on save.
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ lectures: [makeSlot(3, '12:00', '13:00', 'B')], exercises: [] }),
    );
  });

  it('blocks saving while an entry is half filled', async () => {
    render(<ModuleSheet open module={null} onClose={vi.fn()} onSave={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Modulname'), 'Physik');
    await userEvent.selectOptions(within(group('Vorlesung')).getByLabelText('Tag'), 'Di');
    expect(screen.getByText('Es fehlt: Beginn, Ende.')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('marks an end before the start and blocks saving', async () => {
    render(<ModuleSheet open module={null} onClose={vi.fn()} onSave={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Modulname'), 'Physik');
    await fillSlot('Vorlesung', 'Di', '11:00', '10:00');
    expect(within(group('Vorlesung')).getByLabelText('Ende')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Das Ende muss nach dem Beginn liegen.')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('shows the old text of an entry that was not converted', () => {
    const module = makeModule({
      id: 'm',
      lectures: [{ room: '', weekday: null, start_time: null, end_time: null, time: 'Di 10-12' }],
    });
    render(<ModuleSheet open module={module} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText(/Bisher: „Di 10-12“/)).toBeInTheDocument();
  });

  it('starts with one empty lecture and exercise for a new module', () => {
    render(<ModuleSheet open module={null} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(group('Vorlesung')).toBeInTheDocument();
    expect(group('Übung')).toBeInTheDocument();
    expect(
      screen.getByText('Einträge ohne Tag und Uhrzeit werden beim Speichern entfernt.'),
    ).toBeInTheDocument();
  });
});
