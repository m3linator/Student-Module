import { Link, useParams } from 'react-router';
import { AppHeader } from '@/components/layout/AppHeader';
import { ChevronLeftIcon } from '@/components/ui/icons';

/**
 * @brief Full-screen page of a single module (info, links, notes).
 * @returns The module page.
 */
export function ModulePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="min-h-dvh">
      <AppHeader desktopOnly />
      <div className="page-width safe-x pt-[env(safe-area-inset-top)] lg:pt-4">
        <Link
          to="/"
          className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-[15px] text-gray-700 hover:bg-gray-100"
        >
          <ChevronLeftIcon />
          <span className="lg:hidden">Zurück</span>
          <span className="hidden lg:inline">Übersicht</span>
        </Link>
        <p className="sr-only">{id}</p>
      </div>
    </div>
  );
}
