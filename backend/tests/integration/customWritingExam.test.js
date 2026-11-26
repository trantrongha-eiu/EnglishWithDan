// "🧩 Tự ghép đề Writing" — a teacher pairs ONE Task 1 + ONE Task 2 into a
// WritingExam (isCustom) and assigns it in Luyện tập / Thi thật:
// POST /api/classes/resources/writing-exams/custom, writingService.startExam
// opening exactly that pair, the examMode completion gate on writing_exam,
// and custom pairs staying out of the default exam / random mock draws.
const request = require('supertest');
const app = require('../../app');
const WritingExam = require('../../models/WritingExam');
const WritingAttempt = require('../../models/WritingAttempt');
const mockTestService = require('../../services/mockTestService');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createWritingTask1, createWritingTask2, createWritingExam, createListeningTest, createReadingTest, createSpeakingQuestion } = require('../factories/contentFactory');
const { createClassGroup, enrollStudent, createAssignment } = require('../factories/classFactory');

const authH = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const CUSTOM_URL = '/api/classes/resources/writing-exams/custom';

describe('POST /api/classes/resources/writing-exams/custom', () => {
  test('students cannot create one; a teacher gets a catalog row naming both dạng đề', async () => {
    const t1 = await createWritingTask1({ chartType: 'mixed' });
    const t2 = await createWritingTask2();
    await t2.constructor.updateOne({ _id: t2._id }, { essayType: 'type03' });
    const s = await createStudent();
    expect((await request(app).post(CUSTOM_URL).set(authH(s)).send({ task1Id: t1._id, task2Id: t2._id })).status).toBe(403);

    const teacher = await createTeacher();
    const res = await request(app).post(CUSTOM_URL).set(authH(teacher)).send({ task1Id: t1._id, task2Id: t2._id, name: 'Week 1 – Writing' });
    expect(res.status).toBe(201);
    expect(res.body.exam.label).toBe('Week 1 – Writing');
    expect(res.body.exam.meta).toBe('🧩 Tự ghép · T1: Mixed charts · T2: Cause & Solution');
    const exam = await WritingExam.findById(res.body.exam._id).lean();
    expect(exam).toMatchObject({ isCustom: true, isActive: true });
    expect(String(exam.task1Id)).toBe(String(t1._id));
    expect(String(exam.task2Id)).toBe(String(t2._id));

    // Same pair + same name → reused, not duplicated.
    const again = await request(app).post(CUSTOM_URL).set(authH(teacher)).send({ task1Id: t1._id, task2Id: t2._id, name: 'Week 1 – Writing' });
    expect(again.body.exam._id).toBe(res.body.exam._id);
    expect(await WritingExam.countDocuments({ isCustom: true })).toBe(1);
  });

  test('refuses a missing / hidden prompt', async () => {
    const teacher = await createTeacher();
    const t1 = await createWritingTask1({ isActive: false });
    const t2 = await createWritingTask2();
    expect((await request(app).post(CUSTOM_URL).set(authH(teacher)).send({ task1Id: t1._id, task2Id: t2._id })).status).toBe(400);
    expect((await request(app).post(CUSTOM_URL).set(authH(teacher)).send({ task1Id: 'x', task2Id: t2._id })).status).toBe(400);
  });
});

describe('starting a custom exam', () => {
  test('every run opens exactly the paired Task 1 + Task 2', async () => {
    const tasks1 = await Promise.all([1, 2, 3, 4].map(() => createWritingTask1()));
    const tasks2 = await Promise.all([1, 2, 3, 4].map(() => createWritingTask2()));
    const exam = await WritingExam.create({ name: 'Pair', task1Id: tasks1[2]._id, task2Id: tasks2[1]._id, isCustom: true });
    const s = await createStudent();
    for (let i = 0; i < 4; i += 1) {
      const res = await request(app).post('/api/writing/start').set(authH(s)).send({ examId: exam._id, mode: 'practice' });
      expect(res.status).toBe(200);
      expect(String(res.body.exam._id)).toBe(String(exam._id));
      expect(String(res.body.exam.task1._id)).toBe(String(tasks1[2]._id));
      expect(String(res.body.exam.task2._id)).toBe(String(tasks2[1]._id));
    }
  });

  test('a custom pair is never the no-examId default nor a random mock draw', async () => {
    await createWritingTask1();
    await createWritingTask2();
    const normal = await createWritingExam({ name: 'Normal exam' });
    // newest, so it would win "most recent active exam" if not excluded
    await WritingExam.create({ name: 'Custom newest', isCustom: true });
    const s = await createStudent();
    const res = await request(app).post('/api/writing/start').set(authH(s)).send({ mode: 'practice' });
    expect(String(res.body.exam._id)).toBe(String(normal._id));

  });

  test('mock bundle: random Writing skips custom pairs, a hand-picked one is allowed', async () => {
    const lt = await createListeningTest();
    const rt = await createReadingTest();
    const sq = await createSpeakingQuestion({ part: 2 });
    const normal = await createWritingExam({ name: 'Normal exam' });
    const custom = await WritingExam.create({ name: 'Custom pair', isCustom: true });
    const picks = { listeningTestId: lt._id, readingTestId: rt._id, speakingQuestionId: sq._id };
    for (let i = 0; i < 8; i += 1) {
      const b = await mockTestService.resolveMockBundle(picks);
      expect(String(b.writingExamId)).toBe(String(normal._id));
    }
    const hand = await mockTestService.resolveMockBundle({ ...picks, writingExamId: custom._id });
    expect(String(hand.writingExamId)).toBe(String(custom._id));
  });
});

describe('assigning a custom exam with a required mode', () => {
  test('Thi thật: only a simulation attempt ticks it; link + simTime carry the mode', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await createClassGroup({ teacher: t });
    await enrollStudent(cls, s);
    const t1 = await createWritingTask1();
    const t2 = await createWritingTask2();
    const made = await request(app).post(CUSTOM_URL).set(authH(t)).send({ task1Id: t1._id, task2Id: t2._id });
    const examId = made.body.exam._id;

    const create = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t)).send({
      title: 'Week 1 mock', resources: [{ kind: 'internal', resourceType: 'writing_exam', resourceId: examId, examMode: 'simulation' }],
    });
    expect(create.status).toBe(201);
    const asgId = create.body.assignment ? create.body.assignment._id : create.body._id;
    const item = (create.body.assignment || create.body).resources[0];
    expect(item.examMode).toBe('simulation');

    const row = async () => {
      const mine = await request(app).get('/api/assignments/mine').set(authH(s));
      return mine.body.assignments.find((a) => a._id === String(asgId));
    };
    let r = await row();
    expect(r.resources[0].examMode).toBe('simulation');
    expect(r.resources[0].simTime).toEqual({ seconds: 3600, approx: false });

    // A full-length practice run does not count for a Thi thật item…
    await WritingAttempt.create({ userId: s._id, examId, examName: 'x', wordCount1: 170, wordCount2: 270, mode: 'practice' });
    r = await row();
    expect(r.done).toBe(0);
    // …a simulation run does.
    await WritingAttempt.create({ userId: s._id, examId, examName: 'x', wordCount1: 170, wordCount2: 270, mode: 'simulation' });
    r = await row();
    expect(r.status).toBe('completed');
  });

  test('no mode = any mode counts (old writing_exam behaviour)', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await createClassGroup({ teacher: t });
    await enrollStudent(cls, s);
    const exam = await createWritingExam();
    const asg = await createAssignment(cls, { resources: [{ kind: 'internal', resourceType: 'writing_exam', resourceId: exam._id }] });
    await WritingAttempt.create({ userId: s._id, examId: exam._id, examName: exam.name, wordCount1: 170, wordCount2: 270, mode: 'simulation' });
    const mine = await request(app).get('/api/assignments/mine').set(authH(s));
    expect(mine.body.assignments.find((a) => a._id === String(asg._id)).status).toBe('completed');
  });
});
