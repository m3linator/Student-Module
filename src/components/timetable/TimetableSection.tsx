import { Section } from '@/components/ui/Section';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTimetable } from '@/hooks/useTimetable';
import { TimetableGrid } from './TimetableGrid';

/**
 * @brief "Stundenplan" section: weekly grid of all lectures and exercises (read-only).
 * @details Appointments are edited in the module pop-up; changes arrive via realtime.
 * @returns The section.
 */
export function TimetableSection() {
  const { loading, events } = useTimetable();
  return (
    <Section title="Stundenplan">
      {loading ? (
        <div role="status" aria-label="Stundenplan wird geladen">
          <Skeleton className="h-72" />
        </div>
      ) : events.length === 0 ? (
        <p className="card px-4 py-6 text-center text-label-2">
          Noch keine Termine – trage sie in einem Modul ein
        </p>
      ) : (
        <TimetableGrid events={events} />
      )}
    </Section>
  );
}
