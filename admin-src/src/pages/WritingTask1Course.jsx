import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

// Admin CRUD for the WT1 course (WT1Module → WT1Lesson → WT1Exercise).
// Content is authored in backend/scripts/data/writingTask1/*.json and
// seeded; edits here write straight to the DB and a re-seed overwrites them.
const SEED_NOTE = 'Nội dung gốc nằm ở backend/scripts/data/writingTask1/ — sửa ở đây ghi thẳng vào DB; chạy lại seedWritingTask1Course.js sẽ ghi đè.';
const EX_TYPES = [
  'mcq', 'gap_fill', 'error_correction', 'sentence_transform', 'word_form',
  'categorize', 'matching', 'ordering', 'sentence_writing', 'paragraph_writing', 'full_task1',
];
const OBJECTIVE_HINT = {
  mcq: '[{id,prompt,options:[{id,text}],answer,explanation}]',
  gap_fill: '[{id,prompt (chứa ____),blanks:[{accept:[...]}],explanation}]',
  error_correction: '[{id,prompt,errorSpan,answer,accept:[...],explanation}]',
  word_form: '[{id,prompt,answer,accept:[...]}]',
  categorize: '[{id,text,category}] + categories ở trên',
  matching: '[{id,left,right}]',
  ordering: '[{id,tokens:[...],answer:[...]}]',
  sentence_transform: '[{id,prompt,cue,starter,sampleAnswers:[...]}]',
};
const EMPTY_EX = {
  code: '', order: 1, type: 'mcq', title: '', titleEn: '', instruction: '',
  source: 'original', difficulty: 1, estimatedMinutes: 5, points: 0, autoGrade: true,
  timerMinutes: '', needsAsset: false, published: true,
  stimulus: { kind: null, caption: '', imageUrl: '', note: '', headers: [], rows: [] },
  wordBank: [], categories: [], responseSlots: 0, items: [], rubric: null,
};

function lines(v) { return (v || []).join('\n'); }
function toArr(s) { return String(s || '').split('\n').map((x) => x.trim()).filter(Boolean); }
function pretty(o) { try { return JSON.stringify(o ?? null, null, 2); } catch { return 'null'; } }

// ── Exercise editor modal ───────────────────────────────────────────
// `exercise` is the full doc when editing, null when creating a new one.
function ExerciseModal({ exercise, lessonCode, onClose, onSaved }) {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const isNew = !exercise;
  const [saving, setSaving] = useState(false);
  const [ex, setEx] = useState(() => ({ ...EMPTY_EX, ...(exercise || {}), lessonCode }));
  const [itemsJson, setItemsJson] = useState(() => pretty(exercise?.items || []));
  const [rubricJson, setRubricJson] = useState(() => pretty(exercise?.rubric ?? null));
  const [jsonErr, setJsonErr] = useState('');
  const [checkErrs, setCheckErrs] = useState(null);

  const set = (k) => (e) => setEx((x) => ({
    ...x,
    [k]: e.target.type === 'checkbox' ? e.target.checked
      : e.target.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value))
      : e.target.value,
  }));
  const setStim = (k) => (e) => setEx((x) => ({ ...x, stimulus: { ...(x.stimulus || {}), [k]: e.target.value } }));

  function buildPayload() {
    let items; let rubric;
    try { items = JSON.parse(itemsJson || '[]'); } catch (e) { throw new Error('items JSON không hợp lệ: ' + e.message, { cause: e }); }
    try { rubric = JSON.parse(rubricJson || 'null'); } catch (e) { throw new Error('rubric JSON không hợp lệ: ' + e.message, { cause: e }); }
    if (!Array.isArray(items)) throw new Error('items phải là một mảng');
    const st = ex.stimulus || {};
    const stimulus = st.kind ? {
      kind: st.kind, caption: st.caption || '', imageUrl: st.imageUrl || '', note: st.note || '',
      headers: Array.isArray(st.headers) ? st.headers : toArr(st.headers),
      rows: st.rows || [],
    } : null;
    return {
      code: ex.code.trim(), lessonCode, order: Number(ex.order) || 0, type: ex.type,
      title: ex.title, titleEn: ex.titleEn, instruction: ex.instruction, source: ex.source,
      difficulty: Number(ex.difficulty) || 1, estimatedMinutes: Number(ex.estimatedMinutes) || undefined,
      points: Number(ex.points) || 0, autoGrade: !!ex.autoGrade,
      timerMinutes: ex.timerMinutes === '' ? undefined : Number(ex.timerMinutes) || undefined,
      needsAsset: !!ex.needsAsset, published: !!ex.published,
      stimulus, wordBank: Array.isArray(ex.wordBank) ? ex.wordBank : toArr(ex.wordBank),
      categories: Array.isArray(ex.categories) ? ex.categories : [],
      responseSlots: Number(ex.responseSlots) || 0, items, rubric,
    };
  }

  async function doCheck() {
    try {
      const d = await apiFetch('/admin/wt1/validate', { method: 'POST', body: JSON.stringify(buildPayload()) });
      setCheckErrs(d.errors || []);
      if (!(d.errors || []).length) toast('Hợp lệ ✓');
    } catch (e) { setJsonErr(e.message); }
  }

  async function save(e) {
    e.preventDefault();
    setJsonErr(''); setSaving(true);
    try {
      const body = buildPayload();
      if (isNew) await apiFetch('/admin/wt1/exercises', { method: 'POST', body: JSON.stringify(body) });
      else await apiFetch(`/admin/wt1/exercises/${exercise.code}`, { method: 'PUT', body: JSON.stringify(body) });
      toast(isNew ? 'Đã tạo bài tập' : 'Đã lưu bài tập');
      onSaved(); onClose();
    } catch (err) { setJsonErr(err.message); toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  const showBank = ex.type === 'gap_fill' || ex.type === 'categorize';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 820 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isNew ? 'Thêm bài tập' : `Sửa: ${exercise.code}`}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '82vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 70px 70px', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Code *</label>
              <input className="form-input" value={ex.code} onChange={set('code')} disabled={!isNew} required placeholder="T1-L07-E06" />
            </div>
            <div className="form-group">
              <label className="form-label">Loại</label>
              <select className="form-input" value={ex.type} onChange={set('type')}>{EX_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div className="form-group"><label className="form-label">Order</label><input className="form-input" type="number" value={ex.order} onChange={set('order')} /></div>
            <div className="form-group"><label className="form-label">Điểm</label><input className="form-input" type="number" value={ex.points} onChange={set('points')} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group"><label className="form-label">Tiêu đề</label><input className="form-input" value={ex.title || ''} onChange={set('title')} /></div>
            <div className="form-group"><label className="form-label">Tiêu đề EN</label><input className="form-input" value={ex.titleEn || ''} onChange={set('titleEn')} /></div>
          </div>
          <div className="form-group"><label className="form-label">Hướng dẫn (instruction)</label><textarea className="form-input" rows={2} value={ex.instruction || ''} onChange={set('instruction')} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 110px 110px 1fr', gap: 10, alignItems: 'end' }}>
            <div className="form-group"><label className="form-label">Độ khó</label><input className="form-input" type="number" min={1} max={3} value={ex.difficulty} onChange={set('difficulty')} /></div>
            <div className="form-group"><label className="form-label">Phút (est)</label><input className="form-input" type="number" value={ex.estimatedMinutes ?? ''} onChange={set('estimatedMinutes')} /></div>
            <div className="form-group"><label className="form-label">Timer (phút)</label><input className="form-input" type="number" value={ex.timerMinutes ?? ''} onChange={set('timerMinutes')} /></div>
            <div style={{ display: 'flex', gap: 14, paddingBottom: 6 }}>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={!!ex.autoGrade} onChange={set('autoGrade')} /> autoGrade</label>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={!!ex.needsAsset} onChange={set('needsAsset')} /> needsAsset</label>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={!!ex.published} onChange={set('published')} /> published</label>
            </div>
          </div>

          <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
            <legend style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>Stimulus (đề bài / bảng / ảnh)</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Kind</label>
                <select className="form-input" value={ex.stimulus?.kind || ''} onChange={(e) => setEx((x) => ({ ...x, stimulus: { ...(x.stimulus || {}), kind: e.target.value || null } }))}>
                  <option value="">(none)</option><option value="table">table</option><option value="image">image</option><option value="text">text</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Caption</label><input className="form-input" value={ex.stimulus?.caption || ''} onChange={setStim('caption')} /></div>
            </div>
            {ex.stimulus?.kind === 'image' && (
              <div className="form-group"><label className="form-label">imageUrl (Cloudinary)</label><input className="form-input" value={ex.stimulus?.imageUrl || ''} onChange={setStim('imageUrl')} /></div>
            )}
            {ex.stimulus?.kind === 'table' && (
              <div className="form-group">
                <label className="form-label">headers (mỗi dòng 1) + rows (JSON mảng-của-mảng)</label>
                <textarea className="form-input" rows={2} value={lines(ex.stimulus?.headers)} onChange={(e) => setEx((x) => ({ ...x, stimulus: { ...x.stimulus, headers: toArr(e.target.value) } }))} />
                <textarea className="form-input" style={{ marginTop: 6, fontFamily: 'monospace', fontSize: 12 }} rows={4}
                  defaultValue={pretty(ex.stimulus?.rows || [])}
                  onBlur={(e) => { try { const v = JSON.parse(e.target.value || '[]'); setEx((x) => ({ ...x, stimulus: { ...x.stimulus, rows: v } })); setJsonErr(''); } catch { setJsonErr('rows (stimulus) JSON không hợp lệ'); } }} />
              </div>
            )}
            <div className="form-group"><label className="form-label">note</label><input className="form-input" value={ex.stimulus?.note || ''} onChange={setStim('note')} /></div>
          </fieldset>

          {showBank && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group"><label className="form-label">wordBank (mỗi dòng 1)</label><textarea className="form-input" rows={3} value={lines(ex.wordBank)} onChange={(e) => setEx((x) => ({ ...x, wordBank: toArr(e.target.value) }))} /></div>
              <div className="form-group"><label className="form-label">categories (JSON [&#123;id,label&#125;])</label><textarea className="form-input" style={{ fontFamily: 'monospace', fontSize: 12 }} rows={3} defaultValue={pretty(ex.categories || [])} onBlur={(e) => { try { const v = JSON.parse(e.target.value || '[]'); setEx((x) => ({ ...x, categories: v })); setJsonErr(''); } catch { setJsonErr('categories JSON không hợp lệ'); } }} /></div>
            </div>
          )}
          {(ex.type === 'sentence_writing' || ex.type === 'paragraph_writing' || ex.type === 'full_task1') && (
            <div className="form-group" style={{ maxWidth: 160 }}><label className="form-label">responseSlots</label><input className="form-input" type="number" value={ex.responseSlots || 0} onChange={set('responseSlots')} /></div>
          )}

          <div className="form-group">
            <label className="form-label">items (JSON) — {OBJECTIVE_HINT[ex.type] || 'xem README_SEED.md'}</label>
            <textarea className="form-input" style={{ fontFamily: 'monospace', fontSize: 12 }} rows={10} value={itemsJson} onChange={(e) => setItemsJson(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">rubric (JSON) — cho bài chấm bằng AI / rubric</label>
            <textarea className="form-input" style={{ fontFamily: 'monospace', fontSize: 12 }} rows={6} value={rubricJson} onChange={(e) => setRubricJson(e.target.value)} />
          </div>

          {jsonErr && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{jsonErr}</div>}
          {checkErrs && (
            <div style={{ fontSize: 13, color: checkErrs.length ? 'var(--danger)' : 'var(--green)' }}>
              {checkErrs.length ? ('Lỗi: ' + checkErrs.join('; ')) : 'Hợp lệ ✓'}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={doCheck}>Kiểm tra hợp lệ</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving || (isAdmin === false)}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Lesson meta form ────────────────────────────────────────────────
// Remounted via key={lesson.code} in the parent, so the useState
// initializer re-runs whenever a different lesson is selected.
function LessonForm({ lesson, onSaved }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState(() => ({
    title: lesson.title || '', titleEn: lesson.titleEn || '', order: lesson.order ?? 0,
    isTest: !!lesson.isTest, durationMinutes: lesson.durationMinutes ?? 60, published: lesson.published !== false,
    objectives: lines(lesson.objectives), keyLanguage: lines(lesson.keyLanguage),
    gate: {
      requireObjectiveCompletion: true, minObjectiveScorePercent: 70, minWritingSubmissions: 1,
      ...(lesson.gate || {}),
    },
  }));
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value }));
  const setGate = (k) => (e) => setF((x) => ({ ...x, gate: { ...x.gate, [k]: e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value) } }));

  async function save() {
    setSaving(true);
    try {
      await apiFetch(`/admin/wt1/lessons/${lesson.code}`, {
        method: 'PUT',
        body: JSON.stringify({ ...f, objectives: toArr(f.objectives), keyLanguage: toArr(f.keyLanguage) }),
      });
      toast('Đã lưu buổi học'); onSaved();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong style={{ fontSize: 14 }}>{lesson.code}</strong>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>module {lesson.moduleCode}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 70px 90px', gap: 10 }}>
        <div className="form-group"><label className="form-label">Tiêu đề</label><input className="form-input" value={f.title} onChange={set('title')} /></div>
        <div className="form-group"><label className="form-label">Tiêu đề EN</label><input className="form-input" value={f.titleEn} onChange={set('titleEn')} /></div>
        <div className="form-group"><label className="form-label">Order</label><input className="form-input" type="number" value={f.order} onChange={set('order')} /></div>
        <div className="form-group"><label className="form-label">Phút</label><input className="form-input" type="number" value={f.durationMinutes} onChange={set('durationMinutes')} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="form-group"><label className="form-label">Mục tiêu (mỗi dòng 1)</label><textarea className="form-input" rows={3} value={f.objectives} onChange={set('objectives')} /></div>
        <div className="form-group"><label className="form-label">Ngữ pháp / Cấu trúc (mỗi dòng 1)</label><textarea className="form-input" rows={3} value={f.keyLanguage} onChange={set('keyLanguage')} /></div>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', fontSize: 13 }}>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={f.isTest} onChange={set('isTest')} /> isTest</label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={f.published} onChange={set('published')} /> published</label>
        <span style={{ color: 'var(--text3)' }}>Gate:</span>
        <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>min % KQ <input className="form-input" style={{ width: 64 }} type="number" value={f.gate.minObjectiveScorePercent} onChange={setGate('minObjectiveScorePercent')} /></label>
        <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>min bài viết <input className="form-input" style={{ width: 56 }} type="number" value={f.gate.minWritingSubmissions} onChange={setGate('minWritingSubmissions')} /></label>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving} style={{ marginLeft: 'auto' }}>{saving ? '…' : 'Lưu buổi học'}</button>
      </div>
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────────
export default function WritingTask1Course() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [selLesson, setSelLesson] = useState(null); // lesson code
  const [lessonDoc, setLessonDoc] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [editEx, setEditEx] = useState(null); // null=closed, 'new', or a full exercise doc
  const [open, setOpen] = useState({});

  useEffect(() => {
    let dead = false;
    (async () => {
      setLoading(true);
      try {
        const d = await apiFetch('/admin/wt1/tree');
        if (!dead) setTree(d.modules || []);
      } catch (e) {
        if (!dead) toast(e.message, 'error');
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => { dead = true; };
  }, [tick, toast]);

  useEffect(() => {
    let dead = false;
    (async () => {
      if (!selLesson) { setLessonDoc(null); setExercises([]); return; }
      try {
        const [l, ex] = await Promise.all([
          apiFetch(`/admin/wt1/lessons/${selLesson}`),
          apiFetch(`/admin/wt1/exercises?lesson=${selLesson}`),
        ]);
        if (!dead) { setLessonDoc(l.lesson); setExercises(ex.exercises || []); }
      } catch (e) {
        if (!dead) toast(e.message, 'error');
      }
    })();
    return () => { dead = true; };
  }, [selLesson, tick, toast]);

  const reload = () => setTick((t) => t + 1);

  async function openEx(code) {
    try {
      const d = await apiFetch(`/admin/wt1/exercises/${code}`);
      setEditEx(d.exercise);
    } catch (e) { toast(e.message, 'error'); }
  }

  function delExercise(code) {
    confirm(`Xoá bài tập ${code}? Không thể hoàn tác.`, async () => {
      try { await apiFetch(`/admin/wt1/exercises/${code}`, { method: 'DELETE' }); toast('Đã xoá'); reload(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      {editEx !== null && (
        <ExerciseModal
          exercise={editEx === 'new' ? null : editEx}
          lessonCode={selLesson}
          onClose={() => setEditEx(null)}
          onSaved={reload}
        />
      )}

      <div className="section-header">
        <h2 className="section-title">Task 1 Writing — khoá học (WT1)</h2>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>{SEED_NOTE}</div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ width: 300, flexShrink: 0 }}>
          {loading ? <div style={{ color: 'var(--text2)' }}>Đang tải…</div> : tree.map((m) => (
            <div key={m.code} style={{ marginBottom: 10, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '10px 12px', background: 'var(--surface2)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                onClick={() => setOpen((o) => ({ ...o, [m.code]: !o[m.code] }))}>
                {open[m.code] ? '▾' : '▸'} {m.title}
              </div>
              {open[m.code] && (m.lessons || []).map((l) => (
                <div key={l.code}
                  onClick={() => setSelLesson(l.code)}
                  style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', cursor: 'pointer', fontSize: 12.5, background: selLesson === l.code ? 'var(--surface2)' : 'transparent' }}>
                  <div style={{ fontWeight: selLesson === l.code ? 700 : 500 }}>{l.title} {l.isTest && <span className="badge badge-yellow">Test</span>}</div>
                  <div style={{ color: 'var(--text3)', fontSize: 11 }}>{l.exercises.published}/{l.exercises.total} bài published{l.published === false ? ' · ẩn' : ''}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {!lessonDoc ? (
            <div style={{ color: 'var(--text2)', padding: 20 }}>Chọn một buổi học ở cột trái.</div>
          ) : (
            <>
              <LessonForm key={lessonDoc.code} lesson={lessonDoc} onSaved={reload} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ fontSize: 14 }}>Bài tập ({exercises.length})</strong>
                <button className="btn btn-primary btn-sm" onClick={() => setEditEx('new')}>+ Thêm bài tập</button>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>ORDER</th><th>CODE</th><th>LOẠI</th><th>TIÊU ĐỀ</th><th>ĐIỂM</th><th>TT</th><th></th></tr></thead>
                  <tbody>
                    {exercises.length === 0 ? (
                      <tr><td colSpan={7} className="table-empty">Chưa có bài tập</td></tr>
                    ) : exercises.map((ex) => (
                      <tr key={ex.code}>
                        <td>{ex.order}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{ex.code}</td>
                        <td><span className="badge badge-blue">{ex.type}</span></td>
                        <td style={{ maxWidth: 260, wordBreak: 'break-word' }}>{ex.title}</td>
                        <td>{ex.points || 0}</td>
                        <td>
                          <span className={`badge ${ex.published ? 'badge-green' : 'badge-gray'}`}><span className="dot" />{ex.published ? 'Hiện' : 'Ẩn'}</span>
                          {ex.needsAsset && <span className="badge badge-yellow" title="thiếu ảnh">📷</span>}
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEx(ex.code)}>✏️</button>
                            {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => delExercise(ex.code)}>🗑</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
