'use strict';

const VocabBook = require('../../../models/VocabBook');
const DifficultWord = require('../../../models/DifficultWord');
const User = require('../../../models/User');
const { createStudent } = require('../../factories/userFactory');
const { createVocabBook } = require('../../factories/contentFactory');

// Regression test for the 2026-08-19 incident: a one-off script ran
// VocabBook.deleteMany({}) (empty filter) and deleted every student's
// saved vocabulary. guardAgainstMassDelete (applied to VocabBook,
// DifficultWord, User) should make that specific mistake impossible going
// forward, on any of these models, from any call site.
describe('guardAgainstMassDelete', () => {
  it('rejects VocabBook.deleteMany({}) with an empty filter', async () => {
    const student = await createStudent();
    await createVocabBook({ userId: student._id, name: 'Keep me' });
    await expect(VocabBook.deleteMany({})).rejects.toThrow(/empty\/unscoped filter/);
    // Nothing should have been deleted.
    expect(await VocabBook.countDocuments({})).toBeGreaterThan(0);
  });

  it('rejects VocabBook.deleteOne({}) (query form) with an empty filter', async () => {
    const student = await createStudent();
    await createVocabBook({ userId: student._id, name: 'Keep me too' });
    await expect(VocabBook.deleteOne({})).rejects.toThrow(/empty\/unscoped filter/);
    expect(await VocabBook.countDocuments({})).toBeGreaterThan(0);
  });

  it('rejects VocabBook.findOneAndDelete({}) with an empty filter', async () => {
    const student = await createStudent();
    await createVocabBook({ userId: student._id, name: 'Keep me three' });
    await expect(VocabBook.findOneAndDelete({})).rejects.toThrow(/empty\/unscoped filter/);
    expect(await VocabBook.countDocuments({})).toBeGreaterThan(0);
  });

  it('still allows a properly scoped deleteMany (the real mergeBooks call shape)', async () => {
    const student = await createStudent();
    const book = await createVocabBook({ userId: student._id, name: 'Delete me', isDefault: false });
    await expect(
      VocabBook.deleteMany({ _id: { $in: [book._id] }, userId: student._id, isDefault: false })
    ).resolves.toMatchObject({ deletedCount: 1 });
    expect(await VocabBook.findById(book._id)).toBeNull();
  });

  it('still allows a document-level doc.deleteOne() (inherently scoped to its own _id)', async () => {
    const student = await createStudent();
    const book = await createVocabBook({ userId: student._id, name: 'Delete me directly' });
    const doc = await VocabBook.findById(book._id);
    await expect(doc.deleteOne()).resolves.toBeTruthy();
    expect(await VocabBook.findById(book._id)).toBeNull();
  });

  it('also guards DifficultWord and User models', async () => {
    await expect(DifficultWord.deleteMany({})).rejects.toThrow(/empty\/unscoped filter/);
    await expect(User.deleteMany({})).rejects.toThrow(/empty\/unscoped filter/);
  });
});
