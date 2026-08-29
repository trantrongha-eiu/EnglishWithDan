// Integration tests for the full 4-skill mock test HTTP surface
// (routes/mockTest.js): premium gate on /start, the bundle/progress shape,
// the advance → nav handoff, resume via /current, and the history list.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const User = require('../../models/User');

// A free student whose first-24h trial window has already closed — the state
// requirePremium() actually blocks (a brand-new createStudent() is still
// inside its trial and would pass).
async function createExpiredFreeStudent() {
  const u = await createStudent();
  // createdAt is immutable under {timestamps:true}, so go through the raw
  // driver to backdate it past the 24h trial window.
  await User.collection.updateOne({ _id: u._id }, { $set: { createdAt: new Date('2020-01-01T00:00:00Z') } });
  return u;
}
const {
  createReadingTest, createListeningTest, createWritingExam, createSpeakingQuestion,
  createListeningAttempt, createTestAttempt, createWritingAttempt, createSpeakingAttempt,
} = require('../factories/contentFactory');

function authed(user) {
  const token = signTokenFor(user);
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url, body) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body || {}),
    put: (url, body) => request(app).put(url).set('Authorization', `Bearer ${token}`).send(body || {}),
    del: (url) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
}

async function seedPools() {
  await Promise.all([
    createListeningTest(), createReadingTest(), createWritingExam(),
    createSpeakingQuestion({ part: 2, cueCard: 'Describe a place.' }),
  ]);
}

describe('POST /api/mock-test/start', () => {
  test('403 for a free student past the trial window', async () => {
    await seedPools();
    const res = await authed(await createExpiredFreeStudent()).post('/api/mock-test/start');
    expect(res.status).toBe(403);
  });

  test('201 for premium — returns a full bundle at progress "listening"', async () => {
    await seedPools();
    const res = await authed(await createPremiumStudent()).post('/api/mock-test/start');
    expect(res.status).toBe(201);
    expect(res.body.attempt.progress).toBe('listening');
    expect(res.body.attempt.bundle.listeningTestId).toBeTruthy();
    expect(res.body.attempt.bundle.speakingQuestionId).toBeTruthy();
  });

  test('400 when a skill pool is empty', async () => {
    await createListeningTest(); await createReadingTest(); await createWritingExam();
    const res = await authed(await createPremiumStudent()).post('/api/mock-test/start');
    expect(res.status).toBe(400);
  });

  test('picks the ONLY active test per skill when the rest are hidden', async () => {
    // Admin hides every test but one so all students sit the same paper.
    await createListeningTest({ isActive: false });
    await createReadingTest({ isActive: false });
    const theL = await createListeningTest();
    const theR = await createReadingTest();
    const theW = await createWritingExam();
    const theS = await createSpeakingQuestion({ part: 2, cueCard: 'Describe a place.' });
    await createWritingExam({ isActive: false });

    const res = await authed(await createPremiumStudent()).post('/api/mock-test/start');
    expect(res.status).toBe(201);
    expect(res.body.attempt.bundle.listeningTestId).toBe(String(theL._id));
    expect(res.body.attempt.bundle.readingTestId).toBe(String(theR._id));
    expect(res.body.attempt.bundle.writingExamId).toBe(String(theW._id));
    expect(res.body.attempt.bundle.speakingQuestionId).toBe(String(theS._id));
  });

  test('a second start resumes the same run', async () => {
    await seedPools();
    const api = authed(await createPremiumStudent());
    const first = await api.post('/api/mock-test/start');
    const second = await api.post('/api/mock-test/start');
    expect(second.status).toBe(200);
    expect(second.body.resumed).toBe(true);
    expect(second.body.attempt._id).toBe(first.body.attempt._id);
  });
});

describe('mock-test advance + current + history', () => {
  test('advance walks listening → reading and hands off the next target', async () => {
    await seedPools();
    const user = await createPremiumStudent();
    const api = authed(user);

    const started = (await api.post('/api/mock-test/start')).body.attempt;
    const la = await createListeningAttempt({ userId: user._id, bandScore: 6 });

    const adv = await api.post(`/api/mock-test/${started._id}/advance`, { skill: 'listening', attemptId: la._id });
    expect(adv.status).toBe(200);
    expect(adv.body.attempt.progress).toBe('reading');
    expect(adv.body.nav).toEqual({ nextSkill: 'reading', nextTargetId: started.bundle.readingTestId });

    const cur = await api.get('/api/mock-test/current');
    expect(cur.body.attempt.progress).toBe('reading');
    expect(cur.body.attempt.steps.listening.band).toBe(6);
  });

  test('full run ends up in history with an overall band once all four are graded', async () => {
    await seedPools();
    const user = await createPremiumStudent();
    const api = authed(user);
    const m = (await api.post('/api/mock-test/start')).body.attempt;

    const la = await createListeningAttempt({ userId: user._id, bandScore: 6 });
    await api.post(`/api/mock-test/${m._id}/advance`, { skill: 'listening', attemptId: la._id });
    const ra = await createTestAttempt({ userId: user._id, testId: m.bundle.readingTestId, status: 'completed', extra: { bandScore: 6 } });
    await api.post(`/api/mock-test/${m._id}/advance`, { skill: 'reading', attemptId: ra._id });
    const wa = await createWritingAttempt({ userId: user._id, extra: { grading: { overallBand: 6 } } });
    await api.post(`/api/mock-test/${m._id}/advance`, { skill: 'writing', attemptId: wa._id });
    const sa = await createSpeakingAttempt({ userId: user._id, part: 2, extra: { aiFeedback: { overallBand: 6 } } });
    const last = await api.post(`/api/mock-test/${m._id}/advance`, { skill: 'speaking', attemptId: sa._id });

    expect(last.body.nav).toEqual({ done: true });
    expect(last.body.attempt.status).toBe('completed');
    expect(last.body.attempt.overallBand).toBe(6);

    const hist = await api.get('/api/mock-test/history');
    expect(hist.status).toBe(200);
    expect(hist.body.items).toHaveLength(1);
    expect(hist.body.items[0].overallBand).toBe(6);

    // No open run left.
    expect((await api.get('/api/mock-test/current')).body.attempt).toBeNull();
  });
});

describe('DELETE /api/mock-test/current — abandon the open run', () => {
  test('clears the open run and lets a fresh one start', async () => {
    await seedPools();
    const api = authed(await createPremiumStudent());

    const first = (await api.post('/api/mock-test/start')).body.attempt;

    const abandoned = await api.del('/api/mock-test/current');
    expect(abandoned.status).toBe(200);
    expect(abandoned.body.abandoned).toBe(true);

    // Nothing to resume any more…
    expect((await api.get('/api/mock-test/current')).body.attempt).toBeNull();

    // …and /start builds a brand-new run instead of resuming.
    const second = await api.post('/api/mock-test/start');
    expect(second.status).toBe(201);
    expect(second.body.resumed).toBe(false);
    expect(second.body.attempt._id).not.toBe(first._id);
  });

  test('abandoned run is hidden from history', async () => {
    await seedPools();
    const user = await createPremiumStudent();
    const api = authed(user);

    const m = (await api.post('/api/mock-test/start')).body.attempt;
    const la = await createListeningAttempt({ userId: user._id, bandScore: 6 });
    await api.post(`/api/mock-test/${m._id}/advance`, { skill: 'listening', attemptId: la._id });
    await api.del('/api/mock-test/current');

    const hist = await api.get('/api/mock-test/history');
    expect(hist.body.items).toHaveLength(0);
    expect(hist.body.total).toBe(0);
  });

  test('no-op (abandoned:false) when there is no open run', async () => {
    const res = await authed(await createPremiumStudent()).del('/api/mock-test/current');
    expect(res.status).toBe(200);
    expect(res.body.abandoned).toBe(false);
  });
});

describe('POST /api/mock-test/:id/violation — tab-switch proctoring', () => {
  test('each report bumps the count and flags the run; history carries it', async () => {
    await seedPools();
    const user = await createPremiumStudent();
    const api = authed(user);
    const m = (await api.post('/api/mock-test/start')).body.attempt;

    let res = await api.post(`/api/mock-test/${m._id}/violation`, { type: 'hidden', skill: 'listening' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ violationCount: 1, violated: true });

    res = await api.post(`/api/mock-test/${m._id}/violation`, { type: 'blur' });
    expect(res.body.violationCount).toBe(2);

    const cur = await api.get('/api/mock-test/current');
    expect(cur.body.attempt.proctor).toMatchObject({ violationCount: 2, violated: true });
    expect(cur.body.attempt.proctor.events).toHaveLength(2);
    expect(cur.body.attempt.proctor.events[0]).toMatchObject({ type: 'hidden', skill: 'listening' });
  });

  test('rejects an unknown violation type', async () => {
    await seedPools();
    const api = authed(await createPremiumStudent());
    const m = (await api.post('/api/mock-test/start')).body.attempt;
    const res = await api.post(`/api/mock-test/${m._id}/violation`, { type: 'screenshot' });
    expect(res.status).toBe(400);
  });

  test("404 for someone else's run", async () => {
    await seedPools();
    const owner = authed(await createPremiumStudent());
    const m = (await owner.post('/api/mock-test/start')).body.attempt;
    const other = authed(await createPremiumStudent());
    const res = await other.post(`/api/mock-test/${m._id}/violation`, { type: 'hidden' });
    expect(res.status).toBe(404);
  });

  test('does not count once the run is no longer in-progress', async () => {
    await seedPools();
    const user = await createPremiumStudent();
    const api = authed(user);
    const m = (await api.post('/api/mock-test/start')).body.attempt;

    const la = await createListeningAttempt({ userId: user._id, bandScore: 6 });
    await api.post(`/api/mock-test/${m._id}/advance`, { skill: 'listening', attemptId: la._id });
    const ra = await createTestAttempt({ userId: user._id, testId: m.bundle.readingTestId, status: 'completed', extra: { bandScore: 6 } });
    await api.post(`/api/mock-test/${m._id}/advance`, { skill: 'reading', attemptId: ra._id });
    const wa = await createWritingAttempt({ userId: user._id, extra: { grading: { overallBand: 6 } } });
    await api.post(`/api/mock-test/${m._id}/advance`, { skill: 'writing', attemptId: wa._id });
    const sa = await createSpeakingAttempt({ userId: user._id, part: 2, extra: { aiFeedback: { overallBand: 6 } } });
    await api.post(`/api/mock-test/${m._id}/advance`, { skill: 'speaking', attemptId: sa._id });

    const res = await api.post(`/api/mock-test/${m._id}/violation`, { type: 'hidden' });
    expect(res.status).toBe(200);
    expect(res.body.violationCount).toBe(0);
    expect(res.body.violated).toBe(false);
  });

  test('over the limit → run is voided and /start is blocked with 429', async () => {
    await seedPools();
    const user = await createPremiumStudent();
    const api = authed(user);
    const m = (await api.post('/api/mock-test/start')).body.attempt;

    let last;
    for (let i = 0; i <= 10; i++) {
      last = await api.post(`/api/mock-test/${m._id}/violation`, { type: 'hidden' });
    }
    expect(last.body.disqualified).toBe(true);
    expect(last.body.cooldownSeconds).toBe(300);

    const blocked = await api.post('/api/mock-test/start');
    expect(blocked.status).toBe(429);
    expect(blocked.body.code).toBe('MOCK_COOLDOWN');
    expect(blocked.body.cooldownSeconds).toBeGreaterThan(0);

    // A submit that raced the disqualification can't advance the voided run.
    const la = await createListeningAttempt({ userId: user._id, bandScore: 6 });
    const adv = await api.post(`/api/mock-test/${m._id}/advance`, { skill: 'listening', attemptId: la._id });
    expect(adv.status).toBe(409);
  });
});

describe('PUT /api/admin/mock-tests/:id/scores', () => {
  test('teacher hand-enters bands; overall is recomputed and flagged manual', async () => {
    await seedPools();
    const student = await createPremiumStudent();
    const api = authed(student);
    const m = (await api.post('/api/mock-test/start')).body.attempt;

    const la = await createListeningAttempt({ userId: student._id, bandScore: 6 });
    await api.post(`/api/mock-test/${m._id}/advance`, { skill: 'listening', attemptId: la._id });
    const ra = await createTestAttempt({ userId: student._id, testId: m.bundle.readingTestId, status: 'completed', extra: { bandScore: 7 } });
    await api.post(`/api/mock-test/${m._id}/advance`, { skill: 'reading', attemptId: ra._id });

    const teacher = authed(await createTeacher());
    const res = await teacher.put(`/api/admin/mock-tests/${m._id}/scores`, {
      steps: { writing: 6.5, speaking: 7 }, note: 'Speaking live 29/08',
    });
    expect(res.status).toBe(200);
    expect(res.body.attempt.steps.writing.band).toBe(6.5);
    expect(res.body.attempt.steps.writing.manual).toBe(true);
    expect(res.body.attempt.adminNote).toBe('Speaking live 29/08');
    // (6 + 7 + 6.5 + 7) / 4 = 6.625 -> 6.5
    expect(res.body.attempt.overallBand).toBe(6.5);
  });

  test('403 for a normal student', async () => {
    await seedPools();
    const student = await createPremiumStudent();
    const api = authed(student);
    const m = (await api.post('/api/mock-test/start')).body.attempt;
    const res = await api.put(`/api/admin/mock-tests/${m._id}/scores`, { steps: { writing: 6 } });
    expect(res.status).toBe(403);
  });

  test('400 for an off-scale band', async () => {
    await seedPools();
    const student = await createPremiumStudent();
    const m = (await authed(student).post('/api/mock-test/start')).body.attempt;
    const teacher = authed(await createTeacher());
    const res = await teacher.put(`/api/admin/mock-tests/${m._id}/scores`, { steps: { writing: 6.2 } });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/speaking/mock-submit', () => {
  test('creates a pending SpeakingAttempt with no transcript and returns its id', async () => {
    const student = await createPremiumStudent();
    const sq = await createSpeakingQuestion({ part: 2, cueCard: 'Describe a trip.' });
    const res = await authed(student).post('/api/speaking/mock-submit', {
      questionId: sq._id, part: 2, question: 'Describe a trip.', transcript: '', duration: 90,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.attemptId).toBeTruthy();
    expect(res.body.graded).toBe(false);
  });
});
