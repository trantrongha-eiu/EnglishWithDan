import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

export default function ListeningTests() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');

  const load = () => apiFetch('/admin/listening-tests').then(d => setTests(d.tests || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  const filtered = tests.filter(t => !search || t.title?.toLowerCase().includes(search.toLowerCase()));

  async function toggleActive(id, isActive) {
    try {
      await apiFetch(`/admin/listening-tests/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn' : 'Đã hiện');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function del(id, title) {
    confirm(`Xóa đề listening "${title}"?`, async () => {
      try { await apiFetch(`/admin/listening-tests/${id}`, { method: 'DELETE' }); toast('Đã xóa'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Đề Listening ({filtered.length})</h2>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input className="form-input search-input" placeholder="Tìm đề listening..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>TIÊU ĐỀ</th><th>SỐ SECTION</th><th>SỐ CÂU HỎI</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={6} className="table-empty">Không có đề nào</td></tr>
              : filtered.map(t => (
                <tr key={t._id}>
                  <td><strong>{t.title}</strong></td>
                  <td>{t.sections?.length || 0}</td>
                  <td>{t.sections?.reduce((s, sec) => s + (sec.questions?.length || 0), 0) || 0}</td>
                  <td><span className={`badge ${t.isActive !== false ? 'badge-green' : 'badge-gray'}`}><span className="dot" />{t.isActive !== false ? 'Hoạt động' : 'Ẩn'}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(t.createdAt).split(' ')[0]}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(t._id, t.isActive !== false)}>{t.isActive !== false ? '🙈' : '👁'}</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(t._id, t.title)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius)', color: 'var(--text3)', fontSize: 13 }}>
        💡 Để thêm đề mới với audio upload và câu hỏi chi tiết, dùng trang admin cũ:
        <a href="/admin.html" style={{ color: 'var(--blue)', marginLeft: 6 }}>Mở admin cũ →</a>
      </div>
    </>
  );
}
