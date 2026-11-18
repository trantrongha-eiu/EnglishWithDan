import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { siteConfirm, siteToast, usePets } from '../utils/shell';
import { canBuyItem, fmtUntil, maxQty, shopApi, takeHopeResult } from '../utils/shop';

// 🔥 Cửa hàng lửa — /app/#/shop (js/shop.js). GET /shop gives the wallet, the
// active effects, items and linh thú; this page only sells. Using, walking a
// pet and selling back stay in the Kho đồ tab of the profile page.

const KHO = '/profile.html#inventory';
const SKELETON = '<div class="shop-card shop-skel"></div>';
const html = (__html) => ({ __html });

function GridSkeleton() {
  return [0, 1, 2].map((i) => <div className="shop-card shop-skel" key={i} />);
}

function LoadError() {
  return (
    <div className="shop-empty">
      Không tải được cửa hàng.{' '}
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Thử lại</button>
    </div>
  );
}

function ItemIcon({ item }) {
  return item.image
    ? <img className="shop-emoji shop-emoji-img" src={item.image} alt="" aria-hidden="true" />
    : <span className="shop-emoji" aria-hidden="true">{item.emoji}</span>;
}

function Skill({ skill }) {
  if (!skill) return null;
  return <div className="shop-skill"><b>{skill.icon} {skill.name}</b><span>{skill.text}</span></div>;
}

function PetArt({ pets, id }) {
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={html(pets ? pets.svg(id) : '')} />;
}

function Effect({ emoji, tone, title, children }) {
  return (
    <div className={`shop-effect${tone ? ` shop-effect--${tone}` : ''}`}>
      <span className="shop-effect-emoji">{emoji}</span>
      <div className="shop-effect-body"><b>{title}</b>{children}</div>
    </div>
  );
}

function Effects({ data, hopeResult }) {
  const e = data.effects || {};
  const towels = data.items.find((i) => i.key === 'towel')?.owned || 0;
  const hopeDone = e.hope ? Math.min(e.hope.base, e.hope.quota) : 0;
  const hasAny = e.hope || hopeResult || e.crownUntil || e.invisibleUntil || e.cakedUntil;
  if (!hasAny) return null;
  return (
    <div className="shop-effects" id="shop-effects">
      {e.hope && (
        <Effect emoji="🔨" tone="hope" title="Búa Hi Vọng đang chạy — 🔥 hôm nay ×2!">
          <div className="shop-progress"><span style={{ width: `${Math.round(hopeDone / e.hope.quota * 100)}%` }} /></div>
          <small>{hopeDone >= e.hope.quota
            ? `Đã đạt chỉ tiêu ${e.hope.quota} 🔥 — an toàn rồi, học thêm để nhân đôi tiếp nhé!`
            : `Đã kiếm ${hopeDone}/${e.hope.quota} 🔥 sau khi đập búa. Chưa đủ trước nửa đêm sẽ bị trừ ${e.hope.penalty} 🔥!`}</small>
        </Effect>
      )}
      {hopeResult && (hopeResult.success
        ? <Effect emoji="🎉" tone="win" title="Búa Hi Vọng thắng cược!"><small>Bạn kiếm được {hopeResult.base} 🔥 gốc và đã nhận gấp đôi.</small></Effect>
        : <Effect emoji="💥" tone="lose" title="Búa Hi Vọng thua cược…"><small>Chỉ kiếm được {hopeResult.base} 🔥 — chuỗi bị trừ {hopeResult.penalty} 🔥. Lần sau cố lên nhé!</small></Effect>)}
      {e.crownUntil && <Effect emoji="👑" title="Vương Miện Lửa"><small>Tên bạn đang phát sáng trên BXH — {fmtUntil(e.crownUntil)}.</small></Effect>}
      {e.invisibleUntil && <Effect emoji="👻" title="Áo Tàng Hình"><small>Người khác chỉ thấy "???" — {fmtUntil(e.invisibleUntil)}.</small></Effect>}
      {e.cakedUntil && (
        <Effect emoji="🎂" tone="cake" title={`Bạn bị ${e.cakedBy || 'ai đó'} úp bánh kem!`}>
          <small>
            Kem dính trên ảnh đại diện — {fmtUntil(e.cakedUntil)}.{' '}
            {towels
              ? <>Bạn có {towels} 🧽 Khăn Lau Diệu Kì — <a href={KHO}>lau ngay</a>!</>
              : 'Mua 🧽 Khăn Lau Diệu Kì để lau sạch, hoặc mua bánh ném trả đũa 😆'}
          </small>
        </Effect>
      )}
    </div>
  );
}

// The pet out walking: its skill, today's 🎁, Hộ Thể blocks left
function MyPet({ data, pets, onGift }) {
  const p = data.pet;
  if (!p) {
    const ownsAny = data.pets.some((x) => x.owned);
    return (
      <div className="shop-mypet" id="shop-mypet">
        <div className="shop-mypet-body">
          <b>🐾 {ownsAny ? 'Chưa có linh thú nào đi dạo' : 'Rước một linh thú về nhà nhé!'}</b>
          <small>{ownsAny
            ? <>Dắt một bé đi dạo ở <a href={KHO}>Kho đồ</a> để dùng kỹ năng của bé và nhận 🎁 quà mỗi ngày.</>
            : 'Mỗi linh thú có một kỹ năng riêng và mang 🎁 quà 🔥 về mỗi ngày bạn học bài.'}</small>
        </div>
      </div>
    );
  }
  return (
    <div className="shop-mypet" id="shop-mypet">
      <span className="shop-mypet-art" aria-hidden="true"><span className="ews-pet is-walking shop-pet-preview"><PetArt pets={pets} id={p.id} /></span></span>
      <div className="shop-mypet-body">
        <b>🐾 {p.name} đang đi dạo cùng bạn</b>
        <Skill skill={p.skill} />
        <div className="shop-mypet-status">
          {p.gift === 'ready' && <button type="button" className="btn btn-primary btn-sm shop-gift-btn" data-pet-gift onClick={onGift}>🎁 Mở quà hôm nay</button>}
          {p.gift === 'claimed' && <span className="shop-gift-done">✓ Đã mở quà hôm nay — mai lại có nhé</span>}
          {p.gift !== 'ready' && p.gift !== 'claimed' && <span className="shop-gift-wait">🎁 Học 1 bài kiếm 🔥 đầu tiên hôm nay là bé mang quà về</span>}
          {p.guard && (
            <span className="shop-guard">
              {p.guard.reflect ? '⚡' : '🛡️'} Hộ thể hôm nay: còn <b>{Math.max(0, p.guard.max - p.guard.used)}/{p.guard.max}</b> lần chặn bánh
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemCard({ item: i, wallet, onBuy }) {
  const full = i.maxOwned && i.owned >= i.maxOwned;
  return (
    <article className={`shop-card shop-card--${i.key}`}>
      <div className="shop-card-top">
        <ItemIcon item={i} />
        <span className={`shop-owned${i.owned ? ' has' : ''}`}>Đang có: <b>{i.owned}</b>{i.maxOwned ? `/${i.maxOwned}` : ''}</span>
      </div>
      <h3>{i.name}</h3>
      <p>{i.description}</p>
      <div className="shop-card-actions">
        <button type="button" className="btn btn-primary btn-sm" data-buy={i.key} disabled={!canBuyItem(i, wallet)} onClick={() => onBuy(i)}>
          {full ? 'Đã đầy' : `Mua · 🔥 ${i.price}`}
        </button>
        {i.owned > 0 && <a className="btn btn-ghost btn-sm" href={KHO}>🎒 Mở kho</a>}
      </div>
    </article>
  );
}

function PetCard({ pet: p, data, pets, onBuy }) {
  const active = data.activePet === p.id;
  const resting = active && pets?.isResting?.();
  const cls = ['shop-card', 'shop-pet', p.tier && `shop-pet--${p.tier}`, p.legendary && 'shop-pet--legend', active && 'is-active', p.owned && 'is-owned'];
  return (
    <article className={cls.filter(Boolean).join(' ')}>
      {p.tails > 0 && <span className="shop-tails" title={`${p.tails} đuôi`}>{p.tails} đuôi</span>}
      <div className="shop-pet-stage"><div className="ews-pet is-walking shop-pet-preview"><PetArt pets={pets} id={p.id} /></div></div>
      <h3>
        {p.name}
        {p.legendary && <> <span className="shop-legend-tag">Huyền thoại</span></>}
        {p.owned && <> <span className="shop-tag">Của bạn</span></>}
      </h3>
      <p>{p.description}</p>
      <Skill skill={p.skill} />
      <div className="shop-card-actions">
        {!p.owned && (
          <button type="button" className="btn btn-primary btn-sm" data-buy-pet={p.id} disabled={data.wallet < p.price} onClick={() => onBuy(p)}>Mua · 🔥 {p.price}</button>
        )}
        {p.owned && resting && <span className="shop-resting">💤 Đang nghỉ hôm nay</span>}
        {p.owned && active && !resting && <span className="shop-walking">✓ Đang đi dạo</span>}
        {p.owned && <a className="btn btn-ghost btn-sm" href={KHO}>🎒 Trong kho</a>}
      </div>
    </article>
  );
}

function PetGrid({ id, list, data, pets, failed, onBuy }) {
  const loading = !data && !failed;
  return (
    <div className="shop-grid shop-grid--pets" id={id} aria-busy={loading ? 'true' : undefined}>
      {failed && <LoadError />}
      {loading && <GridSkeleton />}
      {!failed && data && list.map((p) => <PetCard key={p.id} pet={p} data={data} pets={pets} onBuy={onBuy} />)}
    </div>
  );
}

// Buy dialog with a − [n] + stepper; the total follows n
function QtyDialog({ item, wallet, onClose, onConfirm }) {
  const [max] = useState(() => maxQty(item, wallet));
  const [text, setText] = useState('1');
  const input = useRef(null);
  const n = parseInt(text, 10);
  const qty = Math.min(max, Math.max(1, Number.isNaN(n) ? 1 : n));
  const presets = [5, 10].filter((v) => v < max);
  const confirm = () => { onClose(); onConfirm(qty); };

  useEffect(() => {
    const trigger = document.activeElement;
    input.current?.focus();
    input.current?.select();
    return () => trigger?.focus?.();
  }, []);

  return (
    <div className="modal-overlay shop-qty-modal"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div className="modal-box modal-sm" role="dialog" aria-modal="true" aria-labelledby="shop-qty-title">
        <div className="modal-body shop-qty-body">
          <ItemIcon item={item} />
          <h3 id="shop-qty-title">Mua {item.name}</h3>
          <div className="shop-qty" role="group" aria-label="Số lượng">
            <button type="button" className="shop-qty-btn" data-step="-1" aria-label="Bớt 1" disabled={qty <= 1} onClick={() => setText(String(qty - 1))}>−</button>
            <input ref={input} type="number" className="shop-qty-input" inputMode="numeric" min="1" max={max} value={text} aria-label="Số lượng"
              onChange={(e) => setText(e.target.value)}
              onBlur={() => setText(String(qty))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirm(); } }} />
            <button type="button" className="shop-qty-btn" data-step="1" aria-label="Thêm 1" disabled={qty >= max} onClick={() => setText(String(qty + 1))}>+</button>
          </div>
          <div className="shop-qty-presets">
            {presets.map((v) => <button type="button" className="btn btn-ghost btn-sm" data-set={v} key={v} onClick={() => setText(String(v))}>{v}</button>)}
            {max > 1 && <button type="button" className="btn btn-ghost btn-sm" data-set={max} onClick={() => setText(String(max))}>Tối đa ({max})</button>}
          </div>
          <p className="shop-qty-total">{qty} × 🔥 {item.price} = <b>🔥 {qty * item.price}</b><span>Ví còn lại: 🔥 {wallet - qty * item.price}</span></p>
          <small className="shop-qty-note">Tối đa {max}{item.maxOwned ? ` (giữ tối đa ${item.maxOwned})` : ''} · chuỗi không bị trừ.</small>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-ghost" data-cancel onClick={onClose}>Hủy</button>
          <button type="button" className="btn btn-primary" data-ok onClick={confirm}>Mua {qty} · 🔥 {qty * item.price}</button>
        </div>
      </div>
    </div>
  );
}

// ⚔️ The board itself is js/shared/duel.js, which owns this element's content
const DuelBoard = memo(function DuelBoard({ wallet, onChange }) {
  const host = useRef(null);
  const opts = useRef({ wallet: 0, onChange: null });
  useEffect(() => {
    opts.current.wallet = wallet;
    opts.current.onChange = onChange;
  }, [wallet, onChange]);
  useEffect(() => {
    window.Duel?.mount(host.current, opts.current);
    return () => window.Duel?.unmount?.();
  }, []);
  return <div id="shop-duels" ref={host} aria-busy="true" dangerouslySetInnerHTML={html(SKELETON)} />;
});

export default function Shop() {
  const pets = usePets();
  const [{ data, hopeResult, failed }, setState] = useState({ data: null, hopeResult: null, failed: false });
  const [buying, setBuying] = useState(null);
  const busy = useRef(false);

  const load = useCallback(() => shopApi('GET', '/shop').then((d) => {
    if (d?.success) setState({ data: d, hopeResult: takeHopeResult(d.effects), failed: false });
    else setState((s) => ({ ...s, failed: true }));
  }), []);

  useEffect(() => { load(); }, [load]);

  // Wiped from the cake popup, or the walking pet's 🎁 was opened
  useEffect(() => {
    const reload = () => load();
    document.addEventListener('ews:cake-wiped', reload);
    document.addEventListener('ews:pet-gift', reload);
    return () => {
      document.removeEventListener('ews:cake-wiped', reload);
      document.removeEventListener('ews:pet-gift', reload);
    };
  }, [load]);

  // A challenge dialog does not outlive the page
  useEffect(() => () => document.querySelectorAll('.duel-modal').forEach((m) => m.remove()), []);

  function after(d, okMsg) {
    busy.current = false;
    if (!d?.success) {
      siteToast(d?.message || 'Không thực hiện được, thử lại nhé.', 'error');
      return load();
    }
    if (okMsg) siteToast(okMsg, 'success');
    try { window.Mascot?.hop?.('cheer'); } catch { /* decoration only */ }
    return load();
  }

  function openBuyItem(item) {
    if (!busy.current) setBuying(item);
  }

  function buyItem(item, qty) {
    busy.current = true;
    shopApi('POST', '/shop/buy', { kind: 'item', key: item.key, qty }).then((d) => {
      after(d, `${item.emoji} Đã mua ${qty > 1 ? `${qty} ` : ''}${item.name} — cất trong Kho đồ (trang cá nhân).`);
    });
  }

  function buyPet(p) {
    if (busy.current) return;
    const note = p.legendary ? ' Cả hệ thống sẽ được thông báo khi bạn rước linh thú huyền thoại này 🔥' : '';
    siteConfirm(`Rước ${p.name} về?`, `Trừ ${p.price} 🔥 trong ví lửa (chuỗi không bị trừ).${note}`, 'Mua', () => {
      busy.current = true;
      shopApi('POST', '/shop/buy', { kind: 'pet', key: p.id }).then((d) => {
        if (d?.success) window.Pets?.setActive?.(d.activePet);
        // Everyone else gets it from the feed poll; the buyer sees it now
        if (d?.success && p.legendary) window.ShopFeed?.legend?.({ type: 'buy', self: true, petId: p.id });
        after(d, `🐾 ${p.name} đã về nhà với bạn!`);
      });
    });
  }

  function openGift(e) {
    if (busy.current) return;
    e.currentTarget.disabled = true;
    busy.current = true;
    shopApi('POST', '/shop/pet-gift').then((d) => {
      if (d?.success) window.Pets?.giftOpened?.();
      after(d, d?.success
        ? `🎁 ${d.petName} mang về +${d.flames} 🔥${d.item ? ` và ${d.item.emoji} ${d.item.name} (đã vào Kho đồ)` : ''}!`
        : '');
    });
  }

  const allPets = data?.pets || [];
  const gridProps = { data, pets, failed, onBuy: buyPet };
  const itemsLoading = !data && !failed;

  return (
    <div className="et-shell shop-shell">
      <div className="et-hero shop-hero pf-hero pf-hero-orange" data-mascot="excited">
        <div className="pf-hero-body">
          <h1>Cửa hàng <span className="pf-tag">lửa 🔥</span></h1>
          <p className="pf-hero-sub">Mỗi 🔥 bạn kiếm được khi học được cộng vào cả <b>chuỗi</b> lẫn <b>ví lửa</b>. Mua sắm chỉ trừ ví — chuỗi và hạng trên BXH vẫn giữ nguyên.</p>
        </div>
      </div>

      <div className="shop-wallet" id="shop-wallet" aria-live="polite">
        <div className="shop-wallet-main">
          <span className="shop-wallet-label">Ví lửa của bạn</span>
          <span className="shop-wallet-value"><span className="shop-flame">🔥</span> <b id="shop-wallet-value">{data ? data.wallet : '…'}</b></span>
        </div>
        <div className="shop-wallet-side">
          <span>Chuỗi hiện tại: <b id="shop-streak">{data ? data.streak : '…'}</b> 🔥</span>
          <Link className="btn btn-ghost btn-sm" to="/leaderboard"><i className="fas fa-ranking-star" /> Xem BXH</Link>
        </div>
      </div>

      {data && <Effects data={data} hopeResult={hopeResult} />}
      {data && <MyPet data={data} pets={pets} onGift={openGift} />}

      <section className="shop-section shop-section--duel">
        <h2 className="shop-h2"><span>⚔️</span> Thách đấu 🔥</h2>
        {failed && <div id="shop-duels"><LoadError /></div>}
        {!failed && data && <DuelBoard wallet={data.wallet} onChange={load} />}
        {itemsLoading && <div id="shop-duels" aria-busy="true"><div className="shop-card shop-skel" /></div>}
      </section>

      <section className="shop-section">
        <h2 className="shop-h2"><span>⚔️</span> Vật phẩm đua top</h2>
        <div className="shop-grid" id="shop-items" aria-busy={itemsLoading ? 'true' : undefined}>
          {failed && <LoadError />}
          {itemsLoading && <GridSkeleton />}
          {!failed && data?.items.map((i) => <ItemCard key={i.key} item={i} wallet={data.wallet} onBuy={openBuyItem} />)}
        </div>
      </section>

      <section className="shop-section">
        <h2 className="shop-h2"><span>🐾</span> Linh thú</h2>
        <p className="shop-sub">Linh thú sẽ đi dạo quanh các trang học (tự trốn đi khi bạn làm bài thi) và ngồi cạnh tên bạn trên BXH. Mỗi bé có một <b>kỹ năng riêng</b> — chỉ bé đang đi dạo mới dùng kỹ năng — và mỗi ngày mang 🎁 quà về ngay khi bạn kiếm được 🔥 đầu tiên: bấm vào bé để mở!</p>
        <PetGrid id="shop-pets" list={allPets.filter((p) => !p.tier)} {...gridProps} />
      </section>

      <section className="shop-section shop-section--vi">
        <h2 className="shop-h2"><span>🔥</span> Vĩ thú — từ Nhất Vĩ đến Cửu Vĩ</h2>
        <p className="shop-sub">Chín linh thú huyền thoại, càng nhiều đuôi càng hiếm. Sưu tầm đủ chín con để thành cao thủ BXH!</p>
        <PetGrid id="shop-beasts" list={allPets.filter((p) => p.tier === 'vi')} {...gridProps} />
      </section>

      <section className="shop-section shop-section--su">
        <h2 className="shop-h2"><span>⚔️</span> Susano — chiến thần huyền thoại</h2>
        <p className="shop-sub">Năm khổng lồ lửa với hào quang còn rực hơn Thập Vĩ. Susano <b>hộ thể</b>: tự chặn bánh kem ném vào bạn, từ Tử Lôi trở lên còn úp ngược bánh vào mặt người ném! Mỗi lần bạn mở trang, Susano trỗi dậy giữa màn hình — và cả hệ thống được báo khi bạn rước một con về.</p>
        <PetGrid id="shop-susano" list={allPets.filter((p) => p.tier === 'susano')} {...gridProps} />
      </section>

      {buying && data && (
        <QtyDialog item={buying} wallet={data.wallet} onClose={() => setBuying(null)} onConfirm={(qty) => buyItem(buying, qty)} />
      )}
    </div>
  );
}
