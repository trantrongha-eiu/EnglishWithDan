import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

function VaChart({ data, view }) {
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

function VocabActivityModal({ student, onClose }) {
  const toast = useToast();
  const [books, setBooks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [view, setView] = useState('day');
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);

  const yearRange = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    apiFetch(`/admin/vocab-books/${student._id}`)
      .then(d => setBooks(d.books || []))
      .catch(() => {})
      .finally(() => setLoadingBooks(false));
  }, [student._id]);

  useEffect(() => {
    setLoadingChart(true);
    const params = new URLSearchParams({ view, year: selYear });
    if (view === 'day') params.set('month', selMonth);
    apiFetch(`/admin/vocab-activity/${student._id}?${params}`)
      .then(d => setChartData(d.data || []))
      .catch(() => setChartData([]))
      .finally(() => setLoadingChart(false));
  }, [view, selMonth, selYear, student._id]);

  const name = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.username;

  const miniStats = [
    { label: 'Sổ từ vựng',     val: student.totalBooks ?? 0,                               color: '#3d8bff' },
    { label: 'Tổng từ đã lưu', val: (student.totalWords ?? 0).toLocaleString('vi-VN'),     color: '#34d399' },
    { label: 'Lượt truy cập',  val: (student.totalViews ?? 0).toLocaleString('vi-VN'),     color: '#fbbf24' },
    { label: 'Từ đã ôn',       val: (student.totalStudied ?? 0).toLocaleString('vi-VN'),   color: '#a78bfa' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 820, maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📖 {name}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>@{student.username} · {student.email || ''}</div>

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
                    onClick={() => setView(v)}>{lbl}</button>
                ))}
              </div>
              {view !== 'year' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {view === 'day' && (
                    <select className="form-input" value={selMonth}
                      onChange={e => setSelMonth(Number(e.target.value))}
                      style={{ width: 110, padding: '3px 8px', fontSize: 12 }}>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                      ))}
                    </select>
                  )}
                  <select className="form-input" value={selYear}
                    onChange={e => setSelYear(Number(e.target.value))}
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
      </div>
    </div>
  );
}

function activityDotColor(lastActivity) {
  if (!lastActivity) return 'var(--text3)';
  const days = (Date.now() - new Date(lastActivity)) / 86400000;
  if (days <= 1) return 'var(--green)';
  if (days <= 7) return 'var(--yellow)';
  return 'var(--accent2)';
}

export default function VocabActivity() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('words-desc');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    apiFetch('/admin/vocab-students')
      .then(d => setStudents(d.students || []))
      .catch(e => toast(e.message, 'error'));
  }, []);

  const sortFns = {
    'words-desc': (a, b) => (b.totalWords || 0) - (a.totalWords || 0),
    'views-desc': (a, b) => (b.totalViews || 0) - (a.totalViews || 0),
    'recent': (a, b) => {
      const da = a.lastVocabActivity ? new Date(a.lastVocabActivity) : new Date(0);
      const db = b.lastVocabActivity ? new Date(b.lastVocabActivity) : new Date(0);
      return db - da;
    },
    'name': (a, b) => (a.username || '').localeCompare(b.username || ''),
  };

  const filtered = students
    .filter(s => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (s.username || '').toLowerCase().includes(q)
        || (s.email || '').toLowerCase().includes(q)
        || (s.firstName || '').toLowerCase().includes(q)
        || (s.lastName || '').toLowerCase().includes(q);
    })
    .sort(sortFns[sort] || sortFns['words-desc']);

  const activeCount  = students.filter(s => (s.totalWords || 0) > 0).length;
  const totalWords   = students.reduce((sum, s) => sum + (s.totalWords   || 0), 0);
  const totalViews   = students.reduce((sum, s) => sum + (s.totalViews   || 0), 0);
  const totalStudied = students.reduce((sum, s) => sum + (s.totalStudied || 0), 0);

  return (
    <>
      {selected && <VocabActivityModal student={selected} onClose={() => setSelected(null)} />}

      <div className="section-header">
        <h2 className="section-title">Hoạt động từ vựng ({filtered.length} học sinh)</h2>
      </div>

      {/* Summary stat cards */}
      <div className="stats-row" style={{ marginBottom: 16 }}>
        <div className="stat-card blue">
          <div className="stat-label">Đang học</div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-sub">Học sinh có từ vựng</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Tổng từ đã lưu</div>
          <div className="stat-value">{totalWords.toLocaleString('vi-VN')}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Tổng lượt xem</div>
          <div className="stat-value">{totalViews.toLocaleString('vi-VN')}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Từ đã ôn luyện</div>
          <div className="stat-value">{totalStudied.toLocaleString('vi-VN')}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input className="form-input search-input" placeholder="Tìm học sinh..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="form-input" value={sort} onChange={e => setSort(e.target.value)} style={{ width: 190 }}>
          <option value="words-desc">Nhiều từ nhất</option>
          <option value="views-desc">Nhiều lượt xem nhất</option>
          <option value="recent">Hoạt động gần nhất</option>
          <option value="name">Tên A → Z</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>HỌC SINH</th>
              <th>SỔ</th>
              <th>TỔNG TỪ</th>
              <th>ĐÃ THUỘC</th>
              <th>LƯỢT XEM</th>
              <th>NGÀY HĐ</th>
              <th>LẦN CUỐI</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={8} className="table-empty">Không có dữ liệu</td></tr>
              : filtered.map(s => {
                const name = [s.firstName, s.lastName].filter(Boolean).join(' ') || s.username;
                const mastered = (s.totalWords || 0) > 0
                  ? Math.round(((s.daThuoc || 0) / s.totalWords) * 100) : 0;
                const dotColor = activityDotColor(s.lastVocabActivity);
                return (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--surface2)', border: '2px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 13, flexShrink: 0, color: 'var(--blue)',
                        }}>
                          {(s.username?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {name}
                            {(s.learningStreak || 0) > 0 && (
                              <span style={{ fontSize: 11, color: '#fbbf24', marginLeft: 4 }}>🔥{s.learningStreak}</span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{s.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{s.totalBooks || 0}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{(s.totalWords || 0).toLocaleString('vi-VN')}</span>
                    </td>
                    <td>
                      {(s.totalWords || 0) > 0 ? (
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 13 }}>{s.daThuoc || 0}</div>
                          <div style={{ width: 80, height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden', marginTop: 3 }}>
                            <div style={{ width: `${mastered}%`, height: '100%', background: 'var(--green)', borderRadius: 2 }} />
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{mastered}%</div>
                        </div>
                      ) : <span style={{ color: 'var(--text3)' }}>–</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--yellow)' }}>
                        {(s.totalViews || 0).toLocaleString('vi-VN')}
                      </span>
                      {(s.activeDays || 0) > 0 && (
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{s.activeDays} ngày</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {(s.activeDays || 0) > 0
                        ? <><span style={{ fontWeight: 700 }}>{s.activeDays}</span><span style={{ fontSize: 11, color: 'var(--text3)' }}> ngày</span></>
                        : <span style={{ color: 'var(--text3)' }}>–</span>}
                    </td>
                    <td>
                      <span style={{ color: dotColor }}>● </span>
                      <span style={{ fontSize: 12 }}>
                        {s.lastVocabActivity ? formatDate(s.lastVocabActivity).split(' ')[0] : 'Chưa có'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(s)}
                        style={{ whiteSpace: 'nowrap' }}>
                        📊 Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}
