// Integration tests for the homework/assignments feature
// (routes/classAssignments.js + routes/assignment.js). Focus: per-teacher
// authorization, student scoping (can't reach another class's homework),
// internal-resource auto-completion from real attempt history, manual ticks
// for external/image items, deadline/overdue, and the homework warning.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createReadingTest, createListeningSection } = require('../factories/contentFactory');
const { createClassGroup, enrollStudent, createAssignment, seedInternalCompletion } = require('../factories/classFactory');
const Assignment = require('../../models/Assignment');
const AssignmentProgress = require('../../models/AssignmentProgress');

const authH = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const past = (d) => new Date(Date.now() - d * 864e5).toISOString();

async function makeClassWith(teacher, students = []) {
  const cls = await createClassGroup({ teacher });
  const enrs = [];
  for (const s of students) enrs.push(await enrollStudent(cls, s));
  return { cls, enrs };
}

describe('auth gate', () => {
  test('401 no token / 403 student on teacher routes', async () => {
    const t = await createTeacher();
    const { cls } = await makeClassWith(t);
    expect((await request(app).get(`/api/classes/${cls._id}/assignments`)).status).toBe(401);
    const s = await createStudent();
    expect((await request(app).get(`/api/classes/${cls._id}/assignments`).set(authH(s))).status).toBe(403);
  });
});

describe('per-teacher scoping', () => {
  test("teacher A cannot list/create/read assignments in teacher B's class", async () => {
    const a = await createTeacher();
    const b = await createTeacher();
    const { cls: clsB } = await makeClassWith(b);
    const asg = await createAssignment(clsB);

    expect((await request(app).get(`/api/classes/${clsB._id}/assignments`).set(authH(a))).status).toBe(403);
    expect((await request(app).post(`/api/classes/${clsB._id}/assignments`).set(authH(a)).send({ title: 'x', resources: [{ kind: 'external', url: 'https://x.com' }] })).status).toBe(403);
    expect((await request(app).get(`/api/classes/${clsB._id}/assignments/${asg._id}`).set(authH(a))).status).toBe(403);
  });

  test('admin can read any class assignments', async () => {
    const b = await createTeacher();
    const admin = await createAdmin();
    const { cls } = await makeClassWith(b);
    await createAssignment(cls);
    expect((await request(app).get(`/api/classes/${cls._id}/assignments`).set(authH(admin))).status).toBe(200);
  });
});

describe('create assignment', () => {
  test('mixed internal + external + image resources; bogus internal id → 400', async () => {
    const t = await createTeacher();
    const { cls } = await makeClassWith(t);
    const rt = await createReadingTest();

    const ok = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t)).send({
      title: 'Homework Week 1',
      instruction: 'Làm hết trước Chủ nhật',
      deadline: new Date(Date.now() + 5 * 864e5).toISOString(),
      resources: [
        { kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id) },
        { kind: 'external', url: 'https://bbc.co.uk/learningenglish', title: 'BBC' },
        { kind: 'image', images: [{ url: 'https://res.cloudinary.com/x/img.jpg', publicId: 'x' }], title: 'Task 2 prompt' },
      ],
    });
    expect(ok.status).toBe(201);
    expect(ok.body.assignment.resources).toHaveLength(3);
    expect(ok.body.assignment.resources[0].label).toBe(rt.name);

    const bad = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t)).send({
      title: 'Bad', resources: [{ kind: 'internal', resourceType: 'reading_test', resourceId: '5f'.padEnd(24, '0') }],
    });
    expect(bad.status).toBe(400);
  });

  test('creating an assignment messages every enrolled student', async () => {
    const t = await createTeacher();
    const s1 = await createStudent();
    const s2 = await createStudent();
    const { cls } = await makeClassWith(t, [s1, s2]);
    await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t)).send({
      title: 'HW', resources: [{ kind: 'external', url: 'https://x.com', title: 'x' }],
    });
    const inbox = await request(app).get('/api/user/messages').set(authH(s1));
    expect(inbox.body.messages.some((m) => m.subject.includes('Bài tập mới'))).toBe(true);
  });
});

describe('student scoping', () => {
  test('student sees only their own classes\' assignments; cannot read another class\'s by id', async () => {
    const t = await createTeacher();
    const inClass = await createStudent();
    const outsider = await createStudent();
    const { cls } = await makeClassWith(t, [inClass]);
    const asg = await createAssignment(cls);

    const mine = await request(app).get('/api/assignments/mine').set(authH(inClass));
    expect(mine.body.assignments.map((a) => a._id)).toContain(String(asg._id));

    const notMine = await request(app).get('/api/assignments/mine').set(authH(outsider));
    expect(notMine.body.assignments).toHaveLength(0);
    expect(notMine.body.hasClasses).toBe(false);

    expect((await request(app).get(`/api/assignments/${asg._id}`).set(authH(outsider))).status).toBe(403);
  });

  test('no enrollment → empty; class with no assignment → empty list', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    await makeClassWith(t, [s]); // enrolled, but no assignments
    const res = await request(app).get('/api/assignments/mine').set(authH(s));
    expect(res.body.assignments).toHaveLength(0);
    expect(res.body.hasClasses).toBe(true);
  });
});

describe('completion tracking', () => {
  test('internal resource auto-completes from real attempt history', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls } = await makeClassWith(t, [s]);
    const rt = await createReadingTest();
    const sec = await createListeningSection();
    const asg = await createAssignment(cls, {
      resources: [
        { kind: 'internal', resourceType: 'reading_test', resourceId: rt._id },
        { kind: 'internal', resourceType: 'listening_practice', resourceId: sec._id },
      ],
    });

    let mine = await request(app).get('/api/assignments/mine').set(authH(s));
    let row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.done).toBe(0);
    expect(row.status).toBe('not_started');

    await seedInternalCompletion('reading_test', { studentId: s._id, resourceId: rt._id });
    mine = await request(app).get('/api/assignments/mine').set(authH(s));
    row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.done).toBe(1);
    expect(row.status).toBe('in_progress');
    expect(row.resources.find((r) => r.resourceType === 'reading_test').completed).toBe(true);

    await seedInternalCompletion('listening_practice', { studentId: s._id, resourceId: sec._id });
    mine = await request(app).get('/api/assignments/mine').set(authH(s));
    row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.status).toBe('completed');
  });

  test('student can tick external/image items, cannot tick internal', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls } = await makeClassWith(t, [s]);
    const rt = await createReadingTest();
    const asg = await createAssignment(cls, {
      resources: [
        { kind: 'internal', resourceType: 'reading_test', resourceId: rt._id },
        { kind: 'external', url: 'https://x.com', title: 'x' },
      ],
    });
    const fresh = await Assignment.findById(asg._id).lean();
    const internalItem = fresh.resources.find((r) => r.kind === 'internal')._id;
    const externalItem = fresh.resources.find((r) => r.kind === 'external')._id;

    const denied = await request(app).post(`/api/assignments/${asg._id}/items/${internalItem}/complete`).set(authH(s)).send({ done: true });
    expect(denied.status).toBe(400);

    const okTick = await request(app).post(`/api/assignments/${asg._id}/items/${externalItem}/complete`).set(authH(s)).send({ done: true });
    expect(okTick.status).toBe(200);
    expect(okTick.body.completedCount).toBe(1);

    const mine = await request(app).get('/api/assignments/mine').set(authH(s));
    const row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.resources.find((r) => r.kind === 'external').completed).toBe(true);
  });
});

describe('deadline / overdue / warning', () => {
  test('past deadline + incomplete → overdue; ≥ threshold overdue → homeworkWarning', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await createClassGroup({ teacher: t, policy: { homeworkMissThreshold: 2 } });
    await enrollStudent(cls, s);
    for (let i = 0; i < 2; i++) {
      await createAssignment(cls, { deadline: new Date(past(2 + i)), resources: [{ kind: 'external', url: 'https://x.com', title: 'x' }] });
    }
    const mine = await request(app).get('/api/assignments/mine').set(authH(s));
    expect(mine.body.assignments.every((a) => a.status === 'overdue')).toBe(true);
    expect(mine.body.homeworkWarning).toBeTruthy();
    expect(mine.body.homeworkWarning.missedCount).toBe(2);

    const summary = await request(app).get('/api/assignments/mine/summary').set(authH(s));
    expect(summary.body.warn).toBe(true);
    expect(summary.body.overdueCount).toBe(2);
  });
});

describe('removed from class', () => {
  test('assignment drops off /mine but AssignmentProgress is kept', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls, enrs } = await makeClassWith(t, [s]);
    const rt = await createReadingTest();
    const asg = await createAssignment(cls, { resources: [{ kind: 'internal', resourceType: 'reading_test', resourceId: rt._id }, { kind: 'external', url: 'https://x.com', title: 'x' }] });
    const fresh = await Assignment.findById(asg._id).lean();
    const ext = fresh.resources.find((r) => r.kind === 'external')._id;
    await request(app).post(`/api/assignments/${asg._id}/items/${ext}/complete`).set(authH(s)).send({ done: true });
    expect(await AssignmentProgress.countDocuments({ assignmentId: asg._id })).toBe(1);

    await request(app).delete(`/api/classes/${cls._id}/students/${enrs[0]._id}`).set(authH(t));

    const mine = await request(app).get('/api/assignments/mine').set(authH(s));
    expect(mine.body.assignments).toHaveLength(0);
    expect(await AssignmentProgress.countDocuments({ assignmentId: asg._id })).toBe(1); // history kept
  });
});

describe('resource catalog', () => {
  test('GET /api/classes/resources/catalog lists reading tests, rejects bad type', async () => {
    const t = await createTeacher();
    await createReadingTest({ name: 'Orange Test 42', testNumber: 42 });
    const res = await request(app).get('/api/classes/resources/catalog?type=reading_test&search=Orange').set(authH(t));
    expect(res.status).toBe(200);
    expect(res.body.items.some((i) => i.label === 'Orange Test 42')).toBe(true);

    expect((await request(app).get('/api/classes/resources/catalog?type=nonsense').set(authH(t))).status).toBe(400);
  });
});

describe('guardAgainstMassDelete', () => {
  test('Assignment / AssignmentProgress refuse an unscoped deleteMany', async () => {
    await expect(Assignment.deleteMany({})).rejects.toThrow(/unscoped filter/i);
    await expect(AssignmentProgress.deleteMany({})).rejects.toThrow(/unscoped filter/i);
  });
});
