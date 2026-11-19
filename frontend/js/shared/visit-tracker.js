// shared/visit-tracker.js — fire-and-forget daily site-visit beacon, plus
// the affiliate referral capture.
//
// Pings the backend once per browser per calendar day (not once per page
// load) so the admin traffic chart reflects distinct daily visits rather
// than being inflated by a single student refreshing/navigating repeatedly.
// Never touches auth/session state and never throws — a failed or blocked
// ping (ad-blockers routinely drop analytics-shaped requests) must never
// affect the page itself.
//
// Affiliate (backend/services/affiliateService.js): a visit through a
// referral link (any page, ?ref=CODE) keeps the code in this browser for
// 30 days and counts one click per code. Once someone is logged in, the
// code is sent to /affiliate/claim, which ties a NEW account to the
// referrer (works the same for Google sign-up, which has no form to carry
// it). The code is dropped after any server answer.
(function () {
  'use strict';

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';

  // ── Referral link ────────────────────────────────────────────
  var REF_KEY = 'ewdRef';
  var REF_TTL_MS = 30 * 24 * 60 * 60 * 1000;
  try {
    var refParam = new URLSearchParams(window.location.search).get('ref');
    var refCode = refParam ? String(refParam).trim().toUpperCase() : '';
    if (/^[A-Z0-9]{4,16}$/.test(refCode)) {
      localStorage.setItem(REF_KEY, JSON.stringify({ code: refCode, at: Date.now() }));
      var clickedKey = 'ewdRefClicked_' + refCode;
      if (!localStorage.getItem(clickedKey)) {
        localStorage.setItem(clickedKey, '1');
        fetch(API + '/affiliate/click', {
          method: 'POST', keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: refCode })
        }).catch(function () {});
      }
    }

    var pending = JSON.parse(localStorage.getItem(REF_KEY) || 'null');
    if (pending && (!pending.code || Date.now() - (pending.at || 0) > REF_TTL_MS)) {
      localStorage.removeItem(REF_KEY);
      pending = null;
    }
    var token = localStorage.getItem('token');
    if (pending && token) {
      fetch(API + '/affiliate/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ code: pending.code })
      }).then(function (res) {
        // Any real answer settles it (ok, too old, own code…); a 401 means
        // the token is stale — keep the code for the next login.
        if (res.status !== 401 && res.status < 500) localStorage.removeItem(REF_KEY);
      }).catch(function () {});
    }
  } catch (e) { /* storage disabled — no referral tracking */ }

  // ── Daily visit ping ─────────────────────────────────────────
  var STORAGE_KEY = 'lastVisitPingDate';
  var today = new Date().toISOString().slice(0, 10); // UTC calendar day is fine for a once-a-day dedupe key

  try {
    if (localStorage.getItem(STORAGE_KEY) === today) return;
    localStorage.setItem(STORAGE_KEY, today);
  } catch (e) {
    // Private-browsing/storage-disabled — skip rather than ping on every load.
    return;
  }

  fetch(API + '/track/visit', { method: 'POST', keepalive: true }).catch(function () {});
})();
