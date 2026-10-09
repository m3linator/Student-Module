import { AppHeader } from '@/components/layout/AppHeader';
import { ModulesSection } from '@/components/modules/ModulesSection';
import { TasksSection } from '@/components/tasks/TasksSection';
import { Section } from '@/components/ui/Section';
import { SwipeGroup } from '@/components/ui/SwipeGroup';

/**
 * @brief Overview: tasks + completed tasks (left on desktop), modules + habit tracker (right).
 * @details One column below 1024 px; two columns (≈40/60) from 1024 px.
 * @returns The overview page.
 */
export function OverviewPage() {
  return (
    <SwipeGroup>
      <div className="min-h-dvh">
        <AppHeader />
        <main className="page-width safe-x grid gap-10 pt-6 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] lg:grid-cols-[2fr_3fr] lg:gap-12 lg:pt-10">
          <div className="flex min-w-0 flex-col gap-6">
            <TasksSection />
          </div>
          <div className="flex min-w-0 flex-col gap-10">
            <ModulesSection />
            <Section title="Habittracker">{null}</Section>
          </div>
        </main>
      </div>
    </SwipeGroup>
  );
}
