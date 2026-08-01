// Regression coverage for GET /api/admin/recent-attempts including the three
// practice features that used to be invisible from the unified admin
// dashboard/history feed: Task 2 Templates (Cloze/Translation/Chunks/Build/
// Dictation, incl. "Chế độ thi thử"), Essential Grammar, and Vocabulary
// Lessons. Each had its own admin route + page already, but none of the
// three ever showed up in /admin/recent-attempts — the feed Dashboard.jsx,
// StudentHistory.jsx and StudentDetail.jsx all read from — so a teacher had
// to already know to go hunt down the specific lesson/template to see any
// activity for these three.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const Task2TemplateAttempt = require('../../models/Task2TemplateAttempt');
const EssentialGrammarAttemptLog = require('../../models/EssentialGrammarAttemptLog');
const EssentialGrammarLesson = require('../../models/EssentialGrammarLesson');
const VocabularyLessonAttemptLog = require('../../models/VocabularyLessonAttemptLog');
const VocabularyLesson = require('../../models/VocabularyLesson');

describe('GET /api/admin/recent-attempts — Task 2 Templates / Essential Grammar / Vocabulary Lessons', () => {
  test('includes a Task 2 Templates exam-mode attempt', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const token = signTokenFor(teacher);

    await Task2TemplateAttempt.create({
      userId: student._id, templateType: 'type01', templateName: 'Type 01',
      totalItems: 22, correctItems: 20, mode: 'translation', isExam: true, timeTakenSec: 512,
    });

    const res = await request(app)
      .get('/api/admin/recent-attempts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const rows = res.body.attempts.filter(a => a.skill === 'task2-template');
    expect(rows).toHaveLength(1);
    expect(rows[0].correctCount).toBe(20);
    expect(rows[0].totalQuestions).toBe(22);
    expect(rows[0].testMeta).toContain('Thi thử');
  });

  test('includes an Essential Grammar attempt with the lesson title resolved', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const token = signTokenFor(teacher);
    const lesson = await EssentialGrammarLesson.create({
      category: 'tenses', lessonKey: 'present-simple', title: 'Present Simple',
    });
    await EssentialGrammarAttemptLog.create({
      userId: student._id, lessonId: lesson._id, score: 80, correct: 8, wrong: 2, total: 10, timeSpent: 120,
    });

    const res = await request(app)
      .get('/api/admin/recent-attempts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const rows = res.body.attempts.filter(a => a.skill === 'essential-grammar');
    expect(rows).toHaveLength(1);
    expect(rows[0].testName).toBe('Present Simple');
    expect(rows[0].correctCount).toBe(8);
    expect(rows[0].totalQuestions).toBe(10);
  });

  test('includes a Vocabulary Lesson attempt with the lesson title resolved', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const token = signTokenFor(teacher);
    const lesson = await VocabularyLesson.create({ title: 'Week 1 Vocabulary', createdBy: teacher._id });
    await VocabularyLessonAttemptLog.create({
      userId: student._id, lessonId: lesson._id, score: 90, correct: 9, wrong: 1, total: 10, timeSpent: 60,
    });

    const res = await request(app)
      .get('/api/admin/recent-attempts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const rows = res.body.attempts.filter(a => a.skill === 'vocabulary-lesson');
    expect(rows).toHaveLength(1);
    expect(rows[0].testName).toBe('Week 1 Vocabulary');
    expect(rows[0].correctCount).toBe(9);
    expect(rows[0].totalQuestions).toBe(10);
  });

  test('?userId= filter scopes all three new collections to one student', async () => {
    const teacher  = await createTeacher();
    const studentA = await createStudent();
    const studentB = await createStudent();
    const token = signTokenFor(teacher);

    await Task2TemplateAttempt.create({
      userId: studentA._id, templateType: 'type01', templateName: 'Type 01', totalItems: 5, correctItems: 5,
    });
    await Task2TemplateAttempt.create({
      userId: studentB._id, templateType: 'type01', templateName: 'Type 01', totalItems: 5, correctItems: 3,
    });

    const res = await request(app)
      .get(`/api/admin/recent-attempts?userId=${studentA._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const rows = res.body.attempts.filter(a => a.skill === 'task2-template');
    expect(rows).toHaveLength(1);
    expect(rows[0].correctCount).toBe(5);
  });
});
