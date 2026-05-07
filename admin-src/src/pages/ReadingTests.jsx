import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

function diffBadge(d) {
  const map = { easy: ['badge-green', 'Dễ'], medium: ['badge-blue', 'TB'], hard: ['badge-red', 'Khó'] };
  const [cls, label] = map[d] || ['badge-gray', d];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function ReadingTests() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');

  const load = () => apiFetch('/admin/tests').then(d => setTests(d.tests || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  const filtered = tests.filter(t => !search || t.title?.toLowerCase().includes(search.toLowerCase()));

  async function toggleActive(id, isActive) {
    try {
      await apiFetch(`/admin/tests/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn bộ đề' : 'Đã hiện bộ đề');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function del(id, title) {
    confirm(`Xóa bộ đề "${title}"?`, async () => {
      try { await apiFetch(`/admin/tests/${id}`, { method: 'DELETE' }); toast('Đã xóa'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Bộ đề Reading ({filtered.length})</h2>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input className="form-input search-input" placeholder="Tìm bộ đề..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>TIÊU ĐỀ</th><th>ĐỘ KHÓ</th><th>SỐ PASSAGE</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={6} className="table-empty">Không có bộ đề nào</td></tr>
              : filtered.map(t => (
                <tr key={t._id}>
                  <td><strong>{t.title}</strong></td>
                  <td>{diffBadge(t.difficulty)}</td>
                  <td>{t.passages?.length || 0}</td>
                  <td><span className={`badge ${t.isActive ? 'badge-green' : 'badge-gray'}`}><span className="dot" />{t.isActive ? 'Hoạt động' : 'Ẩn'}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(t.createdAt).split(' ')[0]}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(t._id, t.isActive)}>{t.isActive ? '🙈' : '👁'}</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(t._id, t.title)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius)', color: 'var(--text3)', fontSize: 13 }}>
        💡 Để xây dựng bộ đề đầy đủ (ghép passage, câu hỏi, preview), dùng trang admin cũ:
        <a href="/admin.html" style={{ color: 'var(--blue)', marginLeft: 6 }}>Mở admin cũ →</a>
      </div>
    </>
  );
}
