import { useState } from 'react';
import { apiFetch, FRONTEND_URL } from '../../utils/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../components/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import { ErrorState, Skeleton } from '../../components/ui/States';
import { formatLastSeen } from '../../utils/format';

// "Phụ huynh" panel on Chi tiết học sinh — backend routes/admin/parents.js.
// A teacher manages parents of students in their own classes, an admin of
// anyone. The starting password is the parent's phone number (same as the
// login), shown with a ready-to-paste Zalo message; the parent must change it
// on first login (parent.html).

const RELATION_LABEL = { mother: 'Mẹ', father: 'Bố', other: 'Người giám hộ' };
const PARENT_URL = `${FRONTEND_URL}/phu-huynh`;

function credentialsMessage({ studentName, phone, password }) {
  return [
    `Kính gửi Quý phụ huynh của ${studentName},`,
    `Trung tâm gửi tài khoản để phụ huynh theo dõi việc học của con (điểm danh, bài tập, điểm số, học phí):`,
    `- Đăng nhập: ${PARENT_URL}`,
    `- Tài khoản: ${phone}`,
    `- Mật khẩu: ${password} (chính là số điện thoại của phụ huynh)`,
    `Lần đầu đăng nhập, hệ thống sẽ yêu cầu phụ huynh đặt mật khẩu mới.`,
  ].join('\n');
}

function CredentialsModal({ info, onClose }) {
  const toast = useToast();
  const text = credentialsMessage(info);
  async function copy() {
    try { await navigator.clipboard.writeText(text); toast('Đã copy tin nhắn'); }
    catch { toast('Không copy được — hãy bôi đen và copy thủ công', 'error'); }
  }
  return (
    <Modal title="Thông tin đăng nhập phụ huynh" onClose={onClose} width={480}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Đóng</button><button className="btn btn-primary" onClick={copy}>📋 Copy tin nhắn Zalo</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
          <div>Tài khoản: <strong>{info.phone}</strong></div>
          <div>Mật khẩu: <strong style={{ fontFamily: 'monospace', fontSize: 15 }}>{info.password}</strong> <span className="muted">(= số điện thoại)</span></div>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>Lần đầu đăng nhập phụ huynh sẽ phải đặt mật khẩu mới. Nếu phụ huynh quên mật khẩu, bấm "Đặt lại mật khẩu" để đưa về số điện thoại.</div>
        <textarea className="form-input" readOnly rows={7} value={text} style={{ fontSize: 12, resize: 'vertical' }} onFocus={e => e.target.select()} />
      </div>
    </Modal>
  );
}

function AddParentModal({ studentId, onClose, onDone }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', phone: '', relation: 'mother', email: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await apiFetch(`/admin/users/${studentId}/parents`, { method: 'POST', body: JSON.stringify(form) });
      toast(d.created ? 'Đã tạo tài khoản phụ huynh' : 'Đã liên kết với tài khoản phụ huynh có sẵn');
      onDone(d);
    } catch (err) { toast(err.message, 'error'); }
    finally { setBusy(false); }
  }

  return (
    <Modal title="Thêm phụ huynh" onClose={onClose} width={440} busy={busy}
      footer={<><button className="btn btn-ghost" type="button" onClick={onClose} disabled={busy}>Huỷ</button><button className="btn btn-primary" type="submit" form="addParentForm" disabled={busy}>{busy ? 'Đang lưu…' : 'Tạo tài khoản'}</button></>}>
      <form id="addParentForm" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="ap-phone">Số điện thoại (dùng để đăng nhập) <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input id="ap-phone" className="form-input" value={form.phone} onChange={set('phone')} placeholder="0912345678" inputMode="tel" required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="ap-name">Họ tên phụ huynh <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input id="ap-name" className="form-input" value={form.name} onChange={set('name')} placeholder="Nguyễn Thị Lan" maxLength={80} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="ap-rel">Quan hệ</label>
            <select id="ap-rel" className="form-input" value={form.relation} onChange={set('relation')}>
              <option value="mother">Mẹ</option>
              <option value="father">Bố</option>
              <option value="other">Người giám hộ</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ap-email">Email (không bắt buộc)</label>
            <input id="ap-email" className="form-input" type="email" value={form.email} onChange={set('email')} />
          </div>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>Mật khẩu ban đầu chính là số điện thoại này. Nếu số điện thoại đã là tài khoản phụ huynh (anh/chị/em học cùng trung tâm), hệ thống chỉ liên kết thêm, không tạo tài khoản mới và không đổi mật khẩu.</div>
      </form>
    </Modal>
  );
}

export default function ParentsPanel({ student }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { data, error, loading, reload } = useApi(`/admin/users/${student._id}/parents`);
  const [adding, setAdding] = useState(false);
  const [creds, setCreds] = useState(null);
  const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.username;

  function resetPassword(p) {
    confirm(`Đặt lại mật khẩu của ${p.name} về số điện thoại ${p.phone}? Phụ huynh sẽ bị đăng xuất và phải đặt mật khẩu mới khi đăng nhập lại.`, async () => {
      try {
        const d = await apiFetch(`/admin/users/${student._id}/parents/${p._id}/reset-password`, { method: 'POST' });
        setCreds({ studentName, phone: p.phone, password: d.tempPassword });
        reload();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  function unlink(p) {
    confirm(`Gỡ liên kết ${p.name} (${p.phone}) khỏi ${studentName}? Phụ huynh sẽ không xem được thông tin của học sinh này nữa.`, async () => {
      try {
        await apiFetch(`/admin/users/${student._id}/parents/${p._id}`, { method: 'DELETE' });
        toast('Đã gỡ liên kết');
        reload();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  const parents = data?.parents || [];

  return (
    <div className="panel" style={{ marginTop: 14 }}>
      {adding && (
        <AddParentModal studentId={student._id} onClose={() => setAdding(false)} onDone={(d) => {
          setAdding(false);
          reload();
          if (d.tempPassword) setCreds({ studentName, phone: d.parent.phone, password: d.tempPassword });
        }} />
      )}
      {creds && <CredentialsModal info={creds} onClose={() => setCreds(null)} />}

      <div className="panel-head" style={{ marginBottom: 8 }}>
        <div>
          <div className="panel-title">👨‍👩‍👧 Phụ huynh</div>
          <div className="panel-sub">Phụ huynh đăng nhập tại {PARENT_URL.replace(/^https?:\/\//, '')} để xem điểm danh, bài tập, điểm số và học phí của con</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>+ Thêm phụ huynh</button>
      </div>
      {loading && <Skeleton height={40} />}
      {error && <ErrorState error={error} onRetry={reload} compact />}
      {!loading && !error && parents.length === 0 && <div className="muted" style={{ fontSize: 13 }}>Chưa có phụ huynh nào được liên kết.</div>}
      {parents.map(p => {
        const ls = formatLastSeen(p.lastSeen);
        return (
          <div key={p._id} className="kv" style={{ alignItems: 'center' }}>
            <span>
              <strong>{p.name}</strong> <span className="badge badge-gray">{RELATION_LABEL[p.relation] || p.relation}</span>
              <br /><small className="muted">📞 {p.phone}{p.email ? ` · ${p.email}` : ''} · {p.lastSeen ? `Hoạt động: ${ls.text}` : 'Chưa đăng nhập'}{p.mustChangePassword ? ' · mật khẩu vẫn là số điện thoại' : ''}</small>
            </span>
            <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => resetPassword(p)}>🔑 Đặt lại mật khẩu</button>
              <button className="btn btn-ghost btn-sm" onClick={() => unlink(p)}>Gỡ liên kết</button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
