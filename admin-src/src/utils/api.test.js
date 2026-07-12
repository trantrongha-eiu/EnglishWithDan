import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, authHeaders, API, formatDate, escH } from './api';

describe('authHeaders', () => {
  beforeEach(() => localStorage.clear());

  it('attaches the Authorization header built from the stored token', () => {
    localStorage.setItem('token', 'my-token');
    expect(authHeaders()).toEqual({
      Authorization: 'Bearer my-token',
      'Content-Type': 'application/json',
    });
  });

  it('sends "Bearer null" when no token is stored', () => {
    expect(authHeaders().Authorization).toBe('Bearer null');
  });
});

describe('apiFetch', () => {
  let originalLocation;

  beforeEach(() => {
    localStorage.clear();
    originalLocation = window.location;
    delete window.location;
    window.location = { href: '', hash: '' };
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.restoreAllMocks();
  });

  it('sends the Authorization header derived from the stored token', async () => {
    localStorage.setItem('token', 'abc');
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });

    await apiFetch('/users');

    expect(global.fetch).toHaveBeenCalledWith(
      `${API}/users`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer abc' }),
      })
    );
  });

  it('clears the session and redirects to login on a 401, remembering the current hash', async () => {
    localStorage.setItem('token', 'expired');
    localStorage.setItem('user', JSON.stringify({ role: 'teacher' }));
    localStorage.setItem('lastLoginAt', '123');
    window.location.hash = '#/writing-grades';
    global.fetch = vi.fn().mockResolvedValue({ status: 401, ok: false, text: async () => '' });

    await expect(apiFetch('/secret')).rejects.toThrow('Unauthorized');

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('lastLoginAt')).toBeNull();
    expect(window.location.href).toBe(
      '/login.html?next=' + encodeURIComponent('/admin/#/writing-grades')
    );
  });

  it('normalizes an HTML 502/503 response into a "server-cold-start" error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 503,
      ok: false,
      text: async () => '<html><body>Bad gateway</body></html>',
    });

    const err = await apiFetch('/anything').catch((e) => e);
    expect(err.message).toBe('server-cold-start');
    expect(err.coldStart).toBe(true);
    expect(err.status).toBe(503);
  });

  it('normalizes a non-cold-start HTML error page into an "HTTP <status>" error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 500,
      ok: false,
      text: async () => '<html><body>Internal Server Error</body></html>',
    });

    const err = await apiFetch('/anything').catch((e) => e);
    expect(err.message).toBe('HTTP 500');
    expect(err.coldStart).toBe(false);
  });

  it('parses and returns the JSON body on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => JSON.stringify({ id: 1, name: 'Dan' }),
    });

    const data = await apiFetch('/thing');
    expect(data).toEqual({ id: 1, name: 'Dan' });
  });

  it('throws using the server-provided message on a non-401 error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 400,
      ok: false,
      text: async () => JSON.stringify({ message: 'Bad input' }),
    });

    await expect(apiFetch('/thing')).rejects.toThrow('Bad input');
  });

  it('throws a Vietnamese "invalid response" error when the body is not valid JSON and not HTML', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => 'not-json-and-not-html',
    });

    await expect(apiFetch('/thing')).rejects.toThrow('Phản hồi không hợp lệ từ server.');
  });
});

describe('formatDate', () => {
  it('returns an en dash for falsy input', () => {
    expect(formatDate(null)).toBe('–');
    expect(formatDate('')).toBe('–');
    expect(formatDate(undefined)).toBe('–');
  });

  it('formats a date as dd/mm/yyyy hh:mm, zero-padded', () => {
    const d = new Date(2024, 2, 5, 9, 7, 0); // 5 Mar 2024, 09:07 local time
    expect(formatDate(d)).toBe('05/03/2024 09:07');
  });
});

describe('escH', () => {
  it('escapes HTML special characters', () => {
    expect(escH(`<script>&"test"</script>`)).toBe(
      '&lt;script&gt;&amp;&quot;test&quot;&lt;/script&gt;'
    );
  });

  it('returns an empty string for null/undefined input', () => {
    expect(escH(null)).toBe('');
    expect(escH(undefined)).toBe('');
  });
});
