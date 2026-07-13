/**
 * shared/dictionary-lookup.js — double-click word lookup + "save to vocab
 * book" popup, shared by Writing and Vocab/dashboard pages.
 *
 * Reading (js/reading-v2.js) and Listening (inline in listening.html) each
 * have their own copy of this exact logic already — this is deliberately a
 * THIRD copy made reusable instead of a fourth/fifth hand-rolled one, since
 * Writing and Vocab both need it. Reading/Listening are left untouched
 * (out of scope) rather than migrated onto this module.
 *
 * Host page requirements (all already present on writing.html/dashboard.html):
 *   - window.AuthService.authHeader() (js/shared/auth-service.js)
 *   - window.escHtml()                (js/shared/utils.js)
 *   - window.showVocabToast()         (js/shared/toast.js)
 *   - markup: #dict-popup and #dict-vocab-modal (see writing.html/dashboard.html)
 *   - css/dictionary-popup.css loaded
 *
 * Usage: call setupDictionaryDouble(containerId, source) once per container
 * every time that container's innerHTML is (re)rendered — it removes any
 * previously-attached listener first, so re-calling on every render is safe
 * and required (a fresh innerHTML detaches nothing, but re-adding without
 * the removeEventListener guard would stack duplicate handlers).
 *
 * Selection quirk: window.getSelection() does not reach into <textarea>/
 * <input> internals (they're replaced form controls, not real DOM text), so
 * a double-click inside a student's own essay textarea is read via
 * target.selectionStart/selectionEnd instead — the browser still performs
 * native double-click word selection there, it's just not exposed through
 * the Selection API.
 */
(function () {
  'use strict';

  // Reuse the same base URL AuthService already exposes (avoids yet another
  // hardcoded copy of it — writing.js and dashboard.js each already define
  // their own `API` constant with two different conventions, one with the
  // /api suffix and one without).
  var VOCAB_API_BASE = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';

  var _word = '';
  var _source = 'other';
  var _currentData = null;
  var _cache = new Map();
  var _pendingWordData = null;

  async function _vocabFetch(path, opts) {
    opts = opts || {};
    var res = await fetch(VOCAB_API_BASE + path, Object.assign({}, opts, {
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        window.AuthService ? window.AuthService.authHeader() : {},
        opts.headers || {}
      )
    }));
    if (res.status === 401) {
      // Match every other API call on these pages: an expired/invalid
      // token clears the session and redirects to login instead of just
      // showing a generic error toast forever.
      if (window.AuthService) window.AuthService.logout();
      throw new Error('Unauthorized');
    }
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.message || ('HTTP ' + res.status));
    return data;
  }

  // selectionStart/selectionEnd only exist on textarea and text-like input
  // types — accessing it on e.g. a checkbox throws InvalidStateError, and
  // #words-tbody (dashboard.js) renders a row-select checkbox in every row.
  var TEXT_INPUT_TYPES = { text: 1, search: 1, url: 1, tel: 1, password: 1 };

  function _extractDoubleClickedWord(e) {
    var target = e.target;
    var raw = '';
    if (target && target.tagName === 'TEXTAREA') {
      var start = target.selectionStart, end = target.selectionEnd;
      if (start == null || end == null || start === end) return '';
      raw = target.value.substring(start, end);
    } else if (target && target.tagName === 'INPUT' && TEXT_INPUT_TYPES[target.type]) {
      var start2 = target.selectionStart, end2 = target.selectionEnd;
      if (start2 == null || end2 == null || start2 === end2) return '';
      raw = target.value.substring(start2, end2);
    } else {
      var sel = window.getSelection();
      raw = sel ? sel.toString() : '';
    }
    var word = raw.trim();
    if (!word || word.split(/\s+/).length > 3 || word.length < 2) return '';
    return word;
  }

  function setupDictionaryDouble(containerId, source) {
    var el = document.getElementById(containerId);
    if (!el) return;
    if (el._dictHandler) el.removeEventListener('dblclick', el._dictHandler);
    el._dictSource = source || 'other';
    el._dictHandler = function (e) {
      var word = _extractDoubleClickedWord(e);
      if (!word) return;
      _source = el._dictSource;
      lookupWord(word, e.clientX, e.clientY);
    };
    el.addEventListener('dblclick', el._dictHandler);
  }

  async function lookupWord(word, x, y) {
    var key = word.toLowerCase();
    _word = word;
    document.getElementById('dict-word').textContent = word;
    document.getElementById('dict-phonetic').textContent = '';
    positionDictPopup(x, y);
    document.getElementById('dict-popup').classList.remove('hidden');

    if (_cache.has(key)) { renderDictPopup(_cache.get(key)); return; }

    document.getElementById('dict-body').innerHTML = '<div class="dict-loading">Đang tra...</div>';

    var enc = encodeURIComponent;
    var results = await Promise.allSettled([
      fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + enc(word)).then(function (r) { return r.ok ? r.json() : null; }),
      fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + enc(word)).then(function (r) { return r.json(); }),
      fetch('https://api.mymemory.translated.net/get?q=' + enc(word) + '&langpair=en|vi').then(function (r) { return r.json(); })
    ]);
    var dictRes = results[0], transRes = results[1], memRes = results[2];

    var phonetic = '', partOfSpeech = '', examples = [];
    if (dictRes.status === 'fulfilled' && Array.isArray(dictRes.value)) {
      var entry = dictRes.value[0];
      phonetic = (entry && entry.phonetic) || (entry && entry.phonetics && (entry.phonetics.find(function (p) { return p.text; }) || {}).text) || '';
      partOfSpeech = (entry && entry.meanings && entry.meanings[0] && entry.meanings[0].partOfSpeech) || '';
      var meanings = (entry && entry.meanings) || [];
      outer:
      for (var i = 0; i < meanings.length; i++) {
        var defs = meanings[i].definitions || [];
        for (var j = 0; j < defs.length; j++) {
          if (defs[j].example && examples.indexOf(defs[j].example) === -1) {
            examples.push(defs[j].example);
            if (examples.length >= 3) break outer;
          }
        }
      }
    }

    var primaryMeaning = '';
    if (transRes.status === 'fulfilled') {
      try { primaryMeaning = (transRes.value[0][0][0] || '').trim(); } catch (e) {}
    }

    var otherMeanings = [];
    if (memRes.status === 'fulfilled') {
      var seen = {}; seen[primaryMeaning.toLowerCase()] = true;
      var matches = ((memRes.value && memRes.value.matches) || [])
        .filter(function (m) { return m.translation && typeof m.translation === 'string'; })
        .sort(function (a, b) { return (parseFloat(b.quality) || 0) - (parseFloat(a.quality) || 0); });
      for (var k = 0; k < matches.length; k++) {
        var val = matches[k].translation.trim();
        if (!val || val.length > 45 || seen[val.toLowerCase()]) continue;
        if (/^[a-z0-9\s\-,.'"!?()\[\]]+$/i.test(val)) continue;
        seen[val.toLowerCase()] = true;
        otherMeanings.push(val);
        if (otherMeanings.length >= 3) break;
      }
    }

    if (!primaryMeaning) primaryMeaning = 'Không tìm thấy';

    var cached = { phonetic: phonetic, partOfSpeech: partOfSpeech, primaryMeaning: primaryMeaning, otherMeanings: otherMeanings, examples: examples };
    _cache.set(key, cached);
    if (_word.toLowerCase() === key) renderDictPopup(cached);
  }

  function renderDictPopup(data) {
    _currentData = data;
    var meta = [data.phonetic, data.partOfSpeech].filter(Boolean).join('  ·  ');
    document.getElementById('dict-phonetic').textContent = meta;

    var chipsHtml = data.otherMeanings.length
      ? '<div class="dict-chips-label">Nghĩa khác:</div><div class="dict-chips-wrap">' +
        data.otherMeanings.map(function (m) {
          var safe = m.replace(/&/g, '&amp;').replace(/'/g, "\\'").replace(/"/g, '&quot;');
          return '<button class="dict-meaning-chip" onclick="selectDictMeaning(this,\'' + safe + '\')">' + escHtml(m) + '</button>';
        }).join('') + '</div>'
      : '';

    var exHtml = data.examples.length
      ? '<div class="dict-ex-section">' + data.examples.map(function (ex) { return '<div class="dict-ex-item">"' + escHtml(ex) + '"</div>'; }).join('') + '</div>'
      : '';

    document.getElementById('dict-body').innerHTML =
      '<div class="dict-primary-row">' +
        '<span class="dict-primary-meaning" id="dict-primary-meaning">' + escHtml(data.primaryMeaning) + '</span>' +
        '<button class="dict-save-btn" onclick="saveDictWordToVocab()"><i class="fas fa-plus"></i> Lưu từ</button>' +
      '</div>' + chipsHtml + exHtml;
  }

  function selectDictMeaning(btn, val) {
    var el = document.getElementById('dict-primary-meaning');
    if (el) el.textContent = val;
    var chips = btn.closest('.dict-chips-wrap').querySelectorAll('.dict-meaning-chip');
    chips.forEach(function (b) { b.classList.toggle('active', b === btn); });
  }

  function positionDictPopup(x, y) {
    var popup = document.getElementById('dict-popup');
    popup.style.left = Math.max(8, Math.min(x, window.innerWidth - 320 - 8)) + 'px';
    popup.style.top = Math.max(8, Math.min(y + 12, window.innerHeight - 380)) + 'px';
  }

  function closeDictPopup() {
    var el = document.getElementById('dict-popup');
    if (el) el.classList.add('hidden');
  }

  function speakDictWord() {
    if (!_word || !window.speechSynthesis) return;
    var u = new SpeechSynthesisUtterance(_word);
    u.lang = 'en-US'; u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function saveDictWordToVocab() {
    if (!_currentData || !_word) return;
    var meaningEl = document.getElementById('dict-primary-meaning');
    var meaning = (meaningEl && meaningEl.textContent.trim()) || _currentData.primaryMeaning;
    closeDictPopup();
    await openVocabBookPicker({
      word: _word,
      meaning: meaning,
      example: _currentData.examples[0] || '',
      phonetic: _currentData.phonetic,
      partOfSpeech: _currentData.partOfSpeech,
      source: _source
    });
  }

  var _pickerRequestSeq = 0;

  async function openVocabBookPicker(wordData) {
    _pendingWordData = wordData;
    var modal = document.getElementById('dict-vocab-modal');
    var listEl = document.getElementById('dict-vocab-book-list');
    if (!modal || !listEl) return;
    // Guard against a rapid double-tap on "Lưu từ" firing this twice — only
    // the most recent call is allowed to render its result into listEl.
    var requestId = ++_pickerRequestSeq;
    listEl.innerHTML = '<div class="rd-vocab-loading">Đang tải sổ...</div>';
    modal.classList.remove('hidden');
    try {
      var res = await _vocabFetch('/vocabbook/');
      if (requestId !== _pickerRequestSeq) return;
      var books = res.books || [];
      if (!books.length) {
        listEl.innerHTML = '<div class="rd-vocab-loading">Chưa có sổ nào</div>';
        return;
      }
      listEl.innerHTML = books.map(function (b) {
        return '<div class="vb-pick-item" onclick="saveDictWordToBook(\'' + b._id + '\')">' +
          '<span class="vb-pick-emoji">' + escHtml(b.emoji || '📘') + '</span>' +
          '<div class="vb-pick-info">' +
            '<div class="vb-pick-name">' + escHtml(b.name) + '</div>' +
            '<div class="vb-pick-count">' + b.totalWords + ' từ</div>' +
          '</div>' +
          '<span class="vb-pick-arrow">›</span>' +
        '</div>';
      }).join('');
    } catch (e) {
      if (requestId !== _pickerRequestSeq) return;
      listEl.innerHTML = '<div class="rd-vocab-loading" style="color:#e53935">Lỗi tải sổ từ vựng</div>';
    }
  }

  function closeVocabPickerModal() {
    var el = document.getElementById('dict-vocab-modal');
    if (el) el.classList.add('hidden');
  }

  async function createDictBookAndSave() {
    var nameInput = document.getElementById('dict-new-book-name');
    var name = nameInput && nameInput.value.trim();
    if (!name) { if (nameInput) nameInput.focus(); return; }
    try {
      var res = await _vocabFetch('/vocabbook/', {
        method: 'POST',
        body: JSON.stringify({ name: name, emoji: '📘', color: '#3d8bff' })
      });
      if (!res.success) { showVocabToast(res.message, 'error'); return; }
      if (nameInput) nameInput.value = '';
      await saveDictWordToBook(res.book._id);
    } catch (e) {
      showVocabToast('Lỗi tạo sổ mới', 'error');
    }
  }

  async function saveDictWordToBook(bookId) {
    if (!_pendingWordData) return;
    try {
      var res = await _vocabFetch('/vocabbook/' + bookId + '/words', {
        method: 'POST',
        body: JSON.stringify(_pendingWordData)
      });
      closeVocabPickerModal();
      var msg = res.success ? ('✓ Đã lưu "' + _pendingWordData.word + '" vào sổ') : ('ℹ️ ' + res.message);
      showVocabToast(msg, res.success ? 'success' : 'info');
      _pendingWordData = null;
    } catch (e) {
      showVocabToast('Lỗi lưu từ', 'error');
    }
  }

  window.setupDictionaryDouble = setupDictionaryDouble;
  window.selectDictMeaning     = selectDictMeaning;
  window.closeDictPopup        = closeDictPopup;
  window.speakDictWord         = speakDictWord;
  window.saveDictWordToVocab   = saveDictWordToVocab;
  window.saveDictWordToBook    = saveDictWordToBook;
  window.createDictBookAndSave = createDictBookAndSave;
  window.closeVocabPickerModal = closeVocabPickerModal;
})();
