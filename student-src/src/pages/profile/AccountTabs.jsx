import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { ACCENTS, ACCENT_KEY, BAND_OPTIONS, BRAND_DEFAULT, applyAccent, savedAccent } from '../../utils/profile';

// Hồ sơ → Chỉnh sửa (PUT /user/profile) and Bảo mật (PUT /user/change-password).

const titled = (type, title, msg) => window.showToastWithTitle?.(type, title, msg);
const hintStyle = { color: 'var(--text-light)', fontSize: 12 };
const lockedStyle = { opacity: 0.6, cursor: 'not-allowed' };
const MSG_STYLE = {
  ok: { background: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7' },
  bad: { background: '#fce4e4', color: '#c62828', border: '1px solid #ef9a9a' },
};

// A green note clears itself after 4s; a red one stays until the next attempt
function useFormMessage() {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  function show(ok, text) {
    clearTimeout(timer.current);
    setMsg({ ok, text });
    if (ok) timer.current = setTimeout(() => setMsg(null), 4000);
  }
  return [msg, show];
}

function FormMessage({ id, msg }) {
  if (!msg) return null;
  return (
    <div id={id} style={{ display: 'block', padding: '10px 14px', borderRadius: 8, fontSize: 14, marginBottom: 12, ...MSG_STYLE[msg.ok ? 'ok' : 'bad'] }}>
      {msg.text}
    </div>
  );
}

function AccentPicker() {
  const [current, setCurrent] = useState(() => (savedAccent()?.primary || BRAND_DEFAULT).toLowerCase());
  function pick(a) {
    setCurrent(a.primary);
    applyAccent(a.primary, a.dark);
    try { localStorage.setItem(ACCENT_KEY, JSON.stringify({ primary: a.primary, dark: a.dark })); } catch { /* private mode: this page only */ }
    titled('success', 'Đã đổi màu', 'Màu chủ đề đã được cập nhật');
  }
  return (
    <div className="accent-swatches" id="accentSwatches">
      {ACCENTS.map((a) => (
        <div key={a.primary} className={`accent-swatch${a.primary === current ? ' active' : ''}`} data-primary={a.primary}
          style={{ background: a.background }} title={a.title} onClick={() => pick(a)} />
      ))}
    </div>
  );
}

export function EditTab({ active, form, setForm, onSaved }) {
  const [msg, showMsg] = useFormMessage();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    const body = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      bio: form.bio.trim(),
      studyMotto: form.studyMotto.trim(),
      targetBand: form.targetBand === '' ? null : parseFloat(form.targetBand),
      targetExamDate: form.targetExamDate === '' ? null : form.targetExamDate,
    };
    try {
      const data = await apiFetch('/user/profile', { method: 'PUT', body: JSON.stringify(body) });
      if (!data.success) { showMsg(false, data.message || 'Không lưu được thay đổi'); return; }
      showMsg(true, 'Đã lưu thay đổi thành công!');
      titled('success', 'Thành công', 'Thông tin đã được cập nhật');
      onSaved();
    } catch (err) {
      showMsg(false, err.message || 'Lỗi lưu thông tin');
    }
  }

  return (
    <div className={`tab-content${active ? ' active' : ''}`} id="tab-edit">
      <div className="card">
        <div className="card-header"><span style={{ fontWeight: 700 }}><i className="fas fa-user-edit" /> Chỉnh sửa thông tin</span></div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="editFirstName">Họ</label>
              <input className="form-control" id="editFirstName" placeholder="Nguyễn" value={form.firstName} onChange={set('firstName')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="editLastName">Tên</label>
              <input className="form-control" id="editLastName" placeholder="Văn A" value={form.lastName} onChange={set('lastName')}
                onKeyDown={(e) => { if (e.key === 'Enter') save(); }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="editUsername">Tên đăng nhập</label>
            <input className="form-control" id="editUsername" placeholder="username" disabled style={lockedStyle} value={form.username} readOnly />
            <small style={hintStyle}>Username không thể thay đổi</small>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="editEmail">Email</label>
            <input className="form-control" id="editEmail" disabled style={lockedStyle} value={form.email} readOnly />
            <small style={hintStyle}>Email không thể thay đổi</small>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="editBio">Giới thiệu bản thân</label>
            <textarea className="form-control" id="editBio" placeholder="Viết vài điều về bạn..." rows={3} maxLength={200} value={form.bio} onChange={set('bio')} />
            <small style={hintStyle}><span id="bioCount">{form.bio.length}</span>/200 ký tự</small>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="editMotto">Motto học tập <span style={{ fontWeight: 400, opacity: 0.7 }}>(tối đa 80 ký tự)</span></label>
            <input className="form-control" id="editMotto" placeholder="VD: Mỗi ngày một chút, thành công sẽ đến!" maxLength={80} value={form.studyMotto} onChange={set('studyMotto')} />
            <small style={hintStyle}><span id="mottoCount">{form.studyMotto.length}</span>/80 ký tự</small>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="editTargetBand">Mục tiêu Band Score</label>
            <select className="form-control" id="editTargetBand" value={form.targetBand} onChange={set('targetBand')}>
              <option value="">-- Chưa đặt --</option>
              {BAND_OPTIONS.map((b) => <option key={b} value={b}>Band {Number(b).toFixed(1)}</option>)}
            </select>
            <small style={hintStyle}>Hiện thị trên biểu đồ Band Score của bạn</small>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="editTargetExamDate">Ngày thi dự kiến</label>
            <input type="date" className="form-control" id="editTargetExamDate" value={form.targetExamDate} onChange={set('targetExamDate')} />
            <small style={hintStyle}>Dùng để đếm ngược và gợi ý kỹ năng cần ôn thêm</small>
          </div>
          <div className="form-group">
            <label className="form-label">Màu chủ đề cá nhân</label>
            <AccentPicker />
            <small style={hintStyle}>Đổi màu nhấn cho toàn bộ trang web — lưu trên thiết bị này</small>
          </div>
          <FormMessage id="editMsg" msg={msg} />
          <button className="btn btn-primary" onClick={save}><i className="fas fa-save" /> Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
}

export function SecurityTab({ active, hasPassword, onPasswordSet, onLogout }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, showMsg] = useFormMessage();
  const newRef = useRef(null);
  const confirmRef = useRef(null);
  const label = hasPassword ? 'Đổi mật khẩu' : 'Đặt mật khẩu';

  async function submit() {
    if (hasPassword && !current) { showMsg(false, 'Vui lòng nhập mật khẩu hiện tại'); return; }
    if (next.length < 8) { showMsg(false, 'Mật khẩu phải có ít nhất 8 ký tự'); return; }
    if (next !== confirm) { showMsg(false, 'Mật khẩu xác nhận không khớp'); return; }
    const body = hasPassword ? { currentPassword: current, newPassword: next } : { newPassword: next };
    try {
      const data = await apiFetch('/user/change-password', { method: 'PUT', body: JSON.stringify(body) });
      // The change revokes every older token, including this tab's
      if (data.token) window.AuthService?.setToken(data.token);
      showMsg(true, data.message || 'Đổi mật khẩu thành công');
      titled('success', 'Thành công', hasPassword ? 'Mật khẩu đã được đổi' : 'Đã đặt mật khẩu — giờ bạn đăng nhập được bằng email + mật khẩu');
      if (!hasPassword) onPasswordSet();
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      showMsg(false, err.message || 'Không kết nối được server');
    }
  }

  return (
    <div className={`tab-content${active ? ' active' : ''}`} id="tab-security">
      <div className="card">
        <div className="card-header"><span style={{ fontWeight: 700 }}><i className="fas fa-shield-alt" /> <span id="secTitle">{label}</span></span></div>
        <div className="card-body">
          {!hasPassword && (
            <p id="secSocialNote" style={{ fontSize: 14, color: 'var(--text-light)', margin: '0 0 14px' }}>
              Tài khoản của bạn đăng nhập bằng Google/Facebook nên chưa có mật khẩu. Đặt một mật khẩu để đăng nhập được cả bằng email + mật khẩu.
            </p>
          )}
          {hasPassword && (
            <div className="form-group">
              <label className="form-label" htmlFor="secCurrentPass">Mật khẩu hiện tại</label>
              <input className="form-control" type="password" id="secCurrentPass" placeholder="Nhập mật khẩu hiện tại" value={current}
                onChange={(e) => setCurrent(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') newRef.current?.focus(); }} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="secNewPass">Mật khẩu mới</label>
            <input ref={newRef} className="form-control" type="password" id="secNewPass" placeholder="Ít nhất 8 ký tự" minLength={8} value={next}
              onChange={(e) => setNext(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') confirmRef.current?.focus(); }} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="secConfirmPass">Xác nhận mật khẩu mới</label>
            <input ref={confirmRef} className="form-control" type="password" id="secConfirmPass" placeholder="Nhập lại mật khẩu mới" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
          </div>
          <FormMessage id="secMsg" msg={msg} />
          <button className="btn btn-primary" onClick={submit}><i className="fas fa-key" /> <span id="secBtnLabel">{label}</span></button>
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-header"><span style={{ fontWeight: 700 }}><i className="fas fa-sign-out-alt" /> Phiên đăng nhập</span></div>
        <div className="card-body">
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 16 }}>Đăng xuất khỏi tài khoản trên thiết bị này.</p>
          <button className="btn btn-danger" onClick={onLogout}><i className="fas fa-sign-out-alt" /> Đăng xuất</button>
        </div>
      </div>
    </div>
  );
}
