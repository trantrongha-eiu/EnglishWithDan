// Integration tests for the IELTS Entrance Test HTTP surface
// (routes/entranceTest.js, routes/admin/entranceTest.js): auth, resume/no
// dupes, the full grammar->reading->listening->writing flow, section
// locking, server-side timer expiry, content-independence from the normal
// catalogue's isActive filter, client-supplied fake scores being ignored,
// and proctor violation/disqualify/cooldown.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createPassage, createListeningSection, createWritingTask1 } = require('../factories/contentFactory');
const EntranceTestConfig = require('../../models/EntranceTestConfig');
const EntranceGrammarQuestion = require('../../models/EntranceGrammarQuestion');
const EntranceTestAttempt = require('../../models/EntranceTestAttempt');
const WritingAttempt = require('../../models/WritingAttempt');
const User = require('../../models/User');
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

async function seedFullConfig() {
  await seedGrammarQuestions();
  const passage = await createPassage({
    category: 'passage1',
    questionRange: { start: 1, end: 1 },
    questionGroups: [{ groupType: 'plain', questions: [
      { questionNumber: 1, type: 'sentence-completion', questionText: 'The sky is __1__.', correctAnswer: 'blue' },
    ] }],
  });
  const section = await createListeningSection({
    partNumber: 1,
    questionRange: { start: 1, end: 1 },
    questionGroups: [{ groupType: 'plain', questions: [
      { questionNumber: 1, type: 'fill-blank', questionText: 'The answer is __1__.', correctAnswer: 'sunny' },
    ] }],
    audioUrl: 'https://res.cloudinary.com/demo/video/upload/v1/listening/fake.mp3',
  });
  const task1 = await createWritingTask1({ prompt: 'Describe the chart.' });
  await EntranceTestConfig.create({
    readingPassageId: passage._id,
    listeningSectionId: section._id,
    writingTask1Id: task1._id,
    grammarSetKey: 'default',
    isActive: true,
  });
  return { passage, section, task1 };
}

async function startAndGetAttempt(api) {
  const start = await api.post('/api/entrance-test/start');
  expect(start.status).toBe(201);
  const attemptId = start.body.attemptId;
  const get = await api.get(`/api/entrance-test/${attemptId}`);
  return { attemptId, attempt: get.body.attempt };
}

// Drives the whole test to a chosen point, answering everything correctly
// unless told otherwise. Returns { attemptId, api }.
async function playThrough(api, { answerGrammarWrong = false, answerReadingWrong = false, answerListeningWrong = false, writingAnswer = 'word '.repeat(160) } = {}) {
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

  return attemptId;
}

describe('POST /api/entrance-test/start', () => {
  test('401 without a token', async () => {
    const res = await request(app).post('/api/entrance-test/start');
    expect(res.status).toBe(401);
  });

  test('503 when no config is active', async () => {
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

    const count = await EntranceTestAttempt.countDocuments({});
    expect(count).toBe(1);
  });

  test('starting again after a completed attempt does not create a new one (no self-serve retake)', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const api = authed(student);
    await playThrough(api);

    const again = await api.post('/api/entrance-test/start');
    expect(again.status).toBe(200);
    expect(again.body.alreadyExists).toBe(true);
    const count = await EntranceTestAttempt.countDocuments({ userId: student._id });
    expect(count).toBe(1);
  });
});

describe('GET /api/entrance-test/:attemptId', () => {
  test('never includes an answer key for any section', async () => {
    await seedFullConfig();
    const { attempt } = await startAndGetAttempt(authed(await createStudent()));
    const raw = JSON.stringify(attempt);
    expect(raw).not.toContain('correctAnswer');
    expect(raw).not.toMatch(/"answer":"B"/); // the mcq's own correct-option id
    expect(raw).not.toContain('sunny');
    expect(raw).not.toContain('"blue"');
  });

  test('404 for another student\'s attempt (ownership check)', async () => {
    await seedFullConfig();
    const owner = authed(await createStudent());
    const { attemptId } = await startAndGetAttempt(owner);
    const intruder = authed(await createStudent());
    const res = await intruder.get(`/api/entrance-test/${attemptId}`);
    expect(res.status).toBe(404);
  });
});

describe('full grammar -> reading -> listening -> writing flow', () => {
  test('grades correctly and ends PENDING_WRITING until the linked WritingAttempt is graded', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const attemptId = await playThrough(authed(student));

    const attempt = await EntranceTestAttempt.findById(attemptId);
    expect(attempt.status).toBe('completed');
    expect(attempt.currentSection).toBe('done');
    expect(attempt.sections.grammar.correctCount).toBe(2);
    expect(attempt.sections.reading.correctCount).toBe(1);
    expect(attempt.sections.listening.correctCount).toBe(1);
    expect(attempt.sections.writing.band).toBeNull();
    expect(attempt.resultStatus).toBe('PENDING_WRITING');
    expect(attempt.overallBand).toBeNull();

    // Writing section created a real WritingAttempt reusing the existing
    // grading queue (per product decision), tagged distinctly.
    const wa = await WritingAttempt.findById(attempt.sections.writing.writingAttemptId);
    expect(wa).toBeTruthy();
    expect(wa.examName).toBe('IELTS Entrance Test');
    expect(wa.submissionType).toBe('exam');

    // Once a teacher confirms a grade on that WritingAttempt, the next
    // result poll picks it up and completes the overall result.
    wa.grading = { task1: { bandScore: 6.5 }, overallBand: 6.5 };
    wa.gradingStatus = 'confirmed';
    await wa.save();

    const result = await authed(student).get(`/api/entrance-test/${attemptId}/result`);
    expect(result.status).toBe(200);
    expect(result.body.resultStatus).toBe('COMPLETED');
    expect(result.body.sections.writing.band).toBe(6.5);
    expect(result.body.overallBand).not.toBeNull();
    // This fixture only seeds 2 grammar / 1 reading / 1 listening question
    // (a full attempt has 25/13/10) — the entrance-test band tables are
    // absolute-threshold, calibrated to the REAL question counts, so a
    // small fixture like this floors to low individual bands. That's
    // expected and correct; what this test actually verifies is that the
    // 4 section bands are wired into the exact IELTS-half-rounded average
    // formula, not any particular "should be high" number.
    const expectedGrammar = entranceBand('grammar', 2);
    const expectedReading = entranceBand('reading13', 1);
    const expectedListening = entranceBand('listening10', 1);
    const expectedOverall = roundIeltsHalf((expectedGrammar + expectedReading + expectedListening + 6.5) / 4);
    expect(result.body.sections.grammar.band).toBe(expectedGrammar);
    expect(result.body.sections.reading.band).toBe(expectedReading);
    expect(result.body.sections.listening.band).toBe(expectedListening);
    expect(result.body.overallBand).toBe(expectedOverall);
  });

  test('result reveals the answer key + a grammar weakness breakdown', async () => {
    await seedFullConfig();
    const student = await createStudent();
    const attemptId = await playThrough(authed(student), { answerGrammarWrong: true });
    const result = await authed(student).get(`/api/entrance-test/${attemptId}/result`);
    expect(result.status).toBe(200);
    const gq = result.body.sections.grammar.questions;
    expect(gq.every(q => q.correctAnswer != null)).toBe(true);
    expect(gq.every(q => q.correct === false)).toBe(true);
    expect(result.body.grammarWeaknesses.find(w => w.topic === 'Present Perfect').level).toBe('Weak');
  });

  test('getResult 409s while the attempt is still in-progress', async () => {
    await seedFullConfig();
    const api = authed(await createStudent());
    const { attemptId } = await startAndGetAttempt(api);
    const res = await api.get(`/api/entrance-test/${attemptId}/result`);
    expect(res.status).toBe(409);
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
    const res = await authed(student).post(`/api/entrance-test/${attemptId}/answer`, { section: 'writing', writingAnswer: 'x' });
    expect(res.status).toBe(409);
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

    // Force the section's deadline into the past, simulating time running out.
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
  test('hiding the assigned Passage/ListeningSection/WritingTask1 does not break starting or grading an Entrance Test attempt', async () => {
    const { passage, section, task1 } = await seedFullConfig();
    // Admin hides all three from their normal student-facing catalogues.
    passage.isActive = false; await passage.save();
    section.isActive = false; await section.save();
    task1.isActive = false; await task1.save();

    const student = await createStudent();
    const attemptId = await playThrough(authed(student));
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
    // Answer everything wrong, but try to smuggle a fake perfect score in.
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

  test('a teacher can view and update the assigned content', async () => {
    const { passage, section, task1 } = await seedFullConfig();
    const teacher = authed(await createTeacher());
    const get = await teacher.get('/api/admin/entrance-test/config');
    expect(get.status).toBe(200);
    expect(get.body.config.readingPassageId._id).toBe(String(passage._id));

    const newPassage = await createPassage({ category: 'passage1' });
    const put = await teacher.put('/api/admin/entrance-test/config', {
      readingPassageId: String(newPassage._id),
      listeningSectionId: String(section._id),
      writingTask1Id: String(task1._id),
      grammarSetKey: 'default',
    });
    expect(put.status).toBe(200);
    expect(put.body.config.readingPassageId).toBe(String(newPassage._id));

    // Only one active config document should ever exist.
    const count = await EntranceTestConfig.countDocuments({ isActive: true });
    expect(count).toBe(1);
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
