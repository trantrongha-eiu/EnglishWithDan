// Unit tests for utils/emailCheck — the fast real/fake email check used by
// email sign-up. DNS is stubbed; nothing touches the network.
const dns = require('dns');
const { checkEmail, isValidGmailLocal, _mxCache } = require('../../../utils/emailCheck');

describe('checkEmail', () => {
  let resolveMx;
  beforeEach(() => {
    _mxCache.clear();
    resolveMx = jest.spyOn(dns.promises, 'resolveMx');
  });
  afterEach(() => resolveMx.mockRestore());

  test('normalizes case/whitespace and accepts a big provider without DNS', async () => {
    await expect(checkEmail('  Lan.Nguyen@GMAIL.com ')).resolves.toEqual({ ok: true, email: 'lan.nguyen@gmail.com' });
    expect(resolveMx).not.toHaveBeenCalled();
  });

  test('rejects malformed addresses', async () => {
    for (const e of ['', 'abc', 'a@b', 'a b@gmail.com', 'a@@gmail.com', '@gmail.com', 'x@-.com']) {
      expect((await checkEmail(e)).reason).toBe('invalid');
    }
  });

  test('suggests the fix for a typo\'d provider domain', async () => {
    await expect(checkEmail('hoa123@gmial.com')).resolves.toEqual({ ok: false, reason: 'typo', suggestion: 'hoa123@gmail.com' });
  });

  test('rejects disposable providers', async () => {
    expect((await checkEmail('a@yopmail.com')).reason).toBe('disposable');
  });

  test('MX present → ok; NXDOMAIN / no MX / null MX → no_mx', async () => {
    resolveMx.mockResolvedValueOnce([{ exchange: 'mx1.example.vn', priority: 10 }]);
    expect((await checkEmail('a@real.vn')).ok).toBe(true);

    resolveMx.mockRejectedValueOnce(Object.assign(new Error(), { code: 'ENOTFOUND' }));
    expect((await checkEmail('a@fake-domain.vn')).reason).toBe('no_mx');

    resolveMx.mockRejectedValueOnce(Object.assign(new Error(), { code: 'ENODATA' }));
    expect((await checkEmail('a@nomail.vn')).reason).toBe('no_mx');

    resolveMx.mockResolvedValueOnce([{ exchange: '.', priority: 0 }]);
    expect((await checkEmail('a@nullmx.vn')).reason).toBe('no_mx');
  });

  test('DNS trouble fails open and is not cached', async () => {
    resolveMx.mockRejectedValueOnce(Object.assign(new Error(), { code: 'ETIMEOUT' }));
    expect((await checkEmail('a@flaky.vn')).ok).toBe(true);
    expect(_mxCache.has('flaky.vn')).toBe(false);
  });

  test('caches the MX answer per domain', async () => {
    resolveMx.mockResolvedValue([{ exchange: 'mx.cached.vn', priority: 10 }]);
    await checkEmail('a@cached.vn');
    await checkEmail('b@cached.vn');
    expect(resolveMx).toHaveBeenCalledTimes(1);
  });
});

describe('isValidGmailLocal', () => {
  test.each([
    ['nguyenvana', true], ['nguyen.van.a', true], ['lan.nguyen+ielts', true], ['abc123', true],
    ['abc', false], ['ab.cd', false], ['.abcdef', false], ['abcdef.', false], ['abc..def', false],
    ['abc_def', false], ['abc-def', false], ['a'.repeat(31), false],
  ])('%s → %s', (local, expected) => {
    expect(isValidGmailLocal(local)).toBe(expected);
  });
});
