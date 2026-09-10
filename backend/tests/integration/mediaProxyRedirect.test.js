'use strict';

// P3 — the /api/media/listening proxy follows upstream redirects MANUALLY
// and re-validates every hop's destination host against the same Cloudinary
// allowlist (isProtectableUrl) BEFORE requesting it. A res.cloudinary.com
// URL that 3xx-redirects to an arbitrary/internal host must NOT be chased.
//
// global.fetch is stubbed with a tiny router so no network is touched and
// redirect chains can be simulated deterministically.
const request = require('supertest');
const app = require('../../app');
const { sealMediaUrl } = require('../../services/mediaTokenService');

const ALLOWED_A = 'https://res.cloudinary.com/demo/video/upload/v1/listening/a.mp3';
const ALLOWED_B = 'https://res.cloudinary.com/demo/video/upload/v1/listening/b.mp3';
const ALLOWED_C = 'https://res.cloudinary.com/demo/video/upload/v1/listening/c.mp3';
const EVIL = 'https://attacker.example/internal/secret';
const EVIL_METADATA = 'http://169.254.169.254/latest/meta-data/';

let fetchSpy;
afterEach(() => { if (fetchSpy) { fetchSpy.mockRestore(); fetchSpy = null; } });

// routes: { [absoluteUrl]: { status, location?, bytes? } }
//  - redirect entry: { status: 302, location: '<absolute or relative>' }
//  - terminal entry: { status: 200|206, bytes: Uint8Array }
function stubRoutes(routes) {
  stubRoutes.calls = [];
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(async (url) => {
    const key = String(url);
    stubRoutes.calls.push(key);
    const r = routes[key];
    if (!r) return mkResp({ status: 404 });
    return mkResp(r);
  });
}
function mkResp({ status = 200, location, bytes }) {
  const h = { 'content-type': 'audio/mpeg' };
  if (location) h.location = location;
  if (bytes) {
    h['accept-ranges'] = 'bytes';
    h['content-length'] = String(bytes.length);
  }
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(h),
    body: bytes ? new ReadableStream({ start(c) { c.enqueue(bytes); c.close(); } }) : null,
  };
}
const get = (originUrl) =>
  request(app).get(`/api/media/listening?token=${encodeURIComponent(sealMediaUrl(originUrl, 'u1'))}`);

// ─────────────────────────────────────────────────────────────────────────

describe('media proxy — redirect host revalidation (P3)', () => {
  test('1. direct allowed Cloudinary URL, no redirect → streams normally', async () => {
    stubRoutes({ [ALLOWED_A]: { status: 206, bytes: Uint8Array.from([1, 2, 3]) } });
    const res = await get(ALLOWED_A);
    expect(res.status).toBe(206);
    expect(res.headers['content-type']).toBe('audio/mpeg');
    expect(stubRoutes.calls).toEqual([ALLOWED_A]);
  });

  test('2. allowed → redirect to another ALLOWED Cloudinary host → followed, streams final', async () => {
    stubRoutes({
      [ALLOWED_A]: { status: 302, location: ALLOWED_B },
      [ALLOWED_B]: { status: 200, bytes: Uint8Array.from([9, 9]) },
    });
    const res = await get(ALLOWED_A);
    expect(res.status).toBe(200);
    expect(stubRoutes.calls).toEqual([ALLOWED_A, ALLOWED_B]);
  });

  test('3. allowed → redirect to an arbitrary external host → 502, evil host NEVER fetched', async () => {
    stubRoutes({
      [ALLOWED_A]: { status: 302, location: EVIL },
      [EVIL]: { status: 200, bytes: Uint8Array.from([6, 6, 6]) }, // present but must never be hit
    });
    const res = await get(ALLOWED_A);
    expect(res.status).toBe(502);
    expect(JSON.stringify(res.body)).not.toContain('attacker.example');
    expect(JSON.stringify(res.body)).not.toContain('cloudinary');
    expect(stubRoutes.calls).toEqual([ALLOWED_A]); // stopped before requesting EVIL
  });

  test('3b. redirect to the cloud-metadata IP is rejected (also fails the https check)', async () => {
    stubRoutes({ [ALLOWED_A]: { status: 302, location: EVIL_METADATA } });
    const res = await get(ALLOWED_A);
    expect(res.status).toBe(502);
    expect(stubRoutes.calls).toEqual([ALLOWED_A]);
  });

  test('4. relative redirect → resolved against the current URL, host still validated, followed', async () => {
    const resolved = 'https://res.cloudinary.com/demo/video/upload/v1/listening/relative.mp3';
    stubRoutes({
      [ALLOWED_A]: { status: 302, location: '/demo/video/upload/v1/listening/relative.mp3' },
      [resolved]: { status: 200, bytes: Uint8Array.from([4, 2]) },
    });
    const res = await get(ALLOWED_A);
    expect(res.status).toBe(200);
    expect(stubRoutes.calls).toEqual([ALLOWED_A, resolved]);
  });

  test('4b. relative redirect that would point at a non-allowed host cannot happen — protocol-relative //evil is rejected', async () => {
    stubRoutes({ [ALLOWED_A]: { status: 302, location: '//attacker.example/x' } });
    const res = await get(ALLOWED_A);
    expect(res.status).toBe(502);
    expect(stubRoutes.calls).toEqual([ALLOWED_A]);
  });

  test('5. chain allowed → allowed → DISALLOWED → rejected, disallowed never fetched', async () => {
    stubRoutes({
      [ALLOWED_A]: { status: 302, location: ALLOWED_B },
      [ALLOWED_B]: { status: 307, location: EVIL },
      [EVIL]: { status: 200, bytes: Uint8Array.from([1]) },
    });
    const res = await get(ALLOWED_A);
    expect(res.status).toBe(502);
    expect(stubRoutes.calls).toEqual([ALLOWED_A, ALLOWED_B]); // stopped at B, never hit EVIL
  });

  test('6. chain allowed → DISALLOWED → allowed → stops at the disallowed hop', async () => {
    stubRoutes({
      [ALLOWED_A]: { status: 302, location: EVIL },
      [EVIL]: { status: 302, location: ALLOWED_C }, // even though it would bounce back to an allowed host
      [ALLOWED_C]: { status: 200, bytes: Uint8Array.from([7]) },
    });
    const res = await get(ALLOWED_A);
    expect(res.status).toBe(502);
    expect(stubRoutes.calls).toEqual([ALLOWED_A]); // never fetched EVIL or ALLOWED_C
  });

  test('too many allowed redirects → rejected (bounded loop)', async () => {
    const hop = (n) => `https://res.cloudinary.com/demo/video/upload/v1/hop${n}.mp3`;
    const routes = {};
    for (let i = 0; i < 10; i++) routes[hop(i)] = { status: 302, location: hop(i + 1) };
    stubRoutes(routes);
    const res = await get(hop(0));
    expect(res.status).toBe(502);
    expect(stubRoutes.calls.length).toBeLessThanOrEqual(7); // MAX_REDIRECTS(5) + a small margin, not 10+
  });

  test('7. a redirect 3xx with no Location header → 502 (not treated as a body to stream)', async () => {
    stubRoutes({ [ALLOWED_A]: { status: 302 /* no location */ } });
    const res = await get(ALLOWED_A);
    expect(res.status).toBe(502);
  });
});
