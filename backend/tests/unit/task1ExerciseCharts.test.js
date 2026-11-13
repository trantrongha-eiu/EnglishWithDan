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
    expect(validateSpec('x', { kind: 'multi', charts: [{ kind: 'stat', items: [] }] })).toHaveLength(1);
    expect(validateSpec('x', { kind: 'multi', charts: [{ kind: 'stat', items: [] }, { kind: 'pie', pies: [{ slices: [{ label: 'a', value: 100 }] }] }] })).toEqual([]);
  });
});

describe('Task 1 Grammar — Bộ 2 (+5 per skill)', () => {
  const SET2 = require('../../scripts/data/task1GrammarSet2');
  const { checkExercise } = require('../../scripts/addTask1GrammarSet2');

  test('5 exercises for each of the 7 skills, orderIndex 201–235', () => {
    const per = {};
    SET2.forEach(e => { per[e.skillType] = (per[e.skillType] || 0) + 1; });
    expect(per).toEqual({ noun_phrase: 5, data_description: 5, comparison: 5, trend_language: 5, paraphrase: 5, introduction: 5, overview: 5 });
    expect(SET2.map(e => e.orderIndex).sort((a, b) => a - b)).toEqual(Array.from({ length: 35 }, (_, i) => 201 + i));
  });

  test('every exercise is gradeable (options, blanks, word bank, charts)', () => {
    expect(SET2.flatMap(checkExercise)).toEqual([]);
  });

  test('each So sánh / Xu hướng exercise says whether its chart is static or dynamic', () => {
    SET2.filter(e => e.skillType === 'comparison' || e.skillType === 'trend_language')
      .forEach(e => expect(e.tags.some(t => t === 'chart:static' || t === 'chart:dynamic')).toBe(true));
  });
});
