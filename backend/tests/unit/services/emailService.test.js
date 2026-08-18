'use strict';

// nodemailer is globally mocked in tests/support/setupTestDb.js (never hits
// a real SMTP provider). config.email is mocked per-test here instead of
// relying on ambient EMAIL_USER/EMAIL_PASS env vars, so both branches
// (configured / not configured) are deterministic regardless of the
// developer's local .env.
describe('emailService.sendEmail', () => {
  afterEach(() => jest.resetModules());

  it('returns false and does not throw when EMAIL_USER/EMAIL_PASS are not configured', async () => {
    jest.doMock('../../../config', () => ({ email: { user: undefined, pass: undefined } }));
    const emailService = require('../../../services/emailService');

    const result = await emailService.sendEmail('student@example.com', 'Subject', '<p>Hi</p>');

    expect(result).toBe(false);
  });

  it('returns true and sends via nodemailer when configured', async () => {
    jest.doMock('../../../config', () => ({ email: { user: 'bot@englishwithdan.com', pass: 'app-password' } }));
    const emailService = require('../../../services/emailService');

    const result = await emailService.sendEmail('student@example.com', 'Subject', '<p>Hi</p>');

    expect(result).toBe(true);
    const nodemailer = require('nodemailer');
    expect(nodemailer.createTransport).toHaveBeenCalled();
  });

  it('fails open (returns false, does not throw) if the transport rejects', async () => {
    jest.doMock('../../../config', () => ({ email: { user: 'bot@englishwithdan.com', pass: 'app-password' } }));
    jest.doMock('nodemailer', () => ({
      createTransport: jest.fn(() => ({ sendMail: jest.fn().mockRejectedValue(new Error('SMTP down')) })),
    }));
    const emailService = require('../../../services/emailService');

    const result = await emailService.sendEmail('student@example.com', 'Subject', '<p>Hi</p>');

    expect(result).toBe(false);
  });
});
