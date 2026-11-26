// Non-component helpers of Task 2 Luyện đề tuần (pages/Task2Practice.jsx).
import { apiFetch } from '../../utils/api';
import { siteToast } from '../../utils/shell';
import { isLoggedIn, isVocabStepDone, ordBank, ordChunks, qid, rearrangeWords, shuffle, translateProgress } from '../../utils/task2Practice';

// Brainstorm sides: topic.brainstormHints, or one free box
export function ideaSides(t) {
  const hints = t.brainstormHints || [];
  return hints.length ? hints : [{ side: 'Ý tưởng của nhóm', points: [] }];
}

// Where the student is on the 6 steps — drives the rail + the "current" card
export function lessonSteps(c) {
  const id = c.t._id;
  const L = c.lesson.status === 'ready' ? c.lesson : null;
  const sent = L ? L.sentences : [];
  const sec = L ? L.sections : {};
  const has = (k) => !!(sec[k] || '').trim();
  return [
    { key: 'vocab', label: 'Từ vựng', done: isVocabStepDone(id, c.vocab) },
    { key: 'ideas', label: 'Brainstorm', done: c.notes.some((n) => (n || '').trim()) },
    { key: 'translate', label: 'Dịch câu', done: sent.length > 0 && sent.every((s) => s.en) && !!(translateProgress(c.lesson) || {}).passed },
    { key: 'guide', label: 'Hướng dẫn viết', done: has('intro') || has('body1') },
    { key: 'class', label: 'Viết trên lớp', done: has('intro') && has('body1') },
    { key: 'home', label: 'Bài về nhà', done: has('body2') && has('conclusion') },
  ];
}
export const currentStepKey = (steps) => (steps.find((s) => !s.done) || steps[steps.length - 1]).key;

export const scrollToHubStep = (key) => document.getElementById('t2-step-' + key)?.scrollIntoView({ behavior: 'smooth', block: 'start' });


let uidSeq = 0;
export const nextUid = () => ++uidSeq;
// Shuffles happen when a question comes up (a click), never in render
export function prepFor(q) {
  if (!q) return {};
  if (q.type === 'rearrange') return { words: shuffle([...rearrangeWords(q)]) };
  if (q.translationAnswer && q._mode === 'order' && q.type !== 'short_writing') return { bank: ordBank(ordChunks(q.translationAnswer)) };
  return {};
}
export function newSession({ questions, mode = 'practice', translateOnly = false, status, idx = 0, done = 0, correct = 0, attempts = [] }) {
  const qs = questions.map((q) => ({ ...q, _uid: nextUid() }));
  return { questions: qs, status: status || new Array(qs.length).fill('pending'), idx, done, correct, attempts, mode, translateOnly, prep: prepFor(qs[idx]) };
}

let draftFails = 0;
export async function saveDraft(t, week, s) {
  if (!window.AuthService?.isLoggedIn?.() || !t?._id || !s.questions.length) return;
  try {
    await apiFetch('/task2/draft', {
      method: 'POST',
      body: JSON.stringify({
        topicId: t._id, topicName: t.topicName, week, level: 'all', mode: s.mode,
        // Stable admin-set questionId over the MongoDB _id (re-saving a topic regenerates _id)
        questionIds: s.questions.map(qid), currentIdx: s.done, sessionAttempts: s.attempts,
        questionStatus: s.status, sessionDone: s.done, sessionCorrect: s.correct,
      }),
    });
    draftFails = 0;
  } catch {
    draftFails++;
    if (draftFails === 3) siteToast('Không lưu được tiến độ bài viết lên server. Kiểm tra kết nối mạng.', 'warn');
  }
}


// Type guides (outline + model essay) and the book templates, loaded once
let guideCache = null; let guideLoading = null;
export const cachedGuides = () => guideCache;
export const cachedTemplates = () => tplCache;
export function loadGuides() {
  if (guideCache) return Promise.resolve(guideCache);
  if (!guideLoading) {
    guideLoading = apiFetch('/task2/type-guides').then((d) => (guideCache = d.guides || [])).catch(() => (guideCache = []))
      .finally(() => { guideLoading = null; });
  }
  return guideLoading;
}
let tplCache = null; let tplLoading = null;
export function loadTemplates() {
  if (tplCache) return Promise.resolve(tplCache);
  if (!window.Task2GenericTpl) return Promise.resolve(tplCache = {});
  if (!tplLoading) {
    tplLoading = window.Task2GenericTpl.load().then((d) => (tplCache = d || {})).catch(() => (tplCache = {}))
      .finally(() => { tplLoading = null; });
  }
  return tplLoading;
}

// Topic data fetched before the hub opens (a click on the list) is handed over here
export const prefetched = new Map();
export async function fetchTopicData(id) {
  const out = { wrongIds: [], draft: null, stats: { forTopic: id, practiced: false, bestScore: 0 }, vocab: null };
  if (!isLoggedIn()) return out;
  const vocabP = apiFetch(`/task2/vocabulary/${id}`).then((d) => d.vocabularyList || []).catch(() => null);
  const statsP = apiFetch(`/task2/topic-stats/${id}`).then((d) => ({ forTopic: id, ...(d.stats || { practiced: false, bestScore: 0 }) })).catch(() => out.stats);
  try {
    const [w, d] = await Promise.all([apiFetch(`/task2/wrong-questions/${id}`), apiFetch(`/task2/draft/${id}`)]);
    out.wrongIds = w.wrongIds || [];
    out.draft = d.draft || null;
  } catch { /* hub shows without them */ }
  out.stats = await statsP;
  out.vocab = await vocabP;
  return out;
}


