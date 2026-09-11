/**
 * shared/paste-guard.js — PasteGuard
 *
 * Blocks pasting/dragging text into a free-answer textarea (Writing Task 1/2
 * exam + practice, the "Viết lại" rewrite box, Speaking's transcript boxes)
 * and shows a local meme (img/meme_prevent_paste.jpg) + a joking caption
 * instead of a plain toast — same idea across every site, one place to
 * change the wording/image/timing. Not for drill-mechanic paste blocking
 * (e.g. word-by-word typing drills, dictation) — those intentionally stay
 * silent (no meme) since pasting there breaks the exercise itself rather
 * than being an anti-cheat concern.
 *
 * Usage: PasteGuard.attach(el, { hint: 'hãy tự gõ bài viết của bạn' })
 */
(function () {
  'use strict';

  var MEME_SRC = 'img/meme_prevent_paste.jpg';
  var AUTO_HIDE_MS = 3200;
  var DEFAULT_HINT = 'tự gõ bài của bạn thôi nha!';
  var _hideTimer = null;

  function _ensurePopup() {
    var el = document.getElementById('paste-guard-popup');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'paste-guard-popup';
    el.innerHTML =
      '<div class="pg-card">' +
        '<img class="pg-meme" src="' + MEME_SRC + '" alt="">' +
        '<div class="pg-title">Tính lười biếng hảaa 😏</div>' +
        '<div class="pg-hint"></div>' +
      '</div>';
    document.body.appendChild(el);
    if (!document.getElementById('paste-guard-style')) {
      var s = document.createElement('style');
      s.id = 'paste-guard-style';
      s.textContent =
        '#paste-guard-popup{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;' +
        'background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:opacity .18s ease}' +
        '#paste-guard-popup.show{opacity:1}' +
        '#paste-guard-popup .pg-card{background:#1e2330;border-radius:16px;padding:16px 20px 22px;max-width:320px;width:88%;' +
        'text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:pgPop .28s cubic-bezier(.34,1.56,.64,1)}' +
        '#paste-guard-popup .pg-meme{width:100%;border-radius:10px;display:block;margin-bottom:14px}' +
        '#paste-guard-popup .pg-title{color:#fff;font:800 17px/1.3 inherit;margin-bottom:6px}' +
        '#paste-guard-popup .pg-hint{color:#9ca3af;font:600 13px/1.45 inherit}' +
        '@keyframes pgPop{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}';
      document.head.appendChild(s);
    }
    return el;
  }

  // Keeps the popup inside whatever element is currently fullscreen (exam
  // pages run their exam screen in the Fullscreen API) — a plain
  // document.body child is invisible while that's active, same reasoning as
  // every other overlay in the app (mock-test.js's proctor badge, listening/
  // reading's submit overlays, etc.).
  function show(hint) {
    var el = _ensurePopup();
    var root = document.fullscreenElement || document.body;
    if (el.parentNode !== root) root.appendChild(el);
    el.querySelector('.pg-hint').textContent = hint || DEFAULT_HINT;
    el.classList.add('show');
    clearTimeout(_hideTimer);
    _hideTimer = setTimeout(function () { el.classList.remove('show'); }, AUTO_HIDE_MS);
  }

  function attach(el, opts) {
    if (!el || el.dataset.pasteGuarded) return;
    el.dataset.pasteGuarded = '1';
    var hint = (opts && opts.hint) || DEFAULT_HINT;
    el.addEventListener('paste', function (e) { e.preventDefault(); show(hint); });
    el.addEventListener('drop', function (e) { e.preventDefault(); show(hint); });
    el.addEventListener('dragover', function (e) { e.preventDefault(); });
  }

  window.PasteGuard = { attach: attach, show: show };
})();
