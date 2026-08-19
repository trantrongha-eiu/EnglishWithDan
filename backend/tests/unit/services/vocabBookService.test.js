'use strict';

const mongoose = require('mongoose');
const vocabBookService = require('../../../services/vocabBookService');
const VocabBook = require('../../../models/VocabBook');
const { createVocabBook, createVocabUnit } = require('../../factories/contentFactory');
const { createStudent } = require('../../factories/userFactory');

function makeWords(n, prefix = 'word') {
  return Array.from({ length: n }, (_, i) => ({ word: `${prefix}${i}`, meaning: `m${i}` }));
}

describe('vocabBookService', () => {
  describe('ensureDefaultBooks / listBooks', () => {
    it('creates 5 default books with isDefault:true on first call', async () => {
      const student = await createStudent();
      const books = await vocabBookService.listBooks(student);
      expect(books).toHaveLength(5);
      expect(books.every(b => b.isDefault === true)).toBe(true);
    });

    it('does not duplicate default books on a second call', async () => {
      const student = await createStudent();
      await vocabBookService.listBooks(student);
      const books = await vocabBookService.listBooks(student);
      expect(books).toHaveLength(5);

      const count = await VocabBook.countDocuments({ userId: student._id });
      expect(count).toBe(5);
    });
  });

  describe('createBook', () => {
    it('creates a book for the user', async () => {
      const student = await createStudent();
      const result = await vocabBookService.createBook(student._id, { name: 'My Book' });
      expect(result.status).toBe('ok');
      expect(result.book.name).toBe('My Book');
    });

    it('enforces the 15-book-per-user cap', async () => {
      const student = await createStudent();
      for (let i = 0; i < 15; i++) {
        await createVocabBook({ userId: student._id, name: `Book ${i}` });
      }
      const result = await vocabBookService.createBook(student._id, { name: 'Book 16' });
      expect(result.status).toBe('limit_reached');

      const count = await VocabBook.countDocuments({ userId: student._id });
      expect(count).toBe(15);
    });

    it('the cap only counts books for that user — a different user is unaffected', async () => {
      const studentA = await createStudent();
      const studentB = await createStudent();
      for (let i = 0; i < 15; i++) {
        await createVocabBook({ userId: studentA._id, name: `A Book ${i}` });
      }

      const capped = await vocabBookService.createBook(studentA._id, { name: 'One More' });
      expect(capped.status).toBe('limit_reached');

      const result = await vocabBookService.createBook(studentB._id, { name: 'B Book' });
      expect(result.status).toBe('ok');
    });
  });

  describe('addWord', () => {
    it('adds a word to a book', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [] });
      const result = await vocabBookService.addWord(book._id, student, { word: 'apple', meaning: 'táo' });
      expect(result.status).toBe('ok');
      expect(result.word.word).toBe('apple');
    });

    it('enforces the 300-word-per-book cap', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: makeWords(300) });
      const result = await vocabBookService.addWord(book._id, student, { word: 'newword', meaning: 'm' });
      expect(result.status).toBe('limit_reached');
      expect(result.bookName).toBe(book.name);
    });

    it('rejects a case-insensitive duplicate word in the same book', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'Apple', meaning: 'táo' }] });
      const result = await vocabBookService.addWord(book._id, student, { word: 'apple', meaning: 'táo 2' });
      expect(result.status).toBe('duplicate');
    });

    it('normalizes trim+case before comparing — "Tolerant", "tolerant", " tolerant " are the same item', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'Tolerant', meaning: 'khoan dung' }] });
      const result = await vocabBookService.addWord(book._id, student, { word: ' tolerant ', meaning: 'khoan dung 2' });
      expect(result.status).toBe('duplicate');

      const reloaded = await VocabBook.findById(book._id);
      expect(reloaded.words).toHaveLength(1); // still just the original — no partial insert
    });

    it('two concurrent addWord calls for the same word only create one entry (race-condition regression — see production incident "tolerant" saved twice 165ms apart)', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [] });

      const [r1, r2] = await Promise.all([
        vocabBookService.addWord(book._id, student, { word: 'tolerant', meaning: 'khoan dung' }),
        vocabBookService.addWord(book._id, student, { word: 'Tolerant', meaning: 'khoan dung' }),
      ]);
      const statuses = [r1.status, r2.status].sort();
      expect(statuses).toEqual(['duplicate', 'ok']); // one wins, one correctly rejected — never both 'ok'

      const reloaded = await VocabBook.findById(book._id);
      const matches = reloaded.words.filter(w => w.word.toLowerCase() === 'tolerant');
      expect(matches).toHaveLength(1);
    });

    it('returns not_found for a missing book', async () => {
      const student = await createStudent();
      const fakeId = new mongoose.Types.ObjectId();
      const result = await vocabBookService.addWord(fakeId, student, { word: 'apple' });
      expect(result.status).toBe('not_found');
    });

    it('saves collocations passed from the dictionary popup, capped at 10 and 100 chars each', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [] });
      const longPhrase = 'x'.repeat(150);
      const tooMany = Array.from({ length: 15 }, (_, i) => `phrase ${i}`);
      const result = await vocabBookService.addWord(book._id, student, {
        word: 'benefit', meaning: 'lợi ích', collocations: [...tooMany, longPhrase],
      });
      expect(result.status).toBe('ok');
      expect(result.word.collocations).toHaveLength(10);
      expect(result.word.collocations[0]).toBe('phrase 0');
    });

    it('defaults to an empty collocations array when none are given', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [] });
      const result = await vocabBookService.addWord(book._id, student, { word: 'apple', meaning: 'táo' });
      expect(result.word.collocations).toEqual([]);
    });

    it('adding a single word does not grant a streak on its own (anti-farming: needs 35/day)', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [] });
      await vocabBookService.addWord(book._id, student, { word: 'apple', meaning: 'táo' });

      const fresh = await require('../../../models/User').findById(student._id);
      expect(fresh.learningStreak).toBe(0);
      expect(fresh.lastActivityDate).toBeNull();
    });

    it('streak unlocks once 35 words have been added across separate calls the same day', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [] });

      // 34 words via one bulk call — not enough yet.
      await vocabBookService.bulkAddWords(book._id, student, makeWords(34, 'bulk'));
      const fresh1 = await require('../../../models/User').findById(student._id);
      expect(fresh1.learningStreak).toBe(0);

      // One more word (35th today, from an unrelated single addWord call) crosses the line.
      await vocabBookService.addWord(book._id, student, { word: 'lastone', meaning: 'm' });
      const fresh2 = await require('../../../models/User').findById(student._id);
      expect(fresh2.learningStreak).toBe(1);
    });
  });

  describe('updateWord', () => {
    it('changing one word\'s status does not grant a streak on its own', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', status: 'chua-thuoc' }] });
      const wordId = book.words[0]._id;

      const result = await vocabBookService.updateWord(book._id, wordId, student._id, student, { status: 'da-thuoc' });
      expect(result.status2).toBe('ok');

      const fresh = await require('../../../models/User').findById(student._id);
      expect(fresh.learningStreak).toBe(0);
    });

    it('updates collocations when provided, leaves them untouched when omitted', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', collocations: ['old phrase'] }] });
      const wordId = book.words[0]._id;

      await vocabBookService.updateWord(book._id, wordId, student._id, student, { note: 'just a note' });
      let reloaded = await VocabBook.findById(book._id);
      expect(reloaded.words[0].collocations).toEqual(['old phrase']); // untouched

      await vocabBookService.updateWord(book._id, wordId, student._id, student, { collocations: ['new phrase'] });
      reloaded = await VocabBook.findById(book._id);
      expect(reloaded.words[0].collocations).toEqual(['new phrase']); // replaced
    });

    it('does not grant a streak when nothing but non-status fields change', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', status: 'chua-thuoc' }] });
      const wordId = book.words[0]._id;

      await vocabBookService.updateWord(book._id, wordId, student._id, student, { note: 'a note' });

      const fresh = await require('../../../models/User').findById(student._id);
      expect(fresh.learningStreak).toBe(0);
    });

    it('rejects editing a word\'s text to match another word already in the same book (case-insensitive), same duplicate rule as addWord', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple' }, { word: 'banana' }] });
      const bananaId = book.words[1]._id;

      const result = await vocabBookService.updateWord(book._id, bananaId, student._id, student, { word: 'APPLE' });
      expect(result.status2).toBe('duplicate');

      const reloaded = await VocabBook.findById(book._id);
      expect(reloaded.words.find(w => w._id.toString() === bananaId.toString()).word).toBe('banana'); // unchanged
    });

    it('allows renaming a word to its own current text (not a false-positive duplicate against itself)', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple' }] });
      const wordId = book.words[0]._id;

      const result = await vocabBookService.updateWord(book._id, wordId, student._id, student, { word: 'Apple' });
      expect(result.status2).toBe('ok');
      expect(result.word.word).toBe('Apple');
    });
  });

  describe('updateWord — spaced repetition (Leitner box)', () => {
    it('marking da-thuoc promotes a fresh word from box 0 to box 1 (1-day interval)', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', status: 'chua-thuoc' }] });
      const wordId = book.words[0]._id;

      const result = await vocabBookService.updateWord(book._id, wordId, student._id, student, { status: 'da-thuoc' });

      expect(result.word.srsBox).toBe(1);
      const daysUntilReview = Math.round((result.word.nextReviewAt - result.word.lastReviewedAt) / 86400000);
      expect(daysUntilReview).toBe(1);
    });

    it('repeated da-thuoc reviews keep promoting the box, capped at box 5 (30-day interval)', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', status: 'chua-thuoc', srsBox: 5 }] });
      const wordId = book.words[0]._id;

      const result = await vocabBookService.updateWord(book._id, wordId, student._id, student, { status: 'da-thuoc' });

      expect(result.word.srsBox).toBe(5); // already at the top box, stays capped
      const daysUntilReview = Math.round((result.word.nextReviewAt - result.word.lastReviewedAt) / 86400000);
      expect(daysUntilReview).toBe(30);
    });

    it('marking chua-thuoc resets the box to 0, due again immediately', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', status: 'da-thuoc', srsBox: 4 }] });
      const wordId = book.words[0]._id;

      const result = await vocabBookService.updateWord(book._id, wordId, student._id, student, { status: 'chua-thuoc' });

      expect(result.word.srsBox).toBe(0);
      expect(result.word.nextReviewAt.getTime()).toBe(result.word.lastReviewedAt.getTime());
    });

    it('marking nho-so-so demotes by one box but never below box 1', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', status: 'da-thuoc', srsBox: 3 }] });
      const wordId = book.words[0]._id;

      const result = await vocabBookService.updateWord(book._id, wordId, student._id, student, { status: 'nho-so-so' });
      expect(result.word.srsBox).toBe(2);

      const result2 = await vocabBookService.updateWord(book._id, result.word._id, student._id, student, { status: 'nho-so-so' });
      const result3 = await vocabBookService.updateWord(book._id, result2.word._id, student._id, student, { status: 'nho-so-so' });
      expect(result3.word.srsBox).toBe(1); // floors at 1, doesn't reach 0 via nho-so-so alone
    });

    it('ignores a client-supplied srsBox/nextReviewAt — the schedule is always server-computed', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', status: 'chua-thuoc' }] });
      const wordId = book.words[0]._id;
      const fakeFarFuture = new Date(Date.now() + 365 * 86400000);

      const result = await vocabBookService.updateWord(book._id, wordId, student._id, student, {
        status: 'da-thuoc', srsBox: 999, nextReviewAt: fakeFarFuture,
      });

      expect(result.word.srsBox).toBe(1); // computed from real prior box (0), not the client's 999
      expect(result.word.nextReviewAt.getTime()).not.toBe(fakeFarFuture.getTime());
    });
  });

  describe('recordPracticeResult (Task 7 — graded-practice SRS evidence)', () => {
    it('a correct answer promotes the box by ONE level, not straight to mastered', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', status: 'chua-thuoc', srsBox: 0 }] });
      const wordId = book.words[0]._id;

      const result = await vocabBookService.recordPracticeResult(book._id, wordId, student._id, true);

      expect(result.status2).toBe('ok');
      expect(result.word.srsBox).toBe(1);
      expect(result.word.status).toBe('nho-so-so'); // box 1 — NOT 'da-thuoc' off a single correct answer
      expect(result.word.correctCount).toBe(1);
    });

    it('reaching mastered requires the box to climb to 3, i.e. several correct answers without a miss', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', status: 'chua-thuoc', srsBox: 0 }] });
      let wordId = book.words[0]._id;

      let r = await vocabBookService.recordPracticeResult(book._id, wordId, student._id, true);
      expect(r.word.status).toBe('nho-so-so'); // box 1
      r = await vocabBookService.recordPracticeResult(book._id, r.word._id, student._id, true);
      expect(r.word.status).toBe('nho-so-so'); // box 2 — still not mastered
      r = await vocabBookService.recordPracticeResult(book._id, r.word._id, student._id, true);
      expect(r.word.srsBox).toBe(3);
      expect(r.word.status).toBe('da-thuoc'); // box 3 — mastered only now
    });

    it('a wrong answer resets the box to 0 and increments wrongCount, even from a high box', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', status: 'da-thuoc', srsBox: 4, wrongCount: 1 }] });
      const wordId = book.words[0]._id;

      const result = await vocabBookService.recordPracticeResult(book._id, wordId, student._id, false);

      expect(result.word.srsBox).toBe(0);
      expect(result.word.status).toBe('chua-thuoc');
      expect(result.word.wrongCount).toBe(2);
    });

    it('box promotion is capped at 5, same ceiling as the manual da-thuoc path', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', srsBox: 5 }] });
      const wordId = book.words[0]._id;

      const result = await vocabBookService.recordPracticeResult(book._id, wordId, student._id, true);
      expect(result.word.srsBox).toBe(5);
    });

    it('returns book_not_found for another user\'s book (ownership scoping)', async () => {
      const studentA = await createStudent();
      const studentB = await createStudent();
      const book = await createVocabBook({ userId: studentA._id, words: [{ word: 'apple' }] });
      const wordId = book.words[0]._id;

      const result = await vocabBookService.recordPracticeResult(book._id, wordId, studentB._id, true);
      expect(result.status2).toBe('book_not_found');
    });

    it('returns word_not_found for a missing wordId', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [] });
      const result = await vocabBookService.recordPracticeResult(book._id, new mongoose.Types.ObjectId(), student._id, true);
      expect(result.status2).toBe('word_not_found');
    });
  });

  describe('getDueWords', () => {
    it('includes a never-reviewed word (nextReviewAt null) immediately', async () => {
      const student = await createStudent();
      await createVocabBook({ userId: student._id, words: [{ word: 'fresh', nextReviewAt: null }] });

      const due = await vocabBookService.getDueWords(student._id);
      expect(due.map(d => d.word.word)).toContain('fresh');
    });

    it('excludes a word whose nextReviewAt is in the future', async () => {
      const student = await createStudent();
      const future = new Date(Date.now() + 10 * 86400000);
      await createVocabBook({ userId: student._id, words: [{ word: 'notdue', nextReviewAt: future }] });

      const due = await vocabBookService.getDueWords(student._id);
      expect(due.map(d => d.word.word)).not.toContain('notdue');
    });

    it('includes a word whose nextReviewAt has already passed', async () => {
      const student = await createStudent();
      const past = new Date(Date.now() - 86400000);
      await createVocabBook({ userId: student._id, words: [{ word: 'overdue', nextReviewAt: past }] });

      const due = await vocabBookService.getDueWords(student._id);
      expect(due.map(d => d.word.word)).toContain('overdue');
    });

    it('only returns due words belonging to the requesting user', async () => {
      const owner = await createStudent();
      const other = await createStudent();
      await createVocabBook({ userId: owner._id, words: [{ word: 'mine', nextReviewAt: null }] });

      const due = await vocabBookService.getDueWords(other._id);
      expect(due).toHaveLength(0);
    });

    it('respects the limit parameter', async () => {
      const student = await createStudent();
      await createVocabBook({ userId: student._id, words: makeWords(10).map(w => ({ ...w, nextReviewAt: null })) });

      const due = await vocabBookService.getDueWords(student._id, 3);
      expect(due).toHaveLength(3);
    });
  });

  describe('deleteBook', () => {
    it('refuses to delete a default book', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, isDefault: true });
      const result = await vocabBookService.deleteBook(book._id, student._id);
      expect(result.status).toBe('is_default');

      const stillThere = await VocabBook.findById(book._id);
      expect(stillThere).toBeTruthy();
    });

    it('allows deleting a non-default book', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, isDefault: false });
      const result = await vocabBookService.deleteBook(book._id, student._id);
      expect(result.status).toBe('ok');

      const gone = await VocabBook.findById(book._id);
      expect(gone).toBeNull();
    });
  });

  describe('ownership scoping', () => {
    it('getBook returns null for another user\'s book', async () => {
      const owner = await createStudent();
      const intruder = await createStudent();
      const book = await createVocabBook({ userId: owner._id });

      const result = await vocabBookService.getBook(book._id, intruder._id);
      expect(result).toBeNull();
    });

    it('updateBook does not modify another user\'s book', async () => {
      const owner = await createStudent();
      const intruder = await createStudent();
      const book = await createVocabBook({ userId: owner._id, name: 'Original' });

      const result = await vocabBookService.updateBook(book._id, intruder._id, { name: 'Hacked' });
      expect(result).toBeNull();

      const reloaded = await VocabBook.findById(book._id);
      expect(reloaded.name).toBe('Original');
    });

    it('deleteBook does not delete another user\'s book', async () => {
      const owner = await createStudent();
      const intruder = await createStudent();
      const book = await createVocabBook({ userId: owner._id, isDefault: false });

      const result = await vocabBookService.deleteBook(book._id, intruder._id);
      expect(result.status).toBe('not_found');

      const stillThere = await VocabBook.findById(book._id);
      expect(stillThere).toBeTruthy();
    });

    it('addWord cannot add to another user\'s book', async () => {
      const owner = await createStudent();
      const intruder = await createStudent();
      const book = await createVocabBook({ userId: owner._id, words: [] });

      const result = await vocabBookService.addWord(book._id, intruder, { word: 'apple' });
      expect(result.status).toBe('not_found');

      const reloaded = await VocabBook.findById(book._id);
      expect(reloaded.words).toHaveLength(0);
    });
  });

  describe('mergeBooks', () => {
    it('merges words from source books into the destination', async () => {
      const student = await createStudent();
      const dest = await createVocabBook({ userId: student._id, words: [{ word: 'existing' }] });
      const src1 = await createVocabBook({ userId: student._id, words: [{ word: 'foo' }, { word: 'bar' }] });
      const src2 = await createVocabBook({ userId: student._id, words: [{ word: 'baz' }] });

      const result = await vocabBookService.mergeBooks(dest._id, student._id, [src1._id, src2._id]);
      expect(result.status).toBe('ok');
      expect(result.addedCount).toBe(3);
      expect(result.mergedCount).toBe(2);

      const reloaded = await VocabBook.findById(dest._id);
      expect(reloaded.words.map(w => w.word).sort()).toEqual(['bar', 'baz', 'existing', 'foo'].sort());
    });

    it('preserves each word\'s SRS progress and collocations after merging (not reset to fresh)', async () => {
      const student = await createStudent();
      const dest = await createVocabBook({ userId: student._id, words: [] });
      const reviewedAt = new Date('2026-01-01T00:00:00Z');
      const nextReview = new Date('2026-02-01T00:00:00Z');
      const src = await createVocabBook({
        userId: student._id,
        words: [{
          word: 'studied', srsBox: 3, lastReviewedAt: reviewedAt, nextReviewAt: nextReview,
          collocations: ['study hard', 'study abroad'], wrongCount: 2, correctCount: 5,
        }],
      });

      await vocabBookService.mergeBooks(dest._id, student._id, [src._id]);

      const reloaded = await VocabBook.findById(dest._id);
      const merged = reloaded.words.find(w => w.word === 'studied');
      expect(merged.srsBox).toBe(3);
      expect(merged.lastReviewedAt.toISOString()).toBe(reviewedAt.toISOString());
      expect(merged.nextReviewAt.toISOString()).toBe(nextReview.toISOString());
      expect(merged.collocations).toEqual(['study hard', 'study abroad']);
      // correctCount is new (Priority 1.5, Task 7) — regression guard against
      // the exact class of bug already found once for srsBox/wrongCount: a
      // merge silently dropping a field back to its schema default.
      expect(merged.wrongCount).toBe(2);
      expect(merged.correctCount).toBe(5);
    });

    it('skips default books passed as a source (silently excluded)', async () => {
      const student = await createStudent();
      const dest = await createVocabBook({ userId: student._id, words: [] });
      const defaultSrc = await createVocabBook({ userId: student._id, isDefault: true, words: [{ word: 'fromDefault' }] });

      const result = await vocabBookService.mergeBooks(dest._id, student._id, [defaultSrc._id]);
      expect(result.status).toBe('no_valid_sources');

      const reloaded = await VocabBook.findById(dest._id);
      expect(reloaded.words).toHaveLength(0);

      // Default source book must survive (not deleted)
      const stillThere = await VocabBook.findById(defaultSrc._id);
      expect(stillThere).toBeTruthy();
    });

    it('skips duplicate words (case-insensitive)', async () => {
      const student = await createStudent();
      const dest = await createVocabBook({ userId: student._id, words: [{ word: 'Apple' }] });
      const src = await createVocabBook({ userId: student._id, words: [{ word: 'apple' }, { word: 'banana' }] });

      const result = await vocabBookService.mergeBooks(dest._id, student._id, [src._id]);
      expect(result.status).toBe('ok');
      expect(result.addedCount).toBe(1);

      const reloaded = await VocabBook.findById(dest._id);
      expect(reloaded.words).toHaveLength(2);
    });

    it('stops adding once the destination would exceed 300 words', async () => {
      const student = await createStudent();
      const dest = await createVocabBook({ userId: student._id, words: makeWords(298, 'dest') });
      const src = await createVocabBook({ userId: student._id, words: makeWords(5, 'src') });

      const result = await vocabBookService.mergeBooks(dest._id, student._id, [src._id]);
      expect(result.status).toBe('ok');
      expect(result.addedCount).toBe(2);

      const reloaded = await VocabBook.findById(dest._id);
      expect(reloaded.words).toHaveLength(300);
    });

    it('deletes non-default source books after merging', async () => {
      const student = await createStudent();
      const dest = await createVocabBook({ userId: student._id, words: [] });
      const src = await createVocabBook({ userId: student._id, words: [{ word: 'foo' }] });

      await vocabBookService.mergeBooks(dest._id, student._id, [src._id]);

      const gone = await VocabBook.findById(src._id);
      expect(gone).toBeNull();
    });

    it('returns dest_not_found for a missing destination', async () => {
      const student = await createStudent();
      const src = await createVocabBook({ userId: student._id, words: [{ word: 'foo' }] });
      const fakeId = new mongoose.Types.ObjectId();

      const result = await vocabBookService.mergeBooks(fakeId, student._id, [src._id]);
      expect(result.status).toBe('dest_not_found');
    });

    it('including the destination id in sourceIds does not delete the destination book (defense-in-depth against a client sending its own target as a source)', async () => {
      const student = await createStudent();
      const dest = await createVocabBook({ userId: student._id, words: [{ word: 'existing' }] });
      const src = await createVocabBook({ userId: student._id, words: [{ word: 'foo' }] });

      const result = await vocabBookService.mergeBooks(dest._id, student._id, [dest._id, src._id]);
      expect(result.status).toBe('ok');

      const reloadedDest = await VocabBook.findById(dest._id);
      expect(reloadedDest).toBeTruthy(); // must survive — the frontend already excludes this case, but the server must not depend on that
      expect(reloadedDest.words.map(w => w.word).sort()).toEqual(['existing', 'foo']);
    });
  });

  describe('bulkAddWords', () => {
    it('counts skippedDup and skippedLimit separately', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: makeWords(298, 'existing').concat([{ word: 'Dup' }]) });
      // book now has 299 words, 1 free slot

      const result = await vocabBookService.bulkAddWords(book._id, student, [
        { word: 'dup' },     // duplicate (case-insensitive) of 'Dup'
        { word: 'newone' },  // fills the last free slot
        { word: 'another' }, // hits the limit
      ]);

      expect(result.status).toBe('ok');
      expect(result.addedCount).toBe(1);
      expect(result.skippedDup).toBe(1);
      expect(result.skippedLimit).toBe(1);

      const reloaded = await VocabBook.findById(book._id);
      expect(reloaded.words).toHaveLength(300);
    });

    it('returns not_found for a missing book', async () => {
      const student = await createStudent();
      const fakeId = new mongoose.Types.ObjectId();
      const result = await vocabBookService.bulkAddWords(fakeId, student, [{ word: 'x' }]);
      expect(result.status).toBe('not_found');
    });

    it('carries per-item collocations through (e.g. VocabularyLesson "Lưu tất cả")', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [] });
      await vocabBookService.bulkAddWords(book._id, student, [
        { word: 'benefit', meaning: 'lợi ích', collocations: ['mutual benefit', 'economic benefit'] },
        { word: 'apple', meaning: 'táo' }, // no collocations given
      ]);

      const reloaded = await VocabBook.findById(book._id);
      const benefit = reloaded.words.find(w => w.word === 'benefit');
      const apple = reloaded.words.find(w => w.word === 'apple');
      expect(benefit.collocations).toEqual(['mutual benefit', 'economic benefit']);
      expect(apple.collocations).toEqual([]);
    });
  });

  describe('getVocabStats', () => {
    it('sums totals across ALL of a user\'s books, not just one', async () => {
      const student = await createStudent();
      await createVocabBook({ userId: student._id, words: [
        { word: 'a', status: 'da-thuoc' },
        { word: 'b', status: 'nho-so-so' },
      ] });
      await createVocabBook({ userId: student._id, words: [
        { word: 'c', status: 'chua-thuoc' },
        { word: 'd', status: 'da-thuoc' },
      ] });

      const stats = await vocabBookService.getVocabStats(student._id);
      expect(stats.totalWords).toBe(4);
      expect(stats.mastered).toBe(2);
      expect(stats.reviewing).toBe(1);
      expect(stats.notYet).toBe(1);
    });

    it('counts a word as "weak" once wrongCount reaches the threshold (3) — matches dashboard.js\'s "Ôn lại từ hay sai" button', async () => {
      const student = await createStudent();
      await createVocabBook({ userId: student._id, words: [
        { word: 'a', wrongCount: 0 },
        { word: 'b', wrongCount: 2 },
        { word: 'c', wrongCount: 3 },
        { word: 'd', wrongCount: 5 },
      ] });

      const stats = await vocabBookService.getVocabStats(student._id);
      expect(stats.weak).toBe(2);
    });

    it('counts a word as due today when nextReviewAt is null (never reviewed) or in the past', async () => {
      const student = await createStudent();
      const past = new Date(Date.now() - 86400000);
      const future = new Date(Date.now() + 86400000);
      await createVocabBook({ userId: student._id, words: [
        { word: 'never-reviewed', nextReviewAt: null },
        { word: 'overdue', nextReviewAt: past },
        { word: 'not-due-yet', nextReviewAt: future },
      ] });

      const stats = await vocabBookService.getVocabStats(student._id);
      expect(stats.dueToday).toBe(2);
    });

    it('returns all-zero stats for a user with no words saved anywhere', async () => {
      const student = await createStudent();
      const stats = await vocabBookService.getVocabStats(student._id);
      expect(stats).toEqual({ totalWords: 0, mastered: 0, reviewing: 0, notYet: 0, weak: 0, dueToday: 0 });
    });

    it('only counts the given user\'s own books, never another student\'s', async () => {
      const student = await createStudent();
      const other = await createStudent();
      await createVocabBook({ userId: other._id, words: [{ word: 'not-mine', status: 'da-thuoc' }] });

      const stats = await vocabBookService.getVocabStats(student._id);
      expect(stats.totalWords).toBe(0);
    });
  });

  describe('getWeakWords', () => {
    it('only returns words at or above the weak threshold (wrongCount>=3)', async () => {
      const student = await createStudent();
      await createVocabBook({ userId: student._id, words: [
        { word: 'safe', wrongCount: 2 },
        { word: 'weak1', wrongCount: 3 },
        { word: 'weak2', wrongCount: 8 },
      ] });

      const words = await vocabBookService.getWeakWords(student._id);
      expect(words.map(w => w.word.word).sort()).toEqual(['weak1', 'weak2']);
    });

    it('sorts by wrongCount descending', async () => {
      const student = await createStudent();
      await createVocabBook({ userId: student._id, words: [
        { word: 'low', wrongCount: 3 },
        { word: 'high', wrongCount: 9 },
        { word: 'mid', wrongCount: 5 },
      ] });

      const words = await vocabBookService.getWeakWords(student._id);
      expect(words.map(w => w.word.word)).toEqual(['high', 'mid', 'low']);
    });

    it('respects the limit parameter', async () => {
      const student = await createStudent();
      await createVocabBook({ userId: student._id, words: makeWords(10).map(w => ({ ...w, wrongCount: 5 })) });

      const words = await vocabBookService.getWeakWords(student._id, 3);
      expect(words).toHaveLength(3);
    });

    it('aggregates across multiple books, carrying each word\'s own bookId/bookName', async () => {
      const student = await createStudent();
      const bookA = await createVocabBook({ userId: student._id, name: 'Book A', words: [{ word: 'a-weak', wrongCount: 4 }] });
      const bookB = await createVocabBook({ userId: student._id, name: 'Book B', words: [{ word: 'b-weak', wrongCount: 4 }] });

      const words = await vocabBookService.getWeakWords(student._id);
      expect(words).toHaveLength(2);
      const byName = Object.fromEntries(words.map(w => [w.word.word, w]));
      expect(String(byName['a-weak'].bookId)).toBe(String(bookA._id));
      expect(byName['a-weak'].bookName).toBe('Book A');
      expect(String(byName['b-weak'].bookId)).toBe(String(bookB._id));
    });

    it('only returns the given user\'s own weak words, never another student\'s', async () => {
      const student = await createStudent();
      const other = await createStudent();
      await createVocabBook({ userId: other._id, words: [{ word: 'not-mine', wrongCount: 9 }] });

      const words = await vocabBookService.getWeakWords(student._id);
      expect(words).toHaveLength(0);
    });

    it('returns an empty array when nothing meets the threshold', async () => {
      const student = await createStudent();
      await createVocabBook({ userId: student._id, words: [{ word: 'fine', wrongCount: 1 }] });
      const words = await vocabBookService.getWeakWords(student._id);
      expect(words).toEqual([]);
    });
  });

  describe('completePractice (student side-effects)', () => {
    // Streak credit requires >= VOCAB_STREAK_WORD_THRESHOLD (35) words
    // engaged in the Vietnam calendar day, summed across every add/update/
    // practice call that day — a single 5-word quiz (the minimum a call
    // will even accept) is well below that on its own, so most of these
    // tests answer 35 words in one call to cross the threshold immediately.

    it('a single sub-threshold session (< 35 words that day) earns no streak at all', async () => {
      const student = await createStudent();
      // 100% accuracy would normally be +2, but only 10 words this day — no streak yet.
      const result = await vocabBookService.completePractice(student, { wordsAnswered: 10, correctAnswered: 10 });
      expect(result.status).toBe('ok');
      expect(result.bonusApplied).toBe(0);
      expect(result.streak).toBe(0);

      const fresh = await require('../../../models/User').findById(student._id);
      expect(fresh.lastActivityDate).toBeNull(); // day doesn't count as "studied" yet
    });

    // lastVocabStudyDate powers nav.js's "haven't studied vocab in N days"
    // popup — deliberately stamped even below the streak threshold (unlike
    // lastActivityDate above), since a below-threshold session is still real
    // vocab practice that should clear the inactivity nudge.
    it('stamps lastVocabStudyDate on every real batch, even below the streak threshold', async () => {
      const student = await createStudent();
      await vocabBookService.completePractice(student, { wordsAnswered: 10, correctAnswered: 10 });

      const fresh = await require('../../../models/User').findById(student._id);
      expect(fresh.lastVocabStudyDate).not.toBeNull();
      expect(Date.now() - fresh.lastVocabStudyDate.getTime()).toBeLessThan(5000);
    });

    it('streak unlocks once cumulative words that day cross the threshold, across separate sessions', async () => {
      const student = await createStudent();
      const first = await vocabBookService.completePractice(student, { wordsAnswered: 20, correctAnswered: 20 });
      expect(first.bonusApplied).toBe(0); // 20/35 so far — not enough yet

      // +15 more this call brings the day's total to 35 — now it counts.
      const second = await vocabBookService.completePractice(student, { wordsAnswered: 15, correctAnswered: 15 });
      expect(second.bonusApplied).toBe(2);
      expect(second.streak).toBe(2);
    });

    it('applies +1 streak for 80-90% accuracy once the day\'s 35-word threshold is met', async () => {
      const student = await createStudent();
      // 28/35 = 80%
      const result = await vocabBookService.completePractice(student, { wordsAnswered: 35, correctAnswered: 28 });
      expect(result.status).toBe('ok');
      expect(result.bonusApplied).toBe(1);
      expect(result.streak).toBe(1);
    });

    it('applies +2 streak for >=90% accuracy once the day\'s 35-word threshold is met', async () => {
      const student = await createStudent();
      const result = await vocabBookService.completePractice(student, { wordsAnswered: 35, correctAnswered: 35 });
      expect(result.bonusApplied).toBe(2);
      expect(result.streak).toBe(2);
    });

    it('applies +0 streak for <80% accuracy, but still keeps the day-chain alive once past the word threshold', async () => {
      const student = await createStudent();
      // 21/35 = 60%
      const result = await vocabBookService.completePractice(student, { wordsAnswered: 35, correctAnswered: 21 });
      expect(result.bonusApplied).toBe(0);
      expect(result.streak).toBe(0);

      const fresh = await require('../../../models/User').findById(student._id);
      expect(fresh.lastActivityDate).not.toBeNull(); // studied today, chain alive
    });

    it('caps total streak bonus at +5 per day across multiple sessions', async () => {
      const student = await createStudent();
      // Each session alone is >= 35 words, so every one independently clears
      // the word threshold; 3 sessions at 100% (+2 each) would be +6 uncapped.
      await vocabBookService.completePractice(student, { wordsAnswered: 35, correctAnswered: 35 });
      await vocabBookService.completePractice(student, { wordsAnswered: 35, correctAnswered: 35 });
      const third = await vocabBookService.completePractice(student, { wordsAnswered: 35, correctAnswered: 35 });
      // 2 + 2 = 4 already earned today, only 1 of the requested 2 remains under the cap
      expect(third.bonusApplied).toBe(1);
      expect(third.streak).toBe(5);

      const fourth = await vocabBookService.completePractice(student, { wordsAnswered: 35, correctAnswered: 35 });
      expect(fourth.bonusApplied).toBe(0); // cap fully spent
      expect(fourth.streak).toBe(5);
    });

    describe('sessionId scoping (regression: "học xong ngay lập tức được 5 lửa")', () => {
      // dashboard.js's _reportSessionStreak() reports one long, continuous
      // practice session in batches of 5 answers (first at 5, then again at
      // 10, 15, ...), all tagged with the same sessionId. Before this fix,
      // each batch independently re-ran the accuracy → bonus tier on just
      // that batch's own 5 words, so a single ~45-word session could claim
      // the entire shared +5/day cap by itself the moment it crossed the
      // 35-word threshold and kept going for a couple more batches.

      it('a single session reported across multiple batches is capped at +2 total, even at 100% accuracy throughout', async () => {
        const student = await createStudent();
        const sessionId = 'sess-1';
        // Batch 1: 35/35 — crosses the 35-word threshold on this exact call.
        const b1 = await vocabBookService.completePractice(student, { wordsAnswered: 35, correctAnswered: 35, sessionId });
        expect(b1.bonusApplied).toBe(2);
        expect(b1.streak).toBe(2);

        // Batch 2 of the SAME session: still 100% accuracy — must NOT grant
        // another +2 on top just because the day's word threshold is still
        // crossed; the session already claimed its own +2.
        const b2 = await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 5, sessionId });
        expect(b2.bonusApplied).toBe(0);
        expect(b2.streak).toBe(2);

        // Batch 3, same session, same story — repeated batches never add more.
        const b3 = await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 5, sessionId });
        expect(b3.bonusApplied).toBe(0);
        expect(b3.streak).toBe(2);
      });

      it('two DIFFERENT sessions the same day can each still contribute toward the shared +5 cap', async () => {
        const student = await createStudent();
        const first = await vocabBookService.completePractice(student, { wordsAnswered: 35, correctAnswered: 35, sessionId: 'sess-A' });
        expect(first.bonusApplied).toBe(2);

        // A second, genuinely separate session (new sessionId) still gets
        // its own independent shot at the remaining cap.
        const second = await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 5, sessionId: 'sess-B' });
        expect(second.bonusApplied).toBe(2);
        expect(second.streak).toBe(4);
      });

      it('a session that starts below 90% but improves over later batches can still top up to the higher tier once', async () => {
        const student = await createStudent();
        const sessionId = 'sess-improving';
        // First batch of the session: 28/35 = 80% → tier 1. Also crosses the
        // word threshold in this same call.
        const b1 = await vocabBookService.completePractice(student, { wordsAnswered: 35, correctAnswered: 28, sessionId });
        expect(b1.bonusApplied).toBe(1);
        expect(b1.streak).toBe(1);

        // Second batch, perfect score: session-wide accuracy is now
        // (28+5)/(35+5) = 33/40 = 82.5% — still only tier 1, so no top-up.
        const b2 = await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 5, sessionId });
        expect(b2.bonusApplied).toBe(0);
        expect(b2.streak).toBe(1);
      });
    });

    it('the daily bonus cap resets on a new Vietnam calendar day, not a global lifetime cap', async () => {
      const VocabActivity = require('../../../models/VocabActivity');
      const student = await createStudent();
      const now = new Date();
      const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const todayVN = new Date(Date.UTC(vnNow.getUTCFullYear(), vnNow.getUTCMonth(), vnNow.getUTCDate()));
      const yesterdayVN = new Date(todayVN.getTime() - 24 * 60 * 60 * 1000);
      // Yesterday's cap was already fully spent — should have zero bearing on today.
      await VocabActivity.create({ userId: student._id, date: yesterdayVN, streakBonusEarned: 5 });

      const result = await vocabBookService.completePractice(student, { wordsAnswered: 35, correctAnswered: 35 });
      expect(result.bonusApplied).toBe(2); // full tier available today, unaffected by yesterday
    });

    it('returns too_few for fewer than 5 words answered', async () => {
      const student = await createStudent();
      const result = await vocabBookService.completePractice(student, { wordsAnswered: 4, correctAnswered: 4 });
      expect(result.status).toBe('too_few');
    });

    it('returns not_student for a non-student role', async () => {
      const { createTeacher } = require('../../factories/userFactory');
      const teacher = await createTeacher();
      const result = await vocabBookService.completePractice(teacher, { wordsAnswered: 10, correctAnswered: 10 });
      expect(result.status).toBe('not_student');
    });

    it('logs the vocab activity under the Vietnam-local calendar day, not raw UTC', async () => {
      const VocabActivity = require('../../../models/VocabActivity');
      const student = await createStudent();

      await vocabBookService.completePractice(student, { wordsAnswered: 35, correctAnswered: 35 });

      const docs = await VocabActivity.find({ userId: student._id });
      expect(docs).toHaveLength(1);
      expect(docs[0].wordsStudied).toBe(35);
      expect(docs[0].streakBonusEarned).toBe(2);

      const now = new Date();
      const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const expectedDay = new Date(Date.UTC(vnNow.getUTCFullYear(), vnNow.getUTCMonth(), vnNow.getUTCDate()));
      expect(docs[0].date.getTime()).toBe(expectedDay.getTime());
    });

    describe('Búa Daniel (streak-restore hammer)', () => {
      it('awards 1 hammer once a small unit is fully answered at >=90% cumulative accuracy', async () => {
        const student = await createStudent();
        const unit = await createVocabUnit({ words: makeWords(5) });

        const result = await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 5, unitId: unit._id, unitType: 'paraphrase', sessionId: 'sess-1'
        });

        expect(result.hammerEarned).toBe(true);
        expect(result.streakHammers).toBe(1);
      });

      // Regression test for the exact bug reported: a 100-word unit's first
      // 5-6 word batch hit 90%+ on its own and awarded the hammer immediately,
      // long before the student had gone through the rest of the unit.
      it('does NOT award a hammer for a single early batch of a larger unit', async () => {
        const student = await createStudent();
        const unit = await createVocabUnit({ words: makeWords(100) });

        const result = await vocabBookService.completePractice(student, {
          wordsAnswered: 6, correctAnswered: 6, unitId: unit._id, unitType: 'paraphrase', sessionId: 'sess-1'
        });

        expect(result.hammerEarned).toBe(false);
        expect(result.streakHammers).toBe(0);
      });

      it('awards the hammer once cumulative batches across the session cover the whole unit at >=90%', async () => {
        const student = await createStudent();
        const unit = await createVocabUnit({ words: makeWords(12) });
        const sessionId = 'sess-full-unit';

        const b1 = await vocabBookService.completePractice(student, {
          wordsAnswered: 6, correctAnswered: 6, unitId: unit._id, unitType: 'paraphrase', sessionId
        });
        expect(b1.hammerEarned).toBe(false); // only 6/12 words answered so far

        const b2 = await vocabBookService.completePractice(student, {
          wordsAnswered: 6, correctAnswered: 6, unitId: unit._id, unitType: 'paraphrase', sessionId
        });
        expect(b2.hammerEarned).toBe(true); // now 12/12 at 100% cumulative
        expect(b2.streakHammers).toBe(1);
      });

      it('does not award the hammer when cumulative accuracy across the full unit is below 90%', async () => {
        const student = await createStudent();
        const unit = await createVocabUnit({ words: makeWords(10) });
        const sessionId = 'sess-low-acc';

        await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 5, unitId: unit._id, unitType: 'paraphrase', sessionId
        });
        // Cumulative: 9/10 correct = 90% exactly once these 5 land — drop one
        // more to push it under the bar despite covering the full unit.
        const b2 = await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 3, unitId: unit._id, unitType: 'paraphrase', sessionId
        });

        expect(b2.hammerEarned).toBe(false); // 8/10 = 80% cumulative
        expect(b2.streakHammers).toBe(0);
      });

      it('does not award a hammer without a sessionId to accumulate against', async () => {
        const student = await createStudent();
        const unit = await createVocabUnit({ words: makeWords(5) });

        const result = await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 5, unitId: unit._id, unitType: 'paraphrase'
        });

        expect(result.hammerEarned).toBe(false);
      });

      it('does not award a second hammer for re-clearing the same unit', async () => {
        const student = await createStudent();
        const unit = await createVocabUnit({ words: makeWords(5) });

        await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 5, unitId: unit._id, unitType: 'paraphrase', sessionId: 'sess-a'
        });
        const second = await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 5, unitId: unit._id, unitType: 'paraphrase', sessionId: 'sess-b'
        });

        expect(second.hammerEarned).toBe(false);
        expect(second.streakHammers).toBe(1);
      });

      it('does not award a hammer below 90% accuracy or for non-paraphrase sessions', async () => {
        const student = await createStudent();
        const unit = await createVocabUnit({ words: makeWords(5) });

        const belowBar = await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 4, unitId: unit._id, unitType: 'paraphrase', sessionId: 'sess-below'
        });
        expect(belowBar.hammerEarned).toBe(false);

        const notParaphrase = await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 5, unitId: unit._id, unitType: null, sessionId: 'sess-not-para'
        });
        expect(notParaphrase.hammerEarned).toBe(false);
      });
    });
  });
});
