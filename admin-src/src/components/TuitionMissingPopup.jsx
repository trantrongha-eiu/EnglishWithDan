import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import Modal from './ui/Modal';
import StudentTuitionModal from '../pages/tuition/StudentTuitionModal';
import { displayName } from '../utils/format';

// Admin-only popup: students in an active class with no tuition entered for
// the billing month (GET /tuition/missing-in-classes — rule in
// tuitionService.getClassStudentsMissingTuition). Pops up on opening the
// admin panel; "Để sau" hides it until tomorrow unless a NEW student joins
// the list, and the topbar chip reopens it any time.
// Both dialogs are portalled to <body>: this component sits inside .topbar,
// whose backdrop-filter makes it the containing block for position:fixed,
// so an in-place overlay got clipped to the 60px topbar.

const DISMISS_KEY = 'admin-tuition-missing-dismissed';

function todayKey() {
  return new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD, local time
}
function readDismissed() {
  try {
    const d = JSON.parse(localStorage.getItem(DISMISS_KEY) || 'null');
    return d?.day === todayKey() ? new Set(d.ids || []) : new Set();
  } catch { return new Set(); }
}

export default function TuitionMissingPopup() {
  const { data, reload } = useApi('/tuition/missing-in-classes', { pollMs: 5 * 60_000 });
  const rows = data?.students || [];
  const [dismissed, setDismissed] = useState(readDismissed);
  const [reopened, setReopened] = useState(false);
  const [editing, setEditing] = useState(null); // student row being billed
  const open = reopened || rows.some(r => !dismissed.has(r.studentId));

  function snooze() {
    const ids = rows.map(r => r.studentId);
    try { localStorage.setItem(DISMISS_KEY, JSON.stringify({ day: todayKey(), ids })); } catch { /* storage unavailable */ }
    setDismissed(new Set(ids));
    setReopened(false);
  }

  if (!rows.length) return null;

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReopened(true)}
        title="Học sinh đang học trong lớp nhưng chưa nhập học phí"
        style={{ color: 'var(--danger)', fontWeight: 700 }}>
        💰 {rows.length} chưa nhập học phí
      </button>
      {open && !editing && createPortal(
        <Modal
          title={`⚠️ ${rows.length} học sinh đang học chưa có học phí`}
          onClose={snooze}
          width={600}
          footer={(
            <>
              <Link to="/tuition" className="btn btn-ghost" onClick={snooze}>Mở trang Học phí</Link>
              <button type="button" className="btn btn-primary" onClick={snooze}>Để sau</button>
            </>
          )}
        >
          <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            Đang học trong lớp nhưng chưa có khoản học phí tháng này (hoặc tháng lớp bắt đầu), cũng chưa có học phí khóa học từ lúc vào lớp.
          </div>
          <div className="table-wrap" style={{ maxHeight: 380, overflowY: 'auto' }}>
            <table className="table">
              <thead><tr><th>Học sinh</th><th>Lớp</th><th>Kỳ thiếu</th><th></th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.studentId}>
                    <td>
                      <Link to={`/students/${r.studentId}`} onClick={snooze}><strong>{displayName(r)}</strong></Link>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{r.username}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {r.classes.map(c => <div key={c.classId}><Link to={`/classes/${c.classId}`} onClick={snooze}>{c.name}</Link></div>)}
                    </td>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{r.month}/{r.year}</td>
                    <td><button type="button" className="btn btn-soft btn-sm" onClick={() => setEditing(r)}>＋ Nhập học phí</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>,
        document.body,
      )}

      {editing && createPortal(
        <StudentTuitionModal
          user={{ _id: editing.studentId, username: editing.username }}
          initialPeriod={{ month: editing.month, year: editing.year }}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />,
        document.body,
      )}
    </>
  );
}
