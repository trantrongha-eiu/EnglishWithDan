// Regression coverage: GET /api/admin/recent-attempts should show
// Writing Practice (WP) rows as correct/total per topic (not null/null,
// and not one row per sentence) — audit finding, 2026-08-02.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const WritingPracticeAttempt = require('../../models/WritingPracticeAttempt');

describe('GET /api/admin/recent-attempts — writing-practice shows correct/total per topic', () => {
  test('reports the aggregate correctItems/totalItems already stored on the row', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const token = signTokenFor(teacher);

    await WritingPracticeAttempt.create({
      studentId: student._id, level: 'beginner', topic: 'greetings',
      types: ['translation'], totalItems: 5, correctItems: 4, xpEarned: 60,
    });

    const res = await request(app)
      .get('/api/admin/recent-attempts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const rows = res.body.attempts.filter(a => a.skill === 'writing-practice');
    expect(rows).toHaveLength(1);
    expect(rows[0].testName).toBe('greetings');
    expect(rows[0].correctCount).toBe(4);
    expect(rows[0].totalQuestions).toBe(5);
  });
});
