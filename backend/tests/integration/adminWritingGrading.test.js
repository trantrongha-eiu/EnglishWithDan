// Coverage for backend/routes/admin/writingGrading.js — the "Chấm bài bằng
// AI" (POST .../ai-grade) and "Xác nhận điểm" (PUT .../confirm-grade)
// routes. gradeTaskWithAI (services/writingGradingService) is mocked, same
// pattern as tests/unit/cron/writingAutoGrade.test.js, so this never calls
// the real Gemini API. nodemailer is already globally mocked in
// tests/support/setupTestDb.js, so confirm-grade's fire-and-forget email
// is safe to let run.
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createWritingAttempt } = require('../factories/contentFactory');
const WritingAttempt = require('../../models/WritingAttempt');
const writingGradingService = require('../../services/writingGradingService');

jest.mock('../../services/writingGradingService');

afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/admin/writing-attempts/:id/ai-grade (teacherOnly)', () => {
  test('401 without a token', async () => {
    const res = await request(app).post(`/api/admin/writing-attempts/${new mongoose.Types.ObjectId()}/ai-grade`).send({ taskNum: 1 });
    expect(res.status).toBe(401);
  });

  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post(`/api/admin/writing-attempts/${new mongoose.Types.ObjectId()}/ai-grade`)
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ taskNum: 1 });
    expect(res.status).toBe(403);
  });

  test('404 when the writing attempt does not exist', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post(`/api/admin/writing-attempts/${new mongoose.Types.ObjectId()}/ai-grade`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ taskNum: 1 });
    expect(res.status).toBe(404);
  });

  test('rejects an invalid taskNum with 400', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const attempt = await createWritingAttempt({ userId: student._id });
    const res = await request(app)
      .post(`/api/admin/writing-attempts/${attempt._id}/ai-grade`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ taskNum: 3 });
    expect(res.status).toBe(400);
  });

  test('grades task 1: calls the service with task1 fields and saves aiGrading.task1', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const attempt = await createWritingAttempt({
      userId: student._id,
      extra: {
        task1Snapshot: { prompt: 'Describe the chart', imageUrl: 'https://img/chart.png' },
        task1Answer: 'The chart shows...',
        wordCount1: 160,
      },
    });
    const mockResult = { bandScore: 6.5, ta: { score: 6 }, cc: { score: 7 }, lr: { score: 6 }, gra: { score: 7 } };
    writingGradingService.gradeTaskWithAI.mockResolvedValue(mockResult);

    const res = await request(app)
      .post(`/api/admin/writing-attempts/${attempt._id}/ai-grade`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ taskNum: 1 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.taskNum).toBe(1);
    expect(res.body.result).toEqual(mockResult);
    expect(writingGradingService.gradeTaskWithAI).toHaveBeenCalledWith(
      1, 'Describe the chart', 'The chart shows...', 160, 'https://img/chart.png'
    );

    const saved = await WritingAttempt.findById(attempt._id).lean();
    expect(saved.aiGrading.task1.bandScore).toBe(6.5);
    expect(saved.gradingStatus).toBe('ai_done');
  });

  test('grades task 2: calls the service with task2 fields (no imageUrl) and saves aiGrading.task2', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const attempt = await createWritingAttempt({
      userId: student._id,
      extra: {
        task2Snapshot: { prompt: 'Discuss both views' },
        task2Answer: 'In today\'s society...',
        wordCount2: 280,
      },
    });
    writingGradingService.gradeTaskWithAI.mockResolvedValue({ bandScore: 7 });

    const res = await request(app)
      .post(`/api/admin/writing-attempts/${attempt._id}/ai-grade`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ taskNum: 2 });

    expect(res.status).toBe(200);
    expect(writingGradingService.gradeTaskWithAI).toHaveBeenCalledWith(
      2, 'Discuss both views', 'In today\'s society...', 280, ''
    );
    const saved = await WritingAttempt.findById(attempt._id).lean();
    expect(saved.aiGrading.task2.bandScore).toBe(7);
  });

  test('a Gemini overload error maps to 503', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const attempt = await createWritingAttempt({ userId: student._id, extra: { task1Answer: 'x', wordCount1: 10 } });
    const overloadErr = new Error('The model is overloaded');
    overloadErr.isOverloaded = true;
    writingGradingService.gradeTaskWithAI.mockRejectedValue(overloadErr);

    const res = await request(app)
      .post(`/api/admin/writing-attempts/${attempt._id}/ai-grade`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ taskNum: 1 });
    expect(res.status).toBe(503);
    expect(res.body.message).toBe('The model is overloaded');
  });

  test('a generic grading error maps to 500', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const attempt = await createWritingAttempt({ userId: student._id, extra: { task1Answer: 'x', wordCount1: 10 } });
    writingGradingService.gradeTaskWithAI.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .post(`/api/admin/writing-attempts/${attempt._id}/ai-grade`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ taskNum: 1 });
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/admin/writing-attempts/:id/confirm-grade (teacherOnly)', () => {
  test('401 without a token', async () => {
    const res = await request(app).put(`/api/admin/writing-attempts/${new mongoose.Types.ObjectId()}/confirm-grade`).send({});
    expect(res.status).toBe(401);
  });

  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app)
      .put(`/api/admin/writing-attempts/${new mongoose.Types.ObjectId()}/confirm-grade`)
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({});
    expect(res.status).toBe(403);
  });

  test('a teacher confirms a grade: grading object + gradingStatus + feedbackRead are saved', async () => {
    const teacher = await createTeacher({ username: 'grading_teacher' });
    const student = await createStudent();
    const attempt = await createWritingAttempt({
      userId: student._id,
      extra: { gradingStatus: 'ai_done', feedbackRead: true, aiGrading: { task1: { bandScore: 6 } } },
    });

    const res = await request(app)
      .put(`/api/admin/writing-attempts/${attempt._id}/confirm-grade`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ task1: { bandScore: 6.5 }, task2: { bandScore: 6 }, overallBand: 6.5, adminNote: 'Cố gắng thêm nhé em' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const saved = await WritingAttempt.findById(attempt._id).lean();
    expect(saved.gradingStatus).toBe('confirmed');
    expect(saved.feedbackRead).toBe(false);
    expect(saved.grading.overallBand).toBe(6.5);
    expect(saved.grading.adminNote).toBe('Cố gắng thêm nhé em');
    expect(saved.grading.confirmedBy).toBe('grading_teacher');
    expect(saved.grading.confirmedAt).toBeTruthy();
  });

  // Was a bug (found during the 2026-08-21 test-coverage pass, now fixed):
  // this route didn't check whether findByIdAndUpdate actually found a
  // document, so confirming a grade on a nonexistent attempt id responded
  // 200/success instead of 404, unlike every other admin route in this
  // codebase (attempts.js, courses.js, speaking.js all 404 on a missing id).
  test('confirming a nonexistent attempt id returns 404, not a false success', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .put(`/api/admin/writing-attempts/${new mongoose.Types.ObjectId()}/confirm-grade`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ task1: {}, task2: {}, overallBand: 5 });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
