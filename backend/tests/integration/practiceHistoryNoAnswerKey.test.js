'use strict';

// P1 regression fix — GET /api/{reading,listening}/practice/history/:attemptId
// (getPracticeHistoryDetail) must NOT return the answer key:
//   - passage/section questions: no correctAnswer / no explanation
//   - attempt.answers[] rows: no correctAnswer (isCorrect stays)
// Ownership scoping is unchanged (own attempts only). The official
// answer-key endpoint stays requirePremium-gated.
const request = require('supertest');
const app = require('../../app');
const readingService = require('../../services/readingService');
const listeningService = require('../../services/listeningService');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');
const {
  createStudent, createPremiumStudent, createTeacher, signTokenFor,
} = require('../factories/userFactory');
const {
  createPassage, createListeningSection, createReadingPracticeAttempt,
} = require('../factories/contentFactory');

const bearer = (u) => `Bearer ${signTokenFor(u)}`;
const expiredTrial = () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

// Distinct sentinel values so a raw-JSON scan is unambiguous.
const CORRECT = 'SENTINEL_CORRECT_ANSWER';
const EXPLAIN = 'SENTINEL_EXPLANATION_TEXT';
const USER_ANS = 'SENTINEL_USER_ANSWER';

const READING_GROUPS = [{
  groupType: 'plain',
  questions: [{
    questionNumber: 1, type: 'sentence-completion', questionText: 'Q1 text',
    correctAnswer: CORRECT, explanation: EXPLAIN,
  }],
}];
const LISTENING_GROUPS = [{
  groupType: 'plain',
  questions: [{
    questionNumber: 1, type: 'sentence-completion', questionText: 'Q1 text',
    correctAnswer: CORRECT, explanation: EXPLAIN,
  }],
}];
const SAVED_ANSWERS = [{ questionNumber: 1, userAnswer: USER_ANS, correctAnswer: CORRECT, isCorrect: false }];

function assertNoAnswerKey(body) {
  const raw = JSON.stringify(body);
  expect(raw).not.toContain(CORRECT);
  expect(raw).not.toContain(EXPLAIN);
  expect(raw).not.toContain('"correctAnswer"');
  expect(raw).not.toContain('"explanation"');
  // the parts a legit review still needs are present
  expect(raw).toContain(USER_ANS);
  expect(raw).toContain('"isCorrect"');
}

// ───────────────────────────── READING ─────────────────────────────

describe('reading — getPracticeHistoryDetail withholds the answer key', () => {
  async function seed(user) {
    const passage = await createPassage({ questionGroups: READING_GROUPS });
    const attempt = await createReadingPracticeAttempt({
      userId: user._id, passageId: passage._id, answers: SAVED_ANSWERS, totalQuestions: 1, correctCount: 0, wrongCount: 1,
    });
    return { passage, attempt };
  }

  test('service: strips correctAnswer/explanation from passage questions AND attempt.answers', async () => {
    const user = await createStudent();
    const { attempt } = await seed(user);

    const res = await readingService.getPracticeHistoryDetail(attempt._id, user._id);
    expect(res).not.toBeNull();
    const q = res.passage.questionGroups[0].questions[0];
    expect(q.questionText).toBe('Q1 text');       // question itself kept
    expect(q.correctAnswer).toBeUndefined();
    expect(q.explanation).toBeUndefined();
    expect(res.attempt.answers[0]).toEqual({ questionNumber: 1, userAnswer: USER_ANS, isCorrect: false });
    expect(res.attempt.answers[0].correctAnswer).toBeUndefined();
  });

  test('HTTP: owner (premium) — 200, no answer key anywhere in the payload', async () => {
    const user = await createPremiumStudent();
    const { attempt } = await seed(user);
    const r = await request(app).get(`/api/reading/practice/history/${attempt._id}`).set('Authorization', bearer(user));
    expect(r.status).toBe(200);
    assertNoAnswerKey(r.body);
  });

  test('HTTP: owner whose trial/premium has LAPSED — still 200, still no answer key', async () => {
    const user = await createStudent({ extra: { createdAt: expiredTrial() } });
    const { attempt } = await seed(user);
    const r = await request(app).get(`/api/reading/practice/history/${attempt._id}`).set('Authorization', bearer(user));
    expect(r.status).toBe(200);
    assertNoAnswerKey(r.body);
  });

  test('HTTP: a non-owner cannot read the attempt (unchanged 404)', async () => {
    const owner = await createStudent();
    const other = await createStudent();
    const { attempt } = await seed(owner);
    const r = await request(app).get(`/api/reading/practice/history/${attempt._id}`).set('Authorization', bearer(other));
    expect(r.status).toBe(404);
  });

  test('HTTP: a teacher is also scoped to their own attempts here (no staff bypass on this route)', async () => {
    const student = await createStudent();
    const teacher = await createTeacher();
    const { attempt } = await seed(student);
    const r = await request(app).get(`/api/reading/practice/history/${attempt._id}`).set('Authorization', bearer(teacher));
    expect(r.status).toBe(404);
  });
});

// ──────────────────────────── LISTENING ────────────────────────────

describe('listening — getPracticeHistoryDetail withholds the answer key', () => {
  async function seed(user) {
    const section = await createListeningSection({ questionGroups: LISTENING_GROUPS });
    const attempt = await ListeningPracticeAttempt.create({
      userId: user._id, sectionId: section._id, sectionTitle: 'S', partNumber: 1,
      answers: SAVED_ANSWERS, totalQuestions: 1, correctCount: 0, wrongCount: 1, submittedAt: new Date(),
    });
    return { section, attempt };
  }

  test('service: strips correctAnswer/explanation from section questions AND attempt.answers', async () => {
    const user = await createStudent();
    const { attempt } = await seed(user);

    const res = await listeningService.getPracticeHistoryDetail(attempt._id, user._id);
    expect(res).not.toBeNull();
    const q = res.section.questionGroups[0].questions[0];
    expect(q.questionText).toBe('Q1 text');
    expect(q.correctAnswer).toBeUndefined();
    expect(q.explanation).toBeUndefined();
    expect(res.attempt.answers[0]).toEqual({ questionNumber: 1, userAnswer: USER_ANS, isCorrect: false });
  });

  test('HTTP: owner (premium) — 200, no answer key', async () => {
    const user = await createPremiumStudent();
    const { attempt } = await seed(user);
    const r = await request(app).get(`/api/listening/practice/history/${attempt._id}`).set('Authorization', bearer(user));
    expect(r.status).toBe(200);
    assertNoAnswerKey(r.body);
  });

  test('HTTP: owner whose access has LAPSED — still 200, still no answer key', async () => {
    const user = await createStudent({ extra: { createdAt: expiredTrial() } });
    const { attempt } = await seed(user);
    const r = await request(app).get(`/api/listening/practice/history/${attempt._id}`).set('Authorization', bearer(user));
    expect(r.status).toBe(200);
    assertNoAnswerKey(r.body);
  });

  test('HTTP: a non-owner cannot read the attempt (unchanged 404)', async () => {
    const owner = await createStudent();
    const other = await createStudent();
    const { attempt } = await seed(owner);
    const r = await request(app).get(`/api/listening/practice/history/${attempt._id}`).set('Authorization', bearer(other));
    expect(r.status).toBe(404);
  });
});

// ───────────────── regression: official answer-key routes unchanged ─────────────────

describe('regression — the requirePremium-gated answer-key endpoints still behave', () => {
  test('reading /practice/answer-key/:id: premium 200 with the key, lapsed trial 403', async () => {
    const passage = await createPassage({ questionGroups: READING_GROUPS });

    const premium = await createPremiumStudent();
    const ok = await request(app).get(`/api/reading/practice/answer-key/${passage._id}`).set('Authorization', bearer(premium));
    expect(ok.status).toBe(200);
    expect(ok.body.answerKey['1'].correctAnswer).toBe(CORRECT);

    const lapsed = await createStudent({ extra: { createdAt: expiredTrial() } });
    const blocked = await request(app).get(`/api/reading/practice/answer-key/${passage._id}`).set('Authorization', bearer(lapsed));
    expect(blocked.status).toBe(403);
    expect(blocked.body.code).toBe('PLAN_REQUIRED');
  });

  test('listening /practice/answer-key/:id: premium 200 with the key, lapsed trial 403', async () => {
    const section = await createListeningSection({ questionGroups: LISTENING_GROUPS });

    const premium = await createPremiumStudent();
    const ok = await request(app).get(`/api/listening/practice/answer-key/${section._id}`).set('Authorization', bearer(premium));
    expect(ok.status).toBe(200);
    expect(ok.body.answerKey['1'].correctAnswer).toBe(CORRECT);

    const lapsed = await createStudent({ extra: { createdAt: expiredTrial() } });
    const blocked = await request(app).get(`/api/listening/practice/answer-key/${section._id}`).set('Authorization', bearer(lapsed));
    expect(blocked.status).toBe(403);
    expect(blocked.body.code).toBe('PLAN_REQUIRED');
  });
});
