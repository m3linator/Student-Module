import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { AppHeader } from '@/components/layout/AppHeader';
import { LinksSection } from '@/components/modules/LinksSection';
import { ModuleInfo } from '@/components/modules/ModuleInfo';
import { ModuleSheet } from '@/components/modules/ModuleSheet';
import { NotesSection } from '@/components/modules/NotesSection';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ChevronLeftIcon, PencilIcon, TrashIcon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { SwipeGroup } from '@/components/ui/SwipeGroup';
import type { ModuleInput } from '@/data/actions';
import { useActions, useModule } from '@/hooks/useData';

/**
 * @brief Full-screen page of a single module: info + links (left on desktop), notes (right).
 * @returns The module page.
 */
export function ModulePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { loading, module, links } = useModule(id);
  const actions = useActions();
  const navigate = useNavigate();
  const [editSheet, setEditSheet] = useState({ open: false, key: 0 });
  const [confirmOpen, setConfirmOpen] = useState(false);

  /**
   * @brief Saves the edited module fields.
   * @param input Form values.
   */
  function handleSave(input: ModuleInput) {
    void actions.updateModule(id, input);
    setEditSheet((s) => ({ ...s, open: false }));
  }

  /** @brief Deletes the module (links/notes cascade, tasks keep existing) and goes back. */
  function handleDelete() {
    setConfirmOpen(false);
    void actions.deleteModule(id);
    void navigate('/', { replace: true });
  }

  return (
    <SwipeGroup>
      <div className="flex min-h-dvh flex-col">
        <AppHeader desktopOnly />
        <div className="material border-separator sticky top-0 z-20 border-b-[0.5px] pt-[env(safe-area-inset-top)] lg:static lg:border-0 lg:bg-transparent lg:pt-0 lg:backdrop-filter-none">
          <nav
            aria-label="Modulaktionen"
            className="page-width safe-x flex h-14 items-center justify-between lg:h-16"
          >
            <Link
              to="/"
              className="text-link hover:bg-fill -ml-2 inline-flex min-h-11 items-center gap-0.5 rounded-lg pr-3 pl-0.5 text-[17px]"
            >
              <ChevronLeftIcon className="size-6" strokeWidth={2.5} />
              <span className="lg:hidden">Zurück</span>
              <span className="hidden lg:inline">Übersicht</span>
            </Link>
            {module && (
              <div className="-mr-2 flex items-center gap-1">
                <IconButton
                  label="Modul bearbeiten"
                  onClick={() => setEditSheet((s) => ({ open: true, key: s.key + 1 }))}
                >
                  <PencilIcon />
                </IconButton>
                <IconButton
                  label="Modul löschen"
                  onClick={() => setConfirmOpen(true)}
                  className="text-danger hover:bg-danger-tint"
                >
                  <TrashIcon />
                </IconButton>
              </div>
            )}
          </nav>
        </div>

        {loading ? (
          <div
            className="page-width safe-x flex flex-col gap-4 pt-6"
            role="status"
            aria-label="Modul wird geladen"
          >
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : !module ? (
          <div className="page-width safe-x flex flex-col items-start gap-3 pt-10">
            <h1 className="text-xl font-semibold">Modul nicht gefunden</h1>
            <p className="text-label-2">Es wurde vielleicht auf einem anderen Gerät gelöscht.</p>
            <Link to="/" className="text-link font-medium">
              Zur Übersicht
            </Link>
          </div>
        ) : (
          <main className="page-width safe-x grid flex-1 gap-10 pt-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] lg:h-[calc(100dvh-7.5rem)] lg:grid-cols-[35fr_65fr] lg:gap-12 lg:pt-2">
            <div className="flex min-w-0 flex-col gap-10 lg:overflow-y-auto lg:pb-6">
              <ModuleInfo module={module} />
              <LinksSection moduleId={module.id} links={links} />
            </div>
            <div className="flex min-h-0 min-w-0 flex-col lg:pb-6">
              <NotesSection key={module.id} module={module} />
            </div>
          </main>
        )}

        {module && (
          <>
            <ModuleSheet
              key={editSheet.key}
              open={editSheet.open}
              module={module}
              onClose={() => setEditSheet((s) => ({ ...s, open: false }))}
              onSave={handleSave}
            />
            <ConfirmDialog
              open={confirmOpen}
              title="Modul löschen?"
              message={`Modul ‚${module.name}‘ löschen? Links und Notizen werden gelöscht. Zugehörige Aufgaben bleiben erhalten, aber ohne Modul.`}
              onConfirm={handleDelete}
              onCancel={() => setConfirmOpen(false)}
            />
          </>
        )}
      </div>
    </SwipeGroup>
  );
}
