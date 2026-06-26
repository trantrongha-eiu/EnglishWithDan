import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';

function bandBadge(score) {
  if (score == null) return '–';
  const color = score >= 7 ? 'var(--green)' : score >= 5 ? 'var(--yellow)' : 'var(--accent2)';
  return <span style={{ color, fontWeight: 700 }}>{score.toFixed(1)}</span>;
}

function skillBadge(skill) {
  const map = {
    reading: { label: 'Reading', bg: '#3d8bff22', color: '#3d8bff' },
    listening: { label: 'Listening', bg: '#34d39922', color: '#34d399' },
    writing: { label: 'Writing', bg: '#fbbf2422', color: '#fbbf24' },
    speaking: { label: 'Speaking', bg: '#a78bfa22', color: '#a78bfa' },
  };
  const s = map[skill] || { label: skill, bg: '#55587822', color: '#8b92a8' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function formatDur(sec) {
  if (sec == null) return '–';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m${String(s).padStart(2, '0')}s`;
}

function StatCard({ color, icon, label, value, sub }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '–'}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      <div className="stat-icon">{icon}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    apiFetch('/admin/stats').then(d => setStats(d.stats)).catch(() => {});
    apiFetch('/admin/recent-attempts?limit=10').then(d => setRecent(d.attempts || [])).catch(() => {});

    const id = setInterval(() => {
      apiFetch('/admin/stats').then(d => setStats(d.stats)).catch(() => {});
      apiFetch('/admin/recent-attempts?limit=10').then(d => setRecent(d.attempts || [])).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const s = stats || {};

  return (
    <>
      <div className="stats-row">
        <StatCard color="blue" icon="👤" label="Học sinh" value={s.totalStudents} sub="Tài khoản đã đăng ký" />
        <StatCard color="green" icon="📅" label="Mới tuần này" value={s.newUsersThisWeek} sub="Đăng ký trong 7 ngày" />
        <StatCard color="yellow" icon="🎓" label="Giáo viên / Admin" value={s.totalTeachers} sub="Tài khoản quản lý" />
        <StatCard color="red" icon="🚫" label="Bị cấm" value={s.bannedUsers} sub="Tài khoản bị khoá" />
      </div>
      <div className="stats-row">
        <StatCard color="blue" icon="📖" label="Lượt Reading" value={s.totalReadingAttempts}
          sub={`Full đề: ${s.readingFullCount ?? 0} | Luyện tập: ${s.readingPracticeCount ?? 0}${s.avgReadingBand ? ` | Band TB: ${s.avgReadingBand}` : ''}`} />
        <StatCard color="green" icon="🎧" label="Lượt Listening" value={s.totalListeningAttempts}
          sub={`Full đề: ${s.listeningFullCount ?? 0} | Luyện tập: ${s.listeningPracticeCount ?? 0}${s.avgListeningBand ? ` | Band TB: ${s.avgListeningBand}` : ''}`} />
        <StatCard color="yellow" icon="✏️" label="Lượt Writing" value={s.totalWritingAttempts}
          sub={`Full đề: ${s.writingFullCount ?? 0} | Luyện tập: ${s.writingPracticeCount ?? 0}`} />
        <StatCard color="red" icon="📄" label="Bài đọc / Từ vựng" value={s.passageCount}
          sub={s.vocabUnitCount != null ? `Vocab units: ${s.vocabUnitCount}` : undefined} />
      </div>

      <div className="section-header">
        <h2 className="section-title">Bài nộp gần nhất (tất cả kỹ năng)</h2>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>HỌC SINH</th><th>KỸ NĂNG</th><th>BỘ ĐỀ</th>
              <th>NGÀY LÀM</th><th>BAND SCORE</th><th>ĐÚNG / TỔNG</th><th>THỜI GIAN</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0
              ? <tr><td colSpan={7} className="table-empty">Chưa có dữ liệu</td></tr>
              : recent.map(h => {
                const isWriting = h.skill === 'writing';
                const scoreEl = isWriting
                  ? (h.bandScore != null ? bandBadge(h.bandScore) : <span style={{ color: 'var(--text3)' }}>Chờ chấm</span>)
                  : bandBadge(h.bandScore);
                const correct = (h.correctCount != null && h.totalQuestions != null)
                  ? `${h.correctCount}/${h.totalQuestions}` : '–';
                return (
                  <tr key={h._id}>
                    <td><strong>{h.userId?.displayName || '–'}</strong></td>
                    <td>{skillBadge(h.skill)}</td>
                    <td>{h.testName || '–'}</td>
                    <td>{formatDate(h.date)}</td>
                    <td>{scoreEl}</td>
                    <td>{correct}</td>
                    <td>{formatDur(h.duration)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}
