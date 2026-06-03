import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, API } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

const PART_LABEL = { 1: 'Section 1', 2: 'Section 2', 3: 'Section 3', 4: 'Section 4' };
const PART_COLOR = {
  1: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  2: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  3: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  4: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
};

function AudioUploadModal({ section, onClose, onUploaded }) {
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
      const res = await fetch(`${API}/listening/admin/sections/${section._id}/audio`, {
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
          <h3 className="modal-title">Upload Audio – {section.title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            Part: <strong>{PART_LABEL[section.partNumber]}</strong>
          </div>
          {section.audioUrl && (
            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Đã có audio</span><br />
              <audio controls src={section.audioUrl} style={{ width: '100%', height: 32, marginTop: 6 }} />
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
              ⏳ Đang upload lên Cloudinary, vui lòng chờ...
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

export default function ListeningSections() {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [sections, setSections] = useState([]);
  const [search, setSearch] = useState('');
  const [partFilter, setPartFilter] = useState('all');
  const [audioSection, setAudioSection] = useState(null);

  const load = () =>
    apiFetch('/listening/admin/sections')
      .then(d => setSections(d.sections || []))
      .catch(e => toast(e.message, 'error'));

  useEffect(() => { load(); }, []);

  const filtered = sections.filter(s => {
    const matchPart = partFilter === 'all' || String(s.partNumber) === partFilter;
    const matchSearch = !search ||
      s.title?.toLowerCase().includes(search.toLowerCase());
    return matchPart && matchSearch;
  });

  async function toggleActive(id, isActive) {
    try {
      await apiFetch(`/listening/admin/sections/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn section' : 'Đã hiện section');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function del(id, title) {
    confirm(`Ẩn section "${title}"? (có thể khôi phục bằng cách bật lại)`, async () => {
      try {
        await apiFetch(`/listening/admin/sections/${id}`, { method: 'DELETE' });
        toast('Đã ẩn section');
        load();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  function formatDuration(sec) {
    if (!sec) return '–';
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function totalQs(s) {
    return (s.questionGroups || []).reduce((sum, g) => sum + (g.questions?.length || 0), 0);
  }

  return (
    <>
      {audioSection && (
        <AudioUploadModal section={audioSection} onClose={() => setAudioSection(null)} onUploaded={load} />
      )}

      <div className="section-header">
        <h2 className="section-title">Bài lẻ Listening ({filtered.length})</h2>
        <button className="btn btn-primary" onClick={() => navigate('/admin/listening-sections/new')}>
          + Thêm section
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input search-input" placeholder="Tìm tên section..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
        <select className="form-input" value={partFilter} onChange={e => setPartFilter(e.target.value)}
          style={{ maxWidth: 160 }}>
          <option value="all">Tất cả Section</option>
          <option value="1">Section 1</option>
          <option value="2">Section 2</option>
          <option value="3">Section 3</option>
          <option value="4">Section 4</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>PART</th>
              <th>TÊN SECTION</th>
              <th>AUDIO</th>
              <th>THỜI LƯỢNG</th>
              <th>SỐ CÂU</th>
              <th>DẢI CÂU</th>
              <th>TRẠNG THÁI</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={8} className="table-empty">Không có section nào</td></tr>
              : filtered.map(s => {
                const pc = PART_COLOR[s.partNumber] || PART_COLOR[1];
                return (
                  <tr key={s._id}>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                        fontSize: 12, fontWeight: 700,
                        background: pc.bg, color: pc.color, border: `1px solid ${pc.border}`
                      }}>
                        {PART_LABEL[s.partNumber]}
                      </span>
                    </td>
                    <td><strong>{s.title}</strong></td>
                    <td>
                      {s.audioUrl
                        ? <span className="badge badge-green" style={{ cursor: 'pointer' }}
                            onClick={() => setAudioSection(s)} title="Click để đổi audio">
                            <span className="dot" />Có audio
                          </span>
                        : <span className="badge badge-gray" style={{ cursor: 'pointer' }}
                            onClick={() => setAudioSection(s)} title="Click để upload">
                            <span className="dot" />Chưa có
                          </span>}
                    </td>
                    <td style={{ fontSize: 13, fontFamily: 'var(--mono)' }}>{formatDuration(s.audioDuration)}</td>
                    <td>{totalQs(s)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {s.questionRange?.start && s.questionRange?.end
                        ? `${s.questionRange.start}–${s.questionRange.end}`
                        : '–'}
                    </td>
                    <td>
                      <span className={`badge ${s.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
                        <span className="dot" />{s.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => navigate(`/admin/listening-sections/${s._id}`)} title="Sửa">✏️</button>
                        <button className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setAudioSection(s)} title="Upload audio">🎵</button>
                        <button className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => toggleActive(s._id, s.isActive !== false)}
                          title={s.isActive !== false ? 'Ẩn' : 'Hiện'}>
                          {s.isActive !== false ? '🙈' : '👁'}
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon"
                          onClick={() => del(s._id, s.title)}>🗑</button>
                      </div>
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
