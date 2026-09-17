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
