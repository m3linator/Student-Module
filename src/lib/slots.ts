/**
 * @file slots.ts
 * @brief Lecture/exercise appointments of a module: weekday, start, end and room.
 *
 * Contains reading from the database, the form model with validation, and display helpers.
 */
import { WEEKDAY_LABELS } from '@/lib/calendar';
import type { ModuleRow, TimeSlot, Weekday } from '@/types/database';

/** @brief Appointment whose weekday, start and end are all set. */
export type CompleteSlot = TimeSlot & { weekday: Weekday; start_time: string; end_time: string };

/** @brief Kind of an appointment. */
export type SlotKind = 'lecture' | 'exercise';

/** @brief German label per kind. */
export const SLOT_KIND_LABELS: Record<SlotKind, string> = {
  lecture: 'Vorlesung',
  exercise: 'Übung',
};

/** @brief Full German weekday names, Monday first (index = weekday − 1). */
export const WEEKDAY_NAMES = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
] as const;

/** @brief `HH:MM` with a two-digit hour (the format of `<input type="time">`). */
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * @brief Reads a weekday from untrusted data.
 * @param value Raw value.
 * @returns Weekday 1–7, or null.
 */
function parseWeekday(value: unknown): Weekday | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 7
    ? (value as Weekday)
    : null;
}

/**
 * @brief Reads a `HH:MM` time from untrusted data (seconds are cut off).
 * @param value Raw value.
 * @returns Time as `HH:MM`, or null.
 */
function parseTime(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const time = value.slice(0, 5);
  return TIME_PATTERN.test(time) ? time : null;
}

/**
 * @brief Reads a slot list coming from the database defensively.
 * @details An entry with an incomplete or invalid time keeps only its room (and the old text), so
 * it is shown as "to be fixed" instead of breaking the timetable.
 * @param value Raw JSON value (should be an array of slots).
 * @returns Valid slots; non-object entries are skipped.
 */
export function normalizeSlots(value: unknown): TimeSlot[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry: unknown): TimeSlot[] => {
    if (typeof entry !== 'object' || entry === null) return [];
    const raw = entry as Record<string, unknown>;
    const weekday = parseWeekday(raw.weekday);
    const start = parseTime(raw.start_time);
    const end = parseTime(raw.end_time);
    const complete = weekday !== null && start !== null && end !== null && end > start;
    const slot: TimeSlot = {
      room: typeof raw.room === 'string' ? raw.room : '',
      weekday: complete ? weekday : null,
      start_time: complete ? start : null,
      end_time: complete ? end : null,
    };
    if (typeof raw.time === 'string' && raw.time.trim() !== '') slot.time = raw.time.trim();
    return [slot];
  });
}

/**
 * @brief Tells whether weekday, start and end are set.
 * @param slot Slot to check.
 * @returns True for a complete slot.
 */
export function isCompleteSlot(slot: TimeSlot): slot is CompleteSlot {
  return slot.weekday !== null && slot.start_time !== null && slot.end_time !== null;
}

/**
 * @brief Orders appointments by weekday, then start, then end.
 * @param a First slot.
 * @param b Second slot.
 * @returns Negative, zero or positive like Array.prototype.sort expects.
 */
export function compareSlots(a: CompleteSlot, b: CompleteSlot): number {
  return (
    a.weekday - b.weekday ||
    a.start_time.localeCompare(b.start_time) ||
    a.end_time.localeCompare(b.end_time)
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Form model                                                                                     */
/* ---------------------------------------------------------------------------------------------- */

/** @brief Editable appointment in the module form (all values as strings, "" = not set). */
export type SlotDraft = {
  room: string;
  /** "1"–"7" or "". */
  weekday: string;
  /** `HH:MM` or "". */
  start: string;
  /** `HH:MM` or "". */
  end: string;
  /** Old free-text time of a not yet converted entry, "" otherwise. */
  legacy: string;
};

/** @brief State of one form entry. */
export type DraftStatus = 'empty' | 'incomplete' | 'invalid-range' | 'complete';

/** @brief A new, empty form entry. */
export const EMPTY_DRAFT: SlotDraft = { room: '', weekday: '', start: '', end: '', legacy: '' };

/**
 * @brief Converts a stored slot into a form entry.
 * @param slot Stored slot.
 * @returns Form entry.
 */
export function toDraft(slot: TimeSlot): SlotDraft {
  return {
    room: slot.room,
    weekday: slot.weekday === null ? '' : String(slot.weekday),
    start: slot.start_time ?? '',
    end: slot.end_time ?? '',
    legacy: isCompleteSlot(slot) ? '' : (slot.time ?? ''),
  };
}

/**
 * @brief Classifies a form entry.
 * @details An entry without weekday, start and end counts as empty – even if it has a room – and
 * is removed on save. If only some of the three are set, it is incomplete and blocks saving.
 * @param draft Form entry.
 * @returns Its status.
 */
export function draftStatus(draft: SlotDraft): DraftStatus {
  const parts = [draft.weekday, draft.start, draft.end];
  if (parts.every((part) => part === '')) return 'empty';
  if (parts.some((part) => part === '')) return 'incomplete';
  return draft.end > draft.start ? 'complete' : 'invalid-range';
}

/**
 * @brief Names the missing time fields of an entry.
 * @param draft Form entry.
 * @returns German field names, e.g. ["Beginn", "Ende"].
 */
export function missingFields(draft: SlotDraft): string[] {
  return [
    draft.weekday === '' ? 'Tag' : null,
    draft.start === '' ? 'Beginn' : null,
    draft.end === '' ? 'Ende' : null,
  ].filter((name): name is string => name !== null);
}

/**
 * @brief Tells whether a list of form entries can be saved.
 * @param drafts Form entries.
 * @returns True if no entry is incomplete or ends before it starts.
 */
export function draftsValid(drafts: readonly SlotDraft[]): boolean {
  return drafts.every((draft) => {
    const status = draftStatus(draft);
    return status === 'empty' || status === 'complete';
  });
}

/**
 * @brief Prepares form entries for saving: trims the room and drops empty entries.
 * @details Clearing weekday, start and end of an appointment is how the user deletes it.
 * @param drafts Form entries (validated with draftsValid()).
 * @returns Slots to store.
 */
export function cleanSlots(drafts: readonly SlotDraft[]): TimeSlot[] {
  return drafts
    .filter((draft) => draftStatus(draft) === 'complete')
    .map((draft) => ({
      room: draft.room.trim(),
      weekday: Number(draft.weekday) as Weekday,
      start_time: draft.start,
      end_time: draft.end,
    }));
}

/* ---------------------------------------------------------------------------------------------- */
/* Display                                                                                        */
/* ---------------------------------------------------------------------------------------------- */

/**
 * @brief Formats a `HH:MM` time without leading zero.
 * @param time Time as `HH:MM`.
 * @returns E.g. "8:15".
 */
export function formatTime(time: string): string {
  return time.replace(/^0(\d)/, '$1');
}

/**
 * @brief Formats a time range.
 * @param start Start as `HH:MM`.
 * @param end End as `HH:MM`.
 * @returns E.g. "10:00–11:30".
 */
export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)}–${formatTime(end)}`;
}

/**
 * @brief Formats weekday and time of an appointment.
 * @param slot Complete slot.
 * @returns E.g. "Di 10:00–11:30".
 */
export function formatSlotTime(slot: CompleteSlot): string {
  return `${WEEKDAY_LABELS[slot.weekday - 1]} ${formatTimeRange(slot.start_time, slot.end_time)}`;
}

/**
 * @brief Label of one form entry, numbered only if there are several.
 * @param base Kind, e.g. "Vorlesung".
 * @param index Zero-based position.
 * @param count Number of entries of this kind.
 * @returns "Vorlesung" or "Vorlesung 2".
 */
export function slotLabel(base: string, index: number, count: number): string {
  return count > 1 ? `${base} ${index + 1}` : base;
}

/** @brief One appointment of a module together with its kind. */
export type Appointment = { kind: SlotKind; slot: TimeSlot };

/**
 * @brief All lectures and exercises of a module, sorted by weekday and start.
 * @details Entries without a time (not yet converted) come last, lectures before exercises.
 * @param module Module row.
 * @returns Sorted appointments.
 */
export function moduleAppointments(
  module: Pick<ModuleRow, 'lectures' | 'exercises'>,
): Appointment[] {
  const all: Appointment[] = [
    ...normalizeSlots(module.lectures).map((slot) => ({ kind: 'lecture' as const, slot })),
    ...normalizeSlots(module.exercises).map((slot) => ({ kind: 'exercise' as const, slot })),
  ];
  return all
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const sa = a.entry.slot;
      const sb = b.entry.slot;
      if (isCompleteSlot(sa) && isCompleteSlot(sb))
        return compareSlots(sa, sb) || a.index - b.index;
      if (isCompleteSlot(sa)) return -1;
      if (isCompleteSlot(sb)) return 1;
      return a.index - b.index;
    })
    .map(({ entry }) => entry);
}
