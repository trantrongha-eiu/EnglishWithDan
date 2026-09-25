import { Link } from 'react-router-dom';
import { Skeleton } from './States';

// KPI tile. `tone` picks the accent color; `to` makes the whole card a link;
// `loading` renders a skeleton in place of the number (the old cards showed
// "–" both while loading and after a failed request).
export default function StatCard({ label, value, sub, icon, tone = 'blue', loading, to, trend }) {
  const body = (
    <>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        {icon && <span className={`kpi-icon kpi-icon--${tone}`} aria-hidden="true">{icon}</span>}
      </div>
      <div className="kpi-value">
        {loading ? <Skeleton width={72} height={28} /> : (value ?? '–')}
      </div>
      {(sub || trend) && (
        <div className="kpi-sub">
          {trend && !loading && <span className={`kpi-trend kpi-trend--${trend.dir}`}>{trend.dir === 'up' ? '▲' : trend.dir === 'down' ? '▼' : '■'} {trend.text}</span>}
          {sub && <span>{sub}</span>}
        </div>
      )}
    </>
  );
  return to
    ? <Link to={to} className={`kpi-card kpi-card--${tone} kpi-card--link`}>{body}</Link>
    : <div className={`kpi-card kpi-card--${tone}`}>{body}</div>;
}
