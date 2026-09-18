const request = require('supertest');
const app = require('../../app');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const ExamTimetableProgress = require('../../models/ExamTimetableProgress');

describe('/api/exam-timetable', () => {
  async function setUp() {
    const user = await createStudent();
    const token = signTokenFor(user);
    return { user, token };
  }

  test('requires auth', async () => {
    const res = await request(app).get('/api/exam-timetable');
    expect(res.status).toBe(401);
  });

  test('GET lazily creates a doc and returns empty checklist/logs', async () => {
    const { token } = await setUp();
    const res = await request(app).get('/api/exam-timetable').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.checklist).toEqual({});
    expect(res.body.testLogs).toEqual([]);
    expect(res.body.stats).toEqual({ totalChecked: 0, totalItems: 42, totalLogs: 0, totalReviewed: 0 });
  });

  test('PUT checklist/:key toggles and persists a session', async () => {
    const { user, token } = await setUp();
    const res = await request(app)
      .put('/api/exam-timetable/checklist/w1-class1')
      .set('Authorization', `Bearer ${token}`)
      .send({ checked: true });
    expect(res.status).toBe(200);
    expect(res.body.checklist['w1-class1']).toBe(true);
    expect(res.body.stats.totalChecked).toBe(1);

    const doc = await ExamTimetableProgress.findOne({ userId: user._id });
    expect(doc.checklist.get('w1-class1')).toBe(true);

    // toggling back off
    const res2 = await request(app)
      .put('/api/exam-timetable/checklist/w1-class1')
      .set('Authorization', `Bearer ${token}`)
      .send({ checked: false });
    expect(res2.body.checklist['w1-class1']).toBe(false);
    expect(res2.body.stats.totalChecked).toBe(0);
  });

  test('PUT checklist rejects a malformed key', async () => {
    const { token } = await setUp();
    const res = await request(app)
      .put('/api/exam-timetable/checklist/' + encodeURIComponent('bad key!'))
      .set('Authorization', `Bearer ${token}`)
      .send({ checked: true });
    expect(res.status).toBe(400);
  });

  test('POST logs adds a test log entry, GET reflects stats', async () => {
    const { token } = await setUp();
    const res = await request(app)
      .post('/api/exam-timetable/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ skill: 'reading', label: 'Cambridge 18 Test 1', week: 1, mistake: 'Nhầm T/F/NG' });
    expect(res.status).toBe(200);
    expect(res.body.testLogs).toHaveLength(1);
    const log = res.body.testLogs[0];
    expect(log.skill).toBe('reading');
    expect(log.reviewed).toBe(false);
    expect(res.body.stats.totalLogs).toBe(1);
    expect(res.body.stats.totalReviewed).toBe(0);

    const listRes = await request(app).get('/api/exam-timetable').set('Authorization', `Bearer ${token}`);
    expect(listRes.body.testLogs).toHaveLength(1);
  });

  test('POST logs rejects an invalid skill', async () => {
    const { token } = await setUp();
    const res = await request(app)
      .post('/api/exam-timetable/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ skill: 'cooking' });
    expect(res.status).toBe(400);
  });

  test('POST logs rejects an out-of-range week', async () => {
    const { token } = await setUp();
    const res = await request(app)
      .post('/api/exam-timetable/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ skill: 'listening', week: 9 });
    expect(res.status).toBe(400);
  });

  test('PATCH logs/:logId marks reviewed and edits mistake', async () => {
    const { token } = await setUp();
    const created = await request(app)
      .post('/api/exam-timetable/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ skill: 'listening', label: 'Test 2' });
    const logId = created.body.testLogs[0].id;

    const res = await request(app)
      .patch(`/api/exam-timetable/logs/${logId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reviewed: true, mistake: 'Distractor' });
    expect(res.status).toBe(200);
    expect(res.body.testLogs[0].reviewed).toBe(true);
    expect(res.body.testLogs[0].mistake).toBe('Distractor');
    expect(res.body.stats.totalReviewed).toBe(1);
  });

  test('PATCH logs/:logId on an unknown id returns 404', async () => {
    const { token } = await setUp();
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .patch(`/api/exam-timetable/logs/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reviewed: true });
    expect(res.status).toBe(404);
  });

  test('DELETE logs/:logId removes the entry', async () => {
    const { token } = await setUp();
    const created = await request(app)
      .post('/api/exam-timetable/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ skill: 'writing' });
    const logId = created.body.testLogs[0].id;

    const res = await request(app)
      .delete(`/api/exam-timetable/logs/${logId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.testLogs).toHaveLength(0);
    expect(res.body.stats.totalLogs).toBe(0);
  });

  test('two students never see each other\'s data', async () => {
    const a = await setUp();
    const b = await setUp();
    await request(app)
      .put('/api/exam-timetable/checklist/w2-home1')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ checked: true });

    const resB = await request(app).get('/api/exam-timetable').set('Authorization', `Bearer ${b.token}`);
    expect(resB.body.checklist['w2-home1']).toBeUndefined();
    expect(resB.body.stats.totalChecked).toBe(0);
  });
});
