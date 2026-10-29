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
