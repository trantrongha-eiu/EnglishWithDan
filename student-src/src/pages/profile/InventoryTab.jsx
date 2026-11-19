import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { siteConfirm, siteToast, usePets } from '../../utils/shell';
import { shopApi } from '../../utils/shop';

// Hồ sơ → Kho đồ (js/inventory.js): everything bought in the Cửa hàng lửa, with
// Dùng / Bán / 🎁 Tặng, and the linh thú with Dắt đi dạo / Cất về.

const USE_MSG = {
  hopeHammer: 'Từ giờ đến hết hôm nay mọi 🔥 kiếm được đều ×2. Nhưng nếu đến nửa đêm chưa kiếm thêm đủ 3 🔥 thì chuỗi bị trừ 10 🔥. (Mỗi ngày chỉ kiếm tối đa 10 🔥 — nên đập búa trước khi học.) Chơi không?',
  cloak: 'Giấu số 🔥 của bạn trên BXH trong 24 giờ.',
  crown: 'Đội vương miện, tên bạn phát sáng trên BXH trong 7 ngày.',
  towel: 'Lau sạch bánh kem trên ảnh đại diện của bạn ngay bây giờ.',
};
const html = (__html) => ({ __html });
const initialOf = (name) => ((name || '?').trim()[0] || '?').toUpperCase();

function PetArt({ pets, id, fallback = '', className = 'inv-pet-art' }) {
  const art = pets ? pets.svg(id) : fallback;
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={html(art)} />;
}

function ItemAction({ item: i, effects, onUse }) {
  if (i.key === 'towel') {
    const caked = !!effects?.cakedUntil;
    return <button type="button" className="btn btn-primary btn-sm" data-inv-use="towel" disabled={!caked} onClick={() => onUse(i)}>{caked ? '🧽 Lau kem' : 'Ảnh đang sạch ✨'}</button>;
  }
  if (i.usage === 'manual') {
    const hopeOn = i.key === 'hopeHammer' && !!effects?.hope;
    return <button type="button" className="btn btn-primary btn-sm" data-inv-use={i.key} disabled={hopeOn} onClick={() => onUse(i)}>{hopeOn ? 'Đang dùng hôm nay' : 'Dùng'}</button>;
  }
  if (i.usage === 'target') {
    return <a className="btn btn-primary btn-sm" href="/app/#/leaderboard">{i.key === 'lens' ? '🔍 Soi ở BXH' : 'Ném ở BXH'}</a>;
  }
  return <span className="inv-passive">🛡️ Tự động bật khi lỡ 1 ngày</span>;
}

function ItemCard({ item: i, effects, act }) {
  return (
    <div className="inv-card">
      <span className="inv-emoji" aria-hidden="true">{i.emoji}</span>
      <div className="inv-info"><b>{i.name}</b><span className="inv-qty">×{i.owned}</span></div>
      <div className="inv-actions">
        <ItemAction item={i} effects={effects} onUse={act.useItem} />
        <button type="button" className="btn btn-ghost btn-sm" data-inv-gift-item={i.key} onClick={() => act.gift('item', i)}>🎁 Tặng</button>
        <button type="button" className="btn btn-ghost btn-sm" data-inv-sell-item={i.key} onClick={() => act.sellItem(i)}>Bán · 🔥 {i.sellPrice}</button>
      </div>
    </div>
  );
}

// Búa Daniel: bought, or earned from Paraphrase units ≥ 90% / an admin gift.
// Always shown: it restores a streak lost in the last 3 days.
function DanielCard({ hammer, items, act }) {
  const h = hammer || { count: 0, canUse: false };
  const hint = !h.count
    ? 'Mua ở Cửa hàng lửa, hoặc nhận búa khi hoàn thành 1 Unit Paraphrase đạt ≥ 90%.'
    : h.canUse ? `Khôi phục chuỗi ${h.previousStreak} 🔥 vừa mất!` : 'Dùng được trong 3 ngày sau khi lỡ mất chuỗi.';
  const giftEntry = items.find((i) => i.key === 'danielHammer');
  return (
    <div className={`inv-card inv-daniel${h.canUse ? ' is-ready' : ''}`}>
      <img className="inv-emoji inv-daniel-img" src="/img/buaDaniel.jpg" alt="" aria-hidden="true" />
      <div className="inv-info"><b>Búa Daniel</b><span className="inv-qty">×{h.count}</span></div>
      <div className="inv-actions">
        <button type="button" className="btn btn-primary btn-sm" data-inv-daniel disabled={!(h.canUse && h.count)} onClick={() => act.useDaniel(h)}>Dùng</button>
        {h.count > 0 && <button type="button" className="btn btn-ghost btn-sm" data-inv-gift-item="danielHammer" onClick={() => giftEntry && act.gift('item', giftEntry)}>🎁 Tặng</button>}
        <span className="inv-hint">{hint}</span>
      </div>
    </div>
  );
}

function PetCard({ pet: p, activePet, pets, act }) {
  const active = activePet === p.id;
  // "💤 Cho nghỉ hôm nay" hides it on this browser until midnight
  const resting = active && pets?.isResting?.();
  return (
    <div className={`inv-card inv-pet${active ? ' is-active' : ''}`}>
      <PetArt pets={pets} id={p.id} />
      <div className="inv-info">
        <b>{p.name}</b>
        {resting && <span className="inv-resting">💤 Đang nghỉ hôm nay</span>}
        {!resting && active && <span className="inv-walking">✓ Đang đi dạo</span>}
        {!resting && !active && p.tails > 0 && <span className="inv-qty">{p.tails} đuôi</span>}
      </div>
      {p.skill && (
        <div className="inv-skill">
          <b>{p.skill.icon} {p.skill.name}</b> {p.skill.text}
          {!active && <> <em>Chỉ dùng khi bé đi dạo.</em></>}
        </div>
      )}
      <div className="inv-actions">
        {resting && <button type="button" className="btn btn-primary btn-sm" data-inv-wake onClick={act.wake}>Gọi dậy</button>}
        {active
          ? <button type="button" className="btn btn-ghost btn-sm" data-inv-pet="" onClick={() => act.setPet('')}>Cất về</button>
          : <button type="button" className="btn btn-primary btn-sm" data-inv-pet={p.id} onClick={() => act.setPet(p.id)}>Dắt đi dạo</button>}
        <button type="button" className="btn btn-ghost btn-sm" data-inv-gift-pet={p.id} onClick={() => act.gift('pet', p)}>🎁 Tặng</button>
        <button type="button" className="btn btn-ghost btn-sm" data-inv-sell-pet={p.id} onClick={() => act.sellPet(p)}>Bán · 🔥 {p.sellPrice}</button>
      </div>
    </div>
  );
}

function Recipient({ user: u, picked, onPick }) {
  return (
    <button type="button" className={`inv-gift-user${picked ? ' is-picked' : ''}`} data-gift-to={u._id} role="option" aria-selected={picked ? 'true' : 'false'} onClick={() => onPick(u)}>
      {u.avatar ? <img className="inv-gift-av" src={u.avatar} alt="" /> : <span className="inv-gift-av inv-gift-av--init">{initialOf(u.name)}</span>}
      <span className="inv-gift-name">{u.name}{u.username && <small>@{u.username}</small>}</span>
      {u.teacher && <span className="inv-gift-chip">Giáo viên</span>}
    </button>
  );
}

// On <body>: the cards around this tab keep a CSS transform, which would trap a
// fixed overlay inside them.
function GiftDialog({ kind, entry, pets, onClose, onSend }) {
  const owned = kind === 'pet' ? 1 : entry.owned;
  const max = Math.min(99, owned);
  const [users, setUsers] = useState(null);
  const [picked, setPicked] = useState(null);
  const [text, setText] = useState('1');
  const search = useRef(null);
  const timer = useRef(null);
  const seq = useRef(0);

  const n = parseInt(text, 10);
  const qty = max > 1 ? Math.min(max, Math.max(1, Number.isNaN(n) ? 1 : n)) : 1;

  const find = useCallback((q) => {
    seq.current += 1;
    const mine = seq.current;
    shopApi('GET', `/shop/gift-recipients?q=${encodeURIComponent(q || '')}`).then((d) => {
      if (mine === seq.current) setUsers(d?.success && d.users ? d.users : []);
    });
  }, []);

  useEffect(() => {
    const trigger = document.activeElement;
    find('');
    search.current?.focus();
    return () => {
      clearTimeout(timer.current);
      seq.current += 1;
      trigger?.focus?.();
    };
  }, [find]);

  function send() {
    if (!picked) return;
    onClose();
    onSend(picked, qty);
  }

  const icon = kind === 'pet'
    ? <PetArt pets={pets} id={entry.id} fallback="🐾" className="inv-pet-art inv-gift-icon" />
    : entry.image
      ? <img className="inv-emoji inv-gift-icon" src={entry.image} alt="" aria-hidden="true" />
      : <span className="inv-emoji inv-gift-icon" aria-hidden="true">{entry.emoji}</span>;

  return createPortal(
    <div className="modal-overlay inv-gift-modal"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div className="modal-box modal-sm" role="dialog" aria-modal="true" aria-labelledby="inv-gift-title">
        <div className="modal-body inv-gift-body">
          <div className="inv-gift-head">{icon}<h3 id="inv-gift-title">Tặng {entry.name}</h3></div>
          <input ref={search} type="search" className="inv-gift-search" placeholder="Tìm theo tên hoặc username…" aria-label="Tìm người nhận" autoComplete="off"
            onChange={(e) => {
              const q = e.target.value;
              clearTimeout(timer.current);
              timer.current = setTimeout(() => find(q), 250);
            }} />
          <div className="inv-gift-list" role="listbox" aria-label="Người nhận">
            {users === null && <div className="inv-gift-empty">Đang tải…</div>}
            {users?.length === 0 && <div className="inv-gift-empty">Không tìm thấy ai — thử tên khác nhé.</div>}
            {users?.map((u) => <Recipient key={u._id} user={u} picked={String(picked?._id) === String(u._id)} onPick={setPicked} />)}
          </div>
          {max > 1 && (
            <div className="inv-gift-qty">
              <span>Số lượng</span>
              <div className="inv-gift-step" role="group" aria-label="Số lượng">
                <button type="button" data-step="-1" aria-label="Bớt 1" disabled={qty <= 1} onClick={() => setText(String(qty - 1))}>−</button>
                <input type="number" inputMode="numeric" min="1" max={max} value={text} aria-label="Số lượng"
                  onChange={(e) => setText(e.target.value)}
                  onBlur={() => setText(String(qty))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }} />
                <button type="button" data-step="1" aria-label="Thêm 1" disabled={qty >= max} onClick={() => setText(String(qty + 1))}>+</button>
              </div>
              <small>Bạn có {owned}</small>
            </div>
          )}
          <small className="inv-gift-note">{kind === 'pet'
            ? 'Linh thú rời kho của bạn và được gửi vào Hộp thư của người nhận — bạn ấy bấm "Nhận quà" là bé về kho.'
            : 'Vật phẩm rời Kho đồ của bạn và được gửi vào Hộp thư của người nhận — bạn ấy bấm "Nhận quà" là có.'}</small>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-ghost" data-cancel onClick={onClose}>Hủy</button>
          <button type="button" className="btn btn-primary" data-ok disabled={!picked} onClick={send}>
            {picked ? `🎁 Tặng ${qty > 1 ? `${qty} ` : ''}cho ${picked.name}` : '🎁 Chọn người nhận'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function InventoryTab({ active, canPlay }) {
  const pets = usePets();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [gifting, setGifting] = useState(null); // { kind, entry }
  const [, repaint] = useState(0);
  const busy = useRef(false);

  const load = useCallback(() => shopApi('GET', '/shop').then((d) => {
    if (d?.success) { setData(d); setFailed(false); } else setFailed(true);
  }), []);

  useEffect(() => { if (canPlay) load(); }, [canPlay, load]);

  // Wiped from the cake popup: the Khăn Lau card changes
  useEffect(() => {
    if (!canPlay) return undefined;
    const reload = () => load();
    document.addEventListener('ews:cake-wiped', reload);
    return () => document.removeEventListener('ews:cake-wiped', reload);
  }, [canPlay, load]);

  function after(d, okMsg) {
    busy.current = false;
    if (!d?.success) siteToast(d?.message || 'Không thực hiện được, thử lại nhé.', 'error');
    else if (okMsg) siteToast(okMsg, 'success');
    return load();
  }

  // One action at a time, as on the old page
  function run(method, url, body, then) {
    busy.current = true;
    shopApi(method, url, body).then(then);
  }

  function applyItem(i) {
    if (busy.current) return;
    siteConfirm(`Dùng ${i.name}?`, USE_MSG[i.key] || '', i.key === 'hopeHammer' ? 'Đập búa! 🔨' : 'Dùng', () => {
      run('POST', '/shop/use', { key: i.key }, (d) => after(d, i.key === 'hopeHammer' ? '🔨 Búa đã đập — hôm nay lửa ×2, học ngay thôi!'
        : i.key === 'towel' ? '🧽 Lau sạch bong! Ảnh đại diện đã hết kem ✨'
          : `${i.emoji} Đã dùng ${i.name}!`));
    });
  }

  function sellItem(i) {
    if (busy.current) return;
    siteConfirm(`Bán ${i.name}?`, `Bán 1 ${i.name} lấy lại ${i.sellPrice} 🔥 (giá mua ${i.price} 🔥).`, 'Bán', () => {
      run('POST', '/shop/sell', { kind: 'item', key: i.key }, (d) => after(d, `Đã bán ${i.name} — +${i.sellPrice} 🔥`));
    });
  }

  function sellPet(p) {
    if (busy.current) return;
    siteConfirm(`Bán ${p.name}?`, `Linh thú sẽ rời khỏi kho, bạn nhận lại ${p.sellPrice} 🔥 (giá mua ${p.price} 🔥).`, 'Bán', () => {
      run('POST', '/shop/sell', { kind: 'pet', key: p.id }, (d) => {
        if (d?.success) window.Pets?.setActive?.(d.activePet);
        after(d, `Tạm biệt ${p.name} 👋 — +${p.sellPrice} 🔥`);
      });
    });
  }

  function applyDaniel(h) {
    if (busy.current) return;
    siteConfirm('Dùng Búa Daniel?', `Khôi phục chuỗi ${h.previousStreak} 🔥 vừa mất (tốn 1 búa).`, 'Khôi phục 🔨', () => {
      run('POST', '/user/streak/use-hammer', undefined, (d) => after(d, `🔨 Đã khôi phục chuỗi ${d?.streak} 🔥!`));
    });
  }

  function setPet(id) {
    if (busy.current) return;
    const p = data.pets.find((x) => x.id === id);
    run('PUT', '/shop/pet', { petId: id }, (d) => {
      if (d?.success) window.Pets?.setActive?.(d.activePet);
      after(d, id ? `🐾 ${p?.name} ra ngoài đi dạo rồi!` : 'Linh thú đã về nghỉ.');
    });
  }

  // Local only: the server still has it as the active pet
  function wake() {
    if (busy.current) return;
    window.Pets?.setActive?.(data.activePet);
    siteToast('🐾 Linh thú dậy rồi, đi dạo tiếp nè!', 'success');
    repaint((n) => n + 1);
  }

  function openGift(kind, entry) {
    if (!busy.current) setGifting({ kind, entry });
  }

  const act = { useItem: applyItem, sellItem, sellPet, useDaniel: applyDaniel, setPet, wake, gift: openGift };

  function sendGift(to, qty) {
    const { kind, entry } = gifting;
    const key = kind === 'pet' ? entry.id : entry.key;
    run('POST', '/shop/gift', { kind, key, toId: to._id, qty }, (d) => {
      if (kind === 'pet' && d?.success) window.Pets?.setActive?.(d.activePet);
      after(d, `🎁 Đã gửi ${qty > 1 ? `${qty} ` : ''}${entry.name} vào Hộp thư của ${d?.targetName || to.name}!`);
    });
  }

  let body;
  if (!canPlay) body = <div className="inv-empty">Kho đồ chỉ dành cho học sinh và giáo viên.</div>;
  else if (failed) {
    body = (
      <div className="inv-empty">
        Không tải được kho đồ.{' '}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  } else if (!data) body = <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '20px 0' }}>Đang tải kho đồ…</p>;
  else {
    const items = data.items.filter((i) => i.owned > 0 && i.key !== 'danielHammer');
    const owned = data.pets.filter((p) => p.owned);
    body = (
      <>
        <div className="inv-wallet">
          <div className="inv-stats">
            <div className="inv-stat"><span>Ví lửa</span><b>🔥 {data.wallet}</b></div>
            <div className="inv-stat inv-stat--streak"><span>Lửa chuỗi hiện có</span><b>🔥 {data.streak}</b></div>
          </div>
          <a className="btn btn-primary btn-sm" href="/app/#/shop"><i className="fas fa-store" /> Cửa hàng</a>
        </div>
        <p className="inv-note">Ví lửa dùng để mua sắm; lửa chuỗi là thứ hạng trên BXH. Bán lại được một nửa giá mua (làm tròn xuống). Bấm 🎁 Tặng để gửi vật phẩm / linh thú cho bạn bè. Kỹ năng linh thú chỉ có tác dụng với bé đang đi dạo.</p>
        <h4 className="inv-h">⚔️ Vật phẩm</h4>
        <div className="inv-grid">
          <DanielCard hammer={data.danielHammer} items={data.items} act={act} />
          {items.map((i) => <ItemCard key={i.key} item={i} effects={data.effects} act={act} />)}
        </div>
        {owned.length > 0
          ? (
            <>
              <h4 className="inv-h">🐾 Linh thú</h4>
              <div className="inv-grid">{owned.map((p) => <PetCard key={p.id} pet={p} activePet={data.activePet} pets={pets} act={act} />)}</div>
            </>
          )
          : <div className="inv-empty">🐾 Chưa có linh thú — ghé <a href="/app/#/shop">Cửa hàng lửa</a> rước một bé về nhé!</div>}
      </>
    );
  }

  return (
    <div className={`tab-content${active ? ' active' : ''}`} id="tab-inventory">
      <div className="card">
        <div className="card-header"><span style={{ fontWeight: 700 }}><i className="fas fa-box-open" /> Kho đồ</span></div>
        <div className="card-body" id="inventory-body">{body}</div>
      </div>
      {gifting && <GiftDialog kind={gifting.kind} entry={gifting.entry} pets={pets} onClose={() => setGifting(null)} onSend={sendGift} />}
    </div>
  );
}
