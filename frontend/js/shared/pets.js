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

  // Vĩ thú: a fan of `n` tails rooted at (bx, by), drawn pointing left and
  // rotated upward (positive SVG rotation lifts a left-pointing tail).
  function tails(n, bx, by, len, w, fill, tip, line) {
    var from = n === 1 ? 32 : -6, to = n === 1 ? 32 : (n > 5 ? 100 : 88);
    var st = line ? ' stroke="' + line + '" stroke-width=".9" stroke-linejoin="round"' : '';
    var out = '';
    for (var i = 0; i < n; i++) {
      var a = n === 1 ? from : from + (to - from) * i / (n - 1);
      out += '<g transform="rotate(' + a.toFixed(1) + ' ' + bx + ' ' + by + ')">'
        + '<path d="M' + bx + ' ' + (by - w) + ' Q' + (bx - len * 0.6) + ' ' + (by - w * 1.7) + ' ' + (bx - len) + ' ' + by
        + ' Q' + (bx - len * 0.6) + ' ' + (by + w * 1.2) + ' ' + bx + ' ' + (by + w) + ' Z" fill="' + fill + '"' + st + '/>'
        + (tip ? '<path d="M' + (bx - len * 0.62) + ' ' + (by - w * 1.05) + ' Q' + (bx - len * 0.85) + ' ' + (by - w * 0.9) + ' ' + (bx - len) + ' ' + by
          + ' Q' + (bx - len * 0.82) + ' ' + (by + w * 0.7) + ' ' + (bx - len * 0.62) + ' ' + (by + w * 0.75) + ' Z" fill="' + tip + '"/>' : '')
        + '</g>';
    }
    return '<g class="pt-tail">' + out + '</g>';
  }
  // Chibi head shared by the four-legged vĩ thú: big round head, cheeks.
  function chibiCheeks(x1, x2, y) {
    return '<ellipse cx="' + x1 + '" cy="' + y + '" rx="2.2" ry="1.3" fill="#ff8a8a" opacity=".6"/>'
      + '<ellipse cx="' + x2 + '" cy="' + y + '" rx="2.2" ry="1.3" fill="#ff8a8a" opacity=".6"/>';
  }
  function smile(x, y) {
    return '<path d="M' + (x - 1.6) + ' ' + y + 'q1.6 1.8 3.2 0" stroke="#3b2412" stroke-width="1" fill="none" stroke-linecap="round"/>';
  }

  // Thập Vĩ's Susanoo-style aura, drawn behind it: two flickering purple
  // flame shells wrapping the beast + lightning bolts that flash in turn
  // (pets.css .pt-aura-*, .pt-bolt).
  function vi10Aura() {
    var cx = 32, cy = 37;
    function pt(deg, r, up) {
      var rad = deg * Math.PI / 180;
      return (cx + r * Math.cos(rad)).toFixed(1) + ' ' + (cy - r * Math.sin(rad) - (up || 0)).toFixed(1);
    }
    // Flame tongues from lower-left, over the top, to lower-right; each tip
    // leans upward so the flames rise. Closed under the feet.
    function shell(cls, rOut, rIn, n, lean, fill, alpha) {
      var a0 = 235, step = -290 / n, rMid = (rIn + rOut) / 2;
      var d = 'M' + pt(a0, rIn);
      for (var i = 0; i < n; i++) {
        var a = a0 + step * i;
        d += ' Q' + pt(a + step * 0.2, rMid, lean * 0.3) + ' ' + pt(a + step * 0.5, rOut, lean)
          + ' Q' + pt(a + step * 0.8, rMid, lean * 0.3) + ' ' + pt(a + step, rIn);
      }
      d += ' Q' + cx + ' ' + (cy + rIn * 1.05).toFixed(1) + ' ' + pt(a0, rIn) + ' Z';
      return '<path class="pt-aura-shell ' + cls + '" d="' + d + '" fill="' + fill + '" fill-opacity="' + alpha
        + '" stroke="#d8b4fe" stroke-opacity=".75" stroke-width=".7" stroke-linejoin="round"/>';
    }
    // A zigzag bolt shooting outward at `deg` from radius r0 to r1.
    function bolt(deg, r0, r1, delay, dur) {
      var rad = deg * Math.PI / 180, px = -Math.sin(rad), py = -Math.cos(rad), pts = [];
      for (var j = 0; j <= 4; j++) {
        var r = r0 + (r1 - r0) * j / 4, off = (j === 0 || j === 4) ? 0 : (j % 2 ? 2.6 : -2.2);
        pts.push((cx + r * Math.cos(rad) + px * off).toFixed(1) + ',' + (cy - r * Math.sin(rad) + py * off).toFixed(1));
      }
      pts = pts.join(' ');
      return '<g class="pt-bolt" style="animation-delay:' + delay + 's;animation-duration:' + dur + 's">'
        + '<polyline points="' + pts + '" fill="none" stroke="#a855f7" stroke-width="3.2" stroke-opacity=".75" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<polyline points="' + pts + '" fill="none" stroke="#faf5ff" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>'
        + '</g>';
    }
    return '<g class="pt-aura">'
      + '<ellipse cx="32" cy="38" rx="25" ry="24" fill="#c084fc" fill-opacity=".22"/>'
      + shell('pt-aura-a', 38, 29, 9, 6, '#a855f7', '.26')
      + shell('pt-aura-b', 31, 24.5, 11, 4, '#7e22ce', '.3')
      + bolt(150, 24, 45, 0, 1.5) + bolt(62, 26, 46, .5, 1.8) + bolt(105, 28, 47, 1.1, 1.6)
      + bolt(18, 24, 44, .8, 1.4) + bolt(205, 22, 40, 1.3, 1.9) + bolt(-28, 22, 40, .25, 1.7)
      + '</g>';
  }

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

    // ── Vĩ thú (1–9 đuôi), chibi: short legs, oversized heads ──────────
    vi1: function () { // Lửng Cát Nhất Vĩ — tanuki with a leaf on its head
      var c = '#d8b07a', d = '#a97c47', cream = '#f6e6c8', mask = '#8a6440';
      return legs('pt-leg-b', [21, 36], 50, 8, d)
        + tails(1, 20, 45, 19, 6, c, d, d)
        + '<g class="pt-body">'
        + '<ellipse cx="29" cy="47" rx="12" ry="8" fill="' + c + '"/>'
        + '<ellipse cx="31" cy="50" rx="7" ry="4" fill="' + cream + '"/>'
        + '<circle cx="38" cy="19" r="4.5" fill="' + d + '"/><circle cx="38" cy="19" r="2.2" fill="' + cream + '"/>'
        + '<circle cx="56" cy="19" r="4.5" fill="' + d + '"/><circle cx="56" cy="19" r="2.2" fill="' + cream + '"/>'
        + '<circle cx="47" cy="31" r="13" fill="' + c + '"/>'
        + '<ellipse cx="42.5" cy="30" rx="4.6" ry="3.6" fill="' + mask + '"/><ellipse cx="51.5" cy="30" rx="4.6" ry="3.6" fill="' + mask + '"/>'
        + '<ellipse cx="47" cy="37" rx="5.5" ry="3.8" fill="' + cream + '"/>'
        + eyes([42.5, 51.5], 30, '#1d140c')
        + '<ellipse cx="47" cy="35" rx="1.6" ry="1.2" fill="#2a1a0e"/>' + smile(47, 37.2)
        + chibiCheeks(39, 55, 35)
        + '<path d="M43 19 C43 12 50 10 53 12 C51 17 48 19 43 19 Z" fill="#6cc04a"/><path d="M44 18 L51 13" stroke="#3f8f2e" stroke-width=".8"/>'
        + '</g>'
        + legs('pt-leg-a', [25, 40], 50, 9, c);
    },
    vi2: function () { // Mèo Nhị Vĩ — white cat, two blue-flame tails
      var c = '#fbf8ff', d = '#ddd6f0', flame = '#5aa9ff';
      return legs('pt-leg-b', [21, 36], 50, 8, d)
        + tails(2, 20, 45, 20, 3.4, c, flame, d)
        + '<g class="pt-body">'
        + '<ellipse cx="29" cy="47" rx="12" ry="8" fill="' + c + '" stroke="' + d + '" stroke-width=".8"/>'
        + '<path d="M36 22 L37 9 L45 18 Z" fill="' + c + '" stroke="' + d + '" stroke-width=".8"/><path d="M38.5 18 L39 13 L42.5 17 Z" fill="#ffb3c7"/>'
        + '<path d="M50 18 L58 9 L59 22 Z" fill="' + c + '" stroke="' + d + '" stroke-width=".8"/><path d="M52.5 17 L56.5 12.5 L57 18 Z" fill="#ffb3c7"/>'
        + '<circle cx="47" cy="31" r="13" fill="' + c + '" stroke="' + d + '" stroke-width=".8"/>'
        + '<path d="M47 20 C45 23 46 25 47 26 C48 25 49 23 47 20 Z" fill="' + flame + '"/>'
        + eyes([42, 52], 30.5, '#2b4a9a')
        + '<path d="M45.8 34h2.4l-1.2 1.3z" fill="#ff7a8a"/>' + smile(47, 36.2)
        + chibiCheeks(38.5, 55.5, 35)
        + '<path d="M60 34h4M60 36l3.5 1M34 34h-4M34 36l-3.5 1" stroke="#b9b0d6" stroke-width=".7" stroke-linecap="round"/>'
        + '</g>'
        + legs('pt-leg-a', [25, 40], 50, 9, c);
    },
    vi3: function () { // Rùa Tam Vĩ — little turtle, three stubby tails
      var skin = '#7cc79a', d = '#4f9a72', shell = '#3f8f6b', hex = '#5fb58a';
      return legs('pt-leg-b', [18, 36], 50, 7, d)
        + tails(3, 14, 50, 12, 2.6, skin, d, d)
        + '<g class="pt-body">'
        + '<path d="M10 52 C10 36 19 29 29 29 C39 29 47 36 47 52 Z" fill="' + shell + '"/>'
        + '<path d="M22 36l5-3 5 3v5l-5 3-5-3z M14 46l4-2.5 4 2.5v4h-8z M33 46l4-2.5 4 2.5v4h-8z" fill="' + hex + '"/>'
        + '<path d="M8 52 H49" stroke="#2f6e52" stroke-width="3" stroke-linecap="round"/>'
        + '<circle cx="52" cy="38" r="11" fill="' + skin + '"/>'
        + eyes([48, 56.5], 37, '#183a2a')
        + smile(52.5, 42) + chibiCheeks(45.5, 59.5, 41.5)
        + '</g>'
        + legs('pt-leg-a', [22, 40], 50, 8, skin);
    },
    vi4: function () { // Khỉ Tứ Vĩ — red monkey, four thin tails
      var c = '#c75a3a', d = '#9e4128', face = '#f7d9b8';
      return legs('pt-leg-b', [21, 36], 50, 8, d)
        + tails(4, 20, 45, 19, 2.2, c, d, d)
        + '<g class="pt-body">'
        + '<ellipse cx="29" cy="47" rx="12" ry="8" fill="' + c + '"/>'
        + '<ellipse cx="31" cy="50" rx="7" ry="4" fill="' + face + '"/>'
        + '<circle cx="34.5" cy="31" r="4.5" fill="' + c + '"/><circle cx="34.5" cy="31" r="2.4" fill="' + face + '"/>'
        + '<circle cx="47" cy="30" r="13" fill="' + c + '"/>'
        + '<path d="M44 17.5 C46 14 49 14 50 17.5" stroke="' + c + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
        + '<path d="M38 31 C38 24 45 22.5 47 26 C49 22.5 56 24 56 31 C56 38 51 41 47 41 C43 41 38 38 38 31Z" fill="' + face + '"/>'
        + eyes([43, 51], 30, '#2a160c')
        + '<circle cx="46" cy="35" r=".7" fill="' + d + '"/><circle cx="48" cy="35" r=".7" fill="' + d + '"/>' + smile(47, 37.3)
        + chibiCheeks(40, 54, 35)
        + '</g>'
        + legs('pt-leg-a', [25, 40], 50, 9, c);
    },
    vi5: function () { // Ngựa Ngũ Vĩ — white pony, pink mane, five ribbon tails
      var c = '#f7f4ee', d = '#ddd6cc', mane = '#ffb3cf';
      return legs('pt-leg-b', [21, 36], 48, 10, d)
        + tails(5, 20, 44, 19, 2.2, mane, '#ff8fb8', '#e06a99')
        + '<g class="pt-body">'
        + '<ellipse cx="29" cy="45" rx="12" ry="8" fill="' + c + '" stroke="' + d + '" stroke-width=".8"/>'
        + '<path d="M41 15 L43 9 L46 15 Z" fill="' + c + '" stroke="' + d + '" stroke-width=".8"/>'
        + '<circle cx="47" cy="29" r="12.5" fill="' + c + '" stroke="' + d + '" stroke-width=".8"/>'
        + '<ellipse cx="54" cy="35" rx="7" ry="5" fill="' + c + '" stroke="' + d + '" stroke-width=".8"/>'
        + '<circle cx="57" cy="34" r=".8" fill="#b9a99a"/>'
        + '<path d="M48.5 16.5 L51 9 L52.5 17 Z" fill="#ffd257"/>'
        + '<path d="M38 22 C40 15 47 13 50 17 C46 17 44 20 44 24 C41 23 39 24 37 27 Z" fill="' + mane + '"/>'
        + eyes([44, 51.5], 28.5, '#4a2a3a')
        + smile(54, 37.5) + chibiCheeks(41, 57.5, 32.5)
        + '</g>'
        + legs('pt-leg-a', [25, 40], 48, 11, c);
    },
    vi6: function () { // Sên Lục Vĩ — soft slug, eye stalks, six little tails
      var c = '#f4f1d8', d = '#d6cf9e', spot = '#c9e7a3';
      return tails(6, 13, 53, 12, 1.8, c, '#b8e08a', d)
        + '<g class="pt-body pt-squish">'
        + '<path d="M8 56 C8 48 17 45 28 45 C36 45 39 38 44 34 C50 29 61 31 62 41 C63 52 54 58 42 58 L11 58 C9 58 8 57 8 56 Z" fill="' + c + '" stroke="' + d + '" stroke-width=".9"/>'
        + '<circle cx="20" cy="51" r="2.4" fill="' + spot + '"/><circle cx="29" cy="49" r="1.8" fill="' + spot + '"/><circle cx="37" cy="53" r="2" fill="' + spot + '"/>'
        + '<path d="M48 34 L46 24 M56 33 L58 23" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>'
        + '<circle cx="46" cy="23" r="3.6" fill="#fff" stroke="' + d + '" stroke-width=".8"/><circle cx="58" cy="22" r="3.6" fill="#fff" stroke="' + d + '" stroke-width=".8"/>'
        + eyes([46.5, 58.5], 23, '#2d2a18')
        + smile(53, 44) + chibiCheeks(47, 59, 42)
        + '</g>';
    },
    vi7: function () { // Bọ Thất Vĩ — green beetle, see-through wings, seven ribbons
      var c = '#7bd664', d = '#3f9a3a', wing = '#d4f7ff';
      return legs('pt-leg-b', [21, 35], 50, 8, d)
        + tails(7, 19, 47, 17, 1.6, '#9be38a', '#ffd257', d)
        + '<g class="pt-wing"><ellipse cx="25" cy="34" rx="10" ry="5.5" transform="rotate(-28 25 34)" fill="' + wing + '" stroke="#86c8dc" stroke-width=".8" opacity=".9"/>'
        + '<ellipse cx="31" cy="33" rx="8" ry="4.5" transform="rotate(-48 31 33)" fill="' + wing + '" stroke="#86c8dc" stroke-width=".8" opacity=".9"/></g>'
        + '<g class="pt-body">'
        + '<ellipse cx="29" cy="47" rx="12" ry="8" fill="' + c + '"/>'
        + '<path d="M18 45 Q29 40 40 45" stroke="' + d + '" stroke-width="1.2" fill="none"/>'
        + '<circle cx="24" cy="49" r="1.6" fill="' + d + '"/><circle cx="33" cy="49" r="1.6" fill="' + d + '"/>'
        + '<path d="M44 20 Q42 13 37 12 M52 20 Q55 13 60 13" stroke="' + d + '" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
        + '<circle cx="37" cy="12" r="1.6" fill="#ffd257"/><circle cx="60" cy="13" r="1.6" fill="#ffd257"/>'
        + '<circle cx="48" cy="32" r="12.5" fill="#94e47c"/>'
        + '<path d="M48 20 C47 16 49 13 52 12 C51 15 51 18 50 20 Z" fill="#ffd257"/>'
        + eyes([43.5, 52.5], 31.5, '#173a14')
        + smile(48, 37) + chibiCheeks(40.5, 55.5, 35.5)
        + '</g>'
        + legs('pt-leg-a', [25, 39], 50, 9, c);
    },
    vi8: function () { // Bò Bát Vĩ — lilac ox with curly horns, eight tentacles
      var c = '#9a86c4', d = '#6c5a96', muzzle = '#efe7fb', horn = '#fff3d6';
      return legs('pt-leg-b', [21, 36], 50, 8, d)
        + tails(8, 20, 45, 19, 2.1, c, d, d)
        + '<g class="pt-body">'
        + '<ellipse cx="29" cy="47" rx="12" ry="8" fill="' + c + '"/>'
        + '<ellipse cx="31" cy="50" rx="7" ry="4" fill="' + muzzle + '"/>'
        + '<path d="M37 22 C31 20 30 13 34 10 C34 14 36 18 40 20 Z" fill="' + horn + '"/>'
        + '<path d="M57 21 C63 19 64 12 60 9 C60 13 58 17 54 19 Z" fill="' + horn + '"/>'
        + '<ellipse cx="34" cy="27" rx="4" ry="2.4" transform="rotate(-20 34 27)" fill="' + d + '"/>'
        + '<ellipse cx="60" cy="26" rx="4" ry="2.4" transform="rotate(20 60 26)" fill="' + d + '"/>'
        + '<circle cx="47" cy="30" r="13" fill="' + c + '"/>'
        + '<ellipse cx="47" cy="36.5" rx="7.5" ry="5" fill="' + muzzle + '"/>'
        + '<circle cx="44.5" cy="35.5" r="1" fill="' + d + '"/><circle cx="49.5" cy="35.5" r="1" fill="' + d + '"/>'
        + '<path d="M44.5 40.5 a2.5 2.5 0 0 0 5 0" stroke="#ffd257" stroke-width="1.4" fill="none"/>'
        + eyes([42, 52], 28.5, '#2a1f3d')
        + chibiCheeks(38.5, 55.5, 33)
        + '</g>'
        + legs('pt-leg-a', [25, 40], 50, 9, c);
    },
    vi9: function () { // Hồ Ly Cửu Vĩ — golden fox, nine white-tipped tails
      var c = '#f7c548', d = '#e0a52a', w = '#fffaf0';
      return legs('pt-leg-b', [21, 36], 50, 8, d)
        + tails(9, 20, 45, 21, 2.3, c, w, d)
        + '<g class="pt-body">'
        + '<ellipse cx="29" cy="47" rx="12" ry="8" fill="' + c + '"/>'
        + '<ellipse cx="32" cy="50" rx="7" ry="4" fill="' + w + '"/>'
        + '<path d="M36 22 L37 8 L45 17 Z" fill="' + c + '"/><path d="M38.5 17 L39 12 L42.5 16 Z" fill="#ffb3c7"/>'
        + '<path d="M50 17 L58 8 L59 22 Z" fill="' + c + '"/><path d="M52.5 16 L56.5 11.5 L57 17 Z" fill="#ffb3c7"/>'
        + '<circle cx="47" cy="31" r="13" fill="' + c + '"/>'
        + '<path d="M36 34 C40 41 54 41 58 34 C54 36 50 35 47 33 C44 35 40 36 36 34 Z" fill="' + w + '"/>'
        + '<path d="M47 20 L48.6 23 L47 26 L45.4 23 Z" fill="#ff6f8f"/>'
        + eyes([42, 52], 29.5, '#7a3a12')
        + '<ellipse cx="47" cy="34.5" rx="1.6" ry="1.2" fill="#3b2412"/>' + smile(47, 36.6)
        + chibiCheeks(38.5, 55.5, 34)
        + '</g>'
        + legs('pt-leg-a', [25, 40], 50, 9, c);
    },
    vi10: function () { // Thập Vĩ — huge brown beast, one ringed eye, ten spiky tails fanned behind
      var c = '#7a5f5a', d = '#4e3a37', belly = '#a8908b', eye = '#e4dbe9';
      var out = '';
      // One spiky tail, root at 0,0, pointing right and curling to -y.
      var TAIL = 'M0 -3.4 C8 -5 15 -6 20 -9 L21.5 -13.5 L23.2 -9.6 L28 -12.4 L24.6 -6.6 L27.4 -4.4 L21.6 -3.4 C15 -1 8 2.6 0 3.4 Z';
      for (var i = 0; i < 10; i++) {
        // Fanned round the hips from low-right over the top to low-left;
        // the left half is mirrored so every tail curls upward.
        var a = 15 - i * 23.33, k = 0.86 + (i % 2) * 0.16;
        out += '<path d="' + TAIL + '" transform="translate(32 38) rotate(' + a.toFixed(1) + ') scale(' + k.toFixed(2) + ' ' + ((i < 5 ? 1.45 : -1.45) * k).toFixed(2) + ')"'
          + ' fill="' + (i % 2 ? c : '#6c524d') + '" stroke="' + d + '" stroke-width=".8" stroke-linejoin="round"/>';
      }
      var ring = function (r, sw) { return '<circle cx="32" cy="30" r="' + r + '" fill="none" stroke="#3a2a2c" stroke-width="' + sw + '"/>'; };
      var tomoe = [90, 210, 330].map(function (deg) {
        var rad = deg * Math.PI / 180;
        return '<circle cx="' + (32 + 2.75 * Math.cos(rad)).toFixed(2) + '" cy="' + (30 + 2.75 * Math.sin(rad)).toFixed(2) + '" r=".62" fill="#3a2a2c"/>';
      }).join('');
      return vi10Aura()
        + '<g class="pt-tail pt-tail-fan">' + out + '</g>'
        + legs('pt-leg-b', [25.5], 51, 8.5, d)
        + legs('pt-leg-a', [33.5], 51, 8.5, d)
        + '<g class="pt-body">'
        + '<path d="M21.5 22 L22.5 12.5 L28 18.5 Z M42.5 22 L41.5 12.5 L36 18.5 Z" fill="' + c + '" stroke="' + d + '" stroke-width=".8" stroke-linejoin="round"/>'
        + '<path d="M23 20 L23.4 15.6 L26 18.6 Z M41 20 L40.6 15.6 L38 18.6 Z" fill="#c39a9a"/>'
        + '<path d="M20.5 40 C17.5 41 16.8 46 19 47 C21 47.6 22.6 45 22.6 42 Z M43.5 40 C46.5 41 47.2 46 45 47 C43 47.6 41.4 45 41.4 42 Z" fill="' + c + '" stroke="' + d + '" stroke-width=".8"/>'
        + '<path d="M32 16.5 C42 16.5 45 27 44.6 37 C44.3 47 40 53 32 53 C24 53 19.7 47 19.4 37 C19 27 22 16.5 32 16.5 Z" fill="' + c + '" stroke="' + d + '" stroke-width=".9"/>'
        + '<ellipse cx="32" cy="43.5" rx="8" ry="8.2" fill="' + belly + '"/>'
        + '<g class="pt-eye"><circle cx="32" cy="30" r="5.6" fill="' + eye + '" stroke="#3a2a2c" stroke-width=".9"/>'
        + ring(3.9, .55) + ring(2.1, .5) + '<circle cx="32" cy="30" r=".85" fill="#3a2a2c"/>' + tomoe + '</g>'
        + '<path d="M30 37.2 q2 1.6 4 0" stroke="#3a2a2c" stroke-width=".9" fill="none" stroke-linecap="round"/>'
        + '</g>';
    },
  };

  var NAMES = { meo: 'Mèo Quýt', shiba: 'Shiba Lì Xì', cut: 'Cánh Cụt Bông', cao: 'Cáo Lửa', rong: 'Rồng Con',
    vi1: 'Lửng Cát Nhất Vĩ', vi2: 'Mèo Lửa Nhị Vĩ', vi3: 'Rùa Tam Vĩ', vi4: 'Khỉ Tứ Vĩ', vi5: 'Ngựa Ngũ Vĩ',
    vi6: 'Sên Lục Vĩ', vi7: 'Bọ Thất Vĩ', vi8: 'Bò Bát Vĩ', vi9: 'Hồ Ly Cửu Vĩ', vi10: 'Thập Vĩ' };
  var LINES = {
    meo: ['Meo~ học xong bài này rồi ngủ trưa nha 😽', 'Sổ từ vựng ấm ghê, cho mèo nằm xíu…', 'Meo! Hôm nay giữ chuỗi chưa đó?'],
    shiba: ['Gâu! Cậu học giỏi quá trời 🐕', 'Vẫy đuôi cổ vũ nè! Thêm 1 bài nữa nha!', 'Gâu gâu — đi dạo xong là học tiếp nhé!'],
    cut: ['Lạch bạch… cánh cụt cũng đang học IELTS đó 🐧', 'Ngã cũng không sao, đứng dậy làm bài tiếp!', 'Băng ở đây lạnh, nhưng chuỗi của cậu nóng 🔥'],
    cao: ['Hehe, mình biết mẹo làm Reading nè 🦊', 'Tinh ranh như cáo — đọc câu hỏi trước nha!', 'Đuôi rực lửa giống chuỗi của cậu đó!'],
    rong: ['Grào~ 🔥 phun lửa tiếp sức cho cậu!', 'Rồng con sẽ canh chuỗi lửa giúp cậu!', 'Lửa của rồng không bằng lửa học của cậu đâu!'],
    vi1: ['Một đuôi thôi nhưng học chăm gấp mười 🍃', 'Lá trên đầu là bùa học bài đó!', 'Lửng cát ngủ đủ, cậu học đủ nha!'],
    vi2: ['Meo~ hai đuôi lửa xanh cổ vũ cậu 💙', 'Lửa xanh mát lạnh, đầu óc tỉnh táo!', 'Hai đuôi = hai lần chăm chỉ!'],
    vi3: ['Chậm mà chắc — mỗi ngày một bài 🐢', 'Mai rùa cứng như chuỗi lửa của cậu!', 'Ba đuôi rùa vẫy vẫy chào cậu~'],
    vi4: ['Khỉ khôn mách nhỏ: đọc câu hỏi trước! 🐒', 'Bốn đuôi đu dây lên top nè!', 'Học xong thưởng chuối nha!'],
    vi5: ['Phi nước đại lên band cao thôi 🦄', 'Năm đuôi bay bay, tiến lên nào!', 'Bờm hồng hôm nay chải đẹp chưa?'],
    vi6: ['Từ từ mà tới… nhưng ngày nào cũng tới 🐌', 'Sên nhớ từ vựng bằng mắt dài nè!', 'Sáu đuôi nhỏ xíu, ý chí to đùng!'],
    vi7: ['Vù vù~ bay quanh nhắc cậu học bài 🪲', 'Bảy dải đuôi lấp lánh như chuỗi lửa!', 'Cánh trong suốt, đầu óc trong veo!'],
    vi8: ['Mooo~ tám tua chép bài giúp cậu 🐙', 'Sừng cong cong, quyết tâm thẳng tắp!', 'Bát vĩ đây — vào top chưa?'],
    vi9: ['Chín đuôi vàng óng — linh thú mạnh nhất đây ✨', 'Hồ ly chín đuôi phù hộ cậu đạt band cao!', 'Đuôi nhiều như số 🔥 của cậu vậy!'],
    vi10: ['Mười đuôi mà vẫn thích chơi đuổi bắt nè 🔥', 'Thập Vĩ đây! Kết bạn với tớ nha~', 'To con vậy thôi chứ tớ hiền lắm, học tiếp đi!'],
  };

  // Huyền thoại pets are drawn bigger (badge: pets.css .pet-legend; walker: px).
  var BIG = { vi10: 80 };

  function svg(id, cls) {
    if (!ART[id]) return '';
    return '<svg class="pt-svg pt-' + id + (cls ? ' ' + cls : '') + '" viewBox="-2 0 70 64" aria-hidden="true" focusable="false">' + ART[id]() + '</svg>';
  }
  function badge(id) {
    if (!ART[id]) return '';
    return '<span class="pet-badge' + (BIG[id] ? ' pet-legend' : '') + '" title="Linh thú: ' + NAMES[id] + '">' + svg(id, 'pt-static') + '</span>';
  }

  /* ══════════════════════════════════════════════════════════════════
     CSS — injected once (absolute path: some pages live at nested clean URLs)
     ══════════════════════════════════════════════════════════════════ */
  function ensureCss() {
    if (document.getElementById('ews-pets-css')) return;
    var l = document.createElement('link');
    l.id = 'ews-pets-css'; l.rel = 'stylesheet'; l.href = '/css/pets.css?v=8f61377ebf';
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
  // Reading / Listening (incl. Dictation) practice: no pet at all on these
  // pages — matched on the whole path so clean URLs (/reading/test/<id>)
  // count too.
  var NO_PET_PATHS = /(^|\/)(reading|listening|dictation)(\.html)?(\/|$)/;
  var SPEED = { meo: 42, shiba: 55, cut: 28, cao: 62, rong: 50,
    vi1: 40, vi2: 48, vi3: 24, vi4: 58, vi5: 64, vi6: 18, vi7: 52, vi8: 44, vi9: 66, vi10: 38 };

  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  function examActive() {
    if (EXAM_PAGES.test(location.pathname.split('/').pop())) return true;
    if (NO_PET_PATHS.test(location.pathname)) return true;
    if (document.body && !document.body.classList.contains('has-global-nav')) return true;
    try { if (typeof window.__ewsExamActive === 'function' && window.__ewsExamActive()) return true; } catch (e) {}
    try { if (typeof window._isActivePractice === 'function' && window._isActivePractice()) return true; } catch (e) {}
    return false;
  }

  var walker = null;

  // The pet walks a loop around the whole screen edge: along the bottom,
  // up the right wall, along the top (upside down, just under the nav),
  // down the left wall — sometimes turning back, sitting, or dozing off.
  // Position on the loop is one number, `t` (px from the bottom-left
  // corner, clockwise on screen); geometry() maps it to x/y + rotation.
  function Walker(id) {
    this.id = id;
    this.size = BIG[id] || 58;
    this.t = 0; this.target = 0; this.dir = 1; this.rot = 0;
    this.state = 'idle'; this.until = 0; this.last = 0; this.idleCount = 0;
    this.build();
  }
  Walker.prototype.rect = function () {
    var w = window.innerWidth || 800, h = window.innerHeight || 600;
    var nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64;
    var r = { left: 4, right: Math.max(60, w - this.size - 4), top: nav + 4, bottom: Math.max(nav + 60, h - this.size - 2) };
    r.lb = r.right - r.left; r.lr = r.bottom - r.top;
    r.perim = 2 * (r.lb + r.lr);
    return r;
  };
  // t → { x, y, rot }. rot is how the pet is turned so its feet face the
  // edge it's walking on (0 floor, -90 right wall, 180 ceiling, 90 left wall).
  Walker.prototype.geometry = function (t) {
    var r = this.rect();
    t = ((t % r.perim) + r.perim) % r.perim;
    if (t < r.lb) return { x: r.left + t, y: r.bottom, rot: 0 };
    t -= r.lb;
    if (t < r.lr) return { x: r.right, y: r.bottom - t, rot: -90 };
    t -= r.lr;
    if (t < r.lb) return { x: r.right - t, y: r.top, rot: 180 };
    t -= r.lb;
    return { x: r.left, y: r.top + t, rot: 90 };
  };
  Walker.prototype.build = function () {
    var self = this;
    var layer = document.createElement('div');
    layer.id = 'ews-pet-layer';
    layer.className = 'ews-pet-layer';
    layer.innerHTML = '<div class="ews-pet-bubble" hidden></div>'
      + '<div class="ews-pet" role="button" tabindex="0" aria-label="Linh thú ' + NAMES[this.id] + ' — bấm để chơi">'
      + '<div class="ews-pet-rot"><div class="ews-pet-flip">' + svg(this.id) + '</div>' + ZZZ + '</div>'
      + '</div>';
    document.body.appendChild(layer);
    this.layer = layer;
    this.el = layer.querySelector('.ews-pet');
    if (this.size !== 58) { this.el.style.width = this.el.style.height = this.size + 'px'; }
    this.rotEl = layer.querySelector('.ews-pet-rot');
    this.flip = layer.querySelector('.ews-pet-flip');
    this.bubble = layer.querySelector('.ews-pet-bubble');
    // Start somewhere along the floor, clear of the Lulu/Lumi dock.
    var r = this.rect();
    this.t = Math.min(r.lb, 200 + Math.random() * Math.max(0, r.lb - 260));
    this.place();
    this.el.addEventListener('click', function () { self.poke(); });
    this.el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.poke(); }
    });
    this.bubble.addEventListener('click', function (e) {
      if (e.target.closest('.ews-pet-rest')) self.rest();
    });
    if (!REDUCED) this.raf = requestAnimationFrame(function (t) { self.tick(t); });
    else this.setState('sit');
    this.vis = setInterval(function () { self.layer.style.display = examActive() ? 'none' : ''; }, 600);
    this.layer.style.display = examActive() ? 'none' : '';
  };
  Walker.prototype.place = function () {
    var g = this.geometry(this.t);
    this.g = g;
    this.el.style.transform = 'translate(' + Math.round(g.x) + 'px,' + Math.round(g.y) + 'px)';
    if (g.rot !== this.rot) { this.rot = g.rot; this.rotEl.style.transform = g.rot ? 'rotate(' + g.rot + 'deg)' : ''; }
    this.flip.style.transform = this.dir < 0 ? 'scaleX(-1)' : '';
    if (!this.bubble.hidden) this.placeBubble();
  };
  // The bubble lives outside the rotating pet so its text is never sideways.
  Walker.prototype.placeBubble = function () {
    var g = this.g || this.geometry(this.t);
    var w = window.innerWidth || 800;
    var bw = Math.min(220, w - 16);
    var x = Math.max(8, Math.min(w - bw - 8, g.x + this.size / 2 - bw / 2));
    var below = g.y < 200;
    this.bubble.style.width = bw + 'px';
    this.bubble.style.left = x + 'px';
    this.bubble.style.top = below ? (g.y + this.size + 10) + 'px' : '';
    this.bubble.style.bottom = below ? '' : ((window.innerHeight || 600) - g.y + 8) + 'px';
    this.bubble.classList.toggle('is-below', below);
  };
  Walker.prototype.setState = function (s) {
    this.state = s;
    this.el.classList.toggle('is-walking', s === 'walk');
    this.el.classList.toggle('is-sitting', s === 'sit' || s === 'sleep');
    this.el.classList.toggle('is-sleeping', s === 'sleep');
  };
  Walker.prototype.pickNext = function (now) {
    var r = this.rect();
    if (this.state === 'walk' || Math.random() < 0.15) {
      // Rest a while; after a few rests in a row, doze off.
      this.idleCount++;
      var sleepy = this.idleCount > 3 && Math.random() < 0.35;
      this.setState(sleepy ? 'sleep' : 'sit');
      this.until = now + (sleepy ? 9000 + Math.random() * 8000 : 1500 + Math.random() * 3000);
      if (this.id === 'rong' && !sleepy && Math.random() < 0.5) this.puff();
    } else {
      // Mostly keep going the same way round; now and then turn back.
      this.idleCount = 0;
      if (Math.random() < 0.25) this.dir = -this.dir;
      this.target = this.t + this.dir * (r.perim * (0.12 + Math.random() * 0.3));
      this.setState('walk');
    }
  };
  Walker.prototype.tick = function (now) {
    var self = this;
    var dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0;
    this.last = now;
    if (this.layer.style.display !== 'none') {
      if (this.state === 'walk') {
        this.t += (SPEED[this.id] || 45) * dt * this.dir;
        if ((this.dir > 0 && this.t >= this.target) || (this.dir < 0 && this.t <= this.target)) {
          this.t = this.target;
          this.pickNext(now);
        }
        this.place();
      } else if (now >= this.until) {
        this.pickNext(now);
        this.place();
      }
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
    this.placeBubble();
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

  window.addEventListener('resize', function () { if (walker) walker.place(); });

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
      if (EXAM_PAGES.test(location.pathname.split('/').pop()) || NO_PET_PATHS.test(location.pathname)) return;
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
