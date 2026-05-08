import { useEffect, useRef, useState } from 'react';
import { apiFetch, formatDate, API } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

const PARTS = [1, 2, 3];

function QuestionModal({ question, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ topic: '', part: 1, question: '', cueCard: '', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (question) setForm({
      topic: question.topic || '',
      part: question.part || 1,
      question: question.question || '',
      cueCard: question.cueCard || '',
      isActive: question.isActive !== false,
    });
  }, [question]);

  const set = k => e => setForm(f => ({
    ...f,
    [k]: e.target.type === 'checkbox' ? e.target.checked
       : e.target.type === 'number' ? Number(e.target.value)
       : e.target.value,
  }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (question?._id) await apiFetch(`/admin/speaking/questions/${question._id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/admin/speaking/questions', { method: 'POST', body: JSON.stringify(form) });
      toast(question?._id ? 'Đã cập nhật' : 'Đã thêm câu hỏi');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{question?._id ? 'Sửa câu hỏi' : 'Thêm câu hỏi Speaking'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Chủ đề *</label>
              <input className="form-input" value={form.topic} onChange={set('topic')} required placeholder="Work, Hometown, Technology..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Part *</label>
              <select className="form-input" value={form.part} onChange={set('part')}>
                {PARTS.map(p => <option key={p} value={p}>Part {p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Câu hỏi *</label>
            <textarea className="form-input" rows={3} value={form.question} onChange={set('question')} required
              placeholder="Describe a place you have visited recently." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Cue Card {Number(form.part) !== 2 && <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(chỉ Part 2)</span>}</label>
            <textarea className="form-input" rows={5} value={form.cueCard} onChange={set('cueCard')}
              placeholder={'You should say:\n- where it is\n- when you went\n- what you did there\nand explain why you enjoyed it'}
              disabled={Number(form.part) !== 2} style={{ opacity: Number(form.part) !== 2 ? 0.4 : 1 }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Hiển thị
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : '💾 Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MaterialModal({ material, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', quarter: '', topic: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (material) setForm({ title: material.title || '', quarter: material.quarter || '', topic: material.topic || '' });
  }, [material]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.quarter.trim() || !form.topic.trim()) {
      toast('Vui lòng điền đầy đủ thông tin', 'error'); return;
    }
    setSaving(true);
    try {
      if (material?._id) {
        let updateBody = { ...form };
        if (file) {
          setStatus('⬆️ Đang upload PDF mới...');
          const fd = new FormData();
          fd.append('pdf', file);
          const res = await fetch(`${API}/admin/speaking/materials/upload-pdf`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: fd,
          });
          const d = await res.json();
          if (!d.success) throw new Error(d.message);
          updateBody.pdfUrl = d.url;
        }
        setStatus('💾 Đang lưu...');
        await apiFetch(`/admin/speaking/materials/${material._id}`, { method: 'PUT', body: JSON.stringify(updateBody) });
        toast('Đã cập nhật tài liệu');
      } else {
        if (!file) { toast('Chưa chọn file PDF', 'error'); setSaving(false); return; }
        setStatus('⬆️ Đang upload PDF lên Cloudinary...');
        const fd = new FormData();
        fd.append('pdf', file);
        const uploadRes = await fetch(`${API}/admin/speaking/materials/upload-pdf`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: fd,
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error(uploadData.message);
        setStatus('💾 Đang lưu thông tin...');
        await apiFetch('/admin/speaking/materials', { method: 'POST', body: JSON.stringify({ ...form, pdfUrl: uploadData.url }) });
        toast('Đã upload tài liệu');
      }
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); setStatus(''); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{material?._id ? 'Sửa tài liệu PDF' : 'Upload tài liệu PDF'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tiêu đề *</label>
            <input className="form-input" value={form.title} onChange={set('title')} required placeholder="VD: IELTS Speaking Q1 2025" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quý *</label>
              <input className="form-input" value={form.quarter} onChange={set('quarter')} required placeholder="Q1 2025" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Chủ đề *</label>
              <input className="form-input" value={form.topic} onChange={set('topic')} required placeholder="Travel" />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{material?._id ? 'Thay thế PDF (tuỳ chọn)' : 'File PDF *'}</label>
            <input ref={fileRef} type="file" className="form-input" accept=".pdf"
              onChange={e => setFile(e.target.files[0])} style={{ padding: 8 }} />
          </div>
          {status && (
            <div style={{ fontSize: 13, color: 'var(--text2)', background: 'var(--surface2)', padding: '8px 12px', borderRadius: 8 }}>{status}</div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang xử lý...' : material?._id ? '💾 Lưu' : '📤 Upload & Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Speaking() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [partFilter, setPartFilter] = useState('');
  const [editQuestion, setEditQuestion] = useState(null);
  const [showQModal, setShowQModal] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [showMModal, setShowMModal] = useState(false);

  const loadQ = () => apiFetch('/admin/speaking/questions').then(d => setQuestions(d.questions || [])).catch(() => {});
  const loadM = () => apiFetch('/admin/speaking/materials').then(d => setMaterials(d.materials || [])).catch(() => {});
  useEffect(() => { loadQ(); loadM(); }, []);

  function delQ(id, q) {
    confirm(`Xóa câu hỏi "${q.slice(0, 40)}..."?`, async () => {
      try { await apiFetch(`/admin/speaking/questions/${id}`, { method: 'DELETE' }); toast('Đã xóa'); setQuestions(a => a.filter(x => x._id !== id)); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  function delM(id, t) {
    confirm(`Xóa tài liệu "${t}"?`, async () => {
      try { await apiFetch(`/admin/speaking/materials/${id}`, { method: 'DELETE' }); toast('Đã xóa'); setMaterials(a => a.filter(x => x._id !== id)); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  const filteredQ = questions.filter(q => {
    if (partFilter && String(q.part) !== partFilter) return false;
    if (search && !q.question?.toLowerCase().includes(search.toLowerCase()) && !q.topic?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const filteredM = materials.filter(m =>
    !search || m.title?.toLowerCase().includes(search.toLowerCase()) || m.topic?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {(showQModal || editQuestion) && (
        <QuestionModal question={editQuestion} onClose={() => { setShowQModal(false); setEditQuestion(null); }} onSaved={loadQ} />
      )}
      {(showMModal || editMaterial) && (
        <MaterialModal material={editMaterial} onClose={() => { setShowMModal(false); setEditMaterial(null); }} onSaved={loadM} />
      )}

      <div className="section-header">
        <h2 className="section-title">Speaking</h2>
        {tab === 'questions' && (
          <button className="btn btn-primary" onClick={() => { setEditQuestion(null); setShowQModal(true); }}>+ Thêm câu hỏi</button>
        )}
        {tab === 'materials' && (
          <button className="btn btn-primary" onClick={() => { setEditMaterial(null); setShowMModal(true); }}>+ Upload PDF</button>
        )}
      </div>

      <div className="inner-tabs-nav">
        <button className={`inner-tab${tab === 'questions' ? ' active' : ''}`} onClick={() => setTab('questions')}>🎤 Câu hỏi Speaking</button>
        <button className={`inner-tab${tab === 'materials' ? ' active' : ''}`} onClick={() => setTab('materials')}>📄 Tài liệu PDF</button>
      </div>

      <div className="filter-bar" style={{ margin: '12px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {tab === 'questions' && (
          <select className="form-input" value={partFilter} onChange={e => setPartFilter(e.target.value)} style={{ width: 130 }}>
            <option value="">Tất cả Part</option>
            {PARTS.map(p => <option key={p} value={String(p)}>Part {p}</option>)}
          </select>
        )}
        <input className="form-input search-input" placeholder={tab === 'questions' ? 'Lọc topic, câu hỏi...' : 'Tìm tiêu đề, chủ đề...'} value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      {tab === 'questions' && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>PART</th><th>CHỦ ĐỀ</th><th>CÂU HỎI</th><th>CUE CARD</th><th>NGÀY TẠO</th><th></th></tr>
            </thead>
            <tbody>
              {filteredQ.length === 0
                ? <tr><td colSpan={6} className="table-empty">Không có câu hỏi</td></tr>
                : filteredQ.map(q => (
                  <tr key={q._id}>
                    <td><span className="badge badge-blue">Part {q.part}</span></td>
                    <td style={{ fontSize: 13 }}>{q.topic}</td>
                    <td style={{ maxWidth: 300, fontSize: 13 }}>{q.question}</td>
                    <td style={{ fontSize: 11, color: 'var(--text3)', maxWidth: 180 }}>
                      {q.cueCard ? q.cueCard.slice(0, 60) + (q.cueCard.length > 60 ? '…' : '') : '–'}
                    </td>
                    <td style={{ fontSize: 12 }}>{formatDate(q.createdAt).split(' ')[0]}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditQuestion(q)} title="Sửa">✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => delQ(q._id, q.question)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'materials' && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>TIÊU ĐỀ</th><th>QUÝ</th><th>CHỦ ĐỀ</th><th>PDF</th><th>NGÀY TẠO</th><th></th></tr>
            </thead>
            <tbody>
              {filteredM.length === 0
                ? <tr><td colSpan={6} className="table-empty">Không có tài liệu</td></tr>
                : filteredM.map(m => (
                  <tr key={m._id}>
                    <td><strong>{m.title}</strong></td>
                    <td><span className="badge badge-blue">{m.quarter}</span></td>
                    <td style={{ fontSize: 13 }}>{m.topic}</td>
                    <td>{m.pdfUrl ? <a href={m.pdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontSize: 12 }}>📄 Xem PDF</a> : '–'}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(m.createdAt).split(' ')[0]}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditMaterial(m)} title="Sửa">✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => delM(m._id, m.title)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
