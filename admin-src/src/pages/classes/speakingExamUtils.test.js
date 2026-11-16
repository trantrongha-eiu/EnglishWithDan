import { describe, expect, test } from 'vitest';
import { slotCount, vnTodayKey } from './speakingExamUtils';

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
