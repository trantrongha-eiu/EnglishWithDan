/**
 * Task 2 practice → "Viết đoạn kết bài" (short_writing) as click-to-order
 * phrases (js/task2-practice.js: _ordChunks / ordInit / ordPick /
 * ordAskLulu / submitPractice). The model conclusion is one ~35-word
 * sentence, so instead of typing it word by word the student rebuilds it
 * from short phrases: the 3rd wrong check fails it, "Hỏi Lulu" is capped
 * at 3 asks per question, and grading is local (no AI round-trip).
 *
 * The page script runs with an indirect eval like the other page-script
 * tests; `state` / `_ord` are script-scoped, so a getter is appended.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const MODEL = 'In conclusion, although buying more sustains growth and employment, I believe this is largely a negative development, because it creates enormous waste, over-exploits natural resources and fosters a materialistic way of life.';

function setupDom() {
  document.body.innerHTML = `
    <div id="q-dots"></div>
    <div id="qcard">
      <div class="t2-ord" id="t2-ord">
        <span id="ord-count"></span>
        <button id="ord-ask"></button>
        <div id="ord-answer"></div>
        <div id="ord-bank"></div>
      </div>
    </div>
    <button id="submit-btn" disabled></button>
    <div id="checking-loader" class="hidden"><span id="checking-loader-text"></span></div>
    <div id="feedback-card" class="hidden">
      <div id="result-banner"></div><div id="feedback-text"></div>
      <div id="comparison-box"><div id="student-answer-display"></div><div id="model-answer-display"></div></div>
      <div id="explanation-box"><div id="explanation-text"></div></div>
      <div id="t2-countdown-bar"></div>
    </div>`;
}

let t2;

beforeAll(() => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'task2-practice.js'), 'utf8');
  // eslint-disable-next-line no-eval
  window.eval(code + '\n;window.__t2 = { get state() { return state; }, get ord() { return _ord; } };');
  t2 = window.__t2;
  // Side effects that would hit the network / storage / audio.
  window.apiFetch = jest.fn(() => Promise.reject(new Error('no network in tests')));
  window.showToast = jest.fn();
  window.playOk = jest.fn();
  window.playWrong = jest.fn();
  window.saveDraft = jest.fn();
  window.updateXPStorage = jest.fn();
  window.updateSessionStats = jest.fn();
  window._noteMySentence = jest.fn();
});

function startQuestion() {
  setupDom();
  const q = { _id: 'q1', type: 'short_writing', questionText: 'Viết đoạn kết bài', translationAnswer: MODEL };
  Object.assign(t2.state, {
    questions: [q], questionStatus: ['pending'], currentIdx: 0,
    selectedTopic: { _id: 't1' }, sessionDone: 0, sessionCorrect: 0, sessionAttempts: [],
    autoNext: false, _isSubmitting: false,
  });
  window.ordInit();
  return q;
}

function pickInOrder(order) {
  order.forEach((ci) => window.ordPick(ci));
}

beforeEach(() => {
  window.apiFetch.mockClear();
  window.showToast.mockClear();
});

describe('_ordChunks', () => {
  test('splits the model into short phrases that join back to it exactly', () => {
    const chunks = window._ordChunks(MODEL);
    expect(chunks[0]).toBe('In conclusion,');
    expect(chunks.join(' ')).toBe(MODEL);
    expect(chunks.length).toBeGreaterThanOrEqual(5);
    chunks.forEach((c) => expect(c.split(' ').length).toBeLessThanOrEqual(10));
  });

  test('never splits "such | as" or ends a phrase on an article', () => {
    const text = 'In conclusion, although online learning has drawbacks such as a lack of face-to-face interaction and a need for strong self-discipline, its benefits outweigh the disadvantages.';
    const chunks = window._ordChunks(text);
    expect(chunks.join(' ')).toBe(text);
    chunks.forEach((c) => {
      expect(c).not.toMatch(/\bsuch$/);
      expect(c).not.toMatch(/\b(a|an|the)$/i);
    });
  });
});

describe('ordering a conclusion paragraph', () => {
  test('the bank starts shuffled and "Kiểm tra" waits until every phrase is placed', () => {
    startQuestion();
    const o = t2.ord;
    expect(o.chunks.join(' ')).toBe(MODEL);
    expect(o.bank).not.toEqual(o.chunks.map((_, i) => i));
    expect(document.getElementById('ord-bank').children.length).toBe(o.chunks.length);
    const btn = document.getElementById('submit-btn');
    expect(btn.disabled).toBe(true);
    pickInOrder(o.chunks.map((_, i) => i));
    expect(btn.disabled).toBe(false);
    expect(document.getElementById('ord-count').textContent).toBe(`${o.chunks.length} / ${o.chunks.length} cụm`);
  });

  test('the right order is graded correct locally, without the AI check', async () => {
    startQuestion();
    pickInOrder(t2.ord.chunks.map((_, i) => i));
    await window.submitPractice();
    expect(window.apiFetch).not.toHaveBeenCalled();
    expect(t2.state.questionStatus[0]).toBe('correct');
    expect(t2.state.sessionAttempts[0].userAnswer).toBe(MODEL);
  });

  test('a wrong order marks the slip and allows a fix; the 3rd wrong check fails and requeues', async () => {
    const q = startQuestion();
    const n = t2.ord.chunks.length;
    const swapped = [1, 0, ...Array.from({ length: n - 2 }, (_, i) => i + 2)];

    pickInOrder(swapped);
    await window.submitPractice();
    expect(t2.state.questionStatus[0]).toBe('pending');
    expect(document.querySelectorAll('#ord-answer .is-wrong').length).toBe(n);
    expect(q._ordTries).toBe(1);

    await window.submitPractice();
    expect(t2.state.questionStatus[0]).toBe('pending');

    await window.submitPractice();
    expect(window.apiFetch).not.toHaveBeenCalled();
    expect(t2.state.questionStatus[0]).toBe('wrong');
    // Requeued copy comes back with fresh tries and Lulu asks.
    expect(t2.state.questions.length).toBe(2);
    expect(t2.state.questions[1]._ordTries).toBe(0);
    expect(t2.state.questions[1]._luluAsks).toBe(0);
  });

  test('"Hỏi Lulu" takes back wrong phrases, places the next right one, and stops after 3 asks', () => {
    window.AskLulu = { say: jest.fn(), left: jest.fn((btn, left) => { if (left <= 0) btn.disabled = true; }) };
    const q = startQuestion();
    const o = t2.ord;
    window.ordPick(1); // wrong first phrase
    window.ordAskLulu();
    expect(o.picked).toEqual([]);
    window.ordAskLulu();
    expect(o.chunks[o.picked[0]]).toBe(o.chunks[0]);
    window.ordAskLulu();
    expect(o.picked.length).toBe(2);
    window.ordAskLulu(); // 4th: ignored
    expect(o.picked.length).toBe(2);
    expect(window.AskLulu.say).toHaveBeenCalledTimes(3);
    expect(q._luluAsks).toBe(3);
    expect(document.getElementById('ord-ask').disabled).toBe(true);
    delete window.AskLulu;
  });
});
