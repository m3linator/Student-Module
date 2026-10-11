/**
 * @brief Shown when the Supabase environment variables are missing or invalid (local `.env` or
 *        Vercel environment variables).
 * @returns Short German setup hint.
 */
export function SetupHintPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 safe-area safe-x">
      <h1 className="text-xl font-semibold">Supabase ist nicht konfiguriert</h1>
      <p className="text-label-2">
        <code className="rounded bg-fill px-1">VITE_SUPABASE_URL</code> oder{' '}
        <code className="rounded bg-fill px-1">VITE_SUPABASE_ANON_KEY</code> fehlt oder ist
        ungültig. Erwartet werden z. B.{' '}
        <code className="rounded bg-fill px-1">https://abcd1234.supabase.co</code> (ohne Pfad) und
        ein Key, der mit <code className="rounded bg-fill px-1">sb_publishable_</code> beginnt.
      </p>
      <p className="text-label-2">
        Lokal: Werte in der <code className="rounded bg-fill px-1">.env</code> korrigieren und den
        Dev-Server neu starten. Auf Vercel: Environment Variables korrigieren und neu deployen
        (siehe SETUP.md).
      </p>
    </main>
  );
}
