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
 * It also carries `announce` — huyền thoại news for the legendary linh
 * thú (Thập Vĩ): someone bought one, or an owner just logged in. Each one
 * plays legend(): a banner plus 3s of fire and ten tails racing round the
 * screen edge. shop.js calls ShopFeed.legend() itself right after the
 * student's own purchase.
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
  var LEGEND_SEEN_KEY = 'ews-legend-seen';
  var LEGEND_FX_MS = 3000;
  var LEGEND_BANNER_MS = 5200;
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
      l.id = 'ews-shopfeed-css'; l.rel = 'stylesheet'; l.href = '/css/shop-feed.css?v=6c10f861bd';
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

  /* ── 🔥 Huyền thoại: Thập Vĩ bought / its owner logged in ──────── */
  var REDUCED = false;
  try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var legendQueue = [];
  var legendBusy = false;
  var PET_NAMES = { vi10: 'Thập Vĩ' };

  // One fluffy spiky tail, pointing left so it trails behind as it runs.
  var FX_TAIL = '<svg viewBox="0 0 60 30" aria-hidden="true"><path d="M60 9 C46 5 33 3 22 7 L17 1 L14 8 L4 2 L9 12 L0 14 L10 18 L5 26 L17 21 C30 26 46 24 60 21 Z"'
    + ' fill="#7a5f5a" stroke="#4e3a37" stroke-width="1.6" stroke-linejoin="round"/>'
    + '<path d="M58 13 C45 10 32 10 22 13" stroke="#ff9a3c" stroke-width="2" fill="none" stroke-linecap="round" opacity=".75"/></svg>';

  function legendText(a) {
    var pet = '<b>' + esc(PET_NAMES[a.petId] || 'Thập Vĩ') + '</b>';
    if (a.type === 'login') {
      return a.self
        ? { title: 'Chào mừng chủ nhân ' + pet + ' trở lại!', sub: 'Mười đuôi lửa đang chào đón bạn 🔥' }
        : { title: 'Chủ nhân ' + pet + ' <b>' + esc(a.name) + '</b> vừa đăng nhập!', sub: 'Mười đuôi lửa đang quét qua toàn hệ thống 🔥' };
    }
    return a.self
      ? { title: pet + ' đã về với bạn!', sub: 'Cả hệ thống vừa nhận được thông báo 🔥' }
      : { title: '<b>' + esc(a.name) + '</b> vừa rước ' + pet + ' về!', sub: 'Quái thú mười đuôi đã xuất hiện trên toàn hệ thống 🔥' };
  }

  // [x, y, heading°] at distance s along a rounded rectangle inset m px
  // from the viewport edge (corner radius R), clockwise from the top-left.
  function rimPoint(s, w, h, m, R) {
    var x0 = m, y0 = m, x1 = w - m, y1 = h - m;
    var lt = Math.max(0, x1 - x0 - 2 * R), lr = Math.max(0, y1 - y0 - 2 * R), arc = Math.PI * R / 2;
    var P = 2 * lt + 2 * lr + 4 * arc;
    function onArc(cx, cy, th0, t) {
      var th = th0 + t / R;
      return [cx + R * Math.cos(th), cy + R * Math.sin(th), th * 180 / Math.PI + 90];
    }
    var segs = [
      [lt, function (t) { return [x0 + R + t, y0, 0]; }],
      [arc, function (t) { return onArc(x1 - R, y0 + R, -Math.PI / 2, t); }],
      [lr, function (t) { return [x1, y0 + R + t, 90]; }],
      [arc, function (t) { return onArc(x1 - R, y1 - R, 0, t); }],
      [lt, function (t) { return [x1 - R - t, y1, 180]; }],
      [arc, function (t) { return onArc(x0 + R, y1 - R, Math.PI / 2, t); }],
      [lr, function (t) { return [x0, y1 - R - t, 270]; }],
      [arc, function (t) { return onArc(x0 + R, y0 + R, Math.PI, t); }],
    ];
    s = ((s % P) + P) % P;
    for (var i = 0; i < segs.length - 1 && s > segs[i][0]; i++) s -= segs[i][0];
    return segs[i][1](Math.min(s, segs[i][0]));
  }

  function rimLength(w, h, m, R) {
    return 2 * Math.max(0, w - 2 * m - 2 * R) + 2 * Math.max(0, h - 2 * m - 2 * R) + 2 * Math.PI * R;
  }

  function flame(fx, x, y) {
    var f = document.createElement('span');
    var size = 14 + Math.random() * 18;
    if (Math.random() < .3) { f.className = 'ews-legend-flame is-emoji'; f.textContent = '🔥'; f.style.fontSize = (size * .9).toFixed(0) + 'px'; }
    else f.className = 'ews-legend-flame';
    f.style.left = (x + (Math.random() - .5) * 26).toFixed(1) + 'px';
    f.style.top = (y + (Math.random() - .5) * 26).toFixed(1) + 'px';
    f.style.width = f.style.height = size.toFixed(0) + 'px';
    f.addEventListener('animationend', function () { f.remove(); });
    fx.appendChild(f);
  }

  // Banner for LEGEND_BANNER_MS; fire + ten tails lapping the screen edge
  // for LEGEND_FX_MS (banner and edge glow only with reduced motion).
  function legend(a) {
    if (legendBusy) { if (legendQueue.length < 3) legendQueue.push(a); return; }
    if (examActive()) return;
    legendBusy = true;
    ensureEl();
    var txt = legendText(a);
    var fx = document.createElement('div');
    fx.className = 'ews-legend';
    fx.setAttribute('aria-hidden', 'true');
    fx.innerHTML = '<div class="ews-legend-glow"></div>';
    var banner = document.createElement('div');
    banner.className = 'ews-legend-banner';
    banner.setAttribute('role', 'status');
    banner.innerHTML = '<span class="ews-legend-pet">' + (window.Pets ? window.Pets.svg(a.petId || 'vi10') : '') + '</span>'
      + '<span class="ews-legend-text"><span class="ews-legend-title">🔥 ' + txt.title + '</span><small>' + txt.sub + '</small></span>';
    document.body.appendChild(fx);
    document.body.appendChild(banner);
    requestAnimationFrame(function () { fx.classList.add('is-in'); banner.classList.add('is-in'); });

    if (!REDUCED) {
      var tails = [];
      for (var i = 0; i < 10; i++) {
        var t = document.createElement('div');
        t.className = 'ews-legend-tail';
        t.innerHTML = '<div class="ews-legend-tail-in" style="animation-delay:-' + (i * 0.07).toFixed(2) + 's">' + FX_TAIL + '</div>';
        fx.appendChild(t);
        tails.push(t);
      }
      var start = 0, lastSpark = 0;
      var step = function (now) {
        if (!start) start = now;
        var p = Math.min(1, (now - start) / LEGEND_FX_MS);
        var w = window.innerWidth, h = window.innerHeight;
        var m = Math.min(34, w * 0.06), R = Math.min(90, w / 5, h / 5);
        var P = rimLength(w, h, m, R);
        // Ease in-out: the ring winds up, laps the screen once, then slows.
        var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        var spark = now - lastSpark > 60 && p < .95;
        if (spark) lastSpark = now;
        for (var j = 0; j < tails.length; j++) {
          var pt = rimPoint(j * P / tails.length + e * P * 1.1, w, h, m, R);
          tails[j].style.transform = 'translate(' + pt[0].toFixed(1) + 'px,' + pt[1].toFixed(1) + 'px) rotate(' + pt[2].toFixed(1) + 'deg)';
          if (spark) flame(fx, pt[0], pt[1]);
        }
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    setTimeout(function () { fx.classList.remove('is-in'); }, LEGEND_FX_MS);
    setTimeout(function () { fx.remove(); }, LEGEND_FX_MS + 700);
    setTimeout(function () { banner.classList.remove('is-in'); }, LEGEND_BANNER_MS);
    setTimeout(function () {
      banner.remove();
      legendBusy = false;
      if (legendQueue.length) legend(legendQueue.shift());
    }, LEGEND_BANNER_MS + 500);
  }

  function showAnnouncements(list) {
    if (!list || !list.length) return;
    lsSet(LEGEND_SEEN_KEY, list[list.length - 1].at);
    if (examActive()) return;
    list.forEach(legend);
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
    // Announcements keep their own clock, and a first visit still gets the
    // fresh ones (the server only returns the last few minutes / hour).
    var asince = lsGet(LEGEND_SEEN_KEY);
    var qs = [];
    if (!first) qs.push('since=' + encodeURIComponent(since));
    if (asince) qs.push('asince=' + encodeURIComponent(asince));
    fetch(API + '/shop/feed' + (qs.length ? '?' + qs.join('&') : ''), { headers: window.AuthService.authHeader() })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.success) return;
        if (d.caked) showCakeNotice(d.caked);
        showAnnouncements(d.announce);
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
      setTimeout(poll, 2500);
      setInterval(poll, POLL_MS);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) poll(); });
    } catch (e) {}
  }

  window.ShopFeed = { legend: legend };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
