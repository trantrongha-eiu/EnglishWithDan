'use strict';

const { loadScript } = require('../helpers/loadScript');

// window.getSelection() in jsdom doesn't support real text selection, so
// every test that needs a "qualifying" selection (>3 words) stubs it
// directly with a fake Selection-like object.
function stubSelection(text) {
  window.getSelection = jest.fn(() => ({
    rangeCount: 1,
    isCollapsed: false,
    toString: () => text,
    getRangeAt: () => ({
      getBoundingClientRect: () => ({ width: 200, height: 20, left: 10, right: 210, top: 100, bottom: 120 }),
    }),
  }));
}

function mockTranslateFetch(translated) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([[[translated, 'original', null, null, 1]], null, 'en']),
    })
  );
}

async function selectAndShowIcon(text) {
  stubSelection(text);
  const evt = new window.MouseEvent('mouseup', { bubbles: true, clientX: 50, clientY: 60 });
  document.body.dispatchEvent(evt);
  // onSelectionEnd defers to setTimeout(fn, 0) so extractSelectedText runs
  // after the click-vs-selection race settles in a real browser.
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function clickIconAndAwaitTranslation() {
  document.getElementById('ews-sl-icon').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  // Let the translateText() fetch -> .json() -> .then() chain fully drain
  // (several microtask hops deep) — a real macrotask boundary flushes all
  // of them reliably, unlike a fixed number of Promise.resolve() awaits.
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// sentence-lookup.js's ensureDom() creates the #ews-sl-icon/#ews-sl-popup
// nodes exactly once (guarded by `if (icon) return;` on its module-closure
// variable) and appends them straight to document.body — so, unlike most
// shared/*.js tests, this file must NOT reset document.body.innerHTML
// between tests: doing so would detach those nodes from the DOM while the
// module still holds stale references to them, and every test after the
// first would find nothing via getElementById. Each test instead uses its
// own unique sentence so the module's internal translation cache (keyed by
// lowercased text) never serves a stale/mocked result across tests.
beforeAll(() => {
  loadScript('sentence-lookup.js');
});

afterEach(() => {
  delete global.fetch;
});

describe('sentence-lookup scroll behavior', () => {
  test('a qualifying selection (>3 words) shows the owl icon', async () => {
    await selectAndShowIcon('this is a qualifying long sentence');
    expect(document.getElementById('ews-sl-icon').classList.contains('hidden')).toBe(false);
  });

  test('a short selection (<=3 words) never shows the icon', async () => {
    await selectAndShowIcon('too short');
    expect(document.getElementById('ews-sl-icon').classList.contains('hidden')).toBe(true);
  });

  test('clicking the icon opens the popup with the translated text', async () => {
    mockTranslateFetch('Đây là câu thứ hai để dịch');
    await selectAndShowIcon('this is the second sentence to translate');
    await clickIconAndAwaitTranslation();

    const popup = document.getElementById('ews-sl-popup');
    expect(popup.classList.contains('hidden')).toBe(false);
    expect(popup.querySelector('.ews-sl-translated').textContent).toBe('Đây là câu thứ hai để dịch');
  });

  // Regression test for the reported bug: the translation popup used to
  // disappear the instant a student scrolled the page after translating,
  // because the scroll handler called hideAll() (icon AND popup) instead
  // of just hideIcon(). Both elements are `position: fixed` in
  // sentence-lookup.css, so they already stay correctly anchored on
  // screen during scroll — nothing needed to be hidden for that reason.
  test('scrolling after a translation keeps the popup open (only the icon hides)', async () => {
    mockTranslateFetch('Đây là câu thứ ba để dịch');
    await selectAndShowIcon('this is the third sentence to translate');
    await clickIconAndAwaitTranslation();

    expect(document.getElementById('ews-sl-popup').classList.contains('hidden')).toBe(false);

    window.dispatchEvent(new window.Event('scroll'));

    expect(document.getElementById('ews-sl-popup').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('ews-sl-icon').classList.contains('hidden')).toBe(true);
  });

  test('scrolling before the icon is clicked still hides the pending icon', async () => {
    await selectAndShowIcon('this is the fourth sentence selected');
    expect(document.getElementById('ews-sl-icon').classList.contains('hidden')).toBe(false);

    window.dispatchEvent(new window.Event('scroll'));

    expect(document.getElementById('ews-sl-icon').classList.contains('hidden')).toBe(true);
  });

  test('the close button still dismisses an open popup', async () => {
    mockTranslateFetch('Đây là câu thứ năm để dịch');
    await selectAndShowIcon('this is the fifth sentence to translate');
    await clickIconAndAwaitTranslation();

    document.querySelector('.ews-sl-close').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    expect(document.getElementById('ews-sl-popup').classList.contains('hidden')).toBe(true);
  });

  // The owl must not appear during a test / full-mock exam. Every exam
  // screen hides the global nav (nav.js hideTopNav), so a hidden
  // #globalTopNav is treated as "exam active".
  test('a hidden global nav suppresses the owl on selection', async () => {
    const nav = document.createElement('div');
    nav.id = 'globalTopNav';
    nav.style.display = 'none';
    document.body.appendChild(nav);
    try {
      await selectAndShowIcon('this selection happens during an exam screen');
      expect(document.getElementById('ews-sl-icon').classList.contains('hidden')).toBe(true);
    } finally {
      nav.remove();
    }
  });

  test('falls back to MyMemory when the Google endpoint fails', async () => {
    global.fetch = jest.fn((url) => {
      if (String(url).includes('translate.googleapis.com')) {
        return Promise.resolve({ ok: false, json: () => Promise.resolve(null) });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ responseData: { translatedText: 'Bản dịch dự phòng' } }),
      });
    });
    await selectAndShowIcon('this sentence needs the mymemory fallback path');
    await clickIconAndAwaitTranslation();
    await new Promise((r) => setTimeout(r, 0)); // second provider hop

    expect(document.getElementById('ews-sl-popup').querySelector('.ews-sl-translated').textContent)
      .toBe('Bản dịch dự phòng');
  });
});
