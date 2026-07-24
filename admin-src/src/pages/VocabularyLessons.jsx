import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import LessonPreview from '../components/LessonPreview';

const DIFFICULTY_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const PREFILL_KEY = 'vocabLessonImportPrefill';

function LessonMetaModal({ lesson, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: lesson.title,
    description: lesson.description || '',
    difficulty: lesson.difficulty,
    order: lesson.order ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const set = k => e => setForm(f => ({
    ...f,
    [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value,
  }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/vocabulary-lessons/admin/${lesson._id}`, { method: 'PUT', body: JSON.stringify(form) });
      toast('Đã cập nhật');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Sửa thông tin bài học</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Tiêu đề *</label>
            <input className="form-input" value={form.title} onChange={set('title')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea className="form-input" rows={2} value={form.description} onChange={set('description')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select className="form-input" value={form.difficulty} onChange={set('difficulty')}>
                {DIFFICULTY_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Order</label>
              <input className="form-input" type="number" value={form.order} onChange={set('order')} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            Muốn sửa danh sách từ vựng? Dùng "📋 Sửa nội dung" ở bảng danh sách để paste lại lesson.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PreviewModal({ lessonId, onClose }) {
  const toast = useToast();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    apiFetch(`/vocabulary-lessons/admin/${lessonId}`)
      .then(d => setLesson(d.lesson))
      .catch(e => toast(e.message, 'error'));
  }, [lessonId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">👁 Preview</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px' }}>
          {!lesson ? <div style={{ color: 'var(--text2)' }}>Đang tải...</div> : <LessonPreview lesson={lesson} words={lesson.words} />}
        </div>
      </div>
    </div>
  );
}

function ImportHistoryModal({ onClose }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null); // full entry incl. rawText, once opened

  useEffect(() => {
    apiFetch('/vocabulary-lessons/admin/import-history')
      .then(d => setHistory(d.history || []))
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function openDetail(id) {
    try {
      const d = await apiFetch(`/vocabulary-lessons/admin/import-history/${id}`);
      setDetail(d.entry);
    } catch (e) { toast(e.message, 'error'); }
  }

  function retryInImportPage() {
    sessionStorage.setItem(PREFILL_KEY, detail.rawText);
    onClose();
    navigate('/vocabulary-lessons/import');
  }

  function copyRawText() {
    navigator.clipboard.writeText(detail.rawText)
      .then(() => toast('Đã copy nội dung gốc'))
      .catch(() => toast('Không copy được', 'error'));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📜 Import History</h3>
          <button className="modal-close" onClick={() => (detail ? setDetail(null) : onClose())} aria-label="Đóng">✕</button>
        </div>

        {detail ? (
          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setDetail(null)}>← Quay lại danh sách</button>
            <div>
              <span className={`badge ${detail.status === 'success' ? 'badge-green' : 'badge-red'}`}>
                {detail.status === 'success' ? '✓ Thành công' : '✗ Thất bại'}
              </span>
              <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text3)' }}>{formatDate(detail.createdAt)}</span>
            </div>
            {detail.errorMessages?.length > 0 && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', fontSize: 13, color: 'var(--danger)' }}>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {detail.errorMessages.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
            <pre style={{ fontFamily: 'var(--mono)', fontSize: 11.5, lineHeight: 1.7, margin: 0, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, whiteSpace: 'pre-wrap', maxHeight: 320, overflowY: 'auto' }}>{detail.rawText}</pre>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={copyRawText}>📋 Copy nội dung</button>
              <button className="btn btn-primary btn-sm" onClick={retryInImportPage}>✏️ Sửa & Import lại</button>
            </div>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px 12px' }}>
            {loading ? (
              <div style={{ padding: 20, color: 'var(--text2)' }}>Đang tải...</div>
            ) : history.length === 0 ? (
              <div style={{ padding: 20, color: 'var(--text2)' }}>Chưa có lần import nào</div>
            ) : history.map(h => (
              <div key={h._id} onClick={() => openDetail(h._id)}
                style={{ padding: '12px 12px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{h.currentTitle || h.title || '(không có tiêu đề)'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                    {formatDate(h.createdAt)} · {h.wordCount} từ
                    {!h.lessonExists && h.status === 'success' && ' · lesson đã bị xoá'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <span className={`badge ${h.status === 'success' ? 'badge-green' : 'badge-red'}`}>
                    {h.status === 'success' ? 'Imported' : 'Failed'}
                  </span>
                  {h.status === 'success' && h.lessonExists && (
                    <span className={`badge ${h.published ? 'badge-green' : 'badge-gray'}`}>{h.published ? 'Published' : 'Draft'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VocabularyLessons() {
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editLesson, setEditLesson] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const load = () => apiFetch('/vocabulary-lessons/admin')
    .then(d => setLessons(d.lessons || []))
    .catch(e => toast(e.message, 'error'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const filtered = lessons.filter(l =>
    !search || l.title?.toLowerCase().includes(search.toLowerCase())
  );

  async function togglePublish(id, published) {
    try {
      await apiFetch(`/vocabulary-lessons/admin/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ published: !published }) });
      toast(published ? 'Đã unpublish' : 'Đã publish');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function duplicate(id) {
    try {
      const d = await apiFetch(`/vocabulary-lessons/admin/${id}/duplicate`, { method: 'POST' });
      toast(d.message);
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  function del(id, title) {
    confirm(`Xoá bài học "${title}"? Toàn bộ tiến độ học sinh cho bài này sẽ bị xoá (lịch sử import vẫn được giữ lại).`, async () => {
      try { await apiFetch(`/vocabulary-lessons/admin/${id}`, { method: 'DELETE' }); toast('Đã xoá'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      {editLesson && <LessonMetaModal lesson={editLesson} onClose={() => setEditLesson(null)} onSaved={load} />}
      {previewId && <PreviewModal lessonId={previewId} onClose={() => setPreviewId(null)} />}
      {showHistory && <ImportHistoryModal onClose={() => setShowHistory(false)} />}

      <div className="section-header">
        <h2 className="section-title">Vocabulary Lessons ({filtered.length})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowHistory(true)}>📜 Import History</button>
          <button className="btn btn-primary" onClick={() => navigate('/vocabulary-lessons/import')}>+ Import bài học</button>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input className="form-input search-input" placeholder="Tìm bài học..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>TIÊU ĐỀ</th><th>DIFFICULTY</th><th>ORDER</th><th>SỐ TỪ</th><th>HOÀN THÀNH</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="table-empty">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="table-empty">Chưa có bài học nào</td></tr>
            ) : filtered.map(l => (
              <tr key={l._id}>
                <td>
                  <strong>{l.title}</strong>
                  {l.description && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{l.description.slice(0, 60)}</div>}
                </td>
                <td><span className="badge badge-blue">{l.difficulty}</span></td>
                <td>{l.order ?? 0}</td>
                <td>{l.wordCount ?? 0}</td>
                <td>{l.completedCount ?? 0}</td>
                <td>
                  <span className={`badge ${l.published ? 'badge-green' : 'badge-gray'}`}>
                    <span className="dot" />{l.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(l.createdAt).split(' ')[0]}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setPreviewId(l._id)} title="Preview">👁</button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditLesson(l)} title="Sửa thông tin">✏️</button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => navigate(`/vocabulary-lessons/import?lessonId=${l._id}`)} title="Sửa nội dung (re-import)">📋</button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => duplicate(l._id)} title="Duplicate">📑</button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => togglePublish(l._id, l.published)} title={l.published ? 'Unpublish' : 'Publish'}>
                      {l.published ? '🙈' : '📢'}
                    </button>
                    {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(l._id, l.title)} title="Delete">🗑</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
