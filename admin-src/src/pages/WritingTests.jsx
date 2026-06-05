import { useEffect, useRef, useState } from 'react';
import { apiFetch, formatDate, API } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

function Tab({ label, active, onClick }) {
  return <button className={`inner-tab${active ? ' active' : ''}`} onClick={onClick}>{label}</button>;
}

const DEFAULT_T1 = 'You should spend about 20 minutes on this task. Write at least 150 words.';
const DEFAULT_T2 = 'You should spend about 40 minutes on this task. Write at least 250 words.';
const TASK_TYPE_LABEL = { task1: 'Task 1', task2: 'Task 2', both: 'Task 1 + 2' };

function bandBadge(b) {
  if (b == null) return null;
  const cls = b >= 7 ? 'badge-green' : b >= 5.5 ? 'badge-blue' : 'badge-red';
  return <span className={`badge ${cls}`} style={{ fontWeight: 700 }}>{Number(b).toFixed(1)}</span>;
}

function wcBadge(count, target) {
  const n = count || 0;
  const met = n >= target;
  const close = n >= target * 0.8;
  const bg = met ? '#dcfce7' : close ? '#fef9c3' : '#fee2e2';
  const col = met ? '#15803d' : close ? '#a16207' : '#b91c1c';
  return (
    <span style={{ background: bg, color: col, borderRadius: 5, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
      {n}w{!met ? ` ⚠<${target}` : ''}
    </span>
  );
}

function Task1Modal({ task, onClose, onSaved }) {
  const toast = useToast();
  const imgFileRef = useRef();
  const [form, setForm] = useState({ prompt: '', imageUrl: '', instructions: DEFAULT_T1, isActive: true });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (task) setForm({
      prompt: task.prompt || '',
      imageUrl: task.imageUrl || '',
      instructions: task.instructions || DEFAULT_T1,
      isActive: task.isActive !== false,
    });
  }, [task]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function uploadImage() {
    const file = imgFileRef.current?.files[0];
    if (!file) { toast('Chọn ảnh trước', 'error'); return; }
    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const r = await fetch(`${API}/admin/writing-task1/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ imageBase64: dataUrl }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      setForm(f => ({ ...f, imageUrl: d.url }));
      toast('Upload ảnh thành công');
    } catch (err) { toast('Upload thất bại: ' + err.message, 'error'); }
    finally { setUploading(false); }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (task?._id) await apiFetch(`/admin/writing-task1/${task._id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/admin/writing-task1', { method: 'POST', body: JSON.stringify(form) });
      toast(task?._id ? 'Đã cập nhật' : 'Đã thêm prompt Task 1');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{task?._id ? 'Sửa Task 1' : 'Thêm Task 1'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'rgba(61,139,255,.07)', border: '1px solid rgba(61,139,255,.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, lineHeight: 1.65, color: 'var(--text2)' }}>
            <strong style={{ color: 'var(--blue)' }}>Các dạng Task 1:</strong>
            <ul style={{ margin: '5px 0 0 0', paddingLeft: 16 }}>
              <li><strong>Bar chart:</strong> "The bar chart below shows the number of..."</li>
              <li><strong>Line graph:</strong> "The graph below shows changes in..."</li>
              <li><strong>Pie chart:</strong> "The pie charts below compare..."</li>
              <li><strong>Table:</strong> "The table below shows the percentage of..."</li>
              <li><strong>Map:</strong> "The maps below show the town of X in 1990 and now."</li>
              <li><strong>Process:</strong> "The diagram below shows how X is produced."</li>
            </ul>
            <div style={{ marginTop: 5 }}>Upload hình ảnh biểu đồ / sơ đồ bên dưới. Prompt thường kết thúc bằng: <em>"Summarise the information... Write at least 150 words."</em></div>
          </div>
          <div className="form-group">
            <label className="form-label">Đề bài (prompt) *</label>
            <textarea className="form-input" rows={4} value={form.prompt} onChange={set('prompt')} required
              placeholder="The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011.&#10;&#10;Summarise the information by selecting and reporting the main features, and make comparisons where relevant." />
          </div>
          <div className="form-group">
            <label className="form-label">Hình ảnh</label>
            <input className="form-input" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://... hoặc upload bên dưới" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <input ref={imgFileRef} type="file" accept="image/*" className="form-input"
                style={{ padding: 6, flex: 1, fontSize: 12 }} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={uploadImage}
                disabled={uploading} style={{ flexShrink: 0 }}>
                {uploading ? 'Đang upload...' : '📤 Upload'}
              </button>
            </div>
            {form.imageUrl && (
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <img src={form.imageUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6, border: '1px solid var(--border)' }} />
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Hướng dẫn</label>
            <textarea className="form-input" rows={2} value={form.instructions} onChange={set('instructions')} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Kích hoạt
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

function Task2Modal({ task, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ prompt: '', instructions: DEFAULT_T2, isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) setForm({
      prompt: task.prompt || '',
      instructions: task.instructions || DEFAULT_T2,
      isActive: task.isActive !== false,
    });
  }, [task]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (task?._id) await apiFetch(`/admin/writing-task2/${task._id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/admin/writing-task2', { method: 'POST', body: JSON.stringify(form) });
      toast(task?._id ? 'Đã cập nhật' : 'Đã thêm prompt Task 2');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{task?._id ? 'Sửa Task 2' : 'Thêm Task 2'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'rgba(61,139,255,.07)', border: '1px solid rgba(61,139,255,.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, lineHeight: 1.65, color: 'var(--text2)' }}>
            <strong style={{ color: 'var(--blue)' }}>Các dạng đề Task 2:</strong>
            <ul style={{ margin: '5px 0 0 0', paddingLeft: 16 }}>
              <li><strong>Opinion:</strong> "...To what extent do you agree or disagree?"</li>
              <li><strong>Discussion:</strong> "Discuss both views and give your own opinion."</li>
              <li><strong>Advantages/Disadvantages:</strong> "Do the advantages outweigh the disadvantages?"</li>
              <li><strong>Problem/Solution:</strong> "What are the causes of this? What solutions can you suggest?"</li>
              <li><strong>Two-part question:</strong> "Why is this? What can be done to...?"</li>
            </ul>
            <div style={{ marginTop: 5 }}>Prompt thường bắt đầu với một câu đặt vấn đề, tiếp theo là câu hỏi. Kết thúc bằng: <em>"Give reasons for your answer... Write at least 250 words."</em></div>
          </div>
          <div className="form-group">
            <label className="form-label">Đề bài (prompt) *</label>
            <textarea className="form-input" rows={5} value={form.prompt} onChange={set('prompt')} required
              placeholder="Some people think that... To what extent do you agree or disagree?&#10;&#10;Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words." />
          </div>
          <div className="form-group">
            <label className="form-label">Hướng dẫn</label>
            <textarea className="form-input" rows={2} value={form.instructions} onChange={set('instructions')} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Kích hoạt
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

function BandInput({ label, value, onChange }) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label" style={{ fontSize: 11 }}>{label}</label>
      <input className="form-input" type="number" min={0} max={9} step={0.5}
        value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        style={{ fontSize: 13, padding: '6px 8px' }} placeholder="0–9" />
    </div>
  );
}

function GradingModal({ attemptId, onClose, onGraded }) {
  const toast = useToast();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [aiGrading, setAiGrading] = useState({ t1: false, t2: false });
  const [grade, setGrade] = useState({
    task1: { bandScore: null, ta: null, cc: null, lr: null, gra: null },
    task2: { bandScore: null, ta: null, cc: null, lr: null, gra: null },
    overallBand: null,
    adminNote: '',
  });
  const [aiRaw, setAiRaw] = useState({ task1: null, task2: null });

  useEffect(() => {
    apiFetch(`/admin/writing-attempt/${attemptId}`)
      .then(d => {
        const a = d.attempt;
        setAttempt(a);
        if (a.grading?.overallBand != null) {
          const src = a.grading;
          setGrade({
            task1: {
              bandScore: src.task1?.bandScore ?? null,
              ta:  src.task1?.ta?.score  ?? null,
              cc:  src.task1?.cc?.score  ?? null,
              lr:  src.task1?.lr?.score  ?? null,
              gra: src.task1?.gra?.score ?? null,
            },
            task2: {
              bandScore: src.task2?.bandScore ?? null,
              ta:  src.task2?.ta?.score  ?? null,
              cc:  src.task2?.cc?.score  ?? null,
              lr:  src.task2?.lr?.score  ?? null,
              gra: src.task2?.gra?.score ?? null,
            },
            overallBand: src.overallBand ?? null,
            adminNote: src.adminNote || '',
          });
          setAiRaw({ task1: src.task1, task2: src.task2 });
        }
      })
      .catch(() => toast('Không tải được bài nộp', 'error'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  function setTask(taskKey, field, val) {
    setGrade(g => ({ ...g, [taskKey]: { ...g[taskKey], [field]: val } }));
  }

  function autoOverall() {
    const b1 = grade.task1.bandScore;
    const b2 = grade.task2.bandScore;
    const hasT1 = b1 != null, hasT2 = b2 != null;
    if (hasT1 && hasT2) {
      const avg = Math.round(((b1 / 3) + (b2 * 2 / 3)) * 2) / 2;
      setGrade(g => ({ ...g, overallBand: avg }));
    } else if (hasT1 || hasT2) {
      setGrade(g => ({ ...g, overallBand: hasT1 ? b1 : b2 }));
    }
  }

  async function runAiGrade(taskNum) {
    const key = taskNum === 1 ? 't1' : 't2';
    const taskKey = taskNum === 1 ? 'task1' : 'task2';
    setAiGrading(s => ({ ...s, [key]: true }));
    try {
      const d = await apiFetch(`/admin/writing-attempts/${attemptId}/ai-grade`, {
        method: 'POST',
        body: JSON.stringify({ taskNum }),
      });
      const r = d.result || {};
      setAiRaw(prev => ({ ...prev, [taskKey]: r }));
      setGrade(g => ({
        ...g,
        [taskKey]: {
          bandScore: r.bandScore ?? g[taskKey].bandScore,
          ta:  r.ta?.score  ?? g[taskKey].ta,
          cc:  r.cc?.score  ?? g[taskKey].cc,
          lr:  r.lr?.score  ?? g[taskKey].lr,
          gra: r.gra?.score ?? g[taskKey].gra,
        },
      }));
      toast(`AI đã chấm xong Task ${taskNum} – kiểm tra và xác nhận điểm`);
    } catch (err) { toast('AI chấm thất bại: ' + err.message, 'error'); }
    finally { setAiGrading(s => ({ ...s, [key]: false })); }
  }

  async function submitGrade() {
    if (grade.overallBand == null) { toast('Vui lòng nhập điểm tổng', 'error'); return; }
    setConfirming(true);
    try {
      function buildTask(g, ai) {
        return {
          bandScore:       g.bandScore,
          ta:  { score: g.ta,  comment: ai?.ta?.comment  || '' },
          cc:  { score: g.cc,  comment: ai?.cc?.comment  || '' },
          lr:  { score: g.lr,  comment: ai?.lr?.comment  || '' },
          gra: { score: g.gra, comment: ai?.gra?.comment || '' },
          overallFeedback: ai?.overallFeedback || '',
          corrections:     ai?.corrections    || [],
          suggestions:     ai?.suggestions    || [],
        };
      }
      await apiFetch(`/admin/writing-attempts/${attemptId}/confirm-grade`, {
        method: 'PUT',
        body: JSON.stringify({
          task1:       buildTask(grade.task1, aiRaw.task1),
          task2:       buildTask(grade.task2, aiRaw.task2),
          overallBand: grade.overallBand,
          adminNote:   grade.adminNote,
        }),
      });
      toast('Đã xác nhận điểm và gửi feedback cho học sinh');
      onGraded();
      onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setConfirming(false); }
  }

  const CRITERIA = [
    { key: 'ta',  label: 'Task Achievement' },
    { key: 'lr',  label: 'Lexical Resource' },
    { key: 'gra', label: 'Grammatical Range' },
    { key: 'cc',  label: 'Coherence & Cohesion' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 780, maxHeight: '94vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">✏️ Chấm bài Writing</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Đang tải...</div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {attempt && (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text2)', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
                <span><strong>Học sinh:</strong> {attempt.userId ? [attempt.userId.firstName, attempt.userId.lastName].filter(Boolean).join(' ') || attempt.userId.username : '–'}</span>
                <span><strong>Số từ:</strong> {(attempt.wordCount1 || 0) + (attempt.wordCount2 || 0)}</span>
                <span><strong>Trạng thái:</strong> {attempt.gradingStatus === 'confirmed' ? '✅ Đã xác nhận' : '⏳ Chờ chấm'}</span>
              </div>
            )}

            {attempt?.task1Answer && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Task 1</div>
                {attempt.task1Snapshot?.imageUrl && (
                  <img src={attempt.task1Snapshot.imageUrl} alt="task1"
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6, marginBottom: 8, border: '1px solid var(--border)' }} />
                )}
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>{attempt.task1Snapshot?.prompt}</div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, lineHeight: 1.7, maxHeight: 160, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                  {attempt.task1Answer}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 10 }}>
                  <BandInput label="Band Score" value={grade.task1.bandScore} onChange={v => setTask('task1', 'bandScore', v)} />
                  {CRITERIA.map(c => <BandInput key={c.key} label={c.label} value={grade.task1[c.key]} onChange={v => setTask('task1', c.key, v)} />)}
                </div>
              </div>
            )}

            {attempt?.task2Answer && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Task 2</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>{attempt.task2Snapshot?.prompt}</div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, lineHeight: 1.7, maxHeight: 180, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                  {attempt.task2Answer}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 10 }}>
                  <BandInput label="Band Score" value={grade.task2.bandScore} onChange={v => setTask('task2', 'bandScore', v)} />
                  {CRITERIA.map(c => <BandInput key={c.key} label={c.label} value={grade.task2[c.key]} onChange={v => setTask('task2', c.key, v)} />)}
                </div>
              </div>
            )}

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Điểm tổng (Band)</label>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 6px' }}
                      onClick={autoOverall} title="Tự tính từ Task 1 + Task 2">Auto</button>
                  </div>
                  <input className="form-input" type="number" min={0} max={9} step={0.5}
                    value={grade.overallBand ?? ''}
                    onChange={e => setGrade(g => ({ ...g, overallBand: e.target.value === '' ? null : Number(e.target.value) }))}
                    style={{ fontSize: 16, fontWeight: 700, textAlign: 'center' }} placeholder="6.5" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Feedback gửi cho học sinh</label>
                  <textarea className="form-input" rows={3} value={grade.adminNote}
                    onChange={e => setGrade(g => ({ ...g, adminNote: e.target.value }))}
                    placeholder="Nhận xét và góp ý cụ thể cho học sinh..." />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
              <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
              <button className="btn btn-ghost" onClick={() => runAiGrade(1)}
                disabled={aiGrading.t1 || aiGrading.t2 || confirming}
                title="AI chấm Task 1 – bạn vẫn có thể sửa trước khi xác nhận">
                {aiGrading.t1 ? '⏳ Task 1...' : '🤖 AI T1'}
              </button>
              <button className="btn btn-ghost" onClick={() => runAiGrade(2)}
                disabled={aiGrading.t1 || aiGrading.t2 || confirming}
                title="AI chấm Task 2 – bạn vẫn có thể sửa trước khi xác nhận">
                {aiGrading.t2 ? '⏳ Task 2...' : '🤖 AI T2'}
              </button>
              <button className="btn btn-primary" onClick={submitGrade} disabled={confirming || aiGrading.t1 || aiGrading.t2}>
                {confirming ? 'Đang lưu...' : '✅ Xác nhận & Gửi feedback'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WritingSampleModal({ sample, onClose, onSaved }) {
  const toast = useToast();
  const fileRef = useRef();
  const [form, setForm] = useState({ title: '', quarter: '', topic: '', taskType: 'task2' });
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    if (sample) setForm({
      title: sample.title || '',
      quarter: sample.quarter || '',
      topic: sample.topic || '',
      taskType: sample.taskType || 'task2',
    });
  }, [sample]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    const { title, quarter, topic, taskType } = form;
    if (!title || !quarter || !topic) { toast('Điền đầy đủ thông tin', 'error'); return; }
    setSaving(true);
    setUploadStatus('');
    try {
      if (sample?._id) {
        const file = fileRef.current?.files[0];
        let body = { title, quarter, topic, taskType };
        if (file) {
          setUploadStatus('⬆️ Đang upload PDF mới...');
          const fd = new FormData();
          fd.append('pdf', file);
          const r = await fetch(`${API}/admin/writing/samples/upload-pdf`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: fd,
          });
          const d = await r.json();
          if (!d.success) throw new Error(d.message);
          body.pdfUrl = d.url;
        }
        setUploadStatus('💾 Đang lưu...');
        await apiFetch(`/admin/writing/samples/${sample._id}`, { method: 'PUT', body: JSON.stringify(body) });
        toast('Đã cập nhật tài liệu');
      } else {
        const file = fileRef.current?.files[0];
        if (!file) { toast('Chưa chọn file PDF', 'error'); setSaving(false); return; }
        setUploadStatus('⬆️ Đang upload PDF lên Cloudinary...');
        const fd = new FormData();
        fd.append('pdf', file);
        const r = await fetch(`${API}/admin/writing/samples/upload-pdf`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: fd,
        });
        const uploadData = await r.json();
        if (!uploadData.success) throw new Error(uploadData.message);
        setUploadStatus('💾 Đang lưu thông tin...');
        await apiFetch('/admin/writing/samples', {
          method: 'POST',
          body: JSON.stringify({ title, quarter, topic, taskType, pdfUrl: uploadData.url }),
        });
        toast('Đã upload bài mẫu Writing');
      }
      onSaved();
      onClose();
    } catch (err) { toast(err.message, 'error'); setUploadStatus(''); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{sample?._id ? 'Chỉnh sửa tài liệu' : 'Upload bài mẫu Writing'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Tiêu đề *</label>
            <input className="form-input" value={form.title} onChange={set('title')} required
              placeholder="Band 8.0 Task 2 – Advantages & Disadvantages" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quý / Kỳ *</label>
              <input className="form-input" value={form.quarter} onChange={set('quarter')} required placeholder="Q1 2026" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Loại *</label>
              <select className="form-input" value={form.taskType} onChange={set('taskType')}>
                <option value="task1">Task 1</option>
                <option value="task2">Task 2</option>
                <option value="both">Task 1 + Task 2</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Chủ đề *</label>
            <input className="form-input" value={form.topic} onChange={set('topic')} required
              placeholder="Advantages and disadvantages of..." />
          </div>
          <div className="form-group">
            <label className="form-label">{sample?._id ? 'File PDF (để trống nếu không đổi)' : 'File PDF *'}</label>
            <input ref={fileRef} type="file" className="form-input" accept=".pdf" style={{ padding: 8 }} />
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>PDF · Tối đa 20MB · Upload lên Cloudinary</div>
          </div>
          {uploadStatus && (
            <div style={{ fontSize: 13, color: 'var(--blue)', background: 'var(--surface2)', borderRadius: 6, padding: '8px 12px' }}>
              {uploadStatus}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang xử lý...' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WritingViewModal({ attemptId, onClose }) {
  const toast = useToast();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/admin/writing-attempt/${attemptId}`)
      .then(d => setAttempt(d.attempt))
      .catch(() => toast('Không tải được bài nộp', 'error'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  function download() {
    if (!attempt) return;
    const u = attempt.userId || {};
    const name = u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.username || 'Student');
    const t1 = attempt.task1Snapshot || {};
    const t2 = attempt.task2Snapshot || {};
    const text = [
      `${name} — ${attempt.examName || 'Writing Test'}`,
      `Ngày nộp: ${new Date(attempt.submittedAt || attempt.createdAt).toLocaleString('vi-VN')}`,
      '',
      '=== TASK 1 ===',
      t1.prompt || '',
      '',
      attempt.task1Answer || '(trống)',
      '',
      '=== TASK 2 ===',
      t2.prompt || '',
      '',
      attempt.task2Answer || '(trống)',
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = `${name}_writing.txt`; el.click();
    URL.revokeObjectURL(url);
  }

  const u = attempt?.userId || {};
  const studentName = attempt
    ? ([u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '–')
    : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 800, maxHeight: '94vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">👁 Xem bài Writing{attempt ? ` — ${studentName}` : ''}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Đang tải...</div>
        ) : !attempt ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Không tìm thấy bài nộp</div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', gap: 16, flexWrap: 'wrap', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
              <span><strong>Học sinh:</strong> {studentName}</span>
              <span><strong>Bài thi:</strong> {attempt.examName || '–'}</span>
              <span><strong>Ngày nộp:</strong> {formatDate(attempt.submittedAt || attempt.createdAt)}</span>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                TASK 1 — {attempt.wordCount1 || 0} từ
                {(attempt.wordCount1 || 0) < 150 && <span style={{ color: '#b91c1c', fontSize: 12, marginLeft: 6 }}>⚠ dưới 150</span>}
              </div>
              {attempt.task1Snapshot?.imageUrl && (
                <img src={attempt.task1Snapshot.imageUrl} alt="task1"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6, marginBottom: 8, border: '1px solid var(--border)' }} />
              )}
              {attempt.task1Snapshot?.prompt && (
                <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '10px 12px', fontSize: 13, marginBottom: 8, whiteSpace: 'pre-wrap', color: 'var(--text2)' }}>
                  {attempt.task1Snapshot.prompt}
                </div>
              )}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, lineHeight: 1.75, maxHeight: 220, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                {attempt.task1Answer || <span style={{ color: 'var(--text3)' }}>(trống)</span>}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                TASK 2 — {attempt.wordCount2 || 0} từ
                {(attempt.wordCount2 || 0) < 250 && <span style={{ color: '#b91c1c', fontSize: 12, marginLeft: 6 }}>⚠ dưới 250</span>}
              </div>
              {attempt.task2Snapshot?.prompt && (
                <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '10px 12px', fontSize: 13, marginBottom: 8, whiteSpace: 'pre-wrap', color: 'var(--text2)' }}>
                  {attempt.task2Snapshot.prompt}
                </div>
              )}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, lineHeight: 1.75, maxHeight: 280, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                {attempt.task2Answer || <span style={{ color: 'var(--text3)' }}>(trống)</span>}
              </div>
            </div>

            {attempt.grading?.overallBand != null && (
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 16px', fontSize: 13 }}>
                <strong>Điểm xác nhận:</strong>{' '}
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>{attempt.grading.overallBand}</span>
                {attempt.grading.adminNote && (
                  <div style={{ marginTop: 8, color: 'var(--text2)', lineHeight: 1.6 }}>
                    <strong>Feedback:</strong> {attempt.grading.adminNote}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
              <button className="btn btn-ghost" onClick={download}>⬇ Tải về (.txt)</button>
              <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WritingExamModal({ exam, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', duration: 60, isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (exam) setForm({ name: exam.name || '', duration: exam.duration || 60, isActive: exam.isActive !== false });
  }, [exam]);

  const set = k => e => setForm(f => ({
    ...f,
    [k]: e.target.type === 'checkbox' ? e.target.checked
       : e.target.type === 'number' ? Number(e.target.value)
       : e.target.value
  }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (exam?._id) await apiFetch(`/admin/writing-exams/${exam._id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/admin/writing-exams', { method: 'POST', body: JSON.stringify(form) });
      toast(exam?._id ? 'Đã cập nhật đề' : 'Đã tạo đề Writing');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{exam?._id ? 'Sửa đề Writing' : 'Thêm đề Writing'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Tên đề *</label>
            <input className="form-input" value={form.name} onChange={set('name')} required placeholder="Writing Test 1" />
          </div>
          <div className="form-group">
            <label className="form-label">Thời gian (phút)</label>
            <input className="form-input" type="number" value={form.duration} onChange={set('duration')} min={10} max={180} />
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Task 1: 20 phút · Task 2: 40 phút → mặc định 60 phút</div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Kích hoạt
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

export default function WritingTests() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('task1');
  const [task1, setTask1] = useState([]);
  const [task2, setTask2] = useState([]);
  const [history, setHistory] = useState([]);
  const [samples, setSamples] = useState([]);
  const [exams, setExams] = useState([]);
  const [editTask1, setEditTask1] = useState(null);
  const [showT1Modal, setShowT1Modal] = useState(false);
  const [editTask2, setEditTask2] = useState(null);
  const [showT2Modal, setShowT2Modal] = useState(false);
  const [gradingId, setGradingId] = useState(null);
  const [viewAttemptId, setViewAttemptId] = useState(null);
  const [editSample, setEditSample] = useState(null);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('');
  const [historySearch, setHistorySearch] = useState('');

  const loadT1 = () => apiFetch('/admin/writing-task1').then(d => setTask1(d.tasks || [])).catch(() => {});
  const loadT2 = () => apiFetch('/admin/writing-task2').then(d => setTask2(d.tasks || [])).catch(() => {});
  const loadHistory = () => apiFetch('/admin/writing-history').then(d => setHistory(d.attempts || [])).catch(() => {});
  const loadSamples = () => apiFetch('/admin/writing/samples').then(d => setSamples(d.samples || [])).catch(() => {});
  const loadExams = () => apiFetch('/admin/writing-exams').then(d => setExams(d.exams || [])).catch(() => {});

  useEffect(() => { loadT1(); loadT2(); loadHistory(); loadSamples(); loadExams(); }, []);

  async function toggleActive(pool, id, isActive) {
    const endpoint = pool === 'task1' ? `/admin/writing-task1/${id}` : `/admin/writing-task2/${id}`;
    try {
      await apiFetch(endpoint, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn' : 'Đã hiện');
      if (pool === 'task1') loadT1(); else loadT2();
    } catch (e) { toast(e.message, 'error'); }
  }

  function del(pool, id, label) {
    const endpoint = pool === 'task1' ? `/admin/writing-task1/${id}` : `/admin/writing-task2/${id}`;
    confirm(`Xóa prompt "${label}"?`, async () => {
      try {
        await apiFetch(endpoint, { method: 'DELETE' });
        toast('Đã xóa');
        if (pool === 'task1') setTask1(a => a.filter(x => x._id !== id));
        else setTask2(a => a.filter(x => x._id !== id));
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  function delAttempt(id) {
    confirm('Xóa bài nộp này?', async () => {
      try {
        await apiFetch(`/admin/writing-attempts/${id}`, { method: 'DELETE' });
        toast('Đã xóa');
        loadHistory();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  async function toggleSample(id, isActive) {
    try {
      await apiFetch(`/admin/writing/samples/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn' : 'Đã hiện');
      loadSamples();
    } catch (e) { toast(e.message, 'error'); }
  }

  function delSample(id, title) {
    confirm(`Xóa bài mẫu "${title}"?`, async () => {
      try {
        await apiFetch(`/admin/writing/samples/${id}`, { method: 'DELETE' });
        toast('Đã xóa');
        setSamples(a => a.filter(x => x._id !== id));
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  async function toggleExam(id, isActive) {
    try {
      await apiFetch(`/admin/writing-exams/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn đề' : 'Đã kích hoạt đề');
      loadExams();
    } catch (e) { toast(e.message, 'error'); }
  }

  function delExam(id, name) {
    confirm(`Ẩn đề "${name}"?`, async () => {
      try {
        await apiFetch(`/admin/writing-exams/${id}`, { method: 'DELETE' });
        toast('Đã ẩn đề');
        loadExams();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  const STATUS_MAP = { pending: '⏳ Chờ chấm', ai_done: '⏳ Chờ xác nhận', confirmed: '✅ Đã xác nhận' };
  const STATUS_COLOR = { pending: 'var(--text3)', ai_done: 'var(--text3)', confirmed: 'var(--green)' };

  return (
    <>
      {(showT1Modal || editTask1) && (
        <Task1Modal task={editTask1} onClose={() => { setShowT1Modal(false); setEditTask1(null); }} onSaved={loadT1} />
      )}
      {(showT2Modal || editTask2) && (
        <Task2Modal task={editTask2} onClose={() => { setShowT2Modal(false); setEditTask2(null); }} onSaved={loadT2} />
      )}
      {gradingId && (
        <GradingModal attemptId={gradingId} onClose={() => setGradingId(null)} onGraded={loadHistory} />
      )}
      {viewAttemptId && (
        <WritingViewModal attemptId={viewAttemptId} onClose={() => setViewAttemptId(null)} />
      )}
      {(showSampleModal || editSample) && (
        <WritingSampleModal
          sample={editSample}
          onClose={() => { setShowSampleModal(false); setEditSample(null); }}
          onSaved={loadSamples}
        />
      )}
      {(showExamModal || editExam) && (
        <WritingExamModal
          exam={editExam}
          onClose={() => { setShowExamModal(false); setEditExam(null); }}
          onSaved={loadExams}
        />
      )}

      <div className="section-header">
        <h2 className="section-title">Đề Writing</h2>
        {tab === 'task1' && <button className="btn btn-primary" onClick={() => { setEditTask1(null); setShowT1Modal(true); }}>+ Thêm Task 1</button>}
        {tab === 'task2' && <button className="btn btn-primary" onClick={() => { setEditTask2(null); setShowT2Modal(true); }}>+ Thêm Task 2</button>}
        {tab === 'samples' && <button className="btn btn-primary" onClick={() => { setEditSample(null); setShowSampleModal(true); }}>+ Upload bài mẫu</button>}
        {tab === 'exams' && <button className="btn btn-primary" onClick={() => { setEditExam(null); setShowExamModal(true); }}>+ Thêm đề thi</button>}
      </div>

      <div className="inner-tabs-nav">
        <Tab label="🗂 Đề thi" active={tab === 'exams'} onClick={() => setTab('exams')} />
        <Tab label="📝 Task 1 Pool" active={tab === 'task1'} onClick={() => setTab('task1')} />
        <Tab label="📝 Task 2 Pool" active={tab === 'task2'} onClick={() => setTab('task2')} />
        <Tab label="📊 Lịch sử nộp bài" active={tab === 'history'} onClick={() => setTab('history')} />
        <Tab label="📄 Bài mẫu" active={tab === 'samples'} onClick={() => setTab('samples')} />
      </div>

      {tab === 'exams' && (
        <>
          <div style={{ fontSize: 13, color: 'var(--text2)', background: 'var(--surface2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, lineHeight: 1.6 }}>
            <strong>Đề thi Writing</strong> là container gắn với access key. Mỗi lần thi, hệ thống tự ghép 1 prompt Task 1 + 1 prompt Task 2 ngẫu nhiên từ pool. Cần ít nhất 1 đề đang kích hoạt để học sinh có thể bắt đầu.
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>TÊN ĐỀ</th><th>THỜI GIAN</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
              <tbody>
                {exams.length === 0
                  ? <tr><td colSpan={5} className="table-empty">Chưa có đề nào – nhấn "+ Thêm đề thi"</td></tr>
                  : exams.map(ex => (
                    <tr key={ex._id}>
                      <td><strong>{ex.name}</strong></td>
                      <td style={{ fontSize: 13 }}>{ex.duration} phút</td>
                      <td>
                        <span className={`badge ${ex.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
                          <span className="dot" />{ex.isActive !== false ? 'Kích hoạt' : 'Ẩn'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(ex.createdAt).split(' ')[0]}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditExam(ex)} title="Sửa">✏️</button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleExam(ex._id, ex.isActive !== false)}
                            title={ex.isActive !== false ? 'Ẩn' : 'Kích hoạt'}>{ex.isActive !== false ? '🙈' : '👁'}</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => delExam(ex._id, ex.name)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'task1' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>PROMPT</th><th>HÌNH ẢNH</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
            <tbody>
              {task1.length === 0
                ? <tr><td colSpan={5} className="table-empty">Chưa có prompt Task 1 nào</td></tr>
                : task1.map(p => (
                  <tr key={p._id}>
                    <td style={{ maxWidth: 340 }}>{(p.prompt || '').slice(0, 100)}{(p.prompt || '').length > 100 ? '…' : ''}</td>
                    <td>{p.imageUrl ? <a href={p.imageUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontSize: 12 }}>🖼 Xem</a> : '–'}</td>
                    <td>
                      <span className={`badge ${p.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
                        <span className="dot" />{p.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(p.createdAt).split(' ')[0]}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditTask1(p)} title="Sửa">✏️</button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive('task1', p._id, p.isActive !== false)} title={p.isActive !== false ? 'Ẩn' : 'Hiện'}>{p.isActive !== false ? '🙈' : '👁'}</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => del('task1', p._id, (p.prompt || '').slice(0, 40))}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'task2' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>PROMPT</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
            <tbody>
              {task2.length === 0
                ? <tr><td colSpan={4} className="table-empty">Chưa có prompt Task 2 nào</td></tr>
                : task2.map(p => (
                  <tr key={p._id}>
                    <td style={{ maxWidth: 400 }}>{(p.prompt || '').slice(0, 120)}{(p.prompt || '').length > 120 ? '…' : ''}</td>
                    <td>
                      <span className={`badge ${p.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
                        <span className="dot" />{p.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(p.createdAt).split(' ')[0]}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditTask2(p)} title="Sửa">✏️</button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive('task2', p._id, p.isActive !== false)} title={p.isActive !== false ? 'Ẩn' : 'Hiện'}>{p.isActive !== false ? '🙈' : '👁'}</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => del('task2', p._id, (p.prompt || '').slice(0, 40))}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'history' && (() => {
        const displayHistory = history.filter(h => {
          const u = h.userId || {};
          const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '';
          const matchSearch = !historySearch || name.toLowerCase().includes(historySearch.toLowerCase()) || (h.examName || '').toLowerCase().includes(historySearch.toLowerCase());
          const matchStatus = !historyFilter || h.gradingStatus === historyFilter;
          return matchSearch && matchStatus;
        });
        return (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <select className="form-input" value={historyFilter} onChange={e => setHistoryFilter(e.target.value)} style={{ width: 180 }}>
                <option value="">Tất cả trạng thái</option>
                <option value="pending">⏳ Chờ chấm</option>
                <option value="ai_done">🤖 AI đã chấm</option>
                <option value="confirmed">✅ Đã xác nhận</option>
              </select>
              <input className="form-input search-input" placeholder="Tìm học sinh, bài thi..."
                value={historySearch} onChange={e => setHistorySearch(e.target.value)} style={{ maxWidth: 260 }} />
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>HỌC SINH</th><th>BÀI THI</th><th>T1 (≥150w)</th><th>T2 (≥250w)</th><th>ĐIỂM</th><th>TRẠNG THÁI</th><th>NGÀY NỘP</th><th></th></tr>
                </thead>
                <tbody>
                  {displayHistory.length === 0
                    ? <tr><td colSpan={8} className="table-empty">Không tìm thấy bài nộp nào</td></tr>
                    : displayHistory.slice(0, 200).map(h => {
                      const u = h.userId || {};
                      const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '–';
                      const finalScore = h.grading?.overallBand;
                      return (
                        <tr key={h._id}>
                          <td><strong>{name}</strong></td>
                          <td style={{ fontSize: 12, color: 'var(--text2)' }}>{h.examName || '–'}</td>
                          <td>{wcBadge(h.wordCount1, 150)}</td>
                          <td>{wcBadge(h.wordCount2, 250)}</td>
                          <td>{finalScore != null ? bandBadge(finalScore) : <span style={{ color: 'var(--text3)', fontSize: 12 }}>–</span>}</td>
                          <td>
                            <span style={{ fontSize: 12, color: STATUS_COLOR[h.gradingStatus] || 'var(--text3)' }}>
                              {STATUS_MAP[h.gradingStatus] || '–'}
                            </span>
                          </td>
                          <td style={{ fontSize: 12 }}>{formatDate(h.submittedAt || h.createdAt)}</td>
                          <td>
                            <div className="row-actions">
                              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setViewAttemptId(h._id)} title="Xem bài">👁</button>
                              <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '3px 8px' }}
                                onClick={() => setGradingId(h._id)}>✏️ Chấm</button>
                              <button className="btn btn-danger btn-sm btn-icon" onClick={() => delAttempt(h._id)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </>
        );
      })()}

      {tab === 'samples' && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>TIÊU ĐỀ</th><th>KỲ</th><th>CHỦ ĐỀ</th><th>LOẠI</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr>
            </thead>
            <tbody>
              {samples.length === 0
                ? <tr><td colSpan={7} className="table-empty">Chưa có bài mẫu nào</td></tr>
                : samples.map(s => (
                  <tr key={s._id}>
                    <td><strong>{s.title}</strong></td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{s.quarter}</td>
                    <td style={{ maxWidth: 200, fontSize: 13 }}>{(s.topic || '').slice(0, 60)}{(s.topic || '').length > 60 ? '…' : ''}</td>
                    <td>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 8, background: '#eff6ff', color: '#3d8bff' }}>
                        {TASK_TYPE_LABEL[s.taskType] || s.taskType}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
                        <span className="dot" />{s.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(s.createdAt).split(' ')[0]}</td>
                    <td>
                      <div className="row-actions">
                        {s.pdfUrl && (
                          <a href={s.pdfUrl} target="_blank" rel="noreferrer"
                            className="btn btn-ghost btn-sm btn-icon" title="Xem PDF">📄</a>
                        )}
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditSample(s)} title="Sửa">✏️</button>
                        <button className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => toggleSample(s._id, s.isActive !== false)}
                          title={s.isActive !== false ? 'Ẩn' : 'Hiện'}>{s.isActive !== false ? '🙈' : '👁'}</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => delSample(s._id, s.title)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
