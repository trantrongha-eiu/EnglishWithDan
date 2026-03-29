/**
 * frontend/js/auth.js
 * Chạy trên browser – KHÔNG dùng require()
 * Nhiệm vụ: kiểm tra token, cung cấp helper dùng chung cho các trang
 */

(function () {
  // ── Helpers ──────────────────────────────────────────────
  function getToken()   { return localStorage.getItem('token'); }
  function getUser()    { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }
  function saveToken(t) { localStorage.setItem('token', t); }
  function saveUser(u)  { localStorage.setItem('user', JSON.stringify(u)); }
  function logout()     { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = 'login.html'; }

  // ── Expose globally ───────────────────────────────────────
  window.getToken  = getToken;
  window.getUser   = getUser;
  window.saveToken = saveToken;
  window.saveUser  = saveUser;
  window.logout    = logout;

  // ── Guard: redirect về login nếu chưa đăng nhập ──────────
  // Các trang KHÔNG cần guard: login.html, register.html, index.html
  const PUBLIC_PAGES = ['login.html', 'register.html', 'index.html', '/'];
  const currentPage  = window.location.pathname.split('/').pop() || 'index.html';
  const isPublic     = PUBLIC_PAGES.some(p => currentPage.includes(p));

  if (!isPublic && !getToken()) {
    window.location.href = 'login.html';
  }
})();