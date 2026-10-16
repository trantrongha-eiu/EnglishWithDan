/**
 * shared/phrase-lookup.js — "Tra từ vựng" panel: a chat-style box where a
 * student TYPES a Vietnamese idea (Tra Việt-Anh) or an English phrase
 * (Tra Anh-Việt) while writing an essay, and gets the English phrase,
 * equivalent phrases and IELTS-style example sentences back from the AI
 * (POST /api/dictionary/phrase-lookup — cached server-side per query).
 *
 * The complement of dictionary-lookup.js (double-click a word already on
 * the page) and sentence-lookup.js (select a sentence): this one is for
 * "how do I SAY this in English" — words that aren't on the page yet.
 *
 * Practice only. The host page decides when it may show:
 *   PhraseLookup.init({ isAllowed: () => bool })
 *   PhraseLookup.refresh()   // call after every screen / mode change
 * isAllowed is also re-checked on every open and every lookup, so a stale
 * refresh can never let it be used during a timed exam.
 */
(function () {
  'use strict';

  var MAX_LEN = 50;
  var API_BASE = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  var DIR_PLACEHOLDER = {
    'vi-en': 'Nhập cụm tiếng Việt cần tra',
    'en-vi': 'Nhập cụm tiếng Anh cần tra',
  };

  var _isAllowed = function () { return false; };
  var root = null, fab = null, panel = null, listEl = null, inputEl = null, countEl = null, submitBtn = null;
  var _dir = 'vi-en';
  var _busy = false;
  var _cache = new Map();

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function allowed() {
    try { return !!_isAllowed(); } catch (e) { return false; }
  }

  function build() {
    if (root) return;
    root = document.createElement('div');
    root.id = 'ews-pl-root';
    root.className = 'ews-pl-root hidden';
    root.innerHTML =
      '<button type="button" class="ews-pl-fab" aria-label="Tra từ vựng" title="Tra từ vựng (Việt-Anh / Anh-Việt)">' +
        '<i class="fas fa-language"></i><span>Tra từ vựng</span>' +
      '</button>' +
      '<div class="ews-pl-panel hidden" role="dialog" aria-label="Tra từ vựng">' +
        '<div class="ews-pl-header">' +
          '<span class="ews-pl-avatar">📗</span>' +
          '<span class="ews-pl-title">Tra từ vựng</span>' +
          '<span class="ews-pl-dot" title="AI sẵn sàng"></span>' +
          '<button type="button" class="ews-pl-close" aria-label="Đóng">&times;</button>' +
        '</div>' +
        '<div class="ews-pl-list">' +
          '<div class="ews-pl-card ews-pl-welcome">' +
            'Không biết diễn đạt ý nào bằng tiếng Anh? Gõ cụm <b>tiếng Việt</b> để tìm cụm tiếng Anh tự nhiên, ' +
            'hoặc chọn <b>Tra Anh-Việt</b> để hiểu nghĩa một cụm tiếng Anh. Mỗi kết quả có cụm tương đương và câu gợi ý kiểu IELTS.' +
          '</div>' +
        '</div>' +
        '<div class="ews-pl-composer">' +
          '<div class="ews-pl-tabs" role="tablist">' +
            '<button type="button" class="ews-pl-tab active" data-dir="vi-en" role="tab">Tra Việt-Anh</button>' +
            '<button type="button" class="ews-pl-tab" data-dir="en-vi" role="tab">Tra Anh-Việt</button>' +
          '</div>' +
          '<textarea class="ews-pl-input" rows="2" maxlength="' + MAX_LEN + '" spellcheck="false" placeholder="' + DIR_PLACEHOLDER['vi-en'] + '"></textarea>' +
          '<div class="ews-pl-composer-foot">' +
            '<span class="ews-pl-count">0/' + MAX_LEN + ' ký tự</span>' +
            '<button type="button" class="ews-pl-submit" disabled>Tra từ vựng</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    fab = root.querySelector('.ews-pl-fab');
    panel = root.querySelector('.ews-pl-panel');
    listEl = root.querySelector('.ews-pl-list');
    inputEl = root.querySelector('.ews-pl-input');
    countEl = root.querySelector('.ews-pl-count');
    submitBtn = root.querySelector('.ews-pl-submit');

    fab.addEventListener('click', toggle);
    root.querySelector('.ews-pl-close').addEventListener('click', close);
    root.querySelectorAll('.ews-pl-tab').forEach(function (tab) {
      tab.addEventListener('click', function () { setDir(tab.getAttribute('data-dir')); });
    });
    inputEl.addEventListener('input', updateComposer);
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); }
      if (e.key === 'Escape') close();
    });
    submitBtn.addEventListener('click', submit);
    // Result-card buttons are created per lookup — one delegated listener.
    listEl.addEventListener('click', onListClick);
    // The exam screen can go fullscreen (exam-fullscreen.js targets
    // #screen-exam), and only the fullscreen element's subtree is painted —
    // follow it so the panel stays usable there.
    document.addEventListener('fullscreenchange', function () {
      var host = document.fullscreenElement || document.body;
      if (root.parentNode !== host) host.appendChild(root);
    });
  }

  function setDir(dir) {
    if (dir !== 'vi-en' && dir !== 'en-vi') return;
    _dir = dir;
    root.querySelectorAll('.ews-pl-tab').forEach(function (tab) {
      tab.classList.toggle('active', tab.getAttribute('data-dir') === dir);
    });
    inputEl.placeholder = DIR_PLACEHOLDER[dir];
    inputEl.focus();
  }

  function updateComposer() {
    var len = inputEl.value.length;
    countEl.textContent = len + '/' + MAX_LEN + ' ký tự';
    submitBtn.disabled = _busy || !inputEl.value.trim();
  }

  function open() {
    if (!allowed()) { refresh(); return; }
    panel.classList.remove('hidden');
    fab.classList.add('active');
    listEl.scrollTop = listEl.scrollHeight;
    inputEl.focus();
  }

  function close() {
    if (!panel) return;
    panel.classList.add('hidden');
    fab.classList.remove('active');
  }

  function toggle() {
    if (panel.classList.contains('hidden')) open(); else close();
  }

  function refresh() {
    if (!allowed()) {
      if (root) { close(); root.classList.add('hidden'); }
      return;
    }
    build();
    root.classList.remove('hidden');
  }

  function appendHtml(html) {
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var el = wrap.firstChild;
    listEl.appendChild(el);
    listEl.scrollTop = listEl.scrollHeight;
    return el;
  }

  // Bold the highlighted phrase inside the sentence and put its Vietnamese
  // gloss right after it — "experienced a **sudden drop** (giảm đột ngột)".
  function exampleHtml(ex) {
    var en = ex.en || '';
    var hl = ex.highlight || '';
    var idx = hl ? en.toLowerCase().indexOf(hl.toLowerCase()) : -1;
    if (idx < 0) {
      return esc(en) + (ex.vi ? ' <span class="ews-pl-gloss">(' + esc(ex.vi) + ')</span>' : '');
    }
    return esc(en.slice(0, idx)) +
      '<b>' + esc(en.slice(idx, idx + hl.length)) + '</b>' +
      (ex.vi ? ' <span class="ews-pl-gloss">(' + esc(ex.vi) + ')</span>' : '') +
      esc(en.slice(idx + hl.length));
  }

  function resultHtml(data, key) {
    if (!data.phrase) {
      return '<div class="ews-pl-card ews-pl-empty">Không tìm thấy cụm phù hợp. Kiểm tra lại chính tả' +
        (data.dir === 'vi-en' ? ' (nhớ gõ có dấu)' : '') + ' hoặc thử cách diễn đạt khác nhé.</div>';
    }
    var h = '<div class="ews-pl-card" data-key="' + esc(key) + '">';
    h += '<div class="ews-pl-row"><b>Cụm tiếng Anh:</b> <span class="ews-pl-phrase">' + esc(data.phrase) + '</span>' +
      '<button type="button" class="ews-pl-speak" data-say="' + esc(data.phrase) + '" aria-label="Nghe phát âm"><i class="fas fa-volume-up"></i></button></div>';
    if (data.dir === 'en-vi' && data.meaning) {
      h += '<div class="ews-pl-row"><b>Nghĩa tiếng Việt:</b> ' + esc(data.meaning) + '</div>';
    }
    if (data.alternatives && data.alternatives.length) {
      h += '<div class="ews-pl-label">Cụm từ tương đương:</div><ul>' +
        data.alternatives.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>';
    }
    if (data.examples && data.examples.length) {
      h += '<div class="ews-pl-label">Câu gợi ý:</div><ul>' +
        data.examples.map(function (ex) { return '<li>' + exampleHtml(ex) + '</li>'; }).join('') + '</ul>';
    }
    h += '<div class="ews-pl-actions"><button type="button" class="ews-pl-save"><i class="fas fa-plus"></i> Lưu từ vựng</button></div>';
    h += '</div>';
    return h;
  }

  async function fetchLookup(q, dir) {
    var res = await fetch(API_BASE + '/dictionary/phrase-lookup', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' },
        window.AuthService ? window.AuthService.authHeader() : {}),
      body: JSON.stringify({ q: q, dir: dir }),
    });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok || !data.success) {
      var err = new Error(data.message || ('HTTP ' + res.status));
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  async function submit() {
    if (_busy) return;
    var q = inputEl.value.replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);
    if (!q) return;
    if (!allowed()) { refresh(); return; }
    var dir = _dir;
    var key = dir + ':' + q.toLowerCase();

    appendHtml('<div class="ews-pl-user"><span>' + esc(q) + '</span></div>');
    inputEl.value = '';
    _busy = true;
    updateComposer();

    if (_cache.has(key)) {
      appendHtml(resultHtml(_cache.get(key), key));
      _busy = false;
      updateComposer();
      return;
    }

    var loading = appendHtml('<div class="ews-pl-card ews-pl-loading"><span></span><span></span><span></span></div>');
    try {
      var data = await fetchLookup(q, dir);
      _cache.set(key, data);
      while (_cache.size > 100) _cache.delete(_cache.keys().next().value);
      loading.remove();
      appendHtml(resultHtml(data, key));
    } catch (err) {
      loading.remove();
      if (err.status === 401 && window.AuthService) { window.AuthService.logout(); return; }
      if (err.status === 403 && err.body && err.body.requiresPremium && window.openUpgradeModal) {
        window.openUpgradeModal('trial_expired');
      }
      appendHtml('<div class="ews-pl-card ews-pl-error">' +
        esc(err.status === 429 || err.status === 503 || err.status === 400 || err.status === 403
          ? err.message : 'Không tra được, vui lòng thử lại.') + '</div>');
    } finally {
      _busy = false;
      updateComposer();
    }
  }

  function onListClick(e) {
    var speakBtn = e.target.closest('.ews-pl-speak');
    if (speakBtn) {
      var text = speakBtn.getAttribute('data-say');
      if (window.WordAudio) window.WordAudio.speak(text);
      else if (window.speechSynthesis) {
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
      return;
    }
    var saveBtn = e.target.closest('.ews-pl-save');
    if (saveBtn) {
      var card = saveBtn.closest('.ews-pl-card');
      var data = card && _cache.get(card.getAttribute('data-key'));
      if (data) saveToBook(data, saveBtn);
    }
  }

  // Reuses dictionary-lookup.js's "pick a vocab book" modal (present on
  // every page that loads it, incl. writing.html) — no second save flow.
  function saveToBook(data, btn) {
    if (typeof window.openVocabBookPickerBulk !== 'function') return;
    var ex = (data.examples && data.examples[0]) || {};
    var item = {
      word: data.phrase,
      meaning: data.meaning,
      example: ex.en || '',
      collocations: data.alternatives || [],
    };
    // The picker modal lives in <body>; a fullscreen #screen-exam would hide it.
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    window.openVocabBookPickerBulk([item], function () {
      btn.classList.add('saved');
      btn.innerHTML = '<i class="fas fa-check"></i> Đã lưu';
    });
  }

  window.PhraseLookup = {
    init: function (opts) {
      if (opts && typeof opts.isAllowed === 'function') _isAllowed = opts.isAllowed;
      refresh();
    },
    refresh: refresh,
    close: close,
  };
})();
