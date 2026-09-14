// Regression coverage for GET /api/admin/recent-attempts's WT1Submission
// rows — the collection shared by 4 different courses (Task 1 Writing,
// Task 2 Writing, Speaking, Noun Phrase). Two real bugs reported from the
// admin dashboard:
//   1. Every course showed the same generic "Khoá học (T1/T2)" badge, so a
//      Speaking-course submission looked like it belonged to Task 1/2.
//      Fixed by deriving `skill` from the lessonCode prefix (T1-/T2-/SPK-/NP-).
//   2. `correctCount` was mapped from WT1Submission.score, which is a 0-100
//      PERCENTAGE (see wt1GradingService.gradeObjective), not a raw count —
//      dividing it by maxScore (item count) rendered nonsense like "100/5"
//      or "60/5". Fixed by persisting the true correctCount separately and
//      reading that instead.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const WT1Submission = require('../../models/WT1Submission');

describe('GET /api/admin/recent-attempts — WT1-stack courses (Task 1 / Task 2 / Speaking / Noun Phrase)', () => {
  test('an objective (quiz-type) submission reports the true correctCount, not the percentage score', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const token = signTokenFor(teacher);

    // 3/5 correct → score (percentage) is 60, which must NOT leak into
    // correctCount/totalQuestions.
    await WT1Submission.create({
      userId: student._id, exerciseCode: 'T1-L01-E01', lessonCode: 'T1-L01',
      answers: {}, score: 60, correctCount: 3, maxScore: 5, status: 'graded',
    });

    const res = await request(app)
      .get('/api/admin/recent-attempts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const rows = res.body.attempts.filter(a => a.skill === 'wt1-t1');
    expect(rows).toHaveLength(1);
    expect(rows[0].correctCount).toBe(3);
    expect(rows[0].totalQuestions).toBe(5);
  });

  test('lessonCode prefixes map to distinct skills — Speaking is never labelled as the T1/T2 course', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const token = signTokenFor(teacher);

    await WT1Submission.create({
      userId: student._id, exerciseCode: 'T2-L01-E01', lessonCode: 'T2-L01',
      answers: {}, score: 100, correctCount: 4, maxScore: 4, status: 'graded',
    });
    await WT1Submission.create({
      userId: student._id, exerciseCode: 'NP-L01-E01', lessonCode: 'NP-L01',
      answers: {}, score: 100, correctCount: 5, maxScore: 5, status: 'graded',
    });
    // AI-graded speaking_response submission: no score/maxScore/correctCount,
    // only aiFeedback.bandEstimate — the shape wt1.controller.submitSpeaking
    // actually records.
    await WT1Submission.create({
      userId: student._id, exerciseCode: 'SPK-P1-L01-E01', lessonCode: 'SPK-P1-L01',
      responses: ['My answer.'],
      aiFeedback: { model: 'gemini', scores: { fluency: 5, vocabulary: 5, grammar: 5, pronunciation: 5 }, bandEstimate: 4.5, feedbackVi: '' },
      status: 'graded',
    });

    const res = await request(app)
      .get('/api/admin/recent-attempts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const bySkill = skill => res.body.attempts.filter(a => a.skill === skill);

    expect(bySkill('wt1-t2')).toHaveLength(1);
    expect(bySkill('wt1-noun-phrase')).toHaveLength(1);

    const speakingRows = bySkill('wt1-speaking');
    expect(speakingRows).toHaveLength(1);
    expect(speakingRows[0].bandScore).toBe(4.5);
    // No objective score exists for an AI-graded speaking submission — must
    // show '–' (null), never a stray percentage/item-count pairing.
    expect(speakingRows[0].correctCount).toBeNull();
    expect(speakingRows[0].totalQuestions).toBeNull();

    // None of these three ever fall back to the generic label.
    expect(bySkill('wt1-course')).toHaveLength(0);
  });

  test('an unrecognised lessonCode prefix falls back to the generic "wt1-course" skill', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const token = signTokenFor(teacher);

    await WT1Submission.create({
      userId: student._id, exerciseCode: 'LEGACY-E01', lessonCode: 'LEGACY-L01',
      answers: {}, score: 100, correctCount: 2, maxScore: 2, status: 'graded',
    });

    const res = await request(app)
      .get('/api/admin/recent-attempts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const rows = res.body.attempts.filter(a => a.skill === 'wt1-course');
    expect(rows).toHaveLength(1);
    expect(rows[0].correctCount).toBe(2);
    expect(rows[0].totalQuestions).toBe(2);
  });
});
