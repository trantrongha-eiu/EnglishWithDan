import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import VocabDetailPanel from '../components/VocabDetailPanel';

// Body content (mini stats + books table + activity chart) moved into
// components/VocabDetailPanel.jsx (2026-07-25, admin panel audit finding
// #4) so the new unified StudentDetail.jsx page can reuse it — this modal
// now just supplies the header/frame around it.
function VocabActivityModal({ student, onClose }) {
  const name = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.username;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 820, maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📖 {name}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>@{student.username} · {student.email || ''}</span>
            <Link to={`/students/${student._id}`} style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--blue)' }}>
              Xem hồ sơ đầy đủ (gồm lịch sử làm bài) →
            </Link>
          </div>
          <VocabDetailPanel student={student} />
        </div>
      </div>
    </div>
  );
}

function activityDotColor(lastActivity) {
  if (!lastActivity) return 'var(--text3)';
  const days = (Date.now() - new Date(lastActivity)) / 86400000;
  if (days <= 1) return 'var(--green)';
  if (days <= 7) return 'var(--yellow)';
  return 'var(--accent2)';
}

export default function VocabActivity() {
  const toast = useToast();
  const confirm = useConfirm();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('words-desc');
  const [selected, setSelected] = useState(null);
  const [remindingId, setRemindingId] = useState(null);
  const [streakActionId, setStreakActionId] = useState(null);

  useEffect(() => {
    apiFetch('/admin/vocab-students')
      .then(d => setStudents(d.students || []))
      .catch(e => toast(e.message, 'error'));
  }, []);

  const displayName = s => [s.firstName, s.lastName].filter(Boolean).join(' ') || s.username || '';

  // Routes through the SAME tracked endpoint Users.jsx's reminder button
  // uses (POST /admin/users/:id/remind), just with a vocab-specific preset
  // subject/body, instead of firing a one-off POST /admin/messages. That
  // endpoint is what increments studyReminderCount and (at 3+) triggers the
  // site-wide warning banner — previously this button sent a nudge that
  // looked identical to the Users.jsx one but silently didn't count toward
  // that escalation, so a student could be reminded repeatedly from here
  // without ever tripping the banner.
  async function remindStudent(s) {
    setRemindingId(s._id);
    try {
      const d = await apiFetch(`/admin/users/${s._id}/remind`, {
        method: 'POST',
        body: JSON.stringify({
          subject: 'Nhắc nhở học từ vựng 📚',
          message: `Chào ${displayName(s)}, đã lâu rồi bạn chưa ôn từ vựng. Hãy dành vài phút hôm nay để giữ chuỗi học và ôn lại những từ đã lưu nhé! 💪`,
        }),
      });
      setStudents(list => list.map(x => x._id === s._id ? { ...x, studyReminderCount: d.studyReminderCount } : x));
      toast(`Đã gửi nhắc nhở tới ${displayName(s)} (lần thứ ${d.studyReminderCount})`);
    } catch (err) { toast(err.message, 'error'); }
    finally { setRemindingId(null); }
  }

  // Both mutate the row in-place from the response instead of a full
  // reload — same as other admin tables here (e.g. Tuition's togglePaid).
  function resetStreak(s) {
    confirm(`Xóa streak hiện tại (${s.learningStreak} ngày) của ${displayName(s)}? Có thể khôi phục lại sau bằng nút "Phục hồi streak".`, async () => {
      setStreakActionId(s._id);
      try {
        const d = await apiFetch(`/admin/vocab-students/${s._id}/reset-streak`, { method: 'POST' });
        setStudents(list => list.map(x => x._id === s._id ? { ...x, learningStreak: d.learningStreak, previousStreak: d.previousStreak } : x));
        toast(`Đã xóa streak của ${displayName(s)}`);
      } catch (err) { toast(err.message, 'error'); }
      finally { setStreakActionId(null); }
    });
  }

  async function restoreStreak(s) {
    setStreakActionId(s._id);
    try {
      const d = await apiFetch(`/admin/vocab-students/${s._id}/restore-streak`, { method: 'POST' });
      setStudents(list => list.map(x => x._id === s._id ? { ...x, learningStreak: d.learningStreak, previousStreak: 0 } : x));
      toast(`Đã khôi phục streak của ${displayName(s)} (${d.learningStreak} ngày)`);
    } catch (err) { toast(err.message, 'error'); }
    finally { setStreakActionId(null); }
  }

  const sortFns = {
    'words-desc': (a, b) => (b.totalWords || 0) - (a.totalWords || 0),
    'views-desc': (a, b) => (b.totalViews || 0) - (a.totalViews || 0),
    'streak-desc': (a, b) => (b.learningStreak || 0) - (a.learningStreak || 0),
    'recent': (a, b) => {
      const da = a.lastVocabActivity ? new Date(a.lastVocabActivity) : new Date(0);
      const db = b.lastVocabActivity ? new Date(b.lastVocabActivity) : new Date(0);
      return db - da;
    },
    // Was comparing `username` while the column shows the composed
    // first+last name (falling back to username) — "Tên A → Z" silently
    // sorted by a different value than what's on screen.
    'name': (a, b) => displayName(a).localeCompare(displayName(b), 'vi', { numeric: true }),
  };

  const filtered = students
    .filter(s => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (s.username || '').toLowerCase().includes(q)
        || (s.email || '').toLowerCase().includes(q)
        || (s.firstName || '').toLowerCase().includes(q)
        || (s.lastName || '').toLowerCase().includes(q);
    })
    .sort(sortFns[sort] || sortFns['words-desc']);

  const activeCount  = students.filter(s => (s.totalWords || 0) > 0).length;
  const totalWords   = students.reduce((sum, s) => sum + (s.totalWords   || 0), 0);
  const totalViews   = students.reduce((sum, s) => sum + (s.totalViews   || 0), 0);
  const totalStudied = students.reduce((sum, s) => sum + (s.totalStudied || 0), 0);

  return (
    <>
      {selected && <VocabActivityModal student={selected} onClose={() => setSelected(null)} />}

      <div className="section-header">
        <h2 className="section-title">Hoạt động từ vựng ({filtered.length} học sinh)</h2>
      </div>

      {/* Summary stat cards */}
      <div className="stats-row" style={{ marginBottom: 16 }}>
        <div className="stat-card blue">
          <div className="stat-label">Đang học</div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-sub">Học sinh có từ vựng</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Tổng từ đã lưu</div>
          <div className="stat-value">{totalWords.toLocaleString('vi-VN')}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Tổng lượt xem</div>
          <div className="stat-value">{totalViews.toLocaleString('vi-VN')}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Từ đã ôn luyện</div>
          <div className="stat-value">{totalStudied.toLocaleString('vi-VN')}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input className="form-input search-input" placeholder="Tìm học sinh..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="form-input" value={sort} onChange={e => setSort(e.target.value)} style={{ width: 190 }}>
          <option value="words-desc">Nhiều từ nhất</option>
          <option value="views-desc">Nhiều lượt xem nhất</option>
          <option value="streak-desc">Chuỗi học dài nhất</option>
          <option value="recent">Hoạt động gần nhất</option>
          <option value="name">Tên A → Z</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>HỌC SINH</th>
              <th>SỔ</th>
              <th>TỔNG TỪ</th>
              <th>ĐÃ THUỘC</th>
              <th>LƯỢT XEM</th>
              <th>NGÀY HĐ</th>
              <th>LẦN CUỐI</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={8} className="table-empty">Không có dữ liệu</td></tr>
              : filtered.map(s => {
                const name = displayName(s);
                const mastered = (s.totalWords || 0) > 0
                  ? Math.round(((s.daThuoc || 0) / s.totalWords) * 100) : 0;
                const dotColor = activityDotColor(s.lastVocabActivity);
                return (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--surface2)', border: '2px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 13, flexShrink: 0, color: 'var(--blue)',
                        }}>
                          {(s.username?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {name}
                            {(s.learningStreak || 0) > 0 && (
                              <span style={{ fontSize: 11, color: '#fbbf24', marginLeft: 4 }}>🔥{s.learningStreak}</span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{s.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{s.totalBooks || 0}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{(s.totalWords || 0).toLocaleString('vi-VN')}</span>
                    </td>
                    <td>
                      {(s.totalWords || 0) > 0 ? (
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 13 }}>{s.daThuoc || 0}</div>
                          <div style={{ width: 80, height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden', marginTop: 3 }}>
                            <div style={{ width: `${mastered}%`, height: '100%', background: 'var(--green)', borderRadius: 2 }} />
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{mastered}%</div>
                        </div>
                      ) : <span style={{ color: 'var(--text3)' }}>–</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--yellow)' }}>
                        {(s.totalViews || 0).toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {(s.activeDays || 0) > 0
                        ? <><span style={{ fontWeight: 700 }}>{s.activeDays}</span><span style={{ fontSize: 11, color: 'var(--text3)' }}> ngày</span></>
                        : <span style={{ color: 'var(--text3)' }}>–</span>}
                    </td>
                    <td>
                      <span style={{ color: dotColor }}>● </span>
                      <span style={{ fontSize: 12 }}>
                        {s.lastVocabActivity ? formatDate(s.lastVocabActivity).split(' ')[0] : 'Chưa có'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(s)}
                          style={{ whiteSpace: 'nowrap' }}>
                          📊 Chi tiết
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => remindStudent(s)}
                          disabled={remindingId === s._id} title="Gửi tin nhắn nhắc học từ vựng — tính vào số lần nhắc nhở chung (xem trang Người dùng)"
                          style={{ whiteSpace: 'nowrap' }}>
                          {remindingId === s._id ? '⏳ Đang gửi...' : '🔔 Nhắc nhở'}
                          {s.studyReminderCount > 0 && (
                            <span className={`badge ${s.studyReminderCount >= 3 ? 'badge-red' : 'badge-gray'}`} style={{ marginLeft: 6 }}>
                              {s.studyReminderCount}
                            </span>
                          )}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => resetStreak(s)}
                          disabled={streakActionId === s._id || !(s.learningStreak > 0)}
                          title="Xóa streak hiện tại (có thể khôi phục lại)"
                          style={{ whiteSpace: 'nowrap', color: 'var(--danger, #ef4444)' }}>
                          🗑️ Xóa streak
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => restoreStreak(s)}
                          disabled={streakActionId === s._id || !(s.previousStreak > 0)}
                          title={s.previousStreak > 0 ? `Khôi phục streak ${s.previousStreak} ngày` : 'Không có streak nào để khôi phục'}
                          style={{ whiteSpace: 'nowrap' }}>
                          ♻️ Phục hồi streak
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}
