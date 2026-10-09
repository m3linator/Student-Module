import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '@/context/auth-context';

/**
 * @brief Accesses the authentication state.
 * @returns Session, loading flag and sign-in/out actions.
 * @throws Error when used outside of an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
