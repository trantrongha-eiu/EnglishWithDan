// Integration tests for a representative slice of the Reading API:
// the auth-required list endpoint, the premium-gated /start endpoint, and
// ownership scoping on /history.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createReadingTest, createCompletedTestAttempt, createPassage } = require('../factories/contentFactory');

describe('GET /api/reading/tests', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/reading/tests');
    expect(res.status).toBe(401);
  });

  test('returns the active test list shape for an authenticated user', async () => {
    await createReadingTest({ name: 'Orange Test 1', testNumber: 1 });
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app).get('/api/reading/tests').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.tests)).toBe(true);
    expect(res.body.tests.length).toBeGreaterThanOrEqual(1);
    expect(res.body.userPlan).toBe('free');
  });
});

describe('POST /api/reading/start (premium gate)', () => {
  // Free-plan gating is now the 24h-trial rule (backend/utils/plan.js's
  // hasFullAccess) — a free student whose account is past the trial window
  // is blocked; a freshly-created one (the default createStudent() shape)
  // is still inside it, so that case needs its own test below instead of
  // asserting 403 on a bare createStudent().
  test('a free-plan student whose 24h trial has expired is blocked with 403 PLAN_REQUIRED', async () => {
    const test = await createReadingTest();
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/reading/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ testId: String(test._id) });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a freshly-created free-plan student (still inside the 24h trial) passes the gate', async () => {
    const test = await createReadingTest();
    const user = await createStudent({ extra: { createdAt: new Date() } });
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/reading/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ testId: String(test._id) });
    expect(res.status).not.toBe(403);
  });

  test('a premium student passes the gate (reaches the controller, no 403)', async () => {
    const test = await createReadingTest();
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/reading/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ testId: String(test._id) });
    // No passages seeded in this test DB, so the controller reports
    // insufficient_data (400) rather than succeeding — the point of this
    // assertion is that the premium gate itself was passed (not a 403).
    expect(res.status).not.toBe(403);
    expect([200, 400]).toContain(res.status);
  });
});

// Regression coverage for BUG-008 (2026-08-27 audit): /submit had no
// premium check at all, unlike its Listening equivalent
// (/tests/:id/submit, already gated) — a lapsed-trial user could submit
// against a still-open attemptId (from before their access expired, or
// simply guessed) with no premium check anywhere in the flow.
describe('POST /api/reading/submit (premium gate)', () => {
  test('a free-plan student whose 24h trial has expired is blocked with 403 PLAN_REQUIRED', async () => {
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/reading/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ attemptId: '000000000000000000000000', answers: {} });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a premium student passes the gate (reaches the controller, no 403)', async () => {
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/reading/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ attemptId: '000000000000000000000000', answers: {} });
    // No such attempt exists, so the controller reports 404 rather than
    // succeeding — the point here is only that the premium gate was passed.
    expect(res.status).not.toBe(403);
  });
});

// Regression coverage for BUG-009 (2026-08-27 audit): /practice/save had no
// premium check at all — a lapsed-trial user could call it directly with
// any passageId to create a real ReadingPracticeAttempt.
describe('POST /api/reading/practice/save (premium gate)', () => {
  test('a free-plan student whose 24h trial has expired is blocked with 403 PLAN_REQUIRED', async () => {
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/reading/practice/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ passageId: '000000000000000000000000', answers: [] });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a premium student passes the gate and the attempt is actually saved', async () => {
    const passage = await createPassage({
      category: 'passage1',
      questions: [{ questionNumber: 1, type: 'sentence-completion', questionText: 'Q1', correctAnswer: 'apple' }],
    });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/reading/practice/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ passageId: String(passage._id), category: 'passage1', answers: [{ questionNumber: 1, userAnswer: 'apple' }], timeTaken: 30 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.attemptId).toBeTruthy();
  });

  // BUG-A07: /practice/save is fire-and-forget — a double fire must not
  // duplicate the row OR the AttemptReview it spawns.
  test('re-sending the same clientKey returns the original attempt, creates no duplicate', async () => {
    const ReadingPracticeAttempt = require('../../models/ReadingPracticeAttempt');
    const AttemptReview = require('../../models/AttemptReview');
    const passage = await createPassage({
      category: 'passage1',
      questions: [{ questionNumber: 1, type: 'sentence-completion', questionText: 'Q1', correctAnswer: 'apple' }],
    });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const body = {
      clientKey: 'test-idem-key-1',
      passageId: String(passage._id), category: 'passage1',
      answers: [{ questionNumber: 1, userAnswer: 'WRONG' }], // wrong → spawns a review
      timeTaken: 30,
    };

    const first = await request(app).post('/api/reading/practice/save').set('Authorization', `Bearer ${token}`).send(body);
    const second = await request(app).post('/api/reading/practice/save').set('Authorization', `Bearer ${token}`).send(body);
    const third = await request(app).post('/api/reading/practice/save').set('Authorization', `Bearer ${token}`).send(body);

    expect(first.body.attemptId).toBeTruthy();
    expect(second.body.attemptId).toBe(first.body.attemptId);
    expect(third.body.attemptId).toBe(first.body.attemptId);
    expect(await ReadingPracticeAttempt.countDocuments({ userId: user._id })).toBe(1);
    expect(await AttemptReview.countDocuments({ userId: user._id, attemptType: 'reading-practice' })).toBe(1);
  });

  test('no clientKey → old behavior (each call is its own row)', async () => {
    const ReadingPracticeAttempt = require('../../models/ReadingPracticeAttempt');
    const passage = await createPassage({ category: 'passage1', questions: [{ questionNumber: 1, type: 'sentence-completion', questionText: 'Q1', correctAnswer: 'apple' }] });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const body = { passageId: String(passage._id), category: 'passage1', answers: [{ questionNumber: 1, userAnswer: 'apple' }] };
    await request(app).post('/api/reading/practice/save').set('Authorization', `Bearer ${token}`).send(body);
    await request(app).post('/api/reading/practice/save').set('Authorization', `Bearer ${token}`).send(body);
    expect(await ReadingPracticeAttempt.countDocuments({ userId: user._id })).toBe(2);
  });
});

describe('GET /api/reading/practice/by-id/:id and /api/reading/practice/:category (premium gate)', () => {
  // Regression test for the paywall-bypass bug found in the 2026-08-21 audit:
  // these two routes returned full passage content to any authenticated user
  // (including a free student past the 24h trial) because requirePremium was
  // missing here while the equivalent Listening routes already had it.
  test('practice/by-id/:id blocks a free-plan student whose 24h trial has expired with 403 PLAN_REQUIRED', async () => {
    const passage = await createPassage({ category: 'passage1' });
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app)
      .get(`/api/reading/practice/by-id/${passage._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('practice/by-id/:id lets a premium student through (no 403)', async () => {
    const passage = await createPassage({ category: 'passage1' });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .get(`/api/reading/practice/by-id/${passage._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).not.toBe(403);
    expect(res.status).toBe(200);
  });

  test('practice/:category (random passage) blocks a free-plan student whose 24h trial has expired with 403 PLAN_REQUIRED', async () => {
    await createPassage({ category: 'passage2' });
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app)
      .get('/api/reading/practice/passage2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('practice/:category (random passage) lets a premium student through (no 403)', async () => {
    await createPassage({ category: 'passage2' });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .get('/api/reading/practice/passage2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).not.toBe(403);
    expect(res.status).toBe(200);
  });

  // Regression test for BUG-001 (2026-08-27 audit): this route returned the
  // raw passage document — correctAnswer + explanation included, for every
  // question — before the student had answered anything, unlike its sibling
  // practice/by-id/:id which already stripped these fields. Field-stripping
  // is done via an aggregation $project (not .select(), since
  // getRandomPracticePassage uses $sample), so this is worth asserting on
  // directly rather than trusting the code path is equivalent.
  test('practice/:category (random passage) never leaks correctAnswer/explanation before submission', async () => {
    await createPassage({
      category: 'passage3',
      questions: [{ questionNumber: 1, type: 'sentence-completion', questionText: 'Q1', correctAnswer: 'apple', explanation: 'Because it says so in paragraph 2.' }],
    });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .get('/api/reading/practice/passage3')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.passage.questions[0].questionText).toBe('Q1'); // real content still present
    expect(res.body.passage.questions[0].correctAnswer).toBeUndefined();
    expect(res.body.passage.questions[0].explanation).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('Because it says so in paragraph 2.');
  });
});

describe('GET /api/reading/history (ownership scoping)', () => {
  test("only returns the requesting student's own completed attempts", async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    await createCompletedTestAttempt({ userId: studentA._id, bandScore: 7.0 });
    await createCompletedTestAttempt({ userId: studentB._id, bandScore: 5.0 });

    const token = signTokenFor(studentA);
    const res = await request(app).get('/api/reading/history').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.history.length).toBe(1);
    expect(res.body.history[0].bandScore).toBe(7.0);
  });

  // Regression coverage for BUG-013 (2026-08-27 audit): this endpoint used
  // to be a bare .limit(50) with no total/hasMore — older history silently
  // vanished past the cap with no indication anything was missing.
  test('reports an honest total/hasMore, independent of ?limit=', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    for (let i = 0; i < 3; i++) await createCompletedTestAttempt({ userId: student._id, bandScore: 6.0 });

    const page = await request(app).get('/api/reading/history').set('Authorization', `Bearer ${token}`).query({ limit: 2 }).send();
    expect(page.body.history).toHaveLength(2); // capped by the requested limit
    expect(page.body.total).toBe(3); // real count, not capped
    expect(page.body.hasMore).toBe(true);

    const full = await request(app).get('/api/reading/history').set('Authorization', `Bearer ${token}`).query({ limit: 50 }).send();
    expect(full.body.history).toHaveLength(3);
    expect(full.body.total).toBe(3);
    expect(full.body.hasMore).toBe(false);
  });

  test('an invalid ?limit= (non-numeric, negative, or absurdly large) never crashes or returns unbounded results', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    await createCompletedTestAttempt({ userId: student._id, bandScore: 6.0 });

    for (const limit of ['not-a-number', -5, 999999]) {
      const res = await request(app).get('/api/reading/history').set('Authorization', `Bearer ${token}`).query({ limit }).send();
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.history)).toBe(true);
    }
  });

  test('an empty history reports total:0, hasMore:false, not an error', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const res = await request(app).get('/api/reading/history').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.history).toEqual([]);
    expect(res.body.total).toBe(0);
    expect(res.body.hasMore).toBe(false);
  });
});

// BUG-A06: GET /api/reading/practice/history had the same bare .limit(50)
// gap that /history (full tests) was already fixed for.
describe('GET /api/reading/practice/history (BUG-A06 — honest total/hasMore)', () => {
  const { createReadingPracticeAttempt } = require('../factories/contentFactory');

  test('reports total + hasMore, and only the requesting student\'s own rows', async () => {
    const me = await createStudent();
    const other = await createStudent();
    for (let i = 0; i < 3; i++) await createReadingPracticeAttempt({ userId: me._id });
    await createReadingPracticeAttempt({ userId: other._id });
    const token = signTokenFor(me);

    const capped = await request(app).get('/api/reading/practice/history?limit=2').set('Authorization', `Bearer ${token}`);
    expect(capped.status).toBe(200);
    expect(capped.body.attempts).toHaveLength(2);
    expect(capped.body.total).toBe(3);          // real count for THIS user, not the other student's
    expect(capped.body.hasMore).toBe(true);

    const full = await request(app).get('/api/reading/practice/history?limit=50').set('Authorization', `Bearer ${token}`);
    expect(full.body.attempts).toHaveLength(3);
    expect(full.body.total).toBe(3);
    expect(full.body.hasMore).toBe(false);
  });

  test('empty history → attempts:[], total:0, hasMore:false', async () => {
    const user = await createStudent();
    const res = await request(app).get('/api/reading/practice/history').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.attempts).toEqual([]);
    expect(res.body.total).toBe(0);
    expect(res.body.hasMore).toBe(false);
  });
});
