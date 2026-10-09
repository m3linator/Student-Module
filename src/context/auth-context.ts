/**
 * @file auth-context.ts
 * @brief React context object for authentication state (kept separate for fast refresh).
 */
import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';

/** @brief Value exposed by the AuthProvider. */
export interface AuthContextValue {
  /** Current session, or null when logged out. */
  session: Session | null;
  /** True until the persisted session has been restored on startup. */
  loading: boolean;
  /**
   * @brief Signs in with e-mail and password.
   * @returns German error message, or null on success.
   */
  signIn: (email: string, password: string) => Promise<string | null>;
  /** @brief Signs out on this device. */
  signOut: () => Promise<void>;
}

/** @brief Authentication context; null outside of an AuthProvider. */
export const AuthContext = createContext<AuthContextValue | null>(null);
