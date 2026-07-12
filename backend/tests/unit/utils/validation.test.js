// Unit tests for utils/validation.js — isImageDataUri(str), a recent
// SSRF-prevention fix. Cloudinary's upload() accepts a data URI, a remote
// URL, or a local file path — this guard ensures only an actual base64
// image data URI is ever accepted for "imageBase64" uploads, closing off
// the ability for a caller to make the server fetch an arbitrary URL.
const { isImageDataUri } = require('../../../utils/validation');

describe('isImageDataUri', () => {
  test.each([
    ['png', 'data:image/png;base64,iVBORw0KGgo='],
    ['jpeg', 'data:image/jpeg;base64,iVBORw0KGgo='],
    ['jpg (jpe?g regex also matches the short form)', 'data:image/jpg;base64,iVBORw0KGgo='],
    ['gif', 'data:image/gif;base64,iVBORw0KGgo='],
    ['webp', 'data:image/webp;base64,iVBORw0KGgo='],
    ['bmp', 'data:image/bmp;base64,iVBORw0KGgo='],
  ])('accepts a valid %s data URI', (_label, uri) => {
    expect(isImageDataUri(uri)).toBe(true);
  });

  test('accepts a data URI with no padding at all (=* allows zero)', () => {
    expect(isImageDataUri('data:image/png;base64,iVBORw0KGgo')).toBe(true);
  });

  test('rejects svg+xml explicitly (documented XSS exclusion)', () => {
    expect(isImageDataUri('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')).toBe(false);
  });

  test('rejects a remote http URL (the SSRF vector this fix closes)', () => {
    expect(isImageDataUri('http://example.com/image.png')).toBe(false);
  });

  test('rejects a remote https URL', () => {
    expect(isImageDataUri('https://evil.com/x.png')).toBe(false);
  });

  test.each([
    ['null', null],
    ['undefined', undefined],
    ['a number', 12345],
    ['an object', { data: 'x' }],
    ['an array', ['data:image/png;base64,abc=']],
    ['a boolean', true],
  ])('rejects non-string input: %s', (_label, value) => {
    expect(isImageDataUri(value)).toBe(false);
  });

  test('rejects a data URI missing the ";base64," marker', () => {
    expect(isImageDataUri('data:image/png,iVBORw0KGgo=')).toBe(false);
  });

  test('rejects a data URI with an unsupported mime type', () => {
    expect(isImageDataUri('data:text/plain;base64,aGVsbG8=')).toBe(false);
  });

  test('rejects an empty string', () => {
    expect(isImageDataUri('')).toBe(false);
  });

  test('rejects a data URI with invalid base64 characters in the payload', () => {
    expect(isImageDataUri('data:image/png;base64,not valid base64!!')).toBe(false);
  });

  test('rejects a data URI with trailing garbage after the payload', () => {
    expect(isImageDataUri('data:image/png;base64,iVBORw0KGgo=;extra')).toBe(false);
  });
});
