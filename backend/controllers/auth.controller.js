const crypto = require('crypto');
const authService = require('../services/authService');

// ── OAuth login-CSRF protection ──────────────────────────────
// passport.authenticate('google', {session:false, ...}) can't use
// passport's built-in session-backed state verification (no session
// middleware is mounted — this app is JWT-only). Without some binding
// between the browser that started the flow and the one that completes
// it, an attacker can start their own Google login, capture the
// not-yet-consumed callback URL (valid authorization code), and get a
// victim to open it — the server would exchange the attacker's code and
// hand the resulting JWT to the victim's browser (login/session-swap
// CSRF). A short-lived, single-purpose, httpOnly nonce cookie (scoped to
// this route only, never used for auth) closes that gap without adding
// a session store or a new dependency.
const OAUTH_NONCE_COOKIE = 'g_oauth_nonce';
const OAUTH_NONCE_LEN = 32; // hex chars (16 bytes)

function packOAuthState(nonce, next) {
  return next ? `${nonce}:${encodeURIComponent(next)}` : nonce;
}
function unpackOAuthState(state) {
  const nonce = (state || '').slice(0, OAUTH_NONCE_LEN);
  const rest = (state || '').slice(OAUTH_NONCE_LEN);
  let next = '';
  if (rest.startsWith(':')) {
    // decodeURIComponent throws on malformed %-sequences — a crafted
    // ?state= must degrade to "no next redirect", not a 500 (security audit finding).
    try { next = decodeURIComponent(rest.slice(1)); } catch { next = ''; }
  }
  return { nonce, next };
}
function parseCookie(req, name) {
  const header = req.headers.cookie || '';
  const match = header.split(';').map(s => s.trim()).find(s => s.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}
function setOAuthNonceCookie(res, nonce) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${OAUTH_NONCE_COOKIE}=${nonce}; HttpOnly; SameSite=Lax; Max-Age=600; Path=/api/auth/google${secure}`);
}
function clearOAuthNonceCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${OAUTH_NONCE_COOKIE}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/api/auth/google${secure}`);
}

// Middleware — must run BEFORE passport.authenticate('google', ...) on the
// callback route, since that middleware performs the authorization-code
// exchange itself; rejecting after it runs would be too late.
exports.verifyOAuthState = (req, res, next) => {
  const { nonce } = unpackOAuthState(typeof req.query.state === 'string' ? req.query.state : '');
  const cookieNonce = parseCookie(req, OAUTH_NONCE_COOKIE);
  clearOAuthNonceCookie(res); // single-use regardless of outcome
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (!nonce || !cookieNonce || nonce !== cookieNonce) {
    return res.redirect(`${frontendUrl}/login.html?error=oauth_state_mismatch`);
  }
  next();
};

// ── POST /api/auth/register ─────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const result = await authService.registerUser({ firstName, lastName, username, email, password });
    if (result.status === 'duplicate') {
      return res.status(400).json({ success: false, message: 'Email hoặc Username đã tồn tại' });
    }

    res.status(201).json({ success: true, token: result.token, user: result.user });
  } catch (err) {
    console.error('[Auth] register error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── POST /api/auth/login ────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    // not_found and wrong_password deliberately return the identical
    // status+message (user-enumeration fix, security audit) — an attacker
    // must not be able to tell "no such account" from "wrong password" by
    // response shape alone.
    if (result.status === 'not_found' || result.status === 'wrong_password') {
      return res.status(401).json({ success: false, message: 'Sai email/username hoặc mật khẩu' });
    }
    if (result.status === 'social_only') return res.status(400).json({ success: false, message: 'Tài khoản này đăng nhập bằng Google/Facebook' });
    if (result.status === 'banned') {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ giáo viên để mở khóa.' });
    }

    res.json({ success: true, token: result.token, user: result.user });
  } catch (err) {
    console.error('[Auth] login error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── POST /api/auth/forgot-password ──────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);

    // Don't reveal if email exists
    if (result.status === 'no_such_user') {
      return res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi sẽ gửi mã xác nhận.' });
    }
    if (result.status === 'email_not_configured') {
      return res.status(500).json({ success: false, message: 'Không thể gửi email lúc này. Vui lòng thử lại sau.' });
    }

    res.json({ success: true, message: 'Mã xác nhận đã được gửi đến email của bạn.' });
  } catch (err) {
    console.error('[Auth] forgotPassword error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── POST /api/auth/verify-otp ───────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOTP(email, otp);

    if (result.status === 'invalid') {
      return res.status(400).json({ success: false, message: 'Mã không hợp lệ hoặc đã hết hạn' });
    }

    res.json({ success: true, resetToken: result.resetToken });
  } catch (err) {
    console.error('[Auth] verifyOTP error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── POST /api/auth/reset-password ──────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const result = await authService.resetPassword(resetToken, newPassword);
    if (result.status === 'bad_token') return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    if (result.status === 'bad_purpose') return res.status(400).json({ success: false, message: 'Token không hợp lệ' });
    if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại' });

    res.json({ success: true, message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (err) {
    console.error('[Auth] resetPassword error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────
// Returns fresh user payload (plan auto-expired by the auth middleware)
exports.me = (req, res) => {
  res.json({ success: true, user: authService.userPayload(req.user) });
};

// ── GET /api/auth/google (called by the client, kicks off OAuth) ────
exports.startGoogleAuth = (req, res, next) => {
  const passport = require('passport');
  // Thread the post-login destination through Google's OAuth `state`
  // param (the standard way to preserve app state across the OAuth
  // round trip) so users deep-linking into a protected page can be
  // sent back to it after signing in with Google, not just JWT login.
  // Only accept safe, same-site relative paths — never a full URL —
  // to avoid turning this into an open redirect.
  const rawNext = typeof req.query.next === 'string' ? req.query.next : '';
  const safeNext = /^\/[^/\\]|^[a-zA-Z0-9][\w-]*\.html/.test(rawNext) && !rawNext.includes('://')
    ? rawNext
    : '';
  const nonce = crypto.randomBytes(OAUTH_NONCE_LEN / 2).toString('hex');
  setOAuthNonceCookie(res, nonce);
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: packOAuthState(nonce, safeNext)
  })(req, res, next);
};

// ── GET /api/auth/google/callback (called by passport) ──────
exports.googleCallback = (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    if (req.user.isBanned) {
      return res.redirect(`${frontendUrl}/login.html?error=banned`);
    }
    const { token, user } = authService.completeGoogleLogin(req.user);
    const payload = encodeURIComponent(JSON.stringify(user));
    // 'state' carries the CSRF nonce + pre-login destination through the
    // OAuth round trip (packed in startGoogleAuth, already verified by
    // verifyOAuthState before this handler runs) — echo the destination
    // back to auth-callback.html as `next` so it can send the user back to
    // the page they originally deep-linked into, same as the JWT login flow.
    const { next: state } = unpackOAuthState(typeof req.query.state === 'string' ? req.query.state : '');
    const nextParam = state ? `&next=${encodeURIComponent(state)}` : '';
    res.redirect(`${frontendUrl}/auth-callback.html?token=${token}&user=${payload}${nextParam}`);
  } catch (err) {
    res.redirect(`${frontendUrl}/login.html?error=social_auth_failed`);
  }
};
