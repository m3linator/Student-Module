/**
 * @file timetable.ts
 * @brief Pure layout logic of the weekly timetable (positions, visible range, overlaps).
 *
 * Times are handled as minutes since midnight; the component turns them into pixels with the
 * hour height of the current screen size.
 */
import { TIMETABLE_END_HOUR, TIMETABLE_START_HOUR } from '@/config/app';
import {
  formatTimeRange,
  isCompleteSlot,
  normalizeSlots,
  SLOT_KIND_LABELS,
  WEEKDAY_NAMES,
  type SlotKind,
} from '@/lib/slots';
import type { ModuleRow, Weekday } from '@/types/database';

/** @brief One appointment as shown in the timetable. */
export type TimetableEvent = {
  /** Stable key: module id, kind and position. */
  id: string;
  moduleId: string;
  moduleName: string;
  kind: SlotKind;
  /** "Mathe 1" for a lecture, "Mathe 1-Ü" for an exercise. */
  title: string;
  weekday: Weekday;
  /** Start as `HH:MM`. */
  startTime: string;
  /** End as `HH:MM`. */
  endTime: string;
  /** Start in minutes since midnight. */
  start: number;
  /** End in minutes since midnight. */
  end: number;
  room: string;
};

/** @brief Placement of an event among overlapping events of the same day. */
export type OverlapSlot = {
  /** Zero-based column inside its group of overlapping events. */
  column: number;
  /** Number of columns the group needs (the event gets 1/columns of the day width). */
  columns: number;
};

/** @brief Visible hour range: from `startHour:00` to `endHour:00`. */
export type HourRange = { startHour: number; endHour: number };

/** @brief Monday to Friday – always shown. */
const WORKDAYS: readonly Weekday[] = [1, 2, 3, 4, 5];

/**
 * @brief Converts `HH:MM` into minutes since midnight.
 * @param time Time as `HH:MM`.
 * @returns Minutes, e.g. 630 for "10:30".
 */
export function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * @brief Title of an appointment block.
 * @param moduleName Name of the module.
 * @param kind Lecture or exercise.
 * @returns "Name" for lectures, "Name-Ü" for exercises.
 */
export function eventTitle(moduleName: string, kind: SlotKind): string {
  return kind === 'exercise' ? `${moduleName}-Ü` : moduleName;
}

/**
 * @brief Accessible name of a timetable entry.
 * @param event Timetable event.
 * @returns E.g. "Übung Mathe 1, Mittwoch 14:00 bis 15:30, Raum A 1.04" (room part only if set).
 */
export function entryLabel(event: TimetableEvent): string {
  const time = formatTimeRange(event.startTime, event.endTime).replace('–', ' bis ');
  const parts = [
    `${SLOT_KIND_LABELS[event.kind]} ${event.moduleName}`,
    `${WEEKDAY_NAMES[event.weekday - 1]} ${time}`,
  ];
  if (event.room) parts.push(`Raum ${event.room}`);
  return parts.join(', ');
}

/**
 * @brief Collects all complete appointments of all modules.
 * @details Entries without weekday/time (not yet converted) are skipped.
 * @param modules Module rows.
 * @returns Events, unsorted.
 */
export function buildTimetableEvents(
  modules: readonly Pick<ModuleRow, 'id' | 'name' | 'lectures' | 'exercises'>[],
): TimetableEvent[] {
  return modules.flatMap((module) =>
    (['lecture', 'exercise'] as const).flatMap((kind) =>
      normalizeSlots(kind === 'lecture' ? module.lectures : module.exercises).flatMap(
        (slot, index): TimetableEvent[] =>
          isCompleteSlot(slot)
            ? [
                {
                  id: `${module.id}-${kind}-${index}`,
                  moduleId: module.id,
                  moduleName: module.name,
                  kind,
                  title: eventTitle(module.name, kind),
                  weekday: slot.weekday,
                  startTime: slot.start_time,
                  endTime: slot.end_time,
                  start: timeToMinutes(slot.start_time),
                  end: timeToMinutes(slot.end_time),
                  room: slot.room,
                },
              ]
            : [],
      ),
    ),
  );
}

/**
 * @brief Visible hours: the default range, widened to full hours around earlier/later events.
 * @param events Events with start and end in minutes.
 * @param defaults Default range (8–18 from the app config).
 * @returns Start and end hour.
 */
export function visibleHours(
  events: readonly Pick<TimetableEvent, 'start' | 'end'>[],
  defaults: HourRange = { startHour: TIMETABLE_START_HOUR, endHour: TIMETABLE_END_HOUR },
): HourRange {
  let { startHour, endHour } = defaults;
  for (const event of events) {
    startHour = Math.min(startHour, Math.floor(event.start / 60));
    endHour = Math.max(endHour, Math.ceil(event.end / 60));
  }
  return { startHour, endHour };
}

/**
 * @brief Visible weekdays: Monday–Friday, plus Saturday/Sunday only if they have events.
 * @param events Events with a weekday.
 * @returns Ascending weekdays.
 */
export function visibleWeekdays(events: readonly Pick<TimetableEvent, 'weekday'>[]): Weekday[] {
  const days = new Set<Weekday>(WORKDAYS);
  for (const event of events) days.add(event.weekday);
  return [...days].sort((a, b) => a - b);
}

/**
 * @brief Vertical position and height of an event, exact to the minute.
 * @param start Start in minutes since midnight.
 * @param end End in minutes since midnight.
 * @param startHour First visible hour.
 * @param hourHeight Pixels per hour.
 * @returns Top offset and height in pixels.
 */
export function eventBox(
  start: number,
  end: number,
  startHour: number,
  hourHeight: number,
): { top: number; height: number } {
  return {
    top: ((start - startHour * 60) / 60) * hourHeight,
    height: ((end - start) / 60) * hourHeight,
  };
}

/**
 * @brief Position of the "now" line, or null when the time is outside the visible range.
 * @param minutes Current time in minutes since midnight.
 * @param range Visible hours.
 * @param hourHeight Pixels per hour.
 * @returns Top offset in pixels, or null.
 */
export function nowLineTop(minutes: number, range: HourRange, hourHeight: number): number | null {
  if (minutes < range.startHour * 60 || minutes > range.endHour * 60) return null;
  return ((minutes - range.startHour * 60) / 60) * hourHeight;
}

/**
 * @brief Side-by-side layout of overlapping events of one day (like Google Calendar).
 * @details Events are grouped into clusters of transitively overlapping events. Inside a
 * cluster each event takes the first column that is free at its start; all events of the cluster
 * share the cluster's column count. Events that only touch (end = next start) do not overlap.
 * @param events Events of one day with start and end in minutes.
 * @returns Column and column count per event, in the order of the input.
 */
export function layoutOverlaps(
  events: readonly Pick<TimetableEvent, 'start' | 'end'>[],
): OverlapSlot[] {
  const result: OverlapSlot[] = events.map(() => ({ column: 0, columns: 1 }));
  const order = events
    .map((event, index) => ({ ...event, index }))
    .sort((a, b) => a.start - b.start || b.end - a.end);

  let cluster: number[] = [];
  let columnEnds: number[] = [];
  let clusterEnd = -Infinity;

  /** @brief Writes the column count of the finished cluster to its events. */
  const closeCluster = () => {
    for (const index of cluster) {
      const slot = result[index];
      if (slot) slot.columns = columnEnds.length;
    }
    cluster = [];
    columnEnds = [];
  };

  for (const event of order) {
    if (event.start >= clusterEnd) closeCluster();
    let column = columnEnds.findIndex((end) => end <= event.start);
    if (column === -1) {
      column = columnEnds.length;
      columnEnds.push(event.end);
    } else {
      columnEnds[column] = event.end;
    }
    const slot = result[event.index];
    if (slot) slot.column = column;
    cluster.push(event.index);
    clusterEnd = Math.max(clusterEnd, event.end);
  }
  closeCluster();
  return result;
}
