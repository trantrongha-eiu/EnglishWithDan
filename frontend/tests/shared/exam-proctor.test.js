'use strict';

// Unit tests for shared/exam-proctor.js — the generalized Test Simulation
// proctor engine (a parameterized copy of mock-test.js's own, see that
// file's header comment for why it's a copy and not a shared refactor).
const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  window.AuthService = { API: 'http://x/api', authHeader: () => ({ Authorization: 'Bearer t' }) };
  loadScript('exam-proctor.js');
});

afterEach(() => {
  window.ExamProctor.stop();
  document.body.innerHTML = '';
  Object.defineProperty(document, 'hidden', { value: false, configurable: true });
  delete global.fetch;
  jest.restoreAllMocks();
});

function fetchOnce(body) {
  return jest.fn().mockResolvedValueOnce({ json: () => Promise.resolve(body) });
}

// fetch(...).then(r => r.json()).then(d => ...) is a 3-hop microtask chain
// on top of the mocked fetch's own resolution — a couple of bare
// Promise.resolve() awaits aren't reliably enough ticks to drain it.
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('ExamProctor.start / stop', () => {
  test('start() with valid opts arms the engine and renders the badge', () => {
    global.fetch = fetchOnce({ violationCount: 0 });
    window.ExamProctor.start({ skill: 'reading', attemptType: 'full', attemptId: 'a1' });
    expect(window.ExamProctor.isActive()).toBe(true);
    expect(document.getElementById('exam-proctor-badge')).toBeTruthy();
  });

  test('start() is a no-op without a required field (skill/attemptType/attemptId)', () => {
    window.ExamProctor.start({ skill: 'reading', attemptType: 'full' }); // missing attemptId
    expect(window.ExamProctor.isActive()).toBe(false);
    expect(document.getElementById('exam-proctor-badge')).toBeNull();
  });

  test('calling start() twice does not double-arm', () => {
    window.ExamProctor.start({ skill: 'reading', attemptType: 'full', attemptId: 'a1' });
    window.ExamProctor.start({ skill: 'listening', attemptType: 'practice', attemptId: 'a2' });
    expect(document.querySelectorAll('#exam-proctor-badge').length).toBe(1);
  });

  test('stop() tears down the badge and any flash/nav-warn nodes', () => {
    window.ExamProctor.start({ skill: 'reading', attemptType: 'full', attemptId: 'a1' });
    window.ExamProctor.stop();
    expect(window.ExamProctor.isActive()).toBe(false);
    expect(document.getElementById('exam-proctor-badge')).toBeNull();
  });
});

describe('ExamProctor — leaving the tab reports a violation', () => {
  test('hiding the document reports {skill, attemptType, attemptId, type:"hidden"} to the violation endpoint', async () => {
    global.fetch = fetchOnce({ violationCount: 1, violated: true, disqualified: false, cooldownSeconds: 0 });
    window.ExamProctor.start({ skill: 'writing', attemptType: 'practice', attemptId: 'w9' });

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new window.Event('visibilitychange'));
    await flush();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe('http://x/api/exam-simulation/violation');
    expect(JSON.parse(opts.body)).toEqual({ skill: 'writing', attemptType: 'practice', attemptId: 'w9', type: 'hidden' });
  });

  test('a second leave within 1.5s of the first is debounced into one report', async () => {
    global.fetch = fetchOnce({ violationCount: 1 });
    window.ExamProctor.start({ skill: 'reading', attemptType: 'full', attemptId: 'a1' });

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new window.Event('visibilitychange'));
    document.dispatchEvent(new window.Event('visibilitychange')); // fires again immediately
    await flush();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('the badge text reflects the server-confirmed violation count, not a locally-guessed one', async () => {
    global.fetch = fetchOnce({ violationCount: 3, violated: true, disqualified: false, cooldownSeconds: 0 });
    window.ExamProctor.start({ skill: 'reading', attemptType: 'full', attemptId: 'a1' });

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new window.Event('visibilitychange'));
    await flush();

    const badgeText = document.querySelector('#exam-proctor-badge .ep-txt').textContent;
    expect(badgeText).toContain('3/5');
  });
});

describe('ExamProctor — disqualification', () => {
  test('a disqualified response shows the overlay and calls onDisqualified with the cooldown', async () => {
    jest.useFakeTimers();
    global.fetch = fetchOnce({ violationCount: 6, violated: true, disqualified: true, cooldownSeconds: 300 });
    const onDisqualified = jest.fn();
    window.ExamProctor.start({ skill: 'reading', attemptType: 'full', attemptId: 'a1', onDisqualified });

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new window.Event('visibilitychange'));

    // Let the fetch microtask chain resolve under fake timers.
    await jest.runOnlyPendingTimersAsync();

    expect(document.getElementById('exam-proctor-dq-overlay')).toBeTruthy();
    expect(window.ExamProctor.isActive()).toBe(true); // still "active" (not yet stop()'d) until the caller reacts

    jest.advanceTimersByTime(3000);
    expect(onDisqualified).toHaveBeenCalledWith(300);

    jest.useRealTimers();
  });
});
