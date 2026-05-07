import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

function Tab({ label, active, onClick }) {
  return <button className={`inner-tab${active ? ' active' : ''}`} onClick={onClick}>{label}</button>;
}

export default function Speaking() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/admin/speaking-questions').then(d => setQuestions(d.questions || [])).catch(() => {});
    apiFetch('/admin/speaking-materials').then(d => setMaterials(d.materials || [])).catch(() => {});
  }, []);

  function delQ(id, q) {
    confirm(`Xóa câu hỏi "${q}"?`, async () => {
      try { await apiFetch(`/admin/speaking-questions/${id}`, { method: 'DELETE' }); toast('Đã xóa'); setQuestions(a => a.filter(x => x._id !== id)); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  function delM(id, t) {
    confirm(`Xóa tài liệu "${t}"?`, async () => {
      try { await apiFetch(`/admin/speaking-materials/${id}`, { method: 'DELETE' }); toast('Đã xóa'); setMaterials(a => a.filter(x => x._id !== id)); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  const filteredQ = questions.filter(q => !search || q.question?.toLowerCase().includes(search.toLowerCase()) || q.topic?.toLowerCase().includes(search.toLowerCase()));
  const filteredM = materials.filter(m => !search || m.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Speaking</h2>
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
                    <td style={{ maxWidth: 300 }}>{q.question}</td>
                    <td><span className="badge badge-blue">{q.topic}</span></td>
                    <td>{q.part}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(q.createdAt).split(' ')[0]}</td>
                    <td><button className="btn btn-danger btn-sm btn-icon" onClick={() => delQ(q._id, q.question)}>🗑</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'materials' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>TIÊU ĐỀ</th><th>MÔ TẢ</th><th>PDF</th><th>NGÀY TẠO</th><th></th></tr></thead>
            <tbody>
              {filteredM.length === 0
                ? <tr><td colSpan={5} className="table-empty">Không có tài liệu</td></tr>
                : filteredM.map(m => (
                  <tr key={m._id}>
                    <td><strong>{m.title}</strong></td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{(m.description || '').slice(0, 60)}</td>
                    <td>{m.pdfUrl ? <a href={m.pdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontSize: 12 }}>📄 Xem</a> : '–'}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(m.createdAt).split(' ')[0]}</td>
                    <td><button className="btn btn-danger btn-sm btn-icon" onClick={() => delM(m._id, m.title)}>🗑</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius)', color: 'var(--text3)', fontSize: 13 }}>
        💡 Để thêm câu hỏi và upload tài liệu mới, dùng trang admin cũ:
        <a href="/admin.html" style={{ color: 'var(--blue)', marginLeft: 6 }}>Mở admin cũ →</a>
      </div>
    </>
  );
}
