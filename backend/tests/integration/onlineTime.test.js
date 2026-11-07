// Online time tracking: POST /api/activity/beat (from
// frontend/js/shared/online-tracker.js) and the admin views
// GET /api/admin/online-time[/:userId].
const request = require('supertest');
const app = require('../../app');
const OnlineSession = require('../../models/OnlineSession');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { vnDayKey } = require('../../services/onlineTimeService');

function beat(token, body) {
  return request(app).post('/api/activity/beat').set('Authorization', `Bearer ${token}`).send(body);
}

describe('POST /api/activity/beat', () => {
  test('requires authentication', async () => {
    const res = await request(app).post('/api/activity/beat').send({ sid: 'abcdefgh12' });
    expect(res.status).toBe(401);
  });

  test('beats for one session add up into one document', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const startedAt = Date.now() - 5 * 60 * 1000;
    const brk = { type: 'tab', at: Date.now() - 2 * 60 * 1000, seconds: 40 };

    let res = await beat(token, { sid: 'sess-test-001', startedAt, lastActiveAt: Date.now() - 60000, active: 120, page: '/reading' });
    expect(res.status).toBe(200);
    expect(res.body.tracked).toBe(true);
    res = await beat(token, { sid: 'sess-test-001', startedAt, lastActiveAt: Date.now(), active: 90, tabSwitches: 1, idlePauses: 1,
      breaks: [brk, { type: 'idle', at: Date.now() - 30000, seconds: 200 }, { type: 'bogus', at: Date.now(), seconds: 1 }], page: '/listening' });
    expect(res.status).toBe(200);

    const docs = await OnlineSession.find({ userId: student._id }).lean();
    expect(docs).toHaveLength(1);
    const d = docs[0];
    expect(d.activeSeconds).toBe(210);
    expect(d.tabSwitches).toBe(1);
    expect(d.idlePauses).toBe(1);
    expect(d.breaks.map(b => b.type)).toEqual(['tab', 'idle']);
    expect(d.pages.sort()).toEqual(['/listening', '/reading']);
    expect(d.day).toBe(vnDayKey(startedAt));
    expect(new Date(d.startedAt).getTime()).toBe(startedAt);
  });

  test('clamps oversized values and rejects a bad session id', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    expect((await beat(token, { sid: 'x', active: 10 })).status).toBe(400);

    await beat(token, { sid: 'sess-test-002', active: 999999, tabSwitches: 5000, startedAt: 'nope', page: '/<script>' });
    const d = await OnlineSession.findOne({ userId: student._id, sid: 'sess-test-002' }).lean();
    expect(d.activeSeconds).toBe(1800);
    expect(d.tabSwitches).toBe(100);
    expect(d.pages).toEqual([]);
  });

  test('teachers are not tracked', async () => {
    const teacher = await createTeacher();
    const res = await beat(signTokenFor(teacher), { sid: 'sess-test-003', active: 60 });
    expect(res.status).toBe(200);
    expect(res.body.tracked).toBe(false);
    expect(await OnlineSession.countDocuments({ userId: teacher._id })).toBe(0);
  });
});

describe('GET /api/admin/online-time', () => {
  test('students cannot read it', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/online-time').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('day list sums sessions per student; detail lists sessions with breaks', async () => {
    const a = await createStudent();
    const b = await createStudent();
    const teacher = await createTeacher();
    const tt = signTokenFor(teacher);
    const now = Date.now();

    await beat(signTokenFor(a), { sid: 'sess-a-0001', startedAt: now - 3600e3, lastActiveAt: now - 3000e3, active: 600, tabSwitches: 2,
      breaks: [{ type: 'tab', at: now - 3300e3, seconds: 30 }] });
    await beat(signTokenFor(a), { sid: 'sess-a-0002', startedAt: now - 600e3, lastActiveAt: now, active: 300, idlePauses: 1 });
    await beat(signTokenFor(b), { sid: 'sess-b-0001', startedAt: now - 600e3, lastActiveAt: now, active: 1200 });

    // Only count sessions created by this test (the DB is shared within the file).
    const day = vnDayKey(now - 600e3);
    const res = await request(app).get(`/api/admin/online-time?day=${day}&limit=100`).set('Authorization', `Bearer ${tt}`);
    expect(res.status).toBe(200);
    const rowA = res.body.students.find(r => String(r.userId) === String(a._id));
    const rowB = res.body.students.find(r => String(r.userId) === String(b._id));
    expect(rowB.activeSeconds).toBe(1200);
    if (vnDayKey(now - 3600e3) === day) {
      expect(rowA.activeSeconds).toBe(900);
      expect(rowA.sessions).toBe(2);
      expect(rowA.tabSwitches).toBe(2);
    }
    expect(rowA.trend).toHaveLength(7);
    expect(rowA.trend[6].day).toBe(day);
    // Sorted by minutes, B (1200 s) before A.
    const ids = res.body.students.map(r => String(r.userId));
    expect(ids.indexOf(String(b._id))).toBeLessThan(ids.indexOf(String(a._id)));

    const search = await request(app).get(`/api/admin/online-time?day=${day}&search=${encodeURIComponent(b.username)}`).set('Authorization', `Bearer ${tt}`);
    expect(search.body.students.map(r => String(r.userId))).toEqual([String(b._id)]);

    const det = await request(app).get(`/api/admin/online-time/${a._id}?day=${vnDayKey(now - 3600e3)}`).set('Authorization', `Bearer ${tt}`);
    expect(det.status).toBe(200);
    expect(det.body.days).toHaveLength(14);
    const first = det.body.sessions[0];
    expect(first.activeSeconds).toBe(600);
    expect(first.breaks).toHaveLength(1);
    expect(first.sid).toBeUndefined();

    const missing = await request(app).get('/api/admin/online-time/000000000000000000000000').set('Authorization', `Bearer ${tt}`);
    expect(missing.status).toBe(404);
  });
});
