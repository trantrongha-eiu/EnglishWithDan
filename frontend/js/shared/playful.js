/**
 * js/shared/playful.js — the student-side "playful" layer
 *
 *   • Mascot      — Lulu, our round capybara with a tangerine on its head,
 *                   and Lumi, his girlfriend (pink, with a bow) — inline SVG,
 *                   several moods, blink / bob / look-at-cursor.
 *                   Replaces the old 🐼 emoji wherever the pages put one.
 *   • Mascot dock — a small companion in the corner of every student page:
 *                   peeks in, says a tip or a cheer when clicked, hops when a
 *                   success toast fires, hides itself during exams (nav.js
 *                   _toggleExamAids) and can be dismissed for the day.
 *   • TestCardArt — "TEST 3" label for the colourful test cards.
 *   • Eyes        — any [data-eyes] svg's pupils follow the pointer
 *                   (dashboard skill cards, mascot).
 *
 * Load after nav.js (needs #globalTopNav to decide whether to dock).
 * Everything is decorative: every block is try/catch-guarded and nothing on
 * the page depends on it.
 */
(function () {
  'use strict';

  var REDUCED = false;
  try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     MASCOT SVG
     viewBox 0 0 120 128 — body 20..100 wide, tangerine on top.
     ══════════════════════════════════════════════════════════════════ */
  var uid = 0;

  // Lulu (tangerine capybara) and Lumi, his girlfriend (pastel capybara
  // with eyelashes) share one drawing; only the palette and what they wear
  // change.
  var LULU_LOOK = {
    body: ['#ffd257', '#ffb534', '#ff9420'], muzzle: ['#ffa634', '#f58316'],
    arm: '#ffad33', ear: '#f5a020', earIn: '#e3871a', nose: '#7a3e12',
    cheek: '#ff6f6f', brow: '#7a4a1c',
  };

  /* ── Lumi's wardrobe ──────────────────────────────────────────────────
     An outfit = { fur, accent, hat, ears, face }. Each day picks one (the
     same on every page that day), the page adds its own item (headphones
     on Listening, glasses on Reading, a pencil on Writing), late at night
     she wears a nightcap, a top score earns a crown, and clicking her
     enough makes her change clothes (kept for the rest of the day). */
  var LUMI_FUR = {
    hong: { name: 'hồng phấn', body: ['#ffe1d6', '#ffc3bb', '#ffa3a8'], muzzle: ['#ffc4b8', '#ffa59c'],
      arm: '#ffbcb2', ear: '#ffa6a6', earIn: '#f0828f', nose: '#8a3b45', cheek: '#ff5f8a', brow: '#9a4a5c' },
    tim: { name: 'tím lavender', body: ['#f1e6ff', '#dccaff', '#c4a6f4'], muzzle: ['#e4d2fd', '#cdb1f2'],
      arm: '#d7c1fa', ear: '#c6a6f0', earIn: '#a983df', nose: '#5b3a7a', cheek: '#ff6fa6', brow: '#6d4a8f' },
    mint: { name: 'xanh bạc hà', body: ['#e5fbf0', '#c3efdb', '#9fe0c2'], muzzle: ['#cff4e2', '#abe6cb'],
      arm: '#bcecd6', ear: '#9adcbf', earIn: '#76c4a3', nose: '#2f6b55', cheek: '#ff7a9a', brow: '#3f7a64' },
    dao: { name: 'cam đào', body: ['#ffeedd', '#ffd6b3', '#ffbd8f'], muzzle: ['#ffdcbf', '#ffc49b'],
      arm: '#ffd2ab', ear: '#ffc193', earIn: '#f0a274', nose: '#8a4a2b', cheek: '#ff6f80', brow: '#9a5a3a' },
    may: { name: 'xanh mây', body: ['#eaf5ff', '#cfe6ff', '#afd3fa'], muzzle: ['#d6eaff', '#b8d8fb'],
      arm: '#c9e2fd', ear: '#a9cff7', earIn: '#86b6ea', nose: '#2d4f78', cheek: '#ff7fa8', brow: '#45658f' },
  };
  // light → main → dark
  var LUMI_ACCENT = {
    hong: ['#ff8fb4', '#ff5d8f', '#e0447a'],
    do:   ['#ff8a8a', '#ef4b4b', '#b92e2e'],
    tim:  ['#c9a2ff', '#9b6cf0', '#6f43c2'],
    vang: ['#ffe07a', '#ffc531', '#d99a00'],
    xanh: ['#8fd3ff', '#4aa8f0', '#2a78c2'],
    mint: ['#8de6c0', '#3fc493', '#24936b'],
  };
  // Accents that look good on each fur.
  var FUR_ACCENTS = {
    hong: ['hong', 'do', 'tim'], tim: ['vang', 'hong', 'tim'], mint: ['hong', 'vang', 'do'],
    dao: ['do', 'mint', 'xanh'], may: ['vang', 'hong', 'tim'],
  };
  var HAT_NAMES = {
    bow: 'nơ xinh', flower: 'hoa cài tóc', beret: 'mũ nồi', strawberry: 'kẹp dâu tây',
    crown: 'vương miện', nightcap: 'mũ ngủ',
  };
  var DAILY_HATS = ['bow', 'flower', 'beret', 'strawberry'];
  var FUR_KEYS = Object.keys(LUMI_FUR);
  var OUTFIT_KEY = 'ews_lumi_outfit';

  function dayNumber() {
    var d = new Date();
    return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5);
  }

  function pageKey() {
    var pg = (location.pathname.split('/').pop() || '').replace('.html', '');
    return /listening|dictation|shadowing/.test(pg) ? 'listening'
      : /reading/.test(pg) ? 'reading'
      : /writing|task1|task2|grammar|sentences/.test(pg) ? 'writing'
      : /speaking/.test(pg) ? 'speaking'
      : /dashboard/.test(pg) ? 'dashboard' : '_';
  }

  function randomOutfit(not) {
    for (var i = 0; i < 8; i++) {
      var fur = FUR_KEYS[Math.floor(Math.random() * FUR_KEYS.length)];
      var acc = FUR_ACCENTS[fur][Math.floor(Math.random() * 3)];
      var hat = DAILY_HATS[Math.floor(Math.random() * DAILY_HATS.length)];
      if (!not || not.fur !== fur || not.hat !== hat) return { fur: fur, accent: acc, hat: hat };
    }
    return { fur: 'hong', accent: 'hong', hat: 'bow' };
  }

  // Today's base outfit: the one she changed into today, else a pick from
  // the date (stable across pages and reloads).
  function baseOutfit() {
    try {
      var saved = JSON.parse(localStorage.getItem(OUTFIT_KEY) || 'null');
      if (saved && saved.day === dayNumber() && LUMI_FUR[saved.fur]) return { fur: saved.fur, accent: saved.accent, hat: saved.hat };
    } catch (e) {}
    var n = dayNumber();
    var fur = FUR_KEYS[n % FUR_KEYS.length];
    return { fur: fur, accent: FUR_ACCENTS[fur][(n * 7) % 3], hat: DAILY_HATS[(n * 3 + 1) % DAILY_HATS.length] };
  }

  function saveOutfit(o) {
    try { localStorage.setItem(OUTFIT_KEY, JSON.stringify({ day: dayNumber(), fur: o.fur, accent: o.accent, hat: o.hat })); } catch (e) {}
  }

  // The outfit as worn right now on this page.
  function lumiOutfit(extra) {
    var o = baseOutfit();
    var key = pageKey(), h = new Date().getHours();
    if (key === 'listening') o.ears = 'headphones';
    else if (key === 'writing') o.ears = 'pencil';
    if (key === 'reading') o.face = 'glasses';
    if (h >= 23 || h < 5) o.hat = 'nightcap';
    if (extra) for (var k in extra) if (extra[k]) o[k] = extra[k];
    return o;
  }

  // Eyes per mood. Pupils live in .m-pupils so the look-at-cursor code can
  // nudge them; closed / arc eyes have no pupils to move.
  function eyes(mood, lashes) {
    var ink = '#3b2716';
    // Lumi's lashes: two flicks on each eye's outer corner.
    var lash = function (open) {
      if (!lashes) return '';
      var y = open ? 0 : 3;
      return '<g fill="none" stroke="' + ink + '" stroke-width="1.8" stroke-linecap="round">' +
        '<path d="M40 ' + (58 + y) + ' L36 ' + (55 + y) + '"/><path d="M42 ' + (56.5 + y) + ' L39.5 ' + (52.5 + y) + '"/>' +
        '<path d="M80 ' + (58 + y) + ' L84 ' + (55 + y) + '"/><path d="M78 ' + (56.5 + y) + ' L80.5 ' + (52.5 + y) + '"/></g>';
    };
    var open = function (rx, ry) {
      return '<g class="m-eyes"><g class="m-pupils">' +
        '<ellipse cx="45" cy="62" rx="' + rx + '" ry="' + ry + '" fill="' + ink + '"/>' +
        '<ellipse cx="75" cy="62" rx="' + rx + '" ry="' + ry + '" fill="' + ink + '"/>' +
        '<circle cx="46.6" cy="59.6" r="1.7" fill="#fff"/><circle cx="76.6" cy="59.6" r="1.7" fill="#fff"/>' +
        '</g>' + lash(true) + '</g>';
    };
    var arc = '<g class="m-eyes" fill="none" stroke="' + ink + '" stroke-width="3" stroke-linecap="round">';
    switch (mood) {
      case 'excited': return arc + '<path d="M39 64 Q45 56 51 64"/><path d="M69 64 Q75 56 81 64"/></g>';
      case 'sleepy':  return arc + '<path d="M39 62 Q45 66 51 62"/><path d="M69 62 Q75 66 81 62"/>' + lash(false) + '</g>';
      case 'wink':    return '<g class="m-eyes"><g class="m-pupils"><ellipse cx="45" cy="62" rx="4.4" ry="5.4" fill="' + ink + '"/><circle cx="46.6" cy="59.6" r="1.6" fill="#fff"/></g>' +
                             '<path d="M69 63 Q75 57 81 63" fill="none" stroke="' + ink + '" stroke-width="3" stroke-linecap="round"/>' + lash(true) + '</g>';
      case 'shock':   return open(5.6, 6.8);
      default:        return open(4.4, 5.4);
    }
  }

  function brows(mood, color) {
    var s = 'fill="none" stroke="' + (color || '#7a4a1c') + '" stroke-width="2.6" stroke-linecap="round"';
    if (mood === 'angry') return '<path d="M37 51 L51 55" ' + s + '/><path d="M83 51 L69 55" ' + s + '/>';
    if (mood === 'sad')   return '<path d="M38 54 L50 50" ' + s + '/><path d="M82 54 L70 50" ' + s + '/>';
    if (mood === 'think') return '<path d="M39 51 Q45 48 51 51" ' + s + '/><path d="M69 49 Q75 45 81 49" ' + s + '/>';
    return '';
  }

  function mouth(mood) {
    var s = 'fill="none" stroke="#6b3a17" stroke-width="2.6" stroke-linecap="round"';
    switch (mood) {
      case 'excited':
      case 'cheer':  return '<path d="M52 85 Q60 96 68 85 Z" fill="#7a2e14"/><path d="M55 89 Q60 93 65 89" fill="#ff8a8a"/>';
      case 'sad':    return '<path d="M53 90 Q60 84 67 90" ' + s + '/>';
      case 'angry':  return '<path d="M53 89 Q60 85 67 89" ' + s + '/>';
      case 'shock':  return '<ellipse cx="60" cy="88" rx="4" ry="5" fill="#7a2e14"/>';
      case 'think':  return '<path d="M55 88 L66 86" ' + s + '/>';
      case 'sleepy': return '<ellipse cx="60" cy="88" rx="2.6" ry="2" fill="#7a2e14"/>';
      default:       return '<path d="M53 86 Q60 92 67 86" ' + s + '/>';
    }
  }

  function extras(mood) {
    switch (mood) {
      case 'sad':    return '<path class="m-tear" d="M84 66 Q87 72 84 75 Q81 72 84 66 Z" fill="#6cc4ff"/>';
      case 'angry':  return '<g class="m-steam" fill="none" stroke="#ff6b4a" stroke-width="2.4" stroke-linecap="round"><path d="M18 40 q-4 -6 0 -12"/><path d="M102 40 q4 -6 0 -12"/></g>';
      case 'sleepy': return '<g class="m-zzz" fill="#7a8cff" font-family="Nunito,Arial,sans-serif" font-weight="900"><text x="92" y="36" font-size="13">z</text><text x="101" y="25" font-size="9">z</text></g>';
      case 'think':  return '<text class="m-q" x="94" y="38" font-size="20" font-weight="900" fill="#7a8cff" font-family="Nunito,Arial,sans-serif">?</text>';
      case 'excited':
      case 'cheer':  return '<g class="m-spark" fill="#ffd23f"><path d="M14 46 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 Z"/><path d="M100 30 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 Z"/></g>';
      default:       return '';
    }
  }

  // Lulu's tangerine. Wrapped in .m-fruit so it wobbles.
  function tangerine(id) {
    return '<g class="m-fruit">' +
      '<circle cx="60" cy="24" r="12" fill="url(#' + id + 'f)"/>' +
      '<ellipse cx="55.5" cy="19.5" rx="3.6" ry="2.2" fill="#fff" opacity=".45"/>' +
      '<path d="M60 13 L60 9" stroke="#5b8a2b" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M60 11 C64 4 72 5 74 8 C70 12 64 13 60 11 Z" fill="#5fb84a"/>' +
    '</g>';
  }

  function heartClip(fill) {
    return '<path d="M44 34 C44 31 48 30.5 49 33 C50 30.5 54 31 54 34 C54 37 49 40 49 40 C49 40 44 37 44 34 Z" fill="' + fill + '"/>';
  }

  function flowerAt(cx, cy, r, petal, center) {
    var out = '';
    for (var k = 0; k < 5; k++) {
      var t = (k * 72 - 90) * Math.PI / 180;
      out += '<circle cx="' + (cx + Math.cos(t) * r * 1.25).toFixed(1) + '" cy="' + (cy + Math.sin(t) * r * 1.25).toFixed(1) + '" r="' + r + '" fill="' + petal + '"/>';
    }
    return out + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * .75).toFixed(1) + '" fill="' + center + '"/>';
  }

  // Lumi's head piece (A = accent light/main/dark; id+'f' is a gradient in
  // the accent colour). Wrapped in .m-fruit so it wobbles like the tangerine.
  function lumiHat(hat, A, id) {
    var grad = 'url(#' + id + 'f)';
    switch (hat) {
      case 'flower':
        return '<g class="m-fruit">' +
          '<path d="M62 37 C62 31 66 28 70 29 C69 33 66 36 62 37 Z" fill="#5fb84a"/>' +
          flowerAt(73, 29, 6, A[1], '#ffd23f') +
          flowerAt(47, 34, 3, '#fff', A[0]) +
        '</g>';
      case 'beret':
        return '<g class="m-fruit">' +
          '<path d="M30 39 C27 27 50 18 71 19 C88 20 94 28 88 34 C80 40 46 43 30 39 Z" fill="' + grad + '"/>' +
          '<path d="M33 39 Q60 45 86 35" fill="none" stroke="' + A[2] + '" stroke-width="2.6" stroke-linecap="round"/>' +
          '<path d="M64 19 L65 13" stroke="' + A[2] + '" stroke-width="3" stroke-linecap="round"/>' +
          '<ellipse cx="50" cy="25" rx="6" ry="2.2" fill="#fff" opacity=".35" transform="rotate(-12 50 25)"/>' +
        '</g>';
      case 'strawberry':
        return '<g class="m-fruit">' +
          '<path d="M74 22 C82 22 85 28 83 34 C81 40 76 44 74 44 C72 44 67 40 65 34 C63 28 66 22 74 22 Z" fill="#ff4b5c"/>' +
          '<g fill="#ffe08a"><ellipse cx="70" cy="30" rx=".9" ry="1.3"/><ellipse cx="77" cy="29" rx=".9" ry="1.3"/><ellipse cx="73.5" cy="35" rx=".9" ry="1.3"/><ellipse cx="79" cy="35" rx=".9" ry="1.3"/><ellipse cx="69.5" cy="37" rx=".9" ry="1.3"/><ellipse cx="74" cy="40.5" rx=".9" ry="1.3"/></g>' +
          '<path d="M66 23 L70 20 L71 15.5 L74 19.5 L77.5 15.5 L78 20.5 L83 22 L77 25 L71 25 Z" fill="#4fb848"/>' +
          '<ellipse cx="69" cy="27" rx="1.8" ry="1" fill="#fff" opacity=".55"/>' +
          heartClip(A[1]) +
        '</g>';
      case 'crown':
        return '<g class="m-fruit">' +
          '<path d="M42 31 L45 13 L53 23 L60 8 L67 23 L75 13 L78 31 Z" fill="#ffcf3a" stroke="#c98a00" stroke-width="1.4" stroke-linejoin="round"/>' +
          '<path d="M42 31 L78 31" stroke="#c98a00" stroke-width="2.4" stroke-linecap="round"/>' +
          '<circle cx="60" cy="25" r="2.8" fill="#ff5d8f"/><circle cx="50" cy="27" r="1.9" fill="#4aa8f0"/><circle cx="70" cy="27" r="1.9" fill="#3fc493"/>' +
          '<circle cx="45" cy="13" r="1.8" fill="#fff3b0"/><circle cx="60" cy="8" r="1.8" fill="#fff3b0"/><circle cx="75" cy="13" r="1.8" fill="#fff3b0"/>' +
        '</g>';
      case 'nightcap':
        return '<g class="m-fruit">' +
          '<path d="M33 39 C36 24 52 17 66 18 C84 19 98 30 105 49 C96 41 89 38 86 37 Q60 31 33 39 Z" fill="' + grad + '"/>' +
          '<g fill="#fff" opacity=".55"><circle cx="52" cy="26" r="1.6"/><circle cx="72" cy="24" r="1.3"/><circle cx="86" cy="31" r="1.4"/><circle cx="62" cy="31" r="1.1"/></g>' +
          '<path d="M32 40 Q60 31 88 38" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' +
          '<circle cx="105" cy="50" r="5" fill="#fff"/>' +
        '</g>';
      default: // bow
        return '<g class="m-fruit">' +
          '<g transform="rotate(14 72 31)">' +
            '<path d="M72 31 C64 19 51 21 53 31 C55 41 65 39 72 31 Z" fill="' + grad + '"/>' +
            '<path d="M72 31 C80 19 93 21 91 31 C89 41 79 39 72 31 Z" fill="' + grad + '"/>' +
            '<path d="M70 33 L65 43 L69 41.5 L71 45 Z" fill="' + A[2] + '"/><path d="M74 33 L79 43 L75 41.5 L73 45 Z" fill="' + A[2] + '"/>' +
            '<ellipse cx="59" cy="27" rx="3" ry="1.8" fill="#fff" opacity=".5"/>' +
            '<circle cx="72" cy="31" r="4.6" fill="' + A[0] + '" stroke="' + A[2] + '" stroke-width="1.4"/>' +
          '</g>' +
          heartClip(A[1]) +
        '</g>';
    }
  }

  function lumiEars(item, A) {
    if (item === 'headphones') {
      return '<path d="M23 62 C21 16 99 16 97 62" fill="none" stroke="' + A[2] + '" stroke-width="5" stroke-linecap="round"/>' +
        '<rect x="14" y="51" width="14" height="23" rx="6.5" fill="' + A[1] + '"/><rect x="92" y="51" width="14" height="23" rx="6.5" fill="' + A[1] + '"/>' +
        '<rect x="17" y="55" width="5" height="15" rx="2.5" fill="#fff" opacity=".45"/><rect x="98" y="55" width="5" height="15" rx="2.5" fill="#fff" opacity=".45"/>';
    }
    if (item === 'pencil') { // tucked behind the left ear (the hat sits right)
      return '<g transform="translate(120 0) scale(-1 1)"><g transform="rotate(-32 92 34)">' +
        '<rect x="77" y="31" width="23" height="6" rx="1" fill="#ffd23f" stroke="#c98a00" stroke-width=".8"/>' +
        '<path d="M100 31 L106 34 L100 37 Z" fill="#f5d6a8"/><path d="M104.2 33.1 L106 34 L104.2 34.9 Z" fill="#3b2716"/>' +
        '<rect x="74" y="31" width="4" height="6" rx="1" fill="' + A[0] + '"/></g></g>';
    }
    return '';
  }

  function lumiFace(item, A) {
    if (item !== 'glasses') return '';
    return '<g fill="#fff" fill-opacity=".2" stroke="' + A[2] + '" stroke-width="2.2"><circle cx="45" cy="62" r="9.5"/><circle cx="75" cy="62" r="9.5"/></g>' +
      '<g fill="none" stroke="' + A[2] + '" stroke-width="2.2" stroke-linecap="round"><path d="M54.5 61 Q60 57.5 65.5 61"/><path d="M35.5 60 L24 56"/><path d="M84.5 60 L96 56"/></g>';
  }

  // opts.who: 'lulu' (default) | 'lumi'.
  // opts.outfit (Lumi only): overrides on top of lumiOutfit(), e.g. { hat: 'crown' }.
  function svg(mood, opts) {
    mood = mood || 'happy';
    opts = opts || {};
    var who = opts.who === 'lumi' ? 'lumi' : 'lulu';
    var O = who === 'lumi' ? lumiOutfit(opts.outfit) : null;
    var L = O ? LUMI_FUR[O.fur] || LUMI_FUR.hong : LULU_LOOK;
    var A = O ? LUMI_ACCENT[O.accent] || LUMI_ACCENT.hong : null;
    var id = 'm' + (++uid);
    var cheek = mood === 'angry' ? '.7' : who === 'lumi' ? '.55' : '.42';
    var hat = O
      ? '<linearGradient id="' + id + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + A[0] + '"/><stop offset="1" stop-color="' + A[1] + '"/></linearGradient>'
      : '<radialGradient id="' + id + 'f" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#ffb35c"/><stop offset="1" stop-color="#ff6a13"/></radialGradient>';
    return '<svg class="dan-svg is-' + who + ' mood-' + esc(mood) + (opts.cls ? ' ' + esc(opts.cls) : '') + '" viewBox="0 0 120 128" ' +
      'role="img" aria-label="' + esc(opts.label || (who === 'lumi' ? 'Lumi' : 'Lulu')) + '" data-eyes>' +
      '<defs>' +
        '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + L.body[0] + '"/><stop offset=".55" stop-color="' + L.body[1] + '"/><stop offset="1" stop-color="' + L.body[2] + '"/></linearGradient>' +
        '<linearGradient id="' + id + 'm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + L.muzzle[0] + '"/><stop offset="1" stop-color="' + L.muzzle[1] + '"/></linearGradient>' +
        hat +
      '</defs>' +
      '<g class="m-body">' +
        // arms (behind body)
        '<ellipse class="m-arm m-arm-l" cx="25" cy="94" rx="8" ry="11" fill="' + L.arm + '"/>' +
        '<ellipse class="m-arm m-arm-r" cx="95" cy="94" rx="8" ry="11" fill="' + L.arm + '"/>' +
        // ears
        '<g fill="' + L.ear + '"><ellipse cx="33" cy="38" rx="8" ry="7.5"/><ellipse cx="87" cy="38" rx="8" ry="7.5"/></g>' +
        '<g fill="' + L.earIn + '"><ellipse cx="33" cy="39" rx="4.2" ry="4"/><ellipse cx="87" cy="39" rx="4.2" ry="4"/></g>' +
        // body / head — one round loaf
        '<path d="M20 76 C20 46 37 31 60 31 C83 31 100 46 100 76 C100 104 84 116 60 116 C36 116 20 104 20 76 Z" fill="url(#' + id + 'b)"/>' +
        // big capybara muzzle
        '<ellipse cx="60" cy="86" rx="27" ry="19" fill="url(#' + id + 'm)"/>' +
        '<g fill="' + L.nose + '"><ellipse cx="53" cy="79" rx="2.3" ry="1.7"/><ellipse cx="67" cy="79" rx="2.3" ry="1.7"/></g>' +
        // cheeks
        '<g fill="' + L.cheek + '" opacity="' + cheek + '"><ellipse cx="33" cy="76" rx="6" ry="3.6"/><ellipse cx="87" cy="76" rx="6" ry="3.6"/></g>' +
        eyes(mood, !!O) + brows(mood, L.brow) + mouth(mood) +
        (O ? lumiEars(O.ears, A) + lumiFace(O.face, A) + lumiHat(O.hat, A, id) : tangerine(id)) +
      '</g>' +
      extras(mood) +
      '</svg>';
  }

  // Lumi's face next to Lulu's — she mirrors him, but comforts instead of
  // sulking along when he's angry.
  var LUMI_MOOD = { cheer: 'cheer', excited: 'excited', happy: 'wink', wink: 'happy', think: 'think', sad: 'sad', angry: 'shock', shock: 'shock', sleepy: 'sleepy' };
  function lumiMoodFor(mood) { return LUMI_MOOD[mood] || 'happy'; }

  // The couple side by side (Lulu left, Lumi right, a heart floating
  // between them). Sized by the host's width.
  // opts.lumiOutfit: overrides for Lumi's outfit (e.g. { hat: 'crown' }).
  function duoHtml(mood, opts) {
    opts = opts || {};
    var heart = (LUMI_ACCENT[lumiOutfit(opts.lumiOutfit).accent] || LUMI_ACCENT.hong)[1];
    return '<span class="pf-duo">' +
      '<span class="pf-duo-lulu">' + svg(mood, { label: 'Lulu' }) + '</span>' +
      '<span class="pf-duo-lumi">' + svg(opts.lumiMood || lumiMoodFor(mood), { who: 'lumi', label: 'Lumi', outfit: opts.lumiOutfit }) + '</span>' +
      (opts.heart === false ? '' : '<svg class="pf-duo-heart" viewBox="0 0 20 18" aria-hidden="true"><path d="M10 17 C10 17 1 11.5 1 5.6 C1 2.6 3.4 1 5.6 1 C7.6 1 9.2 2.2 10 3.8 C10.8 2.2 12.4 1 14.4 1 C16.6 1 19 2.6 19 5.6 C19 11.5 10 17 10 17 Z" fill="' + heart + '"/></svg>') +
    '</span>';
  }

  // Old emoji/mood vocabulary → mascot mood (dashboard streak banner).
  function moodForStreak(streak) {
    if (streak >= 14) return 'excited';
    if (streak >= 3) return 'happy';
    if (streak >= 1) return 'wink';
    return 'sad';
  }

  function mount(el, mood, opts) {
    if (!el) return;
    el.innerHTML = svg(mood, opts);
    el.classList.add('dan-host');
  }

  /* ══════════════════════════════════════════════════════════════════
     EYES FOLLOW THE POINTER
     ══════════════════════════════════════════════════════════════════ */
  var _eyeRaf = 0, _px = -1, _py = -1;
  function updateEyes() {
    _eyeRaf = 0;
    var nodes = document.querySelectorAll('[data-eyes]');
    for (var i = 0; i < nodes.length; i++) {
      var svgEl = nodes[i];
      var pupils = svgEl.querySelectorAll('.m-pupils, .eye-pupil');
      if (!pupils.length) continue;
      var r = svgEl.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > window.innerHeight) continue;
      var dx = _px - (r.left + r.width / 2), dy = _py - (r.top + r.height / 2);
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var k = Math.min(1, d / 260);
      var max = svgEl.classList.contains('dan-svg') ? 2.2 : 5;
      var tx = (dx / d) * max * k, ty = (dy / d) * max * k;
      for (var j = 0; j < pupils.length; j++) {
        pupils[j].setAttribute('transform', 'translate(' + tx.toFixed(2) + ' ' + ty.toFixed(2) + ')');
      }
    }
  }
  if (!REDUCED) {
    document.addEventListener('pointermove', function (e) {
      _px = e.clientX; _py = e.clientY;
      if (!_eyeRaf) _eyeRaf = requestAnimationFrame(updateEyes);
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════════════════════════
     TEST CARD LABEL
     ══════════════════════════════════════════════════════════════════ */
  var TestCardArt = {
    label: function (t) {
      var name = (t && t.name) || '';
      var m = /test\s*(\d+)/i.exec(name);
      if (m) return 'TEST ' + m[1];
      if (name.length <= 12) return esc(name.toUpperCase());
      return '<span class="tid-title-sm">' + esc(name) + '</span>';
    },
  };

  /* ══════════════════════════════════════════════════════════════════
     REACTIONS — Lulu on result screens / leaderboards
     Mascot.react(host, { pct | band, text?, size?, compact?, stacked? }) fills host
     with Lulu (mood picked from the score) + a speech bubble. Without
     `text` a line for that score tier is picked. Mascot.reactHtml(opts) gives
     the same markup as a string.
     Mascot.cheer(pct, text?) makes the corner dock Lulu say it and hop.
     ══════════════════════════════════════════════════════════════════ */
  var TIERS = [
    { min: 90, mood: 'cheer', lines: [
      'Đỉnh của chóp! Lulu tự hào về cậu quá 🥳',
      'Gần như tuyệt đối luôn! Cứ giữ phong độ này nha 🍊✨',
      'Xuất sắc! Lulu phải nhảy múa ăn mừng mới được 🎉',
    ], lumi: [
      'Woaa giỏi xỉu! Lumi với Lulu đang nhảy cẫng lên đây nè 💖',
      'Điểm đẹp như hoa luôn! Lumi thưởng cậu một trái tim nè 💕',
      'Cậu làm Lumi hãnh diện ghê á! Ăn mừng thôi 🎀🎉',
    ] },
    { min: 75, mood: 'excited', lines: [
      'Làm tốt lắm! Chỉ còn xíu nữa là hoàn hảo 💪',
      'Giỏi quá trời! Xem lại mấy câu sai là lên level liền 🚀',
      'Ngon lành! Lulu thấy cậu tiến bộ rõ luôn 😍',
    ], lumi: [
      'Tuyệt lắm nha! Lumi thấy cậu cố gắng nhiều lắm đó 🌸',
      'Sắp chạm tới đỉnh rồi, cố thêm xíu xiu nữa thôi 💗',
    ] },
    { min: 55, mood: 'happy', lines: [
      'Khá ổn rồi đó! Ôn lại phần sai để lần sau cao hơn nha 😊',
      'Đang đi đúng hướng nè — cố thêm chút nữa thôi!',
      'Ổn áp! Lulu ở đây cổ vũ cậu nè 🍊',
    ], lumi: [
      'Ổn rồi nè! Xem lại câu sai với Lumi là lần sau cao hơn liền 🌷',
      'Cậu đang tiến bộ từng ngày đó, Lumi thấy hết nha 😊',
    ] },
    { min: 35, mood: 'think', lines: [
      'Hmm, bài này hơi khó nhỉ… Xem lại đáp án cùng Lulu nha 🤔',
      'Chưa sao đâu — hiểu vì sao sai là đã tiến bộ rồi!',
      'Chậm mà chắc nha, lần sau sẽ khá hơn 💛',
    ], lumi: [
      'Không sao đâu, Lumi với Lulu cùng ôn lại với cậu nha 🤍',
      'Sai để học mà — mình xem đáp án từ từ nè 🌼',
    ] },
    { min: 0, mood: 'sad', lines: [
      'Huhu, lần này chưa may rồi 😢 Nghỉ xíu rồi thử lại nha, Lulu tin cậu!',
      'Ai cũng có ngày "lag" mà — ôn lại rồi làm lại, chắc chắn sẽ khá hơn 💛',
      'Đừng buồn nha, Lulu ôm một cái 🤗 Mình làm lại từ từ thôi!',
    ], lumi: [
      'Lumi ôm cậu một cái nè 🤗 Nghỉ xíu rồi mình làm lại nha!',
      'Hôm nay chưa may thôi, Lumi tin lần sau cậu làm tốt hơn 💗',
    ] },
  ];

  // IELTS band → the same 0–100 scale the tiers use.
  function bandToPct(band) {
    var b = Number(band) || 0;
    return b >= 8 ? 95 : b >= 7 ? 80 : b >= 6 ? 62 : b >= 5 ? 45 : 20;
  }

  function tierFor(opts) {
    var pct = opts.band != null ? bandToPct(opts.band) : Number(opts.pct) || 0;
    for (var i = 0; i < TIERS.length; i++) if (pct >= TIERS[i].min) return TIERS[i];
    return TIERS[TIERS.length - 1];
  }

  function moodForScore(pct) { return tierFor({ pct: pct }).mood; }

  function lineFor(tier, who) {
    var pool = who === 'lumi' ? tier.lumi : tier.lines;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Who says the line: Lulu when the page's text names him ("Lulu tự hào…"),
  // Lumi when it names her, otherwise either of them.
  function speakerFor(opts) {
    if (opts.who === 'lulu' || opts.who === 'lumi') return opts.who;
    if (opts.text != null) {
      if (/Lulu/.test(opts.text)) return 'lulu';
      if (/Lumi/.test(opts.text)) return 'lumi';
    }
    return Math.random() < 0.5 ? 'lumi' : 'lulu';
  }

  // Same markup as react(), as a string — for pages that build their result
  // screen with template literals. opts.solo: Lulu alone (no Lumi).
  function reactHtml(opts) {
    opts = opts || {};
    var tier = tierFor(opts);
    var mood = opts.mood || tier.mood;
    var who = opts.solo ? 'lulu' : speakerFor(opts);
    var text = opts.text != null ? String(opts.text) : lineFor(tier, who);
    var name = who === 'lumi' ? 'Lumi 🎀' : 'Lulu 🍊';
    return '<div class="lulu-react' + (opts.solo ? '' : ' is-duo') + (opts.compact ? ' is-compact' : '') + (opts.stacked ? ' is-stacked' : '') + '"' +
        (opts.size ? ' style="--lr-size:' + Number(opts.size) + 'px"' : '') + '>' +
        '<div class="lr-mascot">' + (opts.solo ? svg(mood, { label: 'Lulu' }) : duoHtml(mood, { lumiOutfit: tier.min >= 90 ? { hat: 'crown' } : null })) + '</div>' +
        (text ? '<div class="lr-bubble lr-by-' + who + '" role="status">' +
          (opts.solo ? '' : '<span class="lr-who">' + name + '</span>') + esc(text) + '</div>' : '') +
      '</div>';
  }

  function react(host, opts) {
    if (!host) return null;
    host.classList.add('lulu-react-host');
    host.innerHTML = reactHtml(opts);
    return true;
  }

  function cheer(pct, text) {
    if (!dock) return;
    var tier = tierFor({ pct: pct });
    var who = speakerFor({ text: text });
    say(text || lineFor(tier, who), tier.mood, who);
    if (tier.min >= 75) hop();
  }

  /* ══════════════════════════════════════════════════════════════════
     MASCOT DOCK
     ══════════════════════════════════════════════════════════════════ */
  var HIDE_KEY = 'ews_mascot_hidden_day';

  var TIPS = {
    listening: [
      'Đọc trước câu hỏi trong 30 giây — gạch chân từ khoá nha!',
      'Nghe số điện thoại, ngày tháng: viết ngay, đừng đợi nghe hết câu.',
      'Đáp án hay bị "bẫy" bằng but, actually, no wait... nghe kỹ đoạn sửa lại nhé.',
      'Chú ý số ít / số nhiều — thiếu "s" là mất điểm đó!',
    ],
    reading: [
      'Đọc câu hỏi trước, rồi skim bài để tìm vị trí thông tin.',
      'TRUE/FALSE/NOT GIVEN: đừng dùng kiến thức bên ngoài bài nha!',
      'Mỗi passage khoảng 20 phút thôi — câu khó để sau.',
      'Matching headings: đọc câu đầu và câu cuối của đoạn trước.',
    ],
    writing: [
      'Task 2: 5 phút lập dàn ý giúp bài mạch lạc hơn hẳn.',
      'Mỗi đoạn một ý chính + giải thích + ví dụ nhé!',
      'Đọc lại bài 2–3 phút cuối để sửa lỗi ngữ pháp.',
    ],
    speaking: [
      'Part 2: dùng 1 phút chuẩn bị để ghi từ khoá, đừng viết cả câu.',
      'Nói chậm mà rõ còn hơn nhanh mà vấp nha.',
      'Mở rộng câu trả lời: lý do + ví dụ + cảm nhận.',
    ],
    dashboard: [
      'Học đủ từ mục tiêu mỗi ngày để giữ chuỗi lửa 🔥',
      'Từ hay sai nằm ở nút "Ôn lại từ hay sai" đó!',
      'Ôn lại từ cũ quan trọng không kém học từ mới.',
    ],
    _: [
      'Mỗi ngày một chút, đều đặn là sẽ lên band!',
      'Tớ tin cậu làm được! 💪',
      'Mệt thì nghỉ 5 phút rồi học tiếp nha.',
      'Sai là bình thường — quan trọng là xem lại vì sao sai.',
    ],
  };

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function pickTip() { return pick(TIPS[pageKey()].concat(TIPS._)); }

  /* ── Lumi's personality ───────────────────────────────────────────────
     Gentle and caring (water, posture, sleep), a little điệu (loves her
     outfits and strawberries), a "cô giáo nhỏ" who nitpicks grammar, and
     she teases Lulu — who always has a comeback. */
  var LUMI_SAYS = {
    care: [
      'Uống miếng nước rồi học tiếp nha 💧',
      'Học xong nhớ tự khen bản thân một câu nè 💖',
      'Hít thở sâu, đọc chậm lại một xíu là thấy dễ hơn liền 🌸',
      'Mỗi ngày tiến một bước nhỏ thôi cũng giỏi lắm rồi 🌷',
      'Ngồi thẳng lưng lên nào, học lâu dễ mỏi lắm đó 🤍',
      'Học 25 phút thì nghỉ 5 phút nha, não cũng cần ăn dâu tây nữa 🍓',
    ],
    teacher: [
      'Lumi soi nè: he/she/it thì động từ nhớ thêm -s nha 🧐',
      'Make a decision chứ không phải do a decision đâu nha 🎀',
      'Nhớ phân biệt its với it\'s nha, Lumi bắt lỗi này hoài á 😤',
      'Viết "In conclusion" xong đừng thêm ý mới nha, Lumi trừ điểm đó 🙅‍♀️',
      'Data là số nhiều đó nha: "the data show" mới xịn 🤓',
      'Information không đếm được, đừng thêm -s nha, Lumi soi kỹ lắm 🔍',
    ],
    girly: [
      'Hôm nay Lumi điệu hông? Lulu khen rồi đó nha 💅',
      'Lumi mê dâu tây nhất trên đời, nhì là học sinh chăm chỉ 🍓💕',
      'Bí mật nè: Lulu toàn lén ăn quýt trong giờ học 🤫🍊',
    ],
    listening: ['Đeo tai nghe vô nè, Lumi nghe cùng cậu 🎧', 'Nghe tới đâu ghi chú tới đó nha, Lumi ghi bằng bút hồng 🩷'],
    reading: ['Lumi đeo kính rồi, mình cùng soi từ khoá nha 🤓', 'Gạch chân từ khoá đi, Lumi thích tô màu lắm 🖍'],
    writing: ['Viết xong đọc lại nha, Lumi soi lỗi chính tả kỹ lắm đó 🧐', 'Câu dài quá thì cắt làm đôi cho rõ ý nha ✂️'],
    speaking: ['Nói to rõ lên nè, Lumi đang nghe nè 🎙', 'Nói sai thì sửa lại tự nhiên thôi, giám khảo không trừ đâu 💗'],
    dashboard: ['Hôm nay cậu học được mấy từ rồi? Kể Lumi nghe với 💕', 'Giữ chuỗi lửa đi, Lumi với Lulu cổ vũ nè 🔥'],
  };

  // Lumi starts, Lulu answers.
  var BANTER = [
    [['lumi', 'Lulu ơi, học xong bài này mình đi ăn dâu nha 🍓', 'excited'], ['lulu', 'Đi liền! Tớ mang theo quýt nữa 🍊', 'wink']],
    [['lumi', 'Lulu có thấy bạn học sinh này chăm hông?', 'happy'], ['lulu', 'Chăm xỉu! Tớ khoe với cả xóm rồi 😎', 'excited']],
    [['lumi', 'Lulu lại ngủ gật lúc nghe Listening hả? 😤', 'shock'], ['lulu', 'Đâu có… tớ nhắm mắt để nghe kỹ hơn thôi 😴', 'sleepy']],
    [['lumi', 'Lulu, "information" có -s không?', 'think'], ['lulu', 'Ờ… có… à không! Không đếm được! 😅', 'shock']],
    [['lumi', 'Lulu thương Lumi nhiều không?', 'wink'], ['lulu', 'Nhiều hơn cả band 9 luôn 🥹💕', 'excited']],
  ];

  var LULU_COMPLIMENTS = ['Xinh xỉu luôn á 😍', 'Đẹp hơn cả quả quýt của tớ luôn 🥹', 'Ai cho Lumi xinh dữ vậy trời 🫣'];

  // Lumi chiming in after one of Lulu's tips.
  var LUMI_CHIME = [
    'Lulu nói đúng đó, nghe Lulu nha 💕',
    'Ủa Lulu học câu này ở đâu vậy, giỏi ghê 😳',
    'Lumi bổ sung: nhớ ghi chú lại nha 📝',
  ];

  function lumiLine() {
    var key = pageKey();
    var pool = LUMI_SAYS.care.concat(LUMI_SAYS.teacher, LUMI_SAYS.girly);
    if (LUMI_SAYS[key]) pool = pool.concat(LUMI_SAYS[key], LUMI_SAYS[key]); // weight the page's own lines
    return pick(pool);
  }

  function firstName() {
    var name = '';
    try { name = ((window.AuthService && window.AuthService.getUser()) || {}).name || ''; } catch (e) {}
    return String(name).trim().split(/\s+/).pop() || 'bạn';
  }

  function greeting() {
    var h = new Date().getHours();
    var hi = h < 11 ? 'Chào buổi sáng' : h < 14 ? 'Trưa rồi' : h < 18 ? 'Chào buổi chiều' : 'Tối rồi';
    return hi + ', ' + firstName() + '! Tớ là Lulu 🍊';
  }

  function lumiGreeting() {
    var h = new Date().getHours(), n = firstName();
    if (h >= 23 || h < 5) return 'Khuya lắm rồi đó ' + n + '! Học xong bài này đi ngủ nha, thức khuya xấu da lắm 😤🌙';
    if (h < 11) return 'Chào buổi sáng ' + n + '! Lumi vừa ăn sáng bằng dâu tây nè 🍓 Tớ là Lumi, bạn gái của Lulu đó 🎀';
    if (h < 14) return 'Trưa rồi ' + n + ' ơi, ăn cơm chưa? Ăn no rồi mới học nha 🍱 Tớ là Lumi nè 🎀';
    if (h < 18) return 'Chiều nay học cùng Lumi nha ' + n + '! Tớ là bạn gái của Lulu đó 🎀';
    return 'Tối rồi nè ' + n + ', học chút rồi nghỉ sớm nha 🌙 Tớ là Lumi, bạn gái của Lulu 🎀';
  }

  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  var dock = null, bubbleTimer = 0, moodTimers = {}, clicks = 0, lumiClicks = 0, talkTimers = [];

  var DOCK_LABEL = {
    lulu: 'Lulu — bấm để nghe mẹo học',
    lumi: 'Lumi — bấm để nghe Lumi nói',
  };

  // who: 'lulu' (default) | 'lumi'.
  function setMood(mood, ms, who) {
    if (!dock) return;
    who = who === 'lumi' ? 'lumi' : 'lulu';
    var host = dock.querySelector('.ews-md-' + who);
    if (!host) return;
    host.innerHTML = svg(mood, { who: who, label: DOCK_LABEL[who] });
    clearTimeout(moodTimers[who]);
    if (ms) moodTimers[who] = setTimeout(function () { setMood('happy', 0, who); }, ms);
  }

  function say(text, mood, who) {
    if (!dock) return;
    who = who === 'lumi' ? 'lumi' : 'lulu';
    var b = dock.querySelector('.ews-md-bubble');
    b.textContent = text;
    dock.classList.toggle('is-lumi-talking', who === 'lumi');
    dock.classList.add('is-talking');
    if (mood) setMood(mood, 5200, who);
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { if (dock) dock.classList.remove('is-talking'); }, 6000);
  }

  // A short back-and-forth: [[who, text, mood], …], one line every 2.8s.
  // A new click cancels whatever is still queued.
  function dialog(steps) {
    talkTimers.forEach(clearTimeout);
    talkTimers = steps.map(function (st, i) {
      return setTimeout(function () { say(st[1], st[2], st[0]); }, i * 2800);
    });
  }

  // Lumi puts on a new outfit (kept for the rest of the day, on every page).
  function changeOutfit() {
    var o = randomOutfit(baseOutfit());
    saveOutfit(o);
    var shown = lumiOutfit();
    paintAccent();
    dialog([
      ['lumi', 'Ta-da! Lumi thay đồ ' + LUMI_FUR[o.fur].name + ' với ' + HAT_NAMES[shown.hat] + ' nè, xinh hông? ✨', 'excited'],
      ['lulu', pick(LULU_COMPLIMENTS), 'excited'],
    ]);
    hop();
  }

  // The speech bubble takes Lumi's accent colour when she talks.
  function paintAccent() {
    if (!dock) return;
    var A = LUMI_ACCENT[lumiOutfit().accent] || LUMI_ACCENT.hong;
    dock.style.setProperty('--lumi-accent', A[2]);
  }

  // Both hop together.
  function hop(mood) {
    if (!dock) return;
    dock.classList.remove('is-hop');
    void dock.offsetWidth; // restart the animation
    dock.classList.add('is-hop');
    if (mood) { setMood(mood, 2400); setMood(lumiMoodFor(mood), 2400, 'lumi'); }
  }

  function buildDock() {
    if (dock || !document.getElementById('globalTopNav')) return;
    // Embedded copies (Entrance Test iframes) belong to the parent page.
    try { if (window.self !== window.top) return; } catch (e) { return; }
    try { if (localStorage.getItem(HIDE_KEY) === today()) return; } catch (e) {}
    dock = document.createElement('div');
    dock.id = 'ews-mascot-dock';
    dock.className = 'ews-mascot-dock';
    dock.innerHTML =
      '<div class="ews-md-bubble" role="status" aria-live="polite"></div>' +
      '<button type="button" class="ews-md-close" aria-label="Ẩn Lulu & Lumi hôm nay" title="Ẩn Lulu & Lumi hôm nay"><i class="fas fa-times"></i></button>' +
      '<button type="button" class="ews-md-mascot ews-md-lulu" aria-label="' + DOCK_LABEL.lulu + '"></button>' +
      '<button type="button" class="ews-md-mascot ews-md-lumi" aria-label="' + DOCK_LABEL.lumi + '"></button>';
    document.body.appendChild(dock);
    setMood('happy');
    setMood('happy', 0, 'lumi');
    paintAccent();

    dock.querySelector('.ews-md-lulu').addEventListener('click', function () {
      clicks++;
      if (clicks === 1) { dialog([['lulu', greeting(), 'excited']]); return; }
      if (clicks % 7 === 0) { dialog([['lulu', 'Ui da, cù lét tớ hoài! 🤭', 'wink']]); hop(); return; }
      var steps = [['lulu', pickTip(), ['happy', 'wink', 'think', 'excited'][clicks % 4]]];
      if (Math.random() < 0.3) steps.push(['lumi', pick(LUMI_CHIME), 'wink']);
      dialog(steps);
    });
    dock.querySelector('.ews-md-lumi').addEventListener('click', function () {
      lumiClicks++;
      if (lumiClicks === 1) { dialog([['lumi', lumiGreeting(), 'excited']]); setMood('excited', 2400); return; }
      // Poke her too often and Lulu steps in.
      if (lumiClicks % 6 === 0) {
        dialog([['lumi', 'Lulu ơi, có người cứ chọc tớ nè! 😳', 'shock'], ['lulu', 'Ai chọc Lumi của tớ đó?! 😤', 'angry']]);
        return;
      }
      if (lumiClicks % 4 === 0) { changeOutfit(); return; }
      if (lumiClicks % 3 === 0) { dialog(pick(BANTER)); return; }
      dialog([['lumi', lumiLine(), ['wink', 'happy', 'excited', 'think'][lumiClicks % 4]]]);
    });
    dock.querySelector('.ews-md-close').addEventListener('click', function () {
      try { localStorage.setItem(HIDE_KEY, today()); } catch (e) {}
      dock.classList.add('is-leaving');
      setTimeout(function () { if (dock) { dock.remove(); dock = null; } }, 400);
    });

    // A fresh page: peek in, then wave hello once.
    requestAnimationFrame(function () { dock && dock.classList.add('is-in'); });
    if (!REDUCED) {
      setTimeout(function () { if (dock) dock.classList.add('is-wave'); }, 1400);
      setTimeout(function () { if (dock) dock.classList.remove('is-wave'); }, 3200);
    }

    // Exams opened before the dock existed: respect nav.js's hidden state.
    var nav = document.getElementById('globalTopNav');
    if (nav && nav.style.display === 'none') dock.style.display = 'none';
  }

  // Cheer on success toasts (toast(msg, 'success') — js/shared/toast.js).
  function wrapToast() {
    var orig = window.toast;
    if (typeof orig !== 'function' || orig.__danWrapped) return;
    var wrapped = function (msg, type) {
      var r = orig.apply(this, arguments);
      try { if (type === 'success') hop('excited'); } catch (e) {}
      return r;
    };
    wrapped.__danWrapped = true;
    window.toast = wrapped;
  }

  /* ══════════════════════════════════════════════════════════════════
     SKILL CARDS — colourful tiles with a peeking creature whose eyes
     follow the pointer. Filled into any [data-skill-cards] container.
     ══════════════════════════════════════════════════════════════════ */
  var SKILLS = [
    { key: 'listening', href: 'listening.html', icon: 'fa-headphones', title: 'Listening', badge: 'Full đề',
      desc: 'Đề Cambridge giao diện như thi máy thật, audio phát 1 lần.' },
    { key: 'reading', href: 'reading.html', icon: 'fa-book-open', title: 'Reading', badge: 'Full đề',
      desc: '3 passages, 60 phút, chấm band ngay sau khi nộp.' },
    { key: 'speaking', href: 'speaking.html', icon: 'fa-comment-dots', title: 'Speaking', badge: 'Forecast',
      desc: 'Luyện nói theo forecast mới, ghi âm và nghe lại.' },
    { key: 'writing', href: 'writing.html', icon: 'fa-pen', title: 'Writing', badge: 'Task 1 · 2',
      desc: 'Viết Task 1 & Task 2, nhận chữa bài chi tiết.' },
    { key: 'mock', href: 'mock-test.html', icon: 'fa-graduation-cap', title: 'Mock Test', badge: '4 kỹ năng',
      desc: 'Thi thử trọn bộ 4 kỹ năng như ngày thi thật.' },
    { key: 'vocab', href: 'vocab-leaderboard.html', icon: 'fa-ranking-star', title: 'BXH Vocab', badge: 'Top 10',
      desc: 'Đua top chuỗi lửa và quiz từ vựng cùng cả lớp.' },
  ];

  function creature(kind) {
    var body, acc = '';
    var tint = 'fill="#fff" fill-opacity=".28"';
    switch (kind) {
      case 'speaking': // cloud
        body = '<path d="M28 130 L28 108 C22 84 34 66 52 66 C54 50 72 42 86 50 C94 38 116 38 124 52 C138 44 158 54 156 70 C172 72 180 90 174 108 L174 130 Z" ' + tint + '/>';
        break;
      case 'vocab': // two bumps
        body = '<path d="M14 130 L14 108 C14 70 40 52 70 56 C80 40 120 40 130 56 C160 52 186 70 186 108 L186 130 Z" ' + tint + '/>';
        break;
      default:
        body = '<path d="M20 130 L20 108 C20 64 56 40 100 40 C144 40 180 64 180 108 L180 130 Z" ' + tint + '/>';
    }
    if (kind === 'listening') acc = '<path d="M30 92 C30 34 170 34 170 92" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="7" stroke-linecap="round"/>' +
      '<rect x="22" y="80" width="16" height="26" rx="7" fill="#fff" fill-opacity=".7"/><rect x="162" y="80" width="16" height="26" rx="7" fill="#fff" fill-opacity=".7"/>';
    if (kind === 'reading') acc = '<path d="M100 42 C100 30 100 24 100 18" stroke="#c6f432" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M100 26 C88 12 72 16 70 22 C80 30 92 30 100 26 Z" fill="#c6f432"/><path d="M100 22 C110 8 128 10 130 16 C120 26 108 26 100 22 Z" fill="#a7d92a"/>';
    if (kind === 'writing') acc = '<path d="M84 44 C92 30 112 30 118 46" fill="none" stroke="#7a1f33" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>';
    if (kind === 'mock') acc = '<path d="M100 22 L140 36 L100 50 L60 36 Z" fill="#2b1b4d" fill-opacity=".75"/><path d="M80 43 L80 54 C92 60 108 60 120 54 L120 43" fill="#2b1b4d" fill-opacity=".75"/>' +
      '<path d="M140 36 L140 52" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/><circle cx="140" cy="54" r="4" fill="#ffd23f"/>';
    var eye = function (cx) {
      return '<ellipse cx="' + cx + '" cy="76" rx="16" ry="10" fill="#fff"/>' +
        '<g class="eye-pupil"><ellipse cx="' + (cx + 4) + '" cy="76" rx="8" ry="8.5" fill="#151515"/><circle cx="' + (cx + 6) + '" cy="73" r="2.2" fill="#fff"/></g>';
    };
    return '<svg viewBox="0 0 200 130" preserveAspectRatio="xMidYMax meet" aria-hidden="true" data-eyes>' +
      body + acc + '<g class="sk-eyes">' + eye(76) + eye(124) + '</g></svg>';
  }

  function renderSkillCards() {
    var hosts = document.querySelectorAll('[data-skill-cards]');
    for (var i = 0; i < hosts.length; i++) {
      hosts[i].innerHTML = SKILLS.map(function (s) {
        return '<a class="skill-card sk-' + s.key + '" href="' + s.href + '">' +
          '<span class="sk-spark s1" style="top:18px;right:18px">✦</span>' +
          '<span class="sk-spark s2" style="top:96px;right:30px">✦</span>' +
          '<span class="sk-spark s3" style="top:150px;left:12px">✦</span>' +
          '<span class="sk-ic"><i class="fas ' + s.icon + '"></i></span>' +
          '<span class="sk-title">' + esc(s.title) + '</span>' +
          '<span class="sk-desc">' + esc(s.desc) + '</span>' +
          '<span class="sk-creature">' + creature(s.key) + '<span class="sk-badge">' + esc(s.badge) + '</span></span>' +
          '</a>';
      }).join('');
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     PAGE DECORATIONS
     ══════════════════════════════════════════════════════════════════ */
  // Replace legacy 🐼 placeholders that some pages still print in markup.
  function swapPandas() {
    var map = { 'quit-mascot-emoji': 'sad', 'result-emoji': 'excited', 'dan-mascot': 'happy', 'mascot-panda': 'happy' };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && /🐼|🎉/.test(el.textContent)) mount(el, map[id]);
    });
  }

  // <div data-dan="excited">✅</div> → Lulu in that mood (the markup's own
  // content stays as the no-JS fallback).
  function mountDanSlots() {
    var slots = document.querySelectorAll('[data-dan]');
    for (var i = 0; i < slots.length; i++) {
      if (!slots[i].querySelector('.dan-svg')) mount(slots[i], slots[i].getAttribute('data-dan') || 'happy');
    }
  }

  // Lulu & Lumi peeking in the coloured list headers (Reading / Listening …).
  function decorateHeaders() {
    var h = document.querySelector('#screen-list .list-header');
    if (h && !h.querySelector('.lh-mascot')) {
      var m = document.createElement('div');
      m.className = 'lh-mascot';
      m.setAttribute('aria-hidden', 'true');
      m.innerHTML = duoHtml('happy');
      h.appendChild(m);
    }
  }

  // <div data-lulu-peek="wink"> … </div> → Lulu & Lumi sitting in that
  // block's top-right corner (page headers).
  function mountPeeks() {
    var hosts = document.querySelectorAll('[data-lulu-peek]');
    for (var i = 0; i < hosts.length; i++) {
      if (hosts[i].querySelector('.lulu-peek')) continue;
      var m = document.createElement('div');
      m.className = 'lulu-peek';
      m.setAttribute('aria-hidden', 'true');
      m.innerHTML = duoHtml(hosts[i].getAttribute('data-lulu-peek') || 'happy');
      hosts[i].insertBefore(m, hosts[i].firstChild);
    }
  }

  function init() {
    try { buildDock(); } catch (e) {}
    try { mountPeeks(); } catch (e) {}
    try { wrapToast(); } catch (e) {}
    try { swapPandas(); } catch (e) {}
    try { decorateHeaders(); } catch (e) {}
    try { renderSkillCards(); } catch (e) {}
    try { mountDanSlots(); } catch (e) {}
    document.documentElement.classList.add('pf-ready');
  }

  window.Mascot = {
    svg: svg, duo: duoHtml, mount: mount, moodForStreak: moodForStreak,
    moodForScore: moodForScore, react: react, reactHtml: reactHtml, cheer: cheer,
    say: function (t, m, who) { say(t, m, who); }, hop: function (m) { hop(m); },
    lumiOutfit: lumiOutfit,
  };
  window.TestCardArt = TestCardArt;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  // toast.js may load after us on some pages.
  window.addEventListener('load', function () { try { wrapToast(); } catch (e) {} });
})();
