import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useAdminData } from '../contexts/AdminDataContext';
import { useApi } from '../hooks/useApi';
import VisitsChart from '../components/VisitsChart';
import { skillBadge } from '../components/SkillBadge';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import { ErrorState, EmptyState, TableBody, Skeleton } from '../components/ui/States';
import { bandBadge, simBadge } from '../components/ui/badges';
import { formatNumber } from '../utils/format';

// Dashboard (redesigned 2026-09-25). Every number here comes from a real
// endpoint — nothing is estimated or mocked:
//   /admin/stats/overview   KPIs + 14-day activity (server-cached 60s)
//   sidebar-badges          "Cần xử lý" queue (shared poll, no extra call)
//   /admin/recent-attempts  latest submissions (?noTotal=1: skips 16 counts)
//   /admin/stats            all-time attempt totals (loaded once, not polled)
//   /admin/db-status        storage meter (admin only)

function pctColor(pct) {
  if (pct >= 90) return 'var(--danger)';
  if (pct >= 70) return 'var(--yellow)';
  return 'var(--green)';
}

function fmtBytes(b) {
  if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
}

function StoragePanel() {
  const { data, error, loading, reload } = useApi('/admin/db-status');
  const db = data?.db;
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">🗄️ Dung lượng database</div>
          <div className="panel-sub">MongoDB Atlas (giới hạn 512 MB)</div>
        </div>
      </div>
      {loading && <Skeleton height={8} />}
      {error && <ErrorState error={error} onRetry={reload} compact />}
      {db && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
            <span>Đã dùng <strong style={{ color: 'var(--text)' }}>{fmtBytes(db.usedBytes)}</strong></span>
            <span style={{ color: pctColor(db.usedPct), fontWeight: 700 }}>{db.usedPct}%</span>
          </div>
          <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={db.usedPct} aria-label="Dung lượng đã dùng">
            <span style={{ width: `${Math.min(db.usedPct, 100)}%`, background: pctColor(db.usedPct) }} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>
            <span>Data {fmtBytes(db.dataSize)}</span>
            <span>Index {fmtBytes(db.indexSize)}</span>
            <span>{db.collections} collections · {formatNumber(db.objects)} documents</span>
          </div>
        </>
      )}
    </div>
  );
}

function ActionQueue() {
  const { badges } = useAdminData();
  const { isAdmin } = useAuth();
  if (!badges) {
    return <div className="queue-list">{[0, 1, 2].map(i => <Skeleton key={i} height={42} />)}</div>;
  }
  const items = [
    { to: '/writing-grades', icon: '✍️', label: 'Bài Writing chờ chấm', hint: 'Chấm AI / xác nhận điểm', n: badges.pendingGrades, tone: 'hot' },
    { to: '/entrance-test', icon: '🚪', label: 'Test đầu vào chờ duyệt', hint: 'Học sinh chưa thấy điểm tới khi duyệt', n: badges.pendingEntranceReviews, tone: 'hot' },
    { to: '/messages', icon: '✉️', label: 'Tin nhắn chưa đọc', hint: 'Hộp thư đến của bạn', n: badges.pendingMessages },
    { to: '/monitoring?tab=mock', icon: '⚠️', label: 'Lượt thi bị đánh dấu vi phạm', hint: 'Thi thử Full / Test Simulation', n: badges.violations, tone: 'warn' },
    ...(isAdmin ? [
      { to: '/upgrade-requests', icon: '⭐', label: 'Yêu cầu nâng cấp Premium', hint: 'Chờ duyệt', n: badges.pendingUpgrades, tone: 'hot' },
      { to: '/tuition', icon: '💰', label: 'Học sinh còn nợ học phí', hint: 'Có khoản chưa thanh toán', n: badges.pendingTuition, tone: 'warn' },
    ] : []),
  ].filter(i => i.n > 0);

  if (!items.length) return <div className="queue-done">✅ Không có việc gì đang chờ xử lý</div>;
  return (
    <div className="queue-list">
      {items.map(i => (
        <Link key={i.to} to={i.to} className={`queue-item${i.tone ? ` queue-item--${i.tone}` : ''}`}>
          <span className="queue-icon" aria-hidden="true">{i.icon}</span>
          <span className="queue-text">{i.label}<small>{i.hint}</small></span>
          <span className="queue-count">{i.n > 99 ? '99+' : i.n}</span>
        </Link>
      ))}
    </div>
  );
}

function ActivityChart({ daily }) {
  const max = Math.max(1, ...daily.map(d => d.attempts));
  const totalAttempts = daily.reduce((n, d) => n + d.attempts, 0);
  return (
    <>
      <div className="panel-head">
        <div>
          <div className="panel-title">Hoạt động luyện tập — 14 ngày</div>
          <div className="panel-sub">{formatNumber(totalAttempts)} lượt làm bài (mọi kỹ năng)</div>
        </div>
        <div className="legend">
          <span><span className="legend-swatch" style={{ background: 'var(--blue)' }} />Lượt làm bài</span>
          <span><span className="legend-swatch" style={{ background: 'var(--green)' }} />Học sinh hoạt động</span>
        </div>
      </div>
      <div className="act-chart" role="img" aria-label={`Biểu đồ hoạt động 14 ngày: tổng ${totalAttempts} lượt làm bài`}>
        {daily.map(d => {
          const [, m, day] = d.date.split('-');
          return (
            <div key={d.date} className="act-col" title={`${day}/${m}: ${d.attempts} lượt · ${d.activeStudents} học sinh · ${d.signups} đăng ký mới`}>
              <div className="act-bars">
                <span className="act-bar act-bar--attempts" style={{ height: `${(d.attempts / max) * 100}%` }} />
                <span className="act-bar act-bar--students" style={{ height: `${(d.activeStudents / max) * 100}%` }} />
              </div>
              <span className="act-label">{day}/{m}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function RecentAttempts() {
  const { data, error, loading, reload } = useApi('/admin/recent-attempts?limit=8&noTotal=1', { pollMs: 60_000 });
  const rows = data?.attempts || [];
  return (
    <div className="panel panel-flush">
      <div className="panel-head">
        <div className="panel-title">Bài nộp gần nhất</div>
        <Link to="/monitoring" className="btn btn-ghost btn-sm">Xem tất cả →</Link>
      </div>
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table className="table">
          <thead>
            <tr><th>Học sinh</th><th>Kỹ năng</th><th>Bài</th><th>Thời điểm</th><th>Kết quả</th></tr>
          </thead>
          <TableBody
            loading={loading}
            error={error}
            onRetry={reload}
            colSpan={5}
            rows={5}
            empty={rows.length === 0 && <EmptyState icon="📝" title="Chưa có bài nộp nào" />}
          >
            {rows.map(h => {
              const graded = h.skill === 'writing' || h.skill === 'speaking';
              const result = h.bandScore != null
                ? bandBadge(h.bandScore)
                : graded
                  ? <span className="muted" style={{ fontSize: 12 }}>{h.status === 'error' ? 'Lỗi chấm bài' : 'Chờ chấm'}</span>
                  : (h.correctCount != null && h.totalQuestions != null ? `${h.correctCount}/${h.totalQuestions}` : '–');
              return (
                <tr key={`${h.skill}-${h._id}`}>
                  <td>
                    {h.userId?._id
                      ? <Link to={`/students/${h.userId._id}`} className="user-cell-name">{h.userId.displayName || '–'}</Link>
                      : <strong>{h.userId?.displayName || '–'}</strong>}
                  </td>
                  <td>{skillBadge(h.skill)}</td>
                  <td style={{ maxWidth: 260 }}>
                    {h.skill === 'writing'
                      ? <Link to={`/writing-grades?viewAttempt=${h._id}`}>{h.testName || '–'}</Link>
                      : h.skill === 'speaking'
                        ? <Link to={`/speaking?viewAttempt=${h._id}`}>{h.testName || '–'}</Link>
                        : (h.testName || '–')}
                    {simBadge(h)}
                  </td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(h.date)}</td>
                  <td>{result}</td>
                </tr>
              );
            })}
          </TableBody>
        </table>
      </div>
    </div>
  );
}

function ContentPanel({ content, stats }) {
  const rows = [
    { to: '/reading-tests', label: 'Bộ đề Reading', n: content?.readingTests },
    { to: '/listening-tests', label: 'Đề Listening', n: content?.listeningTests },
    { to: '/listening-sections', label: 'Bài lẻ Listening', n: content?.listeningSections },
    { to: '/writing-tests', label: 'Đề Writing', n: content?.writingExams },
    { to: '/speaking', label: 'Câu hỏi Speaking', n: content?.speakingQuestions },
    { to: '/passages', label: 'Bài đọc (Passages)', n: stats?.passageCount },
    { to: '/vocabulary', label: 'Vocab Units', n: stats?.vocabUnitCount },
  ];
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Kho nội dung đang hiện</div>
          <div className="panel-sub">Chỉ tính nội dung đang bật cho học sinh</div>
        </div>
      </div>
      {rows.map(r => (
        <Link key={r.to} to={r.to} className="kv" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>{r.label}</span>
          <span>{r.n == null ? <Skeleton width={30} /> : formatNumber(r.n)}</span>
        </Link>
      ))}
    </div>
  );
}

function AllTimePanel({ stats, loading, error, reload }) {
  const s = stats || {};
  const rows = [
    { label: 'Reading', total: s.totalReadingAttempts, detail: `Đề ${s.readingFullCount ?? 0} · Lẻ ${s.readingPracticeCount ?? 0}`, band: s.avgReadingBand },
    { label: 'Listening', total: s.totalListeningAttempts, detail: `Đề ${s.listeningFullCount ?? 0} · Lẻ ${s.listeningPracticeCount ?? 0}`, band: s.avgListeningBand },
    { label: 'Writing', total: s.totalWritingAttempts, detail: `Đề ${s.writingFullCount ?? 0} · Luyện ${s.writingPracticeCount ?? 0}` },
  ];
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Tổng lượt làm bài</div>
          <div className="panel-sub">Lịch sử được giữ 3 tháng</div>
        </div>
      </div>
      {error ? <ErrorState error={error} onRetry={reload} compact /> : rows.map(r => (
        <div key={r.label} className="kv">
          <span>{r.label}<br /><small className="muted">{loading ? '' : r.detail}</small></span>
          <span>
            {loading ? <Skeleton width={40} /> : formatNumber(r.total)}
            {r.band && Number(r.band) > 0 && <><br /><small className="muted">Band TB {r.band}</small></>}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const overview = useApi('/admin/stats/overview', { pollMs: 60_000 });
  const stats = useApi('/admin/stats');
  const [visitsRange, setVisitsRange] = useState(30);
  const visits = useApi(`/admin/stats/visits?days=${visitsRange}`);

  const o = overview.data?.overview;
  const loadingKpi = overview.loading;
  const today = o?.daily?.[o.daily.length - 1];
  const attempts14 = o?.daily?.reduce((n, d) => n + d.attempts, 0);
  const weekTrend = o && (o.newThisWeek > o.newLastWeek
    ? { dir: 'up', text: `${o.newThisWeek - o.newLastWeek} so với tuần trước` }
    : o.newThisWeek < o.newLastWeek
      ? { dir: 'down', text: `${o.newLastWeek - o.newThisWeek} so với tuần trước` }
      : { dir: 'flat', text: 'bằng tuần trước' });
  const hour = new Date().getHours();
  const greet = hour < 11 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <>
      <PageHeader
        title={`${greet}, ${user?.username || 'bạn'} 👋`}
        subtitle="Tình hình học tập của học sinh và các việc cần xử lý hôm nay."
        actions={<Link to="/users?role=student" className="btn btn-ghost btn-sm">👥 Danh sách học sinh</Link>}
      />

      {overview.error && !o && <div style={{ marginBottom: 16 }}><ErrorState error={overview.error} onRetry={overview.reload} /></div>}

      <div className="kpi-grid">
        <StatCard tone="blue" icon="🎓" label="Học sinh" value={formatNumber(o?.totalStudents)} loading={loadingKpi}
          sub="Tổng tài khoản học sinh" to="/users?role=student" />
        <StatCard tone="green" icon="🟢" label="Hoạt động 24 giờ" value={formatNumber(o?.active24h)} loading={loadingKpi}
          sub={o ? `${formatNumber(o.active7d)} học sinh trong 7 ngày` : null} />
        <StatCard tone="purple" icon="✨" label="Đăng ký mới (7 ngày)" value={formatNumber(o?.newThisWeek)} loading={loadingKpi}
          trend={weekTrend} />
        <StatCard tone="yellow" icon="⭐" label="Premium đang hiệu lực" value={formatNumber(o?.premiumActive)} loading={loadingKpi}
          sub={o && o.totalStudents ? `${Math.round((o.premiumActive / o.totalStudents) * 100)}% học sinh` : null}
          to={isAdmin ? '/users?role=student&plan=premium' : undefined} />
        <StatCard tone="red" icon="📝" label="Lượt làm bài hôm nay" value={formatNumber(today?.attempts)} loading={loadingKpi}
          sub={attempts14 != null ? `${formatNumber(attempts14)} lượt trong 14 ngày` : null} to="/monitoring" />
      </div>

      <div className="dash-grid">
        <div className="panel">
          {loadingKpi
            ? <Skeleton height={190} />
            : o?.daily ? <ActivityChart daily={o.daily} /> : <EmptyState icon="📉" title="Chưa có dữ liệu hoạt động" />}
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Cần xử lý</div>
              <div className="panel-sub">Cập nhật mỗi phút</div>
            </div>
          </div>
          <ActionQueue />
        </div>
      </div>

      <div className="dash-grid">
        <RecentAttempts />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <ContentPanel content={o?.content} stats={stats.data?.stats} />
          <AllTimePanel stats={stats.data?.stats} loading={stats.loading} error={stats.error} reload={stats.reload} />
          {isAdmin && <StoragePanel />}
        </div>
      </div>

      {visits.error
        ? <ErrorState error={visits.error} onRetry={visits.reload} />
        : <VisitsChart visits={visits.data?.visits || []} range={visitsRange} onRangeChange={setVisitsRange} />}
    </>
  );
}
