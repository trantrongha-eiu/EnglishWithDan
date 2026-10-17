'use strict';

// Unit tests for shared/exam-mode-select.js — the Practice/Test Simulation
// popup shown before starting any Reading/Listening/Writing attempt.
const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  window.AuthService = { API: 'http://x/api', authHeader: () => ({ Authorization: 'Bearer t' }) };
  loadScript('exam-mode-select.js');
});

afterEach(() => {
  document.body.innerHTML = '';
  document.getElementById('ews-mode-select-modal')?.remove();
  delete global.fetch;
  jest.restoreAllMocks();
  jest.useRealTimers();
});

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// The Simulation button first waits on the screen-share gate
// (ProctorCapture.ensureShare — absent here, so an already-resolved
// promise); onSimulation runs a microtask later.
function microtasks() {
  return Promise.resolve().then(() => Promise.resolve());
}

function fetchOnce(body) {
  return jest.fn().mockResolvedValueOnce({ json: () => Promise.resolve(body) });
}

describe('ExamModeSelect.open', () => {
  test('Practice button calls onPractice and closes the modal without hitting the network', async () => {
    global.fetch = fetchOnce({ active: false, remainingSeconds: 0 });
    const onPractice = jest.fn();
    window.ExamModeSelect.open({ skill: 'reading', onPractice, onSimulation: jest.fn() });

    document.getElementById('ews-ms-practice-btn').click();

    expect(onPractice).toHaveBeenCalledTimes(1);
    expect(document.getElementById('ews-mode-select-modal').classList.contains('hidden')).toBe(true);
  });

  test('when not on cooldown, the Simulation button is enabled and calls onSimulation', async () => {
    global.fetch = fetchOnce({ active: false, remainingSeconds: 0 });
    const onSimulation = jest.fn();
    window.ExamModeSelect.open({ skill: 'listening', onPractice: jest.fn(), onSimulation });
    await flush();

    const simBtn = document.getElementById('ews-ms-sim-btn');
    expect(simBtn.disabled).toBe(false);
    simBtn.click();
    await microtasks();
    expect(onSimulation).toHaveBeenCalledTimes(1);
  });

  test('when on cooldown, the Simulation button is disabled and shows a countdown', async () => {
    global.fetch = fetchOnce({ active: true, remainingSeconds: 125 });
    window.ExamModeSelect.open({ skill: 'writing', onPractice: jest.fn(), onSimulation: jest.fn() });
    await flush();

    const simBtn = document.getElementById('ews-ms-sim-btn');
    expect(simBtn.disabled).toBe(true);
    expect(document.getElementById('ews-ms-sim-status').textContent).toMatch(/2:0[45]/);
  });

  test('the cooldown countdown ticks down and re-enables the button at zero', async () => {
    jest.useFakeTimers();
    global.fetch = fetchOnce({ active: true, remainingSeconds: 2 });
    const onSimulation = jest.fn();
    window.ExamModeSelect.open({ skill: 'reading', onPractice: jest.fn(), onSimulation });
    await jest.runOnlyPendingTimersAsync();

    const simBtn = document.getElementById('ews-ms-sim-btn');
    expect(simBtn.disabled).toBe(true);

    jest.advanceTimersByTime(3000);
    expect(simBtn.disabled).toBe(false);
    simBtn.click();
    await microtasks();
    expect(onSimulation).toHaveBeenCalledTimes(1);
  });

  test('a failed cooldown check keeps Simulation disabled (fails safe) and offers a retry', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('network down'));
    window.ExamModeSelect.open({ skill: 'reading', onPractice: jest.fn(), onSimulation: jest.fn() });
    await flush();

    const simBtn = document.getElementById('ews-ms-sim-btn');
    expect(simBtn.disabled).toBe(true);
    expect(document.getElementById('ews-ms-retry')).toBeTruthy();
  });

  test('reopening re-checks the cooldown from scratch (hits the network again)', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ active: false, remainingSeconds: 0 }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ active: false, remainingSeconds: 0 }) });
    window.ExamModeSelect.open({ skill: 'reading', onPractice: jest.fn(), onSimulation: jest.fn() });
    await flush();
    window.ExamModeSelect.open({ skill: 'reading', onPractice: jest.fn(), onSimulation: jest.fn() });
    await flush();

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

describe('ExamModeSelect.open — preferred (from a ?exam= link)', () => {
  test('preferred simulation shows only the Simulation card plus a way back to both', async () => {
    global.fetch = fetchOnce({ active: false, remainingSeconds: 0 });
    const onSimulation = jest.fn();
    window.ExamModeSelect.open({ skill: 'reading', preferred: 'simulation', onPractice: jest.fn(), onSimulation });
    await flush();

    const grid = document.getElementById('ews-ms-grid');
    const other = document.getElementById('ews-ms-other-btn');
    expect(grid.classList.contains('ews-ms-only-simulation')).toBe(true);
    expect(other.classList.contains('hidden')).toBe(false);

    other.click();
    expect(grid.className).toBe('ews-ms-grid');
    expect(other.classList.contains('hidden')).toBe(true);

    document.getElementById('ews-ms-sim-btn').click();
    await microtasks();
    expect(onSimulation).toHaveBeenCalledTimes(1);
  });

  test('without preferred (or with junk), both cards show and the switch link is hidden', () => {
    global.fetch = fetchOnce({ active: false, remainingSeconds: 0 });
    window.ExamModeSelect.open({ skill: 'reading', preferred: 'bogus', onPractice: jest.fn(), onSimulation: jest.fn() });
    expect(document.getElementById('ews-ms-grid').className).toBe('ews-ms-grid');
    expect(document.getElementById('ews-ms-other-btn').classList.contains('hidden')).toBe(true);
  });

  test('a preferred-practice open followed by a plain open resets the layout', () => {
    global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve({ active: false }) });
    window.ExamModeSelect.open({ skill: 'writing', preferred: 'practice', onPractice: jest.fn(), onSimulation: jest.fn() });
    expect(document.getElementById('ews-ms-grid').classList.contains('ews-ms-only-practice')).toBe(true);
    window.ExamModeSelect.open({ skill: 'writing', onPractice: jest.fn(), onSimulation: jest.fn() });
    expect(document.getElementById('ews-ms-grid').className).toBe('ews-ms-grid');
  });
});

describe('ExamModeSelect — Simulation requires the screen share', () => {
  afterEach(() => { delete window.ProctorCapture; });

  test('onSimulation only runs once the share is granted; "Huỷ" on the gate starts nothing', async () => {
    let answer;
    window.ProctorCapture = { ensureShare: jest.fn(() => Promise.resolve(answer)) };

    for (const granted of [false, true]) {
      answer = granted;
      global.fetch = fetchOnce({ active: false, remainingSeconds: 0 });
      const onSimulation = jest.fn();
      window.ExamModeSelect.open({ skill: 'reading', onPractice: jest.fn(), onSimulation });
      await flush();
      document.getElementById('ews-ms-sim-btn').click();
      await microtasks();
      expect(window.ProctorCapture.ensureShare).toHaveBeenLastCalledWith({ cancelable: true });
      expect(onSimulation).toHaveBeenCalledTimes(granted ? 1 : 0);
    }
  });
});

describe('ExamModeSelect — "Chọn phần làm"', () => {
  const READING = { count: 3, unit: 'Passage', minutesEach: 20 };
  const chip = (n) => document.querySelector(`#ews-ms-chips .ews-ms-chip[data-part="${n}"]`);

  test('no parts option → no picker, callbacks get null', () => {
    global.fetch = fetchOnce({ active: false });
    const onPractice = jest.fn();
    window.ExamModeSelect.open({ skill: 'writing', onPractice, onSimulation: jest.fn() });
    expect(document.getElementById('ews-ms-parts').classList.contains('hidden')).toBe(true);
    document.getElementById('ews-ms-practice-btn').click();
    expect(onPractice).toHaveBeenCalledWith(null);
  });

  test('all passages picked by default = whole test (null), 60 phút', () => {
    global.fetch = fetchOnce({ active: false });
    const onPractice = jest.fn();
    window.ExamModeSelect.open({ skill: 'reading', parts: READING, onPractice, onSimulation: jest.fn() });
    expect(document.querySelectorAll('#ews-ms-chips .ews-ms-chip')).toHaveLength(3);
    expect(document.getElementById('ews-ms-parts-sum').textContent).toBe('Cả bài · 60 phút');
    document.getElementById('ews-ms-practice-btn').click();
    expect(onPractice).toHaveBeenCalledWith(null);
  });

  test('two passages → 40 phút, Simulation gets the picked numbers', async () => {
    global.fetch = fetchOnce({ active: false });
    const onSimulation = jest.fn();
    window.ExamModeSelect.open({ skill: 'reading', parts: READING, onPractice: jest.fn(), onSimulation });
    await flush();
    chip(2).click();
    expect(chip(2).getAttribute('aria-pressed')).toBe('false');
    expect(document.getElementById('ews-ms-parts-sum').textContent).toBe('2 passage · 40 phút');
    document.getElementById('ews-ms-sim-btn').click();
    await microtasks();
    expect(onSimulation).toHaveBeenCalledWith([1, 3]);
  });

  test('nothing picked disables both buttons; re-picking keeps a cooled-down Simulation disabled', async () => {
    global.fetch = fetchOnce({ active: true, remainingSeconds: 60 });
    window.ExamModeSelect.open({ skill: 'reading', parts: READING, onPractice: jest.fn(), onSimulation: jest.fn() });
    await flush();
    [1, 2, 3].forEach(n => chip(n).click());
    expect(document.getElementById('ews-ms-practice-btn').disabled).toBe(true);
    expect(document.getElementById('ews-ms-sim-btn').disabled).toBe(true);
    chip(1).click();
    expect(document.getElementById('ews-ms-practice-btn').disabled).toBe(false);
    expect(document.getElementById('ews-ms-sim-btn').disabled).toBe(true);
  });

  test('picked (from a ?parts= link) pre-selects only those sections', () => {
    global.fetch = fetchOnce({ active: false });
    const onPractice = jest.fn();
    window.ExamModeSelect.open({ skill: 'listening', parts: { count: 4, unit: 'Section', picked: [1, 2] }, onPractice, onSimulation: jest.fn() });
    expect(chip(1).getAttribute('aria-pressed')).toBe('true');
    expect(chip(3).getAttribute('aria-pressed')).toBe('false');
    expect(document.getElementById('ews-ms-parts-sum').textContent).toBe('2 section');
    document.getElementById('ews-ms-practice-btn').click();
    expect(onPractice).toHaveBeenCalledWith([1, 2]);
  });

  test('available:false (no per-section audio) shows no chips and starts the whole test', () => {
    global.fetch = fetchOnce({ active: false });
    const onPractice = jest.fn();
    window.ExamModeSelect.open({ skill: 'listening', parts: { count: 4, unit: 'Section', available: false }, onPractice, onSimulation: jest.fn() });
    expect(document.querySelectorAll('#ews-ms-chips .ews-ms-chip')).toHaveLength(0);
    expect(document.getElementById('ews-ms-parts-note').textContent).toMatch(/chỉ làm được cả bài/);
    document.getElementById('ews-ms-practice-btn').click();
    expect(onPractice).toHaveBeenCalledWith(null);
  });
});
