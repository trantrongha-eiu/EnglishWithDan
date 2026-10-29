/**
 * shared/question-notes.js — a student's own notes, right at the questions.
 *
 * Reading and Listening render a small "Ghi chú" box under every question
 * group (Questions 1–5, 6–10, …). The note is a scratch pad: ideas, key
 * words, paraphrases spotted in the passage/audio. It is never graded and
 * never leaves this browser (localStorage, per user).
 *
 *   html += QuestionNotes.html('reading', group);
 *
 * The note's key is built from the group's own content (question numbers,
 * instruction, prompts), not from a test/attempt id, so the same group shows
 * the same note while taking the test, in review, in a retry and in
 * per-part practice. Every render path just emits the markup: notes are
 * filled in from storage by a MutationObserver, so panels restored from an
 * innerHTML cache (switching parts) get their notes back too.
 */
(function () {
  'use strict';

  var PREFIX = 'qnote:';
  var TEXT_FIELDS = ['questionText', 'question', 'text', 'prompt', 'label'];
  var CONFIG_FIELDS = ['tableConfig', 'noteConfig', 'bulletConfig', 'summaryConfig', 'endingsConfig', 'dragDropConfig', 'headingsConfig', 'mapConfig'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // FNV-1a, 32-bit — short stable key, not security.
  function hash(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h.toString(36);
  }

  function userId() {
    var u = null;
    try { u = window.AuthService ? window.AuthService.getUser() : JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) { /* noop */ }
    return (u && (u._id || u.id || u.username)) || 'anon';
  }

  // Only fields that look the same in the test, the review (which adds
  // userAnswer/isCorrect) and practice (which strips correctAnswer).
  function fingerprint(group) {
    var g = group || {};
    var parts = [g.groupType || '', g.groupTitle || '', g.instruction || '', g.imageUrl || ''];
    CONFIG_FIELDS.forEach(function (f) { if (g[f]) { try { parts.push(JSON.stringify(g[f])); } catch (e) { /* noop */ } } });
    (g.questions || []).forEach(function (q) {
      parts.push(q.questionNumber);
      TEXT_FIELDS.forEach(function (f) { if (typeof q[f] === 'string') parts.push(q[f]); });
      if (Array.isArray(q.options)) parts.push(q.options.join('|'));
    });
    return hash(parts.join('\u0001'));
  }

  function rangeLabel(group) {
    var nums = ((group && group.questions) || []).map(function (q) { return q.questionNumber; })
      .filter(function (n) { return n != null && n !== ''; });
    if (!nums.length) return '';
    var lo = nums[0], hi = nums[nums.length - 1];
    return lo === hi ? ' câu ' + lo : ' câu ' + lo + '–' + hi;
  }

  function storageKey(kind, group) { return kind + ':' + fingerprint(group); }
  function load(key) { try { return localStorage.getItem(PREFIX + userId() + ':' + key) || ''; } catch (e) { return ''; } }
  function save(key, val) {
    try {
      var k = PREFIX + userId() + ':' + key;
      if (val.trim()) localStorage.setItem(k, val); else localStorage.removeItem(k);
    } catch (e) { /* storage full / blocked — the note just isn't kept */ }
  }

  // kind: 'reading' | 'listening'. The textarea starts empty on purpose:
  // its text would otherwise sit in the panel's DOM text and could shift
  // highlight offsets; the value is set by hydrate().
  function html(kind, group) {
    var key = storageKey(kind, group);
    return '<div class="qnote" data-qnote="' + esc(key) + '">' +
      '<button type="button" class="qnote-toggle" aria-expanded="false">' +
        '<i class="fas fa-pen-to-square"></i> <span class="qnote-label">Ghi chú' + esc(rangeLabel(group)) + '</span>' +
        '<span class="qnote-has" hidden>●</span>' +
      '</button>' +
      '<div class="qnote-body" hidden>' +
        '<textarea class="qnote-ta" rows="3" placeholder="Ghi từ khoá, ý chính, từ đồng nghĩa bạn nhận ra… (tự lưu, không tính điểm)"></textarea>' +
        '<div class="qnote-st"></div>' +
      '</div>' +
    '</div>';
  }

  function setOpen(box, open) {
    var body = box.querySelector('.qnote-body');
    var btn = box.querySelector('.qnote-toggle');
    if (body) body.hidden = !open;
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    box.classList.toggle('open', open);
  }

  function hydrate(box) {
    if (box._qnoteReady) return;
    box._qnoteReady = true;
    var key = box.getAttribute('data-qnote');
    var ta = box.querySelector('.qnote-ta');
    var st = box.querySelector('.qnote-st');
    var has = box.querySelector('.qnote-has');
    var btn = box.querySelector('.qnote-toggle');
    if (!ta || !btn) return;
    var val = load(key);
    ta.value = val;
    if (has) has.hidden = !val;
    setOpen(box, !!val);

    // Keep page tools out of the note: double-click / drag-select would
    // otherwise open the dictionary popup on the questions panel.
    ['mouseup', 'dblclick', 'touchend'].forEach(function (ev) {
      box.addEventListener(ev, function (e) { e.stopPropagation(); });
    });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = !box.classList.contains('open');
      setOpen(box, open);
      if (open) ta.focus();
    });

    var t = null;
    function flush() {
      clearTimeout(t); t = null;
      save(key, ta.value);
      if (st) st.textContent = ta.value.trim() ? 'Đã lưu' : '';
      if (has) has.hidden = !ta.value.trim();
    }
    ta.addEventListener('input', function () {
      if (st) st.textContent = 'Đang lưu…';
      clearTimeout(t);
      t = setTimeout(flush, 400);
    });
    ta.addEventListener('blur', function () { if (t) flush(); });
  }

  function hydrateIn(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.matches && root.matches('.qnote')) hydrate(root);
    if (root.querySelectorAll) {
      var list = root.querySelectorAll('.qnote');
      for (var i = 0; i < list.length; i++) hydrate(list[i]);
    }
  }

  function injectCss() {
    if (document.getElementById('qnote-css')) return;
    var s = document.createElement('style');
    s.id = 'qnote-css';
    s.textContent =
      '.qnote{margin:10px 0 2px}' +
      '.qnote-toggle{display:inline-flex;align-items:center;gap:6px;background:#fffbeb;border:1px dashed #f59e0b;color:#b45309;' +
        'border-radius:8px;padding:4px 10px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;user-select:none}' +
      '.qnote-toggle:hover{background:#fef3c7}' +
      '.qnote.open .qnote-toggle{border-style:solid}' +
      '.qnote-has{color:#f59e0b;font-size:9px}' +
      '.qnote-body{margin-top:6px}' +
      '.qnote-ta{display:block;width:100%;box-sizing:border-box;min-height:64px;resize:vertical;border:1px solid #fde68a;border-radius:8px;' +
        'padding:8px 10px;font:inherit;font-size:13.5px;line-height:1.6;background:#fffdf5;color:#1f2937;user-select:text;-webkit-user-select:text}' +
      '.qnote-ta:focus{outline:none;border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.15)}' +
      '.qnote-st{font-size:11px;color:#9ca3af;text-align:right;min-height:14px;margin-top:2px}' +
      '[data-theme="dark"] .qnote-toggle{background:#2a2414;border-color:#a16207;color:#fbbf24}' +
      '[data-theme="dark"] .qnote-toggle:hover{background:#3a2e12}' +
      '[data-theme="dark"] .qnote-ta{background:#1f1b10;border-color:#5c4a1c;color:#f3f4f6}';
    (document.head || document.documentElement).appendChild(s);
  }

  function boot() {
    injectCss();
    hydrateIn(document.body);
    if (!window.MutationObserver) return;
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) hydrateIn(added[j]);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);

  window.QuestionNotes = { html: html };
})();
