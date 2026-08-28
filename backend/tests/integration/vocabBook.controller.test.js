// Integration tests for DELETE /api/vocabbook/:id/words (bulk word delete).
// Regression coverage for BUG-019 (2026-08-27 audit): wordIds:null reached
// vocabBookService.deleteWords()'s wordIds.includes(...) filter and threw —
// the controller's `const { wordIds = [] } = req.body` default only ever
// fires for undefined, not an explicit null.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createVocabBook } = require('../factories/contentFactory');
const VocabActivity = require('../../models/VocabActivity');
const { todayVNDate } = require('../../services/streakBonusService');

describe('DELETE /api/vocabbook/:id/words', () => {
  async function setUp() {
    const user = await createPremiumStudent();
    const book = await createVocabBook({
      userId: user._id,
      words: [{ word: 'apple', meaning: 'táo' }, { word: 'banana', meaning: 'chuối' }],
    });
    const token = signTokenFor(user);
    return { user, book, token };
  }

  test('wordIds:null returns 400, not 500', async () => {
    const { book, token } = await setUp();
    const res = await request(app)
      .delete(`/api/vocabbook/${book._id}/words`)
      .set('Authorization', `Bearer ${token}`)
      .send({ wordIds: null });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('a non-array wordIds (string) returns 400', async () => {
    const { book, token } = await setUp();
    const res = await request(app)
      .delete(`/api/vocabbook/${book._id}/words`)
      .set('Authorization', `Bearer ${token}`)
      .send({ wordIds: 'not-an-array' });
    expect(res.status).toBe(400);
  });

  test('a non-array wordIds (object) returns 400', async () => {
    const { book, token } = await setUp();
    const res = await request(app)
      .delete(`/api/vocabbook/${book._id}/words`)
      .set('Authorization', `Bearer ${token}`)
      .send({ wordIds: {} });
    expect(res.status).toBe(400);
  });

  test('an array with a non-string entry returns 400', async () => {
    const { book, token } = await setUp();
    const res = await request(app)
      .delete(`/api/vocabbook/${book._id}/words`)
      .set('Authorization', `Bearer ${token}`)
      .send({ wordIds: [123] });
    expect(res.status).toBe(400);
  });

  test('wordIds omitted entirely still works (existing default-to-empty behavior, unchanged)', async () => {
    const { book, token } = await setUp();
    const res = await request(app)
      .delete(`/api/vocabbook/${book._id}/words`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(200);
  });

  test('empty array deletes nothing and succeeds', async () => {
    const { book, token } = await setUp();
    const res = await request(app)
      .delete(`/api/vocabbook/${book._id}/words`)
      .set('Authorization', `Bearer ${token}`)
      .send({ wordIds: [] });
    expect(res.status).toBe(200);

    const VocabBook = require('../../models/VocabBook');
    const fresh = await VocabBook.findById(book._id).lean();
    expect(fresh.words).toHaveLength(2);
  });

  test('an array containing a malformed (non-ObjectId) string is a harmless no-op, not a crash', async () => {
    const { book, token } = await setUp();
    const res = await request(app)
      .delete(`/api/vocabbook/${book._id}/words`)
      .set('Authorization', `Bearer ${token}`)
      .send({ wordIds: ['not-a-real-object-id'] });
    expect(res.status).toBe(200);

    const VocabBook = require('../../models/VocabBook');
    const fresh = await VocabBook.findById(book._id).lean();
    expect(fresh.words).toHaveLength(2); // nothing matched, nothing deleted
  });

  test('valid word IDs are actually deleted', async () => {
    const { book, token } = await setUp();
    const wordId = book.words[0]._id.toString();
    const res = await request(app)
      .delete(`/api/vocabbook/${book._id}/words`)
      .set('Authorization', `Bearer ${token}`)
      .send({ wordIds: [wordId] });
    expect(res.status).toBe(200);

    const VocabBook = require('../../models/VocabBook');
    const fresh = await VocabBook.findById(book._id).lean();
    expect(fresh.words).toHaveLength(1);
    expect(fresh.words[0].word).toBe('banana');
  });
});

describe('GET /api/vocabbook/daily-goal', () => {
  test('target scales with targetBand; reports today\'s progress; free students allowed', async () => {
    const student = await createStudent({ extra: { targetBand: 7.0 } }); // → 70/day
    const token = signTokenFor(student);
    await VocabActivity.create({ userId: student._id, date: todayVNDate(), wordsAdded: 12, wordsStudied: 8 });

    const res = await request(app).get('/api/vocabbook/daily-goal').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, target: 70, studied: 20, remaining: 50, met: false, targetBand: 7 });
  });

  test('no targetBand → default 35; met:true once reached', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    await VocabActivity.create({ userId: student._id, date: todayVNDate(), wordsStudied: 35 });

    const res = await request(app).get('/api/vocabbook/daily-goal').set('Authorization', `Bearer ${token}`);
    expect(res.body).toMatchObject({ target: 35, studied: 35, remaining: 0, met: true });
  });

  test('no activity yet → studied 0', async () => {
    const token = signTokenFor(await createStudent({ extra: { targetBand: 6.0 } }));
    const res = await request(app).get('/api/vocabbook/daily-goal').set('Authorization', `Bearer ${token}`);
    expect(res.body).toMatchObject({ target: 50, studied: 0, remaining: 50, met: false });
  });
});
