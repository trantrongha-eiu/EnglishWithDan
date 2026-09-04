// Integration tests for the WT1 course API (routes/wt1.js).
jest.mock('../../services/geminiService');

const request = require('supertest');
const app = require('../../app');
const geminiService = require('../../services/geminiService');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const WT1Course = require('../../models/WT1Course');
const WT1Module = require('../../models/WT1Module');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Exercise = require('../../models/WT1Exercise');
const WT1Submission = require('../../models/WT1Submission');

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
let _n = 0;

async function seedCourse() {
  _n += 1;
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
      code: 'MCQ1', lessonCode: 'T1-L02', order: 1, type: 'mcq', title: 'MCQ', published: true, autoGrade: true,
      items: [{ id: 'q1', prompt: 'Pick', options: [{ id: 'A', text: 'wrong' }, { id: 'B', text: 'right' }], answer: 'B', explanation: 'B is right' }],
    },
    {
      code: 'GAP1', lessonCode: 'T1-L02', order: 2, type: 'gap_fill', title: 'Gap', published: true, autoGrade: true,
      items: [{ id: 'q1', prompt: 'The ____ of water was high.', blanks: [{ accept: ['amount'] }], explanation: 'uncountable' }],
    },
    {
      code: 'CAT1', lessonCode: 'T1-L02', order: 3, type: 'categorize', title: 'Cat', published: true, autoGrade: true,
      categories: [{ id: 'up', label: 'Up' }, { id: 'down', label: 'Down' }],
      items: [{ id: 'q1', text: 'rise', category: 'up' }, { id: 'q2', text: 'fall', category: 'down' }],
    },
    {
      code: 'ORD1', lessonCode: 'T1-L02', order: 4, type: 'ordering', title: 'Ord', published: true, autoGrade: true,
      items: [{ id: 'q1', tokens: ['a', 'b', 'c'], answer: ['a', 'b', 'c'] }],
    },
    {
      code: 'MATCH1', lessonCode: 'T1-L02', order: 5, type: 'matching', title: 'Match', published: true, autoGrade: true,
      items: [{ id: 'q1', left: 'L1', right: 'R1' }, { id: 'q2', left: 'L2', right: 'R2' }],
    },
    {
      code: 'ST1', lessonCode: 'T1-L02', order: 6, type: 'sentence_transform', title: 'ST', published: true, autoGrade: false,
      items: [{ id: 'q1', prompt: 'rewrite', sampleAnswers: ['The number of cars was five million.'] }],
    },
    {
      code: 'SW1', lessonCode: 'T1-L02', order: 7, type: 'sentence_writing', title: 'SW', published: true, autoGrade: false,
      responseSlots: 2, rubric: { minWords: 5, targetStructures: ['The number of', 'There were'], mustUse: 1, checklist: ['x'] },
    },
    {
      code: 'PW1', lessonCode: 'T1-L02', order: 8, type: 'paragraph_writing', title: 'PW', published: true, autoGrade: false,
      instruction: 'Describe the chart.', stimulus: { kind: 'image', imageUrl: 'https://example.com/x.png' },
      rubric: { minWords: 40, checklist: ['use comparison'], sampleAnswer: 'hidden sample' },
    },
  ]);
}

beforeEach(seedCourse);

describe('gate + auth', () => {
  test('unauth → 401', async () => {
    expect((await request(app).get('/api/wt1/overview')).status).toBe(401);
  });
  test('free student past trial → 403 PLAN_REQUIRED', async () => {
    const u = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 864e5) } });
    const res = await request(app).get('/api/wt1/overview').set(bearer(u));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });
  test('premium student gets the module/lesson tree', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/wt1/overview').set(bearer(u));
    expect(res.status).toBe(200);
    const m1 = res.body.modules.find((m) => m.code === 'T1-M1');
    expect(m1.lessons.map((l) => l.code)).toEqual(expect.arrayContaining(['T1-L02', 'T1-L03']));
    expect(m1.lessons[0].unlocked).toBe(true); // first lesson always unlocked
  });
});

describe('GET /lesson/:code', () => {
  test('strips answer keys; soft-locked lesson still 200s', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/wt1/lesson/T1-L02').set(bearer(u));
    expect(res.status).toBe(200);
    const mcq = res.body.exercises.find((e) => e.code === 'MCQ1');
    expect(mcq.items[0].answer).toBeUndefined();
    expect(mcq.items[0].options).toHaveLength(2);
    const pw = res.body.exercises.find((e) => e.code === 'PW1');
    expect(pw.rubric.sampleAnswer).toBeUndefined();
    expect(pw.rubric.checklist).toEqual(['use comparison']);
    const match = res.body.exercises.find((e) => e.code === 'MATCH1');
    expect(match.rightOptions.sort()).toEqual(['R1', 'R2']);
    expect(match.items[0].right).toBeUndefined();
  });
});

describe('POST /check (objective grading)', () => {
  const cases = [
    ['MCQ1', { q1: 'B' }, { q1: 'A' }],
    ['GAP1', { q1: ['amount'] }, { q1: ['number'] }],
    ['CAT1', { q1: 'up', q2: 'down' }, { q1: 'down', q2: 'up' }],
    ['ORD1', { q1: ['a', 'b', 'c'] }, { q1: ['c', 'b', 'a'] }],
    ['MATCH1', { q1: 'R1', q2: 'R2' }, { q1: 'R2', q2: 'R1' }],
    ['ST1', { q1: 'The number of cars was five million.' }, { q1: 'I like pizza.' }],
  ];
  test.each(cases)('%s grades right and wrong', async (code, right, wrong) => {
    const u = await createPremiumStudent();
    const good = await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: code, answers: right });
    expect(good.status).toBe(200);
    expect(good.body.score).toBe(100);
    const bad = await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: code, answers: wrong });
    expect(bad.body.score).toBe(0);
    expect(await WT1Submission.countDocuments({ userId: u._id, exerciseCode: code })).toBe(2);
  });

  test('a writing type is rejected by /check', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: 'PW1', answers: {} });
    expect(res.status).toBe(400);
  });
});

describe('POST /submit-writing', () => {
  test('sentence_writing is graded locally (no Gemini call)', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/wt1/submit-writing').set(bearer(u))
      .send({ exerciseCode: 'SW1', responses: ['The number of cars was five million in 2005.', 'There were two million bikes.'] });
    expect(res.status).toBe(200);
    expect(res.body.graded).toBe('local');
    expect(geminiService.checkEssay).not.toHaveBeenCalled();
    const sub = await WT1Submission.findOne({ userId: u._id, exerciseCode: 'SW1' }).lean();
    expect(sub.responses).toHaveLength(2);
  });

  test('paragraph_writing calls checkEssay with the chart image and stores aiFeedback', async () => {
    geminiService.checkEssay.mockResolvedValue({
      scores: { taskAchievement: 6, coherence: 6, lexical: 5, grammar: 6 },
      overallBand: 5.5, feedbackVi: 'Tạm ổn.', corrections: [{ original: 'x', corrected: 'y', note: 'z' }],
    });
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/wt1/submit-writing').set(bearer(u))
      .send({ exerciseCode: 'PW1', responses: ['In 2005, the chart shows that car use rose while bike use fell, and there were more buses than trains.'] });
    expect(res.status).toBe(200);
    expect(res.body.graded).toBe('ai');
    expect(res.body.scores.taskAchievement).toBe(6);
    const [, , imageUrl] = geminiService.checkEssay.mock.calls[0];
    expect(imageUrl).toBe('https://example.com/x.png');
    const sub = await WT1Submission.findOne({ userId: u._id, exerciseCode: 'PW1' }).lean();
    expect(sub.aiFeedback.bandEstimate).toBe(5.5);
  });
});

describe('gate unlock + ownership', () => {
  test('meeting T1-L02 gate flips T1-L03 unlocked', async () => {
    const u = await createPremiumStudent();
    // pass all objective exercises + 1 writing submission
    await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: 'MCQ1', answers: { q1: 'B' } });
    await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: 'GAP1', answers: { q1: ['amount'] } });
    await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: 'CAT1', answers: { q1: 'up', q2: 'down' } });
    await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: 'ORD1', answers: { q1: ['a', 'b', 'c'] } });
    await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: 'MATCH1', answers: { q1: 'R1', q2: 'R2' } });
    await request(app).post('/api/wt1/check').set(bearer(u)).send({ exerciseCode: 'ST1', answers: { q1: 'The number of cars was five million.' } });
    await request(app).post('/api/wt1/submit-writing').set(bearer(u)).send({ exerciseCode: 'SW1', responses: ['The number of cars was five million in 2005. There were two million bikes.'] });

    const res = await request(app).get('/api/wt1/overview').set(bearer(u));
    const lessons = res.body.modules.find((m) => m.code === 'T1-M1').lessons;
    expect(lessons.find((l) => l.code === 'T1-L03').unlocked).toBe(true);
  });

  test("another user's attempt → 404", async () => {
    const owner = await createPremiumStudent();
    const other = await createPremiumStudent();
    await request(app).post('/api/wt1/check').set(bearer(owner)).send({ exerciseCode: 'MCQ1', answers: { q1: 'B' } });
    const sub = await WT1Submission.findOne({ userId: owner._id }).lean();
    const res = await request(app).get(`/api/wt1/attempt/${sub._id}`).set(bearer(other));
    expect(res.status).toBe(404);
  });
});
