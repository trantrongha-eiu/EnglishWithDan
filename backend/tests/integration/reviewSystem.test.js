// Integration tests for the mandatory post-test Review System: a wrong
// answer must create an AttemptReview, the gate must actually block
// /reading/start, /reading/practice/by-id/:id, /listening/tests/:id/start
// and /listening/practice/by-id/:id (but never dictation), and completing
// every mistake must lift the gate again. Covers the core loop end to end
// against a real (in-memory) DB, not mocks — this is exactly the kind of
// "bypass via direct request" proof the feature depends on.
const request = require('supertest');
const app = require('../../app');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const { createPassage, createReadingTest, createListeningTest } = require('../factories/contentFactory');
const AttemptReview = require('../../models/AttemptReview');

function authed(user) {
  const token = signTokenFor(user);
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url, body) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body),
    patch: (url, body) => request(app).patch(url).set('Authorization', `Bearer ${token}`).send(body),
  };
}

async function makeThreePassageReadingTest() {
  const p1 = await createPassage({
    category: 'passage1',
    questions: [{ questionNumber: 1, type: 'sentence-completion', questionText: 'Q1', correctAnswer: 'apple' }],
  });
  const p2 = await createPassage({
    category: 'passage2',
    questions: [{ questionNumber: 2, type: 'sentence-completion', questionText: 'Q2', correctAnswer: 'banana' }],
  });
  const p3 = await createPassage({
    category: 'passage3',
    questions: [{ questionNumber: 3, type: 'sentence-completion', questionText: 'Q3', correctAnswer: 'cherry' }],
  });
  const test = await createReadingTest({ passageIds: [p1._id, p2._id, p3._id] });
  return { test, p1, p2, p3 };
}

describe('Reading mandatory review — full loop', () => {
  test('perfect score creates no AttemptReview and the gate stays open', async () => {
    const { test } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);

    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    expect(start.status).toBe(200);

    const submit = await api.post('/api/reading/submit', {
      attemptId: start.body.attemptId,
      answers: { 1: 'apple', 2: 'banana', 3: 'cherry' },
    });
    expect(submit.status).toBe(200);
    expect(submit.body.result.wrongCount).toBe(0);

    const pending = await api.get('/api/review/pending?skill=reading');
    expect(pending.body.pending).toBeNull();

    const secondStart = await api.post('/api/reading/start', { testId: String(test._id) });
    expect(secondStart.status).toBe(200);
  });

  test('a wrong answer creates a pending review, blocks new Reading, and completing it unlocks again', async () => {
    const { test, p1 } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);

    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    const submit = await api.post('/api/reading/submit', {
      attemptId: start.body.attemptId,
      answers: { 1: 'apple', 2: 'WRONG', 3: 'cherry' },
    });
    expect(submit.body.result.wrongCount).toBe(1);

    // Pending review exists and blocks both chokepoints.
    const pending = await api.get('/api/review/pending?skill=reading');
    expect(pending.body.pending).not.toBeNull();
    const reviewId = pending.body.pending._id;

    const blockedStart = await api.post('/api/reading/start', { testId: String(test._id) });
    expect(blockedStart.status).toBe(403);
    expect(blockedStart.body.code).toBe('REVIEW_REQUIRED');

    const blockedPractice = await api.get(`/api/reading/practice/by-id/${p1._id}`);
    expect(blockedPractice.status).toBe(403);
    expect(blockedPractice.body.code).toBe('REVIEW_REQUIRED');

    // Fetch the full review doc, find the mistake, complete it.
    const detail = await api.get(`/api/review/${reviewId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.review.mistakes).toHaveLength(1);
    const mistake = detail.body.review.mistakes[0];
    expect(mistake.questionNumber).toBe(2);

    const patch = await api.patch(`/api/review/${reviewId}/mistakes/${mistake._id}`, {
      errorCategory: 'Vocabulary', errorReason: 'Không hiểu từ vựng trong bài',
      confidence: 'guessing',
      retryAnswer: 'banana', // correct this time
      learningPoint: { category: 'vocabulary', content: 'banana = a fruit' },
    });
    expect(patch.status).toBe(200);
    expect(patch.body.reviewCompleted).toBe(true);
    const patchedMistake = patch.body.review.mistakes.find(m => String(m._id) === String(mistake._id));
    expect(patchedMistake.retryResult).toBe('correct');
    expect(patchedMistake.errorCode).toBe('VOCAB_UNKNOWN');

    // Gate is lifted now.
    const pendingAfter = await api.get('/api/review/pending?skill=reading');
    expect(pendingAfter.body.pending).toBeNull();
    const unblocked = await api.post('/api/reading/start', { testId: String(test._id) });
    expect(unblocked.status).toBe(200);
  });

  test('an unrecognized category/reason pair is rejected with 400', async () => {
    const { test } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);
    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: 'apple', 2: 'nope', 3: 'cherry' } });
    const pending = await api.get('/api/review/pending?skill=reading');
    const reviewId = pending.body.pending._id;
    const mistakeId = pending.body.pending.mistakes[0]._id;

    const bad = await api.patch(`/api/review/${reviewId}/mistakes/${mistakeId}`, {
      errorCategory: 'Vocabulary', errorReason: 'this is not a real reason',
    });
    expect(bad.status).toBe(400);
  });

  test('a pending Reading review does not block Listening (per-skill scoping)', async () => {
    const { test } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);
    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: 'apple', 2: 'nope', 3: 'cherry' } });

    const lt = await createListeningTest();
    const listeningStart = await api.post(`/api/listening/tests/${lt._id}/start`, {});
    expect(listeningStart.status).not.toBe(403);
  });
});

describe('Listening mandatory review + dictation exemption', () => {
  test('a wrong Listening-test answer blocks new Listening but never dictation', async () => {
    const lt = await createListeningTest({
      sections: [{
        partNumber: 1, title: 'Part 1', questionRange: { start: 1, end: 1 },
        questionGroups: [{ groupType: 'plain', questions: [{ questionNumber: 1, type: 'fill-blank', questionText: 'Q', correctAnswer: 'sunny' }] }],
      }],
    });
    const user = await createStudent();
    const api = authed(user);

    const start = await api.post(`/api/listening/tests/${lt._id}/start`, {});
    expect(start.status).toBe(200);
    const submit = await api.post(`/api/listening/tests/${lt._id}/submit`, {
      attemptId: start.body.attemptId, startTime: new Date().toISOString(), answers: { 1: 'wrong-answer' },
    });
    expect(submit.body.result.wrongCount).toBe(1);

    const blockedStart = await api.post(`/api/listening/tests/${lt._id}/start`, {});
    expect(blockedStart.status).toBe(403);
    expect(blockedStart.body.code).toBe('REVIEW_REQUIRED');

    // Regular listening practice fetch (no dictation exemption) is blocked...
    const { createListeningSection } = require('../factories/contentFactory');
    const section = await createListeningSection();
    const blockedPractice = await api.get(`/api/listening/practice/by-id/${section._id}`);
    expect(blockedPractice.status).toBe(403);

    // ...but the exact same content, fetched with ?purpose=dictation, is not.
    const dictationFetch = await api.get(`/api/listening/practice/by-id/${section._id}?purpose=dictation`);
    expect(dictationFetch.status).not.toBe(403);
  });
});

describe('Correct answer withheld until retry (audit fix)', () => {
  test('GET review detail hides correctAnswer before retry, reveals it after', async () => {
    const { test } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);
    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: 'apple', 2: 'nope', 3: 'cherry' } });
    const pending = await api.get('/api/review/pending?skill=reading');
    const reviewId = pending.body.pending._id;
    const mistakeId = pending.body.pending.mistakes[0]._id;

    const before = await api.get(`/api/review/${reviewId}`);
    expect(before.body.review.mistakes[0].correctAnswer).toBeUndefined();

    const patched = await api.patch(`/api/review/${reviewId}/mistakes/${mistakeId}`, {
      errorCategory: 'Vocabulary', errorReason: 'Không hiểu từ vựng trong bài',
      confidence: 'guessing', retryAnswer: 'wrong-guess',
    });
    // Revealed in the PATCH response itself once retryResult is set...
    expect(patched.body.review.mistakes[0].correctAnswer).toBe('banana');

    // ...and in a subsequent GET too.
    const after = await api.get(`/api/review/${reviewId}`);
    expect(after.body.review.mistakes[0].correctAnswer).toBe('banana');
  });
});

describe('Retry grading fix — multi-answer-group (audit finding)', () => {
  test('retrying a multi-answer-group mistake grades correctly instead of always "wrong"', async () => {
    const p1 = await createPassage({
      category: 'passage1',
      questions: [
        { questionNumber: 1, type: 'multi-answer-group', questionText: 'Choose TWO', correctAnswer: 'A' },
        { questionNumber: 2, type: 'multi-answer-group', questionText: 'Choose TWO', correctAnswer: 'D' },
      ],
    });
    const p2 = await createPassage({ category: 'passage2', questions: [{ questionNumber: 3, type: 'sentence-completion', questionText: 'Q3', correctAnswer: 'banana' }] });
    const p3 = await createPassage({ category: 'passage3', questions: [{ questionNumber: 4, type: 'sentence-completion', questionText: 'Q4', correctAnswer: 'cherry' }] });
    const test = await createReadingTest({ passageIds: [p1._id, p2._id, p3._id] });
    const user = await createStudent();
    const api = authed(user);

    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    // Submit '["A","C"]' for BOTH clustered question numbers (matches how
    // reading-v2.js's toggleMultiAnswer() actually submits these — the same
    // selected-letters array written to every question number in the
    // cluster) — question 1 (correct=A) is correct, question 2 (correct=D) is wrong.
    const submit = await api.post('/api/reading/submit', {
      attemptId: start.body.attemptId,
      answers: { 1: '["A","C"]', 2: '["A","C"]', 3: 'banana', 4: 'cherry' },
    });
    expect(submit.body.result.wrongCount).toBe(1);

    const pending = await api.get('/api/review/pending?skill=reading');
    const reviewId = pending.body.pending._id;
    const mistake = pending.body.pending.mistakes.find(m => m.questionNumber === 2);
    expect(mistake).toBeTruthy();

    // Isolated retry: student now picks the single correct letter for
    // question 2 ('D') — before the fix, gradeMultiAnswerGroup's
    // JSON.parse('D') would throw and silently grade this "wrong" no
    // matter what was sent.
    const correctRetry = await api.patch(`/api/review/${reviewId}/mistakes/${mistake._id}`, {
      errorCategory: 'Multiple Choice', errorReason: 'Chọn đáp án dựa trên suy đoán',
      confidence: 'not-sure', retryAnswer: 'D',
    });
    expect(correctRetry.body.review.mistakes.find(m => m.questionNumber === 2).retryResult).toBe('correct');
  });

  test('a genuinely wrong retry still grades "wrong" (not just always-true)', async () => {
    const p1 = await createPassage({
      category: 'passage1',
      questions: [{ questionNumber: 1, type: 'multi-answer-group', questionText: 'Choose TWO', correctAnswer: 'A' }],
    });
    const p2 = await createPassage({ category: 'passage2', questions: [{ questionNumber: 2, type: 'sentence-completion', questionText: 'Q2', correctAnswer: 'banana' }] });
    const p3 = await createPassage({ category: 'passage3', questions: [{ questionNumber: 3, type: 'sentence-completion', questionText: 'Q3', correctAnswer: 'cherry' }] });
    const test = await createReadingTest({ passageIds: [p1._id, p2._id, p3._id] });
    const user = await createStudent();
    const api = authed(user);

    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    const submit = await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: '["B"]', 2: 'banana', 3: 'cherry' } });
    expect(submit.body.result.wrongCount).toBe(1);

    const pending = await api.get('/api/review/pending?skill=reading');
    const reviewId = pending.body.pending._id;
    const mistakeId = pending.body.pending.mistakes[0]._id;
    const retry = await api.patch(`/api/review/${reviewId}/mistakes/${mistakeId}`, {
      errorCategory: 'Multiple Choice', errorReason: 'Chọn đáp án dựa trên suy đoán',
      confidence: 'guessing', retryAnswer: 'Z', // still wrong
    });
    expect(retry.body.review.mistakes[0].retryResult).toBe('wrong');
  });
});

describe('Mandatory-review completion cannot be faked with an empty retry (audit finding)', () => {
  test('an empty-string retryAnswer does not mark the mistake complete or lift the gate', async () => {
    const { test } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);
    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: 'apple', 2: 'nope', 3: 'cherry' } });
    const pending = await api.get('/api/review/pending?skill=reading');
    const reviewId = pending.body.pending._id;
    const mistakeId = pending.body.pending.mistakes[0]._id;

    // Attempt to satisfy every field but with an empty retryAnswer, directly
    // via the API (bypassing the frontend's own non-empty guard).
    const patch = await api.patch(`/api/review/${reviewId}/mistakes/${mistakeId}`, {
      errorCategory: 'Vocabulary', errorReason: 'Không hiểu từ vựng trong bài',
      confidence: 'guessing', retryAnswer: '',
      learningPoint: { category: 'vocabulary', content: 'x' },
    });
    expect(patch.body.reviewCompleted).toBe(false);
    expect(patch.body.review.mistakes[0].completedAt).toBeNull();

    const stillBlocked = await api.post('/api/reading/start', { testId: String(test._id) });
    expect(stillBlocked.status).toBe(403);
  });
});

describe('updateMistake validates before mutating (audit finding)', () => {
  test('an invalid confidence value is rejected without touching the stored mistake', async () => {
    const { test } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);
    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: 'apple', 2: 'nope', 3: 'cherry' } });
    const pending = await api.get('/api/review/pending?skill=reading');
    const reviewId = pending.body.pending._id;
    const mistakeId = pending.body.pending.mistakes[0]._id;

    const bad = await api.patch(`/api/review/${reviewId}/mistakes/${mistakeId}`, { confidence: 'super-duper-confident' });
    expect(bad.status).toBe(400);

    const detail = await api.get(`/api/review/${reviewId}`);
    expect(detail.body.review.mistakes[0].confidence).toBeNull();
  });

  test('a note longer than the cap is rejected with a clean 400, not a 500', async () => {
    const { test } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);
    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: 'apple', 2: 'nope', 3: 'cherry' } });
    const pending = await api.get('/api/review/pending?skill=reading');
    const reviewId = pending.body.pending._id;
    const mistakeId = pending.body.pending.mistakes[0]._id;

    const res = await api.patch(`/api/review/${reviewId}/mistakes/${mistakeId}`, { note: 'x'.repeat(1001) });
    expect(res.status).toBe(400);
  });
});

describe('Category list is filtered by question type (audit finding)', () => {
  test('GET taxonomy exposes categoriesByType alongside the full taxonomy', async () => {
    const user = await createStudent();
    const api = authed(user);
    const res = await api.get('/api/review/taxonomy?skill=reading');
    expect(res.body.categoriesByType['true-false-ng']).toContain('T/F/NG');
    expect(res.body.categoriesByType['true-false-ng']).not.toContain('Matching Headings');
    expect(res.body.categoriesByType['fill-blank']).toContain('Completion');
  });

  test('the backend still accepts a category outside the type-relevant list (UI filtering only, not a hard rule)', async () => {
    const { test } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);
    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: 'apple', 2: 'nope', 3: 'cherry' } });
    const pending = await api.get('/api/review/pending?skill=reading');
    const reviewId = pending.body.pending._id;
    const mistakeId = pending.body.pending.mistakes[0]._id;
    // Question 2 is a plain sentence-completion, but "T/F/NG" is a valid
    // category+reason pair for the *skill* — should still be accepted.
    const res = await api.patch(`/api/review/${reviewId}/mistakes/${mistakeId}`, {
      errorCategory: 'T/F/NG', errorReason: 'Nhầm False với Not Given',
    });
    expect(res.status).toBe(200);
  });
});

describe('AttemptReview retention', () => {
  test('the TTL index matches the 90-day convention used by TestAttempt/ListeningAttempt', async () => {
    // Mongoose builds indexes asynchronously in the background — Model.init()
    // is the documented way to wait for that to finish before asserting on
    // them (otherwise this flakes depending on test-run timing/parallelism).
    await AttemptReview.init();
    const indexes = await AttemptReview.collection.getIndexes({ full: true });
    const ttl = indexes.find(i => i.expireAfterSeconds !== undefined);
    expect(ttl).toBeTruthy();
    expect(ttl.expireAfterSeconds).toBe(90 * 24 * 60 * 60);
  });
});
