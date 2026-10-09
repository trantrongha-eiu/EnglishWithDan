import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

// Class page "✉️ Nhắn tin": POST /classes/:id/messages — one private message
// per recipient (backend classMessageService). The student sees a "Bạn có
// tin nhắn mới" popup on every page until they open it in their inbox.
export default function ClassMessageModal({ cls, recipients, onClose, onSent }) {
  const toast = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  async function send() {
    if (!body.trim()) { toast('Nội dung không được để trống', 'error'); return; }
    setSending(true);
    try {
      const d = await apiFetch(`/classes/${cls._id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ studentIds: recipients.map((r) => r.studentId), subject, body }),
      });
      toast(`Đã gửi tin nhắn cho ${d.sent} học viên`);
      onSent?.();
      onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSending(false); }
  }

  const names = recipients.map((r) => r.student.name || r.student.username);
  return (
    <Modal
      title={recipients.length === 1 ? `✉️ Nhắn tin cho ${names[0]}` : `✉️ Nhắn tin cho ${recipients.length} học viên`}
      onClose={onClose}
      busy={sending}
      width={560}
      footer={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={sending}>Huỷ</button>
          <button type="button" className="btn btn-primary" onClick={send} disabled={sending || !body.trim()}>
            {sending ? 'Đang gửi…' : 'Gửi'}
          </button>
        </>
      )}
    >
      {recipients.length > 1 && (
        <div style={{ fontSize: 12.5, color: 'var(--text3)', marginBottom: 12 }}>
          Mỗi học viên nhận một tin nhắn riêng: {names.join(', ')}
        </div>
      )}
      <div className="form-group">
        <label className="form-label">Tiêu đề</label>
        <input className="form-input" value={subject} maxLength={200}
          placeholder={`Tin nhắn từ lớp ${cls.name}`} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Nội dung</label>
        <textarea className="form-input" rows={6} value={body} maxLength={5000} autoFocus
          placeholder="Nội dung tin nhắn…" onChange={(e) => setBody(e.target.value)} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)' }}>
        📩 Học viên sẽ thấy popup “Bạn có tin nhắn mới” mỗi lần mở web cho đến khi bấm vào đọc.
      </div>
    </Modal>
  );
}
