/**
 * shared/review-required-popup.js — the "you have N pending reviews,
 * please review at least one before starting a new test" notice popup,
 * shown when a student is blocked by the mandatory-review gate
 * (backend/middleware/requireReviewComplete.js, MAX_PENDING_REVIEWS).
 *
 * This is unrelated to the actual per-mistake review UI (that's now inline
 * on the review screen itself, see shared/review-inline.js) — this file is
 * purely the heads-up notice + "Review ngay" navigation link. Formerly
 * part of review-drawer.js, which also contained the floating per-mistake
 * walkthrough drawer; that drawer was removed (replaced by review-inline.js)
 * and this file renamed since "review-drawer" with no drawer left in it
 * was misleading.
 *
 * Host page calls window.showReviewRequiredPopup(pending, count, onGoToReview).
 */
(function () {
  'use strict';
  if (!window.AuthService || !window.AuthService.isLoggedIn()) return;

  function _injectStyles() {
    if (document.getElementById('rd-styles')) return;
    var s = document.createElement('style');
    s.id = 'rd-styles';
    s.textContent =
      '#rd-popup-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1450;display:none;align-items:center;justify-content:center;padding:16px}' +
      '#rd-popup-backdrop.open{display:flex}' +
      '.rd-popup-box{background:var(--surface,#fff);border-radius:16px;max-width:380px;width:100%;padding:26px 24px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.3)}' +
      '.rd-popup-emoji{font-size:38px;margin-bottom:10px}' +
      '.rd-popup-title{font-weight:800;font-size:16.5px;color:var(--text,#111827);margin-bottom:8px}' +
      '.rd-popup-text{font-size:13.5px;color:var(--text2,#374151);line-height:1.6;margin-bottom:20px}' +
      '.rd-popup-btn{width:100%;padding:12px;border:none;border-radius:10px;background:var(--blue,#3d8bff);color:#fff;font-weight:700;font-size:14px;cursor:pointer;margin-bottom:8px}' +
      '.rd-popup-dismiss{background:none;border:none;color:var(--text3,#9ca3af);font-size:12.5px;cursor:pointer;padding:6px}' +
      '.rd-popup-count{font-size:12px;color:var(--text3,#9ca3af);margin-top:6px}' +
      '.rd-code-toggle{background:none;border:none;color:var(--text3,#9ca3af);font-size:12px;cursor:pointer;padding:6px;text-decoration:underline;margin-top:2px}' +
      '.rd-code-wrap{display:none;margin-top:10px;padding-top:12px;border-top:1px solid var(--border,#e5e7eb)}' +
      '.rd-code-wrap.open{display:block}' +
      '.rd-code-row{display:flex;gap:6px}' +
      '.rd-code-input{flex:1;min-width:0;padding:9px 11px;border:1.5px solid var(--border,#e5e7eb);border-radius:8px;font-size:14px;font-family:inherit;text-transform:uppercase;letter-spacing:1px;background:var(--bg,#fff);color:var(--text,#111827)}' +
      '.rd-code-submit{padding:9px 14px;border:none;border-radius:8px;background:var(--text,#111827);color:#fff;font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap}' +
      '.rd-code-submit:disabled{opacity:.5;cursor:default}' +
      '.rd-code-msg{font-size:12px;margin-top:8px;min-height:16px}' +
      '.rd-code-msg.err{color:#dc2626}.rd-code-msg.ok{color:var(--success,#16a34a)}';
    document.head.appendChild(s);
  }

  // Shown at most once per page load (loadTests()/loadTestList() re-run this
  // check on every list-screen re-entry — without a guard, navigating back
  // to the list a few times would pop this up repeatedly and get annoying;
  // the persistent banner already stays up as the standing reminder).
  //
  // Only meant to fire once the student is actually BLOCKED (count >=
  // MAX_PENDING_REVIEWS, mirrored from backend/services/reviewService.js) —
  // 1-2 pending reviews is still fine to keep practicing, so the host page
  // only calls this when opts.blocked is true; below that it shows the
  // softer, non-modal banner instead. See reading-v2.js/listening.html's
  // _checkPendingReviewBanner().
  var _popupShownThisLoad = false;
  function showReviewRequiredPopup(pending, count, onGoToReview) {
    if (_popupShownThisLoad || !pending) return;
    _popupShownThisLoad = true;
    // One-at-a-time with the other login popups (goal-setup, badge, etc.) via
    // the shared queue; falls back to showing immediately without it.
    if (window.PopupQueue) {
      window.PopupQueue.enqueue({
        id: 'review-required', priority: 40, until: '#rd-popup-backdrop',
        show: function () { _renderReviewRequiredPopup(pending, count, onGoToReview); }
      });
    } else {
      _renderReviewRequiredPopup(pending, count, onGoToReview);
    }
  }

  function _renderReviewRequiredPopup(pending, count, onGoToReview) {
    _injectStyles();
    var backdrop = document.getElementById('rd-popup-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'rd-popup-backdrop';
      document.body.appendChild(backdrop);
    }
    backdrop.innerHTML =
      '<div class="rd-popup-box">' +
        '<div class="rd-popup-emoji">🔒</div>' +
        '<div class="rd-popup-title">Bạn có ' + count + ' bài đang chờ Review</div>' +
        '<div class="rd-popup-text">Hãy review ít nhất 1 bài trước khi làm bài mới.<br><br>Review giúp bạn tìm ra lỗi và tránh lặp lại cùng một lỗi trong bài tiếp theo.</div>' +
        '<button class="rd-popup-btn" id="rd-popup-go-btn">Review ngay</button>' +
        '<button class="rd-popup-dismiss" id="rd-popup-dismiss-btn">Để sau</button>' +
        '<div class="rd-popup-count">Bài đang chờ Review: ' + count + '</div>' +
        '<button class="rd-code-toggle" id="rd-code-toggle">Có mã bỏ qua từ giáo viên?</button>' +
        '<div class="rd-code-wrap" id="rd-code-wrap">' +
          '<div class="rd-code-row">' +
            '<input class="rd-code-input" id="rd-code-input" maxlength="16" placeholder="NHẬP MÃ" autocomplete="off" spellcheck="false">' +
            '<button class="rd-code-submit" id="rd-code-submit">Áp dụng</button>' +
          '</div>' +
          '<div class="rd-code-msg" id="rd-code-msg"></div>' +
        '</div>' +
      '</div>';
    backdrop.classList.add('open');
    document.getElementById('rd-popup-dismiss-btn').addEventListener('click', function () {
      backdrop.classList.remove('open');
    });
    document.getElementById('rd-popup-go-btn').addEventListener('click', function () {
      backdrop.classList.remove('open');
      if (onGoToReview) onGoToReview();
    });
    _wireCodeRedeem();
  }

  function _wireCodeRedeem() {
    var toggle = document.getElementById('rd-code-toggle');
    var wrap = document.getElementById('rd-code-wrap');
    var input = document.getElementById('rd-code-input');
    var btn = document.getElementById('rd-code-submit');
    var msg = document.getElementById('rd-code-msg');
    if (!toggle || !wrap || !btn) return;

    toggle.addEventListener('click', function () {
      wrap.classList.toggle('open');
      if (wrap.classList.contains('open')) input.focus();
    });

    function redeem() {
      var code = (input.value || '').trim().toUpperCase();
      msg.className = 'rd-code-msg';
      msg.textContent = '';
      if (!code) { msg.className = 'rd-code-msg err'; msg.textContent = 'Nhập mã trước đã.'; return; }
      btn.disabled = true;
      var base = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
      var headers = { 'Content-Type': 'application/json' };
      if (window.AuthService && window.AuthService.authHeader) Object.assign(headers, window.AuthService.authHeader());
      fetch(base + '/review/bypass', { method: 'POST', headers: headers, body: JSON.stringify({ code: code }) })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok || !res.d.success) {
            btn.disabled = false;
            msg.className = 'rd-code-msg err';
            msg.textContent = (res.d && res.d.message) || 'Mã không dùng được.';
            return;
          }
          msg.className = 'rd-code-msg ok';
          msg.textContent = (res.d.message || 'Đã bỏ qua Review.') + ' Đang tải lại…';
          setTimeout(function () { location.reload(); }, 900);
        })
        .catch(function () {
          btn.disabled = false;
          msg.className = 'rd-code-msg err';
          msg.textContent = 'Lỗi kết nối, thử lại.';
        });
    }

    btn.addEventListener('click', redeem);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') redeem(); });
  }

  // Standalone "enter a bypass code" modal — for the persistent banner's
  // "Nhập mã bỏ qua" link, which needs to work even after the once-per-load
  // popup has already been shown/dismissed.
  function showReviewBypassPrompt() {
    _injectStyles();
    var backdrop = document.getElementById('rd-popup-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'rd-popup-backdrop';
      document.body.appendChild(backdrop);
    }
    backdrop.innerHTML =
      '<div class="rd-popup-box">' +
        '<div class="rd-popup-emoji">🎫</div>' +
        '<div class="rd-popup-title">Nhập mã bỏ qua Review</div>' +
        '<div class="rd-popup-text">Mã do giáo viên cấp. Áp dụng xong, mọi bài đang chờ Review sẽ được bỏ qua.</div>' +
        '<div class="rd-code-wrap open" id="rd-code-wrap">' +
          '<div class="rd-code-row">' +
            '<input class="rd-code-input" id="rd-code-input" maxlength="16" placeholder="NHẬP MÃ" autocomplete="off" spellcheck="false">' +
            '<button class="rd-code-submit" id="rd-code-submit">Áp dụng</button>' +
          '</div>' +
          '<div class="rd-code-msg" id="rd-code-msg"></div>' +
        '</div>' +
        '<button class="rd-popup-dismiss" id="rd-popup-dismiss-btn" style="margin-top:8px">Đóng</button>' +
      '</div>';
    backdrop.classList.add('open');
    var toggle = document.createElement('span'); // _wireCodeRedeem expects #rd-code-toggle; give it a hidden stub
    toggle.id = 'rd-code-toggle';
    toggle.style.display = 'none';
    backdrop.querySelector('.rd-popup-box').appendChild(toggle);
    document.getElementById('rd-popup-dismiss-btn').addEventListener('click', function () {
      backdrop.classList.remove('open');
    });
    _wireCodeRedeem();
    var inp = document.getElementById('rd-code-input');
    if (inp) inp.focus();
  }

  window.showReviewRequiredPopup = showReviewRequiredPopup;
  window.showReviewBypassPrompt = showReviewBypassPrompt;
})();
