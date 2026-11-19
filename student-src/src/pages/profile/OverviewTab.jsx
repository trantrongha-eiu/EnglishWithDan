import {
  SKILL_LABELS, badgeGroups, bandToPct, bandWidth, recentActivities, studyPlan, trendSeries,
} from '../../utils/profile';

// Hồ sơ → Tổng quan: badges, band bars, band trend, recent activity.

const TREND_COLORS = { reading: '#667eea', listening: '#10b981', writing: '#8b5cf6', speaking: '#f59e0b' };
const dayVN = (d) => new Date(d).toLocaleDateString('vi-VN');

function BadgeItem({ b }) {
  const pct = b.earned ? 0 : Math.round((b.progress.current / b.progress.target) * 100);
  return (
    <div className={`badge-item${b.earned ? '' : ' locked'}`} title={b.description}>
      <div className="badge-emoji">{b.icon}</div>
      <div className="badge-name">{b.name}</div>
      <div className="badge-desc">{b.description}</div>
      {!b.earned && (
        <>
          <div className="badge-progress"><div className="badge-progress-fill" style={{ width: `${pct}%` }} /></div>
          <div className="badge-progress-label">{b.progress.current}/{b.progress.target}</div>
        </>
      )}
    </div>
  );
}

function Badges({ bd }) {
  if (!bd?.badges?.length) return null;
  return (
    <div className="card mb-16" id="badgesCard" style={{ display: 'block' }}>
      <div className="card-header"><span style={{ fontWeight: 700 }}><i className="fas fa-medal" /> Huy hiệu</span></div>
      <div className="card-body">
        <div className="badges-summary" id="badgesSummary">Đã đạt {bd.earnedCount}/{bd.totalCount} huy hiệu</div>
        <div className="badges-groups" id="badgesGrid">
          {badgeGroups(bd).map((g) => (
            <details className="badge-group" key={g.id} open={g.open}>
              <summary>
                <span className="badge-group-title">{g.icon} {g.name}</span>
                <span className={`badge-group-count${g.got === g.list.length ? ' is-full' : ''}`}>{g.got}/{g.list.length}</span>
              </summary>
              <div className="badges-grid">{g.list.map((b) => <BadgeItem key={b.id || b.key || b.name} b={b} />)}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudyPlanBanner({ stats, user }) {
  const plan = stats && studyPlan(stats, user);
  if (!plan) return null;
  return (
    <div id="studyPlanBanner" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'linear-gradient(135deg,color-mix(in srgb,var(--brand,#e53935) 8%,transparent),rgba(245,158,11,.06))',
      border: '1px solid color-mix(in srgb,var(--brand,#e53935) 20%,transparent)',
      borderRadius: 14, padding: '14px 18px', marginBottom: 16,
    }}>
      <div style={{ fontSize: 22 }}>🎯</div>
      <div id="studyPlanBannerText" style={{ flex: 1, fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
        {plan.daysLeft !== null && <>Còn <strong>{plan.daysLeft} ngày</strong> tới ngày thi — </>}
        <strong>{plan.label}</strong> đang là kỹ năng yếu nhất của bạn (Band {plan.band}) — hãy luyện thêm!
      </div>
    </div>
  );
}

function BandRow({ skill, stats, targetBand }) {
  const label = SKILL_LABELS[skill];
  const band = stats?.[skill].avgBand;
  const target = stats && targetBand;
  return (
    <div className="band-item">
      <span className="band-skill">{label}</span>
      <div className="band-bar-wrap">
        <div className="band-bar-fill" id={`bar${label}`} style={{ width: bandWidth(band) }} />
        {target
          ? <div className="band-bar-target" id={`target${label}`} title={`Mục tiêu: Band ${target}`} style={{ display: 'block', left: `${bandToPct(target)}%` }} />
          : null}
      </div>
      <span className="band-score" id={`score${label}`}>{band || '-'}</span>
    </div>
  );
}

// Fixed 4–9 axis (an auto-scaled one makes a 6→7 run look huge); X is real time
function BandTrend({ stats }) {
  if (!stats) return <div id="bandTrendChartWrap" style={{ width: '100%' }} />;
  const series = trendSeries(stats);
  if (!series.length) {
    return (
      <div id="bandTrendChartWrap" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text3)', fontSize: 13 }}>
          Chưa có đủ dữ liệu để vẽ biểu đồ — làm vài bài test để bắt đầu theo dõi xu hướng.
        </div>
      </div>
    );
  }
  const times = series.flatMap((s) => s.points.map((p) => p.t));
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const W = 680; const H = 220; const L = 34; const B = 26; const T = 14; const R = 12;
  const plotW = W - L - R;
  const plotH = H - T - B;
  const x = (t) => (maxT === minT ? L + plotW / 2 : L + ((t - minT) / (maxT - minT)) * plotW);
  const y = (band) => T + plotH - ((Math.min(9, Math.max(4, band)) - 4) / 5) * plotH;
  const short = (t) => { const d = new Date(t); return `${d.getDate()}/${d.getMonth() + 1}`; };
  return (
    <div id="bandTrendChartWrap" style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="Biểu đồ xu hướng band score theo thời gian">
        {[4, 5, 6, 7, 8, 9].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth="1" />
            <text x={L - 6} y={y(v)} fontSize="10" fill="var(--text3)" textAnchor="end" dominantBaseline="middle">{v}</text>
          </g>
        ))}
        {series.map(({ key, points }) => (
          <g key={key}>
            <polyline points={points.map((p) => `${x(p.t)},${y(p.y)}`).join(' ')} fill="none" stroke={TREND_COLORS[key]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {points.map((p, i) => (
              <circle key={i} cx={x(p.t)} cy={y(p.y)} r="3" fill={TREND_COLORS[key]}>
                <title>{SKILL_LABELS[key]} — Band {p.y} — {dayVN(p.t)}</title>
              </circle>
            ))}
          </g>
        ))}
        <text x={L} y={H - 6} fontSize="10" fill="var(--text3)" textAnchor="start">{short(minT)}</text>
        <text x={W - R} y={H - 6} fontSize="10" fill="var(--text3)" textAnchor="end">{short(maxT)}</text>
      </svg>
    </div>
  );
}

function TrendLegend({ stats }) {
  return (
    <div id="bandTrendLegend" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10, fontSize: 12, color: 'var(--text2)' }}>
      {stats && trendSeries(stats).map(({ key }) => (
        <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: TREND_COLORS[key], display: 'inline-block' }} />
          {SKILL_LABELS[key]}
        </span>
      ))}
    </div>
  );
}

function RecentActivity({ stats }) {
  const list = stats ? recentActivities(stats) : [];
  return (
    <div className="card-body" id="recentActivity">
      {!list.length && <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '20px 0' }}>Chưa có hoạt động nào</p>}
      {list.map((a, i) => (
        <div className="activity-item" key={i}>
          <div className="activity-icon" style={{ background: a.color }}>{a.icon}</div>
          <div className="activity-text">{a.text}{a.band != null && <strong>{a.band}</strong>}</div>
          <div className="activity-date">{dayVN(a.date)}</div>
        </div>
      ))}
    </div>
  );
}

export default function OverviewTab({ active, user, stats, badges }) {
  return (
    <div className={`tab-content${active ? ' active' : ''}`} id="tab-overview">
      <Badges bd={badges} />
      <StudyPlanBanner stats={stats} user={user} />

      <div className="card mb-16 card-band-score">
        <div className="card-header"><span style={{ fontWeight: 700 }}><i className="fas fa-chart-line" /> Band Score của tôi</span></div>
        <div className="card-body">
          <div className="band-history" id="bandHistory">
            {Object.keys(SKILL_LABELS).map((k) => <BandRow key={k} skill={k} stats={stats} targetBand={user?.targetBand} />)}
          </div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header"><span style={{ fontWeight: 700 }}><i className="fas fa-chart-area" /> Xu hướng Band Score</span></div>
        <div className="card-body">
          <TrendLegend stats={stats} />
          <BandTrend stats={stats} />
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span style={{ fontWeight: 700 }}><i className="fas fa-fire" /> Hoạt động gần đây</span></div>
        <RecentActivity stats={stats} />
      </div>
    </div>
  );
}
