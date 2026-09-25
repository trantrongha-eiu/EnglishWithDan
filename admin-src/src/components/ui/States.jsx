// Loading / empty / error building blocks. Replace the ad-hoc
// "Đang tải..." table rows and swallowed `.catch(() => {})` of older pages:
// a failed request now says what failed and offers a retry.

export function Skeleton({ width = '100%', height = 14, radius = 6, style }) {
  return <span className="skeleton" style={{ width, height, borderRadius: radius, ...style }} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} aria-hidden="true">
          {Array.from({ length: cols }, (_, c) => (
            <td key={c}><Skeleton width={c === 0 ? '70%' : `${45 + ((r + c) % 4) * 12}%`} /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function EmptyState({ icon = '📭', title = 'Chưa có dữ liệu', children, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {children && <div className="empty-state-text">{children}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, compact }) {
  const msg = error?.coldStart || error?.message === 'server-cold-start'
    ? 'Server đang khởi động (thường mất ~30 giây).'
    : error?.status === 403
      ? 'Bạn không có quyền xem mục này.'
      : (error?.message || 'Không tải được dữ liệu.');
  return (
    <div className={`error-state${compact ? ' error-state--compact' : ''}`} role="alert">
      <span aria-hidden="true">⚠️</span>
      <span className="error-state-text">{msg}</span>
      {onRetry && <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>Thử lại</button>}
    </div>
  );
}

// Table body helper: skeleton while loading, error row, empty row, else rows.
export function TableBody({ loading, error, onRetry, empty, colSpan, rows = 6, children }) {
  if (loading) return <tbody><TableSkeleton rows={rows} cols={colSpan} /></tbody>;
  if (error) return <tbody><tr><td colSpan={colSpan}><ErrorState error={error} onRetry={onRetry} compact /></td></tr></tbody>;
  if (empty) return <tbody><tr><td colSpan={colSpan}>{empty}</td></tr></tbody>;
  return <tbody>{children}</tbody>;
}
