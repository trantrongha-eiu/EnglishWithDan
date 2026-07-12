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
  verbose: true
};
