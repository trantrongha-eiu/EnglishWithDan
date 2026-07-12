'use strict';

const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  loadScript('utils.js');
});

describe('escapeHtml / escHtml', () => {
  test('escapes &, <, >, and " but leaves other characters (like \') alone', () => {
    const input = `<div class="a & b">it's < > fine</div>`;
    const out = window.escapeHtml(input);
    expect(out).toBe(`&lt;div class=&quot;a &amp; b&quot;&gt;it's &lt; &gt; fine&lt;/div&gt;`);
  });

  test('escapes the four special characters individually', () => {
    expect(window.escapeHtml('&')).toBe('&amp;');
    expect(window.escapeHtml('<')).toBe('&lt;');
    expect(window.escapeHtml('>')).toBe('&gt;');
    expect(window.escapeHtml('"')).toBe('&quot;');
  });

  test('does not touch single quotes (only escapeAttr does)', () => {
    expect(window.escapeHtml("it's")).toBe("it's");
  });

  test('handles null and undefined gracefully (returns empty string)', () => {
    expect(window.escapeHtml(null)).toBe('');
    expect(window.escapeHtml(undefined)).toBe('');
  });

  test('coerces non-string input to a string first', () => {
    expect(window.escapeHtml(42)).toBe('42');
    expect(window.escapeHtml(true)).toBe('true');
  });

  test('escHtml and esc are aliases of escapeHtml', () => {
    expect(window.escHtml).toBe(window.escapeHtml);
    expect(window.esc).toBe(window.escapeHtml);
  });
});

// NOTE: unlike escapeHtml (exposed as BOTH window.escapeHtml and the
// alias window.escHtml/window.esc), the source only assigns the alias
// names window.escAttr and window.escHtmlNl to window — there is no
// window.escapeAttr or window.escapeHtmlNl at all (see utils.js lines
// 40-44). Verified empirically: referencing window.escapeAttr /
// window.escapeHtmlNl in a test yields undefined. Tests below use the
// only names actually reachable on window.
describe('escAttr (escapeAttr)', () => {
  test('escapes single and double quotes only', () => {
    expect(window.escAttr(`it's a "test"`)).toBe('it&#39;s a &quot;test&quot;');
  });

  test('does not touch & < > (that is escapeHtml\'s job, not escapeAttr\'s)', () => {
    expect(window.escAttr('<a & b>')).toBe('<a & b>');
  });

  test('handles null/undefined gracefully', () => {
    expect(window.escAttr(null)).toBe('');
    expect(window.escAttr(undefined)).toBe('');
  });

  test('is not the same function as escapeHtml (attribute vs. HTML-body escaping)', () => {
    expect(window.escAttr).not.toBe(window.escapeHtml);
  });

  test('escapeAttr is NOT exposed on window under its full name (only the escAttr alias is)', () => {
    expect(window.escapeAttr).toBeUndefined();
  });
});

describe('escHtmlNl (escapeHtmlNl)', () => {
  test('escapes HTML special chars and converts newlines to <br>', () => {
    const input = 'line1 <b>\nline2 & more';
    expect(window.escHtmlNl(input)).toBe('line1 &lt;b&gt;<br>line2 &amp; more');
  });

  test('handles multiple consecutive newlines', () => {
    expect(window.escHtmlNl('a\n\nb')).toBe('a<br><br>b');
  });

  test('handles null/undefined gracefully', () => {
    expect(window.escHtmlNl(null)).toBe('');
  });

  test('escapeHtmlNl is NOT exposed on window under its full name (only the escHtmlNl alias is)', () => {
    expect(window.escapeHtmlNl).toBeUndefined();
  });
});

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('delays invocation by the given wait time', () => {
    const fn = jest.fn();
    const debounced = window.debounce(fn, 200);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(199);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('only invokes once for a rapid burst of calls (trailing edge)', () => {
    const fn = jest.fn();
    const debounced = window.debounce(fn, 100);

    debounced('a');
    jest.advanceTimersByTime(50);
    debounced('b');
    jest.advanceTimersByTime(50);
    debounced('c');
    jest.advanceTimersByTime(50);

    // Still within the debounce window of the last call ('c') — not fired yet.
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
    // Called with the args of the LAST call in the burst.
    expect(fn).toHaveBeenCalledWith('c');
  });

  test('preserves `this` context of the call', () => {
    const obj = {
      value: 42,
      fn: null,
    };
    const spy = jest.fn(function () {
      return this.value;
    });
    obj.debounced = window.debounce(spy, 10);
    obj.debounced();
    jest.advanceTimersByTime(10);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.instances[0]).toBe(obj);
  });
});
