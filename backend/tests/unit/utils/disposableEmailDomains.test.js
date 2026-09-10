// Unit tests for utils/disposableEmailDomains.isDisposableEmail — the
// throwaway-mailbox blocklist used to slow 24h-trial farming.
const { isDisposableEmail, DISPOSABLE_DOMAINS } = require('../../../utils/disposableEmailDomains');

describe('isDisposableEmail', () => {
  test('flags a known disposable provider', () => {
    expect(isDisposableEmail('someone@mailinator.com')).toBe(true);
    expect(isDisposableEmail('x@yopmail.com')).toBe(true);
    expect(isDisposableEmail('a.b+tag@guerrillamail.com')).toBe(true);
  });

  test('is case-insensitive and tolerates surrounding whitespace', () => {
    expect(isDisposableEmail('  Person@MailInator.COM  ')).toBe(true);
  });

  test('does NOT flag mainstream providers', () => {
    for (const e of [
      'user@gmail.com', 'user@googlemail.com', 'user@outlook.com',
      'user@yahoo.com', 'user@icloud.com', 'user@proton.me',
      'student@university.edu.vn', 'me@company.com.vn',
    ]) {
      expect(isDisposableEmail(e)).toBe(false);
    }
  });

  test('only the domain matters, not a lookalike local part', () => {
    expect(isDisposableEmail('mailinator.com@gmail.com')).toBe(false);
  });

  test('non-email / empty / null input returns false (no throw)', () => {
    expect(isDisposableEmail('')).toBe(false);
    expect(isDisposableEmail(null)).toBe(false);
    expect(isDisposableEmail(undefined)).toBe(false);
    expect(isDisposableEmail('not-an-email')).toBe(false);
  });

  test('matches on the full registrable domain, not a suffix (no "evilmailinator.com" bypass-in-reverse)', () => {
    // "notmailinator.com" is not in the set → not flagged; the check is an
    // exact Set lookup, so it also can't be fooled by "mailinator.com.evil.tld".
    expect(isDisposableEmail('x@notmailinator.com')).toBe(false);
    expect(isDisposableEmail('x@mailinator.com.evil.tld')).toBe(false);
    expect(DISPOSABLE_DOMAINS.has('mailinator.com')).toBe(true);
  });
});
