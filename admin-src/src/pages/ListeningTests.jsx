import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

export default function ListeningTests() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');

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
      <div className="section-header">
        <h2 className="section-title">Đề Listening ({filtered.length})</h2>
        <button className="btn btn-primary" onClick={() => window.open('/admin/listening-tests/new', '_blank')}>+ Thêm đề</button>
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
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => window.open(`/admin/listening-tests/${t._id}`, '_blank')} title="Sửa">✏️</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(t._id, t.isActive !== false)} title={t.isActive !== false ? 'Ẩn' : 'Hiện'}>{t.isActive !== false ? '🙈' : '👁'}</button>
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
