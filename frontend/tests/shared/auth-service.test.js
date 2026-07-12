'use strict';

const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  // auth-service.js's own header comment says it depends on safe-redirect.js
  // being loaded first (for getSafeNext()/buildLoginUrl() to work; it
  // degrades to "no next" rather than throwing if missing).
  loadScript('safe-redirect.js', 'auth-service.js');
});

beforeEach(() => {
  localStorage.clear();
});

// jsdom does not implement real navigation: assigning to
// `window.location.href` just logs "Not implemented: navigation" and
// leaves location unchanged, and window.location's own `href` accessor
// is non-configurable so jest.spyOn(window.location, 'href', 'set')
// throws. window.location itself, however, IS a configurable, writable
// own property of `window` — so we swap it out for a plain writable
// object for the duration of a test that needs to observe a navigation
// target, then restore the real Location object afterwards.
function withMockLocation(run) {
  const original = Object.getOwnPropertyDescriptor(window, 'location');
  const mockLocation = { href: '' };
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
    configurable: true,
  });
  try {
    run(mockLocation);
  } finally {
    Object.defineProperty(window, 'location', original);
  }
}

describe('storage primitives — token', () => {
  test('setToken/getToken round-trip through the "token" localStorage key', () => {
    expect(window.AuthService.getToken()).toBeNull();
    window.AuthService.setToken('abc.def.ghi');
    expect(localStorage.getItem('token')).toBe('abc.def.ghi');
    expect(window.AuthService.getToken()).toBe('abc.def.ghi');
  });
});

describe('storage primitives — user', () => {
  test('setUser/getUser round-trip through the "user" localStorage key as JSON', () => {
    const user = { _id: '1', role: 'student', plan: 'free' };
    window.AuthService.setUser(user);
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(user);
    expect(window.AuthService.getUser()).toEqual(user);
  });

  test('getUser returns null (not throw) when the stored value is malformed JSON', () => {
    localStorage.setItem('user', 'not-json{{{');
    expect(window.AuthService.getUser()).toBeNull();
  });

  test('getUser returns null when nothing is stored', () => {
    expect(window.AuthService.getUser()).toBeNull();
  });
});

describe('storage primitives — lastLoginAt', () => {
  test('touchLastLoginAt writes the current time to the "lastLoginAt" key', () => {
    const before = Date.now();
    window.AuthService.touchLastLoginAt();
    const stored = window.AuthService.getLastLoginAt();
    expect(stored).toBeGreaterThanOrEqual(before);
    expect(localStorage.getItem('lastLoginAt')).toBe(String(stored));
  });

  test('getLastLoginAt returns 0 when nothing is stored', () => {
    expect(window.AuthService.getLastLoginAt()).toBe(0);
  });
});

describe('clearSession', () => {
  test('clears token, user, and lastLoginAt from localStorage', () => {
    window.AuthService.setToken('tok');
    window.AuthService.setUser({ role: 'student' });
    window.AuthService.touchLastLoginAt();

    window.AuthService.clearSession();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('lastLoginAt')).toBeNull();
  });

  test('does not remove unrelated localStorage keys', () => {
    localStorage.setItem('theme', 'dark');
    window.AuthService.setToken('tok');
    window.AuthService.clearSession();
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});

describe('logout', () => {
  test('clears the session and navigates to login.html (no reason)', () => {
    window.AuthService.setToken('tok');
    window.AuthService.setUser({ role: 'student' });

    withMockLocation((loc) => {
      window.AuthService.logout();
      expect(loc.href).toBe('login.html');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  test('appends ?reason=<reason> to the login URL when a reason is given', () => {
    window.AuthService.setToken('tok');
    withMockLocation((loc) => {
      window.AuthService.logout('inactive');
      expect(loc.href).toBe('login.html?reason=inactive');
    });
  });
});

describe('isLoggedIn', () => {
  test('false when there is no token', () => {
    expect(window.AuthService.isLoggedIn()).toBe(false);
  });

  test('true once a token is set', () => {
    window.AuthService.setToken('tok');
    expect(window.AuthService.isLoggedIn()).toBe(true);
  });
});

describe('role helpers', () => {
  test('isAdmin/isTeacher/isStaff reflect the stored user role', () => {
    window.AuthService.setUser({ role: 'admin' });
    expect(window.AuthService.isAdmin()).toBe(true);
    expect(window.AuthService.isTeacher()).toBe(false);
    expect(window.AuthService.isStaff()).toBe(true);

    window.AuthService.setUser({ role: 'teacher' });
    expect(window.AuthService.isAdmin()).toBe(false);
    expect(window.AuthService.isStaff()).toBe(true);

    window.AuthService.setUser({ role: 'student' });
    expect(window.AuthService.isStaff()).toBe(false);
  });

  test('accept an explicit userOverride instead of reading localStorage', () => {
    window.AuthService.setUser({ role: 'student' });
    expect(window.AuthService.isAdmin({ role: 'admin' })).toBe(true);
  });
});

describe('premium helpers', () => {
  test('isPremiumCached is true only when user.plan === "premium"', () => {
    window.AuthService.setUser({ role: 'student', plan: 'free' });
    expect(window.AuthService.isPremiumCached()).toBe(false);
    window.AuthService.setUser({ role: 'student', plan: 'premium' });
    expect(window.AuthService.isPremiumCached()).toBe(true);
  });

  test('hasPremiumAccess is true for staff even without a premium plan', () => {
    window.AuthService.setUser({ role: 'teacher', plan: 'free' });
    expect(window.AuthService.isPremiumCached()).toBe(false);
    expect(window.AuthService.hasPremiumAccess()).toBe(true);
  });
});

describe('authHeader', () => {
  test('returns an empty object when there is no token', () => {
    expect(window.AuthService.authHeader()).toEqual({});
  });

  test('returns { Authorization: "Bearer <token>" } when a token is present', () => {
    window.AuthService.setToken('xyz123');
    expect(window.AuthService.authHeader()).toEqual({ Authorization: 'Bearer xyz123' });
  });
});

describe('login', () => {
  test('writes token + user and touches lastLoginAt', () => {
    window.AuthService.login('tok-1', { role: 'student' });
    expect(window.AuthService.getToken()).toBe('tok-1');
    expect(window.AuthService.getUser()).toEqual({ role: 'student' });
    expect(window.AuthService.getLastLoginAt()).toBeGreaterThan(0);
  });
});

describe('checkInactiveLogout', () => {
  test('returns false and does not log out when there is no lastLoginAt', () => {
    expect(window.AuthService.checkInactiveLogout()).toBe(false);
    expect(window.AuthService.getToken()).toBeNull();
  });

  test('returns false when the last login is within the 10-day window', () => {
    window.AuthService.setToken('tok');
    window.AuthService.touchLastLoginAt();
    expect(window.AuthService.checkInactiveLogout()).toBe(false);
    expect(window.AuthService.getToken()).toBe('tok');
  });

  test('logs out and returns true when the last login is older than 10 days', () => {
    window.AuthService.setToken('tok');
    const elevenDaysAgo = Date.now() - 11 * 24 * 60 * 60 * 1000;
    localStorage.setItem('lastLoginAt', String(elevenDaysAgo));

    withMockLocation((loc) => {
      expect(window.AuthService.checkInactiveLogout()).toBe(true);
      expect(loc.href).toBe('login.html?reason=inactive');
    });
    expect(window.AuthService.getToken()).toBeNull();
  });
});

describe('getPostLoginRedirect', () => {
  function setSearch(qs) {
    window.history.pushState({}, '', '/login.html' + qs);
  }

  test('sends staff to /admin/ and students to dashboard.html when there is no ?next=', () => {
    setSearch('');
    expect(window.AuthService.getPostLoginRedirect({ role: 'admin' })).toBe('/admin/');
    expect(window.AuthService.getPostLoginRedirect({ role: 'student' })).toBe('dashboard.html');
  });

  test('honors a safe ?next= whose admin-ness matches the user role', () => {
    setSearch('?next=' + encodeURIComponent('/admin/#/students'));
    expect(window.AuthService.getPostLoginRedirect({ role: 'admin' })).toBe('/admin/#/students');
  });

  test('ignores ?next= when its admin-ness does NOT match the user role (student given an admin next)', () => {
    setSearch('?next=' + encodeURIComponent('/admin/#/students'));
    expect(window.AuthService.getPostLoginRedirect({ role: 'student' })).toBe('dashboard.html');
  });

  test('ignores an unsafe ?next= (open-redirect attempt) and falls back to the default', () => {
    setSearch('?next=' + encodeURIComponent('https://evil.com'));
    expect(window.AuthService.getPostLoginRedirect({ role: 'student' })).toBe('dashboard.html');
  });
});

describe('buildLoginUrl', () => {
  test('URL-encodes the destination as a ?next= param on login.html', () => {
    expect(window.AuthService.buildLoginUrl('/reading/test/abc?x=1')).toBe(
      'login.html?next=' + encodeURIComponent('/reading/test/abc?x=1')
    );
  });
});
