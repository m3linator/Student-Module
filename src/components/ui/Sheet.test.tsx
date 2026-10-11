import { act, fireEvent, render, screen } from '@testing-library/react';
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

  it('stays above the on-screen keyboard and locks page scrolling', () => {
    const viewport = Object.assign(new EventTarget(), { height: 844, offsetTop: 0 });
    vi.stubGlobal('visualViewport', viewport);
    const { unmount } = render(
      <Sheet open onClose={vi.fn()} title="Aufgabe" onSubmit={vi.fn()}>
        <input aria-label="Titel" />
      </Sheet>,
    );
    expect(document.body.style.position).toBe('fixed');

    act(() => {
      viewport.height = 480; // keyboard opened
      viewport.offsetTop = 60;
      viewport.dispatchEvent(new Event('resize'));
    });
    const container = screen.getByRole('dialog').lastElementChild as HTMLElement;
    expect(container.style.height).toBe('480px');
    expect(container.style.transform).toBe('translateY(60px)');

    unmount();
    expect(document.body.style.position).toBe('');
    vi.unstubAllGlobals();
  });
});
