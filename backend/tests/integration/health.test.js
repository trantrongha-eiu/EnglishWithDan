// Integration tests for routes/health.js (Phase 11 — monitoring endpoints).
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const cloudinaryService = require('../../services/cloudinaryService');

describe('GET /health/live', () => {
  test('returns 200 with status ok and an uptime, unauthenticated', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptimeSeconds).toBe('number');
  });
});

describe('GET /health/ready', () => {
  test('returns 200 ready when the in-memory test DB is connected', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database).toBe('connected');
  });
});

describe('GET /health', () => {
  test('returns memory/uptime/dependency status, never leaking real secret values', async () => {
    const res = await request(app).get('/health');
    expect([200, 503]).toContain(res.status);
    expect(typeof res.body.uptimeSeconds).toBe('number');
    expect(typeof res.body.memory.rssMb).toBe('number');
    expect(res.body.dependencies).toBeDefined();
    expect(res.body.dependencies.database.status).toBe('ok');
    // Gemini/Google/email must only ever report presence, never the actual key/secret value.
    const bodyText = JSON.stringify(res.body);
    expect(bodyText).not.toMatch(/AIza|sk-|ya29\./); // common API-key prefixes
  });

  test('reports Cloudinary as not_configured (not "error") when credentials are unset', async () => {
    // Explicitly clear rather than assume — a real local backend/.env
    // (common in dev) may have genuine Cloudinary credentials set, which
    // would otherwise make this test flaky/environment-dependent.
    const saved = {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    };
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    try {
      const res = await request(app).get('/health');
      expect(res.body.dependencies.cloudinary.status).toBe('not_configured');
    } finally {
      Object.entries(saved).forEach(([k, v]) => { if (v !== undefined) process.env[k] = v; });
    }
  });
});

// These are the branches that matter most during a real incident — a
// monitoring endpoint whose FAILURE behavior is untested is a real gap,
// since bugs here show up exactly when they're least discoverable
// (production-readiness audit finding).
describe('failure paths — the branches an incident actually depends on', () => {
  test('GET /health/ready returns 503 not_ready when the DB connection is down', async () => {
    const dbName = mongoose.connection.name;
    await mongoose.connection.close();
    try {
      const res = await request(app).get('/health/ready');
      expect(res.status).toBe(503);
      expect(res.body.status).toBe('not_ready');
      expect(res.body.database).toBe('disconnected');
    } finally {
      // Reconnect so this file's other tests / afterEach / afterAll still work.
      await mongoose.connect(process.env.MONGO_URI, { dbName });
    }
  });

  test('GET /health returns 503 degraded with database.status error when the DB connection is down', async () => {
    const dbName = mongoose.connection.name;
    await mongoose.connection.close();
    try {
      const res = await request(app).get('/health');
      expect(res.status).toBe(503);
      expect(res.body.status).toBe('degraded');
      expect(res.body.dependencies.database.status).toBe('error');
    } finally {
      await mongoose.connect(process.env.MONGO_URI, { dbName });
    }
  });

  test('GET /health returns 503 degraded with cloudinary.status error when Cloudinary is configured but unreachable', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';
    const pingSpy = jest.spyOn(cloudinaryService, 'ping').mockRejectedValue(new Error('connection refused'));
    try {
      const res = await request(app).get('/health');
      expect(res.status).toBe(503);
      expect(res.body.status).toBe('degraded');
      expect(res.body.dependencies.cloudinary.status).toBe('error');
      // The database check must be unaffected by an unrelated Cloudinary failure.
      expect(res.body.dependencies.database.status).toBe('ok');
    } finally {
      pingSpy.mockRestore();
      delete process.env.CLOUDINARY_CLOUD_NAME;
      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;
    }
  });
});
