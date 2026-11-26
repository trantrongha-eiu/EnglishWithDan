import { useState } from 'react';
import Modal from '../../components/Modal';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { VOCAB_MAX_BOOKS } from '../../utils/vocab';

// "+ Tạo sổ mới" in the notebook sidebar → POST /vocabbook.
// The server caps a student at VOCAB_MAX_BOOKS books in total (Sổ 1–5
// included) and keeps "Sổ 1".."Sổ 5" for the default books.
const EMOJIS = ['📘', '📗', '📙', '📕', '📓', '📔', '📒', '🗒️', '🌟', '🎯', '🔥', '💡', '🚀', '✈️', '💼'];

export default function AddBookModal({ count, onClose, onCreated }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📘');
  const [busy, setBusy] = useState(false);
  const left = Math.max(0, VOCAB_MAX_BOOKS - count);

  async function create() {
    const n = name.trim();
    if (!n) { toast('Tên sổ không được để trống', 'error'); return; }
    setBusy(true);
    try {
      const data = await apiFetch('/vocabbook', { method: 'POST', body: JSON.stringify({ name: n, emoji, color: '#3d8bff' }) });
      toast(`Đã tạo sổ "${data.book.name}"`, 'success');
      onCreated(data.book);
    } catch (err) {
      toast(err.message || 'Không tạo được sổ', 'error');
      setBusy(false);
    }
  }

  return (
    <Modal title="Tạo sổ mới" onClose={onClose} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
      <button className="btn btn-primary" onClick={create} disabled={busy || !name.trim()}>
        {busy ? <><i className="fas fa-spinner fa-spin" /> Đang tạo...</> : 'Tạo'}
      </button>
    </>}>
      <div className="form-group">
        <label htmlFor="new-book-name">Tên sổ *</label>
        <input className="form-input" id="new-book-name" autoFocus maxLength={40} value={name}
          placeholder="vd: IELTS Academic, Du lịch..." onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !busy) create(); }} />
      </div>
      <div className="form-group">
        <label>Biểu tượng</label>
        <div className="emoji-picker">
          {EMOJIS.map(e => (
            <span key={e} role="button" tabIndex={0} className={`emoji-opt${e === emoji ? ' selected' : ''}`}
              onClick={() => setEmoji(e)} onKeyDown={(ev) => { if (ev.key === 'Enter') setEmoji(e); }}>{e}</span>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text3)', margin: '4px 0 0' }}>
        Tối đa {VOCAB_MAX_BOOKS} sổ (tính cả Sổ 1 – Sổ 5) · còn tạo được {left} sổ.
      </p>
    </Modal>
  );
}
