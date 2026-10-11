import { AppHeader } from '@/components/layout/AppHeader';
import { HabitSection } from '@/components/habit/HabitSection';
import { ModulesSection } from '@/components/modules/ModulesSection';
import { TasksSection } from '@/components/tasks/TasksSection';
import { TimetableSection } from '@/components/timetable/TimetableSection';
import { SwipeGroup } from '@/components/ui/SwipeGroup';

/**
 * @brief Overview with tasks, modules, timetable and activity.
 * @details Below 1024 px one column: tasks (incl. completed) → modules → timetable → activity.
 * From 1024 px two columns (≈40/60): tasks and activity on the left, modules and timetable on
 * the right. The DOM order is the phone order (also the keyboard order); on desktop a grid
 * places the sections. The timetable spans a flexible last row, so the activity card sits
 * directly below the tasks instead of below the taller right column.
 * @returns The overview page.
 */
export function OverviewPage() {
  return (
    <SwipeGroup>
      <div className="min-h-dvh">
        <AppHeader />
        <main className="page-width flex flex-col gap-10 pt-6 safe-x pb-[calc(env(safe-area-inset-bottom)+2.5rem)] lg:grid lg:grid-cols-[2fr_3fr] lg:grid-rows-[auto_auto_auto_1fr] lg:gap-x-12 lg:gap-y-0 lg:pt-10">
          <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <TasksSection />
          </div>
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
            <ModulesSection />
          </div>
          <div className="min-w-0 lg:col-start-2 lg:row-span-3 lg:row-start-2 lg:pt-10">
            <TimetableSection />
          </div>
          <div className="min-w-0 lg:col-start-1 lg:row-start-3 lg:pt-10">
            <HabitSection />
          </div>
        </main>
      </div>
    </SwipeGroup>
  );
}
