export const API = import.meta.env.VITE_API_URL || 'https://englishwithdan.onrender.com/api';

export function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  };
}

let loginRedirectPending = false;

function redirectToLoginOnce() {
  if (loginRedirectPending) return;
  loginRedirectPending = true;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('lastLoginAt');
  const next = encodeURIComponent('/app/' + window.location.hash);
  window.location.href = '/login.html?next=' + next;
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'token' && e.newValue) loginRedirectPending = false;
  });
}

export async function apiFetch(path, opts = {}) {
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
    if (e?.name === 'AbortError') {
      const err = new Error('Server phản hồi quá lâu — có thể đang khởi động. Thử lại sau vài giây.');
      err.coldStart = true;
      throw err;
    }
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }

  if (res.status === 401) {
    // Pushed out by a login on another device: auth-service's popup handles it
    const body = await res.clone().json().catch(() => null);
    if (body?.code === 'SESSION_REPLACED' && window.AuthService) {
      window.AuthService.logout('replaced');
      throw new Error('Unauthorized');
    }
    redirectToLoginOnce();
    throw new Error('Unauthorized');
  }

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
