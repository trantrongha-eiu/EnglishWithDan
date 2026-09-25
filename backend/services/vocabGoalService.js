'use strict';

// Class homework "vocab_goal" items — "học N từ trong sổ từ vựng". Only the
// student's 5 fixed default books ("Sổ 1".."Sổ 5", utils/defaultVocabBooks.js)
// count: the teacher either targets one slot (resource.bookSlot) or lets the
// student use any of the five (bookSlot null, best book wins — never summed
// across books). Evidence is graded vocab-book practice only (SavedWord
// .lastPracticedAt / .lastPracticeCorrect, written solely by
// vocabBookService.recordPracticeResult) since the assignment was created.
//
// Pass rule for one book:
//   - book has >= N words: practised >= N distinct words AND >= 70% of N
//     answered correctly (a word's LATEST answer counts, so re-practising a
//     missed word and getting it right fixes it).
//   - MIN_BOOK_SIZE (50) <= size < N: practising every word = pass
//     ("học hết sổ"), no accuracy bar.
//   - size < min(N, 50): not eligible yet — the student has to save more
//     words first. The 50 floor stops "make a 2-word book, practise it, pass".

const VocabBook = require('../models/VocabBook');
const { PASS_PERCENT } = require('./resourceCompletionService');
const { canonicalName, assignDefaultSlots } = require('../utils/defaultVocabBooks');

const MIN_WORD_COUNT = 5;
const MAX_WORD_COUNT = 300; // = a VocabBook's own word cap (addWord / mergeBooks)
const MIN_BOOK_SIZE = 50;

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
    return {
      mode: 'quota',
      completed: practiced >= wordCount && correct >= needCorrect,
      practiced, correct, target: wordCount, needCorrect, bookSize: size,
    };
  }
  if (size >= MIN_BOOK_SIZE) {
    return { mode: 'whole_book', completed: practiced >= size, practiced, correct, target: size, needCorrect: 0, bookSize: size };
  }
  // Not eligible yet: minSize = words the book needs before either rule applies.
  return { mode: 'too_small', completed: false, practiced, correct, target: wordCount, needCorrect: 0, bookSize: size, minSize: Math.min(wordCount, MIN_BOOK_SIZE) };
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

// The student's default books (optionally just `bookSlot`), with only the
// fields evaluateBook reads. Slots are resolved in memory with the same
// assignDefaultSlots ensureDefaultBooks uses, so a legacy default that
// hasn't been tagged yet (student hasn't opened the vocab page since the
// deploy) still maps to the right slot — without a write on this read path.
async function loadBooksForGoal(studentId, bookSlot = null) {
  const docs = await VocabBook.find({ userId: studentId, isDefault: true })
    .select('name emoji defaultSlot words._id words.lastPracticedAt words.lastPracticeCorrect')
    .sort({ _id: 1 })
    .lean();
  const { bySlot } = assignDefaultSlots(docs);
  const out = [];
  for (const [slot, b] of bySlot) {
    if (bookSlot && slot !== bookSlot) continue;
    out.push({ ...b, slot, name: canonicalName(slot) });
  }
  return out.sort((x, y) => x.slot - y.slot);
}

module.exports = {
  evaluateBook, evaluateBooks, loadBooksForGoal,
  MIN_WORD_COUNT, MAX_WORD_COUNT, MIN_BOOK_SIZE,
};
