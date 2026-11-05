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
 * SafeRedirect (the ?next= validator used by getSafeNext()/buildLoginUrl())
 * lives at the bottom of this file.
 */
(function () {
  'use strict';

  var TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
  // Free-plan gating: a brand-new account gets full access to every
  // feature for 24h from creation, then everything locks (mirrors
  // backend/utils/plan.js's TRIAL_DURATION_MS — kept as a separate
  // constant since frontend/backend are different runtimes, just need the
  // same value).
  var TRIAL_DURATION_MS = 24 * 60 * 60 * 1000;

  // ── Storage primitives ──────────────────────────────────────
  function getToken() { return localStorage.getItem('token'); }
  function setToken(t) { localStorage.setItem('token', t); }
  // Random id for this browser, sent with logins so the server's student
  // device limit (backend/utils/deviceSession.js) treats every tab of this
  // browser as one device. Kept across logouts (not part of clearSession).
  function getDeviceId() {
    try {
      var id = localStorage.getItem('ewsDeviceId');
      if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
        id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID().replace(/-/g, '')
          : (Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2));
        localStorage.setItem('ewsDeviceId', id);
      }
      return id;
    } catch (e) { return ''; }
  }
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
  // True for the first 24h after account creation — the free-plan trial
  // window (backend/utils/plan.js's isWithinTrial is the server-side
  // source of truth this mirrors). Requires `u.createdAt`, which only
  // reaches the cached user object via userPayload()/refreshPlan() — see
  // those for why an old cached user might momentarily read false here
  // until the next refreshPlan() call fills it in.
  function isWithinTrial(userOverride) {
    var u = userOverride || getUser();
    if (!u) return false;
    // Mirrors backend/utils/plan.js: an unverified local account has no
    // trial until its email is confirmed; the trial clock then runs from
    // trialStartedAt (verification time), else from createdAt.
    if (u.emailVerified === false) return false;
    var anchor = u.trialStartedAt || u.createdAt;
    if (!anchor) return false;
    return (Date.now() - new Date(anchor).getTime()) < TRIAL_DURATION_MS;
  }
  // Staff (admin/teacher) always has full access, matching the server-side
  // rule in backend/utils/plan.js's hasFullAccess — premium OR staff OR
  // still inside the free-plan 24h trial window.
  function hasPremiumAccess(userOverride) {
    var u = userOverride || getUser();
    return isPremiumCached(u) || isStaff(u) || isWithinTrial(u);
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
      .then(applyMePayload)
      .catch(function () { return null; });
  }

  // The merge half of refreshPlan(), for a /auth/me body fetched some other
  // way (nav.js gets it inside GET /api/nav/summary). Returns the merged
  // cached user, or null for an unusable body.
  function applyMePayload(d) {
    if (!d || !d.success || !d.user) return null;
    touchLastLoginAt();
    var u = getUser() || {};
    u.plan = d.user.plan;
    u.planExpiresAt = d.user.planExpiresAt;
    u.planStartedAt = d.user.planStartedAt;
    u.studyReminderCount = d.user.studyReminderCount || 0;
    u.tuitionReminderCount = d.user.tuitionReminderCount || 0;
    u.lastVocabStudyDate = d.user.lastVocabStudyDate || null;
    u.targetBand = d.user.targetBand || null;
    // Needed by isWithinTrial()/hasPremiumAccess() — a user cached
    // before this field existed self-heals here on their very next
    // page load (nav.js already calls refreshPlan() unconditionally).
    u.createdAt = d.user.createdAt || u.createdAt || null;
    // Email-verification / trial-anchor fields (isWithinTrial mirror).
    if (typeof d.user.emailVerified === 'boolean') u.emailVerified = d.user.emailVerified;
    u.trialStartedAt = d.user.trialStartedAt || u.trialStartedAt || null;
    setUser(u);
    return u;
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

  // Set by the fetch interceptor below when the server says this device
  // was signed out by a newer login elsewhere — so any page code that calls
  // logout() on the same 401 afterwards still lands on the right message.
  var _forcedLogoutReason = null;

  // While the "signed in on another device" popup is up, page code that
  // reacts to the same 401 by calling logout() must not navigate away
  // underneath it — the popup's button does the logout.
  var _replacedPopupOpen = false;

  function logout(reason) {
    reason = reason || _forcedLogoutReason;
    if (_replacedPopupOpen && reason === 'replaced') return;
    // After the user chose to stay (banner up), background 401s must not
    // ask "Leave page?" again; a click on a logout button still works.
    if (_stayedAfterLogout && !isUserGesture()) return;
    // BUG-023: tell the server to invalidate this user's tokens (all
    // devices — see backend/models/User.js's tokenValidAfter) before the
    // page navigates away. Best-effort: `keepalive` asks the browser to
    // still deliver the request even though navigation starts immediately
    // after, but if it's ever lost (offline, browser doesn't support it)
    // this degrades to exactly today's behavior — local session cleared,
    // old token still valid until natural expiry — never a hard failure
    // that blocks logout itself.
    var token = getToken();
    // A replaced session's token is already dead server-side — and the
    // logout call must never free the slot the other device now holds.
    if (token && reason !== 'replaced') {
      try {
        fetch(AuthService.API + '/auth/logout', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
          keepalive: true
        }).catch(function () {});
      } catch (e) { /* fetch/keepalive unsupported — ignore, see comment above */ }
    }
    clearSession();
    // Root-relative (leading "/") — some pages are reached through a
    // nested clean URL (e.g. /writing/templates) where the browser's
    // current path has an extra segment; a bare "login.html" would then
    // resolve to "/writing/login.html" (404) instead of "/login.html".
    var url = reason ? '/login.html?reason=' + encodeURIComponent(reason) : '/login.html';
    var here = window.location.href;
    window.location.href = url;
    // Still on the same page after a moment → a page with unsaved work
    // (Writing, exams) showed the browser's "Leave page?" and the user chose
    // to stay. Don't navigate again on every background poll's 401 (that
    // re-asked every 20s) — show a banner and let them sign in in a new tab.
    setTimeout(function () {
      if (window.location.href !== here) return;
      _stayedAfterLogout = true;
      showSessionExpiredBanner(url);
    }, 2500);
  }

  // True once the user stayed on the page after a logout redirect.
  // Cleared when a new token shows up (signed in again in another tab).
  var _stayedAfterLogout = false;

  function isUserGesture() {
    var ua = navigator.userActivation;
    return !!(ua && ua.isActive);
  }

  function showSessionExpiredBanner(url) {
    if (!document.body || document.getElementById('ews-session-expired')) return;
    var bar = document.createElement('div');
    bar.id = 'ews-session-expired';
    bar.setAttribute('role', 'alert');
    bar.style.cssText = 'position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:2147483646;' +
      'max-width:calc(100% - 24px);width:560px;background:#fef3c7;color:#78350f;border:1px solid #f59e0b;' +
      'border-radius:12px;padding:12px 16px;box-shadow:0 10px 30px rgba(0,0,0,.18);font-size:14px;' +
      'line-height:1.5;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-family:inherit;';
    var text = document.createElement('div');
    text.style.cssText = 'flex:1 1 260px;';
    text.textContent = tr('Phiên đăng nhập đã hết hạn. Phần đang làm vẫn còn trên trang này — hãy đăng nhập lại ở tab mới rồi quay lại lưu/nộp bài.');
    var btn = document.createElement('a');
    btn.href = url;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.textContent = tr('Đăng nhập ở tab mới');
    btn.style.cssText = 'background:#d97706;color:#fff;border-radius:8px;padding:8px 14px;font-weight:600;' +
      'text-decoration:none;white-space:nowrap;';
    bar.appendChild(text); bar.appendChild(btn);
    document.body.appendChild(bar);
  }

  // Signed in again in another tab (shared localStorage) → this tab works
  // again: drop the banner and allow a future logout to navigate.
  window.addEventListener('storage', function (e) {
    if (e.key !== 'token' || !e.newValue) return;
    _stayedAfterLogout = false;
    _forcedLogoutReason = null;
    var bar = document.getElementById('ews-session-expired');
    if (bar) bar.remove();
  });

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
    return '/login.html?next=' + encodeURIComponent(dest);
  }

  // Centralizes the role-matched "where does this user land after
  // login/OAuth" decision — previously duplicated between login.html and
  // auth-callback.html.
  function getPostLoginRedirect(user) {
    // A parent has exactly one page; a next= aimed anywhere else would just
    // bounce back off auth.js's parent guard.
    if (getRole(user) === 'parent') return '/parent.html';
    var staff = isStaff(user);
    var next = getSafeNext();
    if (next && next.admin === staff) return next.url;
    return staff ? '/admin/' : '/dashboard.html';
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
    // A guest (no-login Entrance Test session) has no dashboard — leave them
    // on the home/login page so they can sign in with a real account.
    if (user.role === 'guest') return false;
    window.location.href = user.role === 'parent' ? '/parent.html' : isStaff(user) ? '/admin/' : '/dashboard.html';
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
  // Students only (1 PC + 1 phone): the device that got pushed out sees this
  // popup over the page it's on, then goes to the login page. Staff have no
  // limit, so the server never sends them SESSION_REPLACED.
  function tr(vi) {
    return window.EWSI18n && typeof window.EWSI18n.t === 'function' ? window.EWSI18n.t(vi) : vi;
  }
  function showReplacedPopup() {
    if (_replacedPopupOpen) return;
    if (!document.body) { logout('replaced'); return; }
    _replacedPopupOpen = true;
    var overlay = document.createElement('div');
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,.6);' +
      'display:flex;align-items:center;justify-content:center;padding:16px;';
    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;color:#1e293b;max-width:420px;width:100%;border-radius:16px;' +
      'padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.3);text-align:center;font-family:inherit;';
    var icon = document.createElement('div');
    icon.textContent = '🔒';
    icon.style.cssText = 'font-size:40px;line-height:1;margin-bottom:12px;';
    var title = document.createElement('h3');
    title.textContent = tr('Bạn đã đăng nhập trên thiết bị khác');
    title.style.cssText = 'margin:0 0 10px;font-size:18px;font-weight:700;';
    var msg = document.createElement('p');
    msg.textContent = tr('Tài khoản của bạn vừa được đăng nhập ở nơi khác nên phiên ở đây đã bị đăng xuất. Mỗi tài khoản chỉ dùng được trên 1 máy tính và 1 điện thoại cùng lúc.');
    msg.style.cssText = 'margin:0 0 20px;font-size:14px;line-height:1.55;color:#475569;';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = tr('Đăng nhập lại');
    btn.style.cssText = 'background:#4f46e5;color:#fff;border:0;border-radius:10px;padding:10px 22px;' +
      'font-size:15px;font-weight:600;cursor:pointer;';
    btn.addEventListener('click', function () {
      _replacedPopupOpen = false;
      logout('replaced');
    });
    box.appendChild(icon); box.appendChild(title); box.appendChild(msg); box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    try { btn.focus(); } catch (e) { /* ignore */ }
  }

  // A student coming back to a tab left open on the pushed-out device would
  // otherwise only find out on their next click — check right away.
  var _lastSessionCheck = 0;
  function checkSessionOnReturn() {
    if (_forcedLogoutReason || document.visibilityState === 'hidden') return;
    if (!getToken() || getRole() !== 'student') return;
    if (Date.now() - _lastSessionCheck < 15000) return;
    _lastSessionCheck = Date.now();
    window.fetch(AuthService.API + '/auth/me', { headers: { Authorization: 'Bearer ' + getToken() } })
      .catch(function () {});
  }

  var _bannedInstalled = false;
  function installBannedInterceptor(isPublicPage) {
    if (_bannedInstalled) return;
    _bannedInstalled = true;
    if (!isPublicPage) {
      document.addEventListener('visibilitychange', checkSessionOnReturn);
      window.addEventListener('focus', checkSessionOnReturn);
    }
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
      // 1 PC + 1 mobile limit: a newer login on another device took this
      // device's slot (backend/utils/deviceSession.js).
      if (res.status === 401 && !isPublicPage && !_forcedLogoutReason) {
        try {
          var d401 = await res.clone().json();
          if (d401 && d401.code === 'SESSION_REPLACED') {
            _forcedLogoutReason = 'replaced';
            showReplacedPopup();
          }
        } catch (e) { /* ignore parse errors */ }
      }
      return res;
    };
  }

  var AuthService = {
    API: 'https://englishwithdan.onrender.com/api',
    getToken: getToken, setToken: setToken, getDeviceId: getDeviceId,
    getUser: getUser, setUser: setUser,
    getLastLoginAt: getLastLoginAt, touchLastLoginAt: touchLastLoginAt,
    clearSession: clearSession,
    isLoggedIn: isLoggedIn,
    getRole: getRole, isAdmin: isAdmin, isTeacher: isTeacher, isStaff: isStaff,
    isPremiumCached: isPremiumCached, isWithinTrial: isWithinTrial, hasPremiumAccess: hasPremiumAccess, refreshPlan: refreshPlan, applyMePayload: applyMePayload,
    authHeader: authHeader,
    login: login, logout: logout,
    getSafeNext: getSafeNext, buildLoginUrl: buildLoginUrl, getPostLoginRedirect: getPostLoginRedirect,
    requirePageAuth: requirePageAuth, redirectIfAuthenticated: redirectIfAuthenticated,
    checkInactiveLogout: checkInactiveLogout,
    installBannedInterceptor: installBannedInterceptor
  };

  window.AuthService = AuthService;
})();

// ── ActivityGate: background polls only while someone is actually here ──
// Students leave a tab open overnight; the 20s inbox/chat polls on every
// page then kept hitting the API all night, so the Render instance never
// spun down. ActivityGate.poll() is a drop-in for setInterval(fn, ms) that
// skips ticks while the tab is hidden or there's been no input for
// IDLE_MS, and fires fn once immediately when the student comes back so
// badges catch up without waiting for the next tick. Lives in this file
// because it's the one script every page loads before nav.js and the
// shared widgets.
(function () {
  if (window.ActivityGate) return;

  var IDLE_MS = 10 * 60 * 1000;
  var lastInput = Date.now();
  var wasActive = true;
  var resumeCallbacks = [];

  function isActive() {
    return !document.hidden && Date.now() - lastInput < IDLE_MS;
  }

  function onInput() {
    lastInput = Date.now();
    checkResume();
  }

  function checkResume() {
    var active = isActive();
    if (active && !wasActive) {
      resumeCallbacks.forEach(function (cb) { try { cb(); } catch (e) { /* ignore */ } });
    }
    wasActive = active;
  }

  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll'].forEach(function (ev) {
    window.addEventListener(ev, onInput, { passive: true, capture: true });
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) lastInput = Date.now();
    checkResume();
  });

  // Returns { stop() } — use that instead of clearInterval.
  function poll(fn, ms) {
    var stopped = false;
    var id = setInterval(function () {
      checkResume();
      if (!stopped && wasActive) fn();
    }, ms);
    function onResume() { if (!stopped) fn(); }
    resumeCallbacks.push(onResume);
    return {
      stop: function () {
        if (stopped) return;
        stopped = true;
        clearInterval(id);
        var i = resumeCallbacks.indexOf(onResume);
        if (i !== -1) resumeCallbacks.splice(i, 1);
      }
    };
  }

  window.ActivityGate = { poll: poll, isActive: isActive, IDLE_MS: IDLE_MS };
})();

// ════════════════════════════════════════════════════════════════════════
//  ?next= validation — window.SafeRedirect
// ════════════════════════════════════════════════════════════════════════
/**
 * SafeRedirect
 *
 * Single source of truth for validating a `?next=` redirect target before
 * it's ever used as a navigation destination (login.html after JWT/Google
 * login, auth-callback.html after the OAuth round trip). Routing audit
 * finding: this exact regex pair used to be hand-duplicated in both of
 * those files; a future fix to one copy (e.g. closing a new open-redirect
 * bypass) could silently miss the other. Centralized here instead.
 *
 * Accepts only same-site relative destinations:
 *   - a bare "*.html" filename (student pages), optionally with a query
 *     string and/or hash — the legacy form, kept for any existing shared
 *     link/bookmark that already encodes one
 *   - an absolute clean path (student pages reached via a Phase 4 _redirects
 *     rewrite, e.g. "/tuition" or "/reading/test/abc123" — these have no
 *     ".html" in the pathname at all)
 *   - an admin HashRouter route of the form "/admin/#/..."
 * Anything containing "://" or starting with "//" is rejected outright —
 * both are how a same-looking string can actually point off-site.
 */
(function () {
  'use strict';

  function getSafeNext(raw) {
    if (!raw) return null;
    if (raw.includes('://') || raw.startsWith('//')) return null;
    if (/^\/admin\/(#\/[\w./-]*)?$/.test(raw)) return { url: raw, admin: true };
    if (/^[a-zA-Z0-9][\w-]*\.html([?#].*)?$/.test(raw)) return { url: raw, admin: false };
    if (/^\/[a-zA-Z][\w./-]*([?#].*)?$/.test(raw)) return { url: raw, admin: false };
    return null;
  }

  window.SafeRedirect = { getSafeNext: getSafeNext };
})();
