import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/Pagination';

const PAGE = 30;

function formatLastSeen(date) {
  if (!date) return { text: 'Chưa có', color: 'var(--text3)' };
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)   return { text: 'Vừa online', color: '#22c55e' };
  if (mins < 60)  return { text: `${mins} phút trước`, color: '#4ade80' };
  if (hours < 24) return { text: `${hours} giờ trước`, color: '#fbbf24' };
  if (days < 7)   return { text: `${days} ngày trước`, color: 'var(--text2)' };
  return { text: formatDate(date).split(' ')[0], color: 'var(--text3)' };
}

function roleBadge(r) {
  const map = { admin: 'badge-red', teacher: 'badge-blue', student: 'badge-green' };
  const label = { admin: 'Admin', teacher: 'Teacher', student: 'Student' };
  return <span className={`badge ${map[r] || 'badge-gray'}`}>{label[r] || r}</span>;
}

function daysLeft(expiresAt) {
  if (!expiresAt) return null;
  const diff = Math.ceil((new Date(expiresAt) - new Date()) / 86400000);
  return diff;
}

function planBadge(plan, expiresAt) {
  if (plan === 'premium') {
    const exp = expiresAt ? new Date(expiresAt) : null;
    const days = exp ? daysLeft(exp) : null;
    const expired = days !== null && days <= 0;
    const urgentColor = !expired && days !== null && days <= 7 ? '#f59e0b' : null;
    const expStr = exp ? exp.toLocaleDateString('vi-VN') : '';
    const countStr = days === null ? '' : expired ? ' (Hết hạn)' : days === 0 ? ' (Hết hạn hôm nay)' : ` (còn ${days} ngày)`;
    return (
      <span className={`badge ${expired ? 'badge-gray' : 'badge-blue'}`}
        style={urgentColor ? { background: urgentColor, color: '#fff', border: 'none' } : {}}
        title={expStr ? `HSD: ${expStr}` : ''}>
        {expired ? '⏰ Hết hạn' : '⭐ Premium'}{countStr}
      </span>
    );
  }
  return <span className="badge badge-gray">Free</span>;
}

const PLAN_OPTIONS = [
  { months: 1,  label: '1 tháng',  price: '90.000 ₫' },
  { months: 3,  label: '3 tháng',  price: '250.000 ₫' },
  { months: 6,  label: '6 tháng',  price: '500.000 ₫' },
  { months: 12, label: '1 năm',    price: '900.000 ₫', badge: 'Tiết kiệm' },
  { months: 36, label: '3 năm',    price: '2.500.000 ₫', badge: 'Tiết kiệm nhất' },
];

function PlanModal({ userId, username, currentPlan, planExpiresAt, onClose, onSaved }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function setPlan(plan, months) {
    setLoading(true);
    try {
      await apiFetch(`/admin/users/${userId}/plan`, { method: 'PUT', body: JSON.stringify({ plan, months }) });
      const label = PLAN_OPTIONS.find(o => o.months === months)?.label || `${months} tháng`;
      toast(plan === 'premium' ? `Đã nâng ${username} lên Premium (${label})` : `Đã hạ ${username} về Free`);
      onSaved();
      onClose();
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  const exp = planExpiresAt ? new Date(planExpiresAt) : null;
  const days = exp ? daysLeft(exp) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Gói dịch vụ — {username}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Current status */}
          <div style={{ background: 'var(--surface2,#f1f5f9)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: exp ? 4 : 0 }}>
              <span style={{ color: 'var(--text2)' }}>Gói hiện tại:</span>
              {planBadge(currentPlan, planExpiresAt)}
            </div>
            {exp && (
              <div style={{ fontSize: 12, color: days !== null && days <= 7 ? '#f59e0b' : 'var(--text2)' }}>
                HSD: {exp.toLocaleDateString('vi-VN')}
                {days !== null && days > 0 && ` — còn ${days} ngày`}
                {days !== null && days <= 0 && ' — Đã hết hạn'}
              </div>
            )}
          </div>

          {/* Cấp Premium */}
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: -4 }}>
            Cấp Premium (cộng thêm từ ngày hết hạn hiện tại)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {PLAN_OPTIONS.map(o => (
              <button key={o.months} className="btn btn-primary" disabled={loading} onClick={() => setPlan('premium', o.months)}
                style={{ position: 'relative', padding: '10px 12px', textAlign: 'left', lineHeight: 1.4 }}>
                {o.badge && (
                  <span style={{ position: 'absolute', top: -7, right: 8, background: '#f59e0b', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                    {o.badge}
                  </span>
                )}
                <div style={{ fontWeight: 700 }}>⭐ {o.label}</div>
                <div style={{ fontSize: 12, opacity: .8 }}>{o.price}</div>
              </button>
            ))}
          </div>

          <button className="btn btn-ghost" disabled={loading} onClick={() => setPlan('free', 0)}
            style={{ marginTop: 4, color: 'var(--danger)', border: '1px solid var(--danger)' }}>
            🔽 Hạ về Free ngay
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateUserModal({ onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'student', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(form) });
      toast('Đã tạo tài khoản thành công');
      onSaved();
      onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Tạo tài khoản mới</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Họ</label>
              <input className="form-input" value={form.firstName} onChange={set('firstName')} />
            </div>
            <div className="form-group">
              <label className="form-label">Tên</label>
              <input className="form-input" value={form.lastName} onChange={set('lastName')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Username <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="form-input" value={form.username} onChange={set('username')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} required placeholder="Tối thiểu 6 ký tự" minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">Vai trò</label>
            <select className="form-input" value={form.role} onChange={set('role')}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang tạo...' : '+ Tạo tài khoản'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserModal({ userId, onClose, onSaved }) {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', role: 'student', firstName: '', lastName: '', isBanned: false, newPassword: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    apiFetch(`/admin/users/${userId}`).then(d => {
      const u = d.user;
      setForm({ username: u.username || '', email: u.email || '', role: u.role || 'student', firstName: u.firstName || '', lastName: u.lastName || '', isBanned: !!u.isBanned, newPassword: '' });
    }).catch(e => toast(e.message, 'error'));
  }, [userId]);

  async function save(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { ...form };
      if (!body.newPassword) delete body.newPassword;
      await apiFetch(`/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(body) });
      toast('Đã cập nhật người dùng');
      onSaved();
      onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Chỉnh sửa người dùng</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={form.username} onChange={set('username')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Họ</label>
              <input className="form-input" value={form.firstName} onChange={set('firstName')} />
            </div>
            <div className="form-group">
              <label className="form-label">Tên</label>
              <input className="form-input" value={form.lastName} onChange={set('lastName')} />
            </div>
          </div>
          {isAdmin && (
            <div className="form-group">
              <label className="form-label">Vai trò</label>
              <select className="form-input" value={form.role} onChange={set('role')}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          {isAdmin && (
            <div className="form-group">
              <label className="form-label">Mật khẩu mới (để trống = giữ nguyên)</label>
              <input className="form-input" type="password" value={form.newPassword} onChange={set('newPassword')} placeholder="••••••••" />
            </div>
          )}
          {isAdmin && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
              <input type="checkbox" checked={form.isBanned} onChange={set('isBanned')} />
              Tài khoản bị cấm
            </label>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editId, setEditId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [planUser, setPlanUser] = useState(null);
  const [onlineIds, setOnlineIds] = useState(new Set());
  const timer = useRef(null);
  const skipPageEffect = useRef(false);

  useEffect(() => {
    apiFetch('/admin/online-users').then(d => setOnlineIds(new Set((d.users || []).map(u => u._id)))).catch(() => {});
  }, []);

  function load(p = page) {
    const params = new URLSearchParams({ page: p, limit: PAGE });
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    if (statusFilter === 'banned') params.set('isBanned', 'true');
    if (statusFilter === 'active') params.set('isBanned', 'false');
    apiFetch(`/admin/users?${params}`).then(d => { setUsers(d.users || []); setTotal(d.total || 0); }).catch(e => toast(e.message, 'error'));
  }

  // Filter change → reset to page 1 and load once (skip the page effect that fires from setPage)
  useEffect(() => { skipPageEffect.current = true; setPage(1); load(1); }, [search, roleFilter, statusFilter]);
  useEffect(() => { if (skipPageEffect.current) { skipPageEffect.current = false; return; } load(page); }, [page]);

  async function toggleBan(id, username, isBanned) {
    confirm(`${isBanned ? 'Bỏ cấm' : 'Cấm'} tài khoản "${username}"?`, async () => {
      try {
        await apiFetch(`/admin/users/${id}/ban`, { method: 'PUT', body: JSON.stringify({ isBanned: !isBanned }) });
        toast(isBanned ? 'Đã bỏ cấm' : 'Đã cấm tài khoản');
        load(page);
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  async function deleteUser(id, username) {
    confirm(`Xóa vĩnh viễn tài khoản "${username}"? Không thể khôi phục.`, async () => {
      try {
        await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
        toast('Đã xóa tài khoản');
        load(page);
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      {editId && <UserModal userId={editId} onClose={() => setEditId(null)} onSaved={() => load(page)} />}
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onSaved={() => load(page)} />}
      {planUser && <PlanModal userId={planUser._id} username={planUser.username} currentPlan={planUser.plan} planExpiresAt={planUser.planExpiresAt} onClose={() => setPlanUser(null)} onSaved={() => load(page)} />}

      <div className="section-header">
        <h2 className="section-title">Người dùng ({total})</h2>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Tạo tài khoản</button>}
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input className="form-input search-input" placeholder="Tìm username, email..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 280 }} />
        <select className="form-input" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} style={{ width: 140 }}>
          <option value="">Tất cả role</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <select className="form-input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: 140 }}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="banned">Bị cấm</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>USERNAME</th><th>EMAIL</th><th>HỌ TÊN</th><th>ROLE</th><th>GÓI</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th>ONLINE GẦN NHẤT</th><th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0
              ? <tr><td colSpan={9} className="table-empty">Không có người dùng</td></tr>
              : users.map(u => {
                const ls = formatLastSeen(u.lastSeen);
                return (
                <tr key={u._id} style={{ opacity: u.isBanned ? 0.55 : 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {onlineIds.has(u._id) && (
                        <span title="Đang online" style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0, boxShadow: '0 0 4px #22c55e' }} />
                      )}
                      <strong>{u.username}</strong>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{u.email}</td>
                  <td>{[u.firstName, u.lastName].filter(Boolean).join(' ') || '–'}</td>
                  <td>{roleBadge(u.role)}</td>
                  <td>{planBadge(u.plan, u.planExpiresAt)}</td>
                  <td>
                    {u.isBanned
                      ? <span className="badge badge-red">Bị cấm</span>
                      : <span className="badge badge-green">Hoạt động</span>}
                  </td>
                  <td style={{ fontSize: 12 }}>{formatDate(u.createdAt)}</td>
                  <td style={{ fontSize: 12, color: ls.color, whiteSpace: 'nowrap' }}>{ls.text}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {isAdmin && <button className="btn btn-ghost btn-sm" onClick={() => setEditId(u._id)}>✏️ Sửa</button>}
                      {isAdmin && u.role === 'student' && <button className="btn btn-ghost btn-sm" onClick={() => setPlanUser(u)} title="Quản lý gói">⭐ Gói</button>}
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/messages?to=${u._id}`)} title="Gửi tin nhắn" aria-label="Gửi tin nhắn">✉️</button>
                      {isAdmin && (
                        <button className={`btn btn-sm ${u.isBanned ? 'btn-primary' : 'btn-warning'}`}
                          onClick={() => toggleBan(u._id, u.username, u.isBanned)}>
                          {u.isBanned ? '✅ Bỏ cấm' : '🚫 Cấm'}
                        </button>
                      )}
                      {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id, u.username)}>🗑 Xóa</button>}
                    </div>
                  </td>
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
