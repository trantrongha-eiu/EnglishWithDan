// Class homework "Thi thử full 4 kỹ năng" — the teacher assigns ONE fixed
// bundle and every student's run uses exactly those tests, even when the
// teacher left a skill on "random" (drawn once, at assign time).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createReadingTest, createListeningTest, createWritingExam, createSpeakingQuestion } = require('../factories/contentFactory');
const { createClassGroup, enrollStudent } = require('../factories/classFactory');
const Assignment = require('../../models/Assignment');
const MockTestAttempt = require('../../models/MockTestAttempt');
const mockTestService = require('../../services/mockTestService');

const authH = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

// Several tests per skill so a per-student random draw would almost surely differ.
async function seedPools(n = 4) {
  const pools = { lt: [], rt: [], we: [], sq: [] };
  for (let i = 0; i < n; i++) {
    pools.lt.push(await createListeningTest());
    pools.rt.push(await createReadingTest());
    pools.we.push(await createWritingExam());
    pools.sq.push(await createSpeakingQuestion({ part: 2, cueCard: `Describe thing ${i}` }));
  }
  return pools;
}

async function setup(nStudents = 2) {
  const teacher = await createTeacher();
  const cls = await createClassGroup({ teacher });
  const students = [];
  for (let i = 0; i < nStudents; i++) {
    const s = await createStudent();
    await enrollStudent(cls, s);
    students.push(s);
  }
  return { teacher, cls, students };
}

async function assignMock(teacher, cls, mockBundle) {
  const res = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(teacher))
    .send({ title: 'Mock tuần 5', resources: [{ kind: 'internal', resourceType: 'mock_test', resourceId: null, ...(mockBundle ? { mockBundle } : {}) }] });
  return res;
}

const bundleIds = (b) => [b.listeningTestId, b.readingTestId, b.writingExamId, b.speakingQuestionId].map(String);

describe('assigning a class mock test', () => {
  test('all-random picks are drawn once at assign time and stored on the item', async () => {
    await seedPools();
    const { teacher, cls } = await setup(0);
    const res = await assignMock(teacher, cls);
    expect(res.status).toBe(201);
    const item = res.body.assignment.resources[0];
    expect(item.mockBundle).toBeTruthy();
    expect(bundleIds(item.mockBundle).every((x) => x && x !== 'undefined')).toBe(true);
    expect(item.mockBundle.listeningTestName).toBeTruthy();
  });

  test('a picked test per skill is honoured; the rest are filled', async () => {
    const pools = await seedPools();
    const { teacher, cls } = await setup(0);
    const res = await assignMock(teacher, cls, { listeningTestId: String(pools.lt[2]._id), writingExamId: String(pools.we[1]._id) });
    expect(res.status).toBe(201);
    const b = res.body.assignment.resources[0].mockBundle;
    expect(String(b.listeningTestId)).toBe(String(pools.lt[2]._id));
    expect(String(b.writingExamId)).toBe(String(pools.we[1]._id));
    expect(b.readingTestId).toBeTruthy();
    expect(b.speakingQuestionId).toBeTruthy();
  });

  test('rejects an inactive / non-Part-2 pick and a second mock in one assignment', async () => {
    const pools = await seedPools(1);
    const p1 = await createSpeakingQuestion({ part: 1 });
    const { teacher, cls } = await setup(0);
    expect((await assignMock(teacher, cls, { speakingQuestionId: String(p1._id) })).status).toBe(400);
    const two = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(teacher))
      .send({ title: 'x', resources: [{ kind: 'internal', resourceType: 'mock_test' }, { kind: 'internal', resourceType: 'mock_test' }] });
    expect(two.status).toBe(400);
    expect(pools.lt.length).toBe(1);
  });

  test('editing the assignment with the same bundle keeps it (and the item _id) — never re-drawn', async () => {
    await seedPools();
    const { teacher, cls } = await setup(0);
    const created = (await assignMock(teacher, cls)).body.assignment;
    const item = created.resources[0];
    const res = await request(app).put(`/api/classes/${cls._id}/assignments/${created._id}`).set(authH(teacher))
      .send({ title: 'renamed', resources: [{ kind: 'internal', resourceType: 'mock_test', resourceId: null, mockBundle: item.mockBundle }] });
    expect(res.status).toBe(200);
    const after = res.body.assignment.resources[0];
    expect(String(after._id)).toBe(String(item._id));
    expect(bundleIds(after.mockBundle)).toEqual(bundleIds(item.mockBundle));
  });
});

describe('each new class mock draws tests the class has not had yet', () => {
  const lrw = (b) => [b.listeningTestId, b.readingTestId, b.writingExamId].map(String);

  test('successive random mocks never repeat a Listening / Reading / Writing test', async () => {
    await seedPools(3);
    const { teacher, cls } = await setup(0);
    const seen = { l: new Set(), r: new Set(), w: new Set() };
    for (let i = 0; i < 3; i++) {
      const res = await assignMock(teacher, cls);
      expect(res.status).toBe(201);
      const [l, r, w] = lrw(res.body.assignment.resources[0].mockBundle);
      expect(seen.l.has(l) || seen.r.has(r) || seen.w.has(w)).toBe(false);
      seen.l.add(l); seen.r.add(r); seen.w.add(w);
    }
    // pool used up → a 4th random mock is refused with a clear message
    const out = await assignMock(teacher, cls);
    expect(out.status).toBe(400);
    expect(out.body.message).toMatch(/giao hết/);
  });

  test('a stand-alone test homework counts as given; another class is unaffected; a hand pick is allowed', async () => {
    const pools = await seedPools(2);
    const { teacher, cls } = await setup(0);
    await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(teacher))
      .send({ title: 'Listening 1', resources: [{ kind: 'internal', resourceType: 'listening_test', resourceId: String(pools.lt[0]._id) }] });
    const b = (await assignMock(teacher, cls)).body.assignment.resources[0].mockBundle;
    expect(String(b.listeningTestId)).toBe(String(pools.lt[1]._id));

    const other = await createClassGroup({ teacher });
    expect((await assignMock(teacher, other)).status).toBe(201);

    const picked = await assignMock(teacher, cls, { listeningTestId: String(pools.lt[0]._id) });
    expect(picked.status).toBe(201);
    expect(String(picked.body.assignment.resources[0].mockBundle.listeningTestId)).toBe(String(pools.lt[0]._id));
  });

  test("re-drawing while editing an assignment may reuse its own old tests but not those of other assignments", async () => {
    const pools = await seedPools(2);
    const { teacher, cls } = await setup(0);
    const first = (await assignMock(teacher, cls)).body.assignment;
    const second = (await assignMock(teacher, cls)).body.assignment;
    const firstL = String(first.resources[0].mockBundle.listeningTestId);
    // change only Speaking on the 2nd → the rest is re-drawn, still avoiding the 1st mock's tests
    const res = await request(app).put(`/api/classes/${cls._id}/assignments/${second._id}`).set(authH(teacher))
      .send({ resources: [{ kind: 'internal', resourceType: 'mock_test', resourceId: null, mockBundle: { speakingQuestionId: String(pools.sq[1]._id) } }] });
    expect(res.status).toBe(200);
    expect(String(res.body.assignment.resources[0].mockBundle.listeningTestId)).not.toBe(firstL);
  });
});

describe('students taking the class mock test', () => {
  test('every student gets exactly the assigned bundle', async () => {
    await seedPools(5);
    const { teacher, cls, students } = await setup(3);
    const asg = (await assignMock(teacher, cls)).body.assignment;
    const item = asg.resources[0];
    for (const s of students) {
      const res = await request(app).post('/api/mock-test/start').set(authH(s)).send({ assignmentId: asg._id, itemId: item._id });
      expect(res.status).toBe(201);
      expect(bundleIds(res.body.attempt.bundle)).toEqual(bundleIds(item.mockBundle));
      expect(res.body.attempt.assignmentId).toBe(String(asg._id));
    }
  });

  test('re-starting resumes the same run; another open run must be discarded first', async () => {
    await seedPools();
    const { teacher, cls, students: [s] } = await setup(1);
    const asg = (await assignMock(teacher, cls)).body.assignment;
    const body = { assignmentId: asg._id, itemId: asg.resources[0]._id };

    // a self-started random mock is open → assigned start refuses to hijack it
    await request(app).post('/api/mock-test/start').set(authH(s)).send({});
    const blocked = await request(app).post('/api/mock-test/start').set(authH(s)).send(body);
    expect(blocked.status).toBe(409);
    expect(blocked.body.code).toBe('MOCK_OPEN_OTHER');

    await request(app).delete('/api/mock-test/current').set(authH(s));
    const first = await request(app).post('/api/mock-test/start').set(authH(s)).send(body);
    expect(first.status).toBe(201);
    const again = await request(app).post('/api/mock-test/start').set(authH(s)).send(body);
    expect(again.status).toBe(200);
    expect(again.body.resumed).toBe(true);
    expect(again.body.attempt._id).toBe(first.body.attempt._id);
  });

  test('a student outside the class cannot start it', async () => {
    await seedPools();
    const { teacher, cls } = await setup(0);
    const asg = (await assignMock(teacher, cls)).body.assignment;
    const outsider = await createStudent();
    const res = await request(app).post('/api/mock-test/start').set(authH(outsider))
      .send({ assignmentId: asg._id, itemId: asg.resources[0]._id });
    expect(res.status).toBe(403);
    expect(await MockTestAttempt.countDocuments({ userId: outsider._id })).toBe(0);
  });

  test('homework ticks once Listening → Reading → Writing are submitted; teacher sees the run', async () => {
    await seedPools();
    const { teacher, cls, students: [s, other] } = await setup(2);
    const asg = (await assignMock(teacher, cls)).body.assignment;
    const itemId = asg.resources[0]._id;
    const run = (await request(app).post('/api/mock-test/start').set(authH(s)).send({ assignmentId: asg._id, itemId })).body.attempt;

    // a random self-started mock finished by the other student must NOT count
    const free = await mockTestService.startMockTest(other._id);
    for (const sk of ['listening', 'reading', 'writing']) await mockTestService.advance(other._id, free.attempt._id, { skill: sk, attemptId: null });

    await mockTestService.advance(s._id, run._id, { skill: 'listening', attemptId: null });
    let mine = await request(app).get('/api/assignments/mine').set(authH(s));
    let res = mine.body.assignments[0].resources[0];
    expect(res.fixedMock).toBe(true);
    expect(res.completed).toBe(false);
    expect(res.mock.progress).toBe('reading');
    expect(res).not.toHaveProperty('mockBundle'); // test names stay teacher-side

    await mockTestService.advance(s._id, run._id, { skill: 'reading', attemptId: null });
    await mockTestService.advance(s._id, run._id, { skill: 'writing', attemptId: null });
    mine = await request(app).get('/api/assignments/mine').set(authH(s));
    res = mine.body.assignments[0].resources[0];
    expect(res.completed).toBe(true);
    expect(mine.body.assignments[0].status).toBe('completed');

    const table = await request(app).get(`/api/classes/${cls._id}/assignments/${asg._id}`).set(authH(teacher));
    const byStudent = Object.fromEntries(table.body.rows.map((r) => [String(r.studentId), r]));
    expect(byStudent[String(s._id)].status).toBe('completed');
    expect(byStudent[String(s._id)].items[0].mock.runId).toBe(run._id);
    expect(byStudent[String(other._id)].status).not.toBe('completed');
  });

  test('discarding the pending Speaking step keeps the homework done; discarding mid-sitting-1 does not count', async () => {
    await seedPools();
    const { teacher, cls, students: [s, t] } = await setup(2);
    const asg = (await assignMock(teacher, cls)).body.assignment;
    const body = { assignmentId: asg._id, itemId: asg.resources[0]._id };

    const runS = (await request(app).post('/api/mock-test/start').set(authH(s)).send(body)).body.attempt;
    for (const sk of ['listening', 'reading', 'writing']) await mockTestService.advance(s._id, runS._id, { skill: sk, attemptId: null });
    await request(app).delete('/api/mock-test/current').set(authH(s)); // drops the Speaking step
    let item = (await request(app).get('/api/assignments/mine').set(authH(s))).body.assignments[0].resources[0];
    expect(item.completed).toBe(true);

    const runT = (await request(app).post('/api/mock-test/start').set(authH(t)).send(body)).body.attempt;
    await mockTestService.advance(t._id, runT._id, { skill: 'listening', attemptId: null });
    await request(app).delete('/api/mock-test/current').set(authH(t));
    item = (await request(app).get('/api/assignments/mine').set(authH(t))).body.assignments[0].resources[0];
    expect(item.completed).toBe(false);
    expect(item.mock).toBeNull();
  });

  test('a run voided for proctoring does not count', async () => {
    await seedPools();
    const { teacher, cls, students: [s] } = await setup(1);
    const asg = (await assignMock(teacher, cls)).body.assignment;
    const run = (await request(app).post('/api/mock-test/start').set(authH(s)).send({ assignmentId: asg._id, itemId: asg.resources[0]._id })).body.attempt;
    for (const sk of ['listening', 'reading', 'writing']) await mockTestService.advance(s._id, run._id, { skill: sk, attemptId: null });
    await MockTestAttempt.updateOne({ _id: run._id }, { status: 'disqualified' });
    const mine = await request(app).get('/api/assignments/mine').set(authH(s));
    expect(mine.body.assignments[0].resources[0].completed).toBe(false);
  });

  test('legacy bundle-less mock items keep the old "any completed run" rule', async () => {
    await seedPools();
    const { teacher, cls, students: [s] } = await setup(1);
    const asg = await Assignment.create({
      classId: cls._id, teacherId: teacher._id, title: 'old',
      resources: [{ kind: 'internal', resourceType: 'mock_test', resourceId: null, label: 'Thi thử 4 kỹ năng' }],
    });
    const free = await mockTestService.startMockTest(s._id);
    await MockTestAttempt.updateOne({ _id: free.attempt._id }, { status: 'completed', progress: 'done' });
    const mine = await request(app).get('/api/assignments/mine').set(authH(s));
    const row = mine.body.assignments.find((a) => String(a._id) === String(asg._id));
    expect(row.resources[0].fixedMock).toBe(false);
    expect(row.resources[0].completed).toBe(true);
  });
});
