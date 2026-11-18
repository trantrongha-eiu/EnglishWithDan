import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';
import { siteConfirm, siteToast, usePets } from '../utils/shell';
import { cakeToast, luluLine, quizSub, shopApi, streakSub } from '../utils/shop';

// 🏆 BXH vocab — /app/#/leaderboard (js/vocab-leaderboard.js): Top streak and
// Top Quiz boards, the viewer's own standing, and the Cửa hàng lửa actions on
// each row (🎂 ném bánh, 🔍 Kính Soi, ⚔️ thách đấu).

const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const FIRST_LIMIT = 10;
const MORE_STEP = 20;
const MAX_LIMIT = 200; // server cap for ?limit=
const BOARD_URL = {
  streak: (n) => `/user/streak-leaderboard?limit=${n}`,
  quiz: (n) => `/vocabulary-lessons/leaderboard?limit=${n}`,
};
const LOADING = { status: 'loading', rows: [] };

const mmss = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const html = (__html) => ({ __html });

function StreakValue({ streak, revealed }) {
  const extra = revealed ? ' vlb-revealed' : '';
  // Áo Tàng Hình: the server blanks the number for everyone else
  if (streak == null) return <span className={`dan-lb-streak vlb-hidden${extra}`} title="Đang mặc Áo Tàng Hình">👻 ???</span>;
  const tier = window.getFireTier?.(streak) || {};
  return (
    <span className={`dan-lb-streak${tier.cls ? ` ${tier.cls}` : ''}${extra}`} style={!tier.cls && tier.color ? { color: tier.color } : undefined}>
      {revealed && '👁️ '}<i className="fas fa-fire" /> {streak}
    </span>
  );
}

function QuizValue({ score, timeSpent }) {
  return <span className="dan-lb-quiz-score">{score}% <span className="dan-lb-quiz-time">· {mmss(timeSpent)}</span></span>;
}

function Row({ rank, userId, name, avatar, value, decor = {}, ctx }) {
  const { myId, shop, busy, pets, topLulu, onCake, onLens, onDuel } = ctx;
  const isMe = String(userId) === String(myId);
  const medal = RANK_MEDAL[rank];
  const id = String(userId);
  const stop = (fn) => (e) => { e.stopPropagation(); fn(id, name); };
  return (
    <div
      className={`dan-lb-row${isMe ? ' is-me' : ' dan-lb-clickable'}`}
      onClick={isMe ? undefined : () => window.openPeerProfile?.(id)}
    >
      <span className={`dan-lb-rank${medal ? ` top${rank}` : ''}`}>{medal || rank}</span>
      <span className={`vlb-av${decor.cakedBy ? ' is-caked' : ''}`} title={decor.cakedBy ? `Bị ${decor.cakedBy} úp bánh kem 🎂` : undefined}>
        {avatar
          ? <img className="dan-lb-avatar" src={avatar} alt="" />
          : <span className="dan-lb-avatar-placeholder">{(name || '?')[0].toUpperCase()}</span>}
        {decor.crown && <span className="vlb-crown" aria-hidden="true">👑</span>}
        {decor.cakedBy && <span className="vlb-cake" aria-hidden="true">🎂</span>}
      </span>
      <span className={`dan-lb-name${decor.crown ? ' vlb-name-crown' : ''}`}>{name}{isMe ? ' (Bạn)' : ''}</span>
      {decor.pet && pets && <span style={{ display: 'contents' }} dangerouslySetInnerHTML={html(pets.badge(decor.pet))} />}
      {rank === 1 && topLulu && <span className="vlb-top-lulu" title="Lulu cổ vũ người dẫn đầu" dangerouslySetInnerHTML={html(topLulu)} />}
      <span className="vlb-spacer" />
      {!isMe && shop?.cakes > 0 && !decor.cakedBy && (
        <button type="button" className="vlb-cake-btn" data-cake={id} data-name={name} disabled={busy === `cake:${id}`}
          title={`Ném bánh kem vào ${name}`} aria-label={`Ném bánh kem vào ${name}`} onClick={stop(onCake)}>🎂</button>
      )}
      {!isMe && shop?.lenses > 0 && decor.hidden && (
        <button type="button" className="vlb-cake-btn vlb-lens-btn" data-lens={id} data-name={name} disabled={busy === `lens:${id}`}
          title={`Dùng Kính Soi lột Áo Tàng Hình của ${name}`} aria-label={`Dùng Kính Soi lột Áo Tàng Hình của ${name}`} onClick={stop(onLens)}>🔍</button>
      )}
      {!isMe && shop && window.Duel && (
        <button type="button" className="vlb-cake-btn vlb-duel-btn" data-duel={id} data-name={name}
          title={`Thách đấu ${name} — cược 🔥`} aria-label={`Thách đấu ${name}`} onClick={stop(onDuel)}>⚔️</button>
      )}
      {value}
    </div>
  );
}

function Skeleton() {
  return [0, 1, 2, 3, 4].map((i) => (
    <div className="vlb-skel" key={i}><span className="s-rank" /><span className="s-av" /><span className="s-name" /><span className="s-val" /></div>
  ));
}

function BoardList({ id, board, kind, emptyMsg, loadingMore, onMore, renderRow, pinned }) {
  const { status, rows, total } = board;
  const left = total ? total - rows.length : 0;
  return (
    <div className="dan-lb-list" id={id} aria-busy={status === 'loading' ? 'true' : undefined}>
      {status === 'loading' && <Skeleton />}
      {status === 'error' && (
        <div className="dan-lb-empty">
          Không tải được bảng xếp hạng.{' '}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      )}
      {status === 'ok' && !rows.length && <div className="dan-lb-empty">{emptyMsg}</div>}
      {status === 'ok' && rows.length > 0 && (
        <>
          {rows.map((r, i) => renderRow(r, i + 1))}
          {left > 0 && rows.length < MAX_LIMIT && (
            <button type="button" className="btn btn-ghost btn-sm vlb-more" data-more={kind} disabled={loadingMore} onClick={() => onMore(kind)}>
              {loadingMore
                ? <><i className="fas fa-spinner fa-spin" /> <span>Đang tải…</span></>
                : <><i className="fas fa-chevron-down" /> <span>Xem thêm</span> <span className="vlb-more-count">+{Math.min(MORE_STEP, left)}</span></>}
            </button>
          )}
          {pinned}
        </>
      )}
    </div>
  );
}

function ShopStrip({ shop }) {
  const d = shop.data;
  const bits = [];
  if (d.effects?.hope) bits.push(`🔨 Búa Hi Vọng: ${Math.min(d.effects.hope.base, d.effects.hope.quota)}/${d.effects.hope.quota} 🔥`);
  if (shop.shields) bits.push(`🛡️ ×${shop.shields}`);
  if (shop.cakes) bits.push(`Bạn có ${shop.cakes} 🎂 — bấm 🎂 cạnh tên một bạn để ném`);
  if (shop.lenses) bits.push(`🔍 ×${shop.lenses} — bấm 🔍 cạnh người đang tàng hình để soi`);
  if (d.pet?.skill) bits.push(`${d.pet.skill.icon} ${d.pet.name}: ${d.pet.skill.name}`);
  bits.push('⚔️ cạnh tên = thách đấu cược 🔥');
  return (
    <div className="vlb-shop" id="vlb-shop">
      <span className="vlb-shop-wallet">Ví lửa <b>🔥 {d.wallet}</b></span>
      <span className="vlb-shop-bits">{bits.join(' · ')}</span>
      <Link className="btn btn-primary btn-sm" to="/shop"><i className="fas fa-store" /> Cửa hàng</Link>
    </div>
  );
}

function MeTile({ kind, icon, label, standing, sub, to, linkIcon, linkText }) {
  return (
    <div className={`vlb-me-tile vlb-me-tile--${kind}`}>
      <div className="vlb-me-icon"><i className={`fas ${icon}`} /></div>
      <div className="vlb-me-body">
        <div className="vlb-me-label">{label}</div>
        <div className="vlb-me-value" id={`vlb-me-${kind}-value`}>
          {!standing ? '—' : standing.rank ? <>Hạng #{standing.rank}<small>/ {standing.total} học viên</small></> : 'Chưa xếp hạng'}
        </div>
        <div className="vlb-me-sub" id={`vlb-me-${kind}-sub`}>{sub}</div>
      </div>
      <Link className="btn btn-primary btn-sm" to={to}><i className={`fas ${linkIcon}`} /> {linkText}</Link>
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const pets = usePets();
  const myId = user?._id || user?.id || null;
  const myName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'Bạn';
  const canShop = !user?.role || user.role === 'student' || user.role === 'teacher';

  const [shop, setShop] = useState(null);
  const [boards, setBoards] = useState({ streak: LOADING, quiz: LOADING });
  const [more, setMore] = useState({});
  const [busy, setBusy] = useState('');
  const limits = useRef({ streak: FIRST_LIMIT, quiz: FIRST_LIMIT });
  const seq = useRef({ streak: 0, quiz: 0 });
  const luluHost = useRef(null);
  const walletRef = useRef(0);
  const [topLulu] = useState(() => window.Mascot?.svg?.('cheer', { label: 'Lulu' }) || '');

  const loadBoard = useCallback((kind) => {
    seq.current[kind] += 1;
    const mine = seq.current[kind];
    const put = (b) => { if (mine === seq.current[kind]) setBoards((o) => ({ ...o, [kind]: b })); };
    return apiFetch(BOARD_URL[kind](limits.current[kind]))
      .then((d) => put({ status: 'ok', rows: d.leaderboard || [], total: d.total, me: d.me || null }))
      .catch(() => put({ status: 'error', rows: [], me: null }));
  }, []);

  const loadShop = useCallback(() => {
    if (!canShop) return Promise.resolve();
    return shopApi('GET', '/shop').then((d) => {
      if (!d?.success) return;
      const owned = Object.fromEntries((d.items || []).map((i) => [i.key, i.owned]));
      walletRef.current = d.wallet || 0;
      setShop({ data: d, cakes: owned.cake || 0, lenses: owned.lens || 0, shields: owned.iceShield || 0 });
    });
  }, [canShop]);

  const reloadAll = useCallback(() => loadShop().then(() => {
    loadBoard('streak');
    loadBoard('quiz');
  }), [loadShop, loadBoard]);

  // The shop state first: it decides which buttons the rows get
  useEffect(() => { reloadAll(); }, [reloadAll]);

  // Wiped from the shop-feed.js cake popup: take the 🎂 off my row
  useEffect(() => {
    const onWiped = () => loadBoard('streak');
    document.addEventListener('ews:cake-wiped', onWiped);
    return () => document.removeEventListener('ews:cake-wiped', onWiped);
  }, [loadBoard]);

  // A challenge dialog does not outlive the page
  useEffect(() => () => document.querySelectorAll('.duel-modal').forEach((m) => m.remove()), []);

  const { streak, quiz } = boards;
  const bothDone = streak.status !== 'loading' && quiz.status !== 'loading';
  const lulu = useMemo(() => (bothDone ? JSON.stringify(luluLine(streak.me, quiz.me)) : ''), [bothDone, streak.me, quiz.me]);
  useEffect(() => {
    if (lulu && luluHost.current) window.Mascot?.react?.(luluHost.current, JSON.parse(lulu));
  }, [lulu]);

  function showMore(kind) {
    limits.current[kind] = Math.min(MAX_LIMIT, limits.current[kind] + MORE_STEP);
    setMore((m) => ({ ...m, [kind]: true }));
    loadBoard(kind).finally(() => setMore((m) => ({ ...m, [kind]: false })));
  }

  function throwCake(id, name) {
    setBusy(`cake:${id}`);
    shopApi('POST', '/shop/cake', { targetId: id }).then((d) => {
      siteToast(...cakeToast(d, name));
      return reloadAll();
    }).finally(() => setBusy(''));
  }

  function revealCloak(id, name) {
    setBusy(`lens:${id}`);
    shopApi('POST', '/shop/lens', { targetId: id }).then((d) => {
      if (d.success) siteToast(`🔍 Lộ rồi nhé! Áo Tàng Hình của ${name} đã rách 😎`, 'success');
      else siteToast(d.message || 'Không soi được', 'error');
      return reloadAll();
    }).finally(() => setBusy(''));
  }

  const ctx = {
    myId, shop, busy, pets, topLulu,
    onCake: (id, name) => siteConfirm('Ném bánh kem?', `Dùng 1 🎂 ném vào ${name}? Bánh sẽ dính trên ảnh đại diện 24 giờ.`, 'Ném! 🎂', () => throwCake(id, name)),
    onLens: (id, name) => siteConfirm('Soi Áo Tàng Hình?', `Dùng 1 🔍 Kính Soi lột Áo Tàng Hình của ${name}? Cả BXH sẽ lại thấy số 🔥 thật của bạn ấy.`, 'Soi! 🔍', () => revealCloak(id, name)),
    onDuel: (id, name) => window.Duel.challenge({ id, name }, { wallet: walletRef.current, onChange: loadShop }),
  };

  const myRow = (standing, shown, value) => (standing?.rank > shown ? (
    <>
      <div className="vlb-gap" aria-hidden="true">⋯</div>
      <Row rank={standing.rank} userId={myId} name={myName} avatar={user?.avatar || ''} value={value} decor={standing} ctx={ctx} />
    </>
  ) : null);

  const streakValue = (s) => <StreakValue streak={s.streak} revealed={s.revealed} />;
  const quizValue = (q) => <QuizValue score={q.score} timeSpent={q.timeSpent} />;

  return (
    <div className="et-shell vlb-shell">
      <div className="et-hero pf-hero pf-hero-teal" data-mascot="none">
        <div className="pf-hero-body">
          <h1>BXH <span className="pf-tag">Vocab</span></h1>
          <p className="pf-hero-sub">Bảng xếp hạng chuỗi ngày học và điểm Quiz từ vựng. Bấm vào tên một bạn để xem hồ sơ hoặc nhắn tin.</p>
        </div>
        <div className="vlb-hero-icon" aria-hidden="true"><i className="fas fa-ranking-star" /></div>
      </div>

      {shop && <ShopStrip shop={shop} />}
      <div className="vlb-lulu" id="vlb-lulu" ref={luluHost} />

      {(streak.me || quiz.me) && (
        <div className="vlb-me" id="vlb-me">
          <MeTile kind="streak" icon="fa-fire" label="Chuỗi học của bạn" standing={streak.me} sub={streak.me ? streakSub(streak.me) : ''}
            to="/dashboard" linkIcon="fa-book-open" linkText="Học ngay" />
          <MeTile kind="quiz" icon="fa-stopwatch" label="Quiz của bạn" standing={quiz.me} sub={quiz.me ? quizSub(quiz.me) : ''}
            to="/dashboard/topics" linkIcon="fa-play" linkText="Làm Quiz" />
        </div>
      )}

      <div className="vlb-grid">
        <div className="dan-leaderboard-card" id="dan-leaderboard-card">
          <div className="dan-lb-title"><i className="fas fa-trophy" /> Top 10 chuỗi học dài nhất</div>
          <p className="vlb-board-sub">Số 🔥 của chuỗi học — mỗi ngày học ít nhất 1 bài để giữ chuỗi. 👻 = đang mặc Áo Tàng Hình.</p>
          <BoardList id="dan-lb-list" kind="streak" board={streak} loadingMore={!!more.streak} onMore={showMore}
            emptyMsg="Chưa có ai đang giữ streak — hãy là người đầu tiên! 🔥"
            renderRow={(r, rank) => <Row key={r._id} rank={rank} userId={r._id} name={r.name} avatar={r.avatar} value={streakValue(r)} decor={r} ctx={ctx} />}
            pinned={streak.me ? myRow(streak.me, streak.rows.length, streakValue(streak.me)) : null} />
        </div>

        <div className="dan-leaderboard-card quiz-leaderboard-card" id="quiz-leaderboard-card">
          <div className="dan-lb-title"><i className="fas fa-stopwatch" /> Top 10 Quiz điểm cao</div>
          <p className="vlb-board-sub">Điểm TB Quiz từ vựng (từ 5 câu) — bằng điểm thì ai nhanh hơn xếp trên.</p>
          <BoardList id="quiz-lb-list" kind="quiz" board={quiz} loadingMore={!!more.quiz} onMore={showMore}
            emptyMsg="Chưa có ai làm Quiz đủ điều kiện xếp hạng — hãy là người đầu tiên! ⏱"
            renderRow={(r, rank) => <Row key={r.userId} rank={rank} userId={r.userId} name={r.name} avatar={r.avatar} value={quizValue(r)} decor={r} ctx={ctx} />}
            pinned={quiz.me ? myRow(quiz.me, quiz.rows.length, quizValue(quiz.me)) : null} />
        </div>
      </div>
    </div>
  );
}
