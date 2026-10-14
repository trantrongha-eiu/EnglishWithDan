// A proctored attempt voided on the MAX_VIOLATIONS-th strike still gets the
// answers given so far saved — once, graded, but kept 'disqualified' (no
// review, no "completed" result) — so the teacher sees how far the student
// got. Covers the `disqualified: true` submit option and the Full Mock Test's
// POST /api/mock-test/:id/disqualified-step.
const request = require('supertest');
const app = require('../../app');
const { createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const {
  createReadingTest, createPassage, createListeningTest, createWritingExam, createSpeakingQuestion,
} = require('../factories/contentFactory');
const TestAttempt = require('../../models/TestAttempt');
const ListeningAttempt = require('../../models/ListeningAttempt');
const MockTestAttempt = require('../../models/MockTestAttempt');
const AttemptReview = require('../../models/AttemptReview');
const proctorPolicy = require('../../services/proctorPolicy');

function authed(user) {
  const token = signTokenFor(user);
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url, body) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body || {}),
  };
}

async function seedReadingTest() {
  await Promise.all([
    createPassage({ category: 'passage1' }),
    createPassage({ category: 'passage2' }),
    createPassage({ category: 'passage3' }),
  ]);
  return createReadingTest();
}

async function strikeOut(api, body) {
  let last;
  for (let i = 0; i < proctorPolicy.MAX_VIOLATIONS; i++) {
    last = await api.post('/api/exam-simulation/violation', { ...body, type: 'blur' });
  }
  expect(last.body.disqualified).toBe(true);
}

let dedupeSpy;
beforeEach(() => { dedupeSpy = jest.spyOn(proctorPolicy, 'isDuplicateEvent').mockReturnValue(false); });
afterEach(() => dedupeSpy.mockRestore());

describe('Test Simulation — answers saved on disqualification', () => {
  test('Reading: saved once, graded, still voided, no review', async () => {
    const test = await seedReadingTest();
    const student = await createPremiumStudent();
    const api = authed(student);
    const attemptId = (await api.post('/api/reading/start', { testId: String(test._id), mode: 'simulation' })).body.attemptId;
    await strikeOut(api, { skill: 'reading', attemptType: 'full', attemptId });

    // A plain submit is still refused — a voided run never becomes a result.
    expect((await api.post('/api/reading/submit', { attemptId, answers: {} })).status).toBe(404);

    const res = await api.post('/api/reading/submit', { attemptId, answers: { 1: 'x' }, disqualified: true });
    expect(res.status).toBe(200);
    expect(res.body.result.disqualified).toBe(true);

    const doc = await TestAttempt.findById(attemptId).lean();
    expect(doc.status).toBe('disqualified');
    expect(doc.endTime).toBeTruthy(); // grading ran (factory passages carry no questions — Listening below checks the score)
    expect(doc.proctor.answersSavedAt).toBeTruthy();
    expect(await AttemptReview.countDocuments({ attemptId })).toBe(0);

    // One time only.
    expect((await api.post('/api/reading/submit', { attemptId, answers: {}, disqualified: true })).status).toBe(404);
  });

  test('refused long after the disqualification', async () => {
    const test = await seedReadingTest();
    const student = await createPremiumStudent();
    const api = authed(student);
    const attemptId = (await api.post('/api/reading/start', { testId: String(test._id), mode: 'simulation' })).body.attemptId;
    await strikeOut(api, { skill: 'reading', attemptType: 'full', attemptId });
    await TestAttempt.updateOne({ _id: attemptId }, { $set: { 'proctor.disqualifiedAt': new Date(Date.now() - proctorPolicy.DQ_ANSWER_WINDOW_MS - 1000) } });

    expect((await api.post('/api/reading/submit', { attemptId, answers: {}, disqualified: true })).status).toBe(404);
  });

  test('Listening: graded answers saved on the voided attempt', async () => {
    const test = await createListeningTest();
    const student = await createPremiumStudent();
    const api = authed(student);
    const attemptId = (await api.post(`/api/listening/tests/${test._id}/start`, { mode: 'simulation' })).body.test.attemptId;
    await strikeOut(api, { skill: 'listening', attemptType: 'full', attemptId });

    const res = await api.post(`/api/listening/tests/${test._id}/submit`, { attemptId, answers: { 1: 'sunny' }, disqualified: true });
    expect(res.status).toBe(200);

    const doc = await ListeningAttempt.findById(attemptId).lean();
    expect(doc.status).toBe('disqualified');
    expect(doc.correctCount).toBe(1);
    expect(doc.totalQuestions).toBe(1);
  });
});

describe('Full Mock Test — voided run keeps the current skill\'s answers', () => {
  test('Listening sub-attempt is saved voided and linked to the run', async () => {
    await Promise.all([
      createListeningTest(), createReadingTest(), createWritingExam(),
      createSpeakingQuestion({ part: 2, cueCard: 'Describe a place.' }),
    ]);
    const student = await createPremiumStudent();
    const api = authed(student);
    const mock = (await api.post('/api/mock-test/start')).body.attempt;
    const tid = mock.bundle.listeningTestId;
    const subId = (await api.post(`/api/listening/tests/${tid}/start?purpose=mocktest`, { mode: 'practice' })).body.test.attemptId;

    // Linking is refused while the run is still open.
    expect((await api.post(`/api/mock-test/${mock._id}/disqualified-step`, { skill: 'listening', attemptId: subId })).status).toBe(409);

    let last;
    for (let i = 0; i < proctorPolicy.MAX_VIOLATIONS; i++) {
      last = await api.post(`/api/mock-test/${mock._id}/violation`, { type: 'hidden', skill: 'listening' });
    }
    expect(last.body.disqualified).toBe(true);

    const sub = await api.post(`/api/listening/tests/${tid}/submit`, { attemptId: subId, answers: { 1: 'sunny' }, disqualified: true });
    expect(sub.status).toBe(200);
    expect((await ListeningAttempt.findById(subId).lean()).status).toBe('disqualified');

    const link = await api.post(`/api/mock-test/${mock._id}/disqualified-step`, { skill: 'listening', attemptId: subId });
    expect(link.status).toBe(200);
    expect(link.body.attached).toBe(true);

    const run = await MockTestAttempt.findById(mock._id).lean();
    expect(run.status).toBe('disqualified');
    expect(String(run.steps.listening.attemptId)).toBe(String(subId));
    expect(run.steps.listening.completedAt).toBeFalsy();
    expect(run.progress).toBe('listening');
    expect(run.overallBand).toBeNull();
  });
});
