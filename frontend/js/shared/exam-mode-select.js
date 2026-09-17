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
 *   });
 *
 * On open, fetches GET /api/exam-simulation/cooldown so a student who was
 * recently disqualified sees the Simulation option greyed out with a live
 * countdown immediately — never a dead click that fails only after they
 * try. The actual enforcement is server-side regardless (see
 * backend/services/examSimulationService.js); this is purely so the UI
 * doesn't lie about availability.
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
          '<div class="ews-ms-grid">' +
            '<div class="ews-ms-card">' +
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
                '<li>Có giám sát — rời màn hình bị tính vi phạm</li>' +
                '<li>5 vi phạm sẽ huỷ bài, khoá 5 phút</li>' +
              '</ul>' +
              '<div id="ews-ms-sim-status"></div>' +
              '<button type="button" class="ews-ms-btn ews-ms-btn-sim" id="ews-ms-sim-btn">Bắt đầu Test Simulation</button>' +
            '</div>' +
          '</div>' +
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

  function open(opts) {
    opts = opts || {};
    var modal = ensureModal();
    document.getElementById('ews-ms-sub').textContent = SKILL_LABEL[opts.skill]
      ? 'Chọn cách bạn muốn làm bài ' + SKILL_LABEL[opts.skill] + ' này.'
      : 'Chọn cách bạn muốn làm bài này.';

    var practiceBtn = document.getElementById('ews-ms-practice-btn');
    var simBtn = document.getElementById('ews-ms-sim-btn');
    var simStatus = document.getElementById('ews-ms-sim-status');

    practiceBtn.onclick = function () {
      modal._close();
      if (typeof opts.onPractice === 'function') opts.onPractice();
    };

    simBtn.disabled = true;
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
          simBtn.disabled = false;
          simBtn.onclick = function () {
            modal._close();
            if (typeof opts.onSimulation === 'function') opts.onSimulation();
          };
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
  }

  function _renderCooldown(modal, simBtn, simStatus, remainingSeconds, opts) {
    simBtn.disabled = true;
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
        simBtn.disabled = false;
        simBtn.onclick = function () {
          modal._close();
          if (typeof opts.onSimulation === 'function') opts.onSimulation();
        };
        return;
      }
      render();
    }, 1000);
  }

  window.ExamModeSelect = { open: open };
})();
