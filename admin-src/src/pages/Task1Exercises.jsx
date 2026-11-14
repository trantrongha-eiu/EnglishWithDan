import { useEffect, useState } from 'react';
import { apiFetch, FRONTEND_URL } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/Pagination';
import PageHeader from '../components/ui/PageHeader';

// Task 1 Grammar — admin side of task1-practice.html (Task1Exercise bank,
// GET/POST/PUT/DELETE /api/admin/task1/exercises). Was "Task 1 Grammar (cũ)"
// until the bank was reopened + expanded (2026-11-12/13):
//  - Bộ 1 = the original 123 exercises, Bộ 2 = tag `set2` (orderIndex
//    201–235, scripts/addTask1GrammarSet2.js) — the student page's "Bộ bài"
//    switch and the homework rows (`task1_grammar`, Bộ 1 + Bộ 2 in one row
//    per skill) both read this tag;
//  - most exercises carry a drawn chart (`chart`, frontend/js/shared/
//    t1-chart.js); So sánh / Xu hướng ones are tagged chart:static|dynamic
//    for the "📌 Khi nào dùng?" box.
// Labels below are the student page's (task1-practice.js SKILL_LABELS /
// TYPE_LABELS) so both sides use the same names.

const LIMIT = 20;
const LEVELS = ['beginner', 'elementary', 'intermediate'];
const SKILL_TYPES = ['noun_phrase', 'data_description', 'comparison', 'trend_language', 'paraphrase', 'overview', 'introduction'];
const EX_TYPES = ['fill_blank', 'translation', 'rearrange', 'multiple_choice', 'error_correction', 'paraphrase_choose', 'data_transform'];
const SETS = [['set1', 'Bộ 1'], ['set2', 'Bộ 2']];
const SET_TAGS = ['set2'];
const CHART_TAGS = ['chart:static', 'chart:dynamic'];

const SKILL_LABELS = {
  noun_phrase: 'Noun Phrase',
  data_description: 'Mô tả Data',
  comparison: 'So sánh',
  trend_language: 'Xu hướng',
  paraphrase: 'Paraphrase',
  overview: 'Overview',
  introduction: 'Introduction',
};

const TYPE_LABELS = {
  fill_blank: '✏️ Điền chỗ trống',
  translation: '🔄 Dịch câu',
  rearrange: '🔀 Sắp xếp từ',
  multiple_choice: '☑️ Trắc nghiệm',
  error_correction: '🔧 Sửa lỗi',
  paraphrase_choose: '🔁 Paraphrase',
  data_transform: '✏️ Viết lại câu',
};

const TYPE_COLORS = {
  fill_blank: 'var(--yellow)',
  translation: 'var(--blue)',
  rearrange: 'var(--purple)',
  multiple_choice: 'var(--green)',
  error_correction: 'var(--danger)',
  paraphrase_choose: '#fb923c',
  data_transform: '#38bdf8',
};

const CHART_KIND = { bar: 'Cột', line: 'Đường', pie: 'Tròn', table: 'Bảng', stat: 'Số liệu', map: 'Bản đồ', process: 'Quy trình', multi: 'Kết hợp' };

function levelBadge(l) {
  const map = { beginner: 'badge-green', elementary: 'badge-blue', intermediate: 'badge-red' };
  return <span className={`badge ${map[l] || 'badge-gray'}`}>{l}</span>;
}

function typeBadge(t) {
  const c = TYPE_COLORS[t] || '#888';
  return <span style={{ background: c + '22', color: c, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{TYPE_LABELS[t] || t}</span>;
}

const setOfTags = tags => (tags || []).find(t => SET_TAGS.includes(t)) || 'set1';
const chartTagOf = tags => (tags || []).find(t => CHART_TAGS.includes(t)) || '';

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
  explanationEn: '',
  hints: '',
  orderIndex: 0,
  xpReward: 5,
  isActive: true,
  set: 'set2',
  chartTag: '',
  otherTags: '',
  chartJson: '',
};

function ExModal({ exercise, onClose, onSaved }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => {
    if (!exercise) return EMPTY;
    const tags = exercise.tags || [];
    return {
      ...EMPTY,
      ...exercise,
      baseWords: (exercise.baseWords || []).join(' | '),
      options: (exercise.options || []).join('\n'),
      sampleAnswers: (exercise.sampleAnswers || []).join('\n'),
      hints: (exercise.hints || []).join('\n'),
      set: setOfTags(tags),
      chartTag: chartTagOf(tags),
      otherTags: tags.filter(t => !SET_TAGS.includes(t) && !CHART_TAGS.includes(t)).join(', '),
      chartJson: exercise.chart ? JSON.stringify(exercise.chart, null, 2) : '',
    };
  });

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
  const usesChartTag = ['comparison', 'trend_language'].includes(form.skillType);

  async function save(e) {
    e.preventDefault();
    let chart = null;
    if (form.chartJson.trim()) {
      try { chart = JSON.parse(form.chartJson); }
      catch { toast('Biểu đồ (JSON) không hợp lệ', 'error'); return; }
    }
    setSaving(true);
    try {
      const tags = [
        ...(form.set === 'set1' ? [] : [form.set]),
        ...(usesChartTag && form.chartTag ? [form.chartTag] : []),
        ...form.otherTags.split(',').map(s => s.trim()).filter(Boolean),
      ];
      // eslint-disable-next-line no-unused-vars
      const { set: _s, chartTag: _c, otherTags: _o, chartJson: _j, hasChart: _h, _id, createdAt, updatedAt, __v, ...rest } = form;
      const body = {
        ...rest,
        tags: [...new Set(tags)],
        chart,
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
      <div className="modal" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{exercise?._id ? 'Sửa câu hỏi Task 1 Grammar' : 'Thêm câu hỏi Task 1 Grammar'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '78vh', overflowY: 'auto' }}>
          {/* Metadata row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 90px 70px 1fr 1.3fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Kỹ năng</label>
              <select className="form-input" value={form.skillType} onChange={set('skillType')}>
                {SKILL_TYPES.map(s => <option key={s} value={s}>{SKILL_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Bộ bài</label>
              <select className="form-input" value={form.set} onChange={set('set')}>
                {SETS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Module</label>
              <select className="form-input" value={form.module} onChange={e => setForm(f => ({ ...f, module: Number(e.target.value) }))}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Điểm ngữ pháp</label>
              <input className="form-input" value={form.grammarPoint} onChange={set('grammarPoint')} />
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Giải thích (tiếng Việt)</label>
              <textarea className="form-input" rows={2} value={form.explanation} onChange={set('explanation')} />
            </div>
            <div className="form-group">
              <label className="form-label">Giải thích (tiếng Anh)</label>
              <textarea className="form-input" rows={2} value={form.explanationEn || ''} onChange={set('explanationEn')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Gợi ý (hints, mỗi dòng 1 gợi ý)</label>
            <textarea className="form-input" rows={2} value={form.hints} onChange={set('hints')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: usesChartTag ? '200px 1fr' : '1fr', gap: 10 }}>
            {usesChartTag && (
              <div className="form-group">
                <label className="form-label">Loại biểu đồ (📌 Khi nào dùng?)</label>
                <select className="form-input" value={form.chartTag} onChange={set('chartTag')}>
                  <option value="">— không gắn —</option>
                  <option value="chart:static">Tĩnh — chỉ so sánh</option>
                  <option value="chart:dynamic">Động — xu hướng + so sánh</option>
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Tag khác (cách nhau bằng dấu phẩy)</label>
              <input className="form-input" value={form.otherTags} onChange={set('otherTags')} />
            </div>
          </div>

          <details>
            <summary style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 13 }}>
              📊 Biểu đồ minh hoạ (JSON — bar / line / pie / table / stat / map / process / multi){form.chartJson.trim() ? '' : ' · chưa có'}
            </summary>
            <textarea className="form-input" rows={8} style={{ fontFamily: 'monospace', fontSize: 12, marginTop: 8 }}
              value={form.chartJson} onChange={set('chartJson')} placeholder='{"kind":"bar", ...}' />
            <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
              Vẽ bởi frontend/js/shared/t1-chart.js. Số liệu không có trong đề phải kèm ghi chú "Số liệu minh họa". Để trống = không có biểu đồ.
            </div>
          </details>

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

function SummaryGrid({ meta, skillFilter, setFilter, onPick }) {
  if (!meta) return null;
  const totals = SETS.map(([k]) => SKILL_TYPES.reduce((a, s) => a + (meta.bySkill[s]?.[k] || 0), 0));
  return (
    <div className="table-wrap" style={{ marginBottom: 14 }}>
      <table className="table">
        <thead>
          <tr>
            <th>KỸ NĂNG</th>
            {SETS.map(([k, l]) => <th key={k} style={{ textAlign: 'center' }}>{l.toUpperCase()}</th>)}
            <th style={{ textAlign: 'center' }}>ĐANG HIỆN</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {SKILL_TYPES.map(s => {
            const r = meta.bySkill[s] || { set1: 0, set2: 0, active: 0 };
            const on = skillFilter === s;
            return (
              <tr key={s} style={on ? { background: 'rgba(59,130,246,.08)' } : undefined}>
                <td style={{ fontWeight: 600 }}>{SKILL_LABELS[s]}</td>
                {SETS.map(([k]) => (
                  <td key={k} style={{ textAlign: 'center' }}>
                    <button type="button" className="link-btn" onClick={() => onPick(s, k)} title="Lọc theo kỹ năng + bộ này">{r[k] || 0}</button>
                  </td>
                ))}
                <td style={{ textAlign: 'center' }}>{r.active}</td>
                <td>
                  <a className="btn btn-ghost btn-sm" href={`${FRONTEND_URL}/task1-practice.html?skill=${s}${setFilter === 'set2' ? '&set=set2' : ''}`} target="_blank" rel="noreferrer">Trang học sinh ↗</a>
                </td>
              </tr>
            );
          })}
          <tr style={{ fontWeight: 700 }}>
            <td>Tổng ({meta.total} câu · {meta.withChart} có biểu đồ)</td>
            {totals.map((t, i) => <td key={i} style={{ textAlign: 'center' }}>{t}</td>)}
            <td style={{ textAlign: 'center' }}>{meta.active}</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Task1Exercises() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [levelFilter, setLevelFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [setFilter, setSetFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [chartFilter, setChartFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editEx, setEditEx] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tick, setTick] = useState(0);

  function filterQs(extra) {
    const qs = new URLSearchParams(extra);
    if (levelFilter) qs.set('level', levelFilter);
    if (skillFilter) qs.set('skillType', skillFilter);
    if (typeFilter) qs.set('type', typeFilter);
    if (setFilter) qs.set('set', setFilter);
    if (moduleFilter) qs.set('module', moduleFilter);
    if (chartFilter) qs.set('chart', chartFilter);
    if (activeFilter) qs.set('active', activeFilter);
    if (search) qs.set('search', search);
    return qs;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const d = await apiFetch(`/admin/task1/exercises?${filterQs({ page, limit: LIMIT })}`);
        if (!cancelled) {
          setExercises(d.exercises || []);
          setTotal(d.total || 0);
          setMeta(d.meta || null);
        }
      } catch (e) {
        if (!cancelled) toast(e.message, 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, levelFilter, skillFilter, typeFilter, setFilter, moduleFilter, chartFilter, activeFilter, search, tick]);

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
        setTick(t => t + 1);
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

  // The list is server-paginated (only the current 20-row page lives in
  // `exercises`), so "tất cả" has to re-fetch every row matching the current
  // filter — unpaginated — before it can act on more than just this page.
  async function bulkToggle() {
    try {
      const d = await apiFetch(`/admin/task1/exercises?${filterQs({ page: 1, limit: 5000 })}`);
      const all = d.exercises || [];
      if (all.length === 0) return;
      const targetActive = !all.some(x => x.isActive !== false);
      confirm(`${targetActive ? 'Hiện' : 'Ẩn'} tất cả ${all.length} câu hỏi đang lọc?`, async () => {
        try {
          await Promise.all(all.map(x => apiFetch(`/admin/task1/exercises/${x._id}`, { method: 'PUT', body: JSON.stringify({ isActive: targetActive }) })));
          toast(`Đã ${targetActive ? 'hiện' : 'ẩn'} ${all.length} câu hỏi`);
          forceReload();
        } catch (e) { toast(e.message, 'error'); }
      });
    } catch (e) { toast(e.message, 'error'); }
  }

  function pickCell(skill, set) {
    setSkillFilter(skill);
    setSetFilter(set);
    setPage(1);
  }

  const anyFilter = levelFilter || skillFilter || typeFilter || setFilter || moduleFilter || chartFilter || activeFilter || search;
  function clearFilters() {
    setLevelFilter(''); setSkillFilter(''); setTypeFilter(''); setSetFilter(''); setModuleFilter('');
    setChartFilter(''); setActiveFilter(''); setSearch(''); setPage(1);
  }

  return (
    <>
      {(showModal || editEx) && (
        <ExModal exercise={editEx} onClose={closeModal} onSaved={forceReload} />
      )}

      <PageHeader
        title="Task 1 Grammar"
        subtitle="Ngân hàng bài ngữ pháp Task 1 của trang task1-practice.html: Bộ 1 (bài gốc) + Bộ 2 (bài mới, tag set2), 7 kỹ năng, phần lớn có biểu đồ minh hoạ. Bài tập về nhà “Task 1 Grammar (Bộ 1 + Bộ 2)” giao theo từng kỹ năng."
        actions={<>
          <a className="btn btn-ghost btn-sm" href={`${FRONTEND_URL}/task1-practice.html`} target="_blank" rel="noreferrer">Mở trang học sinh ↗</a>
          <button className="btn btn-ghost btn-sm" onClick={bulkToggle} disabled={exercises.length === 0}>
            {exercises.some(x => x.isActive !== false) ? '🙈 Ẩn tất cả đang lọc' : '👁 Hiện tất cả đang lọc'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditEx(null); setShowModal(true); }}>
            + Thêm câu hỏi
          </button>
        </>}
      />

      <SummaryGrid meta={meta} skillFilter={skillFilter} setFilter={setFilter} onPick={pickCell} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0', alignItems: 'center' }}>
        <input
          className="form-input search-input"
          placeholder="Tìm hướng dẫn, câu, đáp án…"
          value={search}
          onChange={filterChange(setSearch)}
          style={{ maxWidth: 240 }}
        />
        <select className="form-input" value={setFilter} onChange={filterChange(setSetFilter)} style={{ width: 120 }} aria-label="Lọc bộ bài">
          <option value="">Cả 2 bộ</option>
          {SETS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select className="form-input" value={skillFilter} onChange={filterChange(setSkillFilter)} style={{ width: 160 }} aria-label="Lọc kỹ năng">
          <option value="">Tất cả kỹ năng</option>
          {SKILL_TYPES.map(s => <option key={s} value={s}>{SKILL_LABELS[s]}</option>)}
        </select>
        <select className="form-input" value={moduleFilter} onChange={filterChange(setModuleFilter)} style={{ width: 120 }} aria-label="Lọc module">
          <option value="">Mọi module</option>
          {[1, 2, 3, 4].map(m => <option key={m} value={m}>Module {m}</option>)}
        </select>
        <select className="form-input" value={levelFilter} onChange={filterChange(setLevelFilter)} style={{ width: 140 }} aria-label="Lọc level">
          <option value="">Tất cả level</option>
          {LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
        <select className="form-input" value={typeFilter} onChange={filterChange(setTypeFilter)} style={{ width: 170 }} aria-label="Lọc loại câu hỏi">
          <option value="">Tất cả loại</option>
          {EX_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
        <select className="form-input" value={chartFilter} onChange={filterChange(setChartFilter)} style={{ width: 150 }} aria-label="Lọc biểu đồ">
          <option value="">Biểu đồ: tất cả</option>
          <option value="yes">📊 Có biểu đồ</option>
          <option value="no">Chưa có biểu đồ</option>
        </select>
        <select className="form-input" value={activeFilter} onChange={filterChange(setActiveFilter)} style={{ width: 140 }} aria-label="Lọc trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="true">Đang hiện</option>
          <option value="false">Đang ẩn</option>
        </select>
        {anyFilter && <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>✕ Bỏ lọc</button>}
        <span style={{ fontSize: 13, color: 'var(--text2)', marginLeft: 'auto' }}>{total} câu hỏi</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>CÂU HỎI</th>
              <th>KỸ NĂNG</th>
              <th>BỘ</th>
              <th>MOD</th>
              <th>LEVEL</th>
              <th>LOẠI</th>
              <th>BIỂU ĐỒ</th>
              <th>TRẠNG THÁI</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="table-empty">Đang tải...</td></tr>
            ) : exercises.length === 0 ? (
              <tr><td colSpan={10} className="table-empty">Không có câu hỏi nào</td></tr>
            ) : exercises.map(ex => {
              const set = ex.set || setOfTags(ex.tags);
              const chartTag = chartTagOf(ex.tags);
              const body = ex.sentenceWithBlanks || ex.questionEn || ex.questionVi || '';
              return (
                <tr key={ex._id} style={ex.isActive === false ? { opacity: 0.6 } : undefined}>
                  <td className="muted" style={{ fontSize: 12 }}>{ex.orderIndex}</td>
                  <td style={{ maxWidth: 320, wordBreak: 'break-word' }}>
                    <div>{ex.instruction}</div>
                    {body && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{body.length > 120 ? body.slice(0, 120) + '…' : body}</div>}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {SKILL_LABELS[ex.skillType] || ex.skillType}
                  </td>
                  <td><span className={`badge ${set === 'set2' ? 'badge-purple' : 'badge-gray'}`}>{set === 'set2' ? 'Bộ 2' : 'Bộ 1'}</span></td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text2)' }}>M{ex.module}</td>
                  <td>{levelBadge(ex.level)}</td>
                  <td>{typeBadge(ex.type)}</td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {ex.chart ? <>📊 {CHART_KIND[ex.chart.kind] || ex.chart.kind || 'có'}</> : <span className="muted">—</span>}
                    {chartTag && <div className="muted" style={{ fontSize: 11 }}>{chartTag === 'chart:dynamic' ? 'động' : 'tĩnh'}</div>}
                  </td>
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
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditEx(ex)} aria-label="Sửa câu hỏi">✏️</button>
                      {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(ex._id)} aria-label="Xóa câu hỏi">🗑</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <Pagination page={page} total={total} pageSize={LIMIT} onPage={setPage} />
      </div>
    </>
  );
}
