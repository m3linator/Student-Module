import { useMemo, type CSSProperties } from 'react';
import { TIMETABLE_HOUR_HEIGHT_DESKTOP, TIMETABLE_HOUR_HEIGHT_MOBILE } from '@/config/app';
import { useBerlinClock } from '@/hooks/useBerlinClock';
import { WEEKDAY_LABELS } from '@/lib/calendar';
import { cn } from '@/lib/cn';
import {
  layoutOverlaps,
  nowLineTop,
  visibleHours,
  visibleWeekdays,
  type TimetableEvent,
} from '@/lib/timetable';
import { TimetableEntry } from './TimetableEntry';

/** @brief Props of TimetableGrid. */
export interface TimetableGridProps {
  /** All events (at least one). */
  events: TimetableEvent[];
}

/**
 * @brief Sizes as CSS variables: `--hour` (px per hour) and `--axis` (width of the time axis).
 * @details Switching at the desktop breakpoint happens in CSS (`lg:` classes on the grid).
 */
const SIZE_VARS = {
  '--hour-mobile': `${TIMETABLE_HOUR_HEIGHT_MOBILE}px`,
  '--hour-desktop': `${TIMETABLE_HOUR_HEIGHT_DESKTOP}px`,
} as CSSProperties;

/**
 * @brief Read-only weekly timetable in the style of the Google Calendar week view.
 * @details Weekdays without dates on top, full hours on the left, one column per visible day.
 * Today's weekday is highlighted and a red line marks the current time (updated every minute).
 * Overlapping events share the day width side by side.
 * @param props See TimetableGridProps.
 * @returns The grid.
 */
export function TimetableGrid({ events }: TimetableGridProps) {
  const clock = useBerlinClock();
  const range = useMemo(() => visibleHours(events), [events]);
  const days = useMemo(() => visibleWeekdays(events), [events]);
  const columns = useMemo(
    () =>
      days.map((weekday) => {
        const dayEvents = events
          .filter((event) => event.weekday === weekday)
          .sort((a, b) => a.start - b.start || a.end - b.end);
        const overlaps = layoutOverlaps(dayEvents);
        return {
          weekday,
          entries: dayEvents.map((event, index) => ({
            event,
            overlap: overlaps[index] ?? { column: 0, columns: 1 },
          })),
        };
      }),
    [days, events],
  );

  const hours = Array.from(
    { length: range.endHour - range.startHour + 1 },
    (_, index) => range.startHour + index,
  );
  const nowTop = nowLineTop(clock.minutes, range, 1);
  const template = { gridTemplateColumns: `var(--axis) repeat(${days.length}, minmax(0, 1fr))` };

  return (
    <div
      role="group"
      aria-label="Wochenstundenplan"
      style={SIZE_VARS}
      className="card px-1.5 pt-2 pb-3 [--axis:2rem] [--hour:var(--hour-mobile)] lg:px-3 lg:[--axis:3rem] lg:[--hour:var(--hour-desktop)]"
    >
      {/* Weekday header */}
      <div className="grid pb-2" style={template} aria-hidden="true">
        <span />
        {days.map((weekday) => {
          const isToday = weekday === clock.weekday;
          return (
            <span
              key={weekday}
              className={cn(
                'text-center text-[13px] lg:text-sm',
                isToday ? 'font-bold text-link' : 'font-medium text-label-2',
              )}
            >
              {WEEKDAY_LABELS[weekday - 1]}
            </span>
          );
        })}
      </div>

      <div
        className="relative grid"
        style={{
          ...template,
          height: `calc(${range.endHour - range.startHour} * var(--hour))`,
        }}
      >
        {/* Time axis, labels centred on their hour line */}
        <div className="relative" aria-hidden="true">
          {hours.map((hour, index) => (
            <span
              key={hour}
              style={{ top: `calc(${index} * var(--hour))` }}
              className="absolute right-1.5 -translate-y-1/2 text-[11px] leading-none text-label-3 tabular-nums lg:right-2 lg:text-xs"
            >
              <span className="lg:hidden">{hour}</span>
              <span className="hidden lg:inline">{hour}:00</span>
            </span>
          ))}
        </div>

        {/* Hour lines across all days */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 left-[var(--axis)]"
          aria-hidden="true"
        >
          {hours.map((hour, index) => (
            <div
              key={hour}
              style={{ top: `calc(${index} * var(--hour))` }}
              className="absolute inset-x-0 border-t border-separator"
            />
          ))}
        </div>

        {/* Day columns with their entries */}
        {columns.map(({ weekday, entries }) => (
          <div key={weekday} className="relative border-l border-separator">
            {entries.map(({ event, overlap }) => (
              <TimetableEntry
                key={event.id}
                event={event}
                overlap={overlap}
                startHour={range.startHour}
              />
            ))}
            {weekday === clock.weekday && nowTop !== null && (
              <div
                data-testid="now-line"
                aria-hidden="true"
                style={{ top: `calc(${nowTop} * var(--hour))` }}
                className="pointer-events-none absolute inset-x-0 z-10 -mt-px h-0.5 bg-danger"
              >
                <span className="absolute top-1/2 -left-1 size-2 -translate-y-1/2 rounded-full bg-danger" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
