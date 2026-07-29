// Unit tests for the Essential Grammar attempt-tracking + admin analytics
// added for parity with Reading/Listening/Writing/Vocabulary (audit
// finding — this content type previously had zero backend footprint).
const svc = require('../../../services/essentialGrammarService');
const EssentialGrammarAttempt = require('../../../models/EssentialGrammarAttempt');
const EssentialGrammarAttemptLog = require('../../../models/EssentialGrammarAttemptLog');
const { createStudent } = require('../../factories/userFactory');
const { createEssentialGrammarLesson } = require('../../factories/contentFactory');

describe('submitAttempt / getAttempt', () => {
  test('first submit creates an aggregate row with correct score/completed/bestScore/attemptCount', async () => {
    const student = await createStudent();
    const lesson = await createEssentialGrammarLesson();

    const attempt = await svc.submitAttempt(student._id, lesson._id, { correctCount: 8, totalCount: 10, timeSpent: 30, wrongQuestions: [] });

    expect(attempt.score).toBe(80);
    expect(attempt.bestScore).toBe(80);
    expect(attempt.completed).toBe(true);
    expect(attempt.attemptCount).toBe(1);

    const found = await svc.getAttempt(student._id, lesson._id);
    expect(found.score).toBe(80);
  });

  test('a lower second score does not reduce bestScore, but score and attemptCount update', async () => {
    const student = await createStudent();
    const lesson = await createEssentialGrammarLesson();

    await svc.submitAttempt(student._id, lesson._id, { correctCount: 9, totalCount: 10, timeSpent: 20, wrongQuestions: [] });
    const second = await svc.submitAttempt(student._id, lesson._id, { correctCount: 5, totalCount: 10, timeSpent: 15, wrongQuestions: ['Q1'] });

    expect(second.score).toBe(50);
    expect(second.bestScore).toBe(90);
    expect(second.attemptCount).toBe(2);
    expect(second.timeSpent).toBe(35);
  });

  test('correctCount is clamped to [0, totalCount] even if the client sends an out-of-range value', async () => {
    const student = await createStudent();
    const lesson = await createEssentialGrammarLesson();

    const attempt = await svc.submitAttempt(student._id, lesson._id, { correctCount: 999, totalCount: 10, timeSpent: 5, wrongQuestions: [] });
    expect(attempt.score).toBe(100);

    const log = await EssentialGrammarAttemptLog.findOne({ userId: student._id, lessonId: lesson._id });
    expect(log.correct).toBe(10);
    expect(log.wrong).toBe(0);
  });

  test('two different students on the same lesson get independent rows', async () => {
    const alice = await createStudent();
    const bob = await createStudent();
    const lesson = await createEssentialGrammarLesson();

    await svc.submitAttempt(alice._id, lesson._id, { correctCount: 10, totalCount: 10, timeSpent: 10, wrongQuestions: [] });
    await svc.submitAttempt(bob._id, lesson._id, { correctCount: 2, totalCount: 10, timeSpent: 10, wrongQuestions: [] });

    const aliceAttempt = await svc.getAttempt(alice._id, lesson._id);
    const bobAttempt = await svc.getAttempt(bob._id, lesson._id);
    expect(aliceAttempt.score).toBe(100);
    expect(bobAttempt.score).toBe(20);

    const count = await EssentialGrammarAttempt.countDocuments({ lessonId: lesson._id });
    expect(count).toBe(2);
  });

  test('no attempt yet returns null', async () => {
    const student = await createStudent();
    const lesson = await createEssentialGrammarLesson();
    expect(await svc.getAttempt(student._id, lesson._id)).toBeNull();
  });
});

describe('getAttemptHistory', () => {
  test('returns newest-first, scoped to (userId, lessonId), respects limit', async () => {
    const student = await createStudent();
    const other = await createStudent();
    const lesson = await createEssentialGrammarLesson();
    const otherLesson = await createEssentialGrammarLesson({ lessonKey: 'other-lesson' });

    await svc.submitAttempt(student._id, lesson._id, { correctCount: 1, totalCount: 10, timeSpent: 1, wrongQuestions: [] });
    await svc.submitAttempt(student._id, lesson._id, { correctCount: 2, totalCount: 10, timeSpent: 1, wrongQuestions: [] });
    await svc.submitAttempt(student._id, lesson._id, { correctCount: 3, totalCount: 10, timeSpent: 1, wrongQuestions: [] });
    await svc.submitAttempt(other._id, lesson._id, { correctCount: 9, totalCount: 10, timeSpent: 1, wrongQuestions: [] });
    await svc.submitAttempt(student._id, otherLesson._id, { correctCount: 9, totalCount: 10, timeSpent: 1, wrongQuestions: [] });

    const history = await svc.getAttemptHistory(student._id, lesson._id, 2);
    expect(history).toHaveLength(2);
    expect(history[0].score).toBe(30);
    expect(history[1].score).toBe(20);
  });
});

describe('getLessonStudentBreakdown', () => {
  test('returns populated username/firstName/lastName + score fields', async () => {
    const student = await createStudent({ username: 'grammar_student', firstName: 'An', lastName: 'Nguyen' });
    const lesson = await createEssentialGrammarLesson();
    await svc.submitAttempt(student._id, lesson._id, { correctCount: 7, totalCount: 10, timeSpent: 60, wrongQuestions: [] });

    const rows = await svc.getLessonStudentBreakdown(lesson._id);
    expect(rows).toHaveLength(1);
    expect(rows[0].username).toBe('grammar_student');
    expect(rows[0].firstName).toBe('An');
    expect(rows[0].score).toBe(70);
  });

  test('returns [] for a lesson with no attempts', async () => {
    const lesson = await createEssentialGrammarLesson();
    expect(await svc.getLessonStudentBreakdown(lesson._id)).toEqual([]);
  });
});

describe('getMostMissedQuestions', () => {
  test('counts case-insensitively and returns the most-missed question first', async () => {
    const s1 = await createStudent();
    const s2 = await createStudent();
    const lesson = await createEssentialGrammarLesson();

    await svc.submitAttempt(s1._id, lesson._id, { correctCount: 8, totalCount: 10, timeSpent: 1, wrongQuestions: ['What is the answer?'] });
    await svc.submitAttempt(s2._id, lesson._id, { correctCount: 8, totalCount: 10, timeSpent: 1, wrongQuestions: ['what is the answer?'] });

    const questions = await svc.getMostMissedQuestions(lesson._id, 10);
    // $group's $first picks whichever doc MongoDB processes first within the
    // bucket — not guaranteed to be insertion order — so only the count
    // (the case-insensitive dedup itself) is asserted, not which exact-case
    // variant becomes the display sample.
    expect(questions[0].question.toLowerCase()).toBe('what is the answer?');
    expect(questions[0].count).toBe(2);
  });

  test('returns [] when no wrongQuestions exist', async () => {
    const lesson = await createEssentialGrammarLesson();
    expect(await svc.getMostMissedQuestions(lesson._id)).toEqual([]);
  });
});

describe('listAdminLessons', () => {
  test('computes completedCount/averageScore/lastActivity from attempt rows', async () => {
    const s1 = await createStudent();
    const s2 = await createStudent();
    const lesson = await createEssentialGrammarLesson();

    await svc.submitAttempt(s1._id, lesson._id, { correctCount: 8, totalCount: 10, timeSpent: 1, wrongQuestions: [] });
    await svc.submitAttempt(s2._id, lesson._id, { correctCount: 6, totalCount: 10, timeSpent: 1, wrongQuestions: [] });

    const lessons = await svc.listAdminLessons();
    const row = lessons.find(l => String(l._id) === String(lesson._id));
    expect(row.completedCount).toBe(2);
    expect(row.averageScore).toBe(70);
    expect(row.lastActivity).not.toBeNull();
  });

  test('averageScore is null when a lesson has zero attempts', async () => {
    const lesson = await createEssentialGrammarLesson();
    const lessons = await svc.listAdminLessons();
    const row = lessons.find(l => String(l._id) === String(lesson._id));
    expect(row.completedCount).toBe(0);
    expect(row.averageScore).toBeNull();
  });
});

describe('updateLessonMeta', () => {
  test('updates title/summary/icon/orderIndex/isActive', async () => {
    const lesson = await createEssentialGrammarLesson();
    const updated = await svc.updateLessonMeta(lesson._id, {
      title: 'New Title', summary: 'New summary', icon: '📗', orderIndex: 5, isActive: false,
    });
    expect(updated.title).toBe('New Title');
    expect(updated.summary).toBe('New summary');
    expect(updated.icon).toBe('📗');
    expect(updated.orderIndex).toBe(5);
    expect(updated.isActive).toBe(false);
  });

  test('rejects an empty title', async () => {
    const lesson = await createEssentialGrammarLesson();
    await expect(svc.updateLessonMeta(lesson._id, { title: '   ' })).rejects.toThrow('Thiếu "title"');
  });

  test('leaves category/lessonKey/blocks untouched even if present in payload', async () => {
    const lesson = await createEssentialGrammarLesson({ category: 'Tenses', lessonKey: 'present-simple' });
    const updated = await svc.updateLessonMeta(lesson._id, {
      title: 'Still allowed', category: 'Conditionals', lessonKey: 'hacked-key', blocks: [],
    });
    expect(updated.category).toBe('Tenses');
    expect(updated.lessonKey).toBe('present-simple');
    expect(updated.blocks.length).toBeGreaterThan(0);
  });

  test('returns null for a nonexistent id', async () => {
    const mongoose = require('mongoose');
    expect(await svc.updateLessonMeta(new mongoose.Types.ObjectId(), { title: 'x' })).toBeNull();
  });
});

describe('deleteLesson', () => {
  test('cascades EssentialGrammarAttempt/AttemptLog deletion', async () => {
    const student = await createStudent();
    const lesson = await createEssentialGrammarLesson();
    await svc.submitAttempt(student._id, lesson._id, { correctCount: 5, totalCount: 10, timeSpent: 1, wrongQuestions: [] });

    await svc.deleteLesson(lesson._id);

    expect(await EssentialGrammarAttempt.countDocuments({ lessonId: lesson._id })).toBe(0);
    expect(await EssentialGrammarAttemptLog.countDocuments({ lessonId: lesson._id })).toBe(0);
  });

  test('returns null for a nonexistent id', async () => {
    const mongoose = require('mongoose');
    expect(await svc.deleteLesson(new mongoose.Types.ObjectId())).toBeNull();
  });
});

describe('exportLessonStudentsCsv', () => {
  test('produces a header + one row per student, neutralizing a formula-injection attempt in the name', async () => {
    const student = await createStudent({ firstName: '=cmd', lastName: 'Evil' });
    const lesson = await createEssentialGrammarLesson();
    await svc.submitAttempt(student._id, lesson._id, { correctCount: 7, totalCount: 10, timeSpent: 1, wrongQuestions: [] });

    const { title, csv } = await svc.exportLessonStudentsCsv(lesson._id);
    expect(title).toBe(lesson.title);
    const lines = csv.split('\r\n');
    expect(lines[0]).toContain('Student');
    expect(lines[1]).toContain("'=cmd Evil"); // leading ' neutralizes the formula
  });
});
