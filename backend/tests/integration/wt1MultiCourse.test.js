// Integration tests for the WT1 stack serving more than one course
// (Task 1 Writing = IELTS-W-T1, Task 2 Writing = IELTS-W-T2) off the same
// models/routes via ?course=. The main risk this locks down: a course's
// /overview must never leak another course's modules/lessons, and an
// unrecognised course value must fall back to Task 1 rather than erroring.
const request = require('supertest');
const app = require('../../app');
const { createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const WT1Course = require('../../models/WT1Course');
const WT1Module = require('../../models/WT1Module');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Exercise = require('../../models/WT1Exercise');

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

async function seedTwoCourses() {
  await WT1Course.findOneAndUpdate({ code: 'IELTS-W-T1' }, { code: 'IELTS-W-T1', title: 'T1' }, { upsert: true });
  await WT1Course.findOneAndUpdate({ code: 'IELTS-W-T2' }, { code: 'IELTS-W-T2', title: 'T2' }, { upsert: true });

  await WT1Module.findOneAndUpdate({ code: 'MC-T1-M1' }, { code: 'MC-T1-M1', courseCode: 'IELTS-W-T1', order: 1, title: 'T1 module' }, { upsert: true });
  await WT1Module.findOneAndUpdate({ code: 'MC-T2-M1' }, { code: 'MC-T2-M1', courseCode: 'IELTS-W-T2', order: 1, title: 'T2 module' }, { upsert: true });

  await WT1Lesson.findOneAndUpdate({ code: 'MC-T1-L1' },
    { code: 'MC-T1-L1', moduleCode: 'MC-T1-M1', order: 1, title: 'T1 lesson', published: true }, { upsert: true });
  await WT1Lesson.findOneAndUpdate({ code: 'MC-T2-L1' },
    { code: 'MC-T2-L1', moduleCode: 'MC-T2-M1', order: 1, title: 'T2 lesson', published: true }, { upsert: true });

  await WT1Exercise.deleteMany({ lessonCode: { $in: ['MC-T1-L1', 'MC-T2-L1'] } });
  await WT1Exercise.create([
    { code: 'MC-T1-L1-E1', lessonCode: 'MC-T1-L1', order: 1, type: 'mcq', title: 'x', published: true, autoGrade: true,
      items: [{ id: 'q1', prompt: 'p', options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'b' }], answer: 'A' }] },
    { code: 'MC-T2-L1-E1', lessonCode: 'MC-T2-L1', order: 1, type: 'mcq', title: 'y', published: true, autoGrade: true,
      items: [{ id: 'q1', prompt: 'p', options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'b' }], answer: 'A' }] },
  ]);
}

beforeEach(seedTwoCourses);

describe('GET /api/wt1/overview?course=', () => {
  test('IELTS-W-T2 overview only ever shows T2 modules/lessons', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/wt1/overview?course=IELTS-W-T2').set(bearer(u));
    expect(res.status).toBe(200);
    const codes = res.body.modules.map((m) => m.code);
    expect(codes).toContain('MC-T2-M1');
    expect(codes).not.toContain('MC-T1-M1');
    const mod = res.body.modules.find((m) => m.code === 'MC-T2-M1');
    expect(mod.lessons.map((l) => l.code)).toEqual(['MC-T2-L1']);
  });

  test('default (no ?course=) still shows Task 1, unaffected by T2 content', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/wt1/overview').set(bearer(u));
    expect(res.status).toBe(200);
    const codes = res.body.modules.map((m) => m.code);
    expect(codes).toContain('MC-T1-M1');
    expect(codes).not.toContain('MC-T2-M1');
  });

  test('an unrecognised ?course= value falls back to Task 1 rather than erroring', async () => {
    const u = await createPremiumStudent();
    const res = await request(app).get('/api/wt1/overview?course=NOT-A-REAL-COURSE').set(bearer(u));
    expect(res.status).toBe(200);
    expect(res.body.modules.map((m) => m.code)).toContain('MC-T1-M1');
  });

  test('a T2 lesson/exercise is independently reachable and checkable by code', async () => {
    const u = await createPremiumStudent();
    const lesson = await request(app).get('/api/wt1/lesson/MC-T2-L1').set(bearer(u));
    expect(lesson.status).toBe(200);
    expect(lesson.body.exercises.map((e) => e.code)).toEqual(['MC-T2-L1-E1']);
    const check = await request(app).post('/api/wt1/check').set(bearer(u))
      .send({ exerciseCode: 'MC-T2-L1-E1', answers: { q1: 'A' } });
    expect(check.status).toBe(200);
    expect(check.body.score).toBe(100);
  });
});
