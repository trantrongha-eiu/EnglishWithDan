/**
 * js/shared/cd-footer.js — computer-delivered-IELTS style question navigator
 *
 * The bottom bar of the real computer-based test (and theieltsdictionary's
 * copy of it): one block per Part. The active Part is expanded into its
 * numbered question buttons (with a thin "answered" bar above each), the
 * other Parts collapse to "Part 2  3 of 10". Prev / next arrows walk the
 * questions one by one and "Submit Test" submits.
 *
 * Shared by listening.html and js/reading-v2.js: the full-test exam screen
 * and the single-section practice ("bài lẻ") screens, one mounted at a time.
 * Each page owns its own state — this module only renders and forwards
 * clicks, so the page's existing answer / part-switch logic stays the
 * single source of truth:
 *
 *   CDFooter.mount(containerEl, {
 *     parts: [{ label: 'Part 1', questions: [1, 2, ...] }, ...],
 *     btnId: n => 'qnav-' + n,         // keeps the page's existing ids so its
 *                                      // own "answered" toggling keeps working
 *     isAnswered: n => bool,
 *     onJump: n => {},                 // go to question n (switching part if needed)
 *     onSubmit: () => {},
 *     submitLabel: 'Submit Test',      // optional
 *   });
 *   CDFooter.setActivePart(i)   // page switched part by other means
 *   CDFooter.setCurrent(n)      // student focused question n
 *   CDFooter.refresh()          // answers changed → recount "x of 10"
 */
(function () {
  'use strict';

  var cfg = null;
  var root = null;
  var activePart = 0;
  var current = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function partOf(n) {
    if (!cfg) return -1;
    for (var i = 0; i < cfg.parts.length; i++) {
      if (cfg.parts[i].questions.indexOf(n) !== -1) return i;
    }
    return -1;
  }

  function allQuestions() {
    return cfg ? cfg.parts.reduce(function (a, p) { return a.concat(p.questions); }, []) : [];
  }

  function render() {
    if (!root || !cfg) return;
    var html = '<div class="cdf-parts" role="navigation" aria-label="Câu hỏi">';
    cfg.parts.forEach(function (p, i) {
      var btns = p.questions.map(function (n) {
        return '<button type="button" class="q-nav-btn cdf-q" id="' + esc(cfg.btnId(n)) + '" data-q="' + n + '">' + n + '</button>';
      }).join('');
      html += '<div class="cdf-part' + (i === activePart ? ' is-active' : '') + '" data-part="' + i + '">' +
        '<button type="button" class="cdf-part-label" data-part-btn="' + i + '">' +
          '<span class="cdf-part-name">' + esc(p.label) + '</span>' +
          '<span class="cdf-part-count"></span>' +
        '</button>' +
        '<div class="cdf-nums">' + btns + '</div>' +
      '</div>';
    });
    // Prev/next float just above the bar's right end (over the questions
    // column), the way the real test draws them; Submit sits in the bar.
    html += '</div>' +
      '<div class="cdf-float">' +
        '<button type="button" class="cdf-arrow cdf-prev" aria-label="Câu trước" title="Câu trước"><i class="fas fa-arrow-left"></i></button>' +
        '<button type="button" class="cdf-arrow cdf-next" aria-label="Câu tiếp" title="Câu tiếp"><i class="fas fa-arrow-right"></i></button>' +
      '</div>' +
      '<div class="cdf-actions">' +
        '<button type="button" class="cdf-submit">' + esc(cfg.submitLabel) + '</button>' +
      '</div>';
    root.innerHTML = html;
    refresh();
  }

  function refresh() {
    if (!root || !cfg) return;
    cfg.parts.forEach(function (p, i) {
      var done = 0;
      p.questions.forEach(function (n) {
        var ok = !!cfg.isAnswered(n);
        if (ok) done++;
        var b = document.getElementById(cfg.btnId(n));
        if (b) {
          b.classList.toggle('answered', ok);
          b.classList.toggle('current', n === current);
        }
      });
      var partEl = root.querySelector('.cdf-part[data-part="' + i + '"]');
      if (!partEl) return;
      partEl.classList.toggle('is-active', i === activePart);
      var c = partEl.querySelector('.cdf-part-count');
      if (c) c.textContent = done + ' of ' + p.questions.length;
    });
    var qs = allQuestions();
    var idx = qs.indexOf(current);
    var prev = root.querySelector('.cdf-prev');
    var next = root.querySelector('.cdf-next');
    if (prev) prev.disabled = idx <= 0;
    if (next) next.disabled = idx === -1 ? !qs.length : idx >= qs.length - 1;
  }

  function jump(n) {
    if (!cfg || n == null) return;
    current = n;
    var p = partOf(n);
    if (p !== -1) activePart = p;
    refresh();
    cfg.onJump(n);
  }

  function onClick(e) {
    var q = e.target.closest('[data-q]');
    if (q) { jump(parseInt(q.getAttribute('data-q'), 10)); return; }
    var pb = e.target.closest('[data-part-btn]');
    if (pb) {
      var i = parseInt(pb.getAttribute('data-part-btn'), 10);
      var first = cfg.parts[i] && cfg.parts[i].questions[0];
      if (first != null) jump(first);
      return;
    }
    var qs = allQuestions();
    var idx = qs.indexOf(current);
    if (e.target.closest('.cdf-prev')) { if (idx > 0) jump(qs[idx - 1]); return; }
    if (e.target.closest('.cdf-next')) { jump(qs[idx < 0 ? 0 : Math.min(qs.length - 1, idx + 1)]); return; }
    if (e.target.closest('.cdf-submit')) { cfg.onSubmit(); }
  }

  window.CDFooter = {
    mount: function (el, options) {
      if (!el) return;
      if (root && root !== el) root.removeEventListener('click', onClick);
      if (root !== el) el.addEventListener('click', onClick);
      root = el;
      root.classList.add('cd-footer');
      cfg = {
        parts: (options.parts || []).filter(function (p) { return p.questions && p.questions.length; }),
        btnId: options.btnId || function (n) { return 'cdq-' + n; },
        isAnswered: options.isAnswered || function () { return false; },
        onJump: options.onJump || function () {},
        onSubmit: options.onSubmit || function () {},
        submitLabel: options.submitLabel || 'Submit Test',
      };
      activePart = Math.max(0, Math.min(options.activePart || 0, cfg.parts.length - 1));
      current = cfg.parts[activePart] ? cfg.parts[activePart].questions[0] : null;
      render();
    },
    setActivePart: function (i) {
      if (!cfg || i === activePart || !cfg.parts[i]) return;
      activePart = i;
      if (partOf(current) !== i) current = cfg.parts[i].questions[0];
      refresh();
    },
    setCurrent: function (n) {
      if (!cfg || partOf(n) === -1 || n === current) return;
      current = n;
      activePart = partOf(n);
      refresh();
    },
    refresh: refresh,
    isMounted: function () { return !!(root && cfg && root.isConnected); },
  };
})();
