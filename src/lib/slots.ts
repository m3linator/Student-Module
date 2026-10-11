/**
 * @file slots.ts
 * @brief Lecture/exercise time slots of a module (room + free-text time).
 */
import type { TimeSlot } from '@/types/database';

/**
 * @brief Reads a slot list coming from the database defensively.
 * @param value Raw JSON value (should be an array of { room, time }).
 * @returns Valid slots; non-object entries are skipped, missing fields become "".
 */
export function normalizeSlots(value: unknown): TimeSlot[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry: unknown) => {
    if (typeof entry !== 'object' || entry === null) return [];
    const { room, time } = entry as Record<string, unknown>;
    return [
      { room: typeof room === 'string' ? room : '', time: typeof time === 'string' ? time : '' },
    ];
  });
}

/**
 * @brief Prepares slots for saving: trims values and drops entries whose time is empty.
 * @details Clearing the time of a lecture is how the user deletes it.
 * @param slots Slots from the form.
 * @returns Slots to store.
 */
export function cleanSlots(slots: readonly TimeSlot[]): TimeSlot[] {
  return slots
    .map((slot) => ({ room: slot.room.trim(), time: slot.time.trim() }))
    .filter((slot) => slot.time !== '');
}

/**
 * @brief Formats a slot for display.
 * @param slot Slot to format.
 * @returns E.g. "H-1.10 · Di 10:00–11:30" (empty parts are skipped).
 */
export function formatSlot(slot: TimeSlot): string {
  return [slot.room, slot.time].filter(Boolean).join(' · ');
}

/**
 * @brief Label of one slot, numbered only if there are several.
 * @param base Kind, e.g. "Vorlesung".
 * @param index Zero-based position.
 * @param count Number of slots of this kind.
 * @returns "Vorlesung" or "Vorlesung 2".
 */
export function slotLabel(base: string, index: number, count: number): string {
  return count > 1 ? `${base} ${index + 1}` : base;
}
