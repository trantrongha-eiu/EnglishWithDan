// Integration tests for the content/practice scraping rate limits
// (middleware/rateLimit.js → routes/reading.js, routes/listening.js).
//
// These sit ON TOP of the existing auth / requirePremium /
// requireReviewComplete gates — they only cap request *rate* per user, so
// the assertions here are about 429-vs-not-429, not about the eventual
// 200/403/404 the controller would return.
//
// express-rate-limit's in-memory store persists for the life of this
// file's `app` instance, so every test uses a brand-new user (the limiter
// key is the user id) to stay isolated.
const request = require('supertest');
const app = require('../../app');
const {
  createStudent, createPremiumStudent, createTeacher, createAdmin, signTokenFor,
} = require('../factories/userFactory');

const bearer = (u) => `Bearer ${signTokenFor(u)}`;
const CONTENT = '/api/reading/practice/list?category=passage1'; // auth + contentLimiter(60), no premium gate
const ANSWER_KEY = '/api/reading/practice/answer-key/000000000000000000000000'; // auth + answerKeyLimiter(30) + requirePremium
const START = '/api/reading/start'; // auth + startLimiter(10) + requirePremium + requireReviewComplete

async function hammer(path, token, n) {
  const codes = [];
  for (let i = 0; i < n; i++) {
    codes.push((await request(app).get(path).set('Authorization', token)).status);
  }
  return codes;
}

describe('content limiter — reading /practice/* (60 / 15 min / user)', () => {
  test('1. a normal study session (well under the cap) is never rate-limited', async () => {
    const token = bearer(await createStudent());
    const codes = await hammer(CONTENT, token, 15);
    expect(codes.every((c) => c !== 429)).toBe(true);
    expect(codes.every((c) => c === 200)).toBe(true);
  });

  test('2. a rapid burst past the cap gets 429 with the frontend-shaped body', async () => {
    const token = bearer(await createStudent());
    for (let i = 0; i < 60; i++) {
      expect((await request(app).get(CONTENT).set('Authorization', token)).status).not.toBe(429);
    }
    const over = await request(app).get(CONTENT).set('Authorization', token);
    expect(over.status).toBe(429);
    expect(over.body).toMatchObject({ success: false });
    expect(typeof over.body.message).toBe('string');
  });

  test('3+4. the cap is per-user — one user hitting the wall does not affect another', async () => {
    const heavy = bearer(await createStudent());
    await hammer(CONTENT, heavy, 61);
    expect((await request(app).get(CONTENT).set('Authorization', heavy)).status).toBe(429);

    const fresh = bearer(await createStudent());
    expect((await request(app).get(CONTENT).set('Authorization', fresh)).status).not.toBe(429);
  });

  test('5. staff (teacher / admin) bypass the content limiter entirely', async () => {
    const teacher = bearer(await createTeacher());
    expect((await hammer(CONTENT, teacher, 70)).every((c) => c !== 429)).toBe(true);

    const admin = bearer(await createAdmin());
    expect((await hammer(CONTENT, admin, 70)).every((c) => c !== 429)).toBe(true);
  });
});

describe('answer-key limiter — stricter, separate bucket (30 / 15 min / user)', () => {
  test('6. 30 answer-key fetches are fine, the 31st is 429', async () => {
    const token = bearer(await createPremiumStudent());
    for (let i = 0; i < 30; i++) {
      expect((await request(app).get(ANSWER_KEY).set('Authorization', token)).status).not.toBe(429);
    }
    expect((await request(app).get(ANSWER_KEY).set('Authorization', token)).status).toBe(429);
  });

  test('7. exhausting the answer-key bucket does NOT consume the content bucket', async () => {
    const token = bearer(await createPremiumStudent());
    await hammer(ANSWER_KEY, token, 31);
    expect((await request(app).get(ANSWER_KEY).set('Authorization', token)).status).toBe(429);
    // content limiter for the same user is a different limiter → untouched
    expect((await request(app).get(CONTENT).set('Authorization', token)).status).not.toBe(429);
  });
});

describe('start limiter — unchanged behavior (10 / 15 min / user, admin-only bypass)', () => {
  test('8. the 11th /reading/start in a window is 429; earlier ones are not', async () => {
    const token = bearer(await createPremiumStudent());
    for (let i = 0; i < 10; i++) {
      expect((await request(app).post(START).set('Authorization', token).send({})).status).not.toBe(429);
    }
    const over = await request(app).post(START).set('Authorization', token).send({});
    expect(over.status).toBe(429);
    expect(over.body.success).toBe(false);
  });

  test('9. an admin is never blocked by the start limiter', async () => {
    const token = bearer(await createAdmin());
    for (let i = 0; i < 13; i++) {
      expect((await request(app).post(START).set('Authorization', token).send({})).status).not.toBe(429);
    }
  });
});

describe('listening mirrors reading', () => {
  test('10. listening /practice/list burst past 60 → 429; a fresh user is unaffected', async () => {
    const token = bearer(await createStudent());
    const codes = await hammer('/api/listening/practice/list', token, 61);
    expect(codes.filter((c) => c === 429).length).toBeGreaterThan(0);
    expect(codes.slice(0, 60).every((c) => c !== 429)).toBe(true);

    const fresh = bearer(await createStudent());
    expect((await request(app).get('/api/listening/practice/list').set('Authorization', fresh)).status).not.toBe(429);
  });

  test('11. listening /tests/:id/start is now capped at 10 / 15 min (was uncapped)', async () => {
    const token = bearer(await createPremiumStudent());
    const path = '/api/listening/tests/000000000000000000000000/start';
    for (let i = 0; i < 10; i++) {
      expect((await request(app).post(path).set('Authorization', token).send({})).status).not.toBe(429);
    }
    expect((await request(app).post(path).set('Authorization', token).send({})).status).toBe(429);
  });
});
