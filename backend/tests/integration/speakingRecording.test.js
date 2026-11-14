// Speaking practice recordings saved to History (R2, kept 3 months) —
// services/speakingRecordingService.js. R2 and Gemini are mocked.
jest.mock('../../services/r2Service', () => {
  const host = 'https://media.test';
  return {
    isConfigured: jest.fn(() => true),
    keyOf: jest.fn((u) => (typeof u === 'string' && u.startsWith(host + '/') ? u.slice(host.length + 1) : null)),
    uploadAudio: jest.fn(async (buf, { folder, public_id, ext }) => ({ secure_url: `${host}/${folder}/${public_id}.${ext}`, duration: 0 })),
    deleteObjects: jest.fn(async (keys) => keys.length),
    listOldKeys: jest.fn(async () => []),
  };
});
jest.mock('../../services/geminiService');

const request = require('supertest');
const app = require('../../app');
const r2Service = require('../../services/r2Service');
const geminiService = require('../../services/geminiService');
const SpeakingAttempt = require('../../models/SpeakingAttempt');
const speakingRecording = require('../../services/speakingRecordingService');
const { createPremiumStudent, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createSpeakingAttempt } = require('../factories/contentFactory');

function feedback(overrides = {}) {
  return {
    fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 6, overallFeedback: 'Good job',
    strengths: ['Clear pronunciation'], mistakes: [], vocabUpgrades: [], improvements: [],
    ...overrides,
  };
}

function analyzeWithAudio(token) {
  return request(app)
    .post('/api/speaking/analyze')
    .set('Authorization', `Bearer ${token}`)
    .field('transcript', 'I enjoy reading books in my free time.')
    .field('question', 'What do you like to do?')
    .field('part', '1')
    .attach('audio', Buffer.from('fake-opus-bytes'), { filename: 'answer.webm', contentType: 'audio/webm;codecs=opus' });
}

beforeEach(() => {
  jest.clearAllMocks();
  r2Service.isConfigured.mockReturnValue(true);
  geminiService.checkSpeaking.mockReset();
  geminiService.checkSpeaking.mockResolvedValue(feedback());
});

describe('POST /api/speaking/analyze — recording saved to History', () => {
  test('uploads the recording to R2 and links it to the attempt', async () => {
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await analyzeWithAudio(token);

    expect(res.status).toBe(200);
    expect(r2Service.uploadAudio).toHaveBeenCalledWith(expect.any(Buffer), expect.objectContaining({
      folder: 'speaking-recordings', ext: 'webm', contentType: 'audio/webm',
    }));
    expect(res.body.audioUrl).toMatch(/^https:\/\/media\.test\/speaking-recordings\/sp_.+\.webm$/);

    const attempt = await SpeakingAttempt.findById(res.body.attemptId).lean();
    expect(attempt.audioUrl).toBe(res.body.audioUrl);

    const hist = await request(app).get('/api/speaking/history').set('Authorization', `Bearer ${token}`);
    expect(hist.body.attempts[0].audioUrl).toBe(res.body.audioUrl);
  });

  test('no recording sent → nothing uploaded', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/speaking/analyze')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ transcript: 'I enjoy reading books.', question: 'Q?', part: 1 });
    expect(res.status).toBe(200);
    expect(res.body.audioUrl).toBe('');
    expect(r2Service.uploadAudio).not.toHaveBeenCalled();
  });

  test('without R2 the answer is still graded, just no saved recording', async () => {
    r2Service.isConfigured.mockReturnValue(false);
    const user = await createPremiumStudent();
    const res = await analyzeWithAudio(signTokenFor(user));
    expect(res.status).toBe(200);
    expect(res.body.audioUrl).toBe('');
    expect(r2Service.uploadAudio).not.toHaveBeenCalled();
  });

  test('an upload failure never breaks grading', async () => {
    r2Service.uploadAudio.mockRejectedValueOnce(new Error('R2 down'));
    const user = await createPremiumStudent();
    const res = await analyzeWithAudio(signTokenFor(user));
    expect(res.status).toBe(200);
    expect(res.body.feedback).toBeTruthy();
    expect(res.body.audioUrl).toBe('');
  });

  test('"no genuine answer" discards the attempt and deletes its recording', async () => {
    geminiService.checkSpeaking.mockResolvedValue(feedback({ strengths: [], fluency: 0, vocabulary: 0, grammar: 0, pronunciation: 0 }));
    const user = await createPremiumStudent();
    const res = await analyzeWithAudio(signTokenFor(user));
    expect(res.body.noGenuineAnswer).toBe(true);
    expect(await SpeakingAttempt.countDocuments({ userId: user._id })).toBe(0);
    expect(r2Service.deleteObjects).toHaveBeenCalledWith([expect.stringMatching(/^speaking-recordings\/sp_/)]);
  });
});

describe('POST /api/speaking/mock-submit — recording saved', () => {
  test('a multipart submit with audio stores the recording on the attempt', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/speaking/mock-submit')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .field('question', 'Describe a trip.')
      .field('part', '2')
      .attach('audio', Buffer.from('fake'), { filename: 'answer.m4a', contentType: 'audio/mp4' });
    expect(res.status).toBe(200);
    expect(res.body.audioUrl).toMatch(/\.m4a$/);
    const attempt = await SpeakingAttempt.findById(res.body.attemptId).lean();
    expect(attempt.audioUrl).toBe(res.body.audioUrl);
  });
});

describe('deleting / expiring recordings', () => {
  test('admin delete of a speaking attempt deletes its recording', async () => {
    const admin = await createAdmin();
    const student = await createPremiumStudent();
    const attempt = await createSpeakingAttempt({ userId: student._id, extra: { audioUrl: 'https://media.test/speaking-recordings/sp_x_1.webm' } });
    const res = await request(app).delete(`/api/admin/speaking-attempts/${attempt._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(r2Service.deleteObjects).toHaveBeenCalledWith(['speaking-recordings/sp_x_1.webm']);
  });

  test('daily sweep deletes recordings older than 90 days (+1 day slack)', async () => {
    r2Service.listOldKeys.mockResolvedValueOnce(['speaking-recordings/a.webm', 'speaking-recordings/b.webm']);
    const r = await speakingRecording.purgeOld();
    expect(r2Service.listOldKeys).toHaveBeenCalledWith('speaking-recordings', 91);
    expect(r2Service.deleteObjects).toHaveBeenCalledWith(['speaking-recordings/a.webm', 'speaking-recordings/b.webm']);
    expect(r.deleted).toBe(2);
  });
});

// Multi-question runs (Part 1 topic, Part 2 + 3, full mock): one recording
// per question, uploaded via /clip while the student goes on, then listed
// on the attempt by /analyze (audioClips) — 2026-11-14, admin couldn't
// listen to any of them before.
describe('per-question recordings (POST /api/speaking/clip + audioClips)', () => {
  const groqService = require('../../services/groqService');

  function uploadClip(token, fields = {}) {
    let r = request(app).post('/api/speaking/clip').set('Authorization', `Bearer ${token}`);
    for (const [k, v] of Object.entries(fields)) r = r.field(k, v);
    return r.attach('audio', Buffer.from('fake-opus'), { filename: 'answer.webm', contentType: 'audio/webm' });
  }

  test('stores the clip under the student\'s own tag', async () => {
    const user = await createPremiumStudent();
    const res = await uploadClip(signTokenFor(user), { index: '2' });
    expect(res.status).toBe(200);
    expect(res.body.url).toMatch(new RegExp(String.raw`^https://media\.test/speaking-recordings/sp_u${user._id}_q2_\d+\.webm$`));
    expect(res.body.transcript).toBe('');
  });

  test('transcribe=1 (audio-only device) returns the Whisper text', async () => {
    const spy = jest.spyOn(groqService, 'transcribeSpeechGroq').mockResolvedValue('I usually read in the evening.');
    const user = await createPremiumStudent();
    const res = await uploadClip(signTokenFor(user), { index: '0', transcribe: '1' });
    expect(res.status).toBe(200);
    expect(res.body.transcript).toBe('I usually read in the evening.');
    expect(res.body.url).toMatch(/^https:\/\/media\.test\//);
    spy.mockRestore();
  });

  test('a failed transcription still keeps the recording', async () => {
    const spy = jest.spyOn(groqService, 'transcribeSpeechGroq').mockRejectedValue(new Error('groq down'));
    const user = await createPremiumStudent();
    const res = await uploadClip(signTokenFor(user), { index: '0', transcribe: '1' });
    expect(res.status).toBe(200);
    expect(res.body.url).toMatch(/^https:\/\/media\.test\//);
    expect(res.body.transcript).toBe('');
    spy.mockRestore();
  });

  test('no file → 400', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/speaking/clip').set('Authorization', `Bearer ${signTokenFor(user)}`).send({ index: 1 });
    expect(res.status).toBe(400);
  });

  test('/analyze lists only the student\'s own clips on the attempt', async () => {
    const user = await createPremiumStudent();
    const other = await createPremiumStudent();
    const token = signTokenFor(user);
    const mine0 = (await uploadClip(token, { index: '0' })).body.url;
    const mine1 = (await uploadClip(token, { index: '1' })).body.url;
    const theirs = (await uploadClip(signTokenFor(other), { index: '0' })).body.url;
    const res = await request(app).post('/api/speaking/analyze').set('Authorization', `Bearer ${token}`).send({
      transcript: 'Q1 (Part 1): Do you read?\nA1: Yes I read every day.\n\nQ2 (Part 1): Why?\nA2: Because it relaxes me a lot.',
      question: 'PART 1 — Reading (2 câu hỏi)', topic: 'Reading', part: 1,
      audioClips: [
        { index: 1, questionId: 'q2', question: 'Why?', url: mine1 },
        { index: 0, questionId: 'q1', question: 'Do you read?', url: mine0 },
        { index: 2, question: 'x', url: theirs },
        { index: 3, question: 'x', url: 'https://evil.example/speaking-recordings/sp_u1_q0_1.webm' },
      ],
    });
    expect(res.status).toBe(200);
    const attempt = await SpeakingAttempt.findById(res.body.attemptId).lean();
    expect(attempt.audioUrl).toBe('');
    expect(attempt.audioClips.map((c) => c.url)).toEqual([mine0, mine1]);
    expect(attempt.audioClips[0]).toMatchObject({ index: 0, questionId: 'q1', question: 'Do you read?' });
  });

  test('admin: review list flags it as recorded, the detail returns the clips, delete removes them', async () => {
    const admin = await createAdmin();
    const student = await createPremiumStudent();
    const clips = [
      { index: 0, question: 'Q1', url: 'https://media.test/speaking-recordings/sp_c_0.webm' },
      { index: 1, question: 'Q2', url: 'https://media.test/speaking-recordings/sp_c_1.webm' },
    ];
    const attempt = await createSpeakingAttempt({ userId: student._id, extra: { audioClips: clips, status: 'analyzed' } });
    const adminTok = signTokenFor(admin);

    const list = await request(app).get('/api/admin/submission-reviews?kind=speaking&status=all').set('Authorization', `Bearer ${adminTok}`);
    expect(list.status).toBe(200);
    const row = list.body.rows.find((r) => String(r.id) === String(attempt._id));
    expect(row && row.hasAudio).toBe(true);

    const detail = await request(app).get(`/api/admin/submission-reviews/speaking/${attempt._id}`).set('Authorization', `Bearer ${adminTok}`);
    expect(JSON.stringify(detail.body)).toContain('sp_c_1.webm');

    const del = await request(app).delete(`/api/admin/speaking-attempts/${attempt._id}`).set('Authorization', `Bearer ${adminTok}`);
    expect(del.status).toBe(200);
    expect(r2Service.deleteObjects).toHaveBeenCalledWith(['speaking-recordings/sp_c_0.webm']);
    expect(r2Service.deleteObjects).toHaveBeenCalledWith(['speaking-recordings/sp_c_1.webm']);
  });
});
