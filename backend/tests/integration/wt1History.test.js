// "Lịch sử luyện tập" for the WT1-stack courses (Task 1 / Task 2 / Speaking):
// per-attempt review (student + admin), course-wide history list, and lesson
// progress surviving the 3-month WT1Submission TTL.
jest.mock('../../services/geminiService');

const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const WT1Course = require('../../models/WT1Course');
const WT1Module = require('../../models/WT1Module');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Exercise = require('../../models/WT1Exercise');
const WT1Submission = require('../../models/WT1Submission');
const WT1Progress = require('../../models/WT1Progress');

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

async function seed() {
  const cc = 'IELTS-W-T1';
  await WT1Course.findOneAndUpdate({ code: cc }, { code: cc, title: 'IELTS Writing Task 1' }, { upsert: true });
  await WT1Module.findOneAndUpdate({ code: 'T1-M1' }, { code: 'T1-M1', courseCode: cc, order: 1, title: 'M1' }, { upsert: true });
  await WT1Lesson.findOneAndUpdate({ code: 'T1-L02' }, {
    code: 'T1-L02', moduleCode: 'T1-M1', order: 2, title: 'Buổi 2', published: true,
    gate: { minObjectiveScorePercent: 70, minWritingSubmissions: 1 },
  }, { upsert: true });
  await WT1Lesson.findOneAndUpdate({ code: 'T1-L03' }, {
    code: 'T1-L03', moduleCode: 'T1-M1', order: 3, title: 'Buổi 3', published: true,
    gate: { minObjectiveScorePercent: 70, minWritingSubmissions: 0 },
  }, { upsert: true });
  await WT1Exercise.deleteMany({ lessonCode: { $in: ['T1-L02', 'T1-L03'] } });
  await WT1Exercise.create([
    {
      code: 'H-MCQ', lessonCode: 'T1-L02', order: 1, type: 'mcq', title: 'Chọn đáp án', published: true, autoGrade: true,
      items: [
        { id: 'q1', prompt: 'Pick one', options: [{ id: 'A', text: 'wrong' }, { id: 'B', text: 'right' }], answer: 'B', explanation: 'B is right' },
        { id: 'q2', prompt: 'Pick again', options: [{ id: 'A', text: 'right' }, { id: 'B', text: 'wrong' }], answer: 'A' },
      ],
    },
    {
      code: 'H-SW', lessonCode: 'T1-L02', order: 2, type: 'sentence_writing', title: 'Viết câu', published: true, autoGrade: false,
      responseSlots: 1, rubric: { minWords: 5, targetStructures: ['The number of'], mustUse: 1, sampleAnswer: 'The number of cars rose.' },
    },
    {
      code: 'H-MCQ3', lessonCode: 'T1-L03', order: 1, type: 'mcq', title: 'MCQ L03', published: true, autoGrade: true,
      items: [{ id: 'q1', prompt: 'Pick', options: [{ id: 'A', text: 'x' }, { id: 'B', text: 'y' }], answer: 'B' }],
    },
  ]);
}

async function passLesson02(u) {
  await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: 'H-MCQ', answers: { q1: 'B', q2: 'A' } });
  await request(app).post('/api/wt1/submit-writing').set(bearer(u)).send({ exerciseCode: 'H-SW', responses: ['The number of cars rose sharply in 2005.'] });
}

beforeEach(seed);

describe('attempt review (student)', () => {
  test('objective attempt replays answers, verdicts and the answer key', async () => {
    const u = await createPremiumStudent();
    await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: 'H-MCQ', answers: { q1: 'B', q2: 'B' } });
    const sub = await WT1Submission.findOne({ userId: u._id }).lean();
    expect(sub.results.map((r) => r.correct)).toEqual([true, false]);

    const res = await request(app).get(`/api/wt1/attempt/${sub._id}`).set(bearer(u));
    expect(res.status).toBe(200);
    const r = res.body.review;
    expect(r.kind).toBe('objective');
    expect(r.lessonTitle).toBe('Buổi 2');
    expect(r.correctCount).toBe(1);
    expect(r.items[0]).toMatchObject({ prompt: 'Pick one', answer: 'B. right', correct: true, explanation: 'B is right' });
    expect(r.items[1]).toMatchObject({ answer: 'B. wrong', correct: false, correctAnswer: 'A. right' });
  });

  test('writing attempt keeps the text, rubric feedback and the model answer', async () => {
    const u = await createPremiumStudent();
    await request(app).post('/api/wt1/submit-writing').set(bearer(u)).send({ exerciseCode: 'H-SW', responses: ['The number of cars rose sharply in 2005.'] });
    const sub = await WT1Submission.findOne({ userId: u._id }).lean();
    const res = await request(app).get(`/api/wt1/attempt/${sub._id}`).set(bearer(u));
    const r = res.body.review;
    expect(r.kind).toBe('writing');
    expect(r.responses).toEqual(['The number of cars rose sharply in 2005.']);
    expect(r.local.checklist.length).toBeGreaterThan(0);
    expect(r.sampleAnswer).toBe('The number of cars rose.');
  });

  test('legacy objective rows (no saved verdicts) are re-graded for review', async () => {
    const u = await createPremiumStudent();
    const sub = await WT1Submission.create({
      userId: u._id, exerciseCode: 'H-MCQ', lessonCode: 'T1-L02', attempt: 1, status: 'graded',
      answers: { q1: 'A', q2: 'A' }, score: 50, maxScore: 2,
    });
    const res = await request(app).get(`/api/wt1/attempt/${sub._id}`).set(bearer(u));
    expect(res.body.review.items.map((i) => i.correct)).toEqual([false, true]);
  });
});

describe('GET /wt1/history (course-wide)', () => {
  test('lists every attempt in the course, newest first, with titles', async () => {
    const u = await createPremiumStudent();
    await passLesson02(u);
    const res = await request(app).get('/api/wt1/history?course=IELTS-W-T1').set(bearer(u));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.rows.map((r) => r.exerciseTitle)).toEqual(['Viết câu', 'Chọn đáp án']);
    expect(res.body.rows[0]).toMatchObject({ lessonTitle: 'Buổi 2', attempt: 1 });
  });

  test("never shows another student's attempts or other courses", async () => {
    const u = await createPremiumStudent();
    const other = await createPremiumStudent();
    await passLesson02(other);
    const res = await request(app).get('/api/wt1/history?course=IELTS-W-T1').set(bearer(u));
    expect(res.body.rows).toEqual([]);
    const spk = await request(app).get('/api/wt1/history?course=IELTS-SPEAKING').set(bearer(other));
    expect(spk.body.rows).toEqual([]);
  });
});

describe('admin review', () => {
  test('teacher can open any student attempt; a student cannot', async () => {
    const u = await createPremiumStudent();
    await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: 'H-MCQ', answers: { q1: 'B', q2: 'A' } });
    const sub = await WT1Submission.findOne({ userId: u._id }).lean();

    const t = await createTeacher();
    const res = await request(app).get(`/api/admin/wt1/submissions/${sub._id}`).set(bearer(t));
    expect(res.status).toBe(200);
    expect(res.body.student.username).toBe(u.username);
    expect(res.body.review.items).toHaveLength(2);

    const s = await createStudent();
    const denied = await request(app).get(`/api/admin/wt1/submissions/${sub._id}`).set(bearer(s));
    expect(denied.status).toBe(403);
  });
});

describe('3-month retention', () => {
  test('WT1Submission has a 90-day TTL on createdAt', async () => {
    await WT1Submission.syncIndexes();
    const idx = (await WT1Submission.collection.indexes()).find((i) => i.expireAfterSeconds !== undefined);
    expect(idx.key).toEqual({ createdAt: 1 });
    expect(idx.expireAfterSeconds).toBe(90 * 24 * 60 * 60);
  });

  test('progress survives the history being deleted', async () => {
    const u = await createPremiumStudent();
    await passLesson02(u);
    await WT1Submission.deleteMany({ userId: u._id }); // what the TTL does after 3 months

    const ov = await request(app).get('/api/wt1/overview').set(bearer(u));
    const lessons = ov.body.modules.find((m) => m.code === 'T1-M1').lessons;
    expect(lessons.find((l) => l.code === 'T1-L02')).toMatchObject({ done: true, scorePercent: 100 });
    expect(lessons.find((l) => l.code === 'T1-L03').unlocked).toBe(true);

    const lesson = await request(app).get('/api/wt1/lesson/T1-L02').set(bearer(u));
    expect(lesson.body.exercises.every((e) => e.lastAttempt)).toBe(true);

    // A new (worse) attempt after expiry doesn't drop the durable best.
    await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: 'H-MCQ', answers: { q1: 'A', q2: 'B' } });
    const prog = await WT1Progress.findOne({ userId: u._id, lessonCode: 'T1-L02' }).lean();
    expect(prog.exerciseBest['H-MCQ']).toBe(100);
    expect(prog.objectiveScorePercent).toBe(100);
    expect(prog.unlocked).toBe(true);
  });

  test('legacy progress rows (before exerciseBest) still keep lessons open', async () => {
    const u = await createPremiumStudent();
    await WT1Progress.create({
      userId: u._id, courseCode: 'IELTS-W-T1', lessonCode: 'T1-L02',
      completedExercises: ['H-MCQ', 'H-SW'], objectiveScorePercent: 80, writingSubmissions: 1, unlocked: true,
    });
    const ov = await request(app).get('/api/wt1/overview').set(bearer(u));
    const lessons = ov.body.modules.find((m) => m.code === 'T1-M1').lessons;
    expect(lessons.find((l) => l.code === 'T1-L02').done).toBe(true);
    expect(lessons.find((l) => l.code === 'T1-L03').unlocked).toBe(true);
  });
});
