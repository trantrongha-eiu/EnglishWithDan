'use strict';
/* ══════════════════════════════════════════════
   🏫 LỚP HỌC CỦA TÔI — class-size / attendance / homework-miss summary for a
   student who has been added to a teacher's classroom. Data:
   GET /api/classes/my/overview (backend controllers/classAttendance.controller.js).

   Hidden entirely (never rendered, card stays display:none) for a student in
   no classroom — the homepage looks exactly as it did before this feature.

   Globals: API / authH() (dashboard.js), escHtml() (js/shared/utils.js),
   window.ApiClient.handleResponse.
══════════════════════════════════════════════ */

const CI_STATUS = {
  active:    { label: 'Đang học',   cls: 'ci-badge--active' },
  warning:   { label: 'Cảnh báo',   cls: 'ci-badge--warning' },
  failed:    { label: 'Rớt khóa',   cls: 'ci-badge--failed' },
  completed: { label: 'Hoàn thành', cls: 'ci-badge--completed' },
  dropped:   { label: 'Nghỉ học',   cls: 'ci-badge--dropped' },
};

function ciFmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
}

function ciTile(value, label, extraCls) {
  return `<div class="ci-tile ${extraCls || ''}">
    <div class="ci-tile-value">${value}</div>
    <div class="ci-tile-label">${label}</div>
  </div>`;
}

function ciClassCard(c) {
  const st = CI_STATUS[c.status] || CI_STATUS.active;
  const sub = [c.courseName, c.teacherName ? `GV: ${c.teacherName}` : ''].filter(Boolean).map(escHtml).join(' · ');
  const dates = (c.startDate || c.endDate)
    ? `<div class="ci-dates">${ciFmtDate(c.startDate)}${c.startDate && c.endDate ? ' – ' : ''}${ciFmtDate(c.endDate)}</div>`
    : '';
  const reason = c.statusReason && (c.status === 'warning' || c.status === 'failed')
    ? `<div class="ci-reason ci-reason--${c.status}">${c.status === 'failed' ? '⛔' : '⚠️'} ${escHtml(c.statusReason)}</div>`
    : '';

  return `<div class="ci-card">
    <div class="ci-card-head">
      <div>
        <div class="ci-card-title">${escHtml(c.className)}</div>
        ${sub ? `<div class="ci-card-sub">${sub}</div>` : ''}
        ${dates}
      </div>
      <span class="ci-badge ${st.cls}">${st.label}</span>
    </div>
    ${reason}
    <div class="ci-tiles">
      ${ciTile(c.classSize, 'Sĩ số lớp')}
      ${ciTile(`${c.heldSessions}${c.totalSessions ? `/${c.totalSessions}` : ''}`, 'Buổi đã học')}
      ${ciTile(c.absentTotal, 'Buổi nghỉ', c.absentTotal >= c.maxAbsencesAllowed ? 'ci-tile--danger' : '')}
      ${ciTile(c.homeworkMissedCount, 'BT thiếu', c.homeworkMissedCount >= c.homeworkWarnThreshold ? 'ci-tile--danger' : '')}
    </div>
  </div>`;
}

async function loadClassInfo() {
  const card = document.getElementById('class-info-card');
  if (!card) return;
  let data;
  try {
    const res = await fetch(`${API}/classes/my/overview`, { headers: authH() });
    data = await window.ApiClient.handleResponse(res);
  } catch (err) {
    console.error('loadClassInfo:', err);
    return; // stay hidden on error — homepage looks unchanged
  }
  if (!data || !data.hasClasses || !data.classes.length) { card.style.display = 'none'; return; }

  card.style.display = 'block';
  card.innerHTML = `<div class="ci-head"><h3>🏫 Lớp học của tôi</h3></div>
    <div class="ci-list">${data.classes.map(ciClassCard).join('')}</div>`;
}
window.loadClassInfo = loadClassInfo;
