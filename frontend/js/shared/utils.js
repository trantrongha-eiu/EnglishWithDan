/**
 * shared/utils.js — shared helper functions
 *
 * escapeHtml consolidates 7 near-identical reimplementations found in
 * listening.html, task2-template.html (x2: escHtml + escAttr),
 * speaking.js, writing.js, reading-v2.js (x2: escHtml + escHtmlNl),
 * inbox.js (esc). All 7 were functionally the same (escape &, <, >, ")
 * modulo minor null-handling differences; the most complete version
 * (quote-escaping included) was chosen as canonical so no caller loses
 * any protection it previously had.
 *
 * Back-compat aliases (escHtml, esc, escAttr, escHtmlNl) are kept under
 * their original names so no call site needed to change.
 */
(function () {
  'use strict';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // For attribute contexts specifically (single + double quotes only,
  // matching task2-template.html's original escAttr).
  function escapeAttr(str) {
    return String(str == null ? '' : str)
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;');
  }

  // escapeHtml + convert newlines to <br> (matching reading-v2.js's
  // original escHtmlNl, used for multi-line explanation text).
  function escapeHtmlNl(str) {
    return escapeHtml(str).replace(/\n/g, '<br>');
  }

  window.escapeHtml = escapeHtml;
  window.escHtml    = escapeHtml;   // alias: listening.html, task2-template.html, speaking.js, writing.js, reading-v2.js
  window.esc        = escapeHtml;   // alias: inbox.js
  window.escAttr    = escapeAttr;   // alias: task2-template.html
  window.escHtmlNl  = escapeHtmlNl; // alias: reading-v2.js

  /**
   * debounce(fn, wait) — standard trailing-edge debounce.
   * Extracted from the ad hoc setTimeout/clearTimeout pattern duplicated
   * in dashboard.js (book reorder autosave) and several search inputs;
   * not yet wired into those call sites in this pass (see migration
   * notes) but available for the next incremental cleanup.
   */
  window.debounce = function (fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  };
})();
