import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, API } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

function AssembleModal({ sections, onClose, onSuccess }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', seriesName: '', testNumber: 1 });
  const [picks, setPicks] = useState({ 1: '', 2: '', 3: '', 4: '' });

  // Group sections by partNumber
  const byPart = { 1: [], 2: [], 3: [], 4: [] };
  sections.forEach(s => { if (byPart[s.partNumber]) byPart[s.partNumber].push(s); });

  async function submit() {
    if (!form.name.trim()) { toast('Nhập tên đề', 'error'); return; }
    if (!Object.values(picks).some(v => v)) { toast('Chọn ít nhất 1 section', 'error'); return; }
    setSaving(true);
    try {
      const d = await apiFetch('/listening/admin/assemble', {
        method: 'POST',
        body: JSON.stringify({ ...form, sectionIds: picks }),
      });
      toast(`✓ ${d.message || 'Đã tạo đề Listening'}`, 'success');
      onSuccess(d.test._id);
      onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Tạo Full Test từ Bài lẻ</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Test info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tên đề *</label>
              <input className="form-input" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="VD: Cambridge 17 – Test 1" autoFocus />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Số đề</label>
              <input className="form-input" type="number" value={form.testNumber} min={1}
                onChange={e => setForm(f => ({ ...f, testNumber: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Series (tùy chọn)</label>
            <input className="form-input" value={form.seriesName}
              onChange={e => setForm(f => ({ ...f, seriesName: e.target.value }))}
              placeholder="VD: Cambridge 17" />
          </div>

          {/* Section selectors */}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--text2)' }}>
              Chọn bài lẻ cho từng Part (bỏ trống = phần câu hỏi trống)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3, 4].map(part => {
                const pc = { 1: '#1d4ed8', 2: '#15803d', 3: '#b45309', 4: '#6d28d9' }[part];
                return (
                  <div key={part} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ minWidth: 76, fontSize: 12, fontWeight: 700, color: pc }}>
                      Section {part}
                    </span>
                    <select className="form-input" style={{ flex: 1 }}
                      value={picks[part]}
                      onChange={e => setPicks(p => ({ ...p, [part]: e.target.value }))}>
                      <option value="">(Để trống – không có câu hỏi)</option>
                      {byPart[part].map(s => (
                        <option key={s._id} value={s._id}>
                          {s.title} {s.questionRange ? `(câu ${s.questionRange.start}–${s.questionRange.end})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: 'rgba(61,139,255,.06)', border: '1px solid rgba(61,139,255,.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text2)' }}>
            💡 Sau khi tạo xong, vào <strong>Đề Listening</strong> để upload 1 file audio dài cho toàn bộ đề.
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Huỷ</button>
            <button className="btn btn-primary" onClick={submit} disabled={saving}>
              {saving ? 'Đang tạo...' : '🎧 Tạo Full Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [showAssemble, setShowAssemble] = useState(false);

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
      {showAssemble && (
        <AssembleModal
          sections={sections}
          onClose={() => setShowAssemble(false)}
          onSuccess={testId => navigate(`/listening-tests/${testId}`)}
        />
      )}

      <div className="section-header">
        <h2 className="section-title">Bài lẻ Listening ({filtered.length})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowAssemble(true)}>🎧 Tạo Full Test</button>
          <button className="btn btn-primary" onClick={() => navigate('/listening-sections/new')}>+ Thêm section</button>
        </div>
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
                          onClick={() => navigate(`/listening-sections/${s._id}`)} title="Sửa">✏️</button>
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
