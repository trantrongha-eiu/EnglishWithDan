import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

function Tab({ label, active, onClick }) {
  return (
    <button className={`inner-tab${active ? ' active' : ''}`} onClick={onClick}>{label}</button>
  );
}

function PromptTable({ items, onDelete }) {
  if (!items.length) return <tr><td colSpan={4} className="table-empty">Không có dữ liệu</td></tr>;
  return items.map(p => (
    <tr key={p._id}>
      <td style={{ maxWidth: 300 }}><strong>{p.title || p.topic}</strong></td>
      <td style={{ fontSize: 12, color: 'var(--text3)', maxWidth: 200 }}>{(p.prompt || p.description || '').slice(0, 80)}…</td>
      <td style={{ fontSize: 12 }}>{formatDate(p.createdAt).split(' ')[0]}</td>
      <td><button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(p._id, p.title || p.topic)}>🗑</button></td>
    </tr>
  ));
}

export default function WritingTests() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('task1');
  const [task1, setTask1] = useState([]);
  const [task2, setTask2] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    apiFetch('/admin/writing-task1-pool').then(d => setTask1(d.prompts || [])).catch(() => {});
    apiFetch('/admin/writing-task2-pool').then(d => setTask2(d.prompts || [])).catch(() => {});
    apiFetch('/admin/writing-history').then(d => setHistory(d.attempts || [])).catch(() => {});
  }, []);

  function del(pool, id, title) {
    const endpoint = pool === 'task1' ? `/admin/writing-task1-pool/${id}` : `/admin/writing-task2-pool/${id}`;
    confirm(`Xóa prompt "${title}"?`, async () => {
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
      <div className="section-header">
        <h2 className="section-title">Đề Writing</h2>
      </div>

      <div className="inner-tabs-nav">
        <Tab label="📝 Task 1 Pool" active={tab === 'task1'} onClick={() => setTab('task1')} />
        <Tab label="📝 Task 2 Pool" active={tab === 'task2'} onClick={() => setTab('task2')} />
        <Tab label="📊 Lịch sử nộp bài" active={tab === 'history'} onClick={() => setTab('history')} />
      </div>

      {tab === 'task1' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>TIÊU ĐỀ</th><th>NỘI DUNG</th><th>NGÀY TẠO</th><th></th></tr></thead>
            <tbody><PromptTable items={task1} onDelete={(id, t) => del('task1', id, t)} /></tbody>
          </table>
        </div>
      )}

      {tab === 'task2' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>CHỦ ĐỀ</th><th>ĐỀ BÀI</th><th>NGÀY TẠO</th><th></th></tr></thead>
            <tbody><PromptTable items={task2} onDelete={(id, t) => del('task2', id, t)} /></tbody>
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

      <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius)', color: 'var(--text3)', fontSize: 13 }}>
        💡 Để thêm prompt mới và chấm bài chi tiết, dùng trang admin cũ:
        <a href="/admin.html" style={{ color: 'var(--blue)', marginLeft: 6 }}>Mở admin cũ →</a>
      </div>
    </>
  );
}
