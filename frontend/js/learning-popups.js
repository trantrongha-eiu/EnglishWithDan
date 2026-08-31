/* ══════════════════════════════════════════════════════════════════════
   learning-popups.js — Priority 2C: Popup-First Personalized Learning.

   Pure ORCHESTRATION/UI layer. Every number/reason/action shown here comes
   verbatim from the existing Priority 2B/2C APIs (GET/PUT /api/goals,
   GET /api/study-plan/current, GET /api/learning/today) — this file
   computes nothing (no scoring, no weakness, no scheduling). Self-injecting
   component, same pattern as js/upgrade-modal.js, so any page that loads
   this file gets window.EWSLearning immediately with no per-page markup.

   Popup priority (only one at a time, never stacked):
     no goal            -> Goal Setup popup
     goal + tasks today -> Today's Learning popup
     otherwise          -> no blocking popup (available on demand via the
                           floating "Today's Plan" button dashboard.html adds)
══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function api() { return (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api'; }
  function authH() { return { ...((window.AuthService && window.AuthService.authHeader()) || {}), 'Content-Type': 'application/json' }; }
  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  async function apiGet(path) {
    const res = await fetch(api() + path, { headers: authH() });
    return window.ApiClient ? window.ApiClient.handleResponse(res) : res.json();
  }
  async function apiPut(path, body) {
    const res = await fetch(api() + path, { method: 'PUT', headers: authH(), body: JSON.stringify(body) });
    return window.ApiClient ? window.ApiClient.handleResponse(res) : res.json();
  }

  const CATEGORY_ICON = { reading: '📖', listening: '🎧', writing: '✍️', speaking: '🗣️', vocabulary: '📚' };
  const CATEGORY_LABEL = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking', vocabulary: 'Từ vựng' };
  const DAY_LABEL = { mon: 'T2', tue: 'T3', wed: 'T4', thu: 'T5', fri: 'T6', sat: 'T7', sun: 'CN' };
  const BANDS = [];
  for (let b = 4.0; b <= 7.5 + 1e-9; b += 0.5) BANDS.push(Math.round(b * 10) / 10);

  // ── Shared modal shell (one overlay, content swapped per view) ─────────
  const css = document.createElement('style');
  css.textContent = `
    #lp-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9400;align-items:center;justify-content:center;padding:16px;}
    #lp-overlay.open{display:flex;}
    #lp-card{background:var(--card,#fff);color:var(--text,#111);border-radius:18px;width:100%;max-width:480px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.28);}
    #lp-head{flex-shrink:0;padding:20px 24px 14px;position:relative;border-bottom:1px solid var(--border,#e5e7eb);}
    #lp-head h3{margin:0;font-size:18px;font-weight:800;}
    #lp-close{position:absolute;top:14px;right:16px;background:var(--bg,#f3f4f6);border:none;color:var(--text2,#555);width:28px;height:28px;border-radius:50%;font-size:14px;cursor:pointer;}
    #lp-body{flex:1;min-height:0;overflow-y:auto;padding:18px 24px;}
    #lp-foot{flex-shrink:0;padding:14px 24px 20px;display:flex;gap:10px;flex-wrap:wrap;}
    .lp-btn{flex:1;min-width:120px;padding:11px 14px;border-radius:10px;border:none;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;}
    .lp-btn-primary{background:linear-gradient(135deg,var(--brand,#4f46e5),var(--brand-dark,#4338ca));color:#fff;}
    .lp-btn-ghost{background:var(--bg,#f3f4f6);color:var(--text2,#555);flex:0 0 auto;}
    .lp-field{margin-bottom:14px;}
    .lp-field label{display:block;font-size:12.5px;font-weight:600;color:var(--text2,#555);margin-bottom:5px;}
    .lp-field select,.lp-field input{width:100%;padding:9px 10px;border-radius:8px;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);color:var(--text,#111);font-family:inherit;font-size:14px;}
    .lp-days{display:flex;gap:6px;flex-wrap:wrap;}
    .lp-day-chip{padding:6px 10px;border-radius:20px;border:1px solid var(--border,#e5e7eb);font-size:12.5px;cursor:pointer;user-select:none;}
    .lp-day-chip.active{background:var(--brand,#4f46e5);border-color:var(--brand,#4f46e5);color:#fff;}
    .lp-msg{font-size:13px;margin-top:6px;}
    .lp-msg.error{color:#dc2626;}
    .lp-msg.ok{color:#16a34a;}
    .lp-empty{text-align:center;color:var(--text2,#555);font-size:14px;line-height:1.6;padding:12px 4px;}
    .lp-session{border:1px solid var(--border,#e5e7eb);border-radius:12px;padding:12px 14px;margin-bottom:10px;}
    .lp-session-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
    .lp-session-cat{font-weight:700;font-size:14.5px;}
    .lp-session-min{font-size:12.5px;color:var(--text2,#555);font-weight:600;}
    .lp-session-action{font-size:13.5px;margin-bottom:3px;}
    .lp-session-reason{font-size:12.5px;color:var(--text3,#888);margin-bottom:10px;}
    .lp-session-start{display:inline-block;padding:8px 16px;border-radius:8px;background:var(--brand,#4f46e5);color:#fff;text-decoration:none;font-size:13px;font-weight:700;border:none;cursor:pointer;font-family:inherit;}
    .lp-total{font-size:13px;color:var(--text2,#555);margin-bottom:12px;}
    .lp-day-block{margin-bottom:14px;}
    .lp-day-block-head{font-size:13px;font-weight:700;margin-bottom:6px;color:var(--text2,#555);}
    .lp-plan-item{font-size:13px;padding:6px 0;border-bottom:1px dashed var(--border,#e5e7eb);display:flex;justify-content:space-between;gap:10px;}
    .lp-plan-item:last-child{border-bottom:none;}
    .lp-review-icon{font-size:40px;text-align:center;margin-bottom:6px;}
    .lp-review-summary{text-align:center;font-size:15px;font-weight:600;margin-bottom:4px;}
    .lp-review-sub{text-align:center;font-size:13px;color:var(--text2,#555);}
    .lp-goal-intro{display:flex;gap:12px;align-items:flex-start;background:linear-gradient(135deg,rgba(79,70,229,.09),rgba(67,56,202,.06));border:1px solid var(--border,#e5e7eb);border-radius:12px;padding:12px 14px;margin-bottom:16px;}
    .lp-goal-intro-icon{font-size:26px;line-height:1;flex-shrink:0;}
    .lp-goal-intro p{margin:0;font-size:13px;line-height:1.6;color:var(--text2,#444);}
    #lp-goal-banner{margin:12px auto;max-width:1100px;width:calc(100% - 24px);border-radius:12px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:13.5px;background:linear-gradient(135deg,rgba(79,70,229,.1),rgba(67,56,202,.07));border:1px solid rgba(79,70,229,.28);color:var(--text,#1f2937);}
    #lp-goal-banner .lp-gb-go{padding:8px 16px;border:none;border-radius:8px;background:linear-gradient(135deg,var(--brand,#4f46e5),var(--brand-dark,#4338ca));color:#fff;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;white-space:nowrap;}
  `;
  document.head.appendChild(css);

  const overlay = document.createElement('div');
  overlay.id = 'lp-overlay';
  overlay.innerHTML =
    '<div id="lp-card" role="dialog" aria-modal="true" aria-labelledby="lp-title">' +
      '<div id="lp-head"><button id="lp-close" aria-label="Đóng">✕</button><h3 id="lp-title"></h3></div>' +
      '<div id="lp-body"></div>' +
      '<div id="lp-foot"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  let _triggerEl = null;
  function open(title) {
    _triggerEl = document.activeElement;
    document.getElementById('lp-title').textContent = title;
    overlay.classList.add('open');
  }
  function close() {
    overlay.classList.remove('open');
    if (_triggerEl && typeof _triggerEl.focus === 'function') _triggerEl.focus();
  }
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  overlay.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  document.getElementById('lp-close').addEventListener('click', close);

  function body() { return document.getElementById('lp-body'); }
  function foot() { return document.getElementById('lp-foot'); }

  // ── Goal Setup popup (§4) — reuses GET/PUT /api/goals verbatim, no
  // second validation layer: server-side errors are shown as-is. ─────────
  async function openGoalFlow(chainToToday) {
    open('🎯 Đặt mục tiêu IELTS');
    body().innerHTML = '<div class="lp-empty">Đang tải…</div>';
    foot().innerHTML = '';
    let goal;
    try { goal = (await apiGet('/goals')).goal; } catch (e) { goal = {}; }

    const selectedDays = new Set(goal.studyDays || []);
    const bandOptions = (val) => '<option value="">— Chưa đặt —</option>' + BANDS.map(b =>
      `<option value="${b}"${goal[val] === b ? ' selected' : ''}>${b.toFixed(1)}</option>`).join('');

    body().innerHTML = `
      <div class="lp-goal-intro">
        <div class="lp-goal-intro-icon">🎯</div>
        <p>Đặt mục tiêu để <b>thầy Dan</b> xây <b>lộ trình học cá nhân hoá</b>:
        gợi ý <b>thời gian luyện hiệu quả cho từng kỹ năng</b>
        (Reading · Listening · Writing · Speaking) dựa trên
        <b>band mục tiêu</b> và <b>ngày thi</b> của bạn.</p>
      </div>
      <div class="lp-field"><label>Band hiện tại (không bắt buộc)</label>
        <select id="lp-current">${bandOptions('currentBand')}</select></div>
      <div class="lp-field"><label>Band mục tiêu</label>
        <select id="lp-target">${bandOptions('targetBand')}</select></div>
      <div class="lp-field"><label>Ngày thi</label>
        <input type="date" id="lp-exam" value="${goal.examDate ? escHtml(goal.examDate.slice(0, 10)) : ''}"></div>
      <div class="lp-field"><label>Thời gian học mỗi tuần (phút)</label>
        <input type="number" id="lp-weekly" min="1" step="10" value="${goal.weeklyStudyMinutes ?? ''}" placeholder="vd: 240"></div>
      <div class="lp-field"><label>Số phút mỗi buổi học</label>
        <input type="number" id="lp-session" min="5" max="240" step="5" value="${goal.preferredSessionMinutes ?? ''}" placeholder="vd: 60"></div>
      <div class="lp-field"><label>Ngày học trong tuần</label>
        <div class="lp-days" id="lp-days">
          ${Object.keys(DAY_LABEL).map(d => `<span class="lp-day-chip${selectedDays.has(d) ? ' active' : ''}" data-day="${d}">${DAY_LABEL[d]}</span>`).join('')}
        </div></div>
      <div class="lp-msg" id="lp-goal-msg"></div>
    `;
    body().querySelectorAll('.lp-day-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const d = chip.dataset.day;
        if (selectedDays.has(d)) { selectedDays.delete(d); chip.classList.remove('active'); }
        else { selectedDays.add(d); chip.classList.add('active'); }
      });
    });

    foot().innerHTML = '<button class="lp-btn lp-btn-primary" id="lp-goal-save">Tạo lộ trình học cho tôi</button>';
    document.getElementById('lp-goal-save').addEventListener('click', async () => {
      const msgEl = document.getElementById('lp-goal-msg');
      msgEl.textContent = ''; msgEl.className = 'lp-msg';
      const val = id => document.getElementById(id).value;
      const payload = {
        currentBand: val('lp-current') ? parseFloat(val('lp-current')) : null,
        targetBand: val('lp-target') ? parseFloat(val('lp-target')) : null,
        examDate: val('lp-exam') || null,
        weeklyStudyMinutes: val('lp-weekly') ? parseInt(val('lp-weekly'), 10) : null,
        preferredSessionMinutes: val('lp-session') ? parseInt(val('lp-session'), 10) : null,
        studyDays: [...selectedDays],
      };
      try {
        await apiPut('/goals', payload);
        msgEl.textContent = 'Đã lưu!'; msgEl.className = 'lp-msg ok';
        renderGoalBanner(false); // goal now set — drop the persistent nudge
        if (chainToToday) {
          setTimeout(() => openToday(), 400);
        } else {
          setTimeout(close, 500);
        }
      } catch (e) {
        msgEl.textContent = e.message || 'Không lưu được mục tiêu.';
        msgEl.className = 'lp-msg error';
      }
    });
  }

  // ── Weekly Plan popup (§5) — pure render of GET /api/study-plan/current ─
  async function openWeeklyFlow() {
    open('📅 Lộ trình IELTS tuần này');
    body().innerHTML = '<div class="lp-empty">Đang tải…</div>';
    foot().innerHTML = '<button class="lp-btn lp-btn-ghost" id="lp-back-today">← Hôm nay</button>';
    document.getElementById('lp-back-today').addEventListener('click', () => openToday());

    let plan;
    try { plan = await apiGet('/study-plan/current'); } catch (e) {
      body().innerHTML = '<div class="lp-empty">Không tải được lộ trình học.</div>';
      return;
    }
    if (!plan.hasPlan) {
      body().innerHTML = `<div class="lp-empty">${escHtml(plan.message || 'Thiết lập thời gian rảnh để tạo lộ trình cá nhân hoá.')}</div>`;
      return;
    }
    body().innerHTML =
      `<div class="lp-total">Tuần ${escHtml(plan.weekStart)} → ${escHtml(plan.weekEnd)} · tổng ${plan.totalMinutes} phút</div>` +
      plan.sessions.filter(s => s.items.length).map(s => `
        <div class="lp-day-block">
          <div class="lp-day-block-head">${escHtml(s.day.toUpperCase())} · ${escHtml(s.date)} · ${s.totalMinutes}  phút</div>
          ${s.items.map(i => `
            <div class="lp-plan-item">
              <span>${CATEGORY_ICON[i.category] || ''} ${escHtml(CATEGORY_LABEL[i.category] || i.category)} — ${escHtml(i.reason)}</span>
              <span>${i.minutes}m</span>
            </div>`).join('')}
        </div>`).join('') || '<div class="lp-empty">Chưa có buổi học nào trong tuần này.</div>';
  }

  // ── Today's Learning popup (§6) — the primary discovery surface ────────
  async function openToday(preloaded) {
    open('🔔 Luyện IELTS hôm nay');
    body().innerHTML = '<div class="lp-empty">Đang tải…</div>';
    foot().innerHTML = '';

    let today;
    try { today = preloaded || await apiGet('/learning/today'); } catch (e) {
      body().innerHTML = '<div class="lp-empty">Không tải được kế hoạch hôm nay.</div>';
      return;
    }

    if (!today.hasGoal) {
      close();
      openGoalFlow(true);
      return;
    }
    if (!today.hasPlan || !today.isStudyDay || !today.sessions.length) {
      body().innerHTML = `<div class="lp-empty">${escHtml(today.message || 'Hiện chưa có lịch học nào.')}</div>`;
      const buttons = ['<button class="lp-btn lp-btn-ghost" id="lp-view-weekly">Xem lộ trình tuần</button>'];
      if (!today.hasPlan) buttons.unshift('<button class="lp-btn lp-btn-primary" id="lp-setup-avail">Thiết lập thời gian học</button>');
      foot().innerHTML = buttons.join('');
      const weeklyBtn = document.getElementById('lp-view-weekly');
      if (weeklyBtn) weeklyBtn.addEventListener('click', openWeeklyFlow);
      const availBtn = document.getElementById('lp-setup-avail');
      if (availBtn) availBtn.addEventListener('click', () => openGoalFlow(true));
      return;
    }

    body().innerHTML =
      `<div class="lp-total">Hôm nay bạn có ${today.totalMinutes} phút.</div>` +
      today.sessions.map(s => `
        <div class="lp-session">
          <div class="lp-session-head">
            <span class="lp-session-cat">${CATEGORY_ICON[s.category] || ''} ${escHtml(CATEGORY_LABEL[s.category] || s.category)}</span>
            <span class="lp-session-min">${s.minutes} phút</span>
          </div>
          <div class="lp-session-action">${escHtml(s.action)}</div>
          <div class="lp-session-reason">Vì sao? ${escHtml(s.reason)}</div>
          ${s.category === 'vocabulary'
            ? `<button class="lp-session-start" data-category="vocabulary" data-rec="${escHtml(s.recommendationType || '')}">Học từ vựng</button>`
            : `<a class="lp-session-start" href="${escHtml(s.practiceUrl)}" data-category="${escHtml(s.category)}">Luyện ${escHtml(CATEGORY_LABEL[s.category] || '')}</a>`}
        </div>`).join('');
    body().querySelectorAll('a.lp-session-start').forEach(btn => {
      btn.addEventListener('click', () => markStart(btn.dataset.category));
    });
    // Vocabulary has no standalone practice page — its Start button always
    // lives on this same page (dashboard.html), so a plain <a href> to the
    // page it's already on did nothing (silently no-op navigation). Close
    // the popup and invoke the real launcher directly instead — the same
    // functions the dashboard's own "Ôn tập hôm nay"/"Từ yếu" tiles call.
    const vocabBtn = body().querySelector('button.lp-session-start[data-category="vocabulary"]');
    if (vocabBtn) {
      vocabBtn.addEventListener('click', () => {
        markStart('vocabulary');
        close();
        if (vocabBtn.dataset.rec === 'VOCAB_WEAK' && typeof window.practiceWeakVocab === 'function') {
          window.practiceWeakVocab();
        } else if (typeof window.openReviewDueModal === 'function') {
          window.openReviewDueModal();
        } else {
          // Fallback for the unlikely case this popup ever runs on a page
          // that doesn't have dashboard-review.js loaded.
          window.location.href = 'dashboard.html';
        }
      });
    }
    foot().innerHTML = '<button class="lp-btn lp-btn-ghost" id="lp-view-weekly">Xem lộ trình tuần</button>';
    document.getElementById('lp-view-weekly').addEventListener('click', openWeeklyFlow);
  }

  // ── Review / next-action popup (§11) — caller supplies already-computed
  // result data; this file never recalculates a score. ───────────────────
  function showReviewPopup(category, summary) {
    summary = summary || {};
    open(`Hoàn thành ${CATEGORY_ICON[category] || ''} ${CATEGORY_LABEL[category] || category}`);
    const lines = [];
    if (summary.scoreLabel) lines.push(`<div class="lp-review-summary">${escHtml(summary.scoreLabel)}</div>`);
    if (summary.subLabel) lines.push(`<div class="lp-review-sub">${escHtml(summary.subLabel)}</div>`);
    body().innerHTML = `<div class="lp-review-icon">${summary.emoji || '📊'}</div>` + lines.join('') +
      `<div class="lp-review-sub" style="margin-top:14px">${escHtml(summary.nextAction || 'Xem lại bài làm, rồi tiếp tục lộ trình.')}</div>`;
    const buttons = [];
    if (typeof summary.onReview === 'function') buttons.push('<button class="lp-btn lp-btn-ghost" id="lp-review-mistakes">Xem lại lỗi</button>');
    buttons.push('<button class="lp-btn lp-btn-primary" id="lp-review-next">Về kế hoạch hôm nay</button>');
    foot().innerHTML = buttons.join('');
    if (typeof summary.onReview === 'function') {
      document.getElementById('lp-review-mistakes').addEventListener('click', () => { close(); summary.onReview(); });
    }
    document.getElementById('lp-review-next').addEventListener('click', () => { close(); openToday(); });
  }

  // ── "Start" hand-off marker — set right before navigating away to an
  // existing practice page, consumed (and cleared) by that page's own
  // result hook so a review popup only ever appears for sessions that
  // actually began from this flow; normal direct practice is unaffected. ──
  function markStart(category) {
    try { sessionStorage.setItem('ews_today_src', category); } catch (e) {}
  }
  function consumeStart(category) {
    try {
      const v = sessionStorage.getItem('ews_today_src');
      if (v === category) { sessionStorage.removeItem('ews_today_src'); return true; }
    } catch (e) {}
    return false;
  }

  // ── Persistent "you haven't set a goal yet" banner ────────────────────
  // Stays on the page (dashboard) for the whole visit until a goal exists —
  // the always-visible half of the nudge, separate from the once-per-load
  // popup. Removed the moment a goal is saved (openGoalFlow) or here on a
  // load where the goal already exists.
  function renderGoalBanner(show) {
    var existing = document.getElementById('lp-goal-banner');
    if (!show) { if (existing) existing.remove(); return; }
    if (existing) return;
    var host = document.getElementById('view-mybook')
      || document.querySelector('.dash-main')
      || document.getElementById('globalTopNav')
      || document.body;
    var el = document.createElement('div');
    el.id = 'lp-goal-banner';
    el.innerHTML =
      '<span>🎯 <b>Bạn chưa đặt mục tiêu IELTS.</b> Đặt ngay để <b>thầy Dan</b> ' +
      'gợi ý lộ trình &amp; thời gian luyện hiệu quả cho 4 kỹ năng theo band mục tiêu và ngày thi.</span>' +
      '<button type="button" class="lp-gb-go">Đặt mục tiêu</button>';
    el.querySelector('.lp-gb-go').addEventListener('click', function () { openGoalFlow(true); });
    if (host === document.body || host === document.getElementById('globalTopNav')) {
      if (host.nextSibling) host.parentNode.insertBefore(el, host.nextSibling);
      else document.body.insertBefore(el, document.body.firstChild);
    } else {
      host.insertBefore(el, host.firstChild);
    }
  }

  // ── Auto-show on page load (§24) — goal takes priority over today's
  // tasks. No-goal students get BOTH the persistent banner and the popup
  // on every dashboard load (the goal flow is the gateway to every
  // personalised suggestion, and was being ignored when shown once/session).
  // Today's-task popup stays gated to once per calendar day. ─────────────
  // Route the auto-shown popup through the shared one-at-a-time queue (falls
  // back to showing immediately when popup-queue.js isn't on the page). Only
  // the AUTO popups are queued — manual window.EWSLearning.openToday() etc.
  // from a button click always open right away.
  function _queue(opts) {
    if (window.PopupQueue) window.PopupQueue.enqueue(opts);
    else opts.show(function () {});
  }

  async function autoShow() {
    let goal;
    try { goal = (await apiGet('/goals')).goal; } catch (e) { return; }
    if (!goal.hasGoal) {
      renderGoalBanner(true);
      _queue({ id: 'lp-goal', priority: 30, until: '#lp-overlay', show: () => openGoalFlow(true) });
      return;
    }
    renderGoalBanner(false);
    let today;
    try { today = await apiGet('/learning/today'); } catch (e) { return; }
    if (today.hasPlan && today.isStudyDay && today.sessions.length) {
      const dayKey = 'ews_today_popup_shown_' + today.date;
      if (localStorage.getItem(dayKey)) return;
      localStorage.setItem(dayKey, '1');
      _queue({ id: 'lp-today', priority: 15, until: '#lp-overlay', show: () => openToday(today) });
    }
  }

  window.EWSLearning = {
    autoShow,
    openToday,
    openWeekly: openWeeklyFlow,
    openGoal: openGoalFlow,
    showReviewPopup,
    consumeStart,
  };
})();
