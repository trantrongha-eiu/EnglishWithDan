'use strict';

jest.mock('../../services/r2Service', () => {
  const host = 'https://media.test';
  const publicUrlOf = (k) => `${host}/${k}`;
  return {
    isConfigured: jest.fn(() => true),
    publicUrlOf: jest.fn(publicUrlOf),
    objectExists: jest.fn(async () => false),
    putObject: jest.fn(async (k) => publicUrlOf(k)),
  };
});

const request = require('supertest');
const app = require('../../app');
const config = require('../../config');
const r2Service = require('../../services/r2Service');
const ttsService = require('../../services/ttsService');
const TtsUsage = require('../../models/TtsUsage');
const { VOICES } = require('../../constants/ttsVoices');
const { createStudent, signTokenFor } = require('../factories/userFactory');

const realFetch = global.fetch;
let token;
let user;

const speech = (body, t = token) => request(app).post('/api/tts/speech')
  .set('Authorization', `Bearer ${t}`).send(body);

function azureAnswers(status = 200) {
  global.fetch = jest.fn(async () => ({
    ok: status === 200,
    status,
    arrayBuffer: async () => Buffer.from('mp3-bytes'),
  }));
}

beforeEach(async () => {
  Object.assign(config.tts, {
    azureKey: 'test-key', azureRegion: 'southeastasia', monthlyCharLimit: 1000, userDailyCharLimit: 100,
  });
  ttsService.resetCaches();
  jest.clearAllMocks();
  r2Service.isConfigured.mockReturnValue(true);
  r2Service.objectExists.mockResolvedValue(false);
  azureAnswers();
  user = await createStudent();
  token = signTokenFor(user);
});

afterAll(() => {
  global.fetch = realFetch;
  Object.assign(config.tts, { azureKey: '', azureRegion: '' });
});

describe('GET /api/tts/voices', () => {
  test('lists the 16 voices without exposing Azure names', async () => {
    const res = await request(app).get('/api/tts/voices').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.enabled).toBe(true);
    expect(res.body.voices).toHaveLength(16);
    expect(res.body.voices).toContainEqual({ id: 'tony', name: 'Tony', gender: 'Nam', accent: 'Giọng Anh' });
    expect(JSON.stringify(res.body)).not.toMatch(/Neural/);
  });

  test('reports disabled, with no voices, until Azure is configured', async () => {
    config.tts.azureKey = '';
    const res = await request(app).get('/api/tts/voices').set('Authorization', `Bearer ${token}`);
    expect(res.body).toMatchObject({ enabled: false, voices: [] });
  });

  test('requires login', async () => {
    expect((await request(app).get('/api/tts/voices')).status).toBe(401);
  });
});

describe('POST /api/tts/speech', () => {
  test('generates once, stores on R2, then replays without calling Azure', async () => {
    const first = await speech({ text: 'Where  are you from?', voice: 'tony' });
    expect(first.status).toBe(200);
    expect(first.body.url).toMatch(/^https:\/\/media\.test\/tts\/v1\/tony\/[0-9a-f]{40}\.mp3$/);
    expect(r2Service.putObject).toHaveBeenCalledWith(expect.any(String), expect.any(Buffer), 'audio/mpeg');

    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toBe('https://southeastasia.tts.speech.microsoft.com/cognitiveservices/v1');
    expect(init.headers['Ocp-Apim-Subscription-Key']).toBe('test-key');
    expect(init.body).toContain('<voice name="en-GB-RyanNeural">Where are you from?</voice>');

    const again = await speech({ text: 'Where are you from?', voice: 'tony' });
    expect(again.body.url).toBe(first.body.url);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('audio already on R2 costs nothing', async () => {
    r2Service.objectExists.mockResolvedValue(true);
    const res = await speech({ text: 'Do you like music?', voice: 'alice' });
    expect(res.status).toBe(200);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(await TtsUsage.countDocuments()).toBe(0);
  });

  test('simultaneous requests for one sentence generate it once', async () => {
    const all = await Promise.all([1, 2, 3].map(() => speech({ text: 'Same sentence', voice: 'mia' })));
    expect(all.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('text is escaped, so it cannot inject SSML', async () => {
    await speech({ text: 'Tom & <b>"Jerry"</b>', voice: 'tony' });
    expect(global.fetch.mock.calls[0][1].body)
      .toContain('Tom &amp; &lt;b&gt;&quot;Jerry&quot;&lt;/b&gt;');
  });

  test('defaults to the vocabulary voice', async () => {
    const res = await speech({ text: 'carbon footprint' });
    expect(res.body.url).toContain('/tts/v1/sophia/');
  });

  test.each([
    ['an unknown voice', { text: 'Hello', voice: 'en-US-AvaNeural' }],
    ['empty text', { text: '   ' }],
    ['text with no letters', { text: '123 !!!' }],
    ['non-string text', { text: { $ne: 1 } }],
    ['text over the limit', { text: 'a'.repeat(ttsService.MAX_TEXT_LEN + 1) }],
  ])('rejects %s', async (_label, body) => {
    expect((await speech(body)).status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('a student past the daily budget is refused, others are not', async () => {
    expect((await speech({ text: 'a'.repeat(90), voice: 'tony' })).status).toBe(200);
    expect((await speech({ text: 'b'.repeat(20), voice: 'tony' })).status).toBe(429);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const other = await createStudent();
    expect((await speech({ text: 'b'.repeat(20), voice: 'tony' }, signTokenFor(other))).status).toBe(200);
  });

  test('the monthly budget stops generation and gives the student their chars back', async () => {
    config.tts.monthlyCharLimit = 10;
    expect((await speech({ text: 'a'.repeat(20), voice: 'tony' })).status).toBe(429);
    expect(global.fetch).not.toHaveBeenCalled();
    const row = await TtsUsage.findOne({ key: new RegExp(`^user:${user._id}:`) }).lean();
    expect(row.chars).toBe(0);
  });

  test('an Azure failure answers 503, stores nothing and refunds the budget', async () => {
    azureAnswers(429);
    expect((await speech({ text: 'Hello there', voice: 'tony' })).status).toBe(503);
    expect(r2Service.putObject).not.toHaveBeenCalled();
    const rows = await TtsUsage.find().lean();
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.chars === 0)).toBe(true);
  });

  test('answers 503 when the service is not configured', async () => {
    config.tts.azureRegion = '';
    expect((await speech({ text: 'Hello', voice: 'tony' })).status).toBe(503);
  });

  test('requires login', async () => {
    expect((await request(app).post('/api/tts/speech').send({ text: 'Hello' })).status).toBe(401);
  });
});

test('every voice is a distinct Azure voice in its own locale', () => {
  expect(new Set(VOICES.map((v) => v.azure)).size).toBe(VOICES.length);
  for (const v of VOICES) expect(v.azure.startsWith(`${v.locale}-`)).toBe(true);
});
