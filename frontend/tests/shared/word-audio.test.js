'use strict';

// word-audio.js: dictionary recordings first, no needless waiting on a tap.
const { loadScript } = require('../helpers/loadScript');

const OX = (w, r) => `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${w}--_${r}_1.mp3`;
const DICT = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

let remote;   // url → 'ok' | 'missing' (anything else never answers)
let plays;    // every play() call: the src that was playing
let spoken;   // every TTS utterance

class FakeAudio {
  constructor() { this._l = {}; this.src = ''; FakeAudio.all.push(this); }
  addEventListener(ev, fn) { (this._l[ev] = this._l[ev] || []).push(fn); }
  emit(ev) { (this._l[ev] || []).forEach((f) => f()); if (this['on' + ev]) this['on' + ev](); }
  removeAttribute() { this.src = ''; }
  load() {
    const r = remote[this.src];
    if (r === 'ok') setTimeout(() => this.emit('loadedmetadata'), 0);
    else if (r === 'missing') setTimeout(() => this.emit('error'), 0);
  }
  play() {
    const src = this.src;
    plays.push(src);
    const ok = src.startsWith('data:') || remote[src] === 'ok';
    setTimeout(() => { if (this.src === src) this.emit(ok ? 'ended' : 'error'); }, 0);
    return Promise.resolve();
  }
  pause() {}
}

function load(stored) {
  localStorage.clear();
  if (stored) localStorage.setItem('ews_word_audio_v1', JSON.stringify(stored));
  loadScript('word-audio.js');
  return window.WordAudio;
}

function mockDict(statusFor) {
  global.fetch = jest.fn((url) => {
    const w = decodeURIComponent(String(url).slice(DICT.length));
    const st = statusFor[w] || 404;
    const body = st === 200 ? [{ phonetics: [{ audio: `https://api.dictionaryapi.dev/media/pronunciations/en/${w}-us.mp3` }] }] : {};
    return Promise.resolve({ ok: st === 200, status: st, json: () => Promise.resolve(body) });
  });
}

beforeEach(() => {
  remote = {};
  plays = [];
  spoken = [];
  FakeAudio.all = [];
  window.Audio = FakeAudio;
  global.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
  window.speechSynthesis = {
    getVoices: () => [],
    cancel() {},
    speak(u) { spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 0); },
  };
  mockDict({});
  document.body.innerHTML = '';
});

afterEach(() => { delete global.fetch; });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('a known word plays at once on a back-to-back tap — no lead-in, no lookup', async () => {
  remote[OX('hello', 'us')] = 'ok';
  const WA = load({ hello: OX('hello', 'us') });

  await WA.speak('hello');                       // cold: silent lead-in first
  expect(plays[0]).toMatch(/^data:audio\/wav/);
  expect(plays[1]).toBe(OX('hello', 'us'));

  plays = [];
  WA.speak('Hello');                             // warm: plays inside the tap
  expect(plays).toEqual([OX('hello', 'us')]);
  expect(global.fetch).not.toHaveBeenCalled();
});

test('an unknown word uses the Oxford US recording and remembers it', async () => {
  remote[OX('mitigate', 'us')] = 'ok';
  const WA = load();
  await WA.speak('mitigate');
  expect(plays[plays.length - 1]).toBe(OX('mitigate', 'us'));
  expect(JSON.parse(localStorage.getItem('ews_word_audio_v1')).mitigate).toBe(OX('mitigate', 'us'));
  expect(spoken).toEqual([]);
});

test('falls back to the Oxford UK recording, then the dictionary API', async () => {
  remote[OX('programme', 'us')] = 'missing';
  remote[OX('programme', 'gb')] = 'ok';
  remote[OX('deteriorate', 'us')] = 'missing';
  remote[OX('deteriorate', 'gb')] = 'missing';
  const dictMp3 = 'https://api.dictionaryapi.dev/media/pronunciations/en/deteriorate-us.mp3';
  remote[dictMp3] = 'ok';
  mockDict({ deteriorate: 200 });
  const WA = load();

  await WA.speak('programme');
  expect(plays[plays.length - 1]).toBe(OX('programme', 'gb'));
  await WA.speak('deteriorate');
  expect(plays[plays.length - 1]).toBe(dictMp3);
  expect(spoken).toEqual([]);
});

test('no recording anywhere → TTS, and the miss is remembered only when every source answered', async () => {
  for (const w of ['mitigated', 'flaky']) {
    remote[OX(w, 'us')] = 'missing';
    remote[OX(w, 'gb')] = 'missing';
  }
  mockDict({ mitigated: 404, flaky: 530 });     // 530 = dictionary API outage
  const WA = load();

  await WA.speak('mitigated');
  await WA.speak('flaky');
  expect(spoken).toEqual(['mitigated', 'flaky']);
  const misses = JSON.parse(localStorage.getItem('ews_word_audio_miss_v1') || '{}');
  expect(Object.keys(misses)).toEqual(['mitigated']);

  // Next visit: the confirmed miss goes straight to TTS without a lookup.
  global.fetch.mockClear();
  loadScript('word-audio.js');
  await window.WordAudio.speak('mitigated');
  expect(global.fetch).not.toHaveBeenCalled();
  expect(spoken[spoken.length - 1]).toBe('mitigated');
});

test('a stored recording that no longer plays falls back to TTS and is forgotten', async () => {
  const gone = OX('vanish', 'us');
  remote[gone] = 'missing';
  const WA = load({ vanish: gone });
  await WA.speak('vanish');
  expect(spoken).toEqual(['vanish']);
  expect(JSON.parse(localStorage.getItem('ews_word_audio_v1')).vanish).toBeUndefined();
});

test('phrases go straight to TTS without any lookup', async () => {
  const WA = load();
  await WA.speak('carbon footprint');
  expect(spoken).toEqual(['carbon footprint']);
  expect(global.fetch).not.toHaveBeenCalled();
  expect(FakeAudio.all.filter((a) => a.src.includes('gstatic'))).toHaveLength(0);
});

test('🔊 buttons rendered with speakWord(\'…\') are prefetched before the tap', async () => {
  remote[OX('ubiquitous', 'us')] = 'ok';
  remote[OX("o'clock", 'us')] = 'ok';
  load();
  document.body.innerHTML = `
    <button onclick="speakWord('ubiquitous')">🔊</button>
    <button onclick="speakWord('o\\'clock')">🔊</button>`;
  await wait(400);
  const stored = JSON.parse(localStorage.getItem('ews_word_audio_v1') || '{}');
  expect(stored.ubiquitous).toBe(OX('ubiquitous', 'us'));
  expect(stored["o'clock"]).toBe(OX("o'clock", 'us'));
  expect(plays).toEqual([]);                    // prefetch never plays anything
});

describe('neural voice', () => {
  const MP3 = 'https://media.test/tts/v1/sophia/abc.mp3';
  const ttsCalls = () => global.fetch.mock.calls.filter(([u]) => String(u).endsWith('/tts/speech'));

  function mockTts(status, url = MP3) {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: status === 200, status, json: () => Promise.resolve({ success: status === 200, url }),
    }));
  }
  function signedIn() {
    const WA = load();
    localStorage.setItem('token', 't');
    return WA;
  }

  test('a phrase uses the neural voice and is remembered for the next tap', async () => {
    remote[MP3] = 'ok';
    mockTts(200);
    const WA = signedIn();
    await WA.speak('carbon footprint');
    expect(plays[plays.length - 1]).toBe(MP3);
    expect(spoken).toEqual([]);
    expect(JSON.parse(ttsCalls()[0][1].body)).toEqual({ text: 'carbon footprint' });

    await WA.speak('carbon footprint');
    expect(ttsCalls()).toHaveLength(1);
  });

  test('a dictionary recording still wins over the neural voice', async () => {
    remote[OX('mitigate', 'us')] = 'ok';
    mockTts(200);
    const WA = signedIn();
    await WA.speak('mitigate');
    expect(plays[plays.length - 1]).toBe(OX('mitigate', 'us'));
    expect(ttsCalls()).toHaveLength(0);
  });

  test('service off → browser voice now, and no more requests for a while', async () => {
    mockTts(503);
    const WA = signedIn();
    await WA.speak('carbon footprint');
    await WA.speak('climate change');
    expect(spoken).toEqual(['carbon footprint', 'climate change']);
    expect(ttsCalls()).toHaveLength(1);
  });

  test('speakNeural sends the chosen voice and reports how it ended', async () => {
    remote[MP3] = 'ok';
    mockTts(200);
    const WA = signedIn();
    await expect(WA.speakNeural('Where are you from?', { voice: 'tony' })).resolves.toBe('played');
    expect(JSON.parse(ttsCalls()[0][1].body)).toEqual({ text: 'Where are you from?', voice: 'tony' });
    expect(plays[plays.length - 1]).toBe(MP3);
  });

  test('speakNeural says "failed" so the page can use its own voice', async () => {
    mockTts(429);
    const WA = signedIn();
    await expect(WA.speakNeural('Do you like music?', { voice: 'tony' })).resolves.toBe('failed');
    expect(spoken).toEqual([]);
  });

  test('stop() ends a sentence that is playing, so a waiting exam moves on', async () => {
    const stuck = 'https://media.test/tts/v1/tony/stuck.mp3';
    mockTts(200, stuck);
    const WA = signedIn();
    FakeAudio.prototype.play = function () { plays.push(this.src); return Promise.resolve(); };
    const run = WA.speakNeural('Tell me about your hometown.', { voice: 'tony' });
    await wait(450);
    WA.stop();
    await expect(run).resolves.toBe('stopped');
  });
});
