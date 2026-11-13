// Mục tiêu / Lộ trình debug pass (2026-11-14): goal.html re-sends every
// field on save, so unchanged values that are "out of scope" (a Profile-set
// 8.0 target, an exam date that has since passed) must not block other
// edits; the weekly plan spreads a small weekly total over every study day.
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { createStudent, signTokenFor } = require('../factories/userFactory');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const daysFromNow = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

describe('PUT /api/goals — unchanged values are not re-validated', () => {
  test('a target band of 8.0 set from Profile does not block changing study days', async () => {
    const s = await createStudent();
    await User.updateOne({ _id: s._id }, { $set: { targetBand: 8 } });
    const res = await request(app).put('/api/goals').set(auth(s))
      .send({ targetBand: 8, studyDays: ['mon', 'wed'], weeklyStudyMinutes: 120, preferredSessionMinutes: 60 });
    expect(res.status).toBe(200);
    expect(res.body.goal.targetBand).toBe(8);
    expect(res.body.goal.studyDays).toEqual(['mon', 'wed']);
    // Choosing 8.0 fresh on this page is still outside its 4.0–7.5 scope.
    const fresh = await createStudent();
    expect((await request(app).put('/api/goals').set(auth(fresh)).send({ targetBand: 8 })).status).toBe(400);
  });

  test('an exam date that has passed does not block other edits; a NEW past date is refused (in Vietnamese)', async () => {
    const s = await createStudent();
    const past = new Date(Date.now() - 10 * 86400000);
    await User.updateOne({ _id: s._id }, { $set: { targetBand: 6.5, targetExamDate: past } });
    const ok = await request(app).put('/api/goals').set(auth(s))
      .send({ targetBand: 6.5, examDate: past.toISOString().slice(0, 10), weeklyStudyMinutes: 300 });
    expect(ok.status).toBe(200);
    expect(ok.body.goal.weeklyStudyMinutes).toBe(300);

    const bad = await request(app).put('/api/goals').set(auth(s)).send({ examDate: daysFromNow(-3) });
    expect(bad.status).toBe(400);
    expect(bad.body.message).toMatch(/Ngày thi/);
  });

  test('weekly minutes are capped and study days de-duplicated', async () => {
    const s = await createStudent();
    expect((await request(app).put('/api/goals').set(auth(s)).send({ weeklyStudyMinutes: 999999 })).status).toBe(400);
    const res = await request(app).put('/api/goals').set(auth(s)).send({ studyDays: ['mon', 'mon', 'tue'] });
    expect(res.status).toBe(200);
    expect(res.body.goal.studyDays).toEqual(['mon', 'tue']);
  });
});

describe('GET /api/study-plan/current', () => {
  test('a small weekly total is spread over every study day (none left empty)', async () => {
    const s = await createStudent();
    await request(app).put('/api/goals').set(auth(s)).send({
      targetBand: 6.5, weeklyStudyMinutes: 120, preferredSessionMinutes: 60,
      studyDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    });
    const res = await request(app).get('/api/study-plan/current').set(auth(s));
    expect(res.status).toBe(200);
    expect(res.body.sessions).toHaveLength(5);
    res.body.sessions.forEach((d) => {
      expect(d.items.length).toBeGreaterThan(0);
      expect(d.totalMinutes).toBeLessThanOrEqual(60);
    });
    expect(res.body.scheduledMinutes).toBeGreaterThanOrEqual(110);
  });

  test('when days × session cannot hold the weekly total, scheduledMinutes says so', async () => {
    const s = await createStudent();
    await request(app).put('/api/goals').set(auth(s)).send({
      targetBand: 6.5, weeklyStudyMinutes: 600, preferredSessionMinutes: 60, studyDays: ['sat', 'sun'],
    });
    const res = await request(app).get('/api/study-plan/current').set(auth(s));
    expect(res.body.totalMinutes).toBe(600);
    expect(res.body.scheduledMinutes).toBe(120);
  });
});
