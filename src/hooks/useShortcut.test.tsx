import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useShortcut } from './useShortcut';

/**
 * @brief Registers the shortcut and renders an input.
 * @param props.onFire Shortcut handler.
 */
function Probe({ onFire }: { onFire: () => void }) {
  useShortcut('n', onFire);
  return <input aria-label="Feld" />;
}

describe('useShortcut', () => {
  it('fires on the key without modifiers', () => {
    const onFire = vi.fn();
    render(<Probe onFire={onFire} />);
    fireEvent.keyDown(document.body, { key: 'n' });
    fireEvent.keyDown(document.body, { key: 'N' });
    fireEvent.keyDown(document.body, { key: 'n', metaKey: true });
    expect(onFire).toHaveBeenCalledTimes(2);
  });

  it('ignores typing in inputs', () => {
    const onFire = vi.fn();
    const { getByLabelText } = render(<Probe onFire={onFire} />);
    fireEvent.keyDown(getByLabelText('Feld'), { key: 'n' });
    expect(onFire).not.toHaveBeenCalled();
  });
});
