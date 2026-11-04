// Homework that gives only some passages / sections of a full test
// (Assignment resources[].parts, mockBundle.listeningParts/readingParts).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createReadingTest, createListeningSection, createListeningTest, createWritingExam, createSpeakingQuestion } = require('../factories/contentFactory');
const { createClassGroup, enrollStudent } = require('../factories/classFactory');
const TestAttempt = require('../../models/TestAttempt');
const ListeningAttempt = require('../../models/ListeningAttempt');

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

const part = (partNumber, title) => ({
  partNumber, title, questionRange: { start: partNumber, end: partNumber },
  questionGroups: [{ groupType: 'plain', questions: [{ questionNumber: partNumber, type: 'fill-blank', questionText: 'q', correctAnswer: 'a' }] }],
});
// A 4-section test; withAudio = each section also exists stand-alone with its own audio.
async function listeningTest(withAudio) {
  const titles = [1, 2, 3, 4].map((n) => `Part ${n} ${Math.random().toString(36).slice(2, 8)}`);
  if (withAudio) {
    for (const [i, title] of titles.entries()) {
      await createListeningSection({ partNumber: i + 1, title, extra: { audioUrl: `https://cdn.example/p${i + 1}.mp3` } });
    }
  }
  return createListeningTest({ sections: titles.map((title, i) => part(i + 1, title)) });
}

describe('Reading / Listening test given part by part', () => {
  test('reading parts are stored normalised; only an attempt covering them counts', async () => {
    const { t, s, cls } = await setup();
    const rt = await createReadingTest();
    const res = await post(t, cls, [{ kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), parts: [3, 1, 3] }]);
    expect(res.status).toBe(201);
    expect(res.body.assignment.resources[0].parts).toEqual([1, 3]);

    let item = (await mine(s, res.body.assignment._id)).resources[0];
    expect(item.parts).toEqual([1, 3]);
    expect(item.completed).toBe(false);

    // Passage 1 only — doesn't cover passage 3
    await TestAttempt.create({ userId: s._id, testId: rt._id, status: 'completed', parts: [1], correctCount: 10, totalQuestions: 10 });
    item = (await mine(s, res.body.assignment._id)).resources[0];
    expect(item.completed).toBe(false);

    await TestAttempt.create({ userId: s._id, testId: rt._id, status: 'completed', parts: [1, 3], correctCount: 20, totalQuestions: 26 });
    item = (await mine(s, res.body.assignment._id)).resources[0];
    expect(item.completed).toBe(true);
  });

  test('a whole-test attempt also counts for a part item; a partial attempt does not count for a whole-test item', async () => {
    const { t, s, cls } = await setup();
    const rt = await createReadingTest();
    const res = await post(t, cls, [
      { kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), parts: [2] },
    ]);
    const whole = await post(t, cls, [{ kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id) }]);
    await TestAttempt.create({ userId: s._id, testId: rt._id, status: 'completed', parts: [2, 3], correctCount: 25, totalQuestions: 27 });
    expect((await mine(s, res.body.assignment._id)).resources[0].completed).toBe(true);
    expect((await mine(s, whole.body.assignment._id)).resources[0].completed).toBe(false);

    await TestAttempt.create({ userId: s._id, testId: rt._id, status: 'completed', correctCount: 35, totalQuestions: 40 });
    expect((await mine(s, whole.body.assignment._id)).resources[0].completed).toBe(true);
  });

  test('every part ticked = the whole test (no parts stored)', async () => {
    const { t, cls } = await setup();
    const rt = await createReadingTest();
    const res = await post(t, cls, [{ kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), parts: [1, 2, 3] }]);
    expect(res.status).toBe(201);
    expect(res.body.assignment.resources[0].parts).toBeUndefined();
  });

  test('listening sections need their own audio; the catalog says which tests can be split', async () => {
    const { t, s, cls } = await setup();
    const noAudio = await listeningTest(false);
    const ok = await listeningTest(true);

    const cat = await request(app).get('/api/classes/resources/catalog?type=listening_test').set(authH(t));
    const byId = Object.fromEntries(cat.body.items.map((i) => [String(i._id), i.partsPickable]));
    expect(byId[String(noAudio._id)]).toBe(false);
    expect(byId[String(ok._id)]).toBe(true);

    const bad = await post(t, cls, [{ kind: 'internal', resourceType: 'listening_test', resourceId: String(noAudio._id), parts: [1, 2] }]);
    expect(bad.status).toBe(400);
    expect(bad.body.message).toMatch(/audio riêng/);

    const good = await post(t, cls, [{ kind: 'internal', resourceType: 'listening_test', resourceId: String(ok._id), parts: [1, 2, 4] }]);
    expect(good.status).toBe(201);
    await ListeningAttempt.create({ userId: s._id, testId: ok._id, status: 'completed', parts: [1, 2, 4], correctCount: 3, totalQuestions: 3 });
    const item = (await mine(s, good.body.assignment._id)).resources[0];
    expect(item.parts).toEqual([1, 2, 4]);
    expect(item.completed).toBe(true);
  });

  test('a split listening test only brings the gap-fills of the picked sections', async () => {
    const { t, cls } = await setup();
    const gf = { gapFillPublished: true, gapFillTemplate: 'x [[1]]', gapFillAnswers: ['y'] };
    const titles = ['GF one', 'GF two', 'GF three', 'GF four'].map((x) => `${x} ${Math.random().toString(36).slice(2, 6)}`);
    const secs = [];
    for (const [i, title] of titles.entries()) {
      secs.push(await createListeningSection({ partNumber: i + 1, title, extra: { ...gf, audioUrl: `https://cdn.example/${i}.mp3` } }));
    }
    const test = await createListeningTest({ sections: titles.map((title, i) => part(i + 1, title)) });
    const res = await post(t, cls, [{ kind: 'internal', resourceType: 'listening_test', resourceId: String(test._id), parts: [2, 4] }]);
    expect(res.status).toBe(201);
    expect(res.body.assignment.resources.map((r) => `${r.resourceType}:${r.resourceId}`)).toEqual([
      `listening_test:${test._id}`, `listening_gapfill:${secs[1]._id}`, `listening_gapfill:${secs[3]._id}`,
    ]);
  });

  test('changing the parts on an edit makes it a new item', async () => {
    const { t, cls } = await setup();
    const rt = await createReadingTest();
    const res = await post(t, cls, [{ kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), parts: [1] }]);
    const id0 = String(res.body.assignment.resources[0]._id);
    const same = await request(app).put(`/api/classes/${cls._id}/assignments/${res.body.assignment._id}`).set(authH(t))
      .send({ resources: [{ kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), parts: [1] }] });
    expect(String(same.body.assignment.resources[0]._id)).toBe(id0);
    const changed = await request(app).put(`/api/classes/${cls._id}/assignments/${res.body.assignment._id}`).set(authH(t))
      .send({ resources: [{ kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id), parts: [1, 2] }] });
    expect(String(changed.body.assignment.resources[0]._id)).not.toBe(id0);
    expect(changed.body.assignment.resources[0].parts).toEqual([1, 2]);
  });
});

describe('mock test given with only some sections / passages', () => {
  async function pools() {
    return {
      we: await createWritingExam(),
      sq: await createSpeakingQuestion({ part: 2, cueCard: 'Describe a place' }),
      rt: await createReadingTest(),
    };
  }
  const mock = (mockBundle) => [{ kind: 'internal', resourceType: 'mock_test', resourceId: null, mockBundle }];

  test('parts are kept on the bundle and copied onto the student run', async () => {
    const { t, s, cls } = await setup();
    const p = await pools();
    const lt = await listeningTest(true);
    const res = await post(t, cls, mock({ listeningTestId: String(lt._id), readingTestId: String(p.rt._id), listeningParts: [1, 2, 4], readingParts: [3] }));
    expect(res.status).toBe(201);
    const item = res.body.assignment.resources[0];
    expect(item.mockBundle.listeningParts).toEqual([1, 2, 4]);
    expect(item.mockBundle.readingParts).toEqual([3]);

    const row = await mine(s, res.body.assignment._id);
    expect(row.resources[0].mockParts).toEqual({ listening: [1, 2, 4], reading: [3] });

    const run = await request(app).post('/api/mock-test/start').set(authH(s)).send({ assignmentId: res.body.assignment._id, itemId: item._id });
    expect(run.status).toBeLessThan(300);
    expect(run.body.attempt.bundle.listeningParts).toEqual([1, 2, 4]);
    expect(run.body.attempt.bundle.readingParts).toEqual([3]);
  });

  test('picked sections on a test without per-section audio are refused; a random draw only lands on a splittable test', async () => {
    const { t, cls } = await setup();
    await pools();
    const noAudio = await listeningTest(false);
    const bad = await post(t, cls, mock({ listeningTestId: String(noAudio._id), listeningParts: [1] }));
    expect(bad.status).toBe(400);

    const ok = await listeningTest(true);
    const res = await post(t, cls, mock({ listeningParts: [2, 3] }));
    expect(res.status).toBe(201);
    expect(String(res.body.assignment.resources[0].mockBundle.listeningTestId)).toBe(String(ok._id));
  });

  test('changing only the parts of a fixed bundle gives a new item id', async () => {
    const { t, cls } = await setup();
    const p = await pools();
    const lt = await listeningTest(true);
    const base = { listeningTestId: String(lt._id), readingTestId: String(p.rt._id), writingExamId: String(p.we._id), speakingQuestionId: String(p.sq._id) };
    const res = await post(t, cls, mock(base));
    const item = res.body.assignment.resources[0];
    const url = `/api/classes/${cls._id}/assignments/${res.body.assignment._id}`;
    const same = await request(app).put(url).set(authH(t)).send({ resources: mock(item.mockBundle) });
    expect(String(same.body.assignment.resources[0]._id)).toBe(String(item._id));
    const changed = await request(app).put(url).set(authH(t)).send({ resources: mock({ ...item.mockBundle, readingParts: [1, 2] }) });
    expect(String(changed.body.assignment.resources[0]._id)).not.toBe(String(item._id));
    expect(changed.body.assignment.resources[0].mockBundle.readingParts).toEqual([1, 2]);
  });
});
