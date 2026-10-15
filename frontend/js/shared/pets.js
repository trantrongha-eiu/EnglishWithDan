/**
 * js/shared/pets.js — Linh thú (Cửa hàng lửa, backend/constants/shop.js PETS)
 *
 *   • Pets.svg(id)    — the pet's inline SVG (viewBox 0 0 64 64, facing right).
 *   • Pets.badge(id)  — a small static copy for the BXH / peer profile.
 *   • The walker      — the student's active linh thú strolls along the
 *                       bottom of every non-exam page: walks, sits, dozes
 *                       off, and hops + says something when clicked.
 *                       Hidden whenever the page is in exam mode (nav.js
 *                       hideTopNav drops body.has-global-nav; Reading/
 *                       Writing/Speaking also set window.__ewsExamActive)
 *                       and on the test pages themselves.
 *   • Pets.setActive(id) — the shop page calls this right after the
 *                       student picks a pet so it appears without a reload.
 *
 * Injected by nav.js on every page with the student nav. Purely decorative:
 * every block is try/catch-guarded and nothing on the page depends on it.
 */
(function () {
  'use strict';
  if (window.Pets) return;

  var REDUCED = false;
  try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ══════════════════════════════════════════════════════════════════
     ART — each pet: back legs, tail, body (head inside), front legs.
     Classes the CSS animates: pt-leg-a / pt-leg-b (alternate steps),
     pt-tail (wag), pt-body (bob), pt-eye (blink), pt-wing (flap).
     ══════════════════════════════════════════════════════════════════ */
  function legs(cls, xs, y, h, fill) {
    return '<g class="pt-leg ' + cls + '">' + xs.map(function (x) {
      return '<rect x="' + x + '" y="' + y + '" width="5" height="' + h + '" rx="2.5" fill="' + fill + '"/>';
    }).join('') + '</g>';
  }
  function eyes(xs, y, fill) {
    return xs.map(function (x) {
      return '<ellipse class="pt-eye" cx="' + x + '" cy="' + y + '" rx="1.7" ry="2.3" fill="' + fill + '"/>'
        + '<circle cx="' + (x + 0.6) + '" cy="' + (y - 0.9) + '" r=".6" fill="#fff"/>';
    }).join('');
  }
  var ZZZ = '<svg class="pt-zzz" viewBox="0 0 64 64" aria-hidden="true"><g fill="#7c8db5" font-family="inherit" font-weight="800">'
    + '<text x="48" y="14" font-size="9">z</text><text x="55" y="7" font-size="7">z</text></g></svg>';

  var ART = {
    meo: function () {
      var c = '#f6a04d', d = '#dc7f2e', cream = '#ffe7c9';
      return legs('pt-leg-b', [19, 38], 46, 11, d)
        + '<path class="pt-tail" d="M17 41 C7 40 4 29 9 22 C11 19 15 21 13 24 C9 30 11 36 19 37 Z" fill="' + c + '"/>'
        + '<g class="pt-body">'
        + '<ellipse cx="30" cy="42" rx="16" ry="10" fill="' + c + '"/>'
        + '<ellipse cx="33" cy="46.5" rx="10" ry="4.5" fill="' + cream + '"/>'
        + '<path d="M23 33.5q2 4 0 8M29 32.5q2 4 0 8" stroke="' + d + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
        + '<path d="M39 25 L40 13 L47 21 Z" fill="' + c + '"/><path d="M41 21 L41.5 16 L45 20 Z" fill="#ff9fb0"/>'
        + '<path d="M49 21 L56 13 L56.5 25 Z" fill="' + c + '"/><path d="M51 21 L54.5 16.5 L55 22 Z" fill="#ff9fb0"/>'
        + '<circle cx="47" cy="31" r="11" fill="' + c + '"/>'
        + '<path d="M43 22.5q1.5 2 0 4M47 21.5q1.5 2 0 4" stroke="' + d + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
        + '<ellipse cx="50" cy="35.5" rx="5.5" ry="3.8" fill="' + cream + '"/>'
        + eyes([44, 51.5], 30, '#3b2412')
        + '<path d="M49.2 33.4h2.4l-1.2 1.4z" fill="#ff7a8a"/>'
        + '<path d="M50.4 34.8q0 1.6-1.6 1.6M50.4 34.8q0 1.6 1.6 1.6" stroke="#7a4a1c" stroke-width=".8" fill="none" stroke-linecap="round"/>'
        + '<path d="M56 34.5h5M56 36.5l4.5 1.2M39 34.5h-4M39 36.5l-3.5 1" stroke="#c98a55" stroke-width=".7" stroke-linecap="round"/>'
        + '<ellipse cx="42.5" cy="35" rx="2" ry="1.2" fill="#ff8a8a" opacity=".55"/><ellipse cx="55.5" cy="35" rx="1.6" ry="1.1" fill="#ff8a8a" opacity=".55"/>'
        + '</g>'
        + legs('pt-leg-a', [23, 42], 46, 12, c);
    },
    shiba: function () {
      var c = '#e9a051', d = '#c97c2d', cream = '#fff4e2';
      return legs('pt-leg-b', [19, 38], 45, 12, d)
        + '<g class="pt-tail"><path d="M17 36 C9 36 8 25 15 23 C21 21 23 29 18 30" stroke="' + c + '" stroke-width="6" fill="none" stroke-linecap="round"/>'
        + '<path d="M16 34 C11 33 11 27 15 26" stroke="' + cream + '" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>'
        + '<g class="pt-body">'
        + '<ellipse cx="30" cy="41" rx="16" ry="10.5" fill="' + c + '"/>'
        + '<ellipse cx="34" cy="45.5" rx="10" ry="5.5" fill="' + cream + '"/>'
        + '<path d="M40 22 L41.5 11 L48.5 19 Z" fill="' + c + '"/><path d="M42 20 L42.8 14.5 L46.5 18.5 Z" fill="' + cream + '"/>'
        + '<path d="M50 19 L57.5 11.5 L57.5 23 Z" fill="' + c + '"/><path d="M52 19 L56 15.5 L56 21 Z" fill="' + cream + '"/>'
        + '<circle cx="48" cy="29" r="11.5" fill="' + c + '"/>'
        + '<path d="M38 31 C40 40 56 42 60 33 C58 30 54 31 50 31 C46 31 42 28 38 31 Z" fill="' + cream + '"/>'
        + '<ellipse cx="44" cy="23.5" rx="1.6" ry="1" fill="' + cream + '"/><ellipse cx="52" cy="23.5" rx="1.6" ry="1" fill="' + cream + '"/>'
        + eyes([44.5, 52.5], 28, '#2d1a0c')
        + '<ellipse cx="57.6" cy="31.6" rx="2" ry="1.5" fill="#2d1a0c"/>'
        + '<path d="M55.5 34.5q-2 2.4-4.5 .6" stroke="#2d1a0c" stroke-width="1" fill="none" stroke-linecap="round"/>'
        + '<path d="M53.2 35.2q.6 2.4 1.6 0z" fill="#ff7a8a"/>'
        + '<path d="M38 38 Q46 42 55 38" stroke="#e8433b" stroke-width="3" fill="none" stroke-linecap="round"/>'
        + '<circle cx="47" cy="41.3" r="1.9" fill="#ffd257"/>'
        + '</g>'
        + legs('pt-leg-a', [23, 42], 45, 13, c);
    },
    cut: function () {
      var c = '#2f3b52', belly = '#fbfdff', o = '#ffa630';
      return '<g class="pt-leg pt-leg-b"><ellipse cx="27" cy="58" rx="6" ry="2.6" fill="' + o + '"/></g>'
        + '<g class="pt-leg pt-leg-a"><ellipse cx="39" cy="58" rx="6" ry="2.6" fill="' + o + '"/></g>'
        + '<g class="pt-body">'
        + '<ellipse cx="32" cy="37" rx="15" ry="20" fill="' + c + '"/>'
        + '<ellipse cx="34.5" cy="41" rx="10" ry="14.5" fill="' + belly + '"/>'
        + '<path d="M22 23 C26 16 40 15 44 24 C40 22 36 27 34 30 C30 26 26 24 22 23 Z" fill="' + c + '"/>'
        + '<path class="pt-wing" d="M19 33 C13 38 12 47 16 50 C19 46 21 41 22 36 Z" fill="#232d40"/>'
        + eyes([33.5, 40.5], 27, '#141a26')
        + '<path d="M40 30.5 L49 32.5 L40 34.5 Z" fill="' + o + '"/>'
        + '<ellipse cx="31" cy="32" rx="2.2" ry="1.3" fill="#ff8fa3" opacity=".75"/><ellipse cx="44" cy="31.5" rx="1.6" ry="1.1" fill="#ff8fa3" opacity=".75"/>'
        + '<path d="M26 17.5 Q32 11 39 16.5" stroke="#e8433b" stroke-width="3.2" fill="none" stroke-linecap="round"/>'
        + '<circle cx="39.5" cy="16" r="2.4" fill="#fff"/>'
        + '</g>';
    },
    cao: function () {
      var c = '#f2662a', d = '#d24d16', w = '#fff8ef', sock = '#5a2b16';
      return legs('pt-leg-b', [20, 38], 46, 11, sock)
        + '<g class="pt-tail"><path d="M18 40 C6 44 -1 34 4 23 C6 31 11 33 15 31 C12 28 13 24 16 22 C17 30 21 34 22 37 Z" fill="' + c + '"/>'
        + '<path d="M4 23 C2 26 2.5 31 5 34 C6 30 7 27 4 23 Z" fill="' + w + '"/>'
        + '<path d="M4 23 C5 20 7 19 8.5 18.5 C7.5 21 7 22 4 23 Z" fill="#ffd257"/></g>'
        + '<g class="pt-body">'
        + '<ellipse cx="30" cy="42" rx="15" ry="9.5" fill="' + c + '"/>'
        + '<ellipse cx="35" cy="46" rx="8.5" ry="4.5" fill="' + w + '"/>'
        + '<path d="M40 24 L42 11 L49 21 Z" fill="' + c + '"/><path d="M42 12.5 L42.6 16 L45 15.5 Z" fill="' + sock + '"/>'
        + '<path d="M50 21 L57 11 L58 24 Z" fill="' + c + '"/><path d="M56.5 12 L54.5 15 L57.2 15.5 Z" fill="' + sock + '"/>'
        + '<path d="M38 27 C38 20 52 17 57 24 C59 28 62 31 63 33 C58 37 47 38 41 35 C39 33 38 30 38 27 Z" fill="' + c + '"/>'
        + '<path d="M44 32 C49 35 57 35 63 33 C58 38 48 39 43 35 Z" fill="' + w + '"/>'
        + '<ellipse cx="62.6" cy="32.6" rx="1.7" ry="1.4" fill="#2a160c"/>'
        + eyes([47, 54.5], 27.5, '#2a160c')
        + '<path d="M45 24.5l3 1M56.5 24.5l-3 1" stroke="' + d + '" stroke-width="1.2" stroke-linecap="round"/>'
        + '<ellipse cx="51" cy="31.5" rx="1.8" ry="1.1" fill="#ff8a8a" opacity=".6"/>'
        + '</g>'
        + legs('pt-leg-a', [24, 42], 46, 12, sock);
    },
    rong: function () {
      var c = '#35c297', d = '#1f9a74', belly = '#fff1b8', horn = '#fff3d6';
      return legs('pt-leg-b', [21, 37], 45, 12, d)
        + '<g class="pt-tail"><path d="M18 42 C10 46 5 44 3 38" stroke="' + c + '" stroke-width="5.5" fill="none" stroke-linecap="round"/>'
        + '<path d="M3 38 L-1 33 L6 34.5 Z" fill="#ff7a59"/></g>'
        + '<path class="pt-wing" d="M26 33 C20 21 28 14 33 19 C34 23 36 22 38 20 C39 26 35 32 30 34 Z" fill="#8be0c4" stroke="' + d + '" stroke-width="1.2"/>'
        + '<g class="pt-body">'
        + '<ellipse cx="30" cy="42" rx="15" ry="10" fill="' + c + '"/>'
        + '<ellipse cx="33" cy="46" rx="9.5" ry="5" fill="' + belly + '"/>'
        + '<path d="M26 44.5h14M27 47.5h12" stroke="#f0d27a" stroke-width="1" stroke-linecap="round"/>'
        + '<path d="M20 34l2-3 2 3M26 32l2-3 2 3" fill="#ff7a59"/>'
        + '<path d="M42 20 L41 12 L46 18 Z" fill="' + horn + '"/><path d="M51 18 L55 11 L55 20 Z" fill="' + horn + '"/>'
        + '<circle cx="48" cy="29" r="11" fill="' + c + '"/>'
        + '<ellipse cx="55" cy="33" rx="7" ry="5" fill="' + c + '"/>'
        + '<ellipse cx="56" cy="35" rx="5.5" ry="3" fill="' + belly + '"/>'
        + '<circle cx="59" cy="31.5" r=".8" fill="' + d + '"/>'
        + eyes([45.5, 52], 27, '#183a30')
        + '<ellipse cx="43.5" cy="32" rx="1.8" ry="1.1" fill="#ff8a8a" opacity=".6"/>'
        + '<g class="pt-fire"><path d="M63 33 C67 31 69 34 66 35 C70 35 70 39 65 38 C66 36 64 35 63 35 Z" fill="#ffb534"/>'
        + '<path d="M64 34.3 C66 33.6 67 35 65.5 35.6 Z" fill="#ff6a3d"/></g>'
        + '</g>'
        + legs('pt-leg-a', [25, 41], 45, 13, c);
    },
  };

  var NAMES = { meo: 'Mèo Quýt', shiba: 'Shiba Lì Xì', cut: 'Cánh Cụt Bông', cao: 'Cáo Lửa', rong: 'Rồng Con' };
  var LINES = {
    meo: ['Meo~ học xong bài này rồi ngủ trưa nha 😽', 'Sổ từ vựng ấm ghê, cho mèo nằm xíu…', 'Meo! Hôm nay giữ chuỗi chưa đó?'],
    shiba: ['Gâu! Cậu học giỏi quá trời 🐕', 'Vẫy đuôi cổ vũ nè! Thêm 1 bài nữa nha!', 'Gâu gâu — đi dạo xong là học tiếp nhé!'],
    cut: ['Lạch bạch… cánh cụt cũng đang học IELTS đó 🐧', 'Ngã cũng không sao, đứng dậy làm bài tiếp!', 'Băng ở đây lạnh, nhưng chuỗi của cậu nóng 🔥'],
    cao: ['Hehe, mình biết mẹo làm Reading nè 🦊', 'Tinh ranh như cáo — đọc câu hỏi trước nha!', 'Đuôi rực lửa giống chuỗi của cậu đó!'],
    rong: ['Grào~ 🔥 phun lửa tiếp sức cho cậu!', 'Rồng con sẽ canh chuỗi lửa giúp cậu!', 'Lửa của rồng không bằng lửa học của cậu đâu!'],
  };

  function svg(id, cls) {
    if (!ART[id]) return '';
    return '<svg class="pt-svg pt-' + id + (cls ? ' ' + cls : '') + '" viewBox="-2 0 70 64" aria-hidden="true" focusable="false">' + ART[id]() + '</svg>';
  }
  function badge(id) {
    if (!ART[id]) return '';
    return '<span class="pet-badge" title="Linh thú: ' + NAMES[id] + '">' + svg(id, 'pt-static') + '</span>';
  }

  /* ══════════════════════════════════════════════════════════════════
     CSS — injected once (absolute path: some pages live at nested clean URLs)
     ══════════════════════════════════════════════════════════════════ */
  function ensureCss() {
    if (document.getElementById('ews-pets-css')) return;
    var l = document.createElement('link');
    l.id = 'ews-pets-css'; l.rel = 'stylesheet'; l.href = '/css/pets.css?v=20261015';
    document.head.appendChild(l);
  }
  try { ensureCss(); } catch (e) {}

  /* ══════════════════════════════════════════════════════════════════
     WALKER
     ══════════════════════════════════════════════════════════════════ */
  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  var CACHE_KEY = 'ews-pet-v1';
  var REST_KEY = 'ews-pet-rest';
  var CACHE_MS = 10 * 60 * 1000;
  var EXAM_PAGES = /^(mock-test|entrance-test|test-dau-vao|login|register|verify-email|auth-callback)(\.html)?$/;
  var SPEED = { meo: 42, shiba: 55, cut: 28, cao: 62, rong: 50 };

  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  function examActive() {
    if (EXAM_PAGES.test(location.pathname.split('/').pop())) return true;
    if (document.body && !document.body.classList.contains('has-global-nav')) return true;
    try { if (typeof window.__ewsExamActive === 'function' && window.__ewsExamActive()) return true; } catch (e) {}
    try { if (typeof window._isActivePractice === 'function' && window._isActivePractice()) return true; } catch (e) {}
    return false;
  }

  var walker = null;

  function Walker(id) {
    this.id = id;
    this.x = 0; this.target = 0; this.dir = 1;
    this.state = 'idle'; this.until = 0; this.last = 0; this.idleCount = 0;
    this.build();
  }
  Walker.prototype.bounds = function () {
    var w = window.innerWidth || 800;
    // Clear of the Lulu/Lumi dock (bottom-left) and the chat bubble (bottom-right).
    if (w < 640) return [8, Math.max(60, w - 128)];
    return [200, Math.max(260, w - 150)];
  };
  Walker.prototype.build = function () {
    var self = this;
    var layer = document.createElement('div');
    layer.id = 'ews-pet-layer';
    layer.className = 'ews-pet-layer';
    layer.innerHTML = '<div class="ews-pet" role="button" tabindex="0" aria-label="Linh thú ' + NAMES[this.id] + ' — bấm để chơi">'
      + '<div class="ews-pet-bubble" hidden></div>'
      + '<div class="ews-pet-flip">' + svg(this.id) + '</div>' + ZZZ
      + '</div>';
    document.body.appendChild(layer);
    this.layer = layer;
    this.el = layer.querySelector('.ews-pet');
    this.flip = layer.querySelector('.ews-pet-flip');
    this.bubble = layer.querySelector('.ews-pet-bubble');
    var b = this.bounds();
    this.x = b[0] + Math.random() * (b[1] - b[0]);
    this.place();
    this.el.addEventListener('click', function (e) {
      if (e.target.closest('.ews-pet-rest')) { self.rest(); return; }
      self.poke();
    });
    this.el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.poke(); }
    });
    if (!REDUCED) this.raf = requestAnimationFrame(function (t) { self.tick(t); });
    else this.setState('sit');
    this.vis = setInterval(function () { self.layer.style.display = examActive() ? 'none' : ''; }, 600);
    this.layer.style.display = examActive() ? 'none' : '';
  };
  Walker.prototype.place = function () {
    this.el.style.transform = 'translateX(' + Math.round(this.x) + 'px)';
    this.flip.style.transform = this.dir < 0 ? 'scaleX(-1)' : '';
  };
  Walker.prototype.setState = function (s) {
    this.state = s;
    this.el.classList.toggle('is-walking', s === 'walk');
    this.el.classList.toggle('is-sitting', s === 'sit' || s === 'sleep');
    this.el.classList.toggle('is-sleeping', s === 'sleep');
  };
  Walker.prototype.pickNext = function (now) {
    var b = this.bounds();
    var r = Math.random();
    if (this.state === 'walk' || r < 0.15) {
      // Rest a while; after a few rests in a row, doze off.
      this.idleCount++;
      var sleepy = this.idleCount > 3 && Math.random() < 0.35;
      this.setState(sleepy ? 'sleep' : 'sit');
      this.until = now + (sleepy ? 9000 + Math.random() * 8000 : 1800 + Math.random() * 3500);
      if (this.id === 'rong' && !sleepy && Math.random() < 0.5) this.puff();
    } else {
      this.idleCount = 0;
      this.target = b[0] + Math.random() * (b[1] - b[0]);
      this.dir = this.target >= this.x ? 1 : -1;
      this.setState('walk');
    }
  };
  Walker.prototype.tick = function (now) {
    var self = this;
    var dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0;
    this.last = now;
    if (this.layer.style.display !== 'none') {
      if (this.state === 'walk') {
        var step = (SPEED[this.id] || 45) * dt * this.dir;
        this.x += step;
        if ((this.dir > 0 && this.x >= this.target) || (this.dir < 0 && this.x <= this.target)) {
          this.x = this.target;
          this.pickNext(now);
        }
        this.place();
      } else if (now >= this.until) {
        this.pickNext(now);
        this.place();
      }
      // Window resized under the pet — bring it back on screen.
      var b = this.bounds();
      if (this.x > b[1] + 10) { this.x = b[1]; this.place(); }
    }
    this.raf = requestAnimationFrame(function (t) { self.tick(t); });
  };
  Walker.prototype.puff = function () {
    var el = this.el;
    el.classList.add('is-puff');
    setTimeout(function () { el.classList.remove('is-puff'); }, 900);
  };
  Walker.prototype.poke = function () {
    var self = this;
    var lines = LINES[this.id] || ['♥'];
    this.bubble.innerHTML = '<span>' + lines[Math.floor(Math.random() * lines.length)] + '</span>'
      + '<button type="button" class="ews-pet-rest">💤 Cho nghỉ hôm nay</button>';
    this.bubble.hidden = false;
    this.el.classList.remove('is-hop'); void this.el.offsetWidth; this.el.classList.add('is-hop');
    var heart = document.createElement('span');
    heart.className = 'ews-pet-heart'; heart.textContent = '❤';
    this.el.appendChild(heart);
    setTimeout(function () { heart.remove(); }, 1100);
    if (this.id === 'rong') this.puff();
    this.setState('sit');
    this.idleCount = 0;
    this.until = performance.now() + 4000;
    clearTimeout(this.bubbleT);
    this.bubbleT = setTimeout(function () { self.bubble.hidden = true; }, 4200);
  };
  Walker.prototype.rest = function () {
    lsSet(REST_KEY, todayStr());
    this.destroy();
    if (window.showToast) try { window.showToast('Linh thú đi ngủ rồi — mai gặp lại nhé 💤', 'info'); } catch (e) {}
  };
  Walker.prototype.destroy = function () {
    cancelAnimationFrame(this.raf);
    clearInterval(this.vis);
    if (this.layer && this.layer.parentNode) this.layer.parentNode.removeChild(this.layer);
  };

  function show(id) {
    if (walker) { walker.destroy(); walker = null; }
    if (!id || !ART[id]) return;
    if (lsGet(REST_KEY) === todayStr()) return;
    walker = new Walker(id);
  }

  function boot() {
    try {
      if (!window.AuthService || !window.AuthService.isLoggedIn || !window.AuthService.isLoggedIn()) return;
      var u = window.AuthService.getUser && window.AuthService.getUser();
      if (u && u.role && u.role !== 'student') return;
      if (EXAM_PAGES.test(location.pathname.split('/').pop())) return;
      var cached = lsGet(CACHE_KEY);
      if (cached && Date.now() - cached.t < CACHE_MS) { show(cached.id); return; }
      fetch(API + '/shop/pet', { headers: window.AuthService.authHeader() })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || !d.success) return;
          lsSet(CACHE_KEY, { id: d.activePet || '', t: Date.now() });
          show(d.activePet);
        })
        .catch(function () {});
    } catch (e) {}
  }

  window.Pets = {
    svg: svg,
    badge: badge,
    names: NAMES,
    // Called by the shop page right after the student picks/puts away a pet.
    setActive: function (id) {
      lsSet(CACHE_KEY, { id: id || '', t: Date.now() });
      try { localStorage.removeItem(REST_KEY); } catch (e) {}
      show(id);
    },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
