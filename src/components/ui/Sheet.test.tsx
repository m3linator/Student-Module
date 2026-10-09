import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Sheet } from './Sheet';

describe('Sheet', () => {
  it('renders nothing while closed', () => {
    render(
      <Sheet open={false} onClose={vi.fn()} title="Aufgabe">
        Inhalt
      </Sheet>,
    );
    expect(screen.queryByText('Inhalt')).not.toBeInTheDocument();
  });

  it('is labelled by its title', () => {
    render(
      <Sheet open onClose={vi.fn()} title="Aufgabe">
        Inhalt
      </Sheet>,
    );
    expect(screen.getByRole('dialog', { name: 'Aufgabe' })).toBeInTheDocument();
  });

  it('submits on Enter inside an input', async () => {
    const onSubmit = vi.fn();
    render(
      <Sheet open onClose={vi.fn()} title="Aufgabe" onSubmit={onSubmit}>
        <input aria-label="Titel" />
      </Sheet>,
    );
    await userEvent.type(screen.getByLabelText('Titel'), 'Blatt 1{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('submits on Enter from a select', () => {
    const onSubmit = vi.fn();
    render(
      <Sheet open onClose={vi.fn()} title="Aufgabe" onSubmit={onSubmit}>
        <select aria-label="Modul">
          <option>Kein Modul</option>
        </select>
      </Sheet>,
    );
    fireEvent.keyDown(screen.getByLabelText('Modul'), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit while disabled', async () => {
    const onSubmit = vi.fn();
    render(
      <Sheet open onClose={vi.fn()} title="Aufgabe" onSubmit={onSubmit} submitDisabled>
        <input aria-label="Titel" />
      </Sheet>,
    );
    await userEvent.type(screen.getByLabelText('Titel'), '{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('closes on Esc (cancel event) and on "Abbrechen"', async () => {
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} title="Aufgabe" onSubmit={vi.fn()}>
        Inhalt
      </Sheet>,
    );
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    await userEvent.click(screen.getByRole('button', { name: 'Abbrechen' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
