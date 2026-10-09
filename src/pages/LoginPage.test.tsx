import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { fakeSession, renderWithAuth } from '@/test/renderWithAuth';
import { LoginPage } from './LoginPage';

/**
 * @brief Renders the login page inside a memory router.
 * @param overrides Auth context overrides.
 */
function renderLogin(overrides: Parameters<typeof renderWithAuth>[1] = {}) {
  return renderWithAuth(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<p>Übersicht</p>} />
      </Routes>
    </MemoryRouter>,
    overrides,
  );
}

describe('LoginPage', () => {
  it('submits trimmed credentials', async () => {
    const { auth } = renderLogin();
    await userEvent.type(screen.getByLabelText('E-Mail'), 'me@example.com');
    await userEvent.type(screen.getByLabelText('Passwort'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Anmelden' }));
    expect(auth.signIn).toHaveBeenCalledWith('me@example.com', 'secret');
  });

  it('shows the error returned by signIn', async () => {
    renderLogin({ signIn: vi.fn(() => Promise.resolve('E-Mail oder Passwort ist falsch.')) });
    await userEvent.type(screen.getByLabelText('E-Mail'), 'me@example.com');
    await userEvent.type(screen.getByLabelText('Passwort'), 'wrong{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('E-Mail oder Passwort ist falsch.');
  });

  it('has no sign-up option', () => {
    renderLogin();
    expect(screen.queryByText(/registrieren/i)).not.toBeInTheDocument();
  });

  it('redirects to the overview when already signed in', () => {
    renderLogin({ session: fakeSession });
    expect(screen.getByText('Übersicht')).toBeInTheDocument();
  });
});
