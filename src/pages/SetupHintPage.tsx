/**
 * @brief Shown when the Supabase environment variables are missing (local dev without .env).
 * @returns Short German setup hint.
 */
export function SetupHintPage() {
  return (
    <main className="safe-area safe-x mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3">
      <h1 className="text-xl font-semibold">Supabase ist nicht konfiguriert</h1>
      <p className="text-gray-600">
        Lege eine <code className="rounded bg-gray-100 px-1">.env</code> mit{' '}
        <code className="rounded bg-gray-100 px-1">VITE_SUPABASE_URL</code> und{' '}
        <code className="rounded bg-gray-100 px-1">VITE_SUPABASE_ANON_KEY</code> an (siehe SETUP.md)
        und starte den Dev-Server neu.
      </p>
    </main>
  );
}
