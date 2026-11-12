// Regression tests from the 2026-11-12 Dashboard debug pass:
//  - vocab practice: the 1–4 answers left after the last 5-answer batch are
//    accepted when they carry the session id (Búa Daniel / daily target)
//  - practice-complete: junk counts / unitId no longer reach the maths or 500
//  - /assignments/mine exposes the class's homework thresholds
//  - image homework rejects non-http(s) urls
//  - saving a class's warning threshold keeps the reminder threshold in step
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createClassGroup, enrollStudent } = require('../factories/classFactory');
const ClassGroup = require('../../models/ClassGroup');
const vocabBookService = require('../../services/vocabBookService');

const authH = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

describe('vocab practice-complete — closing batch & input hygiene', () => {
  test('a 3-answer closing batch WITH a sessionId is accepted', async () => {
    const s = await createStudent();
    const r = await vocabBookService.completePractice(s, { wordsAnswered: 3, correctAnswered: 3, sessionId: 'v-test-1' });
    expect(r.status).not.toBe('too_few');
  });

  test('without a sessionId the old ≥5 rule still applies', async () => {
    const s = await createStudent();
    const r = await vocabBookService.completePractice(s, { wordsAnswered: 3, correctAnswered: 3 });
    expect(r.status).toBe('too_few');
  });

  test('string / junk counts and a bad unitId are a clean response, not a 500', async () => {
    const s = await createStudent();
    const res = await request(app).post('/api/vocabbook/practice-complete').set(authH(s))
      .send({ wordsAnswered: 'abc', correctAnswered: { $gt: 0 }, unitId: 'not-an-id', unitType: 'paraphrase', sessionId: 'v-x' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false); // 0 answers → too_few
  });

  test('correct can never exceed answered', async () => {
    const s = await createStudent();
    const res = await request(app).post('/api/vocabbook/practice-complete').set(authH(s))
      .send({ wordsAnswered: 5, correctAnswered: 500, sessionId: 'v-y' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('homework thresholds on the student dashboard', () => {
  test('/assignments/mine returns the class policy thresholds', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await createClassGroup({ teacher: t });
    await ClassGroup.updateOne({ _id: cls._id }, { $set: { 'policy.homeworkLockThreshold': 1, 'policy.homeworkWarnThreshold': 3, 'policy.homeworkFailThreshold': 6 } });
    await enrollStudent(cls, s);
    const res = await request(app).get('/api/assignments/mine').set(authH(s));
    expect(res.status).toBe(200);
    expect(res.body.homeworkPolicy).toEqual({ lockThreshold: 1, warnThreshold: 3, failThreshold: 6 });
  });

  test('saving the warning threshold also moves the reminder threshold', async () => {
    const t = await createTeacher();
    const cls = await createClassGroup({ teacher: t });
    const res = await request(app).put(`/api/classes/${cls._id}`).set(authH(t))
      .send({ policy: { homeworkWarnThreshold: 2, homeworkMissThreshold: 4 } });
    expect(res.status).toBe(200);
    const fresh = await ClassGroup.findById(cls._id).lean();
    expect(fresh.policy.homeworkWarnThreshold).toBe(2);
    expect(fresh.policy.homeworkMissThreshold).toBe(2);
  });

  test('a non-numeric policy value is ignored instead of 500-ing', async () => {
    const t = await createTeacher();
    const cls = await createClassGroup({ teacher: t });
    const res = await request(app).put(`/api/classes/${cls._id}`).set(authH(t))
      .send({ policy: { homeworkFailThreshold: 'abc' } });
    expect(res.status).toBe(200);
  });
});

describe('image homework urls', () => {
  test('a javascript: image url is rejected', async () => {
    const t = await createTeacher();
    const cls = await createClassGroup({ teacher: t });
    const res = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t)).send({
      title: 'HW', resources: [{ kind: 'image', images: [{ url: 'javascript:alert(1)' }], title: 'x' }],
    });
    expect(res.status).toBe(400);
  });
});
