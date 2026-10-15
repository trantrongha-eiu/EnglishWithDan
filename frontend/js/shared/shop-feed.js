/**
 * js/shared/shop-feed.js — "X vừa mua Y" ticker for the Cửa hàng lửa.
 *
 * Polls GET /api/shop/feed every minute (only while the tab is visible) and
 * slides a small pill down from under the nav for each new purchase by
 * another student, one at a time. Remembers the newest purchase shown
 * (localStorage) so a reload never repeats one; the server already skips
 * the viewer's own purchases and anything older than an hour. Stays quiet
 * in exam mode, same signals as pets.js.
 *
 * The same poll carries `caked` — the cake on the viewer's own avatar — and
 * pops up "Bạn đã bị úp bánh kem bởi X!" once per cake (keyed by its end
 * time), with a button to wipe it off with a 🧽 Khăn Lau Diệu Kì (or buy
 * one). A successful wipe fires `ews:cake-wiped` so the page can refresh.
 *
 * Injected by nav.js on every page with the student nav.
 */
(function () {
  'use strict';
  if (window.__ewsShopFeed) return;
  window.__ewsShopFeed = true;

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  var SEEN_KEY = 'ews-shopfeed-seen';
  var CAKE_SEEN_KEY = 'ews-cake-seen';
  var POLL_MS = 60 * 1000;
  var SHOW_MS = 5200;
  var EXAM_PAGES = /^(mock-test|entrance-test|test-dau-vao|login|register|verify-email|auth-callback)(\.html)?$/;

  var queue = [];
  var showing = false;
  var el = null;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function examActive() {
    if (EXAM_PAGES.test(location.pathname.split('/').pop())) return true;
    if (document.body && !document.body.classList.contains('has-global-nav')) return true;
    try { if (typeof window.__ewsExamActive === 'function' && window.__ewsExamActive()) return true; } catch (e) {}
    try { if (typeof window._isActivePractice === 'function' && window._isActivePractice()) return true; } catch (e) {}
    return false;
  }

  function ensureEl() {
    if (el) return el;
    if (!document.getElementById('ews-shopfeed-css')) {
      var l = document.createElement('link');
      l.id = 'ews-shopfeed-css'; l.rel = 'stylesheet'; l.href = '/css/shop-feed.css?v=c894a73453';
      document.head.appendChild(l);
    }
    el = document.createElement('a');
    el.className = 'ews-shopfeed';
    el.href = '/shop.html';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    return el;
  }

  function iconFor(p) {
    if (p.kind === 'pet' && window.Pets && window.Pets.svg(p.key)) {
      return '<span class="ews-shopfeed-pet">' + window.Pets.svg(p.key) + '</span>';
    }
    return '<span class="ews-shopfeed-emoji">' + esc(p.emoji || '🎁') + '</span>';
  }

  function next() {
    if (showing || !queue.length) return;
    if (examActive()) { queue = []; return; }
    var p = queue.shift();
    var box = ensureEl();
    box.innerHTML = iconFor(p)
      + '<span class="ews-shopfeed-text"><b>' + esc(p.name) + '</b> vừa mua <b>' + esc(p.itemName) + '</b> 🔥</span>';
    showing = true;
    // Next frame, so the slide-in transition runs.
    requestAnimationFrame(function () { box.classList.add('is-in'); });
    setTimeout(function () {
      box.classList.remove('is-in');
      setTimeout(function () { showing = false; next(); }, 450);
    }, SHOW_MS);
  }

  /* ── 🎂 "Bạn đã bị úp bánh kem bởi X" ─────────────────────────── */
  var cakeEl = null;

  function closeCake() {
    if (!cakeEl) return;
    var box = cakeEl;
    cakeEl = null;
    box.classList.remove('is-in');
    setTimeout(function () { box.remove(); }, 400);
  }

  function wipeCake(btn) {
    btn.disabled = true;
    btn.textContent = 'Đang lau…';
    fetch(API + '/shop/use', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, window.AuthService.authHeader()),
      body: JSON.stringify({ key: 'towel' }),
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        if (!d || !d.success) {
          btn.disabled = false;
          btn.textContent = '🧽 Lau ngay';
          if (window.showToast) window.showToast((d && d.message) || 'Chưa lau được, thử lại nhé.', 'error');
          return;
        }
        closeCake();
        if (window.showToast) window.showToast('🧽 Lau sạch bong! Ảnh đại diện đã hết kem ✨', 'success');
        try { document.dispatchEvent(new CustomEvent('ews:cake-wiped')); } catch (e) {}
      })
      .catch(function () { btn.disabled = false; btn.textContent = '🧽 Lau ngay'; });
  }

  function showCakeNotice(c) {
    if (cakeEl || examActive()) return;
    var id = String(c.until);
    if (lsGet(CAKE_SEEN_KEY) === id) return;
    lsSet(CAKE_SEEN_KEY, id);
    ensureEl();
    cakeEl = document.createElement('div');
    cakeEl.className = 'ews-cake-notice';
    cakeEl.setAttribute('role', 'alert');
    cakeEl.innerHTML = '<div class="ews-cake-head"><span class="ews-cake-emoji" aria-hidden="true">🎂</span>'
      + '<b>Bạn đã bị úp bánh kem bởi <span>' + esc(c.by) + '</span>!</b></div>'
      + '<p>' + (c.towels
        ? 'Kem đang dính trên ảnh đại diện của bạn trên BXH. Bạn có ' + c.towels + ' 🧽 Khăn Lau Diệu Kì — lau ngay cho sạch nhé!'
        : 'Kem sẽ dính trên ảnh đại diện của bạn trên BXH suốt 24 giờ… trừ khi bạn có 🧽 Khăn Lau Diệu Kì!') + '</p>'
      + '<div class="ews-cake-actions">'
      + '<button type="button" class="ews-cake-close">Để sau</button>'
      + (c.towels
        ? '<button type="button" class="ews-cake-wipe" data-cake-wipe>🧽 Lau ngay</button>'
        : '<a class="ews-cake-wipe" href="/shop.html">🧽 Mua khăn lau</a>')
      + '</div>';
    cakeEl.addEventListener('click', function (e) {
      if (e.target.closest('.ews-cake-close')) closeCake();
      else if (e.target.closest('[data-cake-wipe]')) wipeCake(e.target.closest('[data-cake-wipe]'));
    });
    document.body.appendChild(cakeEl);
    var box = cakeEl;
    requestAnimationFrame(function () { box.classList.add('is-in'); });
  }

  function poll() {
    if (document.hidden) return;
    var since = lsGet(SEEN_KEY);
    var first = !since;
    // First visit ever: start the clock now instead of replaying the past hour.
    if (first) lsSet(SEEN_KEY, new Date().toISOString());
    fetch(API + '/shop/feed' + (first ? '' : '?since=' + encodeURIComponent(since)), { headers: window.AuthService.authHeader() })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.success) return;
        if (d.caked) showCakeNotice(d.caked);
        if (first || !d.feed || !d.feed.length) return;
        lsSet(SEEN_KEY, d.feed[d.feed.length - 1].at);
        if (examActive()) return;
        queue = queue.concat(d.feed).slice(-5);
        next();
      })
      .catch(function () {});
  }

  function boot() {
    try {
      if (!window.AuthService || !window.AuthService.isLoggedIn || !window.AuthService.isLoggedIn()) return;
      var u = window.AuthService.getUser && window.AuthService.getUser();
      if (u && u.role === 'guest') return;
      setTimeout(poll, 4000);
      setInterval(poll, POLL_MS);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) poll(); });
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
