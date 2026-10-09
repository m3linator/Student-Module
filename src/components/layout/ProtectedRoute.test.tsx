import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { fakeSession, renderWithAuth } from '@/test/renderWithAuth';
import { ProtectedRoute } from './ProtectedRoute';

const tree = (
  <MemoryRouter initialEntries={['/module/1']}>
    <Routes>
      <Route path="/login" element={<p>Login</p>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/module/:id" element={<p>Geheim</p>} />
      </Route>
    </Routes>
  </MemoryRouter>
);

describe('ProtectedRoute', () => {
  it('redirects to /login without a session', () => {
    renderWithAuth(tree);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders nothing sensitive while the session is loading', () => {
    renderWithAuth(tree, { loading: true });
    expect(screen.queryByText('Geheim')).not.toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('renders the child route with a session', () => {
    renderWithAuth(tree, { session: fakeSession });
    expect(screen.getByText('Geheim')).toBeInTheDocument();
  });
});
