// Admin Listening audio uploads (routes/admin/listening.js → listeningService.uploadAudio)
// land in Cloudflare R2 when R2_* is configured. The S3 client is stubbed —
// nothing leaves the process.
const request = require('supertest');
const app = require('../../app');
const config = require('../../config');
const { S3Client } = require('@aws-sdk/client-s3');
const { createTeacher, signTokenFor } = require('../factories/userFactory');
const { createListeningTest, createListeningSection } = require('../factories/contentFactory');
const ListeningTest = require('../../models/ListeningTest');
const ListeningSection = require('../../models/ListeningSection');

// 115 silent MPEG-1 Layer III frames (128 kbps, 44.1 kHz, 417 B each) ≈ 3.0 s. The duration itself
// isn't asserted: music-metadata is ESM-only and Jest can't import() it, so it reads 0 here.
const FRAME = Buffer.alloc(417); FRAME.writeUInt32BE(0xFFFB9000, 0);
const MP3 = Buffer.concat(Array(115).fill(FRAME));

let saved, send, token;
beforeEach(async () => {
  saved = { ...config.r2 };
  Object.assign(config.r2, { accountId: 'acc', accessKeyId: 'k', secretAccessKey: 's', bucket: 'ewd-audio', publicUrl: 'https://media.example.com' });
  send = jest.spyOn(S3Client.prototype, 'send').mockResolvedValue({});
  token = signTokenFor(await createTeacher());
});
afterEach(() => { Object.assign(config.r2, saved); send.mockRestore(); });

const put = () => send.mock.calls[0][0].input;

test('POST /listening/upload-audio → R2 URL', async () => {
  const res = await request(app).post('/api/admin/listening/upload-audio')
    .set('Authorization', `Bearer ${token}`).attach('audio', MP3, { filename: 'Part 1.mp3', contentType: 'audio/mpeg' });
  expect(res.status).toBe(200);
  expect(res.body.audioUrl).toMatch(/^https:\/\/media\.example\.com\/listening\/listening_tmp_\d+\.mp3$/);
  expect(put()).toMatchObject({ Bucket: 'ewd-audio', Key: expect.stringMatching(/^listening\//), ContentType: 'audio/mpeg' });
});

test('POST /listening/tests/:id/audio stores the R2 URL on the test', async () => {
  const t = await createListeningTest();
  const res = await request(app).post(`/api/admin/listening/tests/${t._id}/audio`)
    .set('Authorization', `Bearer ${token}`).attach('audio', MP3, { filename: 'full.mp3', contentType: 'audio/mpeg' });
  expect(res.status).toBe(200);
  const doc = await ListeningTest.findById(t._id).lean();
  expect(doc.audioUrl).toMatch(/^https:\/\/media\.example\.com\/listening\/listening_[0-9a-f]{24}_\d+\.mp3$/);
});

test('POST /listening/sections/:id/audio stores the R2 URL on the section', async () => {
  const s = await createListeningSection();
  const res = await request(app).post(`/api/admin/listening/sections/${s._id}/audio`)
    .set('Authorization', `Bearer ${token}`).attach('audio', MP3, { filename: 'Vol 5 T3 P2.mp3', contentType: 'audio/mpeg' });
  expect(res.status).toBe(200);
  const doc = await ListeningSection.findById(s._id).lean();
  expect(doc.audioUrl).toMatch(/^https:\/\/media\.example\.com\/listening-sections\/Vol_5_T3_P2_[0-9a-f]{24}_\d+\.mp3$/);
  expect(doc.audioFileName).toBe('Vol 5 T3 P2.mp3');
  expect(put().Key).toBe(decodeURIComponent(doc.audioUrl.replace('https://media.example.com/', '')));
});
