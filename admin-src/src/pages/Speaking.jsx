import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

function Tab({ label, active, onClick }) {
  return <button className={`inner-tab${active ? ' active' : ''}`} onClick={onClick}>{label}</button>;
}

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
      isActive: question.isActive !== false
    });
  }, [question]);

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
            <div className="form-group">
              <label className="form-label">Chủ đề *</label>
              <input className="form-input" value={form.topic} onChange={set('topic')} required
                placeholder="Work, Hometown, Technology..." />
            </div>
            <div className="form-group">
              <label className="form-label">Part</label>
              <select className="form-input" value={form.part} onChange={set('part')}>
                {PARTS.map(p => <option key={p} value={p}>Part {p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Câu hỏi *</label>
            <textarea className="form-input" rows={3} value={form.question} onChange={set('question')} required
              placeholder="What kind of work do you do?" />
          </div>
          {Number(form.part) === 2 && (
            <div className="form-group">
              <label className="form-label">Cue Card (mỗi dòng là 1 gợi ý)</label>
              <textarea className="form-input" rows={5} value={form.cueCard} onChange={set('cueCard')}
                placeholder={'You should say:\nwhere you went\nwho you were with\nwhat you did there\nand explain why you enjoyed it'} />
            </div>
          )}
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

function MaterialModal({ material, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', quarter: '', topic: '', pdfUrl: '', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (material) setForm({
      title: material.title || '',
      quarter: material.quarter || '',
      topic: material.topic || '',
      pdfUrl: material.pdfUrl || '',
      isActive: material.isActive !== false
    });
  }, [material]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (material?._id) await apiFetch(`/admin/speaking/materials/${material._id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/admin/speaking/materials', { method: 'POST', body: JSON.stringify(form) });
      toast(material?._id ? 'Đã cập nhật' : 'Đã thêm tài liệu');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{material?._id ? 'Sửa tài liệu' : 'Thêm tài liệu Speaking'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label className="form-label">Tiêu đề *</label><input className="form-input" value={form.title} onChange={set('title')} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Quý *</label>
              <input className="form-input" value={form.quarter} onChange={set('quarter')} required placeholder="Q2 2025" />
            </div>
            <div className="form-group">
              <label className="form-label">Chủ đề *</label>
              <input className="form-input" value={form.topic} onChange={set('topic')} required placeholder="Work & Career" />
            </div>
          </div>
          <div className="form-group"><label className="form-label">URL PDF *</label><input className="form-input" value={form.pdfUrl} onChange={set('pdfUrl')} required placeholder="https://res.cloudinary.com/..." /></div>
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

export default function Speaking() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [editQuestion, setEditQuestion] = useState(null);
  const [showQModal, setShowQModal] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [showMModal, setShowMModal] = useState(false);

  const loadQ = () => apiFetch('/admin/speaking/questions').then(d => setQuestions(d.questions || [])).catch(() => {});
  const loadM = () => apiFetch('/admin/speaking/materials').then(d => setMaterials(d.materials || [])).catch(() => {});

  useEffect(() => { loadQ(); loadM(); }, []);

  function delQ(id, q) {
    confirm(`Xóa câu hỏi "${q}"?`, async () => {
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

  const filteredQ = questions.filter(q => !search || q.question?.toLowerCase().includes(search.toLowerCase()) || q.topic?.toLowerCase().includes(search.toLowerCase()));
  const filteredM = materials.filter(m => !search || m.title?.toLowerCase().includes(search.toLowerCase()) || m.topic?.toLowerCase().includes(search.toLowerCase()));

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
          <button className="btn btn-primary" onClick={() => { setEditMaterial(null); setShowMModal(true); }}>+ Thêm tài liệu</button>
        )}
      </div>

      <div className="inner-tabs-nav">
        <Tab label="❓ Câu hỏi" active={tab === 'questions'} onClick={() => setTab('questions')} />
        <Tab label="📄 Tài liệu" active={tab === 'materials'} onClick={() => setTab('materials')} />
      </div>

      <div className="filter-bar" style={{ margin: '12px 0' }}>
        <input className="form-input search-input" placeholder="Tìm kiếm..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      {tab === 'questions' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>CÂU HỎI</th><th>CHỦ ĐỀ</th><th>PART</th><th>NGÀY TẠO</th><th></th></tr></thead>
            <tbody>
              {filteredQ.length === 0
                ? <tr><td colSpan={5} className="table-empty">Không có câu hỏi</td></tr>
                : filteredQ.map(q => (
                  <tr key={q._id}>
                    <td style={{ maxWidth: 320 }}>{q.question}</td>
                    <td><span className="badge badge-blue">{q.topic}</span></td>
                    <td>Part {q.part}</td>
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
            <thead><tr><th>TIÊU ĐỀ</th><th>QUÝ</th><th>CHỦ ĐỀ</th><th>PDF</th><th>NGÀY TẠO</th><th></th></tr></thead>
            <tbody>
              {filteredM.length === 0
                ? <tr><td colSpan={6} className="table-empty">Không có tài liệu</td></tr>
                : filteredM.map(m => (
                  <tr key={m._id}>
                    <td><strong>{m.title}</strong></td>
                    <td><span className="badge badge-blue">{m.quarter}</span></td>
                    <td style={{ fontSize: 13 }}>{m.topic}</td>
                    <td>{m.pdfUrl ? <a href={m.pdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontSize: 12 }}>📄 Xem</a> : '–'}</td>
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
