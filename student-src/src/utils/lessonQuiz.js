// Vocab Topic quiz: questions are generated in the browser, nothing is stored.
// Port of dashboard-lesson.js (types, weights and distractor rules unchanged).
import { shuffle } from './vocab';

const MIN_MCQ_OPTIONS = 4;
// Trắc nghiệm twice as likely as each other category; "Dịch" is one bucket
// covering both directions.
const TYPE_WEIGHTS = { mcq: 30, fill: 15, listen: 15, translate: 15, rearrange: 15 };

// Up to `count` distinct wrong words, never the word itself: admin-provided
// distractors first, then other words of the lesson.
function pickDistractorWords(word, allWords, count) {
  const seen = new Set([word.word.toLowerCase()]);
  const pool = [];
  const add = (d) => {
    const key = String(d).toLowerCase();
    if (pool.length < count && !seen.has(key)) { seen.add(key); pool.push(d); }
  };
  (word.distractors || []).forEach(add);
  if (pool.length < count) {
    shuffle(allWords.filter(w => w.word.toLowerCase() !== word.word.toLowerCase()).map(w => w.word)).forEach(add);
  }
  return pool;
}

function pickDistractorMeanings(word, allWords, count) {
  const others = shuffle(allWords.filter(w => w.word.toLowerCase() !== word.word.toLowerCase() && w.meaning).map(w => w.meaning));
  const pool = [];
  for (const m of others) {
    if (pool.length >= count) break;
    if (m !== word.meaning && !pool.includes(m)) pool.push(m);
  }
  return pool;
}

function eligibleTypes(word, allWords) {
  const types = ['fill', 'listen'];
  if (word.example && word.example.trim()) types.push('rearrange');
  if (pickDistractorWords(word, allWords, MIN_MCQ_OPTIONS - 1).length >= MIN_MCQ_OPTIONS - 1) types.push('mcq', 'translateViEn');
  if (pickDistractorMeanings(word, allWords, MIN_MCQ_OPTIONS - 1).length >= MIN_MCQ_OPTIONS - 1) types.push('translateEnVi');
  return types;
}

function pickWeightedType(eligible) {
  const buckets = {};
  for (const t of eligible) {
    const key = t === 'translateViEn' || t === 'translateEnVi' ? 'translate' : t;
    (buckets[key] = buckets[key] || []).push(t);
  }
  const keys = Object.keys(buckets);
  let r = Math.random() * keys.reduce((sum, k) => sum + (TYPE_WEIGHTS[k] || 0), 0);
  for (const k of keys) {
    r -= TYPE_WEIGHTS[k] || 0;
    if (r <= 0) return buckets[k][Math.floor(Math.random() * buckets[k].length)];
  }
  return buckets[keys[keys.length - 1]][0];
}

function fillSentence(word) {
  const re = new RegExp(`\\b${word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return re.test(word.example || '')
    ? word.example.replace(re, '_____')
    : `${word.definition || word.meaning || ''} → _____`;
}

// Everything random about a question is decided here, once.
function makeQuestion(word, type, allWords) {
  const q = { type, word, answer: word.word };
  if (type === 'mcq' || type === 'translateViEn') {
    q.prompt = word.meaning;
    q.options = shuffle([word.word, ...pickDistractorWords(word, allWords, 3)]);
  } else if (type === 'translateEnVi') {
    q.prompt = word.word;
    q.answer = word.meaning;
    q.options = shuffle([word.meaning, ...pickDistractorMeanings(word, allWords, 3)]);
  } else if (type === 'fill') {
    q.sentence = fillSentence(word);
  } else if (type === 'rearrange') {
    const tokens = word.example.split(/\s+/).filter(Boolean);
    q.original = tokens.join(' ');
    q.answer = q.original;
    q.tiles = shuffle(tokens.map((t, id) => ({ id, t })));
  }
  return q;
}

export function buildQuizQueue(words) {
  return shuffle([...words]).map(word => makeQuestion(word, pickWeightedType(eligibleTypes(word, words)), words));
}

// A question failed on the typing drill's 3-tries cap comes back 3 questions
// later (max twice). The copy (_redo) never changes the score.
const REQUEUE_GAP = 3;
const MAX_REQUEUES = 2;
export function requeueQuestion(queue, index) {
  const q = queue[index];
  if (!q || queue.filter(x => x._redo && x.word === q.word && x.type === q.type).length >= MAX_REQUEUES) return queue;
  const next = [...queue];
  next.splice(Math.min(index + 1 + REQUEUE_GAP, next.length), 0, { ...q, _redo: true });
  return next;
}

// "21 chữ cái" — or "2 từ · 7 + 14 chữ cái" for a phrase
export function letterHint(word, lang = 'vi') {
  const words = String(word || '').trim().split(/\s+/).filter(Boolean);
  const count = String(word || '').replace(/\s/g, '').length;
  if (words.length <= 1) return lang === 'vi' ? `${count} chữ cái` : `The word has ${count} letters`;
  const per = words.map(w => w.length).join(' + ');
  return lang === 'vi' ? `${words.length} từ · ${per} chữ cái` : `${words.length} words · ${per} letters`;
}

/* "Lưu tất cả" memory: there is no server field for it, same key as the old page */
const SAVED_KEY = 'lesson_vocab_saved';
function readSavedMap() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '{}') || {}; } catch { return {}; }
}
export const savedTerms = (lessonId) => new Set(readSavedMap()[lessonId] || []);
export function markTermsSaved(lessonId, terms) {
  const map = readSavedMap();
  map[lessonId] = [...new Set([...(map[lessonId] || []), ...terms])];
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(map)); } catch { /* private mode */ }
}
export function savedCount(lesson) {
  const set = savedTerms(lesson._id);
  return (lesson.words || []).filter(w => set.has(w.word)).length;
}
export const quizUnlocked = (lesson) => !!lesson?.words?.length && savedCount(lesson) === lesson.words.length;
