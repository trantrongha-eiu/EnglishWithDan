// Coverage for backend/routes/admin/attempts.js — the 9 "delete one exam
// attempt" routes (Reading/Listening/Writing exam + 4 practice-attempt
// collections + Task1/Task2 + Speaking). Every route here is DELETE-only,
// so the teacherOnly gate's "teachers can't DELETE" rule (_shared.js) means
// a teacher is blocked on literally every route in this file — that's the
// actual role gate worth proving, not just "teacher allowed / admin allowed"
// like GET-heavy admin routes.
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const {
  createCompletedTestAttempt, createListeningAttempt, createWritingAttempt,
  createReadingPracticeAttempt, createSpeakingAttempt,
} = require('../factories/contentFactory');

const TestAttempt = require('../../models/TestAttempt');
const ListeningAttempt = require('../../models/ListeningAttempt');
const WritingAttempt = require('../../models/WritingAttempt');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');
const ReadingPracticeAttempt = require('../../models/ReadingPracticeAttempt');
const WritingPracticeAttempt = require('../../models/WritingPracticeAttempt');
const Task1Attempt = require('../../models/Task1Attempt');
const Task2Attempt = require('../../models/Task2Attempt');
const SpeakingAttempt = require('../../models/SpeakingAttempt');

describe('DELETE /api/admin/attempts/:id — shared role gate (representative of all 9 routes)', () => {
  test('401 without a token', async () => {
    const res = await request(app).delete(`/api/admin/attempts/${new mongoose.Types.ObjectId()}`);
    expect(res.status).toBe(401);
  });

  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const res = await request(app)
      .delete(`/api/admin/attempts/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('a teacher is blocked with 403 — teacherOnly blocks DELETE even though this route only has DELETE', async () => {
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);
    const attempt = await createCompletedTestAttempt({ userId: teacher._id });
    const res = await request(app)
      .delete(`/api/admin/attempts/${attempt._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    // The attempt must still exist — the teacher's blocked request had no effect.
    expect(await TestAttempt.findById(attempt._id)).not.toBeNull();
  });

  test('an invalid ObjectId hits the catch block and returns 500', async () => {
    const admin = await createAdmin();
    const token = signTokenFor(admin);
    const res = await request(app)
      .delete('/api/admin/attempts/not-a-valid-object-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// Table-driven: each of the 9 routes shares the identical success/not-found
// shape (findByIdAndDelete → 200+message, or null → 404), so this proves
// each specific route/model wiring is correct without repeating boilerplate.
const routes = [
  {
    name: 'Reading exam attempt', path: 'attempts', model: TestAttempt, message: 'Đã xóa bài thi Reading',
    create: userId => createCompletedTestAttempt({ userId }),
  },
  {
    name: 'Listening exam attempt', path: 'listening-attempts', model: ListeningAttempt, message: 'Đã xóa bài thi Listening',
    create: userId => createListeningAttempt({ userId }),
  },
  {
    name: 'Writing exam attempt', path: 'writing-attempts', model: WritingAttempt, message: 'Đã xóa bài nộp Writing',
    create: userId => createWritingAttempt({ userId }),
  },
  {
    name: 'Listening practice attempt', path: 'listening-practice-attempts', model: ListeningPracticeAttempt, message: 'Đã xóa bài luyện Listening',
    create: userId => ListeningPracticeAttempt.create({ userId, sectionId: new mongoose.Types.ObjectId() }),
  },
  {
    name: 'Reading practice attempt', path: 'reading-practice-attempts', model: ReadingPracticeAttempt, message: 'Đã xóa bài luyện Reading',
    create: userId => createReadingPracticeAttempt({ userId }),
  },
  {
    name: 'Writing practice attempt', path: 'writing-practice-attempts', model: WritingPracticeAttempt, message: 'Đã xóa bài luyện Writing',
    create: userId => WritingPracticeAttempt.create({ studentId: userId, level: 'beginner', topic: 'greetings', totalItems: 5, correctItems: 3 }),
  },
  {
    name: 'Task 1 attempt', path: 'task1-attempts', model: Task1Attempt, message: 'Đã xóa bài Task 1',
    create: userId => Task1Attempt.create({ userId, exerciseId: new mongoose.Types.ObjectId(), userAnswer: 'answer' }),
  },
  {
    name: 'Task 2 attempt', path: 'task2-attempts', model: Task2Attempt, message: 'Đã xóa bài Task 2',
    create: userId => Task2Attempt.create({ userId, totalQuestions: 5, correctCount: 3 }),
  },
  {
    name: 'Speaking attempt', path: 'speaking-attempts', model: SpeakingAttempt, message: 'Đã xóa bài Speaking',
    create: userId => createSpeakingAttempt({ userId }),
  },
];

describe.each(routes)('DELETE /api/admin/$path/:id — $name', ({ path, model, message, create }) => {
  test('an admin deletes the attempt and it is actually gone from the DB', async () => {
    const admin = await createAdmin();
    const student = await createStudent();
    const token = signTokenFor(admin);
    const doc = await create(student._id);

    const res = await request(app)
      .delete(`/api/admin/${path}/${doc._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(message);
    expect(await model.findById(doc._id)).toBeNull();
  });

  test('404 when the attempt does not exist', async () => {
    const admin = await createAdmin();
    const token = signTokenFor(admin);
    const res = await request(app)
      .delete(`/api/admin/${path}/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
