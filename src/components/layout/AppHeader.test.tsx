import { screen } from '@testing-library/react';
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
});
