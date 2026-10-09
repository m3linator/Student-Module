import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { toGermanMessage } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import { AuthContext, type AuthContextValue } from './auth-context';

/**
 * @brief Restores the persisted Supabase session and keeps it in sync with auth events.
 * @param props.children Subtree that may access the auth state via useAuth().
 * @returns Context provider wrapping the children.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? toGermanMessage(error, 'Anmeldung fehlgeschlagen.') : null;
    } catch (error) {
      return toGermanMessage(error, 'Anmeldung fehlgeschlagen.');
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut({ scope: 'local' });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, loading, signIn, signOut }),
    [session, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
