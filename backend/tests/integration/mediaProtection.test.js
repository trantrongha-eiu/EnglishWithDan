'use strict';

// Integration tests for protected Cloudinary media delivery.
//   - listening payloads no longer expose the raw Cloudinary secure_url
//   - the /api/media/listening proxy: token required, expiry enforced,
//     tamper rejected, Range forwarded, origin URL never returned
//
// The proxy's upstream fetch to Cloudinary is stubbed (global.fetch) so
// these tests never touch the network.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createListeningSection, createListeningTest } = require('../factories/contentFactory');
const { sealMediaUrl } = require('../../services/mediaTokenService');

const CLOUD_AUDIO = 'https://res.cloudinary.com/demo/video/upload/v1/listening/sample.mp3';
const PROXY_PREFIX = '/api/media/listening?token=';

const expired = () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
const bearer = (u) => `Bearer ${signTokenFor(u)}`;
const tokenFromProxyUrl = (u) => decodeURIComponent(u.split('token=')[1]);

let fetchSpy;
afterEach(() => { if (fetchSpy) { fetchSpy.mockRestore(); fetchSpy = null; } });

function stubUpstream({ status = 206, headers = {}, bytes = Uint8Array.from([1, 2, 3, 4]) } = {}) {
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(async (url, opts) => {
    stubUpstream.lastCall = { url, opts };
    return {
      ok: status >= 200 && status < 300,
      status,
      headers: new Headers({
        'content-type': 'audio/mpeg',
        'accept-ranges': 'bytes',
        'content-range': `bytes 0-${bytes.length - 1}/${bytes.length}`,
        'content-length': String(bytes.length),
        ...headers,
      }),
      body: new ReadableStream({ start(c) { c.enqueue(bytes); c.close(); } }),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────

describe('listening payloads no longer leak the Cloudinary URL', () => {
  test('1 + 4. premium student AND staff get a proxied audio URL, not res.cloudinary.com', async () => {
    const section = await createListeningSection({ extra: { audioUrl: CLOUD_AUDIO } });

    for (const user of [await createPremiumStudent(), await createTeacher()]) {
      const res = await request(app)
        .get(`/api/listening/practice/by-id/${section._id}`)
        .set('Authorization', bearer(user));
      expect(res.status).toBe(200);
      expect(res.body.section.audioUrl).toContain(PROXY_PREFIX);
      expect(res.body.section.audioUrl).not.toContain('res.cloudinary.com');
      // 6. the raw URL is not recoverable from the API response
      expect(JSON.stringify(res.body)).not.toContain('res.cloudinary.com');
      // token opens back to the real origin (server-side only)
      expect(tokenFromProxyUrl(res.body.section.audioUrl)).toBeTruthy();
    }
  });

  test('startTest audio is proxied too', async () => {
    const test = await createListeningTest({ audioUrl: CLOUD_AUDIO });
    const res = await request(app)
      .post(`/api/listening/tests/${test._id}/start`)
      .set('Authorization', bearer(await createPremiumStudent()))
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.test.audioUrl).toContain(PROXY_PREFIX);
    expect(res.body.test.audioUrl).not.toContain('cloudinary');
  });

  test('2 + 3. a free/expired-trial student is blocked at the premium gate — no token is ever issued', async () => {
    const section = await createListeningSection({ extra: { audioUrl: CLOUD_AUDIO } });
    const res = await request(app)
      .get(`/api/listening/practice/by-id/${section._id}`)
      .set('Authorization', bearer(await createStudent({ extra: { createdAt: expired() } })));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
    expect(res.body.section).toBeUndefined();
  });

  test('a non-Cloudinary / empty audioUrl is left untouched', async () => {
    const section = await createListeningSection({ extra: { audioUrl: '' } });
    const res = await request(app)
      .get(`/api/listening/practice/by-id/${section._id}`)
      .set('Authorization', bearer(await createPremiumStudent()));
    expect(res.status).toBe(200);
    expect(res.body.section.audioUrl).toBe('');
  });
});

describe('GET /api/media/listening — the streaming proxy', () => {
  test('7. forwards the Range header, relays 206 + media headers, streams bytes, hides origin', async () => {
    stubUpstream({ status: 206, bytes: Uint8Array.from([9, 8, 7]) });
    const token = sealMediaUrl(CLOUD_AUDIO, 'user-1');

    const res = await request(app)
      .get(`/api/media/listening?token=${encodeURIComponent(token)}`)
      .set('Range', 'bytes=0-2');

    expect(res.status).toBe(206);
    expect(res.headers['content-type']).toBe('audio/mpeg');
    expect(res.headers['accept-ranges']).toBe('bytes');
    expect(res.headers['content-range']).toMatch(/^bytes 0-/);
    expect(res.headers['cache-control']).toBe('private, max-age=600');
    // upstream got our Range header; the proxy fetched the sealed origin URL
    expect(stubUpstream.lastCall.url).toBe(CLOUD_AUDIO);
    expect(stubUpstream.lastCall.opts.headers.Range).toBe('bytes=0-2');
    // nothing in the response reveals the Cloudinary origin
    expect(JSON.stringify(res.headers)).not.toContain('cloudinary');
  });

  test('no token → 403 MEDIA_URL_INVALID', async () => {
    const res = await request(app).get('/api/media/listening');
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('MEDIA_URL_INVALID');
  });

  test('5. an expired token → 403 MEDIA_URL_EXPIRED', async () => {
    const token = sealMediaUrl(CLOUD_AUDIO, 'user-1', 30); // 60s-floored
    const realNow = Date.now;
    Date.now = () => realNow() + 5 * 60 * 1000;
    try {
      const res = await request(app).get(`/api/media/listening?token=${encodeURIComponent(token)}`);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('MEDIA_URL_EXPIRED');
    } finally { Date.now = realNow; }
  });

  test('a tampered token → 403 (no upstream fetch attempted)', async () => {
    stubUpstream();
    const token = sealMediaUrl(CLOUD_AUDIO, 'user-1');
    const res = await request(app).get(`/api/media/listening?token=${encodeURIComponent(token.slice(0, -4) + 'ZZZZ')}`);
    expect(res.status).toBe(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('upstream 404 (asset deleted) → 404, body carries no origin URL', async () => {
    stubUpstream({ status: 404 });
    const token = sealMediaUrl(CLOUD_AUDIO, 'user-1');
    const res = await request(app).get(`/api/media/listening?token=${encodeURIComponent(token)}`);
    expect(res.status).toBe(404);
    expect(JSON.stringify(res.body)).not.toContain('cloudinary');
  });

  test('HEAD is supported (metadata preflight from <audio>)', async () => {
    stubUpstream({ status: 200 });
    const token = sealMediaUrl(CLOUD_AUDIO, 'user-1');
    const res = await request(app).head(`/api/media/listening?token=${encodeURIComponent(token)}`);
    expect(res.status).toBe(200);
    expect(res.headers['accept-ranges']).toBe('bytes');
  });
});
