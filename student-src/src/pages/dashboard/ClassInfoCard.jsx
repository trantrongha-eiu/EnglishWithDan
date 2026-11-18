import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import SpeakingExamBlock from './SpeakingExamBlock';

// 🏫 Lớp học của tôi — port of frontend/js/dashboard-classinfo.js.
//   GET /classes/my/overview  (classAttendance.controller.js)
//   GET /classes/my/checkin   + POST /classes/my/sessions/:id/checkin
//   GET /classes/my/speaking-exam (SpeakingExamBlock)
// Renders nothing for a student in no classroom. Same #class-info-card /
// .ci-* markup as the static page (dashboard.css).

const STATUS = {
  active: { label: 'Đang học', cls: 'ci-badge--active' },
  warning: { label: 'Cảnh báo', cls: 'ci-badge--warning' },
  failed: { label: 'Rớt khóa', cls: 'ci-badge--failed' },
  completed: { label: 'Hoàn thành', cls: 'ci-badge--completed' },
  dropped: { label: 'Nghỉ học', cls: 'ci-badge--dropped' },
};
const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const RING_R = 34;
const RING_C = 2 * Math.PI * RING_R;
const pad = (n) => String(n).padStart(2, '0');

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}
const fmtTime = (d) => { const dt = new Date(d); return `${pad(dt.getHours())}:${pad(dt.getMinutes())}`; };
// "YYYY-MM-DD" keys on the Vietnam calendar → all date math in UTC
const keyDate = (key) => new Date(`${key}T00:00:00Z`);
const keyDiff = (a, b) => Math.round((keyDate(b) - keyDate(a)) / 864e5);
function keyLabel(key) {
  const d = keyDate(key);
  return `${WEEKDAY[d.getUTCDay()]}, ${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`;
}
function relDay(today, key) {
  const n = keyDiff(today, key);
  if (n === 0) return 'hôm nay';
  if (n === 1) return 'ngày mai';
  if (n === 2) return 'ngày kia';
  return n > 0 ? `còn ${n} ngày` : `${-n} ngày trước`;
}
const sessionName = (s) => (!s ? '' : s.type === 'makeup' ? 'Buổi học bù' : `Buổi ${s.ordinal || s.sessionNumber}`);
const num = (n) => (Number.isInteger(n) ? String(n) : String(n).replace('.', ','));

/* ── Pass/fail levels (server: classAttendanceService.attendanceLevel / homeworkLevel) ── */
function level(used, warnAt, failAt, failIsReach) {
  if (used > 0 && (failIsReach ? used >= failAt : used > failAt)) return 'fail';
  if (used > 0 && warnAt > 0 && used >= warnAt) return 'warn';
  return 'ok';
}
function absenceLevel(c) {
  if (c.attendanceLevel) return c.attendanceLevel;
  const warnAt = c.warnThreshold > 0 ? c.warnThreshold : c.maxAbsencesAllowed / 2;
  if (c.failOnExceed === false) return c.absenceEquivalent > 0 && c.absenceEquivalent >= warnAt ? 'warn' : 'ok';
  return level(c.absenceEquivalent, warnAt, c.maxAbsencesAllowed, false);
}
function homeworkLevel(c) {
  if (c.homeworkLevel) return c.homeworkLevel;
  return level(c.homeworkMissedCount, c.homeworkWarnThreshold, c.homeworkFailThreshold, true);
}

// Count-up for a number once the card is first on screen. Owns its text
// node (no React children) so the rAF writes never fight React.
function Count({ value, animate }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const target = Number(value);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduce || !Number.isInteger(target) || target <= 0) { el.textContent = String(value); return undefined; }
    const dur = 700 + Math.min(500, target * 8);
    const t0 = performance.now();
    let id;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = String(Math.round(target * (1 - (1 - k) ** 3)));
      if (k < 1) id = requestAnimationFrame(step);
    };
    el.textContent = '0';
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [value, animate]);
  return <span ref={ref} />;
}

function Ring({ pct, done, total, animate }) {
  const off = RING_C * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <div className="ci-ring" role="img" aria-label={`Đã học ${done}/${total || '?'} buổi (${pct}%)`}>
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <defs>
          <linearGradient id="ci-ring-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6366f1" /><stop offset=".55" stopColor="#8b5cf6" /><stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle className="ci-ring-track" cx="40" cy="40" r={RING_R} />
        <circle className="ci-ring-fill" cx="40" cy="40" r={RING_R} stroke="url(#ci-ring-g)"
          style={{ strokeDasharray: RING_C.toFixed(1), strokeDashoffset: off.toFixed(1), '--ci-ring-c': RING_C.toFixed(1) }} />
      </svg>
      <div className="ci-ring-center"><b><Count value={pct} animate={animate} /></b><span>%</span></div>
    </div>
  );
}

function PhaseText({ p }) {
  if (p.phase === 'upcoming') return <>🚀 Khai giảng {p.daysUntilStart === 1 ? <b>ngày mai</b> : <>sau <b>{p.daysUntilStart}</b> ngày</>}</>;
  if (p.phase === 'ended') return <>🎓 Khóa học đã kết thúc</>;
  if (p.phase === 'ongoing') {
    return (
      <>
        📖 Đang học
        {p.daysLeft != null && (p.daysLeft === 0 ? <> · <b>hôm nay</b> là ngày cuối</> : <> · còn <b>{p.daysLeft}</b> ngày</>)}
        {p.remainingSessions ? <> · còn <b>{p.remainingSessions}</b> buổi</> : null}
      </>
    );
  }
  return <>🗓️ Lớp chưa có lịch học</>;
}

// One segment per course-week; > 30 weeks → a single bar
function WeekTrack({ p }) {
  if (!p.totalWeeks) return null;
  const cur = p.phase === 'upcoming' ? 0 : (p.currentWeek || 0);
  if (p.totalWeeks > 30) {
    return <div className="ci-weeks ci-weeks--bar" aria-hidden="true"><div className="ci-weeks-fill" style={{ width: `${Math.round((cur / p.totalWeeks) * 100)}%` }} /></div>;
  }
  return (
    <div className="ci-weeks" aria-hidden="true">
      {Array.from({ length: p.totalWeeks }, (_, i) => {
        const w = i + 1;
        const cls = w < cur || p.phase === 'ended' ? 'is-done' : w === cur ? 'is-now' : '';
        return <span key={w} className={`ci-wseg ${cls}`} style={{ '--i': w }} title={`Tuần ${w}`} />;
      })}
    </div>
  );
}

function NextLine({ p }) {
  if (p.todaySession) {
    const s = p.todaySession;
    return (
      <div className="ci-next ci-next--today"><span className="ci-next-dot" />
        <span><b>Hôm nay có {sessionName(s)}</b>{s.startTime && <> lúc <b>{s.startTime}</b></>}{s.topic && ` — ${s.topic}`}</span>
      </div>
    );
  }
  if (p.nextSession) {
    const s = p.nextSession;
    return (
      <div className="ci-next"><i className="fas fa-calendar-day" aria-hidden="true" />
        <span>
          Tiếp theo: <b>{sessionName(s)}</b> · {keyLabel(s.dayKey)}{s.startTime && ` · ${s.startTime}`}{' '}
          <span className="ci-next-rel">({relDay(p.today, s.dayKey)})</span>{s.topic && ` — ${s.topic}`}
        </span>
      </div>
    );
  }
  return null;
}

function WeekStrip({ p }) {
  const list = p.weekSessions || [];
  if (!list.length) return null;
  const wk = p.phase === 'upcoming' ? 1 : p.currentWeek;
  return (
    <div className="ci-week">
      <div className="ci-week-title">Lịch tuần {wk}{p.phase === 'upcoming' ? ' (tuần đầu tiên)' : ''}</div>
      <div className="ci-week-days">
        {list.map((s, i) => {
          const state = s.dayKey < p.today ? (s.status === 'held' ? 'done' : 'past') : s.dayKey === p.today ? 'today' : 'future';
          const icon = { done: '✓', today: '●', past: '–' }[state];
          return (
            <div key={s._id || i} className={`ci-day ci-day--${state}`} style={{ '--i': i }}>
              <span className="ci-day-wd">{keyLabel(s.dayKey).split(',')[0]}</span>
              <span className="ci-day-date">{s.dayKey.slice(8, 10)}/{s.dayKey.slice(5, 7)}</span>
              <span className="ci-day-name">{s.type === 'makeup' ? 'Học bù' : `Buổi ${s.ordinal || s.sessionNumber}`}{icon && <> <i>{icon}</i></>}</span>
              {s.topic && <span className="ci-day-topic" title={s.topic}>{s.topic}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressBlock({ c, animate }) {
  const p = c.progress;
  if (!p) return null;
  const total = p.totalSessions || c.totalSessions || 0;
  const done = p.currentSessionOrdinal || 0;
  return (
    <>
      <div className="ci-prog">
        <Ring pct={p.percent || 0} done={done} total={total} animate={animate} />
        <div className="ci-prog-main">
          <div className="ci-prog-chips">
            {p.currentWeek ? (
              <span className="ci-chip ci-chip--week"><i className="fas fa-calendar-week" aria-hidden="true" /> Tuần <b><Count value={p.currentWeek} animate={animate} /></b>{p.totalWeeks ? <small>/{p.totalWeeks}</small> : null}</span>
            ) : p.phase === 'upcoming' && p.totalWeeks ? (
              <span className="ci-chip ci-chip--week"><i className="fas fa-calendar-week" aria-hidden="true" /> {p.totalWeeks} tuần</span>
            ) : null}
            <span className="ci-chip ci-chip--session"><i className="fas fa-chalkboard-user" aria-hidden="true" /> Buổi <b><Count value={done} animate={animate} /></b>{total ? <small>/{total}</small> : null}</span>
          </div>
          <div className="ci-prog-phase"><PhaseText p={p} /></div>
          <WeekTrack p={p} />
          <NextLine p={p} />
        </div>
      </div>
      <WeekStrip p={p} />
    </>
  );
}

// Self check-in for today's session (teacher still confirms on Điểm danh)
function Checkin({ ck, todaySession, onDone }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (!ck || !ck.session) return null;
  const sid = ck.session._id;
  const name = todaySession && String(todaySession._id) === String(sid) ? sessionName(todaySession) : `Buổi ${ck.session.sessionNumber}`;
  if (ck.record) {
    const ok = ck.record.status === 'present' || ck.record.status === 'late';
    const label = { present: 'Có mặt', late: 'Đi trễ', excused: 'Vắng có phép', absent: 'Vắng' }[ck.record.status] || ck.record.status;
    return (
      <div className={`ci-checkin ${ok ? 'ci-checkin--ok' : 'ci-checkin--rejected'}`}>
        <span className="ci-checkin-text">
          {ok ? '✅' : '⚠️'} {name} hôm nay: <b>{label}</b>
          {ck.record.autoMarked ? <> <span className="ci-auto-tag">tự động</span> — hệ thống điểm danh khi tới giờ học, giáo viên có thể điều chỉnh.</> : '.'}
        </span>
      </div>
    );
  }
  if (!ck.checkin) {
    const submit = async () => {
      setBusy(true);
      try {
        await apiFetch(`/classes/my/sessions/${sid}/checkin`, { method: 'POST' });
        toast('Đã điểm danh, chờ giáo viên xác nhận.', 'success');
        onDone();
      } catch (err) {
        toast(err.message || 'Không điểm danh được', 'error');
        setBusy(false);
      }
    };
    return (
      <div className="ci-checkin">
        <span className="ci-checkin-text">📍 {name} hôm nay — bạn đã có mặt chưa?</span>
        <button type="button" className="ci-checkin-btn" disabled={busy} onClick={submit}>🙋 Điểm danh</button>
      </div>
    );
  }
  const st = ck.checkin.status;
  if (st === 'pending') return <div className="ci-checkin ci-checkin--pending"><span className="ci-checkin-text">⏳ Đã điểm danh lúc {fmtTime(ck.checkin.checkedInAt)} — chờ giáo viên xác nhận.</span></div>;
  if (st === 'confirmed') return <div className="ci-checkin ci-checkin--ok"><span className="ci-checkin-text">✅ Giáo viên đã xác nhận bạn có mặt buổi hôm nay.</span></div>;
  return <div className="ci-checkin ci-checkin--rejected"><span className="ci-checkin-text">⚠️ Giáo viên đã điểm danh khác với báo cáo của bạn — liên hệ giáo viên nếu có nhầm lẫn.</span></div>;
}

function Meter({ used, max, lvl }) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : (used > 0 ? 100 : 0);
  return <div className="ci-meter"><div className={`ci-meter-fill ci-meter-fill--${lvl}`} style={{ width: `${pct}%` }} /></div>;
}

function MissedList({ items, summary, late }) {
  if (!items.length) return null;
  return (
    <details className="ci-missed">
      <summary>{summary}</summary>
      <ul>
        {items.map((m, i) => (
          <li key={m._id || i}>
            <span>{m.title}</span>
            <span className="ci-missed-meta">
              {m.deadline ? `hạn ${fmtDate(m.deadline)}` : 'không có hạn'} · {late ? 'đã làm bù' : <>{m.done}/{m.total} mục{m.archived && <> · <span className="ci-missed-tag">đã đóng</span></>}</>}
            </span>
          </li>
        ))}
      </ul>
      {!late && <div className="ci-limit-note">Làm bù đầy đủ bài còn thiếu (kể cả bài đã đóng) vẫn được tính là hoàn thành nhưng <b>nộp trễ</b> — cứ 2 bài nộp trễ tính là 1 bài thiếu.</div>}
    </details>
  );
}

// Buổi nghỉ / BT thiếu breakdown, opened by tapping its tile
function Limits({ c, open }) {
  const aLvl = absenceLevel(c);
  const hLvl = homeworkLevel(c);
  const shown = (open.a ? 1 : 0) + (open.h ? 1 : 0);
  if (!shown) return null;
  const missed = c.missedAssignments || [];
  const late = c.lateAssignments || [];
  return (
    <div className={`ci-limits${shown === 1 ? ' ci-limits--single' : ''}`}>
      {open.a && (
        <div className={`ci-limit ci-limit--${aLvl}`} id={`ci-limit-a-${c.classId}`}>
          <div className="ci-limit-head">
            <span className="ci-limit-title">🚪 Số buổi nghỉ</span>
            <span className="ci-limit-count"><b>{num(c.absenceEquivalent)}</b> / {c.maxAbsencesAllowed} buổi được phép</span>
          </div>
          <Meter used={c.absenceEquivalent} max={c.maxAbsencesAllowed} lvl={aLvl} />
          <div className="ci-limit-detail">
            có phép <b>{c.absentExcused}</b> · không phép <b>{c.absentUnexcused}</b>{c.lateCount ? <> · đi trễ <b>{c.lateCount}</b></> : null}
          </div>
          <div className="ci-limit-line">
            {aLvl === 'fail' ? '⛔ Đã vượt số buổi được nghỉ.'
              : <>Còn được nghỉ tối đa <b>{num(c.remainingAbsences)}</b> buổi{c.failOnExceed === false ? '' : <> — nghỉ quá số này sẽ <b>rớt khóa học</b></>}.</>}
          </div>
          <div className="ci-limit-note">
            {c.excusedCountsAsAbsence ? <>Nghỉ <b>có phép</b> vẫn được tính vào số buổi nghỉ.</> : <>Nghỉ <b>có phép</b> không bị tính vào số buổi nghỉ.</>}
            {' '}Đi trễ <b>{c.lateToAbsenceRatio} lần</b> = 1 buổi nghỉ.
          </div>
        </div>
      )}
      {open.h && (
        <div className={`ci-limit ci-limit--${hLvl}`} id={`ci-limit-h-${c.classId}`}>
          <div className="ci-limit-head">
            <span className="ci-limit-title">📌 Số lần thiếu bài tập</span>
            <span className="ci-limit-count"><b>{c.homeworkMissedCount}</b> / {c.homeworkFailThreshold} (mức rớt)</span>
          </div>
          <Meter used={c.homeworkMissedCount} max={c.homeworkFailThreshold} lvl={hLvl} />
          <div className="ci-limit-line">
            {hLvl === 'fail' ? '⛔ Đã thiếu bài tập tới mức rớt khóa học.'
              : <>Còn được thiếu tối đa <b>{c.homeworkRemaining}</b> bài — thiếu tới <b>{c.homeworkFailThreshold}</b> bài sẽ <b>rớt khóa học</b>.</>}
          </div>
          {c.homeworkLateCount > 0 && (
            <div className="ci-limit-detail">{c.homeworkOverdueCount || 0} bài quá hạn chưa làm + {c.homeworkLateCount} bài nộp trễ (= {Math.floor(c.homeworkLateCount / 2)} bài thiếu)</div>
          )}
          <div className="ci-limit-note">Bài tập quá hạn chưa hoàn thành đầy đủ bị tính là thiếu — kể cả khi giáo viên đã đóng (lưu trữ) bài đó. Làm bù sau hạn được tính là hoàn thành nhưng nộp trễ: cứ <b>2 bài nộp trễ = 1 bài thiếu</b>.</div>
          <MissedList items={missed} summary={`Xem ${missed.length} bài tập đang tính là thiếu`} />
          <MissedList items={late} summary={`Xem ${late.length} bài nộp trễ (tính ${Math.floor(late.length / 2)} bài thiếu)`} late />
        </div>
      )}
    </div>
  );
}

function Tile({ icon, children, label, cls, toggle }) {
  const body = (
    <>
      <div className="ci-tile-icon">{icon}</div>
      <div className="ci-tile-value">{children}</div>
      <div className="ci-tile-label">{label}{toggle && <> <i className="fas fa-chevron-down ci-tile-caret" aria-hidden="true" /></>}</div>
    </>
  );
  if (!toggle) return <div className={`ci-tile ${cls}`}>{body}</div>;
  return (
    <button type="button" className={`ci-tile ci-tile--toggle ${cls}`} aria-expanded={toggle.open} aria-controls={toggle.id}
      onClick={toggle.onClick} title="Bấm để xem chi tiết">{body}</button>
  );
}

function ClassCard({ c, ck, se, idx, animate, open, onToggle, reload }) {
  const st = STATUS[c.status] || STATUS.active;
  const sub = [c.courseName, c.teacherName ? `GV: ${c.teacherName}` : ''].filter(Boolean).join(' · ');
  const aDanger = absenceLevel(c) !== 'ok' ? ' ci-tile--danger' : '';
  const hDanger = homeworkLevel(c) !== 'ok' ? ' ci-tile--danger' : '';
  return (
    <div className={`ci-card ci-card--${c.status}`} style={{ '--i': idx }}>
      <div className="ci-card-head">
        <div>
          <div className="ci-card-title">{c.className}</div>
          {sub && <div className="ci-card-sub">{sub}</div>}
          {(c.startDate || c.endDate) && (
            <div className="ci-dates"><i className="far fa-calendar" aria-hidden="true" /> {fmtDate(c.startDate)}{c.startDate && c.endDate ? ' – ' : ''}{fmtDate(c.endDate)}</div>
          )}
        </div>
        <span className={`ci-badge ${st.cls}`}>{st.label}</span>
      </div>
      {c.statusReason && (c.status === 'warning' || c.status === 'failed') && (
        <div className={`ci-reason ci-reason--${c.status}`}>{c.status === 'failed' ? '⛔' : '⚠️'} {c.statusReason}</div>
      )}
      <ProgressBlock c={c} animate={animate} />
      <Checkin ck={ck} todaySession={c.progress?.todaySession} onDone={reload} />
      <div className="ci-tiles">
        <Tile icon="👥" label="Sĩ số lớp" cls="ci-tile--indigo"><Count value={c.classSize} animate={animate} /></Tile>
        <Tile icon="✅" label={`Chuyên cần · ${c.heldSessions} buổi`} cls="ci-tile--blue">
          {c.heldSessions ? <><Count value={c.attendanceRate} animate={animate} /><small>%</small></> : '—'}
        </Tile>
        <Tile icon="🚪" label="Buổi nghỉ" cls={`ci-tile--amber${aDanger}`}
          toggle={{ open: !!open.a, id: `ci-limit-a-${c.classId}`, onClick: () => onToggle('a') }}>
          {num(c.absenceEquivalent)}<small>/{c.maxAbsencesAllowed}</small>
        </Tile>
        <Tile icon="📌" label="BT thiếu" cls={`ci-tile--rose${hDanger}`}
          toggle={{ open: !!open.h, id: `ci-limit-h-${c.classId}`, onClick: () => onToggle('h') }}>
          {c.homeworkMissedCount}<small>/{c.homeworkFailThreshold}</small>
        </Tile>
      </div>
      <Limits c={c} open={open} />
      <SpeakingExamBlock se={se} classId={c.classId} onChanged={reload} />
    </div>
  );
}

/* ── Warning popup ──
   Absence part once half the allowed absences are used; homework part once
   misses reach the class warning threshold. Absence-only: at most once a day
   (again at once if the numbers change). Homework at warning level is
   sticky: closable for this page view only. */
const POPUP_KEY = 'ewd_class_warning_popup';
let stickyClosedSig = null;
const popupAbsence = (c) => absenceLevel(c) !== 'ok';
const popupHomework = (c) => c.homeworkMissedCount > 0 && homeworkLevel(c) !== 'ok';
const todayVN = () => new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);

function warningFor(classes) {
  const flagged = classes.filter(c => popupAbsence(c) || popupHomework(c) || c.status === 'failed');
  if (!flagged.length) return null;
  const sig = flagged.map(c => `${c.classId}:${c.status}:${popupAbsence(c) ? c.absenceEquivalent : '-'}:${c.homeworkMissedCount}`).join('|') + '@' + todayVN();
  const sticky = flagged.some(popupHomework);
  if (sticky) { if (stickyClosedSig === sig) return null; }
  else { try { if (localStorage.getItem(POPUP_KEY) === sig) return null; } catch { /* show anyway */ } }
  return { flagged, sig, sticky };
}

function WarningPopup({ w, onClose }) {
  const { flagged, sticky } = w;
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const anyFailed = flagged.some(c => c.status === 'failed');
  const anyAbsence = flagged.some(popupAbsence);
  const anyHomework = flagged.some(popupHomework);
  const title = anyFailed ? '⛔ Bạn đã không đạt yêu cầu lớp học'
    : anyAbsence && anyHomework ? '⚠️ Nhắc nhở chuyên cần & bài tập'
      : anyAbsence ? '⚠️ Nhắc nhở chuyên cần' : '⚠️ Nhắc nhở bài tập';
  const foot = anyFailed ? 'Vui lòng liên hệ giáo viên để được hướng dẫn.'
    : anyAbsence && anyHomework ? <>Nếu nghỉ quá số buổi cho phép hoặc thiếu bài tập tới mức rớt, bạn sẽ <b>rớt khóa học</b>. Bài quá hạn chưa làm — kể cả bài giáo viên đã đóng — vẫn bị tính là thiếu.</>
      : anyAbsence ? <>Nếu nghỉ quá số buổi cho phép, bạn sẽ <b>rớt khóa học</b>.</>
        : <>Nếu thiếu bài tập tới mức rớt, bạn sẽ <b>rớt khóa học</b>. Bài quá hạn chưa làm — kể cả bài giáo viên đã đóng — vẫn bị tính là thiếu. Làm bù đầy đủ sẽ được trừ khỏi số lần thiếu.</>;
  const goHomework = () => {
    onClose();
    document.getElementById('homework-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div className="ci-warn-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ci-warn-box" role="alertdialog" aria-modal="true" aria-labelledby="ci-warn-title">
        <div className="ci-warn-title" id="ci-warn-title">{title}</div>
        <div className="ci-warn-body">
          {flagged.map(c => (
            <div key={c.classId} className={`ci-warn-class${c.status === 'failed' ? ' ci-warn-class--failed' : ''}`}>
              <div className="ci-warn-class-name">
                {c.className}
                {c.status === 'failed' ? <> <span className="ci-badge ci-badge--failed">Rớt khóa</span></>
                  : c.status === 'warning' ? <> <span className="ci-badge ci-badge--warning">Cảnh báo</span></> : null}
              </div>
              <ul>
                {popupAbsence(c) && (
                  <li>🚪 Đã nghỉ <b>{num(c.absenceEquivalent)}/{c.maxAbsencesAllowed}</b> buổi được phép (có phép {c.absentExcused}, không phép {c.absentUnexcused}{c.lateCount ? `, trễ ${c.lateCount}` : ''}) —{' '}
                    {absenceLevel(c) === 'fail' ? <b className="ci-warn-bad">đã vượt giới hạn</b> : <>còn được nghỉ <b>{num(c.remainingAbsences)}</b> buổi</>}.</li>
                )}
                {popupHomework(c) && (
                  <li>📌 Thiếu bài tập <b>{c.homeworkMissedCount}</b> lần (rớt khi thiếu {c.homeworkFailThreshold}) —{' '}
                    {homeworkLevel(c) === 'fail' ? <b className="ci-warn-bad">đã tới mức rớt</b> : <>còn được thiếu <b>{c.homeworkRemaining}</b> lần</>}.</li>
                )}
              </ul>
            </div>
          ))}
          <p className="ci-warn-foot">{foot}</p>
          {sticky && (
            <p className="ci-warn-foot">🔔 Thông báo này sẽ hiện lại mỗi lần bạn vào trang cho tới khi số bài thiếu giảm xuống dưới <b>{Math.min(...flagged.filter(popupHomework).map(c => c.homeworkWarnThreshold || 4))}</b> bài.</p>
          )}
        </div>
        <div className="ci-warn-actions">
          {anyHomework && <button type="button" className="ci-warn-btn ci-warn-btn--ghost" onClick={goHomework}>Xem bài tập</button>}
          <button type="button" className="ci-warn-btn" onClick={onClose} autoFocus>Tôi đã hiểu</button>
        </div>
      </div>
    </div>
  );
}

export default function ClassInfoCard() {
  const [state, setState] = useState(null); // { classes, checkin: Map, se }
  const [animate, setAnimate] = useState(true); // count-ups only on the first paint
  const [open, setOpen] = useState({}); // `${classId}:a|h` → true
  const [warn, setWarn] = useState(null);
  const lastRefresh = useRef(0);

  // overview gates the card; check-in + speaking exam are best-effort
  const load = useCallback(() => {
    lastRefresh.current = Date.now();
    return Promise.all([
      apiFetch('/classes/my/overview').catch(() => null),
      apiFetch('/classes/my/checkin').catch(() => null),
      apiFetch('/classes/my/speaking-exam').catch(() => null),
    ]).then(([ov, ck, se]) => {
      if (!ov) return; // error: keep whatever is shown (hidden at first)
      if (!ov.hasClasses || !ov.classes?.length) { setState({ classes: [] }); return; }
      setState({
        classes: ov.classes,
        checkin: new Map((ck?.classes || []).map(c => [String(c.classId), c])),
        se,
      });
      setWarn(w => w || warningFor(ov.classes));
    });
  }, []);

  const reload = useCallback(() => { setAnimate(false); return load(); }, [load]);

  useEffect(() => {
    load();
    // re-fetch when the tab comes back (classmate added, fresh attendance…), ≤ 1 per 30s
    const onVis = () => {
      if (document.visibilityState !== 'visible' || Date.now() - lastRefresh.current < 30000) return;
      reload();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [load, reload]);

  const closeWarn = useCallback(() => {
    if (warn?.sticky) stickyClosedSig = warn.sig;
    else if (warn) { try { localStorage.setItem(POPUP_KEY, warn.sig); } catch { /* ignore */ } }
    setWarn(null);
  }, [warn]);

  if (!state?.classes?.length) return null;
  const lead = state.classes.find(c => c.progress && c.progress.phase === 'ongoing' && c.progress.currentWeek);
  const lp = lead?.progress;

  return (
    <div id="class-info-card" className={animate ? '' : 'ci-no-anim'} style={{ display: 'block' }}>
      <div className="ci-head">
        <h3>🏫 Lớp học của tôi</h3>
        {lp && (
          <span className="ci-head-pill">
            <i className="fas fa-calendar-week" aria-hidden="true" /> Tuần {lp.currentWeek}{lp.totalWeeks ? `/${lp.totalWeeks}` : ''} · Buổi {lp.currentSessionOrdinal}{lp.totalSessions ? `/${lp.totalSessions}` : ''}
          </span>
        )}
        <a className="ci-head-link" href="/classroom.html">Xem chi tiết <i className="fas fa-arrow-right" aria-hidden="true" /></a>
      </div>
      <div className="ci-list">
        {state.classes.map((c, i) => (
          <ClassCard
            key={c.classId}
            c={c}
            ck={state.checkin.get(String(c.classId))}
            se={state.se}
            idx={i}
            animate={animate}
            open={{ a: open[`${c.classId}:a`], h: open[`${c.classId}:h`] }}
            onToggle={(k) => setOpen(o => ({ ...o, [`${c.classId}:${k}`]: !o[`${c.classId}:${k}`] }))}
            reload={reload}
          />
        ))}
      </div>
      {warn && <WarningPopup w={warn} onClose={closeWarn} />}
    </div>
  );
}
