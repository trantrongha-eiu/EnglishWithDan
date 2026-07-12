export const API = import.meta.env.VITE_API_URL || 'https://englishwithdan.onrender.com/api';

export function authHeaders() {
  return {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  };
}

export async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });

  // Phase 5 audit finding: this used to have no 401 handling at all — an
  // expired/invalid token just became a generic thrown error with no
  // redirect, so a session that died mid-use (rather than being caught at
  // route-navigation time by ProtectedRoute) left the admin stuck on a
  // broken page. Mirrors the public site's shared/api-client.js: clear the
  // session and bounce to login, remembering the current admin route the
  // same way ProtectedRoute.jsx's redirect-back does.
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastLoginAt');
    const next = encodeURIComponent('/admin/' + (window.location.hash || ''));
    window.location.href = '/login.html?next=' + next;
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
  catch (e) { throw new Error('Phản hồi không hợp lệ từ server.'); }

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
