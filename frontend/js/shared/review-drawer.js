/**
 * shared/review-drawer.js — the mandatory post-test "guided mistake review"
 * drawer, shared between reading-v2.js's and listening.html's existing
 * review screens (not a new full-screen flow — it's a slide-over that sits
 * on top of whichever passage/transcript view is already rendered
 * underneath, so the student can still see the real context).
 *
 * Builds its own DOM/CSS (same self-contained pattern as
 * shared/peer-chat-widget.js) so it works on both host pages without any
 * markup of their own — just include this script after auth-service.js/
 * toast.js/utils.js, and (if word-saving should work inside it)
 * dictionary-lookup.js.
 *
 * Host page calls window.openReviewDrawer(review, opts):
 *   review — an AttemptReview doc from GET /api/review/:id or
 *            /api/review/by-attempt/:type/:attemptId (has _id, mistakes[]).
 *   opts.skill              — 'reading' | 'listening'
 *   opts.getQuestionMeta(qNum) — optional; return {questionText, options}
 *            if the host page can supply the original question's answer
 *            options (renders a radio-button retry input instead of a
 *            plain text box).
 *   opts.onJumpToContext(qNum) — called when the student taps "Xem lại đề/
 *            audio gốc" — host page scrolls the passage to that question or
 *            seeks the audio player.
 *   opts.onClose(summary)   — called when the drawer is dismissed (summary
 *            is null unless the review was completed this session).
 */
(function () {
  'use strict';
  if (!window.AuthService || !window.AuthService.isLoggedIn()) return;

  var API_BASE = window.AuthService.API || 'https://englishwithdan.onrender.com/api';

  async function _api(path, opts) {
    opts = opts || {};
    var res = await fetch(API_BASE + path, Object.assign({}, opts, {
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        window.AuthService.authHeader(),
        opts.headers || {}
      )
    }));
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.message || ('HTTP ' + res.status));
    return data;
  }

  var CONFIDENCE_LABELS = { 'very-confident': '🟢 Rất tự tin', 'not-sure': '🟡 Không chắc', 'guessing': '🔴 Đoán mò' };
  var LEARNING_LABELS = { 'vocabulary': '📚 Từ vựng', 'strategy': '🧠 Chiến lược', 'grammar': '📝 Ngữ pháp', 'ielts-trap': '⚠️ Bẫy IELTS' };

  var _taxonomyCache = {};
  async function _getTaxonomy(skill) {
    if (_taxonomyCache[skill]) return _taxonomyCache[skill];
    var d = await _api('/review/taxonomy?skill=' + encodeURIComponent(skill));
    _taxonomyCache[skill] = d.taxonomy || {};
    return _taxonomyCache[skill];
  }

  function _injectStyles() {
    if (document.getElementById('rd-styles')) return;
    var s = document.createElement('style');
    s.id = 'rd-styles';
    s.textContent =
      '#rd-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1400;display:none}' +
      '#rd-backdrop.open{display:block}' +
      '#rd-root{position:fixed;top:0;right:0;bottom:0;width:420px;max-width:calc(100vw - 24px);background:var(--surface,#fff);box-shadow:-8px 0 30px rgba(0,0,0,.25);z-index:1401;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .25s ease}' +
      '#rd-backdrop.open #rd-root{transform:translateX(0)}' +
      '.rd-header{padding:14px 16px;border-bottom:1px solid var(--border,#e5e7eb);display:flex;align-items:center;gap:10px;flex-shrink:0}' +
      '.rd-header-title{font-weight:800;font-size:14.5px;color:var(--text,#111827);flex:1}' +
      '.rd-progress{font-size:12px;color:var(--text3,#9ca3af)}' +
      '.rd-close-btn{background:none;border:none;font-size:16px;color:var(--text3,#6b7280);cursor:pointer;padding:4px}' +
      '#rd-body{flex:1;overflow-y:auto;padding:16px}' +
      '.rd-answers{background:var(--surface2,#f3f4f6);border-radius:10px;padding:10px 12px;font-size:13px;margin-bottom:14px;line-height:1.7}' +
      '.rd-answers .wrong{color:#ef4444;font-weight:700}' +
      '.rd-answers .right{color:#16a34a;font-weight:700}' +
      '.rd-section-label{font-size:12px;font-weight:700;color:var(--text2,#374151);margin:14px 0 6px}' +
      '.rd-select,.rd-input,.rd-textarea{width:100%;border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:8px 10px;font-family:inherit;font-size:13px;background:var(--bg,var(--surface,#fff));color:var(--text,#111827)}' +
      '.rd-textarea{resize:vertical;min-height:52px}' +
      '.rd-chip-row{display:flex;gap:6px;flex-wrap:wrap}' +
      '.rd-chip{border:1.5px solid var(--border,#e5e7eb);background:var(--surface,#fff);border-radius:20px;padding:6px 12px;font-size:12.5px;cursor:pointer;color:var(--text2,#374151)}' +
      '.rd-chip.active{border-color:var(--blue,#3d8bff);background:var(--blue,#3d8bff);color:#fff;font-weight:700}' +
      '.rd-retry-result{margin-top:8px;font-size:12.5px;font-weight:700;padding:6px 10px;border-radius:8px}' +
      '.rd-retry-result.correct{background:#dcfce7;color:#15803d}' +
      '.rd-retry-result.wrong{background:#fee2e2;color:#dc2626}' +
      '.rd-jump-link{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:var(--blue,#3d8bff);cursor:pointer;margin-bottom:10px;background:none;border:none;padding:0;font-family:inherit}' +
      'details.rd-optional{margin-top:10px;font-size:12.5px}' +
      'details.rd-optional summary{cursor:pointer;color:var(--text3,#6b7280);font-weight:600}' +
      'details.rd-optional .rd-textarea{margin-top:8px}' +
      '.rd-footer{padding:12px 16px;border-top:1px solid var(--border,#e5e7eb);flex-shrink:0}' +
      '.rd-save-btn{width:100%;padding:11px;border:none;border-radius:10px;background:var(--blue,#3d8bff);color:#fff;font-weight:700;font-size:14px;cursor:pointer}' +
      '.rd-save-btn:disabled{opacity:.5;cursor:default}' +
      '.rd-complete{text-align:center;padding:30px 10px}' +
      '.rd-complete-emoji{font-size:44px;margin-bottom:10px}' +
      '.rd-complete-stats{font-size:13px;color:var(--text2,#374151);line-height:1.8;margin:14px 0}' +
      '@media(max-width:480px){#rd-root{width:100vw;max-width:100vw}}';
    document.head.appendChild(s);
  }

  var _rd = null; // { review, opts, idx, taxonomy, vocabCount }
  var _root, _backdrop, _body, _footer, _progressEl;

  function _buildDom() {
    if (_root) return;
    _injectStyles();
    _backdrop = document.createElement('div');
    _backdrop.id = 'rd-backdrop';
    _backdrop.innerHTML =
      '<div id="rd-root">' +
        '<div class="rd-header">' +
          '<span class="rd-header-title">📝 Review lỗi sai</span>' +
          '<span class="rd-progress" id="rd-progress"></span>' +
          '<button class="rd-close-btn" id="rd-close-btn" title="Đóng"><i class="fas fa-times"></i></button>' +
        '</div>' +
        '<div id="rd-body"></div>' +
        '<div class="rd-footer" id="rd-footer"></div>' +
      '</div>';
    document.body.appendChild(_backdrop);
    _body = document.getElementById('rd-body');
    _footer = document.getElementById('rd-footer');
    _progressEl = document.getElementById('rd-progress');
    document.getElementById('rd-close-btn').addEventListener('click', _close);
    _backdrop.addEventListener('click', function (e) { if (e.target === _backdrop) _close(); });

    document.addEventListener('click', function (e) {
      if (_rd && e.target.closest && e.target.closest('.dict-save-btn')) _rd.vocabCount++;
    });
  }

  function _firstIncompleteIdx(mistakes) {
    for (var i = 0; i < mistakes.length; i++) if (!mistakes[i].completedAt) return i;
    return -1;
  }

  async function openReviewDrawer(review, opts) {
    _buildDom();
    var taxonomy = await _getTaxonomy(opts.skill);
    _rd = { review: review, opts: opts, taxonomy: taxonomy, vocabCount: 0 };
    _rd.idx = _firstIncompleteIdx(review.mistakes);
    if (window.setupDictionaryDouble) window.setupDictionaryDouble('rd-body', opts.skill + '-review');
    _backdrop.classList.add('open');
    _renderStep();
  }

  function _close() {
    _backdrop.classList.remove('open');
    var opts = _rd && _rd.opts;
    _rd = null;
    if (opts && opts.onClose) opts.onClose(null);
  }

  function _renderStep() {
    if (_rd.idx === -1) { _renderComplete(); return; }
    var mistakes = _rd.review.mistakes;
    var m = mistakes[_rd.idx];
    var doneCount = mistakes.filter(function (x) { return x.completedAt; }).length;
    _progressEl.textContent = 'Câu ' + (doneCount + 1) + ' / ' + mistakes.length;

    var meta = (_rd.opts.getQuestionMeta && _rd.opts.getQuestionMeta(m.questionNumber)) || {};
    var categories = Object.keys(_rd.taxonomy);

    _body.innerHTML =
      '<button class="rd-jump-link" id="rd-jump-btn"><i class="fas fa-arrow-up-right-from-square"></i> Xem lại đề/đoạn văn gốc</button>' +
      '<div class="rd-answers">' +
        '<div><strong>Câu ' + m.questionNumber + '</strong>' + (meta.questionText ? ': ' + escHtml(meta.questionText) : '') + '</div>' +
        '<div>Bạn chọn: <span class="wrong">' + escHtml(m.userAnswer || '(bỏ trống)') + '</span></div>' +
        '<div>Đáp án đúng: <span class="right">' + escHtml(m.correctAnswer) + '</span></div>' +
      '</div>' +

      '<div class="rd-section-label">1. Vì sao bạn sai?</div>' +
      '<select class="rd-select" id="rd-category">' +
        '<option value="">-- Chọn nhóm lỗi --</option>' +
        categories.map(function (c) { return '<option value="' + escHtml(c) + '"' + (m.errorCategory === c ? ' selected' : '') + '>' + escHtml(c) + '</option>'; }).join('') +
      '</select>' +
      '<select class="rd-select" id="rd-reason" style="margin-top:6px">' +
        '<option value="">-- Chọn lý do cụ thể --</option>' +
      '</select>' +

      '<div class="rd-section-label">2. Bạn tự tin đến mức nào?</div>' +
      '<div class="rd-chip-row" id="rd-confidence">' +
        Object.keys(CONFIDENCE_LABELS).map(function (k) {
          return '<button type="button" class="rd-chip' + (m.confidence === k ? ' active' : '') + '" data-val="' + k + '">' + CONFIDENCE_LABELS[k] + '</button>';
        }).join('') +
      '</div>' +

      '<div class="rd-section-label">3. Thử lại câu này</div>' +
      (meta.options && meta.options.length
        ? '<div class="rd-chip-row" id="rd-retry-options">' +
            meta.options.map(function (o) { return '<button type="button" class="rd-chip rd-retry-opt" data-val="' + escHtml(o) + '">' + escHtml(o) + '</button>'; }).join('') +
          '</div><input type="hidden" id="rd-retry">'
        : '<input class="rd-input" id="rd-retry" placeholder="Nhập lại đáp án...">') +
      '<div id="rd-retry-result"></div>' +

      '<details class="rd-optional">' +
        '<summary>Bằng chứng / Vì sao đáp án sai lại hấp dẫn? / Ghi chú (không bắt buộc)</summary>' +
        '<textarea class="rd-textarea" id="rd-evidence" placeholder="Bằng chứng trong bài..."></textarea>' +
        '<textarea class="rd-textarea" id="rd-tempting" placeholder="Vì sao đáp án sai lại hấp dẫn?" style="margin-top:6px"></textarea>' +
        '<textarea class="rd-textarea" id="rd-note" placeholder="Ghi chú của riêng bạn..." style="margin-top:6px"></textarea>' +
      '</details>' +

      '<div class="rd-section-label">4. Bạn cần nhớ điều gì?</div>' +
      '<div class="rd-chip-row" id="rd-learning-cat">' +
        Object.keys(LEARNING_LABELS).map(function (k) {
          return '<button type="button" class="rd-chip' + (m.learningPoint?.category === k ? ' active' : '') + '" data-val="' + k + '">' + LEARNING_LABELS[k] + '</button>';
        }).join('') +
      '</div>' +
      '<textarea class="rd-textarea" id="rd-learning-content" placeholder="VD: allocate = distribute/assign" style="margin-top:6px"></textarea>';

    // Wire category -> reason cascade
    var catSel = document.getElementById('rd-category');
    var reasonSel = document.getElementById('rd-reason');
    function fillReasons(selected) {
      var reasons = catSel.value ? Object.keys(_rd.taxonomy[catSel.value] || {}) : [];
      reasonSel.innerHTML = '<option value="">-- Chọn lý do cụ thể --</option>' +
        reasons.map(function (r) { return '<option value="' + escHtml(r) + '"' + (r === selected ? ' selected' : '') + '>' + escHtml(r) + '</option>'; }).join('');
    }
    fillReasons(m.errorReason);
    catSel.addEventListener('change', function () { fillReasons(null); });

    document.querySelectorAll('#rd-confidence .rd-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#rd-confidence .rd-chip').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });
    document.querySelectorAll('#rd-learning-cat .rd-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#rd-learning-cat .rd-chip').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });
    if (meta.options && meta.options.length) {
      document.querySelectorAll('.rd-retry-opt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.rd-retry-opt').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          document.getElementById('rd-retry').value = btn.getAttribute('data-val');
        });
      });
    }

    document.getElementById('rd-jump-btn').addEventListener('click', function () {
      if (_rd.opts.onJumpToContext) _rd.opts.onJumpToContext(m.questionNumber);
    });

    _footer.innerHTML = '<button class="rd-save-btn" id="rd-save-btn">Lưu & câu tiếp theo</button>';
    document.getElementById('rd-save-btn').addEventListener('click', _saveCurrent);
  }

  async function _saveCurrent() {
    var m = _rd.review.mistakes[_rd.idx];
    var category = document.getElementById('rd-category').value;
    var reason = document.getElementById('rd-reason').value;
    var confidenceBtn = document.querySelector('#rd-confidence .rd-chip.active');
    var retryAnswer = document.getElementById('rd-retry').value.trim();
    var learningBtn = document.querySelector('#rd-learning-cat .rd-chip.active');

    if (!category || !reason) { window.showToastWithTitle && window.showToastWithTitle('warning', 'Thiếu thông tin', 'Vui lòng chọn lý do sai'); return; }
    if (!confidenceBtn) { window.showToastWithTitle && window.showToastWithTitle('warning', 'Thiếu thông tin', 'Vui lòng chọn mức độ tự tin'); return; }
    if (!retryAnswer) { window.showToastWithTitle && window.showToastWithTitle('warning', 'Thiếu thông tin', 'Vui lòng thử lại câu hỏi'); return; }
    if (!learningBtn) { window.showToastWithTitle && window.showToastWithTitle('warning', 'Thiếu thông tin', 'Vui lòng chọn 1 điều cần nhớ'); return; }

    var btn = document.getElementById('rd-save-btn');
    btn.disabled = true; btn.textContent = 'Đang lưu...';
    try {
      var patch = {
        errorCategory: category, errorReason: reason,
        confidence: confidenceBtn.getAttribute('data-val'),
        retryAnswer: retryAnswer,
        evidence: document.getElementById('rd-evidence').value,
        temptingAnswerNote: document.getElementById('rd-tempting').value,
        note: document.getElementById('rd-note').value,
        learningPoint: { category: learningBtn.getAttribute('data-val'), content: document.getElementById('rd-learning-content').value },
      };
      var d = await _api('/review/' + _rd.review._id + '/mistakes/' + m._id, { method: 'PATCH', body: JSON.stringify(patch) });
      _rd.review = d.review;

      var updated = d.review.mistakes.find(function (x) { return String(x._id) === String(m._id); });
      if (updated && updated.retryResult) {
        var resEl = document.getElementById('rd-retry-result');
        resEl.className = 'rd-retry-result ' + updated.retryResult;
        resEl.textContent = updated.retryResult === 'correct' ? '✅ Lần này bạn đã chọn đúng!' : '❌ Vẫn chưa đúng — xem lại kiến thức nhé.';
        await new Promise(function (r) { setTimeout(r, 900); }); // let the student see the result before advancing
      }

      _rd.idx = _firstIncompleteIdx(_rd.review.mistakes);
      _renderStep();
    } catch (e) {
      window.showToastWithTitle && window.showToastWithTitle('error', 'Lỗi', e.message || 'Không lưu được');
      btn.disabled = false; btn.textContent = 'Lưu & câu tiếp theo';
    }
  }

  function _renderComplete() {
    var mistakes = _rd.review.mistakes;
    var categories = new Set(mistakes.map(function (m) { return m.errorCategory; }).filter(Boolean));
    _progressEl.textContent = '';
    _body.innerHTML =
      '<div class="rd-complete">' +
        '<div class="rd-complete-emoji">🎉</div>' +
        '<div style="font-weight:800;font-size:16px">Hoàn thành Review!</div>' +
        '<div class="rd-complete-stats">' +
          'Đã review <strong>' + mistakes.length + '</strong> câu sai<br>' +
          (_rd.vocabCount > 0 ? '<strong>' + _rd.vocabCount + '</strong> từ vựng đã lưu<br>' : '') +
          '<strong>' + categories.size + '</strong> nhóm kỹ năng cần cải thiện' +
        '</div>' +
      '</div>';
    _footer.innerHTML = '<button class="rd-save-btn" id="rd-done-btn">Đóng</button>';
    var summary = { mistakesReviewed: mistakes.length, vocabSaved: _rd.vocabCount, distinctErrorCategories: categories.size };
    document.getElementById('rd-done-btn').addEventListener('click', function () {
      _backdrop.classList.remove('open');
      var opts = _rd.opts;
      _rd = null;
      if (opts.onClose) opts.onClose(summary);
    });
  }

  window.openReviewDrawer = openReviewDrawer;
})();
