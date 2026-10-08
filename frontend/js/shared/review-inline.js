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
 * Saving: students complained that after reviewing and leaving, the test
 * was demanded again — every mistake used to need its own "Lưu" click, and
 * anything typed but not saved (or sitting in another passage/part tab)
 * was silently lost on exit. Now:
 *   - every form edit is kept as a draft (in memory + localStorage, so it
 *     survives tab switches, reloads and leaving the screen) and auto-saved
 *     to the server a moment later — partial answers included, the server
 *     only marks a mistake reviewed once its core fields are all filled;
 *   - a floating "Lưu review" bar shows progress across the WHOLE review
 *     (all tabs of a full test) and flushes every draft at once;
 *   - drafts still unsent on pagehide go out with keepalive, and any left
 *     in localStorage are re-sent the next time this review is opened.
 *
 * Host page API:
 *   window.ReviewInline.setContext({ reviewId, skill, mistakes, onSaved })
 *     — once per review screen load, with the AttemptReview doc's full
 *       mistakes[] (every tab, not just the visible one). onSaved(mistake,
 *       data) fires whenever a mistake flips reviewed/not-reviewed, so the
 *       host can refresh its tab badges / pending banner. setContext(null)
 *       when the attempt has no review doc.
 *   window.ReviewInline.mount(anchorEl, mistake, opts):
 *     anchorEl — element to mount the toggle+form against.
 *     mistake  — one entry from the AttemptReview doc's `mistakes[]`.
 *     opts.skill      — 'reading' | 'listening'
 *     opts.mode       — 'beforeend' (append inside anchorEl) or 'afterend'
 *                        (insert as anchorEl's next sibling)
 *     opts.reviewId   — the AttemptReview doc's _id (for the PATCH URL)
 *     opts.questionType — narrows the error-category list
 *   window.ReviewInline.saveAll() — same as clicking "Lưu review".
 */
(function () {
  'use strict';
  if (!window.AuthService || !window.AuthService.isLoggedIn()) return;

  var API_BASE = window.AuthService.API || 'https://englishwithdan.onrender.com/api';
  var AUTOSAVE_DELAY_MS = 1500;

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

  function _toast(type, title, msg) {
    if (window.showToastWithTitle) window.showToastWithTitle(type, title, msg);
  }

  var CONFIDENCE_LABELS = { 'very-confident': '🟢 Rất tự tin', 'not-sure': '🟡 Không chắc', 'guessing': '🔴 Đoán mò' };
  var LEARNING_LABELS = { 'vocabulary': '📚 Từ vựng', 'strategy': '🧠 Chiến lược', 'grammar': '📝 Ngữ pháp', 'ielts-trap': '⚠️ Bẫy IELTS' };
  var DONE_BADGE = '<span class="ri-done-badge"><i class="fas fa-check"></i> Đã review</span>';

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
      '.ri-save-btn:disabled{opacity:.5;cursor:default}' +
      '.ri-savebar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:950;display:none;align-items:center;gap:14px;width:max-content;max-width:calc(100% - 32px);box-sizing:border-box;padding:10px 10px 10px 16px;background:var(--surface,#fff);color:var(--text,#111827);border:1px solid var(--border,#e5e7eb);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.18);font-size:13px;font-family:inherit}' +
      '.ri-savebar.show{display:flex}' +
      '.ri-sb-info{min-width:0;flex:1;display:flex;flex-direction:column;gap:3px}' +
      '.ri-sb-count{font-weight:700;white-space:nowrap}' +
      '.ri-sb-status{font-size:11.5px;color:var(--text3,#6b7280);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.ri-sb-track{height:4px;min-width:150px;border-radius:99px;background:var(--surface2,#f3f4f6);overflow:hidden}' +
      '.ri-sb-track span{display:block;height:100%;background:var(--blue,#3d8bff);transition:width .3s}' +
      '.ri-savebar.done .ri-sb-count{color:#15803d}' +
      '[data-theme="dark"] .ri-savebar.done .ri-sb-count{color:#4ade80}' +
      '.ri-savebar.done .ri-sb-track span{background:#16a34a}' +
      '.ri-sb-btn{flex-shrink:0;display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border:none;border-radius:10px;background:var(--blue,#3d8bff);color:#fff;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit}' +
      '.ri-sb-btn:disabled{opacity:.6;cursor:default}' +
      '@media (max-width:640px){.ri-savebar{left:16px;right:16px;transform:none;width:auto;max-width:none;bottom:calc(108px + env(safe-area-inset-bottom,0px))}.ri-sb-track{min-width:0}}';
    document.head.appendChild(s);
  }

  // ── Review context, drafts & saving ───────────────────────────────────

  // _ctx = { reviewId, skill, onSaved, byId: {mistakeId: latest mistake},
  //          order: [mistakeId], drafts: {mistakeId: form values} }.
  // byId always holds the server's latest copy, so a remount after a tab
  // switch never prefills from the host's stale object.
  var _ctx = null;
  var _timers = {};
  var _queue = Promise.resolve();
  var _inFlight = 0;
  var _lastSavedAt = null;
  var _savingAll = false;

  function _draftKey(reviewId) { return 'ri-drafts:' + reviewId; }
  function _loadDrafts(reviewId) {
    try { return JSON.parse(localStorage.getItem(_draftKey(reviewId)) || '{}') || {}; } catch (e) { return {}; }
  }
  function _persistDrafts(ctx) {
    try {
      if (Object.keys(ctx.drafts).length) localStorage.setItem(_draftKey(ctx.reviewId), JSON.stringify(ctx.drafts));
      else localStorage.removeItem(_draftKey(ctx.reviewId));
    } catch (e) { /* storage unavailable — drafts stay in memory only */ }
  }

  function _isBlankAnswer(m) { return !m.userAnswer || !String(m.userAnswer).trim(); }

  function _valuesFromMistake(m) {
    var lp = m.learningPoint || {};
    return {
      category: m.errorCategory || '', reason: m.errorReason || '',
      confidence: m.confidence === 'left-blank' ? '' : (m.confidence || ''),
      learningCat: lp.category || '', learningContent: lp.content || '',
      evidence: m.evidence || '', tempting: m.temptingAnswerNote || '', note: m.note || '',
    };
  }

  function _isEmptyDraft(v) {
    return !v || !(v.category || v.confidence || v.learningCat || v.learningContent || v.evidence || v.tempting || v.note);
  }

  // Partial values are fine — the server only sets completedAt once the
  // core fields are all there. Category/reason go together (the server
  // validates them as a pair).
  function _patchFromValues(v, isBlank) {
    var patch = {
      evidence: v.evidence || '', temptingAnswerNote: v.tempting || '', note: v.note || '',
      learningPoint: { content: v.learningContent || '' },
    };
    if (v.learningCat) patch.learningPoint.category = v.learningCat;
    if (v.category && v.reason) { patch.errorCategory = v.category; patch.errorReason = v.reason; }
    var confidence = isBlank ? 'left-blank' : v.confidence;
    if (confidence) patch.confidence = confidence;
    return patch;
  }

  function _hasDrafts(ctx) {
    return Object.keys(ctx.drafts).some(function (id) { return !_isEmptyDraft(ctx.drafts[id]); });
  }

  function setContext(c) {
    if (!c || !c.reviewId) { _ctx = null; _renderBar(); return; }
    var reviewId = String(c.reviewId);
    var same = _ctx && _ctx.reviewId === reviewId ? _ctx : null;
    var ctx = {
      reviewId: reviewId, skill: c.skill, onSaved: c.onSaved || null,
      byId: {}, order: [], drafts: same ? same.drafts : _loadDrafts(reviewId),
    };
    (c.mistakes || []).forEach(function (m) {
      var id = String(m._id);
      ctx.byId[id] = m;
      ctx.order.push(id);
    });
    _ctx = ctx;
    _injectStyles();
    _startBarWatcher();
    // Drafts left over from a previous visit (e.g. the tab was closed before
    // the auto-save went out) — send them now.
    Object.keys(ctx.drafts).forEach(function (id) {
      if (ctx.byId[id]) _enqueueSave(ctx, id);
      else delete ctx.drafts[id];
    });
    _persistDrafts(ctx);
    _renderBar();
  }

  // mount() without a prior setContext() (older host code) still works —
  // the bar just only counts the mistakes mounted so far.
  function _ensureCtx(opts, mistake) {
    if (!_ctx || _ctx.reviewId !== String(opts.reviewId)) {
      setContext({ reviewId: opts.reviewId, skill: opts.skill, mistakes: [], onSaved: opts.onSaved });
    }
    var id = String(mistake._id);
    if (!_ctx.byId[id]) { _ctx.byId[id] = mistake; _ctx.order.push(id); }
    return _ctx;
  }

  // Saves run one at a time — each PATCH re-reads and re-saves the whole
  // AttemptReview doc server-side, so parallel requests could race on the
  // review's overall status.
  function _enqueueSave(ctx, id) {
    clearTimeout(_timers[id]);
    delete _timers[id];
    var p = _queue.then(function () { return _saveOne(ctx, id); });
    _queue = p.catch(function () {});
    return p;
  }

  async function _saveOne(ctx, id) {
    var v = ctx.drafts[id];
    var m = ctx.byId[id];
    if (!v) return { ok: true, skipped: true };
    if (!m || _isEmptyDraft(v)) { delete ctx.drafts[id]; _persistDrafts(ctx); return { ok: true, skipped: true }; }
    _inFlight++;
    _renderBar();
    try {
      var d = await _api('/review/' + ctx.reviewId + '/mistakes/' + id, {
        method: 'PATCH', body: JSON.stringify(_patchFromValues(v, _isBlankAnswer(m))),
      });
      var updated = (d.review && d.review.mistakes || []).find(function (x) { return String(x._id) === id; }) || m;
      // Edited again while this request was in flight → keep the newer draft.
      if (ctx.drafts[id] === v) delete ctx.drafts[id];
      _persistDrafts(ctx);
      ctx.byId[id] = updated;
      _lastSavedAt = new Date();
      if (!!m.completedAt !== !!updated.completedAt && ctx.onSaved) ctx.onSaved(updated, d);
      return { ok: true, updated: updated };
    } catch (e) {
      return { ok: false, error: e };
    } finally {
      _inFlight--;
      _renderBar();
    }
  }

  function _readForm(container, uid) {
    var q = function (sel) { return container.querySelector(sel); };
    var conf = q('#ri-confidence-' + uid + ' .ri-chip.active');
    var learn = q('#ri-learning-' + uid + ' .ri-chip.active');
    return {
      category: q('#ri-category-' + uid).value, reason: q('#ri-reason-' + uid).value,
      confidence: conf ? conf.getAttribute('data-val') : '',
      learningCat: learn ? learn.getAttribute('data-val') : '',
      learningContent: q('#ri-learning-content-' + uid).value,
      evidence: q('#ri-evidence-' + uid).value,
      tempting: q('#ri-tempting-' + uid).value,
      note: q('#ri-note-' + uid).value,
    };
  }

  function _captureDraft(ctx, uid, container) {
    ctx.drafts[uid] = _readForm(container, uid);
    _persistDrafts(ctx);
    clearTimeout(_timers[uid]);
    _timers[uid] = setTimeout(function () { _enqueueSave(ctx, uid); }, AUTOSAVE_DELAY_MS);
    _renderBar();
  }

  // Any still-unsent draft goes out with keepalive when the page is left
  // (closing the tab, navigating away). It also stays in localStorage, so
  // it's re-sent on the next visit if this doesn't make it.
  window.addEventListener('pagehide', function () {
    var ctx = _ctx;
    if (!ctx) return;
    Object.keys(ctx.drafts).forEach(function (id) {
      var v = ctx.drafts[id], m = ctx.byId[id];
      if (!m || _isEmptyDraft(v)) return;
      try {
        fetch(API_BASE + '/review/' + ctx.reviewId + '/mistakes/' + id, {
          method: 'PATCH', keepalive: true,
          headers: Object.assign({ 'Content-Type': 'application/json' }, window.AuthService.authHeader()),
          body: JSON.stringify(_patchFromValues(v, _isBlankAnswer(m))),
        });
      } catch (e) { /* best effort */ }
    });
  });

  // Swaps every mounted, now-reviewed mistake to its "Đã review" badge.
  // Auto-save deliberately doesn't do this mid-typing (the form would vanish
  // under the student's cursor) — only an explicit save does.
  function _syncMountedWraps(ctx) {
    document.querySelectorAll('.ri-toggle-wrap[data-rid="' + ctx.reviewId + '"]').forEach(function (wrap) {
      var m = ctx.byId[wrap.dataset.mid];
      if (m && m.completedAt && !ctx.drafts[wrap.dataset.mid] && !wrap.querySelector('.ri-done-badge')) {
        wrap.innerHTML = DONE_BADGE;
      }
    });
  }

  function _remainingCount(ctx) {
    return ctx.order.filter(function (id) { return !ctx.byId[id].completedAt; }).length;
  }

  async function saveAll() {
    var ctx = _ctx;
    if (!ctx || _savingAll) return;
    _savingAll = true;
    _renderBar();
    var hadDrafts = _hasDrafts(ctx);
    var failed = 0;
    var ids = Object.keys(ctx.drafts);
    for (var i = 0; i < ids.length; i++) {
      var r = await _enqueueSave(ctx, ids[i]);
      if (!r.ok) failed++;
    }
    _savingAll = false;
    _syncMountedWraps(ctx);
    _renderBar();

    var remaining = _remainingCount(ctx);
    if (failed) {
      _toast('error', 'Chưa lưu được', failed + ' câu chưa lưu được — kiểm tra mạng rồi bấm "Lưu review" lần nữa. Phần bạn đã điền vẫn được giữ trên máy này.');
    } else if (!remaining) {
      _toast('success', 'Đã lưu review', 'Bạn đã review xong toàn bộ câu sai của bài này 🎉 Bài này sẽ không bị yêu cầu review lại.');
    } else {
      _toast(hadDrafts ? 'success' : 'info', hadDrafts ? 'Đã lưu review' : 'Chưa có gì mới để lưu',
        'Còn ' + remaining + ' câu sai chưa review đủ (lý do sai, độ tự tin, điều cần nhớ). Lần sau mở lại bài sẽ tiếp tục từ chỗ bạn dừng.');
      _focusFirstUnreviewed(ctx);
    }
  }

  // Opens and scrolls to the first still-unreviewed mistake on screen. On a
  // full test it may sit in another passage/part tab — the tab badges point
  // there.
  function _focusFirstUnreviewed(ctx) {
    var wraps = document.querySelectorAll('.ri-toggle-wrap[data-rid="' + ctx.reviewId + '"]');
    for (var i = 0; i < wraps.length; i++) {
      var w = wraps[i], m = ctx.byId[w.dataset.mid];
      if (!m || m.completedAt || !w.getClientRects().length) continue;
      var form = w.querySelector('.ri-form-container');
      if (form && form.style.display === 'none') w.querySelector('.ri-toggle-btn').click();
      w.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  }

  // ── "Lưu review" bar ──────────────────────────────────────────────────

  var _barWatcher = null;
  function _startBarWatcher() {
    if (_barWatcher) return;
    // The bar belongs to the review screen only — shown while this review's
    // forms/badges are actually on screen, hidden when the student goes back
    // to the test list (screens are display:none'd, not torn down).
    _barWatcher = setInterval(_renderBarVisibility, 700);
  }

  function _barEl() {
    var bar = document.getElementById('ri-savebar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'ri-savebar';
      bar.className = 'ri-savebar';
      bar.setAttribute('role', 'status');
      bar.innerHTML =
        '<div class="ri-sb-info">' +
          '<div class="ri-sb-count"></div>' +
          '<div class="ri-sb-track"><span></span></div>' +
          '<div class="ri-sb-status"></div>' +
        '</div>' +
        '<button type="button" class="ri-sb-btn"><i class="fas fa-save"></i> Lưu review</button>';
      bar.querySelector('.ri-sb-btn').addEventListener('click', saveAll);
      document.body.appendChild(bar);
    }
    return bar;
  }

  function _reviewOnScreen(ctx) {
    var wraps = document.querySelectorAll('.ri-toggle-wrap[data-rid="' + ctx.reviewId + '"]');
    for (var i = 0; i < wraps.length; i++) if (wraps[i].getClientRects().length) return true;
    return false;
  }

  function _renderBarVisibility() {
    var bar = document.getElementById('ri-savebar');
    var show = !!(_ctx && _ctx.order.length && _reviewOnScreen(_ctx));
    if (show && !bar) { _renderBar(); return; }
    if (bar) bar.classList.toggle('show', show);
  }

  function _renderBar() {
    var ctx = _ctx;
    if (!ctx || !ctx.order.length) {
      var old = document.getElementById('ri-savebar');
      if (old) old.classList.remove('show');
      return;
    }
    var bar = _barEl();
    var total = ctx.order.length;
    var done = total - _remainingCount(ctx);
    var allDone = done === total;
    var dirty = _hasDrafts(ctx);
    var busy = _savingAll || _inFlight > 0;

    bar.classList.toggle('done', allDone && !dirty);
    bar.querySelector('.ri-sb-count').innerHTML = (allDone && !dirty)
      ? '<i class="fas fa-check-circle"></i> Đã review xong ' + total + '/' + total + ' câu sai'
      : 'Đã review <b>' + done + '/' + total + '</b> câu sai';
    bar.querySelector('.ri-sb-track span').style.width = Math.round(done / total * 100) + '%';

    var status;
    if (busy) status = 'Đang lưu…';
    else if (dirty) status = 'Có thay đổi chưa lưu';
    else if (allDone) status = 'Đã lưu — bài này không cần review lại';
    else if (_lastSavedAt) status = 'Đã tự động lưu lúc ' + _lastSavedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    else status = 'Phần bạn điền được tự động lưu';
    bar.querySelector('.ri-sb-status').textContent = status;

    var btn = bar.querySelector('.ri-sb-btn');
    btn.style.display = (allDone && !dirty && !busy) ? 'none' : '';
    btn.disabled = _savingAll;
    btn.innerHTML = _savingAll ? '<i class="fas fa-spinner fa-spin"></i> Đang lưu…' : '<i class="fas fa-save"></i> Lưu review';

    _renderBarVisibility();
  }

  // ── Inline form ───────────────────────────────────────────────────────

  // Removes any wrapper already mounted for this qnum (either a real
  // duplicate, or a stale one left behind by a tab/part-switch cache
  // restore that wiped its event listeners) and always rebuilds fresh.
  // In-progress input isn't lost doing so: the form re-renders from the
  // mistake's draft (see _captureDraft), and opens itself if there is one.
  function mount(anchorEl, mistake, opts) {
    if (!anchorEl || !mistake) return;
    _injectStyles();
    var ctx = _ensureCtx(opts, mistake);
    var uid = String(mistake._id);
    mistake = ctx.byId[uid] || mistake;
    var qnum = mistake.questionNumber;
    var existing = (anchorEl.matches && anchorEl.matches('.ri-toggle-wrap'))
      ? (anchorEl.dataset.qnum == qnum ? anchorEl : null)
      : anchorEl.querySelector('.ri-toggle-wrap[data-qnum="' + qnum + '"]');
    var insertTarget = existing || document.createElement('div');
    if (existing) existing.replaceWith(insertTarget);

    insertTarget.className = 'ri-toggle-wrap ri-block';
    insertTarget.dataset.qnum = qnum;
    insertTarget.dataset.mid = uid;
    insertTarget.dataset.rid = ctx.reviewId;

    var draft = ctx.drafts[uid];
    if (mistake.completedAt && _isEmptyDraft(draft)) {
      insertTarget.innerHTML = DONE_BADGE;
    } else {
      var started = !_isEmptyDraft(draft) || !_isEmptyDraft(_valuesFromMistake(mistake));
      insertTarget.innerHTML =
        '<button type="button" class="ri-toggle-btn"><i class="fas fa-pen"></i> ' + (started ? 'Tiếp tục review lỗi này' : 'Review lỗi này') + '</button>' +
        '<div class="ri-form-container" style="display:none"></div>';
      var btn = insertTarget.querySelector('.ri-toggle-btn');
      var formContainer = insertTarget.querySelector('.ri-form-container');
      var open = function () {
        formContainer.style.display = 'block';
        if (!formContainer.dataset.rendered) {
          formContainer.dataset.rendered = '1';
          _renderForm(ctx, formContainer, mistake, opts, insertTarget);
        }
      };
      btn.addEventListener('click', function () {
        if (formContainer.style.display !== 'none') { formContainer.style.display = 'none'; return; }
        open();
      });
      // Half-done review from earlier — show it straight away.
      if (started) open();
    }

    if (!existing) {
      if (opts.mode === 'afterend') anchorEl.insertAdjacentElement('afterend', insertTarget);
      else anchorEl.appendChild(insertTarget);
    }
    _renderBar();
  }

  async function _renderForm(ctx, container, mistake, opts, wrap) {
    container.innerHTML = '<div style="text-align:center;padding:10px"><i class="fas fa-spinner fa-spin"></i></div>';
    var taxonomy;
    try {
      taxonomy = await _getTaxonomy(opts.skill);
    } catch (e) {
      container.innerHTML = '<p style="color:#ef4444;font-size:12.5px">Không tải được danh sách lỗi. Thử lại sau.</p>';
      return;
    }

    var uid = String(mistake._id);
    var v = ctx.drafts[uid] || _valuesFromMistake(mistake);
    var categories = _categoriesFor(opts.skill, opts.questionType, v.category, taxonomy);
    // Same rationale as the old drawer: a blank answer means nothing was
    // actually attempted, so "how confident were you" has no sensible
    // answer — swapped for a short note, and 'left-blank' recorded instead
    // of one of the 3 real confidence levels.
    var isBlank = _isBlankAnswer(mistake);

    var confidenceSectionHtml = isBlank
      ? '<div class="ri-section-label">Bạn đã bỏ trống câu này</div>' +
        '<div class="ri-blank-note">Không có gì để đánh giá độ tự tin.</div>'
      : '<div class="ri-section-label">Bạn tự tin đến mức nào?</div>' +
        '<div class="ri-chip-row" id="ri-confidence-' + uid + '">' +
          Object.keys(CONFIDENCE_LABELS).map(function (k) {
            return '<button type="button" class="ri-chip' + (v.confidence === k ? ' active' : '') + '" data-val="' + k + '">' + CONFIDENCE_LABELS[k] + '</button>';
          }).join('') +
        '</div>';

    container.innerHTML =
      '<div class="ri-section-label">Vì sao bạn sai?</div>' +
      '<select class="ri-select" id="ri-category-' + uid + '">' +
        '<option value="">-- Chọn nhóm lỗi --</option>' +
        categories.map(function (c) { return '<option value="' + escHtml(c) + '"' + (v.category === c ? ' selected' : '') + '>' + escHtml(c) + '</option>'; }).join('') +
      '</select>' +
      '<select class="ri-select" id="ri-reason-' + uid + '" style="margin-top:6px">' +
        '<option value="">-- Chọn lý do cụ thể --</option>' +
      '</select>' +

      confidenceSectionHtml +

      '<div class="ri-section-label">Bạn cần nhớ điều gì?</div>' +
      '<div class="ri-chip-row" id="ri-learning-' + uid + '">' +
        Object.keys(LEARNING_LABELS).map(function (k) {
          return '<button type="button" class="ri-chip' + (v.learningCat === k ? ' active' : '') + '" data-val="' + k + '">' + LEARNING_LABELS[k] + '</button>';
        }).join('') +
      '</div>' +
      '<textarea class="ri-textarea" id="ri-learning-content-' + uid + '" placeholder="VD: allocate = distribute/assign" style="margin-top:6px">' + escHtml(v.learningContent) + '</textarea>' +

      '<details class="ri-optional"' + ((v.evidence || v.tempting || v.note) ? ' open' : '') + '>' +
        '<summary>Bằng chứng / Vì sao đáp án sai lại hấp dẫn? / Ghi chú (không bắt buộc)</summary>' +
        '<textarea class="ri-textarea" id="ri-evidence-' + uid + '" placeholder="Bằng chứng trong bài...">' + escHtml(v.evidence) + '</textarea>' +
        '<textarea class="ri-textarea" id="ri-tempting-' + uid + '" placeholder="Vì sao đáp án sai lại hấp dẫn?" style="margin-top:6px">' + escHtml(v.tempting) + '</textarea>' +
        '<textarea class="ri-textarea" id="ri-note-' + uid + '" placeholder="Ghi chú của riêng bạn..." style="margin-top:6px">' + escHtml(v.note) + '</textarea>' +
      '</details>' +

      '<button type="button" class="ri-save-btn" id="ri-save-' + uid + '">Lưu câu này</button>';

    var catSel = container.querySelector('#ri-category-' + uid);
    var reasonSel = container.querySelector('#ri-reason-' + uid);
    function fillReasons(selected) {
      var reasons = catSel.value ? Object.keys(taxonomy[catSel.value] || {}) : [];
      reasonSel.innerHTML = '<option value="">-- Chọn lý do cụ thể --</option>' +
        reasons.map(function (r) { return '<option value="' + escHtml(r) + '"' + (r === selected ? ' selected' : '') + '>' + escHtml(r) + '</option>'; }).join('');
    }
    fillReasons(v.reason);
    catSel.addEventListener('change', function () { fillReasons(null); });

    ['#ri-confidence-' + uid, '#ri-learning-' + uid].forEach(function (rowSel) {
      container.querySelectorAll(rowSel + ' .ri-chip').forEach(function (btn) {
        btn.addEventListener('click', function () {
          container.querySelectorAll(rowSel + ' .ri-chip').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          _captureDraft(ctx, uid, container);
        });
      });
    });
    // Delegated — runs after catSel's own listener has refilled the reasons.
    container.addEventListener('input', function () { _captureDraft(ctx, uid, container); });
    container.addEventListener('change', function () { _captureDraft(ctx, uid, container); });

    container.querySelector('#ri-save-' + uid).addEventListener('click', function () {
      _submit(ctx, mistake, container, wrap, isBlank);
    });
  }

  async function _submit(ctx, mistake, container, wrap, isBlank) {
    var uid = String(mistake._id);
    var v = _readForm(container, uid);

    if (!v.category || !v.reason) { _toast('warning', 'Thiếu thông tin', 'Vui lòng chọn lý do sai'); return; }
    if (!isBlank && !v.confidence) { _toast('warning', 'Thiếu thông tin', 'Vui lòng chọn mức độ tự tin'); return; }
    if (!v.learningCat) { _toast('warning', 'Thiếu thông tin', 'Vui lòng chọn 1 điều cần nhớ'); return; }

    var btn = container.querySelector('#ri-save-' + uid);
    btn.disabled = true; btn.textContent = 'Đang lưu...';
    ctx.drafts[uid] = v;
    _persistDrafts(ctx);
    var r = await _enqueueSave(ctx, uid);
    var m = ctx.byId[uid];
    if (r.ok && m && m.completedAt) {
      wrap.innerHTML = DONE_BADGE;
    } else {
      _toast('error', 'Lỗi', (r.error && r.error.message) || 'Không lưu được');
      btn.disabled = false; btn.textContent = 'Lưu câu này';
    }
    _renderBar();
  }

  window.ReviewInline = { mount: mount, setContext: setContext, saveAll: saveAll };
})();
