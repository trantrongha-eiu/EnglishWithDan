'use strict';

// Class homework "vocab_goal" items — "học N từ trong sổ từ vựng". The
// teacher either targets one default book (resource.bookSlot = "Sổ N",
// utils/defaultVocabBooks.js) or lets the student use any book they have
// (bookSlot null: Sổ 1–5, their own books, "Từ của lớp" — since 2026-11-26;
// was Sổ 1–5 only). Best book wins — never summed across books.
//
// "vocab_list" items ("Bộ từ của lớp", evaluateList below) are the teacher's
// own word list instead of a quota: every listed word must be practised.
//
// Evidence is graded vocab-book practice only (SavedWord
// .lastPracticedAt / .lastPracticeCorrect, written solely by
// vocabBookService.recordPracticeResult) since the assignment was created.
//
// Pass rule for one book:
//   - book has >= N words: practised >= N distinct words AND >= 70% of N
//     answered correctly (a word's LATEST answer counts, so re-practising a
//     missed word and getting it right fixes it).
//   - size < N: not eligible yet (`too_small`) — the student has to save
//     words until the book holds N, however close it is (owner's rule
//     2026-10-01: 97/100 words all practised is still NOT done; the old
//     "50+ words, practise the whole book = pass" shortcut is gone). The
//     dashboard tells the student how many words to save.

const VocabBook = require('../models/VocabBook');
const { PASS_PERCENT } = require('./resourceCompletionService');
const { canonicalName, assignDefaultSlots } = require('../utils/defaultVocabBooks');

const MIN_WORD_COUNT = 5;
const MAX_WORD_COUNT = 300; // = a VocabBook's own word cap (addWord / mergeBooks)
// "Bộ từ của lớp" list size
const LIST_MIN_WORDS = 3;
const LIST_MAX_WORDS = 100;

// When the quota was reached: walk the counted words in answer order and
// stop at the first moment both bars are met. Both counts only grow as words
// are added, so that moment is well defined. Used as the homework item's
// completedAt — the old "now" stamped the moment someone next opened the
// homework list, which could read as after the deadline.
function reachedAtOf(words, sinceMs, wordCount, needCorrect) {
  const done = words
    .filter((w) => w.lastPracticedAt && new Date(w.lastPracticedAt).getTime() >= sinceMs)
    .sort((a, b) => new Date(a.lastPracticedAt) - new Date(b.lastPracticedAt));
  let practiced = 0, correct = 0;
  for (const w of done) {
    practiced += 1;
    if (w.lastPracticeCorrect === true) correct += 1;
    if (practiced >= wordCount && correct >= needCorrect) return new Date(w.lastPracticedAt);
  }
  return null;
}

function evaluateBook(words, since, wordCount) {
  const sinceMs = since ? new Date(since).getTime() : 0;
  const size = words.length;
  let practiced = 0, correct = 0;
  for (const w of words) {
    if (!w.lastPracticedAt || new Date(w.lastPracticedAt).getTime() < sinceMs) continue;
    practiced += 1;
    if (w.lastPracticeCorrect === true) correct += 1;
  }
  if (size >= wordCount) {
    const needCorrect = Math.ceil((wordCount * PASS_PERCENT) / 100);
    const completed = practiced >= wordCount && correct >= needCorrect;
    return {
      mode: 'quota', completed,
      practiced, correct, target: wordCount, needCorrect, bookSize: size,
      reachedAt: completed ? reachedAtOf(words, sinceMs, wordCount, needCorrect) : null,
    };
  }
  // Not eligible yet: minSize = words the book must hold before the quota applies.
  return { mode: 'too_small', completed: false, practiced, correct, target: wordCount, needCorrect: 0, bookSize: size, minSize: wordCount };
}

// Higher = closer to done. Completed first, then eligible over too-small,
// then share of the target practised, then correct answers, then (for an
// untouched start) the book closest to holding the full quota.
function rankOf(r, wordCount) {
  return [
    r.completed ? 1 : 0,
    r.mode === 'too_small' ? 0 : 1,
    r.target ? Math.min(r.practiced, r.target) / r.target : 0,
    r.needCorrect ? Math.min(r.correct, r.needCorrect) / r.needCorrect : 0,
    Math.min(r.bookSize, wordCount),
  ];
}
function better(a, b, wordCount) {
  const ra = rankOf(a, wordCount), rb = rankOf(b, wordCount);
  for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] > rb[i];
  return false;
}

// Pure: best book's result across `books` ([{ _id, name, emoji, slot, words }]).
function evaluateBooks(books, since, wordCount) {
  let best = null;
  for (const b of books || []) {
    const r = {
      ...evaluateBook(b.words || [], since, wordCount),
      bookId: b._id, bookName: b.name || '', bookEmoji: b.emoji || '', bookSlot: b.slot ?? null,
    };
    if (!best || better(r, best, wordCount)) best = r;
  }
  if (!best) {
    return { mode: 'no_book', completed: false, practiced: 0, correct: 0, target: wordCount, needCorrect: 0, bookSize: 0, bookId: null, bookName: '', bookEmoji: '', bookSlot: null, wordCount };
  }
  return { ...best, wordCount };
}

const wordKey = (w) => String(w || '').toLowerCase().trim().replace(/\s+/g, ' ');

// Pure: a "Bộ từ của lớp" list against ALL of the student's books. A listed
// word counts once, wherever it lives (the same word in Sổ 2 and in "Từ của
// lớp" is one word): its most recent graded answer since `since` decides.
// Done = every listed word practised AND >= PASS_PERCENT of them right.
// `present` = listed words the student has in some book (the rest still
// have to be added — the homework "Bắt đầu" button does that).
function evaluateList(listWords, books, since) {
  const sinceMs = since ? new Date(since).getTime() : 0;
  const keys = [...new Set((listWords || []).map((w) => wordKey(w.word || w)).filter(Boolean))];
  const target = keys.length;
  const latest = new Map(); // key -> { at, correct } (newest answer since `since`)
  const present = new Set();
  let classBook = null;
  for (const b of books || []) {
    if (b.classBook && !classBook) classBook = b;
    for (const w of b.words || []) {
      const k = wordKey(w.word);
      if (!k) continue;
      present.add(k);
      if (!w.lastPracticedAt) continue;
      const at = new Date(w.lastPracticedAt).getTime();
      if (at < sinceMs) continue;
      const prev = latest.get(k);
      if (!prev || at > prev.at) latest.set(k, { at, correct: w.lastPracticeCorrect === true });
    }
  }
  const evidence = keys.map((k) => latest.get(k)).filter(Boolean).sort((a, b) => a.at - b.at);
  const needCorrect = Math.ceil((target * PASS_PERCENT) / 100);
  let practiced = 0, correct = 0, reachedAt = null;
  for (const e of evidence) {
    practiced += 1;
    if (e.correct) correct += 1;
  }
  const completed = target > 0 && practiced >= target && correct >= needCorrect;
  if (completed) {
    // first moment both bars were met, walking answers in time order
    let p = 0, c = 0;
    for (const e of evidence) {
      p += 1; if (e.correct) c += 1;
      if (p >= target && c >= needCorrect) { reachedAt = new Date(e.at); break; }
    }
  }
  return {
    mode: 'list', completed, practiced, correct, target, needCorrect, wordCount: target,
    present: keys.filter((k) => present.has(k)).length,
    bookId: classBook ? classBook._id : null, bookName: classBook ? classBook.name : '', bookEmoji: classBook ? classBook.emoji : '',
    bookSize: null, bookSlot: null, reachedAt,
  };
}

// The student's books with only the fields evaluateBook/evaluateList read.
// Default books get their slot (and canonical name), resolved in memory with
// the same assignDefaultSlots ensureDefaultBooks uses, so a legacy default
// that hasn't been tagged yet (student hasn't opened the vocab page since
// the deploy) still maps to the right slot — without a write on this read
// path. Every other book (own books, "Từ của lớp") has slot null.
// `bookSlot` given = just that default book.
async function loadBooksForGoal(studentId, bookSlot = null) {
  const docs = await VocabBook.find({ userId: studentId })
    .select('name emoji isDefault defaultSlot classBook words._id words.word words.lastPracticedAt words.lastPracticeCorrect')
    .sort({ _id: 1 })
    .lean();
  const { bySlot } = assignDefaultSlots(docs.filter((d) => d.isDefault));
  const slotOf = new Map();
  for (const [slot, b] of bySlot) slotOf.set(String(b._id), slot);
  const out = [];
  for (const b of docs) {
    const slot = slotOf.get(String(b._id)) ?? null;
    if (bookSlot && slot !== bookSlot) continue;
    out.push({ ...b, slot, name: slot ? canonicalName(slot) : b.name });
  }
  // Sổ 1..5 first (in slot order), then the rest in creation order
  return out.sort((x, y) => (x.slot ?? 99) - (y.slot ?? 99));
}

module.exports = {
  evaluateBook, evaluateBooks, evaluateList, loadBooksForGoal, wordKey,
  MIN_WORD_COUNT, MAX_WORD_COUNT, LIST_MIN_WORDS, LIST_MAX_WORDS,
};
