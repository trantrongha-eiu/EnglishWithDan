// Per-test-file DB isolation. Jest gives each test file its own sandboxed
// module registry, so this file's `mongoose` require is independent per
// test file — each file connects to a uniquely-named database on the
// single shared in-memory Mongo instance (see globalSetup.js), so
// parallel test files never see each other's data.
const mongoose = require('mongoose');
const crypto = require('crypto');

// Global safety net: never let a test hit a real email-sending API,
// regardless of what EMAIL_USER/EMAIL_PASS/RESEND_API_KEY happen to be set
// to via the developer's local .env (dotenv loads it before tests run,
// same as production). Without this, authService.test.js's OTP tests
// silently sent real password-reset emails through a real Gmail account
// on every local `npm test` run — DB-state assertions never caught it
// since requestPasswordReset() writes the OTP before attempting to email
// it and swallows any send error either way.
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail: jest.fn().mockResolvedValue({}) })),
}));
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: jest.fn().mockResolvedValue({}) },
  })),
}));

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
