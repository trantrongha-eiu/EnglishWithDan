/**
 * shared/review-inline.js — per-mistake review form, mounted INLINE right
 * next to a wrong/skipped question's own already-visible answer/explanation
 * block on the Reading/Listening review screen (reading-v2.js's
 * renderReview(), listening.html's review renderers). Replaces the older
 * floating review-drawer.js walkthrough: there's no popup/panel anymore —
 * students asked for the review controls to sit right where the question
 * is, and for the "retry this question" step to be removed entirely (the
 * correct answer is already shown unconditionally on this screen, so
 * there's nothing left to hide/retry for).
 *
 * Self-contained (own injected CSS, own IIFE) — does not depend on
 * review-drawer.js's internals; only shows the "classify + reflect" form,
 * never the question text/answer itself (that's already on the page).
 *
 * Host page calls window.ReviewInline.mount(anchorEl, mistake, opts):
 *   anchorEl — element to mount the toggle+form against.
 *   mistake  — one entry from an AttemptReview doc's `mistakes[]` (has
 *              _id, questionNumber, userAnswer, questionType, completedAt,
 *              errorCategory, errorReason, confidence, learningPoint, ...).
 *   opts.skill      — 'reading' | 'listening'
 *   opts.mode       — 'beforeend' (append inside anchorEl) or 'afterend'
 *                      (insert as anchorEl's next sibling)
 *   opts.reviewId   — the AttemptReview doc's _id (for the PATCH URL)
 *   opts.onSaved(updatedMistake) — called after a successful save
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
  var _categoriesByTypeCache = {};
  async function _getTaxonomy(skill) {
    if (_taxonomyCache[skill]) return _taxonomyCache[skill];
    var d = await _api('/review/taxonomy?skill=' + encodeURIComponent(skill));
    _taxonomyCache[skill] = d.taxonomy || {};
    _categoriesByTypeCache[skill] = d.categoriesByType || {};
    return _taxonomyCache[skill];
  }

  function _categoriesFor(skill, questionType, alreadySelected, taxonomy) {
    var all = Object.keys(taxonomy);
    var relevant = _categoriesByTypeCache[skill] && _categoriesByTypeCache[skill][questionType];
    var list = (relevant && relevant.length) ? relevant.filter(function (c) { return all.indexOf(c) !== -1; }) : all;
    if (alreadySelected && list.indexOf(alreadySelected) === -1) list = list.concat(alreadySelected);
    return list;
  }

  function _injectStyles() {
    if (document.getElementById('ri-styles')) return;
    var s = document.createElement('style');
    s.id = 'ri-styles';
    s.textContent =
      '.ri-block{display:block;width:100%;flex-basis:100%;white-space:normal;overflow-wrap:break-word;margin-top:6px;box-sizing:border-box}' +
      '.ri-toggle-btn{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:var(--blue,#3d8bff);background:var(--surface2,#eff6ff);border:1px solid var(--blue,#3d8bff);border-radius:8px;padding:5px 10px;cursor:pointer;font-family:inherit}' +
      '.ri-toggle-btn:hover{background:var(--blue,#3d8bff);color:#fff}' +
      '.ri-done-badge{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:700;color:#15803d;background:#dcfce7;border-radius:8px;padding:5px 10px}' +
      '[data-theme="dark"] .ri-done-badge{background:#052e1c;color:#4ade80}' +
      '.ri-form-container{margin-top:8px;padding:12px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:var(--surface,#fff);max-width:480px}' +
      '.ri-section-label{font-size:12px;font-weight:700;color:var(--text2,#374151);margin:10px 0 6px}' +
      '.ri-section-label:first-child{margin-top:0}' +
      '.ri-select,.ri-input,.ri-textarea{width:100%;border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:8px 10px;font-family:inherit;font-size:13px;background:var(--bg,var(--surface,#fff));color:var(--text,#111827);box-sizing:border-box}' +
      '.ri-textarea{resize:vertical;min-height:48px}' +
      '.ri-blank-note{font-size:12.5px;color:var(--text3,#6b7280);background:var(--surface2,#f3f4f6);border-radius:8px;padding:8px 10px;line-height:1.5}' +
      '.ri-chip-row{display:flex;gap:6px;flex-wrap:wrap}' +
      '.ri-chip{border:1.5px solid var(--border,#e5e7eb);background:var(--surface,#fff);border-radius:20px;padding:6px 12px;font-size:12.5px;cursor:pointer;color:var(--text2,#374151);font-family:inherit}' +
      '.ri-chip.active{border-color:var(--blue,#3d8bff);background:var(--blue,#3d8bff);color:#fff;font-weight:700}' +
      'details.ri-optional{margin-top:10px;font-size:12.5px}' +
      'details.ri-optional summary{cursor:pointer;color:var(--text3,#6b7280);font-weight:600}' +
      'details.ri-optional .ri-textarea{margin-top:8px}' +
      '.ri-save-btn{margin-top:12px;width:100%;padding:9px;border:none;border-radius:8px;background:var(--blue,#3d8bff);color:#fff;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit}' +
      '.ri-save-btn:disabled{opacity:.5;cursor:default}';
    document.head.appendChild(s);
  }

  // Removes any wrapper already mounted for this qnum (either a real
  // duplicate, or a stale one left behind by a tab/part-switch cache
  // restore that wiped its event listeners) and always rebuilds fresh —
  // simplest-correct over trying to surgically preserve in-progress form
  // state across a DOM round-trip. See the redesign plan's "tab-switch
  // caching" note: an unsaved, mid-open form collapsing back to its toggle
  // after switching passage tabs and back is an accepted trade-off.
  function mount(anchorEl, mistake, opts) {
    if (!anchorEl || !mistake) return;
    _injectStyles();
    var qnum = mistake.questionNumber;
    var existing = (anchorEl.matches && anchorEl.matches('.ri-toggle-wrap'))
      ? (anchorEl.dataset.qnum == qnum ? anchorEl : null)
      : anchorEl.querySelector('.ri-toggle-wrap[data-qnum="' + qnum + '"]');
    var insertTarget = existing || document.createElement('div');
    if (existing) existing.replaceWith(insertTarget);

    insertTarget.className = 'ri-toggle-wrap ri-block';
    insertTarget.dataset.qnum = qnum;

    if (mistake.completedAt) {
      insertTarget.innerHTML = '<span class="ri-done-badge"><i class="fas fa-check"></i> Đã review</span>';
    } else {
      insertTarget.innerHTML =
        '<button type="button" class="ri-toggle-btn"><i class="fas fa-pen"></i> Review lỗi này</button>' +
        '<div class="ri-form-container" style="display:none"></div>';
      var btn = insertTarget.querySelector('.ri-toggle-btn');
      var formContainer = insertTarget.querySelector('.ri-form-container');
      btn.addEventListener('click', function () {
        var isOpen = formContainer.style.display !== 'none';
        if (isOpen) { formContainer.style.display = 'none'; return; }
        formContainer.style.display = 'block';
        if (!formContainer.dataset.rendered) {
          formContainer.dataset.rendered = '1';
          _renderForm(formContainer, mistake, opts, insertTarget);
        }
      });
    }

    if (!existing) {
      if (opts.mode === 'afterend') anchorEl.insertAdjacentElement('afterend', insertTarget);
      else anchorEl.appendChild(insertTarget);
    }
  }

  async function _renderForm(container, mistake, opts, wrap) {
    container.innerHTML = '<div style="text-align:center;padding:10px"><i class="fas fa-spinner fa-spin"></i></div>';
    var taxonomy;
    try {
      taxonomy = await _getTaxonomy(opts.skill);
    } catch (e) {
      container.innerHTML = '<p style="color:#ef4444;font-size:12.5px">Không tải được danh sách lỗi. Thử lại sau.</p>';
      return;
    }

    var categories = _categoriesFor(opts.skill, opts.questionType, mistake.errorCategory, taxonomy);
    // Same rationale as the old drawer: a blank answer means nothing was
    // actually attempted, so "how confident were you" has no sensible
    // answer — swapped for a short note, and 'left-blank' recorded instead
    // of one of the 3 real confidence levels.
    var isBlank = !mistake.userAnswer || !mistake.userAnswer.trim();

    var confidenceSectionHtml = isBlank
      ? '<div class="ri-section-label">Bạn đã bỏ trống câu này</div>' +
        '<div class="ri-blank-note">Không có gì để đánh giá độ tự tin.</div>'
      : '<div class="ri-section-label">Bạn tự tin đến mức nào?</div>' +
        '<div class="ri-chip-row" id="ri-confidence-' + mistake._id + '">' +
          Object.keys(CONFIDENCE_LABELS).map(function (k) {
            return '<button type="button" class="ri-chip' + (mistake.confidence === k ? ' active' : '') + '" data-val="' + k + '">' + CONFIDENCE_LABELS[k] + '</button>';
          }).join('') +
        '</div>';

    var uid = mistake._id;
    container.innerHTML =
      '<div class="ri-section-label">Vì sao bạn sai?</div>' +
      '<select class="ri-select" id="ri-category-' + uid + '">' +
        '<option value="">-- Chọn nhóm lỗi --</option>' +
        categories.map(function (c) { return '<option value="' + escHtml(c) + '"' + (mistake.errorCategory === c ? ' selected' : '') + '>' + escHtml(c) + '</option>'; }).join('') +
      '</select>' +
      '<select class="ri-select" id="ri-reason-' + uid + '" style="margin-top:6px">' +
        '<option value="">-- Chọn lý do cụ thể --</option>' +
      '</select>' +

      confidenceSectionHtml +

      '<div class="ri-section-label">Bạn cần nhớ điều gì?</div>' +
      '<div class="ri-chip-row" id="ri-learning-' + uid + '">' +
        Object.keys(LEARNING_LABELS).map(function (k) {
          return '<button type="button" class="ri-chip' + (mistake.learningPoint && mistake.learningPoint.category === k ? ' active' : '') + '" data-val="' + k + '">' + LEARNING_LABELS[k] + '</button>';
        }).join('') +
      '</div>' +
      '<textarea class="ri-textarea" id="ri-learning-content-' + uid + '" placeholder="VD: allocate = distribute/assign" style="margin-top:6px">' + escHtml((mistake.learningPoint && mistake.learningPoint.content) || '') + '</textarea>' +

      '<details class="ri-optional"' + ((mistake.evidence || mistake.temptingAnswerNote || mistake.note) ? ' open' : '') + '>' +
        '<summary>Bằng chứng / Vì sao đáp án sai lại hấp dẫn? / Ghi chú (không bắt buộc)</summary>' +
        '<textarea class="ri-textarea" id="ri-evidence-' + uid + '" placeholder="Bằng chứng trong bài...">' + escHtml(mistake.evidence || '') + '</textarea>' +
        '<textarea class="ri-textarea" id="ri-tempting-' + uid + '" placeholder="Vì sao đáp án sai lại hấp dẫn?" style="margin-top:6px">' + escHtml(mistake.temptingAnswerNote || '') + '</textarea>' +
        '<textarea class="ri-textarea" id="ri-note-' + uid + '" placeholder="Ghi chú của riêng bạn..." style="margin-top:6px">' + escHtml(mistake.note || '') + '</textarea>' +
      '</details>' +

      '<button type="button" class="ri-save-btn" id="ri-save-' + uid + '">Lưu</button>';

    var catSel = document.getElementById('ri-category-' + uid);
    var reasonSel = document.getElementById('ri-reason-' + uid);
    function fillReasons(selected) {
      var reasons = catSel.value ? Object.keys(taxonomy[catSel.value] || {}) : [];
      reasonSel.innerHTML = '<option value="">-- Chọn lý do cụ thể --</option>' +
        reasons.map(function (r) { return '<option value="' + escHtml(r) + '"' + (r === selected ? ' selected' : '') + '>' + escHtml(r) + '</option>'; }).join('');
    }
    fillReasons(mistake.errorReason);
    catSel.addEventListener('change', function () { fillReasons(null); });

    container.querySelectorAll('#ri-confidence-' + uid + ' .ri-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        container.querySelectorAll('#ri-confidence-' + uid + ' .ri-chip').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });
    container.querySelectorAll('#ri-learning-' + uid + ' .ri-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        container.querySelectorAll('#ri-learning-' + uid + ' .ri-chip').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });

    document.getElementById('ri-save-' + uid).addEventListener('click', function () {
      _submit(mistake, opts, container, wrap, isBlank);
    });
  }

  async function _submit(mistake, opts, container, wrap, isBlank) {
    var uid = mistake._id;
    var category = document.getElementById('ri-category-' + uid).value;
    var reason = document.getElementById('ri-reason-' + uid).value;
    var confidenceBtn = container.querySelector('#ri-confidence-' + uid + ' .ri-chip.active');
    var confidenceVal = isBlank ? 'left-blank' : (confidenceBtn && confidenceBtn.getAttribute('data-val'));
    var learningBtn = container.querySelector('#ri-learning-' + uid + ' .ri-chip.active');

    if (!category || !reason) { window.showToastWithTitle && window.showToastWithTitle('warning', 'Thiếu thông tin', 'Vui lòng chọn lý do sai'); return; }
    if (!isBlank && !confidenceBtn) { window.showToastWithTitle && window.showToastWithTitle('warning', 'Thiếu thông tin', 'Vui lòng chọn mức độ tự tin'); return; }
    if (!learningBtn) { window.showToastWithTitle && window.showToastWithTitle('warning', 'Thiếu thông tin', 'Vui lòng chọn 1 điều cần nhớ'); return; }

    var btn = document.getElementById('ri-save-' + uid);
    btn.disabled = true; btn.textContent = 'Đang lưu...';
    try {
      var patch = {
        errorCategory: category, errorReason: reason, confidence: confidenceVal,
        evidence: document.getElementById('ri-evidence-' + uid).value,
        temptingAnswerNote: document.getElementById('ri-tempting-' + uid).value,
        note: document.getElementById('ri-note-' + uid).value,
        learningPoint: { category: learningBtn.getAttribute('data-val'), content: document.getElementById('ri-learning-content-' + uid).value },
      };
      var d = await _api('/review/' + opts.reviewId + '/mistakes/' + uid, { method: 'PATCH', body: JSON.stringify(patch) });
      var updated = d.review.mistakes.find(function (m) { return String(m._id) === String(uid); }) || mistake;
      wrap.innerHTML = '<span class="ri-done-badge"><i class="fas fa-check"></i> Đã review</span>';
      if (opts.onSaved) opts.onSaved(updated, d);
    } catch (e) {
      window.showToastWithTitle && window.showToastWithTitle('error', 'Lỗi', e.message || 'Không lưu được');
      btn.disabled = false; btn.textContent = 'Lưu';
    }
  }

  window.ReviewInline = { mount: mount };
})();
