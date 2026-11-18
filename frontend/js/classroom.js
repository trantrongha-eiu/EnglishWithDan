'use strict';
/* ══════════════════════════════════════════════
   🏫 LỚP HỌC (classroom.html) — the student's own class page: tổng quan,
   lịch học + điểm danh từng buổi, bài tập, thi Speaking. A student in no class
   sees how to contact the teacher instead.

   Data: GET /api/classes/my/classroom (the page's gate), /classes/my/checkin,
   /classes/my/speaking-exam, /assignments/mine — the last three are
   best-effort: their section says so if they fail, the rest still shows.

   Reuses the dashboard's renderers so both places stay identical:
   js/dashboard-classinfo.js (ci*), js/dashboard-homework.js (hwRender),
   js/dashboard-speaking-exam.js (se*). Their "reload" hooks
   (loadClassInfo / loadHomework) are pointed at crLoad at the end of this file.
   Deep link: classroom.html?class=<classId>&tab=overview|schedule|homework|speaking
══════════════════════════════════════════════ */

const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
function authH() {
  return { ...(window.AuthService ? window.AuthService.authHeader() : {}), 'Content-Type': 'application/json' };
}

// Same public contact details as contact.html.
const CR_CONTACT = [
  { href: 'https://zalo.me/0914769618', icon: 'fa-comment-dots', title: 'Nhắn Zalo', sub: '0914 769 618', external: true },
  { href: 'tel:0914769618', icon: 'fa-phone', title: 'Gọi điện', sub: '0914 769 618' },
  { href: 'https://www.facebook.com/EnglishWithDan', icon: 'fa-brands fa-facebook', title: 'Facebook', sub: 'EnglishWithDan', external: true },
];
const CR_TABS = [
  { key: 'overview', icon: 'fa-gauge-high', label: 'Tổng quan' },
  { key: 'schedule', icon: 'fa-calendar-days', label: 'Lịch học' },
  { key: 'homework', icon: 'fa-list-check', label: 'Bài tập' },
  { key: 'speaking', icon: 'fa-microphone', label: 'Thi Speaking' },
];
const CR_MARK = {
  present: { label: 'Có mặt', cls: 'ok' },
  late: { label: 'Đi trễ', cls: 'warn' },
  excused: { label: 'Vắng có phép', cls: 'warn' },
  absent: { label: 'Vắng', cls: 'bad' },
};

const crState = { classes: [], checkin: new Map(), homework: null, classId: null, tab: 'overview', painted: false };
let crSeq = 0;

function crRoot() { return document.getElementById('crRoot'); }
function crCurrent() {
  return crState.classes.find((c) => String(c.classId) === String(crState.classId)) || crState.classes[0] || null;
}
async function crGet(path) {
  const res = await fetch(`${API}${path}`, { headers: authH() });
  return window.ApiClient.handleResponse(res);
}

function crContactHtml(title, text) {
  return `<section class="cr-contact">
    <h2>${title}</h2>
    <p>${text}</p>
    <div class="cr-contact-list">
      ${CR_CONTACT.map((c) => `<a class="cr-contact-item" href="${c.href}"${c.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
        <i class="${c.icon.startsWith('fa-brands') ? c.icon : `fas ${c.icon}`}" aria-hidden="true"></i>
        <span><b>${c.title}</b><small>${c.sub}</small></span>
      </a>`).join('')}
    </div>
  </section>`;
}

function crEmptyHtml() {
  return `<div class="cr-empty">
    <div class="cr-empty-icon" aria-hidden="true">🏫</div>
    ${crContactHtml('Bạn chưa có lớp học', 'Hãy liên hệ giáo viên để được xếp lớp. Sau khi vào lớp, lịch học, điểm danh, bài tập và lịch thi Speaking sẽ hiện ở đây.')}
  </div>`;
}

function crHeroHtml(c) {
  const st = CI_STATUS[c.status] || CI_STATUS.active;
  const facts = [
    c.teacherName ? `<span><i class="fas fa-chalkboard-user" aria-hidden="true"></i> GV ${escHtml(c.teacherName)}</span>` : '',
    c.startDate || c.endDate ? `<span><i class="far fa-calendar" aria-hidden="true"></i> ${ciFmtDate(c.startDate)}${c.startDate && c.endDate ? ' – ' : ''}${ciFmtDate(c.endDate)}</span>` : '',
    c.startTime ? `<span><i class="far fa-clock" aria-hidden="true"></i> Vào học ${escHtml(c.startTime)}</span>` : '',
    `<span><i class="fas fa-users" aria-hidden="true"></i> ${c.classSize} học viên</span>`,
  ].filter(Boolean).join('');
  return `<header class="cr-hero pf-hero pf-hero-purple" data-mascot="none">
    <div class="pf-hero-body">
      <span class="ci-badge ${st.cls}">${st.label}</span>
      <h1>${escHtml(c.className)}</h1>
      ${c.courseName ? `<p class="pf-hero-sub">${escHtml(c.courseName)}</p>` : ''}
      <div class="cr-facts">${facts}</div>
    </div>
  </header>`;
}

function crHomeworkOf(c) {
  const all = (crState.homework && crState.homework.assignments) || [];
  return all.filter((a) => String(a.classId) === String(c.classId));
}

function crTabsHtml(c) {
  const open = crHomeworkOf(c).filter((a) => a.status !== 'completed').length;
  const se = window.seClassFor(c.classId);
  const badge = { homework: open, speaking: se && !se.booking ? (se.openSlots || []).length : 0 };
  return `<div class="cr-tabs" role="tablist" aria-label="Thông tin lớp học">${CR_TABS.map((t) => {
    const on = t.key === crState.tab;
    return `<button type="button" role="tab" class="cr-tab${on ? ' is-on' : ''}" aria-selected="${on}" tabindex="${on ? 0 : -1}" data-tab="${t.key}">
      <i class="fas ${t.icon}" aria-hidden="true"></i> ${t.label}${badge[t.key] ? `<em>${badge[t.key]}</em>` : ''}
    </button>`;
  }).join('')}</div>`;
}

function crShortcut(icon, title, text, attrs) {
  return `<${attrs.href ? `a href="${attrs.href}"` : `button type="button" data-go="${attrs.go}"`} class="cr-shortcut">
    <span class="cr-shortcut-icon" aria-hidden="true">${icon}</span>
    <span><b>${title}</b><small>${text}</small></span>
    <i class="fas fa-chevron-right" aria-hidden="true"></i>
  </${attrs.href ? 'a' : 'button'}>`;
}

function crOverviewHtml(c) {
  const ck = crState.checkin.get(String(c.classId));
  const reason = c.statusReason && (c.status === 'warning' || c.status === 'failed')
    ? `<div class="ci-reason ci-reason--${c.status}">${c.status === 'failed' ? '⛔' : '⚠️'} ${escHtml(c.statusReason)}</div>`
    : '';

  const hw = crHomeworkOf(c);
  const open = hw.filter((a) => a.status !== 'completed');
  const overdue = open.filter((a) => a.status === 'overdue').length;
  const hwText = !crState.homework ? 'Xem bài tập của lớp'
    : !open.length ? 'Bạn đã làm hết bài được giao'
      : `${open.length} bài chưa xong${overdue ? ` · ${overdue} quá hạn` : ''}`;

  const se = window.seClassFor(c.classId);
  const seText = !se ? 'Xem lịch thi của lớp'
    : se.booking ? `Đã đăng kí ${seDayLabel(se.booking.dayKey)} · ${se.booking.startTime}`
      : (se.openSlots || []).length ? `Còn ${se.openSlots.length} buổi trống — chọn lịch ngay` : 'Giáo viên chưa mở lịch thi';

  return `${reason}
    <section id="class-info-card" class="cr-card" style="display:block">
      <div class="ci-head"><h3>Tiến độ khóa học</h3></div>
      ${ciProgressBlock(c)}
      ${ciCheckinBlock(ck, c.progress && c.progress.todaySession)}
      ${ciTilesBlock(c)}
      ${ciLimitsBlock(c)}
    </section>
    <div class="cr-shortcuts">
      ${crShortcut('📅', 'Lịch học', `${(c.sessions || []).length} buổi · điểm danh từng buổi`, { go: 'schedule' })}
      ${crShortcut('📚', 'Bài tập', hwText, { go: 'homework' })}
      ${crShortcut('🎤', 'Thi Speaking', seText, { go: 'speaking' })}
      ${crShortcut('💰', 'Học phí', 'Xem các khoản cần đóng', { href: 'tuition.html' })}
      ${crShortcut('✉️', 'Hộp thư', 'Tin nhắn từ giáo viên', { href: 'inbox.html' })}
    </div>
    ${crContactHtml('Cần hỗ trợ về lớp học?', 'Xin nghỉ, đổi buổi hoặc có thắc mắc, hãy liên hệ giáo viên qua:')}`;
}

// One row of the timetable.
function crSessionState(s, today) {
  if (s.status === 'cancelled') return { label: 'Đã hủy', cls: 'off' };
  if (s.dayKey === today) return { label: 'Hôm nay', cls: 'now' };
  if (s.dayKey > today) return { label: 'Sắp tới', cls: 'next' };
  return s.status === 'held' ? { label: 'Đã học', cls: 'done' } : { label: 'Chưa cập nhật', cls: 'off' };
}

function crSessionRow(s, today) {
  const st = crSessionState(s, today);
  const mark = CR_MARK[s.mark];
  const [wd, date] = ciKeyLabel(s.dayKey).split(', ');
  const name = s.type === 'makeup' ? 'Buổi học bù' : s.ordinal ? `Buổi ${s.ordinal}` : `Buổi ${s.sessionNumber}`;
  return `<li class="cr-sess cr-sess--${st.cls}">
    <span class="cr-sess-date"><b>${wd}</b>${date}</span>
    <span class="cr-sess-main">
      <b>${name}</b>${s.startTime ? ` <small>${escHtml(s.startTime)}</small>` : ''}
      ${s.topic ? `<span class="cr-sess-topic">${escHtml(s.topic)}</span>` : ''}
    </span>
    <span class="cr-sess-tags">
      ${mark ? `<span class="cr-pill cr-pill--${mark.cls}">${mark.label}</span>` : `<span class="cr-pill cr-pill--${st.cls}">${st.label}</span>`}
    </span>
  </li>`;
}

function crScheduleHtml(c) {
  const rows = c.sessions || [];
  if (!rows.length) return '<div class="cr-note">🗓️ Lớp chưa có lịch học. Giáo viên sẽ cập nhật sớm.</div>';
  const today = (c.progress && c.progress.today) || new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);

  const weeks = [];
  rows.forEach((s) => {
    const last = weeks[weeks.length - 1];
    if (last && last.week === s.week) last.items.push(s);
    else weeks.push({ week: s.week, items: [s] });
  });
  const block = (w) => `<div class="cr-week">
    ${w.week ? `<div class="cr-week-title">Tuần ${w.week}</div>` : ''}
    <ul class="cr-sess-list">${w.items.map((s) => crSessionRow(s, today)).join('')}</ul>
  </div>`;
  const isPast = (w) => w.items.every((s) => s.dayKey < today);
  const past = weeks.filter(isPast);
  const coming = weeks.filter((w) => !isPast(w));

  const live = rows.filter((s) => s.status !== 'cancelled');
  const count = (m) => rows.filter((s) => s.mark === m).length;
  const stats = [
    ['Đã học', c.heldSessions],
    ['Sắp tới', live.filter((s) => s.dayKey >= today).length],
    ['Có mặt', count('present')],
    ['Đi trễ', count('late')],
    ['Vắng', count('absent') + count('excused')],
  ];
  return `<div class="cr-stats">${stats.map(([k, v]) => `<div><b>${v}</b><span>${k}</span></div>`).join('')}</div>
    <section class="cr-card">
      ${coming.length ? coming.map(block).join('') : '<div class="cr-note">Khóa học đã đi hết lịch.</div>'}
      ${past.length ? `<details class="cr-past"${coming.length ? '' : ' open'}>
        <summary>Các tuần đã qua (${past.reduce((n, w) => n + w.items.length, 0)} buổi)</summary>
        ${past.slice().reverse().map(block).join('')}
      </details>` : ''}
    </section>`;
}

function crSpeakingHtml(c) {
  const se = window.seClassFor(c.classId);
  if (!se) return '<div class="cr-note">Chưa tải được lịch thi Speaking. Hãy tải lại trang để thử lại.</div>';
  const block = window.seBlockFor(c.classId);
  const history = window.seHistoryFor(c.classId);
  const data = crState.seMeta || {};
  return `<section class="cr-card">
    <div class="ci-head"><h3>🎤 Thi Speaking 1-1 với giáo viên</h3></div>
    <p class="cr-hint">Mỗi buổi ${data.slotMinutes || 25} phút gồm ${data.examMinutes || 15}' thi và ${data.feedbackMinutes || 10}' nhận feedback. Bạn đăng kí, đổi hoặc hủy được tới ${data.lockHours || 2} tiếng trước giờ thi.</p>
    ${block && (se.booking || (se.openSlots || []).length) ? block : '<div class="cr-note">Giáo viên chưa mở lịch thi mới. Lịch sẽ hiện ở đây khi được mở.</div>'}
  </section>
  ${history ? `<section class="cr-card"><div class="ci-head"><h3>Kết quả các buổi đã thi</h3></div>${history}</section>` : ''}`;
}

// Homework of THIS class, through the dashboard's own card renderer.
function crPaintHomework(c, panel) {
  const hw = crState.homework;
  if (!hw) { panel.innerHTML = '<div class="cr-note">Chưa tải được bài tập. Hãy tải lại trang để thử lại.</div>'; return; }
  panel.innerHTML = '<div id="homework-card"></div>';
  const assignments = crHomeworkOf(c);
  const lockedCount = assignments.filter((a) => a.locked).length;
  const pendingOld = ((hw.homeworkLock && hw.homeworkLock.pendingOld) || []).filter((o) => o.className === c.className);
  const warn = hw.homeworkWarning;
  hwRender(document.getElementById('homework-card'), {
    ...hw,
    hasClasses: true,
    assignments,
    homeworkLock: lockedCount ? { ...hw.homeworkLock, lockedCount, pendingOld } : null,
    homeworkWarning: warn && (!warn.className || warn.className === c.className) ? warn : null,
  });
}

function crPaintPanel(animate) {
  const c = crCurrent();
  const panel = document.getElementById('crPanel');
  if (!c || !panel) return;
  if (crState.tab === 'homework') crPaintHomework(c, panel);
  else if (crState.tab === 'schedule') panel.innerHTML = crScheduleHtml(c);
  else if (crState.tab === 'speaking') panel.innerHTML = crSpeakingHtml(c);
  else {
    panel.innerHTML = crOverviewHtml(c);
    // This is the detail page: both limit breakdowns start open.
    panel.querySelectorAll('.ci-tile--toggle').forEach((b) => ciToggleLimit(b));
    const card = panel.querySelector('#class-info-card');
    if (animate) ciAnimateCounts(card); else card.classList.add('ci-no-anim');
  }
}

function crSyncUrl() {
  const c = crCurrent();
  const q = new URLSearchParams();
  if (c && crState.classes.length > 1) q.set('class', c.classId);
  if (crState.tab !== 'overview') q.set('tab', crState.tab);
  const qs = q.toString();
  try { history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}`); } catch (_) { /* cosmetic */ }
}

function crRender(animate) {
  const root = crRoot();
  const c = crCurrent();
  if (!c) { root.innerHTML = crEmptyHtml(); return; }
  crState.classId = c.classId;
  const picker = crState.classes.length > 1
    ? `<div class="cr-classes" role="group" aria-label="Chọn lớp">${crState.classes.map((x) => {
      const on = String(x.classId) === String(c.classId);
      return `<button type="button" class="cr-class${on ? ' is-on' : ''}" aria-pressed="${on}" data-class="${x.classId}">${escHtml(x.className)}</button>`;
    }).join('')}</div>`
    : '';
  root.innerHTML = `${picker}${crHeroHtml(c)}${crTabsHtml(c)}<div id="crPanel" role="tabpanel"></div>`;
  crPaintPanel(animate);
  crSyncUrl();
}

async function crLoad() {
  const seq = ++crSeq;
  let room;
  try {
    room = await crGet('/classes/my/classroom');
  } catch (err) {
    console.error('crLoad:', err);
    if (seq !== crSeq || crState.painted) return; // keep what is on screen
    crRoot().innerHTML = `<div class="cr-note cr-note--error">
      Không tải được thông tin lớp học. <button type="button" class="se-btn" data-retry>Thử lại</button>
    </div>`;
    return;
  }
  const [ck, hw, se] = await Promise.all([
    crGet('/classes/my/checkin').catch(() => null),
    crGet('/assignments/mine').catch(() => null),
    window.seFetch(),
  ]);
  if (seq !== crSeq) return;
  const first = !crState.painted;
  crState.classes = room.classes || [];
  crState.checkin = new Map(((ck && ck.classes) || []).map((c) => [String(c.classId), c]));
  crState.homework = hw;
  crState.seMeta = se;
  crState.painted = true;
  crRender(first);
}

function crSetTab(tab, focus) {
  crState.tab = tab;
  const c = crCurrent();
  const old = document.querySelector('.cr-tabs');
  if (old && c) old.outerHTML = crTabsHtml(c);
  crPaintPanel(false);
  crSyncUrl();
  if (focus) { const b = document.querySelector('.cr-tab.is-on'); if (b) b.focus(); }
}

function crBind() {
  const root = crRoot();
  root.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (tab) { crSetTab(tab.getAttribute('data-tab')); return; }
    const go = e.target.closest('[data-go]');
    if (go) { crSetTab(go.getAttribute('data-go'), true); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const cls = e.target.closest('[data-class]');
    if (cls) { crState.classId = cls.getAttribute('data-class'); crRender(false); return; }
    if (e.target.closest('[data-retry]')) {
      root.innerHTML = '<div class="cr-note">Đang tải lớp học…</div>';
      crLoad();
    }
  });
  root.addEventListener('keydown', (e) => {
    if (!e.target.closest('.cr-tabs') || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const i = CR_TABS.findIndex((t) => t.key === crState.tab);
    const next = (i + (e.key === 'ArrowRight' ? 1 : CR_TABS.length - 1)) % CR_TABS.length;
    crSetTab(CR_TABS[next].key, true);
  });
}

function crInit() {
  const q = new URLSearchParams(location.search);
  if (CR_TABS.some((t) => t.key === q.get('tab'))) crState.tab = q.get('tab');
  crState.classId = q.get('class');
  crBind();
  crLoad();
}

// After a check-in, tick, booking or tab return, the shared renderers call
// these globals — re-fetch this page instead of the dashboard's cards.
window.loadClassInfo = crLoad;
window.loadHomework = crLoad;

window.ClassroomPage = { crEmptyHtml, crScheduleHtml, crSessionState, crLoad, crState };
if (document.getElementById('crRoot')) crInit();
