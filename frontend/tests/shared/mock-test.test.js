'use strict';

const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  // mock-test.js reads window.AuthService (authHeader/isLoggedIn/clearSession/
  // buildLoginUrl) and window.ApiClient.handleResponse — same dependency
  // chain auth-service.js itself documents (safe-redirect -> auth-service).
  loadScript('safe-redirect.js', 'auth-service.js', 'api-client.js', 'mock-test.js');
});

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
  delete global.fetch;
});

const PENDING_KEY = 'ews_mock_pending_advance';

// jsdom's real Location throws on assignment ("Not implemented: navigation")
// and won't let us set `.search` either — swap in a plain writable object for
// the duration of one test, mirroring tests/shared/auth-service.test.js's
// withMockLocation, but also seeded with a `search` string so params() (which
// reads location.search) resolves the way a real ?mock=&skill= URL would.
async function withMockLocation(search, run) {
  const original = Object.getOwnPropertyDescriptor(window, 'location');
  const mockLocation = { search: search || '', href: '' };
  Object.defineProperty(window, 'location', { value: mockLocation, writable: true, configurable: true });
  try {
    return await run(mockLocation);
  } finally {
    Object.defineProperty(window, 'location', original);
  }
}

function fetchOnce({ status, body }) {
  return jest.fn().mockResolvedValueOnce({
    status,
    ok: status >= 200 && status < 300,
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
  });
}

describe('MockTest.advance — success', () => {
  test('records the step, clears any pending marker, and navigates per nav.nextSkill', async () => {
    global.fetch = fetchOnce({ status: 200, body: { success: true, nav: { nextSkill: 'reading' } } });
    await withMockLocation('?mock=M1&skill=listening', async (loc) => {
      await window.MockTest.advance('listening', 'sub1');
      expect(loc.href).toBe('reading.html?mock=M1&skill=reading');
    });
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toContain('/mock-test/M1/advance');
    expect(JSON.parse(opts.body)).toEqual({ skill: 'listening', attemptId: 'sub1' });
  });

  test('nav.sittingBreak sends the student to the dashboard break screen', async () => {
    global.fetch = fetchOnce({ status: 200, body: { success: true, nav: { sittingBreak: true, breakAfter: 'reading' } } });
    await withMockLocation('?mock=M1&skill=reading', async (loc) => {
      await window.MockTest.advance('reading', 'sub2');
      expect(loc.href).toBe('dashboard.html?mockbreak=reading');
    });
  });

  test('nav.done sends the student to the mock review history', async () => {
    global.fetch = fetchOnce({ status: 200, body: { success: true, nav: { done: true } } });
    await withMockLocation('?mock=M1&skill=speaking', async (loc) => {
      await window.MockTest.advance('speaking', 'sub4');
      expect(loc.href).toBe('review-history.html?view=mock');
    });
  });
});

describe('MockTest.advance — a 401 mid-submit does not strand or wipe the student', () => {
  test('preserves the pending-advance record, clears the session, and sends them to login with next=dashboard (not back to the just-finished skill page)', async () => {
    localStorage.setItem('token', 'stale-token');
    localStorage.setItem('user', JSON.stringify({ _id: 'u1' }));
    global.fetch = fetchOnce({ status: 401, body: { success: false, message: 'Unauthorized' } });

    await withMockLocation('?mock=M1&skill=listening', async (loc) => {
      await window.MockTest.advance('listening', 'sub1');
      // Bounced to login — but crucially to resume on the dashboard, not
      // back onto listening.html?mock=&skill=listening (which would start
      // a brand-new Listening attempt and redo an already-graded skill).
      expect(loc.href).toBe('/login.html?next=' + encodeURIComponent('dashboard.html'));
    });

    // The session was cleared (a real 401 means the token really is dead)...
    expect(localStorage.getItem('token')).toBeNull();
    // ...but the intent to advance survives, keyed by the mock run, so it
    // can be replayed the instant the student is signed back in.
    const pending = JSON.parse(localStorage.getItem(PENDING_KEY));
    expect(pending).toMatchObject({ mockId: 'M1', skill: 'listening', subAttemptId: 'sub1' });
  });

  test('does not retry a 401 (retrying an invalid token cannot succeed)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 401, ok: false, text: jest.fn().mockResolvedValue(JSON.stringify({ success: false })),
    });
    await withMockLocation('?mock=M1&skill=listening', async () => {
      await window.MockTest.advance('listening', 'sub1');
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('MockTest.advance — transient failure retries before giving up', () => {
  test('a network error on the first attempt is retried and can still succeed', async () => {
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({
        status: 200, ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify({ success: true, nav: { nextSkill: 'reading' } })),
      });
    await withMockLocation('?mock=M1&skill=listening', async (loc) => {
      await window.MockTest.advance('listening', 'sub1');
      expect(loc.href).toBe('reading.html?mock=M1&skill=reading');
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
  }, 10000);
});

describe('MockTest.flushPendingAdvance', () => {
  test('does nothing when there is no pending record', async () => {
    global.fetch = jest.fn();
    await window.MockTest.flushPendingAdvance();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('leaves the record in place while still signed out', async () => {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ mockId: 'M1', skill: 'listening', subAttemptId: 'sub1', ts: Date.now() }));
    global.fetch = jest.fn();
    await window.MockTest.flushPendingAdvance();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem(PENDING_KEY)).not.toBeNull();
  });

  test('signed back in, landed on the dashboard: silently finishes the step without forcing navigation', async () => {
    localStorage.setItem('token', 'fresh-token');
    localStorage.setItem(PENDING_KEY, JSON.stringify({ mockId: 'M1', skill: 'listening', subAttemptId: 'sub1', ts: Date.now() }));
    global.fetch = fetchOnce({ status: 200, body: { success: true, nav: { nextSkill: 'reading' } } });

    await withMockLocation('', async (loc) => {
      await window.MockTest.flushPendingAdvance();
      expect(loc.href).toBe(''); // not yanked off the dashboard
    });
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('signed back in, landed back on the exact stale skill page: navigates to the real next step instead of restarting it', async () => {
    localStorage.setItem('token', 'fresh-token');
    localStorage.setItem(PENDING_KEY, JSON.stringify({ mockId: 'M1', skill: 'listening', subAttemptId: 'sub1', ts: Date.now() }));
    global.fetch = fetchOnce({ status: 200, body: { success: true, nav: { nextSkill: 'reading' } } });

    await withMockLocation('?mock=M1&skill=listening', async (loc) => {
      await window.MockTest.flushPendingAdvance();
      expect(loc.href).toBe('reading.html?mock=M1&skill=reading');
    });
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
  });

  test('a definitive rejection (e.g. 409 wrong step) drops the stale record instead of retrying forever', async () => {
    localStorage.setItem('token', 'fresh-token');
    localStorage.setItem(PENDING_KEY, JSON.stringify({ mockId: 'M1', skill: 'listening', subAttemptId: 'sub1', ts: Date.now() }));
    global.fetch = fetchOnce({ status: 409, body: { success: false, message: 'wrong step' } });

    await window.MockTest.flushPendingAdvance();
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
  });

  test('a stale (>24h) pending record is dropped rather than replayed', async () => {
    localStorage.setItem('token', 'fresh-token');
    localStorage.setItem(PENDING_KEY, JSON.stringify({ mockId: 'M1', skill: 'listening', subAttemptId: 'sub1', ts: Date.now() - 25 * 60 * 60 * 1000 }));
    global.fetch = jest.fn();
    await window.MockTest.flushPendingAdvance();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
  });
});
