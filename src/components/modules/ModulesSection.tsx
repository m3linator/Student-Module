import { useState } from 'react';
import { Section } from '@/components/ui/Section';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ModuleInput } from '@/data/actions';
import { useActions, useModules } from '@/hooks/useData';
import { ModuleSheet } from './ModuleSheet';
import { ModuleTile } from './ModuleTile';

/**
 * @brief Tile grid sized by the available width (container query), not the viewport:
 *        2 columns on phones, 3 from 480 px, 4 from 720 px of section width.
 */
const GRID = 'grid grid-cols-2 gap-3 @min-[30rem]:grid-cols-3 @min-[45rem]:grid-cols-4';

/**
 * @brief "Module" section with the tile grid and the "new module" pop-up.
 * @returns The section.
 */
export function ModulesSection() {
  const { loading, modules, openCounts } = useModules();
  const actions = useActions();
  const [sheet, setSheet] = useState({ open: false, key: 0 });

  /**
   * @brief Creates the module and closes the pop-up.
   * @param input Form values.
   */
  function handleSave(input: ModuleInput) {
    void actions.addModule(input);
    setSheet((s) => ({ ...s, open: false }));
  }

  return (
    <Section
      title="Module"
      onAdd={() => setSheet((s) => ({ open: true, key: s.key + 1 }))}
      addLabel="Neues Modul"
    >
      <div className="@container">
        {loading ? (
          <div className={GRID} role="status" aria-label="Module werden geladen">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : modules.length === 0 ? (
          <p className="card px-4 py-6 text-center text-label-2">Noch keine Module – tippe auf +</p>
        ) : (
          <div className={GRID}>
            {modules.map((module) => (
              <ModuleTile
                key={module.id}
                module={module}
                openCount={openCounts.get(module.id) ?? 0}
              />
            ))}
          </div>
        )}
      </div>
      <ModuleSheet
        key={sheet.key}
        open={sheet.open}
        module={null}
        onClose={() => setSheet((s) => ({ ...s, open: false }))}
        onSave={handleSave}
      />
    </Section>
  );
}
