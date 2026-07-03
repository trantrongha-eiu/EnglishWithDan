import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

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

// ── Storage meter ──────────────────────────────────────────────────────────

function pctColor(pct) {
  if (pct >= 90) return '#ef4444';
  if (pct >= 70) return '#fbbf24';
  return '#34d399';
}

function fmtBytes(b) {
  if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  if (b >= 1024)        return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
}

function StorageBar({ db }) {
  const pct  = db.usedPct;
  const col  = pctColor(pct);
  const used = fmtBytes(db.usedBytes);
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
        <span>Đã dùng: <strong style={{ color: 'var(--text)' }}>{used}</strong> / 512 MB</span>
        <span style={{ color: col, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ height: 8, background: 'var(--border2)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: col, borderRadius: 4, transition: 'width .4s' }} />
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 11, color: 'var(--text3)' }}>
        <span>Data: {fmtBytes(db.dataSize)}</span>
        <span>Compressed: {fmtBytes(db.storageSize)}</span>
        <span>Index: {fmtBytes(db.indexSize)}</span>
        <span>{db.collections} collections · {db.objects?.toLocaleString()} documents</span>
      </div>
    </div>
  );
}

const STATIC_WARNINGS = [
  {
    id: 'no-backup',
    level: 'warn',
    icon: '💾',
    title: 'Không có backup tự động',
    body: 'M0 Free không có backup. Nếu database bị corrupt hoặc xóa nhầm, toàn bộ dữ liệu mất vĩnh viễn. Hãy export thủ công định kỳ qua Atlas → Database → ... → Export hoặc dùng mongodump.',
  },
  {
    id: 'no-sla',
    level: 'info',
    icon: '⚠️',
    title: 'Không có SLA — có thể downtime bất cứ lúc nào',
    body: 'M0 Free không cam kết uptime. MongoDB Atlas có thể bảo trì hoặc khởi động lại cluster mà không báo trước, gây gián đoạn dịch vụ cho học sinh.',
  },
  {
    id: 'silent-write-fail',
    level: 'warn',
    icon: '🚫',
    title: 'Hết storage → ghi dữ liệu thất bại âm thầm',
    body: 'Khi vượt 512 MB, MongoDB từ chối ghi nhưng app không luôn hiển thị lỗi rõ. Kết quả bài thi, draft, hoặc thông tin đăng ký có thể bị mất mà học sinh không hay. Theo dõi storage bên dưới và nâng cấp kịp thời.',
  },
  {
    id: 'no-scale',
    level: 'info',
    icon: '📈',
    title: 'Không thể scale — M0 là single-node shared',
    body: 'M0 dùng tài nguyên dùng chung (shared CPU/RAM). Khi nhiều học sinh cùng làm bài, query có thể chậm và timeout. Không có horizontal scaling hay replica set failover.',
  },
];

const LEVEL_STYLE = {
  warn: { bg: 'rgba(251,191,36,.10)', border: 'rgba(251,191,36,.35)', dot: '#fbbf24' },
  info: { bg: 'rgba(99,179,237,.08)', border: 'rgba(99,179,237,.30)', dot: '#63b3ed' },
  error: { bg: 'rgba(239,68,68,.10)', border: 'rgba(239,68,68,.35)', dot: '#ef4444' },
};

function SystemAlerts({ isAdmin, dbStatus }) {
  const [collapsed, setCollapsed] = useState({});
  const toggle = id => setCollapsed(p => ({ ...p, [id]: !p[id] }));

  // Dynamic storage alert when above threshold
  const dynamicAlerts = [];
  if (dbStatus) {
    const pct = dbStatus.usedPct;
    if (pct >= 90)
      dynamicAlerts.push({ id: 'storage-critical', level: 'error', icon: '🔴', title: `Storage NGUY HIỂM — ${pct}% đã dùng`, body: 'Chỉ còn dưới 10% dung lượng. Ghi dữ liệu có thể thất bại ngay bây giờ. Hãy nâng cấp lên M2/M5 NGAY hoặc xóa dữ liệu cũ.' });
    else if (pct >= 70)
      dynamicAlerts.push({ id: 'storage-warn', level: 'warn', icon: '🟡', title: `Storage cao — ${pct}% đã dùng`, body: 'Đã vượt 70% dung lượng. Cân nhắc nâng cấp lên M2 ($9/tháng) để tránh gián đoạn khi storage đầy.' });
  }

  const allWarnings = [...dynamicAlerts, ...STATIC_WARNINGS];

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Storage meter — chỉ admin mới thấy */}
      {isAdmin && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{ fontSize: 20, flexShrink: 0 }}>🗄️</div>
          {dbStatus
            ? <StorageBar db={dbStatus} />
            : <span style={{ fontSize: 13, color: 'var(--text3)' }}>Đang tải thông tin storage…</span>
          }
        </div>
      )}

      {/* Warning cards */}
      {allWarnings.map(w => {
        const st = LEVEL_STYLE[w.level] || LEVEL_STYLE.info;
        const open = !collapsed[w.id];
        return (
          <div key={w.id} style={{
            background: st.bg,
            border: `1px solid ${st.border}`,
            borderRadius: 10,
            marginBottom: 8,
            overflow: 'hidden',
          }}>
            <button
              onClick={() => toggle(w.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 16px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{w.icon}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{w.title}</span>
              <span style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
              <div style={{ padding: '0 16px 12px 42px', fontSize: 13, color: 'var(--text2)', lineHeight: 1.55 }}>
                {w.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    apiFetch('/admin/stats').then(d => setStats(d.stats)).catch(() => {});
    apiFetch('/admin/recent-attempts?limit=10').then(d => setRecent(d.attempts || [])).catch(() => {});
    if (isAdmin) apiFetch('/admin/db-status').then(d => d.success && setDbStatus(d.db)).catch(() => {});

    const id = setInterval(() => {
      apiFetch('/admin/stats').then(d => setStats(d.stats)).catch(() => {});
      apiFetch('/admin/recent-attempts?limit=10').then(d => setRecent(d.attempts || [])).catch(() => {});
      if (isAdmin) apiFetch('/admin/db-status').then(d => d.success && setDbStatus(d.db)).catch(() => {});
    }, 60000);
    return () => clearInterval(id);
  }, [isAdmin]);

  const s = stats || {};

  return (
    <>
      <SystemAlerts isAdmin={isAdmin} dbStatus={dbStatus} />
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
