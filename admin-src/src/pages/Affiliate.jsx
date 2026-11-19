import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import Pagination from '../components/Pagination';

// Tài chính → Affiliate (backend/services/affiliateService.js):
// payout queue, commissions, referrers and the program settings.
// /affiliate?tab=payouts|commissions|referrers|settings

const PAGE = 30;
const vnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')} ₫`;
const TABS = [
  ['payouts', '🏦 Yêu cầu rút tiền'],
  ['commissions', '💰 Hoa hồng'],
  ['referrers', '🙋 Người giới thiệu'],
  ['settings', '⚙️ Cài đặt'],
];
const nameOf = (u) => (u ? (`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username) : '(Đã xóa)');

function UserCell({ u }) {
  return (
    <>
      <div><strong>{nameOf(u)}</strong></div>
      {u?.username && <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{u.username}{u.email ? ` · ${u.email}` : ''}</div>}
    </>
  );
}

function NoteModal({ title, label, confirmText, danger, onClose, onConfirm }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    try { await onConfirm(note); onClose(); } finally { setLoading(false); }
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">{label}</label>
            <textarea className="form-input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={go} disabled={loading}>{loading ? 'Đang lưu...' : confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Overview({ stats }) {
  if (!stats) return null;
  const cards = [
    ['🙋', 'Tài khoản được giới thiệu', stats.referredUsers],
    ['🛒', 'Doanh thu qua affiliate', vnd(stats.sales)],
    ['💰', 'Tổng hoa hồng', vnd(stats.commissionTotal)],
    ['🏦', 'Đã chi trả', vnd(stats.paidOut)],
    ['⏳', `Chờ chuyển (${stats.pendingPayouts})`, vnd(stats.pendingPayoutTotal)],
    ['📌', 'Còn nợ người giới thiệu', vnd(stats.owed)],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginBottom: 16 }}>
      {cards.map(([icon, label, value]) => (
        <div key={label} className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{icon} {label}</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function Payouts({ onChange }) {
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [modal, setModal] = useState(null); // { kind: 'paid'|'reject', payout }
  const [qrView, setQrView] = useState(null); // payout whose QR is shown full size

  function load(p = page, s = status) {
    apiFetch(`/admin/affiliate/payouts?${new URLSearchParams({ status: s, page: p, limit: PAGE })}`)
      .then((d) => setData({ items: d.items || [], total: d.total || 0 }))
      .catch((e) => toast(e.message, 'error'));
  }
  useEffect(() => { load(1, status); }, [status]);

  async function act(kind, payout, adminNote) {
    try {
      const r = await apiFetch(`/admin/affiliate/payouts/${payout._id}/${kind}`, { method: 'PUT', body: JSON.stringify({ adminNote }) });
      toast(r.message);
      load(page);
      onChange();
    } catch (e) { toast(e.message, 'error'); throw e; }
  }

  return (
    <>
      {modal && (
        <NoteModal
          title={modal.kind === 'paid' ? `Đã chuyển ${vnd(modal.payout.amount)}?` : 'Từ chối yêu cầu rút tiền'}
          label={modal.kind === 'paid' ? 'Ghi chú (mã giao dịch…) — gửi kèm tin nhắn cho người nhận' : 'Lý do từ chối (hiện cho người nhận) — số tiền được hoàn lại ví'}
          confirmText={modal.kind === 'paid' ? '✅ Xác nhận đã chuyển' : 'Xác nhận từ chối'}
          danger={modal.kind === 'reject'}
          onClose={() => setModal(null)}
          onConfirm={(note) => act(modal.kind, modal.payout, note)}
        />
      )}
      {qrView && (
        <div className="modal-overlay" onClick={() => setQrView(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Quét QR · {vnd(qrView.amount)} cho {nameOf(qrView.userId)}</h3>
              <button className="modal-close" onClick={() => setQrView(null)} aria-label="Đóng">✕</button>
            </div>
            <div style={{ padding: '16px 24px 24px', textAlign: 'center' }}>
              <img src={qrView.qrImageUrl} alt="QR nhận tiền" style={{ maxWidth: '100%', maxHeight: '60vh', background: '#fff', borderRadius: 8 }} />
              <div style={{ marginTop: 10 }}>
                <a href={qrView.qrImageUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Mở ảnh gốc</a>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="filter-bar" style={{ marginBottom: 12 }}>
        {[['pending', '⏳ Chờ chuyển'], ['paid', '✅ Đã chuyển'], ['rejected', '❌ Từ chối']].map(([s, label]) => (
          <button key={s} className={`btn ${status === s ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => { setStatus(s); setPage(1); }}>{label}</button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>NGƯỜI NHẬN</th><th>SỐ TIỀN</th><th>CHUYỂN TỚI</th><th>NGÀY GỬI</th>
              {status === 'pending' ? <th>SỐ DƯ HIỆN TẠI</th> : <th>GHI CHÚ</th>}
              {status === 'pending' && <th>THAO TÁC</th>}
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0
              ? <tr><td colSpan={6} className="table-empty">Không có yêu cầu nào</td></tr>
              : data.items.map((p) => (
                <tr key={p._id}>
                  <td><UserCell u={p.userId} /></td>
                  <td style={{ whiteSpace: 'nowrap' }}><strong>{vnd(p.amount)}</strong></td>
                  <td style={{ fontSize: 13 }}>
                    {p.qrImageUrl && (
                      <button type="button" onClick={() => setQrView(p)} title="Bấm để phóng to và quét"
                        style={{ display: 'block', padding: 0, border: '1px solid var(--border)', borderRadius: 8, background: '#fff', cursor: 'zoom-in', marginBottom: 6 }}>
                        <img src={p.qrImageUrl} alt="QR nhận tiền" style={{ width: 84, height: 84, objectFit: 'contain', display: 'block' }} />
                      </button>
                    )}
                    {(p.bankName || p.bankAccount) && <div><strong>{p.bankName}</strong>{p.bankName && p.bankAccount ? ' · ' : ''}{p.bankAccount}</div>}
                    {p.accountName && <div style={{ color: 'var(--text3)' }}>{p.accountName}</div>}
                    {p.note && <div style={{ fontSize: 12, color: 'var(--text2)' }}>“{p.note}”</div>}
                  </td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(p.createdAt)}</td>
                  {status === 'pending'
                    ? (
                      <td style={{ fontSize: 12 }}>
                        {p.totals ? (
                          <>
                            <div>Hoa hồng: {vnd(p.totals.earned)}</div>
                            <div>Đã rút: {vnd(p.totals.paid)}</div>
                            {/* balance already has this request taken out */}
                            <div style={{ color: p.totals.balance < 0 ? 'var(--danger)' : 'inherit' }}>Còn lại sau khi chuyển: {vnd(p.totals.balance)}</div>
                          </>
                        ) : '–'}
                      </td>
                    )
                    : <td style={{ fontSize: 12 }}>{p.adminNote || '–'}{p.reviewedBy?.username ? <div style={{ color: 'var(--text3)' }}>bởi {p.reviewedBy.username}</div> : null}</td>}
                  {status === 'pending' && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => setModal({ kind: 'paid', payout: p })}>✅ Đã chuyển</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setModal({ kind: 'reject', payout: p })}>❌ Từ chối</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <Pagination page={page} total={data.total} pageSize={PAGE} onPage={(p) => { setPage(p); load(p); }} />
      </div>
    </>
  );
}

function Commissions({ referrerId, onChange }) {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [cancelTarget, setCancelTarget] = useState(null);

  function load(p = page, s = status) {
    const q = new URLSearchParams({ page: p, limit: PAGE });
    if (s) q.set('status', s);
    if (referrerId) q.set('referrerId', referrerId);
    apiFetch(`/admin/affiliate/commissions?${q}`)
      .then((d) => setData({ items: d.items || [], total: d.total || 0 }))
      .catch((e) => toast(e.message, 'error'));
  }
  useEffect(() => { load(1, status); }, [status, referrerId]);

  async function cancel(c, reason) {
    try {
      await apiFetch(`/admin/affiliate/commissions/${c._id}/cancel`, { method: 'PUT', body: JSON.stringify({ reason }) });
      toast('Đã hủy hoa hồng');
      load(page);
      onChange();
    } catch (e) { toast(e.message, 'error'); throw e; }
  }

  return (
    <>
      {cancelTarget && (
        <NoteModal title={`Hủy hoa hồng ${vnd(cancelTarget.amount)}?`} label="Lý do (hiện cho người giới thiệu)" confirmText="Hủy hoa hồng" danger
          onClose={() => setCancelTarget(null)} onConfirm={(r) => cancel(cancelTarget, r)} />
      )}
      <div className="filter-bar" style={{ marginBottom: 12 }}>
        {[['', 'Tất cả'], ['earned', '✅ Hợp lệ'], ['cancelled', '🚫 Đã hủy']].map(([s, label]) => (
          <button key={s || 'all'} className={`btn ${status === s ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => { setStatus(s); setPage(1); }}>{label}</button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>NGÀY</th><th>NGƯỜI GIỚI THIỆU</th><th>NGƯỜI MUA</th><th>ĐƠN HÀNG</th><th>HOA HỒNG</th><th></th></tr></thead>
          <tbody>
            {data.items.length === 0
              ? <tr><td colSpan={6} className="table-empty">Chưa có hoa hồng nào</td></tr>
              : data.items.map((c) => (
                <tr key={c._id} style={c.status === 'cancelled' ? { opacity: 0.55 } : undefined}>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(c.createdAt)}</td>
                  <td><UserCell u={c.referrerId} /></td>
                  <td><UserCell u={c.referredUserId} /></td>
                  <td style={{ fontSize: 13 }}>
                    <span className={`badge ${c.source === 'premium' ? 'badge-blue' : 'badge-green'}`}>{c.source === 'premium' ? 'Premium' : 'Học phí'}</span>{' '}
                    {c.description}
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{vnd(c.baseAmount)} × {c.percent}%</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <strong>{vnd(c.amount)}</strong>
                    {c.status === 'cancelled' && <div style={{ fontSize: 12, color: 'var(--danger)' }}>Đã hủy{c.cancelReason ? `: ${c.cancelReason}` : ''}</div>}
                  </td>
                  <td>{c.status === 'earned' && <button className="btn btn-ghost btn-sm" onClick={() => setCancelTarget(c)}>Hủy</button>}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <Pagination page={page} total={data.total} pageSize={PAGE} onPage={(p) => { setPage(p); load(p); }} />
      </div>
    </>
  );
}

function Referrers({ onPick }) {
  const toast = useToast();
  const [items, setItems] = useState(null);
  useEffect(() => {
    apiFetch('/admin/affiliate/referrers').then((d) => setItems(d.items || [])).catch((e) => toast(e.message, 'error'));
  }, []);
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>NGƯỜI GIỚI THIỆU</th><th>MÃ</th><th>BẤM LINK</th><th>ĐĂNG KÝ</th><th>DOANH THU</th><th>HOA HỒNG</th><th>ĐÃ RÚT</th><th>SỐ DƯ</th><th></th></tr></thead>
        <tbody>
          {items === null && <tr><td colSpan={9} className="table-empty">Đang tải…</td></tr>}
          {items?.length === 0 && <tr><td colSpan={9} className="table-empty">Chưa có ai giới thiệu được tài khoản nào</td></tr>}
          {items?.map((r) => (
            <tr key={r._id}>
              <td><UserCell u={r} /></td>
              <td><code>{r.referralCode}</code></td>
              <td>{r.clicks || 0}</td>
              <td>{r.signups}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{vnd(r.sales)}</td>
              <td style={{ whiteSpace: 'nowrap' }}><strong>{vnd(r.earned)}</strong></td>
              <td style={{ whiteSpace: 'nowrap' }}>{vnd(r.paid)}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{vnd(r.balance)}</td>
              <td><button className="btn btn-ghost btn-sm" onClick={() => onPick(r)}>Xem hoa hồng</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Settings({ settings, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  if (!form) return null;

  async function save() {
    setSaving(true);
    try {
      await apiFetch('/admin/affiliate/settings', { method: 'PUT', body: JSON.stringify({ ...form, percent: Number(form.percent), minPayout: Number(form.minPayout) }) });
      toast('Đã lưu cài đặt Affiliate');
      onSaved();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="card" style={{ padding: 20, maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600 }}>
        <input type="checkbox" checked={!!form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
        Bật chương trình Affiliate
      </label>
      <div className="form-group">
        <label className="form-label">Phần trăm hoa hồng (%)</label>
        <input className="form-input" type="number" min={0} max={100} step={0.5} value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} />
        <small style={{ color: 'var(--text3)' }}>Áp dụng cho các đơn được xác nhận từ bây giờ — hoa hồng cũ giữ nguyên %.</small>
      </div>
      <div className="form-group">
        <label className="form-label">Mức rút tối thiểu (₫)</label>
        <input className="form-input" type="number" min={0} step={10000} value={form.minPayout} onChange={(e) => setForm({ ...form, minPayout: e.target.value })} />
      </div>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text3)' }}>
        Hoa hồng được tính khi admin <b>duyệt yêu cầu nâng cấp Premium</b> hoặc <b>đánh dấu học phí đã đóng</b> của người được giới thiệu.
        Bỏ đánh dấu / xóa khoản học phí sẽ tự hủy hoa hồng tương ứng. Khi tắt chương trình, đơn mới không sinh hoa hồng và link mới không được ghi nhận.
      </p>
      <div><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : '💾 Lưu cài đặt'}</button></div>
    </div>
  );
}

export default function Affiliate() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'payouts';
  const [overview, setOverview] = useState(null);
  const [referrer, setReferrer] = useState(null);

  function loadOverview() {
    apiFetch('/admin/affiliate/overview').then(setOverview).catch((e) => toast(e.message, 'error'));
  }
  useEffect(loadOverview, []);

  const openTab = (k) => setParams(k === 'payouts' ? {} : { tab: k }, { replace: true });

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Affiliate {overview?.settings && (
          <span className={`badge ${overview.settings.enabled ? 'badge-green' : 'badge-red'}`} style={{ marginLeft: 8, fontSize: 12 }}>
            {overview.settings.enabled ? `Đang bật · ${overview.settings.percent}%` : 'Đang tắt'}
          </span>
        )}</h2>
      </div>

      <Overview stats={overview?.stats} />

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        {TABS.map(([k, label]) => (
          <button key={k} className={`btn ${tab === k ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => openTab(k)}>
            {label}{k === 'payouts' && overview?.stats?.pendingPayouts ? ` (${overview.stats.pendingPayouts})` : ''}
          </button>
        ))}
      </div>

      {tab === 'payouts' && <Payouts onChange={loadOverview} />}
      {tab === 'commissions' && (
        <>
          {referrer && (
            <div style={{ marginBottom: 10, fontSize: 13 }}>
              Đang lọc theo <strong>{nameOf(referrer)}</strong>{' '}
              <button className="btn btn-ghost btn-sm" onClick={() => setReferrer(null)}>✕ Bỏ lọc</button>
            </div>
          )}
          <Commissions key={referrer?._id || "all"} referrerId={referrer?._id} onChange={loadOverview} />
        </>
      )}
      {tab === 'referrers' && <Referrers onPick={(r) => { setReferrer(r); openTab('commissions'); }} />}
      {tab === 'settings' && overview?.settings && <Settings key={JSON.stringify(overview.settings)} settings={overview.settings} onSaved={loadOverview} />}
    </>
  );
}
