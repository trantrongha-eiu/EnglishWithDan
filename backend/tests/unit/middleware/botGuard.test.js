// Unit tests for middleware/botGuard.js — user-agent filter + API ceiling.
// Uses a tiny Express app (not the real one) so the limiter window/max can
// be set small and nothing else in app.js is involved.
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { botGuard, isBadAgent, isEnabled } = require('../../../middleware/botGuard');

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

function makeApp(limit = { windowMs: 60 * 1000, max: 3 }) {
  const app = express();
  app.use('/api', botGuard({ enabled: true, limit }));
  app.get('/api/ping', (_req, res) => res.json({ ok: true }));
  return app;
}

describe('isBadAgent', () => {
  test.each([
    '', 'short', 'curl/8.4.0', 'python-requests/2.31.0', 'Wget/1.21',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
    'axios/1.6.0', 'PostmanRuntime/7.36.0', 'Go-http-client/2.0',
  ])('blocks %p', (ua) => expect(isBadAgent(ua)).toBe(true));

  test.each([
    BROWSER_UA,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  ])('allows %p', (ua) => expect(isBadAgent(ua)).toBe(false));
});

describe('isEnabled', () => {
  test('on in production, off elsewhere, BOT_GUARD overrides', () => {
    expect(isEnabled({ NODE_ENV: 'production' })).toBe(true);
    expect(isEnabled({ NODE_ENV: 'test' })).toBe(false);
    expect(isEnabled({ NODE_ENV: 'development', BOT_GUARD: 'on' })).toBe(true);
    expect(isEnabled({ NODE_ENV: 'production', BOT_GUARD: 'off' })).toBe(false);
  });
});

describe('botGuard middleware', () => {
  test('403 for a scripting client, 200 for a browser', async () => {
    const app = makeApp();
    await request(app).get('/api/ping').set('User-Agent', 'curl/8.4.0').expect(403);
    await request(app).get('/api/ping').set('User-Agent', BROWSER_UA).expect(200);
  });

  test('anonymous calls are limited per IP', async () => {
    const app = makeApp();
    for (let i = 0; i < 3; i++) {
      await request(app).get('/api/ping').set('User-Agent', BROWSER_UA).expect(200);
    }
    await request(app).get('/api/ping').set('User-Agent', BROWSER_UA).expect(429);
  });

  test('authenticated calls are limited per account, not per IP', async () => {
    const app = makeApp();
    const tokenA = jwt.sign({ id: 'userA' }, process.env.JWT_SECRET);
    const tokenB = jwt.sign({ id: 'userB' }, process.env.JWT_SECRET);
    for (let i = 0; i < 3; i++) {
      await request(app).get('/api/ping').set('User-Agent', BROWSER_UA)
        .set('Authorization', `Bearer ${tokenA}`).expect(200);
    }
    await request(app).get('/api/ping').set('User-Agent', BROWSER_UA)
      .set('Authorization', `Bearer ${tokenA}`).expect(429);
    // Same IP, different account — own bucket.
    await request(app).get('/api/ping').set('User-Agent', BROWSER_UA)
      .set('Authorization', `Bearer ${tokenB}`).expect(200);
  });

  test('disabled guard is a pass-through', async () => {
    const app = express();
    app.use('/api', botGuard({ enabled: false }));
    app.get('/api/ping', (_req, res) => res.json({ ok: true }));
    await request(app).get('/api/ping').set('User-Agent', 'curl/8.4.0').expect(200);
  });
});
