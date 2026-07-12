// Unit tests for utils/logger.js (Phase 11 — structured logging).
const logger = require('../../../utils/logger');

function parseLastCall(spy) {
  const [line] = spy.mock.calls[spy.mock.calls.length - 1];
  return JSON.parse(line);
}

describe('logger', () => {
  let logSpy, warnSpy, errorSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test('info() writes via console.log with level/category/message fields', () => {
    logger.info('startup', 'Server booted');
    expect(logSpy).toHaveBeenCalledTimes(1);
    const entry = parseLastCall(logSpy);
    expect(entry.level).toBe('info');
    expect(entry.category).toBe('startup');
    expect(entry.message).toBe('Server booted');
    expect(typeof entry.timestamp).toBe('string');
    expect(new Date(entry.timestamp).toString()).not.toBe('Invalid Date');
  });

  test('warn() writes via console.warn, error() writes via console.error', () => {
    logger.warn('auth', 'suspicious activity');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).not.toHaveBeenCalled();

    logger.error('database', 'connection lost');
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  test('convenience wrappers route to the correct level and category', () => {
    logger.security('blocked request');
    expect(parseLastCall(warnSpy)).toMatchObject({ level: 'warn', category: 'security' });

    logger.startup('booting');
    expect(parseLastCall(logSpy)).toMatchObject({ level: 'info', category: 'startup' });

    logger.shutdown('stopping');
    expect(parseLastCall(logSpy)).toMatchObject({ level: 'info', category: 'shutdown' });

    logger.ai('Gemini failed');
    expect(parseLastCall(errorSpy)).toMatchObject({ level: 'error', category: 'ai' });

    logger.db('connected');
    expect(parseLastCall(logSpy)).toMatchObject({ level: 'info', category: 'database' });

    logger.dbError('ping failed');
    expect(parseLastCall(errorSpy)).toMatchObject({ level: 'error', category: 'database' });

    logger.auth('login failed');
    expect(parseLastCall(warnSpy)).toMatchObject({ level: 'warn', category: 'auth' });
  });

  test('redacts sensitive keys in meta (password/token/secret/otp/jwt)', () => {
    logger.info('test', 'msg', {
      password: 'hunter2',
      token: 'abc.def.ghi',
      resetOTP: '123456',
      jwtSecret: 'topsecret',
      apiKey: 'sk-xyz',
      Authorization: 'Bearer xyz',
      safeField: 'this stays',
    });
    const entry = parseLastCall(logSpy);
    expect(entry.password).toBe('[redacted]');
    expect(entry.token).toBe('[redacted]');
    expect(entry.resetOTP).toBe('[redacted]');
    expect(entry.jwtSecret).toBe('[redacted]');
    expect(entry.apiKey).toBe('[redacted]');
    expect(entry.Authorization).toBe('[redacted]');
    expect(entry.safeField).toBe('this stays');
  });

  test('redacts sensitive keys nested inside a meta object', () => {
    logger.info('test', 'msg', { user: { email: 'a@b.com', password: 'hunter2' } });
    const entry = parseLastCall(logSpy);
    expect(entry.user.email).toBe('a@b.com');
    expect(entry.user.password).toBe('[redacted]');
  });

  test('handles missing/undefined meta without throwing', () => {
    expect(() => logger.info('test', 'no meta')).not.toThrow();
    const entry = parseLastCall(logSpy);
    expect(entry.message).toBe('no meta');
  });

  // Value-level redaction (production-readiness audit finding): a
  // credential embedded INSIDE a string — not just under a sensitive key
  // name — must also be masked, since this is exactly how a MongoDB
  // connection failure's err.message would leak MONGO_URI.
  test('redacts a MongoDB connection string embedded in a message/meta value, keeping the host visible', () => {
    logger.error('database', 'connect failed', {
      message: 'connect ECONNREFUSED to mongodb+srv://dbuser:S3cr3tPass@cluster0.abcde.mongodb.net/mydb',
    });
    const entry = parseLastCall(errorSpy);
    expect(entry.message).not.toMatch(/dbuser:S3cr3tPass/);
    expect(entry.message).toMatch(/\[redacted\]@cluster0\.abcde\.mongodb\.net/);
  });

  test('redacts a Bearer token and a JWT-shaped string appearing in free text', () => {
    logger.warn('auth', 'rejected Authorization: Bearer abcdef1234567890.longtoken');
    const entry = parseLastCall(warnSpy);
    expect(entry.message).not.toMatch(/abcdef1234567890/);

    logger.warn('auth', 'saw token eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMyJ9.abc123signaturehere');
    const entry2 = parseLastCall(warnSpy);
    expect(entry2.message).not.toMatch(/eyJhbGciOiJIUzI1NiJ9/);
    expect(entry2.message).toContain('[redacted-jwt]');
  });

  test('redacts credential-shaped values inside an array of objects', () => {
    logger.info('test', 'msg', { items: [{ password: 'hunter2' }, { safe: 'ok' }] });
    const entry = parseLastCall(logSpy);
    expect(entry.items[0].password).toBe('[redacted]');
    expect(entry.items[1].safe).toBe('ok');
  });

  test('extracts errorMessage/stack from an Error passed directly as meta, and redacts within them, without clobbering the top-level message', () => {
    const err = new Error('failed: mongodb://u:p4ss@host.example.com/db');
    logger.error('database', 'boom', err);
    const entry = parseLastCall(errorSpy);
    expect(entry.message).toBe('boom'); // top-level message survives, not overwritten by the error's own
    expect(entry.errorMessage).toBe('failed: mongodb://[redacted]@host.example.com/db');
    expect(typeof entry.stack).toBe('string');
    expect(entry.stack).not.toMatch(/u:p4ss/);
  });
});
