// Integration tests for the IELTS Entrance Test HTTP surface
// (routes/entranceTest.js, routes/admin/entranceTest.js): auth, resume/no
// dupes, random content draw + grammar shuffle, the full grammar ->
// reading -> listening -> writing -> speaking flow, exactly-once Writing
// submission under concurrent submits, the admin review/approve step,
// section locking, server-side timer expiry (+ the Speaking grace window),
// client-supplied fake scores being ignored, proctor violations, and the
// pre-Speaking legacy attempt path.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createPassage, createListeningSection, createWritingTask1 } = require('../factories/contentFactory');
const EntranceTestConfig = require('../../models/EntranceTestConfig');
const EntranceGrammarQuestion = require('../../models/EntranceGrammarQuestion');
const EntranceTestAttempt = require('../../models/EntranceTestAttempt');
const WritingAttempt = require('../../models/WritingAttempt');
const SpeakingQuestion = require('../../models/SpeakingQuestion');
const Message = require('../../models/Message');
const User = require('../../models/User');
const cloudinaryService = require('../../services/cloudinaryService');
const { entranceBand, roundIeltsHalf } = require('../../utils/bandScore');

// A free student whose first-24h trial window has already closed — the
// state requirePremium() would block. Used to prove the Entrance Test does
// NOT apply that gate (product decision: open to any logged-in account).
async function createExpiredFreeStudent() {
  const u = await createStudent();
  await User.collection.updateOne({ _id: u._id }, { $set: { createdAt: new Date('2020-01-01T00:00:00Z') } });
  return u;
}

function authed(user) {
  const token = signTokenFor(user);
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url, body) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body || {}),
    put: (url, body) => request(app).put(url).set('Authorization', `Bearer ${token}`).send(body || {}),
    multipart: (url) => request(app).post(url).set('Authorization', `Bearer ${token}`),
  };
}

async function seedGrammarQuestions(setKey = 'default') {
  await EntranceGrammarQuestion.create([
    {
      setKey, order: 1, topic: 'Present Perfect', type: 'mcq',
      prompt: 'She ___ here since 2020.',
      options: [{ id: 'A', text: 'lives' }, { id: 'B', text: 'has lived' }],
      answer: 'B',
    },
    {
      setKey, order: 2, topic: 'Present Perfect', type: 'gap_fill',
      prompt: 'I ___ (finish) my homework.',
      accept: ['have finished', "I've finished"],
    },
  ]);
}

// Content that satisfies entranceTestService.CONTENT_POOLS.
function eligiblePassage(overrides = {}) {
  return createPassage({
    category: 'passage2',
    questionRange: { start: 1, end: 1 },
    questionGroups: [{ groupType: 'plain', questions: [
      { questionNumber: 1, type: 'sentence-completion', questionText: 'The sky is __1__.', correctAnswer: 'blue' },
    ] }],
    ...overrides,
  });
}
function eligibleSection(overrides = {}) {
  return createListeningSection({
    partNumber: 3,
    questionRange: { start: 1, end: 1 },
    questionGroups: [{ groupType: 'plain', questions: [
      { questionNumber: 1, type: 'fill-blank', questionText: 'The answer is __1__.', correctAnswer: 'sunny' },
    ] }],
    extra: { audioUrl: 'https://res.cloudinary.com/demo/video/upload/v1/listening/fake.mp3', audioDuration: 400 },
    ...overrides,
  });
}
function eligibleTask1(overrides = {}) {
  return createWritingTask1({ prompt: 'Describe the chart.', imageUrl: 'https://res.cloudinary.com/demo/image/upload/chart.png', ...overrides });
}
function eligibleCueCard(overrides = {}) {
  return SpeakingQuestion.create({
    topic: 'A memorable trip', part: 2, question: 'Describe a memorable trip you took.',
    cueCard: 'You should say:\n- where you went\n- who you went with\n- and explain why it was memorable',
    sampleAnswer: 'SAMPLE ANSWER TEXT', hints: { vocab: ['breathtaking'] },
    ...overrides,
  });
}

async function seedFullConfig() {
  await seedGrammarQuestions();
  const [passage, section, task1, cue] = await Promise.all([eligiblePassage(), eligibleSection(), eligibleTask1(), eligibleCueCard()]);
  await EntranceTestConfig.create({ grammarSetKey: 'default', isActive: true });
  return { passage, section, task1, cue };
}

async function startAndGetAttempt(api) {
  const start = await api.post('/api/entrance-test/start');
  expect(start.status).toBe(201);
  const attemptId = start.body.attemptId;
  const get = await api.get(`/api/entrance-test/${attemptId}`);
  return { attemptId, attempt: get.body.attempt };
}

// Drives the test through Writing (and Speaking unless stopBeforeSpeaking),
// answering everything correctly unless told otherwise.
async function playThrough(api, {
  answerGrammarWrong = false, answerReadingWrong = false, answerListeningWrong = false,
  writingAnswer = 'word '.repeat(160), speakingTranscript = 'I went to Da Lat with my family last summer.',
  stopBeforeSpeaking = false,
} = {}) {
  const { attemptId, attempt } = await startAndGetAttempt(api);

  const gq = attempt.sections.grammar.questions;
  for (const q of gq) {
    const answer = answerGrammarWrong ? 'wrong answer' : (q.type === 'mcq' ? 'B' : 'have finished');
    await api.post(`/api/entrance-test/${attemptId}/answer`, { section: 'grammar', questionId: q._id, answer });
  }
  await api.post(`/api/entrance-test/${attemptId}/section/grammar/submit`);

  await api.post(`/api/entrance-test/${attemptId}/answer`, { section: 'reading', questionNumber: 1, answer: answerReadingWrong ? 'red' : 'blue' });
  await api.post(`/api/entrance-test/${attemptId}/section/reading/submit`);

  await api.post(`/api/entrance-test/${attemptId}/answer`, { section: 'listening', questionNumber: 1, answer: answerListeningWrong ? 'rainy' : 'sunny' });
  await api.post(`/api/entrance-test/${attemptId}/section/listening/submit`);

  await api.post(`/api/entrance-test/${attemptId}/answer`, { section: 'writing', writingAnswer });
  await api.post(`/api/entrance-test/${attemptId}/section/writing/submit`);

  if (!stopBeforeSpeaking) {
    await api.post(`/api/entrance-test/${attemptId}/section/speaking/submit`, { transcript: speakingTranscript, durationSec: 95 });
  }
  return attemptId;
}

describe('POST /api/entrance-test/start', () => {
  test('401 without a token', async () => {
    const res = await request(app).post('/api/entrance-test/start');
    expect(res.status).toBe(401);
  });

  test('503 when a content pool is empty (no Part 2 cue card)', async () => {
    await seedGrammarQuestions();
    await Promise.all([eligiblePassage(), eligibleSection(), eligibleTask1()]);
    const res = await authed(await createStudent()).post('/api/entrance-test/start');
    expect(res.status).toBe(503);
  });

  test('a free student with an expired trial can still start (no premium gate)', async () => {
    await seedFullConfig();
    const res = await authed(await createExpiredFreeStudent()).post('/api/entrance-test/start');
    expect(res.status).toBe(201);
  });

  test('a second start resumes the same in-progress attempt (no duplicates)', async () => {
    await seedFullConfig();
    const api = authed(await createStudent());
    const first = await api.post('/api/entrance-test/start');
    const second = await api.post('/api/entrance-test/start');
    expect(second.status).toBe(200);
    expect(second.body.resumed).toBe(true);
    expect(second.body.attemptId).toBe(first.body.attemptId);
  });

  test('starting again after a completed attempt starts a brand new one (self-serve retake)', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const firstId = await playThrough(authed(student));
    const again = await authed(student).post('/api/entrance-test/start');
    expect(again.status).toBe(201);
    expect(again.body.attemptId).not.toBe(String(firstId));
  });
});

describe('random content draw', () => {
  test('only eligible content is ever drawn (Passage 2 + Listening Part 3 only; hidden / no audio / too long / Part 1 speaking excluded)', async () => {
    const { passage, section, task1, cue } = await seedFullConfig();
    await eligiblePassage({ isActive: false });
    await eligiblePassage({ category: 'passage1' });
    await eligiblePassage({ category: 'passage3' });
    await eligibleSection({ partNumber: 1 });
    await eligibleSection({ partNumber: 4 });
    await eligibleSection({ extra: { audioUrl: '', audioDuration: 300 } });
    await eligibleSection({ extra: { audioUrl: 'https://res.cloudinary.com/demo/video/upload/long.mp3', audioDuration: 900 } });
    await eligibleTask1({ isActive: false });
    await eligibleCueCard({ part: 1 });
    await eligibleCueCard({ isActive: false });

    for (let i = 0; i < 3; i++) {
      const student = await createStudent();
      const { attemptId } = await startAndGetAttempt(authed(student));
      const doc = await EntranceTestAttempt.findById(attemptId).lean();
      expect(String(doc.configSnapshot.readingPassageId)).toBe(String(passage._id));
      expect(String(doc.configSnapshot.listeningSectionId)).toBe(String(section._id));
      expect(String(doc.configSnapshot.writingTask1Id)).toBe(String(task1._id));
      expect(String(doc.configSnapshot.speakingQuestionId)).toBe(String(cue._id));
    }
  });

  test('a retake draws content the student has not had yet when the pool allows it', async () => {
    await seedFullConfig();
    await Promise.all([eligiblePassage(), eligibleSection(), eligibleTask1(), eligibleCueCard()]);
    const student = await createStudent();
    const firstId = await playThrough(authed(student));
    const { attemptId: secondId } = await startAndGetAttempt(authed(student));

    const [a, b] = await Promise.all([
      EntranceTestAttempt.findById(firstId).lean(),
      EntranceTestAttempt.findById(secondId).lean(),
    ]);
    for (const k of ['readingPassageId', 'listeningSectionId', 'writingTask1Id', 'speakingQuestionId']) {
      expect(String(b.configSnapshot[k])).not.toBe(String(a.configSnapshot[k]));
    }
  });

  test('grammar uses the configured question set (shuffled order, same questions)', async () => {
    await seedFullConfig();
    const { attempt } = await startAndGetAttempt(authed(await createStudent()));
    const ids = attempt.sections.grammar.questions.map(q => q._id).sort();
    const bank = (await EntranceGrammarQuestion.find({ setKey: 'default' }).lean()).map(q => String(q._id)).sort();
    expect(ids).toEqual(bank);
  });
});

describe('GET /api/entrance-test/:attemptId', () => {
  test('never includes an answer key, a sample answer or vocab hints', async () => {
    await seedFullConfig();
    const { attempt } = await startAndGetAttempt(authed(await createStudent()));
    const raw = JSON.stringify(attempt);
    expect(raw).not.toMatch(/"answer":"B"/);
    expect(raw).not.toMatch(/correctAnswer/);
    expect(raw).not.toMatch(/"accept"/);
    expect(raw).not.toMatch(/SAMPLE ANSWER TEXT/);
    expect(raw).not.toMatch(/breathtaking/);
    expect(attempt.sectionOrder).toEqual(['grammar', 'reading', 'listening', 'writing', 'speaking']);
    expect(attempt.sections.speaking.question.cueCard).toMatch(/You should say/);
    expect(attempt.sections.speaking.prepSec).toBe(70);
  });

  test('404 for another student\'s attempt (ownership check)', async () => {
    await seedFullConfig();
    const { attemptId } = await startAndGetAttempt(authed(await createStudent()));
    const res = await authed(await createStudent()).get(`/api/entrance-test/${attemptId}`);
    expect(res.status).toBe(404);
  });
});

describe('full flow + admin review', () => {
  test('grades G/R/L, links exactly one WritingAttempt, waits for Writing, then admin approval publishes the result', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const attemptId = await playThrough(authed(student));

    let attempt = await EntranceTestAttempt.findById(attemptId);
    expect(attempt.status).toBe('completed');
    expect(attempt.currentSection).toBe('done');
    expect(attempt.sections.grammar.correctCount).toBe(2);
    expect(attempt.sections.reading.correctCount).toBe(1);
    expect(attempt.sections.listening.correctCount).toBe(1);
    expect(attempt.sections.speaking.transcript).toMatch(/Da Lat/);
    expect(attempt.sections.speaking.durationSec).toBe(95);
    expect(attempt.resultStatus).toBe('PENDING_WRITING');
    expect(attempt.overallBand).toBeNull();

    const was = await WritingAttempt.find({ userId: student._id });
    expect(was).toHaveLength(1);
    expect(String(was[0]._id)).toBe(String(attempt.sections.writing.writingAttemptId));
    expect(was[0].examName).toBe('IELTS Entrance Test');

    // Before approval the student sees no scores at all.
    let result = await authed(student).get(`/api/entrance-test/${attemptId}/result`);
    expect(result.status).toBe(200);
    expect(result.body.pendingReview).toBe(true);
    expect(result.body.sections).toBeUndefined();
    expect(result.body.overallBand).toBeUndefined();

    // The AI grades Task 1 → the admin list pulls it in → PENDING_REVIEW.
    await WritingAttempt.updateOne({ _id: was[0]._id }, { $set: { 'aiGrading.task1': { bandScore: 6 }, gradingStatus: 'ai_done' } });
    await EntranceTestAttempt.updateOne({ _id: attemptId }, { $set: { 'sections.speaking.aiStatus': 'done', 'sections.speaking.aiBand': 5.5 } });
    const teacher = authed(await createTeacher());
    const list = await teacher.get('/api/admin/entrance-test/attempts?resultStatus=PENDING_REVIEW');
    expect(list.status).toBe(200);
    expect(list.body.attempts).toHaveLength(1);
    expect(list.body.pendingReview).toBe(1);
    const expectedGrammar = entranceBand('grammar', 2);
    const expectedReading = entranceBand('reading13', 1);
    const expectedListening = entranceBand('listening10', 1);
    const proposed = roundIeltsHalf((expectedGrammar + expectedReading + expectedListening + 6 + 5.5) / 5);
    expect(list.body.attempts[0].proposed.overall).toBe(proposed);

    // Still hidden from the student until approved.
    result = await authed(student).get(`/api/entrance-test/${attemptId}/result`);
    expect(result.body.pendingReview).toBe(true);

    // Admin adjusts Speaking and approves.
    const approve = await teacher.post(`/api/admin/entrance-test/attempts/${attemptId}/approve`, {
      writingBand: '6.0', speakingBand: '6.5', adminNote: 'Nên học lớp 6.0',
    });
    expect(approve.status).toBe(200);
    const expectedOverall = roundIeltsHalf((expectedGrammar + expectedReading + expectedListening + 6 + 6.5) / 5);
    expect(approve.body.attempt.overallBand).toBe(expectedOverall);

    attempt = await EntranceTestAttempt.findById(attemptId);
    expect(attempt.resultStatus).toBe('COMPLETED');
    expect(attempt.sections.speaking.band).toBe(6.5);

    result = await authed(student).get(`/api/entrance-test/${attemptId}/result`);
    expect(result.body.resultStatus).toBe('COMPLETED');
    expect(result.body.overallBand).toBe(expectedOverall);
    expect(result.body.sections.speaking.band).toBe(6.5);
    expect(result.body.sections.speaking.aiFeedback).toBeUndefined();
    expect(result.body.adminNote).toBe('Nên học lớp 6.0');
    expect(result.body.sections.grammar.questions[0].correctAnswer).toBeDefined();

    const msgs = await Message.find({ toId: student._id });
    expect(msgs).toHaveLength(1);
    expect(msgs[0].body).toMatch(/Speaking: 6\.5/);

    // Editing an approved result doesn't message the student again.
    await teacher.post(`/api/admin/entrance-test/attempts/${attemptId}/approve`, { writingBand: '6.5', speakingBand: '6.5' });
    expect(await Message.countDocuments({ toId: student._id })).toBe(1);
  });

  test('approve validates bands and refuses an unfinished attempt', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const teacher = authed(await createTeacher());
    const { attemptId: openId } = await startAndGetAttempt(authed(student));
    const early = await teacher.post(`/api/admin/entrance-test/attempts/${openId}/approve`, { writingBand: '6', speakingBand: '6' });
    expect(early.status).toBe(409);

    await EntranceTestAttempt.deleteOne({ _id: openId });
    const doneId = await playThrough(authed(student));
    const bad = await teacher.post(`/api/admin/entrance-test/attempts/${doneId}/approve`, { writingBand: '6.3', speakingBand: '6' });
    expect(bad.status).toBe(400);
    const missing = await teacher.post(`/api/admin/entrance-test/attempts/${doneId}/approve`, { writingBand: '6' });
    expect(missing.status).toBe(400);
    const asStudent = await authed(student).post(`/api/admin/entrance-test/attempts/${doneId}/approve`, { writingBand: '6', speakingBand: '6' });
    expect(asStudent.status).toBe(403);
  });

  test('an empty essay and silent speaking still reach the review queue (band 0 suggestions)', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const attemptId = await playThrough(authed(student), { writingAnswer: '', speakingTranscript: '' });
    const doc = await EntranceTestAttempt.findById(attemptId);
    expect(doc.sections.writing.aiBand).toBe(0);
    expect(doc.sections.speaking.aiBand).toBe(0);
    expect(doc.resultStatus).toBe('PENDING_REVIEW');
  });

  test('getResult 409s while the attempt is still in-progress', async () => {
    await seedFullConfig();
    const api = authed(await createStudent());
    const { attemptId } = await startAndGetAttempt(api);
    const res = await api.get(`/api/entrance-test/${attemptId}/result`);
    expect(res.status).toBe(409);
  });
});

describe('Writing is submitted exactly once', () => {
  test('several concurrent Writing submits (click + timer + re-sync) create ONE WritingAttempt', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const api = authed(student);
    const { attemptId: id2 } = await startAndGetAttempt(api);
    for (const s of ['grammar', 'reading', 'listening']) await api.post(`/api/entrance-test/${id2}/section/${s}/submit`);
    await api.post(`/api/entrance-test/${id2}/answer`, { section: 'writing', writingAnswer: 'word '.repeat(170) });

    const results = await Promise.all([
      api.post(`/api/entrance-test/${id2}/section/writing/submit`),
      api.post(`/api/entrance-test/${id2}/section/writing/submit`),
      api.post(`/api/entrance-test/${id2}/section/writing/submit`),
      api.get(`/api/entrance-test/${id2}`),
    ]);
    results.slice(0, 3).forEach(r => expect(r.status).toBe(200));

    expect(await WritingAttempt.countDocuments({ userId: student._id })).toBe(1);
    const doc = await EntranceTestAttempt.findById(id2);
    expect(doc.currentSection).toBe('speaking');
    expect(await WritingAttempt.exists({ _id: doc.sections.writing.writingAttemptId })).toBeTruthy();
  });

  test('Writing expiring while a submit is in flight still creates ONE WritingAttempt', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const api = authed(student);
    const { attemptId } = await startAndGetAttempt(api);
    for (const s of ['grammar', 'reading', 'listening']) await api.post(`/api/entrance-test/${attemptId}/section/${s}/submit`);
    await EntranceTestAttempt.updateOne({ _id: attemptId }, { $set: { 'sections.writing.sectionExpiresAt': new Date(Date.now() - 1000) } });

    await Promise.all([
      api.get(`/api/entrance-test/${attemptId}`),
      api.get(`/api/entrance-test/${attemptId}`),
      api.post(`/api/entrance-test/${attemptId}/section/writing/submit`),
    ]);
    expect(await WritingAttempt.countDocuments({ userId: student._id })).toBe(1);
  });
});

describe('Speaking section', () => {
  async function reachSpeaking(api) {
    const { attemptId } = await startAndGetAttempt(api);
    for (const s of ['grammar', 'reading', 'listening', 'writing']) await api.post(`/api/entrance-test/${attemptId}/section/${s}/submit`);
    return attemptId;
  }

  test('multipart submit stores the recording + transcript and returns no feedback', async () => {
    await seedFullConfig();
    const upload = jest.spyOn(cloudinaryService, 'uploadBufferStream')
      .mockResolvedValue({ secure_url: 'https://res.cloudinary.com/demo/video/upload/entrance-speaking/x.webm', public_id: 'entrance-speaking/x' });
    try {
      const api = authed(await createStudent());
      const attemptId = await reachSpeaking(api);
      const res = await api.multipart(`/api/entrance-test/${attemptId}/section/speaking/submit`)
        .field('transcript', 'My most memorable trip was to Hoi An.')
        .field('durationSec', '118')
        .attach('audio', Buffer.from('fake-webm-bytes'), { filename: 'speaking.webm', contentType: 'audio/webm' });
      expect(res.status).toBe(200);
      expect(JSON.stringify(res.body)).not.toMatch(/aiFeedback|aiBand|overallBand/);
      expect(upload).toHaveBeenCalledTimes(1);

      const doc = await EntranceTestAttempt.findById(attemptId);
      expect(doc.status).toBe('completed');
      expect(doc.sections.speaking.audioUrl).toMatch(/entrance-speaking/);
      expect(doc.sections.speaking.transcript).toMatch(/Hoi An/);
      expect(doc.sections.speaking.durationSec).toBe(118);
      expect(doc.sections.speaking.aiStatus).toBe('pending');

      const detail = await authed(await createTeacher()).get(`/api/admin/entrance-test/attempts/${attemptId}`);
      expect(detail.body.attempt.sections.speaking.audioUrl).toMatch(/entrance-speaking/);
      expect(detail.body.attempt.sections.speaking.transcript).toMatch(/Hoi An/);
    } finally {
      upload.mockRestore();
    }
  });

  test('the transcript can be typed/autosaved and is graded on expiry after the grace window', async () => {
    await seedFullConfig();
    const api = authed(await createStudent());
    const attemptId = await reachSpeaking(api);
    const save = await api.post(`/api/entrance-test/${attemptId}/answer`, { section: 'speaking', transcript: 'typed answer' });
    expect(save.status).toBe(200);

    // Past the deadline but inside the upload grace → still open.
    await EntranceTestAttempt.updateOne({ _id: attemptId }, { $set: { 'sections.speaking.sectionExpiresAt': new Date(Date.now() - 20 * 1000) } });
    let res = await api.get(`/api/entrance-test/${attemptId}`);
    expect(res.body.attempt.currentSection).toBe('speaking');

    // Past the grace → auto-finalized with the autosaved transcript.
    await EntranceTestAttempt.updateOne({ _id: attemptId }, { $set: { 'sections.speaking.sectionExpiresAt': new Date(Date.now() - 120 * 1000) } });
    res = await api.get(`/api/entrance-test/${attemptId}`);
    expect(res.body.attempt.currentSection).toBe('done');
    const doc = await EntranceTestAttempt.findById(attemptId);
    expect(doc.sections.speaking.transcript).toBe('typed answer');
  });

  test('a double Speaking submit is a no-op, not an error', async () => {
    await seedFullConfig();
    const api = authed(await createStudent());
    const attemptId = await reachSpeaking(api);
    const [a, b] = await Promise.all([
      api.post(`/api/entrance-test/${attemptId}/section/speaking/submit`, { transcript: 'one' }),
      api.post(`/api/entrance-test/${attemptId}/section/speaking/submit`, { transcript: 'two' }),
    ]);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
  });
});

describe('section locking / immutability', () => {
  test('cannot submit a section other than the current one', async () => {
    await seedFullConfig();
    const api = authed(await createStudent());
    const { attemptId } = await startAndGetAttempt(api);
    const res = await api.post(`/api/entrance-test/${attemptId}/section/reading/submit`);
    expect(res.status).toBe(409);
  });

  test('re-submitting an already-submitted section is a harmless no-op, not an error', async () => {
    await seedFullConfig();
    const api = authed(await createStudent());
    const { attemptId } = await startAndGetAttempt(api);
    await api.post(`/api/entrance-test/${attemptId}/section/grammar/submit`);
    const again = await api.post(`/api/entrance-test/${attemptId}/section/grammar/submit`);
    expect(again.status).toBe(200);
  });

  test('cannot save an answer for a section that is not current', async () => {
    await seedFullConfig();
    const api = authed(await createStudent());
    const { attemptId } = await startAndGetAttempt(api);
    const res = await api.post(`/api/entrance-test/${attemptId}/answer`, { section: 'reading', questionNumber: 1, answer: 'blue' });
    expect(res.status).toBe(409);
  });

  test('a completed attempt rejects any further answer/submit calls', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const attemptId = await playThrough(authed(student));
    const res = await authed(student).post(`/api/entrance-test/${attemptId}/answer`, { section: 'speaking', transcript: 'x' });
    expect(res.status).toBe(409);
    const resubmit = await authed(student).post(`/api/entrance-test/${attemptId}/section/grammar/submit`);
    expect(resubmit.status).toBe(409);
  });
});

describe('server-side timer expiry', () => {
  test('an expired section auto-finalizes (grading whatever was autosaved) on the next read, without waiting for a manual submit', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const api = authed(student);
    const { attemptId, attempt } = await startAndGetAttempt(api);

    const gq = attempt.sections.grammar.questions;
    // Only answer the mcq one correctly — never submit.
    await api.post(`/api/entrance-test/${attemptId}/answer`, { section: 'grammar', questionId: gq.find(q => q.type === 'mcq')._id, answer: 'B' });

    await EntranceTestAttempt.updateOne(
      { _id: attemptId },
      { $set: { 'sections.grammar.sectionExpiresAt': new Date(Date.now() - 1000) } }
    );

    const res = await api.get(`/api/entrance-test/${attemptId}`);
    expect(res.status).toBe(200);
    expect(res.body.attempt.currentSection).toBe('reading');

    const doc = await EntranceTestAttempt.findById(attemptId);
    expect(doc.sections.grammar.submittedAt).toBeTruthy();
    expect(doc.sections.grammar.correctCount).toBe(1); // only the mcq was answered
  });
});

describe('content independence from the normal catalogue (spec §22)', () => {
  test('hiding the drawn Passage/ListeningSection/WritingTask1/cue card after start does not break the attempt', async () => {
    const { passage, section, task1, cue } = await seedFullConfig();
    const student = await createStudent();
    const api = authed(student);
    const { attemptId } = await startAndGetAttempt(api);
    passage.isActive = false; await passage.save();
    section.isActive = false; await section.save();
    task1.isActive = false; await task1.save();
    cue.isActive = false; await cue.save();

    await api.post(`/api/entrance-test/${attemptId}/section/grammar/submit`);
    await api.post(`/api/entrance-test/${attemptId}/answer`, { section: 'reading', questionNumber: 1, answer: 'blue' });
    await api.post(`/api/entrance-test/${attemptId}/section/reading/submit`);
    await api.post(`/api/entrance-test/${attemptId}/answer`, { section: 'listening', questionNumber: 1, answer: 'sunny' });
    await api.post(`/api/entrance-test/${attemptId}/section/listening/submit`);
    await api.post(`/api/entrance-test/${attemptId}/section/writing/submit`);
    await api.post(`/api/entrance-test/${attemptId}/section/speaking/submit`, { transcript: 'hello' });

    const attempt = await EntranceTestAttempt.findById(attemptId);
    expect(attempt.status).toBe('completed');
    expect(attempt.sections.reading.correctCount).toBe(1);
    expect(attempt.sections.listening.correctCount).toBe(1);
    expect(attempt.sections.writing.writingAttemptId).toBeTruthy();
  });
});

describe('client cannot forge scores', () => {
  test('a fake correctCount/band/overallBand sent in the answer/submit body is ignored', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const api = authed(student);
    const { attemptId, attempt } = await startAndGetAttempt(api);
    const gq = attempt.sections.grammar.questions;
    for (const q of gq) {
      await api.post(`/api/entrance-test/${attemptId}/answer`, {
        section: 'grammar', questionId: q._id, answer: 'definitely wrong',
        correctCount: 999, band: 9, overallBand: 9,
      });
    }
    await api.post(`/api/entrance-test/${attemptId}/section/grammar/submit`, { correctCount: 999, band: 9 });

    const doc = await EntranceTestAttempt.findById(attemptId);
    expect(doc.sections.grammar.correctCount).toBe(0);
    expect(doc.sections.grammar.band).toBe(1.0);
    expect(doc.overallBand).toBeNull();
  });
});

describe('legacy (pre-Speaking) attempts', () => {
  test('an attempt with no Speaking snapshot still ends after Writing and completes once the teacher confirms Writing', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const api = authed(student);
    const { attemptId } = await startAndGetAttempt(api);
    // Simulate an attempt started before the Speaking section existed.
    await EntranceTestAttempt.collection.updateOne({ _id: (await EntranceTestAttempt.findById(attemptId))._id }, { $unset: { 'sections.speaking': '' } });

    for (const s of ['grammar', 'reading', 'listening', 'writing']) {
      const r = await api.post(`/api/entrance-test/${attemptId}/section/${s}/submit`);
      expect(r.status).toBe(200);
    }
    let doc = await EntranceTestAttempt.findById(attemptId);
    expect(doc.currentSection).toBe('done');
    expect(doc.resultStatus).toBe('PENDING_WRITING');

    await WritingAttempt.updateOne({ _id: doc.sections.writing.writingAttemptId }, { $set: { 'grading.overallBand': 6.5, gradingStatus: 'confirmed' } });
    const result = await api.get(`/api/entrance-test/${attemptId}/result`);
    expect(result.body.resultStatus).toBe('COMPLETED');
    expect(result.body.sections.writing.band).toBe(6.5);
    expect(result.body.sections.speaking).toBeUndefined();
  });
});

describe('proctor violations', () => {
  test('counts violations and disqualifies past MAX_VIOLATIONS (5), with a cooldown blocking a new start', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const api = authed(student);
    const { attemptId } = await startAndGetAttempt(api);

    let last;
    for (let i = 0; i < 6; i++) {
      last = await api.post(`/api/entrance-test/${attemptId}/violation`, { type: 'blur' });
      expect(last.status).toBe(200);
    }
    expect(last.body.violationCount).toBe(6);
    expect(last.body.disqualified).toBe(true);
    expect(last.body.cooldownSeconds).toBeGreaterThan(0);

    const doc = await EntranceTestAttempt.findById(attemptId);
    expect(doc.status).toBe('disqualified');
    expect(doc.resultStatus).toBe('DISQUALIFIED');

    const restart = await api.post('/api/entrance-test/start');
    expect(restart.status).toBe(429);
    expect(restart.body.code).toBe('ENTRANCE_TEST_COOLDOWN');
  });

  test('400 for an unknown violation type', async () => {
    await seedFullConfig();
    const api = authed(await createStudent());
    const { attemptId } = await startAndGetAttempt(api);
    const res = await api.post(`/api/entrance-test/${attemptId}/violation`, { type: 'not-a-real-type' });
    expect(res.status).toBe(400);
  });
});

describe('admin config', () => {
  test('a student is rejected (403)', async () => {
    const res = await authed(await createStudent()).put('/api/admin/entrance-test/config', {});
    expect(res.status).toBe(403);
  });

  test('a teacher sees the random-draw pool sizes and can change the grammar set', async () => {
    await seedFullConfig();
    const teacher = authed(await createTeacher());
    const get = await teacher.get('/api/admin/entrance-test/config');
    expect(get.status).toBe(200);
    expect(get.body.pools).toEqual({ reading: 1, listening: 1, writing: 1, speaking: 1, grammar: 2 });

    const put = await teacher.put('/api/admin/entrance-test/config', { grammarSetKey: 'set-b' });
    expect(put.status).toBe(200);
    expect(put.body.config.grammarSetKey).toBe('set-b');
    expect(await EntranceTestConfig.countDocuments({ isActive: true })).toBe(1);

    // No grammar questions in set-b → the landing page reports unavailable.
    const landing = await authed(await createStudent()).get('/api/entrance-test');
    expect(landing.body.available).toBe(false);
  });

  test('an admin can CRUD grammar bank questions', async () => {
    const admin = authed(await createAdmin());
    const create = await admin.post('/api/admin/entrance-test/grammar-questions', {
      setKey: 'default', order: 99, topic: 'Articles', type: 'mcq',
      prompt: 'I saw ___ elephant.', options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'an' }], answer: 'B',
    });
    expect(create.status).toBe(201);

    const updated = await admin.put(`/api/admin/entrance-test/grammar-questions/${create.body.question._id}`, {
      topic: 'Articles', type: 'mcq', prompt: 'updated',
      options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'an' }], answer: 'A',
    });
    expect(updated.status).toBe(200);
    expect(updated.body.question.prompt).toBe('updated');
  });

  test('rejects an mcq question whose answer does not match any option', async () => {
    const admin = authed(await createAdmin());
    const res = await admin.post('/api/admin/entrance-test/grammar-questions', {
      setKey: 'default', topic: 'Articles', type: 'mcq',
      prompt: 'bad question', options: [{ id: 'A', text: 'a' }], answer: 'Z',
    });
    expect(res.status).toBe(400);
  });
});
