/**
 * frontend/js/auth.js
 * Chạy trên browser – KHÔNG dùng require()
 */

(function () {
  const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000; // 10 ngày tính bằng ms

  // ── Helpers ──────────────────────────────────────────────
  function getToken() { return localStorage.getItem('token'); }
  function getUser()  { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }
  function saveToken(t) { localStorage.setItem('token', t); }
  function saveUser(u)  { localStorage.setItem('user', JSON.stringify(u)); }

  function logout(reason) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastLoginAt');
    // Nếu có lý do (ví dụ: hết hạn 10 ngày) thì truyền qua URL để login.html hiển thị
    const url = reason ? `login.html?reason=${encodeURIComponent(reason)}` : 'login.html';
    window.location.href = url;
  }

  // ── Kiểm tra 10 ngày không đăng nhập ─────────────────────
  function checkInactiveLogout() {
    const lastLoginAt = parseInt(localStorage.getItem('lastLoginAt') || '0', 10);
    if (!lastLoginAt) return; // chưa có dữ liệu → bỏ qua
    if (Date.now() - lastLoginAt > TEN_DAYS_MS) {
      logout('inactive');
    }
  }

  // ── Intercept fetch để bắt 403 banned từ middleware ─────
  // Khi server trả 403 { success:false, message:'Tài khoản đã bị cấm.' }
  // → xoá token + redirect về login với reason=banned
  const _origFetch = window.fetch;
  window.fetch = async function(...args) {
    const res = await _origFetch(...args);
    if (res.status === 403 && !isPublic) {
      try {
        const clone = res.clone();
        const data  = await clone.json();
        if (data && data.success === false &&
            typeof data.message === 'string' &&
            data.message.includes('bị cấm')) {
          logout('banned');
          return res;
        }
      } catch { /* ignore parse errors */ }
    }
    return res;
  };

  // ── Expose globally ───────────────────────────────────────
  window.getToken  = getToken;
  window.getUser   = getUser;
  window.saveToken = saveToken;
  window.saveUser  = saveUser;
  window.logout    = logout;

  // ── Xác định trang hiện tại ───────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const PUBLIC_PAGES = ['login.html', 'register.html', 'index.html', ''];
  const isPublic     = PUBLIC_PAGES.some(p => currentPage === p);

  const token = getToken();
  const user  = getUser();

  // ── Kiểm tra inactive 10 ngày (chỉ khi đã login) ─────────
  if (token) {
    checkInactiveLogout();
  }

  // ── Guard 1: chưa đăng nhập → về login ──────────────────
  if (!isPublic && !token) {
    window.location.href = 'login.html';
    return;
  }

  // ── Guard 2: đã đăng nhập mà vào login/register → redirect ─
  if ((currentPage === 'login.html' || currentPage === 'register.html') && token && user) {
    if (['admin', 'teacher'].includes(user.role)) {
      window.location.href = 'admin/index.html';
    } else {
      window.location.href = 'dashboard.html';
    }
    return;
  }

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