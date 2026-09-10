'use strict';

// Unit tests for services/mediaTokenService — the sealed, expiring token
// that replaces a permanent public Cloudinary secure_url.
const { sealMediaUrl, openMediaToken, isProtectableUrl } = require('../../../services/mediaTokenService');

const CLOUD = 'https://res.cloudinary.com/demo/video/upload/v1/listening/x.mp3';

describe('isProtectableUrl', () => {
  test('true only for an https Cloudinary URL', () => {
    expect(isProtectableUrl(CLOUD)).toBe(true);
    expect(isProtectableUrl('http://res.cloudinary.com/demo/x.mp3')).toBe(false); // not https
    expect(isProtectableUrl('https://evil.example.com/x.mp3')).toBe(false);
    expect(isProtectableUrl('img/course-1.jpg')).toBe(false); // legacy local path
    expect(isProtectableUrl('')).toBe(false);
    expect(isProtectableUrl(null)).toBe(false);
  });
});

describe('sealMediaUrl / openMediaToken', () => {
  test('round-trips the origin URL and issuing user', () => {
    const token = sealMediaUrl(CLOUD, 'user-123');
    // token is opaque — must not contain the origin URL in the clear
    expect(token).not.toContain('cloudinary');
    expect(token).not.toContain('listening');

    const opened = openMediaToken(token);
    expect(opened).toEqual({ ok: true, url: CLOUD, userId: 'user-123' });
  });

  test('a token is rejected once its expiry passes', () => {
    const token = sealMediaUrl(CLOUD, 'u1'); // default TTL (>= 1h)
    const shortLived = sealMediaUrl(CLOUD, 'u1', 30); // clamped up to the 60s floor

    expect(openMediaToken(shortLived).ok).toBe(true); // still valid now

    const realNow = Date.now;
    Date.now = () => realNow() + 120 * 1000; // jump 2 minutes ahead
    try {
      expect(openMediaToken(shortLived)).toEqual({ ok: false, reason: 'expired' });
      expect(openMediaToken(token).ok).toBe(true); // the 1h one is still fine
    } finally {
      Date.now = realNow;
    }
  });

  test('a tampered token is rejected as malformed (GCM auth fails)', () => {
    const token = sealMediaUrl(CLOUD, 'u1');
    const flipped = token.slice(0, -3) + (token.slice(-3) === 'AAA' ? 'BBB' : 'AAA');
    expect(openMediaToken(flipped).ok).toBe(false);
    expect(openMediaToken(flipped).reason).toBe('malformed');
  });

  test('garbage / empty input is rejected, never throws', () => {
    for (const bad of ['', 'not-base64!!!', 'YWJj', null, undefined]) {
      const r = openMediaToken(bad);
      expect(r.ok).toBe(false);
    }
  });

  test('a token sealed by a different key does not open', () => {
    jest.resetModules();
    const OLD = process.env.MEDIA_TOKEN_SECRET;
    process.env.MEDIA_TOKEN_SECRET = 'secret-A-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const svcA = require('../../../services/mediaTokenService');
    const tokenA = svcA.sealMediaUrl(CLOUD, 'u1');

    jest.resetModules();
    process.env.MEDIA_TOKEN_SECRET = 'secret-B-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
    const svcB = require('../../../services/mediaTokenService');
    expect(svcB.openMediaToken(tokenA).ok).toBe(false);

    jest.resetModules();
    if (OLD === undefined) delete process.env.MEDIA_TOKEN_SECRET;
    else process.env.MEDIA_TOKEN_SECRET = OLD;
  });
});

// P4 — MEDIA_TOKEN_SECRET is a dedicated media-signing secret. When set it
// is used exclusively (never JWT_SECRET); when unset it falls back to
// JWT_SECRET (so a deploy can never boot with an empty media key —
// server.js just logs a loud production warning). config/index.js is the
// only place the fallback is expressed; these tests drive it via
// jest.resetModules() (same technique as the "different key" test above).
describe('P4 — MEDIA_TOKEN_SECRET vs JWT_SECRET fallback (config.media.tokenSecret)', () => {
  const KEYS = ['MEDIA_TOKEN_SECRET', 'NODE_ENV', 'JWT_SECRET'];
  let saved;

  beforeEach(() => {
    saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
    jest.resetModules();
  });
  afterEach(() => {
    for (const k of KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    jest.resetModules();
  });

  function loadConfig({ nodeEnv, mediaSecret, jwtSecret = 'jwt-secret-value-for-test' }) {
    if (nodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = nodeEnv;
    if (mediaSecret === undefined) delete process.env.MEDIA_TOKEN_SECRET; else process.env.MEDIA_TOKEN_SECRET = mediaSecret;
    process.env.JWT_SECRET = jwtSecret;
    jest.resetModules();
    return require('../../../config');
  }

  test('1. when MEDIA_TOKEN_SECRET is set, that is the media key — seal+verify round-trips', () => {
    const cfg = loadConfig({ nodeEnv: 'production', mediaSecret: 'dedicated-media-secret-abcdef0123456789' });
    expect(cfg.media.tokenSecret).toBe('dedicated-media-secret-abcdef0123456789');

    const svc = require('../../../services/mediaTokenService');
    const opened = svc.openMediaToken(svc.sealMediaUrl(CLOUD, 'u1'));
    expect(opened).toEqual({ ok: true, url: CLOUD, userId: 'u1' });
  });

  test('2. a token sealed with MEDIA_TOKEN_SECRET does NOT open under JWT_SECRET (they are not the same key)', () => {
    loadConfig({ nodeEnv: 'production', mediaSecret: 'dedicated-media-secret-abcdef0123456789', jwtSecret: 'totally-different-jwt-secret' });
    const sealSvc = require('../../../services/mediaTokenService');
    const token = sealSvc.sealMediaUrl(CLOUD, 'u1');

    // Re-load as dev with NO MEDIA_TOKEN_SECRET → the key is now JWT_SECRET
    // (the pre-P4 fallback). The media-sealed token must fail to open,
    // proving it was never signed with JWT_SECRET.
    loadConfig({ nodeEnv: 'development', mediaSecret: undefined, jwtSecret: 'totally-different-jwt-secret' });
    const verifySvc = require('../../../services/mediaTokenService');
    expect(verifySvc.openMediaToken(token)).toEqual({ ok: false, reason: 'malformed' });
  });

  test('3. no MEDIA_TOKEN_SECRET (any env incl. production) → falls back to JWT_SECRET; signing still works', () => {
    for (const nodeEnv of ['production', 'development', 'test', undefined]) {
      const cfg = loadConfig({ nodeEnv, mediaSecret: undefined, jwtSecret: 'jwt-fallback-value' });
      expect(cfg.media.tokenSecret).toBe('jwt-fallback-value'); // never empty → no 500 on the listening review

      const svc = require('../../../services/mediaTokenService');
      expect(svc.openMediaToken(svc.sealMediaUrl(CLOUD, 'u1'))).toEqual({ ok: true, url: CLOUD, userId: 'u1' });
      jest.resetModules();
    }
  });
});
