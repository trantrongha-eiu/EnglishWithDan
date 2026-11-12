/**
 * Vocab practice → /vocabbook/practice-complete batching (js/dashboard.js
 * _reportSessionStreak / _sendStreakBatch). Answers go out in 5-answer
 * batches plus the 1–4 left at the end of a session; every report runs
 * through one queue so two requests never overlap, and a session that ends
 * while a batch is still out keeps (and sends) its own leftover.
 *
 * Loaded like the other page-script tests; the script-scoped state is
 * reached through an appended getter.
 */
'use strict';

const fs = require('fs');
const path = require('path');

let d;
let calls;     // [{ body, resolve, reject }]
let inFlight;  // requests currently open
let maxInFlight;

beforeAll(() => {
  window.AuthService = { API: 'http://api', authHeader: () => ({}), getUser: () => ({}), hasPremiumAccess: () => true };
  window.ApiClient = { handleResponse: (r) => r.json() };
  window.speakWord = () => {}; // from dashboard-audio.js on the real page
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'dashboard.js'), 'utf8');
  // eslint-disable-next-line no-eval
  window.eval(code + `
;window.__dash = {
  newSession() { _streakSess = _newStreakSession(); sessionAnsweredCount = 0; correctAnswers = 0; },
  get sess() { return _streakSess; },
  answer(ok) { if (ok) correctAnswers++; _countAnswer(); },
  report: (final) => _reportSessionStreak(final),
  leave: () => _flushStreakOnLeave(),
  get chain() { return _streakChain; },
};`);
  d = window.__dash;
});

beforeEach(() => {
  calls = [];
  inFlight = 0;
  maxInFlight = 0;
  global.fetch = window.fetch = jest.fn((url, opts) => new Promise((resolve, reject) => {
    inFlight++;
    maxInFlight = Math.max(maxInFlight, inFlight);
    calls.push({
      body: JSON.parse(opts.body),
      keepalive: opts.keepalive,
      resolve: () => { inFlight--; resolve({ json: async () => ({ success: false }) }); },
      reject: () => { inFlight--; reject(new Error('offline')); },
    });
  }));
});

// Let queued .then()s run.
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
// Answers arrive seconds apart in real use — let the queue run between them.
const answers = async (n, ok = () => true) => { for (let i = 0; i < n; i++) { d.answer(ok(i)); await flush(); } };

test('7 answers → a 5-batch, then the 2 left over at session end', async () => {
  d.newSession();
  await answers(7);
  await flush();
  expect(calls).toHaveLength(1);
  expect(calls[0].body).toMatchObject({ wordsAnswered: 5, correctAnswered: 5 });
  expect(calls[0].keepalive).toBe(true);
  calls[0].resolve();
  d.report(true);
  await flush();
  expect(calls).toHaveLength(2);
  expect(calls[1].body).toMatchObject({ wordsAnswered: 2, correctAnswered: 2, sessionId: calls[0].body.sessionId });
  calls[1].resolve();
  await flush();
  expect(maxInFlight).toBe(1);
});

test('a session ended while its batch is out still sends its leftover, under its own id', async () => {
  d.newSession();
  await answers(8, (i) => i !== 0); // 7 right, 1 wrong
  await flush();
  expect(calls).toHaveLength(1);           // first 5 out, not answered yet
  const oldSid = calls[0].body.sessionId;
  d.report(true);                          // session ends (e.g. mode switch)…
  d.newSession();                          // …and the next one starts at once
  await answers(5);
  await flush();
  expect(calls).toHaveLength(1);           // nothing overlaps the open request
  calls[0].resolve();
  await flush();
  expect(calls[1].body).toMatchObject({ sessionId: oldSid, wordsAnswered: 3, correctAnswered: 3 });
  calls[1].resolve();
  await flush();
  expect(calls[2].body.sessionId).not.toBe(oldSid);
  expect(calls[2].body).toMatchObject({ wordsAnswered: 5, correctAnswered: 5 });
  calls[2].resolve();
  await flush();
  expect(maxInFlight).toBe(1);
});

test('a failed batch is retried by the next trigger, not in a loop', async () => {
  d.newSession();
  await answers(5);
  await flush();
  calls[0].reject();
  await flush();
  expect(calls).toHaveLength(1);           // no automatic re-send while offline
  d.answer(true);                          // 6th answer: 6 unreported → resend all 6
  await flush();
  expect(calls).toHaveLength(2);
  expect(calls[1].body.wordsAnswered).toBe(6);
  calls[1].resolve();
  await flush();
});

test('leaving the page sends the leftover; a session under 5 answers sends nothing', async () => {
  d.newSession();
  await answers(3);
  d.leave();
  await flush();
  expect(calls).toHaveLength(0);

  d.newSession();
  await answers(6);
  await flush();
  calls[0].resolve();
  await flush();
  d.leave();
  await flush();
  expect(calls).toHaveLength(2);
  expect(calls[1].body.wordsAnswered).toBe(1);
  calls[1].resolve();
  await flush();
});
