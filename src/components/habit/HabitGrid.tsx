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

/** @brief One grid cell: 40 px touch target on phones, 24 px on desktop (mouse). */
const CELL = 'grid size-10 place-items-center lg:size-6';

/**
 * @brief Compact Anki-style month heatmap: one small rounded square per day, Monday first.
 * @details Checked days are green, today is outlined, future days are pale and disabled. The
 * visible square is smaller than its button, so the touch target stays 40 px on phones. The
 * exact date is available as tooltip and accessible name; weekdays are single letters.
 * @param props See HabitGridProps.
 * @returns The grid.
 */
export function HabitGrid({ month, checked, today, onToggle }: HabitGridProps) {
  const weeks = buildMonthGrid(month);
  return (
    <div className="w-fit">
      <div
        className="grid grid-cols-7 text-center text-[11px] font-medium text-label-2"
        aria-hidden="true"
      >
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="w-10 lg:w-6">
            {label.charAt(0)}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weeks.flat().map((date, index) => {
          if (!date) return <span key={`blank-${index}`} className={CELL} aria-hidden="true" />;
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
              className={cn(CELL, 'group disabled:cursor-not-allowed')}
            >
              <span
                className={cn(
                  'size-7 rounded-md transition duration-150 motion-reduce:transition-none lg:size-5 lg:rounded-[5px]',
                  isChecked
                    ? 'bg-success group-hover:brightness-110'
                    : 'bg-fill group-hover:bg-fill-strong',
                  isFuture && 'opacity-35 group-hover:bg-fill',
                  isToday && 'ring-2 ring-label ring-offset-1 ring-offset-surface',
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
