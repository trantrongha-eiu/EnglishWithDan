import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

function TestModal({ test, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', seriesName: '', testNumber: 1, audioUrl: '', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (test) setForm({
      name: test.name || '',
      seriesName: test.seriesName || '',
      testNumber: test.testNumber || 1,
      audioUrl: test.audioUrl || '',
      isActive: test.isActive !== false
    });
  }, [test]);

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
      if (test?._id) await apiFetch(`/listening/admin/tests/${test._id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/listening/admin/tests', { method: 'POST', body: JSON.stringify(form) });
      toast(test?._id ? 'Đã cập nhật' : 'Đã tạo đề Listening');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{test?._id ? 'Sửa đề Listening' : 'Thêm đề Listening'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Tên đề *</label>
            <input className="form-input" value={form.name} onChange={set('name')} required placeholder="IELTS Listening Test 1" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Tên series</label>
              <input className="form-input" value={form.seriesName} onChange={set('seriesName')} placeholder="Cambridge IELTS 17" />
            </div>
            <div className="form-group">
              <label className="form-label">Số đề</label>
              <input className="form-input" type="number" value={form.testNumber} onChange={set('testNumber')} min={1} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">URL Audio (Cloudinary)</label>
            <input className="form-input" value={form.audioUrl} onChange={set('audioUrl')} placeholder="https://res.cloudinary.com/..." />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Kích hoạt
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

export default function ListeningTests() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');
  const [editTest, setEditTest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => apiFetch('/listening/admin/tests').then(d => setTests(d.tests || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  const filtered = tests.filter(t => !search || t.name?.toLowerCase().includes(search.toLowerCase()));

  async function toggleActive(id, isActive) {
    try {
      await apiFetch(`/listening/admin/tests/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn' : 'Đã hiện');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function del(id, name) {
    confirm(`Xóa đề listening "${name}"?`, async () => {
      try { await apiFetch(`/listening/admin/tests/${id}`, { method: 'DELETE' }); toast('Đã xóa'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      {(showModal || editTest) && (
        <TestModal test={editTest} onClose={() => { setShowModal(false); setEditTest(null); }} onSaved={load} />
      )}

      <div className="section-header">
        <h2 className="section-title">Đề Listening ({filtered.length})</h2>
        <button className="btn btn-primary" onClick={() => { setEditTest(null); setShowModal(true); }}>+ Thêm đề</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input className="form-input search-input" placeholder="Tìm đề listening..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>TÊN ĐỀ</th><th>SERIES</th><th>SỐ ĐỀ</th><th>SỐ PART</th><th>SỐ CÂU</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={8} className="table-empty">Không có đề nào</td></tr>
              : filtered.map(t => (
                <tr key={t._id}>
                  <td><strong>{t.name}</strong></td>
                  <td style={{ fontSize: 13, color: 'var(--text3)' }}>{t.seriesName || '–'}</td>
                  <td>{t.testNumber}</td>
                  <td>{t.totalParts ?? t.sections?.length ?? 0}</td>
                  <td>{t.totalQuestions ?? t.sections?.reduce((s, sec) => s + (sec.questions?.length || 0), 0) ?? 0}</td>
                  <td>
                    <span className={`badge ${t.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
                      <span className="dot" />{t.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(t.createdAt).split(' ')[0]}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditTest(t)} title="Sửa">✏️</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(t._id, t.isActive !== false)}>{t.isActive !== false ? '🙈' : '👁'}</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(t._id, t.name)}>🗑</button>
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
