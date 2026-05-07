import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

function bandBadge(score) {
  if (score == null) return '–';
  const color = score >= 7 ? 'var(--green)' : score >= 5 ? 'var(--yellow)' : 'var(--accent2)';
  return <span style={{ color, fontWeight: 700 }}>{score.toFixed(1)}</span>;
}

function skillBadge(skill) {
  const map = { reading: '#3d8bff', listening: '#34d399', writing: '#fbbf24', speaking: '#a78bfa' };
  const c = map[skill] || '#8b92a8';
  return <span style={{ background: c + '22', color: c, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{skill}</span>;
}

function formatDur(sec) {
  if (sec == null) return '–';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m${String(s).padStart(2, '0')}s`;
}

export default function StudentHistory() {
  const toast = useToast();
  const confirm = useConfirm();
  const [all, setAll] = useState([]);
  const [skill, setSkill] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/admin/recent-attempts?limit=500').then(d => setAll(d.attempts || [])).catch(e => toast(e.message, 'error'));
  }, []);

  const filtered = all.filter(h => {
    if (skill && h.skill !== skill) return false;
    if (search) {
      const q = search.toLowerCase();
      return (h.userId?.displayName || '').toLowerCase().includes(q) || (h.testName || '').toLowerCase().includes(q);
    }
    return true;
  });

  async function del(id, skillName, name) {
    confirm(`Xóa bài làm của "${name}"?`, async () => {
      try {
        await apiFetch(`/admin/${skillName}-attempts/${id}`, { method: 'DELETE' });
        toast('Đã xóa');
        setAll(a => a.filter(x => x._id !== id));
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Lịch sử làm bài ({filtered.length})</h2>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input className="form-input search-input" placeholder="Tìm học sinh, bộ đề..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="form-input" value={skill} onChange={e => setSkill(e.target.value)} style={{ width: 160 }}>
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
            <tr><th>HỌC SINH</th><th>KỸ NĂNG</th><th>BỘ ĐỀ</th><th>NGÀY LÀM</th><th>THỜI GIAN</th><th>ĐÚNG/TỔNG</th><th>BAND</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={8} className="table-empty">Không có dữ liệu</td></tr>
              : filtered.map(h => {
                const name = h.userId?.displayName || '–';
                const isWriting = h.skill === 'writing';
                return (
                  <tr key={h._id}>
                    <td><strong>{name}</strong></td>
                    <td>{skillBadge(h.skill)}</td>
                    <td>{h.testName || '–'}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(h.date)}</td>
                    <td>{formatDur(h.duration)}</td>
                    <td>{h.correctCount != null ? `${h.correctCount}/${h.totalQuestions}` : '–'}</td>
                    <td>{isWriting && h.bandScore == null
                      ? <span style={{ color: 'var(--text3)' }}>Chờ chấm</span>
                      : bandBadge(h.bandScore)}</td>
                    <td>
                      {['reading', 'listening', 'writing'].includes(h.skill) && (
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(h._id, h.skill, name)}>🗑</button>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}
