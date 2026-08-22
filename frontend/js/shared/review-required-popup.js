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
      '.rd-popup-count{font-size:12px;color:var(--text3,#9ca3af);margin-top:6px}';
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
      '</div>';
    backdrop.classList.add('open');
    document.getElementById('rd-popup-dismiss-btn').addEventListener('click', function () {
      backdrop.classList.remove('open');
    });
    document.getElementById('rd-popup-go-btn').addEventListener('click', function () {
      backdrop.classList.remove('open');
      if (onGoToReview) onGoToReview();
    });
  }

  window.showReviewRequiredPopup = showReviewRequiredPopup;
})();
