// Regression coverage: GET /api/admin/recent-attempts must surface Test
// Simulation mode (Reading/Listening/Writing standalone proctoring — see
// backend/services/examSimulationService.js) to admins/teachers, including
// runs that got disqualified for violations. Before this, `status:
// 'completed'` on the Reading/Listening queries silently hid every
// disqualified full-test run from the feed entirely, and even the rows
// that DID show (writing, reading/listening "lẻ" practice) never carried
// mode/proctor data, so a teacher had no way to see a "gậy" (violation)
// count or that a run was proctored at all.
const request = require('supertest');
const app = require('../../app');
const { createTeacher, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createReadingTest, createPassage } = require('../factories/contentFactory');
const examSimulationService = require('../../services/examSimulationService');

function authed(user) {
  const token = signTokenFor(user);
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url, body) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body || {}),
  };
}

describe('GET /api/admin/recent-attempts — Test Simulation violations are visible to admin', () => {
  // Back-to-back strikes would otherwise be merged by the 3s same-absence
  // dedupe (covered in examSimulationService.test.js).
  let dedupeSpy;
  beforeEach(() => { dedupeSpy = jest.spyOn(require('../../services/proctorPolicy'), 'isDuplicateEvent').mockReturnValue(false); });
  afterEach(() => dedupeSpy.mockRestore());

  test('a disqualified Reading Simulation run still shows up, with mode + full violation count', async () => {
    await Promise.all([
      createPassage({ category: 'passage1' }),
      createPassage({ category: 'passage2' }),
      createPassage({ category: 'passage3' }),
    ]);
    const test = await createReadingTest();
    const teacher = await createTeacher();
    const student = await createPremiumStudent();
    const studentApi = authed(student);

    const startRes = await studentApi.post('/api/reading/start', { testId: String(test._id), mode: 'simulation' });
    expect(startRes.status).toBe(200);
    const attemptId = startRes.body.attemptId;

    for (let i = 1; i <= examSimulationService.MAX_VIOLATIONS; i++) {
      await studentApi.post('/api/exam-simulation/violation', {
        skill: 'reading', attemptType: 'full', attemptId, type: 'blur',
      });
    }

    const adminRes = await authed(teacher).get('/api/admin/recent-attempts');
    expect(adminRes.status).toBe(200);

    const row = adminRes.body.attempts.find(a => a.skill === 'reading' && a._id === attemptId);
    expect(row).toBeTruthy();
    expect(row.mode).toBe('simulation');
    expect(row.disqualified).toBe(true);
    expect(row.violated).toBe(true);
    expect(row.violationCount).toBe(examSimulationService.MAX_VIOLATIONS);
  });

  test('an ordinary (non-Simulation) completed run reports mode:"practice" and no violations', async () => {
    await Promise.all([
      createPassage({ category: 'passage1' }),
      createPassage({ category: 'passage2' }),
      createPassage({ category: 'passage3' }),
    ]);
    const test = await createReadingTest();
    const teacher = await createTeacher();
    const student = await createPremiumStudent();
    const studentApi = authed(student);

    const startRes = await studentApi.post('/api/reading/start', { testId: String(test._id) });
    const attemptId = startRes.body.attemptId;
    await studentApi.post('/api/reading/submit', { attemptId, answers: {} });

    const adminRes = await authed(teacher).get('/api/admin/recent-attempts');
    const row = adminRes.body.attempts.find(a => a.skill === 'reading' && a._id === attemptId);
    expect(row).toBeTruthy();
    expect(row.mode).toBe('practice');
    expect(row.violated).toBe(false);
    expect(row.violationCount).toBe(0);
  });
});

// Reported 2026-10-01: every Simulation test a student merely OPENED showed
// up in the admin feed as a 0/0, 0m00s row — the "lẻ" start endpoint writes
// an in-progress placeholder (so strikes have a row to attach to) and the
// practice collections were queried with no status filter at all.
describe('GET /api/admin/recent-attempts — Simulation placeholders are not attempts', () => {
  test('in-progress / abandoned "lẻ" placeholders are hidden; submitted and voided runs show', async () => {
    const mongoose = require('mongoose');
    const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');
    const ReadingPracticeAttempt = require('../../models/ReadingPracticeAttempt');
    const teacher = await createTeacher();
    const student = await createPremiumStudent();
    const base = { userId: student._id, sectionId: new mongoose.Types.ObjectId(), sectionTitle: 'Cam 21 - Test 4 - Part 1', partNumber: 1, mode: 'simulation' };

    const opened = await ListeningPracticeAttempt.create({ ...base, status: 'in-progress' });
    const swept = await ListeningPracticeAttempt.create({ ...base, status: 'abandoned' });
    const done = await ListeningPracticeAttempt.create({ ...base, status: 'completed', totalQuestions: 10, correctCount: 7 });
    const voided = await ListeningPracticeAttempt.create({ ...base, status: 'disqualified', proctor: { violationCount: 3, violated: true } });
    const readingOpened = await ReadingPracticeAttempt.create({
      userId: student._id, passageId: new mongoose.Types.ObjectId(), passageTitle: 'P', category: 'passage1', status: 'in-progress', mode: 'simulation',
    });

    const res = await authed(teacher).get(`/api/admin/recent-attempts?userId=${student._id}`);
    expect(res.status).toBe(200);
    const ids = res.body.attempts.map(a => a._id);
    expect(ids).not.toContain(String(opened._id));
    expect(ids).not.toContain(String(swept._id));
    expect(ids).not.toContain(String(readingOpened._id));
    expect(ids).toContain(String(done._id));
    expect(ids).toContain(String(voided._id));
    expect(res.body.total).toBe(2);
  });
});
