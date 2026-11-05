export const API = import.meta.env.VITE_API_URL || 'https://englishwithdan.onrender.com/api';

// NEW-001: separate from API on purpose. API is the *backend*'s own
// domain (Render Web Service) — correct for fetch()/apiFetch() calls.
// Student-facing links (e.g. "copy shareable link" buttons) must point at
// the *frontend*'s production domain instead, which is a different Render
// deployment (a Static Site) with its own real-world domain. Conflating
// the two previously sent students a link to a domain that only serves
// the API and 404s on any .html page. Same env-var-with-fallback pattern
// as API.
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'https://ieltsthayha.com';

export function authHeaders() {
  return {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  };
}

// Session died (401): go to login once. An editor with unsaved changes makes
// the browser ask "Leave page?"; if the admin stays, the 60s polls used to
// redirect — and re-ask — every minute. Instead show a banner and let them
// sign in from a new tab; a new token in localStorage resets this.
let loginRedirectPending = false;

function redirectToLoginOnce() {
  if (loginRedirectPending) return;
  loginRedirectPending = true;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('lastLoginAt');
  const url = '/login.html?next=' + encodeURIComponent('/admin/' + (window.location.hash || ''));
  window.location.href = url;
  setTimeout(() => showSessionExpiredBanner(url), 2500);
}

function showSessionExpiredBanner(url) {
  if (!document.body || document.getElementById('ews-session-expired')) return;
  const bar = document.createElement('div');
  bar.id = 'ews-session-expired';
  bar.setAttribute('role', 'alert');
  bar.style.cssText = 'position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:2147483646;'
    + 'max-width:calc(100% - 24px);width:560px;background:#fef3c7;color:#78350f;border:1px solid #f59e0b;'
    + 'border-radius:12px;padding:12px 16px;box-shadow:0 10px 30px rgba(0,0,0,.18);font-size:14px;'
    + 'line-height:1.5;display:flex;gap:12px;align-items:center;flex-wrap:wrap;';
  const text = document.createElement('div');
  text.style.cssText = 'flex:1 1 260px;';
  text.textContent = 'Phiên đăng nhập đã hết hạn. Phần chưa lưu vẫn còn trên trang này — hãy đăng nhập lại ở tab mới rồi quay lại bấm Lưu.';
  const btn = document.createElement('a');
  btn.href = url;
  btn.target = '_blank';
  btn.rel = 'noopener';
  btn.textContent = 'Đăng nhập ở tab mới';
  btn.style.cssText = 'background:#d97706;color:#fff;border-radius:8px;padding:8px 14px;font-weight:600;'
    + 'text-decoration:none;white-space:nowrap;';
  bar.append(text, btn);
  document.body.appendChild(bar);
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== 'token' || !e.newValue) return;
    loginRedirectPending = false;
    document.getElementById('ews-session-expired')?.remove();
  });
}

export async function apiFetch(path, opts = {}) {
  // Abort a hung request (Render cold start, dropped connection) after 30s so
  // a page awaiting it can't spin forever with no error. Caller can override
  // with opts.timeout, or pass its own opts.signal to opt out.
  const ctrl = opts.signal ? null : new AbortController();
  const timer = ctrl ? setTimeout(() => ctrl.abort(), opts.timeout || 30000) : null;

  let res;
  try {
    res = await fetch(`${API}${path}`, {
      ...opts,
      signal: opts.signal || (ctrl && ctrl.signal),
      headers: { ...authHeaders(), ...(opts.headers || {}) },
    });
  } catch (e) {
    if (e && e.name === 'AbortError') {
      const err = new Error('Server phản hồi quá lâu — có thể đang khởi động. Thử lại sau vài giây.');
      err.coldStart = true;
      throw err;
    }
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }

  // Phase 5 audit finding: this used to have no 401 handling at all — an
  // expired/invalid token just became a generic thrown error with no
  // redirect, so a session that died mid-use (rather than being caught at
  // route-navigation time by ProtectedRoute) left the admin stuck on a
  // broken page. Mirrors the public site's shared/api-client.js: clear the
  // session and bounce to login, remembering the current admin route the
  // same way ProtectedRoute.jsx's redirect-back does.
  if (res.status === 401) {
    redirectToLoginOnce();
    throw new Error('Unauthorized');
  }

  // Also mirrors shared/api-client.js's cold-start detection: a Render
  // cold start (or any proxy error page) returns HTML, not JSON — parsing
  // that as JSON throws an opaque SyntaxError instead of a normalized,
  // catchable error with a useful message.
  const text = await res.text();
  if (text.trimStart().startsWith('<')) {
    const isColdStart = res.status === 502 || res.status === 503;
    const err = new Error(isColdStart ? 'server-cold-start' : `HTTP ${res.status}`);
    err.status = res.status;
    err.coldStart = isColdStart;
    throw err;
  }

  let data;
  try { data = text ? JSON.parse(text) : {}; }
  catch (e) { throw new Error('Phản hồi không hợp lệ từ server.', { cause: e }); }

  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export function formatDate(s) {
  if (!s) return '–';
  const d = new Date(s);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function escH(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
