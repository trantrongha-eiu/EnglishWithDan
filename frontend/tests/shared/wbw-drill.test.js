'use strict';

const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  loadScript('wbw-drill.js');
});

afterEach(() => {
  document.body.innerHTML = '';
});

// Simulates one real keystroke: appends `ch` to the input's current value
// and fires the same 'input' event the browser would (WbwDrill listens to
// 'input', not 'keydown', for per-letter matching).
function typeChar(input, ch) {
  input.value += ch;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function mount(answer, extraOpts) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const onComplete = jest.fn();
  const mounted = window.WbwDrill.mount(host, Object.assign({ answer, onComplete }, extraOpts));
  const input = host.querySelector('[data-role="input"]');
  return { host, input, onComplete, mounted };
}

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function activeWordEl(host) {
  return host.querySelector('.wbwd-word.is-active');
}

describe('WbwDrill — punctuation inside a word (BUG-089: "energy-efficient")', () => {
  test('the hyphen auto-fills the moment it is reached, and typing it explicitly is a harmless no-op', () => {
    const { host, input } = mount('energy-efficient building');
    'energy'.split('').forEach((ch) => typeChar(input, ch));
    expect(activeWordEl(host).classList.contains('is-error')).toBe(false);
    // The hyphen is auto-revealed immediately — no keystroke required, and
    // (the old bug) no keystroke is silently swallowed with zero feedback
    // either, since it's already shown.
    expect(input.value).toBe('energy-');
    expect(activeWordEl(host).textContent).toContain('energy-');

    // The keystroke students were reporting as "not accepted" — pressing it
    // anyway must not error or change anything.
    typeChar(input, '-');
    expect(input.classList.contains('is-error')).toBe(false);
    expect(activeWordEl(host).classList.contains('is-error')).toBe(false);
    expect(input.value).toBe('energy-');
  });

  test('typing the hyphen does not eat into the remaining letter count', () => {
    const { host, input } = mount('energy-efficient building');
    'energy'.split('').forEach((ch) => typeChar(input, ch));
    const starsBefore = activeWordEl(host).querySelector('.wbwd-star').textContent.length;
    typeChar(input, '-');
    const starsAfter = activeWordEl(host).querySelector('.wbwd-star').textContent.length;
    // "efficient" = 9 letters still to go, whether or not "-" was pressed.
    expect(starsBefore).toBe(9);
    expect(starsAfter).toBe(9);
  });

  test('skipping the hyphen entirely (typing straight through) still completes the word', () => {
    const { host, input, onComplete } = mount('energy-efficient building');
    'energyefficient'.split('').forEach((ch) => typeChar(input, ch));
    expect(activeWordEl(host).classList.contains('is-error')).toBe(false);
    // First word done, second word ("building") now active.
    expect(host.querySelectorAll('.wbwd-word.is-done').length).toBe(1);
    expect(activeWordEl(host).getAttribute('data-i')).toBe('1');
    'building'.split('').forEach((ch) => typeChar(input, ch));
    return new Promise((resolve) => setTimeout(() => { expect(onComplete).toHaveBeenCalled(); resolve(); }, 500));
  }, 10000);

  test('typing the hyphen explicitly then finishing the word also completes it', () => {
    const { host, input } = mount('energy-efficient building');
    'energy-efficient'.split('').forEach((ch) => typeChar(input, ch));
    expect(host.querySelectorAll('.wbwd-word.is-done').length).toBe(1);
    expect(activeWordEl(host).getAttribute('data-i')).toBe('1');
  });

  test('a genuinely wrong letter after the hyphen still flashes an error', () => {
    const { host, input } = mount('energy-efficient building');
    'energy-x'.split('').forEach((ch) => typeChar(input, ch));
    expect(activeWordEl(host).classList.contains('is-error')).toBe(true);
    expect(input.value).toBe('energy-'); // the bad "x" was rejected, not appended
  });
});

describe('WbwDrill — Vietnamese tone-mark position (BUG-090: "thảm hoạ" vs "thảm họa")', () => {
  test('a dictionary-style meaning ("họa") is accepted when typed in the older-convention spelling ("hoạ")', () => {
    const { host, input, onComplete } = mount('thảm họa');
    'thảm'.split('').forEach((ch) => typeChar(input, ch));
    expect(host.querySelectorAll('.wbwd-word.is-done').length).toBe(1); // first word matched exactly

    // Student types the other (equally valid) tone-mark placement.
    'hoạ'.split('').forEach((ch) => typeChar(input, ch));
    return new Promise((resolve) => setTimeout(() => { expect(onComplete).toHaveBeenCalled(); resolve(); }, 500));
  }, 10000);

  test('works the other way too: target spelled the older way, student types the current-dictionary way', () => {
    const { host, onComplete, input } = mount('thảm hoạ');
    'thảm'.split('').forEach((ch) => typeChar(input, ch));
    'họa'.split('').forEach((ch) => typeChar(input, ch));
    return new Promise((resolve) => setTimeout(() => { expect(onComplete).toHaveBeenCalled(); resolve(); }, 500));
  }, 10000);

  test('a genuinely different tone is still rejected, not just a different vowel placement', () => {
    const { host, input } = mount('thảm họa'); // target tone = nặng (dot below)
    'thảm'.split('').forEach((ch) => typeChar(input, ch));
    // "hòa" = huyền (grave) tone, not nặng — a real wrong answer, not the
    // same tone on the other vowel.
    'hòa'.split('').forEach((ch) => typeChar(input, ch));
    expect(host.querySelectorAll('.wbwd-word.is-done').length).toBe(1); // still just "thảm"
    expect(activeWordEl(host).getAttribute('data-i')).toBe('1'); // still on the 2nd word
  });
});

describe('WbwDrill — plain words (no punctuation) unaffected', () => {
  test('normal per-letter typing still advances and completes', () => {
    const { host, input, onComplete } = mount('hello world');
    'hello'.split('').forEach((ch) => typeChar(input, ch));
    expect(host.querySelectorAll('.wbwd-word.is-done').length).toBe(1);
    'world'.split('').forEach((ch) => typeChar(input, ch));
    return new Promise((resolve) => setTimeout(() => { expect(onComplete).toHaveBeenCalled(); resolve(); }, 500));
  }, 10000);

  test('a wrong letter flashes an error and is not appended', () => {
    const { host, input } = mount('hello world');
    typeChar(input, 'h');
    typeChar(input, 'x');
    expect(activeWordEl(host).classList.contains('is-error')).toBe(true);
    expect(input.value).toBe('h');
  });
});

describe('WbwDrill — mounting several drills at once on one page (WT1/WT2 multi-item exercises)', () => {
  test('every instance auto-focuses by default — the LAST one mounted wins, since each schedules its own focus() independently', async () => {
    const one = mount('first');
    const two = mount('second');
    await sleep(60);
    // Demonstrates the bug this describe block exists to guard against: with
    // no opt-out, item 2's own after-mount timer fires after item 1's and
    // steals focus — the opposite of the natural top-to-bottom order a
    // multi-item exercise needs.
    expect(document.activeElement).toBe(two.input);
    expect(document.activeElement).not.toBe(one.input);
  });

  test('autoFocus:false opts an instance out, so mounting item 2 without it leaves item 1 focused', async () => {
    const one = mount('first');
    const two = mount('second', { autoFocus: false });
    await sleep(60);
    expect(document.activeElement).toBe(one.input);
    expect(document.activeElement).not.toBe(two.input);
  });

  test('typing still works normally on an autoFocus:false instance once it is manually focused', () => {
    const { input } = mount('cat', { autoFocus: false });
    input.focus();
    typeChar(input, 'c'); typeChar(input, 'a'); typeChar(input, 't');
    expect(input.disabled).toBe(true); // single-word answer fully typed -> drill completes
  });
});
