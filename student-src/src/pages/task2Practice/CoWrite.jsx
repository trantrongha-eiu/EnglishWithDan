import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { siteToast } from '../../utils/shell';
import { isLoggedIn, LESSON_SECTIONS, wc } from '../../utils/task2Practice';
import { BusyButton, QuitDialog, TgShell } from './Parts';

// "Mời bạn viết cùng" — a live co-writing group on the writer. Each member
// still writes their OWN essay; the group sees everyone's text live (poll
// every POLL_MS). Backend: services/task2CoWriteService.js; invites from
// classmates pop up via js/shared/cowrite-invites.js.

const POLL_MS = 2500;
const PUSH_DEBOUNCE_MS = 600;

function every(fn, ms) {
  if (window.ActivityGate) return window.ActivityGate.poll(fn, ms);
  const id = setInterval(fn, ms);
  return { stop: () => clearInterval(id) };
}
function Avatar({ m }) {
  return m.avatar ? <img className="t2cw-av" src={m.avatar} alt="" /> : <span className="t2cw-av">{(m.name || '?').trim().charAt(0).toUpperCase()}</span>;
}
const words = (o) => LESSON_SECTIONS.reduce((a, x) => a + wc((o.sections || {})[x.key]), 0);

function InviteDialog({ t, onClose, onSent }) {
  const [online, setOnline] = useState(null); // null loading · 'error' · []
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState(() => new Set());
  const search = useRef(null);
  useEffect(() => {
    let alive = true;
    apiFetch(`/task2/cowrite/online/${t._id}`)
      .then((d) => { if (alive) { setOnline(d.students || []); setTimeout(() => search.current?.focus(), 0); } })
      .catch(() => { if (alive) setOnline('error'); });
    return () => { alive = false; };
  }, [t._id]);
  function toggle(id, on) { const s = new Set(picked); if (on) s.add(id); else s.delete(id); setPicked(s); }
  async function send() {
    if (!picked.size) return;
    try {
      const d = await apiFetch('/task2/cowrite/invite', { method: 'POST', body: JSON.stringify({ topicId: t._id, userIds: [...picked] }) });
      const n = (d.invited || []).length;
      const full = (d.skipped || []).filter((x) => x.reason === 'full').length;
      if (n) siteToast(`Đã gửi lời mời cho ${n} bạn — chờ các bạn nhận lời nhé`, 'success', 4000);
      if (full) siteToast(`Nhóm tối đa ${d.room?.maxMembers || 8} người — ${full} bạn chưa được mời`, 'warn', 5000);
      if (!n && !full) siteToast('Các bạn này đã được mời rồi', 'info');
      onSent(d.room || null);
      onClose();
    } catch (e) {
      siteToast(e.message || 'Chưa gửi được lời mời', 'error');
    }
  }
  const term = q.trim().toLowerCase();
  let list;
  if (online === null) list = <div className="t2cw-empty"><i className="fas fa-spinner fa-spin" /> Đang tải...</div>;
  else if (online === 'error') list = <div className="t2cw-empty">Không tải được danh sách — thử lại nhé.</div>;
  else if (!online.length) list = <div className="t2cw-empty">😴 Chưa có bạn nào online lúc này.</div>;
  else {
    const rows = online.filter((u) => !term || (window.SearchMatch ? window.SearchMatch.matches(u.name, term) : u.name.toLowerCase().includes(term)));
    list = !rows.length ? <div className="t2cw-empty">Không tìm thấy bạn nào.</div> : rows.map((u) => {
      const id = String(u._id);
      const done = u.inRoom === 'joined';
      const waiting = u.inRoom === 'invited';
      return (
        <label key={id} className={`t2cw-row${done ? ' is-done' : ''}`}>
          <input type="checkbox" disabled={done} checked={done || picked.has(id)} onChange={(e) => toggle(id, e.target.checked)} />
          <Avatar m={u} />
          <span className="t2cw-row-name">{u.name}{u.classmate && <span className="t2cw-badge">Cùng lớp</span>}</span>
          <span className="t2cw-row-state">{done ? 'Đã trong nhóm' : waiting ? 'Đã mời' : <><span className="t2cw-dot" /> Online</>}</span>
        </label>
      );
    });
  }
  return (
    <TgShell id="t2cw-overlay" onClose={onClose} focusClose={false}>
      {() => (
        <div className="t2-tg-modal t2cw-modal" role="dialog" aria-modal="true" aria-labelledby="t2cw-title">
          <div className="t2cw-mhead">
            <div style={{ minWidth: 0 }}>
              <h3 id="t2cw-title">👥 Mời bạn viết cùng</h3>
              <div className="t2cw-msub">{t.topicEmoji || '📝'} {t.topicName} — các bạn đang online</div>
            </div>
            <button className="t2-hist-close" onClick={onClose} aria-label="Đóng"><i className="fas fa-times" /></button>
          </div>
          <div className="t2cw-mbody">
            <input type="search" ref={search} className="t2cw-search" id="t2cw-search" placeholder="Tìm tên bạn..." value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
            <div className="t2cw-list" id="t2cw-list">{list}</div>
          </div>
          <div className="t2cw-mfoot">
            <span className="t2cw-mnote">Mỗi bạn vẫn viết bài của riêng mình — cả nhóm thấy bài nhau theo thời gian thực.</span>
            <BusyButton className="t2-primary" id="t2cw-send" onClick={send} disabled={!picked.size}><i className="fas fa-paper-plane" /> Gửi lời mời{picked.size ? ` (${picked.size})` : ''}</BusyButton>
          </div>
        </div>
      )}
    </TgShell>
  );
}

export function CoWrite({ t, sections, ready, phase }) {
  const [room, setRoom] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [invite, setInvite] = useState(false);
  const [leave, setLeave] = useState(false);
  const R = useRef({ room: null, rev: 0, pushedFor: null, ticking: false, timer: 0 });
  const secRef = useRef(sections);
  const readyRef = useRef(ready);
  useEffect(() => { secRef.current = sections; readyRef.current = ready; });
  const viewRef = useRef(null);
  const topicId = t._id;

  const apply = (r) => { R.current.room = r; R.current.rev = r ? r.rev : 0; setRoom(r); };
  function pushNow() {
    if (!R.current.room || !readyRef.current) return;
    apiFetch(`/task2/cowrite/topic/${topicId}/text`, { method: 'PUT', body: JSON.stringify({ sections: { ...secRef.current } }) })
      .then((d) => { if (d && d.inRoom === false) apply(null); })
      .catch(() => {});
  }
  async function tick() {
    if (R.current.ticking) return;
    R.current.ticking = true;
    try {
      const d = await apiFetch(`/task2/cowrite/topic/${topicId}${R.current.room ? `?rev=${R.current.rev}` : ''}`);
      if (d.unchanged) {
        const r = R.current.room;
        if (r) apply({ ...r, members: r.members.map((m) => { const p = (d.presence || []).find((x) => String(x.userId) === String(m.userId)); return p ? { ...m, online: p.online, typing: p.typing } : m; }) });
        return;
      }
      apply(d.room || null);
      // Just joined (or reopened the writer while in a group): share my text now
      if (d.room && R.current.pushedFor !== d.room.roomId) { R.current.pushedFor = d.room.roomId; pushNow(); }
    } catch { /* retry next tick */ } finally { R.current.ticking = false; }
  }
  // Live poll while the writer is on screen; my last edit goes out on close
  useEffect(() => {
    if (!isLoggedIn()) return undefined;
    const r = R.current;
    tick();
    const poll = every(tick, POLL_MS);
    // cowrite-invites.js: accepting an invite to this lesson joins in place
    window.T2CoWriteIsOpen = (id) => String(id) === String(topicId);
    window.T2CoWriteJoined = (id) => {
      if (String(id) !== String(topicId)) return false;
      R.current.rev = 0; R.current.pushedFor = null; apply(null);
      tick();
      siteToast('Đã vào nhóm viết cùng 👥', 'success');
      return true;
    };
    window.CowriteInvites?.refresh?.();
    return () => {
      poll.stop();
      if (r.timer) { clearTimeout(r.timer); r.timer = 0; pushNow(); }
      delete window.T2CoWriteIsOpen;
      delete window.T2CoWriteJoined;
      setTimeout(() => window.CowriteInvites?.refresh?.(), 0);
    };
  }, [topicId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Typing → my text to the group (debounced)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!R.current.room) return;
    clearTimeout(R.current.timer);
    R.current.timer = setTimeout(() => { R.current.timer = 0; pushNow(); }, PUSH_DEBOUNCE_MS);
  }, [sections]); // eslint-disable-line react-hooks/exhaustive-deps

  async function doLeave() {
    try {
      await apiFetch(`/task2/cowrite/topic/${topicId}/leave`, { method: 'POST' });
      R.current.pushedFor = null;
      apply(null);
    } catch { siteToast('Chưa rời nhóm được — thử lại nhé', 'error'); }
  }

  const others = room ? (room.members || []).filter((m) => !m.isMe && m.status === 'joined') : [];
  const pending = room ? room.members.filter((m) => m.status === 'invited') : [];
  const people = room ? room.members.filter((m) => m.status === 'joined' || m.status === 'invited') : [];
  const m = others.find((x) => String(x.userId) === String(viewing)) || others[0];
  const s = m ? (m.sections || {}) : {};
  return (
    <div className="t2cw" id="t2c-cw">
      <div className="t2cw-bar">
        <button type="button" className="t2cw-invite" onClick={() => setInvite(true)}><i className="fas fa-user-plus" /> Mời bạn viết cùng</button>
        {room ? (
          <>
            <div className="t2cw-people">{people.map((p) => (
              <span key={String(p.userId)} className={`t2cw-person${p.status === 'invited' ? ' is-pending' : ''}${p.online ? ' is-online' : ''}${p.typing ? ' is-typing' : ''}`} data-cw-uid={p.userId}
                title={`${p.name}${p.status === 'invited' ? ' — đang chờ trả lời' : p.isMe ? ' (bạn)' : ''}`}>
                <Avatar m={p} /><span className="t2cw-pname">{p.isMe ? 'Bạn' : p.name}</span>{p.status === 'invited' ? <i className="fas fa-hourglass-half" /> : <span className="t2cw-dot" />}
              </span>
            ))}</div>
            <button type="button" className="t2-link t2cw-leave" onClick={() => setLeave(true)}>Rời nhóm</button>
          </>
        ) : <span className="t2cw-hint">Mời bạn đang online vào nhóm — cả nhóm thấy bài của nhau theo thời gian thực để kiểm tra chéo.</span>}
      </div>
      {room && !others.length && <p className="t2cw-wait">{pending.length ? '⏳ Đang chờ bạn nhận lời mời… ' : ''}Khi có bạn vào nhóm, bài của bạn ấy sẽ hiện ở đây và cập nhật ngay khi bạn ấy gõ.</p>}
      {room && m && (
        <div className={`t2cw-live${collapsed ? ' is-collapsed' : ''}`}>
          <div className="t2cw-live-head">
            <span className="t2cw-live-title"><span className="t2cw-live-pulse" /> Bài của bạn cùng nhóm</span>
            <div className="t2cw-tabs" role="tablist">{others.map((o) => (
              <button key={String(o.userId)} type="button" role="tab" aria-selected={o === m ? 'true' : 'false'} className={`t2cw-tab${o === m ? ' active' : ''}${o.online ? ' is-online' : ''}${o.typing ? ' is-typing' : ''}`} data-cw-uid={o.userId}
                onClick={() => setViewing(String(o.userId))}>
                <span className="t2cw-dot" />{o.name}<span className="t2cw-tab-wc">{words(o)} từ</span>
              </button>
            ))}</div>
            <button type="button" className="t2cw-collapse" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Mở' : 'Thu gọn'}><i className={`fas fa-chevron-${collapsed ? 'down' : 'up'}`} /></button>
          </div>
          <div className="t2cw-view" id="t2cw-view" ref={viewRef}>
            <div className={`t2cw-meta${m.typing ? ' is-typing' : ''}`} data-cw-uid={m.userId}>{m.name} · {words(m)} từ <span className="t2cw-typing-note">đang gõ…</span></div>
            {LESSON_SECTIONS.map((x) => (
              <div key={x.key} className={`t2cw-sec${x.phase === phase ? '' : ' is-other'}`}>
                <div className="t2cw-sec-head"><b>{x.label}</b> <span>{wc(s[x.key])} từ</span></div>
                {(s[x.key] || '').trim() ? <div className="t2cw-text">{s[x.key]}</div> : <div className="t2cw-text is-empty">(chưa viết)</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {invite && <InviteDialog t={t} onClose={() => setInvite(false)} onSent={(r) => { if (r) { apply(r); if (R.current.pushedFor !== r.roomId) { R.current.pushedFor = r.roomId; pushNow(); } } }} />}
      {leave && (
        <QuitDialog opts={{ mascot: '👥', title: 'Rời nhóm viết cùng?', sub: 'Bài của bạn vẫn được lưu bình thường — chỉ là cả nhóm sẽ không thấy bài của nhau nữa.', confirmText: 'Rời nhóm', continueText: 'Ở lại' }}
          onStay={() => setLeave(false)} onLeave={() => { setLeave(false); doLeave(); }} />
      )}
    </div>
  );
}
