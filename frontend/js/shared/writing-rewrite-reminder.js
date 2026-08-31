/**
 * shared/writing-rewrite-reminder.js — cross-page nudge for the Writing
 * "viết lại" (rewrite) requirement, mirroring reading-v2.js /
 * listening.html's _checkPendingReviewBanner: a soft top banner whenever the
 * student has graded essays they haven't rewritten, plus a one-per-load
 * modal once they're actually blocked (count >= max).
 *
 * Loaded on every Writing-related page (writing.html, task1-practice.html,
 * task2-practice.html, writing-practice.html, task2-template.html). The
 * "Nhập mã bỏ qua" button reuses window.showReviewBypassPrompt from
 * shared/review-required-popup.js (its /review/bypass redeem clears the
 * rewrite backlog too — see backend reviewService.redeemBypassCode).
 */
(function () {
  'use strict';
  if (!window.AuthService || !window.AuthService.isLoggedIn()) return;
  if (window.AuthService.getRole && window.AuthService.getRole() !== 'student') return;

  // Only the essay-writing pages — not every page that merely mentions writing.
  var WRITING_PAGES = ['writing.html', 'task1-practice.html', 'task2-practice.html', 'writing-practice.html', 'task2-template.html'];
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (WRITING_PAGES.indexOf(here) === -1) return;

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  var _modalShown = false;

  function h() {
    return Object.assign({ 'Content-Type': 'application/json' },
      window.AuthService.authHeader ? window.AuthService.authHeader() : {});
  }

  function _firstId(items) { return items && items[0] ? items[0]._id : null; }

  function _goRewrite(firstId) {
    if (typeof window.openRewrite === 'function' && firstId) { window.openRewrite(firstId); return; }
    location.href = firstId ? ('writing.html?rewrite=' + encodeURIComponent(firstId)) : 'writing.html';
  }

  function _renderBanner(count, blocked, firstId) {
    var id = 'writing-rewrite-banner';
    var el = document.getElementById(id);
    if (!count) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      var nav = document.getElementById('globalTopNav') || document.querySelector('nav');
      if (nav && nav.parentNode) nav.parentNode.insertBefore(el, nav.nextSibling);
      else document.body.insertBefore(el, document.body.firstChild);
    }
    el.style.cssText = 'margin:12px auto;max-width:1100px;width:calc(100% - 24px);border-radius:12px;padding:12px 16px;'
      + 'display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:13.5px;'
      + (blocked ? 'background:#fef3c7;border:1px solid #f59e0b;color:#92400e'
                 : 'background:#f8f9fb;border:1px solid #e5e7eb;color:#374151');
    el.innerHTML =
      '<span>' + (blocked
        ? '🔒 Bạn có <b>' + count + '</b> bài Writing đã chấm chưa viết lại — viết lại ít nhất 1 bài để nộp bài Writing mới.'
        : '🟡 Bạn có <b>' + count + '</b> bài Writing đã chấm chưa viết lại — viết lại dựa trên feedback để tiến bộ.') + '</span>'
      + '<span style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
      +   '<button type="button" class="wrr-go" style="padding:8px 16px;border:none;border-radius:8px;background:var(--brand,#e53935);color:#fff;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit">Viết lại ngay</button>'
      +   (blocked ? '<button type="button" class="wrr-code" style="padding:8px 12px;background:none;border:1px solid currentColor;border-radius:8px;color:inherit;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit">Nhập mã bỏ qua</button>' : '')
      + '</span>';
    el.querySelector('.wrr-go').onclick = function () { _goRewrite(firstId); };
    var codeBtn = el.querySelector('.wrr-code');
    if (codeBtn) codeBtn.onclick = function () { if (window.showReviewBypassPrompt) window.showReviewBypassPrompt(); };
  }

  function _showModal(count, firstId) {
    if (_modalShown) return;
    _modalShown = true;
    // One-at-a-time with the other page-load popups via the shared queue
    // (js/shared/popup-queue.js); shows immediately if that script is absent.
    if (window.PopupQueue) {
      window.PopupQueue.enqueue({
        id: 'writing-rewrite', priority: 35, until: '#wrr-modal-overlay',
        show: function () { _renderModal(count, firstId); }
      });
    } else {
      _renderModal(count, firstId);
    }
  }

  function _renderModal(count, firstId) {
    var back = document.createElement('div');
    back.id = 'wrr-modal-overlay';
    back.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1450;display:flex;align-items:center;justify-content:center;padding:16px';
    back.innerHTML =
      '<div style="background:var(--surface,#fff);border-radius:16px;max-width:380px;width:100%;padding:26px 24px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.3)">'
      +   '<div style="font-size:38px;margin-bottom:10px">✍️</div>'
      +   '<div style="font-weight:800;font-size:16.5px;margin-bottom:8px;color:var(--text,#111827)">Bạn có ' + count + ' bài Writing chưa viết lại</div>'
      +   '<div style="font-size:13.5px;color:var(--text2,#374151);line-height:1.6;margin-bottom:20px">Viết lại ít nhất 1 bài dựa trên feedback trước khi nộp bài Writing mới. Viết lại giúp bạn thật sự sửa được lỗi, không lặp lại ở bài sau.</div>'
      +   '<button type="button" class="wrr-m-go" style="width:100%;padding:12px;border:none;border-radius:10px;background:var(--brand,#e53935);color:#fff;font-weight:700;font-size:14px;cursor:pointer;margin-bottom:8px;font-family:inherit">Viết lại ngay</button>'
      +   '<button type="button" class="wrr-m-later" style="background:none;border:none;color:var(--text3,#9ca3af);font-size:12.5px;cursor:pointer;padding:6px;font-family:inherit">Để sau</button>'
      +   '<div><button type="button" class="wrr-m-code" style="background:none;border:none;color:var(--text3,#9ca3af);font-size:12px;cursor:pointer;padding:6px;text-decoration:underline;font-family:inherit">Có mã bỏ qua từ giáo viên?</button></div>'
      + '</div>';
    document.body.appendChild(back);
    back.querySelector('.wrr-m-later').onclick = function () { back.remove(); };
    back.querySelector('.wrr-m-go').onclick = function () { back.remove(); _goRewrite(firstId); };
    back.querySelector('.wrr-m-code').onclick = function () { back.remove(); if (window.showReviewBypassPrompt) window.showReviewBypassPrompt(); };
  }

  function check() {
    fetch(API + '/writing/pending-rewrites', { headers: h() })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.success) return;
        var count = d.count || 0;
        var max = d.max || 3;
        var blocked = count >= max;
        var firstId = _firstId(d.items);
        _renderBanner(count, blocked, firstId);
        if (blocked) _showModal(count, firstId);
      })
      .catch(function () {});
  }

  // Re-check after a rewrite is submitted on writing.html.
  window.addEventListener('ews:rewrite-saved', check);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check);
  else check();
})();
