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

function ciFmtTime(d) {
  const dt = new Date(d);
  return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
}

// Self-check-in ("tôi có mặt") widget for today's session, if this class has
// one — ck is the matching entry from GET /classes/my/checkin (or undefined
// if that class has no session today, in which case nothing is rendered).
// Only informational + a tick button: the teacher still reviews it on Điểm
// danh (backend/controllers/classAttendance.controller.js's
// saveSessionAttendance resolves it to confirmed/rejected).
function ciCheckinBlock(ck) {
  if (!ck || !ck.session) return '';
  const sid = ck.session._id;
  if (!ck.checkin) {
    return `<div class="ci-checkin">
      <span class="ci-checkin-text">📍 Buổi ${ck.session.sessionNumber} hôm nay — bạn đã có mặt chưa?</span>
      <button type="button" class="ci-checkin-btn" onclick="ciSubmitCheckin('${sid}', this)">🙋 Điểm danh</button>
    </div>`;
  }
  const st = ck.checkin.status;
  const time = ciFmtTime(ck.checkin.checkedInAt);
  if (st === 'pending') {
    return `<div class="ci-checkin ci-checkin--pending"><span class="ci-checkin-text">⏳ Đã điểm danh lúc ${time} — chờ giáo viên xác nhận.</span></div>`;
  }
  if (st === 'confirmed') {
    return `<div class="ci-checkin ci-checkin--ok"><span class="ci-checkin-text">✅ Giáo viên đã xác nhận bạn có mặt buổi hôm nay.</span></div>`;
  }
  return `<div class="ci-checkin ci-checkin--rejected"><span class="ci-checkin-text">⚠️ Giáo viên đã điểm danh khác với báo cáo của bạn — liên hệ giáo viên nếu có nhầm lẫn.</span></div>`;
}

async function ciSubmitCheckin(sessionId, btn) {
  if (btn) btn.disabled = true;
  try {
    const res = await fetch(`${API}/classes/my/sessions/${sessionId}/checkin`, { method: 'POST', headers: authH() });
    await window.ApiClient.handleResponse(res);
    if (window.showToast) window.showToast('Đã điểm danh, chờ giáo viên xác nhận.', 'success');
    loadClassInfo();
  } catch (err) {
    if (window.showToast) window.showToast(err.message || 'Không điểm danh được', 'error');
    if (btn) btn.disabled = false;
  }
}
window.ciSubmitCheckin = ciSubmitCheckin;

function ciClassCard(c, ck) {
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
    ${ciCheckinBlock(ck)}
  </div>`;
}

async function loadClassInfo() {
  const card = document.getElementById('class-info-card');
  if (!card) return;
  let data;
  let checkinByClass = new Map();
  try {
    const res = await fetch(`${API}/classes/my/overview`, { headers: authH() });
    data = await window.ApiClient.handleResponse(res);
  } catch (err) {
    console.error('loadClassInfo:', err);
    return; // stay hidden on error — homepage looks unchanged
  }
  if (!data || !data.hasClasses || !data.classes.length) { card.style.display = 'none'; return; }

  // Best-effort — the check-in widget just doesn't render on a class card
  // if this fails, the rest of the class info card still shows fine.
  try {
    const ckRes = await fetch(`${API}/classes/my/checkin`, { headers: authH() });
    const ckData = await window.ApiClient.handleResponse(ckRes);
    checkinByClass = new Map((ckData.classes || []).map((c) => [String(c.classId), c]));
  } catch (err) { console.error('loadClassInfo (checkin):', err); }

  card.style.display = 'block';
  card.innerHTML = `<div class="ci-head"><h3>🏫 Lớp học của tôi</h3></div>
    <div class="ci-list">${data.classes.map((c) => ciClassCard(c, checkinByClass.get(String(c.classId)))).join('')}</div>`;
}
window.loadClassInfo = loadClassInfo;
