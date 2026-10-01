// The pending-review gate now lists EVERY pending review by name (not just
// the oldest), and Reading/Listening history merges Full đề + Bài lẻ into
// one list carrying each attempt's review status ("Chưa review" flag).
//
// Regression for a real report (2026-10-01): a student fully reviewed a
// random full mock test but kept seeing "N bài đang chờ Review" — the
// pending ones were OTHER attempts (Bài lẻ), invisible because the gate
// only ever linked to the oldest one.
const request = require('supertest');
const app = require('../../app');
const { createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createPassage, createReadingTest, createListeningTest } = require('../factories/contentFactory');
const MockTestAttempt = require('../../models/MockTestAttempt');

function authed(user) {
  const token = signTokenFor(user);
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url, body) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body),
    patch: (url, body) => request(app).patch(url).set('Authorization', `Bearer ${token}`).send(body),
  };
}

async function readingTest(name) {
  const mk = (n, cat, ans, title) => createPassage({
    category: cat, title,
    questions: [{ questionNumber: n, type: 'sentence-completion', questionText: 'Q' + n, correctAnswer: ans }],
  });
  const p1 = await mk(1, 'passage1', 'apple', 'Yawning');
  const p2 = await mk(2, 'passage2', 'banana', 'Bees');
  const p3 = await mk(3, 'passage3', 'cherry', 'Glaciers');
  const test = await createReadingTest({ name, passageIds: [p1._id, p2._id, p3._id] });
  return { test, p1 };
}

async function completeReview(api, reviewId) {
  const detail = await api.get(`/api/review/${reviewId}`);
  for (const m of detail.body.review.mistakes) {
    await api.patch(`/api/review/${reviewId}/mistakes/${m._id}`, {
      errorCategory: 'Vocabulary', errorReason: 'Không hiểu từ vựng trong bài',
      confidence: 'guessing', learningPoint: { category: 'vocabulary', content: 'x' },
    });
  }
}

describe('Pending review list + combined history', () => {
  test('pending items are named, dated and carry reviewed/total; history merges full + practice with review status', async () => {
    const user = await createPremiumStudent();
    const api = authed(user);

    // Full test, 1 wrong → then fully reviewed.
    const { test, p1 } = await readingTest('MockTest Đề Random');
    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: 'apple', 2: 'WRONG', 3: 'cherry' } });
    await MockTestAttempt.create({ userId: user._id, status: 'completed', progress: 'done', steps: { reading: { attemptId: start.body.attemptId } } });
    const p0 = await api.get('/api/review/pending?skill=reading');
    await completeReview(api, p0.body.items[0]._id);

    // Bài lẻ, wrong → stays pending.
    const save = await api.post('/api/reading/practice/save', {
      passageId: String(p1._id), passageTitle: 'Yawning', category: 'passage1',
      answers: [{ questionNumber: 1, userAnswer: 'pear' }], timeTaken: 60,
    });
    expect(save.status).toBe(200);

    const pending = await api.get('/api/review/pending?skill=reading');
    expect(pending.body.count).toBe(1);
    expect(pending.body.items).toHaveLength(1);
    const item = pending.body.items[0];
    expect(item).toMatchObject({ attemptType: 'reading-practice', isPractice: true, title: 'Yawning', mistakeCount: 1, reviewedCount: 0 });
    expect(String(item.attemptId)).toBe(String(save.body.attemptId));
    expect(item.takenAt).toBeTruthy();

    const hist = await api.get('/api/reading/history/combined');
    expect(hist.status).toBe(200);
    expect(hist.body.total).toBe(2);
    expect(hist.body.hasMore).toBe(false);
    const [newest, older] = hist.body.items;
    expect(newest).toMatchObject({ kind: 'practice', tag: 'Bài lẻ', title: 'Yawning', detail: 'Passage 1', reviewStatus: 'pending' });
    expect(older).toMatchObject({ kind: 'full', tag: 'Mock test', title: 'MockTest Đề Random', reviewStatus: 'completed', reviewedCount: 1 });
    expect(older.detail).toBe('Yawning · Bees · Glaciers');
  });

  test('combined history limit pages across both sources', async () => {
    const user = await createPremiumStudent();
    const api = authed(user);
    const { test, p1 } = await readingTest('Cam 18 Test 1');
    const start = await api.post('/api/reading/start', { testId: String(test._id) });
    await api.post('/api/reading/submit', { attemptId: start.body.attemptId, answers: { 1: 'apple', 2: 'banana', 3: 'cherry' } });
    await api.post('/api/reading/practice/save', { passageId: String(p1._id), passageTitle: 'Yawning', category: 'passage1', answers: [{ questionNumber: 1, userAnswer: 'apple' }], timeTaken: 5 });

    const page = await api.get('/api/reading/history/combined?limit=1');
    expect(page.body.items).toHaveLength(1);
    expect(page.body.total).toBe(2);
    expect(page.body.hasMore).toBe(true);
    expect(page.body.items[0].reviewStatus).toBe('none'); // perfect score → nothing to review
  });

  test('listening combined history route resolves (not swallowed by /history/:attemptId)', async () => {
    const user = await createPremiumStudent();
    const api = authed(user);
    const lt = await createListeningTest();
    const s = await api.post(`/api/listening/tests/${lt._id}/start`, {});
    await api.post(`/api/listening/tests/${lt._id}/submit`, { attemptId: s.body.attemptId, startTime: new Date().toISOString(), answers: { 1: 'nope' } });

    const hist = await api.get('/api/listening/history/combined');
    expect(hist.status).toBe(200);
    expect(hist.body.items).toHaveLength(1);
    expect(hist.body.items[0]).toMatchObject({ kind: 'full', tag: 'Full đề', reviewStatus: 'pending' });

    const pending = await api.get('/api/review/pending?skill=listening');
    expect(pending.body.items[0]).toMatchObject({ attemptType: 'listening', isPractice: false, mistakeCount: 1, reviewedCount: 0 });
  });

  test('same-named attempts owe only ONE review — the newest; older ones become superseded', async () => {
    const user = await createPremiumStudent();
    const api = authed(user);
    // 3 random mock runs — different tests, all named the same.
    const fullIds = [];
    for (let i = 0; i < 3; i++) {
      const { test } = await readingTest('MockTest Đề Random');
      const st = await api.post('/api/reading/start', { testId: String(test._id) });
      await api.post('/api/reading/submit', { attemptId: st.body.attemptId, answers: { 1: 'x', 2: 'banana', 3: 'cherry' } });
      fullIds.push(String(st.body.attemptId));
    }
    // Same Bài lẻ twice, both wrong; plus an unrelated Bài lẻ.
    const { p1 } = await readingTest('Other');
    const practiceIds = [];
    for (let i = 0; i < 2; i++) {
      const save = await api.post('/api/reading/practice/save', {
        passageId: String(p1._id), passageTitle: 'Yawning', category: 'passage1',
        answers: [{ questionNumber: 1, userAnswer: 'pear' }], timeTaken: 30,
      });
      practiceIds.push(String(save.body.attemptId));
    }

    const pending = await api.get('/api/review/pending?skill=reading');
    expect(pending.body.count).toBe(2);
    expect(pending.body.blocked).toBe(false);
    const ids = pending.body.items.map(i => String(i.attemptId)).sort();
    expect(ids).toEqual([fullIds[2], practiceIds[1]].sort());

    // Not blocked any more — 5 pending would have been ≥ MAX_PENDING_REVIEWS.
    const { test: fresh } = await readingTest('Cam 19 Test 2');
    const ok = await api.post('/api/reading/start', { testId: String(fresh._id) });
    expect(ok.status).toBe(200);

    const hist = await api.get('/api/reading/history/combined');
    const byId = Object.fromEntries(hist.body.items.map(r => [String(r._id), r.reviewStatus]));
    expect(byId[fullIds[0]]).toBe('superseded');
    expect(byId[fullIds[1]]).toBe('superseded');
    expect(byId[fullIds[2]]).toBe('pending');
    expect(byId[practiceIds[0]]).toBe('superseded');
    expect(byId[practiceIds[1]]).toBe('pending');
  });

  test('a newer same-named attempt with a PERFECT score also clears the older pending review', async () => {
    const user = await createPremiumStudent();
    const api = authed(user);
    const { test: t1 } = await readingTest('MockTest Đề Random');
    const s1 = await api.post('/api/reading/start', { testId: String(t1._id) });
    await api.post('/api/reading/submit', { attemptId: s1.body.attemptId, answers: { 1: 'x', 2: 'banana', 3: 'cherry' } });
    expect((await api.get('/api/review/pending?skill=reading')).body.count).toBe(1);

    // Started but never submitted — must NOT supersede anything.
    const { test: t2 } = await readingTest('MockTest Đề Random');
    const s2 = await api.post('/api/reading/start', { testId: String(t2._id) });
    expect((await api.get('/api/review/pending?skill=reading')).body.count).toBe(1);

    await api.post('/api/reading/submit', { attemptId: s2.body.attemptId, answers: { 1: 'apple', 2: 'banana', 3: 'cherry' } });
    const after = await api.get('/api/review/pending?skill=reading');
    expect(after.body.count).toBe(0);
    const hist = await api.get('/api/reading/history/combined');
    const byId = Object.fromEntries(hist.body.items.map(r => [String(r._id), r.reviewStatus]));
    expect(byId[String(s1.body.attemptId)]).toBe('superseded');
    expect(byId[String(s2.body.attemptId)]).toBe('none');
  });

  test('the 403 REVIEW_REQUIRED body lists the described items too', async () => {
    const user = await createPremiumStudent();
    const api = authed(user);
    let lastTest;
    for (let i = 0; i < 3; i++) {
      const { test } = await readingTest('Đề ' + i);
      lastTest = test;
      const st = await api.post('/api/reading/start', { testId: String(test._id) });
      await api.post('/api/reading/submit', { attemptId: st.body.attemptId, answers: { 1: 'x', 2: 'banana', 3: 'cherry' } });
    }
    const blocked = await api.post('/api/reading/start', { testId: String(lastTest._id) });
    expect(blocked.status).toBe(403);
    expect(blocked.body.items).toHaveLength(3);
    expect(blocked.body.items.map(i => i.title)).toEqual(['Đề 0', 'Đề 1', 'Đề 2']);
  });
});
