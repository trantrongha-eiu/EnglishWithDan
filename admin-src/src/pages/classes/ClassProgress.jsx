// "Tuần X/Y · Buổi X/Y" for the teacher class pages — renders the `progress`
// object from backend/utils/classProgress.js (GET /classes, /classes/:id,
// /classes/:id/sessions). Days are "YYYY-MM-DD" keys on the Vietnam
// calendar, so all date math here is UTC to keep the browser's timezone out.

import { keyLabel, relDay, sessionName, phaseText } from './classProgressUtils';

export function ProgressRing({ pct = 0, size = 72, stroke = 7, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <div className="cp-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id="cp-ring-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6366f1" /><stop offset=".55" stopColor="#8b5cf6" /><stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle className="cp-ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle className="cp-ring-fill" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="url(#cp-ring-g)"
          style={{ strokeDasharray: c, strokeDashoffset: off, '--cp-c': c }} />
      </svg>
      <div className="cp-ring-center">{children ?? <><b>{pct}</b><span>%</span></>}</div>
    </div>
  );
}

export function WeekTrack({ progress: p }) {
  if (!p?.totalWeeks) return null;
  const cur = p.phase === 'upcoming' ? 0 : (p.currentWeek || 0);
  if (p.totalWeeks > 30) {
    return <div className="cp-weeks cp-weeks--bar"><div className="cp-weeks-fill" style={{ width: `${Math.round((cur / p.totalWeeks) * 100)}%` }} /></div>;
  }
  return (
    <div className="cp-weeks">
      {Array.from({ length: p.totalWeeks }, (_, i) => i + 1).map((w) => (
        <span key={w} title={`Tuần ${w}`} style={{ '--i': w }}
          className={`cp-wseg${w < cur || p.phase === 'ended' ? ' is-done' : w === cur ? ' is-now' : ''}`} />
      ))}
    </div>
  );
}

export function ProgressChips({ progress: p, compact = false }) {
  if (!p) return null;
  return (
    <div className={`cp-chips${compact ? ' cp-chips--sm' : ''}`}>
      {p.currentWeek
        ? <span className="cp-chip cp-chip--week">📆 Tuần <b>{p.currentWeek}</b>{p.totalWeeks ? <small>/{p.totalWeeks}</small> : null}</span>
        : p.totalWeeks ? <span className="cp-chip cp-chip--week">📆 {p.totalWeeks} tuần</span> : null}
      <span className="cp-chip cp-chip--session">🎯 Buổi <b>{p.currentSessionOrdinal || 0}</b>{p.totalSessions ? <small>/{p.totalSessions}</small> : null}</span>
    </div>
  );
}

function NextLine({ progress: p, onTakeAttendance }) {
  if (p.todaySession) {
    const s = p.todaySession;
    const taken = s.status === 'held';
    return (
      <div className="cp-next cp-next--today">
        <span className="cp-dot" />
        <span>
          <b>Hôm nay: {sessionName(s)}</b>{s.startTime ? ` · ${s.startTime}` : ''}{s.topic ? ` — ${s.topic}` : ''}
          {s.autoMarked && <span className="cp-auto">tự điểm danh</span>}
        </span>
        {onTakeAttendance && (
          <button type="button" className="btn btn-primary btn-sm cp-next-btn" onClick={() => onTakeAttendance(s._id)}>
            {taken ? '✏️ Xem / sửa điểm danh' : '✅ Điểm danh ngay'}
          </button>
        )}
      </div>
    );
  }
  if (p.nextSession) {
    const s = p.nextSession;
    return (
      <div className="cp-next">
        <span aria-hidden="true">🗓️</span>
        <span>Tiếp theo: <b>{sessionName(s)}</b> · {keyLabel(s.dayKey)}{s.startTime ? ` · ${s.startTime}` : ''} <span className="cp-muted">({relDay(p.today, s.dayKey)})</span>{s.topic ? ` — ${s.topic}` : ''}</span>
      </div>
    );
  }
  return null;
}

export function WeekStrip({ progress: p, onPick }) {
  const list = p?.weekSessions || [];
  if (!list.length) return null;
  return (
    <div className="cp-week">
      <div className="cp-week-title">Lịch tuần {p.phase === 'upcoming' ? '1 (tuần đầu tiên)' : p.currentWeek}</div>
      <div className="cp-week-days">
        {list.map((s, i) => {
          const state = s.dayKey < p.today ? (s.status === 'held' ? 'done' : 'past') : s.dayKey === p.today ? 'today' : 'future';
          const Tag = onPick && state !== 'future' ? 'button' : 'div';
          return (
            <Tag key={s._id} type={Tag === 'button' ? 'button' : undefined} className={`cp-day cp-day--${state}`} style={{ '--i': i }}
              onClick={Tag === 'button' ? () => onPick(s._id) : undefined}
              title={state === 'past' ? 'Đã qua nhưng chưa điểm danh' : undefined}>
              <span className="cp-day-wd">{keyLabel(s.dayKey).split(',')[0]}{s.startTime ? ` · ${s.startTime}` : ''}</span>
              <span className="cp-day-date">{s.dayKey.slice(8, 10)}/{s.dayKey.slice(5, 7)}</span>
              <span className="cp-day-name">
                {s.type === 'makeup' ? 'Học bù' : `Buổi ${s.ordinal || s.sessionNumber}`}
                {state === 'done' && ' ✓'}{state === 'past' && ' ⚠'}
                {s.autoMarked && <span className="cp-auto">auto</span>}
              </span>
              {s.topic && <span className="cp-day-topic" title={s.topic}>{s.topic}</span>}
            </Tag>
          );
        })}
      </div>
    </div>
  );
}

// Big header block on ClassDetail.
export function ClassProgressHero({ progress: p, onTakeAttendance, onGoSessions }) {
  if (!p) return null;
  return (
    <div className="cp-hero">
      <div className="cp-hero-top">
        <ProgressRing pct={p.percent || 0} size={92} stroke={8} />
        <div className="cp-hero-main">
          <ProgressChips progress={p} />
          <div className="cp-phase">{phaseText(p)}</div>
          <WeekTrack progress={p} />
          <NextLine progress={p} onTakeAttendance={onTakeAttendance} />
          {p.pendingPastSessions > 0 && (
            <button type="button" className="cp-pending" onClick={onGoSessions}>
              ⚠️ {p.pendingPastSessions} buổi đã qua vẫn ở trạng thái “Dự kiến” — xem Buổi học
            </button>
          )}
        </div>
      </div>
      <WeekStrip progress={p} onPick={onTakeAttendance} />
    </div>
  );
}
