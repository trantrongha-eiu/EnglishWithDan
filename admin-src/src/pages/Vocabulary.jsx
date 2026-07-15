import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function UnitModal({ unit, onClose, onSaved }) {
  const toast = useToast();
  // Initialized once from `unit` — the parent remounts this modal (via a
  // `key`) whenever the edit target changes, so no effect is needed to
  // re-sync form state to a changing prop.
  const [form, setForm] = useState(() => unit ? {
    unitNumber: unit.unitNumber ?? '',
    title: unit.title || '',
    description: unit.description || '',
    level: unit.level || 'B1',
    isActive: unit.isActive !== false
  } : { unitNumber: '', title: '', description: '', level: 'B1', isActive: true });
  const [saving, setSaving] = useState(false);

  const set = k => e => setForm(f => ({
    ...f,
    [k]: e.target.type === 'checkbox' ? e.target.checked
       : e.target.type === 'number' ? Number(e.target.value)
       : e.target.value
  }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (unit?._id) await apiFetch(`/vocab/admin/units/${unit._id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/vocab/admin/units', { method: 'POST', body: JSON.stringify(form) });
      toast(unit?._id ? 'Đã cập nhật unit' : 'Đã tạo unit mới');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{unit?._id ? 'Sửa unit' : 'Thêm unit mới'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Unit số *</label>
              <input className="form-input" type="number" value={form.unitNumber} onChange={set('unitNumber')} required min={1} />
            </div>
            <div className="form-group">
              <label className="form-label">Tiêu đề *</label>
              <input className="form-input" value={form.title} onChange={set('title')} required placeholder="Animals & Environment" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea className="form-input" rows={2} value={form.description} onChange={set('description')} placeholder="Từ vựng chủ đề..." />
          </div>
          <div className="form-group">
            <label className="form-label">Level</label>
            <select className="form-input" value={form.level} onChange={set('level')}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Hiển thị
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WordsModal({ unit, onClose }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wordType, setWordType] = useState('vocab');
  const [form, setForm] = useState({
    type: 'vocab', word: '', meaning: '', example: '',
    phonetic: '', partOfSpeech: '', level: 'B1', difficulty: 1,
    paraphrase: '', explanation: ''
  });
  const [saving, setSaving] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    apiFetch(`/vocab/admin/units/${unit._id}`)
      .then(d => setWords(d.unit?.words || []))
      .catch(() => toast('Không tải được từ vựng', 'error'))
      .finally(() => setLoading(false));
  }, [unit._id]);

  const set = k => e => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm(f => ({ ...f, [k]: val }));
    if (k === 'type') setWordType(e.target.value);
  };

  async function addWord(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/vocab/admin/units/${unit._id}/words`, { method: 'POST', body: JSON.stringify({ ...form, type: wordType }) });
      toast(`Đã thêm "${form.word}"`);
      setWords(w => [...w, { ...form, type: wordType }]);
      setForm(f => ({ ...f, word: '', meaning: '', example: '', phonetic: '', paraphrase: '', explanation: '' }));
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  function delWord(idx, word) {
    confirm(`Xóa từ "${word}"?`, async () => {
      try {
        await apiFetch(`/vocab/admin/units/${unit._id}/words/${idx}`, { method: 'DELETE' });
        toast('Đã xóa');
        setWords(w => w.filter((_, i) => i !== idx));
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  function startEdit(idx) {
    setEditingIdx(idx);
    setEditForm({ ...words[idx] });
  }

  function cancelEdit() {
    setEditingIdx(null);
    setEditForm(null);
  }

  async function saveEdit(idx) {
    setSaving(true);
    try {
      await apiFetch(`/vocab/admin/units/${unit._id}/words/${idx}`, { method: 'PUT', body: JSON.stringify(editForm) });
      toast(`Đã cập nhật "${editForm.word}"`);
      setWords(w => w.map((x, i) => i === idx ? { ...editForm } : x));
      setEditingIdx(null);
      setEditForm(null);
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📋 Unit {unit.unitNumber}: {unit.title} — {words.length} từ</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px' }}>
          <form onSubmit={addWord} style={{ background: 'var(--surface2)', padding: 16, borderRadius: 'var(--radius)', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 10, color: 'var(--text2)', fontSize: 13 }}>+ Thêm từ mới</div>

            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Loại</label>
                <select className="form-input" value={wordType} onChange={set('type')}>
                  <option value="vocab">Từ vựng</option>
                  <option value="paraphrase">Paraphrase</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Từ *</label>
                <input className="form-input" value={form.word} onChange={set('word')} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nghĩa</label>
                <input className="form-input" value={form.meaning} onChange={set('meaning')} />
              </div>
            </div>

            {wordType === 'vocab' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px', gap: 10, marginBottom: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Phiên âm</label><input className="form-input" value={form.phonetic} onChange={set('phonetic')} /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Loại từ</label><input className="form-input" value={form.partOfSpeech} onChange={set('partOfSpeech')} placeholder="verb, noun..." /></div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Level</label>
                  <select className="form-input" value={form.level} onChange={set('level')}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Độ khó</label><input className="form-input" type="number" min={1} max={5} value={form.difficulty} onChange={set('difficulty')} /></div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Paraphrase</label><input className="form-input" value={form.paraphrase} onChange={set('paraphrase')} /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Giải thích</label><input className="form-input" value={form.explanation} onChange={set('explanation')} /></div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Ví dụ câu</label>
              <input className="form-input" value={form.example} onChange={set('example')} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Đang thêm...' : '+ Thêm từ'}</button>
          </form>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>Đang tải...</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>#</th><th>TỪ</th><th>NGHĨA / PARAPHRASE</th><th>LOẠI</th><th></th></tr></thead>
                <tbody>
                  {words.length === 0
                    ? <tr><td colSpan={5} className="table-empty">Chưa có từ nào</td></tr>
                    : words.map((w, idx) => (
                      editingIdx === idx ? (
                        <tr key={idx} style={{ background: 'var(--surface2)' }}>
                          <td style={{ color: 'var(--text3)', fontSize: 12 }}>{idx + 1}</td>
                          <td colSpan={2}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <input className="form-input" style={{ fontSize: 12, padding: '4px 8px', width: 120 }}
                                value={editForm.word} onChange={e => setEditForm(f => ({ ...f, word: e.target.value }))} placeholder="Từ" />
                              <input className="form-input" style={{ fontSize: 12, padding: '4px 8px', flex: 1, minWidth: 100 }}
                                value={editForm.meaning || ''} onChange={e => setEditForm(f => ({ ...f, meaning: e.target.value }))} placeholder="Nghĩa" />
                              {w.type !== 'paraphrase' && (
                                <input className="form-input" style={{ fontSize: 12, padding: '4px 8px', width: 80 }}
                                  value={editForm.phonetic || ''} onChange={e => setEditForm(f => ({ ...f, phonetic: e.target.value }))} placeholder="Phiên âm" />
                              )}
                              {w.type === 'paraphrase' && (
                                <input className="form-input" style={{ fontSize: 12, padding: '4px 8px', flex: 1, minWidth: 100 }}
                                  value={editForm.paraphrase || ''} onChange={e => setEditForm(f => ({ ...f, paraphrase: e.target.value }))} placeholder="Paraphrase" />
                              )}
                            </div>
                          </td>
                          <td><span className={`badge ${w.type === 'paraphrase' ? 'badge-blue' : 'badge-green'}`}>{w.type}</span></td>
                          <td>
                            <div className="row-actions">
                              <button className="btn btn-primary btn-sm" onClick={() => saveEdit(idx)} disabled={saving}>✓</button>
                              <button className="btn btn-ghost btn-sm" onClick={cancelEdit} aria-label="Hủy">✕</button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={idx}>
                          <td style={{ color: 'var(--text3)', fontSize: 12 }}>{idx + 1}</td>
                          <td>
                            <strong>{w.word}</strong>
                            {w.phonetic && <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 5 }}>{w.phonetic}</span>}
                            {w.partOfSpeech && <span style={{ fontSize: 11, color: 'var(--blue)', marginLeft: 5 }}>{w.partOfSpeech}</span>}
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 220 }}>{w.meaning || w.paraphrase || '–'}</td>
                          <td><span className={`badge ${w.type === 'paraphrase' ? 'badge-blue' : 'badge-green'}`}>{w.type}</span></td>
                          <td>
                            <div className="row-actions">
                              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => startEdit(idx)} title="Sửa">✏️</button>
                              {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => delWord(idx, w.word)}>🗑</button>}
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const FULL_EXAMPLE = `[
  {
    "unitNumber": 5,
    "title": "Cambridge IELTS 15",
    "level": "IELTS",
    "words": [
      {
        "word": "habitat",
        "meaning": "môi trường sống",
        "example": "The rainforest is the natural habitat of many species.",
        "phonetic": "/ˈhæbɪtæt/",
        "partOfSpeech": "noun"
      },
      {
        "type": "paraphrase",
        "word": "evergreen tree",
        "paraphrase": "always green tree",
        "meaning": "cây xanh quanh năm",
        "explanation": "Paraphrase: 'evergreen' mang nghĩa là luôn xanh tươi"
      }
    ]
  }
]`;

function ImportJsonModal({ onClose, onImported }) {
  const toast = useToast();
  const [jsonText, setJsonText] = useState('');
  const [replace, setReplace] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  async function doImport() {
    if (!jsonText.trim()) { toast('Vui lòng dán JSON vào', 'error'); return; }
    let data;
    try {
      data = JSON.parse(jsonText.trim());
    } catch {
      toast('JSON không hợp lệ – kiểm tra cú pháp', 'error'); return;
    }
    if (!Array.isArray(data)) data = [data];
    setImporting(true);
    setResult(null);
    try {
      const d = await apiFetch(`/vocab/admin/import${replace ? '?replace=true' : ''}`, { method: 'POST', body: JSON.stringify(data) });
      setResult({ ok: true, message: d.message, results: d.results || [] });
      toast(d.message);
      onImported();
    } catch (err) {
      setResult({ ok: false, message: err.message });
      toast(err.message, 'error');
    }
    finally { setImporting(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 700, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📂 Import Vocab Units từ JSON</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Cấu trúc JSON */}
          <div style={{ background: 'rgba(61,139,255,.08)', border: '1px solid rgba(61,139,255,.25)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>📖 Cấu trúc JSON</div>
            <pre style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{`[
  {
    "unitNumber": 1,          // số thứ tự (bắt buộc, unique)
    "title": "Tên Unit",      // bắt buộc
    "level": "B1",            // A1 A2 B1 B2 C1 IELTS
    "words": [ ... ]          // mảng từ vựng / paraphrase
  }
]`}</pre>
          </div>

          {/* Ví dụ đầy đủ */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Ví dụ JSON đầy đủ</span>
              <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => setJsonText(FULL_EXAMPLE)}>⬇ Dùng ví dụ</button>
            </div>
            <pre style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.7, margin: 0, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, whiteSpace: 'pre-wrap', maxHeight: 160, overflowY: 'auto' }}>{FULL_EXAMPLE}</pre>
          </div>

          {/* JSON input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dán JSON vào đây *</label>
            <textarea className="form-input" rows={8} value={jsonText} onChange={e => setJsonText(e.target.value)}
              placeholder="Paste JSON ở đây – array [...] hoặc object {...}"
              style={{ fontFamily: 'var(--mono)', fontSize: 12 }} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)', fontSize: 13 }}>
            <input type="checkbox" checked={replace} onChange={e => setReplace(e.target.checked)} />
            Ghi đè words nếu unit đã tồn tại (xóa words cũ trước khi import)
          </label>

          {result && (
            <div style={{ padding: '12px 14px', borderRadius: 8, fontSize: 13, lineHeight: 1.6, background: result.ok ? 'rgba(52,211,153,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${result.ok ? 'rgba(52,211,153,.3)' : 'rgba(239,68,68,.3)'}`, color: result.ok ? 'var(--green)' : 'var(--danger)' }}>
              <strong>{result.ok ? '✓' : '✗'} {result.message}</strong>
              {result.results?.length > 0 && (
                <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 12 }}>
                  {result.results.map((r, i) => (
                    <li key={i} style={{ color: r.status === 'created' ? 'var(--green)' : r.status === 'updated' ? 'var(--blue)' : 'var(--text3)' }}>
                      Unit {r.unitNumber}: {r.status} {r.wordCount != null ? `(${r.wordCount} từ)` : ''} {r.reason || ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
          <button className="btn btn-primary" onClick={doImport} disabled={importing}>
            {importing ? 'Đang import...' : '📥 Import'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Vocabulary() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState('');
  const [editUnit, setEditUnit] = useState(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [wordsUnit, setWordsUnit] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const load = () => apiFetch('/vocab/admin/units').then(d => setUnits(d.units || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  const filtered = units.filter(u =>
    !search || u.title?.toLowerCase().includes(search.toLowerCase()) || u.level?.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleActive(id, isActive) {
    try {
      await apiFetch(`/vocab/admin/units/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn unit' : 'Đã hiện unit');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function del(id, title) {
    confirm(`Xóa unit "${title}"? Tất cả từ vựng trong unit sẽ bị xóa.`, async () => {
      try { await apiFetch(`/vocab/admin/units/${id}`, { method: 'DELETE' }); toast('Đã xóa'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  async function splitUnit(id, title, wordCount) {
    confirm(
      `Chia "${title}" (${wordCount} từ) thành nhiều phần, mỗi phần tối đa 120 từ?\nThao tác này không thể hoàn tác.`,
      async () => {
        try {
          const d = await apiFetch(`/vocab/admin/units/${id}/split`, { method: 'POST', body: JSON.stringify({ chunkSize: 120 }) });
          toast(d.message);
          load();
        } catch (e) { toast(e.message, 'error'); }
      }
    );
  }

  async function sortByName() {
    const sorted = [...units].sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' })
    );
    try {
      await apiFetch('/vocab/admin/units/reorder', {
        method: 'PATCH',
        body: JSON.stringify(sorted.map(u => ({ _id: u._id })))
      });
      toast('Đã sắp xếp và cập nhật số thứ tự');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function splitAll() {
    const large = units.filter(u => (u.wordCount ?? 0) > 120);
    if (large.length === 0) { toast('Không có unit nào vượt quá 120 từ'); return; }
    confirm(
      `Tách tất cả ${large.length} unit có hơn 120 từ thành các phần ≤120 từ?\nThao tác này không thể hoàn tác.`,
      async () => {
        try {
          const d = await apiFetch('/vocab/admin/split-all', { method: 'POST', body: JSON.stringify({ chunkSize: 120 }) });
          toast(d.message);
          load();
        } catch (e) { toast(e.message, 'error'); }
      }
    );
  }

  return (
    <>
      {(showUnitModal || editUnit) && (
        <UnitModal key={editUnit?._id ?? 'new'} unit={editUnit} onClose={() => { setShowUnitModal(false); setEditUnit(null); }} onSaved={load} />
      )}
      {wordsUnit && (
        <WordsModal unit={wordsUnit} onClose={() => { setWordsUnit(null); load(); }} />
      )}
      {showImport && (
        <ImportJsonModal onClose={() => setShowImport(false)} onImported={load} />
      )}

      <div className="section-header">
        <h2 className="section-title">Từ vựng – Units ({filtered.length})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowImport(true)}>📂 Import JSON</button>
          {units.some(u => (u.wordCount ?? 0) > 120) && (
            <button className="btn btn-ghost" onClick={splitAll} title="Tách tất cả unit > 120 từ">✂️ Tách tất cả</button>
          )}
          <button className="btn btn-ghost" onClick={sortByName} title="Sắp xếp theo tên A-Z và cập nhật số thứ tự">↕ Sắp xếp</button>
          <button className="btn btn-primary" onClick={() => { setEditUnit(null); setShowUnitModal(true); }}>+ Thêm unit</button>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input className="form-input search-input" placeholder="Tìm unit..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>TIÊU ĐỀ</th><th>LEVEL</th><th>SỐ TỪ</th><th>THỨ TỰ</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} className="table-empty">Không có unit nào</td></tr>
              : filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <strong>{u.title}</strong>
                    {u.description && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.description.slice(0, 60)}</div>}
                  </td>
                  <td><span className="badge badge-blue">{u.level || '–'}</span></td>
                  <td>{u.wordCount ?? 0}</td>
                  <td>{u.unitNumber ?? '–'}</td>
                  <td>
                    <span className={`badge ${u.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
                      <span className="dot" />{u.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(u.createdAt).split(' ')[0]}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => setWordsUnit(u)} title="Quản lý từ vựng">📋 Từ</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditUnit(u)} title="Sửa unit">✏️</button>
                      {(u.wordCount ?? 0) > 120 && (
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => splitUnit(u._id, u.title, u.wordCount)} title="Chia thành phần ≤120 từ">✂️</button>
                      )}
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(u._id, u.isActive !== false)}>{u.isActive !== false ? '🙈' : '👁'}</button>
                      {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(u._id, u.title)}>🗑</button>}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
