import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import { vi, type Mock } from 'vitest';
import { SwipeGroup } from '@/components/ui/SwipeGroup';
import { DataContext } from '@/context/data-context';
import { ToastProvider } from '@/context/ToastProvider';
import type { Actions } from '@/data/actions';
import { createDataStore, type DataStore, type TableRows } from '@/data/store';

/** @brief Actions object where every action is a resolved vi.fn mock. */
export type MockActions = { [K in keyof Actions]: Mock };

/**
 * @brief Creates mock actions that resolve successfully.
 * @returns Mocked action API.
 */
export function mockActions(): MockActions {
  const names: (keyof Actions)[] = [
    'addTask',
    'updateTask',
    'setTaskCompleted',
    'deleteTask',
    'restoreDeletedTask',
    'addModule',
    'updateModule',
    'saveNotes',
    'deleteModule',
    'addLink',
    'updateLink',
    'deleteLink',
    'reorderLinks',
    'renameHabit',
    'toggleHabitCheck',
  ];
  return Object.fromEntries(
    names.map((name) => [name, vi.fn(() => Promise.resolve(true))]),
  ) as MockActions;
}

/**
 * @brief Renders UI with a loaded store, mocked actions, toasts, router and swipe group.
 * @param ui Element to render.
 * @param rows Initial table rows (missing tables are empty).
 * @param path Initial route.
 * @returns Render result plus store and actions.
 */
export function renderWithData(
  ui: ReactElement,
  rows: Partial<TableRows> = {},
  path = '/',
): RenderResult & { store: DataStore; actions: MockActions } {
  const store = createDataStore();
  store.dispatch({
    type: 'loaded',
    rows: { modules: [], module_links: [], tasks: [], habits: [], habit_checks: [], ...rows },
  });
  const actions = mockActions();
  const value = {
    store,
    actions: actions as unknown as Actions,
    reload: vi.fn(() => Promise.resolve()),
  };
  const result = render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <DataContext.Provider value={value}>
          <SwipeGroup>{ui}</SwipeGroup>
        </DataContext.Provider>
      </ToastProvider>
    </MemoryRouter>,
  );
  return { ...result, store, actions };
}
