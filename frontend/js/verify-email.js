// verify-email.html — Xác minh email
(function () {
  'use strict';
  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  var params = new URLSearchParams(location.search);
  var token = params.get('token');
  var emailHint = params.get('email') || '';

  var iconEl = document.getElementById('ve-icon');
  var titleEl = document.getElementById('ve-title');
  var msgEl = document.getElementById('ve-msg');
  var formEl = document.getElementById('ve-form');
  var emailEl = document.getElementById('ve-email');
  var submitEl = document.getElementById('ve-submit');

  if (emailHint) emailEl.value = emailHint;

  // Arrived here already logged in (unverified account, redirected from
  // login) — offer a way through instead of trapping them.
  if (window.AuthService && window.AuthService.isLoggedIn()) {
    document.getElementById('ve-back').style.display = 'none';
    document.getElementById('ve-continue').style.display = '';
    var u = window.AuthService.getUser();
    if (u && u.email && !emailEl.value) emailEl.value = u.email;
  }

  function setState(icon, cls, title, msg) {
    iconEl.innerHTML = '<i class="fas ' + icon + ' ' + cls + '"></i>';
    titleEl.textContent = title;
    msgEl.textContent = msg;
  }
  function showResendForm() { formEl.classList.add('show'); }

  // ── Resend flow (always generic response — no user enumeration) ──
  formEl.addEventListener('submit', async function (e) {
    e.preventDefault();
    var email = emailEl.value.trim();
    if (!email) return;
    submitEl.disabled = true;
    submitEl.textContent = 'Đang gửi…';
    try {
      await fetch(API + '/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });
      if (typeof showToast === 'function') showToast('Nếu email chưa xác minh, chúng tôi đã gửi lại liên kết.', 'success', 4000);
      msgEl.textContent = 'Đã gửi. Hãy kiểm tra hộp thư (và mục spam) của bạn.';
    } catch (err) {
      if (typeof showToast === 'function') showToast('Không kết nối được server, vui lòng thử lại.', 'error');
    } finally {
      submitEl.disabled = false;
      submitEl.textContent = 'Gửi lại liên kết xác minh';
    }
  });

  // ── No token → just show the "check your inbox" + resend view ──
  if (!token) {
    setState('fa-envelope-open-text', 've-spin', 'Kiểm tra hộp thư của bạn',
      'Chúng tôi đã gửi một liên kết xác minh tới email của bạn. Mở email đó để kích hoạt bản dùng thử miễn phí 1 ngày. Không thấy email? Gửi lại bên dưới.');
    showResendForm();
    return;
  }

  // ── Token present → verify it ──
  (async function () {
    try {
      var res = await fetch(API + '/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token })
      });
      var data = await res.json().catch(function () { return {}; });

      if (res.ok && data.success && data.token) {
        if (window.AuthService) window.AuthService.login(data.token, data.user);
        setState('fa-circle-check', 've-ok', 'Xác minh thành công!',
          'Bản dùng thử miễn phí 1 ngày của bạn đã được kích hoạt. Đang chuyển đến trang học…');
        setTimeout(function () { window.location.href = '/dashboard.html'; }, 1600);
        return;
      }

      setState('fa-circle-xmark', 've-bad', 'Liên kết không hợp lệ',
        (data && data.message) || 'Liên kết xác minh không hợp lệ hoặc đã hết hạn. Nhập email để nhận liên kết mới.');
      showResendForm();
    } catch (err) {
      setState('fa-triangle-exclamation', 've-bad', 'Có lỗi xảy ra',
        'Không kết nối được server. Vui lòng thử lại sau ít phút.');
      showResendForm();
    }
  })();
})();
