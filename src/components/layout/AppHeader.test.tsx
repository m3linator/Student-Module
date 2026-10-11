import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { APP_NAME } from '@/config/app';
import { fakeSession, renderWithAuth } from '@/test/renderWithAuth';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('shows the app name', () => {
    renderWithAuth(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
      { session: fakeSession },
    );
    expect(screen.getByRole('link', { name: APP_NAME })).toBeInTheDocument();
  });

  it('signs out from the mobile account menu', async () => {
    const { auth } = renderWithAuth(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
      { session: fakeSession },
    );
    await userEvent.click(screen.getByRole('button', { name: 'Konto' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Abmelden' }));
    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });

  it('switches the appearance from the account menu and remembers it', async () => {
    renderWithAuth(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
      { session: fakeSession },
    );
    await userEvent.click(screen.getByRole('button', { name: 'Konto' }));
    const menu = screen.getByRole('menu', { name: 'Konto' });
    await userEvent.click(within(menu).getByRole('button', { name: 'Dunkel' }));
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('uni-app:theme')).toBe('dark');
    expect(within(menu).getByRole('button', { name: 'Dunkel' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.click(within(menu).getByRole('button', { name: 'Hell' }));
    expect(document.documentElement).not.toHaveClass('dark');
    localStorage.clear();
  });
});
