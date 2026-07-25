import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

// Extracted from VocabActivity.jsx's VocabActivityModal (2026-07-25, admin
// panel audit finding #4) — the mini-stats / books table / activity chart
// body, with no opinion about what wraps it. VocabActivity.jsx uses this
// inside its existing modal-overlay chrome; StudentDetail.jsx (the new
// unified student page) renders it directly as a tab, no modal.
export function VaChart({ data, view }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
        Không có dữ liệu trong kỳ này
      </div>
    );
  }

  const maxVal = Math.max(1, ...data.map(d => Math.max(d.viewCount || 0, d.wordsAdded || 0, d.wordsStudied || 0)));
  const niceMax = (() => {
    if (maxVal <= 5)   return 5;
    if (maxVal <= 10)  return 10;
    if (maxVal <= 20)  return 20;
    if (maxVal <= 50)  return 50;
    if (maxVal <= 100) return 100;
    const mag = Math.pow(10, Math.floor(Math.log10(maxVal)));
    return Math.ceil(maxVal / mag) * mag;
  })();

  const n = data.length;
  const padL = 44, padR = 12, padT = 14, padB = 32;
  const H = 220, chartH = H - padT - padB;
  const svgW = Math.max(520, n * (view === 'day' ? 22 : 56) + padL + padR);
  const xSlot = (svgW - padL - padR) / n;
  const barW = Math.max(5, Math.min(14, xSlot / 4.5));
  const gap = 2;
  const groupW = (barW + gap) * 3 - gap;
  const toH = v => (v / niceMax) * chartH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ val: Math.round(niceMax * f), y: padT + chartH * (1 - f) }));
  const today = new Date().getDate();
  const COLORS = ['#3d8bff', '#34d399', '#a78bfa'];
  const hasAny = data.some(d => (d.viewCount || 0) > 0 || (d.wordsAdded || 0) > 0 || (d.wordsStudied || 0) > 0);

  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${svgW} ${H}`}
        style={{ width: '100%', minWidth: Math.min(svgW, 480), display: 'block', overflow: 'visible' }}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={t.y} x2={svgW - padR} y2={t.y} stroke="#2a3045" strokeWidth={1} />
            <text x={padL - 6} y={t.y + 4} textAnchor="end" fill="#555e78" fontSize={10} fontFamily="monospace">{t.val}</text>
          </g>
        ))}
        <line x1={padL} y1={padT + chartH} x2={svgW - padR} y2={padT + chartH} stroke="#353d55" strokeWidth={1.5} />
        {data.map((d, i) => {
          const cx = padL + i * xSlot + xSlot / 2;
          const bx0 = cx - groupW / 2;
          const bars = [d.viewCount || 0, d.wordsAdded || 0, d.wordsStudied || 0];
          const showLabel = view !== 'day' || (i % 3 === 0) || i === n - 1;
          const isToday = view === 'day' && parseInt(d.label) === today;
          return (
            <g key={i}>
              {isToday && (
                <rect x={+(cx - xSlot / 2).toFixed(1)} y={padT} width={+xSlot.toFixed(1)} height={chartH}
                  fill="#3d8bff" opacity={0.05} rx={4} />
              )}
              {bars.map((v, bi) => {
                if (!v) return null;
                const bh = Math.max(2, toH(v));
                const bx = bx0 + bi * (barW + gap);
                const by = padT + chartH - bh;
                return (
                  <g key={bi}>
                    <rect x={+bx.toFixed(1)} y={+by.toFixed(1)} width={barW} height={+bh.toFixed(1)}
                      fill={COLORS[bi]} rx={3} opacity={0.88}>
                      <title>{v}</title>
                    </rect>
                    {bh > 16 && (
                      <text x={+(bx + barW / 2).toFixed(1)} y={+(by - 3).toFixed(1)}
                        textAnchor="middle" fill={COLORS[bi]} fontSize={9}>{v}</text>
                    )}
                  </g>
                );
              })}
              {showLabel && (
                <text x={+cx.toFixed(1)} y={H - 4} textAnchor="middle" fill="#8b92a8" fontSize={10}>{d.label}</text>
              )}
            </g>
          );
        })}
        {!hasAny && (
          <text x={svgW / 2} y={padT + chartH / 2} textAnchor="middle" fill="#555e78" fontSize={13}>
            Không có hoạt động trong kỳ này
          </text>
        )}
      </svg>
    </div>
  );
}

export default function VocabDetailPanel({ student }) {
  const toast = useToast();
  const [books, setBooks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [view, setView] = useState('day');
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [loadingBooks, setLoadingBooks] = useState(true);
  // Starts true for the initial mount fetch; every SUBSEQUENT fetch (view/
  // month/year changed) sets this back to true from the button/select
  // onChange handlers below, not from inside loadChart()/its effect — a
  // handler is a normal event callback, not an effect, so setState there
  // doesn't trip react-hooks/set-state-in-effect the way doing it
  // synchronously inside the effect-triggered loadChart() did.
  const [loadingChart, setLoadingChart] = useState(true);

  const yearRange = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    apiFetch(`/admin/vocab-books/${student._id}`)
      .then(d => setBooks(d.books || []))
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoadingBooks(false));
  }, [student._id]);

  // Doesn't set setLoadingChart(true) itself — see the state's own comment
  // above. (Earlier version set it via an "adjust state during render"
  // comparison trick, which turned out to loop infinitely under React
  // StrictMode's double-render — caught while testing this component in
  // dev mode, a pre-existing bug in the original VocabActivity.jsx modal
  // this was extracted from, never caught because it had only ever been
  // tested against production builds, which don't double-render.)
  const loadChart = useCallback(() => {
    const params = new URLSearchParams({ view, year: selYear });
    if (view === 'day') params.set('month', selMonth);
    return apiFetch(`/admin/vocab-activity/${student._id}?${params}`)
      .then(d => setChartData(d.data || []))
      .catch(() => setChartData([]))
      .finally(() => setLoadingChart(false));
  }, [view, selMonth, selYear, student._id]);

  useEffect(() => { loadChart(); }, [loadChart]);

  const miniStats = [
    { label: 'Sổ từ vựng',     val: student.totalBooks ?? 0,                               color: '#3d8bff' },
    { label: 'Tổng từ đã lưu', val: (student.totalWords ?? 0).toLocaleString('vi-VN'),     color: '#34d399' },
    { label: 'Lượt truy cập',  val: (student.totalViews ?? 0).toLocaleString('vi-VN'),     color: '#fbbf24' },
    { label: 'Từ đã ôn',       val: (student.totalStudied ?? 0).toLocaleString('vi-VN'),   color: '#a78bfa' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {miniStats.map((m, i) => (
          <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: m.color }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Books table */}
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Sổ từ vựng</div>
        {loadingBooks ? (
          <div style={{ color: 'var(--text3)', fontSize: 13, padding: 8 }}>Đang tải...</div>
        ) : (
          <div className="table-wrap" style={{ marginBottom: 0 }}>
            <table className="table" style={{ fontSize: 12 }}>
              <thead>
                <tr><th>TÊN SỔ</th><th>TỔNG TỪ</th><th>ĐÃ THUỘC</th><th>NHỚ SƠ SƠ</th><th>CHƯA THUỘC</th><th>TIẾN ĐỘ</th></tr>
              </thead>
              <tbody>
                {books.length === 0
                  ? <tr><td colSpan={6} className="table-empty">Chưa có sổ từ vựng</td></tr>
                  : books.map(b => {
                    const total = b.totalWords || 0;
                    const pct = total > 0 ? Math.round(((b.daThucCount || 0) / total) * 100) : 0;
                    return (
                      <tr key={b._id}>
                        <td>
                          <span style={{ marginRight: 6 }}>{b.emoji || '📘'}</span>
                          <strong>{b.name}</strong>
                          {b.isDefault && <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 4 }}>mặc định</span>}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{total}</td>
                        <td style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 700 }}>{b.daThucCount || 0}</td>
                        <td style={{ textAlign: 'center', color: 'var(--yellow)' }}>{b.nhoSoSoCount || 0}</td>
                        <td style={{ textAlign: 'center', color: 'var(--accent2)' }}>{b.chuaThuocCount || 0}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 28 }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chart */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Hoạt động học</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[['day', 'Ngày'], ['month', 'Tháng'], ['year', 'Năm']].map(([v, lbl]) => (
              <button key={v}
                className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 12, padding: '3px 10px' }}
                onClick={() => { setLoadingChart(true); setView(v); }}>{lbl}</button>
            ))}
          </div>
          {view !== 'year' && (
            <div style={{ display: 'flex', gap: 6 }}>
              {view === 'day' && (
                <select className="form-input" value={selMonth}
                  onChange={e => { setLoadingChart(true); setSelMonth(Number(e.target.value)); }}
                  style={{ width: 110, padding: '3px 8px', fontSize: 12 }}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                  ))}
                </select>
              )}
              <select className="form-input" value={selYear}
                onChange={e => { setLoadingChart(true); setSelYear(Number(e.target.value)); }}
                style={{ width: 80, padding: '3px 8px', fontSize: 12 }}>
                {yearRange.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: 11, color: 'var(--text3)' }}>
            <span><span style={{ color: '#3d8bff' }}>■</span> Lượt xem</span>
            <span><span style={{ color: '#34d399' }}>■</span> Từ thêm</span>
            <span><span style={{ color: '#a78bfa' }}>■</span> Từ ôn</span>
          </div>
        </div>
        {loadingChart
          ? <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>⏳ Đang tải...</div>
          : <VaChart data={chartData} view={view} />
        }
      </div>
    </div>
  );
}
