import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

export default function Vocabulary() {
  const toast = useToast();
  const confirm = useConfirm();
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState('');

  const load = () => apiFetch('/admin/vocab-units').then(d => setUnits(d.units || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  const filtered = units.filter(u => !search || u.title?.toLowerCase().includes(search.toLowerCase()) || u.level?.toLowerCase().includes(search.toLowerCase()));

  async function toggleActive(id, isActive) {
    try {
      await apiFetch(`/admin/vocab-units/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn unit' : 'Đã hiện unit');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function del(id, title) {
    confirm(`Xóa unit "${title}"? Tất cả từ vựng trong unit sẽ bị xóa.`, async () => {
      try { await apiFetch(`/admin/vocab-units/${id}`, { method: 'DELETE' }); toast('Đã xóa'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Từ vựng – Units ({filtered.length})</h2>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input className="form-input search-input" placeholder="Tìm unit..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>TIÊU ĐỀ</th><th>LEVEL</th><th>SỐ TỪ</th><th>THỨ TỰ</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} className="table-empty">Không có unit nào</td></tr>
              : filtered.map(u => (
                <tr key={u._id}>
                  <td><strong>{u.title}</strong>{u.description && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.description.slice(0, 60)}</div>}</td>
                  <td><span className="badge badge-blue">{u.level || '–'}</span></td>
                  <td>{u.wordCount ?? u.words?.length ?? 0}</td>
                  <td>{u.orderIndex ?? '–'}</td>
                  <td><span className={`badge ${u.isActive !== false ? 'badge-green' : 'badge-gray'}`}><span className="dot" />{u.isActive !== false ? 'Hoạt động' : 'Ẩn'}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(u.createdAt).split(' ')[0]}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(u._id, u.isActive !== false)}>{u.isActive !== false ? '🙈' : '👁'}</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(u._id, u.title)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius)', color: 'var(--text3)', fontSize: 13 }}>
        💡 Để thêm unit mới và quản lý từ vựng chi tiết (thêm từ, sắp xếp), dùng trang admin cũ:
        <a href="/admin.html" style={{ color: 'var(--blue)', marginLeft: 6 }}>Mở admin cũ →</a>
      </div>
    </>
  );
}
