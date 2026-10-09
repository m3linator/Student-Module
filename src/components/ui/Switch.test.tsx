import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

describe('Switch', () => {
  it('exposes its state and toggles', async () => {
    const onChange = vi.fn();
    render(<Switch label="Bis Vorabend fertig" checked onChange={onChange} description="Hilfe" />);
    const toggle = screen.getByRole('switch', { name: 'Bis Vorabend fertig' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveAccessibleDescription('Hilfe');
    await userEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
