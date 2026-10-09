import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ActionsModule from '@/data/actions';
import type { RealtimeHandlers } from '@/data/realtime';
import { useTasks } from '@/hooks/useData';
import { makeTask } from '@/test/fixtures';
import { DataProvider } from './DataProvider';
import { ToastProvider } from './ToastProvider';

const loadAllRows = vi.fn();
let handlers: RealtimeHandlers | null = null;
const unsubscribe = vi.fn();

vi.mock('@/data/actions', async (importOriginal) => ({
  ...(await importOriginal<typeof ActionsModule>()),
  loadAllRows: () => loadAllRows(),
}));

vi.mock('@/data/realtime', () => ({
  subscribeToChanges: (h: RealtimeHandlers) => {
    handlers = h;
    return unsubscribe;
  },
}));

vi.mock('@/hooks/useToday', () => ({ useToday: () => '2026-10-10' }));

/** @brief Lists the open task titles. */
function Titles() {
  const { loading, open } = useTasks();
  return <p>{loading ? 'lädt' : open.map((task) => task.title).join(',') || 'leer'}</p>;
}

const empty = { modules: [], module_links: [], tasks: [], habits: [], habit_checks: [] };

describe('DataProvider', () => {
  beforeEach(() => {
    handlers = null;
    loadAllRows.mockReset();
    unsubscribe.mockReset();
  });

  /** @brief Renders the provider with the probe. */
  const renderProvider = () =>
    render(
      <ToastProvider>
        <DataProvider userId="u">
          <Titles />
        </DataProvider>
      </ToastProvider>,
    );

  it('loads data and applies realtime changes without reloading', async () => {
    loadAllRows.mockResolvedValue({ ...empty, tasks: [makeTask({ id: 'a', title: 'A' })] });
    renderProvider();
    expect(await screen.findByText('A')).toBeInTheDocument();

    act(() =>
      handlers?.onAction({
        type: 'upsert',
        table: 'tasks',
        row: makeTask({ id: 'b', title: 'B' }),
      }),
    );
    expect(screen.getByText('A,B')).toBeInTheDocument();
    act(() => handlers?.onAction({ type: 'remove', table: 'tasks', key: 'a' }));
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(loadAllRows).toHaveBeenCalledTimes(1);
  });

  it('reloads when the realtime channel (re)connects', async () => {
    loadAllRows.mockResolvedValue(empty);
    renderProvider();
    await screen.findByText('leer');
    loadAllRows.mockResolvedValue({ ...empty, tasks: [makeTask({ id: 'c', title: 'C' })] });
    act(() => handlers?.onSubscribed());
    expect(await screen.findByText('C')).toBeInTheDocument();
  });

  it('shows a German error toast when loading fails', async () => {
    loadAllRows.mockRejectedValue(new TypeError('Failed to fetch'));
    renderProvider();
    expect(await screen.findByRole('alert')).toHaveTextContent(/Keine Verbindung/);
  });

  it('unsubscribes on unmount', async () => {
    loadAllRows.mockResolvedValue(empty);
    const { unmount } = renderProvider();
    await waitFor(() => expect(handlers).not.toBeNull());
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
