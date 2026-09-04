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

function mount(answer) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const onComplete = jest.fn();
  const mounted = window.WbwDrill.mount(host, { answer, onComplete });
  const input = host.querySelector('[data-role="input"]');
  return { host, input, onComplete, mounted };
}

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
