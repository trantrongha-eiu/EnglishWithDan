/**
 * js/shared/playful.js — the student-side "playful" layer
 *
 *   • Mascot      — Lulu, our round capybara with a tangerine on its head
 *                   (inline SVG, several moods, blink / bob / look-at-cursor).
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

  // Eyes per mood. Pupils live in .m-pupils so the look-at-cursor code can
  // nudge them; closed / arc eyes have no pupils to move.
  function eyes(mood) {
    var ink = '#3b2716';
    var open = function (rx, ry) {
      return '<g class="m-eyes"><g class="m-pupils">' +
        '<ellipse cx="45" cy="62" rx="' + rx + '" ry="' + ry + '" fill="' + ink + '"/>' +
        '<ellipse cx="75" cy="62" rx="' + rx + '" ry="' + ry + '" fill="' + ink + '"/>' +
        '<circle cx="46.6" cy="59.6" r="1.7" fill="#fff"/><circle cx="76.6" cy="59.6" r="1.7" fill="#fff"/>' +
        '</g></g>';
    };
    var arc = '<g class="m-eyes" fill="none" stroke="' + ink + '" stroke-width="3" stroke-linecap="round">';
    switch (mood) {
      case 'excited': return arc + '<path d="M39 64 Q45 56 51 64"/><path d="M69 64 Q75 56 81 64"/></g>';
      case 'sleepy':  return arc + '<path d="M39 62 Q45 66 51 62"/><path d="M69 62 Q75 66 81 62"/></g>';
      case 'wink':    return '<g class="m-eyes"><g class="m-pupils"><ellipse cx="45" cy="62" rx="4.4" ry="5.4" fill="' + ink + '"/><circle cx="46.6" cy="59.6" r="1.6" fill="#fff"/></g>' +
                             '<path d="M69 63 Q75 57 81 63" fill="none" stroke="' + ink + '" stroke-width="3" stroke-linecap="round"/></g>';
      case 'shock':   return open(5.6, 6.8);
      default:        return open(4.4, 5.4);
    }
  }

  function brows(mood) {
    var s = 'fill="none" stroke="#7a4a1c" stroke-width="2.6" stroke-linecap="round"';
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

  function svg(mood, opts) {
    mood = mood || 'happy';
    opts = opts || {};
    var id = 'm' + (++uid);
    var cheek = mood === 'angry' ? '.7' : '.42';
    return '<svg class="dan-svg mood-' + esc(mood) + (opts.cls ? ' ' + esc(opts.cls) : '') + '" viewBox="0 0 120 128" ' +
      'role="img" aria-label="' + esc(opts.label || 'Lulu') + '" data-eyes>' +
      '<defs>' +
        '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd257"/><stop offset=".55" stop-color="#ffb534"/><stop offset="1" stop-color="#ff9420"/></linearGradient>' +
        '<linearGradient id="' + id + 'm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa634"/><stop offset="1" stop-color="#f58316"/></linearGradient>' +
        '<radialGradient id="' + id + 'f" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#ffb35c"/><stop offset="1" stop-color="#ff6a13"/></radialGradient>' +
      '</defs>' +
      '<g class="m-body">' +
        // arms (behind body)
        '<ellipse class="m-arm m-arm-l" cx="25" cy="94" rx="8" ry="11" fill="#ffad33"/>' +
        '<ellipse class="m-arm m-arm-r" cx="95" cy="94" rx="8" ry="11" fill="#ffad33"/>' +
        // ears
        '<g fill="#f5a020"><ellipse cx="33" cy="38" rx="8" ry="7.5"/><ellipse cx="87" cy="38" rx="8" ry="7.5"/></g>' +
        '<g fill="#e3871a"><ellipse cx="33" cy="39" rx="4.2" ry="4"/><ellipse cx="87" cy="39" rx="4.2" ry="4"/></g>' +
        // body / head — one round loaf
        '<path d="M20 76 C20 46 37 31 60 31 C83 31 100 46 100 76 C100 104 84 116 60 116 C36 116 20 104 20 76 Z" fill="url(#' + id + 'b)"/>' +
        // big capybara muzzle
        '<ellipse cx="60" cy="86" rx="27" ry="19" fill="url(#' + id + 'm)"/>' +
        '<g fill="#7a3e12"><ellipse cx="53" cy="79" rx="2.3" ry="1.7"/><ellipse cx="67" cy="79" rx="2.3" ry="1.7"/></g>' +
        // cheeks
        '<g fill="#ff6f6f" opacity="' + cheek + '"><ellipse cx="33" cy="76" rx="6" ry="3.6"/><ellipse cx="87" cy="76" rx="6" ry="3.6"/></g>' +
        eyes(mood) + brows(mood) + mouth(mood) +
        // tangerine hat
        '<g class="m-fruit">' +
          '<circle cx="60" cy="24" r="12" fill="url(#' + id + 'f)"/>' +
          '<ellipse cx="55.5" cy="19.5" rx="3.6" ry="2.2" fill="#fff" opacity=".45"/>' +
          '<path d="M60 13 L60 9" stroke="#5b8a2b" stroke-width="2.2" stroke-linecap="round"/>' +
          '<path d="M60 11 C64 4 72 5 74 8 C70 12 64 13 60 11 Z" fill="#5fb84a"/>' +
        '</g>' +
      '</g>' +
      extras(mood) +
      '</svg>';
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
    ] },
    { min: 75, mood: 'excited', lines: [
      'Làm tốt lắm! Chỉ còn xíu nữa là hoàn hảo 💪',
      'Giỏi quá trời! Xem lại mấy câu sai là lên level liền 🚀',
      'Ngon lành! Lulu thấy cậu tiến bộ rõ luôn 😍',
    ] },
    { min: 55, mood: 'happy', lines: [
      'Khá ổn rồi đó! Ôn lại phần sai để lần sau cao hơn nha 😊',
      'Đang đi đúng hướng nè — cố thêm chút nữa thôi!',
      'Ổn áp! Lulu ở đây cổ vũ cậu nè 🍊',
    ] },
    { min: 35, mood: 'think', lines: [
      'Hmm, bài này hơi khó nhỉ… Xem lại đáp án cùng Lulu nha 🤔',
      'Chưa sao đâu — hiểu vì sao sai là đã tiến bộ rồi!',
      'Chậm mà chắc nha, lần sau sẽ khá hơn 💛',
    ] },
    { min: 0, mood: 'sad', lines: [
      'Huhu, lần này chưa may rồi 😢 Nghỉ xíu rồi thử lại nha, Lulu tin cậu!',
      'Ai cũng có ngày "lag" mà — ôn lại rồi làm lại, chắc chắn sẽ khá hơn 💛',
      'Đừng buồn nha, Lulu ôm một cái 🤗 Mình làm lại từ từ thôi!',
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

  function lineFor(tier) { return tier.lines[Math.floor(Math.random() * tier.lines.length)]; }

  // Same markup as react(), as a string — for pages that build their result
  // screen with template literals.
  function reactHtml(opts) {
    opts = opts || {};
    var tier = tierFor(opts);
    var mood = opts.mood || tier.mood;
    var text = opts.text != null ? String(opts.text) : lineFor(tier);
    return '<div class="lulu-react' + (opts.compact ? ' is-compact' : '') + (opts.stacked ? ' is-stacked' : '') + '"' +
        (opts.size ? ' style="--lr-size:' + Number(opts.size) + 'px"' : '') + '>' +
        '<div class="lr-mascot">' + svg(mood, { label: 'Lulu' }) + '</div>' +
        (text ? '<div class="lr-bubble" role="status">' + esc(text) + '</div>' : '') +
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
    say(text || lineFor(tier), tier.mood);
    if (tier.min >= 75) hop();
  }

  /* ══════════════════════════════════════════════════════════════════
     MASCOT DOCK
     ══════════════════════════════════════════════════════════════════ */
  var HIDE_KEY = 'ews_mascot_hidden_day';
  var page = (location.pathname.split('/').pop() || '').replace('.html', '');

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

  function pickTip() {
    var key = /listening|dictation/.test(page) ? 'listening'
      : /reading/.test(page) ? 'reading'
      : /writing|task1|task2|grammar|sentences/.test(page) ? 'writing'
      : /speaking/.test(page) ? 'speaking'
      : /dashboard/.test(page) ? 'dashboard' : '_';
    var pool = TIPS[key].concat(TIPS._);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function greeting() {
    var h = new Date().getHours();
    var name = '';
    try { name = ((window.AuthService && window.AuthService.getUser()) || {}).name || ''; } catch (e) {}
    name = String(name).trim().split(/\s+/).pop() || 'bạn';
    var hi = h < 11 ? 'Chào buổi sáng' : h < 14 ? 'Trưa rồi' : h < 18 ? 'Chào buổi chiều' : 'Tối rồi';
    return hi + ', ' + name + '! Tớ là Lulu 🍊';
  }

  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  var dock = null, bubbleTimer = 0, moodTimer = 0, clicks = 0;

  function setMood(mood, ms) {
    if (!dock) return;
    var host = dock.querySelector('.ews-md-mascot');
    host.innerHTML = svg(mood, { label: 'Lulu — bấm để nghe mẹo học' });
    clearTimeout(moodTimer);
    if (ms) moodTimer = setTimeout(function () { setMood('happy'); }, ms);
  }

  function say(text, mood) {
    if (!dock) return;
    var b = dock.querySelector('.ews-md-bubble');
    b.textContent = text;
    dock.classList.add('is-talking');
    if (mood) setMood(mood, 5200);
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { dock.classList.remove('is-talking'); }, 6000);
  }

  function hop(mood) {
    if (!dock) return;
    dock.classList.remove('is-hop');
    void dock.offsetWidth; // restart the animation
    dock.classList.add('is-hop');
    if (mood) setMood(mood, 2400);
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
      '<button type="button" class="ews-md-close" aria-label="Ẩn Lulu hôm nay" title="Ẩn Lulu hôm nay"><i class="fas fa-times"></i></button>' +
      '<button type="button" class="ews-md-mascot" aria-label="Lulu — bấm để nghe mẹo học"></button>';
    document.body.appendChild(dock);
    setMood('happy');

    dock.querySelector('.ews-md-mascot').addEventListener('click', function () {
      clicks++;
      if (clicks === 1) { say(greeting(), 'excited'); return; }
      if (clicks % 7 === 0) { say('Ui da, cù lét tớ hoài! 🤭', 'wink'); hop(); return; }
      say(pickTip(), ['happy', 'wink', 'think', 'excited'][clicks % 4]);
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

  // A peeking Lulu in the coloured list headers (Reading / Listening …).
  function decorateHeaders() {
    var h = document.querySelector('#screen-list .list-header');
    if (h && !h.querySelector('.lh-mascot')) {
      var m = document.createElement('div');
      m.className = 'lh-mascot';
      m.setAttribute('aria-hidden', 'true');
      m.innerHTML = svg('happy');
      h.appendChild(m);
    }
  }

  // <div data-lulu-peek="wink"> … </div> → a small Lulu sitting in that
  // block's top-right corner (page headers).
  function mountPeeks() {
    var hosts = document.querySelectorAll('[data-lulu-peek]');
    for (var i = 0; i < hosts.length; i++) {
      if (hosts[i].querySelector('.lulu-peek')) continue;
      var m = document.createElement('div');
      m.className = 'lulu-peek';
      m.setAttribute('aria-hidden', 'true');
      m.innerHTML = svg(hosts[i].getAttribute('data-lulu-peek') || 'happy');
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
    svg: svg, mount: mount, moodForStreak: moodForStreak,
    moodForScore: moodForScore, react: react, reactHtml: reactHtml, cheer: cheer,
    say: function (t, m) { say(t, m); }, hop: function (m) { hop(m); },
  };
  window.TestCardArt = TestCardArt;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  // toast.js may load after us on some pages.
  window.addEventListener('load', function () { try { wrapToast(); } catch (e) {} });
})();
