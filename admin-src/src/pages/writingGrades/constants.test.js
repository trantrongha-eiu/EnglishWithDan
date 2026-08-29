import { describe, it, expect } from 'vitest';
import { roundHalfBand, taskBandFromCriteria, overallWritingBand } from './constants';

describe('roundHalfBand — IELTS half-band rounding', () => {
  it('rounds an average to the nearest 0.5, .25 up', () => {
    expect(roundHalfBand(5.375)).toBe(5.5);   // (6+5.5+5+5)/4
    expect(roundHalfBand(5.25)).toBe(5.5);    // .25 → up
    expect(roundHalfBand(5.125)).toBe(5);     // → down to whole
    expect(roundHalfBand(5.625)).toBe(5.5);
    expect(roundHalfBand(5.75)).toBe(6);      // .75 → next whole
    expect(roundHalfBand(6)).toBe(6);
  });
});

describe('taskBandFromCriteria', () => {
  it('is the equal-weighted average of TA/CC/LR/GRA, rounded', () => {
    expect(taskBandFromCriteria({ ta: { score: 6 }, cc: { score: 5.5 }, lr: { score: 5 }, gra: { score: 5 } })).toBe('5.5');
    expect(taskBandFromCriteria({ ta: { score: 7 }, cc: { score: 7 }, lr: { score: 6 }, gra: { score: 6 } })).toBe('6.5');
    expect(taskBandFromCriteria({ ta: { score: '6' }, cc: { score: '6' }, lr: { score: '6' }, gra: { score: '5' } })).toBe('6'); // 5.75 → 6
  });
  it('returns "" until all four criteria are numeric', () => {
    expect(taskBandFromCriteria({ ta: { score: 6 }, cc: { score: 6 }, lr: { score: 6 }, gra: { score: '' } })).toBe('');
    expect(taskBandFromCriteria({})).toBe('');
  });
});

describe('overallWritingBand — Task 2 weighted ×2', () => {
  it('uses (T1 + 2·T2) / 3, rounded', () => {
    expect(overallWritingBand(5.5, 5)).toBe('5');    // (5.5 + 10) / 3 = 5.166 → 5
    expect(overallWritingBand(6, 6.5)).toBe('6.5');  // (6 + 13) / 3 = 6.333 → 6.5
    expect(overallWritingBand(7, 6)).toBe('6.5');    // (7 + 12) / 3 = 6.333 → 6.5
  });
  it('falls back to the single present task band', () => {
    expect(overallWritingBand('', 6.5)).toBe('6.5');
    expect(overallWritingBand(6, '')).toBe('6');
    expect(overallWritingBand('', '')).toBe('');
  });
});
