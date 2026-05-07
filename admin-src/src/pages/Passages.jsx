import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

const PAGE = 15;
const CATS = ['Academic', 'General', 'Mixed'];
const DIFFS = ['easy', 'medium', 'hard'];

function diffBadge(d) {
  const map = { easy: ['badge-green', 'Dễ'], medium: ['badge-blue', 'TB'], hard: ['badge-red', 'Khó'] };
  const [cls, label] = map[d] || ['badge-gray', d];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function catBadge(c) {
  return <span className="badge badge-blue">{c}</span>;
}

export default function Passages() {
  const toast = useToast();
  const confirm = useConfirm();
  const [all, setAll] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');

  const load = () => apiFetch('/admin/passages?limit=200').then(d => { setAll(d.passages || []); }).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  useEffect(() => {
    setFiltered(all.filter(p =>
      (!search || p.title?.toLowerCase().includes(search.toLowerCase())) &&
      (!cat || p.category === cat)
    ));
    setPage(1);
  }, [all, search, cat]);

  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);

  async function toggleActive(id, isActive) {
    try {
      await apiFetch(`/admin/passages/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn bài đọc' : 'Đã hiện bài đọc');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function del(id, title) {
    confirm(`Xóa vĩnh viễn bài đọc "${title}"?`, async () => {
      try { await apiFetch(`/admin/passages/${id}`, { method: 'DELETE' }); toast('Đã xóa'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Bài đọc ({filtered.length})</h2>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input className="form-input search-input" placeholder="Tìm bài đọc..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="form-input" value={cat} onChange={e => setCat(e.target.value)} style={{ width: 160 }}>
          <option value="">Tất cả category</option>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>TIÊU ĐỀ</th><th>CATEGORY</th><th>ĐỘ KHÓ</th><th>SỐ CÂU HỎI</th><th>RANGE</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {paged.length === 0
              ? <tr><td colSpan={8} className="table-empty">Không có bài đọc nào</td></tr>
              : paged.map(p => (
                <tr key={p._id}>
                  <td><strong>{p.title}</strong></td>
                  <td>{catBadge(p.category)}</td>
                  <td>{diffBadge(p.difficulty)}</td>
                  <td>{p.questions?.length || 0}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{p.questionRange?.start}–{p.questionRange?.end}</td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-green' : 'badge-gray'}`}>
                      <span className="dot" />{p.isActive ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(p.createdAt).split(' ')[0]}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(p._id, p.isActive)} title={p.isActive ? 'Ẩn' : 'Hiện'}>{p.isActive ? '🙈' : '👁'}</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(p._id, p.title)} title="Xóa vĩnh viễn">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <Pagination page={page} total={filtered.length} pageSize={PAGE} onPage={setPage} />
      </div>

      <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius)', color: 'var(--text3)', fontSize: 13 }}>
        💡 Để thêm/sửa bài đọc với đầy đủ tính năng (câu hỏi, range), dùng trang admin cũ:
        <a href="/admin.html" style={{ color: 'var(--blue)', marginLeft: 6 }}>Mở admin cũ →</a>
      </div>
    </>
  );
}
