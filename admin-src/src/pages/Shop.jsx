import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FRONTEND_URL, formatDate } from '../utils/api';
import { useApi } from '../hooks/useApi';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import { ErrorState, EmptyState, TableBody } from '../components/ui/States';

// BXH vocab + Cửa hàng lửa 🔥 — admin view of vocab-leaderboard.html and
// shop.html (GET /api/admin/shop/overview). Read-only: 🔥 / items only move
// through the student shop flows. Two sidebar entries, one per tab:
//   /shop           Bảng xếp hạng — real streaks (Áo Tàng Hình ignored),
//                   ví lửa, linh thú
//   /shop?tab=shop  Cửa hàng lửa — inventory per student, 30-day purchase
//                   log, ⚔️ đấu lửa
// Quiz-average board + streak reset/restore stay in Theo dõi luyện tập ›
// Hoạt động từ vựng.

const DUEL_STATUS = {
  pending: ['Chờ nhận', 'badge-yellow'], active: ['Đang đấu', 'badge-blue'], done: ['Đã xong', 'badge-green'],
  declined: ['Từ chối', 'badge-gray'], cancelled: ['Huỷ', 'badge-gray'], expired: ['Hết hạn', 'badge-gray'],
};

function Board({ data, loading }) {
  const [search, setSearch] = useState('');
  const petName = useMemo(() => Object.fromEntries((data?.catalog?.pets || []).map(p => [p.id, p.name])), [data]);
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.players || []).filter(r => !q || (r.name || '').toLowerCase().includes(q));
  }, [data, search]);
  return (
    <>
      <div className="filter-bar" style={{ marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
        <input type="search" className="form-input search-input" style={{ maxWidth: 260 }} placeholder="Tìm học sinh…"
          value={search} onChange={e => setSearch(e.target.value)} aria-label="Tìm học sinh" />
        <span className="muted" style={{ fontSize: 12 }}>Xếp theo chuỗi 🔥 thật (kể cả bạn đang mặc Áo Tàng Hình).</span>
        <Link to="/monitoring?tab=vocab" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>Khôi phục / reset chuỗi →</Link>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th style={{ width: 50 }}>#</th><th>HỌC SINH</th><th>CHUỖI 🔥</th><th>VÍ LỬA</th><th>BÚA DANIEL</th><th>LINH THÚ</th></tr></thead>
          <TableBody loading={loading} colSpan={6} empty={!loading && rows.length === 0 ? <EmptyState icon="🏆" title="Chưa có học sinh nào có chuỗi" /> : null}>
            {rows.map((r, i) => (
              <tr key={r._id}>
                <td style={{ fontWeight: 700 }}>{i + 1}</td>
                <td><Link to={`/students/${r._id}`} style={{ fontWeight: 600 }}>{r.name}</Link>{r.crowned && <span title="Đang đội vương miện"> 👑</span>}</td>
                <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{r.streak}</td>
                <td>{r.wallet} 🔥</td>
                <td>{r.hammers || 0}</td>
                <td style={{ fontSize: 12 }}>{r.activePet ? `${petName[r.activePet] || r.activePet} (đang dắt)` : '—'}{r.pets ? <span className="muted"> · sở hữu {r.pets}</span> : null}</td>
              </tr>
            ))}
          </TableBody>
        </table>
      </div>
    </>
  );
}

function ShopTab({ data, loading }) {
  const items = data?.catalog?.items || [];
  const players = (data?.players || []).filter(p => items.some(it => (p.items?.[it.key] || 0) > 0));
  return (
    <>
      <div className="panel panel-flush" style={{ marginBottom: 16 }}>
        <div className="panel-head" style={{ padding: '12px 16px', marginBottom: 0 }}>
          <div className="panel-title">🎒 Kho đồ của học sinh</div>
          <span className="panel-sub">{items.map(i => `${i.emoji} ${i.name} ${i.price}🔥`).join(' · ')}</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>HỌC SINH</th>{items.map(i => <th key={i.key} title={i.name} style={{ textAlign: 'center' }}>{i.emoji}</th>)}</tr></thead>
            <TableBody loading={loading} colSpan={items.length + 1} empty={!loading && players.length === 0 ? <EmptyState icon="🎒" title="Chưa ai có vật phẩm" /> : null}>
              {players.map(p => (
                <tr key={p._id}>
                  <td><Link to={`/students/${p._id}`}>{p.name}</Link></td>
                  {items.map(i => <td key={i.key} style={{ textAlign: 'center' }}>{p.items?.[i.key] || <span className="muted">·</span>}</td>)}
                </tr>
              ))}
            </TableBody>
          </table>
        </div>
      </div>

      <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        <div className="panel panel-flush">
          <div className="panel-head" style={{ padding: '12px 16px', marginBottom: 0 }}>
            <div className="panel-title">🛒 Lịch sử mua (30 ngày)</div>
          </div>
          <div className="table-wrap" style={{ maxHeight: 520, overflow: 'auto' }}>
            <table className="table">
              <thead><tr><th>THỜI GIAN</th><th>HỌC SINH</th><th>MÓN</th><th>🔥</th></tr></thead>
              <TableBody loading={loading} colSpan={4} empty={!loading && !(data?.purchases || []).length ? <EmptyState icon="🛒" title="Chưa có giao dịch" /> : null}>
                {(data?.purchases || []).map(p => (
                  <tr key={p._id}>
                    <td style={{ fontSize: 12 }} className="muted">{formatDate(p.createdAt)}</td>
                    <td><Link to={`/students/${p.userId}`}>{p.name}</Link></td>
                    <td style={{ fontSize: 12 }}>{p.kind === 'duel' ? `⚔️ Thắng đấu với ${p.itemName}` : `${p.emoji || ''} ${p.itemName}`}</td>
                    <td style={{ fontWeight: 600, color: p.kind === 'duel' ? 'var(--green)' : undefined }}>{p.kind === 'duel' ? '+' : '−'}{p.price}</td>
                  </tr>
                ))}
              </TableBody>
            </table>
          </div>
        </div>

        <div className="panel panel-flush">
          <div className="panel-head" style={{ padding: '12px 16px', marginBottom: 0 }}>
            <div className="panel-title">⚔️ Đấu lửa (90 ngày)</div>
          </div>
          <div className="table-wrap" style={{ maxHeight: 520, overflow: 'auto' }}>
            <table className="table">
              <thead><tr><th>NGÀY</th><th>THÁCH ĐẤU</th><th>CƯỢC</th><th>TRẠNG THÁI</th></tr></thead>
              <TableBody loading={loading} colSpan={4} empty={!loading && !(data?.duels || []).length ? <EmptyState icon="⚔️" title="Chưa có trận đấu" /> : null}>
                {(data?.duels || []).map(d => {
                  const [label, cls] = DUEL_STATUS[d.status] || [d.status, 'badge-gray'];
                  const win = d.winnerId ? (String(d.winnerId) === String(d.challengerId) ? d.challengerName : d.opponentName) : null;
                  return (
                    <tr key={d._id}>
                      <td style={{ fontSize: 12 }} className="muted">{formatDate(d.createdAt).split(' ')[0]}</td>
                      <td style={{ fontSize: 12 }}>
                        {d.challengerName} <span className="muted">vs</span> {d.opponentName}
                        {(d.status === 'active' || d.status === 'done') && <div className="muted" style={{ fontSize: 11 }}>{d.scoreC} – {d.scoreO}{win ? ` · 🏆 ${win}` : ''}</div>}
                      </td>
                      <td>{d.stake} 🔥</td>
                      <td><span className={`badge ${cls}`}>{label}</span></td>
                    </tr>
                  );
                })}
              </TableBody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'shop' ? 'shop' : 'board';
  const { data, error, loading, reload } = useApi('/admin/shop/overview');
  const st = data?.stats;
  const duelsOpen = st ? (st.duelCounts.pending || 0) + (st.duelCounts.active || 0) : null;

  return (
    <>
      <PageHeader
        title={tab === 'shop' ? 'Cửa hàng lửa 🔥' : 'Bảng xếp hạng'}
        subtitle="Xem nhanh “nền kinh tế lửa” của học sinh: chuỗi 🔥, ví lửa, vật phẩm, linh thú và các trận đấu. Chỉ xem — lửa và đồ chỉ thay đổi qua cửa hàng của học sinh."
        actions={<a className="btn btn-ghost btn-sm" href={`${FRONTEND_URL}/${tab === 'shop' ? 'shop.html' : 'vocab-leaderboard.html'}`} target="_blank" rel="noreferrer">Mở trang học sinh ↗</a>}
      />
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <StatCard label="Học sinh có lửa / linh thú" value={st?.players} icon="🔥" tone="red" loading={loading} />
        <StatCard label="Tổng ví lửa" value={st?.walletTotal} icon="👛" tone="yellow" loading={loading} />
        <StatCard label="Đã tiêu (30 ngày)" value={st?.spent30d} icon="🛒" tone="purple" loading={loading} sub={st ? `${st.purchases30d} lượt mua` : null} />
        <StatCard label="Trận đấu đang mở" value={duelsOpen} icon="⚔️" tone="blue" loading={loading} sub={st ? `${st.duelCounts.done || 0} trận đã xong` : null} />
      </div>
      <div className="inner-tabs-nav" role="tablist" style={{ marginBottom: 14 }}>
        <button type="button" role="tab" aria-selected={tab === 'board'} className={`inner-tab${tab === 'board' ? ' active' : ''}`} onClick={() => setParams({}, { replace: true })}>🏆 Bảng xếp hạng</button>
        <button type="button" role="tab" aria-selected={tab === 'shop'} className={`inner-tab${tab === 'shop' ? ' active' : ''}`} onClick={() => setParams({ tab: 'shop' }, { replace: true })}>🔥 Cửa hàng lửa</button>
      </div>
      {error && <ErrorState error={error} onRetry={reload} />}
      {tab === 'board' ? <Board data={data} loading={loading} /> : <ShopTab data={data} loading={loading} />}
    </>
  );
}
