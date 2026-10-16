// ══════════════════════════════════════════════════════════════════════
//  CourseEngine — the shared Module → Lesson → Exercise runner behind every
//  WT1-system course page (writing-task1.html, writing-task2-course.html,
//  speaking-course.html). All three talk to the same /wt1/* API; a page only
//  supplies its course identity, its headline copy and any extra exercise
//  types (Speaking's speaking_response) via CourseEngine.start(cfg).
//
//  cfg:
//    courseCode       'IELTS-W-T1' — WT1History scope
//    overviewPath     '/wt1/overview' or '/wt1/overview?course=…'
//    pagePath         '/writing-task1.html' — base for pushState URLs
//    cleanPath        RegExp for the clean /…/:lesson URL (one capture group)
//    dictionaryKey    setupDictionaryDouble() source key
//    title            hero / paywall heading
//    paywallTitle, paywallBlurb, premiumBlurb, heroFallback
//    heroClass        default 't1-hero'
//    heroStatsExtra   extra <span>s after the module/lesson/exercise counts
//    moduleClass(m, mi)  default 'acc1'…'acc5'
//    moduleProgress   false hides the "x/y buổi hoàn thành" line
//    lessonExtra(l)   html appended under a lesson's key-language block
//    ui               look switches — Speaking keeps its own (older) styling,
//                     its stylesheet has none of the newer writing classes:
//      cueColor, imageAlt, zoom (lightbox + chart thumbnails), essayMeter,
//      plainTimer, plainScore, progressHtml(pct), aiWritingBody(d)
//    types            { <type>: { label, renderBody, bind, submit, submitLabel, card } }
//                     extra exercise types with their own UI + submit path
//    setup(E)         called once with the engine API, before the first load
//    onBeforeRender(E) called at the top of every render()
// ══════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  function start(cfg) {
    var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
    var ui = cfg.ui || {};
    var zoom = ui.zoom !== false;
    var TYPES = cfg.types || {};

    var TYPE_LABEL = {
      mcq: 'Trắc nghiệm', gap_fill: 'Điền chỗ trống', error_correction: 'Sửa lỗi',
      sentence_transform: 'Viết lại câu', word_form: 'Chia dạng từ', categorize: 'Phân loại',
      matching: 'Nối', ordering: 'Sắp xếp', sentence_writing: 'Viết câu', paragraph_writing: 'Viết đoạn',
      full_task1: 'Bài hoàn chỉnh',
    };
    Object.keys(TYPES).forEach(function (t) { if (TYPES[t].label) TYPE_LABEL[t] = TYPES[t].label; });
    var OBJECTIVE = { mcq:1, gap_fill:1, error_correction:1, word_form:1, categorize:1, matching:1, ordering:1, sentence_transform:1 };

    // itemIdx: which question of a multi-item exercise is current (Speaking's
    // one-question-at-a-time speaking_response). Reset on every lesson entry,
    // next exercise and retry — a previous exercise's index must never bleed
    // into the next one.
    var state = { view: 'overview', overview: null, lesson: null, exercises: [], exIdx: 0, answered: false, timer: null, timeLeft: 0, _submitting: false, results: [], itemIdx: 0 };
    var app = document.getElementById('app');

    function esc(s) {
      return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }
    function toast(m, t) { if (window.showToast) window.showToast(m, t || 'info'); }
    function isPremium() { return !!(window.AuthService && window.AuthService.hasPremiumAccess && window.AuthService.hasPremiumAccess()); }

    async function api(path, opts) {
      opts = opts || {};
      var token = window.AuthService && window.AuthService.getToken();
      // FormData sets its own multipart Content-Type (with boundary) — never override it.
      var base = (opts.body instanceof FormData) ? {} : { 'Content-Type': 'application/json' };
      var headers = Object.assign(base, token ? { Authorization: 'Bearer ' + token } : {}, opts.headers || {});
      var res = await fetch(API + path, Object.assign({}, opts, { headers: headers }));
      if (window.ApiClient && window.ApiClient.handleResponse) return window.ApiClient.handleResponse(res);
      return res.json();
    }

    // Lịch sử luyện tập (course-wide + per exercise) — shared/wt1-history.js
    if (window.WT1History) window.WT1History.init({ api: api, courseCode: cfg.courseCode });
    function openHistory() { var ex = curEx(); if (ex && window.WT1History) window.WT1History.openExercise(ex.code, ex.title); }

    function stopTimer() { if (state.timer) { clearInterval(state.timer); state.timer = null; } }

    // ── pointer drag-and-drop (mouse + touch); one drag at a time. A floating
    //    clone tracks the pointer; the real node is moved into the drop zone on
    //    release. zoneSel = CSS selector matching valid drop targets.
    var Dnd = {
      bind: function (el, zoneSel, onDrop) {
        el.addEventListener('pointerdown', function (e) {
          if (e.button != null && e.button > 0) return;
          e.preventDefault();
          var r = el.getBoundingClientRect();
          var fl = el.cloneNode(true);
          fl.classList.add('t1-dnd-float');
          fl.style.width = r.width + 'px';
          fl.style.left = r.left + 'px';
          fl.style.top = r.top + 'px';
          document.body.appendChild(fl);
          el.classList.add('is-dragging');
          var dx = e.clientX - r.left, dy = e.clientY - r.top, over = null;
          try { el.setPointerCapture(e.pointerId); } catch (x) { /* older Safari */ }
          function mv(ev) {
            ev.preventDefault();
            fl.style.left = (ev.clientX - dx) + 'px';
            fl.style.top = (ev.clientY - dy) + 'px';
            var u = document.elementFromPoint(ev.clientX, ev.clientY);
            var z = u && u.closest(zoneSel);
            if (z !== over) { if (over) over.classList.remove('over'); if (z) z.classList.add('over'); over = z; }
          }
          function up(ev) {
            el.removeEventListener('pointermove', mv);
            el.removeEventListener('pointerup', up);
            el.removeEventListener('pointercancel', up);
            fl.remove();
            el.classList.remove('is-dragging');
            if (over) { over.classList.remove('over'); onDrop(el, over); }
          }
          el.addEventListener('pointermove', mv);
          el.addEventListener('pointerup', up);
          el.addEventListener('pointercancel', up);
        });
      }
    };

    // Engine API handed to cfg.setup / cfg.onBeforeRender / type plugins.
    var E = {
      state: state, app: app, esc: esc, api: api, toast: toast,
      curEx: curEx, render: render, stopTimer: stopTimer, rubricHint: rubricHint,
      recordResult: _recordResult, nextExercise: nextExercise, retryExercise: retryExercise,
    };

    function render() {
      stopTimer();
      if (cfg.onBeforeRender) cfg.onBeforeRender(E);
      document.querySelectorAll('.t1-dnd-float').forEach(function (f) { f.remove(); });
      if (window.WbwDrill) document.querySelectorAll('[data-wbw-host]').forEach(function (h) { window.WbwDrill.unmount(h); });
      if (state.view === 'overview') { app.innerHTML = renderOverview(); bindOverview(); }
      else if (state.view === 'lesson') { app.innerHTML = renderLesson(); bindLesson(); }
      else if (state.view === 'exercise') { app.innerHTML = renderExercise(); bindExercise(); }
      // Replay the entrance animation on every navigation, not just once on
      // load — removing then re-adding the class (with a reflow in between,
      // since a class re-added on the same tick is a no-op to the CSS engine)
      // restarts the CSS animation each time.
      app.classList.remove('t1-view-anim');
      void app.offsetWidth;
      app.classList.add('t1-view-anim');
    }

    // ── OVERVIEW ──────────────────────────────────────────────────────
    async function loadOverview() {
      app.innerHTML = '<div style="text-align:center;padding:48px"><div class="t1-spinner"></div></div>';
      try {
        var d = await api(cfg.overviewPath);
        state.overview = d;
        // Clean path /…/:lesson (a _redirects 200 rewrite to this same file) —
        // same additive pattern as reading-v2.js/listening.html's
        // RouteParams.match(): checked first, falls back to ?lesson= unchanged.
        var cleanLesson = window.RouteParams ? window.RouteParams.match([
          { pattern: cfg.cleanPath, param: 'lesson' }
        ]) : null;
        var p = new URLSearchParams(location.search);
        var lessonParam = (cleanLesson && cleanLesson.lesson) || p.get('lesson');
        if (lessonParam) { await openLesson(lessonParam, p.get('ex'), true, !!cleanLesson); return; }
        state.view = 'overview';
        history.replaceState({ view: 'overview' }, '', location.href);
        render();
      } catch (e) {
        if (e && e.body && e.body.code === 'PLAN_REQUIRED') { renderPaywall(); return; }
        app.innerHTML = '<p style="text-align:center;color:#dc2626;padding:40px">Lỗi tải dữ liệu. Thử tải lại trang.</p>';
      }
    }
    function renderPaywall() {
      app.innerHTML =
        '<div class="t1-head"><h2 class="t1-h2">' + cfg.title + '</h2></div>' +
        '<div class="t1-premium"><div style="font-size:22px">⭐</div>' +
        '<div class="t"><b>' + cfg.paywallTitle + '</b>' +
        '<span>' + cfg.paywallBlurb + '</span></div>' +
        '<button onclick="if(window.openUpgradeModal)window.openUpgradeModal()">Nâng cấp Premium</button></div>';
    }
    function renderOverview() {
      var d = state.overview || { modules: [] };
      var mods = (d.modules || []).map(function (m, mi) {
        var lessons = (m.lessons || []).map(function (l) {
          var icCls = l.done ? 'done' : (l.doneCount > 0 ? 'prog' : '');
          var lockIcon = l.needsTestCode ? '🎫' : '🔒';
          var icTxt = l.done ? '✓' : (l.unlocked ? (l.doneCount > 0 ? '▶' : (m.lessons.indexOf(l) + 1)) : lockIcon);
          var pct = l.exerciseCount ? Math.round((l.doneCount / l.exerciseCount) * 100) : 0;
          // data-locked/data-needs-code drive bindOverview()'s click guard — a
          // locked lesson card used to still open on click despite showing 🔒,
          // since openLesson() ran unconditionally. Server-side, getLesson/
          // check/submitWriting/submitSpeaking now also hard-enforce this
          // (wt1Service.assertLessonUnlocked), so this is UX, not the only gate.
          return '<div class="t1-lesson' + (l.unlocked ? '' : ' is-locked') + '" data-code="' + l.code + '"' +
            (l.unlocked ? '' : ' data-locked="1"') + (l.needsTestCode ? ' data-needs-code="1"' : '') + '>' +
            '<div class="t1-lesson-ic ' + icCls + '">' + icTxt + '</div>' +
            '<div class="t1-lesson-body">' +
              '<div class="t1-lesson-title">' + esc(l.title) + (l.isTest ? ' <span class="t1-tag">Kiểm tra</span>' : '') + '</div>' +
              '<div class="t1-lesson-meta">' + l.doneCount + '/' + l.exerciseCount + ' bài' +
                (l.scorePercent ? ' · TB ' + l.scorePercent + '%' : '') +
                (l.durationMinutes ? ' · ' + l.durationMinutes + ' phút' : '') + '</div>' +
              '<div class="t1-lesson-bar"><span style="width:' + pct + '%"></span></div>' +
            '</div><i class="fas fa-chevron-right" style="color:#9ca3af"></i></div>';
        }).join('');
        var modCls = cfg.moduleClass ? cfg.moduleClass(m, mi) : 'acc' + ((mi % 5) + 1);
        var progress = '';
        if (cfg.moduleProgress !== false) {
          var doneL = (m.lessons || []).filter(function (x) { return x.done; }).length;
          progress = '<div style="font-size:11px;color:var(--text3,#9ca3af);margin-top:3px">' + doneL + '/' + (m.lessons || []).length + ' buổi hoàn thành</div>';
        }
        return '<div class="t1-module ' + modCls + '"><div class="t1-module-hd"><div class="en">' + esc(m.titleEn || '') + '</div>' +
          '<h3>' + esc(m.title) + '</h3>' + progress + '</div>' + lessons + '</div>';
      }).join('');
      var nMod = (d.modules || []).length, nLes = 0, nEx = 0;
      (d.modules || []).forEach(function (m) { (m.lessons || []).forEach(function (l) { nLes++; nEx += (l.exerciseCount || 0); }); });
      return '<div class="' + (cfg.heroClass || 't1-hero') + '"><h2>' + cfg.title + '</h2>' +
        '<p>' + esc((d.course && d.course.description) || cfg.heroFallback) + '</p>' +
        (nLes ? '<div class="stats"><span>' + nMod + ' module</span><span>' + nLes + ' buổi</span><span>' + nEx + ' bài</span>' + (cfg.heroStatsExtra || '') + '</div>' : '') +
        '<button class="t1-btn" id="t1-course-hist" style="margin-top:12px"><i class="fas fa-history"></i> Lịch sử luyện tập</button>' +
        '</div>' +
        (!isPremium() ? '<div class="t1-premium"><div style="font-size:22px">⭐</div><div class="t"><b>Nâng cấp Premium để luyện tập không giới hạn</b><span>' + cfg.premiumBlurb + '</span></div><button onclick="if(window.openUpgradeModal)window.openUpgradeModal()">Upgrade Premium</button></div>' : '') +
        mods;
    }
    function bindOverview() {
      var hb = document.getElementById('t1-course-hist');
      if (hb && window.WT1History) hb.addEventListener('click', function () { window.WT1History.openCourse(); });
      document.querySelectorAll('.t1-lesson').forEach(function (el) {
        el.addEventListener('click', function () {
          if (el.dataset.needsCode === '1') { openTestCodeModal(el.dataset.code); return; }
          if (el.dataset.locked === '1') { openTestCodeModal(el.dataset.code, 'locked'); return; }
          openLesson(el.dataset.code);
        });
      });
    }

    // ── LESSON ────────────────────────────────────────────────────────
    async function openLesson(code, exCode, fromUrl, fromCleanPath) {
      app.innerHTML = '<div style="text-align:center;padding:48px"><div class="t1-spinner"></div></div>';
      try {
        var d = await api('/wt1/lesson/' + encodeURIComponent(code));
        state.lesson = d.lesson;
        state.exercises = d.exercises || [];
        state.results = [];
        state.itemIdx = 0;
        var url = cfg.pagePath + '?lesson=' + code;
        if (exCode) {
          var i = state.exercises.findIndex(function (e) { return e.code === exCode; });
          // A clean /…/:lesson path only encodes the lesson, never an exercise
          // index, so an exCode always needs the query-string form regardless
          // of fromCleanPath.
          if (i >= 0) { state.exIdx = i; state.view = 'exercise'; (fromUrl ? history.replaceState : history.pushState).call(history, { view: 'exercise', lesson: code, ex: exCode }, '', url + '&ex=' + exCode); render(); return; }
        }
        state.view = 'lesson';
        // Skip the replaceState when the clean path already resolved to this
        // exact lesson — that URL is meant to keep showing forever, same
        // fromCleanPath idiom reading-v2.js uses for /reading/test/:id.
        if (!fromCleanPath) {
          (fromUrl ? history.replaceState : history.pushState).call(history, { view: 'lesson', lesson: code }, '', url);
        }
        render();
      } catch (e) {
        var errCode = e && e.body && e.body.code;
        if (errCode === 'PLAN_REQUIRED') { renderPaywall(); return; }
        if (errCode === 'TEST_CODE_REQUIRED') { openTestCodeModal(code); return; }
        if (errCode === 'LESSON_LOCKED') { goOverview(); openTestCodeModal(code, 'locked'); return; }
        toast('Lỗi tải buổi học', 'error'); goOverview();
      }
    }
    function goOverview() { state.view = 'overview'; history.pushState({ view: 'overview' }, '', cfg.pagePath); loadOverview(); }

    function renderLesson() {
      var l = state.lesson || {};
      var exs = state.exercises.map(function (ex) {
        var done = ex.lastAttempt && (ex.lastAttempt.score != null || ex.lastAttempt.hasAi);
        var plug = TYPES[ex.type];
        var card = (plug && plug.card) ? plug.card(ex) : null;
        var cls = card ? card.cls : '';
        return '<div class="t1-ex-card' + cls + '" data-code="' + ex.code + '">' +
          '<span class="t1-ex-type' + cls + '">' + (card ? card.icon : '') + esc(TYPE_LABEL[ex.type] || ex.type) + '</span>' +
          '<span class="nm">' + esc(ex.title) + (card && card.meta ? card.meta : (ex.points ? ' · ' + ex.points + 'đ' : '')) + '</span>' +
          (done ? '<span class="t1-ex-done"><i class="fas fa-check-circle"></i></span>' : '<i class="fas fa-chevron-right" style="color:#9ca3af"></i>') +
          '</div>';
      }).join('');
      return '<div class="t1-crumb"><span id="t1-back-ov">Khoá học</span> › <b>' + esc(l.title || '') + '</b></div>' +
        '<div class="t1-head" style="padding-top:2px"><h2 class="t1-h2" style="font-size:17px">' + esc(l.title || '') + '</h2></div>' +
        ((l.objectives && l.objectives.length) ? '<div class="t1-objs"><div class="t1-objs-t">🎯 Mục tiêu buổi học</div><ul>' + l.objectives.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul></div>' : '') +
        ((l.keyLanguage && l.keyLanguage.length) ? '<details class="t1-key"><summary>🧩 Ngữ pháp / Cấu trúc cần nhớ</summary><ul>' + l.keyLanguage.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul></details>' : '') +
        (cfg.lessonExtra ? cfg.lessonExtra(l) : '') +
        '<div class="t1-ex-list">' + exs + '</div>';
    }
    function bindLesson() {
      document.getElementById('t1-back-ov').addEventListener('click', goOverview);
      document.querySelectorAll('.t1-ex-card').forEach(function (el) {
        el.addEventListener('click', function () {
          state.exIdx = state.exercises.findIndex(function (e) { return e.code === el.dataset.code; });
          state.view = 'exercise';
          history.pushState({ view: 'exercise', lesson: state.lesson.code, ex: el.dataset.code }, '', cfg.pagePath + '?lesson=' + state.lesson.code + '&ex=' + el.dataset.code);
          render();
        });
      });
    }

    // ── EXERCISE RUNNER ──────────────────────────────────────────────
    function curEx() { return state.exercises[state.exIdx]; }
    function _recordResult(e) { var i = state.results.findIndex(function (x) { return x.code === e.code; }); if (i >= 0) state.results[i] = e; else state.results.push(e); }

    // ── test-lesson unlock code ───────────────────────────────────────
    function openTestCodeModal(lessonCode, reason) {
      var modal = document.getElementById('t1-code-modal');
      var input = document.getElementById('t1-code-input');
      var msg = document.getElementById('t1-code-msg');
      modal.dataset.lessonCode = lessonCode;
      // 'locked' = an ordinary lesson behind the previous lesson's score gate;
      // anything else = an isTest lesson, which always needs a code.
      var seq = reason === 'locked';
      document.getElementById('t1-code-title').textContent = seq ? 'Buổi học đang khoá' : 'Mã mở khoá bài kiểm tra';
      document.getElementById('t1-code-desc').textContent = seq
        ? 'Hoàn thành buổi trước (đạt yêu cầu điểm) để mở khoá buổi này — hoặc nhập mã do giáo viên cấp.'
        : 'Bài kiểm tra này cần mã do giáo viên cấp để mở khoá.';
      input.value = '';
      msg.textContent = ''; msg.style.color = '';
      modal.classList.remove('hidden');
      input.focus();
    }
    function closeTestCodeModal() { document.getElementById('t1-code-modal').classList.add('hidden'); }
    async function submitTestCode() {
      var modal = document.getElementById('t1-code-modal');
      var input = document.getElementById('t1-code-input');
      var msg = document.getElementById('t1-code-msg');
      var btn = document.getElementById('t1-code-submit');
      var code = (input.value || '').trim().toUpperCase();
      if (!code) { msg.style.color = '#dc2626'; msg.textContent = 'Nhập mã trước đã.'; return; }
      btn.disabled = true;
      try {
        var d = await api('/review/bypass', { method: 'POST', body: JSON.stringify({ code: code, lessonCode: modal.dataset.lessonCode }) });
        msg.style.color = '#16a34a';
        msg.textContent = d.message || 'Đã mở khoá!';
        var lessonCode = d.lessonCode || modal.dataset.lessonCode;
        setTimeout(function () {
          closeTestCodeModal();
          openLesson(lessonCode);
        }, 700);
      } catch (e) {
        msg.style.color = '#dc2626';
        msg.textContent = (e && e.message) || 'Mã không hợp lệ.';
      } finally {
        btn.disabled = false;
      }
    }

    function renderStimulus(st) {
      if (!st) return '';
      var body = '';
      if (st.caption) body += '<div class="cap">' + esc(st.caption) + '</div>';
      if (st.kind === 'image' && st.imageUrl) body += '<img src="' + esc(st.imageUrl) + '" alt="' + esc(st.caption || ui.imageAlt || 'biểu đồ') + '"' + (zoom ? ' data-zoom title="Bấm để phóng to"' : '') + '>';
      if (st.kind === 'table' && st.headers) {
        body += '<div style="overflow-x:auto"><table><thead><tr>' + (st.headers || []).map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          (st.rows || []).map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
      }
      if (st.kind === 'text' && st.rows) {
        // Row shape is [label, description] or, when a real chart image exists
        // for that topic, [label, description, imageUrl] — shown as a small
        // zoomable thumbnail next to the text (same lightbox as a full-size
        // stimulus image, via the shared "img[data-zoom]" handler).
        var hasThumbs = zoom && st.rows.some(function (r) { return r[2]; });
        body += hasThumbs
          ? (st.rows || []).map(function (r) {
              var img = r[2] ? '<img class="t1-stim-thumb" src="' + esc(r[2]) + '" alt="' + esc(r[0]) + '" data-zoom title="Bấm để phóng to">' : '';
              return '<div class="t1-stim-row">' + img + '<div class="t1-stim-row-text">• <b>' + esc(r[0]) + '</b> — ' + esc(r[1]) + '</div></div>';
            }).join('')
          : '<div style="font-size:12.5px;line-height:1.7">' + (st.rows || []).map(function (r) { return '<div>• ' + r.map(esc).join(' — ') + '</div>'; }).join('') + '</div>';
      }
      if (st.note) body += '<div class="note">📌 ' + esc(st.note) + '</div>';
      return body ? '<div class="t1-stim">' + body + '</div>' : '';
    }

    // Caption + note only, no rows — used ahead of renderPairedImageSlots(),
    // which renders each row's image/description/textarea itself instead.
    function renderStimulusHeader(st) {
      if (!st) return '';
      var body = '';
      if (st.caption) body += '<div class="cap">' + esc(st.caption) + '</div>';
      if (st.note) body += '<div class="note">📌 ' + esc(st.note) + '</div>';
      return body ? '<div class="t1-stim">' + body + '</div>' : '';
    }

    // True when the stimulus is a per-topic image list (see renderStimulus's
    // "text" branch) AND there's exactly one response slot per row — the shape
    // needed to write directly under each chart instead of scrolling between
    // a stimulus block up top and a stack of textareas further down.
    function hasPairedImageSlots(ex) {
      var st = ex.stimulus;
      return !!(zoom && st && st.kind === 'text' && Array.isArray(st.rows) && st.rows.length &&
        st.rows.every(function (r) { return r[2]; }) &&
        (ex.type === 'sentence_writing' || ex.type === 'paragraph_writing') &&
        ex.responseSlots === st.rows.length);
    }

    // Each chart image + its description sits directly above its own answer
    // box — image, read the trend, write, right there — instead of a block of
    // 4 images up top followed by 4 unlabelled textareas further down the
    // page, which made it easy to lose track of which box answered which
    // chart and forced scrolling back and forth to re-check a chart.
    function renderPairedImageSlots(ex) {
      var st = ex.stimulus;
      var isSentence = ex.type === 'sentence_writing';
      var items = st.rows.map(function (r, i) {
        return '<div class="t1-graph-item">' +
          '<img class="t1-graph-img" src="' + esc(r[2]) + '" alt="' + esc(r[0]) + '" data-zoom title="Bấm để phóng to">' +
          '<div class="t1-graph-desc"><b>' + esc(r[0]) + '</b> — ' + esc(r[1]) + '</div>' +
          '<textarea class="t1-ta' + (isSentence ? '' : ' t1-para-slot') + '" rows="' + (isSentence ? 2 : 4) + '" data-slot="' + i + '" placeholder="' + (isSentence ? 'Câu ' : 'Đoạn ') + (i + 1) + '..."></textarea>' +
          '</div>';
      }).join('');
      var minW = (ex.rubric && ex.rubric.minWords) || 40;
      var meter = isSentence ? '' :
        '<div class="t1-wcmeter" id="t1-wcmeter" data-minw="' + minW + '"><div class="bar"><span></span></div><span class="n" id="t1-wc">0</span>' +
        '<span>/ mục tiêu ≥ ' + minW + ' từ (tổng ' + st.rows.length + ' đoạn)</span></div>';
      return '<div class="t1-graph-items">' + items + '</div>' + meter + rubricHint(ex);
    }

    function renderItemBody(ex) {
      var t = ex.type;
      var plug = TYPES[t];
      if (plug && plug.renderBody) return plug.renderBody(ex, E);
      if (t === 'mcq') {
        return ex.items.map(function (it) {
          return '<div class="t1-item"><div class="q">' + esc(it.prompt) + '</div>' +
            (it.options || []).map(function (o) {
              return '<label class="t1-mc"><input type="radio" name="mc-' + it.id + '" value="' + esc(o.id) + '"> <span>' + esc(o.id) + '. ' + esc(o.text) + '</span></label>';
            }).join('') + '</div>';
        }).join('');
      }
      if (t === 'gap_fill') {
        // Drag-and-drop word bank when the server sends ex.gapBank (only the
        // Speaking course does — see wt1Service.sanitizeExercise) instead of
        // free typing: correct spelling isn't the point of a linking-word/
        // filler drill. Every other course gets no gapBank and falls through
        // to plain inputs below.
        if (ex.gapBank && ex.gapBank.length) {
          var gchips = ex.gapBank.map(function (w, i) {
            return '<div class="t1-chip" data-val="' + esc(w) + '" data-ci="' + i + '">' + esc(w) + '</div>';
          }).join('');
          var dndBody = ex.items.map(function (it) {
            var n = 0;
            var html = esc(it.prompt).replace(/____/g, function () {
              var k = n++;
              return '<span class="t1-drop t1-gap-drop" data-item="' + esc(it.id) + '" data-k="' + k + '" data-ph="?"></span>';
            });
            return '<div class="t1-item"><div class="q">' + html + '</div></div>';
          }).join('');
          return '<div class="t1-cat-pool t1-gap-pool" id="t1-gap-pool"><span class="pl">Kéo từ vào đúng chỗ trống</span>' + gchips + '</div>' +
            dndBody + '<button type="button" class="t1-reset" id="t1-reset">↺ Xếp lại</button>';
        }
        return ex.items.map(function (it) {
          var n = 0;
          var html = esc(it.prompt).replace(/____/g, function () { n++; return '<input class="t1-gap-inp" data-item="' + it.id + '" data-k="' + (n - 1) + '">'; });
          return '<div class="t1-item"><div class="q">' + html + '</div></div>';
        }).join('');
      }
      if (t === 'error_correction') {
        return ex.items.map(function (it) {
          return '<div class="t1-item"><div class="q">' + esc(it.prompt) + '</div><input class="t1-input" data-item="' + it.id + '" placeholder="Viết lại cả câu cho đúng..."></div>';
        }).join('');
      }
      if (t === 'word_form') {
        return ex.items.map(function (it) {
          return '<div class="t1-item" style="display:flex;gap:12px;align-items:center"><div class="q" style="flex:1;margin:0">' + esc(it.prompt) + '</div><input class="t1-input" style="max-width:200px" data-item="' + it.id + '"></div>';
        }).join('');
      }
      if (t === 'sentence_transform') {
        // "Gõ từng chữ" typing drill (same widget as Task 2 Dịch câu tuần /
        // Viết câu nâng cao) — student types the target letter by letter
        // with hints instead of freely composing into a blank textarea, so
        // "many valid phrasings" is never a grading question in the first
        // place. [data-wbw-host] is the visible drill host; the textarea stays
        // as the hidden value bridge collectAnswers() already reads via
        // [data-item] — see bindExercise()'s WbwDrill.mount() call below,
        // which falls back to showing this textarea if it can't mount.
        return ex.items.map(function (it) {
          return '<div class="t1-item">' +
            (it.promptVi ? '<div class="t1-vi"><span class="t1-vi-tag">DỊCH</span>' + esc(it.promptVi) + '</div>' : '') +
            '<div class="q">' + esc(it.prompt) + (it.cue ? ' <em style="color:' + (ui.cueColor || '#0ea5e9') + '">(' + esc(it.cue) + ')</em>' : '') + '</div>' +
            (it.starter ? '<div style="font-size:12px;color:#6b7280;margin-bottom:4px">Bắt đầu: ' + esc(it.starter) + '</div>' : '') +
            '<div data-wbw-host="' + esc(it.id) + '"></div>' +
            '<textarea class="t1-ta" rows="2" data-item="' + it.id + '" style="display:none"></textarea></div>';
        }).join('');
      }
      if (t === 'categorize') {
        var chips = ex.items.map(function (it) {
          return '<div class="t1-chip" data-item="' + esc(it.id) + '">' + esc(it.text || it.prompt) + '</div>';
        }).join('');
        var buckets = (ex.categories || []).map(function (c) {
          return '<div class="t1-bucket"><div class="bl">' + esc(c.label) + '</div>' +
            '<div class="t1-drop" data-cat="' + esc(c.id) + '" data-ph="Kéo thẻ vào đây"></div></div>';
        }).join('');
        return '<div class="t1-cat-pool" id="t1-cat-pool"><span class="pl">Kéo mỗi thẻ vào đúng nhóm</span>' + chips + '</div>' +
          '<div class="t1-cat-grid">' + buckets + '</div>' +
          '<button type="button" class="t1-reset" id="t1-reset">↺ Xếp lại</button>';
      }
      if (t === 'matching') {
        var mrows = ex.items.map(function (it) {
          return '<div class="t1-match-row">' +
            '<div class="t1-match-left">' + esc(it.left) + '</div>' +
            '<div class="t1-drop" data-item="' + esc(it.id) + '" data-ph="Kéo đáp án vào đây"></div></div>';
        }).join('');
        var mchips = (ex.rightOptions || []).map(function (r) {
          return '<div class="t1-chip" data-right="' + esc(r) + '">' + esc(r) + '</div>';
        }).join('');
        return '<div class="t1-match">' +
            '<div class="t1-match-rows">' + mrows + '</div>' +
            '<div class="t1-match-pool" id="t1-right-pool"><span class="pl">Đáp án — kéo sang trái</span>' + mchips + '</div>' +
          '</div>' +
          '<button type="button" class="t1-reset" id="t1-reset">↺ Xếp lại</button>';
      }
      if (t === 'ordering') {
        return ex.items.map(function (it) {
          return '<div class="t1-item t1-ord-item"><div class="t1-ord-main"><div class="q">' + esc(it.prompt || 'Kéo để sắp xếp đúng thứ tự:') + '</div><div class="t1-ord" data-item="' + esc(it.id) + '">' +
            (it.tokens || []).map(function (tok) {
              return '<div class="t1-ord-row" data-tok="' + esc(tok) + '"><span class="grip">⋮⋮</span><span class="txt">' + esc(tok) + '</span></div>';
            }).join('') + '</div></div><div class="t1-ord-result" data-item="' + esc(it.id) + '"></div></div>';
        }).join('');
      }
      if (t === 'sentence_writing') {
        var slots = ex.responseSlots || 4;
        var tas = '';
        for (var i = 0; i < slots; i++) tas += '<textarea class="t1-ta" rows="2" data-slot="' + i + '" placeholder="Câu ' + (i + 1) + '..."></textarea>';
        return tas + rubricHint(ex);
      }
      if (t === 'paragraph_writing' || t === 'full_task1') {
        if (ui.essayMeter === false) {
          return '<textarea class="t1-ta" id="t1-essay" rows="' + (t === 'full_task1' ? 12 : 7) + '" placeholder="Viết bài của bạn ở đây..."></textarea>' +
            '<div class="t1-wc" id="t1-wc">0 từ</div>' + rubricHint(ex);
        }
        var rows = t === 'full_task1' ? 14 : 8;
        var minW = (ex.rubric && ex.rubric.minWords) || (t === 'full_task1' ? 150 : 40);
        var pSlots = ex.responseSlots || 1;
        // A review exercise covering several topics at once (responseSlots > 1,
        // e.g. "Overview cho 4 biểu đồ") needs one box per topic, same as
        // sentence_writing above — a single shared textarea made it impossible
        // to tell which paragraph answered which chart. minWords stays a
        // combined target across all boxes (the rubric counts total length).
        if (pSlots > 1) {
          var pTas = '';
          for (var pi = 0; pi < pSlots; pi++) pTas += '<textarea class="t1-ta t1-para-slot" rows="4" data-slot="' + pi + '" placeholder="Đoạn ' + (pi + 1) + '..."></textarea>';
          return pTas + '<div class="t1-wcmeter" id="t1-wcmeter" data-minw="' + minW + '"><div class="bar"><span></span></div><span class="n" id="t1-wc">0</span>' +
            '<span>/ mục tiêu ≥ ' + minW + ' từ (tổng ' + pSlots + ' đoạn)</span></div>' + rubricHint(ex);
        }
        return '<textarea class="t1-ta" id="t1-essay" rows="' + rows + '" data-minw="' + minW + '" placeholder="Viết bài của bạn ở đây..."></textarea>' +
          '<div class="t1-wcmeter" id="t1-wcmeter"><div class="bar"><span></span></div><span class="n" id="t1-wc">0</span>' +
          '<span>/ mục tiêu ≥ ' + minW + ' từ</span></div>' + rubricHint(ex);
      }
      return '';
    }
    function rubricHint(ex) {
      var r = ex.rubric || {};
      if (!r.checklist || !r.checklist.length) return '';
      return '<details class="t1-key" style="margin:8px 0 0"><summary>📋 Yêu cầu (rubric)</summary><ul>' +
        r.checklist.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') +
        (r.targetStructures && r.targetStructures.length ? '<li><b>Cấu trúc mục tiêu:</b> ' + esc(r.targetStructures.join(' · ')) + '</li>' : '') +
        '</ul></details>';
    }

    function timerHtml(sec) { return ui.plainTimer ? fmt(sec) : '<i class="fas fa-clock"></i> ' + fmt(sec); }

    function renderExercise() {
      var ex = curEx();
      if (!ex) return renderLessonDone();
      var plug = TYPES[ex.type];
      var isWriting = !OBJECTIVE[ex.type];
      var paired = hasPairedImageSlots(ex);
      var pct = Math.round(((state.exIdx + 1) / state.exercises.length) * 100);
      var submitBtn = '<button class="t1-submit" id="t1-submit">' +
        ((plug && plug.submitLabel) || (isWriting ? '<i class="fas fa-paper-plane"></i> Nộp bài' : '<i class="fas fa-check"></i> Kiểm tra')) + '</button>';
      return '<div class="t1-topbar"><button class="t1-btn" id="t1-quit"><i class="fas fa-times"></i> Thoát</button>' +
        '<span style="font-size:12px;color:#9ca3af;font-weight:700">Bài ' + (state.exIdx + 1) + ' / ' + state.exercises.length +
        '<button class="t1-hist-btn" id="t1-hist-btn" title="Lịch sử luyện tập bài này"><i class="fas fa-history"></i> Lịch sử</button></span>' +
        (ex.timerMinutes ? '<span class="t1-timer" id="t1-timer">' + timerHtml(ex.timerMinutes * 60) + '</span>' : '<span></span>') + '</div>' +
        (ui.progressHtml ? ui.progressHtml(pct) : '<div class="t1-prog"><span style="width:' + pct + '%"></span></div>') +
        '<div class="t1-crumb" style="padding-top:8px"><span id="t1-back-ls">' + esc(state.lesson.title) + '</span> › <b>' + esc(TYPE_LABEL[ex.type] || ex.type) + '</b></div>' +
        '<div class="t1-instr">' + esc(ex.instruction || ex.title) + '</div>' +
        (paired ? renderStimulusHeader(ex.stimulus) : renderStimulus(ex.stimulus)) +
        (ex.wordBank && ex.wordBank.length ? '<div class="t1-wb">' + ex.wordBank.map(function (w) { return '<span class="chip">' + esc(w) + '</span>'; }).join('') + '</div>' : '') +
        (paired
          ? '<div id="t1-body">' + renderPairedImageSlots(ex) + submitBtn + '</div>'
          : '<div class="t1-card" id="t1-body">' + renderItemBody(ex) + submitBtn + '</div>') +
        '<div class="t1-fb hidden" id="t1-fb"></div>';
    }

    function fmt(s) { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }

    // Drag a chip from a pool onto a single-chip drop zone (or back to the
    // pool), evicting whatever chip already sat there — matching + gap bank.
    function bindPoolDrops(pool, zoneSel, poolCls) {
      document.querySelectorAll('#t1-body .t1-chip').forEach(function (chip) {
        Dnd.bind(chip, zoneSel + ',.' + poolCls, function (el, zone) {
          if (zone.classList.contains(poolCls)) { el.classList.remove('placed'); pool.appendChild(el); return; }
          var prev = zone.querySelector('.t1-chip');
          if (prev && prev !== el) { prev.classList.remove('placed'); pool.appendChild(prev); }
          el.classList.add('placed'); zone.appendChild(el);
        });
      });
      var rb = document.getElementById('t1-reset');
      if (rb) rb.addEventListener('click', function () {
        document.querySelectorAll('#t1-body ' + zoneSel + ' .t1-chip').forEach(function (c) { c.classList.remove('placed'); pool.appendChild(c); });
      });
    }

    function bindExercise() {
      var ex = curEx();
      if (!ex) return;
      state.answered = false;
      state._submitting = false;
      document.getElementById('t1-quit').addEventListener('click', goToLesson);
      document.getElementById('t1-back-ls').addEventListener('click', goToLesson);
      document.getElementById('t1-submit').addEventListener('click', submit);
      document.getElementById('t1-hist-btn').addEventListener('click', openHistory);

      var plug = TYPES[ex.type];
      if (plug && plug.bind) plug.bind(ex, E);

      // categorize: drag each chip into a bucket (or back to the pool)
      if (ex.type === 'categorize') {
        var catPool = document.getElementById('t1-cat-pool');
        document.querySelectorAll('#t1-body .t1-chip').forEach(function (chip) {
          Dnd.bind(chip, '.t1-drop,.t1-cat-pool', function (el, zone) {
            el.classList.toggle('placed', !zone.classList.contains('t1-cat-pool'));
            zone.appendChild(el);
          });
        });
        var cr = document.getElementById('t1-reset');
        if (cr) cr.addEventListener('click', function () {
          document.querySelectorAll('#t1-body .t1-bucket .t1-chip').forEach(function (c) { c.classList.remove('placed'); catPool.appendChild(c); });
        });
      }
      // gap_fill word bank: drag a chip into a blank, one chip per blank
      if (ex.type === 'gap_fill' && ex.gapBank && ex.gapBank.length) {
        bindPoolDrops(document.getElementById('t1-gap-pool'), '.t1-gap-drop', 't1-gap-pool');
      }
      // matching: drag an answer chip from the right pool onto a left row
      if (ex.type === 'matching') {
        bindPoolDrops(document.getElementById('t1-right-pool'), '.t1-drop', 't1-match-pool');
      }
      // ordering: press a row anywhere and drag — it tracks the pointer via a
      // live transform (instead of only jumping once the cursor crosses a
      // sibling's midpoint), and displaced siblings slide into their new slot
      // with a short FLIP transition instead of snapping instantly.
      if (ex.type === 'ordering') {
        document.querySelectorAll('.t1-ord').forEach(function (box) {
          box.querySelectorAll('.t1-ord-row').forEach(function (row) {
            row.addEventListener('pointerdown', function (e) {
              if (e.button != null && e.button > 0) return;
              e.preventDefault();
              // No setPointerCapture: capturing the row and then reparenting it
              // via insertBefore below silently releases capture in Chromium the
              // moment it moves, so every pointermove after the first reorder
              // would go nowhere — the drag would just die mid-gesture. Binding
              // on document instead sidesteps that entirely.
              var pid = e.pointerId;
              var startY = e.clientY;
              var startTop = row.getBoundingClientRect().top;
              row.classList.add('is-dragging');
              function mv(ev) {
                if (ev.pointerId !== pid) return;
                // Reorder first (using the raw pointer position against every
                // OTHER row's rect, which never depends on the dragged row's
                // own transform) so the FLIP-animated siblings settle into
                // their new slots...
                var siblings = box.querySelectorAll('.t1-ord-row:not(.is-dragging)');
                var tgt = null;
                siblings.forEach(function (r) {
                  var rc = r.getBoundingClientRect();
                  if (ev.clientY > rc.top + rc.height / 2) tgt = r;
                });
                var want = tgt ? tgt.nextSibling : box.firstElementChild;
                var before = new Map();
                siblings.forEach(function (r) { before.set(r, r.getBoundingClientRect().top); });
                box.insertBefore(row, want);
                siblings.forEach(function (r) {
                  var d = before.get(r) - r.getBoundingClientRect().top;
                  if (!d) return;
                  r.style.transition = 'none';
                  r.style.transform = 'translateY(' + d + 'px)';
                  r.getBoundingClientRect(); // force a synchronous reflow so the browser
                  // registers the "from" position before the transition below kicks
                  // in — rAF here would race a later mv() call reading this row's
                  // rect before the reset lands, corrupting the reorder math.
                  r.style.transition = 'transform .16s ease';
                  r.style.transform = '';
                });
                // ...THEN position the dragged row itself off its fresh natural
                // slot, clamped so it never visually escapes its own list (over
                // the question text above it, or the next question below). Doing
                // this after the reorder (not before) matters: the row's own
                // natural position just shifted along with everyone else's.
                row.style.transform = '';
                var naturalTop = row.getBoundingClientRect().top;
                var rowH = row.getBoundingClientRect().height;
                var boxRect = box.getBoundingClientRect();
                var desiredTop = Math.max(boxRect.top, Math.min(boxRect.bottom - rowH, startTop + (ev.clientY - startY)));
                row.style.transform = 'translateY(' + (desiredTop - naturalTop) + 'px)';
              }
              function up(ev) {
                if (ev.pointerId !== pid) return;
                row.classList.remove('is-dragging');
                row.style.transform = '';
                document.removeEventListener('pointermove', mv);
                document.removeEventListener('pointerup', up);
                document.removeEventListener('pointercancel', up);
              }
              document.addEventListener('pointermove', mv);
              document.addEventListener('pointerup', up);
              document.addEventListener('pointercancel', up);
            });
          });
        });
      }
      // sentence_transform: mount a WBW typing drill per item (server ships
      // it.translationAnswer for exactly this — see wt1Service.sanitizeExercise).
      // Falls back to the plain (visible) textarea if the drill can't mount
      // (script missing / untypable answer) — same fallback WbwDrill.mount()
      // signals everywhere else it's used.
      if (ex.type === 'sentence_transform') {
        // Auto-submit once every item's drill is finished — matches how this
        // same WbwDrill component behaves everywhere else it's used (Task 2
        // weekly Dịch câu, Task 2 Templates, Viết câu nâng cao all grade
        // immediately on completion). Finishing the typing used to do nothing
        // and the student had to separately find and click "Kiểm tra" —
        // reported as "bấm nút nộp bài không được".
        // Skipped if ANY item's drill failed to mount (untypable answer,
        // script not loaded) — that item fell back to a manual textarea, so
        // the student still needs to review/type it and click submit themself.
        var wbwTotal = 0, wbwDone = 0, wbwMountFailed = false;
        ex.items.forEach(function (it, idx) {
          var host = document.querySelector('[data-wbw-host="' + it.id + '"]');
          var bridge = document.querySelector('textarea[data-item="' + it.id + '"]');
          // Only the first item auto-focuses — every instance's own after-
          // mount focus() fires on its own timer, so without this the LAST
          // item mounted would steal focus from all the ones before it.
          var ok = !!(host && bridge && it.translationAnswer && window.WbwDrill &&
            window.WbwDrill.mount(host, { answer: it.translationAnswer, bridgeInput: bridge, autoFocus: idx === 0, onComplete: function () {
              wbwDone++;
              if (!wbwMountFailed && wbwDone >= wbwTotal && !state.answered && !state._submitting) submit();
            } }));
          if (ok) wbwTotal++;
          else { wbwMountFailed = true; if (bridge) bridge.style.display = ''; }
        });
      }
      // chart / stimulus lightbox — not scoped to .t1-stim:
      // renderPairedImageSlots()'s big per-topic images (.t1-graph-img) live
      // outside that wrapper and use the same zoomable lightbox.
      if (zoom) document.querySelectorAll('img[data-zoom]').forEach(function (img) {
        img.addEventListener('click', function () {
          var lb = document.createElement('div');
          lb.className = 't1-lb';
          lb.innerHTML = '<button class="x" aria-label="Đóng">&times;</button><img src="' + img.getAttribute('src') + '" alt="">';
          lb.addEventListener('click', function () { lb.remove(); });
          document.body.appendChild(lb);
        });
      });

      // essay word-count meter + timer
      var essay = document.getElementById('t1-essay');
      if (ui.essayMeter === false) {
        if (essay) essay.addEventListener('input', function () {
          document.getElementById('t1-wc').textContent = (essay.value.trim().split(/\s+/).filter(Boolean).length) + ' từ';
        });
      } else {
        var paraSlots = document.querySelectorAll('.t1-para-slot');
        var wcBoxes = essay ? [essay] : Array.prototype.slice.call(paraSlots);
        if (wcBoxes.length) {
          var meter = document.getElementById('t1-wcmeter');
          var minW = +(essay ? essay.dataset.minw : (meter && meter.dataset.minw)) || 40;
          var upd = function () {
            var n = wcBoxes.reduce(function (sum, box) {
              return sum + (box.value.trim() ? box.value.trim().split(/\s+/).filter(Boolean).length : 0);
            }, 0);
            document.getElementById('t1-wc').textContent = n;
            if (meter) {
              meter.classList.toggle('ok', n >= minW);
              meter.querySelector('.bar > span').style.width = Math.min(100, Math.round(n / minW * 100)) + '%';
            }
          };
          wcBoxes.forEach(function (box) { box.addEventListener('input', upd); });
          upd();
        }
      }
      if (ex.timerMinutes) {
        state.timeLeft = ex.timerMinutes * 60;
        state.timer = setInterval(function () {
          state.timeLeft--; var t = document.getElementById('t1-timer');
          if (t) { t.innerHTML = timerHtml(state.timeLeft); t.classList.toggle('low', state.timeLeft <= 60); }
          if (state.timeLeft <= 0) { stopTimer(); if (!state.answered) submit(); }
        }, 1000);
      }
    }

    function collectAnswers(ex) {
      var t = ex.type, ans = {};
      if (t === 'mcq') ex.items.forEach(function (it) { var c = document.querySelector('input[name="mc-' + it.id + '"]:checked'); ans[it.id] = c ? c.value : null; });
      else if (t === 'gap_fill') ex.items.forEach(function (it) {
        var arr = [];
        if (ex.gapBank && ex.gapBank.length) {
          document.querySelectorAll('.t1-gap-drop[data-item="' + it.id + '"]').forEach(function (z) {
            var chip = z.querySelector('.t1-chip'); arr[+z.dataset.k] = chip ? chip.dataset.val : '';
          });
        } else {
          document.querySelectorAll('.t1-gap-inp[data-item="' + it.id + '"]').forEach(function (i) { arr[+i.dataset.k] = i.value.trim(); });
        }
        ans[it.id] = arr;
      });
      else if (t === 'error_correction' || t === 'word_form' || t === 'sentence_transform') ex.items.forEach(function (it) {
        var el = document.querySelector('[data-item="' + it.id + '"]'); ans[it.id] = el ? el.value.trim() : '';
      });
      else if (t === 'categorize') ex.items.forEach(function (it) {
        var chip = document.querySelector('#t1-body .t1-chip[data-item="' + it.id + '"]');
        var slot = chip && chip.closest('.t1-drop');
        ans[it.id] = slot ? (slot.dataset.cat || null) : null;
      });
      else if (t === 'matching') ex.items.forEach(function (it) {
        var chip = document.querySelector('.t1-drop[data-item="' + it.id + '"] .t1-chip');
        ans[it.id] = chip ? (chip.dataset.right || null) : null;
      });
      else if (t === 'ordering') ex.items.forEach(function (it) {
        var rows = document.querySelectorAll('.t1-ord[data-item="' + it.id + '"] .t1-ord-row');
        ans[it.id] = Array.prototype.map.call(rows, function (r) { return r.dataset.tok; });
      });
      return ans;
    }

    async function submit() {
      if (state.answered || state._submitting) return;
      var ex = curEx();
      var plug = TYPES[ex.type];
      if (plug && plug.submit) return plug.submit(ex, E);
      var isWriting = !OBJECTIVE[ex.type];
      var btn = document.getElementById('t1-submit');
      var fb = document.getElementById('t1-fb');

      if (isWriting) {
        var responses = [];
        // Multi-slot paragraph_writing (responseSlots > 1) shares the same
        // [data-slot] textarea pattern sentence_writing uses, so one check
        // covers both instead of branching on ex.type.
        var slotBoxes = document.querySelectorAll('[data-slot]');
        if (slotBoxes.length) slotBoxes.forEach(function (t) { responses.push(t.value.trim()); });
        else responses.push((document.getElementById('t1-essay') || {}).value ? document.getElementById('t1-essay').value.trim() : '');
        if (!responses.some(function (r) { return r; })) { toast('Bạn chưa viết gì', 'info'); return; }
        state._submitting = true; btn.disabled = true;
        fb.className = 't1-fb'; fb.innerHTML = '<div style="text-align:center;padding:20px"><div class="t1-spinner"></div><p style="color:#9ca3af;margin-top:8px;font-size:13px">' + (ex.type === 'sentence_writing' ? 'Đang chấm...' : 'AI đang chấm bài...') + '</p></div>';
        fb.classList.remove('hidden'); fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        try {
          var d = await api('/wt1/submit-writing', { method: 'POST', body: JSON.stringify({ exerciseCode: ex.code, responses: responses }) });
          state.answered = true; stopTimer();
          showWritingFeedback(d);
        } catch (e) {
          state._submitting = false; btn.disabled = false;
          fb.classList.add('hidden');
          toast((e && e.message) || 'Lỗi chấm bài', 'error');
        }
        return;
      }

      // objective
      var answers = collectAnswers(ex);
      state.answered = true; btn.disabled = true;
      // sentence_transform authored autoGrade:false is graded by AI (a batch
      // Gemini call, not instant like the other objective types) — show the
      // same spinner the writing types use so the student isn't staring at a
      // disabled button with no feedback for a few seconds.
      if (ex.type === 'sentence_transform' && ex.autoGrade === false) {
        fb.className = 't1-fb';
        fb.innerHTML = '<div style="text-align:center;padding:20px"><div class="t1-spinner"></div><p style="color:#9ca3af;margin-top:8px;font-size:13px">AI đang chấm bài...</p></div>';
        fb.classList.remove('hidden'); fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      try {
        var r = await api('/wt1/check', { method: 'POST', body: JSON.stringify({ exerciseCode: ex.code, answers: answers }) });
        stopTimer();
        if (r.score >= 60) { if (window.playOk) window.playOk(); } else if (window.playWrong) window.playWrong();
        showObjectiveFeedback(ex, r);
      } catch (e) {
        state.answered = false; btn.disabled = false;
        fb.classList.add('hidden');
        toast('Lỗi chấm bài', 'error');
      }
    }

    function feedbackActions(last) {
      return '<div style="display:flex;gap:8px;margin-top:12px">' +
          '<button class="t1-btn" id="t1-retry" style="flex:none"><i class="fas fa-rotate-left"></i> Làm lại</button>' +
          '<button class="t1-next" id="t1-next" style="flex:1;margin-top:0">' + (last ? 'Hoàn thành buổi học' : 'Bài tiếp theo') + ' <i class="fas fa-arrow-right"></i></button>' +
        '</div>';
    }
    // Shows a finished exercise's feedback panel with the shared
    // "Làm lại" / "Bài tiếp theo" footer — every feedback renderer ends here.
    function showFeedback(body) {
      var fb = document.getElementById('t1-fb');
      var last = state.exIdx >= state.exercises.length - 1;
      fb.className = 't1-fb';
      fb.innerHTML = body + feedbackActions(last);
      fb.classList.remove('hidden'); fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      document.getElementById('t1-next').addEventListener('click', nextExercise);
      document.getElementById('t1-retry').addEventListener('click', retryExercise);
    }
    E.showFeedback = showFeedback;

    function showObjectiveFeedback(ex, r) {
      _recordResult({ code: ex.code, label: ex.title || ('Bài ' + (state.exIdx + 1)), kind: 'objective', score: r.score, correctCount: r.correctCount, maxScore: r.maxScore });
      // Map each result item back to what the student actually saw on screen.
      // For categorize/matching the on-screen order is the student's own drag
      // order and the chips carry no visible number, so a bare "Câu 1" tells
      // them nothing — show the sentence/prompt text and put the ✔/✗ next to it.
      var meta = {};
      ex.items.forEach(function (it, i) {
        meta[it.id] = { n: i + 1, text: it.text || it.left || it.prompt || '' };
      });
      var showText = ex.type === 'categorize' || ex.type === 'matching';
      var isOrdering = ex.type === 'ordering';
      if (isOrdering) {
        // Ordering exercises hold several sub-items in one card, sitting one
        // above another — a shared answer list stuck below all of them left
        // students hunting for which line matched which box. Drop each result
        // straight into the panel next to its own box instead.
        (r.items || []).forEach(function (it) {
          var panel = document.querySelector('.t1-ord-result[data-item="' + it.id + '"]');
          if (!panel) return;
          panel.className = 't1-ord-result ' + (it.correct ? 'ok' : 'bad');
          panel.innerHTML = (it.correct ? '<span class="t1-ok">✔ Chính xác</span>' : '<span class="t1-bad">✗ Đúng là:</span> <span class="t1-model">' + esc(it.correctAnswer) + '</span>') +
            (it.explanation ? '<div style="color:#6b7280;margin-top:4px;font-weight:400">' + esc(it.explanation) + '</div>' : '');
        });
      }
      var rows = isOrdering ? '' : (r.items || []).map(function (it) {
        var m = meta[it.id] || {};
        var label = (showText && m.text) ? esc(m.text) : ('Câu ' + (m.n || ''));
        return '<div class="t1-res-item">' + (it.correct ? '<span class="t1-ok">✔</span>' : '<span class="t1-bad">✗</span>') +
          ' ' + label +
          (!it.correct && it.correctAnswer ? ' — <span class="t1-model">' + esc(it.correctAnswer) + '</span>' : '') +
          (it.explanation ? '<div style="color:#6b7280;margin-top:2px">' + esc(it.explanation) + '</div>' : '') + '</div>';
      }).join('');
      var scol = r.score >= 80 ? '#16a34a' : r.score >= 60 ? '#f59e0b' : '#dc2626';
      showFeedback('<div class="t1-fb-score"' + (ui.plainScore ? '' : ' style="color:' + scol + '"') + '>' + r.score + '%</div>' +
        '<div style="text-align:center;color:#6b7280;font-size:13px;margin-bottom:8px">' + r.correctCount + ' / ' + r.maxScore + ' câu đúng</div>' + rows);
    }

    function showWritingFeedback(d) {
      var _wex = curEx();
      if (_wex) _recordResult({ code: _wex.code, label: _wex.title || ('Bài ' + (state.exIdx + 1)), kind: 'writing', score: (d.graded === 'ai' ? null : d.score), band: d.bandEstimate });
      var body;
      if (d.graded === 'ai') {
        body = ui.aiWritingBody ? ui.aiWritingBody(d, E) : aiWritingBody(d);
      } else {
        body = (d.aiUnavailable ? '<div style="background:#fef3c7;border:1px solid #fcd34d;color:#92400e;border-radius:10px;padding:8px 12px;font-size:12.5px;line-height:1.55;margin-bottom:10px">AI chấm chi tiết đang bận. Đây là điểm sơ bộ theo rubric — nộp lại sau để được AI chấm theo band.</div>' : '') +
          '<div class="t1-fb-score">' + (d.score != null ? d.score + '%' : '') + '</div>' +
          (d.feedbackVi ? '<div style="text-align:center;font-size:13.5px;margin-bottom:8px">' + esc(d.feedbackVi) + '</div>' : '') +
          (d.checklist || []).map(function (c) {
            var mark = c.ok === true ? '<span class="t1-ok">✔</span>' : c.ok === false ? '<span class="t1-bad">✗</span>' : '•';
            return '<div class="t1-res-item">' + mark + ' ' + esc(c.label) + (c.detail ? ' <span style="color:#9ca3af">(' + esc(c.detail) + ')</span>' : '') + '</div>';
          }).join('');
      }
      // Model answer — shown for every writing type (AI-graded included),
      // collapsed so it doesn't pre-empt the student reading their own feedback.
      if (d.sampleAnswer) body += '<details class="t1-key" style="margin-top:10px"><summary>Xem bài mẫu</summary><div style="font-size:13px;line-height:1.7;margin-top:6px;white-space:pre-wrap">' + esc(d.sampleAnswer) + '</div></details>';
      showFeedback(body);
    }
    function aiWritingBody(d) {
      var s = d.scores || {};
      var b = d.bandEstimate;
      var ring = (b >= 7) ? 'hi' : (b >= 5) ? 'mid' : 'lo';
      var used = d.usedStructures || d.used || [];
      var miss = d.missingStructures || d.missing || [];
      return (b != null ? '<div class="wf-ring ' + ring + '"><span class="n">' + b + '</span><span class="l">Band</span></div>' +
        '<div style="text-align:center;font-size:12px;color:var(--text3,#9ca3af);margin-top:2px">Điểm ước lượng — 4 tiêu chí IELTS Writing</div>' : '') +
        '<div class="wf-bars">' +
          wfBar('Task Achievement', s.taskAchievement) + wfBar('Coherence & Cohesion', s.coherence) +
          wfBar('Lexical Resource', s.lexical) + wfBar('Grammar', s.grammar) +
        '</div>' +
        (d.feedbackVi ? '<div class="wf-sec"><div class="h">Nhận xét</div>' + esc(d.feedbackVi) + '</div>' : '') +
        ((d.corrections || []).length ? '<div class="wf-sec"><div class="h">Sửa lỗi</div>' + d.corrections.map(function (c) {
          return '<div style="margin-top:4px;font-size:12.5px">✎ <s style="color:#dc2626">' + esc(c.original) + '</s> → <span class="t1-model">' + esc(c.corrected) + '</span>' + (c.note ? ' <span style="color:#6b7280">(' + esc(c.note) + ')</span>' : '') + '</div>';
        }).join('') + '</div>' : '') +
        ((used.length || miss.length) ? '<div class="wf-sec"><div class="h">Cấu trúc mục tiêu</div><div class="wf-chips">' +
          used.map(function (x) { return '<span class="c used">✓ ' + esc(scStr(x)) + '</span>'; }).join('') +
          miss.map(function (x) { return '<span class="c miss">✗ ' + esc(scStr(x)) + '</span>'; }).join('') + '</div></div>' : '');
    }
    function scStr(x) {
      if (typeof x === 'string') return x;
      if (x && typeof x === 'object') return x.text || x.name || x.label || Object.values(x).find(function (v) { return typeof v === 'string'; }) || '';
      return x == null ? '' : String(x);
    }
    function wfBar(label, n) {
      var v = (n == null || isNaN(n)) ? 0 : Math.max(0, Math.min(9, n));
      var col = v >= 7 ? '#22c55e' : v >= 5 ? '#f59e0b' : '#ef4444';
      return '<div class="wf-bar"><span class="lb">' + label + '</span>' +
        '<span class="tk"><span style="width:' + Math.round(v / 9 * 100) + '%;background:' + col + '"></span></span>' +
        '<span class="v" style="color:' + col + '">' + (n != null && !isNaN(n) ? n : '–') + '</span></div>';
    }

    function nextExercise() {
      state.itemIdx = 0;
      if (state.exIdx >= state.exercises.length - 1) { finishLesson(); return; }
      state.exIdx++;
      history.replaceState({ view: 'exercise', lesson: state.lesson.code, ex: curEx().code }, '', cfg.pagePath + '?lesson=' + state.lesson.code + '&ex=' + curEx().code);
      render();
    }
    // "Làm lại" on the feedback screen — redo the SAME exercise right away
    // instead of forcing the student back through the whole lesson. render()
    // rebuilds #t1-body from scratch for curEx(), so this alone clears every
    // blank/answer; state.exIdx is untouched (a multi-item exercise restarts
    // at its question 1).
    function retryExercise() { state.itemIdx = 0; render(); }
    function goToLesson() {
      stopTimer(); state.view = 'lesson';
      history.pushState({ view: 'lesson', lesson: state.lesson.code }, '', cfg.pagePath + '?lesson=' + state.lesson.code);
      // reload lesson so done-state refreshes
      openLesson(state.lesson.code, null, true);
    }
    function renderLessonDone() { finishLesson(); return ''; }
    // Best-effort — re-fetches the overview to see whether finishing this
    // lesson just met its gate and unlocked the next one in the module, then
    // pops a floating toast announcing it. Fire-and-forget from finishLesson()
    // so a slow/failed fetch never delays or breaks the result screen itself.
    async function _notifyIfNextLessonUnlocked(lessonCode) {
      try {
        var ov = await api(cfg.overviewPath);
        state.overview = ov;
        var mods = ov.modules || [];
        for (var mi = 0; mi < mods.length; mi++) {
          var mlessons = mods[mi].lessons || [];
          var idx = mlessons.findIndex(function (x) { return x.code === lessonCode; });
          if (idx < 0) continue;
          var next = mlessons[idx + 1];
          if (next && next.unlocked && window.showToastWithTitle) {
            window.showToastWithTitle('success', '🎉 Đã hoàn thành buổi học!', 'Đã mở khoá: ' + next.title, 5000);
          }
          return;
        }
      } catch (e) { /* silent — this is a nice-to-have notification, not core flow */ }
    }
    async function finishLesson() {
      stopTimer();
      state.view = 'done';
      var lessonCode = state.lesson && state.lesson.code;
      if (lessonCode) _notifyIfNextLessonUnlocked(lessonCode);
      if (window.CourseResult) {
        window.CourseResult.renderLessonComplete({
          mount: app,
          title: state.lesson && state.lesson.title,
          results: state.results,
          onRetry: function () { state.results = []; state.exIdx = 0; state.view = 'exercise'; render(); },
          onDone: goOverview
        });
        return;
      }
      app.innerHTML = '<div style="text-align:center;padding:48px"><div style="font-size:44px">🎉</div>' +
        '<h2 class="t1-h2" style="margin-top:12px">Hoàn thành ' + esc(state.lesson.title) + '</h2>' +
        '<div style="margin-top:18px;display:flex;gap:10px;justify-content:center">' +
          '<button class="t1-btn" id="t1-again">Làm lại buổi này</button>' +
          '<button class="t1-next" style="width:auto;margin-top:0" id="t1-done">Về khoá học</button>' +
        '</div></div>';
      document.getElementById('t1-again').addEventListener('click', function () { state.results = []; state.exIdx = 0; state.view = 'exercise'; render(); });
      document.getElementById('t1-done').addEventListener('click', goOverview);
    }

    if (cfg.setup) cfg.setup(E);

    // ── popstate ────────────────────────────────────────────────────
    window.addEventListener('popstate', function (e) {
      var st = e.state || {}; stopTimer();
      if (st.view === 'lesson' && st.lesson) openLesson(st.lesson, null, true);
      else if (st.view === 'exercise' && st.lesson) openLesson(st.lesson, st.ex, true);
      else { state.view = 'overview'; loadOverview(); }
    });

    // ── test-code modal (static markup, bound once) ───────────────────
    document.getElementById('t1-code-close-btn').addEventListener('click', closeTestCodeModal);
    document.getElementById('t1-code-modal').addEventListener('click', function (e) {
      if (e.target.id === 't1-code-modal') closeTestCodeModal();
    });
    document.getElementById('t1-code-submit').addEventListener('click', submitTestCode);
    document.getElementById('t1-code-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitTestCode();
    });

    // #app is a stable container that render() only ever innerHTML's into —
    // one registration here covers every view (overview/lesson/exercise/...).
    // Blocked while a timed "Kiểm tra" (isTest lesson) exercise is still
    // running (timerMinutes set, not yet answered) — same rule
    // task1-practice.html/task2-template.html apply to their own exam
    // screens, so a student can't double-click for a word's meaning mid-timer
    // during a self-check test.
    setupDictionaryDouble('app', cfg.dictionaryKey, function () {
      var ex = state.view === 'exercise' ? curEx() : null;
      return !(ex && ex.timerMinutes && !state.answered);
    });

    // ── init ────────────────────────────────────────────────────────
    if (window.AuthService && !window.AuthService.isLoggedIn()) location.href = '/login.html';
    else loadOverview();
    return E;
  }

  window.CourseEngine = { start: start };
})();
