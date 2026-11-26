// Full Mock Test page — "Bài thi Full Mock Test của lớp": the class mock
// items a student still has to sit (GET /api/mock-test/class), and the
// teacher's "Điểm yêu cầu" (resources[].requiredBand) on a class mock.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createReadingTest, createListeningTest, createWritingExam, createSpeakingQuestion } = require('../factories/contentFactory');
const { createClassGroup, enrollStudent } = require('../factories/classFactory');
const MockTestAttempt = require('../../models/MockTestAttempt');

const authH = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

async function seed() {
  // two of each: a second class mock can't re-draw a test the class already had
  for (let i = 0; i < 2; i += 1) {
    await createListeningTest();
    await createReadingTest();
    await createWritingExam();
    await createSpeakingQuestion({ part: 2, cueCard: `Describe a place ${i}` });
  }
  const teacher = await createTeacher();
  const cls = await createClassGroup({ teacher, name: 'IELTS 6.5 K12' });
  const s = await createStudent();
  await enrollStudent(cls, s);
  return { teacher, cls, s };
}

const assign = (teacher, cls, extra = {}) => request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(teacher))
  .send({ title: 'Full Mock Test – IELTS 6.5 K12 – 29/11/2026', instruction: 'Làm bài nghiêm túc', resources: [{ kind: 'internal', resourceType: 'mock_test', resourceId: null, mockBundle: {}, ...extra }] });

describe('class mock "Điểm yêu cầu"', () => {
  test('a valid band is stored; junk is dropped; editing only the band keeps the item _id', async () => {
    const { teacher, cls } = await seed();
    const res = await assign(teacher, cls, { requiredBand: 6.5 });
    expect(res.status).toBe(201);
    const item = res.body.assignment.resources[0];
    expect(item.requiredBand).toBe(6.5);

    const put = await request(app).put(`/api/classes/${cls._id}/assignments/${res.body.assignment._id}`).set(authH(teacher))
      .send({ title: 'x', resources: [{ kind: 'internal', resourceType: 'mock_test', resourceId: null, mockBundle: item.mockBundle, requiredBand: 6 }] });
    expect(put.status).toBe(200);
    expect(put.body.assignment.resources[0].requiredBand).toBe(6);
    expect(String(put.body.assignment.resources[0]._id)).toBe(String(item._id));

    const junk = await assign(teacher, cls, { requiredBand: 6.3 });
    expect(junk.body.assignment.resources[0].requiredBand).toBeUndefined();
  });
});

describe('GET /api/mock-test/class', () => {
  test('lists the pending class mock with class name, notice, band; drops it once done', async () => {
    const { teacher, cls, s } = await seed();
    const created = (await assign(teacher, cls, { requiredBand: 6 })).body.assignment;
    let res = await request(app).get('/api/mock-test/class').set(authH(s));
    expect(res.status).toBe(200);
    expect(res.body.mocks).toHaveLength(1);
    expect(res.body.mocks[0]).toMatchObject({
      assignmentId: String(created._id), itemId: String(created.resources[0]._id),
      title: 'Full Mock Test – IELTS 6.5 K12 – 29/11/2026', className: 'IELTS 6.5 K12',
      instruction: 'Làm bài nghiêm túc', requiredBand: 6, open: false,
    });

    // Start it from the page (same body the homework card sends) → open run.
    const start = await request(app).post('/api/mock-test/start').set(authH(s))
      .send({ assignmentId: created._id, itemId: created.resources[0]._id });
    expect([200, 201]).toContain(start.status);
    res = await request(app).get('/api/mock-test/class').set(authH(s));
    expect(res.body.mocks[0].open).toBe(true);

    // Sitting 1 finished and the run closed → no longer listed.
    await MockTestAttempt.updateOne({ _id: start.body.attempt._id }, { $set: { status: 'completed', progress: 'done', sitting1CompletedAt: new Date() } });
    res = await request(app).get('/api/mock-test/class').set(authH(s));
    expect(res.body.mocks).toHaveLength(0);
  });

  test('a student in no class gets an empty list', async () => {
    const s = await createStudent();
    const res = await request(app).get('/api/mock-test/class').set(authH(s));
    expect(res.status).toBe(200);
    expect(res.body.mocks).toEqual([]);
  });
});
