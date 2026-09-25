import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useAdminData } from '../contexts/AdminDataContext';
import { useApi } from '../hooks/useApi';
import Pagination from '../components/Pagination';
import PageHeader from '../components/ui/PageHeader';
import RowMenu from '../components/ui/RowMenu';
import { TableBody, EmptyState } from '../components/ui/States';
import { roleBadge, planBadge, statusBadge } from '../components/ui/badges';
import { displayName, formatLastSeen, initials, formatNumber } from '../utils/format';
import { PlanModal, RemindModal, CreateUserModal, EditUserModal } from './users/UserModals';

const PAGE = 30;

// Người dùng (redesigned 2026-09-25):
//  - filters/sort/page live in the URL (bookmarkable; Dashboard deep-links
//    here with ?role=student&plan=premium);
//  - everything is server-side (search, role, status, plan, sort, paging);
//  - useApi aborts the previous request, so fast typing can't show stale
//    results, and a page click fires ONE request (it used to fire two);
//  - rows collapse 7 inline buttons into one primary action + a "⋯" menu.

const FILTER_KEYS = ['q', 'role', 'status', 'plan', 'sort'];

export default function Users() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const { badges } = useAdminData();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const q = params.get('q') || '';
  const role = params.get('role') || '';
  const status = params.get('status') || '';
  const plan = params.get('plan') || '';
  const sort = params.get('sort') || 'newest';
  const page = Math.max(1, parseInt(params.get('page')) || 1);

  // Local text box state, pushed to the URL (and thus the query) debounced.
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (prevQ !== q) { setPrevQ(q); setSearch(q); } // back/forward navigation

  // Functional update: the debounced search commit below may run after a
  // filter changed, and must not overwrite it with a stale snapshot.
  function update(patch, { resetPage = true } = {}) {
    setParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => { if (v) next.set(k, v); else next.delete(k); });
      if (resetPage) next.delete('page');
      return next;
    }, { replace: true });
  }

  useEffect(() => {
    if (search === q) return undefined;
    const t = setTimeout(() => update({ q: search.trim() }), 350);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const query = new URLSearchParams({ page: String(page), limit: String(PAGE), sort });
  if (q) query.set('search', q);
  if (role) query.set('role', role);
  if (status === 'banned') query.set('isBanned', 'true');
  if (status === 'active') query.set('isBanned', 'false');
  if (plan) query.set('plan', plan);
  const { data, error, loading, refreshing, reload } = useApi(`/admin/users?${query}`);
  const users = data?.users || [];
  const total = data?.total || 0;

  const [editId, setEditId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [planUser, setPlanUser] = useState(null);
  const [remindUser, setRemindUser] = useState(null);
  const onlineIds = badges?.onlineIds || new Set();
  const hasFilters = FILTER_KEYS.some(k => k !== 'sort' && params.get(k));

  function toggleBan(u) {
    confirm(`${u.isBanned ? 'Bỏ cấm' : 'Cấm'} tài khoản "${u.username}"?`, async () => {
      try {
        await apiFetch(`/admin/users/${u._id}/ban`, { method: 'PUT', body: JSON.stringify({ isBanned: !u.isBanned }) });
        toast(u.isBanned ? 'Đã bỏ cấm' : 'Đã cấm tài khoản');
        reload();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  function deleteUser(u) {
    confirm(`Xóa vĩnh viễn tài khoản "${u.username}"? Không thể khôi phục.`, async () => {
      try {
        await apiFetch(`/admin/users/${u._id}`, { method: 'DELETE' });
        toast('Đã xóa tài khoản');
        reload();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  function resetReminders(u) {
    confirm(`Xóa cảnh báo nhắc nhở tích lũy của "${u.username}"? Banner cảnh báo trên các trang của học sinh sẽ tắt.`, async () => {
      try {
        await apiFetch(`/admin/users/${u._id}/reset-reminders`, { method: 'POST' });
        toast('Đã xóa cảnh báo nhắc nhở');
        reload();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      {editId && <EditUserModal userId={editId} onClose={() => setEditId(null)} onSaved={reload} />}
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onSaved={reload} />}
      {planUser && <PlanModal user={planUser} onClose={() => setPlanUser(null)} onSaved={reload} />}
      {remindUser && <RemindModal user={remindUser} onClose={() => setRemindUser(null)} onSaved={reload} />}

      <PageHeader
        title="Người dùng"
        subtitle={loading ? 'Đang tải…' : `${formatNumber(total)} tài khoản${role ? ` · vai trò ${role}` : ' (mọi vai trò)'}${onlineIds.size ? ` · ${onlineIds.size} đang online` : ''}`}
        actions={isAdmin && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Tạo tài khoản</button>}
      />

      <div className="filter-bar" style={{ marginBottom: 14 }}>
        <input
          type="search"
          className="form-input search-input"
          placeholder="Tìm tên, username, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Tìm người dùng"
          style={{ maxWidth: 300 }}
        />
        <select className="form-input" value={role} onChange={e => update({ role: e.target.value })} style={{ width: 150 }} aria-label="Lọc vai trò">
          <option value="">Mọi vai trò</option>
          <option value="student">Học sinh</option>
          <option value="teacher">Giáo viên</option>
          <option value="admin">Admin</option>
        </select>
        <select className="form-input" value={plan} onChange={e => update({ plan: e.target.value })} style={{ width: 140 }} aria-label="Lọc gói">
          <option value="">Mọi gói</option>
          <option value="premium">Premium</option>
          <option value="free">Free</option>
        </select>
        <select className="form-input" value={status} onChange={e => update({ status: e.target.value })} style={{ width: 150 }} aria-label="Lọc trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="banned">Bị cấm</option>
        </select>
        <select className="form-input" value={sort} onChange={e => update({ sort: e.target.value === 'newest' ? '' : e.target.value })} style={{ width: 170 }} aria-label="Sắp xếp">
          <option value="newest">Mới đăng ký trước</option>
          <option value="oldest">Cũ nhất trước</option>
          <option value="lastSeen">Online gần nhất</option>
          <option value="name">Username A → Z</option>
        </select>
        {hasFilters && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setParams({}, { replace: true }); }}>
            ✕ Xoá bộ lọc
          </button>
        )}
      </div>

      <div className={`table-wrap${refreshing ? ' is-refreshing' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              <th>Người dùng</th><th>Lớp</th><th>Gói</th><th>Trạng thái</th>
              <th>Nhắc nhở</th><th>Online gần nhất</th><th>Ngày tạo</th><th aria-label="Thao tác" />
            </tr>
          </thead>
          <TableBody
            loading={loading}
            error={error}
            onRetry={reload}
            colSpan={8}
            rows={8}
            empty={users.length === 0 && (
              <EmptyState icon="🔍" title="Không có người dùng phù hợp">
                {hasFilters ? 'Thử bỏ bớt bộ lọc hoặc đổi từ khoá.' : 'Chưa có tài khoản nào.'}
              </EmptyState>
            )}
          >
            {users.map(u => {
              const ls = formatLastSeen(u.lastSeen);
              const isStudent = u.role === 'student';
              return (
                <tr key={u._id} style={{ opacity: u.isBanned ? 0.6 : 1 }}>
                  <td>
                    <div className="user-cell">
                      <span className={`avatar-sm${onlineIds.has(u._id) ? ' avatar-online' : ''}`} title={onlineIds.has(u._id) ? 'Đang online' : undefined}>
                        {u.avatar ? <img src={u.avatar} alt="" loading="lazy" /> : initials(u)}
                      </span>
                      <span className="user-cell-text">
                        {isStudent
                          ? <Link to={`/students/${u._id}`} className="user-cell-name">{displayName(u)}</Link>
                          : <span className="user-cell-name">{displayName(u)} {roleBadge(u.role)}</span>}
                        <span className="user-cell-meta">@{u.username} · {u.email}</span>
                      </span>
                    </div>
                  </td>
                  <td>{u.className ? <span className="badge badge-purple">{u.className}</span> : <span className="muted">–</span>}</td>
                  <td>{isStudent ? planBadge(u.plan, u.planExpiresAt) : <span className="muted">–</span>}</td>
                  <td>{statusBadge(u.isBanned)}</td>
                  <td>
                    {u.studyReminderCount > 0
                      ? <span className={`badge ${u.studyReminderCount >= 3 ? 'badge-red' : 'badge-gray'}`}>{u.studyReminderCount >= 3 ? '⚠️ ' : ''}{u.studyReminderCount} lần</span>
                      : <span className="muted">–</span>}
                  </td>
                  <td style={{ fontSize: 12, color: ls.color, whiteSpace: 'nowrap' }}>{ls.text}</td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(u.createdAt).split(' ')[0]}</td>
                  <td>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      {isStudent
                        ? <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/students/${u._id}`)}>Hồ sơ</button>
                        : isAdmin && <button className="btn btn-ghost btn-sm" onClick={() => setEditId(u._id)}>Sửa</button>}
                      <RowMenu
                        label={`Thao tác với ${u.username}`}
                        items={[
                          { label: '✏️ Sửa thông tin', onClick: () => setEditId(u._id), hidden: !isAdmin || !isStudent },
                          { label: '⭐ Quản lý gói', onClick: () => setPlanUser(u), hidden: !isAdmin || !isStudent },
                          { label: '🔔 Nhắc nhở học tập', onClick: () => setRemindUser(u), hidden: !isStudent },
                          { label: '🧹 Xoá cảnh báo nhắc nhở', onClick: () => resetReminders(u), hidden: !(u.studyReminderCount > 0) },
                          { label: '✉️ Gửi tin nhắn', onClick: () => navigate(`/messages?to=${u._id}`) },
                          'sep',
                          { label: u.isBanned ? '✅ Bỏ cấm' : '🚫 Cấm tài khoản', onClick: () => toggleBan(u), hidden: !isAdmin, danger: !u.isBanned },
                          { label: '🗑 Xoá vĩnh viễn', onClick: () => deleteUser(u), hidden: !isAdmin, danger: true },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </TableBody>
        </table>
      </div>
      <Pagination page={page} total={total} pageSize={PAGE} onPage={p => update({ page: p > 1 ? String(p) : '' }, { resetPage: false })} />
    </>
  );
}
