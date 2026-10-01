'use strict';

// Unit tests for shared/proctor-capture.js — the mandatory screen share
// used to screenshot what a student switched to on each proctoring strike.
const { loadScript } = require('../helpers/loadScript');

function fakeStream(surface) {
  const track = { readyState: 'live', getSettings: () => ({ displaySurface: surface }), stop: jest.fn(), onended: null };
  return { track, stream: { getVideoTracks: () => [track], getTracks: () => [track] } };
}

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

beforeAll(() => {
  window.AuthService = { API: 'http://x/api', authHeader: () => ({ Authorization: 'Bearer t' }) };
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  loadScript('proctor-capture.js');
});

afterEach(() => {
  window.ProctorCapture.release();
  delete navigator.mediaDevices;
  document.body.innerHTML = '';
});

function supportShare(getDisplayMedia) {
  Object.defineProperty(navigator, 'mediaDevices', { value: { getDisplayMedia }, configurable: true });
}

describe('ProctorCapture — devices that cannot share (phones/tablets)', () => {
  test('ensureShare resolves straight away and strikes report capture:"unsupported"', async () => {
    await expect(window.ProctorCapture.ensureShare({ cancelable: true })).resolves.toBe(true);
    expect(window.ProctorCapture.mode()).toBe('unsupported');
    expect(document.getElementById('ews-pc-gate')).toBeNull();
  });
});

describe('ProctorCapture.ensureShare — desktop', () => {
  test('sharing the entire screen resolves true and goes live', async () => {
    const { stream } = fakeStream('monitor');
    const gdm = jest.fn(() => Promise.resolve(stream));
    supportShare(gdm);

    const p = window.ProctorCapture.ensureShare({ cancelable: true });
    expect(window.ProctorCapture.mode()).toBe('none');
    document.getElementById('ews-pc-go').click();

    await expect(p).resolves.toBe(true);
    expect(gdm).toHaveBeenCalledWith(expect.objectContaining({ video: expect.objectContaining({ displaySurface: 'monitor' }), audio: false }));
    expect(window.ProctorCapture.isLive()).toBe(true);
    expect(window.ProctorCapture.mode()).toBe('screen');
    expect(document.getElementById('ews-pc-gate')).toBeNull();
  });

  test('a single tab or window is refused — the gate stays up with an explanation', async () => {
    const { stream, track } = fakeStream('browser');
    supportShare(jest.fn(() => Promise.resolve(stream)));

    window.ProctorCapture.ensureShare({ cancelable: false });
    document.getElementById('ews-pc-go').click();
    await flush();

    expect(track.stop).toHaveBeenCalled();
    expect(window.ProctorCapture.isLive()).toBe(false);
    expect(document.getElementById('ews-pc-err').textContent).toMatch(/Toàn bộ màn hình/);
    expect(document.getElementById('ews-pc-cancel')).toBeNull(); // not cancelable mid-exam
  });

  test('"Huỷ" (pre-start only) resolves false without asking the browser', async () => {
    const gdm = jest.fn();
    supportShare(gdm);
    const p = window.ProctorCapture.ensureShare({ cancelable: true });
    document.getElementById('ews-pc-cancel').click();
    await expect(p).resolves.toBe(false);
    expect(gdm).not.toHaveBeenCalled();
  });

  test('isPicking() covers the browser picker, so its focus change is not a strike', async () => {
    let resolvePick;
    supportShare(jest.fn(() => new Promise((r) => { resolvePick = r; })));
    window.ProctorCapture.ensureShare({ cancelable: false });
    expect(window.ProctorCapture.isPicking()).toBe(false); // gate up, picker not opened yet
    document.getElementById('ews-pc-go').click();
    expect(window.ProctorCapture.isPicking()).toBe(true);
    resolvePick(fakeStream('monitor').stream);
    await flush();
    expect(window.ProctorCapture.isPicking()).toBe(true); // still settling right after
  });
});

describe('ProctorCapture — the student stops sharing mid-test', () => {
  test('calls the onStopped handler and puts the re-share gate back up', async () => {
    const { stream, track } = fakeStream('monitor');
    supportShare(jest.fn(() => Promise.resolve(stream)));
    const p = window.ProctorCapture.ensureShare({});
    document.getElementById('ews-pc-go').click();
    await p;

    const stopped = jest.fn();
    window.ProctorCapture.onStopped(stopped);
    track.readyState = 'ended';
    track.onended();

    expect(stopped).toHaveBeenCalledTimes(1);
    expect(document.getElementById('ews-pc-gate').textContent).toMatch(/dừng chia sẻ/i);
  });

  test('release() stops the share without firing onStopped', async () => {
    const { stream, track } = fakeStream('monitor');
    supportShare(jest.fn(() => Promise.resolve(stream)));
    const p = window.ProctorCapture.ensureShare({});
    document.getElementById('ews-pc-go').click();
    await p;
    const stopped = jest.fn();
    window.ProctorCapture.onStopped(stopped);

    window.ProctorCapture.release();
    expect(track.stop).toHaveBeenCalled();
    expect(stopped).not.toHaveBeenCalled();
    expect(window.ProctorCapture.isLive()).toBe(false);
  });
});

describe('ProctorCapture.shoot', () => {
  test('does nothing without a live share or for a tab close (the page is going away)', () => {
    jest.useFakeTimers();
    global.fetch = jest.fn();
    window.ProctorCapture.shoot({ context: 'mock', attemptId: 'm1', type: 'hidden' });
    window.ProctorCapture.shoot({ context: 'mock', attemptId: 'm1', type: 'unload-attempt' });
    jest.advanceTimersByTime(5000);
    expect(global.fetch).not.toHaveBeenCalled();
    jest.useRealTimers();
    delete global.fetch;
  });
});
