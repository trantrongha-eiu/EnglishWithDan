// Priority 2C — real HTTP-level tests for GET /api/learning/today.
const request = require('supertest');
const app = require('../../app');
const { createStudent, signTokenFor } = require('../factories/userFactory');

describe('GET /api/learning/today', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/learning/today');
    expect(res.status).toBe(401);
  });

  test('a fresh student with no goal gets an honest onboarding response, not an error', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/learning/today').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(200);
    expect(res.body.hasGoal).toBe(false);
    expect(res.body.sessions).toEqual([]);
  });

  test('a client-supplied userId cannot override the authenticated identity', async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    await request(app).put('/api/goals').set('Authorization', `Bearer ${signTokenFor(studentA)}`).send({
      currentBand: 5.5, targetBand: 7.0, weeklyStudyMinutes: 240,
      studyDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], preferredSessionMinutes: 60,
    });

    // studentB's own request, with studentA's id smuggled into the query
    // string, must still only ever see studentB's own (goal-less) state.
    const res = await request(app)
      .get('/api/learning/today')
      .set('Authorization', `Bearer ${signTokenFor(studentB)}`)
      .query({ userId: studentA._id.toString() });
    expect(res.body.hasGoal).toBe(false);
  });

  test('a real goal + full-week study plan produces a real today response via the actual route', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    // weeklyStudyMinutes must be enough to cover every one of the 7
    // studyDays at preferredSessionMinutes each (7*60=420) — otherwise
    // generateSessions() (studyPlanService.js) legitimately runs out of
    // allocated minutes partway through the week and leaves the later
    // days with an empty items[] (Case D, documented in learningService.js
    // as known/deferred behavior, not a bug). The previous 240 here meant
    // "today" got zero sessions on any day past Thursday in the Mon-start
    // iteration order — this test only ever passed Monday-Thursday and
    // failed deterministically the rest of the week (caught running it on
    // a Saturday). 500 leaves headroom over the 420 needed so every day
    // is guaranteed non-empty regardless of which weekday the suite runs.
    await request(app).put('/api/goals').set('Authorization', `Bearer ${token}`).send({
      currentBand: 5.5, targetBand: 7.0, weeklyStudyMinutes: 500,
      studyDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], preferredSessionMinutes: 60,
    });
    const res = await request(app).get('/api/learning/today').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.hasGoal).toBe(true);
    expect(res.body.hasPlan).toBe(true);
    expect(res.body.isStudyDay).toBe(true); // every day selected, so today always qualifies
    expect(res.body.sessions.length).toBeGreaterThan(0);
    expect(res.body.totalMinutes).toBe(res.body.sessions.reduce((s, i) => s + i.minutes, 0));
  });

  test('calling it repeatedly never mutates the goal or plan (read-only, no persistent side effects)', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    await request(app).put('/api/goals').set('Authorization', `Bearer ${token}`).send({
      targetBand: 7.0, weeklyStudyMinutes: 120, studyDays: ['mon'], preferredSessionMinutes: 60,
    });
    await request(app).get('/api/learning/today').set('Authorization', `Bearer ${token}`);
    await request(app).get('/api/learning/today').set('Authorization', `Bearer ${token}`);
    const goalRes = await request(app).get('/api/goals').set('Authorization', `Bearer ${token}`);
    expect(goalRes.body.goal.targetBand).toBe(7.0); // untouched after 2 reads
    expect(goalRes.body.goal.weeklyStudyMinutes).toBe(120);
  });
});
