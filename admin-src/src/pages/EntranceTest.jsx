import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import Pagination from '../components/Pagination';

// Admin surface for the IELTS Entrance Test ("Test đầu vào") — three tabs,
// same inner-tabs-nav pattern Monitoring.jsx uses for its own tab hub:
//   Cấu hình          — random-draw pool sizes + which Grammar set is used
//   Ngân hàng Grammar — CRUD for the 25-question Grammar bank
//   Lượt làm bài      — attempt monitoring + proctor log, and the review
//                        queue: listen/read Writing + Speaking, adjust the
//                        AI-suggested bands, approve → result sent to student
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

// Mirrors entranceTestService.CONTENT_POOLS — shown so the admin knows what
// each random draw can pick from (hidden content is never drawn).
const POOL_ROWS = [
  ['reading', 'Reading', 'Passage 2 đang hiển thị (13 câu)', '/passages'],
  ['listening', 'Listening', 'Section Part 3 đang hiển thị, có audio dài ≤ 9 phút', '/listening-sections'],
  ['writing', 'Writing', 'Đề Task 1 đang hiển thị, có ảnh biểu đồ', '/writing-tests?tab=task1'],
  ['speaking', 'Speaking', 'Câu hỏi Part 2 đang hiển thị, có cue card', '/speaking'],
];

function ConfigTab() {
  const toast = useToast();
  const [config, setConfig] = useState(null);
  const [pools, setPools] = useState({});
  const [grammarCount, setGrammarCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grammarSetKey, setGrammarSetKey] = useState('default');

  const load = useCallback(() => {
    return apiFetch('/admin/entrance-test/config').then(cfg => {
      setConfig(cfg.config || null);
      setPools(cfg.pools || {});
      setGrammarCount(cfg.grammarCount || 0);
      setGrammarSetKey(cfg.config?.grammarSetKey || 'default');
    }).catch(e => toast(e.message, 'error')).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  function save() {
    setSaving(true);
    apiFetch('/admin/entrance-test/config', { method: 'PUT', body: JSON.stringify({ grammarSetKey }) })
      .then(() => { toast('Đã lưu cấu hình Test đầu vào', 'success'); return load(); })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setSaving(false));
  }

  if (loading) return <div style={{ color: 'var(--text3)' }}>Đang tải…</div>;

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 14, marginBottom: 18, fontSize: 13, color: 'var(--text2)' }}>
        Mỗi lượt làm bài <strong>tự bốc ngẫu nhiên</strong> một đề Reading, Listening, Writing Task 1 và Speaking Part 2
        từ ngân hàng đề, ưu tiên đề học sinh đó chưa gặp ở các lượt trước. Câu Grammar dùng chung một bộ nhưng
        được <strong>xáo trộn thứ tự</strong> cho mỗi lượt. Muốn loại một đề khỏi Test đầu vào, hãy ẩn đề đó ở trang quản lý tương ứng.
      </div>

      <div className="table-wrap" style={{ marginBottom: 20 }}>
        <table className="table">
          <thead><tr><th>KỸ NĂNG</th><th>NGUỒN ĐỀ</th><th>SỐ ĐỀ</th><th></th></tr></thead>
          <tbody>
            {POOL_ROWS.map(([key, label, desc, link]) => (
              <tr key={key}>
                <td><strong>{label}</strong></td>
                <td style={{ fontSize: 12, color: 'var(--text2)' }}>{desc}</td>
                <td>
                  <span style={{ fontWeight: 700, color: pools[key] > 0 ? 'var(--green)' : 'var(--danger)' }}>{pools[key] ?? 0}</span>
                  {!pools[key] && <span style={{ fontSize: 12, color: 'var(--danger)' }}> — thiếu đề, học sinh không thể bắt đầu</span>}
                </td>
                <td><Link to={link} style={{ fontSize: 12 }}>Quản lý →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <label style={{ display: 'block', marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Grammar — bộ câu hỏi (setKey)</div>
        <input className="form-input" style={{ width: '100%', maxWidth: 320 }} value={grammarSetKey}
          onChange={e => setGrammarSetKey(e.target.value)} placeholder="default" />
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
          Đang dùng {grammarCount} câu ở bộ &quot;{config?.grammarSetKey || 'default'}&quot;.
          25 câu isActive đầu tiên (theo thứ tự) của bộ này được dùng, xáo trộn thứ tự cho mỗi lượt làm bài.
        </div>
        <div style={{ marginTop: 6 }}>
          <Link to="/entrance-test?tab=grammar" style={{ fontSize: 12 }}>✎ Sửa / thêm câu hỏi Grammar</Link>
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
// Finer than STATUS_META for finished attempts — drives the review queue.
const RESULT_META = {
  PENDING_WRITING: { label: 'Chờ AI chấm Writing', cls: 'badge-gray' },
  PENDING_REVIEW:  { label: 'Chờ duyệt', cls: 'badge-yellow' },
  COMPLETED:       { label: 'Đã gửi kết quả', cls: 'badge-green' },
};
const PROCTOR_LABEL = { hidden: 'Ẩn tab', blur: 'Mất focus cửa sổ', 'unload-attempt': 'Định đóng tab' };
const BAND_OPTIONS = Array.from({ length: 19 }, (_, i) => (i * 0.5).toFixed(1));
const roundHalf = (n) => Math.round(n * 2) / 2; // same as backend utils/bandScore.roundIeltsHalf

function statusBadge(r) {
  const meta = r.status === 'completed' ? (RESULT_META[r.resultStatus] || STATUS_META.completed) : STATUS_META[r.status];
  return <span className={`badge ${meta?.cls || 'badge-gray'}`}>{meta?.label || r.status}</span>;
}

function fmtSec(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function BandSelect({ value, onChange, allowEmpty }) {
  return (
    <select className="form-input" style={{ width: 96 }} value={value} onChange={e => onChange(e.target.value)}>
      {allowEmpty ? <option value="">Tự tính</option> : value === '' && <option value="">—</option>}
      {BAND_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
    </select>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

const boxStyle = { fontSize: 13, background: 'var(--surface2)', borderRadius: 8, padding: 10, whiteSpace: 'pre-wrap', maxHeight: 260, overflow: 'auto' };

function AttemptDetailModal({ id, onClose, onChanged }) {
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ writingBand: '', speakingBand: '', overallBand: '', adminNote: '' });
  const [saving, setSaving] = useState(false);
  const [regrading, setRegrading] = useState(false);
  const toast = useToast();

  const applyAttempt = useCallback((a) => {
    setAttempt(a);
    if (!a) return;
    const pick = (sec) => (sec?.band != null ? sec.band : (sec?.aiBand != null ? sec.aiBand : null));
    const fmt = (b) => (b == null ? '' : Number(b).toFixed(1));
    const approved = !!a.review?.approvedAt;
    setForm({
      writingBand: fmt(pick(a.sections.writing)),
      speakingBand: fmt(pick(a.sections.speaking)),
      // Only an approved overall that differs from the plain average was a
      // real override worth pre-filling; otherwise leave it on "Tự tính".
      overallBand: approved && a.overallBand != null && a.overallBand !== a.proposed?.overall ? fmt(a.overallBand) : '',
      adminNote: a.review?.adminNote || '',
    });
  }, []);

  useEffect(() => {
    apiFetch(`/admin/entrance-test/attempts/${id}`)
      .then(d => applyAttempt(d.attempt))
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const p = attempt?.proctor;
  const legacy = attempt?.legacy;
  const sec = attempt?.sections;
  const finished = attempt?.status === 'completed';
  const approved = !!attempt?.review?.approvedAt;

  // Live overall from the (possibly edited) Writing/Speaking bands.
  const bands = sec ? [sec.grammar.band, sec.reading.band, sec.listening.band,
    form.writingBand === '' ? null : Number(form.writingBand),
    ...(legacy ? [] : [form.speakingBand === '' ? null : Number(form.speakingBand)])] : [];
  const computedOverall = bands.length && bands.every(b => b != null)
    ? roundHalf(bands.reduce((s, b) => s + b, 0) / bands.length) : null;

  function approve() {
    setSaving(true);
    apiFetch(`/admin/entrance-test/attempts/${id}/approve`, { method: 'POST', body: JSON.stringify(form) })
      .then(d => {
        applyAttempt(d.attempt);
        toast(approved ? 'Đã cập nhật kết quả' : 'Đã duyệt và gửi kết quả cho học sinh', 'success');
        onChanged?.();
      })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setSaving(false));
  }

  function regradeSpeaking() {
    setRegrading(true);
    apiFetch(`/admin/entrance-test/attempts/${id}/regrade-speaking`, { method: 'POST' })
      .then(d => { applyAttempt(d.attempt); toast('Đã chấm lại Speaking bằng AI', 'success'); onChanged?.(); })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setRegrading(false));
  }

  const wAi = sec?.writing?.aiGrading;
  const s = sec?.speaking;
  const sq = s?.questionSnapshot || {};
  const sfb = s?.aiFeedback;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 860, maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h3>Chi tiết lượt làm bài</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {/* Essay + chart + recording + transcript + approval form is far
            taller than the viewport — the body scrolls, the header stays. */}
        <div className="modal-body" style={{ overflowY: 'auto' }}>
          {loading ? <div style={{ color: 'var(--text3)' }}>Đang tải…</div> : !attempt ? (
            <div style={{ color: 'var(--text3)' }}>Không tìm thấy.</div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14, fontSize: 13, alignItems: 'center' }}>
                <span><strong>Học sinh:</strong> {attempt.userId?.username || attempt.userId?.email || '–'}</span>
                <span><strong>Bắt đầu:</strong> {formatDate(attempt.startedAt)}</span>
                <span>{statusBadge(attempt)}</span>
                {approved && (
                  <span style={{ color: 'var(--text2)' }}>
                    Duyệt lúc {formatDate(attempt.review.approvedAt)}{attempt.review.approvedByName ? ` bởi ${attempt.review.approvedByName}` : ''}
                  </span>
                )}
              </div>

              <table className="table" style={{ marginBottom: 16 }}>
                <thead><tr><th>PHẦN</th><th>KẾT QUẢ</th><th>BAND</th></tr></thead>
                <tbody>
                  <tr><td>Grammar</td><td>{sec.grammar.correctCount}/{sec.grammar.totalQuestions} đúng</td><td>{bandChip(sec.grammar.band)}</td></tr>
                  <tr><td>Reading</td><td>{sec.reading.correctCount}/{sec.reading.totalQuestions} đúng</td><td>{bandChip(sec.reading.band)}</td></tr>
                  <tr><td>Listening</td><td>{sec.listening.correctCount}/{sec.listening.totalQuestions} đúng</td><td>{bandChip(sec.listening.band)}</td></tr>
                  <tr>
                    <td>Writing</td>
                    <td>{sec.writing.wordCount} từ</td>
                    <td>
                      {attempt.proposed?.bands?.writing != null
                        ? <>{bandChip(attempt.proposed.bands.writing)} <span style={{ fontSize: 11, color: 'var(--text3)' }}>{sec.writing.band != null ? '(đã duyệt)' : sec.writing.gradingStatus === 'confirmed' ? '(GV đã chấm)' : '(AI đề xuất)'}</span></>
                        : <span style={{ fontSize: 12, color: 'var(--text3)' }}>{finished ? 'AI đang chấm…' : '–'}</span>}
                    </td>
                  </tr>
                  {!legacy && (
                    <tr>
                      <td>Speaking</td>
                      <td>{s?.durationSec ? `${fmtSec(s.durationSec)} ghi âm` : (finished ? 'không ghi âm' : '–')}</td>
                      <td>
                        {attempt.proposed?.bands?.speaking != null
                          ? <>{bandChip(attempt.proposed.bands.speaking)} <span style={{ fontSize: 11, color: 'var(--text3)' }}>{s.band != null ? '(đã duyệt)' : '(AI đề xuất)'}</span></>
                          : <span style={{ fontSize: 12, color: 'var(--text3)' }}>{!finished ? '–' : s?.aiStatus === 'error' ? 'AI lỗi — nhập tay' : 'AI đang chấm…'}</span>}
                      </td>
                    </tr>
                  )}
                  <tr><td><strong>Overall</strong></td><td></td><td>{bandChip(approved ? attempt.overallBand : attempt.proposed?.overall)}</td></tr>
                </tbody>
              </table>

              {sec.writing.promptSnapshot && sec.writing.submittedAt && (
                <Panel title="✍️ Writing Task 1">
                  <div style={{ fontSize: 13, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{sec.writing.promptSnapshot.prompt}</div>
                  {sec.writing.promptSnapshot.imageUrl && (
                    <img src={sec.writing.promptSnapshot.imageUrl} alt="Task 1" style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 8, marginBottom: 8 }} />
                  )}
                  <div style={boxStyle}>{sec.writing.writingAnswer || <em style={{ color: 'var(--text3)' }}>(bỏ trống)</em>}</div>
                  {wAi?.bandScore != null && (
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>
                      <strong>AI:</strong> Band {wAi.bandScore} · TA {wAi.ta?.score ?? '–'} · CC {wAi.cc?.score ?? '–'} · LR {wAi.lr?.score ?? '–'} · GRA {wAi.gra?.score ?? '–'}
                      {wAi.overallFeedback && <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{wAi.overallFeedback}</div>}
                    </div>
                  )}
                </Panel>
              )}

              {!legacy && s && s.submittedAt && (
                <Panel title="🎤 Speaking Part 2">
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{sq.question}</div>
                  {sq.cueCard && <div style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'pre-wrap', margin: '4px 0 10px' }}>{sq.cueCard}</div>}
                  {s.audioUrl
                    ? <audio controls preload="none" src={s.audioUrl} style={{ width: '100%', marginBottom: 8 }} />
                    : <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Không có bản ghi âm (học sinh không thu âm hoặc tải lên thất bại).</div>}
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Transcript học sinh nộp</div>
                  <div style={boxStyle}>{s.transcript || <em style={{ color: 'var(--text3)' }}>(trống)</em>}</div>
                  {s.aiTranscript && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 700, margin: '8px 0 4px' }}>Transcript AI nghe từ bản ghi âm</div>
                      <div style={boxStyle}>{s.aiTranscript}</div>
                    </>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    {s.aiStatus === 'done' && sfb && (sfb.noGenuineAnswer
                      ? <span><strong>AI:</strong> không phát hiện câu trả lời thực sự</span>
                      : <span><strong>AI:</strong> Band {sfb.overallBand} · FC {sfb.fluency} · LR {sfb.vocabulary} · GRA {sfb.grammar} · P {sfb.pronunciation}{sfb.pronunciationFromAudio ? '' : ' (P ước tính từ transcript)'}</span>)}
                    {s.aiStatus === 'pending' && <span>AI đang chấm…</span>}
                    {s.aiStatus === 'error' && <span style={{ color: 'var(--danger)' }}>AI lỗi: {s.aiError || 'không rõ'}</span>}
                    {finished && (
                      <button className="btn btn-ghost btn-sm" onClick={regradeSpeaking} disabled={regrading}>
                        {regrading ? 'Đang chấm…' : '↻ Chấm lại bằng AI'}
                      </button>
                    )}
                  </div>
                  {sfb?.overallFeedback && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, whiteSpace: 'pre-wrap' }}>{sfb.overallFeedback}</div>}
                </Panel>
              )}

              {finished && (
                <Panel title={approved ? '✅ Kết quả đã gửi — có thể chỉnh sửa' : '📝 Duyệt kết quả'}>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 10 }}>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Writing<br />
                      <BandSelect value={form.writingBand} onChange={v => setForm({ ...form, writingBand: v })} />
                    </label>
                    {!legacy && (
                      <label style={{ fontSize: 12, fontWeight: 700 }}>Speaking<br />
                        <BandSelect value={form.speakingBand} onChange={v => setForm({ ...form, speakingBand: v })} />
                      </label>
                    )}
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Overall<br />
                      <BandSelect allowEmpty value={form.overallBand} onChange={v => setForm({ ...form, overallBand: v })} />
                    </label>
                    <div style={{ fontSize: 12, color: 'var(--text2)', paddingBottom: 8 }}>
                      Trung bình {legacy ? 4 : 5} kỹ năng: <strong>{computedOverall != null ? computedOverall.toFixed(1) : '—'}</strong>
                    </div>
                  </div>
                  <textarea className="form-input" rows={3} style={{ width: '100%', resize: 'vertical', marginBottom: 10 }}
                    placeholder="Nhận xét gửi kèm cho học sinh (tuỳ chọn)"
                    value={form.adminNote} onChange={e => setForm({ ...form, adminNote: e.target.value })} />
                  <button className="btn btn-primary" onClick={approve}
                    disabled={saving || form.writingBand === '' || (!legacy && form.speakingBand === '')}>
                    {saving ? 'Đang lưu…' : approved ? 'Cập nhật kết quả' : 'Duyệt & gửi kết quả cho học sinh'}
                  </button>
                  {!approved && (
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
                      Học sinh chỉ thấy điểm sau khi bạn duyệt, và sẽ nhận một tin nhắn trong hộp thư.
                    </div>
                  )}
                </Panel>
              )}

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
  const [pendingReview, setPendingReview] = useState(0);
  const [page, setPage] = useState(1);
  // '' | a STATUS_META key | 'review:<RESULT_META key>'
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState(null);

  const load = useCallback(() => {
    const q = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (filter.startsWith('review:')) q.set('resultStatus', filter.slice(7));
    else if (filter) q.set('status', filter);
    return apiFetch(`/admin/entrance-test/attempts?${q}`)
      .then(d => { setRows(d.attempts || []); setTotal(d.total || 0); setPendingReview(d.pendingReview || 0); })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [page, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const [prevQuery, setPrevQuery] = useState([page, filter]);
  if (prevQuery[0] !== page || prevQuery[1] !== filter) {
    setPrevQuery([page, filter]);
    setLoading(true);
  }

  useEffect(() => { load(); }, [load]);

  function showPending() { setFilter('review:PENDING_REVIEW'); setPage(1); }

  return (
    <>
      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="form-input" value={filter}
          onChange={e => { setFilter(e.target.value); setPage(1); }} style={{ width: 220 }}>
          <option value="">Tất cả lượt làm bài</option>
          <option value="review:PENDING_REVIEW">Chờ duyệt</option>
          <option value="review:PENDING_WRITING">Chờ AI chấm Writing</option>
          <option value="review:COMPLETED">Đã gửi kết quả</option>
          <option value="in-progress">Đang làm dở</option>
          <option value="disqualified">Huỷ do vi phạm</option>
          <option value="abandoned">Bỏ dở</option>
        </select>
        {pendingReview > 0 && filter !== 'review:PENDING_REVIEW' && (
          <button className="btn btn-ghost btn-sm" onClick={showPending}>
            <span className="badge badge-yellow">{pendingReview}</span> lượt đang chờ duyệt →
          </button>
        )}
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
                    <td>{statusBadge(r)}</td>
                    <td>
                      {r.resultStatus === 'COMPLETED' && r.overallBand != null
                        ? bandChip(r.overallBand)
                        : r.proposed?.overall != null
                          ? <span title="Band đề xuất — chưa gửi cho học sinh">{bandChip(r.proposed.overall)} <span style={{ fontSize: 11, color: 'var(--text3)' }}>đề xuất</span></span>
                          : <span style={{ fontSize: 12, color: 'var(--text3)' }}>chưa đủ</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.proctor?.violated
                        ? <span className="badge badge-red">⚠️ {r.proctor.violationCount}</span>
                        : <span style={{ color: 'var(--text3)' }}>{r.proctor?.violationCount || 0}</span>}
                    </td>
                    <td>
                      <button className={`btn btn-sm ${r.resultStatus === 'PENDING_REVIEW' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDetailId(r._id)}>
                        {r.resultStatus === 'PENDING_REVIEW' ? 'Duyệt' : 'Chi tiết'}
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPage={setPage} />
      </div>

      {detailId && <AttemptDetailModal id={detailId} onClose={() => setDetailId(null)} onChanged={load} />}
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
