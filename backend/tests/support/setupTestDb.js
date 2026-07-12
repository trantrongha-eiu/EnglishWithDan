// Per-test-file DB isolation. Jest gives each test file its own sandboxed
// module registry, so this file's `mongoose` require is independent per
// test file — each file connects to a uniquely-named database on the
// single shared in-memory Mongo instance (see globalSetup.js), so
// parallel test files never see each other's data.
const mongoose = require('mongoose');
const crypto = require('crypto');

const dbName = `test_${crypto.randomUUID().replace(/-/g, '')}`;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName });
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
