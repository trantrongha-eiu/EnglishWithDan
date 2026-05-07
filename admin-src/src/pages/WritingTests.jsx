import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

function Tab({ label, active, onClick }) {
  return <button className={`inner-tab${active ? ' active' : ''}`} onClick={onClick}>{label}</button>;
}

const DEFAULT_T1 = 'You should spend about 20 minutes on this task. Write at least 150 words.';
const DEFAULT_T2 = 'You should spend about 40 minutes on this task. Write at least 250 words.';

function Task1Modal({ task, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ prompt: '', imageUrl: '', instructions: DEFAULT_T1, isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) setForm({
      prompt: task.prompt || '',
      imageUrl: task.imageUrl || '',
      instructions: task.instructions || DEFAULT_T1,
      isActive: task.isActive !== false
    });
  }, [task]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

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
          <div className="form-group">
            <label className="form-label">Đề bài (prompt) *</label>
            <textarea className="form-input" rows={4} value={form.prompt} onChange={set('prompt')} required
              placeholder="The chart below shows the percentage of households in owned and rented accommodation..." />
          </div>
          <div className="form-group">
            <label className="form-label">URL hình ảnh (nếu có)</label>
            <input className="form-input" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." />
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
      isActive: task.isActive !== false
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
          <div className="form-group">
            <label className="form-label">Đề bài (prompt) *</label>
            <textarea className="form-input" rows={5} value={form.prompt} onChange={set('prompt')} required
              placeholder="Some people think that... To what extent do you agree or disagree?" />
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

export default function WritingTests() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('task1');
  const [task1, setTask1] = useState([]);
  const [task2, setTask2] = useState([]);
  const [history, setHistory] = useState([]);
  const [editTask1, setEditTask1] = useState(null);
  const [showT1Modal, setShowT1Modal] = useState(false);
  const [editTask2, setEditTask2] = useState(null);
  const [showT2Modal, setShowT2Modal] = useState(false);

  const loadT1 = () => apiFetch('/admin/writing-task1').then(d => setTask1(d.tasks || [])).catch(() => {});
  const loadT2 = () => apiFetch('/admin/writing-task2').then(d => setTask2(d.tasks || [])).catch(() => {});

  useEffect(() => {
    loadT1();
    loadT2();
    apiFetch('/admin/writing-history').then(d => setHistory(d.attempts || [])).catch(() => {});
  }, []);

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

  return (
    <>
      {(showT1Modal || editTask1) && (
        <Task1Modal task={editTask1} onClose={() => { setShowT1Modal(false); setEditTask1(null); }} onSaved={loadT1} />
      )}
      {(showT2Modal || editTask2) && (
        <Task2Modal task={editTask2} onClose={() => { setShowT2Modal(false); setEditTask2(null); }} onSaved={loadT2} />
      )}

      <div className="section-header">
        <h2 className="section-title">Đề Writing</h2>
        {tab === 'task1' && (
          <button className="btn btn-primary" onClick={() => { setEditTask1(null); setShowT1Modal(true); }}>+ Thêm Task 1</button>
        )}
        {tab === 'task2' && (
          <button className="btn btn-primary" onClick={() => { setEditTask2(null); setShowT2Modal(true); }}>+ Thêm Task 2</button>
        )}
      </div>

      <div className="inner-tabs-nav">
        <Tab label="📝 Task 1 Pool" active={tab === 'task1'} onClick={() => setTab('task1')} />
        <Tab label="📝 Task 2 Pool" active={tab === 'task2'} onClick={() => setTab('task2')} />
        <Tab label="📊 Lịch sử nộp bài" active={tab === 'history'} onClick={() => setTab('history')} />
      </div>

      {tab === 'task1' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>PROMPT</th><th>HÌNH ẢNH</th><th>NGÀY TẠO</th><th></th></tr></thead>
            <tbody>
              {task1.length === 0
                ? <tr><td colSpan={4} className="table-empty">Chưa có prompt Task 1 nào</td></tr>
                : task1.map(p => (
                  <tr key={p._id}>
                    <td style={{ maxWidth: 380 }}>{(p.prompt || '').slice(0, 110)}{(p.prompt || '').length > 110 ? '…' : ''}</td>
                    <td>{p.imageUrl ? <a href={p.imageUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontSize: 12 }}>🖼 Xem</a> : '–'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(p.createdAt).split(' ')[0]}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditTask1(p)} title="Sửa">✏️</button>
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
            <thead><tr><th>PROMPT</th><th>NGÀY TẠO</th><th></th></tr></thead>
            <tbody>
              {task2.length === 0
                ? <tr><td colSpan={3} className="table-empty">Chưa có prompt Task 2 nào</td></tr>
                : task2.map(p => (
                  <tr key={p._id}>
                    <td style={{ maxWidth: 460 }}>{(p.prompt || '').slice(0, 130)}{(p.prompt || '').length > 130 ? '…' : ''}</td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(p.createdAt).split(' ')[0]}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditTask2(p)} title="Sửa">✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => del('task2', p._id, (p.prompt || '').slice(0, 40))}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'history' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>HỌC SINH</th><th>TASK</th><th>ĐIỂM</th><th>NGÀY NỘP</th></tr></thead>
            <tbody>
              {history.length === 0
                ? <tr><td colSpan={4} className="table-empty">Chưa có bài nộp</td></tr>
                : history.slice(0, 100).map(h => (
                  <tr key={h._id}>
                    <td><strong>{h.userId?.displayName || '–'}</strong></td>
                    <td>{h.taskType || '–'}</td>
                    <td>{h.bandScore != null ? <span style={{ color: 'var(--green)', fontWeight: 700 }}>{h.bandScore}</span> : <span style={{ color: 'var(--text3)' }}>Chờ chấm</span>}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(h.submittedAt || h.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
