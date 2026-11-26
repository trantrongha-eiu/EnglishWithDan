import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import SearchMatch from '../../utils/searchMatch';

// "🧩 Tự ghép đề Writing" — the teacher picks ONE Task 1 + ONE Task 2 from the
// practice banks; the server saves the pair as a WritingExam (isCustom) that
// every student then gets verbatim, in Luyện tập or Thi thật (the item's
// examMode). Used by the assignment editor (Full đề Writing) and by the full
// mock bundle picker (its Writing). onCreated(row) gets a catalog-shaped
// writing_exam row: { _id, label, meta, isCustom }.

// WritingTask1.chartType / WritingTask2.essayType — same groups as the
// student's "Dạng đề" filter on writing.html and admin WritingTests.jsx.
const T1_CHART_TYPES = [
  ['static', 'Static chart'],
  ['dynamic', 'Dynamic chart'],
  ['mixed', 'Mixed charts'],
  ['process', 'Process / diagram'],
  ['map', 'Map / plan'],
];
const T2_ESSAY_TYPES = [
  ['type01', 'Advantages & Disadvantages'],
  ['type02', 'Discuss Both Views'],
  ['type03', 'Cause & Solution'],
  ['type04', 'Effect & Solution'],
  ['type05', 'Cause & Effect'],
  ['type06', 'Agree / Disagree'],
  ['type07', 'Positive / Negative Development'],
];
const T1_SHORT = { static: 'Static', dynamic: 'Dynamic', mixed: 'Mixed Charts', process: 'Process', map: 'Map' };
const T2_SHORT = Object.fromEntries(T2_ESSAY_TYPES.map(([k, v]) => [k, v.replace('Advantages & Disadvantages', 'Adv & Disadv').replace(' Development', '')]));

// "Writing – Mixed Charts + Cause & Solution" (used when the name is left empty)
function suggestedExamName(t1, t2) {
  const a = (t1 && T1_SHORT[t1.chartType]) || 'Task 1';
  const b = (t2 && T2_SHORT[t2.t2Type]) || 'Task 2';
  return `Writing – ${a} + ${b}`;
}

function TaskColumn({ title, color, items, types, typeKey, value, onPick, showImage }) {
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const visible = useMemo(() => (items || [])
    .filter((x) => !type || x[typeKey] === type)
    .filter((x) => !search.trim() || SearchMatch.matches([x.label], search.trim())),
  [items, type, search, typeKey]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color }}>{title}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <select className="form-input" style={{ flex: '1 1 150px', minWidth: 0 }} value={type} onChange={(e) => setType(e.target.value)} title="Lọc theo dạng đề">
          <option value="">Tất cả dạng đề</option>
          {types.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <input className="form-input" style={{ flex: '1 1 120px', minWidth: 0 }} placeholder="Tìm đề…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div style={{ height: 230, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6 }}>
        {items === null ? <div style={{ padding: 10, color: 'var(--text3)', fontSize: 13 }}>Đang tải…</div>
          : visible.length === 0 ? <div style={{ padding: 10, color: 'var(--text3)', fontSize: 13 }}>Không có đề phù hợp</div>
            : visible.map((x) => {
              const on = value && String(value._id) === String(x._id);
              return (
                <label key={String(x._id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 8px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: 12.5, lineHeight: 1.4, background: on ? `${color}14` : 'transparent' }}>
                  <input type="radio" checked={!!on} onChange={() => onPick(x)} style={{ marginTop: 3 }} />
                  {showImage && (x.imageUrl
                    ? <img src={x.imageUrl} alt="" loading="lazy" style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)', flexShrink: 0 }} />
                    : <span style={{ width: 52, height: 38, borderRadius: 4, background: 'var(--bg2, #f3f4f6)', flexShrink: 0 }} />)}
                  <span style={{ flex: 1, minWidth: 0 }}>
                    {x.label}
                    {x.meta && <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color }}>{x.meta}</span>}
                  </span>
                </label>
              );
            })}
      </div>
    </div>
  );
}

export default function CustomWritingExamBuilder({ onCreated, onCancel }) {
  const toast = useToast();
  const [t1List, setT1List] = useState(null);
  const [t2List, setT2List] = useState(null);
  const [t1, setT1] = useState(null);
  const [t2, setT2] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = (type, set) => apiFetch(`/classes/resources/catalog?type=${type}&limit=2000`)
      .then((d) => { if (alive) set(d.items || []); })
      .catch(() => { if (alive) set([]); });
    load('task1_practice', setT1List);
    load('task2_practice', setT2List);
    return () => { alive = false; };
  }, []);

  async function create() {
    if (!t1 || !t2) return toast('Chọn 1 đề Task 1 và 1 đề Task 2', 'error');
    setSaving(true);
    try {
      const d = await apiFetch('/classes/resources/writing-exams/custom', {
        method: 'POST',
        body: JSON.stringify({ task1Id: t1._id, task2Id: t2._id, name: name.trim() || suggestedExamName(t1, t2) }),
      });
      onCreated(d.exam);
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ border: '1.5px solid #c2410c55', background: '#fff7ed80', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
        🧩 <b>Tự ghép đề Writing</b>: chọn <b>1 đề Task 1</b> + <b>1 đề Task 2</b> → thành 1 đề Full Writing (60 phút). Mọi học sinh mở bài đều
        làm đúng 2 đề này. Đề đã ghép được lưu lại, giao cho lớp khác thì chọn trong danh sách "Full đề Writing" (có nhãn 🧩 Tự ghép).
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        <TaskColumn title="① Task 1" color="#c2410c" items={t1List} types={T1_CHART_TYPES} typeKey="chartType" value={t1} onPick={setT1} showImage />
        <TaskColumn title="② Task 2" color="#7c3aed" items={t2List} types={T2_ESSAY_TYPES} typeKey="t2Type" value={t2} onPick={setT2} />
      </div>
      <div style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span><b style={{ color: '#c2410c' }}>Task 1:</b> {t1 ? t1.label : <i style={{ color: 'var(--text3)' }}>chưa chọn</i>}</span>
        <span><b style={{ color: '#7c3aed' }}>Task 2:</b> {t2 ? t2.label : <i style={{ color: 'var(--text3)' }}>chưa chọn</i>}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" style={{ flex: '1 1 260px', minWidth: 0 }} maxLength={120} value={name} onChange={(e) => setName(e.target.value)}
          placeholder={`Tên đề (để trống = "${suggestedExamName(t1, t2)}")`} title="Tên đề học sinh thấy trên thẻ bài tập, vd: Week 1 – Mock Writing" />
        <button type="button" className="btn btn-primary btn-sm" disabled={saving || !t1 || !t2} onClick={create}>
          {saving ? 'Đang tạo…' : '✓ Ghép đề & thêm vào bài tập'}
        </button>
        {onCancel && <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Đóng</button>}
      </div>
    </div>
  );
}
