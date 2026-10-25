import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { sessionName } from './classProgressUtils';

// Drill-down behind the 4 KPI tiles on the class list. Class-based tiles
// (active / today) reuse the already-loaded class list; student-based tiles
// (students / atRisk) fetch the flattened roster from GET /classes/students.

const ENR_BADGE = { active: 'badge-green', warning: 'badge-yellow', failed: 'badge-red', completed: 'badge-blue', dropped: 'badge-gray' };
const ENR_LABEL = { active: 'Đang học', warning: 'Cảnh báo', failed: 'Rớt khóa', completed: 'Hoàn thành', dropped: 'Nghỉ học' };
const PHASE_LABEL = { upcoming: 'Sắp khai giảng', ongoing: 'Đang học', ended: 'Đã kết thúc', unscheduled: 'Chưa xếp lịch' };

const TITLES = {
  active: 'Lớp đang học',
  today: 'Có buổi hôm nay',
  students: 'Tổng học viên',
  atRisk: 'Học viên cảnh báo / rớt',
};

function ClassRows({ classes, isAdmin, mode }) {
  if (!classes.length) return <div className="table-empty" style={{ padding: 24 }}>Không có lớp nào</div>;
  return (
    <table className="table">
      <thead>
        <tr>
          <th>LỚP</th>
          {isAdmin && <th>GIÁO VIÊN</th>}
          {mode === 'today' ? <><th>BUỔI HÔM NAY</th><th>ĐIỂM DANH</th></> : <><th>TIẾN ĐỘ</th><th>GIAI ĐOẠN</th></>}
          <th>SĨ SỐ</th>
        </tr>
      </thead>
      <tbody>
        {classes.map((c) => {
          const p = c.progress || {};
          const k = c.enrollmentCounts || {};
          const t = p.todaySession;
          return (
            <tr key={c._id}>
              <td>
                <Link to={`/classes/${c._id}`} style={{ fontWeight: 700 }}>{c.name}</Link>
                {c.courseName && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.courseName}</div>}
              </td>
              {isAdmin && <td style={{ fontSize: 13 }}>{c.teacher?.name || c.teacher?.username || '—'}</td>}
              {mode === 'today' ? (
                <>
                  <td style={{ fontSize: 13 }}>{t ? sessionName(t) : '—'}{(t?.startTime || c.startTime) ? ` · ${t?.startTime || c.startTime}` : ''}</td>
                  <td>
                    {t?.status === 'held'
                      ? <span className="badge badge-green"><span className="dot" />Đã điểm danh{t.autoMarked ? ' (tự động)' : ''}</span>
                      : <span className="badge badge-yellow"><span className="dot" />Chưa điểm danh</span>}
                  </td>
                </>
              ) : (
                <>
                  <td style={{ fontSize: 13 }}>{p.percent != null ? `${p.percent}%` : '—'}</td>
                  <td style={{ fontSize: 13 }}>{PHASE_LABEL[p.phase] || '—'}</td>
                </>
              )}
              <td style={{ fontSize: 13 }}>
                {k.total || 0}
                {(k.warning || 0) + (k.failed || 0) > 0 && <span style={{ color: 'var(--text3)' }}> ({(k.warning || 0) + (k.failed || 0)} ⚠️)</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function StudentRows({ rows, risk }) {
  if (!rows.length) return <div className="table-empty" style={{ padding: 24 }}>{risk ? 'Không có học viên nào bị cảnh báo / rớt 🎉' : 'Chưa có học viên'}</div>;
  return (
    <table className="table">
      <thead>
        <tr><th>HỌC VIÊN</th><th>LỚP</th><th>ĐÃ HỌC</th><th>ĐÃ NGHỈ</th><th>CHUYÊN CẦN</th><th>BT THIẾU</th><th>TRẠNG THÁI</th></tr>
      </thead>
      <tbody>
        {rows.map((e) => {
          const s = e.stats || {};
          const absent = (s.absentUnexcused || 0) + (s.absentExcused || 0);
          return (
            <tr key={e.enrollmentId}>
              <td>
                <Link to={`/students/${e.student._id}`} style={{ fontWeight: 700 }}>{e.student.name || e.student.username}</Link>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.student.email}</div>
              </td>
              <td style={{ fontSize: 13 }}>
                <Link to={`/classes/${e.class._id}`}>{e.class.name}</Link>
                {e.class.status === 'archived' && <span style={{ fontSize: 11, color: 'var(--text3)' }}> (lưu trữ)</span>}
              </td>
              <td style={{ fontSize: 13 }}>{s.attendedCount || 0}/{s.heldSessions || 0}</td>
              <td style={{ fontSize: 13 }}>{absent}{s.lateCount ? ` · ${s.lateCount} trễ` : ''}</td>
              <td style={{ fontSize: 13 }}>{s.heldSessions ? `${s.attendanceRate || 0}%` : '—'}</td>
              <td style={{ fontSize: 13 }}>
                      {s.homeworkMissedCount || 0}
                      {s.homeworkLateCount ? <div style={{ fontSize: 11, color: 'var(--text3)' }} title="Bài làm bù sau hạn — cứ 2 bài nộp trễ tính là 1 bài thiếu">{s.homeworkOverdueCount || 0} quá hạn · {s.homeworkLateCount} nộp trễ</div> : null}
                    </td>
              <td>
                <span className={`badge ${ENR_BADGE[e.status] || 'badge-gray'}`}><span className="dot" />{ENR_LABEL[e.status] || e.status}</span>
                {e.statusReason && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{e.statusReason}</div>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function ClassKpiModal({ kind, classes, isAdmin, onClose }) {
  const studentMode = kind === 'students' || kind === 'atRisk';
  const [students, setStudents] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!studentMode) return;
    apiFetch('/classes/students')
      .then((d) => setStudents(d.students || []))
      .catch((e) => setError(e.message));
  }, [studentMode]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const needle = q.trim().toLowerCase();
  const live = classes.filter((c) => c.status !== 'archived');
  let body;
  let count;
  if (studentMode) {
    const rank = { failed: 0, warning: 1, active: 2, completed: 3, dropped: 4 };
    const rows = (students || [])
      .filter((e) => kind !== 'atRisk' || e.status === 'warning' || e.status === 'failed')
      .filter((e) => !needle || [e.student.name, e.student.username, e.student.email, e.class.name]
        .filter(Boolean).some((v) => v.toLowerCase().includes(needle)))
      .sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9)
        || (a.student.name || '').localeCompare(b.student.name || '', 'vi'));
    count = rows.length;
    body = error ? <div className="table-empty" style={{ padding: 24 }}>{error}</div>
      : students === null ? <div className="table-empty" style={{ padding: 24 }}>Đang tải…</div>
      : <StudentRows rows={rows} risk={kind === 'atRisk'} />;
  } else {
    const rows = (kind === 'today' ? live.filter((c) => c.progress?.todaySession) : live)
      .filter((c) => !needle || [c.name, c.courseName, c.teacher?.name].filter(Boolean).some((v) => v.toLowerCase().includes(needle)))
      .sort((a, b) => (a.progress?.todaySession?.startTime || a.startTime || '99').localeCompare(b.progress?.todaySession?.startTime || b.startTime || '99'));
    count = rows.length;
    body = <ClassRows classes={rows} isAdmin={isAdmin} mode={kind} />;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 960, width: '96vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{TITLES[kind]} ({count})</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ padding: '14px 20px 0' }}>
          <input className="form-input" autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={studentMode ? '🔍 Tìm học viên, email, lớp…' : '🔍 Tìm lớp, khóa học…'} style={{ maxWidth: 300 }} />
        </div>
        <div style={{ padding: '14px 20px 20px', overflow: 'auto' }}>
          <div className="table-wrap">{body}</div>
        </div>
      </div>
    </div>
  );
}
