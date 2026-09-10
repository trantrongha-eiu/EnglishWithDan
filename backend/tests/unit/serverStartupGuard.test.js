'use strict';

// P4 — backend/server.js logs a loud production WARNING (not a hard exit)
// when NODE_ENV=production and MEDIA_TOKEN_SECRET is unset: config falls
// back to JWT_SECRET so a deploy can never boot with an empty media key.
// The existing JWT_SECRET guard is still a hard process.exit(1).
//
// Run in a child process (server.js has boot side effects). cwd is an
// empty temp dir so `require('dotenv').config()` finds no .env and can't
// repopulate the vars we withhold; server.js is required by absolute path.
const { spawnSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const SERVER = path.resolve(__dirname, '../../server.js');

function bootServer(extraEnv, timeout = 12000) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'p4-server-'));
  const env = { ...process.env, ...extraEnv };
  delete env.MONGO_URI; // stay DB-less regardless of how far boot gets
  const res = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(SERVER)})`], {
    cwd, env, encoding: 'utf8', timeout,
  });
  fs.rmSync(cwd, { recursive: true, force: true });
  return res;
}

describe('P4 — server.js production startup behaviour for MEDIA_TOKEN_SECRET', () => {
  test('production + no MEDIA_TOKEN_SECRET → does NOT fail fast, logs a warning', () => {
    // No MEDIA_TOKEN_SECRET, valid JWT_SECRET → the guard must NOT exit(1);
    // the process gets past it (and, DB-less, is later killed by the
    // spawn timeout — status null / signal set, i.e. NOT a fail-fast).
    const r = bootServer({ NODE_ENV: 'production', JWT_SECRET: 'x-jwt', MEDIA_TOKEN_SECRET: '' }, 8000);
    expect(r.status).not.toBe(1);
    expect(`${r.stdout}${r.stderr}`).toMatch(/MEDIA_TOKEN_SECRET is not set/);
    expect(`${r.stdout}${r.stderr}`).toMatch(/falling back to JWT_SECRET/);
  }, 20000);

  test('the JWT_SECRET guard is still a hard fail-fast (exit 1) when it is missing', () => {
    const r = bootServer({ NODE_ENV: 'production', JWT_SECRET: '', MEDIA_TOKEN_SECRET: '' });
    expect(r.status).toBe(1);
    expect(`${r.stdout}${r.stderr}`).toMatch(/JWT_SECRET/);
  }, 20000);
});
