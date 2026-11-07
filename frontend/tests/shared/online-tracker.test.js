/**
 * @jest-environment jsdom
 */
// js/shared/online-tracker.js — active-time / tab-switch / idle-pause
// measurement, driven through one continuous timeline with a fake clock.
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '../../js/shared/online-tracker.js'), 'utf8');

let visible = true;
let focused = true;
Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (visible ? 'visible' : 'hidden') });
document.hasFocus = () => focused;

const beats = [];
function sum(key, sid) {
  return beats.filter(b => !sid || b.sid === sid).reduce((s, b) => s + (b[key] || 0), 0);
}

// Advance the clock second by second; `input` = the student moves the mouse.
function run(ms, { input = false } = {}) {
  for (let t = 0; t < ms; t += 1000) {
    if (input) document.dispatchEvent(new Event('mousemove'));
    jest.advanceTimersByTime(1000);
  }
}
function leave() { visible = false; document.dispatchEvent(new Event('visibilitychange')); }
function back() { visible = true; document.dispatchEvent(new Event('visibilitychange')); }
function flushNow() { leave(); back(); } // hiding flushes pending data

beforeAll(() => {
  jest.useFakeTimers({ now: new Date('2026-11-07T03:00:00Z') }); // 10:00 VN
  window.fetch = jest.fn((url, opts) => {
    beats.push(JSON.parse(opts.body));
    return Promise.resolve({ status: 200 });
  });
});
afterAll(() => jest.useRealTimers());

test('teachers are not tracked', () => {
  window.AuthService = { API: 'http://api', getToken: () => 'tok', getUser: () => ({ role: 'teacher' }) };
  window.eval(SRC);
  run(40000, { input: true });
  expect(window.fetch).not.toHaveBeenCalled();
  expect(window.__ewdOnlineTracker).toBeUndefined();
});

describe('student timeline', () => {
  let sid;

  beforeAll(() => {
    window.AuthService = { API: 'http://api', getToken: () => 'tok', getUser: () => ({ role: 'student' }) };
    window.eval(SRC);
  });

  test('60 s of studying ≈ 60 active seconds, beats every 30 s', () => {
    run(60000, { input: true });
    expect(beats.length).toBeGreaterThanOrEqual(2);
    sid = beats[0].sid;
    expect(sid).toMatch(/^[a-z0-9]{8,40}$/);
    expect(sum('active')).toBeGreaterThanOrEqual(56);
    expect(sum('active')).toBeLessThanOrEqual(61);
    expect(sum('tabSwitches')).toBe(0);
  });

  test('leaving the tab for 20 s = 1 tab switch, away time not counted', () => {
    const before = sum('active');
    leave();
    run(20000);
    back();
    run(10000, { input: true });
    flushNow();
    expect(sum('tabSwitches')).toBe(1);
    const brk = beats.flatMap(b => b.breaks).find(b => b.type === 'tab');
    expect(brk.seconds).toBeGreaterThanOrEqual(19);
    expect(brk.seconds).toBeLessThanOrEqual(23);
    expect(sum('active') - before).toBeLessThanOrEqual(12);
  });

  test('switching to another app (window blur) counts too; a 2 s blip does not', () => {
    focused = false;
    window.dispatchEvent(new Event('blur'));
    run(2000);
    focused = true;
    window.dispatchEvent(new Event('focus'));
    run(5000, { input: true });
    flushNow();
    expect(sum('tabSwitches')).toBe(1);

    focused = false;
    run(15000);
    focused = true;
    window.dispatchEvent(new Event('focus'));
    run(5000, { input: true });
    flushNow();
    expect(sum('tabSwitches')).toBe(2);
  });

  test('no interaction for 5 min = 1 idle pause; only the first 3 min count', () => {
    const before = sum('active');
    run(5 * 60000);
    document.dispatchEvent(new Event('mousemove'));
    run(5000, { input: true });
    flushNow();
    expect(sum('idlePauses')).toBe(1);
    const idle = beats.flatMap(b => b.breaks).find(b => b.type === 'idle');
    expect(idle.seconds).toBeGreaterThanOrEqual(110);
    expect(idle.seconds).toBeLessThanOrEqual(125);
    const added = sum('active') - before;
    expect(added).toBeGreaterThanOrEqual(178);
    expect(added).toBeLessThanOrEqual(190);
  });

  test('a playing video keeps the time active without input', () => {
    const before = sum('active');
    const v = document.createElement('video');
    Object.defineProperty(v, 'paused', { configurable: true, value: false });
    document.body.appendChild(v);
    run(5 * 60000);
    v.remove();
    run(1000, { input: true });
    flushNow();
    expect(sum('active') - before).toBeGreaterThanOrEqual(295);
    expect(sum('idlePauses')).toBe(1);
  });

  test('away for 31 min starts a new session', () => {
    leave();
    run(31 * 60000);
    back();
    run(10000, { input: true });
    flushNow();
    const last = beats[beats.length - 1];
    expect(last.sid).not.toBe(sid);
    expect(sum('tabSwitches', last.sid)).toBe(0);
    expect(sum('active', last.sid)).toBeGreaterThanOrEqual(8);
  });

  test('every beat is well-formed for the server', () => {
    for (const b of beats) {
      expect(Number.isInteger(b.active)).toBe(true);
      expect(typeof b.startedAt).toBe('number');
      expect(b.lastActiveAt).toBeGreaterThanOrEqual(b.startedAt);
      expect(b.page).toBe('/');
    }
  });
});
