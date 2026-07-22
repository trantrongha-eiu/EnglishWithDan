import { useMemo, useState } from 'react';

const RANGE_OPTIONS = [
  { label: '7 ngày', days: 7 },
  { label: '30 ngày', days: 30 },
  { label: '90 ngày', days: 90 },
];

function formatShortDate(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

function formatFullDate(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
}

// Single-series daily traffic bar chart — no legend needed (one color, the
// title already says what's plotted). Chart geometry uses a fixed viewBox
// and scales via CSS, so it stays sharp/responsive without a resize observer.
export default function VisitsChart({ visits, range, onRangeChange }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const { max, total } = useMemo(() => {
    const counts = visits.map(v => v.count);
    return {
      max: Math.max(1, ...counts),
      total: counts.reduce((a, b) => a + b, 0),
    };
  }, [visits]);

  const W = 720, H = 220, PAD_L = 34, PAD_B = 22, PAD_T = 14, PAD_R = 8;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const n = Math.max(visits.length, 1);
  const slot = plotW / n;
  const barW = Math.max(2, Math.min(24, slot * 0.6));
  const yTicks = [0, Math.round(max / 2), max];
  const labelEvery = Math.max(1, Math.ceil(n / 6));
  const hovered = hoverIdx != null ? visits[hoverIdx] : null;

  return (
    <div className="visits-chart-card">
      <div className="visits-chart-header">
        <div>
          <div className="section-title">Lượt truy cập</div>
          <div className="visits-chart-total">
            {total.toLocaleString('vi-VN')}
            <span> lượt trong {visits.length} ngày</span>
          </div>
        </div>
        <div className="visits-chart-actions">
          <div className="visits-range-row">
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.days}
                type="button"
                className={`btn btn-sm btn-ghost visits-range-btn${range === opt.days ? ' active' : ''}`}
                onClick={() => onRangeChange(opt.days)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowTable(s => !s)}>
            {showTable ? 'Xem biểu đồ' : 'Xem bảng'}
          </button>
        </div>
      </div>

      {visits.length === 0 ? (
        <div className="visits-chart-empty">Chưa có dữ liệu truy cập</div>
      ) : showTable ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>NGÀY</th><th>LƯỢT TRUY CẬP</th></tr></thead>
            <tbody>
              {visits.slice().reverse().map(v => (
                <tr key={v.date}><td>{formatFullDate(v.date)}</td><td>{v.count.toLocaleString('vi-VN')}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="visits-chart-svg-wrap">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="visits-chart-svg"
            role="img"
            aria-label={`Biểu đồ lượt truy cập ${visits.length} ngày gần nhất, tổng ${total} lượt`}
          >
            {yTicks.map((t, i) => {
              const y = PAD_T + plotH - (max > 0 ? (t / max) * plotH : 0);
              return (
                <g key={i}>
                  <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} className="visits-gridline" />
                  <text x={PAD_L - 6} y={y} className="visits-axis-label" textAnchor="end" dominantBaseline="middle">{t}</text>
                </g>
              );
            })}
            {visits.map((v, i) => {
              const x = PAD_L + i * slot + (slot - barW) / 2;
              const barH = v.count > 0 ? Math.max((v.count / max) * plotH, 2) : 0;
              const y = PAD_T + plotH - barH;
              const isHover = hoverIdx === i;
              return (
                <g key={v.date}>
                  <rect x={x} y={y} width={barW} height={barH} rx={4} ry={4}
                    className={`visits-bar${isHover ? ' hover' : ''}`} />
                  <rect
                    x={PAD_L + i * slot} y={PAD_T} width={slot} height={plotH}
                    fill="transparent" tabIndex={0}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onFocus={() => setHoverIdx(i)}
                    onBlur={() => setHoverIdx(null)}
                  />
                  {i % labelEvery === 0 && (
                    <text x={PAD_L + i * slot + slot / 2} y={H - 4} className="visits-axis-label" textAnchor="middle">
                      {formatShortDate(v.date)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {hovered && (
            <div className="visits-tooltip" style={{ left: `${((PAD_L + hoverIdx * slot + slot / 2) / W) * 100}%` }}>
              <div className="visits-tooltip-value">{hovered.count.toLocaleString('vi-VN')}</div>
              <div className="visits-tooltip-date">{formatFullDate(hovered.date)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
