// /api/shadowing — YouTube-clip Shadowing / Dictation (frontend/shadowing.html).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const ShadowingLesson = require('../../models/ShadowingLesson');
const ShadowingAttempt = require('../../models/ShadowingAttempt');
const { runSeed, lessons: seedLessons } = require('../../scripts/seedShadowingLessons');

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const pastTrial = () => createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 864e5) } });

function createLesson(overrides = {}) {
  return ShadowingLesson.create({
    slug: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: 'Part 1: Hometown',
    youtubeId: 'abcdefghijk',
    category: 'ielts-part1',
    clipStart: 10, clipEnd: 150,
    segments: [
      { start: 10, end: 14, text: 'I live in a pretty big city.' },
      { start: 14, end: 19, text: 'There is an awful lot of traffic.' },
      { start: 19, end: 24, text: 'For me, it is far too noisy.' },
    ],
    ...overrides,
  });
}

describe('GET /api/shadowing/lessons', () => {
  test('lists published lessons without segments, open to a past-trial free student', async () => {
    await createLesson({ title: 'Visible', order: 1 });
    await createLesson({ title: 'Hidden draft', isPublished: false });
    const res = await request(app).get('/api/shadowing/lessons').set(bearer(await pastTrial()));

    expect(res.status).toBe(200);
    expect(res.body.lessons.map((l) => l.title)).toEqual(['Visible']);
    expect(res.body.lessons[0].segments).toBeUndefined();
    expect(res.body.lessons[0].segmentCount).toBe(3);
    expect(res.body.lessons[0].duration).toBe(140);
  });

  test('includes this student\'s best score per mode — and only theirs', async () => {
    const lesson = await createLesson();
    const me = await createPremiumStudent();
    const other = await createPremiumStudent();
    const post = (u, mode, matched) => request(app).post(`/api/shadowing/lessons/${lesson.slug}/attempt`).set(bearer(u))
      .send({ mode, answers: [{ segmentIndex: 0, matchedWords: matched, totalWords: 7 }] });
    await post(me, 'shadowing', 3);
    await post(me, 'shadowing', 7);
    await post(other, 'dictation', 7);

    const res = await request(app).get('/api/shadowing/lessons').set(bearer(me));
    expect(res.body.lessons[0].progress).toEqual({ shadowing: 100 });
  });

  test('requires login', async () => {
    const res = await request(app).get('/api/shadowing/lessons');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/shadowing/lessons/:slug', () => {
  test('premium student gets the full lesson with segments', async () => {
    const lesson = await createLesson();
    const res = await request(app).get(`/api/shadowing/lessons/${lesson.slug}`).set(bearer(await createPremiumStudent()));
    expect(res.status).toBe(200);
    expect(res.body.lesson.youtubeId).toBe('abcdefghijk');
    expect(res.body.lesson.segments).toHaveLength(3);
  });

  test('past-trial free student → 403 PLAN_REQUIRED', async () => {
    const lesson = await createLesson();
    const res = await request(app).get(`/api/shadowing/lessons/${lesson.slug}`).set(bearer(await pastTrial()));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('unknown or unpublished slug → 404', async () => {
    const draft = await createLesson({ isPublished: false });
    const u = await createPremiumStudent();
    expect((await request(app).get('/api/shadowing/lessons/nope').set(bearer(u))).status).toBe(404);
    expect((await request(app).get(`/api/shadowing/lessons/${draft.slug}`).set(bearer(u))).status).toBe(404);
  });
});

describe('POST /api/shadowing/lessons/:slug/attempt', () => {
  test('saves a session, re-deriving scores server-side and dropping invalid rows', async () => {
    const lesson = await createLesson();
    const u = await createPremiumStudent();
    const res = await request(app).post(`/api/shadowing/lessons/${lesson.slug}/attempt`).set(bearer(u)).send({
      mode: 'dictation',
      answers: [
        { segmentIndex: 0, matchedWords: 7, totalWords: 7, score: 5 },   // client score ignored → 100
        { segmentIndex: 1, matchedWords: 99, totalWords: 8 },            // clamped → 8/8
        { segmentIndex: 0, matchedWords: 0, totalWords: 7 },             // duplicate index → dropped
        { segmentIndex: 7, matchedWords: 1, totalWords: 1 },             // out of range → dropped
        { segmentIndex: 2, matchedWords: 2, totalWords: 0 },             // no words → dropped
      ],
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, avgScore: 100, answered: 2 });
    const saved = await ShadowingAttempt.findOne({ userId: u._id }).lean();
    expect(saved.mode).toBe('dictation');
    expect(saved.totalSegments).toBe(3);
    expect(saved.answers.map((a) => [a.segmentIndex, a.matchedWords, a.score])).toEqual([[0, 7, 100], [1, 8, 100]]);
  });

  test('rejects a bad mode or an empty session with 400', async () => {
    const lesson = await createLesson();
    const u = await createPremiumStudent();
    const url = `/api/shadowing/lessons/${lesson.slug}/attempt`;
    expect((await request(app).post(url).set(bearer(u)).send({ mode: 'karaoke', answers: [{ segmentIndex: 0, matchedWords: 1, totalWords: 1 }] })).status).toBe(400);
    expect((await request(app).post(url).set(bearer(u)).send({ mode: 'shadowing', answers: [] })).status).toBe(400);
  });

  test('past-trial free student cannot save', async () => {
    const lesson = await createLesson();
    const res = await request(app).post(`/api/shadowing/lessons/${lesson.slug}/attempt`).set(bearer(await pastTrial()))
      .send({ mode: 'shadowing', answers: [{ segmentIndex: 0, matchedWords: 1, totalWords: 1 }] });
    expect(res.status).toBe(403);
    expect(await ShadowingAttempt.countDocuments()).toBe(0);
  });
});

describe('seedShadowingLessons', () => {
  test('seed data is well-formed and the seed is idempotent', async () => {
    for (const l of seedLessons) {
      expect(l.segments.length).toBeGreaterThan(10);
      expect(l.clipEnd - l.clipStart).toBeLessThanOrEqual(185); // 2–3 minute clips
      l.segments.forEach((s, i) => {
        expect(s.end).toBeGreaterThan(s.start);
        if (i) expect(s.start).toBeGreaterThanOrEqual(l.segments[i - 1].end);
      });
    }
    await runSeed();
    await runSeed();
    expect(await ShadowingLesson.countDocuments()).toBe(seedLessons.length);
  });
});
