'use strict';

// js/shared/course-return.js — the "Về khóa học" link read from ?returnTo=
// must never send the student off-site (debug pass 2026-11-14: "/\t/evil.com"
// passed the old prefix check, and browsers strip the tab → "//evil.com").
const { loadScript } = require('../helpers/loadScript');

function urlFor(returnTo) {
  window.history.replaceState({}, '', '/reading.html?practice=1&returnTo=' + encodeURIComponent(returnTo));
  delete window.CourseReturn;
  loadScript('course-return.js');
  return window.CourseReturn.url();
}

test('a same-site lesson path is kept', () => {
  expect(urlFor('/mindset-1.html?lesson=MS1-U1-L1')).toBe('/mindset-1.html?lesson=MS1-U1-L1');
});

test.each([
  ['//evil.com'],
  ['/\\evil.com'],
  ['/\t/evil.com'],
  ['/\n/evil.com'],
  ['/ /evil.com'],
  ['https://evil.com/'],
  ['javascript:alert(1)'],
  ['mindset-1.html'],
])('%j is refused', (raw) => {
  expect(urlFor(raw)).toBeNull();
});
