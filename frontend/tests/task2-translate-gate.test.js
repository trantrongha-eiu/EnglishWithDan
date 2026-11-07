/**
 * Task 2 practice → the writing steps (⑤ Viết trên lớp, ⑥ Bài về nhà and
 * the split-screen writer) stay locked until at least 70% of the lesson's
 * "Dịch câu" sentences are translated correctly (js/task2-practice.js:
 * translateProgress / isWritingUnlocked). Staff are never gated.
 *
 * Loaded like the other page-script tests; `state` is script-scoped, so a
 * getter is appended.
 */
'use strict';

const fs = require('fs');
const path = require('path');

let t2;
let staff;

beforeAll(() => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'task2-practice.js'), 'utf8');
  // eslint-disable-next-line no-eval
  window.eval(code + '\n;window.__t2 = { get state() { return state; } };');
  t2 = window.__t2;
  window.isVocabStepDone = () => true; // step ① done — only the translate gate matters here
  window.AuthService = { isLoggedIn: () => true, isStaff: () => staff, getToken: () => 'x' };
  window.showToast = jest.fn();
});

// n sentences, the first `correct` translated right, the next `wrong` translated wrong.
function setLesson(n, correct, wrong = 0) {
  const sentences = Array.from({ length: n }, (_, i) => ({
    questionId: 'q' + i,
    en: i < correct + wrong ? 'my answer' : '',
    isCorrect: i < correct ? true : i < correct + wrong ? false : null,
  }));
  t2.state.selectedTopic = { _id: 'T1', topicName: 'Topic' };
  t2.state.lesson = { topicId: 'T1', status: 'ready', sentences, sections: window._emptySections(), submittedAt: null };
}

beforeEach(() => {
  staff = false;
  window.showToast.mockClear();
});

describe('translateProgress / isWritingUnlocked', () => {
  test('below 70% correct keeps writing locked and says how many more are needed', () => {
    setLesson(10, 6, 4);
    const tp = window.translateProgress('T1');
    expect(tp).toMatchObject({ total: 10, translated: 10, correct: 6, pct: 60, passed: false, need: 1 });
    expect(window.isWritingUnlocked('T1')).toBe(false);
    expect(window.translateGateMessage('T1')).toContain('6/10');
  });

  test('exactly 70% correct unlocks writing', () => {
    setLesson(10, 7, 3);
    expect(window.translateProgress('T1').passed).toBe(true);
    expect(window.isWritingUnlocked('T1')).toBe(true);
  });

  test('70% is rounded up to whole sentences (7 sentences → 5 correct needed)', () => {
    setLesson(7, 4);
    expect(window.translateProgress('T1').need).toBe(1);
    setLesson(7, 5);
    expect(window.isWritingUnlocked('T1')).toBe(true);
  });

  test('stays locked while the lesson is still loading', () => {
    setLesson(10, 10);
    t2.state.lesson.status = 'loading';
    expect(window.translateProgress('T1')).toBeNull();
    expect(window.isWritingUnlocked('T1')).toBe(false);
  });

  test('a lesson with no translate sentences is not gated', () => {
    setLesson(0, 0);
    expect(window.isWritingUnlocked('T1')).toBe(true);
  });

  test('staff are never gated', () => {
    staff = true;
    setLesson(10, 0);
    expect(window.isWritingUnlocked('T1')).toBe(true);
  });
});

describe('the hub and the writer respect the gate', () => {
  test('⑤ and ⑥ render locked with the reason below 70%, open at 70%', () => {
    setLesson(10, 5, 5);
    const cls = window.renderClassStep(false);
    expect(cls).toContain('is-locked');
    expect(cls).toContain('5/10');
    expect(window.renderHomeStep(false)).toContain('is-locked');

    setLesson(10, 7, 3);
    expect(window.renderClassStep(false)).not.toContain('is-locked');
    expect(window.renderHomeStep(false)).not.toContain('is-locked');
  });

  test('the Dịch câu rail step is not done until the 70% is reached', () => {
    setLesson(10, 5, 5);
    const step = (id) => window._lessonSteps(t2.state.selectedTopic).find((s) => s.key === id);
    expect(step('translate').done).toBe(false);
    setLesson(10, 7, 3);
    expect(step('translate').done).toBe(true);
  });

  test('openCompose refuses to open the writer below 70%', async () => {
    setLesson(10, 5, 5);
    t2.state.vocabFor = 'T1';
    t2.state.view = 'select';
    window.scrollToHubStep = jest.fn();
    await window.openCompose('class');
    expect(t2.state.view).toBe('select');
    expect(window.showToast).toHaveBeenCalledWith(expect.stringContaining('70%'), 'warn', 6000);
  });
});
