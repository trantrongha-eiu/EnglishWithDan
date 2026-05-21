import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

const LIMIT = 20;
const LEVELS = ['beginner', 'elementary', 'intermediate'];
const SKILL_TYPES = ['noun_phrase', 'data_description', 'comparison', 'paraphrase', 'trend_language', 'overview'];
const EX_TYPES = ['fill_blank', 'translation', 'rearrange', 'multiple_choice', 'error_correction', 'paraphrase_choose', 'data_transform'];

const SKILL_LABELS = {
  noun_phrase: 'Noun Phrase',
  data_description: 'Data Description',
  comparison: 'Comparison',
  paraphrase: 'Paraphrase',
  trend_language: 'Trend Language',
  overview: 'Overview',
};

const TYPE_LABELS = {
  fill_blank: 'Điền chỗ trống',
  translation: 'Dịch câu',
  rearrange: 'Sắp xếp từ',
  multiple_choice: 'Trắc nghiệm',
  error_correction: 'Sửa lỗi',
  paraphrase_choose: 'Chọn diễn đạt',
  data_transform: 'Biến đổi dữ liệu',
};

const TYPE_COLORS = {
  fill_blank: '#fbbf24',
  translation: '#3d8bff',
  rearrange: '#a78bfa',
  multiple_choice: '#34d399',
  error_correction: '#f87171',
  paraphrase_choose: '#fb923c',
  data_transform: '#38bdf8',
};

function levelBadge(l) {
  const map = { beginner: 'badge-green', elementary: 'badge-blue', intermediate: 'badge-red' };
  return <span className={`badge ${map[l] || 'badge-gray'}`}>{l}</span>;
}

function typeBadge(t) {
  const c = TYPE_COLORS[t] || '#888';
  return <span style={{ background: c + '22', color: c, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{TYPE_LABELS[t] || t}</span>;
}

const EMPTY = {
  skillType: 'noun_phrase',
  module: 1,
  level: 'beginner',
  type: 'fill_blank',
  instruction: '',
  questionVi: '',
  questionEn: '',
  sentenceWithBlanks: '',
  blanksCount: 1,
  baseWords: '',
  options: '',
  correctOptionIndex: 0,
  sampleAnswers: '',
  primaryAnswer: '',
  grammarPoint: '',
  explanation: '',
  hints: '',
  orderIndex: 0,
  xpReward: 5,
  isActive: true,
};

function ExModal({ exercise, onClose, onSaved }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() =>
    exercise
      ? {
          ...EMPTY,
          ...exercise,
          baseWords: (exercise.baseWords || []).join(' | '),
          options: (exercise.options || []).join('\n'),
          sampleAnswers: (exercise.sampleAnswers || []).join('\n'),
          hints: (exercise.hints || []).join('\n'),
        }
      : EMPTY
  );

  const set = k => e =>
    setForm(f => ({
      ...f,
      [k]: e.target.type === 'checkbox' ? e.target.checked
           : e.target.type === 'number' ? Number(e.target.value)
           : e.target.value,
    }));

  const isFillBlank = form.type === 'fill_blank';
  const isRearrange = form.type === 'rearrange';
  const isChoice = ['multiple_choice', 'paraphrase_choose'].includes(form.type);
  const hasViEn = ['translation', 'error_correction'].includes(form.type);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        baseWords: form.baseWords.split('|').map(s => s.trim()).filter(Boolean),
        options: form.options.split('\n').map(s => s.trim()).filter(Boolean),
        sampleAnswers: form.sampleAnswers.split('\n').map(s => s.trim()).filter(Boolean),
        hints: form.hints.split('\n').map(s => s.trim()).filter(Boolean),
      };
      if (exercise?._id)
        await apiFetch(`/admin/task1/exercises/${exercise._id}`, { method: 'PUT', body: JSON.stringify(body) });
      else
        await apiFetch('/admin/task1/exercises', { method: 'POST', body: JSON.stringify(body) });
      toast(exercise?._id ? 'Đã cập nhật câu hỏi' : 'Đã tạo câu hỏi');
      onSaved();
      onClose();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{exercise?._id ? 'Sửa câu hỏi Task 1' : 'Thêm câu hỏi Task 1'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '78vh', overflowY: 'auto' }}>
          {/* Metadata row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 70px 1fr 1.2fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Kỹ năng</label>
              <select className="form-input" value={form.skillType} onChange={set('skillType')}>
                {SKILL_TYPES.map(s => <option key={s} value={s}>{SKILL_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Module</label>
              <select className="form-input" value={form.module} onChange={set('module')}>
                {[1, 2, 3, 4].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-input" value={form.level} onChange={set('level')}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Loại câu hỏi</label>
              <select className="form-input" value={form.type} onChange={set('type')}>
                {EX_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>

          {/* Instruction — always required */}
          <div className="form-group">
            <label className="form-label">Hướng dẫn (instruction) *</label>
            <textarea className="form-input" rows={2} value={form.instruction} onChange={set('instruction')} required />
          </div>

          {/* fill_blank */}
          {isFillBlank && (
            <>
              <div className="form-group">
                <label className="form-label">Câu có chỗ trống (sentenceWithBlanks) *</label>
                <textarea className="form-input" rows={2} value={form.sentenceWithBlanks} onChange={set('sentenceWithBlanks')}
                  placeholder="The data ___ a significant increase in ___." />
              </div>
              <div className="form-group" style={{ maxWidth: 130 }}>
                <label className="form-label">Số chỗ trống</label>
                <input className="form-input" type="number" min={1} value={form.blanksCount} onChange={set('blanksCount')} />
              </div>
            </>
          )}

          {/* rearrange */}
          {isRearrange && (
            <div className="form-group">
              <label className="form-label">Các từ cách nhau bằng | (baseWords)</label>
              <input className="form-input" value={form.baseWords} onChange={set('baseWords')}
                placeholder="shows | a | significant | rise | in" />
            </div>
          )}

          {/* translation / error_correction: show Vi + En pair */}
          {hasViEn && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Câu tiếng Việt</label>
                <textarea className="form-input" rows={2} value={form.questionVi} onChange={set('questionVi')} />
              </div>
              <div className="form-group">
                <label className="form-label">Câu tiếng Anh</label>
                <textarea className="form-input" rows={2} value={form.questionEn} onChange={set('questionEn')} />
              </div>
            </div>
          )}

          {/* other types: just questionEn */}
          {!hasViEn && !isFillBlank && !isRearrange && (
            <div className="form-group">
              <label className="form-label">Nội dung câu hỏi</label>
              <textarea className="form-input" rows={2} value={form.questionEn} onChange={set('questionEn')} />
            </div>
          )}

          {/* multiple_choice / paraphrase_choose */}
          {isChoice && (
            <>
              <div className="form-group">
                <label className="form-label">Các lựa chọn (mỗi dòng 1 option) *</label>
                <textarea className="form-input" rows={4} value={form.options} onChange={set('options')}
                  placeholder={'Option A\nOption B\nOption C\nOption D'} />
              </div>
              <div className="form-group" style={{ maxWidth: 200 }}>
                <label className="form-label">Đáp án đúng (index từ 0)</label>
                <input className="form-input" type="number" min={0} value={form.correctOptionIndex} onChange={set('correctOptionIndex')} />
              </div>
            </>
          )}

          {/* Sample answers */}
          <div className="form-group">
            <label className="form-label">Đáp án mẫu (mỗi dòng 1 đáp án) *</label>
            <textarea className="form-input" rows={3} value={form.sampleAnswers} onChange={set('sampleAnswers')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Đáp án chính (primaryAnswer)</label>
            <input className="form-input" value={form.primaryAnswer} onChange={set('primaryAnswer')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Điểm ngữ pháp</label>
              <input className="form-input" value={form.grammarPoint} onChange={set('grammarPoint')} />
            </div>
            <div className="form-group">
              <label className="form-label">Giải thích</label>
              <input className="form-input" value={form.explanation} onChange={set('explanation')} />
            </div>
            <div className="form-group">
              <label className="form-label">Thứ tự</label>
              <input className="form-input" type="number" value={form.orderIndex} onChange={set('orderIndex')} />
            </div>
            <div className="form-group">
              <label className="form-label">XP</label>
              <input className="form-input" type="number" min={0} value={form.xpReward} onChange={set('xpReward')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Gợi ý (hints, mỗi dòng 1 gợi ý)</label>
            <textarea className="form-input" rows={2} value={form.hints} onChange={set('hints')} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Hiển thị câu hỏi
          </label>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Task1Exercises() {
  const toast = useToast();
  const confirm = useConfirm();
  const [exercises, setExercises] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [levelFilter, setLevelFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editEx, setEditEx] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ page, limit: LIMIT });
        if (levelFilter) qs.set('level', levelFilter);
        if (skillFilter) qs.set('skillType', skillFilter);
        if (typeFilter) qs.set('type', typeFilter);
        if (search) qs.set('search', search);
        const d = await apiFetch(`/admin/task1/exercises?${qs}`);
        if (!cancelled) {
          setExercises(d.exercises || []);
          setTotal(d.total || 0);
        }
      } catch (e) {
        if (!cancelled) toast(e.message, 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, levelFilter, skillFilter, typeFilter, search, tick]);

  function filterChange(setter) {
    return e => { setter(e.target.value); setPage(1); };
  }

  async function del(id) {
    confirm('Xóa câu hỏi này?', async () => {
      try {
        await apiFetch(`/admin/task1/exercises/${id}`, { method: 'DELETE' });
        toast('Đã xóa');
        setExercises(xs => xs.filter(x => x._id !== id));
        setTotal(t => t - 1);
      } catch (e) {
        toast(e.message, 'error');
      }
    });
  }

  async function toggleActive(id, currentActive) {
    try {
      await apiFetch(`/admin/task1/exercises/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !currentActive }) });
      toast(`Đã ${currentActive ? 'ẩn' : 'hiện'} câu hỏi`);
      setExercises(xs => xs.map(x => x._id === id ? { ...x, isActive: !currentActive } : x));
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  function closeModal() { setShowModal(false); setEditEx(null); }
  function forceReload() { setPage(1); setTick(t => t + 1); }

  return (
    <>
      {(showModal || editEx) && (
        <ExModal exercise={editEx} onClose={closeModal} onSaved={forceReload} />
      )}

      <div className="section-header">
        <h2 className="section-title">Task 1 Grammar Exercises</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditEx(null); setShowModal(true); }}>
          + Thêm câu hỏi
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0', alignItems: 'center' }}>
        <input
          className="form-input search-input"
          placeholder="Tìm hướng dẫn..."
          value={search}
          onChange={filterChange(setSearch)}
          style={{ maxWidth: 220 }}
        />
        <select className="form-input" value={skillFilter} onChange={filterChange(setSkillFilter)} style={{ width: 170 }}>
          <option value="">Tất cả kỹ năng</option>
          {SKILL_TYPES.map(s => <option key={s} value={s}>{SKILL_LABELS[s]}</option>)}
        </select>
        <select className="form-input" value={levelFilter} onChange={filterChange(setLevelFilter)} style={{ width: 140 }}>
          <option value="">Tất cả level</option>
          {LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
        <select className="form-input" value={typeFilter} onChange={filterChange(setTypeFilter)} style={{ width: 160 }}>
          <option value="">Tất cả loại</option>
          {EX_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
        <span style={{ fontSize: 13, color: 'var(--text2)', marginLeft: 'auto' }}>{total} câu hỏi</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>HƯỚNG DẪN</th>
              <th>KỸ NĂNG</th>
              <th>MOD</th>
              <th>LEVEL</th>
              <th>LOẠI</th>
              <th>TRẠNG THÁI</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="table-empty">Đang tải...</td></tr>
            ) : exercises.length === 0 ? (
              <tr><td colSpan={7} className="table-empty">Không có câu hỏi nào</td></tr>
            ) : exercises.map(ex => (
              <tr key={ex._id}>
                <td style={{ maxWidth: 280, wordBreak: 'break-word' }}>{ex.instruction}</td>
                <td style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {SKILL_LABELS[ex.skillType] || ex.skillType}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text2)' }}>M{ex.module}</td>
                <td>{levelBadge(ex.level)}</td>
                <td>{typeBadge(ex.type)}</td>
                <td>
                  <span className={`badge ${ex.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
                    <span className="dot" />{ex.isActive !== false ? 'Hiện' : 'Ẩn'}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className={`btn btn-sm ${ex.isActive !== false ? 'btn-warning' : 'btn-success'}`}
                      title={ex.isActive !== false ? 'Ẩn câu hỏi' : 'Hiện câu hỏi'}
                      onClick={() => toggleActive(ex._id, ex.isActive !== false)}>
                      {ex.isActive !== false ? '🙈 Ẩn' : '👁 Hiện'}
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditEx(ex)}>✏️</button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(ex._id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <Pagination page={page} total={total} pageSize={LIMIT} onPage={setPage} />
      </div>
    </>
  );
}
