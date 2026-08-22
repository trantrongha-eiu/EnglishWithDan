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

  test('a single wrong answer creates a pending review but does NOT block a new Reading attempt (gate only fires at MAX_PENDING_REVIEWS)', async () => {
    const { test, p1 } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);

    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    const submit = await api.post('/api/reading/submit', {
      attemptId: start.body.attemptId,
      answers: { 1: 'apple', 2: 'WRONG', 3: 'cherry' },
    });
    expect(submit.body.result.wrongCount).toBe(1);

    // Pending review exists...
    const pending = await api.get('/api/review/pending?skill=reading');
    expect(pending.body.pending).not.toBeNull();
    expect(pending.body.count).toBe(1);
    expect(pending.body.blocked).toBe(false);
    const reviewId = pending.body.pending._id;

    // ...but a single pending review is still under the 3 threshold, so
    // both chokepoints stay open — a student can keep practicing.
    const stillOpenStart = await api.post('/api/reading/start', { testId: String(test._id) });
    expect(stillOpenStart.status).not.toBe(403);
    const stillOpenPractice = await api.get(`/api/reading/practice/by-id/${p1._id}`);
    expect(stillOpenPractice.status).not.toBe(403);

    // Fetch the full review doc, find the mistake, complete it.
    const detail = await api.get(`/api/review/${reviewId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.review.mistakes).toHaveLength(1);
    const mistake = detail.body.review.mistakes[0];
    expect(mistake.questionNumber).toBe(2);

    const patch = await api.patch(`/api/review/${reviewId}/mistakes/${mistake._id}`, {
      errorCategory: 'Vocabulary', errorReason: 'Không hiểu từ vựng trong bài',
      confidence: 'guessing',
      learningPoint: { category: 'vocabulary', content: 'banana = a fruit' },
    });
    expect(patch.status).toBe(200);
    expect(patch.body.reviewCompleted).toBe(true);
    const patchedMistake = patch.body.review.mistakes.find(m => String(m._id) === String(mistake._id));
    expect(patchedMistake.errorCode).toBe('VOCAB_UNKNOWN');

    // Gate reflects zero pending now.
    const pendingAfter = await api.get('/api/review/pending?skill=reading');
    expect(pendingAfter.body.pending).toBeNull();
    expect(pendingAfter.body.count).toBe(0);
    const unblocked = await api.post('/api/reading/start', { testId: String(test._id) });
    expect(unblocked.status).toBe(200);
  });

  // review-drawer.js swaps the "how confident were you" question out for a
  // blank-answer mistake (there's nothing to have been confident about) and
  // sends confidence:'left-blank' instead of one of the 3 real levels —
  // the backend must accept it as a valid, completing value, not reject it.
  test('a skipped (blank) answer can be completed with confidence:"left-blank"', async () => {
    const { test } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);

    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    const submit = await api.post('/api/reading/submit', {
      attemptId: start.body.attemptId,
      answers: { 1: 'apple', 2: '', 3: 'cherry' }, // question 2 left blank
    });
    // A blank answer grades as skipped, not wrong — pickMistakes() still
    // treats it as needing review either way (isCorrect:false covers both).
    expect(submit.body.result.wrongCount).toBe(0);
    expect(submit.body.result.skippedCount).toBe(1);

    const pending = await api.get('/api/review/pending?skill=reading');
    const reviewId = pending.body.pending._id;
    const detail = await api.get(`/api/review/${reviewId}`);
    const mistake = detail.body.review.mistakes[0];
    expect(mistake.userAnswer).toBe('');

    const patch = await api.patch(`/api/review/${reviewId}/mistakes/${mistake._id}`, {
      errorCategory: 'Khác', errorReason: 'Lý do khác',
      confidence: 'left-blank',
      learningPoint: { category: 'vocabulary', content: 'banana = a fruit' },
    });
    expect(patch.status).toBe(200);
    expect(patch.body.reviewCompleted).toBe(true);
    const patchedMistake = patch.body.review.mistakes.find(m => String(m._id) === String(mistake._id));
    expect(patchedMistake.confidence).toBe('left-blank');
  });

  test('blocks new Reading only once MAX_PENDING_REVIEWS (3) pending reviews pile up, and unblocks as soon as one drops below it', async () => {
    const user = await createStudent();
    const api = authed(user);

    // 3 separate tests, each submitted with exactly one wrong answer —
    // 3 independent pending AttemptReview docs (submit is never gated,
    // by design, so a student CAN accumulate these). Check the gate after
    // 2 (still open) and after the 3rd (now blocked).
    const attempts = [];
    for (let i = 0; i < 2; i++) {
      const { test } = await makeThreePassageReadingTest();
      const start = await api.post('/api/reading/start', { testId: String(test._id) });
      await api.post('/api/reading/submit', {
        attemptId: start.body.attemptId,
        answers: { 1: 'apple', 2: 'WRONG', 3: 'cherry' },
      });
      attempts.push(test);
    }
    const pendingAt2 = await api.get('/api/review/pending?skill=reading');
    expect(pendingAt2.body.count).toBe(2);
    expect(pendingAt2.body.blocked).toBe(false);
    const stillOpenAt2 = await api.post('/api/reading/start', { testId: String(attempts[0]._id) });
    expect(stillOpenAt2.status).not.toBe(403);

    const { test: thirdTest } = await makeThreePassageReadingTest();
    const thirdStart = await api.post('/api/reading/start', { testId: String(thirdTest._id) });
    await api.post('/api/reading/submit', {
      attemptId: thirdStart.body.attemptId,
      answers: { 1: 'apple', 2: 'WRONG', 3: 'cherry' },
    });
    attempts.push(thirdTest);

    const pending2 = await api.get('/api/review/pending?skill=reading');
    expect(pending2.body.count).toBe(3);
    expect(pending2.body.blocked).toBe(true);
    expect(pending2.body.items).toHaveLength(3);

    const blockedStart = await api.post('/api/reading/start', { testId: String(attempts[0]._id) });
    expect(blockedStart.status).toBe(403);
    expect(blockedStart.body.code).toBe('REVIEW_REQUIRED');
    expect(blockedStart.body.count).toBe(3);

    // Complete just ONE of the three (the oldest, per getPendingReviews'
    // createdAt:1 sort — same one `pending` pointed at).
    const oldestReviewId = pending2.body.pending._id;
    const detail = await api.get(`/api/review/${oldestReviewId}`);
    const mistake = detail.body.review.mistakes[0];
    await api.patch(`/api/review/${oldestReviewId}/mistakes/${mistake._id}`, {
      errorCategory: 'Vocabulary', errorReason: 'Không hiểu từ vựng trong bài',
      confidence: 'guessing',
      learningPoint: { category: 'vocabulary', content: 'banana = a fruit' },
    });

    // Down to 2 pending — under the threshold again.
    const pendingAfter = await api.get('/api/review/pending?skill=reading');
    expect(pendingAfter.body.count).toBe(2);
    expect(pendingAfter.body.blocked).toBe(false);
    const unblocked = await api.post('/api/reading/start', { testId: String(attempts[0]._id) });
    expect(unblocked.status).not.toBe(403);
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
  async function submitOneWrongListeningTest(api) {
    const lt = await createListeningTest({
      sections: [{
        partNumber: 1, title: 'Part 1', questionRange: { start: 1, end: 1 },
        questionGroups: [{ groupType: 'plain', questions: [{ questionNumber: 1, type: 'fill-blank', questionText: 'Q', correctAnswer: 'sunny' }] }],
      }],
    });
    const start = await api.post(`/api/listening/tests/${lt._id}/start`, {});
    expect(start.status).toBe(200);
    const submit = await api.post(`/api/listening/tests/${lt._id}/submit`, {
      attemptId: start.body.attemptId, startTime: new Date().toISOString(), answers: { 1: 'wrong-answer' },
    });
    expect(submit.body.result.wrongCount).toBe(1);
    return lt;
  }

  test('a single wrong Listening answer does not block new Listening (under the pending threshold)', async () => {
    const user = await createStudent();
    const api = authed(user);
    const lt = await submitOneWrongListeningTest(api);

    const stillOpenStart = await api.post(`/api/listening/tests/${lt._id}/start`, {});
    expect(stillOpenStart.status).not.toBe(403);
  });

  test('blocks new Listening once 3 pending reviews pile up, but never dictation', async () => {
    const user = await createStudent();
    const api = authed(user);
    let lastTest;
    for (let i = 0; i < 3; i++) lastTest = await submitOneWrongListeningTest(api);

    const pending = await api.get('/api/review/pending?skill=listening');
    expect(pending.body.count).toBe(3);
    expect(pending.body.blocked).toBe(true);

    const blockedStart = await api.post(`/api/listening/tests/${lastTest._id}/start`, {});
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

describe('Correct answer is always visible (retry step removed)', () => {
  test('GET review detail always includes correctAnswer, even before any classification is submitted', async () => {
    const { test } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);
    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: 'apple', 2: 'nope', 3: 'cherry' } });
    const pending = await api.get('/api/review/pending?skill=reading');
    const reviewId = pending.body.pending._id;

    const before = await api.get(`/api/review/${reviewId}`);
    expect(before.body.review.mistakes[0].correctAnswer).toBe('banana');

    const mistakeId = pending.body.pending.mistakes[0]._id;
    const patched = await api.patch(`/api/review/${reviewId}/mistakes/${mistakeId}`, {
      errorCategory: 'Vocabulary', errorReason: 'Không hiểu từ vựng trong bài',
      confidence: 'guessing',
    });
    expect(patched.body.review.mistakes[0].correctAnswer).toBe('banana');
  });
});

describe('Mandatory-review completion requires the core fields (no retry step)', () => {
  test('a mistake is not complete until category, reason, confidence, and learningPoint.category are all set', async () => {
    const { test } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);
    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: 'apple', 2: 'nope', 3: 'cherry' } });
    const pending = await api.get('/api/review/pending?skill=reading');
    const reviewId = pending.body.pending._id;
    const mistakeId = pending.body.pending.mistakes[0]._id;

    // Category+reason+confidence alone is not enough — learningPoint.category
    // is still required.
    const partial = await api.patch(`/api/review/${reviewId}/mistakes/${mistakeId}`, {
      errorCategory: 'Vocabulary', errorReason: 'Không hiểu từ vựng trong bài',
      confidence: 'guessing',
    });
    expect(partial.body.reviewCompleted).toBe(false);
    expect(partial.body.review.mistakes[0].completedAt).toBeNull();

    const complete = await api.patch(`/api/review/${reviewId}/mistakes/${mistakeId}`, {
      learningPoint: { category: 'vocabulary', content: 'x' },
    });
    expect(complete.body.reviewCompleted).toBe(true);
    expect(complete.body.review.mistakes[0].completedAt).not.toBeNull();

    const pendingAfter = await api.get('/api/review/pending?skill=reading');
    expect(pendingAfter.body.count).toBe(0);
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

// A mistake that doesn't fit any structured category must never force an
// inaccurate pick just to finish the mandatory review (PLATFORM_AUDIT
// review-system redesign, item 2).
describe('"Khác" catch-all taxonomy category', () => {
  test('is a valid category+reason pair for both skills and appears in every type-filtered list', async () => {
    const user = await createStudent();
    const api = authed(user);
    const res = await api.get('/api/review/taxonomy?skill=reading');
    expect(Object.keys(res.body.taxonomy)).toContain('Khác');
    expect(res.body.categoriesByType['true-false-ng']).toContain('Khác');
    expect(res.body.categoriesByType['fill-blank']).toContain('Khác');

    const lres = await api.get('/api/review/taxonomy?skill=listening');
    expect(Object.keys(lres.body.taxonomy)).toContain('Khác');
    expect(lres.body.categoriesByType['multiple-choice']).toContain('Khác');
  });

  test('resolves to a real errorCode and can complete a mistake end to end', async () => {
    const { test } = await makeThreePassageReadingTest();
    const user = await createStudent();
    const api = authed(user);
    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: 'apple', 2: 'nope', 3: 'cherry' } });
    const pending = await api.get('/api/review/pending?skill=reading');
    const reviewId = pending.body.pending._id;
    const mistakeId = pending.body.pending.mistakes[0]._id;

    const patch = await api.patch(`/api/review/${reviewId}/mistakes/${mistakeId}`, {
      errorCategory: 'Khác', errorReason: 'Bất cẩn / lỗi ngẫu nhiên',
      confidence: 'guessing',
      learningPoint: { category: 'strategy', content: 'slow down' },
    });
    expect(patch.status).toBe(200);
    const mistake = patch.body.review.mistakes.find(m => String(m._id) === String(mistakeId));
    expect(mistake.errorCode).toBe('CARELESS');
    expect(patch.body.reviewCompleted).toBe(true);
  });
});

// Per-test review-status badge (none/pending/completed) attached to
// lastAttempt by readingService.listTestsForUser / listeningService.
// listStudentTests, via reviewService.getReviewStatusMap.
describe('Per-test reviewStatus badge on the test list', () => {
  test('reflects none/pending/completed correctly across 3 different tests', async () => {
    const user = await createStudent();
    const api = authed(user);

    // Test A: perfect score -> no review doc -> 'none'.
    const { test: testA } = await makeThreePassageReadingTest();
    const startA = await api.post('/api/reading/start', { testId: String(testA._id) });
    await api.post('/api/reading/submit', { attemptId: startA.body.attemptId, answers: { 1: 'apple', 2: 'banana', 3: 'cherry' } });

    // Test B: one wrong, left unreviewed -> 'pending'.
    const { test: testB } = await makeThreePassageReadingTest();
    const startB = await api.post('/api/reading/start', { testId: String(testB._id) });
    await api.post('/api/reading/submit', { attemptId: startB.body.attemptId, answers: { 1: 'apple', 2: 'WRONG', 3: 'cherry' } });

    // Test C: one wrong, fully reviewed -> 'completed'.
    const { test: testC } = await makeThreePassageReadingTest();
    const startC = await api.post('/api/reading/start', { testId: String(testC._id) });
    await api.post('/api/reading/submit', { attemptId: startC.body.attemptId, answers: { 1: 'apple', 2: 'WRONG', 3: 'cherry' } });
    const pendingC = await api.get('/api/review/pending?skill=reading');
    // Complete whichever of the (now 2) pending reviews belongs to testC's attempt.
    for (const r of pendingC.body.items) {
      const detail = await api.get(`/api/review/${r._id}`);
      if (String(detail.body.review.attemptId) !== String(startC.body.attemptId)) continue;
      const m = detail.body.review.mistakes[0];
      await api.patch(`/api/review/${r._id}/mistakes/${m._id}`, {
        errorCategory: 'Vocabulary', errorReason: 'Không hiểu từ vựng trong bài',
        confidence: 'guessing',
        learningPoint: { category: 'vocabulary', content: 'x' },
      });
    }

    const list = await api.get('/api/reading/tests');
    const byId = {};
    list.body.tests.forEach(t => { byId[String(t._id)] = t; });
    expect(byId[String(testA._id)].lastAttempt.reviewStatus).toBe('none');
    expect(byId[String(testB._id)].lastAttempt.reviewStatus).toBe('pending');
    expect(byId[String(testC._id)].lastAttempt.reviewStatus).toBe('completed');
  });
});
