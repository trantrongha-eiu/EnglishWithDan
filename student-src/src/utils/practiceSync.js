// Practice results → server, while practising. Port of dashboard.js's
// "graded-practice evidence" queue and session streak reporter:
//
// 1. Evidence (SRS box / wrongCount / status per word):
//    POST /vocabbook/practice-results in small batches — ~1.5s after the
//    last answer, at once when 8 are waiting, keepalive when the page is
//    hidden/closed. One outcome per word per session id; a miss wins, so a
//    word is re-sent only when it flips right → wrong. Unsent answers also
//    sit in localStorage under the SAME key the old page uses, so either
//    page resends what the other left behind.
// 2. Streak: POST /vocabbook/practice-complete every 5 answers (+ the
//    leftover at session end), one request at a time.
import { API, authHeaders, apiFetch } from './api';
import { showBadges } from './shell';

const LS_KEY = 'dash_vocab_evidence_q';
const BATCH_MAX = 150;

const queue = new Map();     // `${sid}:${wordId}` -> { bookId, wordId, correct, sid }
const inflight = new Map();
const outcome = new Map();   // key -> outcome already queued/sent
const wordObjs = new Map();  // wordId -> word object to reflect server values onto
let timer = null;
let running = null;
let failures = 0;
let state = 'idle';          // idle | pending | saving | saved | retry
const listeners = new Set();

export function newSessionId() {
  return 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function setState(s) {
  if (state === s) return;
  state = s;
  listeners.forEach(fn => fn(s));
}
export function getSaveState() { return state; }
export function onSaveState(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function saveLocal() {
  try {
    const all = [...inflight.values(), ...queue.values()];
    if (all.length) localStorage.setItem(LS_KEY, JSON.stringify({ at: Date.now(), items: all.slice(-500) }));
    else localStorage.removeItem(LS_KEY);
  } catch { /* private mode */ }
}

function schedule(ms) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { timer = null; flushEvidence(); }, ms);
}

export function queueAnswer({ bookId, word, correct, sid }) {
  if (!bookId || !word?._id) return;
  const k = `${sid}:${word._id}`;
  const prev = outcome.get(k);
  if (prev === false || prev === correct) return; // a miss already recorded wins
  outcome.set(k, correct);
  queue.set(k, { bookId: String(bookId), wordId: String(word._id), correct, sid });
  wordObjs.set(String(word._id), word);
  saveLocal();
  setState('pending');
  if (queue.size >= 8) flushEvidence();
  else schedule(1500);
}

export function flushEvidence({ keepalive = false } = {}) {
  if (timer) { clearTimeout(timer); timer = null; }
  if (keepalive) {
    const items = [...inflight.values(), ...queue.values()].slice(0, BATCH_MAX);
    if (!items.length) return Promise.resolve(true);
    saveLocal();
    try {
      fetch(`${API}/vocabbook/practice-results`, {
        method: 'POST', headers: authHeaders(), keepalive: true,
        body: JSON.stringify({ results: items }),
      }).catch(() => {});
    } catch { /* ignore */ }
    return Promise.resolve(true);
  }
  if (running) return running.then(() => (queue.size ? flushEvidence() : true));
  if (!queue.size) return Promise.resolve(true);

  const batch = [...queue.entries()].slice(0, BATCH_MAX);
  for (const [k, v] of batch) { queue.delete(k); inflight.set(k, v); }
  setState('saving');
  running = (async () => {
    let ok = false;
    try {
      const data = await apiFetch('/vocabbook/practice-results', {
        method: 'POST',
        body: JSON.stringify({ results: batch.map(([, v]) => v) }),
      });
      for (const s of data.words || []) {
        const w = wordObjs.get(String(s._id));
        if (!w) continue;
        // eslint-disable-next-line no-unused-vars
        const { bookId, ...fields } = s;
        Object.assign(w, fields);
      }
      showBadges(data);
      ok = true;
    } catch (err) {
      const st = err?.status;
      // A 4xx other than 429/401 won't succeed on retry (locked plan, bad id) — drop it.
      if (st && st >= 400 && st < 500 && st !== 429 && st !== 401) ok = true;
      else for (const [k, v] of batch) if (!queue.has(k)) queue.set(k, v);
    }
    for (const [k] of batch) inflight.delete(k);
    saveLocal();
    if (ok) {
      failures = 0;
      setState(queue.size ? 'pending' : 'saved');
      if (queue.size) schedule(300);
    } else {
      failures++;
      setState('retry');
      schedule(Math.min(30000, 2000 * 2 ** Math.min(failures, 4)));
    }
    return ok && !queue.size;
  })().finally(() => { running = null; });
  return running;
}

// One-off report (a finished Vocab Topic quiz)
export async function reportPracticeComplete(body) {
  const d = await apiFetch('/vocabbook/practice-complete', { method: 'POST', body: JSON.stringify(body) });
  if (d?.success) streakListeners.forEach(fn => fn(d));
  showBadges(d);
  return d;
}

/* ── Streak session ── */
let chain = Promise.resolve();
let busy = 0;
let current = null;
const streakListeners = new Set();
export function onStreakResult(fn) { streakListeners.add(fn); return () => streakListeners.delete(fn); }

// unit: a Paraphrase Unit session reports { unitId, unitType } (Búa Daniel tally)
export function startStreakSession(unit = null) {
  current = { unitId: unit?.unitId || null, unitType: unit?.unitType || null, sid: newSessionId(), answered: 0, correct: 0, reported: 0, reportedCorrect: 0, pending: false };
  return current;
}

export function countStreakAnswer(sess, correct) {
  sess.answered++;
  if (correct) sess.correct++;
  if (sess.answered - sess.reported >= 5) reportStreak(sess);
}

async function sendStreakBatch(sess, final) {
  const batch = sess.answered - sess.reported;
  if (batch < (final && sess.answered >= 5 ? 1 : 5)) return false;
  const upTo = sess.answered, upToCorrect = sess.correct;
  const d = await apiFetch('/vocabbook/practice-complete', {
    method: 'POST',
    keepalive: true,
    body: JSON.stringify({
      wordsAnswered: batch,
      correctAnswered: upToCorrect - sess.reportedCorrect,
      unitId: sess.unitId,
      unitType: sess.unitType,
      sessionId: sess.sid,
    }),
  });
  sess.reported = upTo;
  sess.reportedCorrect = upToCorrect;
  if (d?.success) streakListeners.forEach(fn => fn(d));
  showBadges(d);
  return true;
}

export function reportStreak(sess, final = false) {
  if (!sess) return;
  if (!final) { if (sess.pending) return; sess.pending = true; }
  let sent = false;
  busy++;
  chain = chain
    .then(() => sendStreakBatch(sess, final))
    .then(ok => { sent = ok; })
    .catch(() => { /* stays unreported; the next trigger picks it up */ })
    .finally(() => {
      busy--;
      if (final) return;
      sess.pending = false;
      if (sent && sess.answered - sess.reported >= 5) reportStreak(sess);
    });
}

export function endStreakSession(sess) {
  reportStreak(sess, true);
  if (current === sess) current = null;
}

/* ── Page leave / reload ── */
if (typeof window !== 'undefined') {
  const onLeave = () => {
    flushEvidence({ keepalive: true });
    if (current && !busy) reportStreak(current, true);
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') onLeave(); });
  window.addEventListener('pagehide', onLeave);

  // Answers left unsent by an earlier visit (closed tab, offline) — resend.
  (function resendStored() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { /* ignore */ }
    if (!saved || !Array.isArray(saved.items) || !saved.items.length) return;
    if (Date.now() - (saved.at || 0) > 7 * 24 * 3600 * 1000) {
      try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
      return;
    }
    for (const it of saved.items) {
      if (!it || !it.bookId || !it.wordId || !it.sid) continue;
      const k = `${it.sid}:${it.wordId}`;
      queue.set(k, { bookId: String(it.bookId), wordId: String(it.wordId), correct: !!it.correct, sid: String(it.sid) });
      outcome.set(k, !!it.correct);
    }
    if (queue.size && localStorage.getItem('token')) setTimeout(() => flushEvidence(), 2500);
  })();
}
