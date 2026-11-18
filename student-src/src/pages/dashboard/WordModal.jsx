import { useEffect, useRef, useState } from 'react';
import Modal from '../../components/Modal';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { lookupWord } from '../../utils/wordLookup';

const FIELDS = [
  { key: 'word', label: 'Từ tiếng Anh *', placeholder: 'establish' },
  { key: 'phonetic', label: 'Phiên âm', placeholder: '/ɪˈstæblɪʃ/' },
  { key: 'meaning', label: 'Nghĩa tiếng Việt', placeholder: 'thiết lập, thành lập' },
  { key: 'example', label: 'Ví dụ', placeholder: 'She established a new company.' },
  { key: 'note', label: 'Ghi chú', placeholder: 'Không bắt buộc...' },
];

function Suggestions({ label, items, value, onPick, className = '' }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div className={`example-suggestion-label ${className}-label`}>{label}</div>
      {items.map(it => (
        <button type="button" key={it} className={`example-suggestion ${className}${it === value ? ' selected' : ''}`} onClick={() => onPick(it)}>
          {it}
        </button>
      ))}
    </div>
  );
}

// Add (word = null) or edit a word in a notebook.
// Add: POST /vocabbook/:id/words · Edit: PATCH /vocabbook/:id/words/:wordId
// Adding looks the word up as it is typed (phonetic, meanings, examples) and
// fills the fields the student hasn't typed in themselves.
export default function WordModal({ bookId, word, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!word;
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map(f => [f.key, word?.[f.key] || ''])));
  const [saving, setSaving] = useState(false);
  const [lookup, setLookup] = useState(null); // { for, phonetic, partOfSpeech, examples, meanings } | { for, loading }
  const touched = useRef(new Set()); // fields the student typed in
  const seq = useRef(0);

  useEffect(() => {
    if (isEdit) return undefined;
    const w = form.word.trim();
    if (w.length < 2) return undefined;
    const id = ++seq.current;
    const t = setTimeout(async () => {
      setLookup({ for: w, loading: true });
      const res = await lookupWord(w).catch(() => null);
      if (id !== seq.current) return;
      setLookup(res ? { for: w, ...res } : null);
      if (!res) return;
      setForm(f => ({
        ...f,
        phonetic: touched.current.has('phonetic') ? f.phonetic : res.phonetic,
        meaning: touched.current.has('meaning') ? f.meaning : (res.meanings[0] || f.meaning),
        example: touched.current.has('example') ? f.example : (res.examples[0] || f.example),
      }));
    }, 700);
    return () => clearTimeout(t);
  }, [form.word, isEdit]);

  const set = (key, val, byUser = true) => {
    if (byUser) touched.current.add(key);
    setForm(f => ({ ...f, [key]: val }));
  };

  async function save() {
    const body = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    if (!body.word) { toast('Từ không được để trống', 'error'); return; }
    if (!isEdit && lookup?.for === body.word && lookup.partOfSpeech) body.partOfSpeech = lookup.partOfSpeech;
    setSaving(true);
    try {
      const data = isEdit
        ? await apiFetch(`/vocabbook/${bookId}/words/${word._id}`, { method: 'PATCH', body: JSON.stringify(body) })
        : await apiFetch(`/vocabbook/${bookId}/words`, { method: 'POST', body: JSON.stringify({ ...body, source: 'manual' }) });
      // addWord answers 200 + success:false for a duplicate
      if (data.success === false) { toast(data.message, 'error'); return; }
      toast(isEdit ? 'Đã cập nhật từ ✅' : (data.message || 'Đã thêm từ'), 'success');
      onSaved();
      onClose();
    } catch (err) {
      toast(err.message || 'Lưu thất bại', 'error');
    } finally {
      setSaving(false);
    }
  }

  const fresh = lookup && !lookup.loading && lookup.for === form.word.trim();

  return (
    <Modal
      title={isEdit ? '✏️ Sửa từ vựng' : '➕ Thêm từ mới'}
      onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <i className="fas fa-save" /> {isEdit ? 'Lưu thay đổi' : 'Thêm vào sổ'}
        </button>
      </>}
    >
      {FIELDS.map((f, i) => (
        <div className="form-group" key={f.key}>
          <label htmlFor={`wm-${f.key}`}>
            {f.label}
            {f.key === 'word' && lookup?.loading && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text3)' }}><i className="fas fa-circle-notch fa-spin" /> Đang tra từ…</span>}
          </label>
          <input
            id={`wm-${f.key}`}
            className="form-input"
            placeholder={f.placeholder}
            value={form[f.key]}
            autoFocus={i === 0}
            autoComplete="off"
            onChange={(e) => set(f.key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              const next = FIELDS[i + 1];
              if (next) document.getElementById(`wm-${next.key}`)?.focus();
              else save();
            }}
          />
          {fresh && f.key === 'meaning' && (
            <Suggestions label="🇻🇳 Nghĩa gợi ý — bấm để chọn:" className="meaning-suggestion" items={lookup.meanings}
              value={form.meaning} onPick={(v) => set('meaning', v)} />
          )}
          {fresh && f.key === 'example' && (
            <Suggestions label="💡 Ví dụ phổ biến — bấm để chọn:" items={lookup.examples}
              value={form.example} onPick={(v) => set('example', v)} />
          )}
        </div>
      ))}
    </Modal>
  );
}
