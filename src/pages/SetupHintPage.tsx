/**
 * @brief Shown when the Supabase environment variables are missing (local dev without .env).
 * @returns Short German setup hint.
 */
export function SetupHintPage() {
  return (
    <main className="safe-area safe-x mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3">
      <h1 className="text-xl font-semibold">Supabase ist nicht konfiguriert</h1>
      <p className="text-label-2">
        Lege eine <code className="bg-fill rounded px-1">.env</code> mit{' '}
        <code className="bg-fill rounded px-1">VITE_SUPABASE_URL</code> und{' '}
        <code className="bg-fill rounded px-1">VITE_SUPABASE_ANON_KEY</code> an (siehe SETUP.md) und
        starte den Dev-Server neu.
      </p>
    </main>
  );
}
