'use strict';

// 2026-11-16 search debug: what teachers/students type must find the row —
// full names split over firstName/lastName, no accents, any word order.
const request = require('supertest');
const app = require('../../app');
const SpeakingAttempt = require('../../models/SpeakingAttempt');
const { createStudent, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createListeningTest } = require('../factories/contentFactory');

describe('search debug 2026-11', () => {
  let token;
  let an;
  beforeEach(async () => {
    token = signTokenFor(await createAdmin());
    an = await createStudent({ extra: { firstName: 'Nguyễn Văn', lastName: 'An', username: 'nvan01' } });
    await createStudent({ extra: { firstName: 'Nguyễn Thị', lastName: 'Bình', username: 'ntb02' } });
  });

  test.each(['Nguyễn Văn An', 'nguyen van an', 'An Nguyen', 'nvan01'])(
    'GET /api/admin/users?search=%s finds the student',
    async (q) => {
      const res = await request(app).get(`/api/admin/users?role=student&search=${encodeURIComponent(q)}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.users.map((u) => u.username)).toEqual(['nvan01']);
    });

  test('"nguyen" (no accents) finds both Nguyễn students', async () => {
    const res = await request(app).get('/api/admin/users?role=student&search=nguyen')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.users).toHaveLength(2);
  });

  test('speaking history search finds a student by name, not only username', async () => {
    await SpeakingAttempt.create({ userId: an._id, part: 1, question: 'Do you like music?', topic: 'Music', transcript: 'yes' });
    const res = await request(app).get(`/api/admin/speaking/history?search=${encodeURIComponent('van an')}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.attempts).toHaveLength(1);
  });

  test('site-wide /api/search: "cam18 test4" finds "Cam 18 - Test 4"', async () => {
    require('../../services/searchService').clearCache();
    await createListeningTest({ name: 'Cam 18 - Test 4' });
    const res = await request(app).get('/api/search?q=cam18%20test4').set('Authorization', `Bearer ${signTokenFor(an)}`);
    expect(res.status).toBe(200);
    expect(res.body.results.map((r) => r.label)).toEqual(['Cam 18 - Test 4']);
  });
});
