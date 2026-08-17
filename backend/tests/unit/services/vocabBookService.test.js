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

    it('does not grant a streak when nothing but non-status fields change', async () => {
      const student = await createStudent();
      const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', status: 'chua-thuoc' }] });
      const wordId = book.words[0]._id;

      await vocabBookService.updateWord(book._id, wordId, student._id, student, { note: 'a note' });

      const fresh = await require('../../../models/User').findById(student._id);
      expect(fresh.learningStreak).toBe(0);
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
