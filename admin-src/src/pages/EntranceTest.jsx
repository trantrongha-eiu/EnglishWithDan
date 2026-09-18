import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import Pagination from '../components/Pagination';

// Admin surface for the IELTS Entrance Test ("Test đầu vào") — three tabs,
// same inner-tabs-nav pattern Monitoring.jsx uses for its own tab hub:
//   Cấu hình        — which Passage / ListeningSection / WritingTask1 /
//                      Grammar set are currently assigned (EntranceTestConfig)
//   Ngân hàng Grammar — CRUD for the 25-question Grammar bank
//   Lượt làm bài      — read-only attempt monitoring + proctor log,
//                      modeled directly on MockTests.jsx's own table+modal
const PAGE_SIZE = 20;
const GRAMMAR_TYPES = [
  ['mcq', 'Trắc nghiệm (MCQ)'],
  ['gap_fill', 'Điền từ (Gap fill)'],
  ['sentence_transform', 'Viết lại câu'],
  ['vn_to_en', 'Dịch Việt → Anh'],
];

function bandChip(b) {
  if (b == null) return <span style={{ color: 'var(--text3)', fontSize: 12 }}>–</span>;
  const color = b >= 7 ? 'var(--green)' : b >= 5 ? 'var(--yellow)' : 'var(--accent2)';
  return <span style={{ color, fontWeight: 700 }}>{Number(b).toFixed(1)}</span>;
}

// ── Tab 1: Cấu hình ──────────────────────────────────────────────────────

function ConfigTab() {
  const toast = useToast();
  const [config, setConfig] = useState(null);
  const [grammarCount, setGrammarCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [passages, setPassages] = useState([]);
  const [sections, setSections] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ readingPassageId: '', listeningSectionId: '', writingTask1Id: '', grammarSetKey: 'default' });

  const load = useCallback(() => {
    return Promise.all([
      apiFetch('/admin/entrance-test/config'),
      apiFetch('/admin/passages?category=passage1&limit=300'),
      apiFetch('/admin/listening/sections'),
      apiFetch('/admin/writing-task1'),
    ]).then(([cfg, p, s, t]) => {
      setConfig(cfg.config || null);
      setGrammarCount(cfg.grammarCount || 0);
      setPassages((p.passages || []).filter(x => x.isActive !== false).concat((p.passages || []).filter(x => x.isActive === false)));
      setSections((s.sections || []).filter(x => x.isActive !== false).concat((s.sections || []).filter(x => x.isActive === false)));
      setTasks((t.tasks || []).filter(x => x.isActive !== false).concat((t.tasks || []).filter(x => x.isActive === false)));
      setForm({
        readingPassageId: cfg.config?.readingPassageId?._id || cfg.config?.readingPassageId || '',
        listeningSectionId: cfg.config?.listeningSectionId?._id || cfg.config?.listeningSectionId || '',
        writingTask1Id: cfg.config?.writingTask1Id?._id || cfg.config?.writingTask1Id || '',
        grammarSetKey: cfg.config?.grammarSetKey || 'default',
      });
    }).catch(e => toast(e.message, 'error')).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  function save() {
    if (!form.readingPassageId || !form.listeningSectionId || !form.writingTask1Id) {
      toast('Chọn đủ Reading Passage, Listening Section và Writing Task 1', 'error');
      return;
    }
    setSaving(true);
    apiFetch('/admin/entrance-test/config', { method: 'PUT', body: JSON.stringify(form) })
      .then(() => { toast('Đã lưu cấu hình Test đầu vào', 'success'); return load(); })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setSaving(false));
  }

  if (loading) return <div style={{ color: 'var(--text3)' }}>Đang tải…</div>;

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 14, marginBottom: 18, fontSize: 13, color: 'var(--text2)' }}>
        Nội dung Test đầu vào được truy cập trực tiếp theo ID, <strong>không</strong> qua danh sách hiển thị cho học sinh —
        nên nếu admin ẩn (unpublish) một bài đã gán ở đây khỏi trang luyện tập thường, Test đầu vào vẫn hoạt động bình thường.
      </div>

      <label style={{ display: 'block', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Reading — Passage 1</div>
        <select className="form-input" style={{ width: '100%' }} value={form.readingPassageId}
          onChange={e => setForm({ ...form, readingPassageId: e.target.value })}>
          <option value="">— Chọn bài đọc —</option>
          {passages.map(p => (
            <option key={p._id} value={p._id}>{p.title}{p.isActive === false ? ' (đã ẩn)' : ''}</option>
          ))}
        </select>
      </label>

      <label style={{ display: 'block', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Listening — Section</div>
        <select className="form-input" style={{ width: '100%' }} value={form.listeningSectionId}
          onChange={e => setForm({ ...form, listeningSectionId: e.target.value })}>
          <option value="">— Chọn bài nghe —</option>
          {sections.map(s => (
            <option key={s._id} value={s._id}>Part {s.partNumber} — {s.title}{s.isActive === false ? ' (đã ẩn)' : ''}</option>
          ))}
        </select>
      </label>

      <label style={{ display: 'block', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Writing — Task 1</div>
        <select className="form-input" style={{ width: '100%' }} value={form.writingTask1Id}
          onChange={e => setForm({ ...form, writingTask1Id: e.target.value })}>
          <option value="">— Chọn đề Task 1 —</option>
          {tasks.map(t => (
            <option key={t._id} value={t._id}>{(t.prompt || '').slice(0, 70)}{t.isActive === false ? ' (đã ẩn)' : ''}</option>
          ))}
        </select>
      </label>

      <label style={{ display: 'block', marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Grammar — bộ câu hỏi (setKey)</div>
        <input className="form-input" style={{ width: '100%' }} value={form.grammarSetKey}
          onChange={e => setForm({ ...form, grammarSetKey: e.target.value })} placeholder="default" />
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
          Đang dùng {grammarCount} câu ở bộ &quot;{config?.grammarSetKey || 'default'}&quot; (quản lý ở tab &quot;Ngân hàng Grammar&quot;).
          25 câu isActive đầu tiên (theo thứ tự) của bộ này sẽ được dùng cho mỗi lượt làm bài mới.
        </div>
      </label>

      <button className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? 'Đang lưu…' : 'Lưu cấu hình'}
      </button>
    </div>
  );
}

// ── Tab 2: Ngân hàng Grammar ─────────────────────────────────────────────

const EMPTY_QUESTION = { setKey: 'default', order: 0, topic: '', type: 'mcq', prompt: '', options: [{ id: 'A', text: '' }, { id: 'B', text: '' }], answer: 'A', accept: [''], explanation: '' };

function QuestionEditorModal({ question, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(question || EMPTY_QUESTION);
  const [saving, setSaving] = useState(false);
  const isNew = !question?._id;

  function setOptionText(i, text) {
    const options = form.options.map((o, idx) => idx === i ? { ...o, text } : o);
    setForm({ ...form, options });
  }
  function addOption() {
    const nextId = String.fromCharCode(65 + form.options.length);
    setForm({ ...form, options: [...form.options, { id: nextId, text: '' }] });
  }
  function removeOption(i) {
    setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) });
  }
  function setAccept(i, val) {
    const accept = form.accept.map((a, idx) => idx === i ? val : a);
    setForm({ ...form, accept });
  }

  function save() {
    setSaving(true);
    const payload = { ...form, order: Number(form.order) || 0, accept: (form.accept || []).filter(a => a.trim()) };
    const req = isNew
      ? apiFetch('/admin/entrance-test/grammar-questions', { method: 'POST', body: JSON.stringify(payload) })
      : apiFetch(`/admin/entrance-test/grammar-questions/${question._id}`, { method: 'PUT', body: JSON.stringify(payload) });
    req.then(() => { toast(isNew ? 'Đã tạo câu hỏi' : 'Đã lưu câu hỏi', 'success'); onSaved(); })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setSaving(false));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <h3>{isNew ? 'Thêm câu hỏi Grammar' : 'Sửa câu hỏi Grammar'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 10, marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Bộ (setKey)
              <input className="form-input" value={form.setKey} onChange={e => setForm({ ...form, setKey: e.target.value })} style={{ width: '100%', marginTop: 4 }} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Chủ điểm (topic)
              <input className="form-input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} style={{ width: '100%', marginTop: 4 }} placeholder="VD: Present Perfect" />
            </label>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Thứ tự
              <input type="number" className="form-input" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} style={{ width: '100%', marginTop: 4 }} />
            </label>
          </div>

          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Loại câu hỏi
            <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%', marginTop: 4 }}>
              {GRAMMAR_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>

          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
            {form.type === 'vn_to_en' ? 'Câu tiếng Việt' : 'Đề bài'}
            <textarea className="form-input" rows={2} value={form.prompt} onChange={e => setForm({ ...form, prompt: e.target.value })} style={{ width: '100%', marginTop: 4, resize: 'vertical' }} />
          </label>

          {form.type === 'mcq' ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Lựa chọn</div>
              {form.options.map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                  <span style={{ width: 20, fontWeight: 700 }}>{o.id}</span>
                  <input className="form-input" value={o.text} onChange={e => setOptionText(i, e.target.value)} style={{ flex: 1 }} placeholder={`Nội dung lựa chọn ${o.id}`} />
                  <input type="radio" name="correct-opt" checked={form.answer === o.id} onChange={() => setForm({ ...form, answer: o.id })} title="Đáp án đúng" />
                  {form.options.length > 2 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeOption(i)}>✕</button>}
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={addOption}>+ Thêm lựa chọn</button>
            </div>
          ) : (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Đáp án chấp nhận được (mỗi dòng một cách diễn đạt)</div>
              {form.accept.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <input className="form-input" value={a} onChange={e => setAccept(i, e.target.value)} style={{ flex: 1 }} />
                  {form.accept.length > 1 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, accept: form.accept.filter((_, idx) => idx !== i) })}>✕</button>}
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, accept: [...form.accept, ''] })}>+ Thêm đáp án</button>
            </div>
          )}

          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>Giải thích (tuỳ chọn)
            <textarea className="form-input" rows={2} value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} style={{ width: '100%', marginTop: 4, resize: 'vertical' }} />
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
            <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={saving}>Huỷ</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GrammarBankTab() {
  const toast = useToast();
  const [setKey, setSetKey] = useState('default');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // question object, or {} for new
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(() => {
    return apiFetch(`/admin/entrance-test/grammar-questions?setKey=${encodeURIComponent(setKey)}`)
      .then(d => setQuestions(d.questions || []))
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [setKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Adjust-during-render (not an effect) so a setKey edit flips the loading
  // state synchronously, same pattern WritingGrades.jsx uses for its filters.
  const [prevSetKey, setPrevSetKey] = useState(setKey);
  if (prevSetKey !== setKey) {
    setPrevSetKey(setKey);
    setLoading(true);
  }
  useEffect(() => { load(); }, [load]);

  function hide(q) {
    if (!window.confirm(`Ẩn câu hỏi này khỏi bộ "${setKey}"?`)) return;
    setDeletingId(q._id);
    apiFetch(`/admin/entrance-test/grammar-questions/${q._id}`, { method: 'DELETE' })
      .then(() => { toast('Đã ẩn câu hỏi', 'success'); return load(); })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setDeletingId(null));
  }

  const activeCount = questions.filter(q => q.isActive).length;

  return (
    <>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13, fontWeight: 700 }}>Bộ (setKey):
          <input className="form-input" value={setKey} onChange={e => setSetKey(e.target.value)} style={{ marginLeft: 8, width: 160 }} />
        </label>
        <span style={{ fontSize: 13, color: activeCount === 25 ? 'var(--green)' : 'var(--yellow)' }}>
          {activeCount} câu đang hoạt động {activeCount !== 25 ? '(cần đúng 25 để đủ 1 lượt Test đầu vào)' : '✓'}
        </span>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}
          onClick={() => setEditing({ ...EMPTY_QUESTION, setKey })}>+ Thêm câu hỏi</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>#</th><th>CHỦ ĐIỂM</th><th>LOẠI</th><th>ĐỀ BÀI</th><th>TRẠNG THÁI</th><th></th></tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} className="table-empty">Đang tải…</td></tr>
              : questions.length === 0
                ? <tr><td colSpan={6} className="table-empty">Chưa có câu hỏi nào trong bộ này</td></tr>
                : questions.map(q => (
                  <tr key={q._id} style={{ opacity: q.isActive ? 1 : 0.5 }}>
                    <td>{q.order}</td>
                    <td style={{ fontSize: 12 }}>{q.topic}</td>
                    <td style={{ fontSize: 12 }}>{GRAMMAR_TYPES.find(([v]) => v === q.type)?.[1] || q.type}</td>
                    <td style={{ fontSize: 12, maxWidth: 320 }}>{q.prompt}</td>
                    <td>{q.isActive ? <span className="badge badge-green">Hoạt động</span> : <span className="badge badge-gray">Đã ẩn</span>}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(q)}>✎ Sửa</button>
                      {q.isActive && (
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                          disabled={deletingId === q._id} onClick={() => hide(q)}>
                          {deletingId === q._id ? '…' : 'Ẩn'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <QuestionEditorModal question={editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }} />
      )}
    </>
  );
}

// ── Tab 3: Lượt làm bài ──────────────────────────────────────────────────

const STATUS_META = {
  'in-progress':  { label: 'Đang làm dở', cls: 'badge-gray' },
  'completed':    { label: 'Hoàn thành', cls: 'badge-green' },
  'disqualified': { label: 'Huỷ do vi phạm', cls: 'badge-red' },
  'abandoned':    { label: 'Bỏ dở', cls: 'badge-gray' },
};
const PROCTOR_LABEL = { hidden: 'Ẩn tab', blur: 'Mất focus cửa sổ', 'unload-attempt': 'Định đóng tab' };

function AttemptDetailModal({ id, onClose }) {
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    apiFetch(`/admin/entrance-test/attempts/${id}`)
      .then(d => setAttempt(d.attempt))
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const p = attempt?.proctor;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3>Chi tiết lượt làm bài</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? <div style={{ color: 'var(--text3)' }}>Đang tải…</div> : !attempt ? (
            <div style={{ color: 'var(--text3)' }}>Không tìm thấy.</div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14, fontSize: 13 }}>
                <span><strong>Học sinh:</strong> {attempt.userId?.username || attempt.userId?.email || '–'}</span>
                <span><strong>Bắt đầu:</strong> {formatDate(attempt.startedAt)}</span>
                <span><strong>Trạng thái:</strong> {STATUS_META[attempt.status]?.label || attempt.status}</span>
                <span><strong>Band tổng:</strong> {attempt.overallBand != null ? attempt.overallBand.toFixed(1) : 'chưa đủ'}</span>
              </div>

              <table className="table" style={{ marginBottom: 16 }}>
                <thead><tr><th>PHẦN</th><th>ĐÚNG</th><th>BAND</th></tr></thead>
                <tbody>
                  <tr><td>Grammar</td><td>{attempt.sections.grammar.correctCount}/{attempt.sections.grammar.totalQuestions}</td><td>{bandChip(attempt.sections.grammar.band)}</td></tr>
                  <tr><td>Reading</td><td>{attempt.sections.reading.correctCount}/{attempt.sections.reading.totalQuestions}</td><td>{bandChip(attempt.sections.reading.band)}</td></tr>
                  <tr><td>Listening</td><td>{attempt.sections.listening.correctCount}/{attempt.sections.listening.totalQuestions}</td><td>{bandChip(attempt.sections.listening.band)}</td></tr>
                  <tr>
                    <td>Writing</td>
                    <td>{attempt.sections.writing.wordCount} từ</td>
                    <td>{attempt.sections.writing.band != null ? bandChip(attempt.sections.writing.band) : <span style={{ fontSize: 12, color: 'var(--text3)' }}>{attempt.sections.writing.gradingStatus === 'confirmed' ? 'đã chấm' : 'chờ chấm'}</span>}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{
                background: p?.violated ? 'rgba(198,40,40,.08)' : 'var(--surface2)',
                border: `1px solid ${p?.violated ? 'var(--danger)' : 'var(--border)'}`,
                borderRadius: 10, padding: '12px 14px',
              }}>
                <div style={{ fontWeight: 700, marginBottom: p?.events?.length ? 10 : 0 }}>
                  {p?.violated ? '⚠️ ' : '✅ '}Proctoring: {p?.violationCount || 0} gậy
                  {p?.violated && <span style={{ color: 'var(--danger)' }}> · Bị đánh dấu vi phạm</span>}
                </div>
                {p?.events?.length > 0 && (
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: 'var(--text2)', display: 'grid', gap: 4 }}>
                    {p.events.map((e, i) => (
                      <li key={i}>
                        <strong>{PROCTOR_LABEL[e.type] || e.type}</strong>
                        <span style={{ color: 'var(--text3)' }}> · {formatDate(e.at)}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AttemptsTab() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState(null);

  const load = useCallback(() => {
    const q = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (status) q.set('status', status);
    return apiFetch(`/admin/entrance-test/attempts?${q}`)
      .then(d => { setRows(d.attempts || []); setTotal(d.total || 0); })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [page, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const [prevQuery, setPrevQuery] = useState([page, status]);
  if (prevQuery[0] !== page || prevQuery[1] !== status) {
    setPrevQuery([page, status]);
    setLoading(true);
  }

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <select className="form-input" value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ width: 180 }}>
          <option value="">Tất cả trạng thái</option>
          <option value="in-progress">Đang làm dở</option>
          <option value="completed">Hoàn thành</option>
          <option value="disqualified">Huỷ do vi phạm</option>
          <option value="abandoned">Bỏ dở</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>HỌC SINH</th><th>NGÀY BẮT ĐẦU</th><th>TRẠNG THÁI</th><th>BAND TỔNG</th><th>GẬY</th><th></th></tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} className="table-empty">Đang tải…</td></tr>
              : rows.length === 0
                ? <tr><td colSpan={6} className="table-empty">Chưa có lượt làm bài nào</td></tr>
                : rows.map(r => (
                  <tr key={r._id}>
                    <td>
                      {r.userId?._id
                        ? <Link to={`/students/${r.userId._id}`} style={{ fontWeight: 700, color: 'var(--text)' }}>{r.userId.username || r.userId.email}</Link>
                        : <strong>–</strong>}
                    </td>
                    <td style={{ fontSize: 12 }}>{formatDate(r.startedAt)}</td>
                    <td><span className={`badge ${STATUS_META[r.status]?.cls || 'badge-gray'}`}>{STATUS_META[r.status]?.label || r.status}</span></td>
                    <td>{r.overallBand != null ? bandChip(r.overallBand) : <span style={{ fontSize: 12, color: 'var(--text3)' }}>chưa đủ</span>}</td>
                    <td style={{ textAlign: 'center' }}>
                      {r.proctor?.violated
                        ? <span className="badge badge-red">⚠️ {r.proctor.violationCount}</span>
                        : <span style={{ color: 'var(--text3)' }}>{r.proctor?.violationCount || 0}</span>}
                    </td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setDetailId(r._id)}>Chi tiết</button></td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPage={setPage} />
      </div>

      {detailId && <AttemptDetailModal id={detailId} onClose={() => setDetailId(null)} />}
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'config', label: '⚙️ Cấu hình', El: ConfigTab },
  { key: 'grammar', label: '📝 Ngân hàng Grammar', El: GrammarBankTab },
  { key: 'attempts', label: '🚪 Lượt làm bài', El: AttemptsTab },
];

export default function EntranceTest() {
  const [params, setParams] = useSearchParams();
  const active = TABS.find(t => t.key === params.get('tab')) || TABS[0];
  const El = active.El;

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">🚪 IELTS Entrance Test (Test đầu vào)</h2>
      </div>
      <div className="inner-tabs-nav" style={{ marginBottom: 18 }}>
        {TABS.map(t => (
          <button key={t.key} className={`inner-tab${t.key === active.key ? ' active' : ''}`}
            onClick={() => setParams(t.key === 'config' ? {} : { tab: t.key }, { replace: true })}>
            {t.label}
          </button>
        ))}
      </div>
      <El />
    </>
  );
}
