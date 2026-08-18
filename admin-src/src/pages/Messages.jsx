import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/Pagination';
import StudentPicker from './tuition/StudentPicker';

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
  const [form, setForm] = useState(() => ({ toId: searchParams.get('to') || '', subject: '', body: '', isBroadcast: false, giftHammers: '', giftStreakDays: '' }));
  const [showGift, setShowGift] = useState(false);
  const [sending, setSending] = useState(false);
  // Set when editing an already-sent message (via the ✏️ button on the Sent
  // tab) instead of composing a new one — only subject/body are editable
  // once a message has gone out (recipient/broadcast/gift are immutable:
  // a gift may already be claimed, and re-targeting a sent message makes
  // no sense), so the compose form hides those fields while this is set.
  const [editingId, setEditingId] = useState(null);

  // Sent messages state
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Received messages state (student replies, payment notices, ...)
  const [box, setBox] = useState('sent'); // 'sent' | 'received' | 'reports'
  const [received, setReceived] = useState([]);
  const [receivedTotal, setReceivedTotal] = useState(0);
  const [receivedPage, setReceivedPage] = useState(1);

  // Reports state — students reporting each other from peer chat (see
  // services/peerService.js). Small volume expected, so no pagination —
  // just an open/resolved filter.
  const [reports, setReports] = useState([]);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [reportStatus, setReportStatus] = useState('open'); // 'open' | 'resolved'

  // Online users — full user objects straight from /admin/online-users
  // (which already returns username/role/lastSeen for whoever is actually
  // online right now), NOT cross-referenced against the `students` list
  // below. That list is separately capped at the 500 most-recently-created
  // students (for the message-recipient picker) — any online student whose
  // account predates the newest 500 signups used to silently vanish from
  // this panel even though /admin/online-users correctly reported them.
  const [onlineStudents, setOnlineStudents] = useState([]);

  useEffect(() => {
    loadStudents();
    loadMessages(1);
    loadReceived(1);
    loadReports('open');
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

  async function loadReports(status = reportStatus) {
    try {
      const d = await apiFetch(`/admin/reports?status=${status}`);
      setReports(d.reports || []);
      // Backend still hard-caps the list at 200 (see backend/routes/admin/
      // messages.js) but now also returns the true count, so the badge
      // below can show "loaded/total" instead of presenting the loaded
      // (possibly truncated) count as if it were everything.
      setReportsTotal(d.total ?? (d.reports || []).length);
    } catch (e) { toast(e.message, 'error'); }
  }

  function switchReportStatus(status) {
    setReportStatus(status);
    loadReports(status);
  }

  async function resolveReport(id) {
    try {
      await apiFetch(`/admin/reports/${id}/resolve`, { method: 'PATCH' });
      toast('Đã đánh dấu xử lý');
      loadReports(reportStatus);
    } catch (e) { toast(e.message, 'error'); }
  }

  function replyTo(fromId) {
    setEditingId(null);
    setForm(f => ({ ...f, toId: fromId, isBroadcast: false }));
    setShowCompose(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startEdit(m) {
    setEditingId(m._id);
    setForm(f => ({ ...f, subject: m.subject || '', body: m.body }));
    setShowCompose(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeCompose() {
    setShowCompose(false);
    setEditingId(null);
    setForm({ toId: '', subject: '', body: '', isBroadcast: false, giftHammers: '', giftStreakDays: '' });
    setShowGift(false);
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

  async function deleteAllSent() {
    confirm(`Xóa TOÀN BỘ ${total} thư đã gửi? Không thể hoàn tác.`, async () => {
      try {
        await apiFetch('/admin/messages', { method: 'DELETE' });
        toast('Đã xóa toàn bộ thư đã gửi');
        setPage(1);
        loadMessages(1);
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  async function deleteAllReceived() {
    confirm(`Xóa TOÀN BỘ ${receivedTotal} thư đã nhận? Không thể hoàn tác.`, async () => {
      try {
        await apiFetch('/admin/messages/received', { method: 'DELETE' });
        toast('Đã xóa toàn bộ thư đã nhận');
        setReceivedPage(1);
        loadReceived(1);
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  async function loadOnline() {
    try {
      const d = await apiFetch('/admin/online-users');
      setOnlineStudents((d.users || []).filter(u => u.role === 'student'));
    } catch { /* ignore */ }
  }

  function send(e) {
    e.preventDefault();
    // No confirmation needed for editing an existing message or for a
    // personal message — broadcasting to every student is the one
    // irreversible, wide-blast-radius action here (unlike delete, which
    // already goes through useConfirm()), so it gets its own gate.
    if (!editingId && form.isBroadcast) {
      confirm(`Gửi thông báo này đến TẤT CẢ học sinh? Không thể thu hồi sau khi đã gửi.`, doSend);
    } else {
      doSend();
    }
  }

  async function doSend() {
    setSending(true);
    try {
      if (editingId) {
        await apiFetch(`/admin/messages/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ subject: form.subject, body: form.body })
        });
        toast('Đã lưu thay đổi');
      } else {
        await apiFetch('/admin/messages', {
          method: 'POST',
          body: JSON.stringify({
            toId:           form.isBroadcast ? undefined : form.toId,
            subject:        form.subject,
            body:           form.body,
            isBroadcast:    form.isBroadcast,
            giftHammers:    +form.giftHammers || 0,
            giftStreakDays: +form.giftStreakDays || 0,
          })
        });
        const giftMsg = (+form.giftHammers || +form.giftStreakDays) ? ' kèm quà' : '';
        toast((form.isBroadcast ? 'Đã gửi thông báo đến tất cả học sinh' : 'Đã gửi tin nhắn') + giftMsg);
      }
      closeCompose();
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

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Hộp thư</h2>
        <button className="btn btn-primary" onClick={() => (showCompose ? closeCompose() : setShowCompose(true))}>
          {showCompose ? '✕ Đóng' : '✉️ Soạn thư'}
        </button>
      </div>

      {/* ── Compose panel ── */}
      {showCompose && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>{editingId ? '✏️ Sửa tin nhắn' : 'Soạn tin nhắn mới'}</h3>
          <form onSubmit={send} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Recipient/broadcast/gift are fixed at send-time — only
                subject/body can be corrected afterward (see the PUT route's
                comment for why: a gift may already be claimed, and
                re-targeting a sent message doesn't make sense). */}
            {!editingId && (<>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={form.isBroadcast} onChange={set('isBroadcast')} />
              <span>📢 Gửi đến <strong>tất cả học sinh</strong> (thông báo chung)</span>
            </label>

            {!form.isBroadcast && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Người nhận</label>
                <StudentPicker
                  students={students}
                  value={form.toId}
                  onChange={toId => setForm(f => ({ ...f, toId }))}
                />
              </div>
            )}
            </>)}

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

            {!editingId && (<>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={showGift} onChange={e => setShowGift(e.target.checked)} />
              <span>🎁 Gửi kèm quà (búa Daniel / lửa streak) — dùng để đền bù học sinh gặp lỗi</span>
            </label>

            {showGift && (
              <div style={{ display: 'flex', gap: 14, padding: 14, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.35)', borderRadius: 10 }}>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <label className="form-label">🔨 Số búa Daniel</label>
                  <input type="number" min="0" className="form-input" value={form.giftHammers} onChange={set('giftHammers')} placeholder="0" />
                </div>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <label className="form-label">🔥 Số ngày lửa (streak)</label>
                  <input type="number" min="0" className="form-input" value={form.giftStreakDays} onChange={set('giftStreakDays')} placeholder="0" />
                </div>
              </div>
            )}
            </>)}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={closeCompose}>Huỷ</button>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? (editingId ? 'Đang lưu...' : 'Đang gửi...') : (editingId ? '💾 Lưu thay đổi' : '📤 Gửi')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Online users quick panel ── */}
      <OnlinePanel onlineStudents={onlineStudents} onRefresh={loadOnline} />

      {/* ── Sent / Received tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 20, marginBottom: 12 }}>
        <button className={`btn btn-sm ${box === 'sent' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setBox('sent')}>
          📤 Đã gửi ({total})
        </button>
        <button className={`btn btn-sm ${box === 'received' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setBox('received')}>
          📥 Đã nhận ({receivedTotal})
        </button>
        <button className={`btn btn-sm ${box === 'reports' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setBox('reports')}>
          🚩 Báo cáo{reportStatus === 'open' ? ` (${reportsTotal})` : ''}
          {reportStatus === 'open' && reportsTotal > reports.length && (
            <span title={`Chỉ tải ${reports.length}/${reportsTotal} báo cáo mới nhất`} style={{ marginLeft: 4 }}>⚠️</span>
          )}
        </button>
      </div>

      {box === 'sent' ? (
        <>
          {isAdmin && total > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button className="btn btn-danger btn-sm" onClick={deleteAllSent}>🗑 Xóa toàn bộ</button>
            </div>
          )}
          {/* ── Sent messages table ── */}
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>NGƯỜI NHẬN</th><th>TIÊU ĐỀ</th><th>NỘI DUNG</th><th>TRẠNG THÁI</th><th>THỜI GIAN</th><th></th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0
                  ? <tr><td colSpan={6} className="table-empty">Chưa có tin nhắn nào</td></tr>
                  : messages.map(m => (
                    <tr key={m._id}>
                      <td>
                        {m.isBroadcast
                          ? <span className="badge badge-blue">📢 Tất cả học sinh</span>
                          : <strong>{m.toId?.username || '–'}</strong>}
                      </td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.subject || <span style={{ color: 'var(--text3)' }}>(Không có tiêu đề)</span>}
                        {(m.giftHammers > 0 || m.giftStreakDays > 0) && (
                          <div style={{ marginTop: 4 }}>
                            <span className="badge" style={{ background: 'rgba(245,158,11,.15)', color: '#b45309', fontSize: 11 }}>
                              🎁 {m.giftHammers > 0 ? `${m.giftHammers} búa ` : ''}{m.giftStreakDays > 0 ? `${m.giftStreakDays} lửa` : ''}
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--text2)' }}>
                        {m.body}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {m.isBroadcast
                          ? <span style={{ color: (m.readBy?.length || 0) > 0 ? 'var(--green)' : 'var(--text3)' }}>
                              👁 {m.readBy?.length || 0} đã đọc
                            </span>
                          : m.isRead
                            ? <span style={{ color: 'var(--green)' }}>✓ Đã đọc</span>
                            : <span style={{ color: 'var(--text3)' }}>○ Chưa đọc</span>}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(m.createdAt)}</td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => startEdit(m)} title="Sửa">✏️</button>
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
      ) : box === 'received' ? (
        <>
          {isAdmin && receivedTotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button className="btn btn-danger btn-sm" onClick={deleteAllReceived}>🗑 Xóa toàn bộ</button>
            </div>
          )}
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
      ) : (
        <>
          {/* ── Reports (peer-chat abuse reports from students) ── */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className={`btn btn-sm ${reportStatus === 'open' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => switchReportStatus('open')}>Chưa xử lý</button>
            <button className={`btn btn-sm ${reportStatus === 'resolved' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => switchReportStatus('resolved')}>Đã xử lý</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>NGƯỜI BÁO CÁO</th><th>BỊ BÁO CÁO</th><th>LÝ DO</th><th>TIN NHẮN LIÊN QUAN</th><th>THỜI GIAN</th><th></th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0
                  ? <tr><td colSpan={6} className="table-empty">Không có báo cáo nào</td></tr>
                  : reports.map(r => (
                    <tr key={r._id}>
                      <td><strong>{r.reporterName}</strong></td>
                      <td><strong>{r.reportedName}</strong></td>
                      <td style={{ maxWidth: 260, fontSize: 13, color: 'var(--text2)' }}>{r.reason}</td>
                      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text3)' }}>
                        {r.messageId?.body || <span>—</span>}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(r.createdAt)}</td>
                      <td>
                        {reportStatus === 'open' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => resolveReport(r._id)}>✓ Đã xử lý</button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

function OnlinePanel({ onlineStudents, onRefresh }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
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
