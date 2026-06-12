import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API, apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import QuestionGroupBuilder from '../components/QuestionGroupBuilder';

// Shared audio uploader – reuses the listening upload-audio endpoint
function AudioUploader({ audioUrl, onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [replacing, setReplacing] = useState(false);
  const inputRef = useRef();

  async function uploadFile(file) {
    if (!file) return;
    if (!file.type.startsWith('audio/') && file.type !== 'video/mp4') {
      alert('Chỉ chấp nhận file audio (mp3, m4a, wav, mp4...)');
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
      alert('Upload lỗi: ' + err.message);
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
      <label className="form-label">Audio của section</label>

      {audioUrl && !replacing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', background: 'rgba(61,139,255,.06)', border: '1px solid rgba(61,139,255,.25)', borderRadius: 8 }}>
          <audio controls src={audioUrl} style={{ width: '100%', height: 36 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {audioUrl.split('/').pop()}
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
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>⏳ Đang upload <strong>{fileName}</strong>…</div>
              <div style={{ width: '100%', maxWidth: 280, height: 4, background: 'var(--surface3)', borderRadius: 2 }}>
                <div style={{ width: '60%', height: '100%', background: 'var(--blue)', borderRadius: 2 }} />
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🎵</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Kéo thả file audio vào đây</div>
              <div style={{ fontSize: 11 }}>hoặc click để chọn — mp3, m4a, wav, mp4 (tối đa 200 MB)</div>
              {replacing && (
                <button type="button" style={{ marginTop: 10, fontSize: 11, background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={e => { e.stopPropagation(); setReplacing(false); }}>
                  Huỷ thay thế
                </button>
              )}
            </>
          )}
          <input ref={inputRef} type="file" accept="audio/*,video/mp4" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files[0]; if (f) uploadFile(f); e.target.value = ''; }} />
        </div>
      )}
    </div>
  );
}

const DEFAULT_RANGES = { 1: { start: 1, end: 10 }, 2: { start: 11, end: 20 }, 3: { start: 21, end: 30 }, 4: { start: 31, end: 40 } };

export default function ListeningSectionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = id === 'new';
  const goBack = () => navigate('/listening-sections');

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(isNew ? null : id);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveMsg, setAutoSaveMsg] = useState('');
  const autoSaveTimer = useRef(null);

  const [meta, setMeta] = useState({
    partNumber: 1,
    title: '',
    description: '',
    isActualTest: false,
    transcript: '',
    audioUrl: '',
    audioFileName: '',
    audioDuration: 0,
    isActive: true,
    questionRange: { start: 1, end: 10 },
  });
  const [questionGroups, setQuestionGroups] = useState([]);

  const setField = (k, v) => {
    setIsDirty(true);
    setMeta(f => ({ ...f, [k]: v }));
  };

  // Auto-fill questionRange khi đổi partNumber, nhưng chỉ khi là section mới
  function onPartChange(part) {
    setIsDirty(true);
    const pn = Number(part);
    setMeta(f => ({
      ...f,
      partNumber: pn,
      // Chỉ reset range nếu chưa có section trong DB (savedId = null)
      questionRange: !savedId ? (DEFAULT_RANGES[pn] || f.questionRange) : f.questionRange,
    }));
  }

  useEffect(() => {
    if (!savedId) return;
    apiFetch(`/listening/admin/sections/${savedId}`)
      .then(d => {
        const s = d.section;
        setMeta({
          partNumber:     s.partNumber || 1,
          title:          s.title || '',
          description:    s.description || '',
          transcript:     s.transcript || '',
          audioUrl:       s.audioUrl || '',
          audioFileName:  s.audioFileName || '',
          audioDuration:  s.audioDuration || 0,
          isActive:       s.isActive !== false,
          isActualTest:   s.isActualTest === true,
          questionRange:  s.questionRange || DEFAULT_RANGES[s.partNumber] || { start: 1, end: 10 },
        });
        setQuestionGroups(s.questionGroups || []);
      })
      .catch(() => toast('Không tải được section', 'error'))
      .finally(() => { setLoading(false); setIsDirty(false); });
  }, [savedId]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Auto-save 2s after last change; auto-creates new section if title is present
  useEffect(() => {
    if (!isDirty) return;
    if (!savedId && !meta.title.trim()) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaveMsg('Đang lưu...');
      try {
        const payload = { ...meta, questionGroups };
        if (!savedId) {
          const d = await apiFetch('/listening/admin/sections', { method: 'POST', body: JSON.stringify(payload) });
          setSavedId(d.section._id);
          navigate(`/listening-sections/${d.section._id}`, { replace: true });
        } else {
          await apiFetch(`/listening/admin/sections/${savedId}`, { method: 'PUT', body: JSON.stringify(payload) });
        }
        setIsDirty(false);
        setAutoSaveMsg('Đã lưu ✓');
        setTimeout(() => setAutoSaveMsg(''), 2000);
      } catch {
        setAutoSaveMsg('');
      }
    }, 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [isDirty, meta, questionGroups, savedId]);

  async function saveAll() {
    if (!meta.title.trim()) { toast('Vui lòng nhập tên section', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...meta, questionGroups };
      if (!savedId) {
        const d = await apiFetch('/listening/admin/sections', { method: 'POST', body: JSON.stringify(payload) });
        setSavedId(d.section._id);
        toast('Đã tạo section Listening ✓');
      } else {
        await apiFetch(`/listening/admin/sections/${savedId}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Đã lưu section ✓');
      }
      setIsDirty(false);
      navigate('/listening-sections');
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  const totalQs = questionGroups.reduce((n, g) => n + (g.questions?.length || 0), 0);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={goBack}>← Đóng</button>
        <h2 style={{ margin: 0 }}>{isNew ? 'Thêm Bài lẻ Listening' : (meta.title || 'Sửa section')}</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {autoSaveMsg
            ? <span style={{ fontSize: 12, color: autoSaveMsg === 'Đã lưu ✓' ? '#16a34a' : '#6b7280', fontWeight: 600 }}>{autoSaveMsg}</span>
            : isDirty && <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>● Chưa lưu</span>}
          <button className="btn btn-ghost" onClick={goBack}>Huỷ</button>
          <button className="btn btn-primary" onClick={saveAll} disabled={saving}
            style={isDirty ? { boxShadow: '0 0 0 2px #fde68a' } : {}}>
            {saving ? 'Đang lưu...' : '💾 Lưu section'}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
          Thông tin section
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 110px 110px', gap: 12, marginBottom: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Part *</label>
            <select className="form-input" value={meta.partNumber}
              onChange={e => onPartChange(e.target.value)}>
              <option value={1}>Section 1</option>
              <option value={2}>Section 2</option>
              <option value={3}>Section 3</option>
              <option value={4}>Section 4</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tên section *</label>
            <input className="form-input" value={meta.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="VD: Cambridge 17 – Test 1, Section 1" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Câu từ số</label>
            <input className="form-input" type="number" value={meta.questionRange.start}
              onChange={e => { setIsDirty(true); setMeta(f => ({ ...f, questionRange: { ...f.questionRange, start: Number(e.target.value) } })); }}
              min={1} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Đến số</label>
            <input className="form-input" type="number" value={meta.questionRange.end}
              onChange={e => { setIsDirty(true); setMeta(f => ({ ...f, questionRange: { ...f.questionRange, end: Number(e.target.value) } })); }}
              min={1} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Mô tả ngữ cảnh (hiển thị trước câu hỏi)</label>
          <textarea className="form-input" rows={2} value={meta.description}
            onChange={e => setField('description', e.target.value)}
            placeholder="VD: You will hear a conversation between a student and a university accommodation officer."
            style={{ fontSize: 13 }} />
        </div>

        <AudioUploader
          audioUrl={meta.audioUrl}
          onUploaded={(url, duration, name) => {
            setIsDirty(true);
            setMeta(f => ({ ...f, audioUrl: url, audioDuration: duration, audioFileName: name || '' }));
          }}
        />

        <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={meta.isActive} onChange={e => setField('isActive', e.target.checked)} />
            Kích hoạt (hiện với học sinh)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={meta.isActualTest} onChange={e => setField('isActualTest', e.target.checked)} />
            <span>Actual Test <span style={{ fontSize: 11, color: 'var(--text3)' }}>(hiện ở tab "Actual Tests")</span></span>
          </label>
        </div>
      </div>

      {/* Transcript */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
          Transcript (tùy chọn)
        </div>
        <textarea className="form-input" rows={6} value={meta.transcript}
          onChange={e => setField('transcript', e.target.value)}
          placeholder={'Dán toàn bộ script bài nghe tại đây...\n\nVD:\nOFFICER: Good morning, how can I help you?\nSTUDENT: Hi, I\'d like to enquire about on-campus accommodation...'}
          style={{ fontSize: 12, fontFamily: 'var(--mono)', lineHeight: 1.6 }} />
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
          Script được hiển thị cho học sinh sau khi nộp bài (bên trái màn hình kết quả)
        </div>
      </div>

      {/* Question groups */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Câu hỏi
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{totalQs} câu</div>
          </div>
        </div>

        <QuestionGroupBuilder
          groups={questionGroups}
          onChange={groups => { setIsDirty(true); setQuestionGroups(groups); }}
          context="listening"
          questionFrom={meta.questionRange.start || 1}
        />

        <div style={{ marginTop: 16, padding: 14, background: 'rgba(61,139,255,.06)', border: '1px solid rgba(61,139,255,.2)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.75 }}>
          <strong style={{ color: 'var(--blue)' }}>Hướng dẫn nhập câu hỏi Listening:</strong>
          <ul style={{ margin: '6px 0 0 0', paddingLeft: 16 }}>
            <li><strong>Fill-blank trong câu:</strong> dùng <code>________</code> (8 gạch dưới). Đáp án: từ/cụm từ cần điền. Nhiều đáp án: dùng <code>word1 / word2</code></li>
            <li><strong>Fill-blank trong bảng/note:</strong> dùng <code>__Q1__</code>, <code>__Q2__</code>… trong ô bảng hoặc dòng note.</li>
            <li><strong>Multiple choice (1 đáp án):</strong> đáp án là chữ cái <code>A</code>, <code>B</code>, <code>C</code> hoặc <code>D</code></li>
            <li><strong>✦ Choose TWO/THREE Letters A-G (Q18-20):</strong> Chọn loại <strong>"Choose TWO/THREE Letters A-G ✦"</strong>. Tạo <strong>từng câu riêng biệt</strong> (Q18, Q19, Q20) với cùng danh sách options A-G. Đáp án mỗi câu = 1 chữ cái. Hệ thống tự gộp thành 1 UI chung.</li>
            <li><strong>Matching:</strong> đáp án là chữ cái của lựa chọn. VD: <code>B</code></li>
            <li><strong>Map labelling:</strong> đáp án là nhãn điền vào sơ đồ, VD: <code>car park</code></li>
          </ul>
          <div style={{ marginTop: 6 }}>Đáp án <strong>không phân biệt hoa/thường</strong>. Nhiều đáp án fill-blank: dùng <code>/</code> ngăn cách.</div>
        </div>
      </div>

      {/* Bottom save bar */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn btn-ghost" onClick={goBack}>Huỷ</button>
        <button className="btn btn-primary" onClick={saveAll} disabled={saving}
          style={isDirty ? { boxShadow: '0 0 0 2px #fde68a' } : {}}>
          {saving ? 'Đang lưu...' : '💾 Lưu section'}
        </button>
      </div>
    </div>
  );
}
