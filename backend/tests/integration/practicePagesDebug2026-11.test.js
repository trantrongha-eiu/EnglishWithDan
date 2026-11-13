// Regression tests for the 2026-11-14 debug pass over Shadowing, Grammar
// (essential-grammar), the Speaking course + AI question import, and the
// full 4-skill mock test. Gemini (speakingService.gradeSpeaking) and the
// SpeakingAttempt mirror are stubbed so the course tests stay offline.
jest.mock('../../services/speakingService', () => {
  const actual = jest.requireActual('../../services/speakingService');
  return { ...actual, gradeSpeaking: jest.fn(), saveAttempt: jest.fn().mockResolvedValue({ attemptId: null, newlyUnlocked: [] }) };
});

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const speakingService = require('../../services/speakingService');
const { createStudent, createPremiumStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const {
  createReadingTest, createListeningTest, createWritingExam, createSpeakingQuestion,
  createListeningAttempt, createTestAttempt, createWritingAttempt, createSpeakingAttempt,
  createEssentialGrammarLesson,
} = require('../factories/contentFactory');
const MockTestAttempt = require('../../models/MockTestAttempt');
const SpeakingAttempt = require('../../models/SpeakingAttempt');
const ShadowingLesson = require('../../models/ShadowingLesson');
const ShadowingAttempt = require('../../models/ShadowingAttempt');
const WT1Course = require('../../models/WT1Course');
const WT1Module = require('../../models/WT1Module');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Exercise = require('../../models/WT1Exercise');
const WT1Submission = require('../../models/WT1Submission');
const { parseSpeakingText } = require('../../services/speakingImportParser');

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

// ── Mock test ────────────────────────────────────────────────────────────
async function startMock(user) {
  await Promise.all([
    createListeningTest(), createReadingTest(), createWritingExam(),
    createSpeakingQuestion({ part: 2, cueCard: 'Describe a place.' }),
  ]);
  const res = await request(app).post('/api/mock-test/start').set(bearer(user));
  expect(res.status).toBe(201);
  return res.body.attempt;
}
const advance = (user, m, skill, attemptId) =>
  request(app).post(`/api/mock-test/${m._id}/advance`).set(bearer(user)).send({ skill, attemptId });

describe('mock test /advance only takes the student\'s own sub-attempt for this run', () => {
  test('another student\'s attempt is refused (it used to lend its band to this run)', async () => {
    const me = await createPremiumStudent();
    const other = await createStudent();
    const m = await startMock(me);
    const theirs = await createListeningAttempt({ userId: other._id, testId: m.bundle.listeningTestId, bandScore: 9 });

    const res = await advance(me, m, 'listening', theirs._id);
    expect(res.status).toBe(400);
    const doc = await MockTestAttempt.findById(m._id).lean();
    expect(doc.progress).toBe('listening');
    expect(doc.steps.listening && doc.steps.listening.band).toBeFalsy();
  });

  test('an attempt at a different test, or one older than the run, is refused', async () => {
    const me = await createPremiumStudent();
    const m = await startMock(me);
    const otherTest = await createListeningAttempt({ userId: me._id, testId: new mongoose.Types.ObjectId(), bandScore: 9 });
    expect((await advance(me, m, 'listening', otherTest._id)).status).toBe(400);

    const old = await createListeningAttempt({ userId: me._id, testId: m.bundle.listeningTestId, bandScore: 9 });
    await mongoose.connection.collection('listeningattempts').updateOne({ _id: old._id }, { $set: { createdAt: new Date(Date.now() - 3 * 864e5) } });
    expect((await advance(me, m, 'listening', old._id)).status).toBe(400);

    expect((await advance(me, m, 'listening', 'not-an-id')).status).toBe(400);
  });

  test('the student\'s own attempt at the bundle test is accepted with its band', async () => {
    const me = await createPremiumStudent();
    const m = await startMock(me);
    const mine = await createListeningAttempt({ userId: me._id, testId: m.bundle.listeningTestId, bandScore: 6.5 });
    const res = await advance(me, m, 'listening', mine._id);
    expect(res.status).toBe(200);
    expect(res.body.attempt.steps.listening.band).toBe(6.5);
  });

  test('a teacher\'s Speaking grade from the review queue replaces the AI band in the run (even after the AI one landed)', async () => {
    const me = await createPremiumStudent();
    const m = await startMock(me);
    const la = await createListeningAttempt({ userId: me._id, testId: m.bundle.listeningTestId, bandScore: 6 });
    await advance(me, m, 'listening', la._id);
    const ra = await createTestAttempt({ userId: me._id, testId: m.bundle.readingTestId, status: 'completed', extra: { bandScore: 6 } });
    await advance(me, m, 'reading', ra._id);
    const wa = await createWritingAttempt({ userId: me._id, examId: m.bundle.writingExamId, extra: { grading: { overallBand: 6 } } });
    await advance(me, m, 'writing', wa._id);
    const sa = await createSpeakingAttempt({ userId: me._id, part: 2, extra: { aiFeedback: { overallBand: 5 } } });
    const done = await advance(me, m, 'speaking', sa._id);
    expect(done.body.attempt.steps.speaking.band).toBe(5);

    await SpeakingAttempt.updateOne({ _id: sa._id }, { $set: { teacherReview: { band: 7, note: 'ok', reviewedAt: new Date() } } });
    const hist = await request(app).get(`/api/mock-test/history/${m._id}`).set(bearer(me));
    expect(hist.body.attempt.steps.speaking.band).toBe(7);
    // (6 + 6 + 6 + 7) / 4 = 6.25 → 6.5
    expect(hist.body.attempt.overallBand).toBe(6.5);
  });
});

// ── Grammar ──────────────────────────────────────────────────────────────
describe('essential grammar', () => {
  test('a bare correctCount/totalCount is refused — only answers graded on the server count', async () => {
    const lesson = await createEssentialGrammarLesson();
    const s = await createStudent();
    const res = await request(app).post(`/api/essential-grammar/${lesson._id}/attempt`).set(bearer(s))
      .send({ correctCount: 2, totalCount: 2 });
    expect(res.status).toBe(400);

    const ok = await request(app).post(`/api/essential-grammar/${lesson._id}/attempt`).set(bearer(s))
      .send({ answers: [{ ref: 'q:0:0', chosen: 1 }, { ref: 'q:0:1', chosen: 3 }], correctCount: 2, totalCount: 2 });
    expect(ok.status).toBe(200);
    expect(ok.body.attempt.score).toBe(50); // graded 1/2, the sent counts are ignored
  });

  test('a malformed lesson / user id is a 404 or empty list, not a 500', async () => {
    const s = await createStudent();
    const t = await createTeacher();
    expect((await request(app).get('/api/essential-grammar/oops/attempt').set(bearer(s))).status).toBe(404);
    expect((await request(app).post('/api/essential-grammar/oops/attempt').set(bearer(s)).send({ answers: [] })).status).toBe(404);
    expect((await request(app).get('/api/essential-grammar/oops/attempt/history').set(bearer(s))).status).toBe(404);
    expect((await request(app).get('/api/essential-grammar/admin/oops').set(bearer(t))).status).toBe(404);
    expect((await request(app).get('/api/essential-grammar/admin/oops/missed-questions').set(bearer(t))).status).toBe(404);
    expect((await request(app).put('/api/essential-grammar/admin/oops').set(bearer(t)).send({ title: 'x' })).status).toBe(404);
    const lesson = await createEssentialGrammarLesson();
    const h = await request(app).get(`/api/essential-grammar/admin/${lesson._id}/students/oops/history`).set(bearer(t));
    expect(h.status).toBe(200);
    expect(h.body.history).toEqual([]);
  });

  test('an empty orderIndex is rejected instead of silently becoming 0', async () => {
    const t = await createTeacher();
    const lesson = await createEssentialGrammarLesson({ orderIndex: 7 });
    const res = await request(app).put(`/api/essential-grammar/admin/${lesson._id}`).set(bearer(t)).send({ orderIndex: '' });
    expect(res.status).toBe(400);
  });
});

// ── Shadowing ────────────────────────────────────────────────────────────
describe('shadowing sessions', () => {
  async function lessonAndPost() {
    const lesson = await ShadowingLesson.create({
      slug: `l-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: 'Hometown', youtubeId: 'abcdefghijk',
      category: 'ielts-part1', clipStart: 0, clipEnd: 60,
      segments: [
        { start: 0, end: 4, text: 'I live in a big city.' },
        { start: 4, end: 8, text: 'It is noisy.' },
      ],
    });
    const me = await createPremiumStudent();
    const post = (body) => request(app).post(`/api/shadowing/lessons/${lesson.slug}/attempt`).set(bearer(me)).send(body);
    return { lesson, me, post };
  }

  test('the same session saved twice (tab hidden, then back to the list) is one row, updated', async () => {
    const { lesson, me, post } = await lessonAndPost();
    const sid = 'abc123def456';
    await post({ mode: 'dictation', sessionId: sid, answers: [{ segmentIndex: 0, matchedWords: 3, totalWords: 6 }] });
    const second = await post({ mode: 'dictation', sessionId: sid, answers: [
      { segmentIndex: 0, matchedWords: 6, totalWords: 6 }, { segmentIndex: 1, matchedWords: 3, totalWords: 3 },
    ] });
    expect(second.status).toBe(200);
    const rows = await ShadowingAttempt.find({ userId: me._id, lessonId: lesson._id }).lean();
    expect(rows).toHaveLength(1);
    expect(rows[0].answers).toHaveLength(2);
    expect(rows[0].avgScore).toBe(100);
  });

  test('different sessions (or no session id) are separate rows; a junk id is ignored', async () => {
    const { lesson, me, post } = await lessonAndPost();
    const a = [{ segmentIndex: 0, matchedWords: 6, totalWords: 6 }];
    await post({ mode: 'dictation', sessionId: 'session-one-1', answers: a });
    await post({ mode: 'dictation', sessionId: 'session-two-2', answers: a });
    await post({ mode: 'dictation', answers: a });
    await post({ mode: 'dictation', sessionId: { $ne: null }, answers: a });
    // Same id but the other mode is its own row.
    await post({ mode: 'shadowing', sessionId: 'session-one-1', answers: a });
    expect(await ShadowingAttempt.countDocuments({ userId: me._id, lessonId: lesson._id })).toBe(5);
  });
});

// ── Speaking course (multi-question exercise) ───────────────────────────
describe('speaking course — multi-question summary', () => {
  beforeEach(async () => {
    await WT1Course.findOneAndUpdate({ code: 'IELTS-SPEAKING' }, { code: 'IELTS-SPEAKING', title: 'Speaking', skill: 'speaking' }, { upsert: true });
    await WT1Module.findOneAndUpdate({ code: 'SPKD-M1' }, { code: 'SPKD-M1', courseCode: 'IELTS-SPEAKING', order: 1, title: 'P1' }, { upsert: true });
    await WT1Lesson.findOneAndUpdate({ code: 'SPKD-L1' }, { code: 'SPKD-L1', moduleCode: 'SPKD-M1', order: 1, title: 'Buổi 1', published: true }, { upsert: true });
    await WT1Exercise.deleteMany({ lessonCode: 'SPKD-L1' });
    await WT1Exercise.create({
      code: 'SPKD-L1-E1', lessonCode: 'SPKD-L1', order: 1, type: 'speaking_response', title: 'Nói', published: true,
      autoGrade: false, speakingPart: 1,
      items: [{ id: 'a', prompt: 'Q one?' }, { id: 'b', prompt: 'Q two?' }, { id: 'c', prompt: 'Q three?' }],
    });
    speakingService.gradeSpeaking.mockReset();
    speakingService.saveAttempt.mockClear();
  });

  test('criteria averages are half bands (not 6.333…), and the history mirror keeps every answer + a clamped duration', async () => {
    const u = await createPremiumStudent();
    const fb = (f) => ({ overallBand: 6, fluency: f, vocabulary: 6, grammar: 6, pronunciation: 6, overallFeedback: 'ok', strengths: [], mistakes: [], improvements: [] });
    speakingService.gradeSpeaking
      .mockResolvedValueOnce(fb(6)).mockResolvedValueOnce(fb(6)).mockResolvedValueOnce(fb(7));
    const say = (i, text, duration) => request(app).post('/api/wt1/submit-speaking').set(bearer(u))
      .send({ exerciseCode: 'SPKD-L1-E1', itemIndex: i, transcript: text, duration });
    await say(0, 'First answer about the first question here.', 20);
    await say(1, 'Second answer about the second question here.', 20);
    const last = await say(2, 'Third answer about the third question here.', 999999);
    expect(last.status).toBe(200);
    expect(last.body.isLast).toBe(true);
    expect(last.body.aggregate.fluency).toBe(6.5); // 6.333… → 6.5
    const sub = await WT1Submission.findOne({ userId: u._id, exerciseCode: 'SPKD-L1-E1', status: 'graded' }).lean();
    expect(sub.aiFeedback.scores.fluency).toBe(6.5);

    const mirror = speakingService.saveAttempt.mock.calls.at(-1)[1];
    expect(mirror.transcript).toContain('First answer');
    expect(mirror.transcript).toContain('Third answer');
    expect(mirror.duration).toBe(1800);
  });
});

// ── Speaking import (AI paste) ──────────────────────────────────────────
describe('speaking import parser', () => {
  test('two near-identical questions in one paste are flagged instead of imported twice', () => {
    const r = parseSpeakingText([
      '@topic', 'topic=Colours',
      '@part1',
      "What's your favourite colour?",
      'What is your favorite color?',
      'Do you like bright colours?',
    ].join('\n'));
    expect(r.valid).toBe(false);
    expect(r.errors.join(' ')).toMatch(/trùng/);
  });
});
