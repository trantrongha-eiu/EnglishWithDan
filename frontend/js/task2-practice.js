// task2-practice.html — IELTS Task 2 Practice
// ════════════════════════════════════════════════════════
//  CONFIG
// ════════════════════════════════════════════════════════
const API = (window.AuthService && window.AuthService.API && window.AuthService.API.replace(/\/api\/?$/, '')) || 'https://englishwithdan.onrender.com';

// playOk/playWrong/toggleWpSound moved to js/shared/sound-effects.js
// (single source of truth — student UI audit Nhóm 2, 2026-07-25).

// showToast() moved to js/shared/toast.js (single source of truth — Phase 3 audit).

function _escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const ESSAY_LABELS = { advantages_disadvantages:'Adv & Disadv', cause_effect:'Cause & Effect', cause_solution:'Cause & Solution', effect_solution:'Effect & Solution', agree_disagree:'Agree / Disagree', discuss_both_views:'Discuss Both Views', positive_or_negative_development:'Positive or Negative Dev' };
const ESSAY_BADGE_CLASS = { advantages_disadvantages:'et-badge et-adv', cause_effect:'et-badge et-cause', cause_solution:'et-badge et-cause', effect_solution:'et-badge et-cause', agree_disagree:'et-badge et-opinion', discuss_both_views:'et-badge et-discuss', positive_or_negative_development:'et-badge et-posneg' };
const Q_LABELS = { essay_type_recognition:'Nhận diện dạng', fill_blank:'Điền chỗ trống', rearrange:'Sắp xếp từ', translation:'Dịch câu', error_correction:'Sửa lỗi', topic_sentence:'Chọn topic sentence', short_writing:'Viết đoạn', paraphrase:'Paraphrase' };
// Types that run the word-by-word "Dịch câu" typing drill (server ships a
// model sentence as q.translationAnswer for each). translation + paraphrase
// + the conclusion / short-writing prompts.
const WBW_TYPES = new Set(['translation', 'paraphrase', 'short_writing']);
// Site-wide typing rule (same as every WbwDrill caller): the
// WBW_MAX_WORD_ERRORS-th wrong try on one word fails the sentence, which
// then comes back WBW_REQUEUE_GAP questions later for another go — at most WBW_MAX_REQUEUES times, so no endless loop.
// Counted per word (not per sentence like vocab) since a sentence is ~30 words.
const WBW_MAX_WORD_ERRORS = 3;
const WBW_MAX_ASKS = 3;       // "Hỏi Lulu" asks per sentence (graded, so capped)
const WBW_REQUEUE_GAP = 3;
const WBW_MAX_REQUEUES = 2;
// "Viết đoạn kết bài" (short_writing): the model is one ~35-word sentence,
// too long to type word by word — the student rebuilds it from short
// phrases instead (click to order). The ORD_MAX_TRIES-th wrong check fails it.
const ORD_TYPES = new Set(['short_writing']);
const ORD_MAX_TRIES = 3;
const LEVEL_COLORS = { beginner:'#22c55e', elementary:'#3b82f6', intermediate:'#a855f7' };

// Each essay type spans 2 consecutive weeks (1 theme each, no theme repeated
// across blocks) — see restructure notes (2026). Weeks 15-18 stay "Ôn tập"
// (mixed review content). Ordered Type01→Type07 (matches Task2Topic.week
// reassignment in seedTask2Exercises.js and the WT1 Task 2 course's Module 2
// lesson order). The weeks screen renders one card per group.
const WEEK_GROUPS = [
  { essayType: 'advantages_disadvantages',         theme: 'Technology',      emoji: '💻', weeks: [1, 2] },
  { essayType: 'discuss_both_views',               theme: 'Government',      emoji: '🏛️', weeks: [3, 4] },
  { essayType: 'cause_solution',                   theme: 'Health',          emoji: '🩺', weeks: [5, 6] },
  { essayType: 'effect_solution',                  theme: 'Transport',       emoji: '🚆', weeks: [7, 8] },
  { essayType: 'cause_effect',                     theme: 'Education',       emoji: '🎓', weeks: [9, 10] },
  { essayType: 'agree_disagree',                   theme: 'Work',            emoji: '💼', weeks: [11, 12] },
  { essayType: 'positive_or_negative_development', theme: 'Environment',     emoji: '🌿', weeks: [13, 14] },
  { essayType: null,                               theme: 'Ôn tập tổng hợp', emoji: '🔁', weeks: [15, 16, 17, 18] }
];
function weekLabel(w) {
  const g = WEEK_GROUPS.find(g => g.weeks.includes(w));
  if (!g) return '';
  return g.essayType ? `${ESSAY_LABELS[g.essayType]} · ${g.theme}` : 'Ôn tập';
}

// ── Lessons ("Buổi học") ────────────────────────────────────────────────
// Every topic (= one Writing Task 2 prompt) is ONE class session, numbered
// Buổi 1..N in course order (GET /api/task2/sessions). A session runs:
//   Giai đoạn 1 · Scaffolding (~60′): ① từ vựng ② brainstorm nhóm
//                                     ③ dịch câu ④ hướng dẫn viết
//   Giai đoạn 2 · Viết trên lớp (~30′): ⑤ Mở bài + Thân bài 1
//   Giai đoạn 3 · Bài tập về nhà:        ⑥ Thân bài 2 + Kết bài (template)
// The essay is written on a split screen — the student's own translated
// sentences on the left, the essay on the right. Sections + brainstorm notes
// are saved per student on the server (/api/task2/lesson/:topicId) since
// the two halves are usually written on different devices.
const ESSAY_TYPE_ID = { advantages_disadvantages:'type01', discuss_both_views:'type02', cause_solution:'type03', effect_solution:'type04', cause_effect:'type05', agree_disagree:'type06', positive_or_negative_development:'type07' };
const LESSON_SECTIONS = [
  { key: 'intro',      label: 'Mở bài',     en: 'Introduction', phase: 'class', tplIdx: 0, ph: 'Paraphrase đề bài + nêu hướng triển khai / quan điểm (thesis)...' },
  { key: 'body1',      label: 'Thân bài 1', en: 'Body 1',       phase: 'class', tplIdx: 1, ph: 'Câu chủ đề (ý chính) → giải thích (because) → kết quả (result) → ví dụ (example)...' },
  { key: 'body2',      label: 'Thân bài 2', en: 'Body 2',       phase: 'home',  tplIdx: 2, ph: 'Viết theo template trong sách: câu chủ đề → giải thích → kết quả → ví dụ...' },
  { key: 'conclusion', label: 'Kết bài',    en: 'Conclusion',   phase: 'home',  tplIdx: 3, ph: 'In conclusion, ... tóm tắt 2 ý chính + nhắc lại quan điểm...' }
];
const LESSON_MIN_WORDS = 250;
function sessionNumber(topicId) {
  const i = state.sessions.findIndex(s => s._id === topicId);
  return i >= 0 ? i + 1 : null;
}
function sessionLabel(topicId) {
  const n = sessionNumber(topicId);
  return n ? `Buổi ${n}` : '';
}
function _wc(s) {
  const t = String(s || '').trim();
  return t ? t.split(/\s+/).length : 0;
}
function _emptySections() { return { intro: '', body1: '', body2: '', conclusion: '' }; }

// ════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════
let _practiceKeyHandler = null;  // track listener to avoid accumulation

let state = {
  view: 'weeks',  // weeks | topics | select | practice | exam | vocab | done
  selectedWeek: null,
  selectedTopic: null,
  selectedLevel: 'all',  // level picker removed from practice UI — always "all" now
  currentMode: 'practice',  // practice | exam | vocab | retry
  weeks: [],
  topics: [],
  questions: [],
  vocab: [],
  currentIdx: 0,
  sessionDone: 0, sessionCorrect: 0,
  sessionAttempts: [],
  // rearrange
  rearrangeAnswer: [],
  rearrangeWords: [],
  // mc selected
  mcSelected: null,
  // exam
  examQuestions: [], examAnswers: [], examIdx: 0, examLevel: 'beginner', examCount: 10,
  examTimerInterval: null, examTimeLeft: 0, examTotalTime: 0,
  _isSubmitting: false,
  // wrong-question tracking (cross-session)
  wrongQuestionIds: [],
  // per-question status for progress dots
  questionStatus: [],
  // saved session draft for resuming
  draft: null,
  // this user's practice record for the selected topic ({practiced,bestScore,...})
  // — gates the "Viết bài ngay" button. Fetched in selectTopic().
  topicStats: null,
  // all drafts across topics (for week screen indicators)
  allDrafts: [],
  // settings toggles (remembered per browser — see _loadT2Prefs)
  autoNext: false,
  shuffleMode: false,
  // Topic hub: vocab is loaded inline (no separate "Từ vựng" screen).
  // vocabFor = the topic _id state.vocab belongs to; vocabError = last fetch failed.
  vocabFor: null,
  vocabError: false,
  vocabOpen: null,      // null = auto (open until every term is saved)
  vocabQuiz: null,      // optional inline quiz — see startVocabQuiz()
  // Brainstorm notes survive hub re-renders (vocab save, stats refresh).
  brainstorm: { topicId: null, notes: [], open: true, hintOpen: false },
  promptOpen: true,     // practice screen's collapsible prompt box
  // Lessons — see LESSON_SECTIONS above.
  sessions: [],         // every topic in course order → "Buổi N"
  lessonProgress: {},   // topicId → { written: 0-4 sections, submitted }
  // status: idle | loading | ready | error. sentences = the student's own
  // English for each translation/paraphrase/short_writing question.
  lesson: { topicId: null, status: 'idle', sentences: [], sections: _emptySections(), submittedAt: null },
  translateOnly: false, // practice run limited to the sentence-building questions (step ③)
  infoOpen: new Set(),  // ⓘ explanations the student has opened (see _infoBtn)
  compose:{ phase: 'class', tab: 'sentences', lastFocus: 'intro', refOpen: false, revealed: {} }
};

const T2_PREFS_KEY = 't2_prefs';
(function _loadT2Prefs() {
  try {
    const p = JSON.parse(localStorage.getItem(T2_PREFS_KEY) || '{}');
    state.autoNext = !!p.autoNext;
    state.shuffleMode = !!p.shuffleMode;
  } catch {}
})();

let _autoNextTimer = null;
let _examKeyHandler = null;

// ════════════════════════════════════════════════════════
//  SHAREABLE URL
// ════════════════════════════════════════════════════════
function copyT2ShareUrl() {
  const params = new URLSearchParams();
  if (state.selectedWeek) params.set('week', state.selectedWeek);
  if (state.selectedTopic?._id) params.set('topicId', state.selectedTopic._id);
  const url = location.origin + location.pathname.split('?')[0] + '?' + params.toString();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => showToast('Đã sao chép link chia sẻ!', 'info', 2500))
      .catch(() => _fallbackCopy(url));
  } else { _fallbackCopy(url); }
}
function _fallbackCopy(url) {
  const el = document.createElement('textarea');
  el.value = url; el.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(el); el.select();
  try { document.execCommand('copy'); showToast('Đã sao chép link chia sẻ!', 'info', 2500); }
  catch { showToast('Không sao chép được – hãy copy thủ công.', 'warn'); }
  document.body.removeChild(el);
}

// ════════════════════════════════════════════════════════
//  QUIT MODAL
// ════════════════════════════════════════════════════════
let _t2QuitCb = null;
let _t2QuitSaveCb = null;
let _vocabHintCount = 0;
let _vocabHintList  = [];
function askT2Quit(cb, opts = {}) {
  _t2QuitCb = cb;
  _t2QuitSaveCb = opts.onSave || null;
  document.getElementById('t2-quit-mascot').textContent   = opts.mascot      || '✏️';
  document.getElementById('t2-quit-title').textContent    = opts.title        || 'Dừng luyện tập?';
  document.getElementById('t2-quit-sub').textContent      = opts.sub          || '';
  document.getElementById('t2-quit-continue-btn').innerHTML = `<i class="fas fa-arrow-left"></i> ${opts.continueText || 'Tiếp tục học'}`;
  document.getElementById('t2-quit-leave-btn').innerHTML = '<i class="fas fa-sign-out-alt"></i> ' + (opts.confirmText || 'Dừng lại');
  const saveBtn = document.getElementById('t2-quit-save-btn');
  if (_t2QuitSaveCb) saveBtn.classList.remove('hidden');
  else saveBtn.classList.add('hidden');
  document.getElementById('t2-quit-overlay').classList.remove('hidden');
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('t2-quit-continue-btn').onclick = () =>
    document.getElementById('t2-quit-overlay').classList.add('hidden');
  document.getElementById('t2-quit-save-btn').onclick = () => {
    document.getElementById('t2-quit-overlay').classList.add('hidden');
    if (_t2QuitSaveCb) { _t2QuitSaveCb(); _t2QuitSaveCb = null; }
  };
  document.getElementById('t2-quit-leave-btn').onclick = () => {
    document.getElementById('t2-quit-overlay').classList.add('hidden');
    if (_t2QuitCb) { _t2QuitCb(); _t2QuitCb = null; }
  };
  // Close on backdrop click
  document.getElementById('t2-quit-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('t2-quit-overlay').classList.add('hidden');
  });
});

// ════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initUser();
  loadWeeks();
  // #app is a stable container that render() only ever innerHTML's into —
  // one registration here covers every view (weeks/topics/practice/exam/...).
  // Gate: dict lookup must be off only while a "thi thử" run is on screen
  // (view 'exam'). It used to key off state.currentMode, which stays 'exam'
  // after the student leaves the results for the week/topic lists — so
  // both lookups stayed dead there until a normal practice reset it.
  setupDictionaryDouble('app', 'task2-practice', () => state.view !== 'exam');

  // "tra câu" sentence-lookup icon (js/shared/sentence-lookup.js) — same
  // exam condition as the dict-lookup gate above, just inverted.
  window.__ewsExamActive = () => state.view === 'exam';
});

function initUser() {
  loadXPFromStorage();
}

function loadXPFromStorage() {
  const stored = _safeParse(localStorage.getItem('t2_progress'), { xp: 0, streak: 0 });
  document.getElementById('header-xp').textContent     = stored.xp     || 0;
  document.getElementById('header-streak').textContent = stored.streak  || 0;
}

function updateXPStorage(earned, incrementStreak = false) {
  const stored = _safeParse(localStorage.getItem('t2_progress'), { xp: 0, streak: 0 });
  stored.xp    = (stored.xp || 0) + earned;
  if (incrementStreak) stored.streak = (stored.streak || 0) + 1;
  localStorage.setItem('t2_progress', JSON.stringify(stored));
  document.getElementById('header-xp').textContent     = stored.xp;
  document.getElementById('header-streak').textContent = stored.streak;
}

// ── Per-topic completion tracking (bestScore/latestScore/completed/completedAt) ──
// Shared model with essential-grammar.html/task1-practice.html/task2-template.html/
// writing-practice.html. A topic "completes" once a practice session on it scores
// >=80% accuracy. Keyed by topic _id; total topic count for the progress badge is
// derived from whatever topics have been loaded into localStorage so far (a
// per-week API doesn't expose a single "total topics" count client-side).
const TOPIC_SCORE_KEY = 't2_topic_scores';
const TOPIC_COMPLETE_THRESHOLD = 80;
function _safeParse(json, fallback){ if(json==null) return fallback; try{ return JSON.parse(json); }catch{ return fallback; } }
let _topicScores = _safeParse(localStorage.getItem(TOPIC_SCORE_KEY), {});

function isTopicCompleted(topicId) { const s = _topicScores[topicId]; return !!(s && s.completed); }

function saveTopicScore(topicId, score) {
  const prev = _topicScores[topicId] || { bestScore: 0, latestScore: 0, completed: false, completedAt: null };
  const bestScore = Math.max(prev.bestScore, score);
  const completed = bestScore >= TOPIC_COMPLETE_THRESHOLD;
  const completedAt = (completed && !prev.completed) ? new Date().toISOString() : prev.completedAt;
  _topicScores[topicId] = { bestScore, latestScore: score, completed, completedAt };
  localStorage.setItem(TOPIC_SCORE_KEY, JSON.stringify(_topicScores));
}

function topicCompletedCount() {
  return Object.values(_topicScores).filter(s => s.completed).length;
}

// ── "Viết bài ngay" gate ──────────────────────────────────────────────────
// Full-essay writing is unlocked only after the student has practised this
// topic (at least one 'practice' session with questions) AND reached a best
// score of >= 70% on it. Server-verified via GET /api/task2/topic-stats/:id
// (state.topicStats), with the local _topicScores best as a fallback so a
// student who just finished a good session doesn't have to wait for a
// refetch to see it unlock.
const T2_WRITE_MIN_ACCURACY = 70;

function _bestPracticeScore(topicId) {
  // Only trust state.topicStats when it was loaded for THIS topic — a
  // back/forward nav can leave a previous topic's stats in place.
  const ts = state.topicStats;
  const server = (ts && ts.forTopic === topicId && ts.practiced) ? (ts.bestScore || 0) : null;
  const local  = _topicScores[topicId] ? (_topicScores[topicId].bestScore || 0) : null;
  if (server == null && local == null) return null; // never practised anywhere we can see
  return Math.max(server || 0, local || 0);
}

// Returns { ok, code, best }. code: 'ok' | 'not_practiced' | 'low_accuracy'.
function canWriteFullEssay(topicId) {
  if (_isStaffUser()) return { ok: true, code: 'ok', best: _bestPracticeScore(topicId) || 0 };
  const best = _bestPracticeScore(topicId);
  if (best == null) return { ok: false, code: 'not_practiced', best: 0 };
  if (best < T2_WRITE_MIN_ACCURACY) return { ok: false, code: 'low_accuracy', best };
  return { ok: true, code: 'ok', best };
}

function writeGateMessage(gate) {
  if (gate.code === 'not_practiced') {
    return `Hãy hoàn thành phần "Luyện tập" của chủ đề này trước đã. ` +
           `Bạn cần đạt tối thiểu ${T2_WRITE_MIN_ACCURACY}% số câu đúng (điểm cao nhất) thì nút "Viết bài ngay" mới mở khoá.`;
  }
  return `Bạn mới đạt cao nhất ${gate.best}% ở phần "Luyện tập". ` +
         `Cần tối thiểu ${T2_WRITE_MIN_ACCURACY}% mới mở khoá "Viết bài ngay" — hãy luyện thêm ` +
         `(hoặc dùng "Ôn câu sai") rồi thử lại.`;
}

// ── Vocab-learned gate — Luyện tập requires the topic's vocab to have been
// opened (Từ vựng tab, which caches its total word count below) AND every
// one of those terms saved into a VocabBook first. Keyed by topicId; the
// saved terms are synced to the server (see loadVocabProgress below). ──
const VOCAB_TOTAL_KEY = 't2_vocab_total';
const VOCAB_SAVED_KEY = 't2_vocab_saved';
let _vocabTotalMap = _safeParse(localStorage.getItem(VOCAB_TOTAL_KEY), {});
let _vocabSavedMap  = _safeParse(localStorage.getItem(VOCAB_SAVED_KEY), {});

function _savedTermsForTopic(topicId) {
  return new Set(_vocabSavedMap[topicId] || []);
}

function _markVocabTermsSaved(topicId, terms) {
  const set = _savedTermsForTopic(topicId);
  terms.forEach(t => set.add(t));
  _vocabSavedMap[topicId] = Array.from(set);
  localStorage.setItem(VOCAB_SAVED_KEY, JSON.stringify(_vocabSavedMap));
}

// ── Step ① on the server — POST /api/task2/vocab-progress/sync. The maps
// above (and _vquizBest) are only a cache: on load a logged-in student's
// progress is replaced with the server copy, so step ① done on a phone also
// counts on a laptop (and a shared classroom computer never shows one
// student's progress to the next). Every save / finished quiz is sent right
// away; a send that fails is queued per user and retried on the next one.
const VOCAB_SYNCED_KEY  = 't2_vocab_synced';   // set once this browser's pre-sync progress was uploaded
const VOCAB_PENDING_KEY = 't2_vocab_pending';  // { [userId]: items[] } not yet on the server

function _vpUserKey() {
  const u = window.AuthService.getUser && window.AuthService.getUser();
  return String((u && (u._id || u.id)) || 'me');
}
function _vpPending() { return _safeParse(localStorage.getItem(VOCAB_PENDING_KEY), {}); }
function _vpSavePending(p) { try { localStorage.setItem(VOCAB_PENDING_KEY, JSON.stringify(p)); } catch {} }

// rows from the server. replace: drop the cache first (page load); otherwise
// only add terms / raise scores, so a slow reply can't undo a newer local save.
function _applyVocabProgress(rows, replace) {
  if (replace) { _vocabSavedMap = {}; _vquizBest = {}; }
  (rows || []).forEach(r => {
    if (!r || !r.topicId) return;
    if (r.savedTerms && r.savedTerms.length) {
      const set = new Set(_vocabSavedMap[r.topicId] || []);
      r.savedTerms.forEach(t => set.add(t));
      _vocabSavedMap[r.topicId] = Array.from(set);
    }
    if (r.quizBest != null && (_vquizBest[r.topicId] == null || r.quizBest > _vquizBest[r.topicId])) {
      _vquizBest[r.topicId] = r.quizBest;
    }
    if (r.vocabTotal != null && _vocabTotalMap[r.topicId] === undefined) _vocabTotalMap[r.topicId] = r.vocabTotal;
  });
  try {
    localStorage.setItem(VOCAB_SAVED_KEY, JSON.stringify(_vocabSavedMap));
    localStorage.setItem(VOCAB_TOTAL_KEY, JSON.stringify(_vocabTotalMap));
    localStorage.setItem(VQUIZ_BEST_KEY, JSON.stringify(_vquizBest));
  } catch {}
}

// Sends items (plus anything queued for this user). Resolves to the server's
// rows for every topic, or null on failure — never rejects.
async function _sendVocabProgress(items, queueOnFail) {
  const uk = _vpUserKey();
  const pend = _vpPending();
  const queued = Array.isArray(pend[uk]) ? pend[uk] : [];
  const all = queued.concat(items);
  try {
    const d = await apiFetch('/api/task2/vocab-progress/sync', { method: 'POST', body: JSON.stringify({ items: all }) });
    if (queued.length) { const p = _vpPending(); delete p[uk]; _vpSavePending(p); }
    return d.progress || [];
  } catch {
    if (queueOnFail && items.length) { const p = _vpPending(); p[uk] = all.slice(-300); _vpSavePending(p); }
    return null;
  }
}

// Page load. The first time a browser runs this, whatever it had saved before
// progress lived on the server goes up to the account now logged in.
async function loadVocabProgress() {
  if (!(window.AuthService && window.AuthService.isLoggedIn())) return;
  let legacy = [];
  if (!localStorage.getItem(VOCAB_SYNCED_KEY)) {
    const ids = new Set([...Object.keys(_vocabSavedMap), ...Object.keys(_vquizBest)]);
    legacy = [...ids].map(id => ({ topicId: id, savedTerms: _vocabSavedMap[id] || [], quizBest: _vquizBest[id] ?? null }));
  }
  const rows = await _sendVocabProgress(legacy, false);
  if (!rows) return; // offline / server down — keep the local cache
  try { localStorage.setItem(VOCAB_SYNCED_KEY, '1'); } catch {}
  _applyVocabProgress(rows, true);
}

function pushVocabProgress(item) {
  if (!(window.AuthService && window.AuthService.isLoggedIn())) return;
  _sendVocabProgress([item], true).then(rows => { if (rows) _applyVocabProgress(rows, false); });
}

function isVocabLearned(topicId) {
  if (!topicId) return false;
  const total = _vocabTotalMap[topicId];
  if (total === undefined) return false; // never opened the Từ vựng tab yet
  if (total <= 0) return true; // topic genuinely has no vocab list — nothing to gate on
  return _savedTermsForTopic(topicId).size >= total;
}

// Step ① is done only when every term is saved AND the vocab quiz has been
// passed (best ≥ VQUIZ_PASS%). This — not isVocabLearned — gates the later
// steps. A list too short to build a quiz from counts as passed.
function isVocabQuizPassed(topicId) {
  if (!topicId) return false;
  if (_vquizBest[topicId] != null && _vquizBest[topicId] >= VQUIZ_PASS) return true;
  if (_vocabTotalMap[topicId] <= 0) return true;
  return state.vocabFor === topicId && !_vquizPossible(state.vocab);
}
function isVocabStepDone(topicId) {
  return isVocabLearned(topicId) && isVocabQuizPassed(topicId);
}

// The step locks are for students only — teachers/admins open every step
// straight away (to preview or demo the lesson). Progress shown as "done"
// still uses isVocabStepDone, so it stays truthful for staff too.
function _isStaffUser() {
  return !!(window.AuthService && window.AuthService.isStaff && window.AuthService.isStaff());
}
function isStepUnlocked(topicId) {
  return _isStaffUser() || isVocabStepDone(topicId);
}

// ── Translate gate — the writing steps (⑤ Viết trên lớp, ⑥ Bài về nhà, the
// split-screen writer) open only once at least T2_TRANSLATE_PASS % of the
// lesson's "Dịch câu" sentences are translated correctly (best result per
// sentence, as the server keeps it). Client-side, like the vocab gate.
const T2_TRANSLATE_PASS = 70;

// → { total, translated, correct, pct, passed, need } or null while the
// lesson isn't loaded. need = correct sentences still missing to pass.
function translateProgress(topicId) {
  const L = _lessonFor(topicId);
  if (!L || L.status !== 'ready') return null;
  const total = L.sentences.length;
  const translated = L.sentences.filter(x => x.en).length;
  const correct = L.sentences.filter(x => x.en && x.isCorrect).length;
  const pct = total ? Math.round(correct / total * 100) : 100;
  const need = Math.max(0, Math.ceil(total * T2_TRANSLATE_PASS / 100) - correct);
  return { total, translated, correct, pct, passed: need === 0, need };
}

function isWritingUnlocked(topicId) {
  if (_isStaffUser()) return true;
  if (!isStepUnlocked(topicId)) return false;
  // Logged out: nothing to write anyway — the step shows its login note.
  if (!(window.AuthService && window.AuthService.isLoggedIn())) return true;
  const tp = translateProgress(topicId);
  return !!(tp && tp.passed);
}

function translateGateMessage(topicId) {
  const tp = translateProgress(topicId);
  if (!tp) return 'Đang tải kết quả dịch câu…';
  return `Cần đúng ≥ ${T2_TRANSLATE_PASS}% ở bước 3 · đang ${tp.correct}/${tp.total} câu, thiếu ${tp.need} câu.`;
}

function topicStatusRowHtml(topicId) {
  const s = _topicScores[topicId];
  let html = '';
  if (s && s.completed) html += '<span class="wp-status-badge wp-status-done"><i class="fas fa-check-circle"></i> Đã hoàn thành</span>';
  if (s) html += '<span class="wp-status-badge wp-status-best"><i class="fas fa-star"></i> Điểm cao nhất: ' + s.bestScore + '%</span>';
  html += '<span class="wp-status-badge"><i class="fas fa-chart-line"></i> Đã hoàn thành ' + topicCompletedCount() + ' chủ đề</span>';
  return html;
}

function updateSessionStats() {
  const el = document.getElementById('mob-stat-done');
  const xpEl = document.getElementById('mob-stat-xp');
  const okEl = document.getElementById('mob-stat-correct');
  const pct = state.sessionDone > 0
    ? Math.round((state.sessionCorrect / state.sessionDone) * 100) + '%' : '–';
  const xp = (_safeParse(localStorage.getItem('t2_progress'), { xp: 0 }).xp) || 0;
  if (el) el.textContent = state.sessionDone;
  if (okEl) okEl.textContent = pct;
  if (xpEl) xpEl.textContent = xp;

  const wd = document.getElementById('widget-done');
  if (wd) {
    wd.textContent = state.sessionDone;
    document.getElementById('widget-xp').textContent      = xp;
    document.getElementById('widget-correct').textContent = pct;
  }
}

// ════════════════════════════════════════════════════════
//  RENDER DISPATCHER
// ════════════════════════════════════════════════════════
function render() {
  const app = document.getElementById('app');
  switch (state.view) {
    case 'weeks':    app.innerHTML = renderWeeks();    bindWeeks();    break;
    case 'topics':   app.innerHTML = renderTopics();   bindTopics();   break;
    case 'select':   app.innerHTML = renderSelect();   bindSelect();   break;
    case 'practice': app.innerHTML = renderPractice(); bindPractice(); break;
    case 'exam':     app.innerHTML = renderExam();     bindExam();     break;
    case 'examDone': app.innerHTML = renderExamDone(); break;
    case 'done':     app.innerHTML = renderDone();     break;
    case 'compose':  app.innerHTML = renderCompose();  bindCompose();  break;
  }
  // The split-screen writer needs the room; every other view stays narrow.
  app.style.maxWidth = state.view === 'compose' ? '1320px' : state.view === 'weeks' ? '1160px' : '900px';
  // The weeks hero carries XP/streak itself — no floating badge over it.
  document.body.classList.toggle('t2-on-weeks', state.view === 'weeks');
  // Session stats (BÀI LÀM/XP/ĐÚNG) only mean something once a practice
  // session is actually running — outside 'practice'/'done' they'd just be
  // stale zeros floating over the weeks/topics picker, which is the bug this
  // guards against. Desktop widget is fixed top-right (like task1/writing).
  const inSession = state.view === 'practice' || state.view === 'done';
  const widget = document.getElementById('t2-stats-widget');
  if (widget) widget.style.display = inSession ? '' : 'none';
  // Same for the mobile bar — '' hands visibility back to the media query.
  const mobBar = document.getElementById('wp-mobile-stats');
  if (mobBar) mobBar.style.display = inSession ? '' : 'none';
  // writing-practice.css forces the mobile bar on with !important, which the
  // inline style above can't beat — a body class can.
  document.body.classList.toggle('t2-no-session-stats', !inSession);
  // The writer's top bar sits where the floating XP badge is.
  document.body.classList.toggle('t2-composing', state.view === 'compose');
  // "Mời bạn viết cùng" live poll runs only while the writer is on screen.
  if (state.view === 'compose') _cwStart(); else _cwStop();
  // "Quay lại phòng viết" hides while that room's writer is on screen.
  if (window.CowriteInvites && window.CowriteInvites.refresh) window.CowriteInvites.refresh();
}

// ════════════════════════════════════════════════════════
//  API HELPERS
// ════════════════════════════════════════════════════════
// apiFetch keeps its own request-building and delegates response-handling
// (including the 401 check this file previously lacked entirely) to
// js/shared/api-client.js — single source of truth (Phase 3 audit).
async function apiFetch(path, opts = {}) {
  const token = window.AuthService.getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) };
  // opts.timeoutMs: abort the request after N ms so a cold-started backend
  // can't leave a "Đang chấm bài..." spinner running forever.
  let signal = opts.signal, killer;
  if (opts.timeoutMs && !signal) {
    const ctrl = new AbortController();
    killer = setTimeout(() => ctrl.abort(), opts.timeoutMs);
    signal = ctrl.signal;
  }
  try {
    const res = await fetch(API + path, { ...opts, signal, headers: { ...headers, ...opts.headers } });
    return await window.ApiClient.handleResponse(res);
  } finally {
    if (killer) clearTimeout(killer);
  }
}

// ════════════════════════════════════════════════════════
//  WEEKS SCREEN
// ════════════════════════════════════════════════════════
async function loadWeeks() {
  const app = document.getElementById('app');
  app.innerHTML = '<div style="text-align:center;padding:40px"><div class="wp-spinner"></div><p>Đang tải...</p></div>';
  try {
    const params = new URLSearchParams(location.search);
    let   urlWeek    = parseInt(params.get('week')) || null;
    // Clean path /task2-practice/:topicId (a _redirects 200 rewrite to this
    // same file) — same additive pattern as reading-v2.js/listening.html's
    // RouteParams.match(): checked first, falls back to ?topicId= unchanged.
    // No fromCleanPath guard needed here (unlike the other pages this audit
    // touched) since the replaceState below reuses location.href as-is
    // rather than rebuilding a ?query= string, so it never clobbers a clean
    // path. Week doesn't need to come along either — the existing
    // urlTopicId-without-urlWeek fallback a few lines down already resolves
    // it via findWeekForTopic().
    const cleanTopic = window.RouteParams ? window.RouteParams.match([
      { pattern: /^\/task2-practice\/([^/?#]+)$/, param: 'topicId' }
    ]) : null;
    const urlTopicId = (cleanTopic && cleanTopic.topicId) || params.get('topicId');
    // Old share links / homework links carry ?mode=vocab|exam from when the
    // topic screen had a mode picker — now they just scroll to that step.
    const urlMode    = params.get('mode');
    if (urlMode === 'vocab' || urlMode === 'exam') _hubFocus = urlMode;

    const hasToken = window.AuthService.isLoggedIn();
    const [data, allDraftsData, sessData, progData] = await Promise.all([
      apiFetch('/api/task2/weeks'),
      hasToken ? apiFetch('/api/task2/drafts').catch(() => ({ drafts: [] })) : Promise.resolve({ drafts: [] }),
      apiFetch('/api/task2/sessions').catch(() => ({ sessions: [] })),
      hasToken ? apiFetch('/api/task2/lessons/progress').catch(() => ({ progress: [] })) : Promise.resolve({ progress: [] }),
      loadVocabProgress()
    ]);
    state.weeks = data.weeks || [];
    state.allDrafts = allDraftsData.drafts || [];
    state.sessions = sessData.sessions || [];
    state.lessonProgress = {};
    (progData.progress || []).forEach(p => { state.lessonProgress[p.topicId] = p; });
    const wantWrite = !!params.get('write');

    // Scans every week's topic list to find which one currently owns
    // `topicId`. Used both when a deep link has no ?week= at all (older
    // homework assignments, before the week was snapshotted into
    // resourceCode) and when the ?week= it does have is stale — a homework
    // link snapshots the topic's week at assign time (resourceCompletionService
    // task2 catalog's deepLinkKey), and an admin can later move that topic
    // into a different week, leaving the link pointing nowhere.
    async function findWeekForTopic(topicId) {
      try {
        const perWeek = await Promise.all(
          state.weeks.map(w => apiFetch(`/api/task2/topics/week/${w.week}`).then(td => ({ week: w.week, topics: td.topics || [] })).catch(() => null))
        );
        return perWeek.find(x => x && x.topics.some(t => t._id === topicId)) || null;
      } catch { return null; }
    }

    if (urlTopicId && !urlWeek) {
      const hit = await findWeekForTopic(urlTopicId);
      if (hit) urlWeek = hit.week;
    }

    if (urlWeek && urlTopicId) {
      state.selectedWeek = urlWeek;
      const td = await apiFetch(`/api/task2/topics/week/${urlWeek}`);
      state.topics = td.topics || [];
      let topic = state.topics.find(t => t._id === urlTopicId);
      if (!topic) {
        const hit = await findWeekForTopic(urlTopicId);
        if (hit) { urlWeek = hit.week; state.selectedWeek = urlWeek; state.topics = hit.topics; topic = hit.topics.find(t => t._id === urlTopicId); }
      }
      if (topic) {
        state.selectedTopic = topic;
        state.topicStats = null;
        _resetHubState(topic._id);
        if (hasToken) {
          try {
            const [wrongData, draftData, , vocab] = await Promise.all([
              apiFetch(`/api/task2/wrong-questions/${urlTopicId}`),
              apiFetch(`/api/task2/draft/${urlTopicId}`),
              loadTopicStats(urlTopicId),
              _fetchVocab(urlTopicId)
            ]);
            state.wrongQuestionIds = wrongData.wrongIds || [];
            state.draft = draftData.draft || null;
            _applyVocab(urlTopicId, vocab);
          } catch {}
        }
        state.view = 'select';
        history.replaceState({ view: 'select', week: urlWeek, topicId: urlTopicId }, '', location.href);
        render();
        // ?write=1 — reopen the split-screen writer (reload / shared link).
        if (wantWrite && hasToken) await openCompose(null, { replace: true });
        return;
      }
    } else if (urlWeek) {
      state.selectedWeek = urlWeek;
      const td = await apiFetch(`/api/task2/topics/week/${urlWeek}`);
      state.topics = td.topics || [];
      state.view = 'topics';
      history.replaceState({ view: 'topics', week: urlWeek }, '', location.href);
      render();
      return;
    }

    state.view = 'weeks';
    history.replaceState({ view: 'weeks' }, '', location.href);
    render();
  } catch { app.innerHTML = '<p style="text-align:center;color:red;padding:40px">Lỗi tải dữ liệu</p>'; }
}

// Drafts that still have unanswered questions — drives the "Đang làm dở"
// box on the weeks screen and the per-topic "Đang dở" pill.
function _pendingDrafts() {
  return (state.allDrafts || [])
    .map(d => ({ ...d, _rem: (d.questionIds?.length || 0) - (d.currentIdx || 0) }))
    .filter(d => d._rem > 0);
}

// ── Weeks screen (Lulu playful look, same as task2-template.html) ────────
// Group colours = the essay-type colours on the Template page.
const ESSAY_COLORS = { advantages_disadvantages:'#4d63d8', discuss_both_views:'#7d62c9', cause_solution:'#2a9d8f', effect_solution:'#cf5f57', cause_effect:'#e07a3a', agree_disagree:'#2f9e5b', positive_or_negative_development:'#d4689a' };
const T2W_STEPS = [
  { phase: 'Chuẩn bị', time: '~60′', cls: 'prep',  steps: [['1', 'fa-book-open', 'Từ vựng'], ['2', 'fa-lightbulb', 'Brainstorm'], ['3', 'fa-language', 'Dịch câu'], ['4', 'fa-compass', 'Hướng dẫn viết']] },
  { phase: 'Trên lớp', time: '~30′', cls: 'class', steps: [['5', 'fa-pen', 'Mở bài + Thân bài 1']] },
  { phase: 'Về nhà',   time: '',     cls: 'home',  steps: [['6', 'fa-house', 'Thân bài 2 + Kết bài']] }
];

function _sessState(s, draftTopicIds) {
  const p = state.lessonProgress[s._id];
  if (p && p.submitted) return 'done';
  if ((p && p.written) || draftTopicIds.has(String(s._id))) return 'doing';
  return 'todo';
}
// Where Lulu points: a half-written lesson first, else the first one not submitted.
function _nextSession(list, draftTopicIds) {
  return list.find(s => _sessState(s, draftTopicIds) === 'doing')
      || list.find(s => _sessState(s, draftTopicIds) === 'todo') || null;
}

// One row per lesson: "Buổi N" bubble + topic + where the student is.
function _sessionRowHtml(s, draftTopicIds, isNext) {
  const p = state.lessonProgress[s._id];
  const st = _sessState(s, draftTopicIds);
  let chip = '';
  if (st === 'done') chip = '<span class="t2w-chip is-ok"><i class="fas fa-check"></i> Đã nộp</span>';
  else if (p && p.written) chip = `<span class="t2w-chip is-mid">✍️ Đã viết ${p.written}/4 phần</span>`;
  else if (st === 'doing') chip = '<span class="t2w-chip is-mid"><i class="fas fa-bookmark"></i> Đang làm dở</span>';
  if (isNext) chip += '<span class="t2w-chip is-next">👉 Học tiếp</span>';
  return `<button type="button" class="t2-sess t2w-sess is-${st}${isNext ? ' is-next' : ''}" data-week="${Number(s.week)}" data-topic="${_escHtml(String(s._id))}" title="${_escHtml(s.topicName)}">
    <span class="t2w-sess-num"><small>Buổi</small>${s.n}</span>
    <span class="t2w-sess-body">
      <span class="t2w-sess-name">${_escHtml(s.topicEmoji || '📝')} ${_escHtml(s.topicName)}</span>
      ${chip ? `<span class="t2w-sess-chips">${chip}</span>` : ''}
    </span>
    <span class="t2w-sess-go" aria-hidden="true">${st === 'done' ? '<i class="fas fa-check"></i>' : '<i class="fas fa-chevron-right"></i>'}</span>
  </button>`;
}

// Lulu's bubble on top of the list + one button straight into the next lesson.
function _weeksCoachHtml(next, nDone, total) {
  const loggedIn = !!(window.AuthService && window.AuthService.isLoggedIn());
  let text, mood = 'happy';
  if (!next) { text = `Cậu đã nộp đủ ${total} buổi rồi! Lulu tự hào về cậu quá 🥳`; mood = 'cheer'; }
  else {
    const p = state.lessonProgress[next._id];
    if (p && p.written) text = `Cậu đang viết dở Buổi ${next.n} (${p.written}/4 phần) — viết nốt nha, sắp xong rồi! ✍️`;
    else if (nDone) { text = `Giỏi lắm, đã xong ${nDone} buổi! Tiếp theo là Buổi ${next.n}: “${next.topicName}” 💪`; mood = 'excited'; }
    else text = loggedIn
      ? `Chào cậu! Tớ là Lulu 🍊 Bắt đầu với Buổi ${next.n}: “${next.topicName}” nha — đi từng bước một thôi!`
      : 'Chào cậu! Tớ là Lulu 🍊 Đăng nhập để Lulu lưu tiến độ từng buổi cho cậu nha!';
  }
  const bubble = (window.Mascot && window.Mascot.reactHtml)
    ? window.Mascot.reactHtml({ text, mood, solo: true, compact: true })
    : `<div class="t2w-coach-txt">🍊 ${_escHtml(text)}</div>`;
  const p = next && state.lessonProgress[next._id];
  const go = next ? `<button type="button" class="t2w-go t2-sess-go" data-week="${Number(next.week)}" data-topic="${_escHtml(String(next._id))}">
      <i class="fas fa-play"></i> ${p && p.written ? 'Viết tiếp' : nDone ? 'Học' : 'Bắt đầu'} Buổi ${next.n}</button>` : '';
  return `<div class="t2w-coach">${bubble}${go}</div>`;
}

function renderWeeks() {
  const weekData = {};
  state.weeks.forEach(w => { weekData[w.week] = w; });
  const drafts = _pendingDrafts().filter(d => d.week);
  const draftWeeks = new Set(drafts.map(d => Number(d.week)));
  const draftTopicIds = new Set(drafts.map(d => String(d.topicId)));
  // Lessons grouped by week, numbered across the whole course. Falls back to
  // the old per-week buttons if /sessions failed.
  const all = state.sessions.map((s, i) => ({ ...s, n: i + 1 }));
  const byWeek = {};
  all.forEach(s => { (byWeek[s.week] = byWeek[s.week] || []).push(s); });
  const useSessions = all.length > 0;
  const nDone = all.filter(s => _sessState(s, draftTopicIds) === 'done').length;
  const nDoing = all.filter(s => _sessState(s, draftTopicIds) === 'doing').length;
  const next = _nextSession(all, draftTopicIds);
  const xp = _safeParse(localStorage.getItem('t2_progress'), { xp: 0, streak: 0 });
  const showPromo = !!(window.AuthService && !window.AuthService.hasPremiumAccess());
  return `
  <div class="t2w">
    <section class="t2w-hero">
      <div class="t2w-hero-text">
        <h1 class="t2w-hero-title">Luyện đề <span class="t2w-hero-tag">Task 2 theo buổi</span></h1>
        <p class="t2w-hero-sub">Mỗi đề là một buổi học trọn vẹn: chuẩn bị từ vựng &amp; ý tưởng → viết nửa bài trên lớp → hoàn thành ở nhà.</p>
        <div class="t2w-hero-badges">
          ${useSessions ? `<span class="t2w-hero-badge"><i class="fas fa-flag-checkered"></i> ${nDone}/${all.length} buổi đã nộp</span>` : ''}
          ${nDoing ? `<span class="t2w-hero-badge">✍️ ${nDoing} buổi đang làm</span>` : ''}
          <span class="t2w-hero-badge"><i class="fas fa-star"></i> ${Number(xp.xp) || 0} XP</span>
          <span class="t2w-hero-badge">🔥 ${Number(xp.streak) || 0}</span>
        </div>
      </div>
      <div class="t2w-hero-side">
        <button type="button" class="t2w-glass-btn" id="t2w-hist-btn" onclick="openT2History()" title="Xem lịch sử luyện tập">
          <i class="fas fa-history"></i> Lịch sử
        </button>
      </div>
      <div class="lh-mascot" aria-hidden="true">${window.Mascot ? window.Mascot.duo('happy') : ''}</div>
    </section>

    <div class="t2w-flow" aria-label="Các bước trong mỗi buổi">
      <span class="t2w-flow-lbl">Mỗi buổi gồm 6 bước</span>
      ${T2W_STEPS.map(g => `
        <div class="t2w-phase is-${g.cls}">
          <span class="t2w-phase-name">${g.phase}${g.time ? ` <em>${g.time}</em>` : ''}</span>
          <span class="t2w-phase-steps">${g.steps.map(([n, ic, label]) => `<span class="t2w-step"><b>${n}</b><i class="fas ${ic}"></i> ${label}</span>`).join('')}</span>
        </div>`).join('')}
    </div>

    ${useSessions ? _weeksCoachHtml(next, nDone, all.length) : ''}

    ${showPromo ? `<div class="t2w-promo" id="premium-promo-banner">
      <span class="t2w-promo-ic">⭐</span>
      <div class="t2w-promo-txt">
        <b>Nâng cấp Premium để luyện tập không giới hạn</b>
        <span>Toàn bộ ${all.length || ''} buổi học Task 2 Writing theo chủ đề</span>
      </div>
      <button type="button" class="t2w-go" onclick="openUpgradeModal()">Upgrade Premium</button>
    </div>` : ''}

    ${drafts.length ? `
    <div class="t2w-continue">
      <div class="t2w-continue-title"><i class="fas fa-bookmark"></i> Bài dịch câu đang làm dở</div>
      ${drafts.slice(0, 3).map(d => `
        <div class="t2w-continue-row">
          <span class="t2w-continue-name">${_escHtml(d.topicName || 'Chủ đề')} <span class="t2w-continue-meta">· ${sessionLabel(String(d.topicId)) || `Tuần ${Number(d.week)}`} · còn ${d._rem} câu</span></span>
          <button type="button" class="t2w-go is-sm t2-continue-go" data-week="${Number(d.week)}" data-topic="${_escHtml(String(d.topicId))}"><i class="fas fa-play"></i> Tiếp tục</button>
        </div>`).join('')}
    </div>` : ''}

    <div class="t2w-grid" id="t2w-grid">
      ${WEEK_GROUPS.map((g, gi) => {
        const list = g.weeks.flatMap(w => byWeek[w] || []);
        const done = list.filter(s => _sessState(s, draftTopicIds) === 'done').length;
        const color = ESSAY_COLORS[g.essayType] || '#8a7f6e';
        return `
        <div class="t2w-group${g.essayType ? '' : ' is-review'}" style="--g-c:${color};--i:${gi}">
          <div class="t2w-group-head">
            <span class="t2w-group-emoji">${g.emoji}</span>
            <div class="t2w-group-title">
              <div class="t2w-group-theme">${_escHtml(g.theme)}</div>
              <span class="t2w-group-type">${g.essayType ? ESSAY_LABELS[g.essayType] : 'Tổng hợp các dạng'}</span>
            </div>
            ${useSessions && list.length ? `<span class="t2w-group-count${done === list.length ? ' is-full' : ''}" title="Đã nộp ${done}/${list.length} buổi">${done}/${list.length}</span>` : ''}
          </div>
          ${useSessions && list.length ? `<div class="t2w-group-bar"><i style="width:${Math.round(done / list.length * 100)}%"></i></div>` : ''}
          ${useSessions ? `
          <div class="t2w-group-sessions">
            ${list.map(s => _sessionRowHtml(s, draftTopicIds, !!next && next._id === s._id)).join('')
              || '<span class="t2w-soon">🌱 Sắp ra</span>'}
          </div>` : `
          <div class="t2w-group-weeks">
            ${g.weeks.map(w => {
              const d = weekData[w];
              const hasDraft = draftWeeks.has(w);
              return `<button type="button" class="t2-wk t2w-wk${d ? '' : ' locked'}${hasDraft ? ' has-draft' : ''}" data-week="${w}" ${d ? '' : 'disabled'}>
                <span class="t2w-wk-num">Tuần ${w}</span>
                <span class="t2w-wk-sub">${d ? d.topicCount + ' chủ đề' : 'Sắp ra'}</span>
                ${hasDraft ? '<span class="t2w-chip is-mid"><i class="fas fa-bookmark"></i> Đang dở</span>' : ''}
              </button>`;
            }).join('')}
          </div>`}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}
function bindWeeks() {
  document.querySelectorAll('.t2-wk:not(.locked)').forEach(el => {
    el.addEventListener('click', () => selectWeek(parseInt(el.dataset.week)));
  });
  document.querySelectorAll('.t2-sess, .t2-sess-go').forEach(el => {
    el.addEventListener('click', () => _withBusy(el, () => openTopicDirect(parseInt(el.dataset.week), el.dataset.topic, false)));
  });
  document.querySelectorAll('.t2-continue-go').forEach(el => {
    el.addEventListener('click', () => _withBusy(el, () => openTopicDirect(parseInt(el.dataset.week), el.dataset.topic, true)));
  });
}
async function selectWeek(w) {
  state.selectedWeek = w;
  try {
    const data = await apiFetch(`/api/task2/topics/week/${w}`);
    state.topics = data.topics || [];
    state.view = 'topics';
    history.pushState({ view: 'topics', week: w }, '', `/task2-practice.html?week=${w}`);
    render();
  } catch { showToast('Lỗi tải topics', 'error'); }
}

// Jump straight from the weeks screen into one topic (the "Đang làm dở" box).
// With autoResume the saved draft is reopened right away — one click instead
// of week → topic → "Tiếp tục".
async function openTopicDirect(week, topicId, autoResume) {
  try {
    if (state.selectedWeek !== week || !state.topics.some(t => t._id === topicId)) {
      const data = await apiFetch(`/api/task2/topics/week/${week}`);
      state.topics = data.topics || [];
    }
    state.selectedWeek = week;
    if (!state.topics.some(t => t._id === topicId)) { showToast('Không tìm thấy chủ đề này nữa', 'warn'); return; }
    await selectTopic(topicId);
    if (autoResume && state.view === 'select' && state.selectedTopic?._id === topicId && state.draft) await resumeSession();
  } catch { showToast('Lỗi tải chủ đề', 'error'); }
}

// ════════════════════════════════════════════════════════
//  TOPICS SCREEN
// ════════════════════════════════════════════════════════
// Where the student is on each topic's 3-step path, from what this browser
// already knows (no extra requests): vocab saved / best practice score /
// essay unlocked.
function _topicChips(t) {
  const id = t._id;
  const chips = [];
  if (isVocabStepDone(id)) {
    chips.push('<span class="t2-step-chip ok"><i class="fas fa-check"></i> Từ vựng</span>');
  } else if (isVocabLearned(id)) {
    const qb = _vquizBest[id];
    chips.push(`<span class="t2-step-chip mid">⚡ Quiz từ vựng${qb != null ? ` ${qb}%` : ''}</span>`);
  } else {
    const total = _vocabTotalMap[id];
    const saved = Math.min(_savedTermsForTopic(id).size, total || 0);
    chips.push(`<span class="t2-step-chip">📖 Từ vựng${total ? ` ${saved}/${total}` : ''}</span>`);
  }
  const best = _bestPracticeScore(id);
  if (best == null) chips.push('<span class="t2-step-chip">✏️ Chưa luyện</span>');
  else chips.push(`<span class="t2-step-chip ${best >= T2_WRITE_MIN_ACCURACY ? 'ok' : 'mid'}">✏️ Luyện câu ${best}%</span>`);
  if (t.writingTask2Id) {
    chips.push(best != null && best >= T2_WRITE_MIN_ACCURACY
      ? '<span class="t2-step-chip ok"><i class="fas fa-pen-nib"></i> Viết bài</span>'
      : '<span class="t2-step-chip"><i class="fas fa-lock"></i> Viết bài</span>');
  }
  return chips.join('');
}

function renderTopics() {
  const draftTopicIds = new Set(_pendingDrafts().map(d => d.topicId?.toString()));
  const label = weekLabel(state.selectedWeek);
  return `
    <div class="t2-nav">
      <div class="t2-nav-crumb"><span onclick="goWeeks()">Tuần</span> › <b>Tuần ${state.selectedWeek}</b></div>
    </div>
    <div style="padding:0 20px 4px">
      <h2 class="t2-page-h2" style="font-size:20px">Tuần ${state.selectedWeek}${label ? ` <span class="t2-page-sub" style="font-size:15px;font-weight:600">· ${_escHtml(label)}</span>` : ''}</h2>
      <p class="t2-page-sub" style="font-size:13px">Chọn một chủ đề để bắt đầu</p>
    </div>
    <div class="t2-topic-list">
      ${state.topics.length ? state.topics.map(t => {
        const hasDraft = draftTopicIds.has(t._id?.toString());
        return `
        <div class="t2-topic-card${hasDraft ? ' has-draft' : ''}" data-id="${t._id}">
          <div class="t2-topic-emoji">${_escHtml(t.topicEmoji || '📝')}</div>
          <div style="flex:1;min-width:0">
            <div class="t2-topic-name">${sessionNumber(t._id) ? `<span class="t2-sess-num" style="margin-right:6px">${sessionLabel(t._id)}</span>` : ''}${_escHtml(t.topicName)}</div>
            <div style="margin-bottom:4px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              <span class="${ESSAY_BADGE_CLASS[t.essayType] || 'et-badge'}">${ESSAY_LABELS[t.essayType] || _escHtml(t.essayType)}</span>
              ${hasDraft ? `<span class="t2-week-draft-pill"><i class="fas fa-bookmark" style="font-size:9px"></i> Đang dở</span>` : ''}
            </div>
            <div class="t2-topic-prompt">${_escHtml(t.prompt)}</div>
            <div class="t2-topic-steps">${_topicChips(t)}</div>
          </div>
          <i class="fas fa-chevron-right t2-topic-chev" style="color:#9ca3af;font-size:18px;flex-shrink:0"></i>
        </div>`;
      }).join('') : '<p class="t2-page-sub" style="text-align:center;padding:24px">Tuần này chưa có chủ đề.</p>'}
    </div>`;
}
function bindTopics() {
  document.querySelectorAll('.t2-topic-card').forEach(el => {
    el.addEventListener('click', () => {
      // Topic data takes 4 requests — show it's working instead of a dead click.
      const ic = el.querySelector('.t2-topic-chev');
      if (ic) ic.className = 'fas fa-spinner fa-spin t2-topic-chev';
      selectTopic(el.dataset.id);
    });
  });
}
// Loads this user's practice record for `id` into state.topicStats, tagged
// with `forTopic` so a later render for a different topic can't read it by
// mistake. Best-effort — on any failure leaves a "not practised" shape so
// the gate simply falls back to the local _topicScores value.
async function loadTopicStats(id) {
  if (!(window.AuthService && window.AuthService.isLoggedIn())) {
    state.topicStats = { forTopic: id, practiced: false, bestScore: 0 };
    return;
  }
  try {
    const d = await apiFetch(`/api/task2/topic-stats/${id}`);
    state.topicStats = { forTopic: id, ...(d.stats || { practiced: false, bestScore: 0 }) };
  } catch {
    state.topicStats = { forTopic: id, practiced: false, bestScore: 0 };
  }
}

// ── Topic vocab (loaded inline on the hub) ──────────────────────────────
// Never rejects: null = fetch failed, so callers can Promise.all it.
async function _fetchVocab(id) {
  try {
    const d = await apiFetch(`/api/task2/vocabulary/${id}`);
    return d.vocabularyList || [];
  } catch { return null; }
}
function _applyVocab(id, list) {
  if (list == null) { state.vocabError = true; return; }
  state.vocabError = false;
  state.vocabFor = id;
  state.vocab = list;
  window.WordAudio?.prefetch(list.map(v => v && v.term));
  // Cache the total so the Luyện câu gate (isVocabLearned) and the topic
  // list chips work without refetching. Unique term COUNT, not list.length —
  // isVocabLearned compares this against _savedTermsForTopic(...).size, a Set
  // keyed by term that can never exceed the number of distinct terms; a
  // duplicated term in the list would otherwise keep the gate shut forever.
  _vocabTotalMap[id] = new Set(list.map(v => v.term)).size;
  localStorage.setItem(VOCAB_TOTAL_KEY, JSON.stringify(_vocabTotalMap));
}
let _vocabLoadingFor = null;
async function _ensureVocab(id) {
  if (!id || state.vocabFor === id || _vocabLoadingFor === id) return;
  _vocabLoadingFor = id;
  const list = await _fetchVocab(id);
  _vocabLoadingFor = null;
  if (state.selectedTopic?._id !== id) return;
  _applyVocab(id, list);
  if (state.view === 'select') render();
}
function retryVocab() {
  state.vocabError = false;
  _refreshVocabStep();
  _ensureVocab(state.selectedTopic?._id);
}
// Per-topic hub state that must not leak from one topic into the next.
function _resetHubState(id) {
  state.vocabQuiz = null;
  state.vocabOpen = null;
  if (state.vocabFor !== id) { state.vocab = []; state.vocabFor = null; state.vocabError = false; }
  if (state.brainstorm.topicId !== id) {
    // Unsaved notes / essay edits for the previous lesson go out before its state is dropped.
    if (_lessonDirty.topicId && _lessonDirty.topicId !== id) flushLessonSave();
    state.brainstorm = { topicId: id, notes: [], open: true, hintOpen: false };
    state.compose.revealed = {};
  }
}

let _selectTopicSeq = 0;
async function selectTopic(id) {
  if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
    if (window.openUpgradeModal) window.openUpgradeModal();
    render(); // drop the card's loading spinner
    return;
  }
  const topic = state.topics.find(t => t._id === id);
  if (!topic) return;
  state.selectedTopic = topic;
  state.currentMode = 'practice';
  state.wrongQuestionIds = [];
  state.draft = null;
  state.topicStats = null;
  _resetHubState(id);
  const _p = new URLSearchParams({ week: state.selectedWeek, topicId: id });
  history.pushState({ view: 'select', week: state.selectedWeek, topicId: id }, '', `/task2-practice.html?${_p}`);
  // Guards against rapidly clicking between topics resolving out of order —
  // only the most recently-selected topic's wrong-questions/draft response
  // is allowed to apply, so a slow response for a topic the user already
  // clicked away from can't overwrite the newer topic's state.
  const requestId = ++_selectTopicSeq;
  if (window.AuthService.isLoggedIn()) {
    try {
      const [wrongData, draftData, , vocab] = await Promise.all([
        apiFetch(`/api/task2/wrong-questions/${id}`),
        apiFetch(`/api/task2/draft/${id}`),
        loadTopicStats(id),
        _fetchVocab(id)
      ]);
      if (requestId !== _selectTopicSeq) return;
      state.wrongQuestionIds = wrongData.wrongIds || [];
      state.draft = draftData.draft || null;
      _applyVocab(id, vocab);
    } catch {
      if (requestId !== _selectTopicSeq) return;
    }
  }
  state.view = 'select';
  render();
  window.scrollTo(0, 0);
}

// ════════════════════════════════════════════════════════
//  TOPIC HUB helpers (the lesson layout itself is renderSelect() below).
// ════════════════════════════════════════════════════════
let _hubFocus = null; // 'vocab' | 'exam' — scroll target after the next hub render

function _vocabStats(id) {
  const list = state.vocabFor === id ? state.vocab : [];
  const savedSet = _savedTermsForTopic(id);
  let total, saved = 0;
  if (list.length) {
    const terms = new Set(list.map(v => v.term));
    total = terms.size;
    terms.forEach(tm => { if (savedSet.has(tm)) saved++; });
  } else {
    total = _vocabTotalMap[id] || 0;
    saved = Math.min(savedSet.size, total);
  }
  return { total, saved, pct: total ? Math.round((saved / total) * 100) : 0 };
}

// ════════════════════════════════════════════════════════
//  LESSON HUB — one prompt = one class session ("Buổi"), 3 phases / 6 steps:
//    Giai đoạn 1 · Scaffolding  ① Từ vựng ② Brainstorm nhóm ③ Dịch câu ④ Hướng dẫn viết
//    Giai đoạn 2 · Trên lớp     ⑤ Mở bài + Thân bài 1 (split-screen writer)
//    Giai đoạn 3 · Về nhà       ⑥ Thân bài 2 + Kết bài theo template → chấm AI
// ════════════════════════════════════════════════════════

// Brainstorm sides: topic.brainstormHints (backend/scripts/data/task2Augment.js),
// or one free box for a topic that has none.
function _ideaSides(t) {
  const hints = t.brainstormHints || [];
  return hints.length ? hints : [{ side: 'Ý tưởng của nhóm', points: [] }];
}
function _lessonFor(id) { return state.lesson.topicId === id ? state.lesson : null; }

// Where the student is on the 6 steps — drives the rail + "current" card.
function _lessonSteps(t) {
  const id = t._id;
  const L = _lessonFor(id);
  const sent = L ? L.sentences : [];
  const sec = L ? L.sections : _emptySections();
  const has = k => !!(sec[k] || '').trim();
  const classDone = has('intro') && has('body1');
  return [
    { key: 'vocab',     label: 'Từ vựng',        done: isVocabStepDone(id) },
    { key: 'ideas',     label: 'Brainstorm',     done: state.brainstorm.topicId === id && state.brainstorm.notes.some(n => (n || '').trim()) },
    { key: 'translate', label: 'Dịch câu',       done: sent.length > 0 && sent.every(s => s.en) && !!(translateProgress(id) || {}).passed },
    { key: 'guide',     label: 'Hướng dẫn viết', done: has('intro') || has('body1') },
    { key: 'class',     label: 'Viết trên lớp',  done: classDone },
    { key: 'home',      label: 'Bài về nhà',     done: has('body2') && has('conclusion') }
  ];
}
function _currentStepKey(t) {
  const steps = _lessonSteps(t);
  return (steps.find(s => !s.done) || steps[steps.length - 1]).key;
}
function _renderRail(t) {
  const steps = _lessonSteps(t);
  const cur = _currentStepKey(t);
  return `<nav class="t2-rail" id="t2-rail" aria-label="Các bước của buổi học">
    ${steps.map((s, i) => `<button type="button" class="t2-rail-item t2-s-${s.key}${s.done ? ' is-done' : ''}${s.key === cur ? ' is-current' : ''}" data-key="${s.key}" onclick="scrollToHubStep('${s.key}')"><span class="t2-rail-num">${s.done ? '<i class="fas fa-check" style="font-size:9px"></i>' : i + 1}</span>${s.label}</button>`).join('')}
  </nav>`;
}
// ⓘ — long explanations stay folded behind a small icon; the student opens
// them only when needed. Open/closed is kept in state.infoOpen so a card
// re-render doesn't fold them again.
function _infoBtn(key) {
  const open = state.infoOpen.has(key);
  return `<button type="button" class="t2-info-btn${open ? ' is-open' : ''}" data-info-btn="${key}" onclick="toggleT2Info('${key}')" aria-expanded="${open}" title="Xem hướng dẫn" aria-label="Xem hướng dẫn"><i class="fas fa-circle-info"></i></button>`;
}
function _infoBody(key, html) {
  return `<div class="t2-info-body" data-info="${key}"${state.infoOpen.has(key) ? '' : ' hidden'}>${html}</div>`;
}
function toggleT2Info(key) {
  const open = !state.infoOpen.has(key);
  if (open) state.infoOpen.add(key); else state.infoOpen.delete(key);
  document.querySelectorAll(`[data-info="${key}"]`).forEach(el => { el.hidden = !open; });
  document.querySelectorAll(`[data-info-btn="${key}"]`).forEach(b => {
    b.classList.toggle('is-open', open);
    b.setAttribute('aria-expanded', String(open));
  });
}

// Timings and classroom organisation live in the teacher guideline
// (openTeacherGuide) — the student cards only say what to do.
function _stepHead(num, title, extra, done) {
  return `<div class="t2-step-head">
        <span class="t2-step-num${done ? ' is-done' : ''}">${done ? '<i class="fas fa-check"></i>' : num}</span>
        <div class="t2-step-title">${title}</div>
        ${extra || ''}
      </div>`;
}
// Steps 2–6 until step ① (all terms saved + quiz ≥ VQUIZ_PASS%) is done:
// just the title and what unlocks it.
function _lockedStep(key, num, title, note) {
  return `
    <section class="t2-step t2-s-${key} is-locked" id="t2-step-${key}">
      ${_stepHead(num, title, '<span class="t2-step-tag"><i class="fas fa-lock"></i> Chưa mở</span>', false)}
      ${note ? `<p class="t2-step-desc" style="margin:8px 0 0">🔒 ${_escHtml(note)} <button type="button" class="t2-link" onclick="scrollToHubStep('translate')">Đến bước Dịch câu</button></p>` : ''}
    </section>`;
}
function _wcChip(label, text) {
  const n = _wc(text);
  return `<span class="t2-step-chip${n ? ' ok' : ''}">${label}: ${n} từ</span>`;
}

function renderSelect() {
  const t = state.selectedTopic;
  const id = t._id;
  const n = sessionNumber(id);
  const hasDraft = !!(state.draft && state.draft.sessionDone < (state.draft.questionIds?.length || 0));
  const cur = _currentStepKey(t);
  return `
    <div class="t2-nav t2-nav-row">
      <div class="t2-nav-crumb"><span onclick="goWeeks()">Lộ trình</span> › <b>${n ? `Buổi ${n}` : _escHtml(t.topicName)}</b></div>
      <div style="display:flex;gap:6px">
        <button type="button" class="t2-guide-btn" onclick="openTeacherGuide()" title="Cách tổ chức buổi học này trên lớp"><i class="fas fa-chalkboard-teacher"></i><span class="long">Guideline for teacher</span><span class="short">GV</span></button>
        <button class="t2-icon-btn" onclick="copyT2ShareUrl()" title="Sao chép link" aria-label="Sao chép link"><i class="fas fa-link"></i></button>
        <button class="t2-icon-btn" onclick="openT2History()" title="Lịch sử" aria-label="Lịch sử"><i class="fas fa-history"></i></button>
      </div>
    </div>
    <div class="t2-hub">
      <div class="t2-hub-head">
        <div class="t2-hub-emoji">${_escHtml(t.topicEmoji || '📝')}</div>
        <div style="min-width:0">
          ${n ? `<div class="t2-hub-kicker">Buổi ${n}</div>` : ''}
          <h2 class="t2-hub-title">${_escHtml(t.topicName)}</h2>
          <span class="${ESSAY_BADGE_CLASS[t.essayType] || 'et-badge'}">${ESSAY_LABELS[t.essayType] || _escHtml(t.essayType)}</span>
        </div>
      </div>
      <div class="t2-selector-prompt"><strong>Đề bài:</strong> ${_escHtml(t.prompt)}</div>

      ${hasDraft ? `
      <div class="t2-draft-banner">
        <div class="t2-draft-info">📌 Còn <strong>${(state.draft.questionIds?.length || 0) - state.draft.sessionDone} câu chưa làm</strong> từ phiên trước <span style="color:#6b7280;font-size:12px">· ${new Date(state.draft.savedAt).toLocaleDateString('vi-VN')}</span></div>
        <div style="display:flex;gap:8px;flex-shrink:0">
          <button class="t2-resume-btn" onclick="resumeSession()"><i class="fas fa-play"></i> Tiếp tục</button>
          <button class="t2-dismiss-btn" onclick="dismissDraft()"><i class="fas fa-times"></i> Bỏ qua</button>
        </div>
      </div>` : ''}

      ${_renderCoach(t)}
      ${_renderRail(t)}

      <div class="t2-phase"><span class="t2-phase-k">Giai đoạn 1</span><b>Chuẩn bị</b></div>
      ${renderVocabStep(cur === 'vocab')}
      ${renderIdeaStep(cur === 'ideas')}
      ${renderTranslateStep(cur === 'translate')}
      ${renderGuideStep(cur === 'guide')}

      <div class="t2-phase is-class"><span class="t2-phase-k">Giai đoạn 2</span><b>Viết trên lớp</b></div>
      ${renderClassStep(cur === 'class')}

      <div class="t2-phase is-home"><span class="t2-phase-k">Giai đoạn 3</span><b>Bài tập về nhà</b></div>
      ${renderHomeStep(cur === 'home')}
      ${renderExamStep()}
    </div>`;
}

// ② Idea generation — groups compete, the student keeps the best ideas.
// Notes are saved with the lesson (shown again beside the essay).
function renderIdeaStep(isCurrent) {
  const t = state.selectedTopic;
  if (!isStepUnlocked(t._id)) return _lockedStep('ideas', 2, 'Brainstorm ý tưởng');
  const sides = _ideaSides(t);
  const bs = state.brainstorm;
  const hasHints = sides.some(s => (s.points || []).length);
  const done = bs.notes.some(n => (n || '').trim());
  const loggedIn = window.AuthService && window.AuthService.isLoggedIn();
  return `
    <section class="t2-step t2-s-ideas t2-ideas${isCurrent ? ' is-current' : ''}" id="t2-step-ideas">
      ${_stepHead(2, 'Brainstorm ý tưởng', `${loggedIn ? `<span class="t2-bs-save" aria-live="polite">${_bsSaveHtml(done)}</span>` : ''}${_infoBtn('ideas')}`, done)}
      ${_infoBody('ideas', `<ul class="t2-info-list">
        <li>Cùng nhóm nghĩ thật nhiều ý cho từng phần — <b>mỗi dòng một ý</b>.</li>
        <li>Ý được <b>tự động lưu</b> vào tài khoản: lần sau vào lại buổi này (máy nào cũng được) vẫn thấy, và hiện ở cột trái khi viết bài.</li>
        <li>Sau khi các nhóm trình bày, mở <b>Gợi ý ý chính</b> và bấm <b>＋</b> để thêm ý hay vào phần của bạn.</li>
      </ul>`)}
      ${!loggedIn ? '<div class="t2-lock-note"><i class="fas fa-user-lock"></i> Đăng nhập để lưu ý tưởng cho lần sau.</div>' : ''}
      <div class="t2-bs-grid">
        ${sides.map((h, i) => `
        <div class="t2-bs-side t2-side-c${i % 4}">
          <label class="t2-bs-label" for="t2-idea-${i}">${_escHtml(h.side)}</label>
          <textarea id="t2-idea-${i}" class="t2-brainstorm-input" rows="4" placeholder="Mỗi dòng một ý…" oninput="onIdeaInput(${i}, this.value)">${_escHtml(bs.notes[i] || '')}</textarea>
        </div>`).join('')}
      </div>
      ${hasHints ? `
      <details class="t2-brainstorm-reveal" ${bs.hintOpen ? 'open' : ''} ontoggle="state.brainstorm.hintOpen=this.open">
        <summary>Gợi ý ý chính <span class="t2-muted">(mở sau khi các nhóm trình bày)</span></summary>
        <div class="t2-bs-grid">
        ${sides.map((h, i) => `
          <div class="t2-bs-side t2-side-c${i % 4}">
            <div class="t2-bs-label">${_escHtml(h.side)}</div>
            <ul class="t2-bs-hints">${(h.points || []).map((p, k) => `<li><span>${_escHtml(p)}</span><button type="button" class="t2-bs-add" onclick="addHintIdea(${i}, ${k})" title="Thêm vào ý của tôi" aria-label="Thêm vào ý của tôi"><i class="fas fa-plus"></i></button></li>`).join('')}</ul>
          </div>`).join('')}
        </div>
      </details>` : ''}
    </section>`;
}
function _bsSaveHtml(hasNotes) {
  switch (_lessonSaveState) {
    case 'dirty':  return '<i class="fas fa-pen"></i> Đang soạn…';
    case 'saving': return '<i class="fas fa-spinner fa-spin"></i> Đang lưu…';
    case 'error':  return '<span class="is-error"><i class="fas fa-exclamation-triangle"></i> Chưa lưu được</span>';
    default:       return hasNotes ? '<span class="is-ok"><i class="fas fa-cloud"></i> Đã lưu</span>' : '';
  }
}
function onIdeaInput(i, v) {
  state.brainstorm.notes[i] = v;
  _markLessonDirty('brainstorm');
  _syncAfterIdeaInput();
}
// "＋" on a suggested idea: copy it into the student's own notes for that side.
function addHintIdea(i, k) {
  const t = state.selectedTopic;
  const p = ((_ideaSides(t)[i] || {}).points || [])[k];
  if (!p) return;
  const cur = String(state.brainstorm.notes[i] || '');
  if (cur.split('\n').some(l => l.trim().replace(/^[-•]\s*/, '') === p)) { showToast('Ý này đã có trong phần của bạn rồi', 'info', 2000); return; }
  const next = (cur.trim() ? cur.replace(/\s+$/, '') + '\n' : '') + p;
  const ta = document.getElementById('t2-idea-' + i);
  if (ta) ta.value = next;
  onIdeaInput(i, next);
  showToast('Đã thêm vào ý của bạn', 'success', 1600);
}

// ③ Sentence translation — the translation/paraphrase/short_writing drill.
// Can be finished at home; the English the student produces here is what the
// writer's left column shows.
function renderTranslateStep(isCurrent) {
  const t = state.selectedTopic;
  const id = t._id;
  if (!isStepUnlocked(id)) return _lockedStep('translate', 3, 'Dịch câu Việt → Anh');
  const L = _lessonFor(id);
  const sent = L ? L.sentences : [];
  const done = sent.filter(s => s.en).length;
  const allDone = sent.length > 0 && done >= sent.length;
  const tp = translateProgress(id);
  const passed = !!(tp && tp.passed);
  // Not translated yet + translated wrong — what "Dịch tiếp" serves next.
  const todo = sent.filter(s => !(s.en && s.isCorrect)).length;
  const best = _bestPracticeScore(id);
  return `
    <section class="t2-step t2-s-translate${isCurrent ? ' is-current' : ''}" id="t2-step-translate">
      ${_stepHead(3, 'Dịch câu Việt → Anh', `<span class="t2-step-tag">Có thể làm ở nhà</span>${_infoBtn('translate')}`, allDone && passed)}
      ${_infoBody('translate', `<ul class="t2-info-list">
        <li>Mỗi câu là một ý chính của đề, dùng từ vựng vừa học. Câu làm xong sẽ hiện ở cột trái khi bạn viết bài.</li>
        <li>Chỉ khoảng <b>1/4 số câu phải gõ cả câu</b> — còn lại là chọn cụm đúng, điền cụm từ, nghe &amp; điền, ghép cụm.</li>
        <li><b>Đúng ≥ ${T2_TRANSLATE_PASS}% số câu</b> là mở khoá phần viết trên lớp. Sai 3 lần thì câu tính sai và quay lại sau để làm lại.</li>
      </ul>`)}
      <div class="t2-mode-legend">${['mcq', 'gap', 'listen', 'type', 'order'].map(m => _modeBadge(m)).join('')}</div>
      ${sent.length ? `<div class="t2-meter${allDone ? ' ok' : ''}"><span style="width:${Math.round(done / sent.length * 100)}%"></span></div>
      <div class="t2-wc-row"><span class="t2-step-chip${allDone ? ' ok' : ''}">Đã làm ${done}/${sent.length} câu</span>${tp && done ? `<span class="t2-step-chip${passed ? ' ok' : ''}">Đúng ${tp.correct}/${tp.total} · ${tp.pct}%${passed ? ' · đã mở khoá phần viết' : ` · cần ≥ ${T2_TRANSLATE_PASS}%`}</span>` : ''}</div>` : ''}
      ${tp && done && !passed ? `<p class="t2-step-desc" style="margin:6px 0 0">🔒 Cần đúng thêm <b>${tp.need} câu</b>.</p>` : ''}
      <div class="t2-actions">
        <button class="t2-primary is-lg" onclick="startTranslate(this)"><i class="fas fa-language"></i> ${!done ? 'Bắt đầu' : !todo ? 'Làm lại' : allDone ? `Làm lại ${todo} câu chưa đúng` : `Làm tiếp ${todo} câu`}</button>
        ${state.wrongQuestionIds.length ? `<button class="t2-secondary is-warn" onclick="startRetryWrong(this)"><i class="fas fa-redo-alt"></i> Ôn câu sai (${state.wrongQuestionIds.length})</button>` : ''}
      </div>
      <details class="t2-more"${state.translateMoreOpen ? ' open' : ''} ontoggle="state.translateMoreOpen=this.open">
        <summary><i class="fas fa-chevron-right"></i> Tuỳ chọn khác</summary>
        <div class="t2-opts-row">
          <button type="button" class="t2-link" onclick="startPractice(this)"><i class="fas fa-layer-group"></i> Luyện đủ bộ câu (điền từ, sắp xếp, nhận diện dạng…)${best != null ? ` · cao nhất ${best}%` : ''}</button>
        </div>
        <div class="t2-opts-row" style="margin-top:4px">
          <button type="button" class="t2-pill-toggle${state.autoNext ? ' on' : ''}" onclick="toggleT2Pref('autoNext', this)" title="Tự động chuyển câu tiếp theo sau khi trả lời đúng">Tự chuyển câu</button>
          <button type="button" class="t2-pill-toggle${state.shuffleMode ? ' on' : ''}" onclick="toggleT2Pref('shuffleMode', this)" title="Xáo trộn thứ tự câu hỏi ngẫu nhiên">Xáo trộn câu</button>
          <button type="button" class="t2-link" onclick="openT2Preview()"><i class="fas fa-eye"></i> Xem trước câu hỏi</button>
        </div>
      </details>
    </section>`;
}

// ④ Guided writing — outline of this essay type + how sentences become a
// paragraph, with a same-type model paragraph (different prompt, so it can
// be analysed but not copied). Data: GET /api/task2/type-guides.
// role = colour class (r-main / r-why / r-result / r-ex), shared with the
// sentence colouring of the model paragraph below.
const _RECIPE = [
  { role: 'main',   k: 'Ý CHÍNH',    v: 'Câu chủ đề — 1 ý từ brainstorm',  ex: 'One major advantage of … is that …' },
  { role: 'why',    k: 'GIẢI THÍCH', v: 'Vì sao ý đó đúng / hợp lý',        ex: 'This is mainly because …' },
  { role: 'result', k: 'KẾT QUẢ',    v: 'Ý đó dẫn đến điều gì',             ex: 'As a result, …' },
  { role: 'ex',     k: 'VÍ DỤ',      v: 'Dẫn chứng cụ thể (câu ví dụ đã dịch)', ex: 'For example, …' }
];
const _ROLE_RE = [
  ['ex',     /^(for example|for instance|to illustrate|to give an example|a (good|clear|typical|notable|striking) example|an example|e\.g\.|this (is|was|can be) (clearly )?(seen|evident|illustrated|demonstrated)|according to|research (by|from|shows)|studies (show|suggest)|in (19|20)\d\d)/i],
  ['result', /^(as a (result|consequence)|consequently|therefore|thus|hence|accordingly|in turn|this (means|meant|leads|led|results|can lead|could lead|would lead|may lead|in turn|then|allows|enables|helps|makes|suggests|shows|indicates|demonstrates)|this,|which means|so,|because of this|as such|if (this|these|such|current) )/i],
  ['why',    /^(this is (mainly |largely |partly |primarily |simply )?(because|due to|since)|this can (largely |partly )?be (attributed|explained)|because|the (main |primary )?reason|this is due|since|it is (because|due)|after all)/i],
  ['main',   /^(firstly|first(ly)?,|secondly|second,|thirdly|finally,|furthermore|moreover|in addition|additionally|on the one hand|on the other hand|(one|another)( of the)?( most)?( \w+){0,2} (advantages?|disadvantages?|benefits?|drawbacks?|reasons?|causes?|factors?|contributors?|effects?|impacts?|consequences?|solutions?|measures?|ways?|steps?|approach(es)?|arguments?|problems?|issues?)\b|the (first|second|main|primary|most) )/i]
];
// Marks a paragraph sentence by sentence (①–④ = Ý chính → Giải thích → Kết quả → Ví dụ).
const _ROLE_NUM = { main: 1, why: 2, result: 3, ex: 4 };
function _roleParagraphHtml(text) {
  const sents = String(text || '').match(/[^.!?]+(?:[.!?]+["”’)]?|$)\s*/g) || [];
  let prev = null;
  return sents.map((s, i) => {
    const t = s.trim();
    if (!t) return '';
    let role = null;
    for (const [r, re] of _ROLE_RE) if (re.test(t)) { role = r; break; }
    if (!role) role = i === 0 ? 'main' : prev === 'main' ? 'why' : (prev || 'why');
    prev = role;
    return `<span class="t2-role r-${role}"><sup class="t2-role-n">${_ROLE_NUM[role]}</sup>${_escHtml(t)}</span> `;
  }).join('');
}
function _perBodyChains(perBody) {
  return String(perBody || '').split('|').map(g => g.trim()).filter(Boolean).map(g => {
    let label = '', rest = g;
    const m = g.match(/^([^:→]{2,20}):\s*(.+)$/);
    if (m) { label = m[1].trim(); rest = m[2]; }
    const steps = rest.split('→').map(s => s.trim()).filter(Boolean);
    let note = '';
    const last = steps[steps.length - 1] || '';
    const cut = last.indexOf('. ');
    if (cut > 0) { note = last.slice(cut + 2).trim(); steps[steps.length - 1] = last.slice(0, cut); }
    return { label, steps, note };
  });
}
function _chainsHtml(chains) {
  return chains.map(c => `<div class="t2-flow">${c.label ? `<b style="font-size:12px">${_escHtml(c.label)}:</b>` : ''}${c.steps.map(s => `<span>${_escHtml(s)}</span>`).join('<i class="fas fa-chevron-right"></i>')}</div>
        ${c.note ? `<p class="t2-step-desc" style="margin:-6px 0 10px">💡 ${_escHtml(c.note)}</p>` : ''}`).join('');
}
function renderGuideStep(isCurrent) {
  const t = state.selectedTopic;
  if (!isStepUnlocked(t._id)) return _lockedStep('guide', 4, 'Hướng dẫn viết (Guided writing)');
  const g = _guideFor(t);
  const done = _lessonSteps(t)[3].done;
  const flow = g?.outline?.flow ? g.outline.flow.split('→').map(s => s.trim()).filter(Boolean) : ['INTRODUCTION', 'BODY 1', 'BODY 2', 'CONCLUSION'];
  const chains = _perBodyChains(g?.outline?.perBody);
  const body1 = g?.modelEssay?.sections?.[1];
  return `
    <section class="t2-step t2-s-guide${isCurrent ? ' is-current' : ''}" id="t2-step-guide">
      ${_stepHead(4, 'Hướng dẫn viết (Guided writing)', _infoBtn('guide'), done)}
      ${_infoBody('guide', `<ul class="t2-info-list">
        <li>Mỗi đoạn thân bài = <b>Ý chính → Giải thích → Kết quả → Ví dụ</b>. Lấy ý từ bước ②, câu từ bước ③.</li>
        <li>Đoạn mẫu là <b>đề khác cùng dạng</b>: số ①–④ trước mỗi câu cho biết câu đó thuộc phần nào — xem cách triển khai, không chép.</li>
      </ul>`)}
      <div class="t2-guide-block">
        <div class="t2-guide-k"><span class="t2-guide-n">A</span> Bố cục bài ${_escHtml(ESSAY_LABELS[t.essayType] || '')}</div>
        <div class="t2-flow is-sections">${flow.map((f, i) => `<span class="t2-sec-c${Math.min(i, 3)}">${_escHtml(f)}</span>`).join('<i class="fas fa-chevron-right"></i>')}</div>
      </div>
      <div class="t2-guide-block">
        <div class="t2-guide-k"><span class="t2-guide-n">B</span> Một đoạn thân bài gồm 4 phần</div>
        <div class="t2-recipe">${_RECIPE.map((r, i) => `<div class="t2-recipe-item r-${r.role}"><div class="t2-recipe-k"><span>${i + 1}</span>${r.k}</div><div class="t2-recipe-v">${r.v}</div><div class="t2-recipe-ex">${_escHtml(r.ex)}</div></div>`).join('')}</div>
      </div>
      ${body1 ? `
      <details class="t2-model t2-guide-block" open>
        <summary><span class="t2-guide-n">C</span> Đoạn mẫu cùng dạng (đề khác)</summary>
        ${g.modelEssay.prompt ? `<div class="t2-model-q is-prompt"><span>Đề bài</span><b>${_escHtml(g.modelEssay.prompt)}</b></div>` : ''}
        <div class="t2-role-key">${_RECIPE.map((r, i) => `<span class="r-${r.role}"><sup class="t2-role-n">${i + 1}</sup>${r.k.charAt(0) + r.k.slice(1).toLowerCase()}</span>`).join('')}</div>
        <p class="t2-role-para"><b>${_escHtml(body1.title)}.</b> ${_roleParagraphHtml(body1.text)}</p>
      </details>` : (_guideCache === null ? '<p class="t2-step-desc"><i class="fas fa-spinner fa-spin"></i> Đang tải đoạn mẫu...</p>' : '')}
      ${chains.length ? `
      <details class="t2-model"><summary>🧭 Triển khai mỗi đoạn thân bài</summary>${_chainsHtml(chains)}</details>` : ''}
    </section>`;
}

// ⑤ In class — Introduction + Body 1 on the split-screen writer.
function renderClassStep(isCurrent) {
  const t = state.selectedTopic;
  if (!isStepUnlocked(t._id)) return _lockedStep('class', 5, 'Viết Mở bài + Thân bài 1');
  if (!isWritingUnlocked(t._id)) return _lockedStep('class', 5, 'Viết Mở bài + Thân bài 1', translateGateMessage(t._id));
  const L = _lessonFor(t._id);
  const sec = L ? L.sections : _emptySections();
  const done = !!(_wc(sec.intro) && _wc(sec.body1));
  const loggedIn = window.AuthService && window.AuthService.isLoggedIn();
  return `
    <section class="t2-step t2-s-class${isCurrent ? ' is-current' : ''}" id="t2-step-class">
      ${_stepHead(5, 'Viết Mở bài + Thân bài 1', _infoBtn('class'), done)}
      <div class="t2-sec-pills"><span class="t2-sec-c0">Mở bài</span><span class="t2-sec-c1">Thân bài 1</span></div>
      ${_infoBody('class', `<ul class="t2-info-list">
        <li><b>Mở bài:</b> paraphrase đề, nêu hướng triển khai / quan điểm.</li>
        <li><b>Thân bài 1:</b> cùng nhóm chọn ý mạnh nhất → <b>ý chính → giải thích → kết quả → ví dụ</b>, rồi viết lại bằng lời của bạn.</li>
        <li>Câu đã dịch, ý tưởng và từ vựng nằm ở cột trái màn hình viết.</li>
      </ul>`)}
      ${L && L.status === 'ready' ? `<div class="t2-wc-row">${_wcChip('Mở bài', sec.intro)}${_wcChip('Thân bài 1', sec.body1)}</div>` : ''}
      ${loggedIn
        ? `<button class="t2-primary is-lg" onclick="openComposeBtn(this, 'class')"><i class="fas fa-columns"></i> ${done ? 'Xem / sửa phần viết trên lớp' : 'Mở màn hình viết'}</button>`
        : '<div class="t2-lock-note"><i class="fas fa-user-lock"></i> Đăng nhập để viết và lưu bài.</div>'}
    </section>`;
}

// ⑥ Homework — Body 2 + Conclusion from the book's template, then AI grading.
function renderHomeStep(isCurrent) {
  const t = state.selectedTopic;
  if (!isStepUnlocked(t._id)) return _lockedStep('home', 6, 'Viết Thân bài 2 + Kết bài');
  if (!isWritingUnlocked(t._id)) return _lockedStep('home', 6, 'Viết Thân bài 2 + Kết bài', translateGateMessage(t._id));
  const L = _lessonFor(t._id);
  const sec = L ? L.sections : _emptySections();
  const filled = LESSON_SECTIONS.filter(s => (sec[s.key] || '').trim()).length;
  const total = LESSON_SECTIONS.reduce((a, s) => a + _wc(sec[s.key]), 0);
  const done = !!(_wc(sec.body2) && _wc(sec.conclusion));
  const submitted = !!(L && L.submittedAt);
  const untranslated = L ? L.sentences.filter(s => !s.en).length : 0;
  const loggedIn = window.AuthService && window.AuthService.isLoggedIn();
  return `
    <section class="t2-step t2-s-home${isCurrent ? ' is-current' : ''}" id="t2-step-home">
      ${_stepHead(6, 'Viết Thân bài 2 + Kết bài', `${submitted ? '<span class="t2-step-tag ok"><i class="fas fa-check"></i> Đã nộp</span>' : ''}${_infoBtn('home')}`, done)}
      <div class="t2-sec-pills"><span class="t2-sec-c2">Thân bài 2</span><span class="t2-sec-c3">Kết bài</span></div>
      ${_infoBody('home', `<ul class="t2-info-list">
        <li>Viết theo <b>template trong sách</b> (tab “Template” ở cột trái màn hình viết).</li>
        <li>Dùng từ vựng, ý tưởng và câu đã dịch — <b>tự viết bằng lời của bạn</b>, không chép bài mẫu.</li>
        <li>Đủ 4 phần (≥ ${LESSON_MIN_WORDS} từ) → bấm <b>Nộp bài chấm AI</b>.</li>
      </ul>`)}
      ${untranslated ? `<p class="t2-step-desc" style="margin:6px 0">Còn <b>${untranslated} câu</b> ở bước 3 chưa làm.</p>` : ''}
      ${L && L.status === 'ready' ? `<div class="t2-wc-row">${_wcChip('Thân bài 2', sec.body2)}${_wcChip('Kết bài', sec.conclusion)}<span class="t2-step-chip${total >= LESSON_MIN_WORDS ? ' ok' : ''}">Cả bài: ${total} từ</span></div>` : ''}
      ${loggedIn ? `
      <div class="t2-actions">
        <button class="t2-primary is-lg" onclick="openComposeBtn(this, 'home')"><i class="fas fa-house-user"></i> ${done ? 'Xem / sửa phần về nhà' : 'Viết phần về nhà'}</button>
        ${filled === LESSON_SECTIONS.length && t.writingTask2Id ? `<button class="t2-primary is-write" onclick="submitLessonEssay(this)"><i class="fas fa-paper-plane"></i> ${submitted ? 'Nộp lại để chấm AI' : 'Nộp bài chấm AI'}</button>` : ''}
      </div>` : ''}
    </section>`;
}

// Re-render one hub card in place (keeps scroll + whatever the student is
// typing elsewhere). Skips a card that currently has focus.
const _HUB_STEP_RENDER = {
  vocab: c => renderVocabStep(c), ideas: c => renderIdeaStep(c), translate: c => renderTranslateStep(c),
  guide: c => renderGuideStep(c), class: c => renderClassStep(c), home: c => renderHomeStep(c)
};
function _refreshHubStep(key) {
  if (state.view !== 'select' || !state.selectedTopic) return;
  const el = document.getElementById('t2-step-' + key);
  if (!el || el.contains(document.activeElement)) return;
  el.outerHTML = _HUB_STEP_RENDER[key](_currentStepKey(state.selectedTopic) === key);
  _luluSync();
}
function _refreshHubLesson() {
  if (state.view !== 'select' || !state.selectedTopic) return;
  const rail = document.getElementById('t2-rail');
  if (rail) rail.outerHTML = _renderRail(state.selectedTopic);
  Object.keys(_HUB_STEP_RENDER).forEach(_refreshHubStep);
  _luluSync();
}

// ════════════════════════════════════════════════════════
//  LULU on the hub — a coach that says what to do next, a peek over the
//  current card, and a little party when a step gets done.
//  Mascot = js/shared/playful.js. Purely decorative: every entry point is
//  guarded and the hub works the same without it.
// ════════════════════════════════════════════════════════
const _LULU_STEP = {
  vocab:     { say: 'Bắt đầu bằng từ vựng nha! Lưu hết từ vào sổ rồi làm quiz đạt từ 70% là mở khoá các bước sau 📒',
               tips: ['Bấm 🔊 để nghe phát âm, đọc to theo cho nhớ lâu nha!', 'Học cả cụm (collocation) chứ đừng học từ đơn lẻ nhé 😉', 'Quiz cần đạt từ 70% — chưa đạt thì ôn lại mấy từ sai rồi làm quiz mới nha!'] },
  ideas:     { say: 'Giờ brainstorm cùng nhóm nè! Nghĩ thật nhiều ý, ý nào hay thì ghi lại liền 💡',
               tips: ['Ý hay = rõ ràng + có ví dụ thật. Đừng ngại ghi cả ý của nhóm bạn!', 'Bí ý? Thử nghĩ theo các góc: cá nhân, xã hội, kinh tế, sức khoẻ…', 'Mỗi phần chỉ cần 2–3 ý mạnh là đủ viết rồi.'] },
  translate: { say: 'Dịch câu nào! Có câu chọn, câu điền, câu nghe — đúng từ 70% là mở khoá phần viết ✍️',
               tips: ['Sai không sao, đọc gợi ý rồi sửa lại là nhớ lâu lắm!', 'Câu nghe & điền: bấm “Nghe chậm” nếu nghe chưa rõ nha 🎧', 'Để ý cụm tô màu trong câu mẫu — dùng lại được trong bài đó!'] },
  guide:     { say: 'Xem cách ghép ý + câu đã dịch thành một đoạn văn hoàn chỉnh nha 🧩',
               tips: ['Công thức thần thánh: Ý chính → Giải thích → Kết quả → Ví dụ!', 'Từ nối làm đoạn văn mượt hơn: This is because, As a result, For example…', 'Đọc đoạn mẫu để học cách triển khai, đừng học thuộc nha.'] },
  class:     { say: 'Cùng nhóm viết Mở bài + Thân bài 1 thôi! Đi được nửa đường rồi đó 💪',
               tips: ['Mở bài: paraphrase đề bằng từ đồng nghĩa, đừng chép nguyên đề nha.', 'Bấm ＋ ở cột trái để chèn câu đã dịch vào bài.', 'Viết xong đọc lại một lượt để sửa lỗi nhỏ nha.'] },
  home:      { say: 'Về nhà viết nốt Thân bài 2 + Kết bài rồi nộp chấm AI nha 🏠',
               tips: ['Mở tab “Template” ở cột trái để viết Kết bài cho nhanh.', 'Kết bài chỉ cần tóm lại ý chính, không thêm ý mới nha.', 'Đủ 4 phần là nộp được để AI chấm rồi!'] }
};
let _luluSeen = { topicId: null, done: null }; // baseline the celebrations diff against
let _coachShownFor = null;                     // entrance animation only on a fresh topic
let _coachPokes = 0;

function _luluSvg(mood) {
  try { return window.Mascot ? window.Mascot.svg(mood, { label: 'Lulu' }) : '🍊'; } catch { return '🍊'; }
}
function _reduceMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}
function _coachState(t) {
  const steps = _lessonSteps(t);
  const n = steps.filter(s => s.done).length;
  const all = n === steps.length;
  const cur = _currentStepKey(t);
  const L = _lessonFor(t._id);
  return {
    steps, n, all, cur,
    mood: all ? 'cheer' : n >= 3 ? 'excited' : 'happy',
    text: all
      ? (L && L.submittedAt ? 'Cậu đã hoàn thành trọn buổi học rồi! Lulu tự hào về cậu quá 🥳' : 'Xong cả 6 bước rồi! Nộp bài để AI chấm điểm nha 🎉')
      : _LULU_STEP[cur].say
  };
}
function _coachProgHtml(c) {
  return `<div class="t2-coach-prog" aria-label="Đã xong ${c.n}/${c.steps.length} bước">${c.steps.map(s => `<i class="${s.done ? 'on' : ''}${s.key === c.cur && !c.all ? ' cur' : ''}"></i>`).join('')}<span>${c.n}/${c.steps.length} bước</span></div>`;
}
function _renderCoach(t) {
  const c = _coachState(t);
  const enter = _coachShownFor !== t._id;
  _coachShownFor = t._id;
  return `<div class="t2-coach" id="t2-coach">
        <button type="button" class="t2-coach-lulu${enter ? ' is-enter' : ''}" data-mood="${c.mood}" onclick="luluCoachPoke()" title="Bấm để nghe mẹo từ Lulu" aria-label="Lulu — bấm để nghe mẹo">${_luluSvg(c.mood)}</button>
        <div class="t2-coach-body">
          <div class="t2-coach-bubble${enter ? ' is-say' : ''}" id="t2-coach-say" data-base="${_escHtml(c.text)}" role="status" aria-live="polite">${_escHtml(c.text)}</div>
          ${_coachProgHtml(c)}
        </div>
      </div>`;
}
function _coachSay(text, mood, jump) {
  const coach = document.getElementById('t2-coach');
  if (!coach) return;
  const b = coach.querySelector('.t2-coach-bubble');
  const lulu = coach.querySelector('.t2-coach-lulu');
  b.textContent = text;
  b.classList.remove('is-say'); void b.offsetWidth; b.classList.add('is-say');
  if (mood && lulu.dataset.mood !== mood) { lulu.dataset.mood = mood; lulu.innerHTML = _luluSvg(mood); }
  if (jump) { lulu.classList.remove('is-enter', 'is-jump'); void lulu.offsetWidth; lulu.classList.add('is-jump'); }
}
function luluCoachPoke() {
  const t = state.selectedTopic;
  if (!t) return;
  const c = _coachState(t);
  _coachPokes++;
  const tips = c.all ? ['Tuyệt vời! Ôn lại từ vựng của buổi này vài lần nữa cho nhớ lâu nha 🍊', 'Thử “Thi thử cả tuần” bên dưới để kiểm tra lại cả tuần nè!']
    : _LULU_STEP[c.cur].tips;
  const text = _coachPokes % 9 === 0 ? 'Ui da, cù lét tớ hoài! 🤭' : tips[_coachPokes % tips.length];
  _coachSay(text, ['wink', 'excited', 'think', 'happy'][_coachPokes % 4], true);
}
function _confettiBurst(host) {
  if (!host || _reduceMotion()) return;
  const colors = ['#f59e0b', '#22c55e', '#6366f1', '#ec4899', '#0ea5e9', '#facc15'];
  const box = document.createElement('div');
  box.className = 't2-confetti';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = Array.from({ length: 18 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 18 + Math.random() * .4;
    const d = 60 + Math.random() * 70;
    return `<i style="--c:${colors[i % colors.length]};--dx:${Math.round(Math.cos(a) * d * 1.6)}px;--dy:${Math.round(Math.sin(a) * d - 30)}px;--r:${Math.round(Math.random() * 720 - 360)}deg"></i>`;
  }).join('');
  host.appendChild(box);
  setTimeout(() => box.remove(), 1400);
}
function _luluCelebrate(key, c) {
  const step = c.steps.find(s => s.key === key);
  const next = c.steps.find(s => s.key === c.cur);
  _coachSay(c.all ? 'Xong cả 6 bước rồi! Đỉnh quá đi 🥳🎉'
    : `Xong bước “${step ? step.label : ''}” rồi! 🎉 Tiếp theo: ${next ? next.label : ''} nha!`, c.all ? 'cheer' : 'excited', true);
  _confettiBurst(document.getElementById('t2-coach'));
  const rail = document.querySelector(`.t2-rail-item[data-key="${key}"]`);
  if (rail) { rail.classList.remove('is-pop'); void rail.offsetWidth; rail.classList.add('is-pop'); }
}
// Bring the coach / peek in line with the cards after any (partial) hub
// re-render, and celebrate steps that just turned done.
function _luluSync() {
  if (state.view !== 'select' || !state.selectedTopic) return;
  try {
    const t = state.selectedTopic, id = t._id;
    const c = _coachState(t);
    const coach = document.getElementById('t2-coach');
    if (coach) {
      coach.querySelector('.t2-coach-prog').outerHTML = _coachProgHtml(c);
      const b = coach.querySelector('.t2-coach-bubble');
      if (b.dataset.base !== c.text) { b.dataset.base = c.text; _coachSay(c.text, c.mood); }
    }
    document.querySelectorAll('.t2-lulu-peek').forEach(el => { if (!el.closest('.t2-step.is-current')) el.remove(); });
    const curEl = document.querySelector('.t2-hub .t2-step.is-current');
    if (curEl && !curEl.querySelector('.t2-lulu-peek')) {
      curEl.insertAdjacentHTML('afterbegin', `<div class="t2-lulu-peek" aria-hidden="true">${_luluSvg('happy')}</div>`);
    }
    // Only diff once both async halves (lesson + vocab list) have loaded —
    // otherwise their arrival would read as "steps just completed".
    const ready = state.lesson.topicId === id && state.lesson.status === 'ready' && state.vocabFor === id;
    if (!ready) { _luluSeen = { topicId: id, done: null }; return; }
    const done = c.steps.filter(s => s.done).map(s => s.key);
    const prev = _luluSeen.topicId === id ? _luluSeen.done : null;
    _luluSeen = { topicId: id, done };
    const fresh = prev ? done.filter(k => !prev.includes(k)) : [];
    if (fresh.length) _luluCelebrate(fresh[fresh.length - 1], c);
  } catch {}
}
// Brainstorm typing doesn't re-render the hub; refresh rail + coach a beat later.
let _ideaSyncTimer = 0;
function _syncAfterIdeaInput() {
  clearTimeout(_ideaSyncTimer);
  _ideaSyncTimer = setTimeout(() => {
    if (state.view !== 'select' || !state.selectedTopic) return;
    const rail = document.getElementById('t2-rail');
    if (rail) rail.outerHTML = _renderRail(state.selectedTopic);
    _luluSync();
  }, 600);
}

// ════════════════════════════════════════════════════════
//  TEACHER GUIDELINE — the full lesson plan (timings, grouping, what to
//  model on the board, the brainstorm answer key). Kept out of the student
//  cards so the hub stays readable.
// ════════════════════════════════════════════════════════
function _tgStep(i, num, title, time, goal, how, tip, extra) {
  return `<section class="t2-tg-step" style="--i:${i}">
      <div class="t2-tg-step-head"><span class="t2-step-num">${num}</span><b>${title}</b>${time ? `<span class="t2-tg-time"><i class="far fa-clock"></i> ${time}</span>` : ''}</div>
      ${goal ? `<p class="t2-tg-goal"><b>Mục tiêu:</b> ${goal}</p>` : ''}
      <ul class="t2-tg-how">${how.filter(Boolean).map(h => `<li>${h}</li>`).join('')}</ul>
      ${extra || ''}
      ${tip ? `<div class="t2-tg-tip">💡 ${tip}</div>` : ''}
    </section>`;
}
function _teacherGuideHtml(t) {
  const n = sessionNumber(t._id);
  const sides = _ideaSides(t);
  const hasHints = sides.some(s => (s.points || []).length);
  const vocabN = state.vocabFor === t._id ? state.vocab.length : 0;
  const g = _guideFor(t);
  const flow = g?.outline?.flow ? g.outline.flow.split('→').map(s => s.trim()).filter(Boolean) : ['INTRODUCTION', 'BODY 1', 'BODY 2', 'CONCLUSION'];
  const chains = _perBodyChains(g?.outline?.perBody);
  const typeLabel = ESSAY_LABELS[t.essayType] || t.essayType || '';
  const sideNames = sides.map(s => `<b>${_escHtml(s.side)}</b>`).join(', ');
  const tl = [
    ['p1', 'Từ vựng', 15], ['p1', 'Brainstorm', 15], ['p1', 'Dịch câu', 15], ['p1', 'Hướng dẫn viết', 15],
    ['p2', 'Viết trên lớp', 30], ['p3', 'Về nhà', 12]
  ];
  let i = 0;
  return `
    <div class="t2-tg-prompt"><b>Đề bài:</b> ${_escHtml(t.prompt)}</div>
    <div class="t2-tg-tl" aria-hidden="true">${tl.map(([p, label, m], k) => `<div class="t2-tg-seg ${p}" style="flex:${m};--i:${k}">${label}<small>${p === 'p3' ? 'ở nhà' : m + '′'}</small></div>`).join('')}</div>
    <div class="t2-tg-tl-note">Tổng thời gian trên lớp ≈ 90 phút · phần cuối làm ở nhà.</div>
    <div class="t2-tg-group">
      <div class="t2-tg-group-k"><i class="fas fa-users"></i> Ưu tiên học theo nhóm</div>
      <p>Buổi học hiệu quả nhất khi HS <b>làm việc và viết bài theo nhóm</b>: các em học được ý tưởng, từ vựng và cách diễn đạt của nhau, mạnh dạn hơn khi viết.</p>
      <ul class="t2-tg-how">
        <li>Chia nhóm <b>3–4 bạn</b>, <b>trộn trình độ</b> (mỗi nhóm có 1 bạn khá) và giữ nguyên nhóm suốt buổi.</li>
        <li>Phân vai, đổi vai sau mỗi bước:
          <span class="t2-tg-roles"><span>👑 Nhóm trưởng</span><span>✍️ Thư ký</span><span>🎤 Người trình bày</span><span>⏱️ Canh giờ</span></span></li>
        <li><b>Tính điểm thi đua nhóm</b> suốt buổi (quiz, brainstorm, đoạn văn hay nhất) — nhóm thắng được cộng điểm / khen trước lớp.</li>
      </ul>
    </div>

    <div class="t2-tg-phase t2-phase" style="margin-top:12px"><span class="t2-phase-k">Giai đoạn 1</span><b>Scaffolding</b><span class="t2-phase-time">~60 phút</span>
      <p>Chuẩn bị từ vựng, ý tưởng và cách diễn đạt trước khi viết.</p></div>
    ${_tgStep(i++, 1, 'Từ vựng &amp; collocations', '15′',
      `HS nắm ${vocabN ? vocabN + ' từ / collocation' : 'các từ / collocation'} trọng tâm của chủ đề.`,
      ['Giới thiệu nhanh các từ trọng tâm, bấm 🔊 cho cả lớp nghe phát âm, nhấn mạnh <b>collocation</b> đi kèm.',
       'Cho HS bấm <b>Lưu tất cả vào sổ</b>.',
       `<b>Quiz từ vựng là bắt buộc:</b> mỗi HS phải đạt <b>≥ ${VQUIZ_PASS}%</b> mới mở khoá các bước 2–6 (chưa đạt thì làm lại). Quiz cố định ${VQUIZ_LEN} câu — cả lớp cùng một bộ câu hỏi, cùng thứ tự, nên GV có thể chữa chung.`,
       '<b>Thi đua nhóm:</b> trước khi làm quiz cá nhân, các nhóm đố nhau collocation (nhóm A nói từ, nhóm B nói cụm đi kèm) — tính điểm nhóm; bạn đạt quiz trước kèm bạn chưa đạt.'],
      'Nếu HS chưa đạt quiz, các bước sau trên máy vẫn bị khoá — vẫn cho HS tham gia brainstorm nhóm (trên giấy / bảng) rồi nhập ý sau khi mở khoá.')}
    ${_tgStep(i++, 2, 'Brainstorm ý tưởng — thi đua nhóm', '15′',
      'Có thật nhiều ý hay, hợp lý và dùng được trong bài IELTS.',
      [`Chia lớp thành nhóm <b>3–4 bạn</b>. Mỗi nhóm có <b>~7 phút</b> liệt kê thật nhiều ý cho từng phần: ${sideNames}.`,
       'Các nhóm lần lượt trình bày. Nhóm có nhiều ý <b>hay, hợp lý và dùng được trong bài IELTS</b> nhất sẽ thắng.',
       hasHints ? 'Sau khi các nhóm trình bày xong mới cho HS mở <b>“Xem gợi ý ý chính”</b> để so sánh.' : '',
       'HS ghi lại ý tốt nhất (của nhóm mình và nhóm bạn) vào ô — các ý này hiện ở cột trái khi viết bài.'],
      '', hasHints ? `<details class="t2-model"><summary>🔑 Gợi ý ý chính (đáp án tham khảo cho GV)</summary>
        ${sides.map(h => `<div class="t2-brainstorm-hint-side">${_escHtml(h.side)}</div>
          <ul class="t2-brainstorm-hint-list">${(h.points || []).map(p => `<li>${_escHtml(p)}</li>`).join('')}</ul>`).join('')}
      </details>` : '')}
    ${_tgStep(i++, 3, 'Dịch câu Việt → Anh', '15′',
      'Chuyển ý tưởng thành câu tiếng Anh đúng, dùng từ vựng vừa học.',
      ['HS làm các câu tiếng Việt chứa ý chính của đề; hệ thống chấm và gợi ý ngay.',
       'Mỗi câu có một dạng cố định (cả lớp giống nhau): <b>chọn cụm đúng</b>, <b>điền cụm từ</b>, <b>nghe &amp; điền</b>, <b>gõ cả câu</b> (~1/4 số câu) và <b>ghép cụm</b> cho câu dài — nhanh hơn nhiều so với gõ cả ~20 câu.',
       `<b>Bắt buộc:</b> HS phải dịch đúng <b>≥ ${T2_TRANSLATE_PASS}%</b> số câu mới mở khoá bước 5–6 (viết trên lớp, bài về nhà) trên máy — chưa đạt thì “Làm lại” các câu chưa đúng.`,
       '<b>Đối chiếu theo nhóm (~3′):</b> các bạn trong nhóm so sánh bản dịch của nhau, chọn câu hay nhất cho mỗi ý; người trình bày đọc câu của nhóm trước lớp.',
       'GV chữa nhanh 2–3 câu khó trên bảng, chỉ ra collocation / cấu trúc hay.',
       'Câu HS dịch sẽ hiện ở <b>cột trái màn hình viết</b> — dịch càng nhiều, viết càng dễ.',
       'Hết giờ trên lớp: giao làm nốt ở nhà. HS khá có thể chọn <b>Luyện đủ bộ câu</b> (điền từ, sắp xếp, nhận diện dạng…) trong “Tuỳ chọn khác”.'],
      'Dùng <b>Xem trước câu hỏi</b> (trong “Tuỳ chọn khác”) để chuẩn bị trước buổi học.')}
    ${_tgStep(i++, 4, 'Hướng dẫn viết (Guided writing)', '15′',
      'HS biết biến <b>ý tưởng + câu đã dịch</b> thành đoạn văn hoàn chỉnh, thay vì học thuộc bài mẫu.',
      [`Giới thiệu bố cục bài <b>${_escHtml(typeLabel)}</b>.`,
       '<b>GV làm mẫu trên bảng:</b> chọn 1 ý từ phần brainstorm → ghép 3–4 câu đã dịch theo thứ tự <b>Ý chính → Giải thích → Kết quả → Ví dụ</b> → thêm từ nối (<i>This is because, As a result, For example</i>) → sửa cho câu liền mạch.',
       '<b>Phân tích đoạn mẫu theo nhóm:</b> mỗi nhóm tìm trong <b>đoạn mẫu cùng dạng</b> (đề khác) một phần của công thức (ý chính / giải thích / kết quả / ví dụ) và các từ nối, rồi chia sẻ với lớp.'],
      '', `<div class="t2-flow">${flow.map(f => `<span>${_escHtml(f)}</span>`).join('<i class="fas fa-chevron-right"></i>')}</div>
        ${chains.length ? `<details class="t2-model"><summary>🧭 Triển khai mỗi đoạn thân bài</summary>${_chainsHtml(chains)}</details>` : ''}`)}

    <div class="t2-tg-phase t2-phase is-class"><span class="t2-phase-k">Giai đoạn 2</span><b>Viết trên lớp</b><span class="t2-phase-time">~30 phút</span>
      <p>Viết khoảng một nửa bài dưới sự hướng dẫn của GV — kết hợp viết cá nhân và viết theo nhóm.</p></div>
    ${_tgStep(i++, 5, 'Viết Mở bài + Thân bài 1 — viết theo nhóm', '30′',
      'Cả nhóm cùng tạo ra một đoạn văn tốt, rồi mỗi bạn viết lại được bằng lời của mình.',
      ['<b>Mở bài — theo cặp (~8′):</b> mỗi cặp cùng paraphrase đề và nêu hướng triển khai / quan điểm; 2 cặp trong nhóm so sánh, chọn câu mở bài hay nhất.',
       '<b>Thân bài 1 — cả nhóm viết chung (~12′):</b> chọn ý mạnh nhất, thống nhất dàn ý (ý chính → giải thích → kết quả → ví dụ). <b>Thư ký</b> viết đoạn chung, mỗi bạn góp ít nhất 1 câu (dùng câu đã dịch).',
       '<b>Đổi bài chéo (~5′):</b> các nhóm đổi đoạn văn cho nhau, góp ý theo checklist: đủ 4 phần? có từ nối? dùng từ vựng của bài? Nhóm có đoạn hay nhất được cộng điểm.',
       '<b>Cá nhân (~5′):</b> mỗi bạn tự viết lại Mở bài + Thân bài 1 vào màn hình viết bằng lời của mình, dựa trên bản của nhóm.',
       'GV đi từng nhóm hỗ trợ chọn ý, diễn đạt câu và sắp xếp nội dung theo cấu trúc bài Task 2; khuyến khích các bạn yếu đóng góp câu.'],
      'Màn hình viết chia đôi: câu HS đã dịch ở bên trái, phần viết ở bên phải. HS bấm <b>＋</b> để chèn một câu vào chỗ con trỏ, rồi chỉnh lại cho liền mạch.')}

    <div class="t2-tg-phase t2-phase is-home"><span class="t2-phase-k">Giai đoạn 3</span><b>Bài tập về nhà</b>
      <p>HS tự hoàn thành nửa bài còn lại theo template trong sách.</p></div>
    ${_tgStep(i++, 6, 'Viết Thân bài 2 + Kết bài', '', '',
      ['HS viết <b>Thân bài 2</b> và <b>Kết bài</b> theo template trong sách (tab “Template” ở cột trái màn hình viết).',
       'Nhắc HS làm nốt các câu chưa dịch ở bước 3 để có thêm câu tham khảo.',
       `Đủ 4 phần (≥ ${LESSON_MIN_WORDS} từ) → HS bấm <b>Nộp bài chấm AI</b>.`,
       'Khuyến khích HS <b>trao đổi trong nhóm</b> (nhắn tin / gặp nhau) để góp ý dàn ý Thân bài 2 trước khi viết — nhưng mỗi bạn tự viết bài của mình.',
       'Đầu buổi sau (~5′): các nhóm đọc chéo bài của nhau, chọn 1 câu hay và 1 lỗi cần sửa; GV nhận xét các lỗi chung từ bài đã chấm.'])}
    ${_tgStep(i++, '<i class="fas fa-clipboard-check" style="font-size:11px"></i>', 'Thi thử cả tuần <span class="t2-opt-tag">tuỳ chọn</span>', '', '',
      [`Câu hỏi ngẫu nhiên từ các chủ đề của Tuần ${state.selectedWeek ?? ''}, 2 phút/câu — phù hợp làm bài kiểm tra nhanh cuối tuần.`])}

    <div class="t2-tg-foot"><i class="fas fa-random" style="margin-top:4px"></i><div><b>Linh hoạt:</b> GV có thể đổi thứ tự hoặc gộp các bước tuỳ độ khó của đề và trình độ lớp${n ? ` (Buổi ${n})` : ''}. Lớp mạnh có thể rút ngắn bước 1 và 3 để dành thêm thời gian viết.</div></div>`;
}
function openTeacherGuide() {
  const t = state.selectedTopic;
  if (!t) return;
  let ov = document.getElementById('t2-tg-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 't2-tg-overlay';
    ov.className = 't2-tg-overlay';
    ov.addEventListener('click', e => { if (e.target === ov) closeTeacherGuide(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('is-open')) closeTeacherGuide(); });
    document.body.appendChild(ov);
  }
  const n = sessionNumber(t._id);
  ov.innerHTML = `
    <div class="t2-tg-modal" role="dialog" aria-modal="true" aria-labelledby="t2-tg-title">
      <div class="t2-tg-hdr">
        <div class="t2-tg-lulu" aria-hidden="true">${_luluSvg('wink')}</div>
        <div style="min-width:0">
          <h3 id="t2-tg-title">Guideline for teacher</h3>
          <div class="t2-tg-sub">${n ? `Buổi ${n} · ` : ''}${_escHtml(t.topicName)} · ${_escHtml(ESSAY_LABELS[t.essayType] || t.essayType || '')}</div>
        </div>
        <button class="t2-hist-close" onclick="closeTeacherGuide()" aria-label="Đóng"><i class="fas fa-times"></i></button>
      </div>
      <div class="t2-tg-body" id="t2-tg-body">${_teacherGuideHtml(t)}</div>
    </div>`;
  ov.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  ov.querySelector('.t2-hist-close').focus();
  // Outline chains come from the type guides — fill them in once loaded.
  if (_guideCache === null && window.AuthService && window.AuthService.isLoggedIn()) {
    _loadGuides().then(() => {
      const body = document.getElementById('t2-tg-body');
      if (body && ov.classList.contains('is-open') && state.selectedTopic === t) body.innerHTML = _teacherGuideHtml(t);
    });
  }
}
function closeTeacherGuide() {
  const ov = document.getElementById('t2-tg-overlay');
  if (ov) ov.classList.remove('is-open');
  document.body.style.overflow = '';
}

// ════════════════════════════════════════════════════════
//  LESSON DATA — load / autosave (server + local mirror)
// ════════════════════════════════════════════════════════
const LESSON_LOCAL_PREFIX = 't2_lesson:';
let _lessonInflight = null;
let _lessonSeq = 0;
let _lessonSaveTimer = null;
let _lessonDirty = { topicId: null, sections: false, brainstorm: false };
let _lessonEditSeq = 0;
let _lessonSaveState = '';

function _lessonLocal(id) {
  try { return JSON.parse(localStorage.getItem(LESSON_LOCAL_PREFIX + id) || 'null'); } catch { return null; }
}

function loadLesson(id, force) {
  if (!id || !(window.AuthService && window.AuthService.isLoggedIn())) return Promise.resolve();
  const L = state.lesson;
  if (L.topicId === id && L.status === 'loading' && _lessonInflight) return _lessonInflight;
  if (!force && L.topicId === id && L.status === 'ready') return Promise.resolve();
  const seq = ++_lessonSeq;
  if (L.topicId !== id) state.lesson = { topicId: id, status: 'loading', sentences: [], sections: _emptySections(), submittedAt: null };
  else L.status = 'loading';
  _lessonInflight = (async () => {
    try {
      const d = await apiFetch(`/api/task2/lesson/${id}`);
      if (seq !== _lessonSeq) return;
      const w = d.work || {};
      const sections = { ..._emptySections(), ...(w.sections || {}) };
      let brainstorm = Array.isArray(w.brainstorm) ? w.brainstorm.slice() : null;
      // A local copy newer than the server's = edits that never reached it
      // (offline, tab closed mid-save). The copy is removed after every
      // successful save, so this only fires for genuinely unsynced work.
      const local = _lessonLocal(id);
      const serverAt = w.updatedAt ? new Date(w.updatedAt).getTime() : 0;
      let restored = false;
      if (local && local.savedAt > serverAt) {
        if (local.sections) { Object.assign(sections, local.sections); restored = true; }
        if (Array.isArray(local.brainstorm)) { brainstorm = local.brainstorm.slice(); restored = true; }
      }
      // Keep only edits this device can still vouch for if a save is pending.
      if (state.lesson.topicId === id && _lessonDirty.topicId === id && _lessonDirty.sections) Object.assign(sections, state.lesson.sections);
      state.lesson = { topicId: id, status: 'ready', sentences: d.sentences || [], sections, submittedAt: w.submittedAt || null };
      if (state.brainstorm.topicId === id && brainstorm && !state.brainstorm.notes.some(n => (n || '').trim())) {
        state.brainstorm.notes = brainstorm;
      }
      if (restored) { _markLessonDirty('sections'); _markLessonDirty('brainstorm'); }
    } catch {
      if (seq === _lessonSeq) state.lesson.status = 'error';
    } finally {
      if (seq === _lessonSeq) _lessonInflight = null;
    }
    if (seq === _lessonSeq) {
      _refreshHubLesson();
      if (state.view === 'compose' && !document.activeElement?.classList?.contains('t2c-ta')) render();
    }
  })();
  return _lessonInflight;
}

// part: 'sections' | 'brainstorm'. Only the parts actually edited are sent,
// so typing brainstorm notes before the lesson finished loading can never
// blank the saved essay.
function _markLessonDirty(part) {
  const id = state.selectedTopic?._id;
  if (!id) return;
  if (_lessonDirty.topicId && _lessonDirty.topicId !== id) flushLessonSave();
  _lessonDirty.topicId = id;
  _lessonDirty[part] = true;
  _lessonEditSeq++;
  try {
    const prev = _lessonLocal(id) || {};
    if (part === 'sections' && state.lesson.topicId === id && state.lesson.status === 'ready') prev.sections = state.lesson.sections;
    if (part === 'brainstorm' && state.brainstorm.topicId === id) prev.brainstorm = state.brainstorm.notes;
    prev.savedAt = Date.now();
    localStorage.setItem(LESSON_LOCAL_PREFIX + id, JSON.stringify(prev));
  } catch {}
  _setSaveState('dirty');
  clearTimeout(_lessonSaveTimer);
  _lessonSaveTimer = setTimeout(() => flushLessonSave(), 1500);
}

// Builds the request synchronously (callers may reset state right after),
// then sends it. extra: { submitted: true } on hand-in.
async function flushLessonSave(opts = {}) {
  clearTimeout(_lessonSaveTimer);
  const d = _lessonDirty;
  const id = d.topicId;
  if (!id || (!d.sections && !d.brainstorm && !opts.extra)) return;
  if (!(window.AuthService && window.AuthService.isLoggedIn())) return;
  const body = { ...(opts.extra || {}) };
  if (d.sections && state.lesson.topicId === id && state.lesson.status === 'ready') body.sections = { ...state.lesson.sections };
  if (d.brainstorm && state.brainstorm.topicId === id) body.brainstorm = state.brainstorm.notes.map(n => n || '');
  _lessonDirty = { topicId: null, sections: false, brainstorm: false };
  const editSeq = _lessonEditSeq;
  _setSaveState('saving');
  try {
    await apiFetch(`/api/task2/lesson/${id}`, { method: 'PUT', keepalive: !!opts.keepalive, body: JSON.stringify(body) });
    if (editSeq === _lessonEditSeq) {
      try { localStorage.removeItem(LESSON_LOCAL_PREFIX + id); } catch {}
      _setSaveState('saved');
    }
    if (state.lesson.topicId === id) _bumpLessonProgress(id);
  } catch {
    // Put the flags back so the next edit / leave retries; the local mirror
    // still holds the text.
    if (!_lessonDirty.topicId || _lessonDirty.topicId === id) {
      _lessonDirty.topicId = id;
      if (body.sections) _lessonDirty.sections = true;
      if (body.brainstorm) _lessonDirty.brainstorm = true;
    }
    _setSaveState('error');
  }
}
window.addEventListener('pagehide', () => flushLessonSave({ keepalive: true }));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushLessonSave({ keepalive: true });
});

function _bumpLessonProgress(id) {
  const s = state.lesson.sections;
  state.lessonProgress[id] = {
    topicId: id,
    written: LESSON_SECTIONS.filter(x => (s[x.key] || '').trim()).length,
    submitted: !!state.lesson.submittedAt
  };
}

function _saveStateHtml() {
  return ({
    dirty:  '<i class="fas fa-pen"></i> Đang soạn…',
    saving: '<i class="fas fa-spinner fa-spin"></i> Đang lưu…',
    saved:  '<i class="fas fa-check"></i> Đã lưu',
    error:  '<i class="fas fa-exclamation-triangle"></i> Chưa lưu được — sẽ thử lại'
  })[_lessonSaveState] || '';
}
function _setSaveState(s) {
  _lessonSaveState = s;
  const el = document.getElementById('t2c-save');
  if (el) { el.innerHTML = _saveStateHtml(); el.classList.toggle('is-error', s === 'error'); }
  const hasNotes = state.brainstorm.notes.some(n => (n || '').trim());
  document.querySelectorAll('.t2-bs-save').forEach(b => { b.innerHTML = _bsSaveHtml(hasNotes); });
}

// Mirror an answer from the practice screen into the writer's sentence list
// straight away (the server copy arrives with the draft/attempt save).
function _noteMySentence(q, answer, isOk) {
  const L = state.lesson;
  if (L.topicId !== state.selectedTopic?._id || L.status !== 'ready') return;
  const qid = q.questionId || q._id;
  const s = L.sentences.find(x => x.questionId === qid || x.questionId === q._id);
  if (!s || !String(answer || '').trim()) return;
  if (s.en && s.isCorrect && !isOk) return;
  s.en = String(answer).trim();
  s.isCorrect = !!isOk;
}

// Type guides (outline + model essay) and the book's Band 6 templates — both
// premium endpoints, loaded once per page. null = not loaded yet.
let _guideCache = null;
let _tplCache = null;
let _guideLoading = null;
let _tplLoading = null;
function _loadGuides() {
  if (_guideCache) return Promise.resolve(_guideCache);
  if (!_guideLoading) {
    _guideLoading = apiFetch('/api/task2/type-guides')
      .then(d => (_guideCache = d.guides || []))
      .catch(() => (_guideCache = []))
      .finally(() => { _guideLoading = null; });
  }
  return _guideLoading;
}
function _loadTemplates() {
  if (_tplCache) return Promise.resolve(_tplCache);
  if (!_tplLoading) {
    _tplLoading = apiFetch('/api/task2/templates?level=band6')
      .then(d => (_tplCache = d.templates || []))
      .catch(() => (_tplCache = []))
      .finally(() => { _tplLoading = null; });
  }
  return _tplLoading;
}
function _guideFor(t) { return (_guideCache || []).find(g => g.typeId === ESSAY_TYPE_ID[t.essayType]) || null; }
function _templateFor(t) { return (_tplCache || []).find(x => x.typeId === ESSAY_TYPE_ID[t.essayType]) || null; }

// ════════════════════════════════════════════════════════
//  SPLIT-SCREEN WRITER — reference (left) · essay (right)
// ════════════════════════════════════════════════════════
function openComposeBtn(btn, phase) { return _withBusy(btn, () => openCompose(phase)); }

async function openCompose(phase, opts = {}) {
  const t = state.selectedTopic;
  if (!t) return;
  if (!(window.AuthService && window.AuthService.isLoggedIn())) { showToast('Đăng nhập để viết và lưu bài', 'warn'); return; }
  if (!isStepUnlocked(t._id)) {
    showToast(`Hoàn thành bước Từ vựng (lưu từ + quiz ≥ ${VQUIZ_PASS}%) để mở màn hình viết`, 'warn', 4000);
    if (state.view === 'select') scrollToHubStep('vocab');
    return;
  }
  const id = t._id;
  await Promise.all([
    loadLesson(id),
    state.vocabFor === id ? null : _fetchVocab(id).then(list => { if (state.selectedTopic?._id === id) _applyVocab(id, list); })
  ]);
  if (state.selectedTopic?._id !== id) return;
  if (state.lesson.topicId !== id || state.lesson.status !== 'ready') { showToast('Không tải được bài viết — thử lại nhé', 'error'); return; }
  if (!isWritingUnlocked(id)) {
    showToast('🔒 ' + translateGateMessage(id), 'warn', 6000);
    if (state.view === 'select') scrollToHubStep('translate');
    return;
  }
  const s = state.lesson.sections;
  const C = state.compose;
  C.phase = phase || ((s.intro.trim() && s.body1.trim()) ? 'home' : 'class');
  C.lastFocus = C.phase === 'home' ? 'body2' : 'intro';
  C.tab = 'sentences';
  C.refOpen = false;
  const url = `/task2-practice.html?${new URLSearchParams({ week: state.selectedWeek, topicId: id, write: 1 })}`;
  const hs = { view: 'compose', week: state.selectedWeek, topicId: id };
  if (opts.replace) history.replaceState(hs, '', url); else history.pushState(hs, '', url);
  state.view = 'compose';
  render();
  window.scrollTo(0, 0);
  _loadTemplates().then(() => { if (state.view === 'compose') _refreshComposeRef(); });
}

function closeCompose() {
  flushLessonSave();
  const t = state.selectedTopic;
  const back = state.compose.phase === 'home' ? 'home' : 'class';
  history.pushState({ view: 'select', week: state.selectedWeek, topicId: t._id }, '',
    `/task2-practice.html?${new URLSearchParams({ week: state.selectedWeek, topicId: t._id })}`);
  state.view = 'select';
  render();
  setTimeout(() => scrollToHubStep(back), 60);
}

function setComposePhase(p) {
  const C = state.compose;
  if (C.phase === p) return;
  C.phase = p;
  C.lastFocus = p === 'home' ? 'body2' : 'intro';
  if (p === 'home' && C.tab === 'sentences' && !state.lesson.sentences.some(s => s.en)) C.tab = 'template';
  render();
}
function setComposeTab(tab) {
  state.compose.tab = tab;
  _refreshComposeRef();
}
function toggleComposeRef() {
  state.compose.refOpen = !state.compose.refOpen;
  const el = document.getElementById('t2c-ref');
  if (el) el.classList.toggle('is-open', state.compose.refOpen);
  const ic = document.querySelector('.t2c-ref-toggle i');
  if (ic) ic.className = `fas fa-chevron-${state.compose.refOpen ? 'up' : 'down'}`;
}
function revealModelSentence(i) {
  state.compose.revealed[state.lesson.topicId + ':' + i] = true;
  _refreshComposeRef();
}

function renderCompose() {
  const t = state.selectedTopic;
  const L = state.lesson;
  const C = state.compose;
  const total = LESSON_SECTIONS.reduce((a, s) => a + _wc(L.sections[s.key]), 0);
  const filled = LESSON_SECTIONS.filter(s => (L.sections[s.key] || '').trim()).length;
  const nTrans = L.sentences.filter(s => s.en).length;
  return `
    <div class="t2c">
      <div class="t2c-top">
        <button class="t2-back-btn" onclick="closeCompose()"><i class="fas fa-arrow-left"></i> ${_escHtml(sessionLabel(t._id) || 'Buổi học')}</button>
        <div class="t2c-title" title="${_escHtml(t.topicName)}">${_escHtml(t.topicEmoji || '📝')} ${_escHtml(t.topicName)}</div>
        <div class="t2-seg" role="group" aria-label="Phần viết">
          <button type="button" class="${C.phase === 'class' ? 'active' : ''}" onclick="setComposePhase('class')">🏫 Trên lớp · MB + TB1</button>
          <button type="button" class="${C.phase === 'home' ? 'active' : ''}" onclick="setComposePhase('home')">🏠 Về nhà · TB2 + KB</button>
        </div>
        <span class="t2c-wc${total >= LESSON_MIN_WORDS ? ' is-ok' : ''}" id="t2c-total">${total} từ</span>
        <span class="t2c-save${_lessonSaveState === 'error' ? ' is-error' : ''}" id="t2c-save">${_saveStateHtml()}</span>
      </div>
      <button type="button" class="t2c-ref-toggle" onclick="toggleComposeRef()"><span>📚 Câu đã dịch (${nTrans}) · Ý tưởng · Template</span><i class="fas fa-chevron-${C.refOpen ? 'up' : 'down'}"></i></button>
      <div class="t2c-grid">
        <aside class="t2c-ref${C.refOpen ? ' is-open' : ''}" id="t2c-ref" aria-label="Tài liệu tham khảo">${renderComposeRef()}</aside>
        <main class="t2c-main">
          <details class="t2-prompt-box" ${state.promptOpen ? 'open' : ''} ontoggle="state.promptOpen=this.open">
            <summary class="t2-prompt-box-label">📋 Đề bài <span class="t2-prompt-peek">— ${_escHtml((t.prompt || '').slice(0, 70))}${(t.prompt || '').length > 70 ? '…' : ''}</span></summary>
            <p>${_escHtml(t.prompt)}</p>
          </details>
          <div class="t2cw" id="t2c-cw">${_cwHtml()}</div>
          ${_composeTplHtml()}
          ${C.phase === 'class'
            ? `<div class="t2c-tip"><b>🏫 Trên lớp:</b> viết <b>Mở bài</b> (cá nhân) rồi <b>Thân bài 1</b> (thảo luận nhóm → tự viết). Dùng câu đã dịch ở cột trái làm điểm tựa — ${_isStaffUser() ? 'bấm <b>＋</b> để chèn vào chỗ con trỏ rồi sửa cho liền mạch' : '<b>tự gõ lại</b> từng câu (không dán) để nhớ lâu hơn, rồi sửa cho liền mạch'}.</div>`
            : `<div class="t2c-tip is-home"><b>🏠 Về nhà:</b> viết <b>Thân bài 2</b> + <b>Kết bài</b> theo template trong sách (tab <b>Template</b>). Dùng ý tưởng và câu đã dịch, nhưng <b>viết bằng lời của bạn</b> — đừng chép nguyên bài mẫu.</div>`}
          ${LESSON_SECTIONS.map(renderComposeSection).join('')}
          <div class="t2c-foot">
            <span class="t2c-foot-note">Bài tự lưu khi bạn gõ. Đủ 4 phần (${filled}/4) và ≥ ${LESSON_MIN_WORDS} từ thì nộp để AI chấm.</span>
            ${t.writingTask2Id ? `<button class="t2-primary is-write" onclick="submitLessonEssay(this)" ${filled < LESSON_SECTIONS.length ? 'disabled title="Viết đủ 4 phần trước"' : ''}><i class="fas fa-paper-plane"></i> Nộp bài chấm AI</button>` : ''}
          </div>
        </main>
      </div>
    </div>`;
}

function renderComposeSection(s) {
  const C = state.compose;
  const txt = state.lesson.sections[s.key] || '';
  const active = s.phase === C.phase;
  const tpl = _templateFor(state.selectedTopic);
  const tplTitle = tpl?.sections?.[s.tplIdx]?.title || '';
  // "② Body 1 – Advantages · Ưu điểm" → "Advantages · Ưu điểm"
  const focus = (tplTitle.split(/[–-]/)[1] || '').trim();
  return `
    <section class="t2c-sec ${active ? 'is-active' : 'is-other'}">
      <div class="t2c-sec-head">
        <b>${s.label}</b>
        <span class="t2c-sec-en">${s.en}${focus && s.key.startsWith('body') ? ` · ${_escHtml(focus)}` : ''}</span>
        <span class="t2c-sec-tag ${s.phase}">${s.phase === 'class' ? 'Trên lớp' : 'Về nhà'}</span>
        <span class="t2c-sec-wc" id="t2c-wc-${s.key}">${_wc(txt)} từ</span>
      </div>
      <textarea class="t2c-ta" id="t2c-ta-${s.key}" data-key="${s.key}" rows="${active ? 8 : 3}" spellcheck="false" placeholder="${_escHtml(s.ph)}">${_escHtml(txt)}</textarea>
    </section>`;
}

function bindCompose() {
  const guard = !_isStaffUser() && window.PasteGuard;
  document.querySelectorAll('.t2c-ta').forEach(ta => {
    ta.addEventListener('input', () => _onComposeInput(ta));
    ta.addEventListener('focus', () => { state.compose.lastFocus = ta.dataset.key; });
    if (guard) window.PasteGuard.attach(ta, { hint: 'tự gõ lại câu để nhớ lâu hơn nha!' });
  });
  if (state.compose.tplOpen) renderComposeTplBody();
}

// ── "Xem template" — same panel as Task 2 practice on writing.html
// (js/writing.js renderPracticeTemplatePanel): any of the 7 essay types,
// Band 6+ / 7+, Vietnamese on/off. Opens on this topic's essay type.
// Shared module: js/shared/task2-generic-tpl.js (+ css/task2-generic-tpl.css).
function _composeTplHtml() {
  if (!window.Task2GenericTpl) return '';
  const C = state.compose;
  const t = state.selectedTopic;
  if (C.tplFor !== t._id) {
    C.tplFor = t._id;
    C.tplType = ESSAY_TYPE_ID[t.essayType] || Task2GenericTpl.guessType(t.prompt || '') || null;
  }
  if (!C.tplLevel) C.tplLevel = 'band6';
  const types = Task2GenericTpl.TYPES.map((x, i) => `
      <button type="button" class="pw-tpl-type" data-type="${x.id}" onclick="pickComposeTpl('${x.id}')">
        <span class="pw-tpl-type-no">${String(i + 1).padStart(2, '0')}</span> ${_escHtml(x.label)}
      </button>`).join('');
  return `
    <button type="button" class="t2-secondary t2c-tpl-btn${C.tplOpen ? ' is-open' : ''}" id="t2c-tpl-btn" onclick="toggleComposeTpl()">${_composeTplBtnLabel()}</button>
    <div id="pw-tpl-inline" class="pw-tpl t2c-tpl" ${C.tplOpen ? '' : 'style="display:none"'}>
      <div class="pw-tpl-ask">Chọn dạng bài bạn muốn xem template:</div>
      <div class="pw-tpl-types">${types}</div>
      <div class="pw-tpl-bar">
        <div class="pw-tpl-levels">
          <button type="button" class="pw-tpl-level" data-level="band6" onclick="setComposeTplLevel('band6')">🌱 Band 6+</button>
          <button type="button" class="pw-tpl-level" data-level="band7" onclick="setComposeTplLevel('band7')">🏆 Band 7+</button>
        </div>
        <button type="button" class="pw-tpl-vi-btn" id="pw-tpl-vi-btn" onclick="toggleComposeTplVi()"></button>
      </div>
      <div id="pw-tpl-body" class="pw-tpl-body"></div>
    </div>`;
}
function _composeTplBtnLabel() {
  return state.compose.tplOpen
    ? '<i class="fas fa-chevron-up"></i> Ẩn template'
    : '<i class="fas fa-file-lines"></i> Xem template';
}
function toggleComposeTpl() {
  const C = state.compose;
  C.tplOpen = !C.tplOpen;
  const panel = document.getElementById('pw-tpl-inline');
  const btn = document.getElementById('t2c-tpl-btn');
  if (panel) panel.style.display = C.tplOpen ? '' : 'none';
  if (btn) { btn.classList.toggle('is-open', C.tplOpen); btn.innerHTML = _composeTplBtnLabel(); }
  if (C.tplOpen) renderComposeTplBody();
}
function pickComposeTpl(typeId) {
  state.compose.tplType = typeId;
  renderComposeTplBody();
}
function setComposeTplLevel(level) {
  if (state.compose.tplLevel === level) return;
  state.compose.tplLevel = level;
  renderComposeTplBody();
}
function toggleComposeTplVi() {
  state.compose.tplVi = !state.compose.tplVi;
  _syncComposeTpl();
  Task2GenericTpl.setVi(document.getElementById('pw-tpl-body'), state.compose.tplVi);
}
function _syncComposeTpl() {
  const C = state.compose;
  document.querySelectorAll('#pw-tpl-inline .pw-tpl-type').forEach(b => b.classList.toggle('active', b.dataset.type === C.tplType));
  document.querySelectorAll('#pw-tpl-inline .pw-tpl-level').forEach(b => b.classList.toggle('active', b.dataset.level === C.tplLevel));
  const vi = document.getElementById('pw-tpl-vi-btn');
  if (vi) vi.textContent = C.tplVi ? '🇻🇳 Ẩn tiếng Việt' : '🇻🇳 Hiện tiếng Việt';
}
async function renderComposeTplBody() {
  const body = document.getElementById('pw-tpl-body');
  if (!body || !window.Task2GenericTpl) return;
  const C = state.compose;
  _syncComposeTpl();
  if (!C.tplType) { body.innerHTML = ''; return; }
  if (!window.TASK2_GENERIC_TEMPLATES) body.innerHTML = '<div class="gtpl-empty">⏳ Đang tải...</div>';
  let data = null;
  try { data = await Task2GenericTpl.load(); } catch (e) {}
  // The screen may have been re-rendered (or left) while loading.
  const cur = document.getElementById('pw-tpl-body');
  if (!cur) return;
  cur.innerHTML = data
    ? Task2GenericTpl.html(data, C.tplLevel, C.tplType, !!C.tplVi)
    : '<div class="gtpl-empty">Không tải được nội dung. Vui lòng thử lại.</div>';
}
function _onComposeInput(ta) {
  const key = ta.dataset.key;
  state.lesson.sections[key] = ta.value;
  const wc = document.getElementById('t2c-wc-' + key);
  if (wc) wc.textContent = _wc(ta.value) + ' từ';
  const total = LESSON_SECTIONS.reduce((a, s) => a + _wc(state.lesson.sections[s.key]), 0);
  const tot = document.getElementById('t2c-total');
  if (tot) { tot.textContent = total + ' từ'; tot.classList.toggle('is-ok', total >= LESSON_MIN_WORDS); }
  const btn = document.querySelector('.t2c-foot .t2-primary');
  const filled = LESSON_SECTIONS.filter(s => (state.lesson.sections[s.key] || '').trim()).length;
  if (btn) btn.disabled = filled < LESSON_SECTIONS.length;
  const note = document.querySelector('.t2c-foot-note');
  if (note) note.textContent = `Bài tự lưu khi bạn gõ. Đủ 4 phần (${filled}/4) và ≥ ${LESSON_MIN_WORDS} từ thì nộp để AI chấm.`;
  _markLessonDirty('sections');
  _cwSchedulePush();
}

// ── Left column ─────────────────────────────────────────
// Insertable snippets for the current render; the ＋ buttons index into it.
let _refItems = [];
// Staff only — students type the sentence themselves (retyping is what makes
// it stick), so for them there is no ＋ and pasting into the essay is blocked.
function _insBtn(text) {
  if (!_isStaffUser()) return '';
  _refItems.push(text);
  return `<button type="button" class="t2c-ins" title="Chèn vào chỗ con trỏ" aria-label="Chèn vào bài" onclick="insertRef(${_refItems.length - 1})">＋</button>`;
}
// questionText looks like: Dịch sang tiếng Anh (dùng từ "X"):\n\n"<câu tiếng Việt>"
function _sentenceParts(qt, full) {
  const raw = String(qt || '').trim();
  const kw = (raw.match(/dùng (?:từ|cụm từ|cấu trúc)\s*["“]([^"”]+)["”]/i) || [])[1] || '';
  const parts = raw.split(/\n\s*\n/);
  let vi = (parts.length > 1 ? parts[parts.length - 1] : raw).trim().replace(/^["“]+|["”]+$/g, '').trim();
  if (!full && vi.length > 260) vi = vi.slice(0, 257) + '…';
  return { vi, kw };
}

function renderComposeRef() {
  _refItems = [];
  const C = state.compose;
  const L = state.lesson;
  const nTrans = L.sentences.filter(s => s.en).length;
  const tabs = [
    ['sentences', 'Câu đã dịch', `${nTrans}/${L.sentences.length}`],
    ['ideas', 'Ý tưởng', ''],
    ['vocab', 'Từ vựng', ''],
    ['template', 'Template', '']
  ];
  let body;
  if (C.tab === 'ideas') body = _refIdeas();
  else if (C.tab === 'vocab') body = _refVocab();
  else if (C.tab === 'template') body = _refTemplate();
  else body = _refSentences();
  return `
    <div class="t2c-tabs" role="tablist">
      ${tabs.map(([k, label, count]) => `<button type="button" role="tab" aria-selected="${C.tab === k}" class="t2c-tab${C.tab === k ? ' active' : ''}" onclick="setComposeTab('${k}')">${label}${count ? `<span class="t2c-count">${count}</span>` : ''}</button>`).join('')}
    </div>
    <div class="t2c-ref-body" id="t2c-ref-body">${body}</div>`;
}
function _refreshComposeRef() {
  const el = document.getElementById('t2c-ref');
  if (el && state.view === 'compose') el.innerHTML = renderComposeRef();
}

const _SENT_GROUPS = [
  { type: 'paraphrase',    title: 'Paraphrase đề — dùng cho Mở bài' },
  { type: 'translation',   title: 'Câu ý chính & dẫn chứng — dùng cho Thân bài' },
  { type: 'short_writing', title: 'Câu kết — dùng cho Kết bài' }
];
// A translated conclusion ("In conclusion, …") belongs with the Kết bài group.
function _sentGroupType(s) {
  if (s.type === 'translation' && /^(in conclusion|to conclude|to sum up|in summary|overall,)/i.test(String(s.model || '').trim())) return 'short_writing';
  return s.type;
}
function _refSentences() {
  const L = state.lesson;
  if (!L.sentences.length) return '<p class="t2c-note">Đề này chưa có câu dịch. Dùng tab Ý tưởng và Template để viết nhé.</p>';
  const missing = L.sentences.filter(s => !s.en).length;
  const item = (s) => {
    const i = L.sentences.indexOf(s);
    const { vi, kw } = _sentenceParts(s.questionText);
    if (s.en) {
      return `<div class="t2c-sent">
        <div class="t2c-sent-en">${_escHtml(s.en)}</div>
        <div class="t2c-sent-vi">${_escHtml(vi)}</div>
        ${kw ? `<div class="t2c-sent-meta"><span class="t2c-kw">${_escHtml(kw)}</span></div>` : ''}
        ${_insBtn(s.en)}
      </div>`;
    }
    if (state.compose.revealed[L.topicId + ':' + i] && s.model) {
      return `<div class="t2c-sent is-model">
        <div class="t2c-sent-en">${_escHtml(s.model)}</div>
        <div class="t2c-sent-vi">${_escHtml(vi)}</div>
        <div class="t2c-sent-meta">Câu mẫu — bạn chưa tự dịch câu này</div>
        ${_insBtn(s.model)}
      </div>`;
    }
    return `<div class="t2c-sent is-todo">
      <div class="t2c-sent-vi">${_escHtml(vi)}</div>
      <div class="t2c-sent-meta">${kw ? `<span class="t2c-kw">${_escHtml(kw)}</span>` : ''}Chưa dịch${s.model ? ` · <button type="button" class="t2-link" style="padding:0;font-size:11px" onclick="revealModelSentence(${i})">Xem câu mẫu</button>` : ''}</div>
    </div>`;
  };
  return `
    <p class="t2c-note">Câu bạn đã dịch ở bước ③. ${_isStaffUser() ? 'Bấm <b>＋</b> để chèn vào ô đang viết (chỗ con trỏ)' : '<b>Tự gõ lại</b> câu vào ô đang viết — gõ tay giúp bạn nhớ lâu hơn'}, rồi chỉnh lại cho hợp đoạn văn.</p>
    ${_SENT_GROUPS.map(g => {
      const list = L.sentences.filter(s => _sentGroupType(s) === g.type);
      return list.length ? `<div class="t2c-group">${g.title}</div>${list.map(item).join('')}` : '';
    }).join('')}
    ${missing ? `<button type="button" class="t2-secondary" style="width:100%;justify-content:center;margin-top:6px" onclick="translateFromCompose(this)"><i class="fas fa-language"></i> Dịch ${missing} câu còn lại</button>` : ''}`;
}
function _refIdeas() {
  const t = state.selectedTopic;
  const sides = _ideaSides(t);
  const notes = state.brainstorm.topicId === t._id ? state.brainstorm.notes : [];
  return `
    <p class="t2-note t2c-note">Ý tưởng nhóm bạn đã ghi ở bước ② — chọn ý mạnh nhất cho mỗi đoạn thân bài.</p>
    ${sides.map((h, i) => `
      <div class="t2c-group t2-side-txt${i % 4}">${_escHtml(h.side)}</div>
      <div class="t2c-mine t2-side-c${i % 4}">${(notes[i] || '').trim() ? _escHtml(notes[i]) : '<span style="color:#9ca3af">(chưa ghi ý nào)</span>'}</div>
      ${(h.points || []).length ? `<details class="t2c-tplsec" style="margin-top:6px"><summary>Gợi ý ý chính</summary><ul class="t2-brainstorm-hint-list">${h.points.map(p => `<li>${_escHtml(p)}</li>`).join('')}</ul></details>` : ''}`).join('')}`;
}
function _refVocab() {
  const id = state.selectedTopic._id;
  const list = state.vocabFor === id ? state.vocab : [];
  if (!list.length) return '<p class="t2c-note">Chưa tải được từ vựng của buổi này.</p>';
  return `
    <p class="t2c-note">Từ vựng & collocations của buổi${_isStaffUser() ? ' — bấm <b>＋</b> để chèn' : ' — tự gõ vào bài để nhớ lâu hơn'}.</p>
    ${list.map(v => `<div class="t2c-sent" style="border-left-color:#6366f1">
      <div class="t2c-sent-en">${_escHtml(v.term)}</div>
      ${v.definitionVi ? `<div class="t2c-sent-vi">${_escHtml(v.definitionVi)}</div>` : ''}
      ${v.example ? `<div class="t2c-sent-meta" style="font-style:italic">${_escHtml(v.example)}</div>` : ''}
      ${_insBtn(v.term)}
    </div>`).join('')}`;
}
// The book's Band 6 template for this essay type: blanks shown filled (bold)
// and "(topic)" marked as the part the student must replace.
function _refTemplate() {
  if (_tplCache === null) return '<p class="t2c-note"><i class="fas fa-spinner fa-spin"></i> Đang tải template...</p>';
  const tpl = _templateFor(state.selectedTopic);
  if (!tpl || !(tpl.sections || []).length) return '<p class="t2c-note">Chưa có template cho dạng bài này.</p>';
  const C = state.compose;
  const openIdx = new Set(LESSON_SECTIONS.filter(s => s.phase === C.phase).map(s => s.tplIdx));
  const fill = (it) => {
    const ans = it.answer || (it.answers || [])[0] || '';
    return String(it.en || '').replace(/_{3,}/, ans);
  };
  const show = (it) => {
    const ans = it.answer || (it.answers || [])[0] || '';
    return _escHtml(it.en || '')
      .replace(/_{3,}/, ans ? `<b>${_escHtml(ans)}</b>` : '___')
      .replace(/\((topic|chủ đề)\)/gi, '<mark>($1)</mark>');
  };
  return `
    <p class="t2c-note">Template trong sách (${_escHtml(tpl.name)}). Thay <mark style="background:#fef3c7;color:#92400e;border-radius:4px;padding:0 3px">(topic)</mark> và ví dụ bằng nội dung của đề này — không chép nguyên văn.</p>
    ${tpl.sections.map((sec, i) => `
      <details class="t2c-tplsec" ${openIdx.has(i) ? 'open' : ''}>
        <summary>${_escHtml(sec.title)}</summary>
        ${(sec.items || []).map(it => `<div class="t2c-tpl">${show(it)}${it.vi ? `<div class="t2c-sent-vi">${_escHtml(String(it.vi).replace(/^→\s*/, ''))}</div>` : ''}${_insBtn(fill(it))}</div>`).join('')}
      </details>`).join('')}`;
}

function insertRef(i) {
  const text = _refItems[i];
  if (!text) return;
  const ta = document.getElementById('t2c-ta-' + state.compose.lastFocus);
  if (!ta) return;
  const start = ta.selectionStart ?? ta.value.length;
  const end = ta.selectionEnd ?? start;
  const before = ta.value.slice(0, start);
  const after = ta.value.slice(end);
  const pre = before && !/\s$/.test(before) ? ' ' : '';
  const post = after && !/^\s/.test(after) ? ' ' : '';
  ta.value = before + pre + text + post + after;
  const caret = (before + pre + text).length;
  ta.focus();
  ta.setSelectionRange(caret, caret);
  _onComposeInput(ta);
  if (window.innerWidth <= 900) ta.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function translateFromCompose(btn) {
  flushLessonSave();
  return startTranslate(btn);
}

// ════════════════════════════════════════════════════════
//  "MỜI BẠN VIẾT CÙNG" — live co-writing group (writer screen)
//  backend: services/task2CoWriteService.js · invites: js/shared/cowrite-invites.js
//  Each member still writes their OWN essay; the group sees everyone's
//  text live (poll every CW_POLL_MS) so they can check each other's work.
// ════════════════════════════════════════════════════════
const CW_POLL_MS = 2500;
const CW_INVITE_POLL_MS = 6000;
const CW_PUSH_DEBOUNCE_MS = 600;
let _cw = { topicId: null, room: null, rev: 0, viewing: null, collapsed: false, poll: null, pushTimer: null, pushedFor: null, ticking: false, online: null, picked: new Set() };
// Invites from classmates pop up within seconds anywhere on this page
// (on other pages they ride the 20s peer-chat poll).
document.addEventListener('DOMContentLoaded', () => {
  if (window.CowriteInvites && window.AuthService?.isLoggedIn() && window.AuthService.getRole() === 'student') {
    _cwPollEvery(() => window.CowriteInvites.check(), CW_INVITE_POLL_MS);
  }
});

function _cwPollEvery(fn, ms) {
  if (window.ActivityGate) return window.ActivityGate.poll(fn, ms);
  const id = setInterval(fn, ms);
  return { stop: () => clearInterval(id) };
}
function _cwOthers() {
  return (_cw.room?.members || []).filter(m => !m.isMe && m.status === 'joined');
}
function _cwAvatar(m) {
  return m.avatar
    ? `<img class="t2cw-av" src="${_escHtml(m.avatar)}" alt="">`
    : `<span class="t2cw-av">${_escHtml((m.name || '?').trim().charAt(0).toUpperCase())}</span>`;
}

function _cwStart() {
  if (!(window.AuthService && window.AuthService.isLoggedIn())) return;
  const id = state.selectedTopic?._id;
  if (!id) return;
  if (_cw.topicId !== id) {
    _cwStop();
    Object.assign(_cw, { topicId: id, room: null, rev: 0, viewing: null, pushedFor: null });
  }
  if (!_cw.poll) {
    _cwTick();
    _cw.poll = _cwPollEvery(_cwTick, CW_POLL_MS);
  }
}
function _cwStop() {
  if (_cw.poll) { _cw.poll.stop(); _cw.poll = null; }
  if (_cw.pushTimer) { clearTimeout(_cw.pushTimer); _cw.pushTimer = null; _cwPushNow(); }
}

async function _cwTick() {
  const id = _cw.topicId;
  if (!id || _cw.ticking || state.view !== 'compose') return;
  _cw.ticking = true;
  try {
    const d = await apiFetch(`/api/task2/cowrite/topic/${id}${_cw.room ? `?rev=${_cw.rev}` : ''}`);
    if (_cw.topicId !== id) return;
    if (d.unchanged) { _cwApplyPresence(d.presence || []); return; }
    _cw.room = d.room || null;
    _cw.rev = d.room ? d.room.rev : 0;
    // Just joined (or reopened the writer while in a group): share my text now.
    if (_cw.room && _cw.pushedFor !== _cw.room.roomId) {
      _cw.pushedFor = _cw.room.roomId;
      _cwPushNow();
    }
    _cwRender();
  } catch { /* retry next tick */ } finally {
    _cw.ticking = false;
  }
}

function _cwSchedulePush() {
  if (!_cw.room) return;
  clearTimeout(_cw.pushTimer);
  _cw.pushTimer = setTimeout(() => { _cw.pushTimer = null; _cwPushNow(); }, CW_PUSH_DEBOUNCE_MS);
}
function _cwPushNow() {
  const id = _cw.topicId;
  if (!_cw.room || !id || state.lesson.topicId !== id || state.lesson.status !== 'ready') return;
  apiFetch(`/api/task2/cowrite/topic/${id}/text`, { method: 'PUT', body: JSON.stringify({ sections: { ...state.lesson.sections } }) })
    .then(d => { if (d && d.inRoom === false && _cw.topicId === id) { _cw.room = null; _cw.rev = 0; _cwRender(); } })
    .catch(() => {});
}

// cowrite-invites.js: is this lesson's writer on screen right now?
window.T2CoWriteIsOpen = function (topicId) {
  return state.view === 'compose' && String(state.selectedTopic?._id) === String(topicId);
};

// Called by cowrite-invites.js after accepting — join in place if this
// lesson's writer is already open (otherwise it navigates here).
window.T2CoWriteJoined = function (topicId) {
  if (state.view !== 'compose' || state.selectedTopic?._id !== topicId) return false;
  _cw.rev = 0;
  _cw.pushedFor = null;
  _cw.room = null;
  _cwTick();
  showToast('Đã vào nhóm viết cùng 👥', 'success');
  return true;
};

function _cwApplyPresence(list) {
  list.forEach(p => {
    const m = (_cw.room?.members || []).find(x => String(x.userId) === String(p.userId));
    if (m) { m.online = p.online; m.typing = p.typing; }
    document.querySelectorAll(`[data-cw-uid="${p.userId}"]`).forEach(el => {
      el.classList.toggle('is-online', !!p.online);
      el.classList.toggle('is-typing', !!p.typing);
    });
  });
}

function _cwHtml() {
  const room = _cw.topicId === state.selectedTopic?._id ? _cw.room : null;
  const others = room ? _cwOthers() : [];
  const pending = room ? room.members.filter(m => m.status === 'invited') : [];
  const people = room ? room.members.filter(m => m.status === 'joined' || m.status === 'invited') : [];
  const bar = `
    <div class="t2cw-bar">
      <button type="button" class="t2cw-invite" onclick="openCowriteInvite()"><i class="fas fa-user-plus"></i> Mời bạn viết cùng</button>
      ${room ? `<div class="t2cw-people">${people.map(m => `
        <span class="t2cw-person${m.status === 'invited' ? ' is-pending' : ''}${m.online ? ' is-online' : ''}${m.typing ? ' is-typing' : ''}" data-cw-uid="${_escHtml(m.userId)}" title="${_escHtml(m.name)}${m.status === 'invited' ? ' — đang chờ trả lời' : m.isMe ? ' (bạn)' : ''}">
          ${_cwAvatar(m)}<span class="t2cw-pname">${m.isMe ? 'Bạn' : _escHtml(m.name)}</span>${m.status === 'invited' ? '<i class="fas fa-hourglass-half"></i>' : '<span class="t2cw-dot"></span>'}
        </span>`).join('')}</div>
        <button type="button" class="t2-link t2cw-leave" onclick="leaveCowrite()">Rời nhóm</button>`
      : '<span class="t2cw-hint">Mời bạn đang online vào nhóm — cả nhóm thấy bài của nhau theo thời gian thực để kiểm tra chéo.</span>'}
    </div>`;
  if (!room) return bar;
  if (!others.length) {
    return bar + `<p class="t2cw-wait">${pending.length ? '⏳ Đang chờ bạn nhận lời mời… ' : ''}Khi có bạn vào nhóm, bài của bạn ấy sẽ hiện ở đây và cập nhật ngay khi bạn ấy gõ.</p>`;
  }
  if (!others.some(m => String(m.userId) === String(_cw.viewing))) _cw.viewing = String(others[0].userId);
  return bar + `<div class="t2cw-live${_cw.collapsed ? ' is-collapsed' : ''}">${_cwLiveHtml(others)}</div>`;
}

function _cwLiveHtml(others) {
  const m = others.find(x => String(x.userId) === String(_cw.viewing)) || others[0];
  const s = m.sections || {};
  const words = (o) => LESSON_SECTIONS.reduce((a, x) => a + _wc((o.sections || {})[x.key]), 0);
  const phase = state.compose.phase;
  return `
    <div class="t2cw-live-head">
      <span class="t2cw-live-title"><span class="t2cw-live-pulse"></span> Bài của bạn cùng nhóm</span>
      <div class="t2cw-tabs" role="tablist">${others.map(o => `
        <button type="button" role="tab" aria-selected="${o === m}" class="t2cw-tab${o === m ? ' active' : ''}${o.online ? ' is-online' : ''}${o.typing ? ' is-typing' : ''}" data-cw-uid="${_escHtml(o.userId)}" onclick="viewCowriteMember('${_escHtml(o.userId)}')">
          <span class="t2cw-dot"></span>${_escHtml(o.name)}<span class="t2cw-tab-wc">${words(o)} từ</span>
        </button>`).join('')}</div>
      <button type="button" class="t2cw-collapse" onclick="toggleCowriteLive()" aria-label="${_cw.collapsed ? 'Mở' : 'Thu gọn'}"><i class="fas fa-chevron-${_cw.collapsed ? 'down' : 'up'}"></i></button>
    </div>
    <div class="t2cw-view" id="t2cw-view">
      <div class="t2cw-meta${m.typing ? ' is-typing' : ''}" data-cw-uid="${_escHtml(m.userId)}">${_escHtml(m.name)} · ${words(m)} từ <span class="t2cw-typing-note">đang gõ…</span></div>
      ${LESSON_SECTIONS.map(x => `
        <div class="t2cw-sec${x.phase === phase ? '' : ' is-other'}">
          <div class="t2cw-sec-head"><b>${x.label}</b> <span>${_wc(s[x.key])} từ</span></div>
          ${(s[x.key] || '').trim() ? `<div class="t2cw-text">${_escHtml(s[x.key])}</div>` : '<div class="t2cw-text is-empty">(chưa viết)</div>'}
        </div>`).join('')}
    </div>`;
}

// Re-render only the group block — the student's own textareas are never
// touched, and the friend's text keeps its scroll position.
function _cwRender() {
  const el = document.getElementById('t2c-cw');
  if (!el || state.view !== 'compose') return;
  const view = document.getElementById('t2cw-view');
  const top = view ? view.scrollTop : 0;
  el.innerHTML = _cwHtml();
  const nv = document.getElementById('t2cw-view');
  if (nv) nv.scrollTop = top;
}
function viewCowriteMember(uid) {
  _cw.viewing = String(uid);
  _cwRender();
}
function toggleCowriteLive() {
  _cw.collapsed = !_cw.collapsed;
  _cwRender();
}

function leaveCowrite() {
  const id = _cw.topicId;
  askT2Quit(async () => {
    try {
      await apiFetch(`/api/task2/cowrite/topic/${id}/leave`, { method: 'POST' });
      if (_cw.topicId === id) { _cw.room = null; _cw.rev = 0; _cw.pushedFor = null; _cwRender(); }
    } catch { showToast('Chưa rời nhóm được — thử lại nhé', 'error'); }
  }, {
    mascot: '👥', title: 'Rời nhóm viết cùng?',
    sub: 'Bài của bạn vẫn được lưu bình thường — chỉ là cả nhóm sẽ không thấy bài của nhau nữa.',
    confirmText: 'Rời nhóm', continueText: 'Ở lại'
  });
}

// ── Invite picker (online students, classmates first) ───────
async function openCowriteInvite() {
  const t = state.selectedTopic;
  if (!t) return;
  let ov = document.getElementById('t2cw-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 't2cw-overlay';
    ov.className = 't2-tg-overlay';
    ov.addEventListener('click', e => { if (e.target === ov) closeCowriteInvite(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('is-open')) closeCowriteInvite(); });
    document.body.appendChild(ov);
  }
  _cw.picked = new Set();
  _cw.online = null;
  ov.innerHTML = `
    <div class="t2-tg-modal t2cw-modal" role="dialog" aria-modal="true" aria-labelledby="t2cw-title">
      <div class="t2cw-mhead">
        <div style="min-width:0">
          <h3 id="t2cw-title">👥 Mời bạn viết cùng</h3>
          <div class="t2cw-msub">${_escHtml(t.topicEmoji || '📝')} ${_escHtml(t.topicName)} — các bạn đang online</div>
        </div>
        <button class="t2-hist-close" onclick="closeCowriteInvite()" aria-label="Đóng"><i class="fas fa-times"></i></button>
      </div>
      <div class="t2cw-mbody">
        <input type="search" class="t2cw-search" id="t2cw-search" placeholder="Tìm tên bạn..." oninput="_cwRenderOnline()" autocomplete="off">
        <div class="t2cw-list" id="t2cw-list"><div class="t2cw-empty"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div></div>
      </div>
      <div class="t2cw-mfoot">
        <span class="t2cw-mnote">Mỗi bạn vẫn viết bài của riêng mình — cả nhóm thấy bài nhau theo thời gian thực.</span>
        <button type="button" class="t2-primary" id="t2cw-send" onclick="sendCowriteInvites(this)" disabled><i class="fas fa-paper-plane"></i> Gửi lời mời</button>
      </div>
    </div>`;
  ov.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  try {
    const d = await apiFetch(`/api/task2/cowrite/online/${t._id}`);
    _cw.online = d.students || [];
  } catch {
    _cw.online = null;
    const list = document.getElementById('t2cw-list');
    if (list) list.innerHTML = '<div class="t2cw-empty">Không tải được danh sách — thử lại nhé.</div>';
    return;
  }
  _cwRenderOnline();
  document.getElementById('t2cw-search')?.focus();
}
function closeCowriteInvite() {
  const ov = document.getElementById('t2cw-overlay');
  if (ov) ov.classList.remove('is-open');
  document.body.style.overflow = '';
}
function _cwRenderOnline() {
  const list = document.getElementById('t2cw-list');
  if (!list || !_cw.online) return;
  const q = (document.getElementById('t2cw-search')?.value || '').trim().toLowerCase();
  const rows = _cw.online.filter(u => !q || u.name.toLowerCase().includes(q));
  if (!_cw.online.length) { list.innerHTML = '<div class="t2cw-empty">😴 Chưa có bạn nào online lúc này.</div>'; return; }
  if (!rows.length) { list.innerHTML = '<div class="t2cw-empty">Không tìm thấy bạn nào.</div>'; return; }
  list.innerHTML = rows.map(u => {
    const id = String(u._id);
    const done = u.inRoom === 'joined';
    const waiting = u.inRoom === 'invited';
    return `<label class="t2cw-row${done ? ' is-done' : ''}">
      <input type="checkbox" ${done ? 'disabled checked' : ''} ${_cw.picked.has(id) ? 'checked' : ''} onchange="_cwPick('${_escHtml(id)}', this.checked)">
      ${_cwAvatar(u)}
      <span class="t2cw-row-name">${_escHtml(u.name)}${u.classmate ? '<span class="t2cw-badge">Cùng lớp</span>' : ''}</span>
      <span class="t2cw-row-state">${done ? 'Đã trong nhóm' : waiting ? 'Đã mời' : '<span class="t2cw-dot"></span> Online'}</span>
    </label>`;
  }).join('');
}
function _cwPick(id, on) {
  if (on) _cw.picked.add(id); else _cw.picked.delete(id);
  const btn = document.getElementById('t2cw-send');
  if (btn) {
    btn.disabled = !_cw.picked.size;
    btn.innerHTML = `<i class="fas fa-paper-plane"></i> Gửi lời mời${_cw.picked.size ? ` (${_cw.picked.size})` : ''}`;
  }
}
function sendCowriteInvites(btn) {
  const t = state.selectedTopic;
  if (!t || !_cw.picked.size) return;
  return _withBusy(btn, async () => {
    try {
      const d = await apiFetch('/api/task2/cowrite/invite', { method: 'POST', body: JSON.stringify({ topicId: t._id, userIds: [..._cw.picked] }) });
      const n = (d.invited || []).length;
      const full = (d.skipped || []).filter(x => x.reason === 'full').length;
      if (n) showToast(`Đã gửi lời mời cho ${n} bạn — chờ các bạn nhận lời nhé`, 'success', 4000);
      if (full) showToast(`Nhóm tối đa ${d.room?.maxMembers || 8} người — ${full} bạn chưa được mời`, 'warn', 5000);
      if (!n && !full) showToast('Các bạn này đã được mời rồi', 'info');
      if (d.room && _cw.topicId === t._id) {
        _cw.room = d.room;
        _cw.rev = d.room.rev;
        if (_cw.pushedFor !== d.room.roomId) { _cw.pushedFor = d.room.roomId; _cwPushNow(); }
        _cwRender();
      }
      closeCowriteInvite();
    } catch (e) {
      showToast(e.message || 'Chưa gửi được lời mời', 'error');
    }
  });
}

// Hand the finished essay to writing.html's Task 2 flow for AI grading: seed
// its practice autosave for this prompt (same shape savePracticeToStorage()
// writes) so the editor opens pre-filled, then go.
function submitLessonEssay(btn) {
  const t = state.selectedTopic;
  const L = state.lesson;
  if (!t || L.topicId !== t._id || L.status !== 'ready') return;
  const missing = LESSON_SECTIONS.filter(s => !(L.sections[s.key] || '').trim());
  if (missing.length) { showToast('Còn thiếu: ' + missing.map(s => s.label).join(', '), 'warn', 5000); return; }
  if (!t.writingTask2Id) { showToast('Đề này chưa có bản chấm AI — hãy nộp bài cho giáo viên.', 'info', 5000); return; }
  const essay = LESSON_SECTIONS.map(s => L.sections[s.key].trim()).join('\n\n');
  const words = _wc(essay);
  const go = () => _withBusy(btn, async () => {
    _lessonDirty.topicId = t._id;
    _lessonDirty.sections = true;
    await flushLessonSave({ extra: { submitted: true } });
    L.submittedAt = new Date().toISOString();
    _bumpLessonProgress(t._id);
    try {
      localStorage.setItem(`ews_practice_autosave:2:${t.writingTask2Id}`, JSON.stringify({
        taskType: 2, task: { _id: t.writingTask2Id, prompt: t.prompt },
        answer: essay, wordCount: words, seconds: 0, savedAt: Date.now()
      }));
    } catch {}
    window.location.href = `/writing.html?taskType=2&taskId=${encodeURIComponent(t.writingTask2Id)}`;
  });
  if (words < LESSON_MIN_WORDS) {
    askT2Quit(go, {
      mascot: '📝', title: 'Bài hơi ngắn',
      sub: `Bài mới có ${words} từ — đề yêu cầu ít nhất ${LESSON_MIN_WORDS} từ. Vẫn nộp để chấm?`,
      confirmText: 'Vẫn nộp', continueText: 'Viết thêm'
    });
  } else go();
}

function renderVocabStep(isCurrent) {
  const id = state.selectedTopic._id;
  const done = isVocabLearned(id);
  const vs = _vocabStats(id);
  const loaded = state.vocabFor === id;
  const list = loaded ? state.vocab : [];
  const open = state.vocabOpen ?? !done;
  const loggedIn = window.AuthService && window.AuthService.isLoggedIn();
  let body;
  if (!loaded) {
    body = !loggedIn
      ? `<div class="t2-lock-note"><i class="fas fa-user-lock"></i> Đăng nhập để học từ vựng của chủ đề này.</div>`
      : state.vocabError
        ? `<div class="t2-lock-note"><i class="fas fa-exclamation-circle"></i> Không tải được từ vựng. <button class="t2-link" onclick="retryVocab()">Thử lại</button></div>`
        : `<p class="t2-step-desc"><i class="fas fa-spinner fa-spin"></i> Đang tải từ vựng...</p>`;
  } else if (!list.length) {
    body = `<p class="t2-step-desc">Chủ đề này chưa có danh sách từ vựng — bạn có thể sang bước Luyện câu luôn.</p>`;
  } else if (state.vocabQuiz) {
    body = renderVocabQuiz();
  } else {
    const savedSet = _savedTermsForTopic(id);
    const quizBest = _vquizBest[id];
    const passed = isVocabQuizPassed(id);
    const canQuiz = _vquizPossible(list);
    body = `
      <div class="t2-vtasks">
        <div class="t2-vtask${done ? ' ok' : ''}"><span class="t2-vtask-ic">${done ? '<i class="fas fa-check"></i>' : '1'}</span>Lưu tất cả từ vào sổ <b>${vs.saved}/${vs.total}</b></div>
        <div class="t2-vtask${passed ? ' ok' : ''}"><span class="t2-vtask-ic">${passed ? '<i class="fas fa-check"></i>' : '2'}</span>Làm quiz từ vựng đạt <b>≥ ${VQUIZ_PASS}%</b>${quizBest != null ? ` <span class="t2-vtask-best${passed ? ' ok' : ''}">cao nhất ${quizBest}%</span>` : ''}</div>
      </div>
      <div class="t2-meter${done ? ' ok' : ''}"><span style="width:${vs.pct}%"></span></div>
      <div class="t2-actions">
        ${done ? '' : `<button class="t2-primary" onclick="saveAllVocabToBook()"><i class="fas fa-save"></i> Lưu tất cả vào sổ</button>`}
        ${canQuiz ? `<button class="${done && !passed ? 't2-primary' : 't2-secondary'}" onclick="startVocabQuiz()"><i class="fas fa-bolt"></i> ${passed ? 'Làm lại quiz' : quizBest != null ? 'Làm quiz lại' : 'Làm quiz từ vựng'}</button>` : ''}
        <button class="t2-link" onclick="toggleVocabList()" style="margin-left:auto">${open ? 'Thu gọn' : `Xem ${list.length} từ`} <i class="fas fa-chevron-${open ? 'up' : 'down'}"></i></button>
      </div>
      ${open ? `<div class="t2-vlist">
        ${list.map((v, i) => {
          const saved = savedSet.has(v.term);
          return `
          <div class="t2-vitem${saved ? ' is-saved' : ''}">
            <div class="t2-vitem-main">
              <div class="t2-vitem-term">${_escHtml(v.term)}<button class="t2-speak" onclick="speakVocab(${i})" title="Nghe phát âm" aria-label="Nghe phát âm"><i class="fas fa-volume-up"></i></button></div>
              ${v.definitionVi ? `<div class="t2-vitem-def">${_escHtml(v.definitionVi)}</div>` : ''}
              ${v.example ? `<div class="t2-vitem-ex">${_markTermHtml(v.example, v.term)}</div>` : ''}
            </div>
            <button class="t2-vbtn${saved ? ' saved' : ''}" onclick="saveOneVocabToBook(${i})" ${saved ? 'disabled title="Đã lưu"' : 'title="Lưu vào sổ"'}><i class="fas fa-${saved ? 'check' : 'plus'}"></i></button>
          </div>`;
        }).join('')}
      </div>` : ''}`;
  }
  return `
    <section class="t2-step t2-s-vocab${isCurrent ? ' is-current' : ''}" id="t2-step-vocab">
      ${_stepHead(1, 'Từ vựng &amp; collocations', `${vs.total ? `<span class="t2-step-tag${done ? ' ok' : ''}">${vs.saved}/${vs.total} đã lưu</span>` : ''}${_infoBtn('vocab')}`, isVocabStepDone(id))}
      ${_infoBody('vocab', `<ol class="t2-info-list">
        <li><b>Nghe</b> 🔊 và đọc to từng cụm.</li>
        <li><b>Đọc câu ví dụ</b> — cụm được tô màu: để ý từ đi kèm (collocation) và cách dùng trong câu.</li>
        <li><b>Lưu vào sổ</b> để ôn lại sau.</li>
        <li><b>Làm quiz ≥ ${VQUIZ_PASS}%</b> (có câu điền cụm vào câu ví dụ) để mở khoá các bước sau. Sai thì xem lại câu ví dụ rồi làm lại.</li>
      </ol>`)}
      ${body}
    </section>`;
}
// Escapes `text` and wraps the first match of `term` (allowing -s/-ed/-ing
// endings on each word) in <mark class="t2-key">.
function _termRegex(term) {
  const words = String(term || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return new RegExp('(^|[^A-Za-z])(' + words.map(w => _reEsc(w) + '(?:s|es|d|ed|ing)?').join('\\s+') + ')(?![A-Za-z])', 'i');
}
function _markTermHtml(text, term) {
  const re = _termRegex(term);
  const m = re && re.exec(text);
  if (!m) return _escHtml(text);
  const s = m.index + m[1].length, e = s + m[2].length;
  return _escHtml(text.slice(0, s)) + `<mark class="t2-key">${_escHtml(text.slice(s, e))}</mark>` + _escHtml(text.slice(e));
}
function _reEsc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function renderExamStep() {
  return `
    <section class="t2-step" id="t2-step-exam">
      <div class="t2-step-head">
        <span class="t2-step-num is-alt"><i class="fas fa-clipboard-check"></i></span>
        <div class="t2-step-title">Thi thử cả tuần <span class="t2-opt-tag">tuỳ chọn</span></div>
        ${_infoBtn('exam')}
      </div>
      ${_infoBody('exam', `<p class="t2-step-desc" style="margin:0">Câu hỏi ngẫu nhiên từ các chủ đề của Tuần ${state.selectedWeek}, tính giờ 2 phút/câu, không có gợi ý.</p>`)}
      <div class="t2-actions">
        <div class="t2-seg" role="group" aria-label="Số câu">
          ${[10, 15, 20].map(n => `<button type="button" class="${state.examCount === n ? 'active' : ''}" onclick="setExamCount(${n}, this)">${n} câu</button>`).join('')}
        </div>
        <button class="t2-secondary" onclick="startExam(this)"><i class="fas fa-play"></i> Bắt đầu thi</button>
      </div>
    </section>`;
}

function bindSelect() {
  const id = state.selectedTopic?._id;
  if (id && state.vocabFor !== id && !state.vocabError && window.AuthService.isLoggedIn()) _ensureVocab(id);
  if (id && window.AuthService.isLoggedIn()) loadLesson(id);
  if (_guideCache === null && window.AuthService.isLoggedIn()) _loadGuides().then(() => _refreshHubStep('guide'));
  if (_hubFocus) {
    const k = _hubFocus; _hubFocus = null;
    setTimeout(() => scrollToHubStep(k), 60);
  }
  _luluSync();
}

function scrollToHubStep(key) {
  const el = document.getElementById('t2-step-' + key);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Re-render just the vocab card (quiz clicks, list toggle) — keeps the rest
// of the hub (brainstorm textareas, scroll position) untouched.
function _refreshVocabStep() {
  const el = document.getElementById('t2-step-vocab');
  if (!el || state.view !== 'select') return;
  el.outerHTML = renderVocabStep(el.classList.contains('is-current'));
  _luluSync();
}

function toggleVocabList() {
  const id = state.selectedTopic?._id;
  const open = state.vocabOpen ?? !isVocabLearned(id);
  state.vocabOpen = !open;
  _refreshVocabStep();
}

function backToHub() {
  state.currentMode = 'practice';
  state.view = 'select';
  render();
  window.scrollTo(0, 0);
}

// "Viết bài ngay" — hand the student straight into the full Task 2 essay
// practice flow (writing.html), for THIS topic's prompt. That page reuses
// its own AI grading / draft / history machinery via ?taskType=2&taskId=.
// Only shown when the topic has been linked to a WritingTask2
// (scripts/seedTask2TopicEssays.js).
function goWriteFullEssay() {
  const topic = state.selectedTopic;
  const id = topic?.writingTask2Id;
  if (!id) { showToast('Chủ đề này chưa có đề luyện viết bài đầy đủ.', 'error'); return; }

  const gate = canWriteFullEssay(topic._id);
  if (!gate.ok) {
    showToast('🔒 Chưa mở khoá "Viết bài ngay". ' + writeGateMessage(gate), 'warn', 8000);
    if (state.view === 'select') scrollToHubStep('translate');
    return;
  }
  window.location.href = `/writing.html?taskType=2&taskId=${encodeURIComponent(id)}`;
}
function setExamCount(n, btn) {
  state.examCount = n;
  if (btn && btn.parentElement) btn.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
}
function toggleT2Pref(key, btn) {
  state[key] = !state[key];
  if (btn) btn.classList.toggle('on', state[key]);
  try { localStorage.setItem(T2_PREFS_KEY, JSON.stringify({ autoNext: state.autoNext, shuffleMode: state.shuffleMode })); } catch {}
}

// Disables `btn` with a spinner while `fn` runs. The button may be gone by
// the time fn resolves (render() swapped the DOM) — only restore it if not.
async function _withBusy(btn, fn) {
  if (btn && btn.disabled) return;
  const html = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...'; }
  try { return await fn(); }
  finally { if (btn && btn.isConnected) { btn.disabled = false; btn.innerHTML = html; } }
}

// ════════════════════════════════════════════════════════
//  PRACTICE MODE
// ════════════════════════════════════════════════════════
function startPractice(btn) { return _withBusy(btn, () => _startPractice()); }
// Step ③ "Dịch câu": only the sentence-building questions (translation /
// paraphrase / short_writing). Once some are done, "Dịch tiếp" runs just the
// ones still untranslated.
function startTranslate(btn) { return _withBusy(btn, () => _startPractice({ translateOnly: true })); }
async function _startPractice(opts = {}) {
  if (!isStepUnlocked(state.selectedTopic?._id)) {
    showToast(`Bạn cần lưu hết từ vựng và đạt quiz từ vựng ≥ ${VQUIZ_PASS}% trước khi luyện câu`, 'warn', 4000);
    if (state.view === 'select') scrollToHubStep('vocab');
    return;
  }
  try {
    const params = new URLSearchParams({ level: state.selectedLevel });
    const data = await apiFetch(`/api/task2/questions/topic/${state.selectedTopic._id}?${params}`);
    if (!data.questions?.length) { showToast('Chưa có câu hỏi ở level này', 'warn'); return; }
    let questions = data.questions;
    _assignDrillModes(questions);
    if (opts.translateOnly) {
      questions = questions.filter(q => WBW_TYPES.has(q.type));
      const L = _lessonFor(state.selectedTopic._id);
      // The lesson's own list drops sentences asked twice (same model answer).
      if (L && L.status === 'ready' && L.sentences.length) {
        const ids = new Set(L.sentences.map(s => s.questionId));
        const kept = questions.filter(q => ids.has(q.questionId || q._id) || ids.has(q._id));
        if (kept.length) questions = kept;
      }
      // Translated right already → skip; untranslated and wrong ones come up.
      const doneIds = new Set((L ? L.sentences : []).filter(s => s.en && s.isCorrect).map(s => s.questionId));
      const missing = questions.filter(q => !doneIds.has(q.questionId || q._id) && !doneIds.has(q._id));
      if (missing.length && missing.length < questions.length) questions = missing;
      if (!questions.length) { showToast('Buổi này chưa có câu dịch', 'warn'); return; }
    }
    state.questions = questions;
    state.translateOnly = !!opts.translateOnly;
    if (state.shuffleMode) shuffle(state.questions);
    state.currentMode = 'practice';
    state.currentIdx = 0;
    state.sessionDone = 0; state.sessionCorrect = 0; state.sessionAttempts = [];
    state.mcSelected = null; state.rearrangeAnswer = [];
    state.questionStatus = new Array(state.questions.length).fill('pending');
    // No dedicated 'practice' history entry — push a fresh 'select' checkpoint
    // instead so browser Back pops straight to the topic hub (handled by the
    // existing popstate case) rather than skipping past it to 'topics'.
    history.pushState({ view: 'select', week: state.selectedWeek, topicId: state.selectedTopic._id }, '', location.href);
    state.view = 'practice';
    render();
    window.scrollTo(0, 0);
  } catch { showToast('Lỗi tải câu hỏi', 'error'); }
}

function startRetryWrong(btn) { return _withBusy(btn, _startRetryWrong); }
async function _startRetryWrong() {
  try {
    const params = new URLSearchParams({ level: 'all' });
    const data = await apiFetch(`/api/task2/questions/topic/${state.selectedTopic._id}?${params}`);
    if (!data.questions?.length) { showToast('Chưa có câu hỏi', 'warn'); return; }
    _assignDrillModes(data.questions);
    const wrongSet = new Set(state.wrongQuestionIds);
    const wrongQuestions = data.questions.filter(q => wrongSet.has(q._id) || wrongSet.has(q.questionId));
    if (!wrongQuestions.length) { showToast('Không có câu sai nào', 'info'); return; }
    state.questions = wrongQuestions;
    if (state.shuffleMode) shuffle(state.questions);
    state.currentMode = 'retry';
    state.translateOnly = false;
    state.currentIdx = 0;
    state.sessionDone = 0; state.sessionCorrect = 0; state.sessionAttempts = [];
    state.mcSelected = null; state.rearrangeAnswer = [];
    state.questionStatus = new Array(wrongQuestions.length).fill('pending');
    history.pushState({ view: 'select', week: state.selectedWeek, topicId: state.selectedTopic._id }, '', location.href);
    state.view = 'practice';
    render();
    window.scrollTo(0, 0);
  } catch { showToast('Lỗi tải câu hỏi', 'error'); }
}

// ════════════════════════════════════════════════════════
//  DRAFT — SAVE / RESUME
// ════════════════════════════════════════════════════════
let _t2DraftSaveFailCount = 0;
async function saveDraft() {
  if (!window.AuthService.isLoggedIn() || !state.selectedTopic?._id || !state.questions.length) return;
  try {
    await apiFetch('/api/task2/draft', {
      method: 'POST',
      body: JSON.stringify({
        topicId:        state.selectedTopic._id,
        topicName:      state.selectedTopic.topicName,
        week:           state.selectedWeek,
        level:          state.selectedLevel,
        mode:           state.currentMode,
        // Prefer stable admin-set questionId over auto-generated MongoDB _id which can
        // change when an admin re-saves the topic (array replacement regenerates _id).
        questionIds:    state.questions.map(q => q.questionId || q._id),
        currentIdx:     state.sessionDone,
        sessionAttempts:state.sessionAttempts,
        questionStatus: state.questionStatus,
        sessionDone:    state.sessionDone,
        sessionCorrect: state.sessionCorrect
      })
    });
    _t2DraftSaveFailCount = 0;
  } catch {
    // Autosave chạy thường xuyên — chỉ báo lỗi khi thất bại liên tiếp để tránh làm phiền,
    // nhưng không còn thất bại hoàn toàn trong im lặng như trước.
    _t2DraftSaveFailCount++;
    if (_t2DraftSaveFailCount === 3) {
      showToast('Không lưu được tiến độ bài viết lên server. Kiểm tra kết nối mạng.', 'warn');
    }
  }
}

async function resumeSession() {
  const btn = document.querySelector('.t2-resume-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...'; }
  try {
    const draft = state.draft;
    if (!draft) return;
    const data = await apiFetch(`/api/task2/questions/topic/${state.selectedTopic._id}?level=all`);
    if (!data.questions?.length) { showToast('Không thể tải câu hỏi', 'error'); return; }
    _assignDrillModes(data.questions);
    // Map both stable questionId and MongoDB _id so old and new drafts both work
    const qMap = {};
    data.questions.forEach(q => {
      if (q._id)        qMap[String(q._id)] = q;
      if (q.questionId) qMap[q.questionId]  = q;
    });
    const restoredQuestions = (draft.questionIds || []).map(id => qMap[id]).filter(Boolean);
    if (!restoredQuestions.length) {
      // Don't delete — questions may have been updated by admin; just show a non-destructive warning
      showToast('Câu hỏi đã được cập nhật, không thể khôi phục phiên cũ. Hãy bắt đầu mới.', 'warn', 4000);
      return;
    }
    state.questions       = restoredQuestions;
    state.currentMode     = draft.mode  || 'practice';
    state.translateOnly   = false;
    state.sessionAttempts = draft.sessionAttempts || [];
    state.questionStatus  = draft.questionStatus  || new Array(restoredQuestions.length).fill('pending');
    state.sessionDone     = draft.sessionDone     || 0;
    state.sessionCorrect  = draft.sessionCorrect  || 0;
    state.mcSelected      = null;
    state.rearrangeAnswer = [];

    // Cap currentIdx to the restored question count to prevent skipping past the end
    // Use draft.sessionDone as the pointer (number of questions already answered)
    state.currentIdx = Math.min(draft.currentIdx || draft.sessionDone || 0, restoredQuestions.length);

    // Check completion against original draft totals, not the (possibly smaller) restored count
    const allAnswered = draft.sessionDone >= (draft.questionIds?.length || restoredQuestions.length);
    if (allAnswered && state.sessionDone > 0) {
      state.view = 'done';
      render();
      savePracticeAttempt();
    } else {
      state.view = 'practice';
      render();
    }
  } catch {
    showToast('Lỗi khôi phục tiến độ', 'error');
  } finally {
    // If render() replaced the DOM, querySelector returns null — safe no-op
    const b = document.querySelector('.t2-resume-btn');
    if (b) { b.disabled = false; b.innerHTML = '<i class="fas fa-play"></i> Tiếp tục'; }
  }
}

function _clearDraftState() {
  const topicId = state.selectedTopic?._id?.toString();
  state.draft = null;
  if (topicId) state.allDrafts = state.allDrafts.filter(d => d.topicId?.toString() !== topicId);
  apiFetch(`/api/task2/draft/${topicId}`, { method: 'DELETE' }).catch(() => {});
  render();
}

async function dismissDraft() {
  _clearDraftState();
}

function renderPractice() {
  const q = state.questions[state.currentIdx];
  if (!q) return renderDone();
  const topic = state.selectedTopic;
  // (currentIdx+1) to match the "N/total" text — otherwise the bar always
  // lags one question behind (0% on question 1, never 100% until done).
  const pct = Math.round(((state.currentIdx + 1) / state.questions.length) * 100);
  return `
    <div class="t2-prac-head">
      <button class="t2-back-btn" onclick="quitPractice()"><i class="fas fa-times"></i> Thoát</button>
      <div class="t2-prac-ctx">
        <span class="t2-ctx-week">${sessionLabel(topic._id) || `Tuần ${state.selectedWeek}`}</span>
        <span class="t2-ctx-name" title="${_escHtml(topic.topicName)}">${_escHtml(topic.topicEmoji || '')} ${_escHtml(topic.topicName)}</span>
      </div>
      ${state.currentMode === 'retry'
        ? `<span style="background:#fef3c7;color:#92400e;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase">Ôn câu sai</span>`
        : state.translateOnly
          ? `<span style="background:#eef2ff;color:#4338ca;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase">③ Dịch câu</span>`
          : `<span class="${ESSAY_BADGE_CLASS[topic.essayType] || 'et-badge'}" style="font-size:10px">${ESSAY_LABELS[topic.essayType] || ''}</span>`}
    </div>
    <details class="t2-prompt-box" ${state.promptOpen ? 'open' : ''} ontoggle="state.promptOpen=this.open">
      <summary class="t2-prompt-box-label">📋 Đề bài <span class="t2-prompt-peek">— ${_escHtml((topic.prompt || '').slice(0, 70))}${(topic.prompt || '').length > 70 ? '…' : ''}</span></summary>
      <p>${_escHtml(topic.prompt)}</p>
    </details>
    <div class="wp-progress-bar-wrap"><div class="wp-progress-bar" style="width:${pct}%"></div></div>
    <div class="t2-q-dots" id="q-dots">
      ${state.questions.map((q, i) => {
        const st = (state.questionStatus || [])[i] || 'pending';
        return `<span class="t2-q-dot ${st === 'correct' ? 't2-dot-ok' : st === 'wrong' ? 't2-dot-err' : i === state.currentIdx ? 't2-dot-current' : ''}" data-qi="${i}" title="Câu ${i+1}" onclick="goToQuestion(${i})"></span>`;
      }).join('')}
    </div>
    <div class="wp-exercise-meta" style="padding:8px 20px">
      <span class="wp-ex-counter">${state.currentIdx + 1} / ${state.questions.length}</span>
      <span style="color:${LEVEL_COLORS[q.level]||'#6b7280'};font-size:12px;font-weight:700;text-transform:uppercase">${q.level}</span>
      ${_drillMode(q) ? _modeBadge(_drillMode(q)) : `<span class="wp-type-tag">${Q_LABELS[q.type] || q.type}</span>`}
      ${q._isRepeat ? '<span class="wp-type-tag" style="background:#fef3c7;color:#92400e">🔁 Làm lại</span>' : ''}
    </div>
    <div class="wp-card" style="margin:0 20px" id="qcard">
      ${renderQuestion(q)}
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="wp-submit-btn" id="submit-btn" onclick="submitPractice()" style="flex:1" disabled>
          <i class="fas fa-check"></i> Kiểm tra
        </button>
      </div>
    </div>
    <div class="wp-feedback-card hidden" id="feedback-card" style="margin:12px 20px">
      <div class="wp-result-banner" id="result-banner"></div>
      <div id="comparison-box">
        <div class="wp-cmp-row wp-cmp-student"><span class="wp-cmp-label">📝 Câu của bạn:</span><span id="student-answer-display" class="wp-cmp-text"></span></div>
        <div class="wp-cmp-row wp-cmp-sample" id="model-answer-row"><span class="wp-cmp-label">✅ Đáp án mẫu:</span><span id="model-answer-display" class="wp-cmp-text"></span></div>
      </div>
      <div class="t2-explanation hidden" id="explanation-box">
        <div class="t2-exp-title">💡 Giải thích</div>
        <div class="t2-exp-body" id="explanation-text"></div>
      </div>
      <div class="wp-feedback hidden" id="feedback-text"></div>
      <button class="wp-next-btn" id="t2-next-btn" onclick="nextPractice()">
        Câu tiếp theo <i class="fas fa-arrow-right"></i>
        <span style="font-size:10px;opacity:.55;margin-left:4px;font-weight:400">Enter ↵</span>
      </button>
      <div id="t2-countdown-bar" style="display:none"></div>
    </div>
    <div class="wp-checking-loader hidden" id="checking-loader" style="margin:0 20px">
      <div class="wp-spinner"></div><p id="checking-loader-text">Đang chấm bài...</p>
    </div>`;
}

function renderQuestion(q) {
  const typeLbl = Q_LABELS[q.type] || q.type;
  const structureHint = q.sentenceStructure
    ? `<div class="t2-structure-hint"><span class="t2-structure-hint-label">💡 Gợi ý:</span><span>${_escHtml(q.sentenceStructure)}</span></div>`
    : '';
  // Keyword hints shown for every question that has them (không giấu sau nút
  // gợi ý nữa) — the MCQ types carry none so this stays empty there.
  const kw = q.fallbackKeywords && q.fallbackKeywords.length ? q.fallbackKeywords
    : (q.hints && q.hints.length ? q.hints : []);
  const keywordRow = kw.length
    ? `<div class="t2-kw-row"><span class="t2-kw-label">🔑 Từ khóa</span>${kw.map(w => `<span class="t2-kw-chip">${_escHtml(w)}</span>`).join('')}</div>`
    : '';
  // Vietnamese gloss of the target sentence — shown on "Sắp xếp từ" so the
  // student knows which sentence to assemble (stripped server-side in Thi thử).
  const viRow = q.promptVi
    ? `<div class="t2-vi-row"><span class="t2-vi-label">🇻🇳 Nghĩa</span><span class="t2-vi-text">${_escHtml(q.promptVi)}</span></div>`
    : '';

  if (['essay_type_recognition', 'topic_sentence'].includes(q.type)) {
    const letters = ['A','B','C','D'];
    return `
    <div class="wp-task-label">${typeLbl}</div>
    <div class="t2-question-text">${_escHtml(q.questionText)}</div>
    ${keywordRow}
    <div class="t2-mc-options">
      ${(q.options||[]).map((opt,i) => `
        <button class="t2-mc-option" data-idx="${i}" onclick="selectMC(${i}, this)">
          <span class="t2-opt-letter">${letters[i]}</span><span>${_escHtml(opt)}</span>
        </button>`).join('')}
    </div>
    <input type="hidden" id="mc-selected" value=""/>`;
  }
  if (q.type === 'rearrange') {
    // Fallback (no admin-set baseWords): every seeded rearrange question
    // puts its chip phrases inside "[phrase / phrase / phrase]" in
    // questionText. The old fallback here stripped that bracket out and
    // split what was LEFT (the Vietnamese instruction sentence) into
    // "words" — so every rearrange question without baseWords rendered
    // Vietnamese instruction fragments as chips instead of the actual
    // English phrases. Confirmed via a full DB scan: all 29 seeded
    // rearrange questions rely on this fallback (none set baseWords), so
    // this was breaking 100% of them. Fix: extract what's INSIDE the
    // brackets, split on "/" (phrases can contain spaces, so this can't
    // just split on whitespace).
    const words = (q.baseWords && q.baseWords.length)
      ? q.baseWords
      : (q.questionText.match(/\[(.*)\]/s)?.[1] || '').split('/').map(w => w.trim()).filter(Boolean);
    const shuffled = shuffle([...words]);
    const displayText = q.questionText.replace(/\n?\[.*\]/s, '').trim();
    return `
    <div class="wp-task-label">${typeLbl}</div>
    <div class="t2-question-text">${_escHtml(displayText)}</div>
    ${viRow}
    ${structureHint}
    ${keywordRow}
    <div class="wp-rearrange-answer" id="rearrange-answer" onclick="returnWord(event)">
      <span class="wp-rearrange-placeholder">Bấm vào các từ để sắp xếp...</span>
    </div>
    <div class="wp-rearrange-bank" id="rearrange-bank">
      ${shuffled.map((w,i) => `<span class="wp-word-chip" data-index="${i}" data-word="${_escHtml(w)}" data-used="false" onclick="selectWord(this)">${_escHtml(w)}</span>`).join('')}
    </div>
    <input type="hidden" id="rearrange-input" value=""/>`;
  }
  if (q.type === 'fill_blank') {
    return `
    <div class="wp-task-label">${typeLbl}</div>
    <div class="t2-question-text">${_escHtml(q.questionText)}</div>
    ${structureHint}
    ${keywordRow}
    <input class="wp-fill-input" id="fill-input" type="text" placeholder="Nhập từ cần điền..." onkeydown="handleEnter(event)" oninput="checkSubmitEnabled()"/>`;
  }
  // translation / paraphrase / conclusion (short_writing) → word-by-word
  // character-typing drill. Needs the exact model sentence, which the server
  // ships as q.translationAnswer for the topic-practice flow. Falls back to
  // the plain textarea below when the answer is absent (older data, exam mode).
  if (_isGfQuestion(q)) return _renderGfQuestion(q);
  if (_isOrdQuestion(q)) {
    const tr = q.type === 'translation';
    return `
  ${_drillPromptHtml(q)}
  ${tr ? '' : viRow}
  ${keywordRow}
  <div class="t2-ord" id="t2-ord">
    <div class="t2-wbw-bar">
      <span class="t2-wbw-count" id="ord-count"></span>
      <button type="button" class="wbw-ask ask-lulu" id="ord-ask" onclick="ordAskLulu()" title="Hỏi Lulu cụm tiếp theo">
        <span class="ask-lulu-ic"></span> <span>Hỏi Lulu</span>
      </button>
      ${_infoBtn('drill-order')}
    </div>
    ${_infoBody('drill-order', `Bấm các cụm theo đúng thứ tự để ghép thành ${q.type === 'short_writing' ? 'đoạn kết bài' : 'câu tiếng Anh'}. Bấm vào cụm đã chọn để gỡ ra. <b>Xếp sai ${ORD_MAX_TRIES} lần là câu tính sai</b> và quay lại sau.`)}
    <div class="wp-rearrange-answer t2-ord-answer" id="ord-answer"></div>
    <div class="wp-rearrange-bank t2-ord-bank" id="ord-bank"></div>
  </div>`;
  }
  if (WBW_TYPES.has(q.type) && q.translationAnswer) {
    // 'translation' already has the Vietnamese source baked into
    // questionText — the gloss is only useful for paraphrase/short_writing,
    // whose source is English (see viRow's own comment above).
    const para = q.type !== 'translation';
    return `
  ${_drillPromptHtml(q)}
  ${para ? viRow : ''}
  ${structureHint}
  ${keywordRow}
  <div class="wp-hints-row" id="hints-row"></div>
  <div class="t2-wbw" id="wbw">
    <div class="t2-wbw-bar">
      <span class="t2-wbw-count" id="wbw-count">0 / 0 từ</span>
      <button type="button" class="wbw-ask ask-lulu" id="wbw-ask" onclick="wbwAskLulu()" title="Hỏi Lulu chữ cái tiếp theo">
        <span class="ask-lulu-ic"></span> <span>Hỏi Lulu</span>
      </button>
      ${_infoBtn('drill-type')}
    </div>
    ${_infoBody('drill-type', `${para ? 'Gõ lại đoạn mẫu từng chữ — đúng thì tự mở từ tiếp theo.' : 'Gõ từng chữ cái — đúng thì tự mở từ tiếp theo. Dấu câu tự thêm, Backspace để xoá, bí chữ nào thì hỏi Lulu.'} <b>Gõ sai 1 từ ${WBW_MAX_WORD_ERRORS} lần là câu tính sai</b> và quay lại sau.`)}
    <div class="t2-wbw-words" id="wbw-words" onclick="wbwFocus()"></div>
    <input class="t2-wbw-input" id="wbw-input" type="text" autocomplete="off"
      autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Gõ từng từ" />
  </div>
  <textarea class="wp-answer-box hidden" id="answer-box" rows="3" aria-hidden="true" tabindex="-1"></textarea>`;
  }

  // fallbacks: translation/paraphrase/short_writing with no model shipped,
  // plus error_correction
  const isLong = ['short_writing','paraphrase'].includes(q.type);
  const answerHint = q.answerWordCount ? `
  <div class="t2-answer-hint">
    <span class="t2-answer-hint-count">📏 ${q.answerWordCount} từ</span>
    <span class="t2-answer-hint-pattern">${_escHtml(q.answerLetterHint || '')}</span>
  </div>` : '';
  return `
  <div class="wp-task-label">${typeLbl}</div>
  <div class="t2-question-text">${_escHtml(q.questionText)}</div>
  ${answerHint}
  ${structureHint}
  ${keywordRow}
  ${q.type === 'translation' ? '<div class="wp-hints-row" id="hints-row"></div>' : ''}
  <textarea class="wp-answer-box${isLong ? ' t2-writing-area' : ''}" id="answer-box" rows="${isLong ? 6 : 3}" placeholder="${isLong ? 'Viết đoạn văn tại đây...' : 'Nhập câu trả lời tại đây...'}" ${isLong ? '' : 'onkeydown="handleEnter(event)"'} oninput="updateWordCount(this);checkSubmitEnabled()"></textarea>
  ${isLong ? '<div class="t2-word-count" id="word-count">0 từ</div>' : ''}`;
}

function revealVocabHint() {
  const maxHints = Math.min(3, _vocabHintList.length);
  if (_vocabHintCount >= maxHints) return;
  _vocabHintCount++;
  const row = document.getElementById('hints-row');
  if (!row) return;
  row.innerHTML = '';
  const lbl = document.createElement('span');
  lbl.className = 'wp-hint-label'; lbl.textContent = '💡';
  row.appendChild(lbl);
  _vocabHintList.slice(0, _vocabHintCount).forEach(h => {
    const chip = document.createElement('span');
    chip.className = 'wp-hint-chip'; chip.textContent = h;
    row.appendChild(chip);
  });
  const btn = document.getElementById('vocab-hint-btn');
  const countEl = document.getElementById('vocab-hint-count');
  if (countEl) countEl.textContent = `${_vocabHintCount}/${maxHints}`;
  if (btn) btn.disabled = _vocabHintCount >= maxHints;
}

// ════════════════════════════════════════════════════════
//  WORD-BY-WORD "DỊCH CÂU" TYPING DRILL
//  Progressive, one active word at a time, character-by-character
//  validation. Feeds the existing #answer-box → submitPractice() flow
//  unchanged (grading/feedback/auto-next/history all reused).
// ════════════════════════════════════════════════════════
let _wbw = null;
// Set for exactly one submitPractice() call: the drill finished the sentence,
// so it's a verbatim match to the answer and needs no server grading.
let _wbwVerbatimPending = false;
// Set for exactly one submitPractice() call: a word was mistyped
// WBW_MAX_WORD_ERRORS times — grade the sentence wrong locally and requeue it.
// Holds the word the student got stuck on.
let _wbwFailPending = null;

function _wbwTokenize(answer) {
  return String(answer).trim().split(/\s+/).filter(Boolean).map(raw => {
    const target = raw.replace(/[^A-Za-z0-9]/g, '');   // chars the student types
    let seen = false;
    const mask = [...raw].map(ch => {
      if (/[A-Za-z0-9]/.test(ch)) { if (!seen) { seen = true; return ch; } return '*'; }
      return ch;                                        // punctuation stays visible
    }).join('');
    return { raw, target, mask };
  }).filter(t => t.target.length > 0);                  // drop stray punctuation-only tokens
}

function wbwInit() {
  const wrap = document.getElementById('wbw');
  if (!wrap) { _wbw = null; return; }
  const q = state.questions[state.currentIdx];
  if (!q || !q.translationAnswer) { _wbw = null; return; }

  const answered = ['correct', 'wrong'].includes(state.questionStatus[state.currentIdx]);
  const tokens = _wbwTokenize(q.translationAnswer);
  _wbw = {
    answer: q.translationAnswer,
    tokens,
    activeIdx: answered ? tokens.length : 0,
    typed: '',
    erroring: false,
    wordErrors: 0,     // wrong tries on the active word (reset on each new word)
    q,
    asks: q._luluAsks || 0, // "Hỏi Lulu" asks used on this question — kept on
                            // the question so jumping away and back doesn't reset it
    failed: false,
    composing: false,
    done: answered,
    locked: answered
  };

  const askBtn = document.getElementById('wbw-ask');
  if (askBtn) askBtn.disabled = _wbw.locked;
  if (window.AskLulu) window.AskLulu.left(askBtn, WBW_MAX_ASKS - _wbw.asks);
  const input = document.getElementById('wbw-input');
  if (input) {
    if (_wbw.locked) {
      input.disabled = true;
    } else {
      input.addEventListener('keydown', _wbwKeydown);
      input.addEventListener('input', _wbwOnInput);
      input.addEventListener('paste', e => e.preventDefault());
      // Mobile keyboards with autocorrect compose plain English words too; an
      // in-progress composition isn't a wrong keystroke, so don't let it burn
      // through the WBW_MAX_WORD_ERRORS cap — check once it's committed.
      input.addEventListener('compositionstart', () => { if (_wbw) _wbw.composing = true; });
      input.addEventListener('compositionend', () => { if (_wbw) { _wbw.composing = false; _wbwOnInput(); } });
    }
  }
  _wbwRenderWords();
  _wbwUpdateBar();
  _wbwSyncBridge(_wbw.done);
  if (!_wbw.locked) setTimeout(wbwFocus, 30);
}

function wbwFocus() {
  if (!_wbw || _wbw.locked) return;
  const input = document.getElementById('wbw-input');
  if (input) input.focus();
}

// "Hỏi Lulu": Lulu tells the next letter of the word being typed — one
// letter per ask, never the whole sentence, and never typed in for the
// student (same as Luyện viết câu / Task 1's drill, js/shared/sentence-drill.js).
// At most WBW_MAX_ASKS asks per sentence.
function wbwAskLulu() {
  if (!_wbw || _wbw.done || _wbw.locked || _wbw.asks >= WBW_MAX_ASKS) return;
  const tok = _wbw.tokens[_wbw.activeIdx];
  if (!tok) return;
  const next = tok.target.charAt(_wbw.typed.length);
  if (next && window.AskLulu) {
    _wbw.asks++;
    _wbw.q._luluAsks = _wbw.asks;
    window.AskLulu.left(document.getElementById('wbw-ask'), WBW_MAX_ASKS - _wbw.asks);
    const so = _wbw.typed + next;
    window.AskLulu.say(document.getElementById('wbw-ask'),
      `Chữ tiếp theo là “${next}” nè — từ này bắt đầu “${so}${so.length < tok.target.length ? '…' : ''}” 🍊`);
  }
  wbwFocus();
}

function _wbwRenderWords() {
  const host = document.getElementById('wbw-words');
  if (!host || !_wbw) return;
  const { tokens, activeIdx, typed, erroring, done } = _wbw;
  host.innerHTML = tokens.map((t, i) => {
    if (i < activeIdx) {
      return `<span class="t2-wbw-word is-done" data-i="${i}">${_escHtml(t.raw)}</span>`;
    }
    if (i === activeIdx && _wbw.failed) {
      // The word the student got stuck on — shown in red before the
      // feedback card (with the full model sentence) takes over.
      return `<span class="t2-wbw-word is-active is-error" data-i="${i}">${_escHtml(t.raw)}</span>`;
    }
    if (i === activeIdx && !done) {
      const remaining = Math.max(0, t.target.length - typed.length);
      const tail = erroring
        ? `<span class="t2-wbw-err">✕</span>`
        : `<span class="t2-wbw-caret"></span>`;
      return `<span class="t2-wbw-word is-active${erroring ? ' is-error' : ''}" data-i="${i}">`
        + `${_escHtml(typed)}${tail}<span class="t2-wbw-star">${'*'.repeat(remaining)}</span></span>`;
    }
    return `<span class="t2-wbw-word is-locked" data-i="${i}">${_escHtml(t.mask)}</span>`;
  }).join('');

  const input = document.getElementById('wbw-input');
  if (input && !_wbw.locked) {
    const cur = tokens[activeIdx];
    input.placeholder = cur ? cur.mask : '';
  }
}

function _wbwUpdateBar() {
  if (!_wbw) return;
  const el = document.getElementById('wbw-count');
  if (!el) return;
  const total = _wbw.tokens.length;
  const done = _wbw.done ? total : _wbw.activeIdx;
  el.textContent = `${done} / ${total} từ`;
  el.classList.toggle('is-full', done === total && total > 0);
}

// Mirror the completed words into the hidden #answer-box so the existing
// checkSubmitEnabled()/getUserAnswerPractice()/submitPractice() chain keeps
// working with zero changes.
function _wbwSyncBridge(full) {
  const box = document.getElementById('answer-box');
  if (!box || !_wbw) return;
  box.value = (full || _wbw.done)
    ? _wbw.answer
    : _wbw.tokens.slice(0, _wbw.activeIdx).map(t => t.raw).join(' ');
  checkSubmitEnabled();
}

function _wbwFlashError() {
  if (!_wbw || _wbw.erroring) return;
  _wbw.erroring = true;
  const input = document.getElementById('wbw-input');
  if (input) input.classList.add('is-error');
  _wbwRenderWords();
  // No per-keystroke error sound — the shake + red is feedback enough, and a
  // beep on every mistyped char gets grating fast.
  setTimeout(() => {
    if (!_wbw) return;
    _wbw.erroring = false;
    if (input) input.classList.remove('is-error');
    _wbwRenderWords();
  }, 260);
}

function _wbwKeydown(e) {
  if (!_wbw || _wbw.locked || _wbw.done) return;
  // Enter must never submit the whole exercise from here — completion
  // auto-submits on its own. Space is a no-op (progression is automatic).
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); }
}

// Reconcile the input's value against the active word. Runs on every keystroke
// (also covers IME / mobile / long-press). We never rewrite a wrong character
// into a right one — a rejected char is simply removed and the student retypes.
function _wbwOnInput() {
  if (!_wbw || _wbw.locked || _wbw.done || _wbw.composing) return;
  const input = document.getElementById('wbw-input');
  if (!input) return;
  const tok = _wbw.tokens[_wbw.activeIdx];
  const raw = input.value.replace(/[^A-Za-z0-9]/g, '');

  let good = '';
  let rejected = false;
  for (const ch of raw) {
    const expected = tok.target[good.length];
    if (expected === undefined) break;                  // don't overrun the word
    if (ch.toLowerCase() === expected.toLowerCase()) { good += ch; }
    else { rejected = true; break; }
  }

  _wbw.typed = good;
  input.value = good;                                   // active-recall: never auto-fill

  if (rejected) {
    // A second wrong key during the 260ms shake isn't a separate try (same
    // as the shared drill's _flashError).
    if (!_wbw.erroring) _wbw.wordErrors++;
    if (_wbw.wordErrors >= WBW_MAX_WORD_ERRORS) { _wbwFail(); return; }
    _wbwFlashError();
    return;
  }
  if (good.length < tok.target.length) { _wbwRenderWords(); return; }

  // ── active word complete ──
  _wbw.activeIdx++;
  _wbw.typed = '';
  _wbw.wordErrors = 0;
  input.value = '';
  _wbwRenderWords();
  _wbwUpdateBar();
  _wbwSyncBridge();
  const chip = document.querySelector(`#wbw-words .t2-wbw-word[data-i="${_wbw.activeIdx - 1}"]`);
  if (chip) chip.classList.add('just-done');
  if (typeof playOk === 'function') playOk();

  if (_wbw.activeIdx >= _wbw.tokens.length) _wbwComplete();
  else wbwFocus();
}

function _wbwComplete() {
  if (!_wbw) return;
  _wbw.done = true;
  _wbw.locked = true;
  const input = document.getElementById('wbw-input');
  if (input) { input.disabled = true; input.blur(); }
  const askBtn = document.getElementById('wbw-ask');
  if (askBtn) askBtn.disabled = true;
  _wbwRenderWords();
  _wbwUpdateBar();
  _wbwSyncBridge(true);
  // Hand off to the existing feedback / auto-next flow. The sentence was
  // validated character-by-character, so mark it a verbatim pass and let
  // submitPractice() skip the AI grading round-trip.
  setTimeout(() => {
    if (state._isSubmitting) return;
    if (['correct', 'wrong'].includes(state.questionStatus[state.currentIdx])) return;
    _wbwVerbatimPending = true;
    submitPractice();
  }, 550);
}

// A word was mistyped WBW_MAX_WORD_ERRORS times: lock the drill,
// flag the stuck word, and hand off to submitPractice() to grade the
// sentence wrong and push it back in the queue.
function _wbwFail() {
  if (!_wbw || _wbw.done) return;
  const stuck = _wbw.tokens[_wbw.activeIdx];
  _wbw.failed = true;
  _wbw.done = true;
  _wbw.locked = true;
  _wbw.erroring = false;
  const input = document.getElementById('wbw-input');
  if (input) { input.classList.remove('is-error'); input.value = ''; input.disabled = true; input.blur(); }
  const askBtn = document.getElementById('wbw-ask');
  if (askBtn) askBtn.disabled = true;
  _wbwRenderWords();
  setTimeout(() => {
    if (state._isSubmitting) return;
    if (['correct', 'wrong'].includes(state.questionStatus[state.currentIdx])) return;
    _wbwFailPending = { word: stuck ? stuck.raw.replace(/[^A-Za-z0-9'-]/g, '') : '' };
    submitPractice();
  }, 450);
}

// Put another copy of question `idx` WBW_REQUEUE_GAP questions further on
// (or at the end), like the vocab drills' requeueWrongWord. Returns false
// once the sentence has already come back WBW_MAX_REQUEUES times.
function _requeueQuestion(idx) {
  const q = state.questions[idx];
  if (!q) return false;
  const id = q.questionId || q._id;
  const copies = state.questions.filter(x => (x.questionId || x._id) === id).length - 1;
  if (copies >= WBW_MAX_REQUEUES) return false;
  const insertAt = Math.min(idx + 1 + WBW_REQUEUE_GAP, state.questions.length);
  // A redo starts fresh; a missed multiple-choice comes back as "điền cụm"
  // (recall, not recognition — picking again from the same 4 teaches nothing).
  const redo = { ...q, _isRepeat: true, _luluAsks: 0, _ordTries: 0, _gfTries: 0 };
  if (redo._mode === 'mcq') redo._mode = 'gap';
  state.questions.splice(insertAt, 0, redo);
  state.questionStatus.splice(insertAt, 0, 'pending');
  return true;
}

// ════════════════════════════════════════════════════════
//  "Viết đoạn kết bài" — click the phrases into order
// ════════════════════════════════════════════════════════
let _ord = null;   // { q, chunks, bank, picked, wrongFrom, tries, asks, done }

const _ORD_MAX_WORDS = 7;
// Where a long piece is split: clause openers first, then prepositions.
const _ORD_CONJ = new Set(['because', 'although', 'though', 'while', 'whereas', 'and', 'but', 'or', 'which', 'who', 'whose', 'where', 'as', 'since', 'so', 'if', 'when', 'unless', 'rather', 'instead', 'whether', 'that', 'than']);
const _ORD_PREP = new Set(['by', 'through', 'with', 'without', 'to', 'in', 'for', 'of', 'on', 'from', 'into', 'at', 'about', 'over', 'such']);

// Model paragraph → short phrases (mostly 3–7 words): split after commas,
// then pieces over 7 words before a conjunction / preposition near their
// middle (3+ words each side, never "such | as"), then pieces over 10 words
// in halves (never ending on a/an/the); a one-word leftover joins its
// neighbour.
function _ordChunks(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  let pieces = [];
  let cur = [];
  words.forEach(w => { cur.push(w); if (/[,;:]$/.test(w)) { pieces.push(cur); cur = []; } });
  if (cur.length) pieces.push(cur);
  const norm = w => w.toLowerCase().replace(/[^a-z']/g, '');
  const splitAt = (p, set) => {
    if (p.length <= _ORD_MAX_WORDS) return [p];
    let best = -1, bestD = Infinity;
    for (let i = 3; i <= p.length - 3; i++) {
      if (!set.has(norm(p[i])) || (norm(p[i]) === 'as' && norm(p[i - 1]) === 'such')) continue;
      const d = Math.abs(i - p.length / 2);
      if (d < bestD) { best = i; bestD = d; }
    }
    if (best < 0) return [p];
    return [...splitAt(p.slice(0, best), set), ...splitAt(p.slice(best), set)];
  };
  const halve = p => {
    if (p.length <= _ORD_MAX_WORDS + 3) return [p];
    let mid = Math.ceil(p.length / 2);
    while (mid < p.length - 2 && /^(a|an|the|to|of)$/i.test(p[mid - 1])) mid++;
    return [...halve(p.slice(0, mid)), ...halve(p.slice(mid))];
  };
  pieces = pieces.flatMap(p => splitAt(p, _ORD_CONJ)).flatMap(p => splitAt(p, _ORD_PREP)).flatMap(halve);
  const out = [];
  pieces.forEach(p => {
    if (p.length === 1 && out.length) out[out.length - 1] = out[out.length - 1].concat(p);
    else out.push(p);
  });
  if (out.length > 1 && out[0].length === 1) out.splice(0, 2, out[0].concat(out[1]));
  return out.map(p => p.join(' '));
}

function _ordActive() {
  const q = state.questions[state.currentIdx];
  return !!(_ord && q && _ord.q === q);
}

function ordInit() {
  _ord = null;
  const q = state.questions[state.currentIdx];
  if (!q || !_isOrdQuestion(q) || !document.getElementById('t2-ord')) return;
  const chunks = _ordChunks(q.translationAnswer);
  const answered = ['correct', 'wrong'].includes(state.questionStatus[state.currentIdx]);
  const bank = shuffle(chunks.map((_, i) => i));
  // Don't hand over the answer already in order.
  if (chunks.length > 1 && bank.every((v, i) => chunks[v] === chunks[i])) bank.push(bank.shift());
  _ord = {
    q, chunks, bank,
    picked: answered ? chunks.map((_, i) => i) : [],
    wrongFrom: -1,
    // Kept on the question, so jumping away and back doesn't reset them.
    tries: q._ordTries || 0,
    asks: q._luluAsks || 0,
    done: answered
  };
  const askBtn = document.getElementById('ord-ask');
  if (askBtn) askBtn.disabled = answered;
  if (window.AskLulu) window.AskLulu.left(askBtn, WBW_MAX_ASKS - _ord.asks);
  _ordRender();
}

function _ordText() {
  return _ord ? _ord.picked.map(i => _ord.chunks[i]).join(' ') : '';
}

// Index of the first picked phrase that isn't the right one there (-1: none).
function _ordFirstWrong() {
  const o = _ord;
  for (let k = 0; k < o.picked.length; k++) if (o.chunks[o.picked[k]] !== o.chunks[k]) return k;
  return -1;
}

function _ordRender() {
  const o = _ord;
  if (!o) return;
  const ans = document.getElementById('ord-answer');
  const bank = document.getElementById('ord-bank');
  if (!ans || !bank) return;
  ans.innerHTML = o.picked.length
    ? o.picked.map((ci, k) => `<span class="wp-answer-chip${o.wrongFrom >= 0 && k >= o.wrongFrom ? ' is-wrong' : ''}${o.done ? ' is-locked' : ''}" onclick="ordUnpick(${k})">${_escHtml(o.chunks[ci])}</span>`).join('')
    : '<span class="wp-rearrange-placeholder">Bấm các cụm bên dưới theo đúng thứ tự...</span>';
  bank.innerHTML = o.bank.filter(ci => !o.picked.includes(ci))
    .map(ci => `<span class="wp-word-chip" onclick="ordPick(${ci})">${_escHtml(o.chunks[ci])}</span>`).join('');
  bank.classList.toggle('hidden', !bank.innerHTML);
  const count = document.getElementById('ord-count');
  if (count) {
    count.textContent = `${o.picked.length} / ${o.chunks.length} cụm`;
    count.classList.toggle('is-full', o.picked.length === o.chunks.length);
  }
  checkSubmitEnabled();
}

function ordPick(ci) {
  const o = _ord;
  if (!o || o.done || state._isSubmitting || o.picked.includes(ci)) return;
  o.picked.push(ci);
  o.wrongFrom = -1;
  _ordRender();
}

function ordUnpick(k) {
  const o = _ord;
  if (!o || o.done || state._isSubmitting) return;
  o.picked.splice(k, 1);
  o.wrongFrom = -1;
  _ordRender();
}

// "Hỏi Lulu": takes back the phrases from the first wrong one on, or puts
// the next right phrase in place. At most WBW_MAX_ASKS asks per question.
function ordAskLulu() {
  const o = _ord;
  if (!o || o.done || state._isSubmitting || o.asks >= WBW_MAX_ASKS) return;
  const btn = document.getElementById('ord-ask');
  const k = _ordFirstWrong();
  let text;
  if (k >= 0) {
    o.picked = o.picked.slice(0, k);
    text = `Từ cụm thứ ${k + 1} là lạc chỗ rồi — tớ gỡ ra giúp cậu nè. Cụm đúng tiếp theo bắt đầu bằng “${o.chunks[k].split(' ')[0]}…” 🍊`;
  } else if (o.picked.length < o.chunks.length) {
    const next = o.picked.length;
    // The same text may sit in the bank twice — take any unused copy.
    const ci = o.chunks.findIndex((c, i) => c === o.chunks[next] && !o.picked.includes(i));
    o.picked.push(ci);
    text = `Cụm tiếp theo là “${o.chunks[next]}” nè 🍊`;
  } else {
    if (window.AskLulu) window.AskLulu.say(btn, 'Xếp đúng hết rồi đó, bấm Kiểm tra thôi! 🎉');
    return;
  }
  o.asks++;
  o.q._luluAsks = o.asks;
  o.wrongFrom = -1;
  _ordRender();
  if (window.AskLulu) {
    window.AskLulu.left(btn, WBW_MAX_ASKS - o.asks);
    window.AskLulu.say(btn, text);
  }
}

// ════════════════════════════════════════════════════════
//  "DỊCH CÂU" FORMATS — a lesson has ~20 sentences; typing every one word by
//  word took too long and taught little after the first few. Each sentence
//  now gets one format, fixed per sentence (same for every student):
//    mcq    — key phrase blanked, pick it from 4          (recognise)
//    gap    — key phrase blanked, type it, first letters  (recall)
//    listen — hear the sentence, type 2–3 missing words   (listen + spell)
//    type   — the word-by-word typing drill               (produce)
//    order  — long sentences (examples, conclusion, paraphrase): click the
//             phrases into order
//  The key phrase is the sentence's "dùng từ X" collocation, else its
//  longest keyword. mcq/gap/listen are graded here, like the typing drill.
// ════════════════════════════════════════════════════════
const DRILL_MODES = {
  mcq:    { label: 'Chọn cụm đúng', icon: 'fa-list-check',   cls: 'm-mcq' },
  gap:    { label: 'Điền cụm từ',   icon: 'fa-pen',          cls: 'm-gap' },
  listen: { label: 'Nghe & điền',   icon: 'fa-headphones',   cls: 'm-listen' },
  type:   { label: 'Gõ cả câu',     icon: 'fa-keyboard',     cls: 'm-type' },
  order:  { label: 'Ghép cụm',      icon: 'fa-puzzle-piece', cls: 'm-order' }
};
const DRILL_CYCLE = ['mcq', 'gap', 'listen', 'type'];
const DRILL_LONG_WORDS = 22;   // longer sentences are clicked into order instead
const GF_MAX_TRIES = 3;        // same 3-tries rule as the typing drill
const _GF_STOP = new Set(('about above after again against because before being below between could during every further having other their there these those through under until where which while would should people things today often their always').split(' '));
let _drillPool = [];           // key phrases + vocab terms — the mcq distractors
let _gf = null;                // { q, mode, blanks, options, picked, tries, asks, done }

function _modeBadge(m) {
  const d = DRILL_MODES[m];
  return d ? `<span class="t2-mode ${d.cls}"><i class="fas ${d.icon}"></i> ${d.label}</span>` : '';
}
function _isGfQuestion(q) {
  return !!(q && q.translationAnswer && ['mcq', 'gap', 'listen'].includes(q._mode) && _gfBlanks(q).length);
}
function _isOrdQuestion(q) {
  return !!(q && q.translationAnswer && (ORD_TYPES.has(q.type) || q._mode === 'order'));
}
// The format this question is drilled in (null: not a sentence-building drill).
function _drillMode(q) {
  if (!q || !WBW_TYPES.has(q.type) || !q.translationAnswer) return null;
  if (_isGfQuestion(q)) return q._mode;
  if (_isOrdQuestion(q)) return 'order';
  return 'type';
}

// Where the key phrase sits in the model sentence → { start, end, text } | null.
function _keySpan(q) {
  const ans = q.translationAnswer || '';
  const { kw } = _sentenceParts(q.questionText);
  const cands = [];
  if (kw && !/\.\.\.|…/.test(kw)) cands.push(kw);
  (q.fallbackKeywords || []).slice().sort((a, b) => b.length - a.length)
    .filter(k => /\s/.test(k.trim()) || k.trim().length >= 7).forEach(k => cands.push(k));
  for (const c of cands) {
    const re = _termRegex(c);
    const m = re && re.exec(ans);
    if (m && m[2].length >= 4) { const start = m.index + m[1].length; return { start, end: start + m[2].length, text: m[2] }; }
  }
  return null;
}

// Runs on every freshly fetched question list (all of the topic's questions,
// so a sentence's format doesn't depend on which subset is being practised).
function _assignDrillModes(questions) {
  const list = (questions || []).filter(q => WBW_TYPES.has(q.type) && q.translationAnswer)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  let k = 0, j = 0;
  list.forEach(q => {
    q._key = null;
    if (q.type !== 'translation' || _wc(q.translationAnswer) > DRILL_LONG_WORDS) { q._mode = 'order'; return; }
    q._key = _keySpan(q);
    q._mode = q._key ? DRILL_CYCLE[k++ % DRILL_CYCLE.length] : (j++ % 2 ? 'type' : 'listen');
  });
  const pool = new Map();
  list.forEach(q => { if (q._key) pool.set(q._key.text.toLowerCase(), q._key.text); });
  if (state.selectedTopic && state.vocabFor === state.selectedTopic._id) {
    (state.vocab || []).forEach(v => { if (v.term && !/\.\.|…|\//.test(v.term)) pool.set(v.term.toLowerCase(), v.term); });
  }
  _drillPool = [...pool.values()];
  // Too few phrases to make 4 options → type it instead.
  if (_drillPool.length < 4) list.forEach(q => { if (q._mode === 'mcq') q._mode = 'gap'; });
}

// The blanks of a gap/listen/mcq sentence (sorted). listen adds up to two
// more long content words (not proper nouns, never next to another blank).
function _gfBlanks(q) {
  if (!q || !q.translationAnswer) return [];
  const out = q._key ? [q._key] : [];
  if (q._mode === 'listen') {
    const ans = q.translationAnswer;
    const words = [...ans.matchAll(/[A-Za-z][A-Za-z'-]*/g)].map(m => ({ start: m.index, end: m.index + m[0].length, text: m[0] }));
    const free = w => !out.some(b => w.start < b.end + 2 && w.end > b.start - 2);
    words.filter(w => w.start > 0 && w.text.length >= 5 && !_GF_STOP.has(w.text.toLowerCase()) && !/^[A-Z]/.test(w.text))
      .sort((a, b) => b.text.length - a.text.length || a.start - b.start)
      .forEach(w => { if (out.length < 3 && free(w)) out.push(w); });
  }
  return out.slice().sort((a, b) => a.start - b.start);
}
// text with spans[k] replaced by fn(spanText, k); everything else escaped.
function _spansHtml(text, spans, fn) {
  let html = '', pos = 0;
  spans.forEach((s, k) => { html += _escHtml(text.slice(pos, s.start)) + fn(text.slice(s.start, s.end), k); pos = s.end; });
  return html + _escHtml(text.slice(pos));
}
function _gfHint(text) {
  return text.split(/(\s+|-)/).map(w => /^[A-Za-z]/.test(w) ? w[0] + '_'.repeat(w.length - 1) : w).join('');
}
function _gfNorm(s) {
  return String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/-/g, ' ').replace(/[^a-z0-9' ]/g, '').replace(/\s+/g, ' ').trim();
}
function _gfOptions(q) {
  const ans = q._key.text;
  const low = ans.toLowerCase();
  const n = ans.trim().split(/\s+/).length;
  const rng = _seededRng(String(q.questionId || q._id) + ':mcq');
  let pool = _drillPool.filter(p => { const l = p.toLowerCase(); return l !== low && !l.includes(low) && !low.includes(l); });
  // Fragments like "keep pace with" can never fill a noun slot — easy to rule
  // out, so they make poor distractors.
  const whole = pool.filter(p => !/\s(to|with|of|for|on|in|at|from|into|by|about|as)$/i.test(p.trim()));
  if (whole.length >= 3) pool = whole;
  const cands = shuffle(pool, rng)
    .sort((a, b) => Math.abs(a.split(/\s+/).length - n) - Math.abs(b.split(/\s+/).length - n));
  const atStart = q._key.start === 0;
  const fmt = s => atStart ? s.charAt(0).toLowerCase() + s.slice(1) : s;
  return shuffle([{ text: ans, ok: true }, ...cands.slice(0, 3).map(t => ({ text: t, ok: false }))], rng)
    .map(o => ({ ...o, label: fmt(o.text) }));
}

// Prompt shared by the type / order formats: the instruction line + the
// Vietnamese sentence, set apart so it's the first thing the eye lands on.
function _drillPromptHtml(q) {
  if (q.type !== 'translation') return `<div class="t2-question-text">${_escHtml(q.questionText)}</div>`;
  const parts = String(q.questionText || '').trim().split(/\n\s*\n/);
  const { vi } = _sentenceParts(q.questionText, true);
  const head = parts.length > 1 ? parts[0].trim().replace(/[:：]\s*$/, '') : '';
  return `<div class="t2-drill-prompt">${head ? `<div class="t2-drill-ask">${_escHtml(head)}</div>` : ''}<div class="t2-vi-main"><span class="t2-flag">VI</span><span>${_escHtml(vi)}</span></div></div>`;
}

function _renderGfQuestion(q) {
  const mode = q._mode;
  const { vi } = _sentenceParts(q.questionText, true);
  const blanks = _gfBlanks(q);
  const sentence = _spansHtml(q.translationAnswer, blanks, (text, k) => mode === 'mcq'
    ? '<span class="t2-gf-slot" id="gf-slot">?</span>'
    : `<input class="t2-gf-in" id="gf-in-${k}" data-k="${k}" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" style="width:${Math.max(5, text.length + 2)}ch" placeholder="${mode === 'gap' ? _escHtml(_gfHint(text)) : ''}" aria-label="Chỗ trống ${k + 1}">`);
  const opts = mode === 'mcq' ? _gfOptions(q) : [];
  const how = {
    mcq: 'Chọn cụm từ đúng điền vào chỗ trống để câu tiếng Anh có nghĩa giống câu tiếng Việt. Chọn 1 lần — sai thì câu quay lại sau và lần đó bạn phải tự điền. Phím 1–4 để chọn nhanh.',
    gap: `Điền cụm từ còn thiếu (ô trống có gợi ý chữ cái đầu). Enter để kiểm tra. Sai ${GF_MAX_TRIES} lần là câu tính sai và quay lại sau.`,
    listen: `Nghe câu rồi điền các từ còn thiếu — nghe lại hoặc nghe chậm bao nhiêu lần cũng được. Sai ${GF_MAX_TRIES} lần là câu tính sai và quay lại sau.`
  }[mode];
  const prompt = mode === 'listen'
    ? `<div class="t2-drill-prompt is-listen">
        <div class="t2-listen-bar">
          <button type="button" class="t2-listen-btn" onclick="gfSpeak(false)"><i class="fas fa-volume-up"></i> Nghe</button>
          <button type="button" class="t2-listen-btn is-slow" onclick="gfSpeak(true)"><i class="fas fa-person-walking"></i> Nghe chậm</button>
          <button type="button" class="t2-link" onclick="gfToggleVi(this)" aria-expanded="false"><span class="t2-flag">VI</span> Xem nghĩa</button>
        </div>
        <div class="t2-vi-main" id="gf-vi" hidden><span class="t2-flag">VI</span><span>${_escHtml(vi)}</span></div>
      </div>`
    : `<div class="t2-drill-prompt"><div class="t2-vi-main"><span class="t2-flag">VI</span><span>${_escHtml(vi)}</span></div></div>`;
  return `
  ${prompt}
  <div class="t2-gf ${DRILL_MODES[mode].cls}" id="t2-gf">
    <div class="t2-wbw-bar">
      <span class="t2-wbw-count" id="gf-count"></span>
      ${mode !== 'mcq' ? `<button type="button" class="wbw-ask ask-lulu" id="gf-ask" onclick="gfAskLulu()" title="Hỏi Lulu chữ cái tiếp theo"><span class="ask-lulu-ic"></span> <span>Hỏi Lulu</span></button>` : ''}
      ${_infoBtn('drill-' + mode)}
    </div>
    ${_infoBody('drill-' + mode, how)}
    <div class="t2-gf-sentence"><span class="t2-flag is-en">EN</span>${sentence}</div>
    ${mode === 'mcq' ? `<div class="t2-mc-options t2-gf-opts">${opts.map((o, i) => `<button type="button" class="t2-mc-option" data-i="${i}" onclick="gfPick(${i})"><span class="t2-opt-letter">${i + 1}</span><span>${_escHtml(o.label)}</span></button>`).join('')}</div>` : ''}
  </div>`;
}

function _gfActive() {
  const q = state.questions[state.currentIdx];
  return !!(_gf && q && _gf.q === q);
}
function _gfInputs() { return [...document.querySelectorAll('#t2-gf .t2-gf-in')]; }
function _gfResults() {
  return _gfInputs().map((inp, k) => !!_gf.blanks[k] && _gfNorm(inp.value) === _gfNorm(_gf.blanks[k].text));
}
// The sentence as the student completed it.
function _gfFilledText() {
  const g = _gf;
  if (!g) return '';
  const o = g.mode === 'mcq' && g.picked != null ? g.options[g.picked] : null;
  const vals = g.mode === 'mcq' ? g.blanks.map(() => o ? o.text : '') : _gfInputs().map(i => i.value.trim());
  const ans = g.q.translationAnswer;
  let out = '', pos = 0;
  g.blanks.forEach((b, k) => { out += ans.slice(pos, b.start) + (vals[k] || '___'); pos = b.end; });
  return out + ans.slice(pos);
}
// Same sentence for the feedback card, the student's fills coloured right/wrong.
function _gfStudentHtml() {
  const g = _gf;
  if (!g) return '';
  if (g.mode === 'mcq') {
    const o = g.picked != null ? g.options[g.picked] : null;
    return _spansHtml(g.q.translationAnswer, g.blanks, () => `<mark class="t2-fill ${o && o.ok ? 'ok' : 'bad'}">${_escHtml(o ? o.text : '___')}</mark>`);
  }
  const vals = _gfInputs().map(i => i.value.trim());
  const res = _gfResults();
  return _spansHtml(g.q.translationAnswer, g.blanks, (_t, k) => `<mark class="t2-fill ${res[k] ? 'ok' : 'bad'}">${_escHtml(vals[k] || '___')}</mark>`);
}
function _gfUpdateBar() {
  const el = document.getElementById('gf-count');
  if (!el || !_gf) return;
  if (_gf.mode === 'mcq') { el.textContent = `Chọn 1 trong ${_gf.options.length}`; return; }
  const n = _gf.blanks.length;
  el.textContent = `${n} chỗ trống · còn ${Math.max(0, GF_MAX_TRIES - _gf.tries)} lần thử`;
  el.classList.toggle('is-warn', _gf.tries > 0 && !_gf.done);
}
function _gfLock() {
  _gfInputs().forEach(i => { i.disabled = true; });
  document.querySelectorAll('#t2-gf .t2-mc-option').forEach(b => { b.disabled = true; });
  const ask = document.getElementById('gf-ask');
  if (ask) ask.disabled = true;
}

function gfInit() {
  _gf = null;
  const q = state.questions[state.currentIdx];
  if (!q || !document.getElementById('t2-gf') || !_isGfQuestion(q)) return;
  const answered = ['correct', 'wrong'].includes(state.questionStatus[state.currentIdx]);
  _gf = {
    q, mode: q._mode, blanks: _gfBlanks(q),
    options: q._mode === 'mcq' ? _gfOptions(q) : null,
    picked: null, tries: q._gfTries || 0, asks: q._luluAsks || 0, done: answered
  };
  const submit = document.getElementById('submit-btn');
  if (submit && _gf.mode === 'mcq') submit.style.display = 'none'; // a pick submits by itself
  const inputs = _gfInputs();
  inputs.forEach((inp, k) => {
    inp.addEventListener('input', () => { inp.classList.remove('is-wrong', 'is-ok'); checkSubmitEnabled(); });
    inp.addEventListener('paste', e => e.preventDefault());
    inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      e.stopPropagation();
      const empty = inputs.find(i => !i.value.trim());
      if (empty) empty.focus(); else submitPractice();
    });
  });
  if (answered) {
    inputs.forEach((inp, k) => { inp.value = _gf.blanks[k].text; inp.classList.add('is-ok'); });
    document.querySelectorAll('#t2-gf .t2-mc-option').forEach((b, i) => { if (_gf.options[i].ok) b.classList.add('correct'); });
    _gfLock();
  } else {
    const ask = document.getElementById('gf-ask');
    if (window.AskLulu && ask) window.AskLulu.left(ask, WBW_MAX_ASKS - _gf.asks);
    if (inputs[0]) setTimeout(() => { if (_gfActive()) inputs[0].focus({ preventScroll: true }); }, 30);
    if (_gf.mode === 'listen') setTimeout(() => { if (_gfActive() && !_gf.done) gfSpeak(false); }, 350);
  }
  _gfUpdateBar();
  checkSubmitEnabled();
}

function gfPick(i) {
  const g = _gf;
  if (!_gfActive() || g.done || state._isSubmitting || !g.options[i]) return;
  g.picked = i;
  document.querySelectorAll('#t2-gf .t2-mc-option').forEach((b, k) => b.classList.toggle('selected', k === i));
  const slot = document.getElementById('gf-slot');
  if (slot) slot.textContent = g.options[i].label;
  submitPractice();
}

function gfSpeak(slow) {
  if (!_gf) return;
  _speakSentence(_gf.q.translationAnswer, slow);
}
function gfToggleVi(btn) {
  const el = document.getElementById('gf-vi');
  if (!el) return;
  el.hidden = !el.hidden;
  if (btn) btn.setAttribute('aria-expanded', String(!el.hidden));
}

// "Hỏi Lulu" on a gap/listen sentence: the next letter of the first blank that
// isn't right yet — never typed in for the student. WBW_MAX_ASKS per sentence.
function gfAskLulu() {
  const g = _gf;
  const btn = document.getElementById('gf-ask');
  if (!_gfActive() || g.done || g.mode === 'mcq' || g.asks >= WBW_MAX_ASKS) return;
  const inputs = _gfInputs();
  const k = _gfResults().findIndex(r => !r);
  if (k < 0) { if (window.AskLulu) window.AskLulu.say(btn, 'Điền đúng hết rồi đó, bấm Kiểm tra thôi! 🎉'); return; }
  const target = g.blanks[k].text;
  const typed = inputs[k].value;
  let n = 0;
  while (n < typed.length && n < target.length && typed[n].toLowerCase() === target[n].toLowerCase()) n++;
  const next = target.charAt(n);
  g.asks++;
  g.q._luluAsks = g.asks;
  if (window.AskLulu) {
    window.AskLulu.left(btn, WBW_MAX_ASKS - g.asks);
    window.AskLulu.say(btn, `Ô ${k + 1}: chữ tiếp theo là “${next === ' ' ? 'dấu cách' : next}” — bắt đầu “${target.slice(0, n + 1)}${n + 1 < target.length ? '…' : ''}” 🍊`);
  }
  inputs[k].focus();
}

// Speaks a whole English sentence (Web Speech, best available voice).
function _speakSentence(text, slow) {
  const synth = window.speechSynthesis;
  if (synth && typeof SpeechSynthesisUtterance !== 'undefined') {
    try {
      if (window.WordAudio && window.WordAudio.stop) window.WordAudio.stop();
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = slow ? 0.7 : 0.95;
      const voices = synth.getVoices().filter(v => /^en[-_]/i.test(v.lang));
      const good = /Google|Natural|Neural|Online|Samantha|Aria|Jenny|Ava|Allison/i;
      const v = voices.find(x => /^en[-_]US/i.test(x.lang) && good.test(x.name)) || voices.find(x => good.test(x.name)) || voices.find(x => /^en[-_]US/i.test(x.lang)) || voices[0];
      if (v) u.voice = v;
      synth.speak(u);
      return;
    } catch {}
  }
  if (window.WordAudio) window.WordAudio.speak(text, { slow });
}

function bindPractice() {
  state.rearrangeAnswer = [];
  state.rearrangeWords  = [];
  state.mcSelected      = null;
  const q = state.questions[state.currentIdx];
  _vocabHintCount = 0;
  _vocabHintList  = (q?.fallbackKeywords || q?.hints || []);
  wbwInit();
  ordInit();
  gfInit();
  // remove previous listener before adding a new one
  if (_practiceKeyHandler) document.removeEventListener('keydown', _practiceKeyHandler);
  _practiceKeyHandler = function(e) {
    if (/^[1-4]$/.test(e.key) && _gfActive() && _gf.mode === 'mcq' && !_gf.done) {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      e.preventDefault();
      gfPick(Number(e.key) - 1);
      return;
    }
    if (e.key !== 'Enter' || e.shiftKey) return;
    const fc = document.getElementById('feedback-card');
    if (fc && !fc.classList.contains('hidden')) { e.preventDefault(); nextPractice(); }
  };
  document.addEventListener('keydown', _practiceKeyHandler);
}

function handleEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitPractice(); }
}

function updateWordCount(ta) {
  const wc = document.getElementById('word-count');
  if (!wc) return;
  const count = ta.value.trim().split(/\s+/).filter(Boolean).length;
  wc.textContent = count + ' từ';
  wc.className = 't2-word-count' + (count >= 60 ? ' good' : '');
}

function selectMC(idx, btn) {
  document.querySelectorAll('.t2-mc-option').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('mc-selected').value = idx;
  state.mcSelected = idx;
  checkSubmitEnabled();
}

function selectWord(chip) {
  if (chip.dataset.used === 'true') return;
  chip.dataset.used = 'true'; chip.classList.add('wp-chip-used');
  state.rearrangeAnswer.push(chip.dataset.word);
  renderRearrangeAnswer();
}

function returnWord(e) {
  if (!e.target.classList.contains('wp-answer-chip')) return;
  const word = e.target.dataset.word;
  state.rearrangeAnswer.splice(parseInt(e.target.dataset.idx), 1);
  let done = false;
  document.querySelectorAll('#rearrange-bank .wp-word-chip').forEach(c => {
    if (!done && c.dataset.word === word && c.dataset.used === 'true') {
      c.dataset.used = 'false'; c.classList.remove('wp-chip-used'); done = true;
    }
  });
  renderRearrangeAnswer();
}

function renderRearrangeAnswer() {
  const area = document.getElementById('rearrange-answer');
  if (!area) return;
  area.innerHTML = '';
  if (!state.rearrangeAnswer.length) {
    area.innerHTML = '<span class="wp-rearrange-placeholder">Bấm vào các từ để sắp xếp...</span>';
  } else {
    state.rearrangeAnswer.forEach((w, i) => {
      const c = document.createElement('span');
      c.className = 'wp-answer-chip'; c.textContent = w;
      c.dataset.word = w; c.dataset.idx = i;
      area.appendChild(c);
    });
  }
  const inp = document.getElementById('rearrange-input');
  if (inp) inp.value = state.rearrangeAnswer.join(' ');
  checkSubmitEnabled();
}

function getUserAnswerPractice() {
  const q = state.questions[state.currentIdx];
  if (!q) return '';
  if (['essay_type_recognition','topic_sentence'].includes(q.type)) return String(document.getElementById('mc-selected')?.value ?? '');
  if (q.type === 'rearrange') return document.getElementById('rearrange-input')?.value?.trim() || '';
  if (q.type === 'fill_blank') return document.getElementById('fill-input')?.value?.trim() || '';
  if (_gfActive()) return _gfFilledText();
  if (_ordActive()) return _ordText();
  return document.getElementById('answer-box')?.value?.trim() || '';
}

async function submitPractice() {
  if (state._isSubmitting) return;
  // A progress dot for an already-answered question stays clickable (so
  // students can review it) — without this guard, jumping back to it via
  // goToQuestion() and submitting again would double-count sessionDone/
  // sessionCorrect/XP and push a second sessionAttempts entry for the same
  // questionId.
  const status = state.questionStatus[state.currentIdx];
  if (status === 'correct' || status === 'wrong') {
    showToast('Câu này đã trả lời rồi.', 'info');
    return;
  }
  const q = state.questions[state.currentIdx];
  let answer = getUserAnswerPractice();
  // A drill fail may come before the first word is done — nothing typed yet.
  const wbwFail = _wbwFailPending && WBW_TYPES.has(q.type) && !!q.translationAnswer ? _wbwFailPending : null;
  _wbwFailPending = null;
  if (!wbwFail && (answer === '' || answer === undefined)) { showToast('Vui lòng nhập câu trả lời!', 'warn'); return; }

  // The word-by-word drill validates every character against q.translationAnswer,
  // so a finished sentence is guaranteed correct — grade it locally and skip the
  // "✨ AI đang chấm bài..." round-trip. Only trusts the flag set by _wbwComplete()
  // and re-checks the text is an exact match; anything else falls back to the API.
  const wbwVerbatim = _wbwVerbatimPending && WBW_TYPES.has(q.type)
    && !!q.translationAnswer && answer === q.translationAnswer;
  _wbwVerbatimPending = false;

  // Phrase ordering is checked here, no AI: a wrong order below the
  // ORD_MAX_TRIES cap just marks the slip and lets the student fix it.
  let ordOk = false, ordFail = false;
  if (_ordActive()) {
    const o = _ord;
    if (o.picked.length < o.chunks.length) { showToast('Hãy xếp hết các cụm đã nhé.', 'warn'); return; }
    ordOk = _ordFirstWrong() < 0;
    if (!ordOk) {
      o.tries++;
      q._ordTries = o.tries;
      if (o.tries < ORD_MAX_TRIES) {
        o.wrongFrom = _ordFirstWrong();
        _ordRender();
        playWrong();
        showToast(`Chưa đúng thứ tự — từ cụm tô đỏ trở đi là sai chỗ. Còn ${ORD_MAX_TRIES - o.tries} lần thử.`, 'warn', 2800);
        return;
      }
      ordFail = true;
    }
    o.done = true;
    o.wrongFrom = ordOk ? -1 : _ordFirstWrong();
    _ordRender();
  }

  // Chọn cụm / điền cụm / nghe & điền — checked here against the model, no AI.
  // A typed blank gets GF_MAX_TRIES tries; a multiple-choice pick gets one.
  let gfOk = false, gfFail = false;
  if (_gfActive()) {
    const g = _gf;
    if (g.mode === 'mcq') {
      if (g.picked == null) { showToast('Hãy chọn một đáp án.', 'warn'); return; }
      gfOk = !!g.options[g.picked].ok;
    } else {
      const inputs = _gfInputs();
      if (inputs.some(i => !i.value.trim())) { showToast('Hãy điền hết các chỗ trống nhé.', 'warn'); inputs.find(i => !i.value.trim())?.focus(); return; }
      const res = _gfResults();
      gfOk = res.every(Boolean);
      if (!gfOk) {
        g.tries++;
        q._gfTries = g.tries;
        if (g.tries < GF_MAX_TRIES) {
          inputs.forEach((inp, k) => { inp.classList.toggle('is-wrong', !res[k]); inp.classList.toggle('is-ok', res[k]); });
          playWrong();
          _gfUpdateBar();
          showToast(`Chưa đúng — ô tô đỏ cần sửa. Còn ${GF_MAX_TRIES - g.tries} lần thử.`, 'warn', 2800);
          inputs.find((inp, k) => !res[k])?.select();
          return;
        }
      }
    }
    gfFail = !gfOk;
    g.done = true;
    _gfLock();
    answer = gfOk ? q.translationAnswer : _gfFilledText();
  }

  const AI_TYPES = new Set(['translation', 'error_correction', 'short_writing', 'paraphrase']);
  state._isSubmitting = true;
  document.getElementById('submit-btn').disabled = true;

  try {
    let data;
    const viLine = _gfActive() && _gf.mode === 'listen' ? ` Nghĩa: “${_sentenceParts(q.questionText).vi}”` : '';
    if (gfFail) {
      const requeued = _requeueQuestion(state.currentIdx);
      data = {
        success: true, isCorrect: false, score: 0,
        modelAnswer: q.translationAnswer,
        feedbackVi: (_gf.mode === 'mcq' ? 'Chọn chưa đúng. ' : `Bạn điền sai ${GF_MAX_TRIES} lần nên câu này tính là sai. `)
          + (requeued
            ? `Xem kỹ cụm tô màu trong câu mẫu — câu này sẽ quay lại ở phía sau${_gf.mode === 'mcq' ? ' (lần này bạn tự điền)' : ''} 💪`
            : 'Xem kỹ câu mẫu rồi ôn lại ở "Ôn lại câu sai" sau buổi nhé.') + viLine,
        explanationVi: q.explanationVi || '',
        aiGraded: false
      };
    } else if (gfOk) {
      data = {
        success: true, isCorrect: true, score: 100,
        modelAnswer: q.translationAnswer,
        feedbackVi: 'Chính xác! Đọc lại cả câu và để ý cụm tô màu nhé.' + viLine,
        explanationVi: q.explanationVi || '',
        aiGraded: false
      };
    } else if (ordFail) {
      const requeued = _requeueQuestion(state.currentIdx);
      data = {
        success: true, isCorrect: false, score: 0,
        modelAnswer: q.translationAnswer,
        feedbackVi: `Bạn xếp sai thứ tự ${ORD_MAX_TRIES} lần nên câu này tính là sai. `
          + (requeued
            ? 'Xem kỹ đoạn mẫu nhé — câu này sẽ quay lại ở phía sau để bạn làm lại 💪'
            : 'Xem kỹ đoạn mẫu rồi ôn lại ở "Ôn lại câu sai" sau buổi nhé.'),
        explanationVi: q.explanationVi || '',
        aiGraded: false
      };
    } else if (ordOk) {
      data = {
        success: true, isCorrect: true, score: 100,
        modelAnswer: q.translationAnswer,
        feedbackVi: 'Chính xác! Bạn đã ghép đúng thứ tự đoạn kết bài.',
        explanationVi: q.explanationVi || '',
        aiGraded: false
      };
    } else if (wbwFail) {
      const requeued = _requeueQuestion(state.currentIdx);
      const stuckWord = wbwFail.word ? `từ “${wbwFail.word}”` : 'một từ';
      data = {
        success: true, isCorrect: false, score: 0,
        modelAnswer: q.translationAnswer,
        feedbackVi: `Bạn gõ sai ${stuckWord} ${WBW_MAX_WORD_ERRORS} lần nên câu này tính là sai. `
          + (requeued
            ? 'Xem kỹ đáp án mẫu nhé — câu này sẽ quay lại ở phía sau để bạn làm lại 💪'
            : 'Xem kỹ đáp án mẫu rồi ôn lại ở "Ôn lại câu sai" sau buổi nhé.'),
        explanationVi: q.explanationVi || '',
        aiGraded: false
      };
    } else if (wbwVerbatim) {
      data = {
        success: true, isCorrect: true, score: 100,
        modelAnswer: q.translationAnswer,
        feedbackVi: 'Chính xác! Bạn đã gõ đúng từng chữ của câu mẫu.',
        explanationVi: q.explanationVi || '',
        aiGraded: false
      };
    } else {
      const loaderText = document.getElementById('checking-loader-text');
      if (loaderText) loaderText.textContent = AI_TYPES.has(q.type) ? '✨ AI đang chấm bài...' : 'Đang chấm bài...';
      document.getElementById('checking-loader').classList.remove('hidden');
      data = await apiFetch('/api/task2/check', {
        method: 'POST',
        body: JSON.stringify({ topicId: state.selectedTopic._id, questionId: q.questionId || q._id, userAnswer: answer })
      });
    }
    if (!data.success) throw new Error(data.message);

    const isOk = data.isCorrect;
    isOk ? playOk() : playWrong();
    state.sessionDone++;
    if (isOk) { state.sessionCorrect++; updateXPStorage(q.xpReward || 5, true); }
    updateSessionStats();

    // Update progress dot for current question
    state.questionStatus[state.currentIdx] = isOk ? 'correct' : 'wrong';
    const dot = document.querySelector(`#q-dots .t2-q-dot[data-qi="${state.currentIdx}"]`);
    if (dot) {
      dot.classList.remove('t2-dot-current');
      dot.classList.add(isOk ? 't2-dot-ok' : 't2-dot-err');
    }

    state.sessionAttempts.push({
      questionId: q.questionId || q._id,
      userAnswer: answer,
      isCorrect: isOk,
      score: data.score || 0,
      modelAnswer: data.modelAnswer || '',
      feedbackVi: data.feedbackVi || '',
      questionText: q.questionText || '',
      type: q.type
    });
    // A half-typed failed sentence isn't worth showing in the writer's list.
    if (WBW_TYPES.has(q.type) && !wbwFail && !ordFail && !gfFail) _noteMySentence(q, answer, isOk);
    saveDraft(); // fire-and-forget

    // show feedback
    const mc = ['essay_type_recognition','topic_sentence'].includes(q.type);
    if (mc) {
      const idx = parseInt(answer);
      const correctText = data.modelAnswer || '';
      document.querySelectorAll('.t2-mc-option').forEach((btn, i) => {
        const optText = btn.querySelector('span:last-child')?.textContent || '';
        if (i === idx) btn.classList.add(isOk ? 'correct' : 'wrong');
        // highlight correct option when user was wrong
        if (!isOk && correctText && optText === correctText) btn.classList.add('correct');
      });
      document.getElementById('comparison-box').style.display = 'none';
    } else {
      document.getElementById('comparison-box').style.display = '';
      const studentEl = document.getElementById('student-answer-display');
      if (gfOk || gfFail) studentEl.innerHTML = _gfStudentHtml();
      else studentEl.textContent = wbwFail
        ? (answer ? answer + ' …' : '(chưa gõ xong từ nào)')
        : answer;
      // The key phrase (the sentence's collocation) is coloured in the model.
      const modelEl = document.getElementById('model-answer-display');
      const spans = data.modelAnswer === q.translationAnswer ? _gfBlanks(q) : [];
      if (spans.length) modelEl.innerHTML = _spansHtml(data.modelAnswer, spans, s => `<mark class="t2-key">${_escHtml(s)}</mark>`);
      else modelEl.textContent = data.modelAnswer || '';
    }

    const expBox = document.getElementById('explanation-box');
    if (data.explanationVi) {
      document.getElementById('explanation-text').textContent = data.explanationVi;
      expBox.classList.remove('hidden');
    } else expBox.classList.add('hidden');

    const bannerEl = document.getElementById('result-banner');
    const aiBadge = data.aiGraded ? ' <span class="t2-ai-badge"><i class="fas fa-robot"></i> AI</span>' : '';
    bannerEl.innerHTML = (isOk ? '✅ Chính xác!' : '❌ Chưa đúng') + aiBadge;
    bannerEl.className = 'wp-result-banner ' + (isOk ? 'wp-result-correct' : 'wp-result-wrong');
    const fbEl = document.getElementById('feedback-text');
    fbEl.textContent = data.feedbackVi || '';
    fbEl.classList.toggle('hidden', !data.feedbackVi);

    document.getElementById('qcard').classList.add('hidden');
    document.getElementById('feedback-card').classList.remove('hidden');

    // auto-next on correct answer
    clearTimeout(_autoNextTimer);
    const cdBar = document.getElementById('t2-countdown-bar');
    if (cdBar) cdBar.style.display = 'none';
    if (state.autoNext && isOk && cdBar) {
      const dur = 1500;
      cdBar.innerHTML = `<div class="t2-countdown-bar" style="--cd-dur:${dur}ms"></div>`;
      cdBar.style.display = 'block';
      _autoNextTimer = setTimeout(nextPractice, dur);
    }
  } catch (err) {
    showToast('Lỗi chấm bài: ' + err.message, 'error');
    document.getElementById('submit-btn').disabled = false;
  } finally {
    document.getElementById('checking-loader').classList.add('hidden');
    state._isSubmitting = false;
  }
}

function nextPractice() {
  clearTimeout(_autoNextTimer);
  state.currentIdx++;
  if (state.currentIdx >= state.questions.length) {
    state.view = 'done'; render(); savePracticeAttempt(); return;
  }
  state.mcSelected = null; state.rearrangeAnswer = [];
  render();
}

function goToQuestion(i) {
  if (state._isSubmitting || i === state.currentIdx) return;
  clearTimeout(_autoNextTimer);
  state.currentIdx = i;
  state.mcSelected = null; state.rearrangeAnswer = [];
  render();
}

function quitPractice() {
  const cleanup = () => {
    if (_practiceKeyHandler) { document.removeEventListener('keydown', _practiceKeyHandler); _practiceKeyHandler = null; }
  };
  if (state.sessionDone > 0) {
    askT2Quit(() => {
      cleanup();
      // Only a session that actually reached the last question records a real
      // attempt. Quitting part-way through saves a resumable draft instead —
      // otherwise a 2-of-8 subset at 100% would count as "hoàn thành" for a
      // homework assignment (server also enforces this, see
      // resourceCompletionService coverage gate).
      if (state.sessionDone >= state.questions.length) {
        savePracticeAttempt();
      } else {
        saveDraft();
      }
      state.view = 'done'; render();
    }, {
      mascot: '✏️',
      title: 'Dừng luyện tập?',
      sub: `Bạn đã làm ${state.sessionDone} câu. Xem tổng kết phiên học nhé!`,
      confirmText: 'Xem kết quả',
      continueText: 'Tiếp tục học',
      onSave: () => {
        cleanup();
        saveDraft();
        // Optimistically update state so select screen + week card reflect the saved draft immediately
        const savedDraft = {
          topicId:        state.selectedTopic._id,
          topicName:      state.selectedTopic.topicName,
          week:           state.selectedWeek,
          level:          state.selectedLevel,
          mode:           state.currentMode,
          currentIdx:     state.sessionDone,
          questionIds:    state.questions.map(q => q.questionId || q._id),
          savedAt:        new Date().toISOString(),
          sessionDone:    state.sessionDone,
          sessionAttempts:state.sessionAttempts,
          questionStatus: state.questionStatus,
          sessionCorrect: state.sessionCorrect
        };
        state.draft = savedDraft;
        const existIdx = state.allDrafts.findIndex(d => d.topicId === state.selectedTopic._id);
        if (existIdx >= 0) state.allDrafts[existIdx] = savedDraft;
        else state.allDrafts.push(savedDraft);
        backToHub();
      }
    });
  } else {
    cleanup();
    backToHub();
  }
}

// ════════════════════════════════════════════════════════
//  EXAM MODE
// ════════════════════════════════════════════════════════
// Delegates to js/shared/utils.js (single source of truth — student UI
// audit Nhóm 2, 2026-07-25; was duplicated with task2-template.html's fmtTime).
function _fmtExamTime(s) { return fmtMMSS(s); }

function startExamTimer(totalSeconds) {
  stopExamTimer();
  state.examTotalTime = totalSeconds;
  state.examTimeLeft  = totalSeconds;
  function tick() {
    const el = document.getElementById('exam-timer');
    if (!el) return;
    el.textContent = '⏱ ' + _fmtExamTime(state.examTimeLeft);
    const pct = state.examTotalTime > 0 ? state.examTimeLeft / state.examTotalTime : 1;
    el.className = 'wp-test-timer' + (pct <= 0.1 ? ' danger' : pct <= 0.25 ? ' warn' : '');
    if (state.examTimeLeft <= 0) {
      stopExamTimer();
      showToast('Hết giờ! Tự động nộp bài.', 'warn', 4000);
      submitExam();
      return;
    }
    state.examTimeLeft--;
  }
  tick();
  state.examTimerInterval = setInterval(tick, 1000);
}

function stopExamTimer() {
  clearInterval(state.examTimerInterval);
  state.examTimerInterval = null;
}

function _stopExamSession() {
  stopExamTimer();
  if (_examKeyHandler) { document.removeEventListener('keydown', _examKeyHandler); _examKeyHandler = null; }
}

function quitExam() {
  if (state.examAnswers.length === 0) { _stopExamSession(); backToHub(); return; }
  askT2Quit(() => { _stopExamSession(); backToHub(); }, {
    mascot: '📋',
    title: 'Dừng bài thi?',
    sub: `Câu ${state.examIdx + 1}/${state.examQuestions.length}. Kết quả sẽ bị mất.`,
    confirmText: 'Dừng lại',
    continueText: 'Tiếp tục thi'
  });
}

function startExam(btn) { return _withBusy(btn, _startExam); }
async function _startExam() {
  if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
    if (window.openUpgradeModal) window.openUpgradeModal();
    return;
  }
  try {
    const level = state.selectedLevel;
    const params = new URLSearchParams({ level, count: state.examCount });
    if (state.selectedTopic) params.set('week', state.selectedWeek);
    const data = await apiFetch(`/api/task2/exam?${params}`);
    if (!data.questions?.length) { showToast('Chưa có đủ câu hỏi', 'warn'); return; }
    state.examQuestions = data.questions;
    state.examAnswers   = [];
    state.examIdx       = 0;
    state.rearrangeAnswer = []; state.mcSelected = null;
    // See startPractice()'s comment — same "select" checkpoint trick so
    // browser Back exits the exam back to 'select' instead of skipping it.
    if (state.selectedTopic) history.pushState({ view: 'select', week: state.selectedWeek, topicId: state.selectedTopic._id }, '', location.href);
    state.currentMode = 'exam';
    state.view = 'exam'; render();
    window.scrollTo(0, 0);
    startExamTimer(state.examQuestions.length * 120);
  } catch { showToast('Lỗi tải đề thi', 'error'); }
}

function renderExam() {
  const q = state.examQuestions[state.examIdx];
  if (!q) return '';
  const pct = Math.round((state.examIdx / state.examQuestions.length) * 100);
  const isLast = state.examIdx === state.examQuestions.length - 1;
  const timerPct = state.examTotalTime > 0 ? state.examTimeLeft / state.examTotalTime : 1;
  const timerCls = timerPct <= 0.1 ? 'wp-test-timer danger' : timerPct <= 0.25 ? 'wp-test-timer warn' : 'wp-test-timer';
  const timerTxt = state.examTimeLeft > 0 ? _fmtExamTime(state.examTimeLeft) : '--:--';
  return `
    <div class="t2-nav" style="padding:8px 20px;display:flex;align-items:center;justify-content:space-between">
      <button class="t2-back-btn" onclick="quitExam()"><i class="fas fa-times"></i> Thoát</button>
      <span style="font-size:12px;color:#9ca3af;font-weight:600">🎓 Thi thử</span>
    </div>
    <div class="wp-progress-bar-wrap"><div class="wp-progress-bar" style="width:${pct}%"></div></div>
    <div class="t2-q-dots" style="padding:4px 20px 2px;justify-content:center">
      ${state.examQuestions.map((_, i) => {
        const answered = i < state.examIdx;
        const current  = i === state.examIdx;
        return `<span class="t2-q-dot ${answered ? 't2-dot-ok' : current ? 't2-dot-current' : ''}" title="Câu ${i+1}"></span>`;
      }).join('')}
    </div>
    <div class="wp-exercise-meta" style="padding:8px 20px">
      <span class="wp-ex-counter">${state.examIdx + 1} / ${state.examQuestions.length}</span>
      <span class="${timerCls}" id="exam-timer">⏱ ${timerTxt}</span>
      <span style="color:${LEVEL_COLORS[q.level]||'#6b7280'};font-size:12px;font-weight:700;text-transform:uppercase">${q.level}</span>
      ${q.topicName ? `<span style="font-size:11px;color:#6b7280;background:#f3f4f6;padding:2px 8px;border-radius:12px;margin-left:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px" title="${_escHtml(q.topicName)}">${_escHtml(q.topicName)}</span>` : ''}
    </div>
    ${q.prompt ? `<div class="t2-prompt-box"><div class="t2-prompt-box-label">📋 Đề bài</div><p>${_escHtml(q.prompt)}</p></div>` : ''}
    <div class="wp-card" style="margin:0 20px">
      ${renderQuestion(q)}
      <button class="wp-submit-btn" style="margin-top:12px;width:100%" onclick="examNext()">
        ${isLast
          ? '<i class="fas fa-check"></i> Nộp bài'
          : `Tiếp theo <i class="fas fa-arrow-right"></i> <span style="font-size:10px;opacity:.55;margin-left:4px;font-weight:400">Enter ↵</span>`}
      </button>
    </div>`;
}

function bindExam() {
  state.rearrangeAnswer = []; state.mcSelected = null;
  if (_examKeyHandler) document.removeEventListener('keydown', _examKeyHandler);
  _examKeyHandler = function(e) {
    if (e.key !== 'Enter' || e.shiftKey) return;
    // Don't intercept Enter inside a textarea (multi-line)
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
    e.preventDefault();
    examNext();
  };
  document.addEventListener('keydown', _examKeyHandler);
}

function getExamAnswer() {
  const q = state.examQuestions[state.examIdx];
  if (!q) return '';
  if (['essay_type_recognition','topic_sentence'].includes(q.type)) return String(document.getElementById('mc-selected')?.value ?? '');
  if (q.type === 'rearrange') return document.getElementById('rearrange-input')?.value?.trim() || '';
  if (q.type === 'fill_blank') return document.getElementById('fill-input')?.value?.trim() || '';
  return document.getElementById('answer-box')?.value?.trim() || '';
}

async function examNext() {
  const q = state.examQuestions[state.examIdx];
  const answer = getExamAnswer();
  if (!answer && answer !== '0') {
    showToast('Vui lòng trả lời câu hỏi trước khi tiếp tục!', 'warn', 2500);
    return;
  }
  state.examAnswers.push({ topicId: q.topicId || state.selectedTopic._id, questionId: q.questionId || q._id, userAnswer: answer });
  state.examIdx++;
  if (state.examIdx >= state.examQuestions.length) {
    await submitExam();
  } else {
    state.rearrangeAnswer = []; state.mcSelected = null;
    render();
  }
}

async function submitExam() {
  _stopExamSession();
  const app = document.getElementById('app');
  app.innerHTML = '<div style="text-align:center;padding:40px"><div class="wp-spinner"></div><p>Đang chấm bài...</p></div>';
  try {
    const data = await apiFetch('/api/task2/exam/submit', { method: 'POST', timeoutMs: 45000, body: JSON.stringify({ answers: state.examAnswers }) });
    if (!data.success) throw new Error(data.message);
    state.examResults = data;
    state.view = 'examDone'; render();
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(e.message || ''));
    const msg = aborted
      ? 'Chấm bài quá lâu — server có thể đang khởi động. Bài làm của bạn vẫn còn, hãy thử chấm lại.'
      : 'Lỗi chấm bài: ' + _escHtml(e.message || '');
    app.innerHTML = `<div style="text-align:center;padding:40px">`
      + `<p style="color:#dc2626;margin-bottom:14px">${msg}</p>`
      + `<button onclick="submitExam()" style="background:var(--brand,#e53935);color:#fff;border:none;border-radius:8px;padding:9px 20px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Thử chấm lại</button>`
      + `</div>`;
  }
}

function renderExamDone() {
  const r = state.examResults;
  const scoreClass = r.score >= 70 ? 'wp-score-good' : r.score >= 40 ? 'wp-score-mid' : 'wp-score-bad';
  const { emoji, message } = getScoreMessage(r.score);
  const t2ExamImgSrc = r.score >= 90 ? 'img/vocab_writingabove90%25.jpg'
                      : r.score >= 70 ? 'img/above7.5.jpg'
                      : r.score >= 60 ? 'img/band_6_7.jpg'
                      : r.score >= 50 ? 'img/writingbelow60%25.jpg'
                      : r.score >= 45 ? 'img/writingbelow50%25.jpg'
                      : 'img/writingbelow45%25.jpg';
  const reviews = (r.results || []).map((item, i) => `
    <div class="${item.isCorrect ? 'wp-wr-item-ok' : 'wp-wr-item'}">
      <div class="${item.isCorrect ? 'wp-wr-num-ok' : 'wp-wr-num'}">
        ${item.isCorrect ? '✅' : '❌'} Câu ${i+1} — ${Q_LABELS[item.type] || item.type}
        <span class="wp-wr-skill">${item.level} · ${_escHtml(item.topicName || '')}</span>
      </div>
      <div class="wp-wr-q">${_escHtml(item.questionText || '')}</div>
      <div class="wp-wr-row"><span class="wp-wr-lbl-you">Bạn:</span> <span class="${item.isCorrect ? 'wp-wr-ans' : 'wp-wr-your'}">${_escHtml(item.userAnswer || '') || '(bỏ trống)'}</span></div>
      ${!item.isCorrect ? `<div class="wp-wr-row"><span class="wp-wr-lbl-ans">Đáp án:</span> <span class="wp-wr-ans">${_escHtml(item.modelAnswer || '')}</span></div>` : ''}
      ${item.explanationVi ? `<div class="wp-wr-gp">💡 ${_escHtml(item.explanationVi)}</div>` : ''}
    </div>`).join('');
  return `
    <div style="text-align:center;padding:32px 20px 16px">
      <img src="${t2ExamImgSrc}" alt="" style="display:block;width:100%;max-width:220px;border-radius:12px;margin:0 auto 12px;object-fit:cover">
      ${window.Mascot && window.Mascot.reactHtml
        ? window.Mascot.reactHtml({ pct: r.score, text: message, stacked: true })
        : `<div style="font-size:52px">${emoji}</div>`}
      <div class="t2-done-score ${scoreClass}">${r.score}%</div>
      <div style="font-size:15px;color:#6b7280;margin-bottom:16px">${window.Mascot && window.Mascot.reactHtml ? '' : message + ' '}Đúng ${r.correct} / ${r.total} câu</div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="wp-restart-btn" onclick="startExam(this)"><i class="fas fa-redo"></i> Thi lại</button>
        <button class="wp-more-btn"    onclick="backToHub()"><i class="fas fa-arrow-left"></i> Về chủ đề</button>
      </div>
    </div>
    <div style="padding:0 20px 20px">${reviews}</div>`;
}

// ════════════════════════════════════════════════════════
//  VOCABULARY — save to book + optional quiz (inline on the topic hub)
// ════════════════════════════════════════════════════════
function _vocabItem(v) { return { word: v.term, meaning: v.definitionVi || '', example: v.example || '' }; }

// Shared save callback. When this save is the one that completes the list,
// say so and move the student on to the brainstorm step.
function _onVocabSaved(topicId, terms) {
  const wasSaved = isVocabLearned(topicId);
  _markVocabTermsSaved(topicId, terms);
  pushVocabProgress({ topicId, savedTerms: terms });
  if (state.view !== 'select' || state.selectedTopic?._id !== topicId) return;
  if (!wasSaved && isVocabLearned(topicId)) {
    state.vocabOpen = null; // auto → list collapses now that every term is saved
    render();
    if (isVocabStepDone(topicId)) {
      showToast('🎉 Đã mở khoá các bước tiếp theo! Tiếp theo: brainstorm ý tưởng.', 'success', 3500);
      setTimeout(() => scrollToHubStep('ideas'), 150);
    } else {
      showToast(`Đã lưu đủ từ! Giờ làm quiz từ vựng đạt ≥ ${VQUIZ_PASS}% để mở khoá bước tiếp theo.`, 'success', 4000);
    }
  } else {
    render();
  }
}

function saveOneVocabToBook(idx) {
  const v = state.vocab[idx];
  if (!v || !window.openVocabBookPickerBulk) return;
  const topicId = state.selectedTopic._id;
  window.openVocabBookPickerBulk([_vocabItem(v)], terms => _onVocabSaved(topicId, terms));
}

function saveAllVocabToBook() {
  if (!state.vocab.length || !window.openVocabBookPickerBulk) return;
  const topicId = state.selectedTopic._id;
  const savedSet = _savedTermsForTopic(topicId);
  const pending = state.vocab.filter(v => !savedSet.has(v.term));
  window.openVocabBookPickerBulk((pending.length ? pending : state.vocab).map(_vocabItem), terms => _onVocabSaved(topicId, terms));
}

function speakVocab(idx) {
  const v = state.vocab[idx];
  if (!v) return;
  if (window.WordAudio) { window.WordAudio.speak(v.term); return; }
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(v.term);
  u.lang = 'en-US';
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

// ── Vocab quiz — required: step ① is done only once the best score reaches
// VQUIZ_PASS% (isVocabQuizPassed). Up to 25 terms, each asked one of three
// ways: Vietnamese meaning → English term, term → meaning, or the term
// blanked out of its own example sentence. The quiz is fixed per topic —
// every pick is drawn from an RNG seeded by the topic id, so every student
// (and every retry) gets the same questions in the same order. Best score
// per topic is synced to the server (pushVocabProgress).
const VQUIZ_LEN = 25;
const VQUIZ_PASS = 70;
function _vquizPossible(list) { return (list || []).filter(v => v.term && v.definitionVi).length >= 4; }
const VQUIZ_BEST_KEY = 't2_vocab_quiz_best';
const VQUIZ_KIND_LABEL = { vi2en: 'Chọn từ tiếng Anh đúng nghĩa', en2vi: 'Chọn nghĩa đúng', gap: 'Chọn từ điền vào chỗ trống' };
let _vquizBest = _safeParse(localStorage.getItem(VQUIZ_BEST_KEY), {});
let _vquizTimer = null;

function _vquizGap(v) {
  if (!v.example || !v.term) return null;
  const re = new RegExp(v.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return re.test(v.example) ? v.example.replace(re, '_____') : null;
}

// mulberry32 seeded from a string hash — deterministic per topic.
function _seededRng(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = (h + 0x6D2B79F5) | 0;
    let x = Math.imul(h ^ (h >>> 15), 1 | h);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function _buildVocabQuiz(list, seed) {
  const rng = _seededRng(seed);
  const usable = list.filter(v => v.term && v.definitionVi);
  return shuffle([...usable], rng).slice(0, VQUIZ_LEN).map(v => {
    const gap = _vquizGap(v);
    // Using the term in a sentence (gap) is what transfers to writing, so it
    // comes up twice as often as the two meaning-only kinds.
    const kinds = gap ? ['vi2en', 'en2vi', 'gap', 'gap'] : ['vi2en', 'en2vi'];
    const kind = kinds[Math.floor(rng() * kinds.length)];
    const field = kind === 'en2vi' ? 'definitionVi' : 'term';
    const answer = v[field];
    const others = [...new Set(usable.map(o => o[field]).filter(x => x && x !== answer))];
    return {
      kind, answer, term: v.term, def: v.definitionVi, ex: v.example || '',
      prompt: kind === 'vi2en' ? v.definitionVi : kind === 'en2vi' ? v.term : gap,
      options: shuffle([answer, ...shuffle(others, rng).slice(0, 3)], rng)
    };
  });
}

function startVocabQuiz() {
  const items = _buildVocabQuiz(state.vocab || [], state.selectedTopic._id);
  if (!items.length) return;
  clearTimeout(_vquizTimer);
  state.vocabQuiz = { items, idx: 0, correct: 0, picked: null, missed: [] };
  _refreshVocabStep();
  scrollToHubStep('vocab');
}

function closeVocabQuiz() {
  clearTimeout(_vquizTimer);
  state.vocabQuiz = null;
  _refreshVocabStep();
}
function continueAfterVocabQuiz() {
  closeVocabQuiz();
  setTimeout(() => scrollToHubStep('ideas'), 60);
}

function pickVocabQuiz(i) {
  const qz = state.vocabQuiz;
  if (!qz || qz.picked != null) return;
  const it = qz.items[qz.idx];
  if (!it || i >= it.options.length) return;
  qz.picked = i;
  const ok = it.options[i] === it.answer;
  if (ok) { qz.correct++; if (window.playOk) playOk(); }
  else { qz.missed.push(it); if (window.playWrong) playWrong(); }
  _refreshVocabStep();
  // Right answers move on by themselves; wrong ones wait so the correct
  // option can be read.
  if (ok) {
    clearTimeout(_vquizTimer);
    const at = qz.idx;
    _vquizTimer = setTimeout(() => { if (state.vocabQuiz === qz && qz.idx === at) nextVocabQuiz(); }, 700);
  }
}

function nextVocabQuiz() {
  const qz = state.vocabQuiz;
  if (!qz || qz.picked == null) return;
  clearTimeout(_vquizTimer);
  qz.idx++;
  qz.picked = null;
  if (qz.idx >= qz.items.length) {
    const id = state.selectedTopic._id;
    const wasDone = isVocabStepDone(id);
    const pct = Math.round((qz.correct / qz.items.length) * 100);
    if (_vquizBest[id] == null || pct > _vquizBest[id]) {
      _vquizBest[id] = pct;
      try { localStorage.setItem(VQUIZ_BEST_KEY, JSON.stringify(_vquizBest)); } catch {}
    }
    pushVocabProgress({ topicId: id, quizBest: pct });
    // This quiz unlocked steps 2–6: the whole hub changes, not just this card.
    if (!wasDone && isVocabStepDone(id)) {
      render();
      showToast('🎉 Đạt quiz từ vựng! Đã mở khoá các bước tiếp theo.', 'success', 3500);
      return;
    }
  }
  _refreshVocabStep();
}

function renderVocabQuiz() {
  const qz = state.vocabQuiz;
  const n = qz.items.length;
  if (qz.idx >= n) {
    const pct = Math.round((qz.correct / n) * 100);
    const pass = pct >= VQUIZ_PASS;
    const saved = isVocabLearned(state.selectedTopic._id);
    return `
      <div class="t2-quiz">
        <div class="t2-quiz-done">
          <div style="font-size:30px">${pct >= 90 ? '🎉' : pass ? '👍' : '📚'}</div>
          <div class="t2-quiz-score">${qz.correct}/${n} · ${pct}%</div>
          <div class="t2-quiz-pass ${pass ? 'ok' : 'bad'}">${pass ? `✓ Đạt (≥ ${VQUIZ_PASS}%)` : `Chưa đạt — cần ≥ ${VQUIZ_PASS}%`}</div>
          <div class="t2-step-desc" style="margin:6px 0 0">${pass
            ? (saved ? 'Tuyệt vời! Bạn đã mở khoá các bước tiếp theo.' : 'Giỏi lắm! Lưu tất cả từ vào sổ nữa là mở khoá bước tiếp theo.')
            : 'Ôn lại các từ dưới đây rồi làm lại quiz nhé.'}</div>
        </div>
        ${qz.missed.length ? `<div class="t2-quiz-miss">${qz.missed.map(m => `<div class="t2-quiz-miss-item">• <b>${_escHtml(m.term)}</b> — ${_escHtml(m.def)}${m.ex ? `<div class="t2-vitem-ex">${_markTermHtml(m.ex, m.term)}</div>` : ''}</div>`).join('')}</div>` : ''}
        <div class="t2-actions" style="justify-content:center;margin-top:12px">
          ${pass
            ? `<button class="t2-primary" onclick="${saved ? 'continueAfterVocabQuiz()' : 'closeVocabQuiz()'}">${saved ? 'Tiếp tục <i class="fas fa-arrow-right"></i>' : 'Đóng quiz'}</button>
               <button class="t2-secondary" onclick="startVocabQuiz()"><i class="fas fa-redo"></i> Làm lại quiz</button>`
            : `<button class="t2-primary" onclick="startVocabQuiz()"><i class="fas fa-redo"></i> Làm lại quiz</button>
               <button class="t2-secondary" onclick="closeVocabQuiz()">Đóng quiz</button>`}
        </div>
      </div>`;
  }
  const it = qz.items[qz.idx];
  const answered = qz.picked != null;
  const ok = answered && it.options[qz.picked] === it.answer;
  return `
    <div class="t2-quiz">
      <div class="t2-quiz-top">
        <span><i class="fas fa-bolt" style="color:#6366f1"></i> Câu ${qz.idx + 1}/${n}</span>
        <button class="t2-link" onclick="closeVocabQuiz()" style="padding:0"><i class="fas fa-times"></i> Đóng</button>
      </div>
      <div class="t2-meter" style="margin:8px 0 0"><span style="width:${Math.round((qz.idx / n) * 100)}%"></span></div>
      <div class="t2-quiz-kind">${VQUIZ_KIND_LABEL[it.kind]}</div>
      <div class="t2-quiz-q">${it.kind === 'gap' ? `"${_escHtml(it.prompt)}"` : _escHtml(it.prompt)}</div>
      <div class="t2-quiz-opts">
        ${it.options.map((o, i) => {
          const cls = answered ? (o === it.answer ? ' correct' : i === qz.picked ? ' wrong' : '') : '';
          return `<button class="t2-quiz-opt${cls}" onclick="pickVocabQuiz(${i})" ${answered ? 'disabled' : ''}><span class="t2-quiz-key">${i + 1}</span><span>${_escHtml(o)}</span></button>`;
        }).join('')}
      </div>
      <div class="t2-quiz-foot">
        ${answered
          ? `<span class="t2-quiz-fb ${ok ? 'ok' : 'bad'}">${ok ? '✓ Chính xác!' : `✗ Đáp án: ${_escHtml(it.answer)}`}</span>
             ${ok ? '' : `<button class="t2-primary is-sm" onclick="nextVocabQuiz()">Câu tiếp <i class="fas fa-arrow-right"></i></button>`}
             ${!ok && it.ex ? `<div class="t2-quiz-ex"><b>${_escHtml(it.term)}</b> = ${_escHtml(it.def)}<br>${_markTermHtml(it.ex, it.term)}</div>` : ''}`
          : `<span class="t2-step-desc" style="margin:0;font-size:12px">Mẹo: bấm phím 1–4 để chọn nhanh</span>`}
      </div>
    </div>`;
}

// 1–4 picks an option, Enter goes on — only while a quiz question is showing
// and the student isn't typing somewhere (brainstorm boxes).
document.addEventListener('keydown', e => {
  const qz = state.vocabQuiz;
  if (!qz || state.view !== 'select' || qz.idx >= qz.items.length) return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  if (/^[1-4]$/.test(e.key) && qz.picked == null) {
    e.preventDefault();
    pickVocabQuiz(Number(e.key) - 1);
  } else if (e.key === 'Enter' && qz.picked != null) {
    e.preventDefault();
    nextVocabQuiz();
  }
});

// ════════════════════════════════════════════════════════
//  DONE SCREEN
// ════════════════════════════════════════════════════════
function renderDone() {
  const pct = state.sessionDone > 0 ? Math.round((state.sessionCorrect / state.sessionDone) * 100) : 0;
  const topicId = state.selectedTopic?._id;
  if (topicId && state.sessionDone > 0) saveTopicScore(topicId, pct);
  const topicStatusHtml = topicId ? topicStatusRowHtml(topicId) : '';
  const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚';
  const scoreClass = pct >= 80 ? 'wp-score-good' : pct >= 50 ? 'wp-score-mid' : 'wp-score-bad';
  const t2DoneImgSrc = pct >= 90 ? 'img/vocab_writingabove90%25.jpg'
                      : pct >= 70 ? 'img/above7.5.jpg'
                      : pct >= 60 ? 'img/band_6_7.jpg'
                      : pct >= 50 ? 'img/writingbelow60%25.jpg'
                      : pct >= 45 ? 'img/writingbelow50%25.jpg'
                      : 'img/writingbelow45%25.jpg';
  const wrongAttempts = state.sessionAttempts.filter(a => !a.isCorrect);
  const wrongCount = wrongAttempts.length;
  // Next step of the lesson: the split-screen writer (translated sentences
  // on the left). Shown after a sentence-translation run.
  const canWriteLesson = !!(topicId && state.translateOnly && window.AuthService && window.AuthService.isLoggedIn() && isWritingUnlocked(topicId));
  const writeLockedNote = !!(topicId && state.translateOnly && window.AuthService && window.AuthService.isLoggedIn() && !canWriteLesson);

  const wrongReview = wrongAttempts.map((a, i) => `
    <div class="wp-wr-item">
      <div class="wp-wr-num">❌ Câu ${i+1} — ${Q_LABELS[a.type] || a.type}</div>
      <div class="wp-wr-q" style="white-space:pre-line">${_escHtml(a.questionText || '')}</div>
      <div class="wp-wr-row"><span class="wp-wr-lbl-you">Bạn trả lời:</span> <span class="wp-wr-your">${_escHtml(a.userAnswer || '') || '(bỏ trống)'}</span></div>
      <div class="wp-wr-row"><span class="wp-wr-lbl-ans">Đáp án đúng:</span> <span class="wp-wr-ans">${_escHtml(a.modelAnswer || '')}</span></div>
      ${a.feedbackVi ? `<div class="wp-wr-gp">${_escHtml(a.feedbackVi)}</div>` : ''}
    </div>`).join('');

  return `
    <div class="t2-done">
      <img src="${t2DoneImgSrc}" alt="" style="display:block;width:100%;max-width:220px;border-radius:12px;margin:0 auto 12px;object-fit:cover">
      ${window.Mascot && window.Mascot.reactHtml
        ? window.Mascot.reactHtml({ pct, stacked: true })
        : `<div class="t2-done-icon">${emoji}</div>`}
      <div class="t2-done-score ${scoreClass}">${pct}%</div>
      <div class="t2-done-sub">Hoàn thành ${state.sessionDone} câu · ${_escHtml(state.selectedTopic?.topicName || '')}</div>
      <div class="wp-status-row" style="justify-content:center">${topicStatusHtml}</div>
      <div class="t2-done-stats">
        <div class="t2-done-stat"><div class="t2-done-stat-num wp-score-good">✅ ${state.sessionCorrect}</div><div class="t2-done-stat-lbl">Đúng</div></div>
        <div class="t2-done-stat"><div class="t2-done-stat-num wp-score-bad">❌ ${wrongCount}</div><div class="t2-done-stat-lbl">Sai</div></div>
        <div class="t2-done-stat"><div class="t2-done-stat-num">${state.sessionDone}</div><div class="t2-done-stat-lbl">Tổng</div></div>
      </div>
      ${canWriteLesson ? `
      <div style="margin:0 0 14px">
        <button class="t2-primary is-lg" onclick="openComposeBtn(this)"><i class="fas fa-columns"></i> Vào viết bài</button>
        <div class="t2-done-sub" style="font-size:12.5px;margin:6px 0 0">Các câu bạn vừa dịch sẽ hiện ở cột trái màn hình viết.</div>
      </div>` : ''}
      ${writeLockedNote ? `<div class="t2-done-sub" style="font-size:13px;margin:0 0 14px">🔒 ${_escHtml(translateGateMessage(topicId))}</div>` : ''}
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        ${wrongCount > 0 ? `<button class="t2-start-btn" onclick="retryWrong()" style="font-size:13px;padding:10px 20px;margin-top:0"><i class="fas fa-redo-alt"></i> Ôn lại ${wrongCount} câu sai</button>` : ''}
        <button class="wp-restart-btn" onclick="${state.translateOnly ? 'startTranslate' : 'startPractice'}(this)"><i class="fas fa-redo"></i> Làm lại từ đầu</button>
        <button class="wp-more-btn" onclick="backToHub()"><i class="fas fa-arrow-left"></i> Về buổi học</button>
      </div>
    </div>
    ${wrongCount > 0 ? `
    <div style="padding:0 20px 30px">
      <h3 class="wp-wr-title">📋 Chi tiết câu sai (${wrongCount})</h3>
      ${wrongReview}
    </div>` : `<div class="wp-wr-all-ok" style="padding:12px">🌟 Tuyệt vời! Không có câu nào sai!</div>`}`;
}

function retryWrong() {
  const wrongIds = new Set(state.sessionAttempts.filter(a => !a.isCorrect).map(a => a.questionId));
  // A requeued sentence sits in state.questions more than once — keep one copy.
  const seen = new Set();
  const wrongQuestions = state.questions
    .filter(q => wrongIds.has(q._id) || wrongIds.has(q.questionId))
    .filter(q => { const id = q.questionId || q._id; if (seen.has(id)) return false; seen.add(id); return true; })
    .map(q => { const { _isRepeat, _luluAsks, _ordTries, _gfTries, ...rest } = q; return rest; });
  if (!wrongQuestions.length) { showToast('Không có câu nào sai!', 'info'); return; }
  state.questions = wrongQuestions;
  state.currentIdx = 0;
  state.sessionDone = 0; state.sessionCorrect = 0; state.sessionAttempts = [];
  state.mcSelected = null; state.rearrangeAnswer = [];
  state.questionStatus = new Array(wrongQuestions.length).fill('pending');
  state.currentMode = 'retry';
  state.view = 'practice';
  render();
}

// ════════════════════════════════════════════════════════
//  NAVIGATION HELPERS
// ════════════════════════════════════════════════════════
function goWeeks() {
  history.pushState({ view: 'weeks' }, '', '/task2-practice.html');
  state.view = 'weeks';
  render();
}
function goTopics() {
  history.pushState({ view: 'topics', week: state.selectedWeek }, '', `/task2-practice.html?week=${state.selectedWeek}`);
  state.view = 'topics';
  render();
}

window.addEventListener('popstate', async e => {
  const s = e.state?.view;
  // Clean up any running timers and keyboard handlers
  if (state.examTimerInterval) _stopExamSession();
  if (_practiceKeyHandler) { document.removeEventListener('keydown', _practiceKeyHandler); _practiceKeyHandler = null; }
  if (state.view === 'compose') flushLessonSave();
  if ((s === 'select' || s === 'compose') && e.state.week && e.state.topicId) {
    if (state.selectedWeek !== e.state.week || !state.topics.length) {
      try {
        const d = await apiFetch(`/api/task2/topics/week/${e.state.week}`);
        state.topics = d.topics || [];
      } catch {}
    }
    state.selectedWeek = e.state.week;
    const topic = state.topics.find(t => t._id === e.state.topicId);
    if (topic) {
      if (state.selectedTopic?._id !== topic._id) { state.wrongQuestionIds = []; state.draft = null; }
      state.selectedTopic = topic;
      state.currentMode = 'practice';
      state.topicStats = null;      // stale for this topic until refetched
      _resetHubState(topic._id);    // bindSelect() refetches vocab if it's for another topic
      // Forward into the writer only when its lesson data is already here;
      // otherwise land on the hub (one click away).
      const canCompose = s === 'compose' && state.lesson.topicId === topic._id && state.lesson.status === 'ready';
      state.view = canCompose ? 'compose' : 'select';
      render();
      // re-render once stats arrive — only if the hub is still showing this topic
      loadTopicStats(e.state.topicId).then(() => {
        if (state.view === 'select' && state.selectedTopic?._id === e.state.topicId) render();
      });
    }
    else { state.view = 'weeks'; render(); }
  } else if (s === 'topics' && e.state.week) {
    if (state.selectedWeek !== e.state.week || !state.topics.length) {
      try {
        const d = await apiFetch(`/api/task2/topics/week/${e.state.week}`);
        state.topics = d.topics || [];
      } catch {}
    }
    state.selectedWeek = e.state.week;
    state.view = 'topics';
    render();
  } else {
    state.view = 'weeks';
    render();
  }
});

// ════════════════════════════════════════════════════════
//  SAVE ATTEMPT
// ════════════════════════════════════════════════════════
async function savePracticeAttempt() {
  const token = window.AuthService.getToken();
  if (!token || !state.sessionDone) return;
  try {
    await apiFetch('/api/task2/save-attempt', {
      method: 'POST',
      body: JSON.stringify({
        sessionType: 'practice',
        week: state.selectedWeek,
        topicId: state.selectedTopic?._id,
        topicName: state.selectedTopic?.topicName,
        level: state.selectedLevel,
        questionsAttempted: state.sessionAttempts.map(a => ({
          questionId: a.questionId,
          userAnswer: a.userAnswer,
          isCorrect: a.isCorrect,
          score: a.score
        })),
        totalQuestions: state.sessionDone,
        correctCount: state.sessionCorrect
      })
    });
    // Refresh wrong-question list after session saved
    if (state.selectedTopic?._id) {
      try {
        const data = await apiFetch(`/api/task2/wrong-questions/${state.selectedTopic._id}`);
        state.wrongQuestionIds = data.wrongIds || [];
      } catch {}
      // Clear draft — session is complete
      try { await apiFetch(`/api/task2/draft/${state.selectedTopic._id}`, { method: 'DELETE' }); } catch {}
      state.draft = null;
      state.allDrafts = state.allDrafts.filter(d => d.topicId !== state.selectedTopic._id);
    }
  } catch {}
}

// ════════════════════════════════════════════════════════
//  SUBMIT ENABLE / MODEL TOGGLE
// ════════════════════════════════════════════════════════
function checkSubmitEnabled() {
  const btn = document.getElementById('submit-btn');
  if (!btn) return;
  const q = state.questions[state.currentIdx];
  if (!q) return;
  if (['essay_type_recognition','topic_sentence'].includes(q.type)) {
    btn.disabled = (state.mcSelected === null || state.mcSelected === undefined);
    return;
  }
  if (q.type === 'rearrange') { btn.disabled = state.rearrangeAnswer.length === 0; return; }
  if (q.type === 'fill_blank') { btn.disabled = !(document.getElementById('fill-input')?.value?.trim()); return; }
  if (_gfActive()) {
    btn.disabled = _gf.done || (_gf.mode === 'mcq' ? _gf.picked == null : _gfInputs().some(i => !i.value.trim()));
    return;
  }
  if (_ordActive()) { btn.disabled = _ord.done || _ord.picked.length < _ord.chunks.length; return; }
  btn.disabled = !(document.getElementById('answer-box')?.value?.trim());
}

// ════════════════════════════════════════════════════════
//  UTILITIES
// ════════════════════════════════════════════════════════
function shuffle(arr, rng = Math.random) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Task 2 History modal ──────────────────────────────────────
// Cached attempt list — lets the per-attempt review (openT2AttemptDetail)
// render "← Quay lại danh sách" without refetching /api/task2/history.
let _t2HistCache = [];

function _t2HistTitle(txt) {
  const el = document.getElementById('t2-hist-title');
  if (el) el.textContent = txt;
}

async function openT2History() {
  if (!document.getElementById('t2-hist-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 't2-hist-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:10001;padding:16px';
    overlay.innerHTML = `
      <div class="t2-hist-modal">
        <div class="t2-hist-hdr">
          <h3 id="t2-hist-title">📝 Lịch sử Task 2 Writing</h3>
          <button class="t2-hist-close" onclick="document.getElementById('t2-hist-overlay').style.display='none'"><i class="fas fa-times"></i></button>
        </div>
        <div class="t2-hist-body2" id="t2-hist-body">
          <div style="text-align:center;padding:24px"><div class="wp-spinner"></div></div>
        </div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
    document.body.appendChild(overlay);
  }
  document.getElementById('t2-hist-overlay').style.display = 'flex';
  const body = document.getElementById('t2-hist-body');
  const token = window.AuthService.getToken();
  if (!token) {
    body.innerHTML = `<div style="text-align:center;padding:40px;color:#9ca3af">
      <div style="font-size:40px;margin-bottom:12px">🔒</div>
      <p style="font-size:14px;margin-bottom:16px">Vui lòng đăng nhập để xem lịch sử luyện tập</p>
      <a href="/login.html" class="t2-start-btn" style="display:inline-block;text-decoration:none;font-size:14px;padding:10px 24px">
        <i class="fas fa-sign-in-alt"></i> Đăng nhập
      </a>
    </div>`;
    return;
  }
  body.innerHTML = '<div style="text-align:center;padding:32px"><div class="wp-spinner"></div><p style="color:#9ca3af;margin-top:10px;font-size:13px">Đang tải...</p></div>';
  try {
    const data = await apiFetch('/api/task2/history?limit=100');
    if (!data.success) throw new Error(data.message);
    _t2HistCache = data.attempts || [];
    if (!_t2HistCache.length) {
      body.innerHTML = '<div style="text-align:center;padding:40px;color:#9ca3af"><div style="font-size:40px;margin-bottom:10px">📭</div><p>Chưa có lịch sử luyện tập</p></div>';
      return;
    }
    renderT2HistList();
  } catch (e) {
    body.innerHTML = `<p style="color:#e53935;text-align:center;padding:24px;font-size:13px">Không thể tải: ${e.message}</p>`;
  }
}

// The attempt list — split out of openT2History() so the per-attempt review
// (openT2AttemptDetail) can render "← Quay lại danh sách" without a refetch.
function renderT2HistList() {
  const body = document.getElementById('t2-hist-body');
  if (!body) return;
  _t2HistTitle('📝 Lịch sử Task 2 Writing');
  const attempts = _t2HistCache;
  const total    = attempts.length;
  const avgScore = Math.round(attempts.reduce((s, a) => s + (a.scorePercentage || 0), 0) / total);
  const totalQ   = attempts.reduce((s, a) => s + (a.totalQuestions || 0), 0);
  const totalC   = attempts.reduce((s, a) => s + (a.correctCount || 0), 0);

  const rows = attempts.slice(0, 40).map(a => {
    const acc = a.scorePercentage != null ? Math.round(a.scorePercentage) : (a.totalQuestions ? Math.round((a.correctCount/a.totalQuestions)*100) : 0);
    const cls = acc >= 70 ? 'good' : acc >= 50 ? 'mid' : 'bad';
    const date = new Date(a.completedAt || a.createdAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
    const mode = a.sessionType === 'exam' ? '🎓 Thi thử' : '✏️ Luyện tập';
    const attrs = a._id
      ? `class="t2-hist-entry is-clickable" onclick="openT2AttemptDetail('${a._id}')"`
      : `class="t2-hist-entry"`;
    return `<div ${attrs}>
      <div class="t2-hist-entry-date">${date} · ${mode}</div>
      <div class="t2-hist-entry-name">${_escHtml(a.topicName || '–')}${a.week ? ` · W${a.week}` : ''}</div>
      <div class="t2-hist-entry-row">
        <span class="t2-hist-entry-count">${a.correctCount ?? '?'}/${a.totalQuestions ?? '?'} câu</span>
        <span class="t2-hist-entry-acc ${cls}">${acc}% đúng</span>
        ${a._id ? '<span class="t2-hist-entry-more">Xem từng câu <i class="fas fa-chevron-right"></i></span>' : ''}
      </div>
    </div>`;
  }).join('');

  body.scrollTop = 0;
  body.innerHTML = `
    <div class="t2-hist-stats">
      <div class="t2-hist-stat"><div class="t2-hist-num">${total}</div><div class="t2-hist-lbl">Phiên học</div></div>
      <div class="t2-hist-stat"><div class="t2-hist-num">${totalC}/${totalQ}</div><div class="t2-hist-lbl">Đúng/Tổng</div></div>
      <div class="t2-hist-stat"><div class="t2-hist-num">${avgScore}%</div><div class="t2-hist-lbl">TB chính xác</div></div>
    </div>
    ${rows}`;
}

// Drill into one saved attempt: every question the student answered, with
// their answer, correct/incorrect, the model answer (for the ones they got
// wrong) and the Vietnamese explanation — same review layout as the end of
// an exam. Fetched fresh from /api/task2/attempt/:id (the history list only
// carries summary counts).
async function openT2AttemptDetail(id) {
  const body = document.getElementById('t2-hist-body');
  if (!body) return;
  _t2HistTitle('📝 Chi tiết bài luyện tập');
  body.scrollTop = 0;
  body.innerHTML = '<div style="text-align:center;padding:32px"><div class="wp-spinner"></div><p style="color:#9ca3af;margin-top:10px;font-size:13px">Đang tải...</p></div>';
  const backBtn = `<button class="t2-back-btn" onclick="renderT2HistList()" style="margin-bottom:14px"><i class="fas fa-arrow-left"></i> Quay lại danh sách</button>`;
  try {
    const data = await apiFetch(`/api/task2/attempt/${id}`);
    if (!data.success) throw new Error(data.message);
    const a = data.attempt;
    const acc = a.scorePercentage != null ? Math.round(a.scorePercentage) : 0;
    const cls = acc >= 70 ? 'good' : acc >= 50 ? 'mid' : 'bad';
    const date = new Date(a.completedAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
    const mode = a.sessionType === 'exam' ? '🎓 Thi thử' : '✏️ Luyện tập';

    const reviews = (a.questions || []).map(item => `
      <div class="${item.isCorrect ? 'wp-wr-item-ok' : 'wp-wr-item'}">
        <div class="${item.isCorrect ? 'wp-wr-num-ok' : 'wp-wr-num'}">
          ${item.isCorrect ? '✅' : '❌'} Câu ${item.index}${item.type ? ` — ${Q_LABELS[item.type] || item.type}` : ''}
          ${item.score != null ? `<span class="wp-wr-skill">${item.score} điểm</span>` : ''}
        </div>
        ${item.questionText ? `<div class="wp-wr-q" style="white-space:pre-line">${_escHtml(item.questionText)}</div>` : ''}
        <div class="wp-wr-row"><span class="wp-wr-lbl-you">Bạn:</span> <span class="${item.isCorrect ? 'wp-wr-ans' : 'wp-wr-your'}">${_escHtml(item.userAnswer) || '(bỏ trống)'}</span></div>
        ${item.modelAnswer && !item.isCorrect ? `<div class="wp-wr-row"><span class="wp-wr-lbl-ans">Đáp án:</span> <span class="wp-wr-ans">${_escHtml(item.modelAnswer)}</span></div>` : ''}
        ${item.explanationVi ? `<div class="wp-wr-gp">💡 ${_escHtml(item.explanationVi)}</div>` : ''}
      </div>`).join('');

    body.innerHTML = `
      ${backBtn}
      <div class="t2-hist-entry-name" style="font-size:14px;margin-bottom:4px">${_escHtml(a.topicName || '–')}${a.week ? ` · W${a.week}` : ''}</div>
      <div class="t2-hist-entry-date" style="margin-bottom:14px">${date} · ${mode} · <span class="t2-hist-entry-acc ${cls}">${a.correctCount ?? '?'}/${a.totalQuestions ?? '?'} câu · ${acc}%</span></div>
      ${reviews || '<p style="color:#9ca3af;text-align:center;padding:24px;font-size:13px">Lượt này được lưu trước khi hệ thống ghi lại chi tiết từng câu.</p>'}`;
  } catch (e) {
    body.innerHTML = `${backBtn}<p style="color:#e53935;text-align:center;padding:24px;font-size:13px">Không thể tải: ${_escHtml(e.message || '')}</p>`;
  }
}

// ── "Xem trước câu hỏi" — lets a student read every sentence that will
// come up in this topic's Luyện tập session before starting, so they can
// mentally prepare instead of hitting each one cold. Reuses the exact
// same /questions/topic endpoint (and "level: all") startPractice() itself
// calls — this is a read-only peek, it doesn't touch session state, and
// the endpoint already strips correctAnswer/modelAnswer server-side
// (sanitizeQuestionForClient), so this can never leak an answer key.
async function openT2Preview() {
  if (!document.getElementById('t2-preview-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 't2-preview-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:10001;padding:16px';
    overlay.innerHTML = `
      <div class="t2-hist-modal">
        <div class="t2-hist-hdr">
          <h3>👀 Xem trước câu hỏi</h3>
          <button class="t2-hist-close" onclick="document.getElementById('t2-preview-overlay').style.display='none'"><i class="fas fa-times"></i></button>
        </div>
        <div class="t2-hist-body2" id="t2-preview-body">
          <div style="text-align:center;padding:24px"><div class="wp-spinner"></div></div>
        </div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
    document.body.appendChild(overlay);
  }
  document.getElementById('t2-preview-overlay').style.display = 'flex';
  const body = document.getElementById('t2-preview-body');
  body.innerHTML = '<div style="text-align:center;padding:32px"><div class="wp-spinner"></div><p style="color:#9ca3af;margin-top:10px;font-size:13px">Đang tải...</p></div>';
  try {
    const params = new URLSearchParams({ level: state.selectedLevel });
    const data = await apiFetch(`/api/task2/questions/topic/${state.selectedTopic._id}?${params}`);
    if (!data.questions?.length) {
      body.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:24px;font-size:13px">Chưa có câu hỏi ở level này</p>';
      return;
    }
    body.innerHTML = `
      <p style="font-size:12.5px;color:#9ca3af;margin:0 0 14px">Toàn bộ ${data.questions.length} câu sẽ xuất hiện khi bạn bấm "Bắt đầu" (thứ tự có thể bị xáo trộn nếu bật "Xáo trộn câu"). Đáp án chưa hiển thị ở đây.</p>` +
      data.questions.map((q, i) => `
        <div class="t2-hist-entry">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span class="t2-hist-entry-date" style="margin:0">Câu ${i + 1}</span>
            <span class="wp-type-tag">${Q_LABELS[q.type] || q.type}</span>
            ${q.answerWordCount ? `<span class="t2-hist-entry-date" style="margin:0">📏 ${q.answerWordCount} từ</span>` : ''}
          </div>
          <div class="t2-question-text" style="margin:0">${_escHtml(q.questionText || '')}</div>
        </div>`).join('');
  } catch (e) {
    body.innerHTML = `<p style="color:#e53935;text-align:center;padding:24px;font-size:13px">Không thể tải: ${e.message}</p>`;
  }
}
