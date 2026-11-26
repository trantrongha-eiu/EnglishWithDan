// Task 2 Luyện đề tuần — rules, text maths and the browser-side progress
// stores of pages/Task2Practice.jsx. Ported from js/task2-practice.js: same
// thresholds, same localStorage keys, same server routes (/api/task2/*).
import { apiFetch } from './api';

export const ESSAY_LABELS = { advantages_disadvantages: 'Adv & Disadv', cause_effect: 'Cause & Effect', cause_solution: 'Cause & Solution', effect_solution: 'Effect & Solution', agree_disagree: 'Agree / Disagree', discuss_both_views: 'Discuss Both Views', positive_or_negative_development: 'Positive or Negative Dev' };
export const ESSAY_BADGE_CLASS = { advantages_disadvantages: 'et-badge et-adv', cause_effect: 'et-badge et-cause', cause_solution: 'et-badge et-cause', effect_solution: 'et-badge et-cause', agree_disagree: 'et-badge et-opinion', discuss_both_views: 'et-badge et-discuss', positive_or_negative_development: 'et-badge et-posneg' };
export const Q_LABELS = { essay_type_recognition: 'Nhận diện dạng', fill_blank: 'Điền chỗ trống', rearrange: 'Sắp xếp từ', translation: 'Dịch câu', error_correction: 'Sửa lỗi', topic_sentence: 'Chọn topic sentence', short_writing: 'Viết đoạn', paraphrase: 'Paraphrase' };
// Types that run a "Dịch câu" drill (the server ships the model sentence as
// q.translationAnswer — never for short_writing, which the student writes).
export const WBW_TYPES = new Set(['translation', 'paraphrase', 'short_writing']);
export const MC_TYPES = new Set(['essay_type_recognition', 'topic_sentence']);
export const AI_TYPES = new Set(['translation', 'error_correction', 'short_writing', 'paraphrase']);
// The site-wide typing rule: the 3rd wrong try on one word fails the sentence,
// which comes back WBW_REQUEUE_GAP questions later — at most WBW_MAX_REQUEUES times.
export const WBW_MAX_WORD_ERRORS = 3;
export const WBW_MAX_ASKS = 3;
export const WBW_REQUEUE_GAP = 3;
export const WBW_MAX_REQUEUES = 2;
export const ORD_MAX_TRIES = 3;
export const GF_MAX_TRIES = 3;
export const LEVEL_COLORS = { beginner: '#22c55e', elementary: '#3b82f6', intermediate: '#a855f7' };

// Each essay type spans 2 weeks; weeks 15–18 are mixed review.
export const WEEK_GROUPS = [
  { essayType: 'advantages_disadvantages', theme: 'Technology', emoji: '💻', weeks: [1, 2] },
  { essayType: 'discuss_both_views', theme: 'Government', emoji: '🏛️', weeks: [3, 4] },
  { essayType: 'cause_solution', theme: 'Health', emoji: '🩺', weeks: [5, 6] },
  { essayType: 'effect_solution', theme: 'Transport', emoji: '🚆', weeks: [7, 8] },
  { essayType: 'cause_effect', theme: 'Education', emoji: '🎓', weeks: [9, 10] },
  { essayType: 'agree_disagree', theme: 'Work', emoji: '💼', weeks: [11, 12] },
  { essayType: 'positive_or_negative_development', theme: 'Environment', emoji: '🌿', weeks: [13, 14] },
  { essayType: null, theme: 'Ôn tập tổng hợp', emoji: '🔁', weeks: [15, 16, 17, 18] },
];
export function weekLabel(w) {
  const g = WEEK_GROUPS.find((x) => x.weeks.includes(w));
  if (!g) return '';
  return g.essayType ? `${ESSAY_LABELS[g.essayType]} · ${g.theme}` : 'Ôn tập';
}
export const ESSAY_COLORS = { advantages_disadvantages: '#4d63d8', discuss_both_views: '#7d62c9', cause_solution: '#2a9d8f', effect_solution: '#cf5f57', cause_effect: '#e07a3a', agree_disagree: '#2f9e5b', positive_or_negative_development: '#d4689a' };
export const T2W_STEPS = [
  { phase: 'Chuẩn bị', time: '~60′', cls: 'prep', steps: [['1', 'fa-book-open', 'Từ vựng'], ['2', 'fa-lightbulb', 'Brainstorm'], ['3', 'fa-language', 'Dịch câu'], ['4', 'fa-compass', 'Hướng dẫn viết']] },
  { phase: 'Trên lớp', time: '~30′', cls: 'class', steps: [['5', 'fa-pen', 'Mở bài + Thân bài 1']] },
  { phase: 'Về nhà', time: '', cls: 'home', steps: [['6', 'fa-house', 'Thân bài 2 + Kết bài']] },
];

// ── Lessons ("Buổi học"): one topic = one class session ──────────────────
export const ESSAY_TYPE_ID = { advantages_disadvantages: 'type01', discuss_both_views: 'type02', cause_solution: 'type03', effect_solution: 'type04', cause_effect: 'type05', agree_disagree: 'type06', positive_or_negative_development: 'type07' };
export const LESSON_SECTIONS = [
  { key: 'intro', label: 'Mở bài', en: 'Introduction', phase: 'class', ph: 'Paraphrase đề bài + nêu hướng triển khai / quan điểm (thesis)...' },
  { key: 'body1', label: 'Thân bài 1', en: 'Body 1', phase: 'class', ph: 'Câu chủ đề (ý chính) → giải thích (because) → kết quả (result) → ví dụ (example)...' },
  { key: 'body2', label: 'Thân bài 2', en: 'Body 2', phase: 'home', ph: 'Viết theo template Band 6+ / 7+: câu chủ đề → giải thích → kết quả → ví dụ...' },
  { key: 'conclusion', label: 'Kết bài', en: 'Conclusion', phase: 'home', ph: 'In conclusion, … tóm tắt ý ở 2 thân bài + nêu ý kiến (nếu đề hỏi) · thử 1 câu điều kiện loại 1/2…' },
];
export const LESSON_MIN_WORDS = 250;
export const T2_WRITE_MIN_ACCURACY = 70;
export const T2_TRANSLATE_PASS = 70;
export const VQUIZ_LEN = 25;
export const VQUIZ_PASS = 70;
export const VQUIZ_KIND_LABEL = { vi2en: 'Chọn từ tiếng Anh đúng nghĩa', en2vi: 'Chọn nghĩa đúng', gap: 'Chọn từ điền vào chỗ trống' };

export function wc(s) {
  const t = String(s || '').trim();
  return t ? t.split(/\s+/).length : 0;
}
export const emptySections = () => ({ intro: '', body1: '', body2: '', conclusion: '' });
export const sectionsWords = (sec) => LESSON_SECTIONS.reduce((a, s) => a + wc((sec || {})[s.key]), 0);
export const sectionsFilled = (sec) => LESSON_SECTIONS.filter((s) => ((sec || {})[s.key] || '').trim()).length;

export const isStaff = () => !!window.AuthService?.isStaff?.();
export const isLoggedIn = () => !!window.AuthService?.isLoggedIn?.();
export const isStudent = () => isLoggedIn() && window.AuthService?.getRole?.() === 'student';

export function shuffle(arr, rng = Math.random) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
// mulberry32 seeded from a string hash — the same quiz / options for everyone
export function seededRng(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = (h + 0x6D2B79F5) | 0;
    let x = Math.imul(h ^ (h >>> 15), 1 | h);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
export const qid = (q) => q.questionId || q._id;

// ── localStorage stores (same keys as the old page) ─────────────────────
function safeParse(json, fallback) { if (json == null) return fallback; try { return JSON.parse(json); } catch { return fallback; } }
function read(key, fallback) { try { return safeParse(localStorage.getItem(key), fallback); } catch { return fallback; } }
function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* full / private */ } }

const TOPIC_SCORE_KEY = 't2_topic_scores';
const TOPIC_COMPLETE_THRESHOLD = 80;
const VOCAB_TOTAL_KEY = 't2_vocab_total';
const VOCAB_SAVED_KEY = 't2_vocab_saved';
const VQUIZ_BEST_KEY = 't2_vocab_quiz_best';
const VOCAB_SYNCED_KEY = 't2_vocab_synced';
const VOCAB_PENDING_KEY = 't2_vocab_pending';
const PREFS_KEY = 't2_prefs';
const XP_KEY = 't2_progress';

// One object so a page that changes a map sees it everywhere (same as the
// old page's module-level maps). Read once per page load.
export const store = {
  topicScores: read(TOPIC_SCORE_KEY, {}),
  vocabTotal: read(VOCAB_TOTAL_KEY, {}),
  vocabSaved: read(VOCAB_SAVED_KEY, {}),
  vquizBest: read(VQUIZ_BEST_KEY, {}),
};
export function reloadStore() {
  store.topicScores = read(TOPIC_SCORE_KEY, {});
  store.vocabTotal = read(VOCAB_TOTAL_KEY, {});
  store.vocabSaved = read(VOCAB_SAVED_KEY, {});
  store.vquizBest = read(VQUIZ_BEST_KEY, {});
}

export function loadPrefs() {
  const p = read(PREFS_KEY, {});
  return { autoNext: !!p.autoNext, shuffleMode: !!p.shuffleMode };
}
export const savePrefs = (p) => write(PREFS_KEY, { autoNext: !!p.autoNext, shuffleMode: !!p.shuffleMode });

export function loadXP() {
  const s = read(XP_KEY, { xp: 0, streak: 0 }) || {};
  return { xp: s.xp || 0, streak: s.streak || 0 };
}
export function addXP(earned, incrementStreak = false) {
  const s = read(XP_KEY, { xp: 0, streak: 0 }) || {};
  s.xp = (s.xp || 0) + earned;
  if (incrementStreak) s.streak = (s.streak || 0) + 1;
  write(XP_KEY, s);
  return { xp: s.xp, streak: s.streak || 0 };
}

export function saveTopicScore(topicId, score) {
  const prev = store.topicScores[topicId] || { bestScore: 0, latestScore: 0, completed: false, completedAt: null };
  const bestScore = Math.max(prev.bestScore, score);
  const completed = bestScore >= TOPIC_COMPLETE_THRESHOLD;
  const completedAt = (completed && !prev.completed) ? new Date().toISOString() : prev.completedAt;
  store.topicScores[topicId] = { bestScore, latestScore: score, completed, completedAt };
  write(TOPIC_SCORE_KEY, store.topicScores);
}
export const topicCompletedCount = () => Object.values(store.topicScores).filter((s) => s.completed).length;

// "Viết bài": best practice score, server (topic-stats for THIS topic) or local
export function bestPracticeScore(topicId, topicStats) {
  const ts = topicStats;
  const server = (ts && ts.forTopic === topicId && ts.practiced) ? (ts.bestScore || 0) : null;
  const local = store.topicScores[topicId] ? (store.topicScores[topicId].bestScore || 0) : null;
  if (server == null && local == null) return null;
  return Math.max(server || 0, local || 0);
}

// ── Step ① — vocab saved + quiz ─────────────────────────────────────────
export const savedTermsFor = (topicId) => new Set(store.vocabSaved[topicId] || []);
export function markVocabTermsSaved(topicId, terms) {
  const set = savedTermsFor(topicId);
  terms.forEach((t) => set.add(t));
  store.vocabSaved[topicId] = Array.from(set);
  write(VOCAB_SAVED_KEY, store.vocabSaved);
}
// Unique term count (a duplicated term must not keep the gate shut)
export function setVocabTotal(topicId, list) {
  store.vocabTotal[topicId] = new Set(list.map((v) => v.term)).size;
  write(VOCAB_TOTAL_KEY, store.vocabTotal);
}
export function setQuizBest(topicId, pct) {
  if (store.vquizBest[topicId] == null || pct > store.vquizBest[topicId]) {
    store.vquizBest[topicId] = pct;
    write(VQUIZ_BEST_KEY, store.vquizBest);
  }
}
export function isVocabLearned(topicId) {
  if (!topicId) return false;
  const total = store.vocabTotal[topicId];
  if (total === undefined) return false;
  if (total <= 0) return true;
  return savedTermsFor(topicId).size >= total;
}
export const vquizPossible = (list) => (list || []).filter((v) => v.term && v.definitionVi).length >= 4;
// vocab = { for, list } of the open topic (a list too short for a quiz counts as passed)
export function isVocabQuizPassed(topicId, vocab) {
  if (!topicId) return false;
  if (store.vquizBest[topicId] != null && store.vquizBest[topicId] >= VQUIZ_PASS) return true;
  if (store.vocabTotal[topicId] <= 0) return true;
  return !!vocab && vocab.for === topicId && !vquizPossible(vocab.list);
}
export const isVocabStepDone = (topicId, vocab) => isVocabLearned(topicId) && isVocabQuizPassed(topicId, vocab);
// Step locks are for students only — staff open every step to preview / demo
export const isStepUnlocked = (topicId, vocab) => isStaff() || isVocabStepDone(topicId, vocab);

export function vocabStats(topicId, vocab) {
  const list = vocab && vocab.for === topicId ? vocab.list : [];
  const savedSet = savedTermsFor(topicId);
  let total; let saved = 0;
  if (list.length) {
    const terms = new Set(list.map((v) => v.term));
    total = terms.size;
    terms.forEach((tm) => { if (savedSet.has(tm)) saved++; });
  } else {
    total = store.vocabTotal[topicId] || 0;
    saved = Math.min(savedSet.size, total);
  }
  return { total, saved, pct: total ? Math.round((saved / total) * 100) : 0 };
}

// Server copy of step ① (POST /task2/vocab-progress/sync). The maps above are
// a cache; a send that fails is queued per user and retried on the next one.
function vpUserKey() {
  const u = window.AuthService?.getUser?.();
  return String((u && (u._id || u.id)) || 'me');
}
const vpPending = () => read(VOCAB_PENDING_KEY, {}) || {};
function applyVocabProgress(rows, replace) {
  if (replace) { store.vocabSaved = {}; store.vquizBest = {}; }
  (rows || []).forEach((r) => {
    if (!r || !r.topicId) return;
    if (r.savedTerms && r.savedTerms.length) {
      const set = new Set(store.vocabSaved[r.topicId] || []);
      r.savedTerms.forEach((t) => set.add(t));
      store.vocabSaved[r.topicId] = Array.from(set);
    }
    if (r.quizBest != null && (store.vquizBest[r.topicId] == null || r.quizBest > store.vquizBest[r.topicId])) store.vquizBest[r.topicId] = r.quizBest;
    if (r.vocabTotal != null && store.vocabTotal[r.topicId] === undefined) store.vocabTotal[r.topicId] = r.vocabTotal;
  });
  write(VOCAB_SAVED_KEY, store.vocabSaved);
  write(VOCAB_TOTAL_KEY, store.vocabTotal);
  write(VQUIZ_BEST_KEY, store.vquizBest);
}
async function sendVocabProgress(items, queueOnFail) {
  const uk = vpUserKey();
  const pend = vpPending();
  const queued = Array.isArray(pend[uk]) ? pend[uk] : [];
  const all = queued.concat(items);
  try {
    const d = await apiFetch('/task2/vocab-progress/sync', { method: 'POST', body: JSON.stringify({ items: all }) });
    if (queued.length) { const p = vpPending(); delete p[uk]; write(VOCAB_PENDING_KEY, p); }
    return d.progress || [];
  } catch {
    if (queueOnFail && items.length) { const p = vpPending(); p[uk] = all.slice(-300); write(VOCAB_PENDING_KEY, p); }
    return null;
  }
}
// Page load: replaces the cache with the server copy. The first run in a
// browser uploads what it had saved before progress lived on the server.
export async function loadVocabProgress() {
  if (!isLoggedIn()) return;
  let legacy = [];
  let synced = true;
  try { synced = !!localStorage.getItem(VOCAB_SYNCED_KEY); } catch { /* private mode */ }
  if (!synced) {
    const ids = new Set([...Object.keys(store.vocabSaved), ...Object.keys(store.vquizBest)]);
    legacy = [...ids].map((id) => ({ topicId: id, savedTerms: store.vocabSaved[id] || [], quizBest: store.vquizBest[id] ?? null }));
  }
  const rows = await sendVocabProgress(legacy, false);
  if (!rows) return;
  try { localStorage.setItem(VOCAB_SYNCED_KEY, '1'); } catch { /* private mode */ }
  applyVocabProgress(rows, true);
}
export function pushVocabProgress(item, onDone) {
  if (!isLoggedIn()) return;
  sendVocabProgress([item], true).then((rows) => { if (rows) { applyVocabProgress(rows, false); onDone?.(); } });
}

// ── Lesson: translate gate ──────────────────────────────────────────────
// lesson = { status, sentences, legacyPassed } of the open topic
export function translateProgress(lesson) {
  if (!lesson || lesson.status !== 'ready') return null;
  const total = lesson.sentences.length;
  const translated = lesson.sentences.filter((x) => x.en).length;
  const correct = lesson.sentences.filter((x) => x.en && x.isCorrect).length;
  const pct = total ? Math.round(correct / total * 100) : 100;
  const need = Math.max(0, Math.ceil(total * T2_TRANSLATE_PASS / 100) - correct);
  // legacyPassed: this buổi's sentence set was replaced after the student
  // had already passed the old one — the writing steps stay open.
  const legacy = !!lesson.legacyPassed && need > 0;
  return { total, translated, correct, pct, passed: need === 0 || legacy, need: legacy ? 0 : need, legacy };
}
export function translateGateMessage(lesson) {
  const tp = translateProgress(lesson);
  if (!tp) return 'Đang tải kết quả dịch câu…';
  return `Cần đúng ≥ ${T2_TRANSLATE_PASS}% ở bước 3 · đang ${tp.correct}/${tp.total} câu, thiếu ${tp.need} câu.`;
}

// ── Weeks screen ────────────────────────────────────────────────────────
// Drafts that still have unanswered questions
export function pendingDrafts(allDrafts) {
  return (allDrafts || [])
    .map((d) => ({ ...d, _rem: (d.questionIds?.length || 0) - (d.currentIdx || 0) }))
    .filter((d) => d._rem > 0);
}
export function sessState(s, lessonProgress, draftTopicIds) {
  const p = lessonProgress[s._id];
  if (p && p.submitted) return 'done';
  if ((p && p.written) || draftTopicIds.has(String(s._id))) return 'doing';
  return 'todo';
}
export function nextSession(list, lessonProgress, draftTopicIds) {
  return list.find((s) => sessState(s, lessonProgress, draftTopicIds) === 'doing')
    || list.find((s) => sessState(s, lessonProgress, draftTopicIds) === 'todo') || null;
}

// ── Text helpers ────────────────────────────────────────────────────────
export const reEsc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// `term` allowing -s/-ed/-ing endings on each word → match groups [1]=lead, [2]=term
export function termRegex(term) {
  const words = String(term || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return new RegExp('(^|[^A-Za-z])(' + words.map((w) => reEsc(w) + '(?:s|es|d|ed|ing)?').join('\\s+') + ')(?![A-Za-z])', 'i');
}
// → [before, marked, after] or null
export function termSplit(text, term) {
  const re = termRegex(term);
  const m = re && re.exec(text);
  if (!m) return null;
  const s = m.index + m[1].length; const e = s + m[2].length;
  return [text.slice(0, s), text.slice(s, e), text.slice(e)];
}
// questionText looks like: Dịch sang tiếng Anh (dùng từ "X"):\n\n"<câu tiếng Việt>"
export function sentenceParts(qt, full) {
  const raw = String(qt || '').trim();
  const kw = (raw.match(/dùng (?:từ|cụm từ|cấu trúc)\s*["“]([^"”]+)["”]/i) || [])[1] || '';
  const parts = raw.split(/\n\s*\n/);
  let vi = (parts.length > 1 ? parts[parts.length - 1] : raw).trim().replace(/^["“]+|["”]+$/g, '').trim();
  if (!full && vi.length > 260) vi = vi.slice(0, 257) + '…';
  return { vi, kw };
}
// text cut at the given spans → [{ text, span: k|null }]
export function spanPieces(text, spans) {
  const out = []; let pos = 0;
  spans.forEach((s, k) => { out.push({ text: text.slice(pos, s.start), span: null }); out.push({ text: text.slice(s.start, s.end), span: k }); pos = s.end; });
  out.push({ text: text.slice(pos), span: null });
  return out;
}
// Template frame → [{ text, slot }] where "(slot)" is the part to replace
export function tplPieces(en) {
  const out = []; const s = String(en || ''); let pos = 0;
  for (const m of s.matchAll(/\([^()]*\)/g)) {
    if (m.index > pos) out.push({ text: s.slice(pos, m.index), slot: false });
    out.push({ text: m[0], slot: true }); pos = m.index + m[0].length;
  }
  if (pos < s.length) out.push({ text: s.slice(pos), slot: false });
  return out;
}

// ── ④ Guided writing ────────────────────────────────────────────────────
export const RECIPE = [
  { role: 'main', k: 'Ý CHÍNH', v: 'Câu chủ đề — 1 ý từ brainstorm', ex: 'One major advantage of … is that …' },
  { role: 'why', k: 'GIẢI THÍCH', v: 'Vì sao ý đó đúng / hợp lý', ex: 'This is mainly because …' },
  { role: 'result', k: 'KẾT QUẢ', v: 'Ý đó dẫn đến điều gì', ex: 'As a result, …' },
  { role: 'ex', k: 'VÍ DỤ', v: 'Dẫn chứng cụ thể (câu ví dụ đã dịch)', ex: 'For example, …' },
];
const ROLE_RE = [
  ['ex', /^(for example|for instance|to illustrate|to give an example|a (good|clear|typical|notable|striking) example|an example|e\.g\.|this (is|was|can be) (clearly )?(seen|evident|illustrated|demonstrated)|according to|research (by|from|shows)|studies (show|suggest)|in (19|20)\d\d)/i],
  ['result', /^(as a (result|consequence)|consequently|therefore|thus|hence|accordingly|in turn|this (means|meant|leads|led|results|can lead|could lead|would lead|may lead|in turn|then|allows|enables|helps|makes|suggests|shows|indicates|demonstrates)|this,|which means|so,|because of this|as such|if (this|these|such|current) )/i],
  ['why', /^(this is (mainly |largely |partly |primarily |simply )?(because|due to|since)|this can (largely |partly )?be (attributed|explained)|because|the (main |primary )?reason|this is due|since|it is (because|due)|after all)/i],
  ['main', /^(firstly|first(ly)?,|secondly|second,|thirdly|finally,|furthermore|moreover|in addition|additionally|on the one hand|on the other hand|(one|another)( of the)?( most)?( \w+){0,2} (advantages?|disadvantages?|benefits?|drawbacks?|reasons?|causes?|factors?|contributors?|effects?|impacts?|consequences?|solutions?|measures?|ways?|steps?|approach(es)?|arguments?|problems?|issues?)\b|the (first|second|main|primary|most) )/i],
];
export const ROLE_NUM = { main: 1, why: 2, result: 3, ex: 4 };
// A paragraph sentence by sentence → [{ role, text }] (①–④ = Ý chính → Giải thích → Kết quả → Ví dụ)
export function roleSentences(text) {
  const sents = String(text || '').match(/[^.!?]+(?:[.!?]+["”’)]?|$)\s*/g) || [];
  let prev = null;
  const out = [];
  sents.forEach((s, i) => {
    const t = s.trim();
    if (!t) return;
    let role = null;
    for (const [r, re] of ROLE_RE) if (re.test(t)) { role = r; break; }
    if (!role) role = i === 0 ? 'main' : prev === 'main' ? 'why' : (prev || 'why');
    prev = role;
    out.push({ role, text: t });
  });
  return out;
}
export function perBodyChains(perBody) {
  return String(perBody || '').split('|').map((g) => g.trim()).filter(Boolean).map((g) => {
    let label = ''; let rest = g;
    const m = g.match(/^([^:→]{2,20}):\s*(.+)$/);
    if (m) { label = m[1].trim(); rest = m[2]; }
    const steps = rest.split('→').map((s) => s.trim()).filter(Boolean);
    let note = '';
    const last = steps[steps.length - 1] || '';
    const cut = last.indexOf('. ');
    if (cut > 0) { note = last.slice(cut + 2).trim(); steps[steps.length - 1] = last.slice(0, cut); }
    return { label, steps, note };
  });
}
export function guideFlow(g) {
  return g?.outline?.flow ? g.outline.flow.split('→').map((s) => s.trim()).filter(Boolean) : ['INTRODUCTION', 'BODY 1', 'BODY 2', 'CONCLUSION'];
}

// ── Writer: the book template (js/task2-generic-templates.js) ───────────
export function tplTypeId(t) {
  return ESSAY_TYPE_ID[t.essayType] || window.Task2GenericTpl?.guessType?.(t.prompt || '') || null;
}
export function templateFor(tplData, t, level) {
  const lv = (tplData || {})[level || 'band7'] || {};
  return lv[tplTypeId(t)] || null;
}
const TPL_SEC_RE = { intro: /Introduction/i, body1: /Body 1/i, body2: /Body 2/i, conclusion: /Conclusion/i };
export const tplSection = (tpl, key) => ((tpl && tpl.sections) || []).find((s) => TPL_SEC_RE[key].test(s.title)) || null;

export const SENT_GROUPS = [
  { type: 'paraphrase', title: 'Paraphrase đề — dùng cho Mở bài' },
  { type: 'translation', title: 'Câu ý chính & dẫn chứng — dùng cho Thân bài' },
  { type: 'short_writing', title: 'Kết bài bạn tự viết — dùng cho Kết bài' },
];
// Sentences from Daniel's model essay carry their paragraph ("MỞ BÀI · …")
export const SECTION_GROUPS = [
  { type: 'intro', re: /^MỞ BÀI\b/, title: 'Mở bài' },
  { type: 'body1', re: /^THÂN BÀI 1\b/, title: 'Thân bài 1' },
  { type: 'body2', re: /^THÂN BÀI 2\b/, title: 'Thân bài 2' },
  { type: 'short_writing', re: null, title: 'Kết bài bạn tự viết' },
];
export function sentSection(s) {
  if (s.type === 'short_writing') return 'short_writing';
  const g = SECTION_GROUPS.find((x) => x.re && x.re.test(String(s.questionText || '').trim()));
  return g ? g.type : null;
}
export function sentGroupType(s) {
  if (s.type === 'translation' && /^(in conclusion|to conclude|to sum up|in summary|overall,)/i.test(String(s.model || '').trim())) return 'short_writing';
  return s.type;
}

// ── "Tự viết kết bài" (short_writing) ───────────────────────────────────
const CONCL_START_RE = /^\s*(in conclusion|to conclude|to sum up|in summary|to summari[sz]e|overall|in short|all things considered|on balance)\b/i;
const CONCL_OPINION_RE = /\b(I\s+(strongly\s+|firmly\s+)?(believe|think|feel|maintain|would argue|am convinced|agree|disagree)|in my (view|opinion)|personally|from my (perspective|point of view))\b/i;
export function conclAsksOpinion(t) {
  if (!t) return false;
  if (['agree_disagree', 'discuss_both_views', 'positive_or_negative_development'].includes(t.essayType)) return true;
  return /\b(your (own )?opinion|do you (agree|think|believe)|to what extent|outweigh|positive or negative|which .{0,40}(better|more important))\b/i.test(t.prompt || '');
}
// → Set of conditional types (1, 2) found; "would have" (type 3) not counted
function conditionalTypes(text) {
  const out = new Set();
  String(text || '').split(/(?<=[.!?])\s+/).forEach((s) => {
    if (!/\b(if|unless|provided that|as long as)\b/i.test(s) && !/^\s*were\s+\w+/i.test(s)) return;
    if (/\b(would|could|might)\s+have\s+\w+/i.test(s)) return;
    if (/\b(would|could|might)\b/i.test(s) || /^\s*were\s+\w+/i.test(s)) out.add(2);
    else if (/\b(will|can|may|must|should|is likely to|are likely to|is going to|are going to)\b/i.test(s)) out.add(1);
  });
  return out;
}
export function conclChecks(text, t) {
  const v = String(text || '').trim();
  const n = wc(v);
  const nSent = (v.match(/[.!?](\s|$)/g) || []).length;
  const cond = conditionalTypes(v);
  const checks = [
    { ok: CONCL_START_RE.test(v), label: 'Mở bằng In conclusion / To sum up' },
    { ok: nSent >= 2 && n >= 25, label: `2–3 câu · ${n} từ` },
  ];
  if (conclAsksOpinion(t)) checks.push({ ok: CONCL_OPINION_RE.test(v), label: 'Nêu ý kiến của bạn' });
  checks.push({ ok: cond.size > 0, bonus: true, label: cond.size ? `Câu điều kiện loại ${[...cond].sort().join(' + ')}` : 'Câu điều kiện loại 1/2' });
  return checks;
}

// ── "Dịch câu" formats ──────────────────────────────────────────────────
//   mcq — key phrase blanked, pick it from 4 · gap — type it (first letters)
//   listen — hear it, type 2–3 missing words · type — word-by-word typing
//   order — long sentences: click the phrases into order · write — own conclusion
export const DRILL_MODES = {
  mcq: { label: 'Chọn cụm đúng', icon: 'fa-list-check', cls: 'm-mcq' },
  gap: { label: 'Điền cụm từ', icon: 'fa-pen', cls: 'm-gap' },
  listen: { label: 'Nghe & điền', icon: 'fa-headphones', cls: 'm-listen' },
  type: { label: 'Gõ cả câu', icon: 'fa-keyboard', cls: 'm-type' },
  order: { label: 'Ghép cụm', icon: 'fa-puzzle-piece', cls: 'm-order' },
  write: { label: 'Tự viết kết bài', icon: 'fa-feather-pointed', cls: 'm-write' },
};
const DRILL_CYCLE = ['mcq', 'gap', 'listen', 'type'];
const DRILL_LONG_WORDS = 22;
const GF_STOP = new Set(('about above after again against because before being below between could during every further having other their there these those through under until where which while would should people things today often their always').split(' '));

// Where the key phrase sits in the model sentence → { start, end, text } | null
function keySpan(q) {
  const ans = q.translationAnswer || '';
  const { kw } = sentenceParts(q.questionText);
  const cands = [];
  if (kw && !/\.\.\.|…/.test(kw)) cands.push(kw);
  (q.fallbackKeywords || []).slice().sort((a, b) => b.length - a.length)
    .filter((k) => /\s/.test(k.trim()) || k.trim().length >= 7).forEach((k) => cands.push(k));
  for (const c of cands) {
    const re = termRegex(c);
    const m = re && re.exec(ans);
    if (m && m[2].length >= 4) { const start = m.index + m[1].length; return { start, end: start + m[2].length, text: m[2] }; }
  }
  return null;
}
// Every freshly fetched question list (all of the topic's questions, so a
// sentence's format doesn't depend on the subset). Sets q._mode / q._key on
// the fetched objects and returns the mcq distractor pool.
export function assignDrillModes(questions, vocabList) {
  (questions || []).forEach((q) => { if (q.type === 'short_writing') { q._mode = 'write'; q._key = null; } });
  const list = (questions || []).filter((q) => WBW_TYPES.has(q.type) && q.type !== 'short_writing' && q.translationAnswer)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  let k = 0; let j = 0;
  list.forEach((q) => {
    q._key = null;
    if (q.type !== 'translation' || wc(q.translationAnswer) > DRILL_LONG_WORDS) { q._mode = 'order'; return; }
    q._key = keySpan(q);
    q._mode = q._key ? DRILL_CYCLE[k++ % DRILL_CYCLE.length] : (j++ % 2 ? 'type' : 'listen');
  });
  const pool = new Map();
  list.forEach((q) => { if (q._key) pool.set(q._key.text.toLowerCase(), q._key.text); });
  (vocabList || []).forEach((v) => { if (v.term && !/\.\.|…|\//.test(v.term)) pool.set(v.term.toLowerCase(), v.term); });
  const out = [...pool.values()];
  // Too few phrases to make 4 options → type it instead
  if (out.length < 4) list.forEach((q) => { if (q._mode === 'mcq') q._mode = 'gap'; });
  return out;
}
// The blanks of a gap/listen/mcq sentence (sorted). listen adds up to two
// more long content words (not proper nouns, never next to another blank).
export function gfBlanks(q) {
  if (!q || !q.translationAnswer) return [];
  const out = q._key ? [q._key] : [];
  if (q._mode === 'listen') {
    const ans = q.translationAnswer;
    const words = [...ans.matchAll(/[A-Za-z][A-Za-z'-]*/g)].map((m) => ({ start: m.index, end: m.index + m[0].length, text: m[0] }));
    const free = (w) => !out.some((b) => w.start < b.end + 2 && w.end > b.start - 2);
    words.filter((w) => w.start > 0 && w.text.length >= 5 && !GF_STOP.has(w.text.toLowerCase()) && !/^[A-Z]/.test(w.text))
      .sort((a, b) => b.text.length - a.text.length || a.start - b.start)
      .forEach((w) => { if (out.length < 3 && free(w)) out.push(w); });
  }
  return out.slice().sort((a, b) => a.start - b.start);
}
export const gfHint = (text) => text.split(/(\s+|-)/).map((w) => (/^[A-Za-z]/.test(w) ? w[0] + '_'.repeat(w.length - 1) : w)).join('');
export const gfNorm = (s) => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/-/g, ' ').replace(/[^a-z0-9' ]/g, '').replace(/\s+/g, ' ').trim();
export function gfOptions(q, pool) {
  const ans = q._key.text;
  const low = ans.toLowerCase();
  const n = ans.trim().split(/\s+/).length;
  const rng = seededRng(String(qid(q)) + ':mcq');
  let cand = (pool || []).filter((p) => { const l = p.toLowerCase(); return l !== low && !l.includes(low) && !low.includes(l); });
  // Fragments like "keep pace with" can never fill a noun slot — poor distractors
  const whole = cand.filter((p) => !/\s(to|with|of|for|on|in|at|from|into|by|about|as)$/i.test(p.trim()));
  if (whole.length >= 3) cand = whole;
  const cands = shuffle(cand.slice(), rng)
    .sort((a, b) => Math.abs(a.split(/\s+/).length - n) - Math.abs(b.split(/\s+/).length - n));
  const atStart = q._key.start === 0;
  const fmt = (s) => (atStart ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  return shuffle([{ text: ans, ok: true }, ...cands.slice(0, 3).map((t) => ({ text: t, ok: false }))], rng)
    .map((o) => ({ ...o, label: fmt(o.text) }));
}
export const isGfQuestion = (q) => !!(q && q.translationAnswer && ['mcq', 'gap', 'listen'].includes(q._mode) && gfBlanks(q).length);
export const isOrdQuestion = (q) => !!(q && q.translationAnswer && q.type !== 'short_writing' && q._mode === 'order');
// The format this question is drilled in (null: not a sentence-building drill)
export function drillMode(q) {
  if (q && q.type === 'short_writing') return 'write';
  if (!q || !WBW_TYPES.has(q.type) || !q.translationAnswer) return null;
  if (isGfQuestion(q)) return q._mode;
  if (isOrdQuestion(q)) return 'order';
  return 'type';
}

// Word-by-word typing drill tokens: what the student types + the mask shown
export function wbwTokenize(answer) {
  return String(answer).trim().split(/\s+/).filter(Boolean).map((raw) => {
    const target = raw.replace(/[^A-Za-z0-9]/g, '');
    let seen = false;
    const mask = [...raw].map((ch) => {
      if (/[A-Za-z0-9]/.test(ch)) { if (!seen) { seen = true; return ch; } return '*'; }
      return ch;
    }).join('');
    return { raw, target, mask };
  }).filter((t) => t.target.length > 0);
}

// "Ghép cụm": model paragraph → short phrases (mostly 3–7 words)
const ORD_MAX_WORDS = 7;
const ORD_CONJ = new Set(['because', 'although', 'though', 'while', 'whereas', 'and', 'but', 'or', 'which', 'who', 'whose', 'where', 'as', 'since', 'so', 'if', 'when', 'unless', 'rather', 'instead', 'whether', 'that', 'than']);
const ORD_PREP = new Set(['by', 'through', 'with', 'without', 'to', 'in', 'for', 'of', 'on', 'from', 'into', 'at', 'about', 'over', 'such']);
export function ordChunks(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  let pieces = [];
  let cur = [];
  words.forEach((w) => { cur.push(w); if (/[,;:]$/.test(w)) { pieces.push(cur); cur = []; } });
  if (cur.length) pieces.push(cur);
  const norm = (w) => w.toLowerCase().replace(/[^a-z']/g, '');
  const splitAt = (p, set) => {
    if (p.length <= ORD_MAX_WORDS) return [p];
    let best = -1; let bestD = Infinity;
    for (let i = 3; i <= p.length - 3; i++) {
      if (!set.has(norm(p[i])) || (norm(p[i]) === 'as' && norm(p[i - 1]) === 'such')) continue;
      const d = Math.abs(i - p.length / 2);
      if (d < bestD) { best = i; bestD = d; }
    }
    if (best < 0) return [p];
    return [...splitAt(p.slice(0, best), set), ...splitAt(p.slice(best), set)];
  };
  const halve = (p) => {
    if (p.length <= ORD_MAX_WORDS + 3) return [p];
    let mid = Math.ceil(p.length / 2);
    while (mid < p.length - 2 && /^(a|an|the|to|of)$/i.test(p[mid - 1])) mid++;
    return [...halve(p.slice(0, mid)), ...halve(p.slice(mid))];
  };
  pieces = pieces.flatMap((p) => splitAt(p, ORD_CONJ)).flatMap((p) => splitAt(p, ORD_PREP)).flatMap(halve);
  const out = [];
  pieces.forEach((p) => {
    if (p.length === 1 && out.length) out[out.length - 1] = out[out.length - 1].concat(p);
    else out.push(p);
  });
  if (out.length > 1 && out[0].length === 1) out.splice(0, 2, out[0].concat(out[1]));
  return out.map((p) => p.join(' '));
}
// The phrase bank order (never the answer already in order)
export function ordBank(chunks) {
  const bank = shuffle(chunks.map((_, i) => i));
  if (chunks.length > 1 && bank.every((v, i) => chunks[v] === chunks[i])) bank.push(bank.shift());
  return bank;
}
// "Sắp xếp từ" chips: admin baseWords, else the "[a / b / c]" part of questionText
export function rearrangeWords(q) {
  return (q.baseWords && q.baseWords.length)
    ? q.baseWords
    : (q.questionText.match(/\[(.*)\]/s)?.[1] || '').split('/').map((w) => w.trim()).filter(Boolean);
}

// ── Vocab quiz — fixed per topic (seeded by the topic id) ───────────────
function vquizGap(v) {
  if (!v.example || !v.term) return null;
  const re = new RegExp(reEsc(v.term), 'i');
  return re.test(v.example) ? v.example.replace(re, '_____') : null;
}
export function buildVocabQuiz(list, seed) {
  const rng = seededRng(seed);
  const usable = list.filter((v) => v.term && v.definitionVi);
  return shuffle([...usable], rng).slice(0, VQUIZ_LEN).map((v) => {
    const gap = vquizGap(v);
    // Using the term in a sentence (gap) is what transfers to writing: twice as often
    const kinds = gap ? ['vi2en', 'en2vi', 'gap', 'gap'] : ['vi2en', 'en2vi'];
    const kind = kinds[Math.floor(rng() * kinds.length)];
    const field = kind === 'en2vi' ? 'definitionVi' : 'term';
    const answer = v[field];
    const others = [...new Set(usable.map((o) => o[field]).filter((x) => x && x !== answer))];
    return {
      kind, answer, term: v.term, def: v.definitionVi, ex: v.example || '',
      prompt: kind === 'vi2en' ? v.definitionVi : kind === 'en2vi' ? v.term : gap,
      options: shuffle([answer, ...shuffle(others, rng).slice(0, 3)], rng),
    };
  });
}

export function memeImage(pct) {
  if (pct >= 90) return '/img/vocab_writingabove90%25.jpg';
  if (pct >= 70) return '/img/above7.5.jpg';
  if (pct >= 60) return '/img/band_6_7.jpg';
  if (pct >= 50) return '/img/writingbelow60%25.jpg';
  if (pct >= 45) return '/img/writingbelow50%25.jpg';
  return '/img/writingbelow45%25.jpg';
}

// Speaks a whole English sentence (Web Speech, best available voice)
export function speakSentence(text, slow) {
  const synth = window.speechSynthesis;
  if (synth && typeof SpeechSynthesisUtterance !== 'undefined') {
    try {
      window.WordAudio?.stop?.();
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = slow ? 0.7 : 0.95;
      const voices = synth.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
      const good = /Google|Natural|Neural|Online|Samantha|Aria|Jenny|Ava|Allison/i;
      const v = voices.find((x) => /^en[-_]US/i.test(x.lang) && good.test(x.name)) || voices.find((x) => good.test(x.name)) || voices.find((x) => /^en[-_]US/i.test(x.lang)) || voices[0];
      if (v) u.voice = v;
      synth.speak(u);
      return;
    } catch { /* fall back */ }
  }
  window.WordAudio?.speak?.(text, { slow });
}
export function speakTerm(term) {
  if (window.WordAudio) { window.WordAudio.speak(term); return; }
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(term);
  u.lang = 'en-US';
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export const BASE = '/task2-practice';
export function hubUrl(week, topicId, extra = {}) {
  const p = new URLSearchParams();
  if (week) p.set('week', week);
  if (topicId) p.set('topicId', topicId);
  Object.entries(extra).forEach(([k, v]) => p.set(k, v));
  const s = p.toString();
  return BASE + (s ? '?' + s : '');
}
