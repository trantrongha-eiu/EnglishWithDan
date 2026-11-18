import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import Modal, { ConfirmDialog } from '../../components/Modal';

// 🔥 "Các từ hay sai của bạn" — words answered wrong ≥ 3 times in any
// practice (POST /difficult-words/report at session end). Port of
// dashboard.js openDifficultWordsModal: edit meaning (PATCH), remove
// (DELETE), "Bắt đầu ôn lại" → /dashboard/practice?src=difficult.
// onCount(n) keeps the sidebar badge in step.

function Item({ w, onSaved, onDelete }) {
  const toast = useToast();
  const [draft, setDraft] = useState(null); // null = not editing
  async function save() {
    const meaning = draft.trim();
    try {
      await apiFetch(`/difficult-words/${w._id}`, { method: 'PATCH', body: JSON.stringify({ meaning }) });
      onSaved({ ...w, meaning });
      setDraft(null);
      toast('Đã cập nhật', 'success');
    } catch { toast('Lỗi khi lưu', 'error'); }
  }
  return (
    <div className="dw-item">
      <div className="dw-item-header">
        <div style={{ minWidth: 0 }}>
          <span className="dw-word">{w.word}</span>
          {w.phonetic && <span className="dw-phonetic"> {w.phonetic}</span>}
          {w.partOfSpeech && <span className="dw-pos"> · {w.partOfSpeech}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span className="dw-wrong-badge">🔥 {w.wrongCount} lần</span>
          <div className="dw-actions">
            <button className="dw-btn-edit" onClick={() => setDraft(w.meaning || '')} title="Chỉnh sửa nghĩa" aria-label={`Sửa nghĩa ${w.word}`}><i className="fas fa-pen" /></button>
            <button className="dw-btn-del" onClick={() => onDelete(w)} title="Xóa khỏi danh sách" aria-label={`Xóa ${w.word}`}><i className="fas fa-trash-alt" /></button>
          </div>
        </div>
      </div>
      <div className="dw-meaning">{w.meaning || <em style={{ color: 'var(--text3)' }}>Chưa có nghĩa</em>}</div>
      {w.example && <div className="dw-example">{w.example}</div>}
      {w.source && <div className="dw-source"><i className="fas fa-tag" style={{ fontSize: 10 }} /> {w.source}</div>}
      {draft !== null && (
        <div className="dw-edit-form">
          <input className="dw-edit-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nhập nghĩa của từ..." autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') save(); }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button className="btn-primary" style={{ fontSize: 12, padding: '5px 14px' }} onClick={save}>Lưu</button>
            <button className="btn-outline" style={{ fontSize: 12, padding: '5px 14px' }} onClick={() => setDraft(null)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DifficultWordsModal({ onClose, onCount }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [words, setWords] = useState(null);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    let alive = true;
    apiFetch('/difficult-words')
      .then(d => { if (alive) { setWords(d.words || []); onCount?.((d.words || []).length); } })
      .catch(err => { if (alive) setError(err); });
    return () => { alive = false; };
  }, [onCount]);

  async function remove(w) {
    try {
      await apiFetch(`/difficult-words/${w._id}`, { method: 'DELETE' });
      const rest = words.filter(x => x._id !== w._id);
      setWords(rest);
      onCount?.(rest.length);
      toast('Đã xóa', 'success');
    } catch { toast('Lỗi khi xóa', 'error'); }
  }

  const locked = error?.body?.requiresPremium;
  return (
    <Modal
      size="modal-md"
      onClose={onClose}
      title={<>🔥 Các từ hay sai của bạn {words?.length ? <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>({words.length} từ)</span> : null}</>}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
        {words?.length > 0 && (
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => { onClose(); navigate('/dashboard/practice?src=difficult&mode=mixed'); }}>
            <i className="fas fa-play" /> Bắt đầu ôn lại
          </button>
        )}
      </>}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {!words && !error && <div style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}><i className="fas fa-spinner fa-spin" /> Đang tải...</div>}
        {error && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>
            {locked ? <>Danh sách từ hay sai là tính năng Premium. <a href="/dashboard.html">Xem gói Premium</a></> : 'Không thể tải danh sách. Vui lòng thử lại.'}
          </div>
        )}
        {words?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>Chưa có từ nào trong danh sách!</p>
            <p style={{ fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>Từ sẽ được thêm tự động khi bạn trả lời sai từ đó<br />từ 3 lần trở lên trong bất kỳ session luyện tập nào.</p>
          </div>
        )}
        {words?.map(w => (
          <Item key={w._id} w={w}
            onSaved={(nw) => setWords(ws => ws.map(x => (x._id === nw._id ? nw : x)))}
            onDelete={(x) => setConfirm(x)} />
        ))}
      </div>
      {confirm && (
        <ConfirmDialog
          title="Xóa khỏi danh sách"
          message="Bạn đã nhớ từ này rồi và muốn xóa khỏi danh sách hay sai?"
          confirmLabel="Xóa"
          onConfirm={() => remove(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </Modal>
  );
}
