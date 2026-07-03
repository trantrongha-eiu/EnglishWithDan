import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API, apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import QuestionGroupBuilder from '../components/QuestionGroupBuilder';

function fmtDuration(sec) {
  if (!sec) return '';
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

function AudioUploader({ audioUrl, audioDuration, onUploaded }) {
  const toast = useToast();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [replacing, setReplacing] = useState(false);
  const inputRef = useRef();

  async function uploadFile(file) {
    if (!file) return;
    if (!file.type.startsWith('audio/') && file.type !== 'video/mp4') {
      toast('Chỉ chấp nhận file audio (mp3, m4a, wav, mp4...)', 'error');
      return;
    }
    setUploading(true);
    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      const res = await fetch(`${API}/listening/admin/upload-audio`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload thất bại');
      onUploaded(data.audioUrl, data.audioDuration, file.name);
      setReplacing(false);
    } catch (err) {
      toast('Upload lỗi: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  const showDropZone = !audioUrl || replacing;

  return (
    <div className="form-group" style={{ marginBottom: 10 }}>
      <label className="form-label">Audio</label>

      {audioUrl && !replacing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', background: 'rgba(61,139,255,.06)', border: '1px solid rgba(61,139,255,.25)', borderRadius: 8 }}>
          <audio controls src={audioUrl} style={{ width: '100%', height: 36 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {audioUrl.split('/').pop()}
              {audioDuration ? <span style={{ marginLeft: 8, color: 'var(--green)', fontWeight: 600 }}>⏱ {fmtDuration(audioDuration)}</span> : null}
            </span>
            <button type="button" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => setReplacing(true)}>
              🔄 Thay thế
            </button>
          </div>
        </div>
      )}

      {showDropZone && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--blue)' : 'rgba(255,255,255,.18)'}`,
            borderRadius: 8,
            padding: '28px 20px',
            textAlign: 'center',
            cursor: uploading ? 'default' : 'pointer',
            background: dragging ? 'rgba(61,139,255,.08)' : 'var(--surface2)',
            transition: 'all .15s',
            color: 'var(--text3)',
          }}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>⏳ Đang upload <strong>{fileName}</strong>… vui lòng chờ</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🎵</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Kéo thả file audio vào đây</div>
              <div style={{ fontSize: 11 }}>hoặc click để chọn — mp3, m4a, wav, mp4 (tối đa 200 MB)</div>
              {replacing && (
                <button type="button" style={{ marginTop: 10, fontSize: 11, background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', textDecoration: 'underline' }} onClick={e => { e.stopPropagation(); setReplacing(false); }}>
                  Huỷ thay thế
                </button>
              )}
            </>
          )}
          <input ref={inputRef} type="file" accept="audio/*,video/mp4" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) uploadFile(f); e.target.value = ''; }} />
        </div>
      )}
    </div>
  );
}

function defaultSection(partNumber) {
  const ranges = { 1: { start: 1, end: 10 }, 2: { start: 11, end: 20 }, 3: { start: 21, end: 30 }, 4: { start: 31, end: 40 } };
  return { partNumber, title: `Part ${partNumber}`, description: '', transcript: '', questionRange: ranges[partNumber], questionGroups: [] };
}

function parseSections(rawSections = []) {
  return [1, 2, 3, 4].map(partNum => {
    const sec = rawSections.find(s => s.partNumber === partNum);
    if (!sec) return defaultSection(partNum);
    return {
      partNumber: partNum,
      title: sec.title || `Part ${partNum}`,
      description: sec.description || '',
      transcript: sec.transcript || '',
      questionRange: sec.questionRange || { start: (partNum - 1) * 10 + 1, end: partNum * 10 },
      questionGroups: sec.questionGroups || [],
    };
  });
}

function buildSections(sections) {
  return sections.map(sec => ({
    partNumber: sec.partNumber,
    title: sec.title,
    description: sec.description || '',
    transcript: sec.transcript || '',
    questionRange: sec.questionRange,
    questionGroups: sec.questionGroups || [],
  }));
}

export default function ListeningTestEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = id === 'new';
  const goBack = () => navigate('/listening-tests');

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(isNew ? null : id);
  const [activePart, setActivePart] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveMsg, setAutoSaveMsg] = useState('');
  const autoSaveTimer = useRef(null);

  const [meta, setMeta] = useState({ name: '', seriesName: '', testNumber: 1, audioUrl: '', audioDuration: 0, isActive: true });
  const [sections, setSections] = useState([1, 2, 3, 4].map(defaultSection));

  const setMetaField = k => e => {
    setIsDirty(true);
    setMeta(f => ({
      ...f,
      [k]: e.target.type === 'checkbox' ? e.target.checked
         : e.target.type === 'number' ? Number(e.target.value)
         : e.target.value
    }));
  };

  useEffect(() => {
    if (!savedId) return;
    apiFetch(`/listening/admin/tests/${savedId}`)
      .then(d => {
        const t = d.test;
        setMeta({ name: t.name || '', seriesName: t.seriesName || '', testNumber: t.testNumber || 1, audioUrl: t.audioUrl || '', audioDuration: t.audioDuration || 0, isActive: t.isActive !== false });
        setSections(parseSections(t.sections));
      })
      .catch(() => toast('Không tải được đề', 'error'))
      .finally(() => { setLoading(false); setIsDirty(false); });
  }, [savedId]);

  async function saveAll() {
    if (!meta.name.trim()) { toast('Vui lòng nhập tên đề', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...meta, sections: buildSections(sections) };
      if (!savedId) {
        const d = await apiFetch('/listening/admin/tests', { method: 'POST', body: JSON.stringify(payload) });
        setSavedId(d.test._id);
        toast('Đã tạo đề Listening');
      } else {
        await apiFetch(`/listening/admin/tests/${savedId}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Đã lưu đề Listening');
      }
      setIsDirty(false);
      navigate('/listening-tests');
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  function updateSection(i, changes) {
    setIsDirty(true);
    setSections(prev => prev.map((s, idx) => idx === i ? { ...s, ...changes } : s));
  }
  function updateRange(i, key, val) {
    setIsDirty(true);
    setSections(prev => prev.map((s, idx) => idx === i ? { ...s, questionRange: { ...s.questionRange, [key]: Number(val) } } : s));
  }

  useEffect(() => {
    if (!isDirty) return;
    const handler = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Auto-save 2s after last change; auto-creates new test if name is present
  useEffect(() => {
    if (!isDirty) return;
    if (!savedId && !meta.name.trim()) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaveMsg('Đang lưu...');
      try {
        const payload = { ...meta, sections: buildSections(sections) };
        if (!savedId) {
          const d = await apiFetch('/listening/admin/tests', { method: 'POST', body: JSON.stringify(payload) });
          setSavedId(d.test._id);
          navigate(`/listening-tests/${d.test._id}`, { replace: true });
        } else {
          await apiFetch(`/listening/admin/tests/${savedId}`, { method: 'PUT', body: JSON.stringify(payload) });
        }
        setIsDirty(false);
        setAutoSaveMsg('Đã lưu ✓');
        setTimeout(() => setAutoSaveMsg(''), 2000);
      } catch {
        setAutoSaveMsg('');
      }
    }, 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [isDirty, sections, meta, savedId]);

  const sec = sections[activePart];

  const totalQs = sec.questionGroups.reduce((n, g) => n + (g.questions?.length || 0), 0);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => goBack()}>← Đóng</button>
        <h2 style={{ margin: 0 }}>{isNew ? 'Thêm đề Listening' : (meta.name || 'Sửa đề Listening')}</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {autoSaveMsg
            ? <span style={{ fontSize: 12, color: autoSaveMsg === 'Đã lưu ✓' ? '#16a34a' : '#6b7280', fontWeight: 600 }}>{autoSaveMsg}</span>
            : isDirty && <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>● Chưa lưu</span>}
          <button className="btn btn-ghost" onClick={() => goBack()}>Huỷ</button>
          <button className="btn btn-primary" onClick={saveAll} disabled={saving}
            style={isDirty ? { boxShadow: '0 0 0 2px #fde68a' } : {}}>
            {saving ? 'Đang lưu...' : '💾 Lưu tất cả'}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Thông tin đề</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tên đề *</label>
            <input className="form-input" value={meta.name} onChange={setMetaField('name')} placeholder="IELTS Listening Test 1" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Series</label>
            <input className="form-input" value={meta.seriesName} onChange={setMetaField('seriesName')} placeholder="Cambridge 17" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Số đề</label>
            <input className="form-input" type="number" value={meta.testNumber} onChange={setMetaField('testNumber')} min={1} />
          </div>
        </div>
        <AudioUploader
          audioUrl={meta.audioUrl}
          audioDuration={meta.audioDuration}
          onUploaded={(url, duration) => {
            setIsDirty(true);
            setMeta(f => ({ ...f, audioUrl: url, audioDuration: duration }));
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
          <input type="checkbox" checked={meta.isActive} onChange={setMetaField('isActive')} /> Kích hoạt
        </label>
      </div>

      {/* Parts */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Câu hỏi theo Part</div>

        {/* Validation overview strip */}
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.4px' }}>Tổng quan</span>
          {meta.audioUrl
            ? <span style={{ color: '#16a34a', fontWeight: 600 }}>✅ Audio đã upload</span>
            : <span style={{ color: '#ef4444', fontWeight: 600 }}>❌ Chưa upload audio</span>}
          {(() => {
            const total = sections.reduce((n, s) => n + s.questionGroups.reduce((m, g) => m + (g.questions?.length || 0), 0), 0);
            const color = total === 40 ? '#16a34a' : total > 0 ? '#d97706' : '#ef4444';
            return <span style={{ color, fontWeight: 600 }}>{total}/40 câu</span>;
          })()}
          <span style={{ color: 'var(--border)', fontSize: 14 }}>|</span>
          {sections.map((s, i) => {
            const count = s.questionGroups.reduce((n, g) => n + (g.questions?.length || 0), 0);
            const expected = (s.questionRange.end || 10) - (s.questionRange.start || 1) + 1;
            const ok = count === expected;
            return (
              <span key={i} style={{ color: ok ? '#16a34a' : count > 0 ? '#d97706' : '#6b7280', fontWeight: 600 }}>
                P{s.partNumber}: {count}/{expected}
              </span>
            );
          })}
        </div>

        <div className="inner-tabs-nav" style={{ marginBottom: 16 }}>
          {sections.map((s, i) => {
            const qCount = s.questionGroups.reduce((n, g) => n + (g.questions?.length || 0), 0);
            return (
              <button key={i} className={`inner-tab${activePart === i ? ' active' : ''}`} onClick={() => setActivePart(i)}>
                Part {s.partNumber}
                <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.7 }}>({qCount})</span>
              </button>
            );
          })}
        </div>

        {/* Part metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 12, marginBottom: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tiêu đề part</label>
            <input className="form-input" value={sec.title} onChange={e => updateSection(activePart, { title: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Câu bắt đầu</label>
            <input className="form-input" type="number" value={sec.questionRange.start} onChange={e => updateRange(activePart, 'start', e.target.value)} min={1} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Câu kết thúc</label>
            <input className="form-input" type="number" value={sec.questionRange.end} onChange={e => updateRange(activePart, 'end', e.target.value)} min={1} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Mô tả ngữ cảnh (hiển thị trước câu hỏi)</label>
          <textarea className="form-input" rows={2} value={sec.description || ''} onChange={e => updateSection(activePart, { description: e.target.value })}
            placeholder="VD: You will hear a conversation between two students discussing their assignment."
            style={{ fontSize: 13 }} />
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Transcript Part {sec.partNumber}</label>
            <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--surface2)', borderRadius: 4, padding: '2px 7px' }}>tùy chọn — dùng để review sau khi thi</span>
          </div>
          <textarea className="form-input" rows={4} value={sec.transcript || ''} onChange={e => updateSection(activePart, { transcript: e.target.value })}
            placeholder={'[Dán toàn bộ script bài nghe tại đây]\n\nVD:\nFEMALE: Hi, I\'m looking for a room to rent...\nMALE: Sure, let me tell you about what we have available...'}
            style={{ fontSize: 12, fontFamily: 'var(--mono)', lineHeight: 1.6 }} />
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Script được lưu kèm đề — không hiển thị cho học sinh trong lúc thi</div>
        </div>

        {/* Question groups for this Part */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Câu hỏi Part {sec.partNumber} ({totalQs} câu)</span>
        </div>

        <QuestionGroupBuilder
          groups={sec.questionGroups || []}
          onChange={groups => updateSection(activePart, { questionGroups: groups })}
          context="listening"
          questionFrom={sec.questionRange.start || 1}
          questionTo={sec.questionRange.end || null}
        />

        <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 6, fontSize: 11, color: 'var(--text3)' }}>
          💡 Đáp án không phân biệt hoa/thường. Nhiều đáp án fill-blank: dùng <code>/</code> ngăn cách (VD: <code>train / by train</code>). Xem hướng dẫn chi tiết trong từng nhóm câu hỏi bên trên.
        </div>
      </div>
    </div>
  );
}
