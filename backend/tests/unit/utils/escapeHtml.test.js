// Unit tests for utils/escapeHtml.js — escapeHtml(str), used wherever user
// input is interpolated into a raw HTML string server-side (e.g. email
// bodies) rather than through an auto-escaping templating engine.
const { escapeHtml } = require('../../../utils/escapeHtml');

describe('escapeHtml', () => {
  test('escapes &', () => {
    expect(escapeHtml('&')).toBe('&amp;');
  });

  test('escapes <', () => {
    expect(escapeHtml('<')).toBe('&lt;');
  });

  test('escapes >', () => {
    expect(escapeHtml('>')).toBe('&gt;');
  });

  test('escapes "', () => {
    expect(escapeHtml('"')).toBe('&quot;');
  });

  test("escapes '", () => {
    expect(escapeHtml("'")).toBe('&#39;');
  });

  test('escapes a string with multiple special chars mixed with normal text', () => {
    const input = `<script>alert("hi & 'bye'")</script>`;
    const expected = '&lt;script&gt;alert(&quot;hi &amp; &#39;bye&#39;&quot;)&lt;/script&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  test('null input becomes an empty string, not the literal "null"', () => {
    expect(escapeHtml(null)).toBe('');
  });

  test('undefined input becomes an empty string, not the literal "undefined"', () => {
    expect(escapeHtml(undefined)).toBe('');
  });

  test('calling with no argument at all becomes an empty string', () => {
    expect(escapeHtml()).toBe('');
  });

  test('a string with no special characters passes through unchanged', () => {
    expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
  });

  test('an empty string passes through unchanged', () => {
    expect(escapeHtml('')).toBe('');
  });
});
