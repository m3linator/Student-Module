/**
 * @brief Shown when the Supabase environment variables are missing (local dev without .env).
 * @returns Short German setup hint.
 */
export function SetupHintPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 safe-area safe-x">
      <h1 className="text-xl font-semibold">Supabase ist nicht konfiguriert</h1>
      <p className="text-label-2">
        Lege eine <code className="rounded bg-fill px-1">.env</code> mit{' '}
        <code className="rounded bg-fill px-1">VITE_SUPABASE_URL</code> und{' '}
        <code className="rounded bg-fill px-1">VITE_SUPABASE_ANON_KEY</code> an (siehe SETUP.md) und
        starte den Dev-Server neu.
      </p>
    </main>
  );
}
