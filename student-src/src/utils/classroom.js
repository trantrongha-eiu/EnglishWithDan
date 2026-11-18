// Pure helpers for the class area: 🏫 Lớp học page (pages/Classroom.jsx) and the
// "Lớp học của tôi" card (pages/dashboard/ClassInfoCard.jsx).
// Day keys are "YYYY-MM-DD" on the Vietnam calendar, so date math stays in UTC.

export const CLASS_STATUS = {
  active: { label: 'Đang học', cls: 'ci-badge--active' },
  warning: { label: 'Cảnh báo', cls: 'ci-badge--warning' },
  failed: { label: 'Rớt khóa', cls: 'ci-badge--failed' },
  completed: { label: 'Hoàn thành', cls: 'ci-badge--completed' },
  dropped: { label: 'Nghỉ học', cls: 'ci-badge--dropped' },
};

export const ATTENDANCE_MARK = {
  present: { label: 'Có mặt', cls: 'ok' },
  late: { label: 'Đi trễ', cls: 'warn' },
  excused: { label: 'Vắng có phép', cls: 'warn' },
  absent: { label: 'Vắng', cls: 'bad' },
};

const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const pad = (n) => String(n).padStart(2, '0');

export function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

export function keyLabel(key) {
  const d = new Date(`${key}T00:00:00Z`);
  return `${WEEKDAY[d.getUTCDay()]}, ${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`;
}

export const vnToday = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);

export function sessionState(s, today) {
  if (s.status === 'cancelled') return { label: 'Đã hủy', cls: 'off' };
  if (s.dayKey === today) return { label: 'Hôm nay', cls: 'now' };
  if (s.dayKey > today) return { label: 'Sắp tới', cls: 'next' };
  return s.status === 'held' ? { label: 'Đã học', cls: 'done' } : { label: 'Chưa cập nhật', cls: 'off' };
}

export function sessionName(s) {
  if (s.type === 'makeup') return 'Buổi học bù';
  return `Buổi ${s.ordinal || s.sessionNumber}`;
}

// Timetable → course weeks; weeks fully behind `today` fold away, newest first.
export function splitSchedule(sessions, today) {
  const weeks = [];
  for (const s of sessions) {
    const last = weeks[weeks.length - 1];
    if (last && last.week === s.week) last.items.push(s);
    else weeks.push({ week: s.week, items: [s] });
  }
  const isPast = (w) => w.items.every((s) => s.dayKey < today);
  return { coming: weeks.filter((w) => !isPast(w)), past: weeks.filter(isPast).reverse() };
}

export function scheduleStats(c, today) {
  const rows = c.sessions || [];
  const count = (...marks) => rows.filter((s) => marks.includes(s.mark)).length;
  return [
    ['Đã học', c.heldSessions || 0],
    ['Sắp tới', rows.filter((s) => s.status !== 'cancelled' && s.dayKey >= today).length],
    ['Có mặt', count('present')],
    ['Đi trễ', count('late')],
    ['Vắng', count('absent', 'excused')],
  ];
}

// GET /assignments/mine covers every class — keep what belongs to this one.
export function homeworkForClass(data, c) {
  if (!data) return null;
  const assignments = (data.assignments || []).filter((a) => String(a.classId) === String(c.classId));
  const lockedCount = assignments.filter((a) => a.locked).length;
  const pendingOld = (data.homeworkLock?.pendingOld || []).filter((o) => o.className === c.className);
  const warn = data.homeworkWarning;
  return {
    ...data,
    hasClasses: true,
    assignments,
    homeworkLock: lockedCount ? { ...data.homeworkLock, lockedCount, pendingOld } : null,
    homeworkWarning: warn && (!warn.className || warn.className === c.className) ? warn : null,
  };
}
