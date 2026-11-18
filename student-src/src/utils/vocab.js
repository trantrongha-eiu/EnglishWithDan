// Vocab-notebook helpers shared by the book view and the practice screen.
// Ported from frontend/js/dashboard.js (+ dashboard-audio.js); keep the
// rules in step with the old page while both exist.
import SearchMatch from './searchMatch';

export const VOCAB_BOOK_MAX_WORDS = 1000;

export const STATUSES = [
  { key: 'chua-thuoc', label: 'Not yet', dot: 'dot-gray' },
  { key: 'nho-so-so', label: 'So-so', dot: 'dot-yellow' },
  { key: 'da-thuoc', label: 'Mastered', dot: 'dot-green' },
];
const STATUS_ORDER = { 'chua-thuoc': 0, 'nho-so-so': 1, 'da-thuoc': 2 };

export function countByStatus(words) {
  const c = { 'da-thuoc': 0, 'nho-so-so': 0, 'chua-thuoc': 0 };
  for (const w of words) if (c[w.status] !== undefined) c[w.status]++;
  return c;
}

// chưa thuộc → nhớ sơ sơ → đã thuộc, then A–Z within each group
export function sortWords(words) {
  return [...words].sort((a, b) => {
    const sd = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0);
    return sd !== 0 ? sd : a.word.localeCompare(b.word, 'vi', { sensitivity: 'base' });
  });
}

// Search box ("moi truong" finds "môi trường") + status-chip filter
export function filterWords(words, query, status) {
  let out = words;
  const q = query.trim();
  if (q) out = out.filter(w => SearchMatch.matches([w.word, w.meaning, w.note], q));
  if (status) out = out.filter(w => w.status === status);
  return out;
}

export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function normAnswer(s) {
  return String(s || '').trim().toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, ' ');
}

/* ── Smart book session ──
   Same rule as dashboard.js _buildSmartBookSession (minus the homework-goal
   boost, which lives in the homework card the React app doesn't have yet):
   mastered words not due for review are hidden except a light ~10% sample,
   the rest are ordered by need, and "hay sai" words get a 2nd rep 5–9
   questions later. */
const DAY_MS = 86400000;
const isMastered = w => w.status === 'da-thuoc' || (w.srsBox || 0) >= 3;
const isWeak = w => (w.wrongCount || 0) >= 3 || w.lastPracticeCorrect === false;
function dueAt(w) {
  let t = w.nextReviewAt ? new Date(w.nextReviewAt).getTime() : 0;
  if (w.status === 'da-thuoc' && (w.srsBox || 0) < 3 && w.lastReviewedAt) {
    t = Math.max(t, new Date(w.lastReviewedAt).getTime() + 7 * DAY_MS);
  }
  return t;
}

export function buildSmartSession(words) {
  const now = Date.now();
  const core = [], restMastered = [];
  for (const w of words) (isMastered(w) && dueAt(w) > now ? restMastered : core).push(w);

  const score = (w) => {
    let s = (w.srsBox || 0) === 0 && !isMastered(w) ? 3 : isMastered(w) ? 0.5 : 2;
    s += Math.min(w.wrongCount || 0, 6) * 0.5;
    if (w.lastPracticeCorrect === false) s += 2;
    const overdueDays = w.nextReviewAt ? (now - new Date(w.nextReviewAt).getTime()) / DAY_MS : 0;
    if (overdueDays > 0) s += Math.min(overdueDays, 3) * 0.3;
    return s + Math.random() * 2;
  };
  let list = core.map(w => ({ w, s: score(w) })).sort((a, b) => b.s - a.s).map(x => x.w);

  restMastered.sort((a, b) => dueAt(a) - dueAt(b));
  let allMastered = false;
  let sample;
  if (!list.length) {
    allMastered = true;
    sample = restMastered.slice(0, 20);
    list = [...sample];
  } else {
    const n = Math.min(restMastered.length, Math.max(1, Math.round(list.length * 0.1)));
    sample = shuffle(restMastered.slice(0, n * 3)).slice(0, n);
    for (const w of sample) list.splice(Math.floor(Math.random() * (list.length + 1)), 0, w);
  }

  const weakSet = new Set(list.filter(isWeak).slice(0, 15));
  const out = [];
  const pending = [];
  for (const w of list) {
    out.push(w);
    if (weakSet.has(w)) {
      pending.push([out.length + 4 + Math.floor(Math.random() * 5), w]);
      pending.sort((a, b) => a[0] - b[0]);
    }
    while (pending.length && pending[0][0] <= out.length) out.push(pending.shift()[1]);
  }
  for (const [, w] of pending) out.push(w);

  return {
    list: out,
    allMastered,
    dueCount: core.length,
    weakCount: weakSet.size,
    masteredSample: allMastered ? 0 : sample.length,
    masteredHidden: restMastered.length - sample.length,
  };
}

/* ── Audio ── */
const slowKey = 'ews_vocab_slow';
function isSlow() {
  try { return localStorage.getItem(slowKey) === '1'; } catch { return false; }
}

export function speakWord(word) {
  if (!word) return;
  if (window.WordAudio) { window.WordAudio.speak(word, { slow: isSlow() }); return; }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(String(word).trim());
    utt.lang = 'en-US';
    utt.rate = isSlow() ? 0.8 : 1;
    window.speechSynthesis.speak(utt);
  }
}

export function prefetchAudio(words) {
  window.WordAudio?.prefetch?.(words);
}

let sounds = null;
function soundOn() {
  // global nav toggle (js/shared/sound-effects.js)
  try { return localStorage.getItem('wp_sound') !== 'off'; } catch { return true; }
}
export function playSound(kind) {
  if (!soundOn()) return;
  if (!sounds) {
    sounds = { correct: new Audio('/sounds/correct.mp3'), wrong: new Audio('/sounds/incorrect.mp3') };
    sounds.correct.volume = 0.5;
    sounds.wrong.volume = 0.5;
  }
  const a = sounds[kind];
  if (!a) return;
  a.currentTime = 0;
  a.play().catch(() => {});
}
