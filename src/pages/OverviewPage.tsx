import { useAuth } from '@/hooks/useAuth';

/**
 * @brief Overview page with tasks, modules and habit tracker.
 * @returns The overview.
 */
export function OverviewPage() {
  const { signOut } = useAuth();
  return (
    <main className="p-4">
      <button type="button" onClick={() => void signOut()}>
        Abmelden
      </button>
    </main>
  );
}
