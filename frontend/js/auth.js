/**
 * frontend/js/auth.js
 * Chạy trên browser – KHÔNG dùng require()
 *
 * Phase 5: this is now a thin bootstrap over js/shared/auth-service.js
 * (the actual AuthService — must load before this file). It wires
 * AuthService's pure functions into THIS page's lifecycle: the page-load
 * guards, the inactivity check, and the banned-account interceptor. It
 * also keeps window.getToken/getUser/saveToken/saveUser/logout as aliases
 * to the AuthService equivalents so none of the ~40 existing call sites
 * across the app need to change.
 */

(function () {
  const AS = window.AuthService;

  // ── Backward-compatible globals (delegate to AuthService) ───
  window.getToken  = AS.getToken;
  window.getUser   = AS.getUser;
  window.saveToken = AS.setToken;
  window.saveUser  = AS.setUser;
  window.logout    = AS.logout;

  // ── Xác định trang hiện tại ───────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const PUBLIC_PAGES = ['login.html', 'register.html', 'index.html', ''];
  const isPublic     = PUBLIC_PAGES.some(p => currentPage === p);

  AS.installBannedInterceptor(isPublic);

  // ── Kiểm tra inactive 10 ngày (chỉ khi đã login) ─────────
  // Audit finding (Phase 5 review): checkInactiveLogout() queues a
  // navigation via location.href, but that doesn't stop this script from
  // continuing — Guard 1 below used to re-check isLoggedIn() fresh, see it
  // as false (session already cleared above), and fire its OWN redirect
  // with no reason= param, silently overwriting the inactive-logout one
  // and losing the "your session expired" toast. Skipping the guards
  // below when checkInactiveLogout() already redirected fixes this.
  const justLoggedOutForInactivity = AS.isLoggedIn() && AS.checkInactiveLogout();
  if (justLoggedOutForInactivity) return;

  // ── Guard 1: chưa đăng nhập → về login, nhớ trang đang muốn vào ──
  if (!AS.requirePageAuth(isPublic)) return;

  // ── Guard 2: đã đăng nhập mà vào login/register/trang chủ → redirect ─
  if (isPublic && AS.redirectIfAuthenticated()) return;

  // ── Hiển thị thông báo từ URL reason (login.html) ────────
  if (currentPage === 'login.html') {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get('reason');
    if (reason === 'inactive') {
      // Đợi DOM load xong rồi mới show toast
      window.addEventListener('DOMContentLoaded', () => {
        if (typeof showToast === 'function') {
          showToast(
            'error',
            'Phiên đăng nhập hết hạn',
            'Bạn đã không đăng nhập trong 10 ngày. Vui lòng đăng nhập lại.'
          );
        }
      });
    }
  }
})();