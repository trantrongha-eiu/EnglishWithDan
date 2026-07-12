// Runs once, in Jest's main process, before any test file/worker starts.
// Spins up a single in-memory MongoDB instance shared by all test files —
// each test file connects to its own isolated database name within it
// (see setupTestDb.js), so parallel Jest workers never collide and
// production Atlas is never touched.
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  global.__MONGOD__ = mongod;
  process.env.MONGO_URI = mongod.getUri();
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-not-for-production-use-only';
};
