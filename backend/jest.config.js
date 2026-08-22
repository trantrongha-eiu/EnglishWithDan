// Backend Jest config — unit, integration, and security test suites.
// See tests/support/ for the shared in-memory-Mongo lifecycle (never
// touches production Atlas) and tests/factories/ for test-data builders.
module.exports = {
  testEnvironment: 'node',
  rootDir: __dirname,
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  globalSetup: '<rootDir>/tests/support/globalSetup.js',
  globalTeardown: '<rootDir>/tests/support/globalTeardown.js',
  setupFilesAfterEnv: ['<rootDir>/tests/support/setupTestDb.js'],
  testTimeout: 20000,
  collectCoverageFrom: [
    'services/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: '<rootDir>/coverage',
  // PLATFORM_AUDIT_2026-08-22 "làm ngay" #5 — coverage was measured
  // (test:ci already passes --coverage) but nothing ever failed the build
  // on a drop; CI's own comment even called lint "non-blocking", and
  // coverage had no gate at all. Floors set ~1-1.5pt below the actual
  // measured numbers as of this commit (global: 71.08/59.42/68.71/73.19;
  // controllers — the weakest area, handles raw request input — 53.22/
  // 39.83/54.25/56.26) so this catches a real regression without failing
  // on ordinary run-to-run noise. Bump these UP when coverage genuinely
  // improves — a floor that never rises just locks in today's gaps forever.
  coverageThreshold: {
    global: { statements: 70, branches: 58, functions: 67, lines: 72 },
    './controllers/': { statements: 52, branches: 38, functions: 53, lines: 55 },
  },
  verbose: true
};
