import { Link } from 'react-router';
import { ClockIcon, MapPinIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { formatTimeRange } from '@/lib/slots';
import { entryLabel, eventBox, type OverlapSlot, type TimetableEvent } from '@/lib/timetable';

/** @brief Props of TimetableEntry. */
export interface TimetableEntryProps {
  event: TimetableEvent;
  /** Placement among overlapping events of the same day. */
  overlap: OverlapSlot;
  /** First visible hour of the grid. */
  startHour: number;
}

/** @brief Detail line (time / room); hidden in blocks too narrow to show any text. */
const LINE = 'flex w-full min-w-0 items-center gap-0.5 @max-[2.5rem]:hidden lg:gap-1';

/**
 * @brief One appointment block, positioned to the minute inside its day column.
 * @details The block uses the grid's `--hour` CSS variable (pixels per hour), so it scales
 * with the screen size without JavaScript. Lines are laid out in a wrapping flex column: a line
 * that does not fit wraps into a hidden second column, so time and then room disappear on short
 * blocks instead of overflowing; the title is always shown and truncated with "…". In very
 * narrow blocks (several overlapping events) only the title is shown.
 * Tapping opens the module page; nothing can be edited here.
 * @param props See TimetableEntryProps.
 * @returns The block link.
 */
export function TimetableEntry({ event, overlap, startHour }: TimetableEntryProps) {
  const box = eventBox(event.start, event.end, startHour, 1);
  const width = 100 / overlap.columns;
  const time = formatTimeRange(event.startTime, event.endTime);
  const tooltip = [event.title, time, event.room].filter(Boolean).join('\n');

  return (
    <Link
      to={`/module/${event.moduleId}`}
      aria-label={entryLabel(event)}
      title={tooltip}
      style={{
        top: `calc(${box.top} * var(--hour) + 1px)`,
        height: `calc(${box.height} * var(--hour) - 2px)`,
        left: `calc(${overlap.column * width}% + 1px)`,
        width: `calc(${width}% - 2px)`,
      }}
      className={cn(
        '@container absolute overflow-hidden rounded-md px-1 py-0.5 text-[10px] leading-[1.3] transition-[filter] duration-150 motion-reduce:transition-none lg:px-1.5 lg:py-1 lg:text-xs can-hover:hover:brightness-110',
        event.kind === 'lecture' ? 'bg-lecture text-on-lecture' : 'bg-exercise text-on-exercise',
      )}
    >
      <span className="flex h-full flex-col flex-wrap content-start overflow-hidden">
        <span className="w-full truncate font-semibold">{event.title}</span>
        <span className={LINE}>
          <ClockIcon className="size-[1em] shrink-0" />
          <span className="truncate tabular-nums">{time}</span>
        </span>
        {event.room && (
          <span className={LINE}>
            <MapPinIcon className="size-[1em] shrink-0" />
            <span className="truncate">{event.room}</span>
          </span>
        )}
      </span>
    </Link>
  );
}
