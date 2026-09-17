// Integration tests for the Test Simulation feature's HTTP surface —
// Reading is used as the representative skill (same code path
// Listening/Writing share via examSimulationService), plus one
// cross-skill test proving the cooldown is genuinely global.
//
// Covers the scenarios explicitly called out in the feature request:
//   - 5 strikes -> attempt cancelled (disqualified)
//   - the 5-minute cooldown is enforced SERVER-SIDE (a bare API call with
//     nothing but a valid token, no cooperating frontend, is still blocked)
//   - the cooldown blocks a new Simulation in a DIFFERENT skill too (global)
//   - Practice mode is completely unaffected by an active cooldown
const request = require('supertest');
const app = require('../../app');
const { createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createReadingTest, createPassage, createListeningTest } = require('../factories/contentFactory');
const User = require('../../models/User');
const TestAttempt = require('../../models/TestAttempt');
const examSimulationService = require('../../services/examSimulationService');

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

describe('Test Simulation — start, 5 strikes, disqualify, global cooldown', () => {
  test('full flow: start simulation -> 5 violations disqualifies -> global cooldown blocks a new Simulation in ANY skill, but not Practice', async () => {
    const test = await seedReadingTest();
    const listeningTest = await createListeningTest();
    const student = await createPremiumStudent();
    const api = authed(student);

    // 1) Start a Simulation Reading attempt.
    const startRes = await api.post('/api/reading/start', { testId: String(test._id), mode: 'simulation' });
    expect(startRes.status).toBe(200);
    expect(startRes.body.mode).toBe('simulation');
    const attemptId = startRes.body.attemptId;
    expect(attemptId).toBeTruthy();

    // 2) Report violations up to MAX_VIOLATIONS — still in-progress, not disqualified.
    for (let i = 1; i <= examSimulationService.MAX_VIOLATIONS; i++) {
      const res = await api.post('/api/exam-simulation/violation', {
        skill: 'reading', attemptType: 'full', attemptId, type: 'blur',
      });
      expect(res.status).toBe(200);
      expect(res.body.disqualified).toBe(false);
    }

    // 3) The (MAX_VIOLATIONS + 1)th violation disqualifies the run.
    const dqRes = await api.post('/api/exam-simulation/violation', {
      skill: 'reading', attemptType: 'full', attemptId, type: 'blur',
    });
    expect(dqRes.status).toBe(200);
    expect(dqRes.body.disqualified).toBe(true);
    expect(dqRes.body.cooldownSeconds).toBe(examSimulationService.COOLDOWN_SECONDS);

    const attemptAfterDq = await TestAttempt.findById(attemptId);
    expect(attemptAfterDq.status).toBe('disqualified');

    // 4) A direct submit call to the disqualified attempt — proving a
    // voided run genuinely can't still be turned in for a real result,
    // even by calling the API directly (no cooperating frontend needed to
    // enforce this).
    const submitRes = await api.post('/api/reading/submit', { attemptId, answers: {} });
    expect(submitRes.status).toBe(404);

    // 5) GET /api/exam-simulation/cooldown reports the active cooldown.
    const cooldownRes = await api.get('/api/exam-simulation/cooldown');
    expect(cooldownRes.status).toBe(200);
    expect(cooldownRes.body.active).toBe(true);
    expect(cooldownRes.body.remainingSeconds).toBeGreaterThan(0);

    // 6) A fresh Reading Simulation start — rejected server-side, purely
    // from calling the API with a valid token (no client state involved).
    const blockedReadingRes = await api.post('/api/reading/start', { testId: String(test._id), mode: 'simulation' });
    expect(blockedReadingRes.status).toBe(429);
    expect(blockedReadingRes.body.code).toBe('SIMULATION_COOLDOWN');

    // 7) The SAME cooldown also blocks starting a Simulation in a
    // DIFFERENT skill (Listening) — proving it's global, not per-skill.
    const blockedListeningRes = await api.post(`/api/listening/tests/${listeningTest._id}/start`, { mode: 'simulation' });
    expect(blockedListeningRes.status).toBe(429);
    expect(blockedListeningRes.body.code).toBe('SIMULATION_COOLDOWN');

    // 8) Practice mode is completely unaffected by the active cooldown —
    // the whole point of Practice staying untouched by this feature.
    const practiceRes = await api.post('/api/reading/start', { testId: String(test._id), mode: 'practice' });
    expect(practiceRes.status).toBe(200);
    expect(practiceRes.body.mode).toBe('practice');

    // 9) Once the cooldown window has genuinely elapsed, a new Simulation
    // is allowed again.
    await User.updateOne({ _id: student._id }, { $set: { simulationCooldownUntil: new Date(Date.now() - 1000) } });
    const reopenedRes = await api.post('/api/reading/start', { testId: String(test._id), mode: 'simulation' });
    expect(reopenedRes.status).toBe(200);
    expect(reopenedRes.body.mode).toBe('simulation');
  });

  test('a late violation report after the attempt is already completed is a no-op (idempotent, no error)', async () => {
    const test = await seedReadingTest();
    const student = await createPremiumStudent();
    const api = authed(student);

    const startRes = await api.post('/api/reading/start', { testId: String(test._id), mode: 'simulation' });
    const attemptId = startRes.body.attemptId;

    const submitRes = await api.post('/api/reading/submit', { attemptId, answers: {} });
    expect(submitRes.status).toBe(200);

    const lateViolation = await api.post('/api/exam-simulation/violation', {
      skill: 'reading', attemptType: 'full', attemptId, type: 'blur',
    });
    expect(lateViolation.status).toBe(200);
    expect(lateViolation.body.disqualified).toBe(false);
  });

  test('practice mode never creates a proctor trail and is rejected by the violation endpoint', async () => {
    const test = await seedReadingTest();
    const student = await createPremiumStudent();
    const api = authed(student);

    const startRes = await api.post('/api/reading/start', { testId: String(test._id) }); // no mode -> defaults to practice
    expect(startRes.body.mode).toBe('practice');
    const attemptId = startRes.body.attemptId;

    const res = await api.post('/api/exam-simulation/violation', {
      skill: 'reading', attemptType: 'full', attemptId, type: 'blur',
    });
    expect(res.status).toBe(400);
  });
});
