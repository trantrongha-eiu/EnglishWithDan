'use strict';

// shared/sentence-drill.js — the "gõ từng chữ" drill of Luyện viết câu
// (writing-practice) and Task 1 Grammar (task1-practice). Site-wide rule:
// the 3rd wrong try on one word fails the sentence, which the page grades
// wrong (onWbwFail) and requeues (sdRequeueExercise) so it is redone.

const { loadScript } = require('../helpers/loadScript');

function setupDom() {
  document.body.innerHTML = `
    <div id="wbw" class="hidden">
      <span id="wbw-count"></span>
      <button id="wbw-ask"></button>
      <div id="wbw-words"></div>
      <input id="wbw-input" />
    </div>
    <textarea id="answer-box"></textarea>`;
}

function typeChar(ch) {
  const input = document.getElementById('wbw-input');
  input.value += ch;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

beforeAll(() => {
  // Page globals sentence-drill.js reads at call time.
  window._isSubmitting = false;
  window.submitAnswer = jest.fn();
  window.onWbwFail = jest.fn();
  loadScript('sentence-drill.js');
});

beforeEach(() => {
  setupDom();
  window.submitAnswer.mockClear();
  window.onWbwFail.mockClear();
});

describe('sentence-drill — 3 wrong tries on one word fails the sentence', () => {
  test('two wrong tries on a word are still allowed; finishing completes normally', async () => {
    window.wbwInit('big red');
    typeChar('x'); await sleep(300);
    typeChar('x'); await sleep(300);
    'big'.split('').forEach(typeChar);
    'red'.split('').forEach(typeChar);
    await sleep(600);
    expect(window.onWbwFail).not.toHaveBeenCalled();
    expect(window.submitAnswer).toHaveBeenCalledTimes(1);
  }, 10000);

  test('wrong tries on different words do not add up', async () => {
    window.wbwInit('big red');
    typeChar('x'); await sleep(300);
    typeChar('x'); await sleep(300);
    'big'.split('').forEach(typeChar);
    typeChar('x'); await sleep(300);
    typeChar('x'); await sleep(300);
    'red'.split('').forEach(typeChar);
    await sleep(600);
    expect(window.onWbwFail).not.toHaveBeenCalled();
    expect(window.submitAnswer).toHaveBeenCalledTimes(1);
  }, 10000);

  test('the 3rd wrong try locks the drill and calls onWbwFail with the stuck word, never submitAnswer', async () => {
    window.wbwInit('big red cat');
    'big'.split('').forEach(typeChar);
    for (let i = 0; i < 3; i++) { typeChar('x'); await sleep(300); }
    expect(document.getElementById('wbw-input').disabled).toBe(true);
    await sleep(500);
    expect(window.onWbwFail).toHaveBeenCalledTimes(1);
    expect(window.onWbwFail).toHaveBeenCalledWith({ word: 'red', sofar: 'big' });
    expect(window.submitAnswer).not.toHaveBeenCalled();
    // The green "X / X từ" pill would read as success.
    expect(document.getElementById('wbw-count').classList.contains('is-full')).toBe(false);
  }, 10000);
});

describe('sentence-drill — sdRequeueExercise / sdWithoutRepeats', () => {
  test('puts a copy 3 exercises later, at most twice, and the copies can be stripped', () => {
    const list = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ _id: id }));
    expect(window.sdRequeueExercise(list, 0)).toBe(true);
    expect(list.map((x) => x._id)).toEqual(['a', 'b', 'c', 'd', 'a', 'e', 'f']);
    expect(list[4]._isRepeat).toBe(true);
    expect(window.sdRequeueExercise(list, 4)).toBe(true);
    expect(window.sdRequeueExercise(list, 4)).toBe(false); // already back twice
    expect(window.sdWithoutRepeats(list).map((x) => x._id)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  test('near the end the copy goes last', () => {
    const list = [{ _id: 'a' }, { _id: 'b' }];
    window.sdRequeueExercise(list, 1);
    expect(list.map((x) => x._id)).toEqual(['a', 'b', 'b']);
  });
});

describe('sentence-drill — "Hỏi Lulu" is capped at 3 asks per sentence', () => {
  afterEach(() => { delete window.AskLulu; });

  test('the 4th ask is ignored and the button is disabled; a new sentence resets it', () => {
    const say = jest.fn();
    const left = jest.fn((btn, n) => { if (n <= 0) btn.disabled = true; });
    window.AskLulu = { say, left, MAX: 3 };
    window.wbwInit('because');
    const btn = document.getElementById('wbw-ask');
    expect(left).toHaveBeenLastCalledWith(btn, 3);
    for (let i = 0; i < 4; i++) window.wbwAskLulu();
    expect(say).toHaveBeenCalledTimes(3);
    expect(left).toHaveBeenLastCalledWith(btn, 0);
    expect(btn.disabled).toBe(true);

    window.wbwInit('since');
    expect(btn.disabled).toBe(false);
    window.wbwAskLulu();
    expect(say).toHaveBeenCalledTimes(4);
  });
});
