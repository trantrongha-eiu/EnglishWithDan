/**
 * Vocab book practice → POST /vocabbook/practice-results while practising
 * (js/dashboard.js _queueEvidence / _flushEvidence). Until 2026-11-14 the
 * answers were only sent at session end, so a student's homework card read
 * "đã luyện 4/50" during a 50-word session and a closed tab lost it all.
 *
 * Loaded like the other page-script tests; script-scoped state is reached
 * through an appended getter.
 */
'use strict';

const fs = require('fs');
const path = require('path');

let d;
let calls; // [{ url, body, keepalive, resolve, reject }]

beforeAll(() => {
  window.AuthService = { API: 'http://api', authHeader: () => ({}), getUser: () => ({}), hasPremiumAccess: () => true };
  window.ApiClient = { handleResponse: (r) => r.json() };
  window.speakWord = () => {};
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'dashboard.js'), 'utf8');
  // eslint-disable-next-line no-eval
  window.eval(code + `
;window.__ev = {
  reset() {
    if (_evidenceTimer) clearTimeout(_evidenceTimer);
    _evidenceTimer = null; _evidencePromise = null; _evidenceFailures = 0; _evidenceState = 'idle';
    _evidenceQueue.clear(); _evidenceInflight.clear(); _evidenceOutcome.clear();
  },
  startBook(id) { _isBookPractice = true; currentBookId = id; _streakSess = _newStreakSession(); wrongWordSet.clear(); },
  get sid() { return _streakSess.sid; },
  answer(w, ok) { currentWord = w; if (!ok) wrongWordSet.add(w.word); _countAnswer(); },
  flushNow: () => _flushEvidence(),
  leave: () => _flushEvidence({ keepalive: true }),
  get queued() { return _evidenceQueue.size; },
  get state() { return _evidenceState; },
};`);
  d = window.__ev;
});

beforeEach(() => {
  jest.useFakeTimers();
  calls = [];
  global.fetch = window.fetch = jest.fn((url, opts) => new Promise((resolve, reject) => {
    const c = {
      url, body: JSON.parse(opts.body), keepalive: !!opts.keepalive,
      resolve: (data = { success: true, words: [] }) => resolve({ json: async () => data }),
      reject: () => reject(new Error('offline')),
    };
    calls.push(c);
  }));
  try { localStorage.clear(); } catch (e) {}
  d.reset();
});
afterEach(() => { jest.useRealTimers(); });

const tick = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
const evidenceCalls = () => calls.filter((c) => /practice-results$/.test(c.url));
const word = (i) => ({ _id: `w${i}`, word: `word${i}`, meaning: 'm' });

test('answers go out ~1.5s after the last one, not at session end', async () => {
  d.startBook('b1');
  d.answer(word(1), true);
  d.answer(word(2), false);
  expect(evidenceCalls()).toHaveLength(0);
  jest.advanceTimersByTime(1600);
  await tick();
  expect(evidenceCalls()).toHaveLength(1);
  expect(evidenceCalls()[0].body.results).toEqual([
    { bookId: 'b1', wordId: 'w1', correct: true, sid: d.sid },
    { bookId: 'b1', wordId: 'w2', correct: false, sid: d.sid },
  ]);
  evidenceCalls()[0].resolve();
  await tick();
  expect(d.state).toBe('saved');
  expect(localStorage.getItem('dash_vocab_evidence_q')).toBeNull();
});

test('8 waiting answers are sent at once', async () => {
  d.startBook('b1');
  for (let i = 0; i < 8; i++) d.answer(word(i), true);
  await tick();
  expect(evidenceCalls()).toHaveLength(1);
  expect(evidenceCalls()[0].body.results).toHaveLength(8);
});

test('a word is resent only when it flips right → wrong in the session', async () => {
  d.startBook('b1');
  const w = word(1);
  d.answer(w, true);
  jest.advanceTimersByTime(1600); await tick();
  evidenceCalls()[0].resolve(); await tick();
  d.answer(w, true); // right again — nothing new
  jest.advanceTimersByTime(1600); await tick();
  expect(evidenceCalls()).toHaveLength(1);
  d.answer(w, false); // missed on the re-queue
  jest.advanceTimersByTime(1600); await tick();
  expect(evidenceCalls()).toHaveLength(2);
  expect(evidenceCalls()[1].body.results).toEqual([{ bookId: 'b1', wordId: 'w1', correct: false, sid: d.sid }]);
});

test('offline: kept (also in localStorage) and retried', async () => {
  d.startBook('b1');
  d.answer(word(1), true);
  jest.advanceTimersByTime(1600); await tick();
  evidenceCalls()[0].reject(); await tick();
  expect(d.state).toBe('retry');
  expect(d.queued).toBe(1);
  expect(JSON.parse(localStorage.getItem('dash_vocab_evidence_q')).items).toHaveLength(1);
  jest.advanceTimersByTime(30000); await tick();
  expect(evidenceCalls()).toHaveLength(2);
  evidenceCalls()[1].resolve(); await tick();
  expect(d.queued).toBe(0);
  expect(localStorage.getItem('dash_vocab_evidence_q')).toBeNull();
});

test('leaving the page sends what is queued with keepalive', async () => {
  d.startBook('b1');
  d.answer(word(1), true);
  d.leave();
  await tick();
  expect(evidenceCalls()).toHaveLength(1);
  expect(evidenceCalls()[0].keepalive).toBe(true);
  // the local copy stays until a normal send confirms it
  expect(JSON.parse(localStorage.getItem('dash_vocab_evidence_q')).items).toHaveLength(1);
});

test('words outside a book (curriculum unit) are not sent', async () => {
  d.startBook(null);
  d.answer(word(1), true);
  jest.advanceTimersByTime(1600); await tick();
  expect(evidenceCalls()).toHaveLength(0);
});
