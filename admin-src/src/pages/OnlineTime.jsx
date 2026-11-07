import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import Pagination from '../components/Pagination';
import { TableBody, EmptyState } from '../components/ui/States';
import OnlineTimePanel from '../components/OnlineTimePanel';
import { fmtMinutes, fmtClock, fmtDayLabel } from '../utils/onlineTime';
import { displayName, initials } from '../utils/format';

// "Thời gian online" — minutes each student studied on a given day (VN time),
// with session / tab-switch / pause counts and a 7-day trend. Click a row
// for the per-session detail. Data: GET /admin/online-time.

const PAGE_SIZE = 50;

function vnToday() {
  return new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}
function shiftDay(key, n) {
  return new Date(Date.parse(`${key}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
}

function DetailModal({ row, day, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 820, maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">⏱️ {displayName(row.user)}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 10, marginBottom: 12 }}>
            <span>@{row.user.username}</span>
            <Link to={`/students/${row.userId}?tab=online`} style={{ marginLeft: 'auto', color: 'var(--blue)' }}>Xem hồ sơ đầy đủ →</Link>
          </div>
          <OnlineTimePanel userId={row.userId} initialDay={day} />
        </div>
      </div>
    </div>
  );
}

function Trend({ trend }) {
  const max = Math.max(60, ...trend.map(t => t.activeSeconds));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 24 }}>
      {trend.map(t => (
        <span key={t.day} title={`${fmtDayLabel(t.day)}: ${fmtMinutes(t.activeSeconds)}`}
          style={{ width: 7, borderRadius: 2, height: t.activeSeconds ? Math.max(3, Math.round((t.activeSeconds / max) * 24)) : 2,
            background: t.activeSeconds ? 'var(--green)' : 'var(--border)' }} />
      ))}
    </div>
  );
}

export default function OnlineTime() {
  const [day, setDay] = useState(vnToday());
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('minutes');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setQ(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const qs = new URLSearchParams({ day, sort, page, limit: PAGE_SIZE });
  if (q) qs.set('search', q);
  const { data, error, loading, reload } = useApi(`/admin/online-time?${qs}`, { pollMs: 60_000 });

  const today = data?.today || vnToday();
  const totals = data?.totals || { students: 0, activeSeconds: 0, sessions: 0, tabSwitches: 0, idlePauses: 0 };
  const rows = data?.students || [];
  const go = (key) => { setDay(key); setPage(1); };

  return (
    <>
      {selected && <DetailModal row={selected} day={day} onClose={() => setSelected(null)} />}

      <div className="section-header">
        <h2 className="section-title">Thời gian online — {fmtDayLabel(day)}{day === today ? ' (hôm nay)' : ''}</h2>
      </div>

      <div className="stats-row" style={{ marginBottom: 16 }}>
        <div className="stat-card blue">
          <div className="stat-label">Học sinh online</div>
          <div className="stat-value">{totals.students}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Tổng thời gian học</div>
          <div className="stat-value">{Math.round(totals.activeSeconds / 60).toLocaleString('vi-VN')}<span style={{ fontSize: 14 }}> phút</span></div>
          <div className="stat-sub">TB {fmtMinutes(totals.students ? totals.activeSeconds / totals.students : 0)}/học sinh</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Chuyển tab</div>
          <div className="stat-value">{totals.tabSwitches}</div>
          <div className="stat-sub">{totals.sessions} phiên</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Tạm dừng</div>
          <div className="stat-value">{totals.idlePauses}</div>
          <div className="stat-sub">không thao tác &gt; 3 phút</div>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => go(shiftDay(day, -1))} aria-label="Ngày trước">‹</button>
        <input type="date" className="form-input" value={day} max={today}
          onChange={e => e.target.value && go(e.target.value)} style={{ width: 160 }} />
        <button className="btn btn-ghost btn-sm" onClick={() => go(shiftDay(day, 1))} disabled={day >= today} aria-label="Ngày sau">›</button>
        {day !== today && <button className="btn btn-ghost btn-sm" onClick={() => go(today)}>Hôm nay</button>}
        <input className="form-input search-input" placeholder="Tìm học sinh..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
        <select className="form-input" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ width: 190 }}>
          <option value="minutes">Học lâu nhất</option>
          <option value="tabs">Chuyển tab nhiều nhất</option>
          <option value="pauses">Tạm dừng nhiều nhất</option>
          <option value="recent">Online gần nhất</option>
          <option value="name">Tên A → Z</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>HỌC SINH</th>
              <th>THỜI GIAN HỌC</th>
              <th>SỐ PHIÊN</th>
              <th title="Rời trang ≥ 5 giây: chuyển tab, mở ứng dụng khác, thu nhỏ">CHUYỂN TAB</th>
              <th title="Mở trang nhưng không thao tác quá 3 phút">TẠM DỪNG</th>
              <th>KHUNG GIỜ</th>
              <th>7 NGÀY</th>
              <th></th>
            </tr>
          </thead>
          <TableBody loading={loading} error={error} onRetry={reload} colSpan={8}
            empty={rows.length === 0 && <EmptyState icon="💤" title={q ? 'Không tìm thấy học sinh' : 'Chưa có học sinh nào online ngày này'} />}>
            {rows.map(r => (
              <tr key={r.userId} style={{ cursor: 'pointer' }} onClick={() => setSelected(r)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="avatar-sm">{r.user.avatar ? <img src={r.user.avatar} alt="" /> : initials(r.user)}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{displayName(r.user)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{r.user.username}{r.user.className ? ` · Lớp ${r.user.className}` : ''}</div>
                    </div>
                  </div>
                </td>
                <td><strong style={{ color: 'var(--blue)', fontSize: 15 }}>{fmtMinutes(r.activeSeconds)}</strong></td>
                <td style={{ textAlign: 'center' }}>{r.sessions}</td>
                <td style={{ textAlign: 'center', color: r.tabSwitches >= 10 ? 'var(--accent2)' : undefined, fontWeight: r.tabSwitches >= 10 ? 700 : 400 }}>{r.tabSwitches}</td>
                <td style={{ textAlign: 'center' }}>{r.idlePauses}</td>
                <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{fmtClock(r.firstStart)} – {fmtClock(r.lastEnd)}</td>
                <td><Trend trend={r.trend || []} /></td>
                <td><button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelected(r); }}>📊 Chi tiết</button></td>
              </tr>
            ))}
          </TableBody>
        </table>
      </div>

      <Pagination page={page} total={data?.total || 0} pageSize={PAGE_SIZE} onPage={setPage} />
    </>
  );
}
