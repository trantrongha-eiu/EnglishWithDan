// register.html — Đăng Ký
// Sign-up is Google-only. The button starts OAuth with mode=register:
// the backend creates the account, then sends the student to
// login.html?registered=google to sign in with the Google button there.
const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';

// register.html loads auth-service.js directly (not auth.js — see
// that file's header comment) so an already-logged-in visitor still
// gets bounced away (Guard 2), same as login.html.
(function () {
    if (window.AuthService && window.AuthService.redirectIfAuthenticated()) return;
})();

document.querySelector('.btn-social.google').addEventListener('click', function () {
    const params = new URLSearchParams({ mode: 'register' });
    const next = new URLSearchParams(window.location.search).get('next');
    if (next) params.set('next', next); // backend only keeps safe same-site paths
    window.location.href = `${API}/auth/google?` + params.toString();
});

window.addEventListener('DOMContentLoaded', () => {
    const yrEl = document.getElementById('footer-year');
    if (yrEl) yrEl.textContent = new Date().getFullYear();
});
