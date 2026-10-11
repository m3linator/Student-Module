import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { APP_NAME } from '@/config/app';
import { useAuth } from '@/hooks/useAuth';

/**
 * @brief Login screen (e-mail + password). There is intentionally no sign-up.
 * @returns The login form, or a redirect when already signed in.
 */
export function LoginPage() {
  const { session, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/';
  if (session) return <Navigate to={from} replace />;

  /**
   * @brief Submits the credentials and shows a German error on failure.
   * @param event Form submit event.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const message = await signIn(email, password);
    setSubmitting(false);
    if (message) setError(message);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center safe-area safe-x">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-5" noValidate>
        <div className="flex flex-col items-center gap-3 pb-2">
          <img src="/icon.svg" alt="" className="size-20 rounded-[22px] shadow-lg" />
          <h1 className="text-[28px] font-bold tracking-tight">{APP_NAME}</h1>
        </div>
        <TextField
          label="E-Mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Passwort"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && (
          <p role="alert" className="text-[15px] text-danger-ink">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting || !email || !password}>
          {submitting ? 'Anmelden…' : 'Anmelden'}
        </Button>
      </form>
    </main>
  );
}
