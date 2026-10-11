import { describe, expect, it } from 'vitest';
import { makeModule, makeSlot } from '@/test/fixtures';
import {
  buildTimetableEvents,
  eventBox,
  eventTitle,
  layoutOverlaps,
  nowLineTop,
  timeToMinutes,
  visibleHours,
  visibleWeekdays,
} from './timetable';

/**
 * @brief Builds an event-like object from two `HH:MM` times.
 * @param start Start time.
 * @param end End time.
 * @returns Start and end in minutes.
 */
const span = (start: string, end: string) => ({
  start: timeToMinutes(start),
  end: timeToMinutes(end),
});

describe('eventBox', () => {
  it('places events exactly on the hour lines (48 px per hour)', () => {
    expect(eventBox(timeToMinutes('10:00'), timeToMinutes('11:30'), 8, 48)).toEqual({
      top: 96,
      height: 72,
    });
  });

  it('handles quarter hours', () => {
    expect(eventBox(timeToMinutes('14:15'), timeToMinutes('15:45'), 8, 48)).toEqual({
      top: 300,
      height: 72,
    });
    expect(eventBox(timeToMinutes('08:45'), timeToMinutes('09:00'), 8, 44)).toEqual({
      top: 33,
      height: 11,
    });
  });
});

describe('visibleHours', () => {
  it('defaults to 8–18', () => {
    expect(visibleHours([])).toEqual({ startHour: 8, endHour: 18 });
    expect(visibleHours([span('10:00', '11:30')])).toEqual({ startHour: 8, endHour: 18 });
  });

  it('widens to the full hour before and after events outside the range', () => {
    expect(visibleHours([span('07:30', '09:00'), span('18:15', '19:00')])).toEqual({
      startHour: 7,
      endHour: 19,
    });
    expect(visibleHours([span('19:00', '20:30')])).toEqual({ startHour: 8, endHour: 21 });
  });
});

describe('visibleWeekdays', () => {
  it('shows Monday to Friday without events', () => {
    expect(visibleWeekdays([])).toEqual([1, 2, 3, 4, 5]);
  });

  it('adds Saturday or Sunday only when they have an event', () => {
    expect(visibleWeekdays([{ weekday: 6 }])).toEqual([1, 2, 3, 4, 5, 6]);
    expect(visibleWeekdays([{ weekday: 7 }, { weekday: 2 }])).toEqual([1, 2, 3, 4, 5, 7]);
  });
});

describe('layoutOverlaps', () => {
  it('keeps a single event full width', () => {
    expect(layoutOverlaps([span('10:00', '11:30')])).toEqual([{ column: 0, columns: 1 }]);
  });

  it('places three overlapping events side by side', () => {
    expect(
      layoutOverlaps([span('10:00', '12:00'), span('10:30', '11:30'), span('11:00', '13:00')]),
    ).toEqual([
      { column: 0, columns: 3 },
      { column: 1, columns: 3 },
      { column: 2, columns: 3 },
    ]);
  });

  it('reuses a free column inside a group and does not treat touching events as overlap', () => {
    expect(
      layoutOverlaps([
        span('08:00', '10:00'),
        span('08:30', '09:00'),
        span('09:00', '09:30'),
        span('10:00', '11:00'),
      ]),
    ).toEqual([
      { column: 0, columns: 2 },
      { column: 1, columns: 2 },
      { column: 1, columns: 2 },
      { column: 0, columns: 1 },
    ]);
  });

  it('returns nothing for no events', () => {
    expect(layoutOverlaps([])).toEqual([]);
  });
});

describe('nowLineTop', () => {
  it('is only shown inside the visible range', () => {
    const range = { startHour: 8, endHour: 18 };
    expect(nowLineTop(timeToMinutes('09:30'), range, 48)).toBe(72);
    expect(nowLineTop(timeToMinutes('07:59'), range, 48)).toBeNull();
    expect(nowLineTop(timeToMinutes('18:01'), range, 48)).toBeNull();
  });
});

describe('events from modules', () => {
  it('builds titles with "-Ü" for exercises', () => {
    expect(eventTitle('Mathe 1', 'lecture')).toBe('Mathe 1');
    expect(eventTitle('Mathe 1', 'exercise')).toBe('Mathe 1-Ü');
  });

  it('collects complete appointments of all modules, including weekends', () => {
    const events = buildTimetableEvents([
      makeModule({
        id: 'm1',
        name: 'Mathe 1',
        lectures: [
          makeSlot(2, '10:00', '11:30', 'A 1.04'),
          { room: '', weekday: null, start_time: null, end_time: null, time: 'alt' },
        ],
        exercises: [makeSlot(6, '09:00', '10:00')],
      }),
    ]);
    expect(events).toEqual([
      expect.objectContaining({
        id: 'm1-lecture-0',
        title: 'Mathe 1',
        weekday: 2,
        start: 600,
        end: 690,
        room: 'A 1.04',
      }),
      expect.objectContaining({ id: 'm1-exercise-0', title: 'Mathe 1-Ü', weekday: 6 }),
    ]);
    expect(visibleWeekdays(events)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('returns no events without appointments', () => {
    expect(buildTimetableEvents([makeModule({ id: 'm' })])).toEqual([]);
  });
});
