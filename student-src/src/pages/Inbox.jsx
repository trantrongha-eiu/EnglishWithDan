import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { bindDict, siteToast, usePets } from '../utils/shell';

// ✉️ Hộp thư — /app/inbox?msg=<id> (js/inbox.js). nav.js's "Bạn có tin nhắn
// mới" popup links here with ?msg: opening the message marks it read, which is
// what stops that popup.

const PAGE_SIZE = 50;
const BROADCAST = '📢 Thông báo chung';

function timeAgo(dateStr) {
  const m = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  const dt = new Date(dateStr);
  return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
}

function formatFull(dateStr) {
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const senderOf = (m) => (m.isBroadcast ? BROADCAST : m.fromName || 'Giáo viên');
const subjectOf = (m) => m.subject || '(Không có tiêu đề)';
// Admin búa / lửa, or a vật phẩm / linh thú another player sent
const hasAnyGift = (m) => !!(m.giftHammers || m.giftStreakDays || m.giftItem || m.giftPet);

// On a phone the message opens below the whole list: bring it (or, going back,
// its row) into view once React has drawn it.
function scrollOnPhone(elementId, messageId) {
  if (!window.matchMedia('(max-width: 680px)').matches) return;
  requestAnimationFrame(() => {
    const el = elementId ? document.getElementById(elementId) : document.querySelector(`.msg-item[data-id="${messageId}"]`);
    el?.scrollIntoView({ block: 'start' });
  });
}

function Placeholder() {
  return (
    <div className="detail-placeholder">
      <i className="fas fa-envelope-open-text" />
      <p>Chọn một tin nhắn để đọc</p>
    </div>
  );
}

function GiftBox({ msg, pets, onClaim }) {
  const [claiming, setClaiming] = useState(false);
  if (!hasAnyGift(msg)) return null;
  const { giftItem: it, giftPet: pet } = msg;
  const petArt = pet && pets?.svg ? pets.svg(pet.id) : '';
  const parts = (
    <div className="gift-items">
      {msg.giftHammers > 0 && <span className="gift-item"><img src="/img/buaDaniel.jpg" alt="Búa Daniel" /> {msg.giftHammers} búa Daniel</span>}
      {msg.giftStreakDays > 0 && <span className="gift-item">🔥 {msg.giftStreakDays} lửa (chuỗi + ví lửa)</span>}
      {it && (
        <span className="gift-item">
          {it.image ? <img src={it.image} alt="" /> : (it.emoji || '🎁')} {it.qty > 1 ? `${it.qty} × ` : ''}{it.name}
        </span>
      )}
      {pet && (
        <span className="gift-item">
          {petArt ? <span className="gift-pet-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: petArt }} /> : '🐾'} Linh thú {pet.name}
        </span>
      )}
    </div>
  );
  if (msg.giftClaimed) {
    return (
      <div className="gift-box gift-box-claimed">
        {parts}
        <span className="gift-claimed-label"><i className="fas fa-check-circle" /> Đã nhận</span>
      </div>
    );
  }
  const claim = () => {
    setClaiming(true);
    onClaim(msg._id).finally(() => setClaiming(false));
  };
  return (
    <div className="gift-box">
      {parts}
      <button className="btn btn-primary" id="claimGiftBtn" disabled={claiming} onClick={claim}>
        {claiming ? <><i className="fas fa-spinner fa-spin" /> Đang nhận...</> : <><i className="fas fa-gift" /> Nhận quà</>}
      </button>
    </div>
  );
}

function ReplyBox({ msg }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const box = useRef(null);

  async function send() {
    const body = text.trim();
    if (!body) { box.current?.focus(); return; }
    setSending(true);
    try {
      const d = await apiFetch(`/user/messages/${msg._id}/reply`, { method: 'POST', body: JSON.stringify({ body }) });
      setText('');
      // A reply to another student's message goes to the Chat bạn bè
      siteToast(d?.peer ? 'Đã gửi vào Chat bạn bè' : 'Đã gửi phản hồi', 'success');
    } catch (e) {
      siteToast(`Lỗi: ${e.message}`, 'error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="reply-box">
      <textarea id="replyText" ref={box} placeholder={`Trả lời ${senderOf(msg)}...`} rows={3} maxLength={4000}
        value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn btn-primary" id="replySendBtn" disabled={sending} onClick={send}>
        {sending ? <><i className="fas fa-spinner fa-spin" /> Đang gửi...</> : <><i className="fas fa-reply" /> Gửi phản hồi</>}
      </button>
    </div>
  );
}

export default function Inbox() {
  const pets = usePets();
  const [params] = useSearchParams();
  const wanted = params.get('msg');

  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false); // phones show one panel at a time
  const [loadingMore, setLoadingMore] = useState(false);

  // Latest values for the async steps (paging until ?msg= is found, a slow "read")
  const live = useRef({ messages: [], total: 0, page: 1, deleted: 0, selected: null, loadingMore: false });

  const putMessages = useCallback((next) => {
    live.current.messages = next;
    setMessages(next);
  }, []);
  const patchMessage = useCallback((id, patch) => {
    putMessages(live.current.messages.map((m) => (m._id === id ? { ...m, ...patch } : m)));
  }, [putMessages]);

  const loadMore = useCallback(async () => {
    const l = live.current;
    if (l.loadingMore || l.messages.length >= l.total) return;
    l.loadingMore = true;
    setLoadingMore(true);
    try {
      // Pages move while the list is open. A deleted message pulls later ones
      // into pages already read, so those are read again; a new message pushes
      // rows onto the next page, so rows already shown are skipped.
      const nextPage = l.page + 1;
      const firstPage = l.deleted ? Math.max(1, l.page - Math.floor((l.deleted - 1) / PAGE_SIZE)) : nextPage;
      const pages = Array.from({ length: nextPage - firstPage + 1 }, (_, i) => firstPage + i);
      const replies = await Promise.all(pages.map((p) => apiFetch(`/user/messages?page=${p}&limit=${PAGE_SIZE}`)));
      const last = replies[replies.length - 1];
      const seen = new Set(l.messages.map((m) => m._id));
      const fresh = [];
      for (const m of replies.flatMap((r) => r.messages || [])) {
        if (!seen.has(m._id)) { seen.add(m._id); fresh.push(m); }
      }
      putMessages(l.messages.concat(fresh));
      l.total = last.total ?? l.total;
      // Nothing left to fetch, even if the count still says otherwise
      if (!fresh.length && (last.messages || []).length < PAGE_SIZE) l.total = l.messages.length;
      setTotal(l.total);
      l.page = nextPage;
      l.deleted = 0;
    } catch (e) {
      siteToast(`Không tải thêm được: ${e.message}`, 'error');
    } finally {
      l.loadingMore = false;
      setLoadingMore(false);
    }
  }, [putMessages]);

  const select = useCallback(async (id) => {
    const l = live.current;
    l.selected = id;
    setSelectedId(id);
    const msg = l.messages.find((m) => m._id === id);
    if (!msg) return;
    // Shown as read only once the server agreed: a failed request used to look
    // read here while the "Bạn có tin nhắn mới" popup kept coming back.
    if (!msg.isRead) {
      try {
        await apiFetch(`/user/messages/${id}/read`, { method: 'PATCH' });
        patchMessage(id, { isRead: true });
        window.refreshInboxBadge?.();
      } catch { /* retried on the next open */ }
    }
    if (l.selected !== id) return; // another message was opened meanwhile
    setDetailId(id);
    setDetailOpen(true);
    scrollOnPhone('msgDetail');
  }, [patchMessage]);

  function backToList() {
    setDetailOpen(false);
    scrollOnPhone(null, selectedId);
  }

  useEffect(() => {
    let alive = true;
    apiFetch(`/user/messages?page=1&limit=${PAGE_SIZE}`).then((data) => {
      if (!alive) return;
      const list = data.messages || [];
      live.current.total = data.total || list.length;
      live.current.page = 1;
      putMessages(list);
      setTotal(live.current.total);
      setStatus('ready');
    }).catch((e) => {
      if (!alive) return;
      setError(e.message);
      setStatus('error');
    });
    return () => { alive = false; };
  }, [putMessages]);

  // ?msg=<id>: an older must-read message can sit past the first page, so keep
  // paging (a few pages at most) until it's found, else the popup never clears.
  useEffect(() => {
    if (status !== 'ready' || !wanted) return undefined;
    let alive = true;
    (async () => {
      const l = live.current;
      const found = () => l.messages.some((m) => m._id === wanted);
      for (let i = 0; alive && i < 5 && !found() && l.messages.length < l.total; i++) await loadMore();
      if (alive && found()) select(wanted);
    })();
    return () => { alive = false; };
  }, [status, wanted, loadMore, select]);

  // Double-click a word in the open message to look it up
  useEffect(() => {
    if (detailId) bindDict('msgDetail', 'inbox-message');
  }, [detailId]);

  async function claimGift(id) {
    const markClaimed = () => patchMessage(id, { giftClaimed: true });
    try {
      const d = await apiFetch(`/user/messages/${id}/claim`, { method: 'POST' });
      markClaimed();
      const got = [];
      if (d.giftHammers) got.push(`${d.giftHammers} búa`);
      if (d.giftStreakDays) got.push(`${d.giftStreakDays} lửa (đã cộng vào chuỗi và ví lửa)`);
      if (d.item) got.push(`${d.item.qty > 1 ? `${d.item.qty} × ` : ''}${d.item.emoji} ${d.item.name} (đã vào Kho đồ)`);
      if (d.pet) got.push(`linh thú 🐾 ${d.pet.name} (đã vào Kho đồ)`);
      if (d.pet) window.Pets?.setActive?.(d.activePet || '');
      siteToast(`🎁 Đã nhận quà: ${got.join(', ')}`, 'success');
    } catch (e) {
      // 409 = already claimed (another tab / device): show it as received
      if (e?.status === 409) {
        markClaimed();
        siteToast('Bạn đã nhận quà này rồi.', 'info');
        return;
      }
      siteToast(`Lỗi: ${e.message}`, 'error');
    }
  }

  function deleteMsg(msg) {
    const unclaimed = hasAnyGift(msg) && !msg.giftClaimed;
    const text = unclaimed ? 'Thư này còn quà chưa nhận — xóa thư là mất quà luôn. Vẫn xóa?' : 'Xóa tin nhắn này?';
    window.showConfirm(text, async () => {
      try {
        await apiFetch(`/user/messages/${msg._id}`, { method: 'DELETE' });
        const l = live.current;
        putMessages(l.messages.filter((m) => m._id !== msg._id));
        l.total = Math.max(0, l.total - 1);
        l.deleted += 1;
        setTotal(l.total);
        l.selected = null;
        setSelectedId(null);
        setDetailId(null);
        setDetailOpen(false);
        window.refreshInboxBadge?.();
      } catch (e) {
        siteToast(`Lỗi: ${e.message}`, 'error');
      }
    });
  }

  const unread = messages.filter((m) => !m.isRead).length;
  const msg = messages.find((m) => m._id === detailId);

  return (
    <div className="inbox-layout">
      <div className="msg-list-panel">
        <div className="panel-head">
          <h3><i className="fas fa-inbox" /> Hộp thư đến</h3>
          <span id="unreadBadge" className="badge-count" style={unread > 0 ? undefined : { display: 'none' }}>{unread > 0 ? unread : ''}</span>
        </div>
        <div className="msg-list" id="msgList">
          {status === 'loading' && <div className="empty-state"><i className="fas fa-envelope-open" /><p>Đang tải...</p></div>}
          {status === 'error' && <div className="empty-state"><i className="fas fa-exclamation-circle" /><p>{error}</p></div>}
          {status === 'ready' && !messages.length && <div className="empty-state"><i className="fas fa-envelope-open" /><p>Hộp thư trống</p></div>}
          {messages.map((m) => (
            <div key={m._id} className={`msg-item${m.isRead ? '' : ' unread'}${m._id === selectedId ? ' selected' : ''}`} data-id={m._id} onClick={() => select(m._id)}>
              <div className="msg-sender">
                {!m.isRead && <span className="dot-unread" />}
                {senderOf(m)}
                <span className="msg-time" style={{ marginLeft: 'auto' }}>{timeAgo(m.createdAt)}</span>
              </div>
              <div className="msg-subject">{subjectOf(m)}{hasAnyGift(m) && !m.giftClaimed && <> <span className="gift-tag">🎁 Có quà</span></>}</div>
              <div className="msg-preview">{(m.body || '').slice(0, 80)}</div>
            </div>
          ))}
          {messages.length > 0 && messages.length < total && (
            <button className="btn btn-ghost" id="loadMoreBtn" disabled={loadingMore} onClick={loadMore} style={{ width: '100%', marginTop: 8 }}>
              {loadingMore
                ? <><i className="fas fa-spinner fa-spin" /> Đang tải...</>
                : <><i className="fas fa-chevron-down" /> Xem thêm ({messages.length}/{total})</>}
            </button>
          )}
        </div>
      </div>

      <div className={`msg-detail${detailOpen ? ' active' : ''}`} id="msgDetail">
        {!msg && <Placeholder />}
        {msg && (
          <>
            <button className="mobile-back-btn" onClick={backToList}><i className="fas fa-arrow-left" /> Danh sách tin nhắn</button>
            <div className="detail-head">
              <h2 className="detail-subject">{subjectOf(msg)}</h2>
              <div className="detail-meta">
                <span><i className="fas fa-user" /> Từ: <strong>{senderOf(msg)}</strong></span>
                <span><i className="fas fa-clock" /> {formatFull(msg.createdAt)}</span>
                {msg.isBroadcast && <span className="broadcast-badge">{BROADCAST}</span>}
              </div>
            </div>
            <div className="detail-body">{msg.body}</div>
            <GiftBox key={`gift-${msg._id}`} msg={msg} pets={pets} onClaim={claimGift} />
            <ReplyBox key={`reply-${msg._id}`} msg={msg} />
            <div className="detail-actions">
              <button className="btn btn-danger" onClick={() => deleteMsg(msg)}><i className="fas fa-trash" /> Xóa</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
