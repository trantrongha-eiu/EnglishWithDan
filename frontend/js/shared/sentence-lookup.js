/**
 * shared/sentence-lookup.js — "tra câu" floating icon: site-wide sentence
 * translation, inspired by tracau.vn / mochimochi's select-text-and-click
 * a cute floating icon flow.
 *
 * Deliberately the COMPLEMENT of js/shared/dictionary-lookup.js's
 * double-click/drag-select word popup, not a replacement for it: that
 * system already owns selections of <=3 words (returns '' and does
 * nothing above that threshold — see its _extractDoubleClickedWord /
 * _extractDragSelectedPhrase). This file only reacts to selections of
 * MORE than 3 words, so the two features are mutually exclusive by
 * word count and never show two popups for the same selection.
 *
 * Self-contained on purpose (no dependency on window.escHtml / showToast /
 * AuthService): loaded by nav.js via a dynamically-injected <script> tag,
 * so load order relative to other shared modules on the host page isn't
 * guaranteed.
 */
(function () {
  'use strict';

  var TEXT_INPUT_TYPES = { text: 1, search: 1, url: 1, tel: 1, password: 1 };
  var MAX_LEN = 600;

  var icon = null, popup = null;
  var _pendingText = '';
  var _cache = new Map();
  var _seq = 0;

  function ensureDom() {
    if (icon) return;
    icon = document.createElement('div');
    icon.id = 'ews-sl-icon';
    icon.className = 'ews-sl-icon hidden';
    icon.title = 'Dịch câu này';
    icon.textContent = '🦉';
    document.body.appendChild(icon);

    popup = document.createElement('div');
    popup.id = 'ews-sl-popup';
    popup.className = 'ews-sl-popup hidden';
    popup.innerHTML =
      '<div class="ews-sl-header">' +
        '<span class="ews-sl-badge">🦉 Tra câu</span>' +
        '<button class="ews-sl-close" type="button" aria-label="Đóng">&times;</button>' +
      '</div>' +
      '<div class="ews-sl-original"></div>' +
      '<div class="ews-sl-divider"><i class="fas fa-arrow-down"></i></div>' +
      '<div class="ews-sl-body-result"></div>' +
      '<div class="ews-sl-actions">' +
        '<button type="button" class="ews-sl-btn ews-sl-speak"><i class="fas fa-volume-up"></i> Nghe</button>' +
        '<button type="button" class="ews-sl-btn ews-sl-copy"><i class="fas fa-copy"></i> Copy</button>' +
      '</div>';
    document.body.appendChild(popup);

    popup.querySelector('.ews-sl-close').addEventListener('click', hideAll);
    popup.querySelector('.ews-sl-speak').addEventListener('click', speakOriginal);
    popup.querySelector('.ews-sl-copy').addEventListener('click', copyTranslation);
    icon.addEventListener('click', onIconClick);
  }

  function extractSelectedText(target) {
    if (target && target.tagName === 'TEXTAREA') {
      var s = target.selectionStart, e = target.selectionEnd;
      if (s == null || e == null || s === e) return '';
      return target.value.substring(s, e);
    }
    if (target && target.tagName === 'INPUT' && TEXT_INPUT_TYPES[target.type]) {
      var s2 = target.selectionStart, e2 = target.selectionEnd;
      if (s2 == null || e2 == null || s2 === e2) return '';
      return target.value.substring(s2, e2);
    }
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return '';
    return sel.toString();
  }

  function qualifies(text) {
    var words = text.trim().split(/\s+/).filter(Boolean);
    return words.length > 3 && text.length <= MAX_LEN;
  }

  // Reading/Listening/Writing/Speaking each already gate their own
  // double-click word-lookup (dictionary-lookup.js's setupDictionaryDouble
  // `gate` param) behind "is this a live timed exam attempt, not practice/
  // review" — a different local variable per page (state.isReview,
  // _examMode, state.seqIsFullMock, ...), no single global flag exists.
  // Rather than duplicating each page's exam-detection logic here, every
  // exam/full-mock screen sets window.__ewsExamActive to a function
  // returning true while that screen is live; read lazily (not at load
  // time) so it works regardless of script-load order between nav.js's
  // dynamically-injected <script> tag and each page's own inline script.
  function isExamActive() {
    try {
      if (window.__ewsExamActive && window.__ewsExamActive()) return true;
      // Belt-and-suspenders: every test / full-mock exam screen hides the
      // global nav (nav.js hideTopNav()). Treat that as "exam active" too,
      // so the owl stays suppressed even on a page whose own
      // __ewsExamActive flag has a gap or isn't set at all.
      var nav = document.getElementById('globalTopNav');
      if (nav && nav.style.display === 'none') return true;
    } catch (e) {}
    return false;
  }

  function eventCoords(e) {
    if (e.changedTouches && e.changedTouches.length) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function selectionRect() {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    try {
      var rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect && (rect.width || rect.height)) return rect;
    } catch (err) {}
    return null;
  }

  function positionEl(el, x, y, w, h) {
    el.style.left = Math.max(6, Math.min(x, window.innerWidth - w - 6)) + 'px';
    el.style.top = Math.max(6, Math.min(y, window.innerHeight - h - 6)) + 'px';
  }

  function showIcon(x, y) {
    ensureDom();
    positionEl(icon, x, y, 38, 38);
    icon.classList.remove('hidden');
  }

  function hideIcon() {
    if (icon) icon.classList.add('hidden');
  }

  function hidePopup() {
    if (popup) popup.classList.add('hidden');
  }

  function hideAll() {
    hideIcon();
    hidePopup();
  }

  function onDocMouseDown(e) {
    if (icon && icon.contains(e.target)) return;
    if (popup && popup.contains(e.target)) return;
    hideAll();
  }

  function onSelectionEnd(e) {
    if (icon && icon.contains(e.target)) return;
    if (popup && popup.contains(e.target)) return;
    var target = e.target;
    setTimeout(function () {
      if (isExamActive()) { hideAll(); return; }
      var text = extractSelectedText(target);
      if (!qualifies(text)) { hideIcon(); return; }
      _pendingText = text.trim();
      var rect = (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') ? null : selectionRect();
      var coords = eventCoords(e);
      var x = rect ? rect.right : coords.x;
      var y = rect ? rect.bottom + 8 : coords.y + 8;
      showIcon(x, y);
    }, 0);
  }

  function onIconClick() {
    if (isExamActive()) { hideAll(); return; }
    var text = _pendingText;
    if (!text) return;
    var rect = icon.getBoundingClientRect();
    hideIcon();
    positionEl(popup, rect.left, rect.bottom + 6, 300, 220);
    popup.classList.remove('hidden');
    renderOriginal(text);
    var resultEl = popup.querySelector('.ews-sl-body-result');
    var key = text.toLowerCase();
    if (_cache.has(key)) { renderResult(_cache.get(key)); return; }
    resultEl.innerHTML = '<div class="ews-sl-loading">Đang dịch...</div>';
    var requestId = ++_seq;
    translateText(text).then(function (translated) {
      if (requestId !== _seq) return;
      _cache.set(key, translated);
      renderResult(translated);
    }).catch(function () {
      if (requestId !== _seq) return;
      resultEl.innerHTML = '<div class="ews-sl-error">Không dịch được, vui lòng thử lại.</div>' +
        '<button type="button" class="ews-sl-retry">Thử lại</button>';
      var retryBtn = resultEl.querySelector('.ews-sl-retry');
      if (retryBtn) retryBtn.addEventListener('click', function () { onIconClick(); });
    });
  }

  function renderOriginal(text) {
    popup.querySelector('.ews-sl-original').textContent = '"' + text + '"';
    var copyBtn = popup.querySelector('.ews-sl-copy');
    copyBtn.classList.remove('copied');
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
  }

  function renderResult(translated) {
    var resultEl = popup.querySelector('.ews-sl-body-result');
    resultEl.innerHTML = '<div class="ews-sl-translated"></div>';
    resultEl.querySelector('.ews-sl-translated').textContent = translated || 'Không tìm thấy bản dịch';
  }

  // Plain fetch() never times out — a silently-dropped connection (CORS
  // block, captive portal) would leave the popup stuck on "Đang dịch..."
  // forever. Abort after `ms` so it always settles.
  function fetchWithTimeout(url, ms) {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, ms);
    return fetch(url, { signal: ctrl.signal }).finally(function () { clearTimeout(t); });
  }

  function translateViaGoogle(text) {
    var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + encodeURIComponent(text);
    return fetchWithTimeout(url, 7000).then(function (r) {
      if (!r.ok) throw new Error('google translate failed');
      return r.json();
    }).then(function (data) {
      var segments = (data && data[0]) || [];
      var out = segments.map(function (seg) { return seg[0] || ''; }).join('').trim();
      if (!out) throw new Error('google translate empty');
      return out;
    });
  }

  function translateViaMyMemory(text) {
    var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=en|vi';
    return fetchWithTimeout(url, 7000).then(function (r) {
      if (!r.ok) throw new Error('mymemory failed');
      return r.json();
    }).then(function (data) {
      var out = (data && data.responseData && data.responseData.translatedText || '').trim();
      if (!out || /^please\s|invalid|mymemory warning/i.test(out)) throw new Error('mymemory unusable');
      return out;
    });
  }

  // Google's unofficial endpoint is the primary (better VI quality); fall
  // back to MyMemory so a rate-limit / block on one provider doesn't leave
  // the student with nothing.
  function translateText(text) {
    return translateViaGoogle(text).catch(function () { return translateViaMyMemory(text); });
  }

  function speakOriginal() {
    if (!_pendingText || !window.speechSynthesis) return;
    var u = new SpeechSynthesisUtterance(_pendingText);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(ta);
  }

  function copyTranslation() {
    var translatedEl = popup.querySelector('.ews-sl-translated');
    var text = translatedEl ? translatedEl.textContent : '';
    if (!text) return;
    var markCopied = function () {
      var btn = popup.querySelector('.ews-sl-copy');
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fas fa-check"></i> Đã copy';
      setTimeout(function () {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
      }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(markCopied).catch(function () {
        fallbackCopy(text);
        markCopied();
      });
    } else {
      fallbackCopy(text);
      markCopied();
    }
  }

  function init() {
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('mouseup', onSelectionEnd);
    document.addEventListener('touchend', onSelectionEnd);
    // Only the icon (pre-click, tied to a transient selection) hides on
    // scroll — the popup (post-click, showing the actual translation)
    // must NOT: both are `position: fixed` (sentence-lookup.css), so they
    // already stay put on screen correctly while the page scrolls under
    // them. Hiding the popup here made the translation vanish the instant
    // a student scrolled to keep reading, which defeats the point of
    // having it open. hideAll() (both) is still used elsewhere for actual
    // dismissal: click-outside, Escape, a new exam starting.
    window.addEventListener('scroll', hideIcon, { passive: true, capture: true });
    window.addEventListener('resize', hideAll);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideAll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
