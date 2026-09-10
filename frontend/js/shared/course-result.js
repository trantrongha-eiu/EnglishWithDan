/**
 * shared/course-result.js — end-of-lesson result screen for the three
 * "Khoá học" pages (writing-task1.html, writing-task2-course.html,
 * speaking-course.html). Same tone + tiered mood image as the vocab
 * practice results screen (dashboard.js showResults), plus an animated
 * score ring, count-up, staggered per-exercise list and confetti.
 *
 *   CourseResult.renderLessonComplete({
 *     mount, title, courseLabel,
 *     results: [{ label, kind: 'objective'|'writing'|'speaking',
 *                 score?: 0-100, band?: 0-9 }],
 *     onRetry, onDone,
 *   })
 *
 * Depends on window.getScoreMessage (shared/score-message.js) — falls back
 * to an inline copy if that file isn't on the page.
 */
(function () {
  'use strict';

  var CSS = [
    '@keyframes cr-fade-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}',
    '@keyframes cr-pop{0%{opacity:0;transform:scale(.7) rotate(-6deg)}60%{transform:scale(1.06) rotate(2deg)}100%{opacity:1;transform:scale(1) rotate(0)}}',
    '@keyframes cr-shake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-8px)}40%,60%{transform:translateX(8px)}}',
    '@keyframes cr-confetti{to{transform:translateY(105vh) rotate(720deg);opacity:0}}',
    '.cr-wrap{max-width:520px;margin:0 auto;padding:32px 20px 40px;text-align:center;animation:cr-fade-up .5s ease both}',
    '.cr-wrap.cr-bad{animation:cr-fade-up .5s ease both,cr-shake .6s ease .5s}',
    '.cr-title{font-size:15px;color:var(--text2,#6b7280);font-weight:700;margin:0 0 2px}',
    '.cr-sub{font-size:13px;color:var(--text3,#9ca3af);margin:0 0 18px}',
    '.cr-ring-box{position:relative;width:180px;height:180px;margin:6px auto 4px}',
    '.cr-ring-box svg{transform:rotate(-90deg);overflow:visible}',
    '.cr-ring-bg{stroke:var(--border,#e5e7eb)}',
    '.cr-ring-fg{stroke-linecap:round;transition:stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)}',
    '.cr-pct{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}',
    '.cr-pct b{font-size:40px;line-height:1;font-weight:800}',
    '.cr-pct span{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--text3,#9ca3af);margin-top:4px}',
    '.cr-img{width:190px;max-width:70%;border-radius:16px;margin:14px auto 0;display:block;box-shadow:0 10px 30px rgba(0,0,0,.14);animation:cr-pop .6s ease .35s both}',
    '.cr-roast{font-size:15px;font-weight:650;margin:16px auto 4px;max-width:420px;line-height:1.5;animation:cr-fade-up .5s ease .55s both}',
    '.cr-stats{display:flex;gap:8px;justify-content:center;margin:14px 0 4px;animation:cr-fade-up .5s ease .65s both}',
    '.cr-stat{background:var(--surface2,#f3f4f6);border-radius:12px;padding:8px 16px;min-width:74px}',
    '.cr-stat b{display:block;font-size:20px;font-weight:800}',
    '.cr-stat span{font-size:11px;color:var(--text3,#9ca3af)}',
    '.cr-list{margin:16px auto 0;max-width:440px;text-align:left}',
    '.cr-row{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:10px;font-size:13px;background:var(--surface2,#f7f7f8);margin-top:6px;opacity:0;animation:cr-fade-up .4s ease both}',
    '.cr-row .cr-mk{width:18px;text-align:center;flex-shrink:0}',
    '.cr-row .cr-lb{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.cr-row .cr-sc{font-weight:700;font-variant-numeric:tabular-nums}',
    '.cr-btns{display:flex;gap:10px;justify-content:center;margin-top:24px;animation:cr-fade-up .5s ease .8s both}',
    '.cr-btns button{font:inherit;font-weight:700;border-radius:12px;padding:11px 20px;cursor:pointer;border:1px solid var(--border,#e5e7eb);background:var(--surface,#fff);color:var(--text,#111);transition:transform .12s,box-shadow .12s}',
    '.cr-btns button:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.12)}',
    '.cr-btns .cr-primary{background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;border-color:transparent}',
    '.cr-confetti{position:fixed;top:-12px;width:9px;height:9px;z-index:9999;pointer-events:none}',
    '@media (prefers-reduced-motion:reduce){.cr-wrap,.cr-wrap.cr-bad,.cr-img,.cr-roast,.cr-stats,.cr-row,.cr-btns{animation:none!important;opacity:1!important}.cr-ring-fg{transition:none}}',
  ].join('');

  function injectCss() {
    if (document.getElementById('cr-style')) return;
    var s = document.createElement('style');
    s.id = 'cr-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function scoreMessage(pct) {
    if (typeof window.getScoreMessage === 'function') return window.getScoreMessage(pct);
    if (pct >= 80) return { emoji: '😎', message: 'Ôi học giỏi vậy? Đi dạy lại đi chứ 🔥' };
    if (pct >= 60) return { emoji: '🤔', message: 'Tạm ổn đó... nhưng Daniel biết bạn làm được hơn 👀' };
    if (pct >= 40) return { emoji: '🥲', message: 'Hơn 40% rồi nhưng sai nhiều vậy chưa ổn nha — cày thêm đi!' };
    return { emoji: '😤', message: 'Học cho đàng hoàng zô coiii!' };
  }

  function moodImage(pct) {
    return pct >= 90 ? 'img/vocab_writingabove90%25.jpg'
      : pct >= 70 ? 'img/above7.5.jpg'
        : pct >= 50 ? 'img/vocab50_70%25.jpg'
          : pct >= 20 ? 'img/vocabbelow50%25.jpg'
            : 'img/verylowscore.jpg';
  }

  function ringColor(pct) {
    return pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#e11d48';
  }

  // objective/sentence -> its own %, AI writing/speaking -> band scaled to %
  function rowPct(r) {
    if (typeof r.score === 'number' && !isNaN(r.score)) return Math.max(0, Math.min(100, r.score));
    if (typeof r.band === 'number' && !isNaN(r.band)) return Math.round((r.band / 9) * 100);
    return null;
  }

  function confetti(count) {
    var colors = ['#e11d48', '#3d8bff', '#22c55e', '#f59e0b', '#a78bfa', '#fb7185', '#34d399'];
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'cr-confetti';
      var size = 5 + Math.random() * 8;
      el.style.cssText = 'left:' + (6 + Math.random() * 88) + '%;background:' + colors[i % colors.length] +
        ';width:' + size + 'px;height:' + size + 'px;border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') +
        ';animation:cr-confetti ' + (1 + Math.random() * 1.4) + 's ' + (Math.random() * 0.4) + 's linear forwards';
      document.body.appendChild(el);
      (function (node) { node.addEventListener('animationend', function () { node.remove(); }, { once: true }); })(el);
    }
  }

  function countUp(el, to) {
    var start = null, dur = 1000;
    function step(ts) {
      if (start == null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      el.textContent = Math.round(to * p) + '%';
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function renderLessonComplete(opts) {
    opts = opts || {};
    injectCss();
    var mount = opts.mount || document.getElementById('app');
    if (!mount) return;

    var results = (opts.results || []).filter(Boolean);
    var pcts = results.map(rowPct).filter(function (p) { return p != null; });
    var overall = pcts.length ? Math.round(pcts.reduce(function (a, b) { return a + b; }, 0) / pcts.length) : null;
    var hasScore = overall != null;
    var shown = hasScore ? overall : 100; // neutral-good visuals when nothing was scored
    var msg = scoreMessage(shown);
    var correctCount = results.reduce(function (n, r) {
      return n + (typeof r.correctCount === 'number' ? r.correctCount : 0);
    }, 0);
    var totalItems = results.reduce(function (n, r) {
      return n + (typeof r.maxScore === 'number' ? r.maxScore : 0);
    }, 0);

    var R = 80, C = 2 * Math.PI * R;
    var col = ringColor(shown);

    var listRows = results.map(function (r, i) {
      var p = rowPct(r);
      var mk = p == null ? '·' : p >= 60 ? '<span style="color:#16a34a">✔</span>' : '<span style="color:#dc2626">✗</span>';
      var sc = p == null ? (r.kind === 'speaking' || r.kind === 'writing' ? 'đã nộp' : '—')
        : (typeof r.band === 'number' && r.score == null ? ('Band ' + r.band) : (p + '%'));
      return '<div class="cr-row" style="animation-delay:' + (0.9 + i * 0.07).toFixed(2) + 's">' +
        '<span class="cr-mk">' + mk + '</span>' +
        '<span class="cr-lb">' + esc(r.label || ('Bài ' + (i + 1))) + '</span>' +
        '<span class="cr-sc" style="color:' + (p == null ? 'var(--text3,#9ca3af)' : ringColor(p)) + '">' + esc(sc) + '</span>' +
        '</div>';
    }).join('');

    mount.innerHTML =
      '<div class="cr-wrap' + (hasScore && shown < 40 ? ' cr-bad' : '') + '">' +
        '<p class="cr-title">Hoàn thành buổi học</p>' +
        '<p class="cr-sub">' + esc(opts.title || '') + '</p>' +
        '<div class="cr-ring-box">' +
          '<svg width="180" height="180" viewBox="0 0 180 180">' +
            '<circle class="cr-ring-bg" cx="90" cy="90" r="' + R + '" fill="none" stroke-width="12"/>' +
            '<circle class="cr-ring-fg" cx="90" cy="90" r="' + R + '" fill="none" stroke-width="12" stroke="' + col + '" ' +
              'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '"/>' +
          '</svg>' +
          '<div class="cr-pct"><b id="cr-num" style="color:' + col + '">' + (hasScore ? '0%' : '✓') + '</b>' +
            '<span>' + (hasScore ? 'chính xác' : 'đã xong') + '</span></div>' +
        '</div>' +
        '<img class="cr-img" src="' + moodImage(shown) + '" alt="" onerror="this.style.display=\'none\'"/>' +
        '<p class="cr-roast">' + msg.emoji + ' ' + esc(msg.message) + '</p>' +
        (totalItems ? '<div class="cr-stats">' +
          '<div class="cr-stat"><b style="color:#16a34a">' + correctCount + '</b><span>câu đúng</span></div>' +
          '<div class="cr-stat"><b>' + totalItems + '</b><span>tổng câu</span></div>' +
          (hasScore ? '<div class="cr-stat"><b style="color:' + col + '">' + overall + '%</b><span>độ chính xác</span></div>' : '') +
        '</div>' : '') +
        (listRows ? '<div class="cr-list">' + listRows + '</div>' : '') +
        '<div class="cr-btns">' +
          '<button id="cr-retry">Làm lại buổi này</button>' +
          '<button class="cr-primary" id="cr-done">' + esc(opts.doneLabel || 'Về khoá học') + '</button>' +
        '</div>' +
      '</div>';

    // animate the ring + number after paint
    var fg = mount.querySelector('.cr-ring-fg');
    var num = mount.querySelector('#cr-num');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (fg) fg.style.strokeDashoffset = (C - (shown / 100) * C).toFixed(1);
        if (hasScore && num) countUp(num, overall);
      });
    });

    if (hasScore && overall >= 90) setTimeout(function () { confetti(90); }, 500);
    else if (!hasScore) setTimeout(function () { confetti(50); }, 400);

    var rb = mount.querySelector('#cr-retry');
    var db = mount.querySelector('#cr-done');
    if (rb) rb.addEventListener('click', function () { if (opts.onRetry) opts.onRetry(); });
    if (db) db.addEventListener('click', function () { if (opts.onDone) opts.onDone(); });
  }

  window.CourseResult = { renderLessonComplete: renderLessonComplete };
})();
