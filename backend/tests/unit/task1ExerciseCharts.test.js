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

describe('Task 1 Grammar — Bộ 1 (rebuilt from the book 2026-11-16)', () => {
  const SET1 = require('../../scripts/data/task1GrammarSet1');
  const KEPT = require('../../scripts/data/task1GrammarSet1Kept.json');
  const { KEEP, DROP } = require('../../scripts/data/task1GrammarSet1Legacy');
  const { checkNewSet } = require('../../scripts/rebuildTask1GrammarSet1');
  const { checkExercise } = require('../../scripts/addTask1GrammarSet2');
  const { allExercises } = require('../../scripts/task1GrammarBank');

  test('90 new exercises, orderIndex 110–199, every one gradeable with a chart + set1 + chart tag', () => {
    expect(SET1.map(e => e.orderIndex).sort((a, b) => a - b)).toEqual(Array.from({ length: 90 }, (_, i) => 110 + i));
    expect(checkNewSet()).toEqual([]);
  });

  test('kept old exercises match the KEEP list, are gradeable, charted and carry no dataContext', () => {
    expect(KEPT.length).toBe(Object.keys(KEEP).length);
    expect(Object.keys(KEEP).filter(k => k in DROP)).toEqual([]);
    KEPT.forEach(e => {
      expect(checkExercise(e)).toEqual([]);
      expect(e.chart).toBeTruthy();
      expect(e.dataContext).toBeUndefined();
      expect(e.tags).toContain('set1');
      expect(e.tags.some(t => t === 'chart:static' || t === 'chart:dynamic')).toBe(true);
    });
  });

  test('the seed bank has unique (module, orderIndex) keys across Bộ 1 + Bộ 2', () => {
    const keys = allExercises().map(e => `${e.module}-${e.orderIndex}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('no exercise still teaches the pre-2026-11-13 Introduction "Cách 3 = compares … in terms of"', () => {
    const SET2 = require('../../scripts/data/task1GrammarSet2');
    const text = JSON.stringify([...SET1, ...KEPT, ...SET2]);
    expect(text).not.toMatch(/Cách 3[^"]{0,40}in terms of/);
  });
});
