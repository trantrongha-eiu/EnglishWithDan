/**
 * shared/toast.js — ToastService
 *
 * Single source of truth for toast notifications, replacing 13 independent
 * implementations found across dashboard.js, listening.html, writing.js,
 * speaking.js, reading-v2.js, inbox.js(none), login.html, register.html,
 * profile.html, tuition.html, writing-practice.html, task1-practice.html,
 * task2-practice.html and task2-template.html.
 *
 * Visual output uses css/components.css's .toast/.toast-container/
 * .toast-icon/.toast-title/.toast-body/.toast-msg classes (built in Phase 2)
 * — the page must load tokens.css + components.css for this to render
 * correctly.
 *
 * Four global entry points are exposed so every existing call site keeps
 * working with ZERO argument-order changes — only 4 files needed a
 * function-NAME rename (showToast -> showToastWithTitle), a mechanical,
 * low-risk change documented in the Phase 3 migration notes.
 */
(function () {
  'use strict';

  var HIDE_ANIMATION_MS = 300;   // must match .toast.hiding's CSS transition duration
  var DEFAULT_DURATION_MS = 3500; // showToast()
  var SHORT_DURATION_MS   = 3000; // toast() / showVocabToast()
  var TITLED_DURATION_MS  = 4000; // showToastWithTitle()

  var ICONS = {
    success: 'fa-circle-check',
    error:   'fa-circle-exclamation',
    warning: 'fa-triangle-exclamation',
    warn:    'fa-triangle-exclamation',
    info:    'fa-circle-info',
    banned:  'fa-ban'
  };

  // While a page has a scoped element in fullscreen (not document.
  // documentElement — e.g. writing.js's #screen-exam, dashboard.js's
  // #view-unit), anything appended to document.body renders invisible:
  // only the fullscreen element's own subtree is painted. Keep the toast
  // container inside whichever is currently active.
  function container() {
    var target = document.fullscreenElement || document.body;
    var c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.className = 'toast-container';
      target.appendChild(c);
    } else if (c.parentNode !== target) {
      target.appendChild(c); // re-parenting an existing node moves it
    }
    return c;
  }
  document.addEventListener('fullscreenchange', function () {
    var c = document.getElementById('toast-container');
    if (c) container(); // no-op if already in the right place
  });

  function render(type, title, message, duration) {
    var icon = ICONS[type] || ICONS.info;
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML =
      '<i class="fas ' + icon + ' toast-icon"></i>' +
      '<div class="toast-body">' +
      (title ? '<div class="toast-title"></div>' : '') +
      '<div class="toast-msg"></div></div>';
    // Set text via textContent (not innerHTML) so caller-supplied strings
    // can never be interpreted as markup — closes an XSS gap none of the
    // 13 original implementations consistently guarded against.
    if (title) el.querySelector('.toast-title').textContent = title;
    el.querySelector('.toast-msg').textContent = message;
    container().appendChild(el);
    if (duration > 0) {
      setTimeout(function () {
        el.classList.add('hiding');
        setTimeout(function () { el.remove(); }, HIDE_ANIMATION_MS);
      }, duration);
    }
    return el;
  }

  // Canonical signature — matches the majority of existing call sites:
  // showToast(message, type = 'info', duration = DEFAULT_DURATION_MS)
  window.showToast = function (message, type, duration) {
    return render(type || 'info', null, message, duration == null ? DEFAULT_DURATION_MS : duration);
  };

  // Alias matching dashboard.js / listening.html's old convention:
  // toast(message, type = 'success')
  window.toast = function (message, type) {
    return render(type || 'success', null, message, SHORT_DURATION_MS);
  };

  // Alias matching reading-v2.js's old name for the same convention.
  window.showVocabToast = function (message, type) {
    return render(type || 'success', null, message, SHORT_DURATION_MS);
  };

  // Alias matching login.html / register.html / profile.html / tuition.html's
  // old convention: showToast(type, title, message, duration). Kept under a
  // different name (not "showToast") since the argument order is
  // incompatible with the canonical signature above — renaming the 4 call
  // sites was the safe way to migrate them (see migration notes).
  window.showToastWithTitle = function (type, title, message, duration) {
    return render(type || 'info', title, message, duration == null ? TITLED_DURATION_MS : duration);
  };
})();
