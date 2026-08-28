// Integration tests for the admin mock-test monitor
// (routes/admin/mockTests.js) — the full 4-skill mock had no admin surface
// before, so this locks in: auth gating, the cross-student list shape, the
// proctoring ("gậy") counters, the violatedOnly filter, abandoned-run
// exclusion, and the detail endpoint's event log.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const MockTestAttempt = require('../../models/MockTestAttempt');

function authed(user) {
  const token = signTokenFor(user);
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
  };
}

async function seedRun(user, over = {}) {
  return MockTestAttempt.create({
    userId: user._id,
    bundle: { listeningTestName: 'LT 1', readingTestName: 'RT 1', writingExamName: 'WE 1', speakingTopic: 'Work' },
    status: 'completed',
    overallBand: 6.5,
    steps: {
      listening: { band: 6.5, completedAt: new Date() },
      reading: { band: 7, completedAt: new Date() },
      writing: { band: 6, completedAt: new Date() },
      speaking: { band: 6.5, completedAt: new Date() },
    },
    ...over,
  });
}

describe('GET /api/admin/mock-tests', () => {
  test('403 for a normal student', async () => {
    const res = await authed(await createStudent()).get('/api/admin/mock-tests');
    expect(res.status).toBe(403);
  });

  test('teacher sees every student\'s runs with who ran them', async () => {
    const s1 = await createStudent({ firstName: 'An', lastName: 'Nguyen' });
    const s2 = await createStudent();
    await seedRun(s1);
    await seedRun(s2);

    const res = await authed(await createTeacher()).get('/api/admin/mock-tests');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.items).toHaveLength(2);
    const mine = res.body.items.find(i => i.user._id === String(s1._id));
    expect(mine.user.displayName).toBe('An Nguyen');
    expect(mine.steps.listening.band).toBe(6.5);
    expect(mine.overallBand).toBe(6.5);
  });

  test('violatedTotal counts flagged runs; ?violatedOnly=1 filters to them', async () => {
    const s = await createStudent();
    await seedRun(s);
    await seedRun(s, { proctor: { violationCount: 3, violated: true, events: [
      { type: 'hidden', skill: 'reading', at: new Date() },
    ] } });

    const admin = await createAdmin();
    const all = await authed(admin).get('/api/admin/mock-tests');
    expect(all.body.total).toBe(2);
    expect(all.body.violatedTotal).toBe(1);

    const flagged = await authed(admin).get('/api/admin/mock-tests?violatedOnly=1');
    expect(flagged.body.total).toBe(1);
    expect(flagged.body.items[0].proctor.violated).toBe(true);
    expect(flagged.body.items[0].proctor.violationCount).toBe(3);
  });

  test('abandoned runs are excluded', async () => {
    const s = await createStudent();
    await seedRun(s, { status: 'abandoned' });
    const res = await authed(await createTeacher()).get('/api/admin/mock-tests');
    expect(res.body.total).toBe(0);
  });
});

describe('GET /api/admin/mock-tests/:id', () => {
  test('returns the run with its full proctor event log', async () => {
    const s = await createStudent();
    const run = await seedRun(s, { proctor: { violationCount: 2, violated: true, events: [
      { type: 'hidden', skill: 'listening', at: new Date() },
      { type: 'blur', skill: 'reading', at: new Date() },
    ] } });

    const res = await authed(await createTeacher()).get(`/api/admin/mock-tests/${run._id}`);
    expect(res.status).toBe(200);
    expect(res.body.attempt.proctor.events).toHaveLength(2);
    expect(res.body.attempt.proctor.events[0].type).toBe('hidden');
    expect(res.body.attempt.user._id).toBe(String(s._id));
  });

  test('404 for an unknown id', async () => {
    const res = await authed(await createTeacher()).get('/api/admin/mock-tests/6a915cfc96c1e6ea2960f623');
    expect(res.status).toBe(404);
  });
});
