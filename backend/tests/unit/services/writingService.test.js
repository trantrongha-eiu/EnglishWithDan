// Unit tests for services/writingService.js — this service has no local
// grading logic (writing is graded by AI elsewhere), so tests focus on the
// plain CRUD/persistence business logic: exam start/reuse, attempt snapshot
// building, ownership scoping, upsert behavior, and filter logic.
const mongoose = require('mongoose');
const writingService = require('../../../services/writingService');
const WritingExam = require('../../../models/WritingExam');
const WritingAttempt = require('../../../models/WritingAttempt');
const WritingSample = require('../../../models/WritingSample');
const WritingDraft = require('../../../models/WritingDraft');
const { createStudent, createTeacher, createAdmin } = require('../../factories/userFactory');
const { createWritingTask1, createWritingTask2, createWritingExam } = require('../../factories/contentFactory');

describe('writingService.startExam', () => {
  test('returns no_task1 when no active Task 1 exists', async () => {
    await createWritingTask2();
    const result = await writingService.startExam();
    expect(result.status).toBe('no_task1');
  });

  test('returns no_task2 when no active Task 2 exists', async () => {
    await createWritingTask1();
    const result = await writingService.startExam();
    expect(result.status).toBe('no_task2');
  });

  test('creates a WritingExam on first call and reuses it on subsequent calls', async () => {
    await createWritingTask1();
    await createWritingTask2();

    const first = await writingService.startExam();
    expect(first.status).toBe('ok');
    expect(first.exam.name).toBe('Writing Practice');
    expect(first.exam.duration).toBe(60);

    const second = await writingService.startExam();
    expect(second.status).toBe('ok');
    expect(second.exam._id.toString()).toBe(first.exam._id.toString());

    const examCount = await WritingExam.countDocuments({});
    expect(examCount).toBe(1);
  });
});

describe('writingService.submitExam', () => {
  test('returns null when the exam does not exist', async () => {
    const student = await createStudent();
    const result = await writingService.submitExam(student._id, {
      examId: new mongoose.Types.ObjectId(), task1Id: null, task2Id: null,
    });
    expect(result).toBeNull();
  });

  test('builds an attempt snapshot from the exam/task1/task2 and clamps timeTaken to >= 0', async () => {
    const student = await createStudent();
    const exam = await createWritingExam();
    const task1 = await createWritingTask1({ imageUrl: 'https://img/1.png', prompt: 'Describe the chart.' });
    const task2 = await createWritingTask2({ prompt: 'Discuss both views.' });

    const attemptId = await writingService.submitExam(student._id, {
      examId: exam._id, task1Id: task1._id, task2Id: task2._id,
      task1Answer: 'my task1 answer', task2Answer: 'my task2 answer',
      wordCount1: 160, wordCount2: 270, timeTaken: -50,
    });

    expect(attemptId).toBeTruthy();
    const saved = await WritingAttempt.findById(attemptId).lean();
    expect(saved.examName).toBe(exam.name);
    expect(saved.task1Snapshot.imageUrl).toBe('https://img/1.png');
    expect(saved.task1Snapshot.prompt).toBe('Describe the chart.');
    expect(saved.task2Snapshot.prompt).toBe('Discuss both views.');
    expect(saved.task1Answer).toBe('my task1 answer');
    expect(saved.timeTaken).toBe(0); // negative input clamped to 0
  });
});

describe('writingService.submitPractice', () => {
  test('creates a task1 practice attempt with the right field mapping', async () => {
    const student = await createStudent();
    const task1 = await createWritingTask1({ prompt: 'Practice prompt 1' });

    const attemptId = await writingService.submitPractice(student._id, {
      taskType: 1, taskId: task1._id, answer: 'my answer', wordCount: 155.9,
    });

    const saved = await WritingAttempt.findById(attemptId).lean();
    expect(saved.submissionType).toBe('practice');
    expect(saved.examName).toBe('Luyện Task 1');
    expect(saved.task1Snapshot.prompt).toBe('Practice prompt 1');
    expect(saved.task1Answer).toBe('my answer');
    expect(saved.wordCount1).toBe(155); // floored
  });

  test('creates a task2 practice attempt with the right field mapping', async () => {
    const student = await createStudent();
    const task2 = await createWritingTask2({ prompt: 'Practice prompt 2' });

    const attemptId = await writingService.submitPractice(student._id, {
      taskType: 2, taskId: task2._id, answer: 'my essay', wordCount: 300,
    });

    const saved = await WritingAttempt.findById(attemptId).lean();
    expect(saved.task2Snapshot.prompt).toBe('Practice prompt 2');
    expect(saved.task2Answer).toBe('my essay');
    expect(saved.wordCount2).toBe(300);
  });
});

describe('writingService.findPendingPracticeAttempt', () => {
  test('returns null when the user has no pending practice attempt', async () => {
    const student = await createStudent();
    const result = await writingService.findPendingPracticeAttempt(student._id);
    expect(result).toBeFalsy();
  });

  test('returns the attempt when gradingStatus is pending or ai_done', async () => {
    const student = await createStudent();
    const task1 = await createWritingTask1();
    const attemptId = await writingService.submitPractice(student._id, {
      taskType: 1, taskId: task1._id, answer: 'x', wordCount: 10,
    });

    const found = await writingService.findPendingPracticeAttempt(student._id);
    expect(found).toBeTruthy();
    expect(found._id.toString()).toBe(attemptId.toString());
  });

  test('does not return an attempt once gradingStatus is confirmed', async () => {
    const student = await createStudent();
    await WritingAttempt.create({
      userId: student._id, submissionType: 'practice', examName: 'X',
      gradingStatus: 'confirmed', status: 'completed',
    });

    const found = await writingService.findPendingPracticeAttempt(student._id);
    expect(found).toBeFalsy();
  });
});

describe('writingService.markFeedbackRead', () => {
  test('returns not_found for a missing attempt', async () => {
    const result = await writingService.markFeedbackRead(new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId());
    expect(result.status).toBe('not_found');
  });

  test('returns forbidden for another user\'s attempt', async () => {
    const owner = await createStudent();
    const intruder = await createStudent();
    const attempt = await WritingAttempt.create({
      userId: owner._id, examName: 'X', gradingStatus: 'confirmed',
    });

    const result = await writingService.markFeedbackRead(attempt._id, intruder._id);
    expect(result.status).toBe('forbidden');
  });

  test('only sets feedbackRead when gradingStatus is confirmed', async () => {
    const student = await createStudent();
    const pending = await WritingAttempt.create({ userId: student._id, examName: 'X', gradingStatus: 'pending' });

    const resultPending = await writingService.markFeedbackRead(pending._id, student._id);
    expect(resultPending.status).toBe('ok');
    const reloadedPending = await WritingAttempt.findById(pending._id).lean();
    expect(reloadedPending.feedbackRead).toBe(false);

    const confirmed = await WritingAttempt.create({ userId: student._id, examName: 'X', gradingStatus: 'confirmed' });
    const resultConfirmed = await writingService.markFeedbackRead(confirmed._id, student._id);
    expect(resultConfirmed.status).toBe('ok');
    const reloadedConfirmed = await WritingAttempt.findById(confirmed._id).lean();
    expect(reloadedConfirmed.feedbackRead).toBe(true);
  });
});

describe('writingService.getAttempt', () => {
  test('returns not_found for a missing attempt', async () => {
    const student = await createStudent();
    const result = await writingService.getAttempt(new mongoose.Types.ObjectId(), student);
    expect(result.status).toBe('not_found');
  });

  test('owner can view their own attempt', async () => {
    const student = await createStudent();
    const attempt = await WritingAttempt.create({ userId: student._id, examName: 'X' });
    const result = await writingService.getAttempt(attempt._id, student);
    expect(result.status).toBe('ok');
    expect(result.attempt._id.toString()).toBe(attempt._id.toString());
  });

  test('a different student is forbidden', async () => {
    const owner = await createStudent();
    const other = await createStudent();
    const attempt = await WritingAttempt.create({ userId: owner._id, examName: 'X' });
    const result = await writingService.getAttempt(attempt._id, other);
    expect(result.status).toBe('forbidden');
  });

  test('teacher and admin can view any user\'s attempt', async () => {
    const owner = await createStudent();
    const teacher = await createTeacher();
    const admin = await createAdmin();
    const attempt = await WritingAttempt.create({ userId: owner._id, examName: 'X' });

    const teacherResult = await writingService.getAttempt(attempt._id, teacher);
    expect(teacherResult.status).toBe('ok');
    const adminResult = await writingService.getAttempt(attempt._id, admin);
    expect(adminResult.status).toBe('ok');
  });
});

describe('writingService.getDrafts / saveDraft / deleteDraft', () => {
  test('saveDraft upserts a single draft per exact task, and deleteDraft removes it', async () => {
    const student = await createStudent();
    const task = { _id: 'task-a', prompt: 'p1' };

    await writingService.saveDraft(student._id, { taskType: 1, task, answer: 'first', wordCount: 5, seconds: 10 });
    let drafts = await writingService.getDrafts(student._id);
    expect(drafts).toHaveLength(1);
    expect(drafts[0].answer).toBe('first');

    // Saving again for the same task must upsert (update in place), not
    // create a second document.
    await writingService.saveDraft(student._id, { taskType: 1, task, answer: 'second', wordCount: 8, seconds: 20 });
    drafts = await writingService.getDrafts(student._id);
    expect(drafts).toHaveLength(1);
    expect(drafts[0].answer).toBe('second');

    await writingService.deleteDraft(student._id, 1, 'task-a');
    drafts = await writingService.getDrafts(student._id);
    expect(drafts).toHaveLength(0);
  });

  test('keeps up to 2 drafts per {userId, taskType}, evicting the oldest beyond that', async () => {
    const student = await createStudent();

    await writingService.saveDraft(student._id, { taskType: 1, task: { _id: 'task-1', prompt: 'p1' }, answer: 'first' });
    await writingService.saveDraft(student._id, { taskType: 1, task: { _id: 'task-2', prompt: 'p2' }, answer: 'second' });
    // A different taskType has its own independent cap.
    await writingService.saveDraft(student._id, { taskType: 2, task: { _id: 'task-3', prompt: 'p3' }, answer: 'third' });

    let drafts = await writingService.getDrafts(student._id);
    expect(drafts).toHaveLength(3);

    // A third Task 1 draft pushes the count for taskType 1 over the cap —
    // the oldest Task 1 draft (task-1) should be evicted, task-2 and the
    // new one survive, and the unrelated Task 2 draft is untouched.
    await writingService.saveDraft(student._id, { taskType: 1, task: { _id: 'task-4', prompt: 'p4' }, answer: 'fourth' });
    drafts = await writingService.getDrafts(student._id);
    const taskIds = drafts.map(d => d.taskId).sort();
    expect(taskIds).toEqual(['task-2', 'task-3', 'task-4']);

    const t1Count = await WritingDraft.countDocuments({ userId: student._id, taskType: 1 });
    expect(t1Count).toBe(2);
  });
});

describe('writingService.listSamples', () => {
  async function seedSamples() {
    await WritingSample.create([
      { title: 'S1', quarter: 'Q1 2025', topic: 'Environment', taskType: 'task2', pdfUrl: 'a.pdf' },
      { title: 'S2', quarter: 'Q2 2025', topic: 'Technology', taskType: 'task1', pdfUrl: 'b.pdf' },
      { title: 'S3', quarter: 'Q1 2025', topic: 'Technology', taskType: 'both', pdfUrl: 'c.pdf' },
    ]);
  }

  test('"all" (or omitted) filters return every active sample', async () => {
    await seedSamples();
    const result = await writingService.listSamples({ quarter: 'all', topic: 'all', taskType: 'all' });
    expect(result.length).toBe(3);
  });

  test('filters by quarter', async () => {
    await seedSamples();
    const result = await writingService.listSamples({ quarter: 'Q1 2025' });
    expect(result.length).toBe(2);
    expect(result.every(s => s.quarter === 'Q1 2025')).toBe(true);
  });

  test('filters by topic', async () => {
    await seedSamples();
    const result = await writingService.listSamples({ topic: 'Technology' });
    expect(result.length).toBe(2);
  });

  test('filters by taskType', async () => {
    await seedSamples();
    const result = await writingService.listSamples({ taskType: 'task1' });
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('S2');
  });

  test('combines multiple filters', async () => {
    await seedSamples();
    const result = await writingService.listSamples({ quarter: 'Q1 2025', topic: 'Technology' });
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('S3');
  });
});
