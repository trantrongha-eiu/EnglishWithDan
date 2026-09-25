import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/ui/Modal';
import { planBadge } from '../../components/ui/badges';
import { daysUntil } from '../../utils/format';

// User-management dialogs, shared by Users.jsx (table rows) and
// StudentDetail.jsx (profile header actions) — moved here from Users.jsx
// so the profile page can act on a student without bouncing back to the
// list. Same endpoints and behaviour as before; now on the accessible
// Modal shell (Esc to close, focus trap, labelled dialog).

const PLAN_OPTIONS = [
  { months: 1,  label: '1 tháng',  price: '90.000 ₫' },
  { months: 3,  label: '3 tháng',  price: '250.000 ₫' },
  { months: 6,  label: '6 tháng',  price: '500.000 ₫' },
  { months: 12, label: '1 năm',    price: '900.000 ₫', badge: 'Tiết kiệm' },
  { months: 36, label: '3 năm',    price: '2.500.000 ₫', badge: 'Tiết kiệm nhất' },
];

export function PlanModal({ user, onClose, onSaved }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const exp = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const days = daysUntil(exp);

  async function setPlan(plan, months) {
    setLoading(true);
    try {
      await apiFetch(`/admin/users/${user._id}/plan`, { method: 'PUT', body: JSON.stringify({ plan, months }) });
      const label = PLAN_OPTIONS.find(o => o.months === months)?.label || `${months} tháng`;
      toast(plan === 'premium' ? `Đã nâng ${user.username} lên Premium (${label})` : `Đã hạ ${user.username} về Free`);
      onSaved?.();
      onClose();
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={`Gói dịch vụ — ${user.username}`} onClose={onClose} width={440} busy={loading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: exp ? 4 : 0 }}>
            <span style={{ color: 'var(--text2)' }}>Gói hiện tại:</span>
            {planBadge(user.plan, user.planExpiresAt)}
          </div>
          {exp && (
            <div style={{ fontSize: 12, color: days !== null && days <= 7 ? 'var(--yellow)' : 'var(--text2)' }}>
              HSD: {exp.toLocaleDateString('vi-VN')}
              {days !== null && days > 0 && ` — còn ${days} ngày`}
              {days !== null && days <= 0 && ' — Đã hết hạn'}
            </div>
          )}
        </div>
        <div className="form-label" style={{ marginBottom: -4 }}>Cấp Premium (cộng thêm từ ngày hết hạn hiện tại)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {PLAN_OPTIONS.map(o => (
            <button key={o.months} type="button" className="btn btn-soft" disabled={loading} onClick={() => setPlan('premium', o.months)}
              style={{ position: 'relative', padding: '10px 12px', justifyContent: 'flex-start', textAlign: 'left', lineHeight: 1.4, flexDirection: 'column', alignItems: 'flex-start' }}>
              {o.badge && (
                <span style={{ position: 'absolute', top: -8, right: 8, background: 'var(--yellow)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                  {o.badge}
                </span>
              )}
              <span style={{ fontWeight: 700 }}>⭐ {o.label}</span>
              <span style={{ fontSize: 12, opacity: .8 }}>{o.price}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-danger" disabled={loading} onClick={() => setPlan('free', 0)} style={{ marginTop: 4 }}>
          🔽 Hạ về Free ngay
        </button>
      </div>
    </Modal>
  );
}

export function RemindModal({ user, onClose, onSaved }) {
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    try {
      const d = await apiFetch(`/admin/users/${user._id}/remind`, { method: 'POST', body: JSON.stringify({ message }) });
      toast(`Đã nhắc nhở ${user.username} (lần thứ ${d.studyReminderCount})`);
      onSaved?.();
      onClose();
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <Modal
      title={`🔔 Nhắc nhở học tập — ${user.username}`}
      onClose={onClose}
      width={480}
      busy={loading}
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Huỷ</button>
        <button type="button" className="btn btn-primary" onClick={send} disabled={loading}>{loading ? 'Đang gửi...' : '📤 Gửi nhắc nhở'}</button>
      </>}
    >
      <p style={{ fontSize: 13, color: 'var(--text2)', margin: '0 0 14px' }}>
        Gửi tin nhắn nhắc nhở về việc học từ vựng / làm bài tập chưa đầy đủ. Từ 3 lần trở lên, học sinh sẽ thấy cảnh báo nổi bật trên mọi trang.
      </p>
      <label className="form-label" htmlFor="remind-msg">Nội dung (để trống dùng mặc định)</label>
      <textarea id="remind-msg" className="form-input" rows={4} value={message} onChange={e => setMessage(e.target.value)}
        placeholder="Để trống để dùng nội dung mặc định..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
    </Modal>
  );
}

export function CreateUserModal({ onClose, onSaved }) {
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
      onSaved?.();
      onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <Modal title="Tạo tài khoản mới" onClose={onClose} width={520} busy={loading}>
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="cu-first">Họ</label>
            <input id="cu-first" className="form-input" value={form.firstName} onChange={set('firstName')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cu-last">Tên</label>
            <input id="cu-last" className="form-input" value={form.lastName} onChange={set('lastName')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cu-username">Username <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input id="cu-username" className="form-input" value={form.username} onChange={set('username')} required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cu-email">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input id="cu-email" className="form-input" type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cu-pass">Mật khẩu <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input id="cu-pass" className="form-input" type="password" value={form.password} onChange={set('password')} required placeholder="Tối thiểu 6 ký tự" minLength={6} autoComplete="new-password" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cu-role">Vai trò</label>
          <select id="cu-role" className="form-input" value={form.role} onChange={set('role')}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Huỷ</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang tạo...' : '+ Tạo tài khoản'}</button>
        </div>
      </form>
    </Modal>
  );
}

// Mirrors frontend/profile.html's compressImage() — resize to maxSize on
// the longest edge and re-encode as JPEG so the base64 payload stays small
// before it's sent to the avatar upload endpoint.
function compressImage(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = e => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
          else { width = Math.round(width * maxSize / height); height = maxSize; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const MAX_AVATAR_BYTES = 20 * 1024 * 1024; // 20MB — sanity cap before compression

export function EditUserModal({ userId, onClose, onSaved }) {
  const toast = useToast();
  const { isAdmin, user: me } = useAuth();
  const isSelf = me?._id === userId || me?.id === userId;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    apiFetch(`/admin/users/${userId}`).then(d => {
      const u = d.user;
      setForm({ username: u.username || '', email: u.email || '', role: u.role || 'student', firstName: u.firstName || '', lastName: u.lastName || '', className: u.className || '', isBanned: !!u.isBanned, newPassword: '', avatar: u.avatar || '' });
    }).catch(e => { toast(e.message, 'error'); onClose(); });
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function pickAvatar(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Vui lòng chọn file ảnh', 'error'); return; }
    if (file.size > MAX_AVATAR_BYTES) { toast('Ảnh quá lớn, vui lòng chọn ảnh dưới 20MB', 'error'); return; }
    setAvatarBusy(true);
    try {
      const imageBase64 = await compressImage(file, 600, 0.85);
      const d = await apiFetch(`/admin/users/${userId}/avatar`, { method: 'POST', body: JSON.stringify({ imageBase64 }) });
      setForm(f => ({ ...f, avatar: d.user.avatar || '' }));
      toast('Đã cập nhật avatar');
      onSaved?.();
    } catch (err) { toast(err.message, 'error'); }
    finally { setAvatarBusy(false); }
  }

  async function removeAvatar() {
    setAvatarBusy(true);
    try {
      await apiFetch(`/admin/users/${userId}/avatar`, { method: 'DELETE' });
      setForm(f => ({ ...f, avatar: '' }));
      toast('Đã xóa avatar');
      onSaved?.();
    } catch (err) { toast(err.message, 'error'); }
    finally { setAvatarBusy(false); }
  }

  async function save(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { ...form };
      delete body.avatar;
      if (!body.newPassword) delete body.newPassword;
      await apiFetch(`/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(body) });
      toast('Đã cập nhật người dùng');
      onSaved?.();
      onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <Modal title="Chỉnh sửa người dùng" onClose={onClose} width={520} busy={loading}>
      {!form ? <div className="state-loading">Đang tải…</div> : (
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div className="avatar-sm profile-avatar">
                {form.avatar ? <img src={form.avatar} alt="" /> : (form.username || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="btn btn-ghost btn-sm" style={{ cursor: avatarBusy ? 'default' : 'pointer', opacity: avatarBusy ? .6 : 1 }}>
                  {avatarBusy ? 'Đang xử lý...' : '📷 Đổi avatar'}
                  <input type="file" accept="image/*" onChange={pickAvatar} disabled={avatarBusy} style={{ display: 'none' }} />
                </label>
                {form.avatar && (
                  <button type="button" className="btn btn-ghost btn-sm" disabled={avatarBusy} style={{ color: 'var(--danger)' }} onClick={removeAvatar}>
                    🗑 Xóa avatar
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="eu-username">Username</label>
            <input id="eu-username" className="form-input" value={form.username} onChange={set('username')} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="eu-email">Email</label>
            <input id="eu-email" className="form-input" type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="eu-first">Họ</label>
              <input id="eu-first" className="form-input" value={form.firstName} onChange={set('firstName')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="eu-last">Tên</label>
              <input id="eu-last" className="form-input" value={form.lastName} onChange={set('lastName')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="eu-class">Lớp (dùng để lọc bài Quiz từ vựng phù hợp)</label>
            <input id="eu-class" className="form-input" placeholder="VD: 6, 6.5, 7..." value={form.className} onChange={set('className')} />
          </div>
          {isAdmin && (
            <div className="form-group">
              <label className="form-label" htmlFor="eu-role">Vai trò</label>
              <select id="eu-role" className="form-input" value={form.role} onChange={set('role')} disabled={isSelf}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
              {isSelf && <div className="form-hint">Không thể tự đổi vai trò của chính mình.</div>}
            </div>
          )}
          {isAdmin && (
            <div className="form-group">
              <label className="form-label" htmlFor="eu-pass">Mật khẩu mới (để trống = giữ nguyên)</label>
              <input id="eu-pass" className="form-input" type="password" value={form.newPassword} onChange={set('newPassword')} placeholder="••••••••" autoComplete="new-password" />
            </div>
          )}
          {isAdmin && !isSelf && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)', marginBottom: 8 }}>
              <input type="checkbox" checked={form.isBanned} onChange={set('isBanned')} />
              Tài khoản bị cấm
            </label>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
