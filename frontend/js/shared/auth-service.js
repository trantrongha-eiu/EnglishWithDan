/**
 * shared/auth-service.js — AuthService (Phase 5)
 *
 * Single source of truth for session state, role/permission detection, and
 * auth-related redirects across the public site. Deliberately pure — no
 * page-load side effects, no DOMContentLoaded listeners, no automatic
 * redirects. `js/auth.js` is the thin bootstrap that wires these functions
 * into each page's lifecycle (the page-load guard, the inactivity check,
 * the banned-account interceptor); pages that need the storage/redirect
 * primitives WITHOUT that automatic guard behavior (login.html,
 * auth-callback.html) load this file directly instead of auth.js.
 *
 * Scope decision (mirrors the Phase 3 scope note in shared/api-client.js):
 * this does NOT centralize full request-building (URL-joining, FormData
 * handling) or the theme/sound/autosave localStorage keys scattered around
 * the app — only the three session keys ('token','user','lastLoginAt') and
 * the role/plan/redirect logic that was genuinely duplicated across many
 * files. authHeader() returns only the Authorization line, not a full
 * headers object, so callers that need 'Content-Type' or that are sending
 * FormData (which must NOT set Content-Type) keep composing their own —
 * unifying that part isn't duplication, it's several valid variations of
 * "build a headers object".
 *
 * Depends on js/shared/safe-redirect.js being loaded first (for
 * getSafeNext()/buildLoginUrl() — both degrade to "no next" if it's
 * missing rather than throwing, so load order mistakes fail soft).
 */
(function () {
  'use strict';

  var TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

  // ── Storage primitives ──────────────────────────────────────
  function getToken() { return localStorage.getItem('token'); }
  function setToken(t) { localStorage.setItem('token', t); }
  function getUser() {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch (e) { return null; }
  }
  function setUser(u) { localStorage.setItem('user', JSON.stringify(u)); }
  function getLastLoginAt() { return parseInt(localStorage.getItem('lastLoginAt') || '0', 10); }
  function touchLastLoginAt() { localStorage.setItem('lastLoginAt', Date.now().toString()); }
  function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastLoginAt');
  }

  // ── Session / role / permission ─────────────────────────────
  function isLoggedIn() { return !!getToken(); }

  function getRole(userOverride) {
    var u = userOverride || getUser();
    return u ? u.role : null;
  }
  function isAdmin(userOverride) { return getRole(userOverride) === 'admin'; }
  function isTeacher(userOverride) { return getRole(userOverride) === 'teacher'; }
  function isStaff(userOverride) { return ['admin', 'teacher'].includes(getRole(userOverride)); }

  // Cached (sync, no network) premium check — reads whatever plan value is
  // currently in localStorage. Server is the real gate (backend/middleware/
  // requirePremium.js); this is for UI-only decisions (lock icons, showing
  // the upgrade modal) so a page doesn't need to await a network call just
  // to decide what to render.
  function isPremiumCached(userOverride) {
    var u = userOverride || getUser();
    return !!u && u.plan === 'premium';
  }
  // Staff (admin/teacher) always has premium-equivalent access, matching
  // the server-side rule in backend/middleware/requirePremium.js.
  function hasPremiumAccess(userOverride) {
    var u = userOverride || getUser();
    return isPremiumCached(u) || isStaff(u);
  }

  // Re-verifies plan with the server and merges the fresh value back into
  // the cached user object — the same "silent refresh" nav.js already did
  // on every authenticated page load, now reusable by any page/gate that
  // wants an up-to-date plan before making a premium decision.
  function refreshPlan(apiBase) {
    var token = getToken();
    if (!token) return Promise.resolve(null);
    return fetch((apiBase || AuthService.API) + '/auth/me', { headers: authHeader() })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.success || !d.user) return null;
        touchLastLoginAt();
        var u = getUser() || {};
        u.plan = d.user.plan;
        u.planExpiresAt = d.user.planExpiresAt;
        u.planStartedAt = d.user.planStartedAt;
        setUser(u);
        return u;
      })
      .catch(function () { return null; });
  }

  function authHeader() {
    var t = getToken();
    return t ? { Authorization: 'Bearer ' + t } : {};
  }

  // ── Login / logout ───────────────────────────────────────────
  // Called by login.html (JWT login success) and auth-callback.html
  // (Google OAuth success) — the exact 3-line localStorage write both
  // pages used to hand-duplicate.
  function login(token, user) {
    setToken(token);
    setUser(user);
    touchLastLoginAt();
  }

  function logout(reason) {
    clearSession();
    var url = reason ? 'login.html?reason=' + encodeURIComponent(reason) : 'login.html';
    window.location.href = url;
  }

  // ── Redirect-after-login / redirect-after-OAuth ─────────────
  // Wraps SafeRedirect (open-redirect-safe validation) around the current
  // page's ?next= param. Returns null if absent/invalid/missing dependency.
  function getSafeNext() {
    if (!window.SafeRedirect) return null;
    var raw = new URLSearchParams(window.location.search).get('next');
    return window.SafeRedirect.getSafeNext(raw);
  }

  // Used by page-load guards to send an unauthenticated visitor to login
  // while remembering where they were headed.
  function buildLoginUrl(dest) {
    return 'login.html?next=' + encodeURIComponent(dest);
  }

  // Centralizes the role-matched "where does this user land after
  // login/OAuth" decision — previously duplicated between login.html and
  // auth-callback.html.
  function getPostLoginRedirect(user) {
    var staff = isStaff(user);
    var next = getSafeNext();
    if (next && next.admin === staff) return next.url;
    return staff ? '/admin/' : 'dashboard.html';
  }

  // ── Page guards (callable, not auto-run — see file header) ──
  // Guard 1: unauthenticated visitor on a non-public page → bounce to
  // login, remembering the full current URL (path/query/hash) as `next`.
  function requirePageAuth(isPublicPage) {
    if (isPublicPage || isLoggedIn()) return true;
    // Always the full pathname (leading slash), not just the basename —
    // a basename-only dest (e.g. "abc123" from "/reading/test/abc123")
    // fails SafeRedirect's validation and silently drops the redirect-back
    // target for every Phase 4 clean URL. Works for flat pages too, since
    // their pathname is already "/reading.html" etc.
    var dest = window.location.pathname + window.location.search + window.location.hash;
    window.location.href = buildLoginUrl(dest);
    return false;
  }

  // Guard 2: already-authenticated visitor lands on login/register/home →
  // send them straight to their real destination instead.
  function redirectIfAuthenticated() {
    if (!isLoggedIn()) return false;
    var user = getUser();
    if (!user) return false;
    window.location.href = isStaff(user) ? '/admin/' : 'dashboard.html';
    return true;
  }

  // Returns true if it just triggered a logout — callers use this to skip
  // any further guard that would otherwise fire its own separate redirect
  // on top of the one already queued here (a location.href assignment
  // doesn't stop the rest of the script from running).
  function checkInactiveLogout() {
    var last = getLastLoginAt();
    if (!last) return false;
    if (Date.now() - last > TEN_DAYS_MS) { logout('inactive'); return true; }
    return false;
  }

  // ── 403-banned interceptor (installable, opt-in) ─────────────
  // Wraps window.fetch once to catch the banned-account signal the backend
  // sends as a 403 with a specific message, and force a logout with a
  // reason the login page can display. auth.js installs this on every page
  // it guards; kept here so the logic itself isn't duplicated if another
  // entry point ever needs it.
  var _bannedInstalled = false;
  function installBannedInterceptor(isPublicPage) {
    if (_bannedInstalled) return;
    _bannedInstalled = true;
    var origFetch = window.fetch;
    window.fetch = async function () {
      var res = await origFetch.apply(window, arguments);
      if (res.status === 403 && !isPublicPage) {
        try {
          var data = await res.clone().json();
          if (data && data.success === false &&
              typeof data.message === 'string' && data.message.includes('bị cấm')) {
            logout('banned');
            return res;
          }
        } catch (e) { /* ignore parse errors */ }
      }
      return res;
    };
  }

  var AuthService = {
    API: 'https://englishwithdan.onrender.com/api',
    getToken: getToken, setToken: setToken,
    getUser: getUser, setUser: setUser,
    getLastLoginAt: getLastLoginAt, touchLastLoginAt: touchLastLoginAt,
    clearSession: clearSession,
    isLoggedIn: isLoggedIn,
    getRole: getRole, isAdmin: isAdmin, isTeacher: isTeacher, isStaff: isStaff,
    isPremiumCached: isPremiumCached, hasPremiumAccess: hasPremiumAccess, refreshPlan: refreshPlan,
    authHeader: authHeader,
    login: login, logout: logout,
    getSafeNext: getSafeNext, buildLoginUrl: buildLoginUrl, getPostLoginRedirect: getPostLoginRedirect,
    requirePageAuth: requirePageAuth, redirectIfAuthenticated: redirectIfAuthenticated,
    checkInactiveLogout: checkInactiveLogout,
    installBannedInterceptor: installBannedInterceptor
  };

  window.AuthService = AuthService;
})();
