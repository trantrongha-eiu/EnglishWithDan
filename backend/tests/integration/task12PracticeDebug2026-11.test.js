// 2026-11-16 debug pass of task1-practice.html (Task 1 Grammar), task2-practice.html
// (Task 2 Luyện đề tuần) and their admin pages (Task1Exercises / Task2Topics).
const request = require('supertest');
const app = require('../../app');
const { createPremiumStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createTask1Exercise, createTask2Topic } = require('../factories/contentFactory');
const Task1Exercise = require('../../models/Task1Exercise');
const Task1Attempt = require('../../models/Task1Attempt');
const Task2Topic = require('../../models/Task2Topic');
const Task2Attempt = require('../../models/Task2Attempt');
const Task2LessonWork = require('../../models/Task2LessonWork');
const WritingTask2 = require('../../models/WritingTask2');
const { normalizeSetTags } = require('../../routes/admin/task1Exercises')._test;
const { sectionOf, questionStats } = require('../../routes/admin/task2Topics')._test;

const BAD_ID = 'not-an-id';
const MISSING = '64b000000000000000000000';

async function student() { return signTokenFor(await createPremiumStudent()); }
async function teacher() { return signTokenFor(await createTeacher()); }

// ── Task 1 Grammar — student API ─────────────────────────────────────────
describe('task1-practice API hardening', () => {
  test('/check: malformed exerciseId → 404, object answer → 400, numeric MC index accepted', async () => {
    const token = await student();
    const ex = await createTask1Exercise({ type: 'multiple_choice', extra: { options: ['a', 'b'], correctOptionIndex: 1 } });
    const bad = await request(app).post('/api/task1/check').set('Authorization', `Bearer ${token}`).send({ exerciseId: BAD_ID, userAnswer: 'x' });
    expect(bad.status).toBe(404);
    const obj = await request(app).post('/api/task1/check').set('Authorization', `Bearer ${token}`).send({ exerciseId: String(ex._id), userAnswer: { a: 1 } });
    expect(obj.status).toBe(400);
    const num = await request(app).post('/api/task1/check').set('Authorization', `Bearer ${token}`).send({ exerciseId: String(ex._id), userAnswer: 1 });
    expect(num.status).toBe(200);
    expect(num.body.isCorrect).toBe(true);
  });

  test('/check: a rearrange exercise with only primaryAnswer is graded, not a 500', async () => {
    const token = await student();
    const ex = await createTask1Exercise({ type: 'rearrange', extra: { primaryAnswer: 'The figure rose sharply.' } });
    const res = await request(app).post('/api/task1/check').set('Authorization', `Bearer ${token}`).send({ exerciseId: String(ex._id), userAnswer: 'the figure rose sharply' });
    expect(res.status).toBe(200);
    expect(res.body.isCorrect).toBe(true);
  });

  test('/test-questions: count=abc and a huge count are clamped', async () => {
    const token = await student();
    for (let i = 0; i < 3; i++) await createTask1Exercise();
    const nan = await request(app).get('/api/task1/test-questions?count=abc').set('Authorization', `Bearer ${token}`);
    expect(nan.status).toBe(200);
    expect(nan.body.exercises.length).toBeGreaterThan(0);
    const huge = await request(app).get('/api/task1/test-questions?count=100000').set('Authorization', `Bearer ${token}`);
    expect(huge.status).toBe(200);
    expect(huge.body.exercises.length).toBeLessThanOrEqual(50);
  });

  test('/check-test: one malformed id or a non-string answer no longer fails the whole test', async () => {
    const token = await student();
    const ex = await createTask1Exercise({ type: 'fill_blank', extra: { primaryAnswer: 'rose' } });
    const res = await request(app).post('/api/task1/check-test').set('Authorization', `Bearer ${token}`).send({ answers: [
      { exerciseId: BAD_ID, userAnswer: 'x' },
      { exerciseId: String(ex._id), userAnswer: { not: 'text' } },
      { exerciseId: String(ex._id), userAnswer: 'rose' },
    ] });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.correct).toBe(1);
  });
});

// ── Task 1 Grammar — admin ───────────────────────────────────────────────
describe('admin Task 1 Grammar: set tags + student results', () => {
  test('normalizeSetTags keeps exactly one set tag', () => {
    expect(normalizeSetTags({ set: 'set2', tags: ['set1', 'old:1-4', 'chart:static'] }).tags).toEqual(['set2', 'old:1-4', 'chart:static']);
    expect(normalizeSetTags({ tags: ['chart:dynamic'] }).tags).toEqual(['set1', 'chart:dynamic']);
    expect(normalizeSetTags({ set: 'set1' }).tags).toEqual(['set1']);
    expect(normalizeSetTags({ isActive: false })).toEqual({ isActive: false }); // 🙈 toggle leaves tags alone
  });

  test('a Bộ 1 exercise created in admin is tagged set1 and shows on the student page under Bộ 1', async () => {
    const token = await teacher();
    const res = await request(app).post('/api/admin/task1/exercises').set('Authorization', `Bearer ${token}`).send({
      skillType: 'overview', module: 1, level: 'beginner', type: 'fill_blank', instruction: 'New Bo1 item', set: 'set1', tags: [],
    });
    expect(res.status).toBe(201);
    expect(res.body.exercise.tags).toEqual(['set1']);
    const list = await request(app).get('/api/task1/exercises?tag=set1').set('Authorization', `Bearer ${await student()}`);
    expect(list.body.exercises.some(e => e.instruction === 'New Bo1 item')).toBe(true);
  });

  test('moving Bộ 1 → Bộ 2 drops set1 (was kept → shown in both sets); the hide toggle keeps tags', async () => {
    const token = await teacher();
    const ex = await createTask1Exercise({ extra: { tags: ['set1', 'old:2-7'] } });
    const moved = await request(app).put(`/api/admin/task1/exercises/${ex._id}`).set('Authorization', `Bearer ${token}`)
      .send({ set: 'set2', tags: ['set1', 'old:2-7'], _id: 'ignored', createdAt: 'x' });
    expect(moved.status).toBe(200);
    expect(moved.body.exercise.tags).toEqual(['set2', 'old:2-7']);
    await request(app).put(`/api/admin/task1/exercises/${ex._id}`).set('Authorization', `Bearer ${token}`).send({ isActive: false });
    const saved = await Task1Exercise.findById(ex._id).lean();
    expect(saved.isActive).toBe(false);
    expect(saved.tags).toEqual(['set2', 'old:2-7']);
  });

  test('list carries per-exercise student results; sort=hard puts the most-missed first; /answers lists them', async () => {
    const token = await teacher();
    const easy = await createTask1Exercise({ instruction: 'easy one', extra: { tags: ['set1'] } });
    const hard = await createTask1Exercise({ instruction: 'hard one', extra: { tags: ['set1'] } });
    const s = await createPremiumStudent({ firstName: 'Lan', lastName: '' });
    const rows = [];
    for (let i = 0; i < 4; i++) {
      rows.push({ userId: s._id, exerciseId: easy._id, userAnswer: 'ok', isCorrect: true, score: 100 });
      rows.push({ userId: s._id, exerciseId: hard._id, userAnswer: 'bad', isCorrect: i === 0, score: 0 });
    }
    await Task1Attempt.insertMany(rows);
    const res = await request(app).get('/api/admin/task1/exercises?sort=hard').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.exercises[0].instruction).toBe('hard one');
    expect(res.body.exercises[0].results).toMatchObject({ attempts: 4, students: 1, correctPct: 25 });
    const ans = await request(app).get(`/api/admin/task1/exercises/${hard._id}/answers`).set('Authorization', `Bearer ${token}`);
    expect(ans.status).toBe(200);
    expect(ans.body.answers).toHaveLength(4);
    expect(ans.body.answers[0].student.name).toBe('Lan');
    const bad = await request(app).get(`/api/admin/task1/exercises/${BAD_ID}/answers`).set('Authorization', `Bearer ${token}`);
    expect(bad.status).toBe(404);
  });

  test('malformed id on PUT → 404 (was a CastError 400)', async () => {
    const res = await request(app).put(`/api/admin/task1/exercises/${BAD_ID}`).set('Authorization', `Bearer ${await teacher()}`).send({ isActive: false });
    expect(res.status).toBe(404);
  });
});

// ── Task 2 Luyện đề tuần — student API ───────────────────────────────────
function concl() { return { questionId: 'cc1', level: 'intermediate', type: 'short_writing', questionText: 'Tự viết kết bài', correctAnswer: 'In conclusion, x.', modelAnswer: 'In conclusion, x.', fallbackKeywords: ['in conclusion', 'to sum up', 'overall', 'therefore'], orderIndex: 99 }; }

describe('task2-practice API hardening', () => {
  test('malformed topicId → 404 / empty instead of 500', async () => {
    const token = await student();
    const auth = r => r.set('Authorization', `Bearer ${token}`);
    expect((await auth(request(app).get(`/api/task2/questions/topic/${BAD_ID}`))).status).toBe(404);
    expect((await auth(request(app).get(`/api/task2/vocabulary/${BAD_ID}`))).status).toBe(404);
    expect((await auth(request(app).post('/api/task2/check').send({ topicId: BAD_ID, questionId: 'x', userAnswer: 'y' }))).status).toBe(404);
    const stats = await auth(request(app).get(`/api/task2/topic-stats/${BAD_ID}`));
    expect(stats.status).toBe(200);
    expect(stats.body.stats.practiced).toBe(false);
    const wrong = await auth(request(app).get(`/api/task2/wrong-questions/${BAD_ID}`));
    expect(wrong.body.wrongIds).toEqual([]);
    const week = await request(app).get('/api/task2/topics/week/abc');
    expect(week.status).toBe(200);
    expect(week.body.topics).toEqual([]);
  });

  test('/check: an object answer → 400', async () => {
    const topic = await createTask2Topic({ questions: [{ level: 'beginner', type: 'fill_blank', questionText: 'x ___', correctAnswer: 'grew' }] });
    const res = await request(app).post('/api/task2/check').set('Authorization', `Bearer ${await student()}`)
      .send({ topicId: String(topic._id), questionId: String(topic.questions[0]._id), userAnswer: { a: 1 } });
    expect(res.status).toBe(400);
  });

  test('/exam: count=abc still gives questions; /exam/submit survives bad ids and grades the conclusion by its shape', async () => {
    const token = await student();
    const topic = await createTask2Topic({ essayType: 'cause_solution', prompt: 'What causes X? What solutions?', questions: [
      { level: 'intermediate', type: 'fill_blank', questionText: 'x ___', correctAnswer: 'grew' }, concl(),
    ] });
    const exam = await request(app).get('/api/task2/exam?count=abc').set('Authorization', `Bearer ${token}`);
    expect(exam.status).toBe(200);
    expect(exam.body.questions.length).toBe(2);

    const paragraph = 'In conclusion, stress has several causes, including long working hours and social media. '
      + 'If employers and schools provide easy access to counselling, this problem will be significantly reduced.';
    const res = await request(app).post('/api/task2/exam/submit').set('Authorization', `Bearer ${token}`).send({ answers: [
      { topicId: BAD_ID, questionId: 'x', userAnswer: 'y' },
      { topicId: String(topic._id), questionId: 'cc1', userAnswer: paragraph },
    ] });
    expect(res.status).toBe(200);
    const row = res.body.results.find(r => r.questionId === 'cc1');
    // The old keyword ratio wanted "to sum up" + "overall" + "therefore" too → wrong.
    expect(row.isCorrect).toBe(true);
  });

  test('/save-attempt: a non-array questionsAttempted → 400; a bad topicId/sessionType no longer 500s', async () => {
    const token = await student();
    const bad = await request(app).post('/api/task2/save-attempt').set('Authorization', `Bearer ${token}`).send({ questionsAttempted: 'x' });
    expect(bad.status).toBe(400);
    const res = await request(app).post('/api/task2/save-attempt').set('Authorization', `Bearer ${token}`)
      .send({ topicId: BAD_ID, sessionType: 'weird', questionsAttempted: [{ questionId: 'a', userAnswer: 'b', isCorrect: true }] });
    expect(res.status).toBe(200);
    expect(res.body.attempt.sessionType).toBe('practice');
    expect(res.body.attempt.questionsAttempted).toEqual([]);
  });
});

// ── Task 2 Luyện đề tuần — admin ─────────────────────────────────────────
describe('admin Task 2 Luyện đề tuần', () => {
  const sampleQ = (id, sec, en, active = true) => ({
    questionId: id, level: 'intermediate', type: 'translation', isActive: active,
    questionText: `${sec} · Dịch câu trong bài mẫu:\n\n"Câu tiếng Việt"`, correctAnswer: en, modelAnswer: en, orderIndex: 31,
  });

  test('sectionOf / questionStats read the MỞ BÀI / THÂN BÀI tags', () => {
    expect(sectionOf({ type: 'translation', questionText: 'THÂN BÀI 2 · Dịch câu' })).toBe('body2');
    expect(sectionOf({ type: 'short_writing', questionText: 'Tự viết' })).toBe('conclusion');
    expect(sectionOf({ type: 'translation', questionText: 'Dịch câu: ...' })).toBe(null);
    const st = questionStats([sampleQ('a', 'MỞ BÀI', 'A.'), sampleQ('b', 'THÂN BÀI 1', 'B.'), sampleQ('old', 'Dịch', 'C.', false), concl()]);
    expect(st).toMatchObject({ questionCount: 4, activeCount: 3, retiredCount: 1, step3Count: 2, fromSample: 2, hasConclusion: true });
  });

  test('list rows carry Buổi number + counts; /:id returns questions + the Daniel sample', async () => {
    const token = await teacher();
    const wt = await WritingTask2.create({ prompt: 'Sample prompt here.', sampleSections: [{ title: 'Intro', content: 'A.' }, { title: 'B1', content: 'B.' }] });
    const t1 = await createTask2Topic({ week: 2, topicName: 'Second', prompt: 'p2' });
    const t0 = await createTask2Topic({ week: 1, topicName: 'First', prompt: 'Sample prompt here', questions: [sampleQ('a', 'MỞ BÀI', 'A.'), concl()] });
    const list = await request(app).get('/api/admin/task2/topics').set('Authorization', `Bearer ${token}`);
    const row0 = list.body.topics.find(t => t.topicName === 'First');
    expect(row0).toMatchObject({ session: 1, fromSample: 1, hasConclusion: true, activeCount: 2 });
    expect(list.body.topics.find(t => t.topicName === 'Second').session).toBe(2);
    expect(list.body.topics[0].questions).toBeUndefined();

    const one = await request(app).get(`/api/admin/task2/topics/${t0._id}`).set('Authorization', `Bearer ${token}`);
    expect(one.status).toBe(200);
    expect(one.body.topic.questions).toHaveLength(2);
    expect(one.body.topic.prompt).toBe('Sample prompt here');
    expect(String(one.body.sample._id)).toBe(String(wt._id));
    expect(one.body.sample.sections[0].content).toBe('A.');
    expect(String(t1._id)).toBeTruthy();
    expect((await request(app).get(`/api/admin/task2/topics/${BAD_ID}`).set('Authorization', `Bearer ${token}`)).status).toBe(404);
  });

  test('question PUT validates the enum and ignores unknown keys', async () => {
    const token = await teacher();
    const topic = await createTask2Topic({ questions: [sampleQ('a', 'MỞ BÀI', 'A.')] });
    const qid = String(topic.questions[0]._id);
    const bad = await request(app).put(`/api/admin/task2/topics/${topic._id}/questions/${qid}`).set('Authorization', `Bearer ${token}`).send({ type: 'nope' });
    expect(bad.status).toBe(400);
    const ok = await request(app).put(`/api/admin/task2/topics/${topic._id}/questions/${qid}`).set('Authorization', `Bearer ${token}`)
      .send({ questionText: 'MỞ BÀI · Dịch: "mới"', _id: MISSING, hacked: 1 });
    expect(ok.status).toBe(200);
    const saved = await Task2Topic.findById(topic._id).lean();
    expect(String(saved.questions[0]._id)).toBe(qid);
    expect(saved.questions[0].questionText).toBe('MỞ BÀI · Dịch: "mới"');
    expect(saved.questions[0].hacked).toBeUndefined();
  });

  test('topic PUT keeps the prompt/brainstorm when only some fields are sent', async () => {
    const token = await teacher();
    const topic = await createTask2Topic({ prompt: 'Keep me', extra: { brainstormHints: [{ side: 'A', points: ['x'] }] } });
    const res = await request(app).put(`/api/admin/task2/topics/${topic._id}`).set('Authorization', `Bearer ${token}`).send({ isActive: false });
    expect(res.status).toBe(200);
    const saved = await Task2Topic.findById(topic._id).lean();
    expect(saved.prompt).toBe('Keep me');
    expect(saved.brainstormHints).toHaveLength(1);
    expect(saved.isActive).toBe(false);
  });

  test('/students lists step ① ③ ④ progress per student; /students/:userId shows their sentences + essay', async () => {
    const token = await teacher();
    const topic = await createTask2Topic({ questions: [sampleQ('a', 'MỞ BÀI', 'A.'), sampleQ('b', 'THÂN BÀI 1', 'B.'), concl()],
      extra: { vocabularyList: [{ term: 'stress' }, { term: 'anxiety' }] } });
    const s = await createPremiumStudent({ firstName: 'Minh', lastName: '' });
    await Task2Attempt.create({ userId: s._id, topicId: topic._id, sessionType: 'practice', totalQuestions: 2, correctCount: 1, scorePercentage: 50,
      questionsAttempted: [{ questionId: 'a', userAnswer: 'A.', isCorrect: true }, { questionId: 'b', userAnswer: 'Bx', isCorrect: false }] });
    await Task2LessonWork.create({ userId: s._id, topicId: topic._id, sections: { intro: 'My intro here', body1: '' }, brainstorm: ['idea'] });

    const res = await request(app).get(`/api/admin/task2/topics/${topic._id}/students`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.students).toHaveLength(1);
    expect(res.body.students[0]).toMatchObject({ name: 'Minh', step3Total: 3, step3Done: 2, step3Correct: 1, vocabTotal: 2, brainstorm: 1, runs: 1, bestScore: 50 });
    expect(res.body.students[0].words.intro).toBe(3);

    const one = await request(app).get(`/api/admin/task2/topics/${topic._id}/students/${s._id}`).set('Authorization', `Bearer ${token}`);
    expect(one.status).toBe(200);
    expect(one.body.sentences.map(x => x.section)).toEqual(['intro', 'body1', 'conclusion']);
    expect(one.body.sentences[0]).toMatchObject({ en: 'A.', isCorrect: true });
    expect(one.body.sections.intro).toBe('My intro here');
  });
});
