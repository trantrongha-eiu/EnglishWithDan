import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import VocabDetailPanel from '../components/VocabDetailPanel';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 25;

// Unified "Chi tiết học sinh" page (2026-07-25, admin panel audit finding
// #4) — an admin previously had to check 3 unlinked pages (Users.jsx for
// profile/plan, StudentHistory.jsx for exam history, VocabActivity.jsx for
// vocab stats) to get a full picture of one student, re-searching their
// name on each. This page pulls all three into one place via the existing
// read endpoints (GET /admin/users/:id, GET /admin/recent-attempts?userId=,
// GET /admin/vocab-students) — no new backend writes, this page is
// deliberately read-only. Editing (plan, ban, class, delete) stays on
// Users.jsx; deleting a specific attempt stays on StudentHistory.jsx —
// this page is for VIEWING the consolidated picture, not a new place to
// mutate data.

function formatLastSeen(date) {
  if (!date) return { text: 'Chưa có', color: 'var(--text3)' };
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)   return { text: 'Vừa online', color: '#22c55e' };
  if (mins < 60)  return { text: `${mins} phút trước`, color: '#4ade80' };
  if (hours < 24) return { text: `${hours} giờ trước`, color: '#fbbf24' };
  if (days < 7)   return { text: `${days} ngày trước`, color: 'var(--text2)' };
  return { text: formatDate(date).split(' ')[0], color: 'var(--text3)' };
}

function roleBadge(r) {
  const map = { admin: 'badge-red', teacher: 'badge-blue', student: 'badge-green' };
  const label = { admin: 'Admin', teacher: 'Teacher', student: 'Student' };
  return <span className={`badge ${map[r] || 'badge-gray'}`}>{label[r] || r}</span>;
}

function planBadge(plan, expiresAt) {
  if (plan === 'premium') {
    const exp = expiresAt ? new Date(expiresAt) : null;
    const days = exp ? Math.ceil((exp - new Date()) / 86400000) : null;
    const expired = days !== null && days <= 0;
    const urgentColor = !expired && days !== null && days <= 7 ? '#f59e0b' : null;
    const countStr = days === null ? '' : expired ? ' (Hết hạn)' : days === 0 ? ' (Hết hạn hôm nay)' : ` (còn ${days} ngày)`;
    return (
      <span className={`badge ${expired ? 'badge-gray' : 'badge-blue'}`}
        style={urgentColor ? { background: urgentColor, color: '#fff', border: 'none' } : {}}>
        {expired ? '⏰ Hết hạn' : '⭐ Premium'}{countStr}
      </span>
    );
  }
  return <span className="badge badge-gray">Free</span>;
}

function bandBadge(score) {
  if (score == null) return '–';
  const color = score >= 7 ? 'var(--green)' : score >= 5 ? 'var(--yellow)' : 'var(--accent2)';
  return <span style={{ color, fontWeight: 700 }}>{score.toFixed(1)}</span>;
}

const SKILL_META = {
  'reading':           { color: '#3d8bff', label: 'Reading' },
  'listening':         { color: '#34d399', label: 'Listening' },
  'writing':           { color: '#fbbf24', label: 'Writing' },
  'speaking':          { color: '#a78bfa', label: 'Speaking' },
  'reading-practice':  { color: '#93c5fd', label: '📄 Reading lẻ' },
  'listening-practice':{ color: '#6ee7b7', label: '🎵 Listening lẻ' },
  'writing-practice':  { color: '#f97316', label: '✍ Writing lẻ' },
  'task1-practice':    { color: '#fb923c', label: '📊 Task 1' },
  'task2-practice':    { color: '#ef4444', label: '📝 Task 2' },
};

function skillBadge(skill) {
  const { color, label } = SKILL_META[skill] || { color: '#8b92a8', label: skill };
  return <span style={{ background: color + '22', color, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{label}</span>;
}

function formatDur(sec) {
  if (sec == null) return '–';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m${String(s).padStart(2, '0')}s`;
}

export default function StudentDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [tab, setTab] = useState('history');

  const [user, setUser] = useState(null);
  // Starting true (instead of setState(true) synchronously inside the
  // effects below) shows the same loading state without tripping
  // react-hooks/set-state-in-effect — same pattern as StudentHistory.jsx.
  // Only correct because this page always fully remounts when navigating
  // to a different student (every link into it is from a different route,
  // there's no in-page "next/prev student" control) — [id] never actually
  // changes on an already-mounted instance.
  const [loadingUser, setLoadingUser] = useState(true);

  const [attempts, setAttempts] = useState([]);
  const [attemptsTotal, setAttemptsTotal] = useState(0);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [skillFilter, setSkillFilter] = useState('');
  const [page, setPage] = useState(1);

  const [vocabStudent, setVocabStudent] = useState(null);

  useEffect(() => {
    apiFetch(`/admin/users/${id}`)
      .then(d => setUser(d.user))
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoadingUser(false));
  }, [id]);

  useEffect(() => {
    apiFetch(`/admin/recent-attempts?userId=${id}&limit=500`)
      .then(d => { setAttempts(d.attempts || []); setAttemptsTotal(d.total ?? (d.attempts || []).length); })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoadingAttempts(false));
  }, [id]);

  useEffect(() => {
    // /admin/vocab-students isn't per-student — it's the same list VocabActivity.jsx
    // shows, filtered down to this one row here rather than adding a new endpoint.
    apiFetch('/admin/vocab-students')
      .then(d => setVocabStudent((d.students || []).find(s => s._id === id) || null))
      .catch(() => {});
  }, [id]);

  const filteredAttempts = skillFilter ? attempts.filter(a => a.skill === skillFilter) : attempts;
  const pageCount = Math.max(1, Math.ceil(filteredAttempts.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedAttempts = filteredAttempts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const ls = user ? formatLastSeen(user.lastSeen) : null;
  const name = user ? ([user.firstName, user.lastName].filter(Boolean).join(' ') || user.username) : '';

  if (loadingUser) return <div style={{ padding: 40, color: 'var(--text2)' }}>Đang tải...</div>;
  if (!user) return <div style={{ padding: 40, color: 'var(--text2)' }}>Không tìm thấy học sinh</div>;

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">👤 {name}</h2>
        <Link to="/users" className="btn btn-ghost btn-sm">← Quay lại Người dùng</Link>
      </div>

      {/* Profile header card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--surface2)', border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 18, flexShrink: 0, color: 'var(--blue)',
          }}>
            {(user.username?.[0] || '?').toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>@{user.username} · {user.email}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {roleBadge(user.role)}
            {planBadge(user.plan, user.planExpiresAt)}
            {user.className && <span className="badge badge-purple">Lớp {user.className}</span>}
            {user.isBanned && <span className="badge badge-red">Bị cấm</span>}
            {user.studyReminderCount > 0 && (
              <span className={`badge ${user.studyReminderCount >= 3 ? 'badge-red' : 'badge-gray'}`} title="Số lần bị nhắc nhở học tập">
                🔔 {user.studyReminderCount} lần nhắc nhở
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 12, color: 'var(--text3)', flexWrap: 'wrap' }}>
          <span>Ngày tạo: {formatDate(user.createdAt).split(' ')[0]}</span>
          <span>Hoạt động gần nhất: <span style={{ color: ls.color }}>{ls.text}</span></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="inner-tabs-nav" style={{ marginBottom: 16 }}>
        <button className={`inner-tab${tab === 'history' ? ' active' : ''}`} onClick={() => setTab('history')}>
          🕓 Lịch sử làm bài ({attemptsTotal})
        </button>
        <button className={`inner-tab${tab === 'vocab' ? ' active' : ''}`} onClick={() => setTab('vocab')}>
          📈 Hoạt động từ vựng
        </button>
      </div>

      {tab === 'history' && (
        <>
          <div className="filter-bar" style={{ marginBottom: 16 }}>
            <select className="form-input" value={skillFilter} onChange={e => { setSkillFilter(e.target.value); setPage(1); }} style={{ width: 200 }}>
              <option value="">Tất cả kỹ năng</option>
              <option value="reading">Reading (đề thi)</option>
              <option value="reading-practice">📄 Reading lẻ</option>
              <option value="listening">Listening (đề thi)</option>
              <option value="listening-practice">🎵 Listening lẻ</option>
              <option value="writing">Writing (đề thi)</option>
              <option value="writing-practice">✍ Writing lẻ</option>
              <option value="task1-practice">📊 Task 1 Practice</option>
              <option value="task2-practice">📝 Task 2 Practice</option>
              <option value="speaking">🎤 Speaking</option>
            </select>
          </div>
          {attempts.length < attemptsTotal && (
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
              Đang hiển thị {attempts.length} / {attemptsTotal} lượt gần nhất.
            </div>
          )}
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>KỸ NĂNG</th><th>BỘ ĐỀ</th><th>NGÀY LÀM</th><th>THỜI GIAN</th><th>ĐÚNG/TỔNG</th><th>BAND</th>
                </tr>
              </thead>
              <tbody>
                {loadingAttempts
                  ? <tr><td colSpan={6} className="table-empty">Đang tải...</td></tr>
                  : pagedAttempts.length === 0
                    ? <tr><td colSpan={6} className="table-empty">Không có dữ liệu</td></tr>
                    : pagedAttempts.map(h => {
                      const isWriting = h.skill === 'writing';
                      return (
                        <tr key={h._id}>
                          <td>{skillBadge(h.skill)}</td>
                          <td>
                            {h.testName || '–'}
                            {h.testMeta && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{h.testMeta}</div>}
                          </td>
                          <td style={{ fontSize: 12 }}>{formatDate(h.date)}</td>
                          <td>{formatDur(h.duration)}</td>
                          <td>{h.correctCount != null ? `${h.correctCount}/${h.totalQuestions}` : '–'}</td>
                          <td>{isWriting && h.bandScore == null
                            ? <span style={{ color: 'var(--text3)', fontSize: 12 }}>Chờ chấm</span>
                            : bandBadge(h.bandScore)}
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>
          <Pagination page={safePage} total={filteredAttempts.length} pageSize={PAGE_SIZE} onPage={setPage} />
        </>
      )}

      {tab === 'vocab' && (
        vocabStudent
          ? <VocabDetailPanel student={vocabStudent} />
          : <div style={{ padding: 20, color: 'var(--text3)', fontSize: 13 }}>Học sinh chưa có hoạt động từ vựng nào.</div>
      )}
    </>
  );
}
