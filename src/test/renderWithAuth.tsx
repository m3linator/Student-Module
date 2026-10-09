import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { Session } from '@supabase/supabase-js';
import { vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '@/context/auth-context';

/** @brief Minimal fake session for tests. */
export const fakeSession = { user: { id: 'user-1', email: 'me@example.com' } } as Session;

/**
 * @brief Renders a tree inside an AuthContext with controllable values.
 * @param ui Element to render.
 * @param overrides Partial auth context values (defaults: logged out, not loading).
 * @returns Testing-library render result plus the context value used.
 */
export function renderWithAuth(
  ui: ReactElement,
  overrides: Partial<AuthContextValue> = {},
): RenderResult & { auth: AuthContextValue } {
  const auth: AuthContextValue = {
    session: null,
    loading: false,
    signIn: vi.fn(() => Promise.resolve(null)),
    signOut: vi.fn(() => Promise.resolve()),
    ...overrides,
  };
  return { ...render(<AuthContext.Provider value={auth}>{ui}</AuthContext.Provider>), auth };
}
