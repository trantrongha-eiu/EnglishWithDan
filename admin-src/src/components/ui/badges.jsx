import { daysUntil } from '../../utils/format';

// Shared status badges — previously duplicated in Users.jsx, StudentDetail.jsx,
// StudentHistory.jsx, Dashboard.jsx, ReadingStats.jsx and ListeningStats.jsx.

export function bandBadge(score) {
  if (score == null || score === '' || !Number.isFinite(Number(score))) return '–';
  const n = Number(score);
  const color = n >= 7 ? 'var(--green)' : n >= 5 ? 'var(--yellow)' : 'var(--accent2)';
  return <span style={{ color, fontWeight: 700 }}>{n.toFixed(1)}</span>;
}

const ROLE = {
  admin:   { cls: 'badge-red',   label: 'Admin' },
  teacher: { cls: 'badge-blue',  label: 'Teacher' },
  student: { cls: 'badge-green', label: 'Student' },
};

export function roleBadge(role) {
  const r = ROLE[role] || { cls: 'badge-gray', label: role || '–' };
  return <span className={`badge ${r.cls}`}>{r.label}</span>;
}

export function planBadge(plan, expiresAt) {
  if (plan !== 'premium') return <span className="badge badge-gray">Free</span>;
  const days = daysUntil(expiresAt);
  const expired = days !== null && days <= 0;
  const soon = !expired && days !== null && days <= 7;
  // Days left only when it's getting close — "Premium · 357 ngày" on every
  // row just made the badge wrap; the full expiry date is in the tooltip.
  const suffix = days !== null && !expired && days <= 30 ? ` · ${days} ngày` : '';
  const title = expiresAt ? `Hết hạn: ${new Date(expiresAt).toLocaleDateString('vi-VN')}` : 'Không thời hạn';
  if (expired) return <span className="badge badge-gray" title={title}>⏰ Premium hết hạn</span>;
  return <span className={`badge ${soon ? 'badge-yellow' : 'badge-blue'}`} title={title}>⭐ Premium{suffix}</span>;
}

export function statusBadge(isBanned) {
  return isBanned
    ? <span className="badge badge-red"><span className="dot" />Bị cấm</span>
    : <span className="badge badge-green"><span className="dot" />Hoạt động</span>;
}

// Test Simulation proctoring flags on an attempt row (recent-attempts feed).
export function simBadge(h) {
  if (h.mode !== 'simulation') return null;
  return (
    <div style={{ marginTop: 3, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      <span className="badge badge-blue" style={{ fontSize: 10 }} title="Bài làm ở chế độ Test Simulation (có giám sát)">🔒 Simulation</span>
      {h.disqualified
        ? <span className="badge badge-red" style={{ fontSize: 10 }} title="Lượt này đã bị huỷ do vi phạm giám sát quá số lần cho phép">🚫 Huỷ · {h.violationCount} gậy</span>
        : h.violated
          ? <span className="badge badge-red" style={{ fontSize: 10 }} title="Bị đánh dấu vi phạm giám sát (rời màn hình thi)">⚠️ {h.violationCount} gậy</span>
          : null}
    </div>
  );
}
