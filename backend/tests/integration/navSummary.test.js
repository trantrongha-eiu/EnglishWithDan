// GET /api/nav/summary — one call carrying every nav.js page-load payload.
// Each part must equal what its standalone endpoint returns, since nav.js
// parses them with the same code either way.
const request = require('supertest');
const app = require('../../app');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const User = require('../../models/User');

const STANDALONE = {
  me:                 '/api/auth/me',
  unreadMessages:     '/api/user/messages/unread-count',
  writingFeedback:    '/api/writing/unread-feedback-count',
  writingNavCounts:   '/api/writing/practice/nav-counts',
  tuitionSummary:     '/api/tuition/my/summary',
  task2Drafts:        '/api/task2/drafts',
  attendanceStatus:   '/api/classes/my/attendance-status',
  homeworkSummary:    '/api/assignments/mine/summary',
  vocabDailyGoal:     '/api/vocabbook/daily-goal',
  paraphraseDueCount: '/api/vocab/paraphrase/due-count',
};

describe('GET /api/nav/summary', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/nav/summary');
    expect(res.status).toBe(401);
  });

  test('every part matches its standalone endpoint', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const res = await request(app).get('/api/nav/summary').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    for (const [key, path] of Object.entries(STANDALONE)) {
      const own = await request(app).get(path).set('Authorization', `Bearer ${token}`);
      expect(own.status).toBe(200);
      expect({ key, body: res.body[key] }).toEqual({ key, body: own.body });
    }
  });

  test('a guest token only gets the /auth/me part', async () => {
    const guest = await createStudent({ role: 'guest' });
    const res = await request(app).get('/api/nav/summary').set('Authorization', `Bearer ${signTokenFor(guest)}`);
    expect(res.status).toBe(200);
    expect(res.body.me && res.body.me.success).toBe(true);
    expect(Object.keys(res.body).sort()).toEqual(['me', 'success']);
  });
});

describe('auth middleware lastSeen throttle', () => {
  test('a recent lastSeen is not rewritten on every request', async () => {
    const recent = new Date(Date.now() - 10 * 1000);
    const student = await createStudent({ extra: { lastSeen: recent } });
    await request(app).get('/api/auth/me').set('Authorization', `Bearer ${signTokenFor(student)}`);
    await new Promise((r) => setTimeout(r, 50)); // the write is fire-and-forget
    const fromDb = await User.findById(student._id).select('lastSeen').lean();
    expect(fromDb.lastSeen.getTime()).toBe(recent.getTime());
  });

  test('a stale lastSeen is refreshed', async () => {
    const stale = new Date(Date.now() - 5 * 60 * 1000);
    const student = await createStudent({ extra: { lastSeen: stale } });
    await request(app).get('/api/auth/me').set('Authorization', `Bearer ${signTokenFor(student)}`);
    await new Promise((r) => setTimeout(r, 50));
    const fromDb = await User.findById(student._id).select('lastSeen').lean();
    expect(fromDb.lastSeen.getTime()).toBeGreaterThan(stale.getTime());
  });
});
