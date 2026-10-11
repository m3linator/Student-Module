import { describe, expect, it } from 'vitest';
import { cleanSlots, formatSlot, normalizeSlots, slotLabel } from './slots';

describe('normalizeSlots', () => {
  it('accepts well-formed lists', () => {
    expect(normalizeSlots([{ room: 'H-1.10', time: 'Di 10:00' }])).toEqual([
      { room: 'H-1.10', time: 'Di 10:00' },
    ]);
  });

  it('repairs or skips malformed data from the database', () => {
    expect(normalizeSlots(null)).toEqual([]);
    expect(normalizeSlots('kaputt')).toEqual([]);
    expect(normalizeSlots([{ time: 'Mo 8:00' }, 42, null, { room: 7, time: null }])).toEqual([
      { room: '', time: 'Mo 8:00' },
      { room: '', time: '' },
    ]);
  });
});

describe('cleanSlots', () => {
  it('trims values and removes entries without a time', () => {
    expect(
      cleanSlots([
        { room: '  H-1.10 ', time: ' Di 10:00 ' },
        { room: 'C-116', time: '   ' },
        { room: '', time: 'Do 14:00' },
      ]),
    ).toEqual([
      { room: 'H-1.10', time: 'Di 10:00' },
      { room: '', time: 'Do 14:00' },
    ]);
  });
});

describe('formatSlot', () => {
  it('joins room and time, skipping empty parts', () => {
    expect(formatSlot({ room: 'H-1.10', time: 'Di 10:00' })).toBe('H-1.10 · Di 10:00');
    expect(formatSlot({ room: '', time: 'Di 10:00' })).toBe('Di 10:00');
  });
});

describe('slotLabel', () => {
  it('numbers entries only when there are several', () => {
    expect(slotLabel('Vorlesung', 0, 1)).toBe('Vorlesung');
    expect(slotLabel('Vorlesung', 0, 2)).toBe('Vorlesung 1');
    expect(slotLabel('Übung', 1, 3)).toBe('Übung 2');
  });
});
