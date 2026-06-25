import { useEffect, useRef, useState } from 'react';
import { apiFetch, formatDate, API } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

const TASK_LABELS = { task1: 'Task 1', task2: 'Task 2', both: 'Task 1 + 2' };

function SampleModal({ sample, onClose, onSaved }) {
  const toast = useToast();
  const fileRef = useRef();
  const [form, setForm] = useState({
    title: '', quarter: '', topic: '', taskType: 'task2', pdfUrl: '', isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (sample) setForm({
      title:    sample.title    || '',
      quarter:  sample.quarter  || '',
      topic:    sample.topic    || '',
      taskType: sample.taskType || 'task2',
      pdfUrl:   sample.pdfUrl   || '',
      isActive: sample.isActive !== false,
    });
  }, [sample]);

  const set = k => e => setForm(f => ({
    ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  async function uploadPdf(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      const res = await fetch(`${API}/admin/writing/samples/upload-pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setForm(f => ({ ...f, pdfUrl: data.url }));
      toast('Upload PDF thành công');
    } catch (err) { toast(err.message, 'error'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function save(e) {
    e.preventDefault();
    if (!form.pdfUrl) return toast('Vui lòng upload file PDF', 'error');
    setSaving(true);
    try {
      if (sample?._id)
        await apiFetch(`/admin/writing/samples/${sample._id}`, { method: 'PUT', body: JSON.stringify(form) });
      else
        await apiFetch('/admin/writing/samples', { method: 'POST', body: JSON.stringify(form) });
      toast(sample?._id ? 'Đã cập nhật bài mẫu' : 'Đã thêm bài mẫu');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{sample?._id ? 'Sửa bài mẫu' : 'Thêm bài mẫu Writing'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Tiêu đề *</label>
            <input className="form-input" value={form.title} onChange={set('title')} required placeholder="VD: Band 7 Task 2 – Environment" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quý *</label>
              <input className="form-input" value={form.quarter} onChange={set('quarter')} required placeholder="Q2 2025" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Loại Task *</label>
              <select className="form-input" value={form.taskType} onChange={set('taskType')}>
                <option value="task1">Task 1</option>
                <option value="task2">Task 2</option>
                <option value="both">Task 1 + 2</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Chủ đề *</label>
            <input className="form-input" value={form.topic} onChange={set('topic')} required placeholder="Environment, Technology, Education..." />
          </div>
          <div className="form-group">
            <label className="form-label">File PDF *</label>
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={uploadPdf} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? '⏳ Đang upload...' : '📤 Upload PDF'}
              </button>
              {form.pdfUrl ? (
                <a href={form.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#3d8bff', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ✓ Đã có PDF – Xem thử
                </a>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>Chưa có file</span>
              )}
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)', fontSize: 14 }}>
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
            Hiển thị cho học sinh
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
              {saving ? 'Đang lưu...' : sample?._id ? 'Lưu' : '+ Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WritingSamples() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [samples, setSamples] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');

  function load() {
    apiFetch('/admin/writing/samples')
      .then(d => setSamples(d.samples || []))
      .catch(e => toast(e.message, 'error'));
  }

  useEffect(() => { load(); }, []);

  async function hardDelete(id, title) {
    confirm(`Xóa vĩnh viễn "${title}"? Không thể khôi phục.`, async () => {
      try {
        await apiFetch(`/admin/writing/samples/${id}/permanent`, { method: 'DELETE' });
        toast('Đã xóa vĩnh viễn');
        load();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  async function toggleActive(s) {
    try {
      await apiFetch(`/admin/writing/samples/${s._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  const filtered = typeFilter ? samples.filter(s => s.taskType === typeFilter) : samples;

  return (
    <>
      {showCreate && <SampleModal onClose={() => setShowCreate(false)} onSaved={load} />}
      {editItem   && <SampleModal sample={editItem} onClose={() => setEditItem(null)} onSaved={load} />}

      <div className="section-header">
        <h2 className="section-title">Bài mẫu Writing ({filtered.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Thêm bài mẫu</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <select className="form-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 160 }}>
          <option value="">Tất cả loại</option>
          <option value="task1">Task 1</option>
          <option value="task2">Task 2</option>
          <option value="both">Task 1 + 2</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>TIÊU ĐỀ</th>
              <th>QUÝ</th>
              <th>CHỦ ĐỀ</th>
              <th>LOẠI</th>
              <th>TRẠNG THÁI</th>
              <th>PDF</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} className="table-empty">Chưa có bài mẫu nào</td></tr>
              : filtered.map(s => (
                <tr key={s._id} style={{ opacity: s.isActive ? 1 : 0.5 }}>
                  <td><strong>{s.title}</strong></td>
                  <td>{s.quarter}</td>
                  <td>{s.topic}</td>
                  <td>
                    <span className="badge badge-blue">{TASK_LABELS[s.taskType] || s.taskType}</span>
                  </td>
                  <td>
                    {s.isActive
                      ? <span className="badge badge-green">Hiển thị</span>
                      : <span className="badge badge-gray">Ẩn</span>}
                  </td>
                  <td>
                    {s.pdfUrl
                      ? <a href={s.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>📄 Xem PDF</a>
                      : <span style={{ color: 'var(--text3)', fontSize: 12 }}>–</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditItem(s)}>✏️ Sửa</button>
                      <button
                        className={`btn btn-sm ${s.isActive ? 'btn-warning' : 'btn-primary'}`}
                        onClick={() => toggleActive(s)}
                      >
                        {s.isActive ? '🙈 Ẩn' : '👁 Hiện'}
                      </button>
                      {isAdmin && (
                        <button className="btn btn-danger btn-sm" onClick={() => hardDelete(s._id, s.title)}>🗑 Xóa</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </>
  );
}
