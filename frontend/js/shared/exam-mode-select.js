/**
 * shared/exam-mode-select.js — "Luyện tập" vs "Test Simulation" popup shown
 * before starting any Reading/Listening/Writing attempt (full test AND
 * individual/"lẻ" practice). Self-contained on the same pattern
 * confirm-dialog.js already uses: builds its own modal on first use with
 * css/components.css's .modal-overlay/.modal-box classes (loaded on every
 * page this is used from), no page-specific markup required.
 *
 * Usage:
 *   ExamModeSelect.open({
 *     skill: 'reading' | 'listening' | 'writing',
 *     onPractice: function () { ... },      // today's existing behavior
 *     onSimulation: function () { ... },    // new Test Simulation flow
 *     preferred: 'practice' | 'simulation', // optional — from a ?exam= link:
 *                                           // only that card is shown
 *     parts: { count: 3, unit: 'Passage',   // optional — full Reading/Listening
 *              minutesEach: 20,             // test: "Chọn phần làm" chips. The
 *              available: true,             // callbacks then get the picked part
 *              picked: [1, 2] },            // numbers ([1, 2]) or null = all.
 *                                           // picked: pre-pick (a ?parts= link).
 *   });
 *
 * On open, fetches GET /api/exam-simulation/cooldown so a student who was
 * recently disqualified sees the Simulation option greyed out with a live
 * countdown immediately — never a dead click that fails only after they
 * try. The actual enforcement is server-side regardless (see
 * backend/services/examSimulationService.js); this is purely so the UI
 * doesn't lie about availability.
 *
 * The bottom of this file is ExamFullscreen — the exam screen's fullscreen
 * button, used by the same three pages.
 */
(function () {
  'use strict';

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  function authHeader() { return window.AuthService ? window.AuthService.authHeader() : {}; }

  var SKILL_LABEL = { reading: 'Reading', listening: 'Listening', writing: 'Writing' };

  function ensureStyle() {
    if (document.getElementById('ews-mode-select-style')) return;
    var style = document.createElement('style');
    style.id = 'ews-mode-select-style';
    style.textContent = [
      '#ews-mode-select-modal.hidden { display: none !important; }',
      '.ews-ms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }',
      '@media (max-width: 560px) { .ews-ms-grid { grid-template-columns: 1fr; } }',
      '.ews-ms-card { border: 1.5px solid var(--border, #e5e7eb); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 10px; text-align: left; background: var(--surface, #fff); }',
      '.ews-ms-card.ews-ms-sim { border-color: #fecaca; background: var(--ews-ms-sim-bg, #fef2f2); }',
      '[data-theme="dark"] .ews-ms-card.ews-ms-sim { --ews-ms-sim-bg: #3f1d1d; }',
      '.ews-ms-icon { font-size: 26px; line-height: 1; }',
      '.ews-ms-title { font-size: 15px; font-weight: 800; color: var(--text, #111827); }',
      '.ews-ms-desc { font-size: 12.5px; color: var(--text2, #6b7280); line-height: 1.55; flex: 1; }',
      '.ews-ms-list { list-style: none; margin: 0; padding: 0; font-size: 12.5px; color: var(--text2, #6b7280); display: flex; flex-direction: column; gap: 4px; }',
      '.ews-ms-list li::before { content: "· "; }',
      '.ews-ms-btn { margin-top: 4px; border: none; border-radius: 10px; padding: 10px 14px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: filter .12s, transform .08s; }',
      '.ews-ms-btn:active { transform: scale(.98); }',
      '.ews-ms-btn:hover { filter: brightness(1.06); }',
      '.ews-ms-btn-practice { background: #0ea5e9; color: #fff; }',
      '.ews-ms-btn-sim { background: #dc2626; color: #fff; }',
      '.ews-ms-btn:disabled { background: #d1d5db; color: #6b7280; cursor: not-allowed; filter: none; }',
      '.ews-ms-cooldown { font-size: 12px; font-weight: 700; color: #b91c1c; }',
      '.ews-ms-grid.ews-ms-only { grid-template-columns: 1fr; }',
      '.ews-ms-grid.ews-ms-only-practice .ews-ms-sim, .ews-ms-grid.ews-ms-only-simulation .ews-ms-practice { display: none; }',
      '.ews-ms-other { display: block; margin: 12px auto 0; background: none; border: none; color: var(--text2, #6b7280); font-size: 12.5px; text-decoration: underline; cursor: pointer; }',
      '.ews-ms-other.hidden { display: none; }',
      '.ews-ms-parts { border: 1.5px dashed var(--border, #e5e7eb); border-radius: 14px; padding: 12px 14px; margin: 0 0 14px; }',
      '.ews-ms-parts.hidden { display: none; }',
      '.ews-ms-parts-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }',
      '.ews-ms-parts-title { font-size: 13px; font-weight: 800; color: var(--text, #111827); }',
      '.ews-ms-parts-sum { font-size: 12.5px; font-weight: 700; color: #0369a1; }',
      '.ews-ms-parts-sum.ews-ms-parts-none { color: #b91c1c; }',
      '.ews-ms-chips { display: flex; flex-wrap: wrap; gap: 8px; }',
      '.ews-ms-chip { border: 1.5px solid var(--border, #d1d5db); background: var(--surface, #fff); color: var(--text2, #6b7280); border-radius: 999px; padding: 6px 14px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }',
      '.ews-ms-chip[aria-pressed="true"] { border-color: #0ea5e9; background: #e0f2fe; color: #0369a1; }',
      '[data-theme="dark"] .ews-ms-chip[aria-pressed="true"] { background: #0c4a6e; color: #e0f2fe; }',
      '.ews-ms-parts-note { font-size: 12px; color: var(--text2, #6b7280); margin-top: 8px; line-height: 1.5; }',
      '.ews-ms-parts-note:empty { display: none; }',
    ].join('\n');
    document.head.appendChild(style);
  }

  function ensureModal() {
    var modal = document.getElementById('ews-mode-select-modal');
    if (modal) return modal;
    ensureStyle();
    modal = document.createElement('div');
    modal.id = 'ews-mode-select-modal';
    modal.className = 'modal-overlay hidden';
    modal.innerHTML =
      '<div class="modal-box modal-md" role="dialog" aria-modal="true" aria-labelledby="ews-ms-title">' +
        '<div class="modal-body">' +
          '<h3 id="ews-ms-title" style="margin:0 0 4px">Chọn chế độ làm bài</h3>' +
          '<p style="margin:0 0 16px;color:var(--text2,#6b7280);font-size:13px" id="ews-ms-sub"></p>' +
          '<div class="ews-ms-parts hidden" id="ews-ms-parts">' +
            '<div class="ews-ms-parts-head">' +
              '<span class="ews-ms-parts-title">Chọn phần làm</span>' +
              '<span class="ews-ms-parts-sum" id="ews-ms-parts-sum"></span>' +
            '</div>' +
            '<div class="ews-ms-chips" id="ews-ms-chips"></div>' +
            '<div class="ews-ms-parts-note" id="ews-ms-parts-note"></div>' +
          '</div>' +
          '<div class="ews-ms-grid" id="ews-ms-grid">' +
            '<div class="ews-ms-card ews-ms-practice">' +
              '<div class="ews-ms-icon">✏️</div>' +
              '<div class="ews-ms-title">Luyện tập</div>' +
              '<ul class="ews-ms-list">' +
                '<li>Tra từ điển &amp; dịch bình thường</li>' +
                '<li>Không giám sát, không tính vi phạm</li>' +
                '<li>Phù hợp để học và ôn tập</li>' +
              '</ul>' +
              '<button type="button" class="ews-ms-btn ews-ms-btn-practice" id="ews-ms-practice-btn">Bắt đầu Luyện tập</button>' +
            '</div>' +
            '<div class="ews-ms-card ews-ms-sim">' +
              '<div class="ews-ms-icon">🎯</div>' +
              '<div class="ews-ms-title">Test Simulation</div>' +
              '<ul class="ews-ms-list">' +
                '<li>Không được tra từ / dịch</li>' +
                '<li>Có giám sát — rời màn hình / chuyển tab bị tính 1 vi phạm (1 gậy)</li>' +
                '<li><b>5 gậy</b> sẽ huỷ bài, khoá 5 phút — bài làm đến lúc bị huỷ vẫn được gửi cho giáo viên, nhưng không tính kết quả</li>' +
                '<li>Máy tính: bắt buộc chia sẻ toàn màn hình — chụp ảnh mỗi lần vi phạm</li>' +
                '<li>Trong lúc làm bài, đừng bấm nút <b>"Ẩn"</b> / <b>"Dừng chia sẻ"</b> trên thanh chia sẻ của trình duyệt — bấm vào cũng tính 1 gậy</li>' +
                '<li id="ews-ms-sim-time" hidden></li>' +
              '</ul>' +
              '<div id="ews-ms-sim-status"></div>' +
              '<button type="button" class="ews-ms-btn ews-ms-btn-sim" id="ews-ms-sim-btn">Bắt đầu Test Simulation</button>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="ews-ms-other hidden" id="ews-ms-other-btn">Chọn chế độ khác</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    function close() {
      modal.classList.add('hidden');
      clearInterval(modal._countdownTimer);
    }
    modal._close = close;
    return modal;
  }

  function _fmtMMSS(sec) {
    sec = Math.max(0, Math.ceil(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  // "Chọn phần làm" — one toggle chip per passage/section, all on by
  // default. Returns a getter for the pick: null = every part (the whole
  // test, today's behavior), otherwise the picked part numbers. Calls
  // onChange(count) whenever the pick changes.
  function _renderParts(cfg, skill, onChange) {
    var box = document.getElementById('ews-ms-parts');
    var chips = document.getElementById('ews-ms-chips');
    var sum = document.getElementById('ews-ms-parts-sum');
    var note = document.getElementById('ews-ms-parts-note');
    var count = cfg && cfg.count;
    box.classList.toggle('hidden', !count);
    chips.innerHTML = '';
    note.textContent = '';
    if (!count) return function () { return null; };

    var unit = cfg.unit || 'Part';
    var picked = [];
    for (var i = 1; i <= count; i++) {
      if (!cfg.picked || !cfg.picked.length || cfg.picked.indexOf(i) >= 0) picked.push(i);
    }

    if (cfg.available === false) {
      sum.textContent = 'Cả bài';
      sum.className = 'ews-ms-parts-sum';
      note.textContent = 'Đề này chưa có audio riêng từng ' + unit.toLowerCase() + ' — chỉ làm được cả bài.';
      return function () { return null; };
    }

    function refresh() {
      chips.querySelectorAll('.ews-ms-chip').forEach(function (c) {
        c.setAttribute('aria-pressed', picked.indexOf(+c.dataset.part) >= 0 ? 'true' : 'false');
      });
      var n = picked.length;
      var label = n === count ? 'Cả bài' : n + ' ' + unit.toLowerCase();
      if (!n) sum.textContent = 'Chọn ít nhất 1 ' + unit.toLowerCase();
      else sum.textContent = cfg.minutesEach ? label + ' · ' + (n * cfg.minutesEach) + ' phút' : label;
      sum.className = 'ews-ms-parts-sum' + (n ? '' : ' ews-ms-parts-none');
      note.textContent = n && n < count
        ? (skill === 'listening' ? 'Mỗi section phát audio riêng của nó. ' : '') + 'Band quy đổi theo 40 câu (ước tính).'
        : '';
      onChange(n);
    }

    for (var p = 1; p <= count; p++) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'ews-ms-chip';
      chip.dataset.part = String(p);
      chip.textContent = unit + ' ' + p;
      chip.onclick = function () {
        var n = +this.dataset.part;
        var at = picked.indexOf(n);
        if (at >= 0) picked.splice(at, 1); else picked.push(n);
        picked.sort(function (a, b) { return a - b; });
        refresh();
      };
      chips.appendChild(chip);
    }
    refresh();
    return function () { return picked.length === count ? null : picked.slice(); };
  }

  function open(opts) {
    opts = opts || {};
    var modal = ensureModal();
    document.getElementById('ews-ms-sub').textContent = SKILL_LABEL[opts.skill]
      ? 'Chọn cách bạn muốn làm bài ' + SKILL_LABEL[opts.skill] + ' này.'
      : 'Chọn cách bạn muốn làm bài này.';

    var practiceBtn = document.getElementById('ews-ms-practice-btn');
    var simBtn = document.getElementById('ews-ms-sim-btn');
    var simStatus = document.getElementById('ews-ms-sim-status');

    // opts.preferred ('practice' | 'simulation') — the page was opened from
    // a mode-specific link (?exam=...): show only that mode's card, with a
    // "Chọn chế độ khác" escape hatch back to the normal two-card choice.
    var grid = document.getElementById('ews-ms-grid');
    var otherBtn = document.getElementById('ews-ms-other-btn');
    var preferred = opts.preferred === 'practice' || opts.preferred === 'simulation' ? opts.preferred : null;
    grid.className = 'ews-ms-grid' + (preferred ? ' ews-ms-only ews-ms-only-' + preferred : '');
    otherBtn.classList.toggle('hidden', !preferred);
    otherBtn.onclick = function () {
      grid.className = 'ews-ms-grid';
      otherBtn.classList.add('hidden');
    };

    // Nothing picked → neither mode can start. simReady tracks the cooldown
    // check so un-picking/re-picking never enables a cooled-down Simulation.
    var simReady = false;
    var hasPick = true;
    function syncButtons() {
      practiceBtn.disabled = !hasPick;
      simBtn.disabled = !(simReady && hasPick);
    }
    modal._setSimReady = function (ready) { simReady = ready; syncButtons(); };
    modal._getParts = _renderParts(opts.parts, opts.skill, function (n) { hasPick = n > 0; syncButtons(); });

    var simTime = document.getElementById('ews-ms-sim-time');
    var simTimeText = opts.skill === 'reading' ? '<b>Hết giờ tự động nộp bài</b>'
      : opts.skill === 'listening' ? 'Audio tự phát liên tục — <b>hết audio 30 giây là tự động nộp bài</b>'
      : '';
    simTime.innerHTML = simTimeText;
    simTime.hidden = !simTimeText;

    practiceBtn.onclick = function () {
      if (!hasPick) return;
      modal._close();
      if (typeof opts.onPractice === 'function') opts.onPractice(modal._getParts());
    };

    modal._setSimReady(false);
    simStatus.innerHTML = '<span class="ews-ms-cooldown">Đang kiểm tra…</span>';
    simBtn.onclick = null;

    clearInterval(modal._countdownTimer);
    fetch(API + '/exam-simulation/cooldown', { headers: authHeader() })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.active) {
          _renderCooldown(modal, simBtn, simStatus, d.remainingSeconds, opts);
        } else {
          simStatus.innerHTML = '';
          modal._setSimReady(true);
          simBtn.onclick = function () { _goSimulation(modal, opts); };
        }
      })
      .catch(function () {
        // Network hiccup checking cooldown — fail safe by NOT letting the
        // student in; the real server-side check on start() would catch a
        // genuine cooldown anyway, but showing "available" on a check we
        // couldn't actually make is misleading. Offer a retry instead.
        simStatus.innerHTML = '<span class="ews-ms-cooldown">Không kiểm tra được trạng thái. <a href="#" id="ews-ms-retry">Thử lại</a></span>';
        var retry = document.getElementById('ews-ms-retry');
        if (retry) retry.onclick = function (e) { e.preventDefault(); open(opts); };
      });

    modal.classList.remove('hidden');
    if (preferred === 'practice') practiceBtn.focus();
  }

  // Simulation is proctored: the student must share their entire screen
  // (desktop) before the attempt is created — see shared/proctor-capture.js.
  // "Huỷ" on that gate just leaves them on the list, no attempt row written.
  function _goSimulation(modal, opts) {
    var parts = modal._getParts ? modal._getParts() : null;
    if (parts && !parts.length) return;
    modal._close();
    var gate = window.ProctorCapture ? window.ProctorCapture.ensureShare({ cancelable: true }) : Promise.resolve(true);
    gate.then(function (ok) {
      if (ok && typeof opts.onSimulation === 'function') opts.onSimulation(parts);
    });
  }

  function _renderCooldown(modal, simBtn, simStatus, remainingSeconds, opts) {
    modal._setSimReady(false);
    var left = remainingSeconds;
    function render() {
      simStatus.innerHTML = '<span class="ews-ms-cooldown">Vừa bị huỷ do vi phạm giám sát — thử lại sau ' + _fmtMMSS(left) + '</span>';
    }
    render();
    modal._countdownTimer = setInterval(function () {
      left -= 1;
      if (left <= 0) {
        clearInterval(modal._countdownTimer);
        simStatus.innerHTML = '';
        modal._setSimReady(true);
        simBtn.onclick = function () { _goSimulation(modal, opts); };
        return;
      }
      render();
    }, 1000);
  }

  window.ExamModeSelect = { open: open };
})();

// ════════════════════════════════════════════════════════════════════════
//  Exam fullscreen button — window.ExamFullscreen
// ════════════════════════════════════════════════════════════════════════
/**
 * ExamFullscreen — the exam screen's fullscreen button.
 *
 * Was copied into listening.html, reading.html and js/writing.js, each copy
 * differing only in which screen goes fullscreen, which buttons show the
 * state and which popups have to come along. A page now calls:
 *
 *   ExamFullscreen.install({
 *     target:  () => element,           // what to put into fullscreen
 *     buttons: [[btnId, iconId], …],    // title + expand/compress icon follow the state
 *     carry:   [id, …],                 // popups/modals moved INTO the fullscreen
 *   });                                 // element while it's up — anything outside
 *                                       // it is not rendered in fullscreen
 *
 * and keeps calling window.toggleFullscreen() from its onclick handlers.
 */
(function () {
  function install(opts) {
    function toggleFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen && document.exitFullscreen();
        return;
      }
      const el = opts.target();
      el && el.requestFullscreen && el.requestFullscreen();
    }

    document.addEventListener('fullscreenchange', () => {
      const fsEl = document.fullscreenElement;
      (opts.buttons || []).forEach(([btnId, iconId]) => {
        const btn  = document.getElementById(btnId);
        const icon = document.getElementById(iconId);
        if (btn)  btn.title = fsEl ? 'Thoát toàn màn hình' : 'Toàn màn hình';
        if (icon) icon.className = fsEl ? 'fas fa-compress' : 'fas fa-expand';
      });
      (opts.carry || []).forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (fsEl) {
          if (!fsEl.contains(el)) { el._fsPrev = el.parentNode; fsEl.appendChild(el); }
        } else if (el._fsPrev) {
          el._fsPrev.appendChild(el);
          el._fsPrev = null;
        }
      });
    });

    window.toggleFullscreen = toggleFullscreen;
  }

  window.ExamFullscreen = { install: install };
})();
