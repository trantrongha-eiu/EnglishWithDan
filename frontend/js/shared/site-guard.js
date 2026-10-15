/**
 * shared/site-guard.js — SiteGuard
 *
 * Deterrent layer against casual content copying / page inspection on the
 * public site. Loaded (deferred) right after theme.js on every page.
 *
 * What it does:
 *   - Self-XSS warning in the console ("đừng dán code lạ vào đây").
 *   - Blocks the right-click menu (except inside input/textarea/editable).
 *   - Blocks DevTools / view-source / save-page / print shortcuts
 *     (F12, Ctrl+Shift+I/J/C/K, Ctrl+U, Ctrl+S, Ctrl+P and the ⌘⌥ Mac forms).
 *   - Long copies (> COPY_LIMIT chars) outside editable fields put a notice on
 *     the clipboard instead of the lesson text. Short copies (a word or a
 *     phrase for the dictionary) still work.
 *   - Images can't be dragged out of the page.
 *   - Desktop only: when a DOCKED DevTools panel is opened after the page
 *     loaded (detected by the viewport shrinking while the window itself and
 *     the zoom level stay the same), the page is blurred behind a notice
 *     until it's closed. Printing shows a notice instead of the content.
 *
 * What it does NOT do: this is a speed bump, not real protection. Anything
 * the browser renders can still be read by someone determined (undocked
 * DevTools, disabling JS, a proxy). The real protection is server-side —
 * lesson content requires a login, answers are stripped until submission,
 * and the API is rate-limited / bot-filtered (backend/middleware/botGuard.js).
 *
 * Skipped entirely for admin/teacher accounts and on localhost so staff and
 * development work aren't affected.
 */
(function () {
  'use strict';

  var COPY_LIMIT = 120;
  var GAP_THRESHOLD = 160; // px the viewport must shrink by to count as DevTools

  var host = location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '') return;
  try {
    var u = JSON.parse(localStorage.getItem('user') || 'null');
    if (u && (u.role === 'admin' || u.role === 'teacher')) return;
  } catch (e) { /* malformed — treat as a normal visitor */ }

  // ── Console warning (Self-XSS) ─────────────────────────────
  try {
    console.log('%cDừng lại!', 'color:#e11d48;font:800 42px/1.2 sans-serif;');
    console.log(
      '%cĐây là công cụ dành cho lập trình viên. Nếu ai đó bảo bạn dán đoạn code vào đây ' +
      'để "mở khoá Premium" hay "hack điểm", đó là lừa đảo — họ sẽ chiếm tài khoản của bạn.',
      'font:600 15px/1.5 sans-serif;'
    );
  } catch (e) { /* no console */ }

  function isEditable(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.isContentEditable) return true;
    var tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }

  // ── Right-click ────────────────────────────────────────────
  document.addEventListener('contextmenu', function (e) {
    if (!isEditable(e.target)) e.preventDefault();
  }, true);

  // ── Shortcuts ──────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toUpperCase();
    var mod = e.ctrlKey || e.metaKey;
    var blocked =
      k === 'F12' ||
      (mod && e.shiftKey && (k === 'I' || k === 'J' || k === 'C' || k === 'K')) || // DevTools (Win/Linux)
      (e.metaKey && e.altKey && (k === 'I' || k === 'J' || k === 'C' || k === 'U')) || // DevTools / source (Mac)
      (mod && !e.shiftKey && !e.altKey && (k === 'U' || k === 'S' || k === 'P'));   // source / save / print
    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // ── Copy / cut ─────────────────────────────────────────────
  function onCopy(e) {
    if (isEditable(document.activeElement) || isEditable(e.target)) return;
    var sel = String(window.getSelection ? window.getSelection() : '');
    if (sel.length <= COPY_LIMIT) return;
    if (e.clipboardData) {
      e.clipboardData.setData('text/plain',
        'Nội dung thuộc bản quyền của EnglishWithDan — https://ieltsthayha.com');
      e.preventDefault();
    }
  }
  document.addEventListener('copy', onCopy, true);
  document.addEventListener('cut', onCopy, true);

  // ── Image drag ─────────────────────────────────────────────
  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  }, true);

  // ── Styles: print notice + DevTools lock overlay ───────────
  var style = document.createElement('style');
  style.textContent =
    'img{-webkit-user-drag:none;user-drag:none}' +
    '@media print{body>*{display:none!important}' +
      'body::after{content:"Nội dung thuộc bản quyền của EnglishWithDan.";display:block;' +
      'font:600 18px sans-serif;text-align:center;margin-top:40vh}}' +
    'html.sg-locked body>*:not(#sg-lock){filter:blur(14px)!important;pointer-events:none!important;user-select:none!important}' +
    '#sg-lock{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;' +
      'background:rgba(15,18,28,.55);font-family:inherit}' +
    'html.sg-locked #sg-lock{display:flex}' +
    '#sg-lock .sg-card{background:#1e2330;color:#fff;border-radius:16px;padding:22px 26px;max-width:360px;width:88%;' +
      'text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5)}' +
    '#sg-lock .sg-title{font:800 18px/1.3 inherit;margin-bottom:8px}' +
    '#sg-lock .sg-hint{color:#9ca3af;font:600 13px/1.5 inherit}';
  (document.head || document.documentElement).appendChild(style);

  // ── DevTools (docked) detection — desktop, top-level window only ──
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (!finePointer || window.top !== window.self) return;

  var lockEl = null;
  function setLocked(on) {
    var root = document.documentElement;
    if (on === root.classList.contains('sg-locked')) return;
    if (on && !lockEl && document.body) {
      lockEl = document.createElement('div');
      lockEl.id = 'sg-lock';
      lockEl.innerHTML =
        '<div class="sg-card"><div class="sg-title">Vui lòng đóng DevTools 🙏</div>' +
        '<div class="sg-hint">Nội dung bài học được bảo vệ. Đóng cửa sổ công cụ ' +
        'nhà phát triển để tiếp tục học nhé.</div></div>';
      document.body.appendChild(lockEl);
    }
    root.classList.toggle('sg-locked', on);
  }

  var base = null;
  function snapshot() {
    return {
      gw: window.outerWidth - window.innerWidth,
      gh: window.outerHeight - window.innerHeight,
      ow: window.outerWidth,
      oh: window.outerHeight,
      dpr: window.devicePixelRatio
    };
  }
  function check() {
    var now = snapshot();
    // Window resized, maximised, fullscreened or zoomed — none of those are
    // DevTools, so take a fresh baseline instead of guessing.
    if (!base || now.dpr !== base.dpr ||
        Math.abs(now.ow - base.ow) > 8 || Math.abs(now.oh - base.oh) > 8) {
      base = now;
      setLocked(false);
      return;
    }
    setLocked(now.gw - base.gw > GAP_THRESHOLD || now.gh - base.gh > GAP_THRESHOLD);
  }
  check();
  window.addEventListener('resize', check);
  setInterval(check, 1000);
})();
