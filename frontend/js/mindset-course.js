// mindset-<level>.html — Mindset for IELTS (khóa học theo giáo trình)
// ══════════════════════════════════════════════════════════════════════
//  Mindset for IELTS — WT1 course stack, courseCode MINDSET-<level>.
//  The runner is js/shared/course-engine.js; this page is started by
//  js/speaking-course.js (loaded right after this file) so the Speaking
//  course's speaking_response exercise (record → AI bands) works here too —
//  this file only hands it the Mindset identity via SPEAKING_COURSE_OVERRIDE.
//
//  Per lesson, on top of the engine's objectives / theory / exercises:
//    • images         pictures cut from the Student's Book
//    • practiceLinks  Reading / Listening in the site's own exam UI
//                     (reading.html / listening.html), slotted between the
//                     exercises in book order (lessonList) with the student's
//                     best score; + Essential Grammar links
//    • vocabSave      "Lưu vào Sổ N" — one click into the student's fixed
//                     book N (VocabBook.defaultSlot), or copy the list for
//                     the dashboard's "Nhập hàng loạt"
// ══════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var LEVEL = (document.body && document.body.getAttribute('data-mindset-level')) || '0';
  var LEVELS = {
    '0': { name: 'Foundation', band: 'A2 → Band 4.0–4.5', units: 10 },
    '1': { name: 'Level 1', band: 'Band 4.5 → 5.5', units: 8, rl: true },
    '2': { name: 'Level 2', band: 'Band 5.5 → 6.5', units: 8, rl: true },
  };
  var LV = LEVELS[LEVEL] || LEVELS['0'];
  var COURSE = 'MINDSET-' + LEVEL;
  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  var E = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function toast(m, t) { if (window.showToast) window.showToast(m, t || 'info'); }
  async function api(path, opts) {
    opts = opts || {};
    var token = window.AuthService && window.AuthService.getToken();
    var headers = Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {});
    var res = await fetch(API + path, Object.assign({}, opts, { headers: headers }));
    var body = null;
    try { body = await res.json(); } catch (e) { /* empty body */ }
    if (!res.ok) { var err = new Error((body && body.message) || ('HTTP ' + res.status)); err.body = body; throw err; }
    return body;
  }

  // ── lesson extras ─────────────────────────────────────────────────
  var KIND = {
    reading:   { icon: 'fa-book-open',  label: 'Reading',   cta: 'Làm bài Reading' },
    listening: { icon: 'fa-headphones', label: 'Listening', cta: 'Làm bài Listening' },
    link:      { icon: 'fa-external-link-alt', label: 'Luyện thêm', cta: 'Mở' },
  };

  function renderImages(l) {
    var imgs = l.images || [];
    if (!imgs.length) return '';
    return '<div class="ms-imgs">' + imgs.map(function (im) {
      return '<figure><img src="' + esc(im.url) + '" alt="' + esc(im.caption || 'Hình trong sách') + '" data-zoom title="Bấm để phóng to" loading="lazy">' +
        (im.caption ? '<figcaption>' + esc(im.caption) + '</figcaption>' : '') + '</figure>';
    }).join('') + '</div>';
  }

  // Reading / Listening test card. `result` = the student's best attempt
  // (wt1Service.getLesson → coursePracticeService); ≥ PASS% counts toward
  // a Mindset lesson given as homework.
  var PASS = 70;
  function taskCard(l, p) {
    // reading.html / listening.html show "Về khóa học" (js/shared/course-return.js)
    // and land back on this lesson when the student closes the practice.
    var back = '/mindset-' + LEVEL + '.html' + (l.code ? '?lesson=' + encodeURIComponent(l.code) : '');
    var url = /^\/(reading|listening)\.html\?/.test(p.url) ? p.url + '&returnTo=' + encodeURIComponent(back) : p.url;
    var k = KIND[p.kind] || KIND.link;
    var r = p.result;
    var badge = '';
    if (r && r.total) {
      var ok = r.percent >= PASS;
      badge = '<span class="ms-task-res ' + (ok ? 'is-ok' : 'is-low') + '" title="Kết quả tốt nhất của bạn">' +
        (ok ? '<i class="fas fa-check-circle"></i> ' : '<i class="fas fa-redo"></i> ') +
        r.correct + '/' + r.total + ' · ' + r.percent + '%' + (ok ? '' : ' — cần ≥' + PASS + '%') + '</span>';
    }
    return '<a class="ms-task ms-' + esc(p.kind) + (r && r.total && r.percent >= PASS ? ' is-done' : '') + '" href="' + esc(url) + '">' +
      '<span class="ms-task-ic"><i class="fas ' + k.icon + '"></i></span>' +
      '<span class="ms-task-body"><span class="ms-task-k">' + k.label + ' · giao diện thi thật</span>' +
      '<b>' + esc(p.title) + '</b>' + (p.note ? '<span class="ms-task-n">' + esc(p.note) + '</span>' : '') + badge + '</span>' +
      '<span class="ms-task-go">' + (r && r.total ? 'Làm lại' : k.cta) + ' <i class="fas fa-arrow-right"></i></span></a>';
  }

  // The lesson's steps in book order: exercises with the Reading/Listening
  // tests slotted in at their `step` (number of exercises before them —
  // set by scripts/mindset/buildMindset.js from the "(Ex. N)" tags).
  function lessonList(l, cards) {
    var tasks = (l.practiceLinks || []).filter(function (p) { return p.kind !== 'grammar' && p.url; });
    if (!tasks.length) return cards.join('');
    var at = {};
    tasks.forEach(function (p) {
      var s = typeof p.step === 'number' ? Math.max(0, Math.min(p.step, cards.length)) : cards.length;
      (at[s] = at[s] || []).push(p);
    });
    var out = [];
    var n = 0;
    function step(html) { n++; out.push('<div class="ms-step"><span class="ms-step-n">' + n + '</span>' + html + '</div>'); }
    for (var i = 0; i <= cards.length; i++) {
      (at[i] || []).forEach(function (p) { step(taskCard(l, p)); });
      if (i < cards.length) step(cards[i]);
    }
    return '<div class="ms-flow-h"><i class="fas fa-list-ol"></i> Các bước của buổi học — theo thứ tự trong sách' +
      '<span>' + tasks.length + ' bài ' + (tasks.some(function (p) { return p.kind === 'listening'; }) && tasks.some(function (p) { return p.kind === 'reading'; }) ? 'Reading/Listening' : (tasks[0].kind === 'listening' ? 'Listening' : 'Reading')) +
      ' cần đạt ≥' + PASS + '%</span></div>' + out.join('');
  }

  function renderPractice(l) {
    var links = l.practiceLinks || [];
    var gram = links.filter(function (p) { return p.kind === 'grammar' && p.url; });
    var html = '';
    if (gram.length) {
      html += '<div class="ms-gram"><div class="ms-gram-t">🧩 Ngữ pháp của bài — học & luyện trên web</div>' +
        '<div class="ms-gram-links">' + gram.map(function (p) {
          return '<a class="t1-btn" href="' + esc(p.url) + '"><i class="fas fa-graduation-cap"></i> ' + esc(p.title) + '</a>';
        }).join('') + '</div>' +
        (gram.some(function (p) { return p.note; }) ? '<ul class="ms-gram-notes">' + gram.filter(function (p) { return p.note; }).map(function (p) {
          return '<li><b>' + esc(p.title) + ':</b> ' + esc(p.note) + '</li>';
        }).join('') + '</ul>' : '') + '</div>';
    }
    return html;
  }

  function vocabLines(v) {
    return (v.words || []).map(function (w) { return w.word + ': ' + (w.meaning || ''); }).join('\n');
  }

  function renderVocabSave(l) {
    var v = l.vocabSave;
    if (!v || !v.words || !v.words.length) return '';
    var n = v.slot;
    return '<div class="ms-vocab" data-slot="' + n + '">' +
      '<h3>📒 Lưu vào Sổ ' + n + ' trên web</h3>' +
      (v.title ? '<div class="ms-vocab-sub">' + esc(v.title) + '</div>' : '') +
      '<ol>' +
        '<li>Bấm <b>“Lưu ' + v.words.length + ' từ vào Sổ ' + n + '”</b> bên dưới — hoặc vào <a href="/dashboard.html">Dashboard → Sổ từ vựng</a>, mở Sổ ' + n + ', chọn “Nhập hàng loạt” và dán danh sách (mỗi dòng “từ: nghĩa”). Hệ thống tự thêm ví dụ và phát âm.</li>' +
        '<li>Luyện chế độ <b>Mixed</b> đến khi đúng từ <b>70%</b> trở lên.</li>' +
        '<li>Những ngày sau mở ô <b>“Cần ôn lại”</b> ở trang chủ để ôn đúng lúc sắp quên.</li>' +
      '</ol>' +
      '<div class="ms-vocab-actions">' +
        '<button class="t1-btn is-primary ms-vocab-save" data-slot="' + n + '"><i class="fas fa-bookmark"></i> Lưu ' + v.words.length + ' từ vào Sổ ' + n + '</button>' +
        '<button class="t1-btn ms-vocab-copy"><i class="fas fa-copy"></i> Sao chép danh sách</button>' +
        '<span class="ms-vocab-msg" aria-live="polite"></span>' +
      '</div>' +
      '<div class="ms-vocab-cap">Danh sách để dán (mỗi dòng “từ: nghĩa”):</div>' +
      '<div class="ms-vocab-list">' + (v.words || []).map(function (w) {
        return '<div class="ms-vw"><b>' + esc(w.word) + '</b>: ' + esc(w.meaning || '') +
          (w.example ? '<div class="ms-vw-ex">' + esc(w.example) + '</div>' : '') + '</div>';
      }).join('') + '</div>' +
    '</div>';
  }

  async function saveVocab(btn) {
    var l = E && E.state.lesson;
    var v = l && l.vocabSave;
    if (!v) return;
    if (!(window.AuthService && window.AuthService.getToken())) { toast('Đăng nhập để lưu từ vào sổ', 'error'); return; }
    var box = btn.closest('.ms-vocab');
    var msg = box && box.querySelector('.ms-vocab-msg');
    btn.disabled = true;
    try {
      var books = await api('/vocabbook');
      var list = Array.isArray(books) ? books : (books && (books.books || books.data)) || [];
      var book = list.find(function (b) { return b.defaultSlot === v.slot; }) ||
        list.find(function (b) { return String(b.name || '').trim() === 'Sổ ' + v.slot; });
      if (!book) throw new Error('Không tìm thấy Sổ ' + v.slot);
      var words = (v.words || []).map(function (w) { return { word: w.word, meaning: w.meaning || '', example: w.example || '' }; });
      var r = await api('/vocabbook/' + book._id + '/words/bulk', { method: 'POST', body: JSON.stringify({ words: words }) });
      var text = (r && r.message) || 'Đã lưu';
      if (msg) msg.innerHTML = '✅ ' + esc(text) + ' · <a href="/dashboard.html?view=book&bookId=' + esc(book._id) + '">Mở Sổ ' + v.slot + ' để luyện Mixed →</a>';
      toast(text + ' vào Sổ ' + v.slot, 'success');
    } catch (e) {
      var m = (e && e.body && e.body.message) || (e && e.message) || 'Lỗi lưu từ';
      if (msg) msg.textContent = '⚠️ ' + m;
      toast(m, 'error');
    } finally { btn.disabled = false; }
  }

  function copyVocab(btn) {
    var l = E && E.state.lesson;
    if (!l || !l.vocabSave) return;
    var text = vocabLines(l.vocabSave);
    var box = btn.closest('.ms-vocab');
    var msg = box && box.querySelector('.ms-vocab-msg');
    function done() { if (msg) msg.textContent = '📋 Đã sao chép ' + l.vocabSave.words.length + ' dòng — dán vào “Nhập hàng loạt” của Sổ ' + l.vocabSave.slot; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* noop */ }
    ta.remove();
  }

  function onClick(ev) {
    var s = ev.target.closest('.ms-vocab-save');
    if (s) { ev.preventDefault(); saveVocab(s); return; }
    var c = ev.target.closest('.ms-vocab-copy');
    if (c) { ev.preventDefault(); copyVocab(c); }
  }

  window.SPEAKING_COURSE_OVERRIDE = function (base) {
    return {
      courseCode: COURSE,
      overviewPath: '/wt1/overview?course=' + COURSE,
      pagePath: '/mindset-' + LEVEL + '.html',
      cleanPath: new RegExp('^/mindset/' + LEVEL + '/([^/?#]+)$'),
      dictionaryKey: 'mindset-' + LEVEL,
      title: '📗 Mindset for IELTS ' + LV.name,
      heroTitle: 'Mindset for IELTS <span class="pf-tag">' + LV.name + '</span>',
      heroColor: 'pf-hero-green',
      heroClass: 't1-hero',
      heroStatsExtra: '<span>' + LV.band + '</span>',
      paywallTitle: 'Khoá Mindset chỉ dành cho Premium',
      paywallBlurb: LV.rl
        ? LV.units + ' unit bám sát giáo trình Mindset for IELTS ' + LV.name + ' Reading & Listening (Cambridge): bài giảng chiến thuật tiếng Việt, mọi bài Reading/Listening làm trên giao diện thi thật (audio gốc), từ vựng lưu thẳng vào Sổ.'
        : LV.units + ' unit bám sát giáo trình Mindset for IELTS ' + LV.name + ' (Cambridge): bài giảng tiếng Việt, Reading/Listening trên giao diện thi thật, Writing & Speaking được AI chấm, từ vựng lưu thẳng vào Sổ 1–5.',
      premiumBlurb: 'Trọn bộ ' + LV.units + ' unit Mindset ' + LV.name,
      heroFallback: 'Khoá học theo giáo trình Mindset for IELTS ' + LV.name + '.',
      moduleClass: undefined,
      moduleProgress: true,
      // Writing-course look (this page loads writing-task2-course.css), not
      // the Speaking page's older compact one.
      ui: {},
      lessonExtra: function (l) { return renderImages(l) + renderPractice(l); },
      lessonList: lessonList,
      lessonFooter: renderVocabSave,
      setup: function (engine) {
        E = engine;
        document.addEventListener('click', onClick);
        if (base.setup) base.setup(engine);
      },
    };
  };
})();
