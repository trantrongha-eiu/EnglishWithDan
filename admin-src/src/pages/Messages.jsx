import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/Pagination';

const PAGE = 20;

export default function Messages() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  // Compose state — toId/showCompose read the ?to=userId URL param once,
  // via lazy initializers, rather than an effect (searchParams is already
  // available synchronously at first render).
  const [showCompose, setShowCompose] = useState(() => !!searchParams.get('to'));
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(() => ({ toId: searchParams.get('to') || '', subject: '', body: '', isBroadcast: false }));
  const [sending, setSending] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Sent messages state
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Received messages state (student replies, payment notices, ...)
  const [box, setBox] = useState('sent'); // 'sent' | 'received'
  const [received, setReceived] = useState([]);
  const [receivedTotal, setReceivedTotal] = useState(0);
  const [receivedPage, setReceivedPage] = useState(1);

  // Online users
  const [onlineIds, setOnlineIds] = useState(new Set());

  useEffect(() => {
    loadStudents();
    loadMessages(1);
    loadReceived(1);
    loadOnline();
  }, []);

  async function loadStudents() {
    try {
      const d = await apiFetch('/admin/users?role=student&limit=500');
      setStudents(d.users || []);
    } catch { /* ignore */ }
  }

  async function loadMessages(p = page) {
    try {
      const d = await apiFetch(`/admin/messages?page=${p}&limit=${PAGE}`);
      setMessages(d.messages || []);
      setTotal(d.total || 0);
    } catch (e) { toast(e.message, 'error'); }
  }

  async function loadReceived(p = receivedPage) {
    try {
      const d = await apiFetch(`/admin/messages/received?page=${p}&limit=${PAGE}`);
      setReceived(d.messages || []);
      setReceivedTotal(d.total || 0);
    } catch (e) { toast(e.message, 'error'); }
  }

  function replyTo(fromId) {
    setForm(f => ({ ...f, toId: fromId, isBroadcast: false }));
    setShowCompose(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteReceived(id) {
    confirm('Xóa tin nhắn này?', async () => {
      try {
        await apiFetch(`/admin/messages/received/${id}`, { method: 'DELETE' });
        toast('Đã xóa');
        loadReceived(receivedPage);
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  async function loadOnline() {
    try {
      const d = await apiFetch('/admin/online-users');
      setOnlineIds(new Set((d.users || []).filter(u => u.role !== 'admin').map(u => u._id)));
    } catch { /* ignore */ }
  }

  async function send(e) {
    e.preventDefault();
    setSending(true);
    try {
      await apiFetch('/admin/messages', {
        method: 'POST',
        body: JSON.stringify({
          toId:        form.isBroadcast ? undefined : form.toId,
          subject:     form.subject,
          body:        form.body,
          isBroadcast: form.isBroadcast,
        })
      });
      toast(form.isBroadcast ? 'Đã gửi thông báo đến tất cả học sinh' : 'Đã gửi tin nhắn');
      setForm({ toId: '', subject: '', body: '', isBroadcast: false });
      setShowCompose(false);
      loadMessages(1);
      setPage(1);
    } catch (err) { toast(err.message, 'error'); }
    finally { setSending(false); }
  }

  async function deleteMsg(id) {
    confirm('Xóa tin nhắn này?', async () => {
      try {
        await apiFetch(`/admin/messages/${id}`, { method: 'DELETE' });
        toast('Đã xóa');
        loadMessages(page);
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const filteredStudents = students.filter(s =>
    !studentSearch || (s.username || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Hộp thư</h2>
        <button className="btn btn-primary" onClick={() => setShowCompose(v => !v)}>
          {showCompose ? '✕ Đóng' : '✉️ Soạn thư'}
        </button>
      </div>

      {/* ── Compose panel ── */}
      {showCompose && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Soạn tin nhắn mới</h3>
          <form onSubmit={send} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={form.isBroadcast} onChange={set('isBroadcast')} />
              <span>📢 Gửi đến <strong>tất cả học sinh</strong> (thông báo chung)</span>
            </label>

            {!form.isBroadcast && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Người nhận</label>
                <input
                  className="form-input"
                  placeholder="Tìm học sinh..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  style={{ marginBottom: 6 }}
                />
                <select className="form-input" value={form.toId} onChange={set('toId')} required={!form.isBroadcast}>
                  <option value="">-- Chọn học sinh --</option>
                  {filteredStudents.map(s => (
                    <option key={s._id} value={s._id}>
                      {onlineIds.has(s._id) ? '🟢 ' : ''}{s.username} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tiêu đề (không bắt buộc)</label>
              <input className="form-input" value={form.subject} onChange={set('subject')} placeholder="Tiêu đề tin nhắn..." />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Nội dung *</label>
              <textarea
                className="form-input"
                rows={5}
                value={form.body}
                onChange={set('body')}
                placeholder="Nhập nội dung tin nhắn..."
                required
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCompose(false)}>Huỷ</button>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? 'Đang gửi...' : '📤 Gửi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Online users quick panel ── */}
      <OnlinePanel onlineIds={onlineIds} students={students} onRefresh={loadOnline} />

      {/* ── Sent / Received tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 20, marginBottom: 12 }}>
        <button className={`btn btn-sm ${box === 'sent' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setBox('sent')}>
          📤 Đã gửi ({total})
        </button>
        <button className={`btn btn-sm ${box === 'received' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setBox('received')}>
          📥 Đã nhận ({receivedTotal})
        </button>
      </div>

      {box === 'sent' ? (
        <>
          {/* ── Sent messages table ── */}
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>NGƯỜI NHẬN</th><th>TIÊU ĐỀ</th><th>NỘI DUNG</th><th>THỜI GIAN</th><th></th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0
                  ? <tr><td colSpan={5} className="table-empty">Chưa có tin nhắn nào</td></tr>
                  : messages.map(m => (
                    <tr key={m._id}>
                      <td>
                        {m.isBroadcast
                          ? <span className="badge badge-blue">📢 Tất cả học sinh</span>
                          : <strong>{m.toId?.username || '–'}</strong>}
                      </td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.subject || <span style={{ color: 'var(--text3)' }}>(Không có tiêu đề)</span>}
                      </td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--text2)' }}>
                        {m.body}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(m.createdAt)}</td>
                      <td>
                        {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => deleteMsg(m._id)}>🗑</button>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}>
            <Pagination page={page} total={total} pageSize={PAGE} onPage={p => { setPage(p); loadMessages(p); }} />
          </div>
        </>
      ) : (
        <>
          {/* ── Received messages table (student replies, payment notices, ...) ── */}
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>NGƯỜI GỬI</th><th>TIÊU ĐỀ</th><th>NỘI DUNG</th><th>THỜI GIAN</th><th></th>
                </tr>
              </thead>
              <tbody>
                {received.length === 0
                  ? <tr><td colSpan={5} className="table-empty">Chưa có tin nhắn nào</td></tr>
                  : received.map(m => (
                    <tr key={m._id} style={{ fontWeight: m.isRead ? 400 : 700 }}>
                      <td><strong>{m.fromId?.username || m.fromName || '–'}</strong></td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.subject || <span style={{ color: 'var(--text3)' }}>(Không có tiêu đề)</span>}
                      </td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--text2)' }}>
                        {m.body}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(m.createdAt)}</td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        {m.fromId?._id && (
                          <button className="btn btn-ghost btn-sm" onClick={() => replyTo(m.fromId._id)} title="Trả lời">↩️</button>
                        )}
                        {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => deleteReceived(m._id)}>🗑</button>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}>
            <Pagination page={receivedPage} total={receivedTotal} pageSize={PAGE} onPage={p => { setReceivedPage(p); loadReceived(p); }} />
          </div>
        </>
      )}
    </>
  );
}

function OnlinePanel({ onlineIds, students, onRefresh }) {
  const onlineStudents = students.filter(s => onlineIds.has(s._id));
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
        <strong style={{ fontSize: 14 }}>{onlineStudents.length} đang online</strong>
      </div>
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {onlineStudents.length === 0
          ? <span style={{ fontSize: 13, color: 'var(--text3)' }}>Không có học sinh nào đang online</span>
          : onlineStudents.map(s => (
            <span key={s._id} style={{ fontSize: 12, padding: '3px 10px', background: 'rgba(34,197,94,.12)', color: '#16a34a', borderRadius: 20, fontWeight: 600 }}>
              🟢 {s.username}
            </span>
          ))}
      </div>
      <button className="btn btn-ghost btn-sm" onClick={onRefresh} title="Làm mới">↻ Refresh</button>
    </div>
  );
}
