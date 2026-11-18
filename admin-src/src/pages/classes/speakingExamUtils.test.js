import { describe, expect, test } from 'vitest';
import { addDays, buildRanges, dayParts, slotCount, vnTodayKey, weekDays, weekLabel, weekStart } from './speakingExamUtils';

describe('slotCount (25-minute speaking exam slots)', () => {
  test('counts whole 25-minute slots inside the window', () => {
    expect(slotCount('14:00', '15:20')).toBe(3);
    expect(slotCount('14:00', '14:25')).toBe(1);
    expect(slotCount('08:00', '11:00')).toBe(7);
  });
  test('too short, reversed or blank windows give 0', () => {
    expect(slotCount('14:00', '14:20')).toBe(0);
    expect(slotCount('15:00', '14:00')).toBe(0);
    expect(slotCount('', '14:00')).toBe(0);
  });
});

describe('vnTodayKey', () => {
  test('uses the Vietnam day (UTC+7)', () => {
    expect(vnTodayKey(Date.parse('2026-11-16T18:30:00Z'))).toBe('2026-11-17');
    expect(vnTodayKey(Date.parse('2026-11-16T16:30:00Z'))).toBe('2026-11-16');
  });
});

describe('weeks run Monday → Sunday', () => {
  test('weekStart finds the Monday, including from a Sunday', () => {
    expect(weekStart('2026-11-16')).toBe('2026-11-16'); // Monday
    expect(weekStart('2026-11-18')).toBe('2026-11-16');
    expect(weekStart('2026-11-22')).toBe('2026-11-16'); // Sunday
    expect(weekStart('2026-11-23')).toBe('2026-11-23');
  });
  test('week helpers cross month and year ends', () => {
    expect(addDays('2026-12-28', 7)).toBe('2027-01-04');
    expect(weekDays('2026-12-28')[6]).toBe('2027-01-03');
    expect(weekLabel('2026-12-28')).toBe('28/12 – 03/01');
    expect(dayParts('2026-11-22')).toEqual({ weekday: 'CN', date: '22/11' });
  });
});

describe('buildRanges', () => {
  test('every picked day gets every complete window, days in order', () => {
    expect(buildRanges(['2026-11-20', '2026-11-18'], [{ from: '09:00', to: '10:00' }, { from: '14:00', to: '' }]))
      .toEqual([
        { date: '2026-11-18', from: '09:00', to: '10:00' },
        { date: '2026-11-20', from: '09:00', to: '10:00' },
      ]);
  });
});
