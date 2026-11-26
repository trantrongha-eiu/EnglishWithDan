/**
 * Chiến lược luyện đề moved to the React app (student-src/src/utils/
 * examTimetable.js). Its 7-week plan must be the old page's
 * (js/reading-listening-strategy.js) word for word, and its checklist keys
 * the same: students' saved progress is stored under those keys.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
let old;
let now;

beforeAll(() => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'reading-listening-strategy.js'), 'utf8');
  const from = code.indexOf('var OVERVIEW_ROWS_BY_BAND');
  const to = code.indexOf('var BAND_STORAGE_KEY');
  const keyFn = code.slice(code.indexOf('function keyFor'), code.indexOf('// The backend'));
  const statsFn = code.slice(code.indexOf('function activeBandStats'), code.indexOf('function renderStats'));
  // eslint-disable-next-line no-new-func
  old = new Function('state', code.slice(from, to) + keyFn + statsFn
    + 'return { OVERVIEW_ROWS_BY_BAND, TIMETABLE_WEEKS_BY_BAND, keyFor, activeBandStats };');

  let src = fs.readFileSync(path.join(ROOT, 'student-src', 'src', 'utils', 'examTimetable.js'), 'utf8');
  src = src.replace(/^export (const|function) /gm, '$1 ');
  const names = [...src.matchAll(/^(?:const|function) (\w+)/gm)].map((m) => m[1]);
  // eslint-disable-next-line no-new-func
  now = new Function(src + '\nreturn {' + names.join(',') + '};')();
});

test('both roadmaps and overview tables are the old page’s, word for word', () => {
  const o = old({ band: '6.0', checklist: {} });
  expect(now.OVERVIEW_ROWS_BY_BAND).toEqual(o.OVERVIEW_ROWS_BY_BAND);
  expect(now.TIMETABLE_WEEKS_BY_BAND).toEqual(o.TIMETABLE_WEEKS_BY_BAND);
  expect(now.BANDS).toEqual(Object.keys(o.TIMETABLE_WEEKS_BY_BAND));
});

test('checklist keys are unchanged (6.0 unprefixed, 7.0 with b7-) and match the server rule', () => {
  const KEY_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/; // backend/services/examTimetableService.js
  for (const band of now.BANDS) {
    const o = old({ band, checklist: {} });
    const keys = [];
    for (const w of now.TIMETABLE_WEEKS_BY_BAND[band]) {
      for (const s of w.sessions) {
        const k = now.keyFor(band, w.n, s.k);
        expect(k).toBe(o.keyFor(w.n, s.k));
        expect(k).toMatch(KEY_RE);
        keys.push(k);
      }
    }
    expect(new Set(keys).size).toBe(42);
  }
  expect(now.keyFor('6.0', 1, 'class1')).toBe('w1-class1');
  expect(now.keyFor('7.0', 7, 'home3')).toBe('b7-w7-home3');
});

test('progress counts only the open band, as before', () => {
  const checklist = { 'w1-class1': true, 'w1-class2': true, 'w3-home1': true, 'w2-home2': false, 'b7-w1-class1': true, 'b7-w7-home3': true, stray: true };
  for (const band of now.BANDS) {
    const o = old({ band, checklist }).activeBandStats();
    const n = now.bandStats(band, checklist);
    expect({ totalItems: n.totalItems, totalChecked: n.totalChecked }).toEqual(o);
    expect(n.pct).toBe(Math.round((o.totalChecked / o.totalItems) * 100));
  }
  expect(now.bandStats('6.0', checklist)).toEqual({ totalItems: 42, totalChecked: 3, pct: 7 });
  const w1 = now.TIMETABLE_WEEKS_BY_BAND['6.0'][0];
  expect(now.weekDoneCount('6.0', checklist, w1)).toBe(2);
});

test('the band choice keeps the old localStorage key, and a blocked storage falls back to 6.0', () => {
  localStorage.removeItem('tt_band');
  expect(now.loadBand()).toBe('6.0');
  now.saveBand('7.0');
  expect(localStorage.getItem('tt_band')).toBe('7.0');
  expect(now.loadBand()).toBe('7.0');
  const get = Storage.prototype.getItem;
  Storage.prototype.getItem = () => { throw new Error('blocked'); };
  try { expect(now.loadBand()).toBe('6.0'); } finally { Storage.prototype.getItem = get; }
});
