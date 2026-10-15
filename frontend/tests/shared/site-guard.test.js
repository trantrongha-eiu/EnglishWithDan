/**
 * @jest-environment-options {"url": "https://ieltsthayha.com/"}
 */
// SiteGuard is skipped on localhost (jsdom's default origin), hence the
// production URL above. Its listeners are global and can't be removed, so
// the staff-bypass case runs first — before any listener exists.
const { loadScript } = require('../helpers/loadScript');

function fire(type, target, extra) {
  const ev = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(ev, extra || {});
  (target || document.body).dispatchEvent(ev);
  return ev;
}
function key(k, mods) {
  const ev = new KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true, cancelable: true }, mods));
  document.body.dispatchEvent(ev);
  return ev;
}
function copyEvent(selectedText) {
  window.getSelection = () => ({ toString: () => selectedText });
  const data = {};
  const ev = fire('copy', document.body, { clipboardData: { setData: (t, v) => { data[t] = v; } } });
  return { ev, data };
}

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });

test('admin / teacher accounts are not restricted', () => {
  localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
  loadScript('site-guard.js');
  expect(fire('contextmenu').defaultPrevented).toBe(false);
  expect(key('F12').defaultPrevented).toBe(false);
});

describe('for a student', () => {
  beforeAll(() => {
    localStorage.setItem('user', JSON.stringify({ role: 'student' }));
    loadScript('site-guard.js');
  });

  test('right-click is blocked on content but allowed in inputs', () => {
    expect(fire('contextmenu').defaultPrevented).toBe(true);
    const input = document.createElement('textarea');
    document.body.appendChild(input);
    expect(fire('contextmenu', input).defaultPrevented).toBe(false);
  });

  test('DevTools / source / save / print shortcuts are blocked, normal typing is not', () => {
    expect(key('F12').defaultPrevented).toBe(true);
    expect(key('I', { ctrlKey: true, shiftKey: true }).defaultPrevented).toBe(true);
    expect(key('u', { ctrlKey: true }).defaultPrevented).toBe(true);
    expect(key('s', { ctrlKey: true }).defaultPrevented).toBe(true);
    expect(key('i', { metaKey: true, altKey: true }).defaultPrevented).toBe(true);
    expect(key('c', { ctrlKey: true }).defaultPrevented).toBe(false); // plain copy
    expect(key('a').defaultPrevented).toBe(false);
  });

  test('a short copy (dictionary word) goes through untouched', () => {
    const { ev, data } = copyEvent('meticulous');
    expect(ev.defaultPrevented).toBe(false);
    expect(data['text/plain']).toBeUndefined();
  });

  test('a long copy gets the copyright notice instead of the lesson text', () => {
    const { ev, data } = copyEvent('x'.repeat(500));
    expect(ev.defaultPrevented).toBe(true);
    expect(data['text/plain']).toMatch(/EnglishWithDan/);
  });

  test('images cannot be dragged out', () => {
    const img = document.createElement('img');
    document.body.appendChild(img);
    expect(fire('dragstart', img).defaultPrevented).toBe(true);
  });
});
