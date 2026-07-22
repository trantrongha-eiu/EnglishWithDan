// shared/visit-tracker.js — fire-and-forget daily site-visit beacon.
//
// Pings the backend once per browser per calendar day (not once per page
// load) so the admin traffic chart reflects distinct daily visits rather
// than being inflated by a single student refreshing/navigating repeatedly.
// Never touches auth/session state and never throws — a failed or blocked
// ping (ad-blockers routinely drop analytics-shaped requests) must never
// affect the page itself.
(function () {
  'use strict';

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
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
