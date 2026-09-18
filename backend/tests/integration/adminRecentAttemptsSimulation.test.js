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

    for (let i = 0; i <= examSimulationService.MAX_VIOLATIONS; i++) {
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
    expect(row.violationCount).toBe(examSimulationService.MAX_VIOLATIONS + 1);
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
