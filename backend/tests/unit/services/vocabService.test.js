'use strict';

const vocabService = require('../../../services/vocabService');
const VocabUnit = require('../../../models/VocabUnit');
const { createVocabUnit } = require('../../factories/contentFactory');

describe('vocabService', () => {
  describe('listUnits / getUnitByNumber', () => {
    it('only returns active units', async () => {
      await createVocabUnit({ unitNumber: 1, title: 'Active One', isActive: true });
      await createVocabUnit({ unitNumber: 2, title: 'Inactive One', isActive: false });
      await createVocabUnit({ unitNumber: 3, title: 'Active Two', isActive: true });

      const units = await vocabService.listUnits();
      expect(units).toHaveLength(2);
      expect(units.map(u => u.unitNumber).sort()).toEqual([1, 3]);
    });

    it('getUnitByNumber returns null for an inactive unit', async () => {
      await createVocabUnit({ unitNumber: 5, isActive: false });
      const result = await vocabService.getUnitByNumber(5);
      expect(result).toBeNull();
    });

    it('getUnitByNumber returns the active unit', async () => {
      await createVocabUnit({ unitNumber: 7, title: 'Seven', isActive: true });
      const result = await vocabService.getUnitByNumber(7);
      expect(result).toBeTruthy();
      expect(result.title).toBe('Seven');
    });
  });

  describe('createUnit', () => {
    it('creates a unit', async () => {
      const result = await vocabService.createUnit({ unitNumber: 10, title: 'Unit Ten' });
      expect(result.status).toBe('ok');
      expect(result.unit.unitNumber).toBe(10);
    });

    it('rejects a duplicate unitNumber', async () => {
      await createVocabUnit({ unitNumber: 11, title: 'First' });
      const result = await vocabService.createUnit({ unitNumber: 11, title: 'Second' });
      expect(result.status).toBe('duplicate');

      const count = await VocabUnit.countDocuments({ unitNumber: 11 });
      expect(count).toBe(1);
    });
  });

  describe('updateUnit', () => {
    it('updates only the supplied fields, leaving others untouched', async () => {
      const unit = await createVocabUnit({
        unitNumber: 20, title: 'Old Title', description: 'Old Desc', level: 'A1', isActive: true,
      });

      const updated = await vocabService.updateUnit(unit._id, { title: 'New Title' });
      expect(updated.title).toBe('New Title');
      expect(updated.description).toBe('Old Desc');
      expect(updated.level).toBe('A1');
      expect(updated.isActive).toBe(true);
    });

    it('updates multiple supplied fields at once', async () => {
      const unit = await createVocabUnit({ unitNumber: 21, title: 'X', level: 'A1', isActive: true });
      const updated = await vocabService.updateUnit(unit._id, { level: 'B2', isActive: false });
      expect(updated.level).toBe('B2');
      expect(updated.isActive).toBe(false);
      expect(updated.title).toBe('X');
    });
  });

  describe('addWord', () => {
    it('adds a word to a unit', async () => {
      const unit = await createVocabUnit({ unitNumber: 30, words: [] });
      const result = await vocabService.addWord(unit._id, { word: 'apple', meaning: 'táo' });
      expect(result.status).toBe('ok');
      expect(result.wordCount).toBe(1);
    });

    it('rejects a case-insensitive duplicate word within the same unit', async () => {
      const unit = await createVocabUnit({ unitNumber: 31, words: [{ word: 'Apple', meaning: 'táo' }] });
      const result = await vocabService.addWord(unit._id, { word: 'apple', meaning: 'táo 2' });
      expect(result.status).toBe('duplicate');

      const reloaded = await VocabUnit.findById(unit._id);
      expect(reloaded.words).toHaveLength(1);
    });

    it('returns not_found for a missing unit', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const result = await vocabService.addWord(fakeId, { word: 'apple' });
      expect(result.status).toBe('not_found');
    });
  });

  describe('updateWord', () => {
    it('updates a word at a valid index', async () => {
      const unit = await createVocabUnit({
        unitNumber: 40,
        words: [{ word: 'cat', meaning: 'mèo' }, { word: 'dog', meaning: 'chó' }],
      });
      const result = await vocabService.updateWord(unit._id, 1, { meaning: 'con chó' });
      expect(result.status).toBe('ok');
      expect(result.word.meaning).toBe('con chó');
      expect(result.word.word).toBe('dog');
    });

    it('returns bad_index for an out-of-range index', async () => {
      const unit = await createVocabUnit({ unitNumber: 41, words: [{ word: 'cat' }] });
      const result = await vocabService.updateWord(unit._id, 5, { meaning: 'x' });
      expect(result.status).toBe('bad_index');
    });

    it('returns bad_index for a NaN index', async () => {
      const unit = await createVocabUnit({ unitNumber: 42, words: [{ word: 'cat' }] });
      const result = await vocabService.updateWord(unit._id, 'not-a-number', { meaning: 'x' });
      expect(result.status).toBe('bad_index');
    });

    it('returns bad_index for a negative index', async () => {
      const unit = await createVocabUnit({ unitNumber: 43, words: [{ word: 'cat' }] });
      const result = await vocabService.updateWord(unit._id, -1, { meaning: 'x' });
      expect(result.status).toBe('bad_index');
    });

    it('returns not_found for a missing unit', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const result = await vocabService.updateWord(fakeId, 0, { meaning: 'x' });
      expect(result.status).toBe('not_found');
    });
  });

  describe('deleteWord', () => {
    it('deletes a word at a valid index', async () => {
      const unit = await createVocabUnit({
        unitNumber: 50,
        words: [{ word: 'cat' }, { word: 'dog' }],
      });
      const result = await vocabService.deleteWord(unit._id, 0);
      expect(result.status).toBe('ok');
      expect(result.removed).toBe('cat');

      const reloaded = await VocabUnit.findById(unit._id);
      expect(reloaded.words).toHaveLength(1);
      expect(reloaded.words[0].word).toBe('dog');
    });

    it('returns bad_index for an out-of-range index', async () => {
      const unit = await createVocabUnit({ unitNumber: 51, words: [{ word: 'cat' }] });
      const result = await vocabService.deleteWord(unit._id, 3);
      expect(result.status).toBe('bad_index');
    });

    it('returns bad_index for a NaN index', async () => {
      const unit = await createVocabUnit({ unitNumber: 52, words: [{ word: 'cat' }] });
      const result = await vocabService.deleteWord(unit._id, 'abc');
      expect(result.status).toBe('bad_index');
    });

    it('returns not_found for a missing unit', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const result = await vocabService.deleteWord(fakeId, 0);
      expect(result.status).toBe('not_found');
    });
  });

  describe('bulkAddWords', () => {
    it('replace=true overwrites all existing words', async () => {
      const unit = await createVocabUnit({ unitNumber: 60, words: [{ word: 'old' }] });
      const result = await vocabService.bulkAddWords(unit._id, [{ word: 'new1' }, { word: 'new2' }], true);
      expect(result.status).toBe('ok');
      expect(result.wordCount).toBe(2);

      const reloaded = await VocabUnit.findById(unit._id);
      expect(reloaded.words.map(w => w.word)).toEqual(['new1', 'new2']);
    });

    it('replace=false merges and skips words already present case-insensitively', async () => {
      const unit = await createVocabUnit({ unitNumber: 61, words: [{ word: 'Apple' }] });
      const result = await vocabService.bulkAddWords(
        unit._id,
        [{ word: 'apple' }, { word: 'banana' }],
        false
      );
      expect(result.status).toBe('ok');
      expect(result.wordCount).toBe(2);

      const reloaded = await VocabUnit.findById(unit._id);
      expect(reloaded.words.map(w => w.word)).toEqual(['Apple', 'banana']);
    });

    it('returns not_found for a missing unit', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const result = await vocabService.bulkAddWords(fakeId, [{ word: 'x' }], false);
      expect(result.status).toBe('not_found');
    });
  });

  describe('splitUnit', () => {
    it('returns too_small if the unit already has <= chunkSize words', async () => {
      const unit = await createVocabUnit({
        unitNumber: 70,
        words: [{ word: 'a' }, { word: 'b' }],
      });
      const result = await vocabService.splitUnit(unit._id, 5);
      expect(result.status).toBe('too_small');
      expect(result.wordCount).toBe(2);
    });

    it('returns not_found for a missing unit', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const result = await vocabService.splitUnit(fakeId, 5);
      expect(result.status).toBe('not_found');
    });

    it('splits a unit into chunks, preserving total word count with no loss/duplication', async () => {
      const words = Array.from({ length: 25 }, (_, i) => ({ word: `word${i}`, meaning: `m${i}` }));
      const unit = await createVocabUnit({
        unitNumber: 100, sortOrder: 0, title: 'Big Unit', words,
      });

      const result = await vocabService.splitUnit(unit._id, 10);
      expect(result.status).toBe('ok');
      // 25 words / chunkSize 10 -> chunks of 10, 10, 5 -> 3 parts
      expect(result.parts).toBe(3);
      expect(result.baseTitle).toBe('Big Unit');

      const allUnits = await VocabUnit.find({ title: { $regex: /^Big Unit/ } }).sort({ unitNumber: 1 });
      expect(allUnits).toHaveLength(3);

      const totalWords = allUnits.reduce((sum, u) => sum + u.words.length, 0);
      expect(totalWords).toBe(25);

      const allWordTexts = allUnits.flatMap(u => u.words.map(w => w.word)).sort();
      const expectedWordTexts = words.map(w => w.word).sort();
      expect(allWordTexts).toEqual(expectedWordTexts);

      // Titles renamed with " (i/n)" suffixes
      expect(allUnits.map(u => u.title).sort()).toEqual([
        'Big Unit (1/3)', 'Big Unit (2/3)', 'Big Unit (3/3)',
      ]);

      // The original unit keeps its _id and now holds the first chunk
      const original = allUnits.find(u => u._id.toString() === unit._id.toString());
      expect(original.title).toBe('Big Unit (1/3)');
      expect(original.words).toHaveLength(10);
    });

    it('creates N-1 new VocabUnit documents beyond the original', async () => {
      const words = Array.from({ length: 12 }, (_, i) => ({ word: `w${i}` }));
      const unit = await createVocabUnit({ unitNumber: 110, sortOrder: 0, title: 'Split Me', words });

      const beforeCount = await VocabUnit.countDocuments();
      const result = await vocabService.splitUnit(unit._id, 5);
      const afterCount = await VocabUnit.countDocuments();

      expect(result.parts).toBe(3);
      expect(afterCount - beforeCount).toBe(result.parts - 1);
    });
  });
});
