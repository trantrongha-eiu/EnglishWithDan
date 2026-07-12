/**
 * shared/safe-redirect.js — SafeRedirect
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
