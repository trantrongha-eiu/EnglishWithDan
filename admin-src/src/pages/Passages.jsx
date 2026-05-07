import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

const PAGE = 15;
const CATS = [
  { value: 'passage1', label: 'Passage 1' },
  { value: 'passage2', label: 'Passage 2' },
  { value: 'passage3', label: 'Passage 3' },
];
const DIFFS = ['easy', 'medium', 'hard'];

const Q_TYPES_READING = [
  { value: 'fill-blank', label: 'Fill-blank' },
  { value: 'sentence-completion', label: 'Sentence completion' },
  { value: 'multiple-choice', label: 'Multiple choice' },
  { value: 'true-false-ng', label: 'True / False / Not Given' },
  { value: 'yes-no-ng', label: 'Yes / No / Not Given' },
  { value: 'matching-info', label: 'Matching information' },
  { value: 'matching-headings', label: 'Matching headings' },
  { value: 'map-labelling', label: 'Map labelling' },
];

const BLANK_Q_R = { questionNumber: 1, type: 'fill-blank', questionText: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' };

function PassageQuestionsModal({ passageId, passageTitle, onClose }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [passageData, setPassageData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQForm, setShowQForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [qForm, setQForm] = useState({ ...BLANK_Q_R });

  useEffect(() => {
    apiFetch(`/admin/passages/${passageId}`)
      .then(d => { setPassageData(d.passage); setGroups(d.passage?.questionGroups || []); })
      .catch(() => toast('Không tải được câu hỏi', 'error'))
      .finally(() => setLoading(false));
  }, [passageId]);

  const allQs = groups.flatMap((g, gi) => (g.questions || []).map((q, qi) => ({ ...q, _gi: gi, _qi: qi, _gt: g.groupType })));

  async function persist(updatedGroups) {
    if (!passageData) return;
    setSaving(true);
    try {
      await apiFetch(`/admin/passages/${passageId}`, { method: 'PUT', body: JSON.stringify({ ...passageData, questionGroups: updatedGroups }) });
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  function commitQ() {
    if (!qForm.correctAnswer.trim()) { toast('Vui lòng nhập đáp án', 'error'); return; }
    const q = {
      questionNumber: qForm.questionNumber,
      type: qForm.type,
      questionText: qForm.questionText,
      correctAnswer: qForm.correctAnswer.trim(),
      explanation: qForm.explanation.trim(),
      options: ['multiple-choice', 'matching-info', 'matching-headings'].includes(qForm.type) ? qForm.options.filter(o => o.trim()) : [],
    };
    let updated;
    if (editTarget !== null) {
      const { gi, qi } = editTarget;
      updated = groups.map((g, i) => i !== gi ? g : {
        ...g, questions: (g.questions || []).map((x, j) => j === qi ? q : x).sort((a, b) => a.questionNumber - b.questionNumber)
      });
    } else {
      const lastPlain = groups.reduce((acc, g, i) => g.groupType === 'plain' ? i : acc, -1);
      if (lastPlain >= 0) {
        updated = groups.map((g, i) => i !== lastPlain ? g : {
          ...g, questions: [...(g.questions || []), q].sort((a, b) => a.questionNumber - b.questionNumber)
        });
      } else {
        updated = [...groups, { groupType: 'plain', instruction: '', questions: [q] }];
      }
    }
    setGroups(updated);
    persist(updated);
    setShowQForm(false);
    setEditTarget(null);
  }

  function openEdit(gi, qi) {
    const q = groups[gi].questions[qi];
    setQForm({ questionNumber: q.questionNumber, type: q.type, questionText: q.questionText || '',
      options: q.options?.length > 0 ? [...q.options, '', '', '', ''].slice(0, 4) : ['', '', '', ''],
      correctAnswer: q.correctAnswer || '', explanation: q.explanation || '' });
    setEditTarget({ gi, qi });
    setShowQForm(true);
  }

  function openAdd() {
    const nextNum = allQs.length > 0 ? Math.max(...allQs.map(q => q.questionNumber)) + 1 : 1;
    setQForm({ ...BLANK_Q_R, questionNumber: nextNum });
    setEditTarget(null);
    setShowQForm(true);
  }

  function delQ(gi, qi) {
    confirm('Xóa câu hỏi này?', () => {
      const updated = groups.map((g, i) => i !== gi ? g : {
        ...g, questions: (g.questions || []).filter((_, j) => j !== qi)
      }).filter(g => (g.questions || []).length > 0);
      setGroups(updated);
      persist(updated);
    });
  }

  const setQ = k => e => setQForm(f => ({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));
  const setOpt = (i, v) => setQForm(f => { const o = [...f.options]; o[i] = v; return { ...f, options: o }; });
  const needsOpts = ['multiple-choice', 'matching-info', 'matching-headings'].includes(qForm.type);
  const isTFNG = ['true-false-ng', 'yes-no-ng'].includes(qForm.type);
  const tfOpts = qForm.type === 'true-false-ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 760, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📝 Câu hỏi — {passageTitle}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}>Đang tải...</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 600 }}>Tổng {allQs.length} câu hỏi</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {saving && <span style={{ fontSize: 12, color: 'var(--text3)' }}>Đang lưu...</span>}
                  <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Thêm câu hỏi</button>
                </div>
              </div>

              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th style={{ width: 50 }}>SỐ</th><th style={{ width: 60 }}>NHÓM</th><th style={{ width: 160 }}>LOẠI</th><th>NỘI DUNG</th><th style={{ width: 140 }}>ĐÁP ÁN</th><th style={{ width: 70 }}></th></tr></thead>
                  <tbody>
                    {allQs.length === 0
                      ? <tr><td colSpan={6} className="table-empty">Chưa có câu hỏi</td></tr>
                      : allQs.map((q, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{q.questionNumber}</td>
                          <td style={{ fontSize: 11, color: 'var(--text3)' }}>{q._gt}</td>
                          <td><span className="badge badge-blue" style={{ fontSize: 11 }}>{q.type}</span></td>
                          <td style={{ fontSize: 13 }}>{(q.questionText || '–').slice(0, 80)}{(q.questionText || '').length > 80 ? '…' : ''}</td>
                          <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>{q.correctAnswer}</td>
                          <td>
                            <div className="row-actions">
                              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(q._gi, q._qi)}>✏️</button>
                              <button className="btn btn-danger btn-sm btn-icon" onClick={() => delQ(q._gi, q._qi)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 12, padding: 10, background: 'var(--surface2)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
                Câu hỏi mới được thêm vào nhóm <strong>plain</strong>. Các nhóm khác (table, note-form…) giữ nguyên cấu trúc.
                Đáp án không phân biệt hoa/thường. True/False/Not Given phải viết đúng chính xác.
              </div>
            </>
          )}
        </div>
      </div>

      {showQForm && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowQForm(false)}>
          <div className="modal" style={{ maxWidth: 560, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editTarget ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h3>
              <button className="modal-close" onClick={() => setShowQForm(false)}>✕</button>
            </div>
            <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 11, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Câu số *</label>
                  <input className="form-input" type="number" value={qForm.questionNumber} onChange={setQ('questionNumber')} min={1} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Loại *</label>
                  <select className="form-input" value={qForm.type} onChange={setQ('type')}>
                    {Q_TYPES_READING.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nội dung câu hỏi</label>
                <textarea className="form-input" rows={3} value={qForm.questionText} onChange={setQ('questionText')}
                  placeholder={qForm.type === 'fill-blank' ? 'The research was conducted in ________ (Q14)' : 'Question text...'} />
              </div>
              {needsOpts && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Lựa chọn</label>
                  {qForm.options.map((opt, i) => (
                    <input key={i} className="form-input" style={{ marginBottom: 5 }} value={opt}
                      onChange={e => setOpt(i, e.target.value)} placeholder={`${String.fromCharCode(65 + i)}. ...`} />
                  ))}
                </div>
              )}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Đáp án đúng *</label>
                {isTFNG ? (
                  <select className="form-input" value={qForm.correctAnswer} onChange={setQ('correctAnswer')}>
                    <option value="">-- Chọn --</option>
                    {tfOpts.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                ) : (
                  <input className="form-input" value={qForm.correctAnswer} onChange={setQ('correctAnswer')}
                    placeholder={qForm.type === 'multiple-choice' ? 'A (hoặc B, C, D)' : 'Đáp án chính xác'} />
                )}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Giải thích</label>
                <input className="form-input" value={qForm.explanation} onChange={setQ('explanation')} placeholder="Giải thích đáp án (tùy chọn)..." />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowQForm(false)}>Huỷ</button>
                <button className="btn btn-primary" onClick={commitQ}>Lưu câu hỏi</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function diffBadge(d) {
  const map = { easy: ['badge-green', 'Dễ'], medium: ['badge-blue', 'TB'], hard: ['badge-red', 'Khó'] };
  const [cls, label] = map[d] || ['badge-gray', d];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function catBadge(c) {
  const cat = CATS.find(x => x.value === c);
  return <span className="badge badge-blue">{cat?.label || c}</span>;
}

function PassageModal({ passageId, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: '', category: 'passage1', content: '', difficulty: 'medium',
    questionRange: { start: 1, end: 13 }, isActive: true
  });
  const [loading, setLoading] = useState(!!passageId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!passageId) return;
    apiFetch(`/admin/passages/${passageId}`)
      .then(d => {
        const p = d.passage;
        setForm({
          title: p.title || '',
          category: p.category || 'Academic',
          content: p.content || '',
          difficulty: p.difficulty || 'medium',
          questionRange: { start: p.questionRange?.start ?? 1, end: p.questionRange?.end ?? 13 },
          isActive: p.isActive !== false
        });
      })
      .catch(() => toast('Không tải được bài đọc', 'error'))
      .finally(() => setLoading(false));
  }, [passageId]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setRange = k => e => setForm(f => ({ ...f, questionRange: { ...f.questionRange, [k]: Number(e.target.value) } }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (passageId) await apiFetch(`/admin/passages/${passageId}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/admin/passages', { method: 'POST', body: JSON.stringify(form) });
      toast(passageId ? 'Đã cập nhật bài đọc' : 'Đã thêm bài đọc');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{passageId ? 'Sửa bài đọc' : 'Thêm bài đọc mới'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Đang tải...</div>
        ) : (
          <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
            <div className="form-group">
              <label className="form-label">Tiêu đề *</label>
              <input className="form-input" value={form.title} onChange={set('title')} required placeholder="The History of Coffee" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-input" value={form.category} onChange={set('category')}>
                  {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Độ khó</label>
                <select className="form-input" value={form.difficulty} onChange={set('difficulty')}>
                  {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Câu hỏi từ số</label>
                <input className="form-input" type="number" value={form.questionRange.start} onChange={setRange('start')} min={1} />
              </div>
              <div className="form-group">
                <label className="form-label">Đến số</label>
                <input className="form-input" type="number" value={form.questionRange.end} onChange={setRange('end')} min={1} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nội dung bài đọc</label>
              <textarea className="form-input" rows={12} value={form.content} onChange={set('content')}
                style={{ fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6 }}
                placeholder="Paste the full reading passage here..." />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Hiển thị
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Passages() {
  const toast = useToast();
  const confirm = useConfirm();
  const [all, setAll] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [qPassage, setQPassage] = useState(null);

  const load = () => apiFetch('/admin/passages?limit=200').then(d => setAll(d.passages || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  useEffect(() => {
    setFiltered(all.filter(p =>
      (!search || p.title?.toLowerCase().includes(search.toLowerCase())) &&
      (!cat || p.category === cat)
    ));
    setPage(1);
  }, [all, search, cat]);

  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);

  async function toggleActive(id, isActive) {
    try {
      await apiFetch(`/admin/passages/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn bài đọc' : 'Đã hiện bài đọc');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function del(id, title) {
    confirm(`Xóa vĩnh viễn bài đọc "${title}"? Không thể phục hồi.`, async () => {
      try { await apiFetch(`/admin/passages/${id}/permanent`, { method: 'DELETE' }); toast('Đã xóa vĩnh viễn'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  function closeModal() { setShowModal(false); setEditId(null); }

  return (
    <>
      {(showModal || editId) && (
        <PassageModal passageId={editId} onClose={closeModal} onSaved={load} />
      )}
      {qPassage && (
        <PassageQuestionsModal passageId={qPassage._id} passageTitle={qPassage.title} onClose={() => setQPassage(null)} />
      )}

      <div className="section-header">
        <h2 className="section-title">Bài đọc ({filtered.length})</h2>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setShowModal(true); }}>+ Thêm bài đọc</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input className="form-input search-input" placeholder="Tìm bài đọc..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="form-input" value={cat} onChange={e => setCat(e.target.value)} style={{ width: 160 }}>
          <option value="">Tất cả category</option>
          {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>TIÊU ĐỀ</th><th>CATEGORY</th><th>ĐỘ KHÓ</th><th>SỐ CÂU HỎI</th><th>RANGE</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {paged.length === 0
              ? <tr><td colSpan={8} className="table-empty">Không có bài đọc nào</td></tr>
              : paged.map(p => (
                <tr key={p._id}>
                  <td><strong>{p.title}</strong></td>
                  <td>{catBadge(p.category)}</td>
                  <td>{diffBadge(p.difficulty)}</td>
                  <td>{p.questionRange ? (p.questionRange.end - p.questionRange.start + 1) : '–'}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{p.questionRange?.start}–{p.questionRange?.end}</td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-green' : 'badge-gray'}`}>
                      <span className="dot" />{p.isActive ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(p.createdAt).split(' ')[0]}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => setQPassage(p)} title="Quản lý câu hỏi">📝 Câu hỏi</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditId(p._id)} title="Sửa">✏️</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(p._id, p.isActive)} title={p.isActive ? 'Ẩn' : 'Hiện'}>{p.isActive ? '🙈' : '👁'}</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(p._id, p.title)} title="Xóa">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <Pagination page={page} total={filtered.length} pageSize={PAGE} onPage={setPage} />
      </div>
    </>
  );
}
