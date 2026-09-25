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

function ciTile(icon, value, label, extraCls) {
  return `<div class="ci-tile ${extraCls || ''}">
    <div class="ci-tile-icon">${icon}</div>
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
      ${ciTile('👥', c.classSize, 'Sĩ số lớp', 'ci-tile--indigo')}
      ${ciTile('📅', `${c.heldSessions}${c.totalSessions ? `/${c.totalSessions}` : ''}`, 'Buổi đã học', 'ci-tile--blue')}
      ${ciTile('🚪', c.absentTotal, 'Buổi nghỉ', 'ci-tile--amber' + (c.maxAbsencesAllowed > 0 && c.absentTotal >= c.maxAbsencesAllowed ? ' ci-tile--danger' : ''))}
      ${ciTile('📌', c.homeworkMissedCount, 'BT thiếu', 'ci-tile--rose' + (c.homeworkWarnThreshold > 0 && c.homeworkMissedCount >= c.homeworkWarnThreshold ? ' ci-tile--danger' : ''))}
    </div>
    ${ciLimitsBlock(c)}
    ${ciCheckinBlock(ck)}
  </div>`;
}

// ── Pass/fail limits — how many absences / homework misses are allowed ──
// Numbers come straight from the class policy + live counts in
// GET /api/classes/my/overview. Attendance fails when the absence-equivalent
// goes OVER maxAbsencesAllowed; homework fails when misses REACH
// homeworkFailThreshold — the "còn được" figures below already account for
// that difference (backend computes remainingAbsences / homeworkRemaining).
function ciNum(n) {
  return Number.isInteger(n) ? String(n) : String(n).replace('.', ',');
}

function ciLevel(used, warnAt, failAt, failIsReach) {
  if (failIsReach ? used >= failAt : used > failAt) return 'fail';
  if (warnAt > 0 && used >= warnAt) return 'warn';
  return 'ok';
}

function ciMeter(used, max, level) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : (used > 0 ? 100 : 0);
  return `<div class="ci-meter"><div class="ci-meter-fill ci-meter-fill--${level}" style="width:${pct}%"></div></div>`;
}

function ciAbsenceDetail(c) {
  const parts = [];
  parts.push(`có phép <b>${c.absentExcused}</b>`);
  parts.push(`không phép <b>${c.absentUnexcused}</b>`);
  if (c.lateCount) parts.push(`đi trễ <b>${c.lateCount}</b>`);
  return parts.join(' · ');
}

function ciAbsenceNotes(c) {
  const notes = [];
  notes.push(c.excusedCountsAsAbsence
    ? 'Nghỉ <b>có phép</b> vẫn được tính vào số buổi nghỉ.'
    : 'Nghỉ <b>có phép</b> không bị tính vào số buổi nghỉ.');
  notes.push(`Đi trễ <b>${c.lateToAbsenceRatio} lần</b> = 1 buổi nghỉ.`);
  return notes.join(' ');
}

function ciLimitsBlock(c) {
  const aLevel = c.failOnExceed === false
    ? (c.absenceEquivalent >= c.warnThreshold ? 'warn' : 'ok')
    : ciLevel(c.absenceEquivalent, c.warnThreshold, c.maxAbsencesAllowed, false);
  const hLevel = ciLevel(c.homeworkMissedCount, c.homeworkWarnThreshold, c.homeworkFailThreshold, true);

  const aLine = aLevel === 'fail'
    ? '⛔ Đã vượt số buổi được nghỉ.'
    : `Còn được nghỉ tối đa <b>${ciNum(c.remainingAbsences)}</b> buổi${c.failOnExceed === false ? '' : ' — nghỉ quá số này sẽ <b>rớt khóa học</b>'}.`;
  const hLine = hLevel === 'fail'
    ? '⛔ Đã thiếu bài tập tới mức rớt khóa học.'
    : `Còn được thiếu tối đa <b>${c.homeworkRemaining}</b> bài — thiếu tới <b>${c.homeworkFailThreshold}</b> bài sẽ <b>rớt khóa học</b>.`;

  const missed = (c.missedAssignments || []);
  const missedList = missed.length
    ? `<details class="ci-missed"><summary>Xem ${missed.length} bài tập đang tính là thiếu</summary><ul>${missed.map((m) =>
      `<li><span>${escHtml(m.title)}</span><span class="ci-missed-meta">${m.deadline ? `hạn ${ciFmtDate(m.deadline)}` : 'không có hạn'} · ${m.done}/${m.total} mục${m.archived ? ' · <span class="ci-missed-tag">đã đóng</span>' : ''}</span></li>`).join('')}</ul>
      <div class="ci-limit-note">Làm bù đầy đủ bài còn thiếu (kể cả bài đã đóng) sẽ được trừ khỏi số lần thiếu.</div></details>`
    : '';

  return `<div class="ci-limits">
    <div class="ci-limit ci-limit--${aLevel}">
      <div class="ci-limit-head">
        <span class="ci-limit-title">🚪 Số buổi nghỉ</span>
        <span class="ci-limit-count"><b>${ciNum(c.absenceEquivalent)}</b> / ${c.maxAbsencesAllowed} buổi được phép</span>
      </div>
      ${ciMeter(c.absenceEquivalent, c.maxAbsencesAllowed, aLevel)}
      <div class="ci-limit-detail">${ciAbsenceDetail(c)}</div>
      <div class="ci-limit-line">${aLine}</div>
      <div class="ci-limit-note">${ciAbsenceNotes(c)}</div>
    </div>
    <div class="ci-limit ci-limit--${hLevel}">
      <div class="ci-limit-head">
        <span class="ci-limit-title">📌 Số lần thiếu bài tập</span>
        <span class="ci-limit-count"><b>${c.homeworkMissedCount}</b> / ${c.homeworkFailThreshold} (mức rớt)</span>
      </div>
      ${ciMeter(c.homeworkMissedCount, c.homeworkFailThreshold, hLevel)}
      <div class="ci-limit-line">${hLine}</div>
      <div class="ci-limit-note">Bài tập quá hạn chưa hoàn thành đầy đủ bị tính là thiếu — kể cả khi giáo viên đã đóng (lưu trữ) bài đó.</div>
      ${missedList}
    </div>
  </div>`;
}

// ── Warning popup ──────────────────────────────────────────────────────
// Shown when a class has any absence or missed homework (or is already in
// warning/failed). At most once a day per browser, but again immediately if
// the numbers change — so a new absence / miss is never silently swallowed.
// localStorage is only a convenience here: if it throws, the popup just
// shows on every dashboard load.
const CI_POPUP_KEY = 'ewd_class_warning_popup';

function ciPopupNeeded(c) {
  return c.absenceEquivalent > 0 || c.homeworkMissedCount > 0 || c.status === 'warning' || c.status === 'failed';
}

function ciTodayVN() {
  return new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
}

function ciMaybeShowWarningPopup(classes) {
  const flagged = classes.filter(ciPopupNeeded);
  if (!flagged.length) return;
  const sig = flagged.map((c) => `${c.classId}:${c.status}:${c.absenceEquivalent}:${c.homeworkMissedCount}`).join('|') + '@' + ciTodayVN();
  try { if (localStorage.getItem(CI_POPUP_KEY) === sig) return; } catch (_) { /* show anyway */ }
  if (document.getElementById('ci-warn-modal')) return;

  const anyFailed = flagged.some((c) => c.status === 'failed');
  const rows = flagged.map((c) => {
    const failed = c.status === 'failed';
    const aOver = c.failOnExceed !== false && c.absenceEquivalent > c.maxAbsencesAllowed;
    const hOver = c.homeworkMissedCount >= c.homeworkFailThreshold;
    return `<div class="ci-warn-class ${failed ? 'ci-warn-class--failed' : ''}">
      <div class="ci-warn-class-name">${escHtml(c.className)}${failed ? ' <span class="ci-badge ci-badge--failed">Rớt khóa</span>' : c.status === 'warning' ? ' <span class="ci-badge ci-badge--warning">Cảnh báo</span>' : ''}</div>
      <ul>
        <li>🚪 Đã nghỉ <b>${ciNum(c.absenceEquivalent)}/${c.maxAbsencesAllowed}</b> buổi được phép (có phép ${c.absentExcused}, không phép ${c.absentUnexcused}${c.lateCount ? `, trễ ${c.lateCount}` : ''}) —
          ${aOver ? '<b class="ci-warn-bad">đã vượt giới hạn</b>' : `còn được nghỉ <b>${ciNum(c.remainingAbsences)}</b> buổi`}.</li>
        <li>📌 Thiếu bài tập <b>${c.homeworkMissedCount}</b> lần (rớt khi thiếu ${c.homeworkFailThreshold}) —
          ${hOver ? '<b class="ci-warn-bad">đã tới mức rớt</b>' : `còn được thiếu <b>${c.homeworkRemaining}</b> lần`}.</li>
      </ul>
    </div>`;
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'ci-warn-modal';
  modal.className = 'ci-warn-overlay';
  modal.innerHTML = `<div class="ci-warn-box" role="alertdialog" aria-modal="true" aria-labelledby="ci-warn-title">
    <div class="ci-warn-title" id="ci-warn-title">${anyFailed ? '⛔ Bạn đã không đạt yêu cầu lớp học' : '⚠️ Nhắc nhở chuyên cần & bài tập'}</div>
    <div class="ci-warn-body">
      ${rows}
      <p class="ci-warn-foot">${anyFailed
        ? 'Vui lòng liên hệ giáo viên để được hướng dẫn.'
        : 'Nếu nghỉ quá số buổi cho phép hoặc thiếu bài tập tới mức rớt, bạn sẽ <b>rớt khóa học</b>. Bài quá hạn chưa làm — kể cả bài giáo viên đã đóng — vẫn bị tính là thiếu.'}</p>
    </div>
    <div class="ci-warn-actions">
      <a class="ci-warn-btn ci-warn-btn--ghost" href="#homework-card" data-close>Xem bài tập</a>
      <button type="button" class="ci-warn-btn" data-close>Tôi đã hiểu</button>
    </div>
  </div>`;
  function close() {
    try { localStorage.setItem(CI_POPUP_KEY, sig); } catch (_) { /* ignore */ }
    modal.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(modal);
  const btn = modal.querySelector('button[data-close]');
  if (btn) btn.focus();
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
  ciMaybeShowWarningPopup(data.classes);
}
window.loadClassInfo = loadClassInfo;
