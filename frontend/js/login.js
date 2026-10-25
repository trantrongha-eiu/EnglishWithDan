// login.html — Đăng Nhập - IELTS Practice by Daniel Hà
// login.html deliberately loads auth-service.js directly instead of
// auth.js (see that file's header comment) so it gets the session
// primitives without auth.js's automatic page-load guards firing —
// this page needs to run its own reason=/error= toast logic first.
// Guard 2 (bounce an already-logged-in visitor away from login.html)
// still needs to fire though, just called explicitly instead.
(function () {
    if (window.AuthService && window.AuthService.redirectIfAuthenticated()) return;
})();

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.eye-icon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// showToastWithTitle() moved to js/shared/toast.js (single source of
// truth — Phase 3 audit). login.html's old static #loginToast markup
// is no longer referenced but left in place to avoid touching
// unrelated HTML.
function showError(msg) { showToastWithTitle('error', 'Thông báo', msg); }

// ── Redirect-back support (Phase 4 routing / Phase 5 AuthService) ─
// Reads ?next=... — either a student page (set by
// AuthService.requirePageAuth when it bounced an unauthenticated
// visitor from a deep link) or an admin hash-route like
// /admin/#/writing-grades (set by admin-src's ProtectedRoute.jsx
// when a session expires mid-use). AuthService.getSafeNext()
// validates the shape before ever using it as a redirect target —
// never honor next= as-is, to avoid an open-redirect vector.
function getSafeNextUrl() {
    return window.AuthService ? window.AuthService.getSafeNext() : null;
}

// ── PATCH: Hiển thị lý do bị logout (inactive 10 ngày, hoặc bị ban) ─
(function () {
    const reason = new URLSearchParams(window.location.search).get('reason');
    if (reason === 'inactive') {
        showToastWithTitle('error', 'Phiên đăng nhập hết hạn',
            'Bạn đã không đăng nhập trong 10 ngày. Vui lòng đăng nhập lại.');
    } else if (reason === 'banned') {
        showToastWithTitle('banned', 'Tài khoản bị khóa',
            'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ giáo viên để mở khóa.', 0);
    }
})();

// ── Just signed up on register.html (?registered=1&email=...):
// prefill the email and put the cursor on the password so the
// student can log in with one more field ─
// ── Just signed up with Google (?registered=google): point them at
// the Google button — one click logs them in ─
(function () {
    const qs = new URLSearchParams(window.location.search);
    if (qs.get('registered') !== 'google') return;
    const btn = document.querySelector('.btn-social.google');
    if (btn) {
        btn.classList.add('just-registered');
        btn.scrollIntoView({ block: 'center' });
        btn.focus();
    }
    showToastWithTitle('success', 'Đăng ký thành công 🎉', 'Bấm "Đăng nhập bằng Google" để đăng nhập và bắt đầu học ngay.');
})();

(function () {
    const qs = new URLSearchParams(window.location.search);
    if (qs.get('registered') !== '1') return;
    const email = qs.get('email');
    if (email) document.getElementById('email').value = email;
    document.getElementById('password').focus();
    showToastWithTitle('success', 'Đăng ký thành công 🎉', 'Nhập mật khẩu để đăng nhập và bắt đầu học ngay.');
})();

// ── Google OAuth failure feedback (backend redirects here with
// ?error=... on every failure path — was previously silently
// dropped, leaving the user on a blank form with no explanation;
// security-audit finding, since oauth_state_mismatch is the signal
// for a possible login-CSRF/replay attempt and deserves visibility) ─
(function () {
    const error = new URLSearchParams(window.location.search).get('error');
    const messages = {
        not_configured:       'Đăng nhập Google hiện chưa khả dụng.',
        google_failed:        'Đăng nhập Google thất bại. Vui lòng thử lại.',
        oauth_state_mismatch: 'Phiên đăng nhập Google đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.',
        banned:               'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ giáo viên để mở khóa.',
        social_auth_failed:   'Đăng nhập Google thất bại. Vui lòng thử lại.',
    };
    if (error && messages[error]) {
        showToastWithTitle('error', 'Đăng nhập Google thất bại', messages[error]);
    }
})();

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const emailOrUsername = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const btn = document.querySelector('.btn-login');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span>Đang đăng nhập...</span>';
    btn.disabled = true;

    try {
        const res = await fetch(API + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailOrUsername, password })
        });
        // skipAuthRedirect: a wrong-password login attempt returns
        // 401 too (see backend/controllers/auth.controller.js) — that
        // must show "Sai email/mật khẩu", not trigger ApiClient's
        // normal "session expired, log out" handling on the login
        // page itself.
        const data = await window.ApiClient.handleResponse(res, { skipAuthRedirect: true });

        // Session creation centralized in AuthService.login() —
        // writes token/user/lastLoginAt in one place instead of
        // this page hand-rolling the same 3 lines auth-callback.html
        // also used to (Phase 5).
        window.AuthService.login(data.token, data.user);
        // Registered but never clicked the verification link: the
        // account has no 24h trial yet. Send them to the verify
        // page (resend link + "continue anyway") instead of a
        // dashboard full of locked features with no explanation.
        if (data.user && data.user.emailVerified === false) {
            window.location.href = 'verify-email.html?email=' + encodeURIComponent(data.user.email || '');
            return;
        }
        // getPostLoginRedirect() centralizes the role-matched
        // next= handling that used to be duplicated inline here
        // and in auth-callback.html.
        window.location.href = window.AuthService.getPostLoginRedirect(data.user);
    } catch (err) {
        console.error('Login error:', err);
        if (err.coldStart) {
            showToastWithTitle('error', 'Server đang khởi động', 'Server đang khởi động lại (thường mất khoảng 30 giây), vui lòng thử lại.');
        } else if (err.body) {
            // PATCH: Phân biệt bị cấm vs lỗi thường
            const isBanned = err.body.message && err.body.message.includes('bị cấm');
            if (isBanned) {
                showToastWithTitle('banned', 'Tài khoản bị khóa',
                    'Vui lòng liên hệ giáo viên để mở khóa.', 0);
            } else {
                showToastWithTitle('error', 'Đăng nhập thất bại', err.body.message || 'Vui lòng thử lại.');
            }
        } else {
            showToastWithTitle('error', 'Lỗi kết nối', 'Không kết nối được server! Vui lòng thử lại.');
        }
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
});

const API = (window.AuthService && window.AuthService.API && window.AuthService.API.replace(/\/api\/?$/, '')) || 'https://englishwithdan.onrender.com';

// ── Google OAuth ─────────────────────────────────────
document.querySelector('.btn-social.google').addEventListener('click', function () {
    const next = getSafeNextUrl();
    const qs = next ? ('?next=' + encodeURIComponent(next.url)) : '';
    window.location.href = API + '/api/auth/google' + qs;
});

// ── Forgot Password ──────────────────────────────────
document.querySelector('.forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    openForgotModal();
});

let _fmResetToken = '';
let _fmEmail = '';

let _fmTriggerEl = null;
function openForgotModal() {
    _fmTriggerEl = document.activeElement;
    const modal = document.getElementById('forgotModal');
    modal.style.display = 'flex';
    document.getElementById('fmStep1').style.display = 'block';
    document.getElementById('fmStep2').style.display = 'none';
    document.getElementById('fmStep3').style.display = 'none';
    document.getElementById('fmMsg').style.display = 'none';
    document.getElementById('fmTitle').textContent = 'Quên mật khẩu?';
    document.getElementById('fmSubtitle').textContent = 'Nhập email để nhận mã xác nhận OTP';
    document.getElementById('fmEmail').focus();
}
function closeForgotModal() {
    document.getElementById('forgotModal').style.display = 'none';
    if (_fmTriggerEl && typeof _fmTriggerEl.focus === 'function') _fmTriggerEl.focus();
}
document.getElementById('forgotModal').addEventListener('click', function(e) {
    if (e.target === this) closeForgotModal();
});
document.getElementById('forgotModal').addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeForgotModal();
});

function showFmMsg(msg, isError) {
    const el = document.getElementById('fmMsg');
    el.style.display = 'block';
    el.style.background = isError ? '#fce4e4' : '#ecfdf5';
    el.style.color = isError ? '#c62828' : '#065f46';
    el.style.border = isError ? '1px solid #ef9a9a' : '1px solid #6ee7b7';
    el.textContent = msg;
}

async function fmSendOTP(resend = false) {
    _fmEmail = document.getElementById('fmEmail').value.trim();
    if (!_fmEmail) return showFmMsg('Vui lòng nhập email', true);
    const btn = document.getElementById('fmSendBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang gửi...'; }
    try {
        const res = await fetch(API + '/api/auth/forgot-password', {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ email: _fmEmail })
        });
        const data = await window.ApiClient.handleResponse(res, { skipAuthRedirect: true });
        if (data.success) {
            document.getElementById('fmStep1').style.display = 'none';
            document.getElementById('fmStep2').style.display = 'block';
            document.getElementById('fmEmailDisplay').textContent = _fmEmail;
            document.getElementById('fmTitle').textContent = 'Nhập mã OTP';
            document.getElementById('fmSubtitle').textContent = 'Kiểm tra email của bạn';
            document.getElementById('fmMsg').style.display = 'none';
            // Setup OTP inputs
            const inputs = document.querySelectorAll('.otp-input');
            inputs.forEach((inp, i) => {
                inp.value = '';
                inp.addEventListener('input', function() {
                    if (this.value && i < inputs.length - 1) inputs[i+1].focus();
                });
                inp.addEventListener('keydown', function(e) {
                    if (e.key === 'Backspace' && !this.value && i > 0) inputs[i-1].focus();
                });
            });
            inputs[0].focus();
            if (resend) showFmMsg('Đã gửi lại mã OTP!', false);
        }
    } catch (err) {
        showFmMsg(err.coldStart ? 'Server đang khởi động lại, vui lòng thử lại sau vài giây.' : ((err.body && err.body.message) || 'Không kết nối được server'), true);
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Gửi mã OTP'; }
}

async function fmVerifyOTP() {
    const otp = [...document.querySelectorAll('.otp-input')].map(i => i.value).join('');
    if (otp.length !== 6) return showFmMsg('Vui lòng nhập đủ 6 số', true);
    try {
        const res = await fetch(API + '/api/auth/verify-otp', {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ email: _fmEmail, otp })
        });
        const data = await window.ApiClient.handleResponse(res, { skipAuthRedirect: true });
        _fmResetToken = data.resetToken;
        document.getElementById('fmStep2').style.display = 'none';
        document.getElementById('fmStep3').style.display = 'block';
        document.getElementById('fmTitle').textContent = 'Đặt mật khẩu mới';
        document.getElementById('fmSubtitle').textContent = 'Nhập mật khẩu mới cho tài khoản';
        document.getElementById('fmMsg').style.display = 'none';
    } catch (err) {
        showFmMsg(err.coldStart ? 'Server đang khởi động lại, vui lòng thử lại sau vài giây.' : ((err.body && err.body.message) || 'Không kết nối được server'), true);
    }
}

function openConsultModal(){} // overridden by consult-modal.js

async function fmResetPassword() {
    const newPass = document.getElementById('fmNewPass').value;
    const confirmPass = document.getElementById('fmConfirmPass').value;
    if (newPass.length < 8) return showFmMsg('Mật khẩu phải có ít nhất 8 ký tự', true);
    if (newPass !== confirmPass) return showFmMsg('Mật khẩu xác nhận không khớp', true);
    try {
        const res = await fetch(API + '/api/auth/reset-password', {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ resetToken: _fmResetToken, newPassword: newPass })
        });
        await window.ApiClient.handleResponse(res, { skipAuthRedirect: true });
        showFmMsg('Đặt lại mật khẩu thành công! Đang chuyển hướng...', false);
        setTimeout(closeForgotModal, 2000);
    } catch (err) {
        showFmMsg(err.coldStart ? 'Server đang khởi động lại, vui lòng thử lại sau vài giây.' : ((err.body && err.body.message) || 'Không kết nối được server'), true);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const yrEl = document.getElementById('footer-year');
    if (yrEl) yrEl.textContent = new Date().getFullYear();
});
