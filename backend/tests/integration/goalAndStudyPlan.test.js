// Priority 2B — real HTTP-level tests for GET/PUT /api/goals,
// GET /api/goals/estimated-performance, GET /api/study-plan/current.
// Focus: auth (JWT-only, never a client-supplied userId) and validation
// surfacing correctly through the actual route/controller layer.
const request = require('supertest');
const app = require('../../app');
const { createStudent, signTokenFor } = require('../factories/userFactory');

describe('GET/PUT /api/goals', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/goals');
    expect(res.status).toBe(401);
  });

  test('a fresh student has no goal yet', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/goals').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(200);
    expect(res.body.goal.hasGoal).toBe(false);
  });

  test('PUT saves a valid goal and GET reflects it back', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const put = await request(app).put('/api/goals').set('Authorization', `Bearer ${token}`).send({
      currentBand: 5.5, targetBand: 7.0, weeklyStudyMinutes: 240,
      studyDays: ['mon', 'wed', 'fri'], preferredSessionMinutes: 60,
    });
    expect(put.status).toBe(200);
    expect(put.body.goal.targetBand).toBe(7.0);

    const get = await request(app).get('/api/goals').set('Authorization', `Bearer ${token}`);
    expect(get.body.goal.currentBand).toBe(5.5);
    expect(get.body.goal.gapBands).toBe(1.5);
  });

  test('PUT rejects targetBand above 7.5 with 400, not a 500 or a silent clamp', async () => {
    const student = await createStudent();
    const res = await request(app).put('/api/goals').set('Authorization', `Bearer ${signTokenFor(student)}`).send({ targetBand: 9 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('a goal is scoped to the authenticated user only — never a client-supplied userId', async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    await request(app).put('/api/goals').set('Authorization', `Bearer ${signTokenFor(studentA)}`).send({ targetBand: 7.0 });

    // studentB's own GET must not see studentA's goal, even if a userId were smuggled in.
    const res = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${signTokenFor(studentB)}`)
      .query({ userId: studentA._id.toString() });
    expect(res.body.goal.targetBand).toBeNull();
  });
});

describe('GET /api/goals/estimated-performance', () => {
  test('requires authentication and returns a per-skill breakdown', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/goals/estimated-performance').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(200);
    expect(res.body.skills.reading.status).toBe('insufficient_data');
  });
});

describe('GET /api/study-plan/current', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/study-plan/current');
    expect(res.status).toBe(401);
  });

  test('no goal yet -> hasPlan false, not a 500', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/study-plan/current').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(200);
    expect(res.body.hasPlan).toBe(false);
  });

  test('a full goal produces a real weekly plan via the actual HTTP route', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    await request(app).put('/api/goals').set('Authorization', `Bearer ${token}`).send({
      currentBand: 5.5, targetBand: 7.0, weeklyStudyMinutes: 180,
      studyDays: ['mon', 'wed', 'fri'], preferredSessionMinutes: 60,
    });
    const res = await request(app).get('/api/study-plan/current').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.hasPlan).toBe(true);
    expect(res.body.sessions).toHaveLength(3);
    expect(res.body.totalMinutes).toBe(180);
  });
});
