// Per-student paraphrase spaced-repetition — the HTTP contract that
// js/dashboard-paraphrase.js's fetch() calls use:
//   POST /api/vocab/paraphrase/review        (record one self-rating / graded answer)
//   GET  /api/vocab/paraphrase/progress/:id   (study "cards" view badges + ring)
//   GET  /api/vocab/paraphrase/due-count      (daily nudge count — auth only)
//   GET  /api/vocab/paraphrase/review-queue   (cross-unit "Ôn Paraphrase" — premium)
//
// Real Express app + routes + auth + in-memory Mongo. The Leitner maths is
// vocabBookService.computeSrs (shared), so this file only pins the paraphrase
// wiring: row identity, promotion/demotion, the progress rollup, and the
// premium gate split (count is public-ish, answers are premium).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createVocabUnit } = require('../factories/contentFactory');
const ParaphraseProgress = require('../../models/ParaphraseProgress');

const PARA_WORDS = [
  { type: 'paraphrase', word: 'a large number of', paraphrase: 'numerous', meaning: 'rất nhiều', explanation: 'both mean "many"' },
  { type: 'paraphrase', word: 'set up', paraphrase: 'establish', meaning: 'thành lập', explanation: 'formal synonym' },
  { type: 'vocab', word: 'apple', meaning: 'quả táo' },
];

function review(token, body) {
  return request(app).post('/api/vocab/paraphrase/review').set('Authorization', `Bearer ${token}`).send(body);
}

describe('paraphrase SRS — POST /api/vocab/paraphrase/review', () => {
  test('first "da-thuoc": creates one row, box 0 -> 1, next review ~1 day out', async () => {
    const student = await createPremiumStudent();
    const token = signTokenFor(student);
    const unit = await createVocabUnit({ words: PARA_WORDS });

    const before = Date.now();
    const res = await review(token, {
      unitId: unit._id, word: 'a large number of', paraphrase: 'numerous',
      meaning: 'rất nhiều', explanation: 'x', rating: 'da-thuoc',
    });
    expect(res.status).toBe(200);
    expect(res.body.srsBox).toBe(1);
    expect(res.body.itemStatus).toBe('nho-so-so');
    const daysOut = Math.round((new Date(res.body.nextReviewAt) - before) / 86400000);
    expect(daysOut).toBe(1);

    const rows = await ParaphraseProgress.find({ userId: student._id });
    expect(rows).toHaveLength(1);
    expect(rows[0].timesSeen).toBe(1);
    expect(rows[0].wrongCount).toBe(0);
  });

  test('repeated "da-thuoc" promotes one box at a time; reaches mastered at box 3', async () => {
    const student = await createPremiumStudent();
    const token = signTokenFor(student);
    const unit = await createVocabUnit({ words: PARA_WORDS });
    const body = { unitId: unit._id, word: 'set up', paraphrase: 'establish', rating: 'da-thuoc' };

    let r = await review(token, body); expect(r.body.srsBox).toBe(1);
    r = await review(token, body); expect(r.body.srsBox).toBe(2); expect(r.body.itemStatus).toBe('nho-so-so');
    r = await review(token, body); expect(r.body.srsBox).toBe(3); expect(r.body.itemStatus).toBe('da-thuoc');

    const rows = await ParaphraseProgress.find({ userId: student._id });
    expect(rows).toHaveLength(1);
    expect(rows[0].timesSeen).toBe(3);
  });

  test('"chua-thuoc" resets box to 0 (due now) and bumps wrongCount', async () => {
    const student = await createPremiumStudent();
    const token = signTokenFor(student);
    const unit = await createVocabUnit({ words: PARA_WORDS });
    const key = { unitId: unit._id, word: 'set up', paraphrase: 'establish' };

    await review(token, { ...key, rating: 'da-thuoc' });
    await review(token, { ...key, rating: 'da-thuoc' }); // box 2
    const r = await review(token, { ...key, rating: 'chua-thuoc' });
    expect(r.body.srsBox).toBe(0);
    expect(r.body.itemStatus).toBe('chua-thuoc');
    const now = Date.now();
    expect(new Date(r.body.nextReviewAt).getTime()).toBeLessThanOrEqual(now + 1000);

    const row = await ParaphraseProgress.findOne({ userId: student._id });
    expect(row.wrongCount).toBe(1);
    expect(row.timesSeen).toBe(3);
  });

  test('cosmetic edit to meaning/explanation does NOT fork the row', async () => {
    const student = await createPremiumStudent();
    const token = signTokenFor(student);
    const unit = await createVocabUnit({ words: PARA_WORDS });

    await review(token, { unitId: unit._id, word: 'set up', paraphrase: 'establish', meaning: 'thành lập', explanation: 'v1', rating: 'da-thuoc' });
    await review(token, { unitId: unit._id, word: '  Set  Up ', paraphrase: 'ESTABLISH', meaning: 'lập ra', explanation: 'v2 reworded', rating: 'da-thuoc' });

    const rows = await ParaphraseProgress.find({ userId: student._id });
    expect(rows).toHaveLength(1);
    expect(rows[0].srsBox).toBe(2); // kept climbing, not reset by a "new" card
    expect(rows[0].explanation).toBe('v2 reworded'); // snapshot refreshed
  });

  test('rejects an unknown rating', async () => {
    const student = await createPremiumStudent();
    const token = signTokenFor(student);
    const unit = await createVocabUnit({ words: PARA_WORDS });
    const res = await review(token, { unitId: unit._id, word: 'set up', paraphrase: 'establish', rating: 'kinda' });
    expect(res.status).toBe(400);
  });
});

describe('paraphrase SRS — progress + due queue + premium gate', () => {
  test('GET /progress/:unitId rolls up seen / mastered and returns per-item status', async () => {
    const student = await createPremiumStudent();
    const token = signTokenFor(student);
    const unit = await createVocabUnit({ words: PARA_WORDS });
    const b = { unitId: unit._id };

    // item 1 -> mastered (3x good), item 2 -> seen once
    for (let i = 0; i < 3; i++) await review(token, { ...b, word: 'a large number of', paraphrase: 'numerous', rating: 'da-thuoc' });
    await review(token, { ...b, word: 'set up', paraphrase: 'establish', rating: 'nho-so-so' });

    const res = await request(app).get(`/api/vocab/paraphrase/progress/${unit._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.seen).toBe(2);
    expect(res.body.mastered).toBe(1);
    const mastered = res.body.items.find(it => it.word === 'a large number of');
    expect(mastered.status).toBe('da-thuoc');
  });

  test('due-count is auth-only; review-queue + review are premium-gated', async () => {
    const free = await createStudent({ extra: { createdAt: new Date(Date.now() - 3 * 86400000) } });
    const freeToken = signTokenFor(free);

    // free (trial long over) can still read the count — it carries no content
    const cnt = await request(app).get('/api/vocab/paraphrase/due-count').set('Authorization', `Bearer ${freeToken}`);
    expect(cnt.status).toBe(200);
    expect(cnt.body.count).toBe(0);

    // ...but not the queue (returns paraphrase answers) or the write path
    const q = await request(app).get('/api/vocab/paraphrase/review-queue').set('Authorization', `Bearer ${freeToken}`);
    expect(q.status).toBe(403);
    const unit = await createVocabUnit({ words: PARA_WORDS });
    const w = await review(freeToken, { unitId: unit._id, word: 'set up', paraphrase: 'establish', rating: 'da-thuoc' });
    expect(w.status).toBe(403);
  });

  test('an item reset to "chua-thuoc" shows up in the due queue + count', async () => {
    const student = await createPremiumStudent();
    const token = signTokenFor(student);
    const unit = await createVocabUnit({ words: PARA_WORDS });
    const key = { unitId: unit._id, word: 'set up', paraphrase: 'establish' };

    await review(token, { ...key, rating: 'da-thuoc' });     // scheduled ~1d out — not due
    let q = await request(app).get('/api/vocab/paraphrase/review-queue').set('Authorization', `Bearer ${token}`);
    expect(q.body.items).toHaveLength(0);

    await review(token, { ...key, rating: 'chua-thuoc' });   // back to box 0 — due now
    q = await request(app).get('/api/vocab/paraphrase/review-queue').set('Authorization', `Bearer ${token}`);
    expect(q.body.items).toHaveLength(1);
    expect(q.body.items[0].paraphrase).toBe('establish');

    const cnt = await request(app).get('/api/vocab/paraphrase/due-count').set('Authorization', `Bearer ${token}`);
    expect(cnt.body.count).toBe(1);
  });
});
