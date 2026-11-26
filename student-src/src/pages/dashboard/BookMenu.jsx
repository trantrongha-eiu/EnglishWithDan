import { useState } from 'react';
import Modal, { ConfirmDialog } from '../../components/Modal';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { VOCAB_BOOK_MAX_WORDS } from '../../utils/vocab';

// Notebook "⋯" menu — port of dashboard.js openBookMenu & co.
// Sổ 1–5 (isDefault) are fixed: no rename / merge / delete. Own books
// (created from the sidebar "+", ≤ 10 in total) can be all of those.
//   view: 'menu' | 'move' | 'merge' | 'delete'
export default function BookMenu({ book, books, initialView = 'menu', onClose, onRename, onChanged }) {
  const toast = useToast();
  const [view, setView] = useState(initialView);
  const [dest, setDest] = useState(null);
  const [mergeIds, setMergeIds] = useState(() => new Set());
  const [busy, setBusy] = useState(false);
  const others = (books || []).filter(b => b._id !== book._id);
  const canMove = (book.totalWords ?? book.words?.length ?? 0) > 0 && others.length > 0;
  const total = book.totalWords ?? book.words?.length ?? 0;
  // Sổ 1–5 and "📚 Từ của lớp" (homework word lists) are fixed
  const fixed = !!(book.isDefault || book.classBook);

  async function move() {
    if (!dest) return;
    setBusy(true);
    try {
      const data = await apiFetch(`/vocabbook/${book._id}/move-words`, { method: 'POST', body: JSON.stringify({ destId: dest }) });
      toast(data.message || 'Đã chuyển từ', 'success');
      onChanged({ type: 'move', srcId: book._id, destId: dest });
      onClose();
    } catch (err) {
      toast(err.message || 'Lỗi khi chuyển từ', 'error');
    } finally { setBusy(false); }
  }

  async function merge() {
    const ids = [...mergeIds];
    if (!ids.length) { toast('Vui lòng chọn ít nhất 1 sổ', 'error'); return; }
    setBusy(true);
    try {
      const data = await apiFetch(`/vocabbook/${book._id}/merge`, { method: 'POST', body: JSON.stringify({ sourceIds: ids }) });
      toast(`Đã gộp ${data.mergedCount} sổ · thêm ${data.addedCount} từ mới vào "${book.name}"`, 'success');
      onChanged({ type: 'merge', destId: book._id, removedIds: ids });
      onClose();
    } catch (err) {
      toast(err.message || 'Lỗi khi gộp sổ', 'error');
    } finally { setBusy(false); }
  }

  async function remove() {
    try {
      await apiFetch(`/vocabbook/${book._id}`, { method: 'DELETE' });
      toast('Đã xóa sổ', 'success');
      onChanged({ type: 'delete', removedIds: [book._id] });
    } catch (err) {
      toast(err.message || 'Xóa thất bại', 'error');
    }
  }

  if (view === 'delete') {
    return (
      <ConfirmDialog title="Xóa sổ" message={`Xóa sổ "${book.name}"? Tất cả từ trong sổ sẽ bị mất.`}
        onConfirm={remove} onClose={onClose} />
    );
  }

  if (view === 'move') {
    return (
      <Modal title={`Chuyển toàn bộ từ của "${book.name}"`} size="modal-md" onClose={onClose} footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
        <button className="btn btn-primary" onClick={move} disabled={!dest || busy}>
          {busy ? <><i className="fas fa-spinner fa-spin" /> Đang chuyển...</> : <><i className="fas fa-share-square" /> Chuyển</>}
        </button>
      </>}>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
          Chuyển <strong>{total}</strong> từ của <strong>“{book.name}”</strong> sang sổ:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {others.map(b => {
            const room = Math.max(0, VOCAB_BOOK_MAX_WORDS - (b.totalWords || 0));
            const full = room === 0;
            return (
              <label key={b._id} className={`merge-book-item${dest === b._id ? ' selected' : ''}`} style={full ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}>
                <input type="radio" name="move-dest" value={b._id} disabled={full} checked={dest === b._id} onChange={() => setDest(b._id)} />
                <span style={{ fontSize: 18 }}>{b.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</span>
                <span className="merge-book-meta">
                  {b.totalWords} / {VOCAB_BOOK_MAX_WORDS} từ{full ? ' · đầy' : room < total ? ` · còn chỗ ${room}` : ''}
                </span>
              </label>
            );
          })}
        </div>
        <div className="move-words-note">
          <i className="fas fa-info-circle" /> Từ giữ nguyên trạng thái ghi nhớ &amp; lịch ôn. Từ đã có sẵn ở sổ đích sẽ không bị nhân đôi.
          Sổ đích tối đa {VOCAB_BOOK_MAX_WORDS} từ — phần không vừa sẽ ở lại sổ hiện tại.
        </div>
      </Modal>
    );
  }

  if (view === 'merge') {
    const candidates = others.filter(b => !b.isDefault && !b.classBook);
    return (
      <Modal title={`Gộp sổ vào "${book.name}"`} size="modal-md" onClose={onClose} footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
        {candidates.length > 0 && (
          <button className="btn btn-primary" onClick={merge} disabled={busy}>
            {busy ? <><i className="fas fa-spinner fa-spin" /> Đang gộp...</> : <><i className="fas fa-object-group" /> Xác nhận gộp</>}
          </button>
        )}
      </>}>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>Chọn các sổ muốn gộp vào <strong>“{book.name}”</strong>:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {!candidates.length && (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)', fontSize: 13 }}>
              Không có sổ nào khác để gộp.<br />
              <span style={{ fontSize: 12 }}>(Chỉ có thể gộp sổ do bạn tự tạo, không phải 5 sổ mặc định hay sổ Từ của lớp.)</span>
            </div>
          )}
          {candidates.map(b => (
            <label key={b._id} className={`merge-book-item${mergeIds.has(b._id) ? ' selected' : ''}`}>
              <input type="checkbox" checked={mergeIds.has(b._id)} onChange={(e) => setMergeIds(s => {
                const n = new Set(s); if (e.target.checked) n.add(b._id); else n.delete(b._id); return n;
              })} />
              <span style={{ fontSize: 18 }}>{b.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</span>
              <span className="merge-book-meta">{b.totalWords} từ</span>
            </label>
          ))}
        </div>
        <div className="move-words-note">
          <i className="fas fa-info-circle" /> Từ trùng sẽ không được thêm lại. Các sổ được chọn sẽ bị <strong>xóa vĩnh viễn</strong> sau khi gộp.
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`${book.emoji || '📘'} ${book.name}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!fixed && (
          <button className="book-action-btn" onClick={() => { onClose(); onRename(); }}>
            <i className="fas fa-pen" style={{ width: 16, color: 'var(--blue)' }} /> Đổi tên sổ
          </button>
        )}
        {canMove && (
          <button className="book-action-btn" onClick={() => setView('move')}>
            <i className="fas fa-share-square" style={{ width: 16, color: '#0891b2' }} /> Chuyển toàn bộ từ sang sổ khác
          </button>
        )}
        {!fixed && (
          <>
            <button className="book-action-btn" onClick={() => setView('merge')}>
              <i className="fas fa-object-group" style={{ width: 16, color: '#7c3aed' }} /> Gộp sổ
            </button>
            <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
            <button className="book-action-btn book-action-danger" onClick={() => setView('delete')}>
              <i className="fas fa-trash-alt" style={{ width: 16 }} /> Xóa sổ
            </button>
          </>
        )}
        {fixed && !canMove && (
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>
            {book.classBook ? 'Sổ chứa các bộ từ giáo viên giao — không đổi tên, gộp hay xoá được.' : 'Sổ mặc định (Sổ 1–5) không đổi tên, gộp hay xoá được.'}
          </p>
        )}
      </div>
    </Modal>
  );
}
