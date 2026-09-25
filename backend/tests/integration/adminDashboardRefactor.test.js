// Admin dashboard refactor (docs/ADMIN_AUDIT_2026-09-25.md): user-list
// hardening, self-lockout guards, recent-attempts ?skill/?noTotal, the
// per-student overview, the dashboard overview and Tips show/hide.
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createClassGroup, enrollStudent } = require('../factories/classFactory');
const User = require('../../models/User');
const AdvSentenceAttempt = require('../../models/AdvSentenceAttempt');
const DifficultWord = require('../../models/DifficultWord');
const ParaphraseProgress = require('../../models/ParaphraseProgress');
const TuitionFee = require('../../models/TuitionFee');
const WT1Progress = require('../../models/WT1Progress');
const ReadingTip = require('../../models/ReadingTip');

const as = (user) => ({ Authorization: `Bearer ${signTokenFor(user)}` });

describe('GET /api/admin/users — paging, plan filter, sort', () => {
  test('limit is capped at 100', async () => {
    const admin = await createAdmin();
    const res = await request(app).get('/api/admin/users?limit=100000').set(as(admin));
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(100);
  });

  test('plan filter and name sort run server-side', async () => {
    const admin = await createAdmin();
    await createStudent({ username: 'zz_free' });
    await createStudent({ username: 'aa_prem', plan: 'premium', planExpiresAt: new Date(Date.now() + 86400000) });
    const prem = await request(app).get('/api/admin/users?plan=premium&role=student').set(as(admin));
    expect(prem.body.users.map(u => u.username)).toEqual(['aa_prem']);
    const byName = await request(app).get('/api/admin/users?role=student&sort=name').set(as(admin));
    const names = byName.body.users.map(u => u.username);
    expect(names).toEqual([...names].sort());
    expect(byName.body.users[0]).not.toHaveProperty('password');
  });
});

describe('self-lockout guards', () => {
  test('an admin cannot demote or ban their own account', async () => {
    const admin = await createAdmin();
    const demote = await request(app).put(`/api/admin/users/${admin._id}`).set(as(admin))
      .send({ username: admin.username, email: admin.email, role: 'student' });
    expect(demote.status).toBe(400);
    const ban = await request(app).put(`/api/admin/users/${admin._id}/ban`).set(as(admin)).send({ isBanned: true });
    expect(ban.status).toBe(400);
    expect((await User.findById(admin._id)).role).toBe('admin');
  });

  test('editing their own profile fields (role unchanged) still works', async () => {
    const admin = await createAdmin();
    const res = await request(app).put(`/api/admin/users/${admin._id}`).set(as(admin))
      .send({ username: admin.username, email: admin.email, role: 'admin', firstName: 'Dan' });
    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe('Dan');
  });

  test('an admin can still change another user\'s role', async () => {
    const admin = await createAdmin();
    const t = await createTeacher();
    const res = await request(app).put(`/api/admin/users/${t._id}`).set(as(admin))
      .send({ username: t.username, email: t.email, role: 'student' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('student');
  });
});

describe('GET /api/admin/recent-attempts — skill filter, noTotal, adv-sentence', () => {
  test('rejects a malformed userId with 400 (was a 500)', async () => {
    const t = await createTeacher();
    const res = await request(app).get('/api/admin/recent-attempts?userId=not-an-id').set(as(t));
    expect(res.status).toBe(400);
  });

  test('"Viết câu nâng cao" attempts appear, and ?skill= narrows to them', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    await AdvSentenceAttempt.create({ userId: s._id, groupName: 'Mệnh đề quan hệ', week: 2, correctCount: 7, totalQuestions: 10, completedAt: new Date() });
    const all = await request(app).get(`/api/admin/recent-attempts?userId=${s._id}`).set(as(t));
    expect(all.status).toBe(200);
    const row = all.body.attempts.find(a => a.skill === 'adv-sentence');
    expect(row).toMatchObject({ testName: 'Mệnh đề quan hệ', correctCount: 7, totalQuestions: 10 });
    expect(all.body.total).toBe(1);

    const only = await request(app).get(`/api/admin/recent-attempts?userId=${s._id}&skill=adv-sentence`).set(as(t));
    expect(only.body.attempts.every(a => a.skill === 'adv-sentence')).toBe(true);
    const other = await request(app).get(`/api/admin/recent-attempts?userId=${s._id}&skill=reading`).set(as(t));
    expect(other.body.attempts).toHaveLength(0);
    expect(other.body.total).toBe(0);
  });

  test('?noTotal=1 skips the grand total', async () => {
    const t = await createTeacher();
    const res = await request(app).get('/api/admin/recent-attempts?limit=5&noTotal=1').set(as(t));
    expect(res.status).toBe(200);
    expect(res.body.total).toBeNull();
  });
});

describe('GET /api/admin/vocab-students?userId=', () => {
  test('returns only that student', async () => {
    const t = await createTeacher();
    const a = await createStudent();
    await createStudent();
    const res = await request(app).get(`/api/admin/vocab-students?userId=${a._id}`).set(as(t));
    expect(res.status).toBe(200);
    expect(res.body.students.map(s => String(s._id))).toEqual([String(a._id)]);
    expect((await request(app).get('/api/admin/vocab-students?userId=zzz').set(as(t))).status).toBe(400);
  });
});

describe('GET /api/admin/users/:id/overview', () => {
  test('students are blocked; bad ids are 400', async () => {
    const s = await createStudent();
    expect((await request(app).get(`/api/admin/users/${s._id}/overview`).set(as(s))).status).toBe(403);
    const t = await createTeacher();
    expect((await request(app).get('/api/admin/users/nope/overview').set(as(t))).status).toBe(400);
    expect((await request(app).get(`/api/admin/users/${new mongoose.Types.ObjectId()}/overview`).set(as(t))).status).toBe(404);
  });

  test('rolls up goal, activity, course progress, SRS and difficult words', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    await User.updateOne({ _id: s._id }, { targetBand: 7, studyDays: ['mon', 'wed'] });
    await AdvSentenceAttempt.create({ userId: s._id, correctCount: 1, totalQuestions: 2, completedAt: new Date() });
    await AdvSentenceAttempt.create({ userId: s._id, correctCount: 2, totalQuestions: 2, completedAt: new Date() });
    await WT1Progress.create({ userId: s._id, courseCode: 'IELTS-W-T1', lessonCode: 'T1-L1', completedExercises: ['a', 'b'], completedAt: new Date() });
    await WT1Progress.create({ userId: s._id, courseCode: 'IELTS-W-T1', lessonCode: 'T1-L2', completedExercises: ['c'] });
    await ParaphraseProgress.create({ userId: s._id, unitId: new mongoose.Types.ObjectId(), itemKey: 'k1', nextReviewAt: new Date(Date.now() - 1000) });
    await ParaphraseProgress.create({ userId: s._id, unitId: new mongoose.Types.ObjectId(), itemKey: 'k2', nextReviewAt: new Date(Date.now() + 86400000) });
    await DifficultWord.create({ userId: s._id, word: 'ubiquitous' });

    const res = await request(app).get(`/api/admin/users/${s._id}/overview`).set(as(t));
    expect(res.status).toBe(200);
    const o = res.body.overview;
    expect(o.goal).toMatchObject({ targetBand: 7, studyDays: ['mon', 'wed'] });
    expect(o.activity.find(a => a.key === 'adv-sentence').count).toBe(2);
    expect(o.courses).toEqual([expect.objectContaining({ courseCode: 'IELTS-W-T1', lessonsStarted: 2, lessonsCompleted: 1, exercisesCompleted: 3 })]);
    expect(o.paraphrase).toEqual({ tracked: 2, due: 1 });
    expect(o.difficultWords).toBe(1);
    expect(o.tuition).toBeNull(); // admin-only
  });

  test('a teacher only sees classes they run; admin sees all + tuition', async () => {
    const t1 = await createTeacher();
    const t2 = await createTeacher();
    const admin = await createAdmin();
    const s = await createStudent();
    await enrollStudent(await createClassGroup({ teacher: t1, name: 'Lớp của T1' }), s);
    await enrollStudent(await createClassGroup({ teacher: t2, name: 'Lớp của T2' }), s);
    await TuitionFee.create({ studentId: s._id, feeType: 'monthly', month: 9, year: 2026, amount: 500000 });

    const mine = await request(app).get(`/api/admin/users/${s._id}/overview`).set(as(t1));
    expect(mine.body.overview.classes.map(c => c.name)).toEqual(['Lớp của T1']);
    const all = await request(app).get(`/api/admin/users/${s._id}/overview`).set(as(admin));
    expect(all.body.overview.classes.map(c => c.name).sort()).toEqual(['Lớp của T1', 'Lớp của T2']);
    expect(all.body.overview.tuition).toEqual({ unpaidCount: 1, unpaidAmount: 500000 });
  });
});

describe('GET /api/admin/stats/overview', () => {
  test('KPIs and a 14-day activity series from real data', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    await User.updateOne({ _id: s._id }, { lastSeen: new Date() });
    await AdvSentenceAttempt.create({ userId: s._id, correctCount: 1, totalQuestions: 1, completedAt: new Date() });
    const res = await request(app).get('/api/admin/stats/overview').set(as(t));
    expect(res.status).toBe(200);
    const o = res.body.overview;
    expect(o.totalStudents).toBeGreaterThanOrEqual(1);
    expect(o.active24h).toBeGreaterThanOrEqual(1);
    expect(o.newThisWeek).toBeGreaterThanOrEqual(1);
    expect(o.daily).toHaveLength(14);
    const today = o.daily[o.daily.length - 1];
    expect(today.attempts).toBeGreaterThanOrEqual(1);
    expect(today.activeStudents).toBeGreaterThanOrEqual(1);
    expect(today.signups).toBeGreaterThanOrEqual(1);
  });

  test('students are blocked', async () => {
    const s = await createStudent();
    expect((await request(app).get('/api/admin/stats/overview').set(as(s))).status).toBe(403);
  });
});

describe('Tips management', () => {
  const BLOCKS = [{ type: 'overview', data: 'Đọc câu hỏi trước.' }];

  test('list includes hidden tips; show/hide reaches the student endpoint', async () => {
    const t = await createTeacher();
    const tip = await ReadingTip.create({ category: 'Kỹ năng', lessonKey: 'skim', title: 'Skimming', blocks: BLOCKS });
    await ReadingTip.create({ category: 'Kỹ năng', lessonKey: 'scan', title: 'Scanning', blocks: BLOCKS, isActive: false });

    const list = await request(app).get('/api/admin/tips').set(as(t));
    expect(list.status).toBe(200);
    const reading = list.body.skills.find(x => x.skill === 'reading');
    expect(reading.tips.map(x => [x.lessonKey, x.isActive, x.blockCount])).toEqual(expect.arrayContaining([['skim', true, 1], ['scan', false, 1]]));

    const hide = await request(app).patch(`/api/admin/tips/reading/${tip._id}/active`).set(as(t)).send({ isActive: false });
    expect(hide.status).toBe(200);
    const pub = await request(app).get('/api/reading-tips/lessons');
    expect(pub.body.lessons.find(l => l.lessonKey === 'skim')).toBeUndefined();
  });

  test('preview renders Markdown; bad input is rejected; students get 403', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const tip = await ReadingTip.create({ category: 'Kỹ năng', lessonKey: 'skim2', title: 'Skim', summary: 'Tóm tắt', blocks: BLOCKS });
    const prev = await request(app).get(`/api/admin/tips/reading/${tip._id}`).set(as(t));
    expect(prev.status).toBe(200);
    expect(prev.body.tip.markdown).toContain('Đọc câu hỏi trước.');
    expect((await request(app).get(`/api/admin/tips/cooking/${tip._id}`).set(as(t))).status).toBe(400);
    expect((await request(app).patch(`/api/admin/tips/reading/${tip._id}/active`).set(as(t)).send({ isActive: 'yes' })).status).toBe(400);
    expect((await request(app).get('/api/admin/tips').set(as(s))).status).toBe(403);
  });
});
