import { useEffect, useState, useRef } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/Pagination';
import QuestionGroupBuilder from '../components/QuestionGroupBuilder';

const PAGE = 15;
const CATS = [
  { value: 'passage1', label: 'Passage 1' },
  { value: 'passage2', label: 'Passage 2' },
  { value: 'passage3', label: 'Passage 3' },
];
const DIFFS = ['easy', 'medium', 'hard'];
const PASSAGE_RANGES = {
  passage1: { start: 1, end: 13 },
  passage2: { start: 14, end: 26 },
  passage3: { start: 27, end: 40 },
};


function PassageQuestionsModal({ passageId, passageTitle, onClose }) {
  const toast = useToast();
  const [passageData, setPassageData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    apiFetch(`/admin/passages/${passageId}`)
      .then(d => { setPassageData(d.passage); setGroups(d.passage?.questionGroups || []); })
      .catch(() => toast('Không tải được câu hỏi', 'error'))
      .finally(() => setLoading(false));
    return () => clearTimeout(saveTimer.current);
  }, [passageId]);

  async function persist(updatedGroups) {
    setSaving(true);
    try {
      await apiFetch(`/admin/passages/${passageId}`, { method: 'PUT', body: JSON.stringify({ questionGroups: updatedGroups }) });
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  function handleGroupsChange(updated) {
    setGroups(updated);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(updated), 700);
  }

  const totalQs = groups.reduce((n, g) => n + (g.questions?.length || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 860, maxHeight: '94vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📝 Câu hỏi — {passageTitle}</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {saving && <span style={{ fontSize: 12, color: 'var(--text3)' }}>Đang lưu...</span>}
            {!saving && totalQs > 0 && <span style={{ fontSize: 12, color: 'var(--green)' }}>✓ Đã lưu</span>}
            <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}>Đang tải...</div>
          ) : (
            <>
              <div style={{ marginBottom: 14, padding: 12, background: 'rgba(61,139,255,.06)', border: '1px solid rgba(61,139,255,.2)', borderRadius: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--blue)' }}>Hướng dẫn nhập câu hỏi Reading:</strong>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: 16 }}>
                  <li><strong>True/False/NG:</strong> Nhóm "Câu hỏi thường". Câu hỏi là statement, đáp án: <code>TRUE</code> / <code>FALSE</code> / <code>NOT GIVEN</code></li>
                  <li><strong>Yes/No/NG:</strong> Tương tự nhưng hỏi quan điểm tác giả. Đáp án: <code>YES</code> / <code>NO</code> / <code>NOT GIVEN</code></li>
                  <li><strong>Multiple Choice:</strong> Đáp án là chữ cái <code>A</code>, <code>B</code>, <code>C</code> hoặc <code>D</code></li>
                  <li><strong>Choose TWO/THREE Letters A-G ✦:</strong> Tạo nhiều câu riêng (VD: Q14, Q15) cùng options — mỗi câu đáp án 1 chữ cái. Dùng khi đề hỏi "Choose TWO answers".</li>
                  <li><strong>Fill-blank:</strong> Dùng <code>________</code> trong câu. Đáp án: từ cần điền. Nhiều đáp án: <code>word1 / word2</code></li>
                  <li><strong>Matching Headings:</strong> Nhóm "Matching Headings". Câu hỏi = tên đoạn (VD: <em>Section A</em>). Đáp án = số La Mã (VD: <em>iii</em>)</li>
                  <li><strong>Summary Completion:</strong> Nhóm "Summary Completion". Dùng <code>__Q14__</code> trong đoạn tóm tắt. Word Bank A→J. Đáp án = <strong>từ thực tế</strong> (VD: <code>popular</code>), không phải chữ cái.</li>
                  <li><strong>Table/Note:</strong> Dùng nhóm "Bảng" hoặc "Note Completion". Đặt <code>__Q1__</code> trong ô/dòng cần điền.</li>
                  <li><strong>Sentence Endings:</strong> Nhóm "Matching / Sentence Endings" → chọn chế độ Sentence Endings. Câu hỏi = phần đầu câu, đáp án = chữ cái phần kết.</li>
                </ul>
                <div style={{ marginTop: 5, color: 'var(--text3)' }}>Mỗi nhóm câu hỏi lưu tự động khi thay đổi (thấy "✓ Đã lưu" ở tiêu đề).</div>
              </div>
              <QuestionGroupBuilder groups={groups} onChange={handleGroupsChange} context="reading" questionFrom={passageData?.questionRange?.start || 1} questionTo={passageData?.questionRange?.end || null} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function diffBadge(d) {
  const map = { easy: ['badge-green', 'Dễ'], medium: ['badge-blue', 'TB'], hard: ['badge-red', 'Khó'] };
  const [cls, label] = map[d] || ['badge-gray', d];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function catBadge(c) {
  const cat = CATS.find(x => x.value === c);
  return <span className="badge badge-blue">{cat?.label || c}</span>;
}

function PassageModal({ passageId, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: '', category: 'passage1', content: '', difficulty: 'medium',
    questionRange: { start: 1, end: 13 }, tags: '', isActive: true, isActualTest: false
  });
  const [loading, setLoading] = useState(!!passageId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!passageId) return;
    apiFetch(`/admin/passages/${passageId}`)
      .then(d => {
        const p = d.passage;
        setForm({
          title: p.title || '',
          category: p.category || 'passage1',
          content: p.content || '',
          difficulty: p.difficulty || 'medium',
          questionRange: { start: p.questionRange?.start ?? 1, end: p.questionRange?.end ?? 13 },
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
          isActive: p.isActive !== false,
          isActualTest: p.isActualTest === true
        });
      })
      .catch(() => toast('Không tải được bài đọc', 'error'))
      .finally(() => setLoading(false));
  }, [passageId]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setRange = k => e => setForm(f => ({ ...f, questionRange: { ...f.questionRange, [k]: Number(e.target.value) } }));
  const handleCategoryChange = e => {
    const cat = e.target.value;
    setForm(f => ({ ...f, category: cat, questionRange: PASSAGE_RANGES[cat] || f.questionRange }));
  };

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (passageId) await apiFetch(`/admin/passages/${passageId}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await apiFetch('/admin/passages', { method: 'POST', body: JSON.stringify(payload) });
      toast(passageId ? 'Đã cập nhật bài đọc' : 'Đã thêm bài đọc');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{passageId ? 'Sửa bài đọc' : 'Thêm bài đọc mới'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Đang tải...</div>
        ) : (
          <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
            <div className="form-group">
              <label className="form-label">Tiêu đề *</label>
              <input className="form-input" value={form.title} onChange={set('title')} required placeholder="The History of Coffee" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-input" value={form.category} onChange={handleCategoryChange}>
                  {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Độ khó</label>
                <select className="form-input" value={form.difficulty} onChange={set('difficulty')}>
                  {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Câu hỏi từ số</label>
                <input className="form-input" type="number" value={form.questionRange.start} onChange={setRange('start')} min={1} />
              </div>
              <div className="form-group">
                <label className="form-label">Đến số</label>
                <input className="form-input" type="number" value={form.questionRange.end} onChange={setRange('end')} min={1} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tags (phân cách bằng dấu phẩy)</label>
              <input className="form-input" value={form.tags} onChange={set('tags')}
                placeholder="VD: animals, environment, science, Cambridge 17" />
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Dùng để lọc và tham chiếu — tuỳ chọn</div>
            </div>
            <div className="form-group">
              <label className="form-label">Nội dung bài đọc <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(HTML)</span></label>
              <div style={{ fontSize: 11, background: 'rgba(61,139,255,.08)', border: '1px solid rgba(61,139,255,.25)', borderRadius: 7, padding: '9px 12px', marginBottom: 6, color: 'var(--text2)', lineHeight: 1.75 }}>
                <strong>Định dạng HTML</strong> — frontend render trực tiếp bằng <code>innerHTML</code>.<br />
                <strong>Thẻ thường dùng:</strong> <code>&lt;p&gt;...&lt;/p&gt;</code> đoạn văn · <code>&lt;strong&gt;</code> in đậm · <code>&lt;em&gt;</code> in nghiêng · <code>&lt;br&gt;</code> xuống dòng.<br />
                <strong>Đoạn có ký tự (Matching Headings):</strong> Thêm ký tự A, B, C trước mỗi đoạn để học sinh ghép tiêu đề:<br />
                <code>&lt;p&gt;&lt;strong&gt;A&lt;/strong&gt; The history of coffee dates back to Ethiopia...&lt;/p&gt;</code><br />
                <code>&lt;p&gt;&lt;strong&gt;B&lt;/strong&gt; By the 17th century, coffee houses had spread...&lt;/p&gt;</code><br />
                <strong>Tip:</strong> Copy text từ PDF → paste vào, bọc mỗi đoạn trong <code>&lt;p&gt;&lt;/p&gt;</code>.
              </div>
              <textarea className="form-input" rows={12} value={form.content} onChange={set('content')}
                style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 }}
                placeholder={'<p>Paragraph one of the reading passage...</p>\n<p>Paragraph two continues here...</p>'} />
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
                <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Hiển thị
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
                <input type="checkbox" checked={form.isActualTest} onChange={set('isActualTest')} />
                <span>Actual Test <span style={{ fontSize: 11, color: 'var(--text3)' }}>(hiện ở tab "Actual Tests")</span></span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Passages() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [all, setAll] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [qPassage, setQPassage] = useState(null);
  const [diff, setDiff] = useState('');

  const load = () => apiFetch('/admin/passages?limit=500').then(d => setAll(d.passages || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  // Fully derivable from `all` + the filter fields — no need to store it
  // as its own state or recompute it in an effect.
  const filtered = all.filter(p =>
    (!search || p.title?.toLowerCase().includes(search.toLowerCase())) &&
    (!cat || p.category === cat) &&
    (!diff || p.difficulty === diff)
  );
  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);

  async function toggleActive(id, isActive) {
    try {
      await apiFetch(`/admin/passages/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn bài đọc' : 'Đã hiện bài đọc');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function del(id, title) {
    confirm(`Xóa vĩnh viễn bài đọc "${title}"? Không thể phục hồi.`, async () => {
      try { await apiFetch(`/admin/passages/${id}/permanent`, { method: 'DELETE' }); toast('Đã xóa vĩnh viễn'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  function closeModal() { setShowModal(false); setEditId(null); }

  return (
    <>
      {(showModal || editId) && (
        <PassageModal passageId={editId} onClose={closeModal} onSaved={load} />
      )}
      {qPassage && (
        <PassageQuestionsModal passageId={qPassage._id} passageTitle={qPassage.title} onClose={() => setQPassage(null)} />
      )}

      <div className="section-header">
        <h2 className="section-title">Bài đọc ({filtered.length})</h2>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setShowModal(true); }}>+ Thêm bài đọc</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input className="form-input search-input" placeholder="Tìm bài đọc..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 280 }} />
        <select className="form-input" value={cat} onChange={e => { setCat(e.target.value); setPage(1); }} style={{ width: 160 }}>
          <option value="">Tất cả category</option>
          {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="form-input" value={diff} onChange={e => { setDiff(e.target.value); setPage(1); }} style={{ width: 140 }}>
          <option value="">Tất cả độ khó</option>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>TIÊU ĐỀ</th><th>CATEGORY</th><th>ĐỘ KHÓ</th><th>SỐ CÂU HỎI</th><th>RANGE</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {paged.length === 0
              ? <tr><td colSpan={8} className="table-empty">Không có bài đọc nào</td></tr>
              : paged.map(p => (
                <tr key={p._id}>
                  <td>
                    <strong>{p.title}</strong>
                    {p.isActualTest && <span className="badge badge-yellow" style={{ marginLeft: 6, fontSize: 10 }}>Actual</span>}
                  </td>
                  <td>{catBadge(p.category)}</td>
                  <td>{diffBadge(p.difficulty)}</td>
                  <td>{p.questionCount ?? (p.questionRange ? (p.questionRange.end - p.questionRange.start + 1) : '–')}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{p.questionRange?.start}–{p.questionRange?.end}</td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-green' : 'badge-gray'}`}>
                      <span className="dot" />{p.isActive ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(p.createdAt).split(' ')[0]}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => setQPassage(p)} title="Quản lý câu hỏi">📝 Câu hỏi</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditId(p._id)} title="Sửa">✏️</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(p._id, p.isActive)} title={p.isActive ? 'Ẩn' : 'Hiện'}>{p.isActive ? '🙈' : '👁'}</button>
                      {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(p._id, p.title)} title="Xóa">🗑</button>}
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
