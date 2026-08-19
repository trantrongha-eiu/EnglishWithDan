// Priority 1.5 QA — Part A/B/C. Real HTTP-level integration tests against
// the actual Express app + routes + auth + real (in-memory) MongoDB, not
// mocks. This is the substitute for literal browser click-testing: there is
// no browser tool in this environment, so "manual QA" of the SRS evidence
// flow is verified here through the exact same HTTP contract dashboard.js's
// fetch() calls use — POST /vocabbook/:id/words/:wordId/practice-result and
// GET /vocabbook/weak. All 7 frontend practice modes (Flashcard/Quiz/Listen/
// Translate/Mixed/Review-due/Weak-vocab) converge on this ONE contract by
// design (see dashboard.js's _syncPracticeEvidence) — that convergence is
// exactly what makes testing the contract once here equivalent to testing
// all 7 modes' server-side effect. What this file cannot verify: DOM
// rendering, which div is visible, or dashboard.js's in-browser Map/Set
// bookkeeping — those are covered by code trace in the QA report instead.
const request = require('supertest');
const app = require('../../app');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const { createVocabBook } = require('../factories/contentFactory');

function practiceResult(token, bookId, wordId, correct) {
  return request(app)
    .post(`/api/vocabbook/${bookId}/words/${wordId}/practice-result`)
    .set('Authorization', `Bearer ${token}`)
    .send({ correct });
}

describe('Part A — Vocabulary Practice -> SRS, via the real HTTP contract', () => {
  test('wrong answer: wrongCount+1, correctCount untouched, box resets to 0, status derived, nextReviewAt = now', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const book = await createVocabBook({
      userId: student._id,
      words: [{ word: 'apple', status: 'da-thuoc', srsBox: 4, wrongCount: 1, correctCount: 6 }],
    });
    const wordId = book.words[0]._id;

    const before = Date.now();
    const res = await practiceResult(token, book._id, wordId, false);
    expect(res.status).toBe(200);

    const w = res.body.word;
    expect(w.wrongCount).toBe(2);
    expect(w.correctCount).toBe(6); // untouched by a wrong answer
    expect(w.srsBox).toBe(0);
    expect(w.status).toBe('chua-thuoc');
    expect(new Date(w.nextReviewAt).getTime()).toBeGreaterThanOrEqual(before);
    expect(new Date(w.nextReviewAt).getTime() - new Date(w.lastReviewedAt).getTime()).toBe(0); // box 0 = due now
  });

  test('correct answer: correctCount+1, wrongCount untouched, box promotes by exactly 1, status derived, nextReviewAt pushed out', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const book = await createVocabBook({
      userId: student._id,
      words: [{ word: 'apple', status: 'chua-thuoc', srsBox: 0, wrongCount: 3, correctCount: 0 }],
    });
    const wordId = book.words[0]._id;

    const res = await practiceResult(token, book._id, wordId, true);
    expect(res.status).toBe(200);

    const w = res.body.word;
    expect(w.correctCount).toBe(1);
    expect(w.wrongCount).toBe(3); // untouched by a correct answer
    expect(w.srsBox).toBe(1);
    expect(w.status).toBe('nho-so-so'); // box 1, not mastered
    const daysOut = Math.round((new Date(w.nextReviewAt) - new Date(w.lastReviewedAt)) / 86400000);
    expect(daysOut).toBe(1);
  });

  test('multiple correct answers: 1 correct != Mastered — mastery only once the box reaches the same bar the manual dropdown already uses', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', srsBox: 0 }] });
    let wordId = book.words[0]._id;

    let res = await practiceResult(token, book._id, wordId, true);
    expect(res.body.word.status).toBe('nho-so-so'); // box 1 — not mastered
    wordId = res.body.word._id;

    res = await practiceResult(token, book._id, wordId, true);
    expect(res.body.word.status).toBe('nho-so-so'); // box 2 — still not mastered
    wordId = res.body.word._id;

    res = await practiceResult(token, book._id, wordId, true);
    expect(res.body.word.srsBox).toBe(3);
    expect(res.body.word.status).toBe('da-thuoc'); // box 3 — mastered only now, after 3 correct in a row
  });

  test('a miss after a streak of correct answers wipes the box back to 0, same as any other wrong answer', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', srsBox: 0 }] });
    let wordId = book.words[0]._id;

    let res = await practiceResult(token, book._id, wordId, true);
    wordId = res.body.word._id;
    res = await practiceResult(token, book._id, wordId, true);
    wordId = res.body.word._id;
    expect(res.body.word.srsBox).toBe(2);

    res = await practiceResult(token, book._id, wordId, false);
    expect(res.body.word.srsBox).toBe(0);
    expect(res.body.word.status).toBe('chua-thuoc');
  });

  test('ownership: another student cannot record practice results against someone else\'s word', async () => {
    const owner = await createStudent();
    const intruder = await createStudent();
    const book = await createVocabBook({ userId: owner._id, words: [{ word: 'secret' }] });
    const wordId = book.words[0]._id;
    const token = signTokenFor(intruder);

    const res = await practiceResult(token, book._id, wordId, true);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('unauthenticated requests are rejected', async () => {
    const student = await createStudent();
    const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple' }] });
    const res = await request(app)
      .post(`/api/vocabbook/${book._id}/words/${book.words[0]._id}/practice-result`)
      .send({ correct: true });
    expect(res.status).toBe(401);
  });
});

describe('Part B — session-scoped evidence: the contract stays correct under repeat/requeue-style calls', () => {
  // dashboard.js's _vocabWordsSeen is a Map keyed by word._id, so a word
  // answered twice in one session (requeue after a miss) collapses to ONE
  // sync call — this can't be driven from here without a browser. What CAN
  // be verified at the HTTP layer: the server-side math is correct and
  // idempotent-in-spirit REGARDLESS of how many times it's called, so the
  // frontend's one-call-per-word contract is exercising a server endpoint
  // that behaves predictably no matter how it's invoked.
  test('sequential calls for the same word (simulating an un-deduped client) compound in order, not silently — confirms the endpoint has no hidden dedup that would mask a frontend bug', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const book = await createVocabBook({ userId: student._id, words: [{ word: 'apple', srsBox: 0 }] });
    let wordId = book.words[0]._id;

    // Simulates: missed once, requeued, got it right on retry — if the
    // frontend's dedup ever regressed and sent both events, the box should
    // land on 1 (0 -> reset to 0 on the miss -> promote to 1 on the retry),
    // not on some stale/skipped value.
    let res = await practiceResult(token, book._id, wordId, false);
    wordId = res.body.word._id;
    res = await practiceResult(token, book._id, wordId, true);
    expect(res.body.word.srsBox).toBe(1);
    expect(res.body.word.wrongCount).toBe(1);
    expect(res.body.word.correctCount).toBe(1);
  });
});

describe('Part C — Weak Vocabulary: Dashboard -> Weak Vocabulary -> Practice -> complete -> back to Dashboard', () => {
  test('full round trip: fetch weak words across books, practice one, and see the updated state reflected', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const bookA = await createVocabBook({ userId: student._id, name: 'Book A', words: [
      { word: 'weakA', wrongCount: 3, srsBox: 0 },
      { word: 'safeA', wrongCount: 1 },
    ] });
    const bookB = await createVocabBook({ userId: student._id, name: 'Book B', words: [
      { word: 'weakB', wrongCount: 5, srsBox: 0 },
    ] });

    // 1. Dashboard -> Weak Vocabulary: loaded from ALL of the student's books.
    const weakRes = await request(app).get('/api/vocabbook/weak').set('Authorization', `Bearer ${token}`);
    expect(weakRes.status).toBe(200);
    const words = weakRes.body.words;
    expect(words.map(w => w.word.word).sort()).toEqual(['weakA', 'weakB']); // only wrongCount>=3, cross-book
    expect(words.every(w => w.word.wrongCount < 6)).toBe(true); // sanity: real data, not placeholders

    // 2. Practice -> complete session: answer weakA correctly, weakB incorrectly.
    const weakAEntry = words.find(w => w.word.word === 'weakA');
    const weakBEntry = words.find(w => w.word.word === 'weakB');
    const [resA, resB] = await Promise.all([
      practiceResult(token, weakAEntry.bookId, weakAEntry.word._id, true),
      practiceResult(token, weakBEntry.bookId, weakBEntry.word._id, false),
    ]);
    expect(resA.status).toBe(200);
    expect(resB.status).toBe(200);

    // 3. SRS + wrongCount/correctCount actually changed, no duplicate word created.
    expect(resA.body.word.correctCount).toBe(1);
    expect(resA.body.word.srsBox).toBe(1);
    expect(resB.body.word.wrongCount).toBe(6);
    expect(resB.body.word.srsBox).toBe(0);

    const reloadedA = await request(app).get(`/api/vocabbook/${bookA._id}`).set('Authorization', `Bearer ${token}`);
    expect(reloadedA.body.book.words).toHaveLength(2); // still exactly 2 — no duplicate introduced by practicing

    // 4. Return to dashboard: weak list still reflects both (wrongCount>=3
    //    is a cumulative historical signal, not cleared by one correct
    //    answer — same pre-existing convention as the "Ôn lại từ hay sai"
    //    button and the myvocab-weak stat tile).
    const weakAfter = await request(app).get('/api/vocabbook/weak').set('Authorization', `Bearer ${token}`);
    expect(weakAfter.body.words.map(w => w.word.word).sort()).toEqual(['weakA', 'weakB']);
  });

  test('a student with no weak words gets an empty list, not an error', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    await createVocabBook({ userId: student._id, words: [{ word: 'fine', wrongCount: 0 }] });

    const res = await request(app).get('/api/vocabbook/weak').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.words).toEqual([]);
  });
});
