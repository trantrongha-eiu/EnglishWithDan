'use strict';

const mongoose = require('mongoose');
const vocabBookService = require('../../../services/vocabBookService');
const VocabBook = require('../../../models/VocabBook');
const { createVocabBook } = require('../../factories/contentFactory');
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
    it('updates streak for a student with >=5 words answered', async () => {
      const student = await createStudent();
      const result = await vocabBookService.completePractice(student, 5);
      expect(result.status).toBe('ok');
      expect(result.streak).toBe(1);
    });

    it('returns too_few for fewer than 5 words answered', async () => {
      const student = await createStudent();
      const result = await vocabBookService.completePractice(student, 4);
      expect(result.status).toBe('too_few');
    });

    it('returns not_student for a non-student role', async () => {
      const { createTeacher } = require('../../factories/userFactory');
      const teacher = await createTeacher();
      const result = await vocabBookService.completePractice(teacher, 10);
      expect(result.status).toBe('not_student');
    });
  });
});
