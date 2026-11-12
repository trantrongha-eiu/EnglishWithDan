'use strict';

const CHARTS = require('../../scripts/data/task1ExerciseCharts');
const { validateSpec } = require('../../scripts/setTask1ExerciseCharts');

describe('Task 1 Grammar chart specs', () => {
  test('every spec is well-formed (kinds, value counts, pies sum to 100)', () => {
    const errs = Object.entries(CHARTS).flatMap(([k, s]) => validateSpec(k, s));
    expect(errs).toEqual([]);
  });

  test('keys are "<module>-<orderIndex>"', () => {
    Object.keys(CHARTS).forEach(k => expect(k).toMatch(/^[1-4]-\d+$/));
  });

  test('validateSpec catches a mismatched series', () => {
    expect(validateSpec('x', { kind: 'line', labels: ['a', 'b'], series: [{ values: [1] }] })).toHaveLength(1);
    expect(validateSpec('x', { kind: 'pie', pies: [{ slices: [{ label: 'a', value: 60 }] }] })).toHaveLength(1);
    expect(validateSpec('x', { kind: 'nope' })).toHaveLength(1);
  });
});
