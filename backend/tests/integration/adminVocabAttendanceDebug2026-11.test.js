// Regression tests from the 2026-11-12 debug pass over the admin vocab pages
// and the attendance tab:
//  - attendance save validates every row before writing any (no half-saved
//    sessions); a long note no longer 500s
//  - Vocab Units split: a bad chunkSize is a 400 instead of hanging the server
//  - a new Vocab Unit lands at the end of the list (sortOrder), not the top
//  - duplicating a Vocabulary Lesson keeps its class and respects the cap
//  - homework whose lesson was DELETED no longer counts as missed
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const AttendanceRecord = require('../../models/AttendanceRecord');
const VocabUnit = require('../../models/VocabUnit');
const VocabularyLesson = require('../../models/VocabularyLesson');
const { createClassGroup, enrollStudent, createAssignment } = require('../factories/classFactory');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const past = (days) => new Date(Date.now() - days * 864e5).toISOString();

async function classWithTwoStudents() {
  const t = await createTeacher();
  const cls = (await request(app).post('/api/classes').set(auth(t)).send({ name: 'Lớp Debug', totalSessions: 10 })).body.class;
  const enr = [];
  for (let i = 0; i < 2; i++) {
    const s = await createStudent();
    enr.push((await request(app).post(`/api/classes/${cls._id}/students`).set(auth(t)).send({ email: s.email })).body.added[0]);
  }
  const sess = (await request(app).post(`/api/classes/${cls._id}/sessions`).set(auth(t)).send({ date: past(1) })).body.session;
  return { t, cls, enr, sess };
}

describe('attendance save is all-or-nothing', () => {
  test('a bad 2nd row saves nothing (the 1st row used to be written already)', async () => {
    const { t, cls, enr, sess } = await classWithTwoStudents();
    const res = await request(app).put(`/api/classes/${cls._id}/sessions/${sess._id}/attendance`).set(auth(t))
      .send({ marks: [{ enrollmentId: enr[0].enrollmentId, status: 'absent' }, { enrollmentId: enr[1].enrollmentId, status: 'bogus' }] });
    expect(res.status).toBe(400);
    expect(await AttendanceRecord.countDocuments({ sessionId: sess._id })).toBe(0);
  });

  test('a non-string / over-long note is saved trimmed to 500, not a 500 error', async () => {
    const { t, cls, enr, sess } = await classWithTwoStudents();
    const res = await request(app).put(`/api/classes/${cls._id}/sessions/${sess._id}/attendance`).set(auth(t))
      .send({ marks: [{ enrollmentId: enr[0].enrollmentId, status: 'present', note: 'x'.repeat(800) }, { enrollmentId: enr[1].enrollmentId, status: 'late', lateMinutes: 5, note: 12 }] });
    expect(res.status).toBe(200);
    const recs = await AttendanceRecord.find({ sessionId: sess._id }).lean();
    expect(recs).toHaveLength(2);
    expect(recs.find((r) => r.status === 'present').note).toHaveLength(500);
    expect(recs.find((r) => r.status === 'late').note).toBe('12');
  });
});

describe('Vocab Units admin', () => {
  test('split with chunkSize 0 / text is a 400 (used to loop forever)', async () => {
    const a = await createAdmin();
    const unit = await VocabUnit.create({ unitNumber: 901, title: 'Big', words: Array.from({ length: 30 }, (_, i) => ({ word: `w${i}`, meaning: 'm' })) });
    for (const chunkSize of [0, 'abc', -5]) {
      const res = await request(app).post(`/api/vocab/admin/units/${unit._id}/split`).set(auth(a)).send({ chunkSize });
      expect(res.status).toBe(400);
    }
    const ok = await request(app).post(`/api/vocab/admin/units/${unit._id}/split`).set(auth(a)).send({ chunkSize: 10 });
    expect(ok.status).toBe(200);
    expect(ok.body.parts).toBe(3);
    const all = await request(app).post('/api/vocab/admin/split-all').set(auth(a)).send({ chunkSize: 0 });
    expect(all.status).toBe(400);
  });

  test('a new unit goes after the reordered ones', async () => {
    const a = await createAdmin();
    await VocabUnit.create({ unitNumber: 911, title: 'A', sortOrder: 0 });
    await VocabUnit.create({ unitNumber: 912, title: 'B', sortOrder: 7 });
    const res = await request(app).post('/api/vocab/admin/units').set(auth(a)).send({ unitNumber: 913, title: 'New' });
    expect(res.status).toBe(201);
    expect((await VocabUnit.findOne({ unitNumber: 913 }).lean()).sortOrder).toBe(8);
  });
});

describe('Vocabulary Lesson duplicate', () => {
  test('the copy keeps targetClass', async () => {
    const a = await createAdmin();
    const src = await VocabularyLesson.create({
      title: 'Lớp 6 only', difficulty: 'B1', targetClass: '6', createdBy: a._id,
      words: [{ word: 'habitat', meaning: 'môi trường sống' }],
    });
    const res = await request(app).post(`/api/vocabulary-lessons/admin/${src._id}/duplicate`).set(auth(a));
    expect(res.status).toBe(201);
    expect(res.body.lesson.targetClass).toBe('6');
    expect(res.body.lesson.published).toBe(false);
  });
});

describe('homework item whose resource was deleted', () => {
  async function setup() {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await createClassGroup({ teacher: t });
    await enrollStudent(cls, s);
    const mk = (title) => VocabularyLesson.create({ title, difficulty: 'B1', createdBy: t._id, words: [{ word: 'habitat', meaning: 'm' }] });
    return { t, s, cls, mk };
  }
  const mine = async (s, id) => (await request(app).get('/api/assignments/mine').set(auth(s))).body.assignments.find((a) => a._id === String(id));

  test('an overdue assignment made only of a deleted lesson is not a miss', async () => {
    const { t, s, cls, mk } = await setup();
    const lesson = await mk('Sắp bị xoá');
    const asg = await createAssignment(cls, {
      deadline: new Date(Date.now() - 864e5),
      resources: [{ kind: 'internal', resourceType: 'vocabulary_lesson', resourceId: lesson._id }],
    });
    expect((await mine(s, asg._id)).status).toBe('overdue');
    await VocabularyLesson.deleteOne({ _id: lesson._id });
    const row = await mine(s, asg._id);
    expect(row.status).toBe('completed');
    expect(row.resources[0].removed).toBe(true);
    const table = await request(app).get(`/api/classes/${cls._id}/assignments/${asg._id}`).set(auth(t));
    expect(table.body.rows[0].status).toBe('completed');
    expect(table.body.rows[0].items[0].removed).toBe(true);
  });

  test('the remaining items still decide the status', async () => {
    const { s, cls, mk } = await setup();
    const [gone, kept] = [await mk('Xoá'), await mk('Còn')];
    const asg = await createAssignment(cls, {
      resources: [
        { kind: 'internal', resourceType: 'vocabulary_lesson', resourceId: gone._id },
        { kind: 'internal', resourceType: 'vocabulary_lesson', resourceId: kept._id },
      ],
    });
    await VocabularyLesson.deleteOne({ _id: gone._id });
    const row = await mine(s, asg._id);
    expect(row.status).toBe('not_started');
    expect(row.total).toBe(1);
    expect(row.resources.map((r) => r.removed)).toEqual([true, false]);
  });
});
