import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { addDays, addMonths, format, parseISO } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';
import type { IsoDate } from '@/lib/berlinDate';
import {
  buildMonthGrid,
  formatMonthYear,
  monthOf,
  shiftMonth,
  WEEKDAY_LABELS,
  type YearMonth,
} from '@/lib/calendar';
import { cn } from '@/lib/cn';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { IconButton } from './IconButton';

/** @brief Props of Calendar. */
export interface CalendarProps {
  /** Selected day or null. */
  value: IsoDate | null;
  /** Called with the picked day. */
  onChange: (date: IsoDate) => void;
  /** Current Berlin day (highlighted). */
  today: IsoDate;
}

/** @brief Day offsets for keyboard navigation. */
const KEY_OFFSETS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

/**
 * @brief Small month calendar for picking a single day.
 * @details Arrow keys move the focus by day/week, PageUp/PageDown by month (roving tabindex).
 * @param props See CalendarProps.
 * @returns The calendar.
 */
export function Calendar({ value, onChange, today }: CalendarProps) {
  const [focused, setFocused] = useState<IsoDate>(value ?? today);
  const [view, setView] = useState<YearMonth>(monthOf(value ?? today));
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
  }, [focused]);

  /**
   * @brief Moves keyboard focus to a day, switching the visible month if needed.
   * @param date Target day.
   */
  function focusDate(date: IsoDate) {
    moveFocus.current = true;
    setFocused(date);
    setView(monthOf(date));
  }

  /**
   * @brief Handles arrow/page keys inside the day grid.
   * @param event Key event.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const offset = KEY_OFFSETS[event.key];
    const current = parseISO(focused);
    let next: Date | null = null;
    if (offset !== undefined) next = addDays(current, offset);
    if (event.key === 'PageUp') next = addMonths(current, -1);
    if (event.key === 'PageDown') next = addMonths(current, 1);
    if (!next) return;
    event.preventDefault();
    focusDate(format(next, 'yyyy-MM-dd'));
  }

  const weeks = buildMonthGrid(view);
  const focusInView = monthOf(focused).month === view.month && monthOf(focused).year === view.year;
  const firstOfView = weeks.flat().find(Boolean);

  return (
    <div className="w-full max-w-xs select-none">
      <div className="mb-1 flex items-center justify-between">
        <IconButton label="Vorheriger Monat" onClick={() => setView((v) => shiftMonth(v, -1))}>
          <ChevronLeftIcon />
        </IconButton>
        <p className="text-[17px] font-semibold" aria-live="polite">
          {formatMonthYear(view)}
        </p>
        <IconButton label="Nächster Monat" onClick={() => setView((v) => shiftMonth(v, 1))}>
          <ChevronRightIcon />
        </IconButton>
      </div>
      <div
        className="text-label-2 grid grid-cols-7 text-center text-[13px] font-medium"
        aria-hidden="true"
      >
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>
      <div
        ref={gridRef}
        role="grid"
        onKeyDown={handleKeyDown}
        className="grid grid-cols-7 gap-y-0.5"
      >
        {weeks.flat().map((date, index) => {
          if (!date) return <span key={`blank-${index}`} />;
          const selected = date === value;
          const isToday = date === today;
          const tabbable = focusInView ? date === focused : date === firstOfView;
          return (
            <button
              key={date}
              type="button"
              data-date={date}
              tabIndex={tabbable ? 0 : -1}
              aria-pressed={selected}
              aria-label={format(parseISO(date), 'EEEE, d. MMMM yyyy', { locale: deLocale })}
              aria-current={isToday ? 'date' : undefined}
              onClick={() => onChange(date)}
              onFocus={() => setFocused(date)}
              className={cn(
                'mx-auto flex size-10 items-center justify-center rounded-full text-[15px] tabular-nums transition-colors duration-150',
                selected ? 'bg-accent font-semibold text-white' : 'text-label hover:bg-fill',
                !selected && isToday && 'text-link font-semibold',
              )}
            >
              {Number(date.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
