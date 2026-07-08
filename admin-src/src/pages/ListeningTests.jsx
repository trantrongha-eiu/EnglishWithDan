import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, formatDate, API } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/Pagination';

const PAGE = 20;

function AudioUploadModal({ test, onClose, onUploaded }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  async function upload() {
    if (!file) { toast('Chọn file audio trước', 'error'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('audio', file);
      const res = await fetch(`${API}/listening/admin/tests/${test._id}/audio`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      toast('Upload audio thành công ✓');
      onUploaded();
      onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setUploading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Upload Audio</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            Đề: <strong>{test.name}</strong>
          </div>
          {test.audioUrl && (
            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Đã có audio</span>
              <br />
              <a href={test.audioUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontSize: 11 }}>
                {test.audioUrl.slice(0, 60)}...
              </a>
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chọn file audio *</label>
            <input ref={inputRef} type="file" className="form-input" accept="audio/*,video/mp4"
              onChange={e => setFile(e.target.files[0])} style={{ padding: 8 }} />
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>MP3, M4A, WAV · Tối đa 200MB · Upload lên Cloudinary</div>
          </div>
          {uploading && (
            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--text2)' }}>
              ⏳ Đang upload, vui lòng chờ...
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={uploading}>Huỷ</button>
            <button className="btn btn-primary" onClick={upload} disabled={uploading}>
              {uploading ? 'Đang upload...' : '📤 Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListeningTests() {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [audioTest, setAudioTest] = useState(null);
  const [page, setPage] = useState(1);

  const load = () => apiFetch('/listening/admin/tests').then(d => setTests(d.tests || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  const filtered = tests.filter(t => {
    if (search && !t.name?.toLowerCase().includes(search.toLowerCase()) && !(t.seriesName || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'active' && t.isActive === false) return false;
    if (statusFilter === 'hidden' && t.isActive !== false) return false;
    return true;
  });

  useEffect(() => { setPage(1); }, [search, statusFilter]);
  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);

  async function toggleActive(id, isActive) {
    try {
      await apiFetch(`/listening/admin/tests/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn' : 'Đã hiện');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function del(id, name) {
    confirm(`Xóa vĩnh viễn đề listening "${name}"? Không thể khôi phục!`, async () => {
      try { await apiFetch(`/listening/admin/tests/${id}/permanent`, { method: 'DELETE' }); toast('Đã xóa vĩnh viễn'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  function copyLink(id) {
    const url = `https://englishwithdan.onrender.com/listening.html?testId=${id}`;
    navigator.clipboard.writeText(url)
      .then(() => toast('Đã copy link chia sẻ ✓'))
      .catch(() => toast(`Link: ${url}`, 'error'));
  }

  function totalQs(t) {
    if (t.totalQuestions != null) return t.totalQuestions;
    return (t.sections || []).reduce((sum, sec) => {
      const fromGroups = (sec.questionGroups || []).reduce((n, g) => n + (g.questions?.length || 0), 0);
      const fromFlat = sec.questions?.length || 0;
      return sum + (fromGroups || fromFlat);
    }, 0);
  }

  function formatDuration(sec) {
    if (!sec) return '–';
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  return (
    <>
      {audioTest && (
        <AudioUploadModal test={audioTest} onClose={() => setAudioTest(null)} onUploaded={load} />
      )}

      <div className="section-header">
        <h2 className="section-title">Đề Listening ({filtered.length})</h2>
        <button className="btn btn-primary" onClick={() => navigate('/listening-tests/new')}>+ Thêm đề</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input className="form-input search-input" placeholder="Tìm tên đề, series..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 160 }}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="hidden">Đang ẩn</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>TÊN ĐỀ</th>
              <th>SERIES</th>
              <th>SỐ ĐỀ</th>
              <th>AUDIO</th>
              <th>THỜI LƯỢNG</th>
              <th>SỐ CÂU</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY TẠO</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0
              ? <tr><td colSpan={9} className="table-empty">Không có đề nào</td></tr>
              : paged.map(t => (
                <tr key={t._id}>
                  <td><strong>{t.name}</strong></td>
                  <td style={{ fontSize: 13, color: 'var(--text3)' }}>{t.seriesName || '–'}</td>
                  <td>{t.testNumber}</td>
                  <td>
                    {t.audioUrl
                      ? <span className="badge badge-green" style={{ cursor: 'pointer' }} onClick={() => setAudioTest(t)} title="Click để đổi audio"><span className="dot" />Có audio</span>
                      : <span className="badge badge-gray" style={{ cursor: 'pointer' }} onClick={() => setAudioTest(t)} title="Click để upload"><span className="dot" />Chưa có</span>}
                  </td>
                  <td style={{ fontSize: 13, fontFamily: 'var(--mono)' }}>{formatDuration(t.audioDuration)}</td>
                  <td>{totalQs(t)}</td>
                  <td>
                    <span className={`badge ${t.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
                      <span className="dot" />{t.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(t.createdAt).split(' ')[0]}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => copyLink(t._id)} title="Copy link">🔗</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => navigate(`/listening-tests/${t._id}`)} title="Sửa">✏️</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setAudioTest(t)} title="Upload audio">🎵</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(t._id, t.isActive !== false)} title={t.isActive !== false ? 'Ẩn' : 'Hiện'}>{t.isActive !== false ? '🙈' : '👁'}</button>
                      {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(t._id, t.name)}>🗑</button>}
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
    </>
  );
}
