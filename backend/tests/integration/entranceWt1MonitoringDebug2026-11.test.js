// Regression tests for the 2026-11-14 debug pass (round 3): Entrance Test
// input caps, Writing/Speaking course (WT1) request hardening, and the admin
// Monitoring history feed (Shadowing rows, malformed ids).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createPassage, createListeningSection, createWritingTask1 } = require('../factories/contentFactory');
const EntranceTestConfig = require('../../models/EntranceTestConfig');
const EntranceGrammarQuestion = require('../../models/EntranceGrammarQuestion');
const EntranceTestAttempt = require('../../models/EntranceTestAttempt');
const SpeakingQuestion = require('../../models/SpeakingQuestion');
const ShadowingAttempt = require('../../models/ShadowingAttempt');
const WT1Course = require('../../models/WT1Course');
const WT1Module = require('../../models/WT1Module');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Exercise = require('../../models/WT1Exercise');
const WT1Submission = require('../../models/WT1Submission');

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

// ── Entrance Test ────────────────────────────────────────────────────────
async function seedEntrance() {
  await EntranceGrammarQuestion.create([
    { setKey: 'default', order: 1, topic: 'Tenses', type: 'mcq', prompt: 'She ___ here.', options: [{ id: 'A', text: 'lives' }, { id: 'B', text: 'live' }], answer: 'A' },
  ]);
  await Promise.all([
    createPassage({ category: 'passage2', questionRange: { start: 1, end: 1 }, questionGroups: [{ groupType: 'plain', questions: [
      { questionNumber: 1, type: 'sentence-completion', questionText: 'The sky is __1__.', correctAnswer: 'blue' }] }] }),
    createListeningSection({ partNumber: 3, questionRange: { start: 1, end: 1 }, questionGroups: [{ groupType: 'plain', questions: [
      { questionNumber: 1, type: 'fill-blank', questionText: 'It is __1__.', correctAnswer: 'sunny' }] }],
    extra: { audioUrl: 'https://res.cloudinary.com/demo/video/upload/v1/listening/fake.mp3', audioDuration: 400 } }),
    createWritingTask1({ prompt: 'Describe the chart.', imageUrl: 'https://res.cloudinary.com/demo/image/upload/chart.png' }),
    SpeakingQuestion.create({ topic: 'Trip', part: 2, question: 'Describe a trip.', cueCard: 'You should say: where' }),
  ]);
  await EntranceTestConfig.create({ grammarSetKey: 'default', isActive: true });
}

describe('entrance test answers', () => {
  test('a Grammar answer for a question outside this attempt is refused; long answers are capped', async () => {
    await seedEntrance();
    const s = await createStudent();
    const start = await request(app).post('/api/entrance-test/start').set(bearer(s));
    const id = start.body.attemptId;
    const att = (await request(app).get(`/api/entrance-test/${id}`).set(bearer(s))).body.attempt;
    const qid = att.sections.grammar.questions[0]._id;

    const foreign = await request(app).post(`/api/entrance-test/${id}/answer`).set(bearer(s))
      .send({ section: 'grammar', questionId: '64b000000000000000000001', answer: 'A' });
    expect(foreign.status).toBe(400);

    const ok = await request(app).post(`/api/entrance-test/${id}/answer`).set(bearer(s))
      .send({ section: 'grammar', questionId: qid, answer: 'x'.repeat(5000) });
    expect(ok.status).toBe(200);
    const doc = await EntranceTestAttempt.findById(id).lean();
    expect(doc.sections.grammar.answers).toHaveLength(1);
    expect(doc.sections.grammar.answers[0].userAnswer.length).toBe(500);
  });

  test('the Writing answer is capped at 20 000 characters', async () => {
    await seedEntrance();
    const s = await createStudent();
    const id = (await request(app).post('/api/entrance-test/start').set(bearer(s))).body.attemptId;
    for (const sec of ['grammar', 'reading', 'listening']) {
      expect((await request(app).post(`/api/entrance-test/${id}/section/${sec}/submit`).set(bearer(s))).status).toBe(200);
    }
    const res = await request(app).post(`/api/entrance-test/${id}/answer`).set(bearer(s))
      .send({ section: 'writing', writingAnswer: 'word '.repeat(10000) });
    expect(res.status).toBe(200);
    const doc = await EntranceTestAttempt.findById(id).lean();
    expect(doc.sections.writing.writingAnswer.length).toBe(20000);
  });
});

// ── WT1 courses (Writing Task 1 / Task 2 / Speaking share these routes) ─
describe('WT1 course request hardening', () => {
  beforeEach(async () => {
    await WT1Course.findOneAndUpdate({ code: 'IELTS-WT1' }, { code: 'IELTS-WT1', title: 'Task 1', skill: 'writing' }, { upsert: true });
    await WT1Module.findOneAndUpdate({ code: 'T1D-M1' }, { code: 'T1D-M1', courseCode: 'IELTS-WT1', order: 1, title: 'M1' }, { upsert: true });
    await WT1Lesson.findOneAndUpdate({ code: 'T1D-L1' }, { code: 'T1D-L1', moduleCode: 'T1D-M1', order: 1, title: 'Buổi 1', published: true }, { upsert: true });
    await WT1Exercise.deleteMany({ lessonCode: 'T1D-L1' });
    await WT1Exercise.create({
      code: 'T1D-L1-E1', lessonCode: 'T1D-L1', order: 1, type: 'mcq', title: 'mcq', published: true, autoGrade: true,
      items: [{ id: 'q1', prompt: 'p', options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'b' }], answer: 'A' }],
    });
  });

  test('an exerciseCode that is an object (operator) is refused instead of matching some exercise', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).post('/api/wt1/check').set(bearer(u))
      .send({ exerciseCode: { $ne: null }, answers: { q1: 'A' } });
    expect(res.status).toBe(400);
    expect(await WT1Submission.countDocuments({ userId: u._id })).toBe(0);
  });

  test('an oversized answers object is refused; a normal one is graded', async () => {
    const u = await createPremiumStudent();
    const big = await request(app).post('/api/wt1/check').set(bearer(u))
      .send({ exerciseCode: 'T1D-L1-E1', answers: { q1: 'A', junk: 'x'.repeat(60000) } });
    expect(big.status).toBe(400);
    const ok = await request(app).post('/api/wt1/check').set(bearer(u))
      .send({ exerciseCode: 'T1D-L1-E1', answers: { q1: 'A' } });
    expect(ok.status).toBe(200);
    expect(ok.body.correctCount).toBe(1);
  });
});

// ── Admin Monitoring ────────────────────────────────────────────────────
describe('admin Monitoring history', () => {
  test('Shadowing practice now shows in "Lịch sử làm bài" (site-wide and per student), and can be deleted', async () => {
    const s = await createStudent();
    const t = await createTeacher();
    const row = await ShadowingAttempt.create({
      userId: s._id, lessonId: '64b000000000000000000002', lessonTitle: 'Hometown', mode: 'dictation',
      answers: [{ segmentIndex: 0, matchedWords: 4, totalWords: 5, score: 80 }], totalSegments: 10, avgScore: 8, accuracy: 80,
    });
    const all = await request(app).get('/api/admin/recent-attempts').set(bearer(t));
    const hit = all.body.attempts.find((a) => a.skill === 'shadowing');
    expect(hit).toMatchObject({ testName: 'Hometown', correctCount: 1, totalQuestions: 10 });
    expect(hit.testMeta).toMatch(/80%/);

    const mine = await request(app).get(`/api/admin/recent-attempts?userId=${s._id}&skill=shadowing`).set(bearer(t));
    expect(mine.body.attempts).toHaveLength(1);
    expect(mine.body.total).toBe(1);

    // (deleting is admin-only — teachers get 403 from the shared admin guard)
    const admin = await createAdmin();
    expect((await request(app).delete(`/api/admin/shadowing-attempts/${row._id}`).set(bearer(admin))).status).toBe(200);
    expect(await ShadowingAttempt.countDocuments({ _id: row._id })).toBe(0);
  });

  test('a malformed id on the delete / vocab routes is a 404, not a 500', async () => {
    const t = await createAdmin();
    expect((await request(app).delete('/api/admin/attempts/oops').set(bearer(t))).status).toBe(404);
    expect((await request(app).delete('/api/admin/shadowing-attempts/oops').set(bearer(t))).status).toBe(404);
    expect((await request(app).get('/api/admin/vocab-books/oops').set(bearer(t))).status).toBe(404);
    expect((await request(app).get('/api/admin/vocab-activity/oops').set(bearer(t))).status).toBe(404);
  });

  test('entrance attempt list ignores a malformed userId and object filters', async () => {
    const t = await createTeacher();
    const res = await request(app).get('/api/admin/entrance-test/attempts?userId=oops').set(bearer(t));
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) expect(res.body.attempts).toEqual([]);
    const obj = await request(app).get('/api/admin/entrance-test/attempts?status[$ne]=x').set(bearer(t));
    expect(obj.status).toBeLessThan(500);
  });
});

// ── Teacher review queue (admin /submission-reviews) ────────────────────
describe('teacher review queue — Speaking stuck without an AI grade', () => {
  const SpeakingAttempt = require('../../models/SpeakingAttempt');
  test('a Speaking attempt still "pending" after 10 minutes (mock with no transcript, crashed grade) is listed; a fresh one is not', async () => {
    const s = await createStudent();
    const t = await createTeacher();
    const stuck = await SpeakingAttempt.create({ userId: s._id, topic: 'Full Mock Test', part: 2, question: 'Describe a place', transcript: '', status: 'pending' });
    await SpeakingAttempt.collection.updateOne({ _id: stuck._id }, { $set: { createdAt: new Date(Date.now() - 30 * 60 * 1000) } });
    await SpeakingAttempt.create({ userId: s._id, topic: 'Hobbies', part: 1, question: 'Q?', transcript: 'x', status: 'pending' });

    const list = await request(app).get('/api/admin/submission-reviews?kind=speaking').set(bearer(t));
    expect(list.status).toBe(200);
    const ids = list.body.rows.map((r) => String(r.id));
    expect(ids).toEqual([String(stuck._id)]);
    expect(list.body.rows[0].aiUnavailable).toBe(true);
    const counts = await request(app).get('/api/admin/submission-reviews/counts').set(bearer(t));
    expect(counts.body.counts.speaking).toBe(1);
  });
});

// ── Task 1 Grammar practice save (feeds the Bộ 2 homework tick) ─────────
describe('POST /api/task1/save-batch', () => {
  const { createTask1Exercise } = require('../factories/contentFactory');
  const Task1Attempt = require('../../models/Task1Attempt');
  test('a malformed or unknown exerciseId no longer loses the valid answers of the batch', async () => {
    const u = await createPremiumStudent();
    const ex = await createTask1Exercise({ extra: { primaryAnswer: 'rose', acceptedAnswers: ['rose'] } });
    const res = await request(app).post('/api/task1/save-batch').set(bearer(u)).send({
      sessionId: 's1',
      attempts: [
        { exerciseId: 'oops', userAnswer: 'x' },
        { exerciseId: '64b000000000000000000009', userAnswer: 'x' },
        { exerciseId: String(ex._id), userAnswer: 'rose', isCorrect: false },
      ],
    });
    expect(res.status).toBe(200);
    expect(res.body.saved).toBe(1);
    const rows = await Task1Attempt.find({ userId: u._id }).lean();
    expect(rows).toHaveLength(1);
    expect(String(rows[0].exerciseId)).toBe(String(ex._id));
  });
});
