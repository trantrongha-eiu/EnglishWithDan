import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

export default function VocabActivity() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/admin/vocab-students').then(d => setStudents(d.students || [])).catch(e => toast(e.message, 'error'));
  }, []);

  const filtered = students.filter(s => !search || (s.username || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Hoạt động từ vựng ({filtered.length} học sinh)</h2>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input className="form-input search-input" placeholder="Tìm học sinh..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>HỌC SINH</th><th>UNIT ĐÃ HỌC</th><th>TỪ ĐÃ HỌC</th><th>LƯỢT XEM</th><th>LẦN CUỐI</th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={5} className="table-empty">Không có dữ liệu</td></tr>
              : filtered.map(s => (
                <tr key={s._id}>
                  <td><strong>{s.username}</strong><br /><span style={{ fontSize: 11, color: 'var(--text3)' }}>{s.email}</span></td>
                  <td>{s.unitsStudied ?? 0}</td>
                  <td>{(s.wordsStudied ?? 0).toLocaleString('vi-VN')}</td>
                  <td>{(s.totalViews ?? 0).toLocaleString('vi-VN')}</td>
                  <td style={{ fontSize: 12 }}>{formatDate(s.lastActivity)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
