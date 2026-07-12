'use strict';

const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  loadScript('safe-redirect.js');
});

describe('SafeRedirect.getSafeNext — open-redirect guard', () => {
  test('rejects null/empty/undefined input', () => {
    expect(window.SafeRedirect.getSafeNext(null)).toBeNull();
    expect(window.SafeRedirect.getSafeNext('')).toBeNull();
    expect(window.SafeRedirect.getSafeNext(undefined)).toBeNull();
  });

  test('rejects any value containing "://" (absolute off-site URL)', () => {
    expect(window.SafeRedirect.getSafeNext('https://evil.com')).toBeNull();
    expect(window.SafeRedirect.getSafeNext('http://evil.com/x.html')).toBeNull();
    expect(window.SafeRedirect.getSafeNext('javascript://alert(1)')).toBeNull();
    // "://" anywhere in the string, not just at the start.
    expect(window.SafeRedirect.getSafeNext('/foo?redirect=https://evil.com')).toBeNull();
  });

  test('rejects protocol-relative "//" URLs', () => {
    expect(window.SafeRedirect.getSafeNext('//evil.com')).toBeNull();
    expect(window.SafeRedirect.getSafeNext('//evil.com/path.html')).toBeNull();
  });

  test('accepts a bare "*.html" filename', () => {
    expect(window.SafeRedirect.getSafeNext('dashboard.html')).toEqual({
      url: 'dashboard.html',
      admin: false,
    });
  });

  test('accepts a bare "*.html" filename with a query string and/or hash', () => {
    expect(window.SafeRedirect.getSafeNext('reading.html?testId=abc')).toEqual({
      url: 'reading.html?testId=abc',
      admin: false,
    });
    expect(window.SafeRedirect.getSafeNext('reading.html#section2')).toEqual({
      url: 'reading.html#section2',
      admin: false,
    });
  });

  test('accepts a clean absolute path starting with "/"', () => {
    expect(window.SafeRedirect.getSafeNext('/tuition')).toEqual({
      url: '/tuition',
      admin: false,
    });
    expect(window.SafeRedirect.getSafeNext('/reading/test/68abc123')).toEqual({
      url: '/reading/test/68abc123',
      admin: false,
    });
  });

  test('accepts an admin HashRouter route "/admin/#/..."', () => {
    expect(window.SafeRedirect.getSafeNext('/admin/#/students')).toEqual({
      url: '/admin/#/students',
      admin: true,
    });
  });

  test('accepts the bare "/admin/" route with no hash fragment', () => {
    expect(window.SafeRedirect.getSafeNext('/admin/')).toEqual({
      url: '/admin/',
      admin: true,
    });
  });

  test('rejects a relative path with no leading "/" that is not a .html file', () => {
    expect(window.SafeRedirect.getSafeNext('tuition')).toBeNull();
    expect(window.SafeRedirect.getSafeNext('foo/bar')).toBeNull();
  });

  test('rejects an absolute path whose first path segment character is not a letter', () => {
    // The clean-path regex requires /[a-zA-Z]... right after the leading slash.
    expect(window.SafeRedirect.getSafeNext('/123abc')).toBeNull();
  });

  test('rejects a bare filename with an extension other than .html', () => {
    expect(window.SafeRedirect.getSafeNext('evil.js')).toBeNull();
    expect(window.SafeRedirect.getSafeNext('data.json')).toBeNull();
  });
});
