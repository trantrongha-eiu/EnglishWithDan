// Regression coverage: GET /api/admin/recent-attempts must include Listening
// Gap-fill practice (GapFillAttempt) — this collection existed and was
// actively written on every submit (listeningService.saveGapFillAttempt),
// but was never wired into the admin dashboard/history feed, so a teacher
// had no visibility into a student's Gap-fill practice at all (reported
// while auditing the Gap-fill feature ahead of publishing it).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const GapFillAttempt = require('../../models/GapFillAttempt');

describe('GET /api/admin/recent-attempts — Listening Gap-fill', () => {
  test('includes a Gap-fill attempt with the right correct/total and section title', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const token = signTokenFor(teacher);

    await GapFillAttempt.create({
      userId: student._id,
      sectionId: '507f1f77bcf86cd799439011',
      sectionTitle: 'Walking Holidays', partNumber: 1,
      answers: [{ blankIndex: 0, userAnswer: 'a', isCorrect: true }],
      totalBlanks: 27, correctCount: 20,
    });

    const res = await request(app)
      .get('/api/admin/recent-attempts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const rows = res.body.attempts.filter(a => a.skill === 'listening-gapfill');
    expect(rows).toHaveLength(1);
    expect(rows[0].testName).toBe('Walking Holidays');
    expect(rows[0].correctCount).toBe(20);
    expect(rows[0].totalQuestions).toBe(27);
  });

  test('?userId= filter scopes Gap-fill attempts to one student', async () => {
    const teacher  = await createTeacher();
    const studentA = await createStudent();
    const studentB = await createStudent();
    const token = signTokenFor(teacher);

    await GapFillAttempt.create({
      userId: studentA._id, sectionId: '507f1f77bcf86cd799439011',
      sectionTitle: 'A', totalBlanks: 25, correctCount: 25,
    });
    await GapFillAttempt.create({
      userId: studentB._id, sectionId: '507f1f77bcf86cd799439011',
      sectionTitle: 'B', totalBlanks: 25, correctCount: 10,
    });

    const res = await request(app)
      .get(`/api/admin/recent-attempts?userId=${studentA._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const rows = res.body.attempts.filter(a => a.skill === 'listening-gapfill');
    expect(rows).toHaveLength(1);
    expect(rows[0].correctCount).toBe(25);
  });
});
