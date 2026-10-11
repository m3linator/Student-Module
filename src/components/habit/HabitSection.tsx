import { useMemo, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { Section } from '@/components/ui/Section';
import { Skeleton } from '@/components/ui/Skeleton';
import { useActions, useHabit } from '@/hooks/useData';
import { useToday } from '@/hooks/useToday';
import { formatMonthYear, monthOf, shiftMonth } from '@/lib/calendar';
import { currentStreak, formatStreak } from '@/lib/habit';
import { HabitGrid } from './HabitGrid';
import { HabitNameSheet } from './HabitNameSheet';

/**
 * @brief "Aktivität": renamable habit, compact month heatmap of the current (or a past) month
 *        and the current streak.
 * @details Name, month navigation and streak share one header line ("Fokus · ‹ Oktober 2026 › ·
 * 🔥 5") that wraps on narrow screens. The view is stored as "months back from now", so it jumps
 * to the new month automatically on the 1st.
 * @returns The section.
 */
export function HabitSection() {
  const { loading, habit, checked } = useHabit();
  const actions = useActions();
  const today = useToday();
  const [monthsBack, setMonthsBack] = useState(0);
  const [sheet, setSheet] = useState({ open: false, key: 0 });

  const month = shiftMonth(monthOf(today), -monthsBack);
  const streak = useMemo(() => currentStreak(checked, today), [checked, today]);

  return (
    <Section title="Aktivität">
      {loading || !habit ? (
        <div className="flex flex-col gap-3" role="status" aria-label="Aktivität wird geladen">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40 w-72 max-w-full lg:w-44" />
        </div>
      ) : (
        <div className="flex flex-col gap-2 card px-4 pt-2 pb-4 lg:w-fit">
          <div className="flex flex-wrap items-center gap-x-1">
            <button
              type="button"
              onClick={() => setSheet((s) => ({ open: true, key: s.key + 1 }))}
              aria-label={`Habit „${habit.name}“ umbenennen`}
              className="-ml-2 flex min-h-11 min-w-0 items-center gap-1.5 rounded-lg px-2 text-[15px] font-semibold hover:bg-fill"
            >
              <span className="truncate">{habit.name}</span>
              <PencilIcon className="size-3.5 shrink-0 text-link" />
            </button>

            <div className="flex items-center">
              <IconButton
                label="Vorheriger Monat"
                onClick={() => setMonthsBack((value) => value + 1)}
                className="size-10 lg:size-8"
              >
                <ChevronLeftIcon className="size-4" />
              </IconButton>
              <p className="min-w-[6.5rem] text-center text-[13px] font-medium" aria-live="polite">
                {formatMonthYear(month)}
              </p>
              <IconButton
                label="Nächster Monat"
                disabled={monthsBack === 0}
                onClick={() => setMonthsBack((value) => Math.max(0, value - 1))}
                className="size-10 lg:size-8"
              >
                <ChevronRightIcon className="size-4" />
              </IconButton>
            </div>

            <p
              className="ml-auto text-[15px] font-semibold tabular-nums"
              title={formatStreak(streak)}
            >
              <span aria-hidden="true">🔥 {streak}</span>
              <span className="sr-only">{formatStreak(streak)}</span>
            </p>
          </div>

          <HabitGrid
            month={month}
            checked={checked}
            today={today}
            onToggle={(date) => void actions.toggleHabitCheck(habit.id, date)}
          />

          <HabitNameSheet
            key={sheet.key}
            open={sheet.open}
            name={habit.name}
            onClose={() => setSheet((s) => ({ ...s, open: false }))}
            onSave={(name) => {
              void actions.renameHabit(habit.id, name);
              setSheet((s) => ({ ...s, open: false }));
            }}
          />
        </div>
      )}
    </Section>
  );
}
