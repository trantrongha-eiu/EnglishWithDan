/**
 * dashboard-paraphrase.js — the paraphrase study experience.
 *
 * Page-owned split file (same contract as dashboard-review.js): loads BEFORE
 * dashboard.js but only touches its globals (currentUnit, _isBookPractice,
 * showMode, _esc, escH, speakWord, window.toast, window.renderParaphraseTable)
 * from functions invoked after DOMContentLoaded, once dashboard.js has
 * finished defining them.
 *
 * Two things live here:
 *  1. mountParaphraseStudy() — the study-tab block: a "Thẻ ⇄ Bảng" toggle
 *     over an active-recall flip-card view (front = phrase in the passage,
 *     back = how the question paraphrases it + meaning + explanation, with
 *     three "how well do I know this" buttons) and the original scan/copy
 *     table. The card ratings feed a per-student Leitner schedule
 *     (ParaphraseProgress on the server) so paraphrase pairs get the same
 *     spaced-repetition + daily-nudge treatment notebook words already have.
 *  2. openParaphraseReviewModal() — a cross-unit "Ôn Paraphrase" session:
 *     pulls every paraphrase pair whose review is due (any unit) and runs it
 *     through dashboard.js's existing mixed-quiz engine. Its graded outcome
 *     is pushed back into the same schedule via the noteParaphraseAnswered /
 *     syncParaphraseEvidence hooks dashboard.js calls.
 */
(function () {
  'use strict';

  var VIEW_KEY = 'ews_para_study_view'; // 'cards' | 'table'
  var RATING_LABELS = {
    'chua-thuoc': 'Chưa thuộc',
    'nho-so-so': 'Nhớ sơ sơ',
    'da-thuoc': 'Đã thuộc',
  };
  var STATUS_PILL = {
    'chua-thuoc': { cls: 'is-new', txt: 'Chưa thuộc' },
    'nho-so-so': { cls: 'is-learning', txt: 'Đang nhớ' },
    'da-thuoc': { cls: 'is-mastered', txt: 'Đã thuộc' },
  };

  function api() { return (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api'; }
  function authH() { return window.AuthService ? window.AuthService.authHeader() : {}; }
  function esc(s) { return (typeof _esc === 'function' ? _esc(s) : String(s == null ? '' : s)); }
  function say(msg, type) { if (window.toast) window.toast(msg, type); }

  // Must mirror paraphraseSrsService.normalisePart on the server so a card
  // matches its progress row.
  function norm(s) { return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase(); }
  function itemSig(w) { return norm(w.word) + ' ∴ ' + norm(w.paraphrase); }

  function getView() {
    try { var v = localStorage.getItem(VIEW_KEY); if (v === 'cards' || v === 'table') return v; } catch (e) {}
    return 'cards';
  }
  function setView(v) { try { localStorage.setItem(VIEW_KEY, v); } catch (e) {} }

  function fmtNextReview(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    if (isNaN(d)) return '';
    var days = Math.round((d - Date.now()) / 86400000);
    if (days <= 0) return 'đến hạn ôn';
    if (days === 1) return 'ôn lại sau 1 ngày';
    return 'ôn lại sau ' + days + ' ngày';
  }

  // ── State for the currently mounted unit ────────────────────────────────
  var _mountItems = [];   // paraphrase words of the mounted unit
  var _mountUnit = null;
  var _progBySig = {};     // itemSig -> { status, srsBox, nextReviewAt }

  function mountParaphraseStudy(paraWords, unit, gridEl) {
    _mountItems = paraWords || [];
    _mountUnit = unit || null;

    var host = document.getElementById('paraphrase-table-section');
    if (host) host.remove();
    host = document.createElement('div');
    host.id = 'paraphrase-table-section';
    host.className = 'paraphrase-section';
    gridEl.parentElement.insertBefore(host, gridEl.nextSibling);

    renderShell(host);

    // Progress is a premium-only fetch (same bar as the unit content that's
    // already on screen); a lapsed user just sees cards with no pills.
    if (_mountUnit && _mountUnit._id) {
      fetch(api() + '/vocab/paraphrase/progress/' + _mountUnit._id, { headers: authH() })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d || !d.success) return;
          _progBySig = {};
          (d.items || []).forEach(function (it) {
            _progBySig[norm(it.word) + ' ∴ ' + norm(it.paraphrase)] = it;
          });
          if (getView() === 'cards') { renderCards(host); }
          updateRing(host);
        })
        .catch(function () {});
    }
  }

  function renderShell(host) {
    var view = getView();
    var total = _mountItems.length;
    host.innerHTML =
      '<div class="para-study-head">' +
        '<div class="para-study-title"><span class="para-icon">🔑</span> Paraphrase — ' + esc(_mountUnit ? _mountUnit.title : '') + '</div>' +
        '<div class="para-ring" id="para-ring" title="Số cụm đã thuộc">' +
          '<span class="para-ring-num">0/' + total + '</span>' +
        '</div>' +
        '<div class="para-view-toggle" role="tablist">' +
          '<button class="para-view-btn' + (view === 'cards' ? ' active' : '') + '" data-view="cards" role="tab">🃏 Thẻ</button>' +
          '<button class="para-view-btn' + (view === 'table' ? ' active' : '') + '" data-view="table" role="tab">📊 Bảng</button>' +
        '</div>' +
        '<button class="para-copy-btn" onclick="copyParaphraseTable()" title="Copy bảng">⧉</button>' +
      '</div>' +
      '<div class="para-study-hint">Nhấn vào thẻ để lật — tự nhớ lại cách câu hỏi diễn đạt lại cụm trong bài trước khi xem đáp án. Bôi đen hoặc double-click bất kỳ từ nào để tra nghĩa.</div>' +
      '<div id="para-study-body"></div>';

    host.querySelectorAll('.para-view-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-view');
        if (v === getView()) return;
        setView(v);
        host.querySelectorAll('.para-view-btn').forEach(function (x) { x.classList.toggle('active', x === b); });
        renderBody(host);
      });
    });

    renderBody(host);
    updateRing(host);
  }

  function renderBody(host) {
    if (getView() === 'table') { renderTable(host); }
    else { renderCards(host); }
  }

  function renderTable(host) {
    var body = host.querySelector('#para-study-body');
    if (!body) return;
    if (typeof window.renderParaphraseTable === 'function') {
      body.innerHTML = window.renderParaphraseTable(_mountItems, '');
    }
  }

  function renderCards(host) {
    var body = host.querySelector('#para-study-body');
    if (!body) return;
    var html = '<div class="para-card-grid">';
    _mountItems.forEach(function (w, i) {
      var prog = _progBySig[itemSig(w)];
      var pill = prog && STATUS_PILL[prog.status] ? STATUS_PILL[prog.status] : null;
      var next = prog ? fmtNextReview(prog.nextReviewAt) : '';
      html +=
        '<div class="para-card" data-idx="' + i + '">' +
          '<div class="para-card-inner">' +
            '<div class="para-card-face para-card-front">' +
              '<div class="para-card-tag">Trong bài đọc</div>' +
              '<div class="para-card-phrase">' + esc(w.word) + '</div>' +
              (pill ? '<div class="para-pill ' + pill.cls + '">' + pill.txt + (next ? ' · ' + next : '') + '</div>' : '<div class="para-pill is-untouched">Chưa học</div>') +
              '<div class="para-card-flip-hint">Nhấn để xem câu hỏi diễn đạt lại →</div>' +
            '</div>' +
            '<div class="para-card-face para-card-back">' +
              '<div class="para-card-tag">Trong câu hỏi</div>' +
              '<div class="para-card-para">' + esc(w.paraphrase || '–') + '</div>' +
              (w.meaning ? '<div class="para-card-meaning">' + esc(w.meaning) + '</div>' : '') +
              (w.explanation ? '<div class="para-card-explain">' + esc(w.explanation) + '</div>' : '') +
              '<div class="para-rate-row">' +
                '<span class="para-rate-label">Bạn nhớ cụm này tới đâu?</span>' +
                '<div class="para-rate-btns">' +
                  '<button class="para-rate-btn r-bad" data-idx="' + i + '" data-rating="chua-thuoc">Chưa thuộc</button>' +
                  '<button class="para-rate-btn r-mid" data-idx="' + i + '" data-rating="nho-so-so">Nhớ sơ sơ</button>' +
                  '<button class="para-rate-btn r-good" data-idx="' + i + '" data-rating="da-thuoc">Đã thuộc</button>' +
                '</div>' +
              '</div>' +
              '<button class="para-card-save" data-idx="' + i + '">🔖 Lưu vào sổ</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
    html += '</div>';
    body.innerHTML = html;

    body.querySelectorAll('.para-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.para-rate-btn') || e.target.closest('.para-card-save')) return;
        // A double-click is a dictionary lookup (handled on #studyMode) — not
        // a flip; and a drag-select for lookup shouldn't flip either.
        if (e.detail >= 2) return;
        var sel = window.getSelection && window.getSelection();
        if (sel && !sel.isCollapsed && String(sel).trim()) return;
        card.classList.toggle('flipped');
      });
    });
    body.querySelectorAll('.para-rate-btn').forEach(function (b) {
      b.addEventListener('click', function () { ratePara(b); });
    });
    body.querySelectorAll('.para-card-save').forEach(function (b) {
      b.addEventListener('click', function () {
        var w = _mountItems[+b.getAttribute('data-idx')];
        if (!w || typeof window.openSaveWordModal !== 'function') return;
        window.openSaveWordModal({
          word: w.word, meaning: w.meaning || '', example: w.paraphrase ? 'Paraphrase: ' + w.paraphrase : '',
          phonetic: w.phonetic || '', partOfSpeech: '',
          source: _mountUnit && _mountUnit.unitNumber ? 'Unit ' + _mountUnit.unitNumber : (_mountUnit && _mountUnit.title) || 'Paraphrase',
        });
      });
    });
    // Double-click / drag-select lookup needs no wiring here: renderStudyGrid
    // binds setupDictionaryDouble on #studyMode (no gate) after this runs,
    // and these cards live inside it — the listener catches bubbled events
    // from any card added later (view toggle, async progress render) too.
  }

  function ratePara(btn) {
    var idx = +btn.getAttribute('data-idx');
    var rating = btn.getAttribute('data-rating');
    var w = _mountItems[idx];
    if (!w || !_mountUnit || !_mountUnit._id) return;

    var row = btn.closest('.para-rate-btns');
    if (row) row.querySelectorAll('.para-rate-btn').forEach(function (x) { x.disabled = true; x.classList.toggle('chosen', x === btn); });

    fetch(api() + '/vocab/paraphrase/review', {
      method: 'POST', headers: authH(),
      body: JSON.stringify({
        unitId: _mountUnit._id,
        word: w.word, paraphrase: w.paraphrase || '', meaning: w.meaning || '', explanation: w.explanation || '',
        rating: rating,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.success) { say('Chưa lưu được, thử lại sau', 'error'); if (row) row.querySelectorAll('.para-rate-btn').forEach(function (x) { x.disabled = false; }); return; }
        _progBySig[itemSig(w)] = { status: d.itemStatus, srsBox: d.srsBox, nextReviewAt: d.nextReviewAt, word: w.word, paraphrase: w.paraphrase };
        var card = btn.closest('.para-card');
        if (card) {
          var pill = STATUS_PILL[d.itemStatus];
          var frontPill = card.querySelector('.para-card-front .para-pill');
          if (frontPill && pill) {
            frontPill.className = 'para-pill ' + pill.cls;
            frontPill.textContent = pill.txt + ' · ' + fmtNextReview(d.nextReviewAt);
          }
          setTimeout(function () {
            card.classList.remove('flipped');
            // re-enable so a re-flip lets the student change their mind
            if (row) row.querySelectorAll('.para-rate-btn').forEach(function (x) { x.disabled = false; });
          }, 550);
        }
        say(RATING_LABELS[rating] + ' — ' + fmtNextReview(d.nextReviewAt), 'success');
        var hostEl = document.getElementById('paraphrase-table-section');
        if (hostEl) updateRing(hostEl);
      })
      .catch(function () {
        say('Chưa lưu được, thử lại sau', 'error');
        if (row) row.querySelectorAll('.para-rate-btn').forEach(function (x) { x.disabled = false; });
      });
  }

  function updateRing(host) {
    var ring = host && host.querySelector('#para-ring .para-ring-num');
    if (!ring) return;
    var total = _mountItems.length;
    var mastered = 0;
    _mountItems.forEach(function (w) {
      var p = _progBySig[itemSig(w)];
      if (p && p.status === 'da-thuoc') mastered++;
    });
    ring.textContent = mastered + '/' + total;
    var wrap = host.querySelector('#para-ring');
    if (wrap) {
      var pct = total ? Math.round(mastered / total * 100) : 0;
      wrap.style.setProperty('--para-pct', pct);
      wrap.classList.toggle('is-done', total > 0 && mastered === total);
    }
  }

  // ── Cross-unit "Ôn Paraphrase" due-review ───────────────────────────────
  async function openParaphraseReviewModal() {
    var data;
    try {
      data = await fetch(api() + '/vocab/paraphrase/review-queue?limit=50', { headers: authH() })
        .then(function (r) { return window.ApiClient.handleResponse(r); });
    } catch (e) {
      say('Không tải được danh sách ôn paraphrase. Thử lại sau', 'error');
      return;
    }
    var items = (data && data.items) || [];
    if (!items.length) {
      say('🎉 Không còn cụm paraphrase nào đến hạn ôn!', 'success');
      return;
    }
    _startParaphraseReviewQuiz(items);
  }

  function _startParaphraseReviewQuiz(items) {
    _isBookPractice = false;
    _isHardWordsSession = false;
    currentBookId = null;
    currentUnit = {
      // No _id → dashboard.js's _isParaphraseUnitSession() stays false, so
      // the búa-Daniel / practice-complete path doesn't fire for a review.
      // Each item keeps its own source unit id for the SRS sync.
      words: items.map(function (it) {
        return {
          type: 'paraphrase',
          word: it.word, paraphrase: it.paraphrase, meaning: it.meaning || '', explanation: it.explanation || '',
          _paraUnitId: it.unitId,
        };
      }),
      title: 'Ôn Paraphrase',
    };
    document.getElementById('view-mybook').style.display = 'none';
    var lessonView = document.getElementById('view-lesson');
    if (lessonView) lessonView.style.display = 'none';
    document.getElementById('view-unit').style.display = 'flex';
    document.getElementById('unitTitle').textContent = '🔑 Ôn Paraphrase – ' + items.length + ' cụm';
    if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'auto' });
    showMode('mixed');
  }

  // ── Hooks called by dashboard.js's practice engine ──────────────────────
  // Accumulate one binary outcome per answered paraphrase pair; "ever wrong
  // this session wins" (matches _syncPracticeEvidence's rule for notebook
  // words).
  var _paraEvidence = new Map();
  var _paraSynced = false;

  function resetParaphraseEvidence() {
    _paraEvidence = new Map();
    _paraSynced = false;
  }

  function noteParaphraseAnswered(word, correct) {
    if (!word || !word.paraphrase) return;
    var k = itemSig(word);
    var prev = _paraEvidence.get(k);
    _paraEvidence.set(k, {
      item: word,
      correct: prev ? (prev.correct && correct) : correct,
    });
  }

  function syncParaphraseEvidence() {
    if (_paraSynced || !_paraEvidence.size) return;
    _paraSynced = true;
    var base = api() + '/vocab/paraphrase/review';
    var fallbackUnitId = (typeof currentUnit !== 'undefined' && currentUnit && currentUnit._id) || null;
    var calls = [];
    _paraEvidence.forEach(function (v) {
      var unitId = v.item._paraUnitId || fallbackUnitId;
      if (!unitId) return;
      calls.push(fetch(base, {
        method: 'POST', headers: authH(),
        body: JSON.stringify({
          unitId: unitId,
          word: v.item.word, paraphrase: v.item.paraphrase || '',
          meaning: v.item.meaning || '', explanation: v.item.explanation || '',
          rating: v.correct ? 'da-thuoc' : 'chua-thuoc',
        }),
      }).catch(function () {}));
    });
    if (calls.length) Promise.all(calls).catch(function () {});
  }

  window.mountParaphraseStudy = mountParaphraseStudy;
  window.openParaphraseReviewModal = openParaphraseReviewModal;
  window.noteParaphraseAnswered = noteParaphraseAnswered;
  window.syncParaphraseEvidence = syncParaphraseEvidence;
  window.resetParaphraseEvidence = resetParaphraseEvidence;
})();
