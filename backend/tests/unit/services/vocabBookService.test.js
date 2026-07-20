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

    it('returns not_found for a missing book', async () => {
      const student = await createStudent();
      const fakeId = new mongoose.Types.ObjectId();
      const result = await vocabBookService.addWord(fakeId, student, { word: 'apple' });
      expect(result.status).toBe('not_found');
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
  });

  describe('completePractice (student side-effects)', () => {
    it('applies +1 streak for 80-90% accuracy', async () => {
      const student = await createStudent();
      // 4/5 = 80%
      const result = await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 4 });
      expect(result.status).toBe('ok');
      expect(result.bonusApplied).toBe(1);
      expect(result.streak).toBe(1);
    });

    it('applies +2 streak for >=90% accuracy', async () => {
      const student = await createStudent();
      const result = await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 5 });
      expect(result.bonusApplied).toBe(2);
      expect(result.streak).toBe(2);
    });

    it('applies +0 streak for <80% accuracy, but still keeps the day-chain alive', async () => {
      const student = await createStudent();
      // 3/5 = 60%
      const result = await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 3 });
      expect(result.bonusApplied).toBe(0);
      expect(result.streak).toBe(0);

      const fresh = await require('../../../models/User').findById(student._id);
      expect(fresh.lastActivityDate).not.toBeNull(); // studied today, chain alive
    });

    it('caps total streak bonus at +5 per day across multiple sessions', async () => {
      const student = await createStudent();
      // 3 sessions at 100% (+2 each) in the same day would be +6 uncapped
      await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 5 });
      await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 5 });
      const third = await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 5 });
      // 2 + 2 = 4 already earned today, only 1 of the requested 2 remains under the cap
      expect(third.bonusApplied).toBe(1);
      expect(third.streak).toBe(5);

      const fourth = await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 5 });
      expect(fourth.bonusApplied).toBe(0); // cap fully spent
      expect(fourth.streak).toBe(5);
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

      const result = await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 5 });
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

      await vocabBookService.completePractice(student, { wordsAnswered: 5, correctAnswered: 5 });
      // logActivity() inside completePractice is fire-and-forget — give its
      // upsert a moment to land before asserting on it.
      await new Promise(resolve => setTimeout(resolve, 50));

      const docs = await VocabActivity.find({ userId: student._id });
      expect(docs).toHaveLength(1);
      expect(docs[0].wordsStudied).toBe(5);
      expect(docs[0].streakBonusEarned).toBe(2);

      const now = new Date();
      const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const expectedDay = new Date(Date.UTC(vnNow.getUTCFullYear(), vnNow.getUTCMonth(), vnNow.getUTCDate()));
      expect(docs[0].date.getTime()).toBe(expectedDay.getTime());
    });

    describe('Búa Daniel (streak-restore hammer)', () => {
      it('awards 1 hammer for a paraphrase unit cleared at >=90% accuracy', async () => {
        const student = await createStudent();
        const unit = await createVocabUnit();

        const result = await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 5, unitId: unit._id, unitType: 'paraphrase'
        });

        expect(result.hammerEarned).toBe(true);
        expect(result.streakHammers).toBe(1);
      });

      it('does not award a second hammer for re-clearing the same unit', async () => {
        const student = await createStudent();
        const unit = await createVocabUnit();

        await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 5, unitId: unit._id, unitType: 'paraphrase'
        });
        const second = await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 5, unitId: unit._id, unitType: 'paraphrase'
        });

        expect(second.hammerEarned).toBe(false);
        expect(second.streakHammers).toBe(1);
      });

      it('does not award a hammer below 90% accuracy or for non-paraphrase sessions', async () => {
        const student = await createStudent();
        const unit = await createVocabUnit();

        const belowBar = await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 4, unitId: unit._id, unitType: 'paraphrase'
        });
        expect(belowBar.hammerEarned).toBe(false);

        const notParaphrase = await vocabBookService.completePractice(student, {
          wordsAnswered: 5, correctAnswered: 5, unitId: unit._id, unitType: null
        });
        expect(notParaphrase.hammerEarned).toBe(false);
      });
    });
  });
});
