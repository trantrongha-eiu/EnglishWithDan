/**
 * shared/badge-popup.js — real-time "🎉 Huy hiệu mới!" celebration popup,
 * fired the moment a badge (constants/badges.js on the backend) is newly
 * unlocked. Self-contained (own injected CSS, own IIFE) so it can be
 * loaded on any page that can trigger a badge — Reading/Listening/
 * Writing/Speaking submit, Vocab practice, and profile.html's own badge
 * fetch (which covers badges earned passively, e.g. a teacher confirming
 * a Writing grade, surfaced the next time the student is back on the site).
 *
 * Host page calls window.showBadgeUnlocked(badges) after any API response
 * whose body includes a non-empty `newlyUnlocked` array — see each
 * endpoint's own response (submitTest/submitExam/submitPractice/
 * saveAttempt/recordPracticeResult/updateWord/completePractice, and
 * GET /api/badges). `badges` is an array of {id, name, description, icon}
 * (extra fields like category/tier are ignored here).
 */
(function () {
  'use strict';

  function _injectStyles() {
    if (document.getElementById('bp-styles')) return;
    var s = document.createElement('style');
    s.id = 'bp-styles';
    s.textContent =
      '#bp-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:var(--z-modal,1000);display:none;align-items:center;justify-content:center;padding:16px}' +
      '#bp-backdrop.open{display:flex}' +
      '.bp-card{background:var(--surface,#fff);border-radius:20px;max-width:360px;width:100%;padding:32px 26px 26px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.35);animation:bp-pop .35s cubic-bezier(.34,1.56,.64,1)}' +
      '@keyframes bp-pop{from{transform:scale(.75);opacity:0}to{transform:scale(1);opacity:1}}' +
      '.bp-label{font-size:12.5px;font-weight:800;color:var(--blue,#3d8bff);letter-spacing:.03em;text-transform:uppercase;margin-bottom:10px}' +
      '.bp-icon{font-size:56px;line-height:1;margin-bottom:14px;animation:bp-bounce 1.1s ease infinite}' +
      '@keyframes bp-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}' +
      '.bp-name{font-weight:800;font-size:19px;color:var(--text,#111827);margin-bottom:6px}' +
      '.bp-desc{font-size:13.5px;color:var(--text2,#374151);line-height:1.5;margin-bottom:22px}' +
      '.bp-btn{width:100%;padding:12px;border:none;border-radius:10px;background:var(--blue,#3d8bff);color:#fff;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit}' +
      '.bp-btn:hover{background:var(--blue-dark,#2c78f0)}' +
      '.bp-progress{margin-top:10px;font-size:11.5px;color:var(--text3,#9ca3af)}';
    document.head.appendChild(s);
  }

  var _queue = []; // arrays of badges from separate showBadgeUnlocked() calls, flattened lazily
  var _showing = false;

  function showBadgeUnlocked(badges) {
    if (!Array.isArray(badges) || !badges.length) return;
    _queue.push.apply(_queue, badges);
    if (!_showing) _showNext();
  }

  function _showNext() {
    if (!_queue.length) { _showing = false; _close(); return; }
    _showing = true;
    _injectStyles();
    var badge = _queue.shift();
    var remaining = _queue.length;

    var backdrop = document.getElementById('bp-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'bp-backdrop';
      document.body.appendChild(backdrop);
    }
    backdrop.innerHTML =
      '<div class="bp-card">' +
        '<div class="bp-label">🎉 Huy hiệu mới!</div>' +
        '<div class="bp-icon">' + (badge.icon || '🏅') + '</div>' +
        '<div class="bp-name">' + escHtml(badge.name || '') + '</div>' +
        '<div class="bp-desc">' + escHtml(badge.description || '') + '</div>' +
        '<button class="bp-btn" id="bp-next-btn">' + (remaining > 0 ? 'Tiếp theo' : 'Tuyệt vời!') + '</button>' +
        (remaining > 0 ? '<div class="bp-progress">Còn ' + remaining + ' huy hiệu khác</div>' : '') +
      '</div>';
    backdrop.classList.add('open');
    document.getElementById('bp-next-btn').addEventListener('click', _showNext);
    if (window.playOk) { try { window.playOk(); } catch (e) {} }
  }

  function _close() {
    var backdrop = document.getElementById('bp-backdrop');
    if (backdrop) backdrop.classList.remove('open');
  }

  // Minimal, dependency-free HTML escape — same behavior as the escHtml()
  // every host page already defines globally (js/shared/utils.js), but
  // this file must not assume load order, so it carries its own fallback.
  function escHtml(s) {
    if (window.escHtml) return window.escHtml(s);
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  window.showBadgeUnlocked = showBadgeUnlocked;
})();
