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
        className="mb-1 grid grid-cols-7 gap-1.5 text-center text-xs text-gray-500"
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
                'aspect-square w-full rounded-md border transition-colors duration-150',
                isChecked
                  ? 'border-green-600 bg-green-500 hover:bg-green-600'
                  : 'border-gray-200 bg-white hover:bg-gray-100',
                isFuture &&
                  'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60 hover:bg-gray-50',
                isToday && 'border-2 border-gray-900 ring-2 ring-gray-900/15 ring-offset-1',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
