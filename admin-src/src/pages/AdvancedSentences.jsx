import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

// Admin CRUD for "Viết câu nâng cao" grammar-structure groups. 12 groups,
// 2 per "week" (6 weeks). Each group's translation sentences are edited as
// one array in the modal (PUT .../sentences replaces the whole bank).

const EMPTY_GROUP = {
  code: '', order: 1, week: 1, slotInWeek: 1,
  nameVi: '', nameEn: '', emoji: '✍️', targetStructure: '', isActive: true,
};
const EMPTY_SENTENCE = { promptVi: '', answerEn: '', hintWords: '', altAnswers: '', structureNote: '', order: 0 };

function GroupModal({ group, onClose, onSaved }) {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState(() => ({ ...EMPTY_GROUP, ...(group || {}) }));
  const [sentences, setSentences] = useState(() =>
    (group?.sentences || []).map((s, i) => ({
      _id: s._id,
      promptVi: s.promptVi || '',
      answerEn: s.answerEn || '',
      hintWords: (s.hintWords || []).join(' · '),
      altAnswers: (s.altAnswers || []).join('\n'),
      structureNote: s.structureNote || '',
      order: Number.isFinite(s.order) ? s.order : i + 1,
    }))
  );

  const isNew = !group?._id;
  const setM = k => e => setMeta(m => ({
    ...m,
    [k]: e.target.type === 'checkbox' ? e.target.checked
      : e.target.type === 'number' ? Number(e.target.value)
      : e.target.value,
  }));
  const setS = (i, k) => e => setSentences(list => list.map((s, j) => j === i ? { ...s, [k]: e.target.value } : s));
  const addRow = () => setSentences(list => [...list, { ...EMPTY_SENTENCE, order: list.length + 1 }]);
  const delRow = i => setSentences(list => list.filter((_, j) => j !== i).map((s, j) => ({ ...s, order: j + 1 })));
  const move = (i, dir) => setSentences(list => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return list;
    const copy = list.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy.map((s, k) => ({ ...s, order: k + 1 }));
  });

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let id = group?._id;
      if (isNew) {
        const d = await apiFetch('/admin/adv-sentence/groups', { method: 'POST', body: JSON.stringify(meta) });
        id = d.group._id;
      } else {
        await apiFetch(`/admin/adv-sentence/groups/${id}`, { method: 'PUT', body: JSON.stringify(meta) });
      }
      const cleanSentences = sentences.map((s, i) => ({
        _id: s._id || undefined,
        order: i + 1,
        promptVi: s.promptVi.trim(),
        answerEn: s.answerEn.trim(),
        hintWords: s.hintWords.split('·').map(x => x.trim()).filter(Boolean),
        altAnswers: s.altAnswers.split('\n').map(x => x.trim()).filter(Boolean),
        structureNote: s.structureNote.trim(),
      })).filter(s => s.promptVi);
      await apiFetch(`/admin/adv-sentence/groups/${id}/sentences`, { method: 'PUT', body: JSON.stringify({ sentences: cleanSentences }) });
      toast(isNew ? 'Đã tạo nhóm' : 'Đã lưu nhóm');
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
      <div className="modal" style={{ maxWidth: 780 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isNew ? 'Thêm nhóm cấu trúc' : `Sửa: ${meta.nameVi}`}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 70px 70px 70px 60px', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Tên VI *</label>
              <input className="form-input" value={meta.nameVi} onChange={setM('nameVi')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tên EN *</label>
              <input className="form-input" value={meta.nameEn} onChange={setM('nameEn')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Emoji</label>
              <input className="form-input" value={meta.emoji} onChange={setM('emoji')} />
            </div>
            <div className="form-group">
              <label className="form-label">Week</label>
              <input className="form-input" type="number" min={1} max={6} value={meta.week} onChange={setM('week')} />
            </div>
            <div className="form-group">
              <label className="form-label">Slot</label>
              <input className="form-input" type="number" min={1} max={2} value={meta.slotInWeek} onChange={setM('slotInWeek')} />
            </div>
            <div className="form-group">
              <label className="form-label">Order</label>
              <input className="form-input" type="number" min={1} max={12} value={meta.order} onChange={setM('order')} />
            </div>
          </div>

          {isNew && (
            <div className="form-group">
              <label className="form-label">Mã (code, duy nhất) *</label>
              <input className="form-input" value={meta.code} onChange={setM('code')} placeholder="complex-sentences" required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Cấu trúc cần dùng (targetStructure)</label>
            <textarea className="form-input" rows={2} value={meta.targetStructure} onChange={setM('targetStructure')} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={meta.isActive} onChange={setM('isActive')} /> Hiển thị cho học sinh
          </label>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong style={{ fontSize: 14 }}>Câu luyện dịch ({sentences.length})</strong>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addRow}>+ Thêm câu</button>
            </div>
            {sentences.map((s, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>Câu {i + 1}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => move(i, -1)}>↑</button>
                    <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => move(i, 1)}>↓</button>
                    <button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => delRow(i)}>🗑</button>
                  </div>
                </div>
                <textarea className="form-input" rows={2} placeholder="Câu tiếng Việt *" value={s.promptVi} onChange={setS(i, 'promptVi')} />
                <textarea className="form-input" rows={2} placeholder="Đáp án tiếng Anh (Band 7+)" value={s.answerEn} onChange={setS(i, 'answerEn')} />
                <input className="form-input" placeholder="Hint — các cụm cách nhau bằng ·" value={s.hintWords} onChange={setS(i, 'hintWords')} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input className="form-input" placeholder="structureNote (vd: A. Present Simple)" value={s.structureNote} onChange={setS(i, 'structureNote')} />
                  <textarea className="form-input" rows={1} placeholder="Đáp án khác chấp nhận (mỗi dòng 1)" value={s.altAnswers} onChange={setS(i, 'altAnswers')} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving || (isAdmin === false)}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdvancedSentences() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weekFilter, setWeekFilter] = useState('');
  const [editing, setEditing] = useState(null); // full group being edited
  const [creating, setCreating] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        if (weekFilter) qs.set('week', weekFilter);
        const d = await apiFetch(`/admin/adv-sentence/groups?${qs}`);
        if (!cancelled) setGroups(d.groups || []);
      } catch (e) {
        if (!cancelled) toast(e.message, 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [weekFilter, tick]);

  const reload = () => setTick(t => t + 1);

  async function openEdit(id) {
    try {
      const d = await apiFetch(`/admin/adv-sentence/groups/${id}`);
      setEditing(d.group);
    } catch (e) { toast(e.message, 'error'); }
  }

  async function del(id) {
    confirm('Xoá nhóm này và toàn bộ câu bên trong?', async () => {
      try {
        await apiFetch(`/admin/adv-sentence/groups/${id}`, { method: 'DELETE' });
        toast('Đã xoá');
        setGroups(gs => gs.filter(g => g._id !== id));
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  async function toggleActive(g) {
    try {
      await apiFetch(`/admin/adv-sentence/groups/${g._id}`, { method: 'PUT', body: JSON.stringify({ isActive: !g.isActive }) });
      setGroups(gs => gs.map(x => x._id === g._id ? { ...x, isActive: !x.isActive } : x));
    } catch (e) { toast(e.message, 'error'); }
  }

  const totalSentences = groups.reduce((s, g) => s + (g.sentenceCount || 0), 0);

  return (
    <>
      {editing && <GroupModal group={editing} onClose={() => setEditing(null)} onSaved={reload} />}
      {creating && <GroupModal group={null} onClose={() => setCreating(false)} onSaved={reload} />}

      <div className="section-header">
        <h2 className="section-title">Viết câu nâng cao — Nhóm cấu trúc</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>+ Thêm nhóm</button>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0', alignItems: 'center' }}>
        <select className="form-input" value={weekFilter} onChange={e => setWeekFilter(e.target.value)} style={{ width: 150 }}>
          <option value="">Tất cả tuần</option>
          {[1, 2, 3, 4, 5, 6].map(w => <option key={w} value={w}>Tuần {w}</option>)}
        </select>
        <span style={{ fontSize: 13, color: 'var(--text2)', marginLeft: 'auto' }}>{groups.length} nhóm · {totalSentences} câu</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>W</th><th>NHÓM</th><th>CẤU TRÚC</th><th>SỐ CÂU</th><th>TRẠNG THÁI</th><th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="table-empty">Đang tải...</td></tr>
            ) : groups.length === 0 ? (
              <tr><td colSpan={6} className="table-empty">Chưa có nhóm nào — chạy <code>node scripts/seedAdvSentences.js</code></td></tr>
            ) : groups.map(g => (
              <tr key={g._id}>
                <td style={{ fontWeight: 700, color: 'var(--text2)' }}>W{g.week}.{g.slotInWeek}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{g.emoji} {g.nameVi}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{g.nameEn}</div>
                </td>
                <td style={{ maxWidth: 320, fontSize: 12, color: 'var(--text2)', wordBreak: 'break-word' }}>{g.targetStructure}</td>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>{g.sentenceCount}</td>
                <td>
                  <span className={`badge ${g.isActive ? 'badge-green' : 'badge-gray'}`}>
                    <span className="dot" />{g.isActive ? 'Hiện' : 'Ẩn'}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className={`btn btn-sm ${g.isActive ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleActive(g)}>
                      {g.isActive ? '🙈 Ẩn' : '👁 Hiện'}
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(g._id)}>✏️</button>
                    {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(g._id)}>🗑</button>}
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
