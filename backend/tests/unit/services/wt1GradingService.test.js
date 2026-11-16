'use strict';

// Regression tests for the 2026-11-16 course debug pass (T1 / T2 / Speaking):
// error_correction let a copied wrong sentence pass; sentence_writing's
// local grader could never spot targets like "their … counterparts".
const fs = require('fs');
const path = require('path');
const g = require('../../../services/wt1GradingService');

const ec = (it, a) => g.gradeObjective({ type: 'error_correction', items: [{ id: 'q', ...it }] }, { q: a }).score === 100;

describe('error_correction', () => {
  const it1 = { prompt: 'It help me relax.', answer: 'It helps me relax.' };
  test('copying the wrong sentence is wrong', () => expect(ec(it1, 'It help me relax.')).toBe(false));
  test('the fix passes, with or without the full stop / a typo elsewhere', () => {
    expect(ec(it1, 'it helps me relax')).toBe(true);
    expect(ec({ prompt: 'The number of water used in 2015 was very high.', answer: 'The amount of water used in 2015 was very high.' },
      'The amount of water used in 2015 was vey high.')).toBe(true);
  });
  test('punctuation-only fix needs the punctuation', () => {
    const it = { prompt: 'Well I usually go out with my friends.', answer: 'Well, I usually go out with my friends.' };
    expect(ec(it, 'Well I usually go out with my friends.')).toBe(false);
    expect(ec(it, 'Well, I usually go out with my friends')).toBe(true);
  });
  test('"already correct" items (key = prompt) still pass', () => {
    const s = 'Do you prefer to do your homework in your bedroom?';
    expect(ec({ prompt: s, answer: s }, s)).toBe(true);
  });
  test('a fragment accept is swapped in for errorSpan', () => {
    const it = { prompt: 'The school located in the centre of the map.', answer: 'The school was located in the centre of the map.',
      errorSpan: 'located', accept: ['was located', 'is located'] };
    expect(ec(it, 'The school is located in the centre of the map.')).toBe(true);
  });
});

describe('sentence_writing local grader', () => {
  test('targets with … / alternatives / [slots] are detected', () => {
    const ex = { rubric: { minWords: 5, mustUse: 3, targetStructures: ['their … counterparts', 'S + saw / witnessed / experienced + …', '[Số liệu] + people + V'] } };
    const r = g.gradeWritingLocal(ex, ['Teenagers spent more than their adult counterparts.', 'Sales witnessed a rise as 20 million people travelled.']);
    expect(r.score).toBe(100);
  });
  test('mustUse is capped at the number of targets', () => {
    const ex = { rubric: { minWords: 3, mustUse: 8, targetStructures: ['S + was/were + V3', 'S appeared / disappeared / remained unchanged'] } };
    expect(g.gradeWritingLocal(ex, ['The market was demolished.', 'The church remained unchanged.']).score).toBe(100);
  });
});

// Every course seed's own answer key must grade 100%, and a copied
// error_correction prompt must never pass.
describe('course seeds: answer keys', () => {
  const { sanitizeExercise } = require('../../../services/wt1Service');
  const DATA = path.join(__dirname, '../../../scripts/data');
  for (const [dir, cc] of [['writingTask1', 'IELTS-W-T1'], ['writingTask2', 'IELTS-W-T2'], ['speakingCourse', 'IELTS-SPEAKING']]) {
    test(dir, () => {
      const bad = [];
      for (const f of fs.readdirSync(path.join(DATA, dir)).filter((x) => /^exercises-.*\.json$/.test(x))) {
        for (const ex of JSON.parse(fs.readFileSync(path.join(DATA, dir, f), 'utf8')).exercises) {
          if (!g.OBJECTIVE_TYPES.has(ex.type)) continue;
          const san = sanitizeExercise(ex, cc);
          const ans = {};
          for (const it of ex.items) {
            ans[it.id] = ex.type === 'mcq' ? it.answer
              : ex.type === 'gap_fill' ? it.blanks.map((b) => b.accept[0])
                : ex.type === 'categorize' ? it.category
                  : ex.type === 'matching' ? it.right
                    : ex.type === 'sentence_transform' ? san.items.find((x) => x.id === it.id).translationAnswer
                      : it.answer;
            if (ex.type === 'error_correction' && ec(it, it.prompt)) bad.push(`${ex.code}/${it.id} copy passes`);
          }
          if (g.gradeObjective(ex, ans).score !== 100) bad.push(`${ex.code} key < 100%`);
        }
      }
      expect(bad).toEqual([]);
    });
  }
});
