/**
 * @jest-environment jsdom
 */
// ActivityGate (bottom of js/shared/auth-service.js): background polls must
// stop while the tab is hidden or idle, so a tab left open overnight lets the
// Render instance spin down, and must catch up once the student is back.
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '../../js/shared/auth-service.js'), 'utf8');

function setHidden(hidden) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('ActivityGate.poll', () => {
  let fn;

  beforeEach(() => {
    jest.useFakeTimers();
    delete window.ActivityGate;
    setHidden(false);
    // eslint-disable-next-line no-eval
    window.eval(SRC);
    fn = jest.fn();
  });

  afterEach(() => { jest.useRealTimers(); });

  test('ticks while the student is active', () => {
    window.ActivityGate.poll(fn, 20000);
    jest.advanceTimersByTime(60000);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('stops after IDLE_MS without input, resumes immediately on input', () => {
    window.ActivityGate.poll(fn, 20000);
    jest.advanceTimersByTime(window.ActivityGate.IDLE_MS + 60 * 60 * 1000);
    const callsWhileIdle = fn.mock.calls.length;
    jest.advanceTimersByTime(8 * 60 * 60 * 1000); // the rest of the night
    expect(fn).toHaveBeenCalledTimes(callsWhileIdle);
    expect(callsWhileIdle).toBeLessThanOrEqual(window.ActivityGate.IDLE_MS / 20000);

    window.dispatchEvent(new Event('mousemove'));
    expect(fn).toHaveBeenCalledTimes(callsWhileIdle + 1);
    jest.advanceTimersByTime(20000);
    expect(fn).toHaveBeenCalledTimes(callsWhileIdle + 2);
  });

  test('skips ticks while the tab is hidden, catches up when shown', () => {
    window.ActivityGate.poll(fn, 20000);
    setHidden(true);
    jest.advanceTimersByTime(5 * 60 * 1000);
    expect(fn).not.toHaveBeenCalled();
    setHidden(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('stop() ends the poll and its resume catch-up', () => {
    const h = window.ActivityGate.poll(fn, 20000);
    setHidden(true);
    h.stop();
    setHidden(false);
    jest.advanceTimersByTime(60000);
    expect(fn).not.toHaveBeenCalled();
  });
});
