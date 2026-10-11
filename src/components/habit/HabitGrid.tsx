import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import type { IsoDate } from '@/lib/berlinDate';
import { buildMonthGrid, WEEKDAY_LABELS, type YearMonth } from '@/lib/calendar';
import { cn } from '@/lib/cn';

/** @brief Props of HabitGrid. */
export interface HabitGridProps {
  month: YearMonth;
  checked: ReadonlySet<IsoDate>;
  today: IsoDate;
  onToggle: (date: IsoDate) => void;
}

/**
 * @brief Anki-style month heatmap: one rounded square per day, Monday first, no day numbers.
 * @details Checked days are green, today has a strong black outline, future days are pale and
 * disabled. The exact date is available as tooltip and accessible name.
 * @param props See HabitGridProps.
 * @returns The grid.
 */
export function HabitGrid({ month, checked, today, onToggle }: HabitGridProps) {
  const weeks = buildMonthGrid(month);
  return (
    <div className="w-full max-w-xs">
      <div
        className="mb-1 grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-label-2"
        aria-hidden="true"
      >
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {weeks.flat().map((date, index) => {
          if (!date) return <span key={`blank-${index}`} aria-hidden="true" />;
          const isChecked = checked.has(date);
          const isToday = date === today;
          const isFuture = date > today;
          const label = format(parseISO(date), 'EEEE, d. MMMM', { locale: de });
          return (
            <button
              key={date}
              type="button"
              disabled={isFuture}
              aria-pressed={isChecked}
              aria-label={`${label}${isToday ? ' (heute)' : ''}`}
              aria-current={isToday ? 'date' : undefined}
              title={label}
              onClick={() => onToggle(date)}
              className={cn(
                'aspect-square w-full rounded-[7px] transition duration-150',
                isChecked ? 'bg-success hover:brightness-110' : 'bg-fill hover:bg-fill-strong',
                isFuture && 'cursor-not-allowed opacity-35 hover:bg-fill',
                isToday && 'ring-2 ring-label ring-offset-2 ring-offset-surface',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
