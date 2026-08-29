import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { downloadCsv } from '../utils/csvDownload';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

// Seed-reset caveat (see backend/scripts/seedEssentialGrammar.js): every
// server restart re-upserts every lesson from the seed data via a full
// replaceOne, which has no isActive field — so toggling a seed-originated
// lesson's visibility off, or deleting it, does not survive a restart.
// Surfaced directly in the UI rather than silently papered over.
const SEED_RESET_NOTE = 'Lưu ý: nếu bài học này thuộc seed data, trạng thái này có thể bị đặt lại khi server khởi động lại.';

function LessonMetaModal({ lesson, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: lesson.title,
    summary: lesson.summary || '',
    icon: lesson.icon || '📘',
    orderIndex: lesson.orderIndex ?? 0,
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
      await apiFetch(`/essential-grammar/admin/${lesson._id}`, { method: 'PUT', body: JSON.stringify(form) });
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
            <label className="form-label">Tóm tắt</label>
            <textarea className="form-input" rows={2} value={form.summary} onChange={set('summary')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Icon</label>
              <input className="form-input" value={form.icon} onChange={set('icon')} />
            </div>
            <div className="form-group">
              <label className="form-label">Thứ tự</label>
              <input className="form-input" type="number" value={form.orderIndex} onChange={set('orderIndex')} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            Danh mục và nội dung bài học (câu hỏi, công thức...) không sửa được ở đây — chỉnh sửa trực tiếp trong seed data (backend/scripts/essentialGrammarData/).
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

function studentDisplayName(s) {
  return [s.firstName, s.lastName].filter(Boolean).join(' ') || s.username || '(không tên)';
}

function LessonStudentsModal({ lessonId, lessonTitle, onClose }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [detailStudent, setDetailStudent] = useState(null);
  const [detailHistory, setDetailHistory] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch(`/essential-grammar/admin/${lessonId}/students`),
      apiFetch(`/essential-grammar/admin/${lessonId}/missed-questions`),
    ])
      .then(([s, q]) => { setStudents(s.students || []); setMissedQuestions(q.questions || []); })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [lessonId]);

  async function openStudentHistory(student) {
    setDetailStudent({ userId: student.userId, name: studentDisplayName(student) });
    setDetailHistory(null);
    try {
      const d = await apiFetch(`/essential-grammar/admin/${lessonId}/students/${student.userId}/history`);
      setDetailHistory(d.history || []);
    } catch (e) { toast(e.message, 'error'); }
  }

  async function doExport() {
    setExporting(true);
    try {
      await downloadCsv(`/essential-grammar/admin/${lessonId}/export.csv`, `${lessonTitle}.csv`);
    } catch (e) { toast(e.message, 'error'); }
    finally { setExporting(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">👥 {lessonTitle}</h3>
          <button className="modal-close" onClick={() => (detailStudent ? setDetailStudent(null) : onClose())} aria-label="Đóng">✕</button>
        </div>

        {detailStudent ? (
          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px' }}>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }} onClick={() => setDetailStudent(null)}>← Quay lại danh sách</button>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>{detailStudent.name} — Lịch sử làm bài</div>
            {detailHistory === null ? (
              <div style={{ color: 'var(--text2)' }}>Đang tải...</div>
            ) : detailHistory.length === 0 ? (
              <div style={{ color: 'var(--text2)' }}>Chưa có lần làm nào</div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>NGÀY GIỜ</th><th>ĐIỂM</th><th>ĐÚNG/SAI</th><th>THỜI GIAN</th></tr></thead>
                  <tbody>
                    {detailHistory.map(h => (
                      <tr key={h._id}>
                        <td>{formatDate(h.createdAt)}</td>
                        <td>{h.score}%</td>
                        <td>{h.correct}/{h.wrong + h.correct}</td>
                        <td>{h.timeSpent}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px' }}>
            {loading ? (
              <div style={{ color: 'var(--text2)' }}>Đang tải...</div>
            ) : (
              <>
                {missedQuestions.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                      Câu hỏi hay sai nhất
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {missedQuestions.map((q, i) => (
                        <span key={i} className="badge badge-red" title={`${q.count} lượt sai — ${q.question}`}>
                          {q.question.length > 60 ? q.question.slice(0, 60) + '…' : q.question} ×{q.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {students.length === 0 ? (
                  <div style={{ color: 'var(--text2)' }}>Chưa có học sinh nào làm bài học này</div>
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>HỌC SINH</th><th>GẦN NHẤT</th><th>BEST</th><th>SỐ LẦN</th><th>HOẠT ĐỘNG</th></tr></thead>
                      <tbody>
                        {students.map(s => (
                          <tr key={s.userId} style={{ cursor: 'pointer' }} onClick={() => openStudentHistory(s)}>
                            <td>{studentDisplayName(s)}</td>
                            <td>{s.score}%</td>
                            <td><strong>{s.bestScore}%</strong></td>
                            <td>{s.attemptCount}</td>
                            <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(s.lastAttempt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!detailStudent && (
          <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={doExport} disabled={exporting || students.length === 0}>
              {exporting ? 'Đang xuất...' : '⬇ Export CSV'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EssentialGrammarLessons() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [editLesson, setEditLesson] = useState(null);
  const [studentsLesson, setStudentsLesson] = useState(null);

  const load = () => apiFetch('/essential-grammar/admin')
    .then(d => setLessons(d.lessons || []))
    .catch(e => toast(e.message, 'error'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const categories = [...new Set(lessons.map(l => l.category))];
  const filtered = lessons.filter(l =>
    (!search || l.title?.toLowerCase().includes(search.toLowerCase())) &&
    (!category || l.category === category)
  );

  async function toggleActive(id, isActiveNow) {
    setLessons(prev => prev.map(l => (l._id === id ? { ...l, isActive: !isActiveNow } : l)));
    try {
      await apiFetch(`/essential-grammar/admin/${id}/active`, { method: 'PATCH', body: JSON.stringify({ isActive: !isActiveNow }) });
      toast(isActiveNow ? 'Đã ẩn' : 'Đã hiện');
    } catch (e) {
      setLessons(prev => prev.map(l => (l._id === id ? { ...l, isActive: isActiveNow } : l)));
      toast(e.message, 'error');
    }
  }

  function del(id, title) {
    confirm(`Xoá bài học "${title}"? Toàn bộ tiến độ học sinh cho bài này sẽ bị xoá. ${SEED_RESET_NOTE}`, async () => {
      try {
        await apiFetch(`/essential-grammar/admin/${id}`, { method: 'DELETE' });
        setLessons(prev => prev.filter(l => l._id !== id));
        toast('Đã xoá');
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      {editLesson && <LessonMetaModal lesson={editLesson} onClose={() => setEditLesson(null)} onSaved={load} />}
      {studentsLesson && (
        <LessonStudentsModal
          lessonId={studentsLesson._id}
          lessonTitle={studentsLesson.title}
          onClose={() => setStudentsLesson(null)}
        />
      )}

      <div className="section-header">
        <h2 className="section-title">Essential Grammar ({filtered.length})</h2>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input className="form-input search-input" placeholder="Tìm bài học..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="form-input" value={category} onChange={e => setCategory(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>TIÊU ĐỀ</th><th>DANH MỤC</th><th>THỨ TỰ</th><th>HOÀN THÀNH</th><th>ĐIỂM TB</th><th>HOẠT ĐỘNG</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="table-empty">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="table-empty">Chưa có bài học nào</td></tr>
            ) : filtered.map(l => (
              <tr key={l._id}>
                <td>
                  <strong>{l.icon} {l.title}</strong>
                  {l.summary && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{l.summary.slice(0, 60)}</div>}
                </td>
                <td><span className="badge badge-blue">{l.category}</span></td>
                <td>{l.orderIndex ?? 0}</td>
                <td>{l.completedCount ?? 0}</td>
                <td>{l.averageScore != null ? `${l.averageScore}%` : '–'}</td>
                <td style={{ fontSize: 12, color: 'var(--text3)' }}>{l.lastActivity ? formatDate(l.lastActivity) : '–'}</td>
                <td>
                  <span className={`badge ${l.isActive ? 'badge-green' : 'badge-gray'}`}>
                    <span className="dot" />{l.isActive ? 'Hiện' : 'Ẩn'}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(l.createdAt).split(' ')[0]}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setStudentsLesson(l)} title="Xem điểm học sinh">👥</button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditLesson(l)} title="Sửa thông tin">✏️</button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(l._id, l.isActive)} title={l.isActive ? 'Ẩn (có thể bị reset khi server restart)' : 'Hiện'}>
                      {l.isActive ? '🙈' : '📢'}
                    </button>
                    {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(l._id, l.title)} title="Xoá">🗑</button>}
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
