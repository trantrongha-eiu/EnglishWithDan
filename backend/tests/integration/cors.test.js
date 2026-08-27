// Integration tests for app.js's CORS origin check.
const request = require('supertest');
const app = require('../../app');

describe('CORS origin handling', () => {
  test('an allowed origin (production domain) is accepted, no error', async () => {
    const res = await request(app).get('/health/live').set('Origin', 'https://ieltsthayha.com');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://ieltsthayha.com');
  });

  test('no Origin header at all (server-to-server / same-origin) is accepted', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
  });

  // BUG-022: a rejected origin used to fall through to errorHandler.js's
  // generic `err.statusCode || 500`, indistinguishable from a real server
  // fault. Not a security fix (no CORS header is ever reflected back for
  // a rejected origin either way) — just the honest status for what
  // actually happened.
  test('a disallowed origin gets 403, not 500', async () => {
    const res = await request(app).get('/health/live').set('Origin', 'https://evil.example.com');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    // No CORS header reflected back to a rejected origin — confirms this
    // status-code fix didn't accidentally start honoring the bad origin.
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('a disallowed origin does not leak the real error message (generic client-facing text)', async () => {
    const res = await request(app).get('/health/live').set('Origin', 'https://evil.example.com');
    expect(res.body.message).not.toMatch(/CORS/i);
  });
});
