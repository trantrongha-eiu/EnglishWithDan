// Homework that requires a Reading / Listening item to be done in one mode —
// Luyện tập (practice) or Test Simulation (Assignment resources[].examMode).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createReadingTest, createPassage, createListeningSection, createListeningTest, createReadingPracticeAttempt } = require('../factories/contentFactory');
const ListeningSection = require('../../models/ListeningSection');
const ListeningTest = require('../../models/ListeningTest');
const { createClassGroup, enrollStudent } = require('../factories/classFactory');
const TestAttempt = require('../../models/TestAttempt');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');

const authH = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

async function setup() {
  const t = await createTeacher();
  const s = await createStudent();
  const cls = await createClassGroup({ teacher: t });
  await enrollStudent(cls, s);
  return { t, s, cls };
}
const post = (t, cls, resources) => request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t)).send({ title: 'HW', resources });
const mine = async (s, asgId) => (await request(app).get('/api/assignments/mine').set(authH(s))).body.assignments.find((a) => a._id === String(asgId));

describe('Reading / Listening homework pinned to one exam mode', () => {
  test('full test in simulation: a practice attempt does not count, a simulation one does', async () => {
    const { t, s, cls } = await setup();
    const rt = await createReadingTest();
    const res = await post(t, cls, [{ kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), examMode: 'simulation' }]);
    expect(res.status).toBe(201);
    expect(res.body.assignment.resources[0].examMode).toBe('simulation');

    let item = (await mine(s, res.body.assignment._id)).resources[0];
    expect(item.examMode).toBe('simulation');
    expect(item.completed).toBe(false);

    await TestAttempt.create({ userId: s._id, testId: rt._id, status: 'completed', mode: 'practice', correctCount: 38, totalQuestions: 40 });
    item = (await mine(s, res.body.assignment._id)).resources[0];
    expect(item.completed).toBe(false);

    // voided simulation run never counts
    await TestAttempt.create({ userId: s._id, testId: rt._id, status: 'disqualified', mode: 'simulation', correctCount: 38, totalQuestions: 40 });
    item = (await mine(s, res.body.assignment._id)).resources[0];
    expect(item.completed).toBe(false);

    await TestAttempt.create({ userId: s._id, testId: rt._id, status: 'completed', mode: 'simulation', correctCount: 30, totalQuestions: 40 });
    item = (await mine(s, res.body.assignment._id)).resources[0];
    expect(item.completed).toBe(true);
  });

  test('practice mode: an old attempt with no mode counts as practice; simulation does not', async () => {
    const { t, s, cls } = await setup();
    const p = await createPassage();
    const res = await post(t, cls, [{ kind: 'internal', resourceType: 'reading_practice', resourceId: String(p._id), examMode: 'practice' }]);
    expect(res.status).toBe(201);

    await createReadingPracticeAttempt({ userId: s._id, passageId: p._id, correctCount: 9, totalQuestions: 10, extra: { mode: 'simulation' } });
    expect((await mine(s, res.body.assignment._id)).resources[0].completed).toBe(false);

    await createReadingPracticeAttempt({ userId: s._id, passageId: p._id, correctCount: 9, totalQuestions: 10 });
    expect((await mine(s, res.body.assignment._id)).resources[0].completed).toBe(true);
  });

  test('no mode = any attempt counts (unchanged); mode + parts combine', async () => {
    const { t, s, cls } = await setup();
    const sec = await createListeningSection();
    const rt = await createReadingTest();
    const res = await post(t, cls, [
      { kind: 'internal', resourceType: 'listening_practice', resourceId: String(sec._id) },
      { kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), parts: [2], examMode: 'simulation' },
    ]);
    expect(res.status).toBe(201);
    const listening = res.body.assignment.resources.find((r) => r.resourceType === 'listening_practice');
    expect(listening.examMode).toBeUndefined();

    await ListeningPracticeAttempt.create({ userId: s._id, sectionId: sec._id, submittedAt: new Date(), correctCount: 8, totalQuestions: 10, mode: 'simulation' });
    await TestAttempt.create({ userId: s._id, testId: rt._id, status: 'completed', mode: 'practice', parts: [2], correctCount: 13, totalQuestions: 13 });
    let a = await mine(s, res.body.assignment._id);
    expect(a.resources.find((r) => r.resourceType === 'listening_practice').completed).toBe(true);
    expect(a.resources.find((r) => r.resourceType === 'reading_test').completed).toBe(false);

    await TestAttempt.create({ userId: s._id, testId: rt._id, status: 'completed', mode: 'simulation', parts: [1, 2], correctCount: 25, totalQuestions: 27 });
    a = await mine(s, res.body.assignment._id);
    expect(a.resources.find((r) => r.resourceType === 'reading_test').completed).toBe(true);
  });

  test('an invalid mode is rejected; a mode on a type without modes is dropped', async () => {
    const { t, cls } = await setup();
    const rt = await createReadingTest();
    const bad = await post(t, cls, [{ kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), examMode: 'exam' }]);
    expect(bad.status).toBe(400);

    const sec = await createListeningSection();
    const ok = await post(t, cls, [{ kind: 'internal', resourceType: 'dictation', resourceId: String(sec._id), examMode: 'simulation' }]);
    expect(ok.status).toBe(201);
    expect(ok.body.assignment.resources[0].examMode).toBeUndefined();
  });

  test('changing the mode on an edit makes it a different item', async () => {
    const { t, cls } = await setup();
    const rt = await createReadingTest();
    const res = await post(t, cls, [{ kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), examMode: 'practice' }]);
    const id = res.body.assignment._id;
    const firstItem = res.body.assignment.resources[0]._id;
    const same = await request(app).put(`/api/classes/${cls._id}/assignments/${id}`).set(authH(t))
      .send({ title: 'HW', resources: [{ kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), examMode: 'practice' }] });
    expect(same.body.assignment.resources[0]._id).toBe(firstItem);
    const changed = await request(app).put(`/api/classes/${cls._id}/assignments/${id}`).set(authH(t))
      .send({ title: 'HW', resources: [{ kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), examMode: 'simulation' }] });
    expect(changed.body.assignment.resources[0].examMode).toBe('simulation');
    expect(changed.body.assignment.resources[0]._id).not.toBe(firstItem);
  });

  test('Thi thật items carry the real exam length (simTime) the student sees', async () => {
    const { t, s, cls } = await setup();
    const rt = await createReadingTest();
    const p = await createPassage();
    const sec = await createListeningSection();
    await ListeningSection.updateOne({ _id: sec._id }, { audioDuration: 410 });
    const part = (n) => ({ partNumber: n, title: 'Part ' + n, questionRange: { start: n, end: n }, questionGroups: [] });
    const lt = await createListeningTest({ sections: [part(1), part(2), part(3), part(4)] });
    await ListeningTest.updateOne({ _id: lt._id }, { audioDuration: 1800 });
    // the stand-alone audio each section plays when given section by section
    const own = [400, 380, 460, 520];
    for (const n of [1, 2, 3, 4]) {
      const x = await createListeningSection({ partNumber: n, title: 'Part ' + n });
      await ListeningSection.updateOne({ _id: x._id }, { audioUrl: 'https://x/p' + n + '.mp3', audioDuration: own[n - 1] });
    }
    const res = await post(t, cls, [
      { kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), examMode: 'simulation' },
      { kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), parts: [1], examMode: 'simulation' },
      { kind: 'internal', resourceType: 'reading_practice', resourceId: String(p._id), examMode: 'simulation' },
      { kind: 'internal', resourceType: 'listening_practice', resourceId: String(sec._id), examMode: 'simulation' },
      { kind: 'internal', resourceType: 'listening_test', resourceId: String(lt._id), examMode: 'simulation' },
      { kind: 'internal', resourceType: 'listening_test', resourceId: String(lt._id), parts: [1, 2], examMode: 'simulation' },
      { kind: 'internal', resourceType: 'reading_practice', resourceId: String(p._id), examMode: 'practice' },
    ]);
    expect(res.status).toBe(201);
    const times = (await mine(s, res.body.assignment._id)).resources.map((r) => r.simTime);
    expect(times).toEqual([
      { seconds: 3600, approx: false },  // 3 passages × 20 phút
      { seconds: 1200, approx: false },  // Passage 1 only
      { seconds: 1200, approx: false },
      { seconds: 440, approx: false },   // audio + 30 s check
      { seconds: 1830, approx: false },
      { seconds: 810, approx: false },   // Section 1 + 2's own audio + 30 s
      null,                              // Luyện tập — no exam clock
    ]);
  });
});
