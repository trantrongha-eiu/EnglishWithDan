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

  // MyMemory is a fuzzy-matched translation-MEMORY search, not a dictionary —
  // for a rare/short query it happily returns whole unrelated sentences that
  // merely score some fuzzy similarity (e.g. querying "inexplicably" can
  // return a match whose segment is "Bubaye inexplicably falls", quality "0",
  // match 0.5). Treating that match's translation as an "other meaning" of
  // the single word is wrong — only a match whose segment IS the word itself
  // (a real word-level TM entry) is a genuine alternate meaning; anything
  // else is a sentence-level entry, useful only as an example sentence.
  function _normForMatch(s) {
    return String(s || '').trim().toLowerCase().replace(/[.,!?;:'"]+$/, '');
  }
  function _escRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  // Public-corpora TM entries are often glossary scrapes, not real sentences
  // (e.g. "Mammal class\t83" — a tab-separated glossary row, not usage in
  // context) — require actual sentence shape before treating a segment as
  // an example: no tab/control chars, no trailing bare-number token, and
  // enough words to be a real clause rather than a 2-word phrase pairing.
  function _looksLikeSentence(seg) {
    if (/[\t\r\n]/.test(seg)) return false;
    var words = seg.split(/\s+/);
    if (words.length < 3) return false;
    if (/^\d+$/.test(words[words.length - 1])) return false;
    return true;
  }

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
    if (!res.ok) {
      // .status/.body match ApiClient.handleResponse's shape (js/shared/
      // api-client.js) so callers can use the same err.status===403 &&
      // err.body.requiresPremium check as writing.js/speaking.js instead of
      // only getting a bare message with no way to detect "needs upgrade".
      var err = new Error(data.message || ('HTTP ' + res.status));
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  // selectionStart/selectionEnd only exist on textarea and text-like input
  // types — accessing it on e.g. a checkbox throws InvalidStateError, and
  // #words-tbody (dashboard.js) renders a row-select checkbox in every row.
  var TEXT_INPUT_TYPES = { text: 1, search: 1, url: 1, tel: 1, password: 1 };

  // Quiz answer/tile buttons across the site (Notebook MC+Mixed, Vocabulary
  // Lesson mcq/translate/rearrange) render each choice as a <button> —
  // Chromium never populates window.getSelection() from a double-click
  // inside a <button> (unlike the <label>-based options Reading/Listening
  // use, where native word-selection works fine), so without this special
  // case double-click lookup silently did nothing on every quiz answer.
  var ANSWER_BUTTON_SELECTOR = '.answer-option, .rearrange-tile, .rearrange-slot-tile';

  function _extractDoubleClickedWord(e) {
    var target = e.target;
    var raw = '';
    var answerBtn = target && target.closest ? target.closest(ANSWER_BUTTON_SELECTOR) : null;
    if (target && target.tagName === 'TEXTAREA') {
      var start = target.selectionStart, end = target.selectionEnd;
      if (start == null || end == null || start === end) return '';
      raw = target.value.substring(start, end);
    } else if (target && target.tagName === 'INPUT' && TEXT_INPUT_TYPES[target.type]) {
      var start2 = target.selectionStart, end2 = target.selectionEnd;
      if (start2 == null || end2 == null || start2 === end2) return '';
      raw = target.value.substring(start2, end2);
    } else if (answerBtn) {
      raw = answerBtn.textContent || '';
    } else {
      var sel = window.getSelection();
      // Double-clicking a non-text element (e.g. the <img> chart in a Task 1
      // prompt) doesn't clear a PREVIOUS text selection made elsewhere on the
      // page — without this check, that stale selection would be picked up
      // and reopen the popup with the old word instead of correctly doing
      // nothing (there's no text under an image to look up).
      if (sel && sel.rangeCount && target && target.contains(sel.anchorNode)) {
        raw = sel.toString();
      }
    }
    var word = raw.trim();
    if (!word || word.split(/\s+/).length > 3 || word.length < 2) return '';
    return word;
  }

  // A plain browser dblclick only ever selects a single word — there is no
  // native gesture that produces a "double-click on a 2-3 word phrase".
  // Students who want to save a phrase instead drag-select it (mousedown,
  // drag across the words, mouseup), which never fires dblclick at all, so
  // the popup silently never appeared for multi-word selections even though
  // the extraction/lookup logic below already accepts up to 3 words. This
  // mouseup listener is the multi-word counterpart to _extractDoubleClickedWord:
  // it only acts when the mouseup left behind a selection that spans more
  // than one word, so it never double-fires for an ordinary double-click
  // (that stays on the dblclick listener) and never fires for a plain
  // single click (collapsed/empty selection) or a quiz-answer/input click.
  function _extractDragSelectedPhrase(e) {
    var target = e.target;
    if (target && target.closest && target.closest(ANSWER_BUTTON_SELECTOR)) return '';
    if (target && (target.tagName === 'TEXTAREA' ||
        (target.tagName === 'INPUT' && TEXT_INPUT_TYPES[target.type]))) return '';
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return '';
    if (!target || !target.contains(sel.anchorNode)) return '';
    var word = sel.toString().trim();
    if (!/\s/.test(word)) return ''; // single word — let dblclick handle it
    if (word.split(/\s+/).length > 3 || word.length < 2) return '';
    return word;
  }

  // gate (optional): fn returning falsy skips the lookup entirely — used by
  // Reading/Listening, where double-click lookup only fires while their own
  // toolbar "Dict" tool is toggled on and a review/practice/retry screen is
  // active. Callers that don't pass a gate get the old unconditional behavior.
  function setupDictionaryDouble(containerId, source, gate) {
    var el = document.getElementById(containerId);
    if (!el) return;
    if (el._dictHandler) el.removeEventListener('dblclick', el._dictHandler);
    if (el._dictMouseupHandler) el.removeEventListener('mouseup', el._dictMouseupHandler);
    el._dictSource = source || 'other';
    el._dictGate = gate || null;
    el._dictHandler = function (e) {
      if (el._dictGate && !el._dictGate()) return;
      var word = _extractDoubleClickedWord(e);
      if (!word) return;
      _source = el._dictSource;
      lookupWord(word, e.clientX, e.clientY);
    };
    el._dictMouseupHandler = function (e) {
      if (el._dictGate && !el._dictGate()) return;
      var word = _extractDragSelectedPhrase(e);
      if (!word) return;
      _source = el._dictSource;
      lookupWord(word, e.clientX, e.clientY);
    };
    el.addEventListener('dblclick', el._dictHandler);
    el.addEventListener('mouseup', el._dictMouseupHandler);
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
      var normWord = _normForMatch(word);
      var matches = ((memRes.value && memRes.value.matches) || [])
        .filter(function (m) { return m.translation && typeof m.translation === 'string' && m.segment; })
        .sort(function (a, b) { return (parseFloat(b.quality) || 0) - (parseFloat(a.quality) || 0); });
      for (var k = 0; k < matches.length; k++) {
        // Only a match whose SOURCE segment is the queried word itself is a
        // genuine word-level meaning — sentence-level fuzzy matches are
        // handled separately below as example candidates, not meanings.
        if (_normForMatch(matches[k].segment) !== normWord) continue;
        // Trim trailing punctuation left over from a comma-separated
        // glossary-style TM segment (e.g. segment "mammal," yielding
        // translation "động vật có vú,").
        var val = matches[k].translation.trim().replace(/[,.;:]+$/, '').trim();
        if (!val || val.length > 45 || seen[val.toLowerCase()]) continue;
        if (/^[a-z0-9\s\-,.'"!?()\[\]]+$/i.test(val)) continue;
        seen[val.toLowerCase()] = true;
        otherMeanings.push(val);
        if (otherMeanings.length >= 3) break;
      }

      // Sentence-level matches that actually contain the word as a whole
      // word are still useful — as EXAMPLE sentences, not as "meanings".
      // dictionaryapi.dev (Wiktionary-sourced) very often has zero example
      // sentences even for common words, so this fills the gap.
      if (examples.length < 3) {
        var wordRe = new RegExp('\\b' + _escRegExp(normWord) + '\\b', 'i');
        for (var m2 = 0; m2 < matches.length && examples.length < 3; m2++) {
          var seg = matches[m2].segment.trim();
          var normSeg = _normForMatch(seg);
          if (normSeg === normWord) continue; // that's a meaning entry, not a sentence
          if (!_looksLikeSentence(seg) || !wordRe.test(seg)) continue;
          if (examples.indexOf(seg) === -1) examples.push(seg);
        }
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
      '<div class="dict-tabs">' +
        '<button class="dict-tab active" data-tab="meaning" onclick="switchDictTab(\'meaning\')">Nghĩa</button>' +
        '<button class="dict-tab" data-tab="collocations" onclick="switchDictTab(\'collocations\')">Collocations</button>' +
      '</div>' +
      '<div class="dict-tab-panel" id="dict-tab-meaning">' +
        '<div class="dict-primary-row">' +
          '<span class="dict-primary-meaning" id="dict-primary-meaning">' + escHtml(data.primaryMeaning) + '</span>' +
          '<button class="dict-save-btn" onclick="saveDictWordToVocab()"><i class="fas fa-plus"></i> Lưu từ</button>' +
        '</div>' + chipsHtml + exHtml +
      '</div>' +
      '<div class="dict-tab-panel" id="dict-tab-collocations" style="display:none"></div>';
  }

  // ── Collocations tab — lazy: only fetched when the student actually
  // clicks the tab, not on every lookup (most lookups only want the
  // meaning). Backend caches per-word globally (Gemini called at most once
  // EVER per word across all students — see dictionaryCollocationService.js),
  // this Map is just this tab's own session-local cache so re-opening the
  // same word's popup twice in one visit doesn't even hit the network again.
  var _collocCache = new Map();
  var _collocSeq = 0;

  function switchDictTab(tab) {
    var tabs = document.querySelectorAll('.dict-tab');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('active', tabs[i].dataset.tab === tab);
    var meaningPanel = document.getElementById('dict-tab-meaning');
    var collocPanel = document.getElementById('dict-tab-collocations');
    if (meaningPanel) meaningPanel.style.display = tab === 'meaning' ? '' : 'none';
    if (collocPanel) collocPanel.style.display = tab === 'collocations' ? '' : 'none';
    if (tab === 'collocations') loadDictCollocations();
  }

  async function loadDictCollocations() {
    var word = _word;
    var key = word.toLowerCase();
    var panel = document.getElementById('dict-tab-collocations');
    if (!panel) return;

    if (_collocCache.has(key)) { renderCollocations(_collocCache.get(key)); return; }

    // Guards against a stale response landing after the student has already
    // double-clicked a DIFFERENT word (closing/reopening the popup) — only
    // the most recent request's result is ever written to the DOM.
    var requestId = ++_collocSeq;
    panel.innerHTML = '<div class="dict-loading">Đang tra collocations...</div>';
    try {
      var res = await _vocabFetch('/dictionary/' + encodeURIComponent(word) + '/collocations');
      if (requestId !== _collocSeq) return;
      var list = res.collocations || [];
      _collocCache.set(key, list);
      renderCollocations(list);
    } catch (e) {
      if (requestId !== _collocSeq) return;
      if (e && e.status === 403 && e.body && e.body.requiresPremium) {
        panel.innerHTML = '<div class="dict-colloc-empty">Tính năng Collocations dành cho thành viên Premium.</div>';
        return;
      }
      panel.innerHTML = '<div class="dict-colloc-empty">Không tải được collocations. ' +
        '<button class="dict-colloc-retry" onclick="loadDictCollocations()">Thử lại</button></div>';
    }
  }

  function renderCollocations(list) {
    var panel = document.getElementById('dict-tab-collocations');
    if (!panel) return;
    if (!list.length) {
      panel.innerHTML = '<div class="dict-colloc-empty">Không tìm thấy collocation phổ biến cho từ này.</div>';
      return;
    }
    panel.innerHTML = list.map(function (c) {
      return '<div class="dict-colloc-item">' +
        '<div class="dict-colloc-phrase">' + escHtml(c.phrase) + '</div>' +
        '<div class="dict-colloc-meaning">' + escHtml(c.meaning) + '</div>' +
        (c.example ? '<div class="dict-colloc-example">"' + escHtml(c.example) + '"</div>' : '') +
        '</div>';
    }).join('');
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
  var _pendingBulkWords = null;
  var _pendingBulkCallback = null;

  // Shared by openVocabBookPicker/openVocabBookPickerBulk — both just need
  // "list my books into the modal, let the user pick one" before the actual
  // save (single word vs bulk) happens in saveDictWordToBook.
  async function _loadBooksIntoPicker() {
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

  async function openVocabBookPicker(wordData) {
    _pendingWordData = wordData;
    _pendingBulkWords = null;
    _pendingBulkCallback = null;
    await _loadBooksIntoPicker();
  }

  // items: [{word, meaning, example, ...}] — used by Task 2's "Lưu tất cả
  // vào sổ" / per-word "Lưu" buttons on the vocab list (task2-practice.html),
  // which already have term/definition/example from the topic's
  // vocabularyList and don't need a fresh dictionary lookup first.
  // onSaved(savedWords), if given, fires after a successful save with the
  // list of `word` strings that were part of this batch — used to mark
  // those terms as "saved" for the practice-mode vocab gate.
  async function openVocabBookPickerBulk(items, onSaved) {
    _pendingBulkWords = items;
    _pendingBulkCallback = onSaved || null;
    _pendingWordData = null;
    await _loadBooksIntoPicker();
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
      _handleVocabSaveError(e, 'Lỗi tạo sổ mới');
    }
  }

  // Shared by createDictBookAndSave/saveDictWordToBook — a trial-expired
  // free account gets vocabbook writes 403'd server-side now (see
  // backend/routes/vocabBook.js), so surface the upgrade modal instead of
  // a generic "failed to save" toast that gives no indication why.
  function _handleVocabSaveError(e, fallbackMsg) {
    if (e && e.status === 403 && e.body && e.body.requiresPremium) {
      if (window.openUpgradeModal) window.openUpgradeModal('trial_expired');
      return;
    }
    showVocabToast((e && e.message) || fallbackMsg, 'error');
  }

  async function saveDictWordToBook(bookId) {
    if (_pendingBulkWords) {
      var items = _pendingBulkWords;
      var cb = _pendingBulkCallback;
      try {
        var bulkRes = await _vocabFetch('/vocabbook/' + bookId + '/words/bulk', {
          method: 'POST',
          body: JSON.stringify({ words: items })
        });
        closeVocabPickerModal();
        showVocabToast(bulkRes.message || ('✓ Đã lưu ' + (bulkRes.addedCount || 0) + ' từ vào sổ'), 'success');
        _pendingBulkWords = null;
        _pendingBulkCallback = null;
        // A word already present in the book comes back as skippedDup, not
        // addedCount — it's still genuinely saved from an earlier visit, so
        // the caller's "mark as learned" bookkeeping should count it too.
        // skippedLimit is different: the book was already full (300-word
        // cap) and those specific words were NOT saved anywhere. The
        // endpoint only returns counts, not which words landed in which
        // bucket, so there's no safe way to mark just a subset here — firing
        // the callback for the whole batch would let a full VocabBook
        // silently satisfy Task 2's "vocab saved" practice gate for words
        // that were never actually saved. The toast above already surfaces
        // the cap via bulkRes.message, so just skip the callback.
        if (cb && !bulkRes.skippedLimit) cb(items.map(function (w) { return w.word; }));
      } catch (e) {
        _handleVocabSaveError(e, 'Lỗi lưu từ');
      }
      return;
    }
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
      _handleVocabSaveError(e, 'Lỗi lưu từ');
    }
  }

  window.setupDictionaryDouble    = setupDictionaryDouble;
  window.selectDictMeaning        = selectDictMeaning;
  window.switchDictTab            = switchDictTab;
  window.loadDictCollocations     = loadDictCollocations;
  window.closeDictPopup           = closeDictPopup;
  window.speakDictWord            = speakDictWord;
  window.saveDictWordToVocab      = saveDictWordToVocab;
  window.saveDictWordToBook       = saveDictWordToBook;
  window.createDictBookAndSave    = createDictBookAndSave;
  window.closeVocabPickerModal    = closeVocabPickerModal;
  window.openVocabBookPickerBulk  = openVocabBookPickerBulk;
})();
