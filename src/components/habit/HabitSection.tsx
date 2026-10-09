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
 * @brief Habit tracker: renamable habit, month heatmap of the current (or a past) month, streak.
 * @details The view is stored as "months back from now", so it jumps to the new month
 * automatically on the 1st.
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
    <Section title="Habittracker">
      {loading || !habit ? (
        <div className="flex flex-col gap-3" role="status" aria-label="Habittracker wird geladen">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="aspect-square w-full max-w-xs" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setSheet((s) => ({ open: true, key: s.key + 1 }))}
            aria-label={`Habit „${habit.name}“ umbenennen`}
            className="group -mx-2 flex min-h-11 items-center gap-2 self-start rounded-lg px-2 text-lg font-medium hover:bg-gray-100"
          >
            {habit.name}
            <PencilIcon className="size-4 text-gray-500 group-hover:text-gray-700" />
          </button>

          <div className="flex max-w-xs items-center justify-between">
            <IconButton
              label="Vorheriger Monat"
              onClick={() => setMonthsBack((value) => value + 1)}
              className="-ml-3"
            >
              <ChevronLeftIcon />
            </IconButton>
            <p className="text-[15px] font-medium" aria-live="polite">
              {formatMonthYear(month)}
            </p>
            <IconButton
              label="Nächster Monat"
              disabled={monthsBack === 0}
              onClick={() => setMonthsBack((value) => Math.max(0, value - 1))}
              className="-mr-3"
            >
              <ChevronRightIcon />
            </IconButton>
          </div>

          <HabitGrid
            month={month}
            checked={checked}
            today={today}
            onToggle={(date) => void actions.toggleHabitCheck(habit.id, date)}
          />

          <p className="text-[15px] text-gray-600">{formatStreak(streak)}</p>

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
