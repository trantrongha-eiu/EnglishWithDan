import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

const PAGE_SIZE = 25;

function bandBadge(score) {
  if (score == null) return '–';
  const color = score >= 7 ? 'var(--green)' : score >= 5 ? 'var(--yellow)' : 'var(--accent2)';
  return <span style={{ color, fontWeight: 700 }}>{score.toFixed(1)}</span>;
}

function skillBadge(skill) {
  const map = { reading: '#3d8bff', listening: '#34d399', writing: '#fbbf24', speaking: '#a78bfa' };
  const c = map[skill] || '#8b92a8';
  return <span style={{ background: c + '22', color: c, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{skill}</span>;
}

function formatDur(sec) {
  if (sec == null) return '–';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m${String(s).padStart(2, '0')}s`;
}

export default function StudentHistory() {
  const toast   = useToast();
  const confirm = useConfirm();

  const [all,     setAll]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [skill,   setSkill]   = useState('');
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);

  async function load() {
    setLoading(true);
    try {
      const d = await apiFetch('/admin/recent-attempts?limit=300');
      setAll(d.attempts || []);
      setPage(1);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = all.filter(h => {
    if (skill && h.skill !== skill) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = (h.userId?.displayName || '').toLowerCase();
      const user = (h.userId?.username   || '').toLowerCase();
      const test = (h.testName          || '').toLowerCase();
      return name.includes(q) || user.includes(q) || test.includes(q);
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const rows       = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function del(id, skillName, name) {
    confirm(`Xóa bài làm của "${name}"?`, async () => {
      try {
        const endpoint = skillName === 'reading'
          ? `/admin/attempts/${id}`
          : `/admin/${skillName}-attempts/${id}`;
        await apiFetch(endpoint, { method: 'DELETE' });
        toast('Đã xóa');
        setAll(a => a.filter(x => x._id !== id));
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Lịch sử làm bài ({filtered.length})</h2>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          {loading ? '⏳' : '🔄'} Làm mới
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          className="form-input search-input"
          placeholder="Tìm tên, username, bộ đề..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ maxWidth: 300 }}
        />
        <select className="form-input" value={skill} onChange={e => { setSkill(e.target.value); setPage(1); }} style={{ width: 160 }}>
          <option value="">Tất cả kỹ năng</option>
          <option value="reading">Reading</option>
          <option value="listening">Listening</option>
          <option value="writing">Writing</option>
          <option value="speaking">Speaking</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>HỌC SINH</th>
              <th>KỸ NĂNG</th>
              <th>BỘ ĐỀ</th>
              <th>NGÀY LÀM</th>
              <th>THỜI GIAN</th>
              <th>ĐÚNG/TỔNG</th>
              <th>BAND</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} className="table-empty">Đang tải...</td></tr>
              : rows.length === 0
                ? <tr><td colSpan={8} className="table-empty">Không có dữ liệu</td></tr>
                : rows.map(h => {
                  const name = h.userId?.displayName || h.userId?.username || '–';
                  const isWriting = h.skill === 'writing';
                  return (
                    <tr key={h._id}>
                      <td>
                        <strong>{name}</strong>
                        {h.userId?.username && name !== h.userId.username && (
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{h.userId.username}</div>
                        )}
                      </td>
                      <td>{skillBadge(h.skill)}</td>
                      <td>{h.testName || '–'}</td>
                      <td style={{ fontSize: 12 }}>{formatDate(h.date)}</td>
                      <td>{formatDur(h.duration)}</td>
                      <td>{h.correctCount != null ? `${h.correctCount}/${h.totalQuestions}` : '–'}</td>
                      <td>{isWriting && h.bandScore == null
                        ? <span style={{ color: 'var(--text3)', fontSize: 12 }}>Chờ chấm</span>
                        : bandBadge(h.bandScore)}
                      </td>
                      <td>
                        {['reading', 'listening', 'writing'].includes(h.skill) && (
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(h._id, h.skill, name)}>🗑</button>
                        )}
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: 12 }}>
          <button className="btn btn-ghost btn-sm" disabled={safePage <= 1} onClick={() => setPage(p => p - 1)}>‹ Trước</button>
          <span style={{ fontSize: 13, color: 'var(--text2)', padding: '0 12px' }}>
            Trang {safePage}/{totalPages}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)}>Sau ›</button>
        </div>
      )}
    </>
  );
}
