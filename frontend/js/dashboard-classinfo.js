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

// Buổi nghỉ / BT thiếu tiles double as buttons: the full limit breakdown
// below them is hidden until the student taps one (product decision
// 2026-10-01 — the always-open panels were too much for the homepage).
function ciToggleTile(icon, value, label, extraCls, panelId) {
  return `<button type="button" class="ci-tile ci-tile--toggle ${extraCls || ''}" aria-expanded="false" aria-controls="${panelId}"
      onclick="ciToggleLimit(this)" title="Bấm để xem chi tiết">
    <div class="ci-tile-icon">${icon}</div>
    <div class="ci-tile-value">${value}</div>
    <div class="ci-tile-label">${label} <i class="fas fa-chevron-down ci-tile-caret" aria-hidden="true"></i></div>
  </button>`;
}

function ciToggleLimit(btn) {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  if (!panel) return;
  const open = btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', String(open));
  panel.hidden = !open;
  const wrap = panel.parentElement;
  const shown = wrap.querySelectorAll('.ci-limit:not([hidden])').length;
  wrap.hidden = shown === 0;
  wrap.classList.toggle('ci-limits--single', shown === 1);
}
window.ciToggleLimit = ciToggleLimit;

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
  // A real mark already exists for today (teacher's, or the automatic
  // "có mặt" once class time passed with no attendance taken) — show it.
  if (ck.record) {
    const ok = ck.record.status === 'present' || ck.record.status === 'late';
    const label = { present: 'Có mặt', late: 'Đi trễ', excused: 'Vắng có phép', absent: 'Vắng' }[ck.record.status] || ck.record.status;
    return `<div class="ci-checkin ${ok ? 'ci-checkin--ok' : 'ci-checkin--rejected'}"><span class="ci-checkin-text">${ok ? '✅' : '⚠️'} Buổi ${ck.session.sessionNumber} hôm nay: <b>${label}</b>${ck.record.autoMarked ? ' <span class="ci-auto-tag">tự động</span> — hệ thống điểm danh khi tới giờ học, giáo viên có thể điều chỉnh.' : '.'}</span></div>`;
  }
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

// ── Course progress — "Tuần X/Y · Buổi X/Y" (c.progress from
// backend/utils/classProgress.js). Days are "YYYY-MM-DD" keys on the
// Vietnam calendar, so all date math here stays in UTC to avoid the
// browser's own timezone shifting a day.
const CI_WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const CI_RING_R = 34;
const CI_RING_C = 2 * Math.PI * CI_RING_R;

function ciKeyDate(key) { return new Date(`${key}T00:00:00Z`); }
function ciKeyDiff(a, b) { return Math.round((ciKeyDate(b) - ciKeyDate(a)) / 864e5); }
function ciKeyLabel(key) {
  const d = ciKeyDate(key);
  return `${CI_WEEKDAY[d.getUTCDay()]}, ${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}
function ciRelDay(today, key) {
  const n = ciKeyDiff(today, key);
  if (n === 0) return 'hôm nay';
  if (n === 1) return 'ngày mai';
  if (n === 2) return 'ngày kia';
  return n > 0 ? `còn ${n} ngày` : `${-n} ngày trước`;
}

function ciSessionName(s) {
  if (!s) return '';
  return s.type === 'makeup' ? 'Buổi học bù' : `Buổi ${s.ordinal || s.sessionNumber}`;
}

function ciRing(pct, done, total) {
  const off = CI_RING_C * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return `<div class="ci-ring" role="img" aria-label="Đã học ${done}/${total || '?'} buổi (${pct}%)">
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <defs><linearGradient id="ci-ring-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset=".55" stop-color="#8b5cf6"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>
      <circle class="ci-ring-track" cx="40" cy="40" r="${CI_RING_R}"/>
      <circle class="ci-ring-fill" cx="40" cy="40" r="${CI_RING_R}" stroke="url(#ci-ring-g)"
        style="stroke-dasharray:${CI_RING_C.toFixed(1)};stroke-dashoffset:${off.toFixed(1)};--ci-ring-c:${CI_RING_C.toFixed(1)}"/>
    </svg>
    <div class="ci-ring-center"><b data-count="${pct}">${pct}</b><span>%</span></div>
  </div>`;
}

function ciPhaseText(p) {
  if (p.phase === 'upcoming') return `🚀 Khai giảng ${p.daysUntilStart === 1 ? '<b>ngày mai</b>' : `sau <b>${p.daysUntilStart}</b> ngày`}`;
  if (p.phase === 'ended') return '🎓 Khóa học đã kết thúc';
  if (p.phase === 'ongoing') {
    const left = p.daysLeft != null ? (p.daysLeft === 0 ? ' · <b>hôm nay</b> là ngày cuối' : ` · còn <b>${p.daysLeft}</b> ngày`) : '';
    return `📖 Đang học${left}${p.remainingSessions ? ` · còn <b>${p.remainingSessions}</b> buổi` : ''}`;
  }
  return '🗓️ Lớp chưa có lịch học';
}

// One segment per course-week (done / current / upcoming). Long courses
// (> 30 weeks) fall back to a single bar so segments don't get too thin.
function ciWeekTrack(p) {
  if (!p.totalWeeks) return '';
  const cur = p.phase === 'upcoming' ? 0 : (p.currentWeek || 0);
  if (p.totalWeeks > 30) {
    const pct = Math.round((cur / p.totalWeeks) * 100);
    return `<div class="ci-weeks ci-weeks--bar" aria-hidden="true"><div class="ci-weeks-fill" style="width:${pct}%"></div></div>`;
  }
  const segs = [];
  for (let w = 1; w <= p.totalWeeks; w += 1) {
    const cls = w < cur || p.phase === 'ended' ? 'is-done' : w === cur ? 'is-now' : '';
    segs.push(`<span class="ci-wseg ${cls}" style="--i:${w}" title="Tuần ${w}"></span>`);
  }
  return `<div class="ci-weeks" aria-hidden="true">${segs.join('')}</div>`;
}

function ciNextLine(p) {
  if (p.todaySession) {
    const s = p.todaySession;
    return `<div class="ci-next ci-next--today"><span class="ci-next-dot"></span>
      <span><b>Hôm nay có ${ciSessionName(s)}</b>${s.startTime ? ` lúc <b>${s.startTime}</b>` : ''}${s.topic ? ` — ${escHtml(s.topic)}` : ''}</span></div>`;
  }
  if (p.nextSession) {
    const s = p.nextSession;
    return `<div class="ci-next"><i class="fas fa-calendar-day" aria-hidden="true"></i>
      <span>Tiếp theo: <b>${ciSessionName(s)}</b> · ${ciKeyLabel(s.dayKey)}${s.startTime ? ` · ${s.startTime}` : ''} <span class="ci-next-rel">(${ciRelDay(p.today, s.dayKey)})</span>${s.topic ? ` — ${escHtml(s.topic)}` : ''}</span></div>`;
  }
  return '';
}

function ciWeekStrip(p) {
  const list = p.weekSessions || [];
  if (!list.length) return '';
  const wk = p.phase === 'upcoming' ? 1 : p.currentWeek;
  const chips = list.map((s, i) => {
    const state = s.dayKey < p.today ? (s.status === 'held' ? 'done' : 'past') : s.dayKey === p.today ? 'today' : 'future';
    const icon = state === 'done' ? '✓' : state === 'today' ? '●' : state === 'past' ? '–' : '';
    return `<div class="ci-day ci-day--${state}" style="--i:${i}">
      <span class="ci-day-wd">${ciKeyLabel(s.dayKey).split(',')[0]}</span>
      <span class="ci-day-date">${s.dayKey.slice(8, 10)}/${s.dayKey.slice(5, 7)}</span>
      <span class="ci-day-name">${s.type === 'makeup' ? 'Học bù' : `Buổi ${s.ordinal || s.sessionNumber}`}${icon ? ` <i>${icon}</i>` : ''}</span>
      ${s.topic ? `<span class="ci-day-topic" title="${escHtml(s.topic)}">${escHtml(s.topic)}</span>` : ''}
    </div>`;
  }).join('');
  return `<div class="ci-week">
    <div class="ci-week-title">Lịch tuần ${wk}${p.phase === 'upcoming' ? ' (tuần đầu tiên)' : ''}</div>
    <div class="ci-week-days">${chips}</div>
  </div>`;
}

function ciProgressBlock(c) {
  const p = c.progress;
  if (!p) return '';
  const total = p.totalSessions || c.totalSessions || 0;
  const done = p.currentSessionOrdinal || 0;
  const weekChip = p.currentWeek
    ? `<span class="ci-chip ci-chip--week"><i class="fas fa-calendar-week" aria-hidden="true"></i> Tuần <b data-count="${p.currentWeek}">${p.currentWeek}</b>${p.totalWeeks ? `<small>/${p.totalWeeks}</small>` : ''}</span>`
    : p.phase === 'upcoming' && p.totalWeeks
      ? `<span class="ci-chip ci-chip--week"><i class="fas fa-calendar-week" aria-hidden="true"></i> ${p.totalWeeks} tuần</span>`
      : '';
  const sessChip = `<span class="ci-chip ci-chip--session"><i class="fas fa-chalkboard-user" aria-hidden="true"></i> Buổi <b data-count="${done}">${done}</b>${total ? `<small>/${total}</small>` : ''}</span>`;
  return `<div class="ci-prog">
      ${ciRing(p.percent || 0, done, total)}
      <div class="ci-prog-main">
        <div class="ci-prog-chips">${weekChip}${sessChip}</div>
        <div class="ci-prog-phase">${ciPhaseText(p)}</div>
        ${ciWeekTrack(p)}
        ${ciNextLine(p)}
      </div>
    </div>
    ${ciWeekStrip(p)}`;
}

function ciClassCard(c, ck, idx) {
  const st = CI_STATUS[c.status] || CI_STATUS.active;
  const sub = [c.courseName, c.teacherName ? `GV: ${c.teacherName}` : ''].filter(Boolean).map(escHtml).join(' · ');
  const dates = (c.startDate || c.endDate)
    ? `<div class="ci-dates"><i class="far fa-calendar" aria-hidden="true"></i> ${ciFmtDate(c.startDate)}${c.startDate && c.endDate ? ' – ' : ''}${ciFmtDate(c.endDate)}</div>`
    : '';
  const reason = c.statusReason && (c.status === 'warning' || c.status === 'failed')
    ? `<div class="ci-reason ci-reason--${c.status}">${c.status === 'failed' ? '⛔' : '⚠️'} ${escHtml(c.statusReason)}</div>`
    : '';
  const rate = c.heldSessions ? `<span data-count="${c.attendanceRate}">${c.attendanceRate}</span><small>%</small>` : '—';

  return `<div class="ci-card ci-card--${c.status}" style="--i:${idx || 0}">
    <div class="ci-card-head">
      <div>
        <div class="ci-card-title">${escHtml(c.className)}</div>
        ${sub ? `<div class="ci-card-sub">${sub}</div>` : ''}
        ${dates}
      </div>
      <span class="ci-badge ${st.cls}">${st.label}</span>
    </div>
    ${reason}
    ${ciProgressBlock(c)}
    ${ciCheckinBlock(ck)}
    <div class="ci-tiles">
      ${ciTile('👥', `<span data-count="${c.classSize}">${c.classSize}</span>`, 'Sĩ số lớp', 'ci-tile--indigo')}
      ${ciTile('✅', rate, `Chuyên cần · ${c.heldSessions} buổi`, 'ci-tile--blue')}
      ${ciToggleTile('🚪', `${ciNum(c.absenceEquivalent)}<small>/${c.maxAbsencesAllowed}</small>`, 'Buổi nghỉ',
        'ci-tile--amber' + (ciAbsenceLevel(c) !== 'ok' ? ' ci-tile--danger' : ''), `ci-limit-a-${c.classId}`)}
      ${ciToggleTile('📌', `${c.homeworkMissedCount}<small>/${c.homeworkFailThreshold}</small>`, 'BT thiếu',
        'ci-tile--rose' + (ciHomeworkLevel(c) !== 'ok' ? ' ci-tile--danger' : ''), `ci-limit-h-${c.classId}`)}
    </div>
    ${ciLimitsBlock(c)}
  </div>`;
}

// Count-up for [data-count] numbers once the card is on screen. Skipped
// under prefers-reduced-motion (the final number is already in the markup).
function ciAnimateCounts(root) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.getAttribute('data-count'));
    if (!Number.isFinite(target) || target <= 0 || !Number.isInteger(target)) return;
    const dur = 700 + Math.min(500, target * 8);
    const t0 = performance.now();
    el.textContent = '0';
    function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
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
  if (used > 0 && (failIsReach ? used >= failAt : used > failAt)) return 'fail';
  if (used > 0 && warnAt > 0 && used >= warnAt) return 'warn';
  return 'ok';
}

// Server computes these (classAttendanceService.attendanceLevel /
// homeworkLevel); the local fallback only covers an older payload. Absence
// never reads as "warn" at 0 absences — it starts at half the allowed count.
function ciAbsenceLevel(c) {
  if (c.attendanceLevel) return c.attendanceLevel;
  const warnAt = c.warnThreshold > 0 ? c.warnThreshold : c.maxAbsencesAllowed / 2;
  if (c.failOnExceed === false) return c.absenceEquivalent > 0 && c.absenceEquivalent >= warnAt ? 'warn' : 'ok';
  return ciLevel(c.absenceEquivalent, warnAt, c.maxAbsencesAllowed, false);
}

function ciHomeworkLevel(c) {
  if (c.homeworkLevel) return c.homeworkLevel;
  return ciLevel(c.homeworkMissedCount, c.homeworkWarnThreshold, c.homeworkFailThreshold, true);
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
  const aLevel = ciAbsenceLevel(c);
  const hLevel = ciHomeworkLevel(c);

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

  return `<div class="ci-limits" hidden>
    <div class="ci-limit ci-limit--${aLevel}" id="ci-limit-a-${c.classId}" hidden>
      <div class="ci-limit-head">
        <span class="ci-limit-title">🚪 Số buổi nghỉ</span>
        <span class="ci-limit-count"><b>${ciNum(c.absenceEquivalent)}</b> / ${c.maxAbsencesAllowed} buổi được phép</span>
      </div>
      ${ciMeter(c.absenceEquivalent, c.maxAbsencesAllowed, aLevel)}
      <div class="ci-limit-detail">${ciAbsenceDetail(c)}</div>
      <div class="ci-limit-line">${aLine}</div>
      <div class="ci-limit-note">${ciAbsenceNotes(c)}</div>
    </div>
    <div class="ci-limit ci-limit--${hLevel}" id="ci-limit-h-${c.classId}" hidden>
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
// Absence part: only once the student has used HALF the allowed absences
// (attendanceLevel warn/fail) — a student with 0 (or 1 of 4) absences gets
// no attendance reminder. Homework part: any missed assignment. Each class
// row lists only the part(s) that actually apply. At most once a day per
// browser, but again immediately if the numbers change — so a new absence /
// miss is never silently swallowed. localStorage is only a convenience
// here: if it throws, the popup just shows on every dashboard load.
const CI_POPUP_KEY = 'ewd_class_warning_popup';

function ciPopupAbsence(c) { return ciAbsenceLevel(c) !== 'ok'; }
function ciPopupHomework(c) { return c.homeworkMissedCount > 0; }

function ciPopupNeeded(c) {
  return ciPopupAbsence(c) || ciPopupHomework(c) || c.status === 'failed';
}

function ciTodayVN() {
  return new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
}

function ciMaybeShowWarningPopup(classes) {
  const flagged = classes.filter(ciPopupNeeded);
  if (!flagged.length) return;
  const sig = flagged.map((c) => `${c.classId}:${c.status}:${ciPopupAbsence(c) ? c.absenceEquivalent : '-'}:${c.homeworkMissedCount}`).join('|') + '@' + ciTodayVN();
  try { if (localStorage.getItem(CI_POPUP_KEY) === sig) return; } catch (_) { /* show anyway */ }
  if (document.getElementById('ci-warn-modal')) return;

  const anyFailed = flagged.some((c) => c.status === 'failed');
  const anyAbsence = flagged.some(ciPopupAbsence);
  const anyHomework = flagged.some(ciPopupHomework);
  const rows = flagged.map((c) => {
    const failed = c.status === 'failed';
    const aOver = ciAbsenceLevel(c) === 'fail';
    const hOver = ciHomeworkLevel(c) === 'fail';
    const lines = [];
    if (ciPopupAbsence(c)) {
      lines.push(`<li>🚪 Đã nghỉ <b>${ciNum(c.absenceEquivalent)}/${c.maxAbsencesAllowed}</b> buổi được phép (có phép ${c.absentExcused}, không phép ${c.absentUnexcused}${c.lateCount ? `, trễ ${c.lateCount}` : ''}) —
          ${aOver ? '<b class="ci-warn-bad">đã vượt giới hạn</b>' : `còn được nghỉ <b>${ciNum(c.remainingAbsences)}</b> buổi`}.</li>`);
    }
    if (ciPopupHomework(c)) {
      lines.push(`<li>📌 Thiếu bài tập <b>${c.homeworkMissedCount}</b> lần (rớt khi thiếu ${c.homeworkFailThreshold}) —
          ${hOver ? '<b class="ci-warn-bad">đã tới mức rớt</b>' : `còn được thiếu <b>${c.homeworkRemaining}</b> lần`}.</li>`);
    }
    return `<div class="ci-warn-class ${failed ? 'ci-warn-class--failed' : ''}">
      <div class="ci-warn-class-name">${escHtml(c.className)}${failed ? ' <span class="ci-badge ci-badge--failed">Rớt khóa</span>' : c.status === 'warning' ? ' <span class="ci-badge ci-badge--warning">Cảnh báo</span>' : ''}</div>
      <ul>${lines.join('')}</ul>
    </div>`;
  }).join('');
  const title = anyFailed ? '⛔ Bạn đã không đạt yêu cầu lớp học'
    : anyAbsence && anyHomework ? '⚠️ Nhắc nhở chuyên cần & bài tập'
    : anyAbsence ? '⚠️ Nhắc nhở chuyên cần' : '⚠️ Nhắc nhở bài tập';
  const foot = anyFailed ? 'Vui lòng liên hệ giáo viên để được hướng dẫn.'
    : anyAbsence && anyHomework ? 'Nếu nghỉ quá số buổi cho phép hoặc thiếu bài tập tới mức rớt, bạn sẽ <b>rớt khóa học</b>. Bài quá hạn chưa làm — kể cả bài giáo viên đã đóng — vẫn bị tính là thiếu.'
    : anyAbsence ? 'Nếu nghỉ quá số buổi cho phép, bạn sẽ <b>rớt khóa học</b>.'
    : 'Nếu thiếu bài tập tới mức rớt, bạn sẽ <b>rớt khóa học</b>. Bài quá hạn chưa làm — kể cả bài giáo viên đã đóng — vẫn bị tính là thiếu. Làm bù đầy đủ sẽ được trừ khỏi số lần thiếu.';

  const modal = document.createElement('div');
  modal.id = 'ci-warn-modal';
  modal.className = 'ci-warn-overlay';
  modal.innerHTML = `<div class="ci-warn-box" role="alertdialog" aria-modal="true" aria-labelledby="ci-warn-title">
    <div class="ci-warn-title" id="ci-warn-title">${title}</div>
    <div class="ci-warn-body">
      ${rows}
      <p class="ci-warn-foot">${foot}</p>
    </div>
    <div class="ci-warn-actions">
      ${anyHomework ? '<a class="ci-warn-btn ci-warn-btn--ghost" href="#homework-card" data-close>Xem bài tập</a>' : ''}
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

  // Header pill: the week of the (first) ongoing class, so the student sees
  // "Tuần 3" even before reading the cards.
  const lead = data.classes.find((c) => c.progress && c.progress.phase === 'ongoing' && c.progress.currentWeek);
  const headPill = lead
    ? `<span class="ci-head-pill"><i class="fas fa-calendar-week" aria-hidden="true"></i> Tuần ${lead.progress.currentWeek}${lead.progress.totalWeeks ? `/${lead.progress.totalWeeks}` : ''} · Buổi ${lead.progress.currentSessionOrdinal}${lead.progress.totalSessions ? `/${lead.progress.totalSessions}` : ''}</span>`
    : '';

  const firstRender = card.style.display !== 'block';
  card.style.display = 'block';
  card.innerHTML = `<div class="ci-head"><h3>🏫 Lớp học của tôi</h3>${headPill}</div>
    <div class="ci-list">${data.classes.map((c, i) => ciClassCard(c, checkinByClass.get(String(c.classId)), i)).join('')}</div>`;
  if (firstRender) ciAnimateCounts(card);
  else card.classList.add('ci-no-anim'); // re-render after a check-in: no replay
  ciMaybeShowWarningPopup(data.classes);
}
window.loadClassInfo = loadClassInfo;
