'use strict';

// P4 — backend/server.js must FAIL FAST (process.exit(1)) when
// NODE_ENV=production and MEDIA_TOKEN_SECRET is unset, exactly like the
// existing JWT_SECRET guard. It must NOT silently fall back to JWT_SECRET.
//
// Run in a child process (server.js has boot side effects). cwd is an
// empty temp dir so `require('dotenv').config()` finds no .env and can't
// repopulate the vars we withhold; server.js is required by absolute path.
const { spawnSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const SERVER = path.resolve(__dirname, '../../server.js');

function bootServer(extraEnv) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'p4-server-'));
  const env = { ...process.env, ...extraEnv };
  delete env.MONGO_URI; // guard 2 runs before mongoose.connect; keep the child DB-less regardless
  const res = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(SERVER)})`], {
    cwd, env, encoding: 'utf8', timeout: 12000,
  });
  fs.rmSync(cwd, { recursive: true, force: true });
  return res;
}

describe('P4 — server.js production startup guard for MEDIA_TOKEN_SECRET', () => {
  test('production + no MEDIA_TOKEN_SECRET → exit code 1 with a clear message', () => {
    const r = bootServer({ NODE_ENV: 'production', JWT_SECRET: 'x-jwt', MEDIA_TOKEN_SECRET: '' });
    expect(r.status).toBe(1); // not null (timeout) and not 0
    expect(`${r.stdout}${r.stderr}`).toMatch(/MEDIA_TOKEN_SECRET/);
  }, 20000);

  test('the existing JWT_SECRET guard still fires first when it is missing', () => {
    const r = bootServer({ NODE_ENV: 'production', JWT_SECRET: '', MEDIA_TOKEN_SECRET: '' });
    expect(r.status).toBe(1);
    expect(`${r.stdout}${r.stderr}`).toMatch(/JWT_SECRET/);
  }, 20000);
});
