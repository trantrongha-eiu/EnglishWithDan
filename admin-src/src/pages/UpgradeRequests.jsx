import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/Pagination';

const PAGE = 30;
const PRICES = { 1: 90000, 3: 250000, 6: 500000, 12: 900000, 36: 2500000 };

function formatMonths(m) {
  if (m === 12) return '1 năm';
  if (m === 36) return '3 năm';
  return `${m} tháng`;
}

function statusBadge(s) {
  if (s === 'approved') return <span className="badge badge-green">Đã duyệt</span>;
  if (s === 'rejected') return <span className="badge badge-red">Từ chối</span>;
  return <span className="badge badge-blue">Chờ duyệt</span>;
}

function ApproveModal({ request, onClose, onDone }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const u = request.userId || {};
  const username = u.username || '(Đã xóa)';

  async function confirm() {
    setLoading(true);
    try {
      await apiFetch(`/admin/upgrade-requests/${request._id}/approve`, { method: 'PUT' });
      toast('Đã duyệt — tài khoản đã được nâng lên Premium');
      onDone();
      onClose();
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Xác nhận duyệt yêu cầu</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            Duyệt nâng cấp <strong>{username}</strong> lên Premium <strong>{formatMonths(request.months)}</strong> ({(request.amount || PRICES[request.months] || 0).toLocaleString('vi-VN')} ₫)?
          </p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text3)' }}>
            Ngày Premium sẽ được cộng dồn vào thời hạn hiện tại của học viên.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button className="btn btn-primary" onClick={confirm} disabled={loading}>{loading ? 'Đang duyệt...' : '✅ Xác nhận duyệt'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ requestId, onClose, onDone }) {
  const toast = useToast();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    try {
      await apiFetch(`/admin/upgrade-requests/${requestId}/reject`, { method: 'PUT', body: JSON.stringify({ adminNote: note }) });
      toast('Đã từ chối yêu cầu');
      onDone();
      onClose();
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Từ chối yêu cầu</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Lý do từ chối (hiện cho học viên)</label>
            <textarea className="form-input" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="VD: Chưa nhận được thanh toán, sai nội dung CK..." />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button className="btn btn-danger" onClick={confirm} disabled={loading}>{loading ? 'Đang gửi...' : 'Xác nhận từ chối'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpgradeRequests() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [rejectId, setRejectId] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);

  function load(p = page) {
    const params = new URLSearchParams({ page: p, limit: PAGE, status: statusFilter });
    apiFetch(`/admin/upgrade-requests?${params}`)
      .then(d => { setRequests(d.requests || []); setTotal(d.total || 0); })
      .catch(e => toast(e.message, 'error'));
  }

  // Adjust-during-render (not an effect): reset to page 1 whenever the
  // status filter changes, in the same render rather than a post-commit
  // effect.
  const [prevStatusFilter, setPrevStatusFilter] = useState(statusFilter);
  if (prevStatusFilter !== statusFilter) {
    setPrevStatusFilter(statusFilter);
    if (page !== 1) setPage(1);
  }
  useEffect(() => { load(1); }, [statusFilter]);
  useEffect(() => { load(page); }, [page]);

  function approve(request) {
    setApproveTarget(request);
  }

  return (
    <>
      {approveTarget && <ApproveModal request={approveTarget} onClose={() => setApproveTarget(null)} onDone={() => load(page)} />}
      {rejectId && <RejectModal requestId={rejectId} onClose={() => setRejectId(null)} onDone={() => load(page)} />}

      <div className="section-header">
        <h2 className="section-title">Yêu cầu nâng cấp ({total})</h2>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        {['pending', 'approved', 'rejected'].map(s => (
          <button key={s} className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => { setStatusFilter(s); setPage(1); }}>
            {s === 'pending' ? '⏳ Chờ duyệt' : s === 'approved' ? '✅ Đã duyệt' : '❌ Từ chối'}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>HỌC VIÊN</th><th>GÓI</th><th>SỐ TIỀN</th><th>GHI CHÚ</th><th>NGÀY GỬI</th><th>TRẠNG THÁI</th>
              {statusFilter === 'rejected' && <th>LÝ DO TỪ CHỐI</th>}
              {statusFilter === 'approved' && <th>DUYỆT BỞI</th>}
              {isAdmin && statusFilter === 'pending' && <th>THAO TÁC</th>}
            </tr>
          </thead>
          <tbody>
            {requests.length === 0
              ? <tr><td colSpan={8} className="table-empty">Không có yêu cầu nào</td></tr>
              : requests.map(r => {
                const u = r.userId || {};
                const username = u.username || '(Đã xóa)';
                return (
                  <tr key={r._id}>
                    <td>
                      <div><strong>{username}</strong></div>
                      {u.email && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.email}</div>}
                    </td>
                    <td><strong>{formatMonths(r.months)}</strong></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{(r.amount || PRICES[r.months] || 0).toLocaleString('vi-VN')} ₫</td>
                    <td style={{ maxWidth: 200, fontSize: 12, color: 'var(--text2)' }}>{r.note || '–'}</td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(r.createdAt)}</td>
                    <td>{statusBadge(r.status)}</td>
                    {statusFilter === 'rejected' && <td style={{ fontSize: 12, color: 'var(--danger)' }}>{r.adminNote || '–'}</td>}
                    {statusFilter === 'approved' && <td style={{ fontSize: 12 }}>{r.reviewedBy?.username || '–'}</td>}
                    {isAdmin && statusFilter === 'pending' && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => approve(r)}>✅ Duyệt</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setRejectId(r._id)}>❌ Từ chối</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <Pagination page={page} total={total} pageSize={PAGE} onPage={p => { setPage(p); load(p); }} />
      </div>
    </>
  );
}
