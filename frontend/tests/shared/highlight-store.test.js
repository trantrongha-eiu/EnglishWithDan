'use strict';

const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  window.AuthService = { API: 'http://api.test/api', authHeader: () => ({ Authorization: 'Bearer t' }) };
  loadScript('highlight-store.js');
});

beforeEach(() => {
  try { localStorage.clear(); } catch (_) { /* ignore */ }
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) }));
});

const PASSAGE = '<div class="passage-title">The Bee</div>'
  + '<div class="passage-text"><p>Bees <b>pollinate</b> crops.</p><p>Honey is sweet and bees make it.</p></div>';

function el(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d;
}

// Highlights `text` (first occurrence) the way the page's mouseup handler does.
function highlight(root, text, color) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const i = n.nodeValue.indexOf(text);
    if (i === -1) continue;
    const r = document.createRange();
    r.setStart(n, i);
    r.setEnd(n, i + text.length);
    const span = document.createElement('span');
    span.className = color ? 'hl hl-' + color : 'hl';
    r.surroundContents(span);
    return;
  }
  throw new Error('not found: ' + text);
}

describe('HighlightStore.serialize / apply', () => {
  test('round-trips highlights onto a freshly rendered copy of the same markup', () => {
    const live = el(PASSAGE);
    highlight(live, 'Honey is sweet');
    highlight(live, 'crops', 'green');
    const ranges = window.HighlightStore.serialize(live);
    expect(ranges.map(r => r[3])).toEqual(['crops', 'Honey is sweet']);
    expect(ranges[0][2]).toBe('green');

    const fresh = el(PASSAGE);
    window.HighlightStore.apply(fresh, ranges);
    expect([...fresh.querySelectorAll('.hl')].map(s => [s.textContent, s.className]))
      .toEqual([['crops', 'hl hl-green'], ['Honey is sweet', 'hl']]);
    expect(fresh.textContent).toBe(el(PASSAGE).textContent);
  });

  test('a highlight wrapping inline markup comes back as one span', () => {
    const live = el('<p>Bees <b>pollinate</b> crops.</p>');
    const p = live.querySelector('p');
    const r = document.createRange();
    r.setStart(p.firstChild, 0);
    r.setEnd(p.lastChild, 3);
    const span = document.createElement('span');
    span.className = 'hl';
    r.surroundContents(span);
    const ranges = window.HighlightStore.serialize(live);
    expect(ranges).toEqual([[0, 17, '', 'Bees pollinate cr']]);

    const fresh = el('<p>Bees <b>pollinate</b> crops.</p>');
    window.HighlightStore.apply(fresh, ranges);
    const spans = fresh.querySelectorAll('.hl');
    expect(spans).toHaveLength(1);
    expect(spans[0].textContent).toBe('Bees pollinate cr');
  });

  test('re-finds a highlight by its text when the passage was edited before it', () => {
    const live = el(PASSAGE);
    highlight(live, 'bees make it');
    const ranges = window.HighlightStore.serialize(live);
    const edited = el(PASSAGE.replace('The Bee', 'The Honey Bee, revised'));
    window.HighlightStore.apply(edited, ranges);
    expect(edited.querySelector('.hl').textContent).toBe('bees make it');
  });

  test('skips a highlight whose text is gone, without touching the DOM', () => {
    const fresh = el(PASSAGE);
    const before = fresh.innerHTML;
    window.HighlightStore.apply(fresh, [[0, 5, '', 'Wasps']]);
    expect(fresh.innerHTML).toBe(before);
  });

  test('serializeHtml reads a cached HTML string', () => {
    const live = el(PASSAGE);
    highlight(live, 'pollinate');
    expect(window.HighlightStore.serializeHtml(live.innerHTML).map(r => r[3])).toEqual(['pollinate']);
  });
});

describe('HighlightStore.normalize', () => {
  test('converts the old full-test localStorage shape (passage HTML + question texts)', () => {
    const live = el(PASSAGE);
    highlight(live, 'sweet');
    const legacy = { 1: { passage: live.innerHTML, questionTexts: ['Which insect'] } };
    const n = window.HighlightStore.normalize(legacy);
    expect(n.ts).toBe(0);
    expect(n.parts[1].p.map(r => r[3])).toEqual(['sweet']);
    expect(n.parts[1].q).toEqual(['Which insect']);
  });

  test('converts the old practice shape into part 0', () => {
    const n = window.HighlightStore.normalize({ transcript: null, questionTexts: [{ text: 'map', colorKey: 'pink' }] });
    expect(n.parts[0]).toEqual({ p: [], q: [{ text: 'map', colorKey: 'pink' }] });
  });

  test('passes the server shape through', () => {
    const n = window.HighlightStore.normalize({ ts: 5, parts: { 0: { p: [], q: ['x'] } } });
    expect(n).toEqual({ v: 2, ts: 5, parts: { 0: { p: [], q: ['x'] } } });
    expect(window.HighlightStore.normalize(null)).toBeNull();
  });

  test('pickNewer prefers the more recent copy, server on a tie', () => {
    const a = { ts: 10, parts: {} }, b = { ts: 20, parts: {} };
    expect(window.HighlightStore.pickNewer(a, b)).toBe(b);
    expect(window.HighlightStore.pickNewer(b, a)).toBe(b);
    const tie = { ts: 10, parts: {} };
    expect(window.HighlightStore.pickNewer(a, tie)).toBe(tie);
    expect(window.HighlightStore.pickNewer(a, null)).toBe(a);
  });
});

describe('HighlightStore storage', () => {
  test('writeLocal prunes other attempts’ copies when storage is full', () => {
    localStorage.setItem('ews_reading_hl_old', 'x'.repeat(10));
    localStorage.setItem('unrelated', 'keep');
    const orig = Storage.prototype.setItem;
    let calls = 0;
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(function (k, v) {
      calls++;
      if (calls === 1) throw new Error('QuotaExceededError');
      return orig.call(this, k, v);
    });
    window.HighlightStore.writeLocal('ews_reading_hl_new', { v: 2, ts: 1, parts: {} });
    spy.mockRestore();
    expect(localStorage.getItem('ews_reading_hl_old')).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('keep');
    expect(JSON.parse(localStorage.getItem('ews_reading_hl_new')).ts).toBe(1);
  });

  test('saveRemote debounces into one PUT and flush sends it right away', () => {
    jest.useFakeTimers();
    const d1 = { v: 2, ts: 1, parts: { 0: { p: [], q: ['a'] } } };
    const d2 = { v: 2, ts: 2, parts: { 0: { p: [], q: ['a', 'b'] } } };
    window.HighlightStore.saveRemote('reading', 'abc', d1);
    window.HighlightStore.saveRemote('reading', 'abc', d2);
    expect(global.fetch).not.toHaveBeenCalled();
    window.HighlightStore.flush();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe('http://api.test/api/highlights/reading/abc');
    expect(opts.method).toBe('PUT');
    expect(JSON.parse(opts.body)).toEqual({ highlights: { ts: 2, parts: d2.parts } });
    jest.advanceTimersByTime(5000);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
