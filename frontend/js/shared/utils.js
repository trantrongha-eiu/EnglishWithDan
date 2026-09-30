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

  /**
   * fmtMMSS(totalSeconds) — "m:ss" with zero-padded seconds, "mm" minutes
   * also zero-padded. Consolidates task2-template.html's fmtTime() (didn't
   * pad minutes) and task2-practice.html's _fmtExamTime() (padded both) —
   * the more complete behavior (both padded) was kept as canonical, same
   * precedent as escapeHtml above (student UI audit, Nhóm 2, 2026-07-25).
   */
  window.fmtMMSS = function (totalSeconds) {
    var s = Math.max(0, Math.floor(totalSeconds));
    var m = Math.floor(s / 60);
    var rem = s % 60;
    return String(m).padStart(2, '0') + ':' + String(rem).padStart(2, '0');
  };

  /**
   * scopeEmbeddedHtml(html) — admin-authored question HTML is sometimes a
   * whole pasted document (<!DOCTYPE>, <head>, <style> body{…} ul li::before{…}).
   * Injected as-is, those rules restyle the entire page. Returns the markup
   * wrapped in a unique container with document-level tags dropped and every
   * <style> selector prefixed by that container (body/html map to it).
   * Markup without <style>/<html> is returned unchanged.
   */
  var _scopeSeq = 0;
  function scopeCss(css, scope) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/([^{}]+)\{([^{}]*)\}/g, function (_, selectors, body) {
        var sel = selectors.split(',').map(function (s) {
          s = s.trim();
          if (!s) return '';
          if (/^(html|body|:root)$/i.test(s)) return scope;
          return scope + ' ' + s.replace(/^(html|body)\s+/i, '');
        }).filter(Boolean).join(', ');
        return sel ? sel + '{' + body + '}' : '';
      });
  }
  window.scopeEmbeddedHtml = function (html) {
    html = String(html == null ? '' : html);
    if (!/<style[\s>]|<html[\s>]|<!doctype/i.test(html)) return html;
    var scope = 'emb-scope-' + (++_scopeSeq);
    var styles = [];
    var body = html
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, function (_, css) { styles.push(scopeCss(css, '.' + scope)); return ''; })
      .replace(/<!doctype[^>]*>/gi, '')
      .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
      .replace(/<\/?(html|head|body|meta)[^>]*>/gi, '');
    return '<div class="' + scope + '">' + (styles.length ? '<style>' + styles.join('\n') + '</style>' : '') + body + '</div>';
  };
})();
