import { useEffect, useRef, useState } from 'react';
import { apiFetch, formatDate, API } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

const PARTS = [1, 2, 3];

const BAND_COLOR = b => b >= 7 ? '#16a34a' : b >= 5.5 ? '#d97706' : b > 0 ? '#dc2626' : '#94a3b8';

function ScorePill({ label, value }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', background:'var(--surface2,#f1f5f9)', borderRadius:10, padding:'8px 12px', minWidth:80 }}>
      <span style={{ fontSize:20, fontWeight:800, color: BAND_COLOR(value) }}>{value || '—'}</span>
      <span style={{ fontSize:11, color:'var(--text3,#888)', marginTop:2, textAlign:'center' }}>{label}</span>
    </div>
  );
}

function AttemptModal({ attempt, onClose }) {
  if (!attempt) return null;
  const fb = attempt.aiFeedback || {};
  const user = attempt.userId || {};
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Chi tiết luyện Speaking</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          {/* Meta */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, fontSize:13, color:'var(--text2,#555)' }}>
            <span className="badge badge-blue">Part {attempt.part}</span>
            {attempt.topic && <span className="badge" style={{ background:'var(--surface2,#f1f5f9)', color:'var(--text,#111)' }}>{attempt.topic}</span>}
            <span style={{ marginLeft:'auto', color:'var(--text3,#888)', fontSize:12 }}>{formatDate(attempt.createdAt)}</span>
          </div>
          <div style={{ fontWeight:600, fontSize:14, color:'var(--text,#111)' }}>
            👤 {user.username || '—'} <span style={{ fontSize:12, fontWeight:400, color:'var(--text3,#888)' }}>{user.email}</span>
          </div>
          <div style={{ background:'var(--surface2,#f1f5f9)', borderRadius:10, padding:'12px 14px', fontSize:14, lineHeight:1.6 }}>
            <strong>Câu hỏi:</strong> {attempt.question || '—'}
          </div>

          {/* Scores */}
          {fb.overallBand > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))', gap:10 }}>
              <ScorePill label="Band" value={fb.overallBand} />
              <ScorePill label="Fluency" value={fb.fluency} />
              <ScorePill label="Vocabulary" value={fb.vocabulary} />
              <ScorePill label="Grammar" value={fb.grammar} />
              <ScorePill label="Pronunciation" value={fb.pronunciation} />
            </div>
          )}

          {/* Overall feedback */}
          {(fb.overallFeedback || fb.feedback) && (
            <div style={{ background:'var(--surface2,#f1f5f9)', borderRadius:10, padding:'12px 14px', fontSize:13, lineHeight:1.7 }}>
              <div style={{ fontWeight:700, marginBottom:6, color:'var(--text2,#555)' }}>📝 Nhận xét tổng thể</div>
              {fb.overallFeedback || fb.feedback}
            </div>
          )}

          {/* Transcript */}
          {attempt.transcript && (
            <div style={{ background:'var(--surface2,#f1f5f9)', borderRadius:10, padding:'12px 14px', fontSize:13, lineHeight:1.7 }}>
              <div style={{ fontWeight:700, marginBottom:6, color:'var(--text2,#555)' }}>🎙 Transcript</div>
              {attempt.transcript}
            </div>
          )}

          {/* Corrected */}
          {fb.correctedVersion && (
            <div style={{ background:'rgba(34,197,94,.07)', borderRadius:10, padding:'12px 14px', fontSize:13, lineHeight:1.7, border:'1px solid rgba(34,197,94,.2)' }}>
              <div style={{ fontWeight:700, marginBottom:6, color:'#16a34a' }}>✅ Phiên bản cải thiện</div>
              {fb.correctedVersion}
            </div>
          )}

          {/* Strengths */}
          {fb.strengths?.length > 0 && (
            <div style={{ background:'rgba(59,130,246,.07)', borderRadius:10, padding:'12px 14px', border:'1px solid rgba(59,130,246,.2)' }}>
              <div style={{ fontWeight:700, marginBottom:8, color:'#1d4ed8', fontSize:13 }}>⭐ Điểm mạnh</div>
              <ul style={{ margin:0, paddingLeft:16, fontSize:13, lineHeight:1.8 }}>
                {fb.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {/* Errors */}
          {fb.corrections?.length > 0 && (
            <div style={{ background:'rgba(239,68,68,.07)', borderRadius:10, padding:'12px 14px', border:'1px solid rgba(239,68,68,.2)' }}>
              <div style={{ fontWeight:700, marginBottom:8, color:'#dc2626', fontSize:13 }}>❌ Lỗi cần sửa</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {fb.corrections.map((c, i) => (
                  <div key={i} style={{ fontSize:13, lineHeight:1.6 }}>
                    <span style={{ background:'rgba(239,68,68,.12)', padding:'1px 6px', borderRadius:4, color:'#dc2626', fontFamily:'monospace' }}>{c.original}</span>
                    {' → '}
                    <span style={{ background:'rgba(34,197,94,.12)', padding:'1px 6px', borderRadius:4, color:'#16a34a', fontFamily:'monospace' }}>{c.corrected}</span>
                    {c.explanation && <div style={{ color:'var(--text2,#555)', marginTop:2, fontSize:12 }}>{c.explanation}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {fb.suggestions?.length > 0 && (
            <div style={{ background:'rgba(245,158,11,.07)', borderRadius:10, padding:'12px 14px', border:'1px solid rgba(245,158,11,.2)' }}>
              <div style={{ fontWeight:700, marginBottom:8, color:'#d97706', fontSize:13 }}>💡 Gợi ý cải thiện</div>
              <ul style={{ margin:0, paddingLeft:16, fontSize:13, lineHeight:1.8 }}>
                {fb.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ borderTop:'1px solid var(--border,#e5e7eb)', padding:'12px 24px' }}>
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

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
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
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
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
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
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [partFilter, setPartFilter] = useState('');
  const [editQuestion, setEditQuestion] = useState(null);
  const [showQModal, setShowQModal] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [showMModal, setShowMModal] = useState(false);

  // History tab state
  const [history, setHistory] = useState([]);
  const [histTotal, setHistTotal] = useState(0);
  const [histPage, setHistPage] = useState(1);
  const [histLoading, setHistLoading] = useState(false);
  const [histSearch, setHistSearch] = useState('');
  const [histPartFilter, setHistPartFilter] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const histLoaded = useRef(false);

  const loadQ = () => apiFetch('/admin/speaking/questions').then(d => setQuestions(d.questions || [])).catch(e => toast(e.message, 'error'));
  const loadM = () => apiFetch('/admin/speaking/materials').then(d => setMaterials(d.materials || [])).catch(e => toast(e.message, 'error'));

  const loadHistory = async (page = 1) => {
    setHistLoading(true);
    try {
      const qs = new URLSearchParams({ page, limit: 40 });
      const d = await apiFetch(`/admin/speaking/history?${qs}`);
      setHistory(d.attempts || []);
      setHistTotal(d.total || 0);
      setHistPage(page);
    } catch (e) { toast(e.message, 'error'); }
    finally { setHistLoading(false); }
  };

  useEffect(() => { loadQ(); loadM(); }, []);

  useEffect(() => {
    if (tab === 'history' && !histLoaded.current) {
      histLoaded.current = true;
      loadHistory(1);
    }
  }, [tab]);

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

  // Filter history client-side by username/question/topic + part
  const filteredHist = history.filter(a => {
    if (histPartFilter && String(a.part) !== histPartFilter) return false;
    if (histSearch) {
      const q = histSearch.toLowerCase();
      const user = a.userId || {};
      if (!((user.username || '').toLowerCase().includes(q) ||
            (a.question || '').toLowerCase().includes(q) ||
            (a.topic || '').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  return (
    <>
      {(showQModal || editQuestion) && (
        <QuestionModal question={editQuestion} onClose={() => { setShowQModal(false); setEditQuestion(null); }} onSaved={loadQ} />
      )}
      {(showMModal || editMaterial) && (
        <MaterialModal material={editMaterial} onClose={() => { setShowMModal(false); setEditMaterial(null); }} onSaved={loadM} />
      )}
      {selectedAttempt && (
        <AttemptModal attempt={selectedAttempt} onClose={() => setSelectedAttempt(null)} />
      )}

      <div className="section-header">
        <h2 className="section-title">Speaking</h2>
        {tab === 'questions' && (
          <button className="btn btn-primary" onClick={() => { setEditQuestion(null); setShowQModal(true); }}>+ Thêm câu hỏi</button>
        )}
        {tab === 'materials' && (
          <button className="btn btn-primary" onClick={() => { setEditMaterial(null); setShowMModal(true); }}>+ Upload PDF</button>
        )}
        {tab === 'history' && (
          <button className="btn btn-ghost" onClick={() => { histLoaded.current = false; loadHistory(1); }}>↺ Làm mới</button>
        )}
      </div>

      <div className="inner-tabs-nav">
        <button className={`inner-tab${tab === 'questions' ? ' active' : ''}`} onClick={() => setTab('questions')}>🎤 Câu hỏi Speaking</button>
        <button className={`inner-tab${tab === 'materials' ? ' active' : ''}`} onClick={() => setTab('materials')}>📄 Tài liệu PDF</button>
        <button className={`inner-tab${tab === 'history' ? ' active' : ''}`} onClick={() => setTab('history')}>📊 Lịch sử học sinh</button>
      </div>

      <div className="filter-bar" style={{ margin: '12px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {(tab === 'questions' || tab === 'history') && (
          <select className="form-input" value={tab === 'history' ? histPartFilter : partFilter}
            onChange={e => tab === 'history' ? setHistPartFilter(e.target.value) : setPartFilter(e.target.value)}
            style={{ width: 130 }}>
            <option value="">Tất cả Part</option>
            {PARTS.map(p => <option key={p} value={String(p)}>Part {p}</option>)}
          </select>
        )}
        {tab !== 'history' ? (
          <input className="form-input search-input" placeholder={tab === 'questions' ? 'Lọc topic, câu hỏi...' : 'Tìm tiêu đề, chủ đề...'}
            value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        ) : (
          <input className="form-input search-input" placeholder="Tìm học sinh, câu hỏi, topic..."
            value={histSearch} onChange={e => setHistSearch(e.target.value)} style={{ maxWidth: 280 }} />
        )}
        {tab === 'history' && (
          <span style={{ marginLeft:'auto', fontSize:13, color:'var(--text3,#888)', alignSelf:'center' }}>
            {filteredHist.length} / {histTotal} bài
          </span>
        )}
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
                        {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => delQ(q._id, q.question)}>🗑</button>}
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
                        {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => delM(m._id, m.title)}>🗑</button>}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'history' && (
        histLoading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div> : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>HỌC SINH</th>
                    <th>PART</th>
                    <th>CHỦ ĐỀ</th>
                    <th>CÂU HỎI</th>
                    <th style={{ textAlign:'center' }}>BAND</th>
                    <th style={{ textAlign:'center' }}>F</th>
                    <th style={{ textAlign:'center' }}>V</th>
                    <th style={{ textAlign:'center' }}>G</th>
                    <th style={{ textAlign:'center' }}>P</th>
                    <th>NGÀY</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHist.length === 0
                    ? <tr><td colSpan={11} className="table-empty">Không có dữ liệu</td></tr>
                    : filteredHist.map(a => {
                      const fb = a.aiFeedback || {};
                      const user = a.userId || {};
                      const BandCell = ({ v }) => (
                        <td style={{ textAlign:'center', fontWeight:700, fontSize:13, color: BAND_COLOR(v) }}>{v || '—'}</td>
                      );
                      return (
                        <tr key={a._id} style={{ cursor:'pointer' }} onClick={() => setSelectedAttempt(a)}>
                          <td>
                            <div style={{ fontWeight:600, fontSize:13 }}>{user.username || '—'}</div>
                            <div style={{ fontSize:11, color:'var(--text3,#888)' }}>{user.email}</div>
                          </td>
                          <td><span className="badge badge-blue">Part {a.part}</span></td>
                          <td style={{ fontSize:12, color:'var(--text2,#555)', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.topic || '—'}</td>
                          <td style={{ fontSize:12, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.question}</td>
                          <BandCell v={fb.overallBand} />
                          <BandCell v={fb.fluency} />
                          <BandCell v={fb.vocabulary} />
                          <BandCell v={fb.grammar} />
                          <BandCell v={fb.pronunciation} />
                          <td style={{ fontSize:11, whiteSpace:'nowrap' }}>{formatDate(a.createdAt).split(' ')[0]}</td>
                          <td>
                            <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelectedAttempt(a); }}>Chi tiết</button>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {histTotal > 40 && (
              <div style={{ display:'flex', gap:8, justifyContent:'center', padding:'16px 0' }}>
                {histPage > 1 && (
                  <button className="btn btn-ghost btn-sm" onClick={() => loadHistory(histPage - 1)}>← Trang trước</button>
                )}
                <span style={{ fontSize:13, color:'var(--text2,#555)', alignSelf:'center' }}>
                  Trang {histPage} / {Math.ceil(histTotal / 40)}
                </span>
                {histPage < Math.ceil(histTotal / 40) && (
                  <button className="btn btn-ghost btn-sm" onClick={() => loadHistory(histPage + 1)}>Trang sau →</button>
                )}
              </div>
            )}
          </>
        )
      )}
    </>
  );
}
