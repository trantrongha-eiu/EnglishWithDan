import { useRef, useState } from 'react';
import Modal from '../../components/Modal';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { fetchWordInfo, fetchAiExamples } from '../../utils/wordLookup';

// "word: nghĩa" · "word - nghĩa" · "word<TAB>nghĩa" · "word"
function parseBulkLines(raw) {
  const out = [];
  for (const line of raw.split('\n').map(l => l.trim()).filter(Boolean)) {
    let word = line, meaning = '';
    const colon = line.indexOf(':');
    const dash = line.indexOf(' - ');
    const tab = line.indexOf('\t');
    if (colon > 0) { word = line.slice(0, colon); meaning = line.slice(colon + 1); }
    else if (dash > 0) { word = line.slice(0, dash); meaning = line.slice(dash + 3); }
    else if (tab > 0) { word = line.slice(0, tab); meaning = line.slice(tab + 1); }
    word = word.trim();
    if (word) out.push({ word, meaning: meaning.trim() });
  }
  return out;
}

// Paste a list → preview with auto examples (cached AI first, dictionary
// fallback) + phonetic → POST /vocabbook/:id/words/bulk.
export default function BulkImportModal({ book, onClose, onSaved }) {
  const toast = useToast();
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');
  const [rows, setRows] = useState(null); // step 2 when set
  const [saving, setSaving] = useState(false);
  const run = useRef(0);

  const patchRow = (id, i, patch) => {
    if (id !== run.current) return;
    setRows(rs => rs && rs.map((r, j) => {
      if (j !== i) return r;
      const n = { ...r, ...patch };
      n.example = n.aiExample || n.dictExample || ''; // AI sentence wins
      return n;
    }));
  };

  function preview() {
    const parsed = parseBulkLines(raw);
    if (!raw.trim()) { setError('Vui lòng nhập ít nhất một từ.'); return; }
    if (!parsed.length) { setError('Không tìm thấy từ nào hợp lệ.'); return; }
    setError('');
    const existing = new Set((book.words || []).map(w => w.word.toLowerCase().trim()));
    const seen = new Set();
    const next = parsed.map(p => {
      const key = p.word.toLowerCase();
      const dup = existing.has(key) || seen.has(key);
      seen.add(key);
      return { ...p, phonetic: '', partOfSpeech: '', example: '', dictLoading: !dup, aiLoading: !dup, dup, selected: !dup };
    });
    setRows(next);
    const id = ++run.current;

    next.forEach((r, i) => {
      if (r.dup) return;
      fetchWordInfo(r.word)
        .then(info => patchRow(id, i, { phonetic: info.phonetic, partOfSpeech: info.partOfSpeech, dictExample: info.example, dictLoading: false }))
        .catch(() => patchRow(id, i, { dictLoading: false }));
    });
    fetchAiExamples(next.filter(r => !r.dup).map(r => r.word)).then(map => {
      next.forEach((r, i) => { if (!r.dup) patchRow(id, i, { aiExample: map[r.word.toLowerCase()] || '', aiLoading: false }); });
    });
  }

  async function confirm() {
    const toAdd = rows.filter(r => r.selected && !r.dup)
      .map(({ word, meaning, example, phonetic, partOfSpeech }) => ({ word, meaning, example, phonetic, partOfSpeech }));
    if (!toAdd.length) { toast('Không có từ nào được chọn', 'error'); return; }
    setSaving(true);
    try {
      const data = await apiFetch(`/vocabbook/${book._id}/words/bulk`, { method: 'POST', body: JSON.stringify({ words: toAdd }) });
      toast(data.message || `Đã thêm ${toAdd.length} từ`, 'success');
      onSaved();
      onClose();
    } catch (err) {
      toast(err.message || 'Lỗi kết nối', 'error');
    } finally {
      setSaving(false);
    }
  }

  const title = <><i className="fas fa-file-import" /> Nhập hàng loạt</>;

  if (!rows) {
    return (
      <Modal title={title} size="modal-bulk" onClose={onClose} footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
        <button className="btn btn-primary" onClick={preview}><i className="fas fa-arrow-right" /> Xem trước &amp; thêm ví dụ</button>
      </>}>
        <p className="bulk-hint">
          Mỗi dòng một từ. Hỗ trợ định dạng:<br />
          <code>word: nghĩa</code> &nbsp;·&nbsp; <code>word - nghĩa</code> &nbsp;·&nbsp; <code>word&nbsp;&nbsp;nghĩa</code> (tab)
        </p>
        <textarea className="bulk-textarea" rows={10} value={raw} autoFocus aria-label="Danh sách từ"
          placeholder={'abandon: từ bỏ\nacquire: có được, đạt được\nbeneficial - có lợi\nconsequence\thậu quả'}
          onChange={(e) => setRaw(e.target.value)} />
        {error && <div className="bulk-parse-error">{error}</div>}
      </Modal>
    );
  }

  const dups = rows.filter(r => r.dup).length;
  const selectable = rows.filter(r => !r.dup);
  const selected = rows.filter(r => r.selected).length;
  const allOn = selectable.length > 0 && selectable.every(r => r.selected);
  const toggle = (i, on) => setRows(rs => rs.map((r, j) => (j === i ? { ...r, selected: on } : r)));
  const toggleAll = (on) => setRows(rs => rs.map(r => (r.dup ? r : { ...r, selected: on })));

  return (
    <Modal title={title} size="modal-bulk" onClose={onClose} footer={<>
      <button className="btn btn-ghost" onClick={() => { run.current++; setRows(null); }}><i className="fas fa-arrow-left" /> Quay lại</button>
      <button className="btn btn-primary" onClick={confirm} disabled={saving || !selected}>
        {saving ? <><span className="bulk-spinner" /> Đang thêm…</> : <><i className="fas fa-plus" /> Thêm vào sổ</>}
      </button>
    </>}>
      <div className="bulk-step2-info">
        <span>{rows.length} từ được nhập</span>
        {dups > 0 && <span className="bulk-info-dup">· {dups} từ trùng (bỏ qua)</span>}
        <span className="bulk-info-sel">· <strong>{selected}</strong> từ sẽ được thêm</span>
      </div>
      <div className="bulk-preview-wrap">
        <table className="bulk-preview-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}><input type="checkbox" checked={allOn} onChange={(e) => toggleAll(e.target.checked)} aria-label="Chọn tất cả" /></th>
              <th>Từ</th>
              <th>Nghĩa</th>
              <th>Ví dụ (tự động)</th>
              <th style={{ width: 72 }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const loading = r.dictLoading || r.aiLoading;
              return (
                <tr key={i} className={r.dup ? 'bulk-row-dup' : ''}>
                  <td><input type="checkbox" checked={r.selected} disabled={r.dup} onChange={(e) => toggle(i, e.target.checked)} aria-label={`Chọn ${r.word}`} /></td>
                  <td><strong>{r.word}</strong>{r.phonetic && <><br /><span className="bulk-phonetic">{r.phonetic}</span></>}</td>
                  <td>{r.meaning || <em style={{ color: 'var(--text3)' }}>—</em>}</td>
                  <td className="bulk-ex-cell">
                    {r.example
                      ? <span className="bulk-example-text">{r.example}</span>
                      : loading ? <span className="bulk-spinner" /> : <em style={{ color: 'var(--text3)' }}>—</em>}
                  </td>
                  <td>
                    {r.dup ? <span className="bulk-badge bulk-badge-dup">Trùng</span>
                      : loading ? <span className="bulk-spinner" />
                        : <span className="bulk-badge bulk-badge-ok">OK</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
