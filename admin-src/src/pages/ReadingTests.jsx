import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

export default function ReadingTests() {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => apiFetch('/admin/tests').then(d => setTests(d.tests || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  const filtered = tests.filter(t => {
    if (search && !t.name?.toLowerCase().includes(search.toLowerCase()) && !(t.seriesName || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'active' && t.isActive === false) return false;
    if (statusFilter === 'hidden' && t.isActive !== false) return false;
    return true;
  });

  async function toggleActive(id, isActive) {
    try {
      await apiFetch(`/admin/tests/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn bộ đề' : 'Đã hiện bộ đề');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function del(id, name) {
    confirm(`Xóa vĩnh viễn bộ đề "${name}"? Không thể khôi phục!`, async () => {
      try {
        await apiFetch(`/admin/tests/${id}/permanent`, { method: 'DELETE' });
        toast('Đã xóa vĩnh viễn');
        load();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  function copyLink(id) {
    const url = `${location.origin}/reading.html?testId=${id}`;
    navigator.clipboard.writeText(url)
      .then(() => toast('Đã copy link chia sẻ ✓'))
      .catch(() => toast(`Link: ${url}`, 'error'));
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Bộ đề Reading ({filtered.length})</h2>
        <button className="btn btn-primary" onClick={() => navigate('/admin/reading-tests/new')}>+ Thêm bộ đề</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input className="form-input search-input" placeholder="Tìm bộ đề, series..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 160 }}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="hidden">Đang ẩn</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>TÊN BỘ ĐỀ</th><th>SERIES</th><th>SỐ ĐỀ</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={6} className="table-empty">Không có bộ đề nào</td></tr>
              : filtered.map(t => (
                <tr key={t._id}>
                  <td><strong>{t.name}</strong></td>
                  <td style={{ fontSize: 13, color: 'var(--text3)' }}>{t.seriesName || '–'}</td>
                  <td>{t.testNumber}</td>
                  <td>
                    <span className={`badge ${t.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
                      <span className="dot" />{t.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(t.createdAt).split(' ')[0]}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => copyLink(t._id)} title="Copy link chia sẻ">🔗</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => navigate(`/admin/reading-tests/${t._id}`)} title="Sửa">✏️</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(t._id, t.isActive !== false)} title={t.isActive !== false ? 'Ẩn' : 'Hiện'}>{t.isActive !== false ? '🙈' : '👁'}</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(t._id, t.name)} title="Xóa vĩnh viễn">🗑</button>
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
