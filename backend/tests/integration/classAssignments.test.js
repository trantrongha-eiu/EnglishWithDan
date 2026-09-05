// Integration tests for the homework/assignments feature
// (routes/classAssignments.js + routes/assignment.js). Focus: per-teacher
// authorization, student scoping (can't reach another class's homework),
// internal-resource auto-completion from real attempt history, manual ticks
// for external/image items, deadline/overdue, and the homework warning.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createReadingTest, createListeningSection, createWritingTask1, createWritingTask2, createWritingExam } = require('../factories/contentFactory');
const { createClassGroup, enrollStudent, createAssignment, seedInternalCompletion } = require('../factories/classFactory');
const Assignment = require('../../models/Assignment');
const AssignmentProgress = require('../../models/AssignmentProgress');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Progress = require('../../models/WT1Progress');
const WritingAttempt = require('../../models/WritingAttempt');
const TestAttempt = require('../../models/TestAttempt');
const classAttendanceService = require('../../services/classAttendanceService');

// Backdate a document's createdAt. Mongoose's timestamps plugin marks
// createdAt immutable, so every Mongoose-level write (findByIdAndUpdate,
// updateOne, even with { timestamps: false }) silently strips it from the
// update before it reaches Mongo — confirmed empirically (updateOne comes
// back { acknowledged: false }, i.e. a no-op). Only the native driver
// (Model.collection, bypassing Mongoose casting entirely) actually writes it.
async function setCreatedAt(Model, id, date) {
  await Model.collection.updateOne({ _id: id }, { $set: { createdAt: date } });
}

async function createWT1Lesson(overrides = {}) {
  const code = overrides.code || `L${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  return WT1Lesson.create({
    code, moduleCode: overrides.moduleCode || 'M1', order: 1,
    title: overrides.title || 'Buổi 1 — Giới thiệu', published: true, ...overrides, code,
  });
}

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

describe('cross-assignment completion (shared resource, different createdAt cutoffs)', () => {
  test('a later, lower-but-still-passing attempt completes a newer assignment even when an earlier attempt scored higher', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls } = await makeClassWith(t, [s]);
    const rt = await createReadingTest();
    const res = [{ kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id) }];

    // Two assignments re-use the SAME resource — getStudentAssignments
    // batches the completion check for a student's assignments behind one
    // shared `checkCompleted` call (using the earliest assignment's
    // createdAt as `since`), then re-derives each assignment's own
    // completed/overdue status by comparing against ITS OWN createdAt.
    const a1 = await createAssignment(cls, { resources: res });
    await setCreatedAt(Assignment, a1._id, new Date(Date.now() - 10 * 864e5));
    const a2 = await createAssignment(cls, { resources: res });
    await setCreatedAt(Assignment, a2._id, new Date(Date.now() - 5 * 864e5));

    // Attempt 1: high score (95%) but BEFORE a2 existed.
    const attempt1 = await TestAttempt.create({ userId: s._id, testId: rt._id, status: 'completed', endTime: new Date(), correctCount: 19, totalQuestions: 20 });
    await setCreatedAt(TestAttempt, attempt1._id, new Date(Date.now() - 8 * 864e5));
    // Attempt 2: lower score (70%, still a pass) but AFTER a2 was created.
    const attempt2 = await TestAttempt.create({ userId: s._id, testId: rt._id, status: 'completed', endTime: new Date(), correctCount: 14, totalQuestions: 20 });
    await setCreatedAt(TestAttempt, attempt2._id, new Date(Date.now() - 1 * 864e5));

    const mine = await request(app).get('/api/assignments/mine').set(authH(s));
    const row2 = mine.body.assignments.find((a) => a._id === String(a2._id));
    // Bug (fixed): the shared completion map used to collapse to the single
    // BEST-SCORING attempt (attempt1, 95%) regardless of when it happened,
    // so a2 (created after attempt1 but before attempt2) read attempt1's
    // date, failed the "completed since a2.createdAt" check, and showed as
    // incomplete/overdue despite attempt2 genuinely passing afterwards.
    expect(row2.status).toBe('completed');
    expect(row2.done).toBe(1);
  });
});

describe('assignment progress table de-dupes removed-then-re-added enrollments', () => {
  test('a student with an old removed enrollment + a new active one appears once, as the active enrollment', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls } = await makeClassWith(t);
    // AssignmentProgress/completion are keyed by studentId, not enrollmentId
    // (so progress survives a remove + re-add) — getAssignmentProgressTable
    // used to list every ClassEnrollment for the class with no removedAt
    // filter, so this student rendered as two rows with identical data.
    await enrollStudent(cls, s, { removedAt: new Date(Date.now() - 5 * 864e5) });
    const activeEnr = await enrollStudent(cls, s);
    const asg = await createAssignment(cls);

    const res = await request(app).get(`/api/classes/${cls._id}/assignments/${asg._id}`).set(authH(t));
    expect(res.status).toBe(200);
    const rowsForStudent = res.body.rows.filter((r) => String(r.studentId) === String(s._id));
    expect(rowsForStudent).toHaveLength(1);
    expect(String(rowsForStudent[0].enrollmentId)).toBe(String(activeEnr._id));
    expect(rowsForStudent[0].removed).toBe(false);
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

  test('a completion done BEFORE the assignment was created does not count; a later one does', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls } = await makeClassWith(t, [s]);
    const rt = await createReadingTest();

    // student did this test a week ago
    const old = await seedInternalCompletion('reading_test', { studentId: s._id, resourceId: rt._id });
    await old.constructor.updateOne({ _id: old._id }, { $set: { createdAt: new Date(Date.now() - 7 * 864e5) } });

    const asg = await createAssignment(cls, { resources: [{ kind: 'internal', resourceType: 'reading_test', resourceId: rt._id }] });

    let mine = await request(app).get('/api/assignments/mine').set(authH(s));
    let row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.done).toBe(0); // the old attempt predates the assignment

    // now they do it again, after the assignment
    await seedInternalCompletion('reading_test', { studentId: s._id, resourceId: rt._id });
    mine = await request(app).get('/api/assignments/mine').set(authH(s));
    row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.done).toBe(1);
    expect(row.status).toBe('completed');
  });

  test('teacher list shows completedStudents for an internal-only assignment nobody ticked', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls } = await makeClassWith(t, [s]);
    const rt = await createReadingTest();
    const asg = await createAssignment(cls, { resources: [{ kind: 'internal', resourceType: 'reading_test', resourceId: rt._id }] });

    let list = await request(app).get(`/api/classes/${cls._id}/assignments`).set(authH(t));
    expect(list.body.assignments.find((a) => a._id === String(asg._id)).completedStudents).toBe(0);

    await seedInternalCompletion('reading_test', { studentId: s._id, resourceId: rt._id });
    list = await request(app).get(`/api/classes/${cls._id}/assignments`).set(authH(t));
    expect(list.body.assignments.find((a) => a._id === String(asg._id)).completedStudents).toBe(1);
  });

  test('a quiz-style internal resource only counts once the student clears 70% — a low score stays not-done', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls } = await makeClassWith(t, [s]);
    const rt = await createReadingTest();
    const asg = await createAssignment(cls, { resources: [{ kind: 'internal', resourceType: 'reading_test', resourceId: rt._id }] });

    await seedInternalCompletion('reading_test', { studentId: s._id, resourceId: rt._id, correctCount: 2, totalQuestions: 10 }); // 20%
    let mine = await request(app).get('/api/assignments/mine').set(authH(s));
    let row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.done).toBe(0);
    expect(row.resources[0].completed).toBe(false);

    // A later, stronger retry clears the 70% bar.
    await seedInternalCompletion('reading_test', { studentId: s._id, resourceId: rt._id, correctCount: 8, totalQuestions: 10 }); // 80%
    mine = await request(app).get('/api/assignments/mine').set(authH(s));
    row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.done).toBe(1);
    expect(row.resources[0].completed).toBe(true);
  });

  test('the BEST of several attempts counts, even if the most recent retry scored lower', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls } = await makeClassWith(t, [s]);
    const rt = await createReadingTest();
    const asg = await createAssignment(cls, { resources: [{ kind: 'internal', resourceType: 'reading_test', resourceId: rt._id }] });

    await seedInternalCompletion('reading_test', { studentId: s._id, resourceId: rt._id, correctCount: 9, totalQuestions: 10 }); // 90% — passes
    await seedInternalCompletion('reading_test', { studentId: s._id, resourceId: rt._id, correctCount: 1, totalQuestions: 10 }); // 10% — a later, weaker retry
    const mine = await request(app).get('/api/assignments/mine').set(authH(s));
    const row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.resources[0].completed).toBe(true);
  });

  test('task1_lesson: shows up in the resource catalog, tracks completion via WT1Progress (not resourceId), and snapshots a working deep link', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls } = await makeClassWith(t, [s]);
    const lesson = await createWT1Lesson({ code: 'BUOI-DL-1', title: 'Buổi 1 — Giới thiệu Task 1' });

    // Shows up in the teacher's resource picker.
    const catalog = await request(app).get('/api/classes/resources/catalog?type=task1_lesson').set(authH(t));
    expect(catalog.body.items.some((i) => i._id === String(lesson._id) && i.label === lesson.title)).toBe(true);

    // Created through the real endpoint (not the createAssignment factory,
    // which writes straight to Mongo) so buildResources's deepLinkKeyFor
    // snapshot actually runs, same as a teacher assigning it for real.
    const created = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t)).send({
      title: 'Task 1 homework', resources: [{ kind: 'internal', resourceType: 'task1_lesson', resourceId: String(lesson._id) }],
    });
    const asgId = created.body.assignment._id;
    const fresh = await Assignment.findById(asgId).lean();
    // resourceCode was snapshotted from WT1Lesson.code at assign time — the
    // student deep link needs the code, not the Mongo _id (see
    // resourceCompletionService.deepLinkKeyFor).
    expect(fresh.resources[0].resourceCode).toBe('BUOI-DL-1');

    let mine = await request(app).get('/api/assignments/mine').set(authH(s));
    let row = mine.body.assignments.find((a) => a._id === String(asgId));
    expect(row.done).toBe(0);
    expect(row.resources[0].resourceCode).toBe('BUOI-DL-1');

    // WT1Progress is keyed by lessonCode, never resourceId/lessonId — this is
    // what proves the _id -> code resolution in checkCompleted actually works.
    await WT1Progress.create({ userId: s._id, courseCode: 'IELTS-W-T1', lessonCode: 'BUOI-DL-1', completedAt: new Date() });
    mine = await request(app).get('/api/assignments/mine').set(authH(s));
    row = mine.body.assignments.find((a) => a._id === String(asgId));
    expect(row.done).toBe(1);
    expect(row.status).toBe('completed');
  });

  test('task1_practice / task2_practice: standalone "Chọn đề" prompts show up, and searching by prompt text works', async () => {
    const t = await createTeacher();
    const wt1 = await createWritingTask1({ prompt: 'The chart below shows electricity generation by fuel source.' });
    const wt2 = await createWritingTask2({ prompt: 'Some people think governments should ban advertising to children.' });

    // Search matches the `prompt` text — WritingTask1/2 have no name/title field.
    const search1 = await request(app).get('/api/classes/resources/catalog?type=task1_practice&search=electricity').set(authH(t));
    expect(search1.body.items.some((i) => i._id === String(wt1._id))).toBe(true);
    const search2 = await request(app).get('/api/classes/resources/catalog?type=task2_practice&search=advertising').set(authH(t));
    expect(search2.body.items.some((i) => i._id === String(wt2._id))).toBe(true);
  });

  test('writing_exam / task1_practice / task2_practice: no score gate (AI band), but a submission only counts once it meets the real minimum word count', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls } = await makeClassWith(t, [s]);
    const wt1 = await createWritingTask1();
    const wt2 = await createWritingTask2();

    const asg = await createAssignment(cls, {
      resources: [
        { kind: 'internal', resourceType: 'task1_practice', resourceId: wt1._id },
        { kind: 'internal', resourceType: 'task2_practice', resourceId: wt2._id },
      ],
    });

    let mine = await request(app).get('/api/assignments/mine').set(authH(s));
    let row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.done).toBe(0);

    // Submitted, but under the 150/250-word minimum — a low-scoring quiz
    // attempt would still count for a band-graded skill, but a too-short
    // essay must not, or "must meet the real minimum" would be a no-op.
    await WritingAttempt.create({ userId: s._id, submissionType: 'practice', task1Id: wt1._id, task1Answer: 'x'.repeat(50), wordCount1: 80 });
    await WritingAttempt.create({ userId: s._id, submissionType: 'practice', task2Id: wt2._id, task2Answer: 'y'.repeat(50), wordCount2: 200 });
    mine = await request(app).get('/api/assignments/mine').set(authH(s));
    row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.done).toBe(0);
    expect(row.resources.find((r) => r.resourceType === 'task1_practice').completed).toBe(false);
    expect(row.resources.find((r) => r.resourceType === 'task2_practice').completed).toBe(false);

    // A later attempt that actually clears 150/250 words counts, even though
    // an earlier (still on record) attempt didn't.
    await WritingAttempt.create({ userId: s._id, submissionType: 'practice', task1Id: wt1._id, task1Answer: 'x'.repeat(160), wordCount1: 160 });
    await WritingAttempt.create({ userId: s._id, submissionType: 'practice', task2Id: wt2._id, task2Answer: 'y'.repeat(260), wordCount2: 260 });
    mine = await request(app).get('/api/assignments/mine').set(authH(s));
    row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.status).toBe('completed');
  });

  test('writing_exam requires BOTH task word counts to meet their minimum, not just one', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls } = await makeClassWith(t, [s]);
    const exam = await createWritingExam();
    const asg = await createAssignment(cls, { resources: [{ kind: 'internal', resourceType: 'writing_exam', resourceId: exam._id }] });

    // Task 1 clears 150, but Task 2 falls short of 250 — must not count yet.
    await WritingAttempt.create({ userId: s._id, examId: exam._id, examName: exam.name, wordCount1: 160, wordCount2: 100 });
    let mine = await request(app).get('/api/assignments/mine').set(authH(s));
    let row = mine.body.assignments.find((a) => a._id === String(asg._id));
    expect(row.done).toBe(0);

    await WritingAttempt.create({ userId: s._id, examId: exam._id, examName: exam.name, wordCount1: 160, wordCount2: 260 });
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

describe('edit an assignment after it has already been assigned', () => {
  test('PUT updates title/deadline/resources', async () => {
    const t = await createTeacher();
    const { cls } = await makeClassWith(t);
    const rt = await createReadingTest();
    const asg = await createAssignment(cls, { title: 'Old title', resources: [{ kind: 'external', url: 'https://old.com', title: 'old' }] });

    const res = await request(app).put(`/api/classes/${cls._id}/assignments/${asg._id}`).set(authH(t)).send({
      title: 'New title',
      deadline: new Date(Date.now() + 5 * 864e5).toISOString(),
      resources: [
        { kind: 'external', url: 'https://old.com', title: 'old' },
        { kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id) },
      ],
    });
    expect(res.status).toBe(200);
    expect(res.body.assignment.title).toBe('New title');
    expect(res.body.assignment.resources).toHaveLength(2);
  });

  test("editing (even just adding a resource) does NOT un-tick a student's existing manual completion on an unchanged external/image item", async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const { cls } = await makeClassWith(t, [s]);
    const rt = await createReadingTest();
    const asg = await createAssignment(cls, { resources: [{ kind: 'external', url: 'https://keep.com', title: 'keep me' }] });
    const before = await Assignment.findById(asg._id).lean();
    const externalItemId = String(before.resources[0]._id);

    await request(app).post(`/api/assignments/${asg._id}/items/${externalItemId}/complete`).set(authH(s)).send({ done: true });

    // Teacher adds a second resource — the whole resources[] is resent, as
    // the admin editor form always does (it's not a diff/patch).
    await request(app).put(`/api/classes/${cls._id}/assignments/${asg._id}`).set(authH(t)).send({
      resources: [
        { kind: 'external', url: 'https://keep.com', title: 'keep me' },
        { kind: 'internal', resourceType: 'reading_test', resourceId: String(rt._id) },
      ],
    });

    const after = await Assignment.findById(asg._id).lean();
    const stillSameItemId = String(after.resources.find((r) => r.kind === 'external')._id);
    // The unchanged resource's _id must be preserved across the edit...
    expect(stillSameItemId).toBe(externalItemId);

    // ...so the student's earlier tick (matched by that _id) still reads as
    // completed instead of silently reverting to un-ticked.
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

describe('homework-driven enrollment status', () => {
  test('enough overdue, incomplete assignments push the enrollment to warning, then failed', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await createClassGroup({ teacher: t, policy: { homeworkWarnThreshold: 2, homeworkFailThreshold: 3 } });
    const enr = await enrollStudent(cls, s);
    const makeOverdue = () => createAssignment(cls, { deadline: past(1) }); // default resource is an untouched external link — stays incomplete

    await makeOverdue();
    let refreshed = await classAttendanceService.refreshEnrollment(enr._id);
    expect(refreshed.stats.homeworkMissedCount).toBe(1);
    expect(refreshed.status).toBe('active'); // below warnThreshold 2

    await makeOverdue();
    refreshed = await classAttendanceService.refreshEnrollment(enr._id);
    expect(refreshed.stats.homeworkMissedCount).toBe(2);
    expect(refreshed.status).toBe('warning');

    await makeOverdue();
    refreshed = await classAttendanceService.refreshEnrollment(enr._id);
    expect(refreshed.stats.homeworkMissedCount).toBe(3);
    expect(refreshed.status).toBe('failed');
    expect(refreshed.statusReason).toMatch(/bài tập quá hạn/);
  });

  test('archiving an overdue assignment lowers the live miss count and can pull the enrollment back out of failed', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await createClassGroup({ teacher: t, policy: { homeworkWarnThreshold: 5, homeworkFailThreshold: 1 } });
    const enr = await enrollStudent(cls, s);
    const asg = await createAssignment(cls, { deadline: past(1) });

    let refreshed = await classAttendanceService.refreshEnrollment(enr._id);
    expect(refreshed.status).toBe('failed');

    await Assignment.updateOne({ _id: asg._id }, { $set: { status: 'archived' } });
    refreshed = await classAttendanceService.refreshEnrollment(enr._id);
    expect(refreshed.status).toBe('active');
  });

  test('a real pass (>=70%) does not count toward the miss tally even past the deadline', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await createClassGroup({ teacher: t, policy: { homeworkWarnThreshold: 1, homeworkFailThreshold: 2 } });
    const enr = await enrollStudent(cls, s);
    const rt = await createReadingTest();
    await createAssignment(cls, { deadline: past(1), resources: [{ kind: 'internal', resourceType: 'reading_test', resourceId: rt._id }] });
    await seedInternalCompletion('reading_test', { studentId: s._id, resourceId: rt._id }); // default 80% — passes

    const refreshed = await classAttendanceService.refreshEnrollment(enr._id);
    expect(refreshed.stats.homeworkMissedCount).toBe(0);
    expect(refreshed.status).toBe('active');
  });
});

describe('guardAgainstMassDelete', () => {
  test('Assignment / AssignmentProgress refuse an unscoped deleteMany', async () => {
    await expect(Assignment.deleteMany({})).rejects.toThrow(/unscoped filter/i);
    await expect(AssignmentProgress.deleteMany({})).rejects.toThrow(/unscoped filter/i);
  });
});
