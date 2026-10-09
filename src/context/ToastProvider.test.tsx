import { act, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToast } from '@/hooks/useToast';
import type { ToastContextValue } from './toast-context';
import { ToastProvider } from './ToastProvider';

let api: ToastContextValue;

/**
 * @brief Hands the toast API to the test for imperative use.
 * @param props.onReady Receives the API once mounted.
 */
function Probe({ onReady }: { onReady: (value: ToastContextValue) => void }) {
  const toast = useToast();
  useEffect(() => {
    onReady(toast);
  }, [toast, onReady]);
  return null;
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <Probe onReady={(value) => (api = value)} />
      </ToastProvider>,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a toast and hides it after the duration', () => {
    act(() => void api.show('Gespeichert', { duration: 1000 }));
    expect(screen.getByRole('status')).toHaveTextContent('Gespeichert');
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('runs the action and closes the toast', () => {
    const onAction = vi.fn();
    act(() => void api.show('Aufgabe gelöscht', { action: { label: 'Rückgängig', onAction } }));
    act(() => screen.getByRole('button', { name: 'Rückgängig' }).click());
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Aufgabe gelöscht')).not.toBeInTheDocument();
  });

  it('announces errors as alerts', () => {
    act(() => void api.showError('Speichern fehlgeschlagen.'));
    expect(screen.getByRole('alert')).toHaveTextContent('Speichern fehlgeschlagen.');
  });

  it('keeps at most three toasts', () => {
    act(() => ['1', '2', '3', '4'].forEach((m) => api.show(m)));
    expect(screen.getAllByRole('status')).toHaveLength(3);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
});
