// register.html — Đăng Ký
// BUG-027: centralize the backend base URL via the shared
// AuthService.API abstraction (see js/shared/auth-service.js),
// same fallback idiom used sitewide.
const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';

// Email sign-up: the server checks the address is real (syntax, Gmail
// rules, disposable list, typo'd domains, DNS MX — utils/emailCheck.js)
// and creates the account active, with no emailed link to wait for.
// On success we go straight to login.html with the email prefilled.
// Google OAuth still creates its account on first sign-in.

// register.html loads auth-service.js directly (not auth.js — see
// that file's header comment) so an already-logged-in visitor still
// gets bounced away (Guard 2), same as login.html.
(function () {
    if (window.AuthService && window.AuthService.redirectIfAuthenticated()) return;
})();

function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    const eyeIcon = input.parentElement.querySelector('.eye-icon');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    eyeIcon.classList.toggle('fa-eye', !show);
    eyeIcon.classList.toggle('fa-eye-slash', show);
}

const emailInput = document.getElementById('email');
const emailHint = document.getElementById('emailHint');

function showEmailHint(message, suggestion) {
    emailHint.textContent = message + ' ';
    if (suggestion) {
        const fix = document.createElement('button');
        fix.type = 'button';
        fix.className = 'email-hint-fix';
        fix.textContent = 'Dùng ' + suggestion;
        fix.addEventListener('click', function () {
            emailInput.value = suggestion;
            hideEmailHint();
        });
        emailHint.appendChild(fix);
    }
    emailHint.hidden = false;
    emailInput.classList.add('input-error');
}
function hideEmailHint() {
    emailHint.hidden = true;
    emailHint.textContent = '';
    emailInput.classList.remove('input-error');
}
emailInput.addEventListener('input', hideEmailHint);

document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = emailInput.value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!firstName || !lastName || !username || !email || !password) {
        showToast("Vui lòng điền đầy đủ thông tin!", "warning"); return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        showToast("Username dài 3–30 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới!", "warning"); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showEmailHint("Email không hợp lệ."); emailInput.focus(); return;
    }
    if (password.length < 8) {
        showToast("Mật khẩu phải có ít nhất 8 ký tự!", "warning"); return;
    }
    if (password !== confirmPassword) {
        showToast("Mật khẩu xác nhận không khớp!", "warning");
        document.getElementById('confirmPassword').focus(); return;
    }
    if (!document.getElementById('terms').checked) {
        showToast("Bạn cần đồng ý với điều khoản dịch vụ!", "warning"); return;
    }

    const btn = document.querySelector('.btn-register');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span>Đang kiểm tra email...</span>';
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, username, email, password })
        });
        const data = await window.ApiClient.handleResponse(res, { skipAuthRedirect: true });

        showToast("Đăng ký thành công! Mời bạn đăng nhập.", "success", 1500);
        const params = new URLSearchParams({ registered: '1', email: (data && data.email) || email });
        const next = new URLSearchParams(window.location.search).get('next');
        if (next) params.set('next', next); // login.html validates it via AuthService.getSafeNext()
        setTimeout(function () { window.location.href = 'login.html?' + params.toString(); }, 600);
    } catch (err) {
        console.error('Register error:', err);
        if (err.coldStart) {
            showToast("Server đang khởi động lại (thường mất khoảng 30 giây), vui lòng thử lại.", "warning");
        } else if (err.body && err.body.code === 'BAD_EMAIL') {
            showEmailHint(err.body.message, err.body.suggestion);
            emailInput.focus();
        } else if (err.body) {
            showToast(err.body.message || "Đăng ký thất bại!", "error");
        } else {
            showToast("Không kết nối được server! Vui lòng thử lại.", "warning");
        }
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
});

document.querySelector('.btn-social.google').addEventListener('click', function () {
    window.location.href = `${API}/auth/google`;
});

window.addEventListener('DOMContentLoaded', () => {
    const yrEl = document.getElementById('footer-year');
    if (yrEl) yrEl.textContent = new Date().getFullYear();
});
