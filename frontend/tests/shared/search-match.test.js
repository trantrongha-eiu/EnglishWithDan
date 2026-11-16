/**
 * @jest-environment jsdom
 */
// js/shared/search-match.js (copy of backend/utils/searchMatch.js) loaded the
// way the page loads it — as a plain script inside the app-shell bundle —
// must expose window.SearchMatch for every page's search box.
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '../../js/shared/search-match.js'), 'utf8');
const BUNDLE = fs.readFileSync(path.join(__dirname, '../../js/bundles/app-shell.js'), 'utf8');

describe('SearchMatch in the browser', () => {
  beforeAll(() => {
    delete window.SearchMatch;
    // eslint-disable-next-line no-eval
    window.eval(SRC);
  });

  it('is exposed as window.SearchMatch', () => {
    expect(typeof window.SearchMatch.filter).toBe('function');
  });

  it('is part of the app-shell bundle, before nav.js', () => {
    const at = BUNDLE.indexOf('// ── js/shared/search-match.js');
    expect(at).toBeGreaterThan(-1);
    expect(at).toBeLessThan(BUNDLE.indexOf('// ── js/nav.js'));
  });

  it.each([
    ['Cam 18 - Test 4', 'cam18 test4'],
    ['Vol 2 - Test 1', 'test 1 vol 2'],
    ['MockTest  Đề Random', 'de random'],
    ['Nguyễn Văn An', 'nguyen an'],
  ])('%j matches %j', (text, q) => {
    expect(window.SearchMatch.matches(text, q)).toBe(true);
  });

  it('ranks the exact test first and skips other numbers', () => {
    const tests = ['Vol 1 - Test 10', 'Vol 10 - Test 1', 'Vol 1 - Test 1'];
    expect(window.SearchMatch.filter(tests, 'vol 1 test 1')).toEqual(['Vol 1 - Test 1']);
  });
});
