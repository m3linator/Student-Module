import { describe, expect, it } from 'vitest';
import { makeSlot } from '@/test/fixtures';
import {
  cleanSlots,
  draftStatus,
  draftsValid,
  EMPTY_DRAFT,
  formatSlotTime,
  formatTimeRange,
  missingFields,
  moduleAppointments,
  normalizeSlots,
  slotLabel,
  toDraft,
  type SlotDraft,
} from './slots';

/**
 * @brief Builds a form entry.
 * @param patch Fields to set.
 * @returns Form entry.
 */
const draft = (patch: Partial<SlotDraft>): SlotDraft => ({ ...EMPTY_DRAFT, ...patch });

describe('normalizeSlots', () => {
  it('accepts well-formed lists', () => {
    expect(
      normalizeSlots([{ room: 'H-1.10', weekday: 2, start_time: '10:00', end_time: '11:30' }]),
    ).toEqual([makeSlot(2, '10:00', '11:30', 'H-1.10')]);
  });

  it('keeps the old text of entries that were not converted', () => {
    expect(
      normalizeSlots([
        { room: 'A', time: ' Dienstag 10-12 ', weekday: null, start_time: null, end_time: null },
      ]),
    ).toEqual([
      { room: 'A', weekday: null, start_time: null, end_time: null, time: 'Dienstag 10-12' },
    ]);
  });

  it('repairs or skips malformed data from the database', () => {
    expect(normalizeSlots(null)).toEqual([]);
    expect(normalizeSlots('kaputt')).toEqual([]);
    const empty = { room: '', weekday: null, start_time: null, end_time: null };
    expect(
      normalizeSlots([
        42,
        null,
        { room: 7, weekday: 8, start_time: '10:00', end_time: '11:00' },
        { weekday: 1, start_time: '11:00', end_time: '10:00' },
        { weekday: 1, start_time: '9:00', end_time: '10:00' },
        { weekday: 1, start_time: '09:00:00', end_time: '10:00:00' },
      ]),
    ).toEqual([empty, empty, empty, makeSlot(1, '09:00', '10:00')]);
  });
});

describe('form entries', () => {
  it('classifies entries', () => {
    expect(draftStatus(EMPTY_DRAFT)).toBe('empty');
    expect(draftStatus(draft({ room: 'A' }))).toBe('empty');
    expect(draftStatus(draft({ weekday: '2', start: '10:00' }))).toBe('incomplete');
    expect(draftStatus(draft({ weekday: '2', start: '10:00', end: '10:00' }))).toBe(
      'invalid-range',
    );
    expect(draftStatus(draft({ weekday: '2', start: '10:00', end: '11:30' }))).toBe('complete');
  });

  it('names missing fields', () => {
    expect(missingFields(draft({ start: '10:00' }))).toEqual(['Tag', 'Ende']);
  });

  it('only allows saving empty or complete entries', () => {
    expect(draftsValid([EMPTY_DRAFT, draft({ weekday: '1', start: '08:00', end: '09:00' })])).toBe(
      true,
    );
    expect(draftsValid([draft({ weekday: '1' })])).toBe(false);
    expect(draftsValid([draft({ weekday: '1', start: '09:00', end: '08:00' })])).toBe(false);
  });

  it('round-trips stored slots and drops empty entries on save', () => {
    const stored = makeSlot(3, '14:15', '15:45', 'C-116');
    expect(cleanSlots([toDraft(stored)])).toEqual([stored]);
    expect(
      cleanSlots([
        draft({ room: '  H-1.10 ', weekday: '2', start: '10:00', end: '11:30' }),
        draft({ room: 'nur Raum' }),
      ]),
    ).toEqual([makeSlot(2, '10:00', '11:30', 'H-1.10')]);
  });

  it('shows the old text only for entries without a time', () => {
    const legacy = { room: '', weekday: null, start_time: null, end_time: null, time: 'Di 10' };
    expect(toDraft(legacy).legacy).toBe('Di 10');
    expect(toDraft({ ...makeSlot(2, '10:00', '11:00'), time: 'Di 10' }).legacy).toBe('');
  });
});

describe('display', () => {
  it('formats times without a leading zero', () => {
    expect(formatTimeRange('08:05', '09:35')).toBe('8:05–9:35');
    expect(formatSlotTime(makeSlot(2, '10:00', '11:30'))).toBe('Di 10:00–11:30');
  });

  it('numbers form entries only when there are several', () => {
    expect(slotLabel('Vorlesung', 0, 1)).toBe('Vorlesung');
    expect(slotLabel('Vorlesung', 0, 2)).toBe('Vorlesung 1');
    expect(slotLabel('Übung', 1, 3)).toBe('Übung 2');
  });

  it('sorts all appointments of a module by weekday and start, unconverted ones last', () => {
    const legacy = { room: '', weekday: null, start_time: null, end_time: null, time: 'x' };
    const result = moduleAppointments({
      lectures: [legacy, makeSlot(5, '08:00', '09:30'), makeSlot(2, '12:00', '13:00')],
      exercises: [makeSlot(2, '10:00', '11:30')],
    });
    expect(result.map(({ kind, slot }) => `${kind} ${slot.weekday} ${slot.start_time}`)).toEqual([
      'exercise 2 10:00',
      'lecture 2 12:00',
      'lecture 5 08:00',
      'lecture null null',
    ]);
  });
});
