'use strict';

// Progressive-render behaviour of dictionary-lookup.js: the Vietnamese
// meaning (Google Translate) must paint as soon as it returns, without
// waiting on the slower dictionaryapi.dev / MyMemory calls.
const { loadScript } = require('../helpers/loadScript');

function setupDom() {
  document.body.innerHTML = `
    <div id="dict-popup" class="hidden">
      <span id="dict-word"></span><span id="dict-phonetic"></span>
      <div id="dict-body"></div>
    </div>
    <div id="dict-vocab-modal" class="hidden"><div id="dict-vocab-book-list"></div>
      <input id="dict-new-book-name" /></div>
    <div id="lookup-container">the quick brown fox</div>`;
}

beforeAll(() => {
  window.escHtml = (s) => String(s == null ? '' : s);
  window.AuthService = { API: 'http://x/api', authHeader: () => ({}) };
  window.showVocabToast = () => {};
  loadScript('dictionary-lookup.js');
});

beforeEach(setupDom);

afterEach(() => { delete global.fetch; });

const flush = () => new Promise((r) => setTimeout(r, 0));

test('renders the meaning as soon as Google Translate returns, before the slow calls settle', async () => {
  let dictApiResolved = false;
  let myMemResolved = false;

  global.fetch = jest.fn((url) => {
    if (String(url).includes('translate.googleapis.com')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([[['con cáo', 'fox', null, null, 1]]]) });
    }
    if (String(url).includes('dictionaryapi.dev')) {
      return new Promise((resolve) => setTimeout(() => { dictApiResolved = true; resolve({ ok: true, json: () => Promise.resolve(null) }); }, 5000));
    }
    // mymemory
    return new Promise((resolve) => setTimeout(() => { myMemResolved = true; resolve({ ok: true, json: () => Promise.resolve({ matches: [] }) }); }, 5000));
  });

  // window.setupDictionaryDouble binds a dblclick handler that calls the
  // internal lookupWord — drive it directly by faking a double-click with a
  // one-word selection.
  window.setupDictionaryDouble('lookup-container', 'test');
  window.getSelection = () => ({
    rangeCount: 1, isCollapsed: false, toString: () => 'fox',
    anchorNode: document.getElementById('lookup-container').firstChild,
  });
  const el = document.getElementById('lookup-container');
  el.dispatchEvent(new window.MouseEvent('dblclick', { bubbles: true, clientX: 10, clientY: 10 }));

  await flush(); // Google's promise chain drains here; the 5s timers do NOT

  expect(dictApiResolved).toBe(false);
  expect(myMemResolved).toBe(false);
  expect(document.getElementById('dict-body').textContent).toContain('con cáo');
  expect(document.getElementById('dict-body').textContent).not.toContain('Đang tra');
});

// Task 1/2, Speaking and Noun Phrase course drag-to-classify/reorder tiles
// (.t1-chip, .t1-ord-row) set user-select:none so dragging doesn't also
// start a text selection — but that also blocks the browser's own native
// double-click word-selection, so window.getSelection() returns nothing
// there and the popup used to silently never open. Regression test for the
// caretRangeFromPoint fallback that fixes it.
test('falls back to caretRangeFromPoint when the target has user-select:none (drag tiles)', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([[['con cáo', 'fox', null, null, 1]]]) }));

  window.setupDictionaryDouble('lookup-container', 'test');
  // Selection API returns nothing — this is what really happens on a
  // user-select:none element, since the browser never lets a selection
  // form there in the first place.
  window.getSelection = () => ({ rangeCount: 0, isCollapsed: true, toString: () => '' });
  window.getComputedStyle = () => ({ userSelect: 'none' });

  const el = document.getElementById('lookup-container');
  const textNode = el.firstChild; // "the quick brown fox"
  document.caretRangeFromPoint = () => ({
    startContainer: textNode,
    startOffset: textNode.textContent.indexOf('fox') + 1, // land mid-word
  });

  el.dispatchEvent(new window.MouseEvent('dblclick', { bubbles: true, clientX: 10, clientY: 10 }));
  await flush();

  expect(document.getElementById('dict-word').textContent).toBe('fox');
  expect(document.getElementById('dict-body').textContent).toContain('con cáo');
});
