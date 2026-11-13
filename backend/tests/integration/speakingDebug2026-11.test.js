// Speaking page debug pass (2026-11-13): "Thử chấm lại" for answers with no
// transcript, the full mock's Speaking step, admin question edits vs the
// cached sample answer, admin history paging, and overlapping Part 2
// progress saves. Gemini + R2 are mocked.
jest.mock('../../services/r2Service', () => ({
  isConfigured: jest.fn(() => true),
  keyOf: jest.fn(() => null),
  uploadAudio: jest.fn(async (buf, { folder, public_id, ext }) => ({ secure_url: `https://media.test/${folder}/${public_id}.${ext}` })),
  deleteObjects: jest.fn(async (keys) => keys.length),
  listOldKeys: jest.fn(async () => []),
}));
jest.mock('../../services/geminiService');

const request = require('supertest');
const app = require('../../app');
const geminiService = require('../../services/geminiService');
const SpeakingAttempt = require('../../models/SpeakingAttempt');
const SpeakingQuestion = require('../../models/SpeakingQuestion');
const SpeakingPart2Progress = require('../../models/SpeakingPart2Progress');
const part2 = require('../../services/speakingPart2Service');
const { createPremiumStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createSpeakingAttempt, createSpeakingQuestion } = require('../factories/contentFactory');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const realFetch = global.fetch;

function graded(overrides = {}) {
  return {
    fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 6, overallFeedback: 'Good',
    strengths: ['Clear ideas'], mistakes: [], vocabUpgrades: [], improvements: ['More detail'],
    ...overrides,
  };
}
const noAnswer = () => ({ fluency: 0, vocabulary: 0, grammar: 0, pronunciation: 0, overallFeedback: 'No answer', strengths: [], mistakes: [], vocabUpgrades: [], improvements: [] });

beforeEach(() => { jest.clearAllMocks(); });
afterEach(() => { global.fetch = realFetch; });

// Wait for a fire-and-forget background grade to land.
async function waitForStatus(id, statuses, ms = 3000) {
  const end = Date.now() + ms;
  for (;;) {
    const a = await SpeakingAttempt.findById(id).lean();
    if (a && statuses.includes(a.status)) return a;
    if (Date.now() > end) return a;
    await new Promise((r) => setTimeout(r, 25));
  }
}

describe('POST /api/speaking/:attemptId/retry', () => {
  test('an answer with no transcript and no recording is refused — never saved as Band 0', async () => {
    const s = await createPremiumStudent();
    const a = await createSpeakingAttempt({ userId: s._id, status: 'error', extra: { transcript: '' } });
    const res = await request(app).post(`/api/speaking/${a._id}/retry`).set(auth(s));
    expect(res.status).toBe(422);
    expect(geminiService.checkSpeaking).not.toHaveBeenCalled();
    expect((await SpeakingAttempt.findById(a._id).lean()).status).toBe('error');
  });

  test('re-grades from the saved recording when there is no transcript, and keeps what the AI heard', async () => {
    const s = await createPremiumStudent();
    const a = await createSpeakingAttempt({ userId: s._id, status: 'error',
      extra: { transcript: '', audioUrl: 'https://media.test/speaking-recordings/sp_x.webm' } });
    global.fetch = jest.fn(async () => new Response(Buffer.from('fake-opus'), { status: 200, headers: { 'content-type': 'audio/webm' } }));
    geminiService.checkSpeaking.mockResolvedValueOnce(graded({ transcript: 'I like reading novels in the evening.' }));
    const res = await request(app).post(`/api/speaking/${a._id}/retry`).set(auth(s));
    expect(res.status).toBe(200);
    const audioArg = geminiService.checkSpeaking.mock.calls[0][3];
    expect(audioArg && audioArg.data).toBeTruthy();
    const saved = await SpeakingAttempt.findById(a._id).lean();
    expect(saved.status).toBe('analyzed');
    expect(saved.aiFeedback.overallBand).toBe(6);
    expect(saved.transcript).toBe('I like reading novels in the evening.');
  });

  test('"no genuine answer" on retry stays an error instead of an analysed 0.0', async () => {
    const s = await createPremiumStudent();
    const a = await createSpeakingAttempt({ userId: s._id, status: 'error', extra: { transcript: 'um yes I think so maybe' } });
    geminiService.checkSpeaking.mockResolvedValueOnce(noAnswer());
    const res = await request(app).post(`/api/speaking/${a._id}/retry`).set(auth(s));
    expect(res.status).toBe(422);
    const saved = await SpeakingAttempt.findById(a._id).lean();
    expect(saved.status).toBe('error');
    expect(saved.aiFeedback.overallBand || 0).toBe(0);
  });

  test('a malformed attempt id is 404, not 500', async () => {
    const s = await createPremiumStudent();
    expect((await request(app).post('/api/speaking/not-an-id/retry').set(auth(s))).status).toBe(404);
  });
});

describe('POST /api/speaking/analyze — part', () => {
  test('an unknown part is a 400 (it used to grade but save nothing)', async () => {
    const s = await createPremiumStudent();
    const res = await request(app).post('/api/speaking/analyze').set(auth(s))
      .send({ transcript: 'I really enjoy cooking for my family at weekends.', question: 'Q', part: 7 });
    expect(res.status).toBe(400);
    expect(geminiService.checkSpeaking).not.toHaveBeenCalled();
  });
});

describe('GET /api/speaking/questions?questionId=', () => {
  test('a malformed id is 404, not 500', async () => {
    const s = await createPremiumStudent();
    expect((await request(app).get('/api/speaking/questions?questionId=abc').set(auth(s))).status).toBe(404);
  });
});

describe('POST /api/speaking/mock-submit', () => {
  test('a recording with no transcript is graded from the audio', async () => {
    const s = await createPremiumStudent();
    geminiService.checkSpeaking.mockResolvedValueOnce(graded({ transcript: 'My last trip was to Da Lat with friends.' }));
    const res = await request(app).post('/api/speaking/mock-submit').set(auth(s))
      .field('question', 'Describe a trip.').field('part', '2').field('duration', '100')
      .attach('audio', Buffer.from('fake'), { filename: 'answer.webm', contentType: 'audio/webm' });
    expect(res.status).toBe(200);
    expect(res.body.graded).toBe(true);
    const a = await waitForStatus(res.body.attemptId, ['analyzed', 'error']);
    expect(a.status).toBe('analyzed');
    expect(a.transcript).toBe('My last trip was to Da Lat with friends.');
    expect(geminiService.checkSpeaking.mock.calls[0][3].data).toBeTruthy();
  });

  test('"no genuine answer" is left for the teacher (error), not saved as an analysed 0', async () => {
    const s = await createPremiumStudent();
    geminiService.checkSpeaking.mockResolvedValueOnce(noAnswer());
    const res = await request(app).post('/api/speaking/mock-submit').set(auth(s))
      .send({ question: 'Describe a trip.', part: 2, transcript: 'hello hello', duration: 5 });
    const a = await waitForStatus(res.body.attemptId, ['analyzed', 'error']);
    expect(a.status).toBe('error');
  });
});

describe('admin Speaking questions', () => {
  test('rewording a question clears its cached sample answer + hints; other edits keep them', async () => {
    const t = await createTeacher();
    const q = await createSpeakingQuestion({ question: 'Do you like music?', sampleAnswer: 'Old sample', hints: { vocab: ['melody'] } });

    let res = await request(app).put(`/api/admin/speaking/questions/${q._id}`).set(auth(t)).send({ isActive: true, topic: q.topic });
    expect(res.status).toBe(200);
    let doc = await SpeakingQuestion.findById(q._id).lean();
    expect(doc.sampleAnswer).toBe('Old sample');

    res = await request(app).put(`/api/admin/speaking/questions/${q._id}`).set(auth(t)).send({ question: 'Do you like films?' });
    expect(res.status).toBe(200);
    doc = await SpeakingQuestion.findById(q._id).lean();
    expect(doc.question).toBe('Do you like films?');
    expect(doc.sampleAnswer).toBe('');
    expect(doc.hints.vocab).toEqual([]);
  });

  test('edits are validated and cannot write the sample-answer cache', async () => {
    const t = await createTeacher();
    const q = await createSpeakingQuestion();
    expect((await request(app).put(`/api/admin/speaking/questions/${q._id}`).set(auth(t)).send({ part: 7 })).status).toBe(400);
    await request(app).put(`/api/admin/speaking/questions/${q._id}`).set(auth(t)).send({ sampleAnswer: 'injected' });
    expect((await SpeakingQuestion.findById(q._id).lean()).sampleAnswer).toBe('');
  });

  test('history paging survives junk page/limit/userId', async () => {
    const t = await createTeacher();
    const res = await request(app).get('/api/admin/speaking/history?page=abc&limit=0&userId=zzz').set(auth(t));
    expect(res.status).toBe(200);
    expect(res.body.attempts).toEqual([]);
    const res2 = await request(app).get('/api/admin/speaking/history?page=abc&limit=0').set(auth(t));
    expect(res2.status).toBe(200);
    expect(Number.isFinite(res2.body.pages)).toBe(true);
  });
});

describe('Speaking Part 2 progress', () => {
  test('overlapping saves of the same story both succeed and merge', async () => {
    const s = await createPremiumStudent();
    const put = (body) => request(app).put('/api/speaking-part2/progress/people').set(auth(s)).send({ v: part2.VERSION, ...body });
    const rs = await Promise.all([put({ ok: ['v0'] }), put({ ok: ['v1'] }), put({ read: true })]);
    rs.forEach((r) => expect(r.status).toBe(200));
    const doc = await SpeakingPart2Progress.findOne({ userId: s._id, storyId: 'people' }).lean();
    expect(doc.ok).toEqual(expect.arrayContaining(['v0', 'v1']));
    expect(doc.read).toBe(true);
    expect(await SpeakingPart2Progress.countDocuments({ userId: s._id })).toBe(1);
  });
});
