'use strict';

const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  loadScript('api-client.js');
});

afterEach(() => {
  localStorage.clear();
  delete window.AuthService;
  delete window.logout;
});

function mockRes({ status, ok, body }) {
  return {
    status,
    ok,
    text: jest.fn().mockResolvedValue(body),
  };
}

describe('ApiClient.handleResponse — success path', () => {
  test('returns parsed JSON body when res.ok', async () => {
    const res = mockRes({ status: 200, ok: true, body: JSON.stringify({ success: true, data: [1, 2, 3] }) });
    const data = await window.ApiClient.handleResponse(res);
    expect(data).toEqual({ success: true, data: [1, 2, 3] });
  });

  test('returns {} when the body text is empty', async () => {
    const res = mockRes({ status: 204, ok: true, body: '' });
    const data = await window.ApiClient.handleResponse(res);
    expect(data).toEqual({});
  });
});

describe('ApiClient.handleResponse — non-2xx JSON error', () => {
  test('throws a normalized Error with .status and .body from the JSON error payload', async () => {
    const res = mockRes({
      status: 404,
      ok: false,
      body: JSON.stringify({ success: false, message: 'Not found' }),
    });
    await expect(window.ApiClient.handleResponse(res)).rejects.toMatchObject({
      message: 'Not found',
      status: 404,
      body: { success: false, message: 'Not found' },
    });
  });

  test('falls back to "HTTP <status>" as the message when the body has no .message', async () => {
    const res = mockRes({ status: 500, ok: false, body: JSON.stringify({}) });
    await expect(window.ApiClient.handleResponse(res)).rejects.toThrow('HTTP 500');
  });
});

describe('ApiClient.handleResponse — cold-start / non-JSON detection', () => {
  test('detects a Render cold-start HTML page on 502 and sets .coldStart = true', async () => {
    const res = mockRes({ status: 502, ok: false, body: '<html><body>Bad gateway</body></html>' });
    const err = await window.ApiClient.handleResponse(res).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err.coldStart).toBe(true);
    expect(err.status).toBe(502);
    expect(err.message).toBe('server-cold-start');
  });

  test('detects a Render cold-start HTML page on 503 too', async () => {
    const res = mockRes({ status: 503, ok: false, body: '<html>...</html>' });
    const err = await window.ApiClient.handleResponse(res).catch((e) => e);
    expect(err.coldStart).toBe(true);
  });

  test('an HTML body on a non-502/503 status is NOT flagged as cold start (coldStart = false)', async () => {
    const res = mockRes({ status: 404, ok: false, body: '<html>Not Found</html>' });
    const err = await window.ApiClient.handleResponse(res).catch((e) => e);
    expect(err.coldStart).toBe(false);
    expect(err.message).toBe('HTTP 404');
  });

  test('leading whitespace before "<" is still detected as HTML (trimStart)', async () => {
    const res = mockRes({ status: 502, ok: false, body: '   \n<html></html>' });
    const err = await window.ApiClient.handleResponse(res).catch((e) => e);
    expect(err.coldStart).toBe(true);
  });
});

describe('ApiClient.handleResponse — malformed JSON', () => {
  test('throws a Vietnamese "invalid response" error when the body is neither HTML nor valid JSON', async () => {
    const res = mockRes({ status: 200, ok: true, body: 'not json at all {' });
    await expect(window.ApiClient.handleResponse(res)).rejects.toThrow('Phản hồi không hợp lệ từ server.');
  });
});

describe('ApiClient.handleResponse — 401 handling', () => {
  test('delegates to AuthService.logout() when AuthService is present, and throws "Unauthorized"', async () => {
    const logout = jest.fn();
    window.AuthService = { logout };
    const res = mockRes({ status: 401, ok: false, body: '' });

    await expect(window.ApiClient.handleResponse(res)).rejects.toThrow('Unauthorized');
    expect(logout).toHaveBeenCalledTimes(1);
  });

  test('falls back to window.logout() when AuthService is absent', async () => {
    const logout = jest.fn();
    window.logout = logout;
    const res = mockRes({ status: 401, ok: false, body: '' });

    await expect(window.ApiClient.handleResponse(res)).rejects.toThrow('Unauthorized');
    expect(logout).toHaveBeenCalledTimes(1);
  });

  test('opts.skipAuthRedirect=true skips the logout call and falls through to normal error handling', async () => {
    const logout = jest.fn();
    window.AuthService = { logout };
    const res = mockRes({
      status: 401,
      ok: false,
      body: JSON.stringify({ message: 'Token expired' }),
    });

    await expect(window.ApiClient.handleResponse(res, { skipAuthRedirect: true })).rejects.toMatchObject({
      message: 'Token expired',
      status: 401,
    });
    expect(logout).not.toHaveBeenCalled();
  });
});
