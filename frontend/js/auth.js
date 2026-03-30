/**
 * frontend/js/auth.js
 * Chạy trên browser – KHÔNG dùng require()
 */

(function () {
  // ── Helpers ──────────────────────────────────────────────
  function getToken() { return localStorage.getItem('token'); }
  function getUser()  { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }
  function saveToken(t) { localStorage.setItem('token', t); }
  function saveUser(u)  { localStorage.setItem('user', JSON.stringify(u)); }
  function logout()  {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }

  // ── Expose globally ───────────────────────────────────────
  window.getToken  = getToken;
  window.getUser   = getUser;
  window.saveToken = saveToken;
  window.saveUser  = saveUser;
  window.logout    = logout;

  // ── Xác định trang hiện tại ───────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Trang không cần đăng nhập
  const PUBLIC_PAGES = ['login.html', 'register.html', 'index.html', ''];
  const isPublic     = PUBLIC_PAGES.some(p => currentPage === p);

  // Trang chỉ dành cho teacher / admin
  const ADMIN_PAGES = ['admin.html'];
  const isAdminPage = ADMIN_PAGES.includes(currentPage);

  const token = getToken();
  const user  = getUser();

  // ── Guard 1: chưa đăng nhập → về login ──────────────────
  if (!isPublic && !token) {
    window.location.href = 'login.html';
    return;
  }

  // ── Guard 2: student vào admin.html → về dashboard ───────
  if (isAdminPage && user && !['admin', 'teacher'].includes(user.role)) {
    alert('Bạn không có quyền truy cập trang này.');
    window.location.href = 'dashboard.html';
    return;
  }

  // ── Guard 3: đã đăng nhập mà vào login/register → redirect ─
  if ((currentPage === 'login.html' || currentPage === 'register.html') && token && user) {
    if (['admin', 'teacher'].includes(user.role)) {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  }
})();