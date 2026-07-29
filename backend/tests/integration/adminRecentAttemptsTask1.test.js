// Regression coverage for GET /api/admin/recent-attempts grouping
// Task1Attempt's one-doc-per-question rows into one row per practice
// session. Task1Attempt is unique among the 9 collections this endpoint
// merges: every other skill already saves one document per session, but
// Task1's saveBatch() insertMany's every answered question as its own doc
// — without grouping, a single session of e.g. 9 questions used to show up
// as 9 separate admin history rows, each a misleading "1/1".
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const Task1Attempt = require('../../models/Task1Attempt');

async function makeAttempt(userId, overrides = {}) {
  return Task1Attempt.create({
    userId,
    exerciseId: new mongoose.Types.ObjectId(),
    userAnswer: 'answer',
    isCorrect: overrides.isCorrect ?? true,
    score: overrides.isCorrect === false ? 0 : 100,
    skillType: overrides.skillType || 'noun_phrase',
    sessionId: overrides.sessionId,
  });
}

describe('GET /api/admin/recent-attempts — Task1 session grouping', () => {
  test('collapses one session\'s multiple Task1Attempt docs into a single row with the real correct/total tally', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const token = signTokenFor(teacher);

    const sessionId = 'sess-abc-123';
    await makeAttempt(student._id, { sessionId, isCorrect: true,  skillType: 'noun_phrase' });
    await makeAttempt(student._id, { sessionId, isCorrect: true,  skillType: 'comparison' });
    await makeAttempt(student._id, { sessionId, isCorrect: false, skillType: 'comparison' });

    const res = await request(app)
      .get('/api/admin/recent-attempts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const task1Rows = res.body.attempts.filter(a => a.skill === 'task1-practice');
    expect(task1Rows).toHaveLength(1);
    expect(task1Rows[0].totalQuestions).toBe(3);
    expect(task1Rows[0].correctCount).toBe(2);
  });

  test('does not merge two different students\' sessions even if they share a sessionId string', async () => {
    const teacher  = await createTeacher();
    const studentA = await createStudent();
    const studentB = await createStudent();
    const token = signTokenFor(teacher);

    const sharedSessionId = 'sess-same-millisecond';
    await makeAttempt(studentA._id, { sessionId: sharedSessionId, isCorrect: true });
    await makeAttempt(studentB._id, { sessionId: sharedSessionId, isCorrect: true });

    const res = await request(app)
      .get('/api/admin/recent-attempts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const task1Rows = res.body.attempts.filter(a => a.skill === 'task1-practice');
    expect(task1Rows).toHaveLength(2);
  });

  test('separate sessions (different sessionId) for the same student stay as separate rows', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const token = signTokenFor(teacher);

    await makeAttempt(student._id, { sessionId: 'sess-1', isCorrect: true });
    await makeAttempt(student._id, { sessionId: 'sess-2', isCorrect: false });

    const res = await request(app)
      .get('/api/admin/recent-attempts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const task1Rows = res.body.attempts.filter(a => a.skill === 'task1-practice');
    expect(task1Rows).toHaveLength(2);
  });
});
