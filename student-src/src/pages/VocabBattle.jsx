import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { battleApi, fmtLeft, GAMES, gameLine, gameOf, KIND_EMOJI, KIND_LABEL, outcome, stakeLine } from '../utils/vocabBattle';
import { siteToast } from '../utils/shell';
import CreateModal from './vocabBattle/CreateModal';
import Room from './vocabBattle/Room';
import Avatar from './vocabBattle/Avatar';
import Ranking from './vocabBattle/Ranking';

// ⚔️ Đấu trường từ vựng — /app/vocab-battle (under "BXH vocab").
// The student picks a game (Tổng hợp, Đồng nghĩa from Học Paraphrase, Trái
// nghĩa, Nghĩa của từ, Nối từ, Ghép câu, Nghe & điền, Nghe & gõ, Nhìn hình,
// Nối chữ) and either invites 1–3 friends (the winner gets 🔥) or plays
// alone for a personal best (Nối chữ alone = vs Lulu 🤖).
// Tabs (?tab=): games (default) · rank (🏆 BXH Đấu trường, Ranking.jsx) · history.
// /app/vocab-battle/:id is one room. Backend: services/vocabBattleService.js.

export default function VocabBattle() {
  const { id } = useParams();
  return id ? <Room key={id} id={id} /> : <Hub />;
}

const TABS = [
  { key: 'games', label: '🎲 Trò chơi' },
  { key: 'rank', label: '🏆 Bảng xếp hạng' },
  { key: 'history', label: '🏁 Lịch sử' },
];
const HISTORY_STEP = 10;

function Hub() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'games';
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [creating, setCreating] = useState(null); // { game, solo }
  const [target, setTarget] = useState(null);     // picked on the BXH: { id, name, avatar }
  const [busy, setBusy] = useState('');

  const load = useCallback(() => battleApi('GET', '').then((d) => {
    if (d.success) { setData(d); setFailed(false); } else setFailed(true);
  }), []);
  // 10 s while a Nối chữ lobby / invite (5-minute rooms) is on the list, else 20 s;
  // straight away when the tab is shown again
  const quick = !!data?.battles?.some((b) => b.kind === 'chain' && b.status === 'open');
  useEffect(() => {
    load();
    const t = setInterval(() => { if (!document.hidden) load(); }, quick ? 10000 : 20000);
    const onShow = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', onShow);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onShow); };
  }, [load, quick]);

  function setTab(key) {
    const next = new URLSearchParams(params);
    if (key === 'games') next.delete('tab'); else next.set('tab', key);
    setParams(next, { replace: true });
  }

  // ⚔️ on a BXH row: back to the games with that student pre-picked
  function challenge(user) {
    setTarget({ id: user.id, name: user.name, avatar: user.avatar || '' });
    setTab('games');
    setTimeout(() => document.querySelector('.vb-target')?.scrollIntoView?.({ behavior: 'smooth', block: 'center' }), 60);
  }

  async function respond(b, accept) {
    setBusy(b.id);
    const d = await battleApi('POST', `/${b.id}/${accept ? 'accept' : 'decline'}`);
    setBusy('');
    if (!d.success) { siteToast(d.message || 'Không thực hiện được', 'error'); load(); return; }
    if (accept) navigate(`/vocab-battle/${b.id}`);
    else load();
  }

  if (failed && !data) {
    return (
      <div className="vb-page"><div className="vb-empty">Không tải được Đấu trường. <button className="vb-link" onClick={load}>Thử lại</button></div></div>
    );
  }
  const battles = data?.battles || [];
  const invites = battles.filter((b) => b.status === 'open' && b.me?.state === 'invited');
  const live = battles.filter((b) => (b.status === 'open' || b.status === 'playing') && b.me?.state === 'joined');
  const past = battles.filter((b) => b.status === 'done' || b.status === 'cancelled');
  // Admin → ⚔️ Đấu trường → Cài đặt can close it (no new rooms; running ones finish)
  const closed = !!data && data.rules.enabled === false;
  const stats = data?.stats;

  return (
    <div className="vb-page">
      <header className="vb-hero">
        <div className="vb-hero-text">
          <h1 className="pf-head">⚔️ Đấu trường từ vựng</h1>
          <p>Chọn một trò chơi rồi thách bạn bè (1 vs 1 hoặc tới 4 người), hoặc chơi một mình để phá kỷ lục của chính bạn!</p>
        </div>
        <div className="vb-hero-side">
          <div className="vb-wallet" title="Ví lửa">🔥 <b>{data ? data.wallet : '…'}</b></div>
          {stats && (
            <button className="vb-hero-stats" onClick={() => setTab('rank')} title="Xem bảng xếp hạng">
              <span><b>{stats.wins}</b>thắng · 7 ngày</span>
              <span><b>{stats.rank ? `#${stats.rank}` : '—'}</b>hạng tuần</span>
              {stats.streak >= 2 && <span className="hot"><b>🔥 {stats.streak}</b>chuỗi thắng</span>}
            </button>
          )}
        </div>
      </header>

      {invites.length > 0 && (
        <section className="vb-section">
          <h2 className="vb-h2">📨 Lời mời thách đấu <span className="vb-count">{invites.length}</span></h2>
          <div className="vb-list">
            {invites.map((b) => {
              const host = b.players.find((p) => p.id === b.hostId);
              const g = gameOf(b);
              const short = b.stake > 0 && data.wallet < b.stake;
              return (
                <div key={b.id} className="vb-card vb-card--invite">
                  <Avatar p={host} />
                  <div className="vb-card-main">
                    <div className="vb-card-title"><b>{host?.name}</b> thách bạn chơi {g.emoji} {g.name}</div>
                    <div className="vb-card-sub">{gameLine(b, data.rules)} · {stakeLine(b)} · {b.players.length} người · {fmtLeft(b.expiresAt)}</div>
                    {short && <div className="vb-form-err">Ví lửa của bạn ({data.wallet} 🔥) chưa đủ để cược trận này.</div>}
                  </div>
                  <div className="vb-card-act">
                    <button className="vb-btn vb-btn--primary" disabled={busy === b.id || short} onClick={() => respond(b, true)}>
                      Nhận lời{b.stake ? ` (${b.stake} 🔥)` : ''}
                    </button>
                    <button className="vb-btn vb-btn--ghost" disabled={busy === b.id} onClick={() => respond(b, false)}>Từ chối</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {live.length > 0 && (
        <section className="vb-section">
          <h2 className="vb-h2">🎮 Đang chơi</h2>
          <div className="vb-list">
            {live.map((b) => <BattleRow key={b.id} b={b} rules={data.rules} />)}
          </div>
        </section>
      )}

      <nav className="vb-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
            {t.label}{t.key === 'history' && past.length > 0 && <span className="vb-count">{past.length}</span>}
          </button>
        ))}
      </nav>

      {tab === 'games' && (
        <section className="vb-section vb-section--tab">
          {target && (
            <div className="vb-target">
              <Avatar p={target} small />
              <span>Chọn một trò để thách đấu <b>{target.name}</b> ⚔️</span>
              <button className="vb-link" onClick={() => setTarget(null)} aria-label="Bỏ chọn">✕</button>
            </div>
          )}
          {closed && (
            <div className="vb-closed" role="status">⛔ Đấu trường đang tạm đóng — chưa tạo được trận mới. Các trận đang dở vẫn chơi tiếp được nhé!</div>
          )}
          <div className="vb-games">
            {GAMES.filter((g) => !data || !g.types || g.types.some((t) => data.rules.types.some((x) => x.key === t))).map((g) => {
              const best = data?.bests?.[g.key];
              return (
                <div key={g.key} className={`vb-game vb-game--${g.key}`}>
                  <div className="vb-game-top">
                    <span className="vb-game-emoji" aria-hidden="true">{g.emoji}</span>
                    <div>
                      <div className="vb-game-name">{g.name}</div>
                      {best > 0 && <div className="vb-game-best">🏅 Kỷ lục: {best}</div>}
                    </div>
                  </div>
                  <p className="vb-game-desc">{g.desc}</p>
                  <div className="vb-game-act">
                    <button className="vb-btn vb-btn--primary" disabled={!data || closed} onClick={() => setCreating({ game: g, solo: false })}>
                      ⚔️ {target ? `Thách ${target.name.split(' ').slice(-1)[0]}` : 'Mời bạn'}
                    </button>
                    <button className="vb-btn vb-btn--ghost" disabled={!data || closed} onClick={() => setCreating({ game: g, solo: true })}>🎯 Chơi một mình</button>
                  </div>
                </div>
              );
            })}
          </div>
          {data && <Rules rules={data.rules} />}
        </section>
      )}

      {tab === 'rank' && (
        <section className="vb-section vb-section--tab">
          <Ranking onChallenge={challenge} />
        </section>
      )}

      {tab === 'history' && (
        <section className="vb-section vb-section--tab">
          <History past={past} rules={data?.rules} loaded={!!data} />
        </section>
      )}

      {creating && data && (
        <CreateModal
          game={creating.game}
          solo={creating.solo}
          rules={data.rules}
          wallet={data.wallet}
          initialPicked={!creating.solo && target ? [target] : []}
          onClose={() => setCreating(null)}
          onCreated={(b) => { setCreating(null); setTarget(null); navigate(`/vocab-battle/${b.id}`); }}
        />
      )}
    </div>
  );
}

// 🏁 Lịch sử: finished rooms (2 tuần), filtered, a page at a time
function History({ past, rules, loaded }) {
  const [filter, setFilter] = useState('all');
  const [shown, setShown] = useState(HISTORY_STEP);
  if (!loaded) return <div className="vb-skel" aria-busy="true" />;
  const list = past.filter((b) => filter === 'all' || (filter === 'solo' ? b.solo : !b.solo));
  const pvp = past.filter((b) => !b.solo && b.status === 'done');
  const wins = pvp.filter((b) => b.winnerIds.includes(b.players.find((p) => p.me)?.id)).length;
  return (
    <>
      <div className="vb-hist-head">
        <div className="vb-seg">
          {[['all', 'Tất cả'], ['pvp', '⚔️ Thách đấu'], ['solo', '🎯 Một mình']].map(([k, label]) => (
            <button key={k} className={filter === k ? 'on' : ''} onClick={() => { setFilter(k); setShown(HISTORY_STEP); }}>{label}</button>
          ))}
        </div>
        {pvp.length > 0 && <span className="vb-muted">2 tuần qua: thắng <b>{wins}</b>/{pvp.length} trận thách đấu</span>}
      </div>
      {!list.length ? (
        <div className="vb-empty"><div className="vb-empty-emoji">🏁</div>Chưa có trận nào trong 2 tuần qua.</div>
      ) : (
        <div className="vb-list">
          {list.slice(0, shown).map((b) => <BattleRow key={b.id} b={b} rules={rules} />)}
        </div>
      )}
      {list.length > shown && (
        <div className="vb-more">
          <button className="vb-btn vb-btn--ghost" onClick={() => setShown((n) => n + HISTORY_STEP)}>Xem thêm ({list.length - shown})</button>
        </div>
      )}
    </>
  );
}

function BattleRow({ b, rules }) {
  const out = outcome(b);
  const g = gameOf(b);
  const others = b.players.filter((p) => !p.me && p.state !== 'declined');
  const me = b.players.find((p) => p.me);
  let state = '';
  if (b.status === 'playing') state = '🔴 Đang chơi';
  else if (b.status === 'open' && b.kind === 'chain') state = '⏳ Phòng chờ';
  else if (b.status === 'open') state = me?.finished ? '⏳ Đợi các bạn khác' : `▶️ Làm tiếp (${me?.idx || 0}/${b.total})`;
  const who = b.solo ? (b.kind === 'chain' ? 'vs Lulu 🤖' : 'một mình') : `với ${others.map((p) => p.name).join(', ') || '—'}`;
  return (
    <Link to={`/vocab-battle/${b.id}`} className="vb-card vb-card--link">
      <div className="vb-avatars">
        {b.solo && b.kind === 'quiz' ? <span className="vb-ava vb-ava--sm">🎯</span>
          : others.slice(0, 3).map((p) => <Avatar key={p.id} p={p} small />)}
      </div>
      <div className="vb-card-main">
        <div className="vb-card-title">{g.emoji} {b.kind === 'chain' ? KIND_LABEL.chain : g.name} {who}</div>
        <div className="vb-card-sub">{gameLine(b, rules)} · {stakeLine(b)}{b.endedAt && (b.status === 'done' || b.status === 'cancelled') ? ` · ${ago(b.endedAt)}` : ''}</div>
      </div>
      <div className="vb-card-act">
        {out ? <span className={`vb-out ${out.cls}`}>{out.text}</span> : <span className="vb-state">{state}</span>}
      </div>
    </Link>
  );
}

function ago(iso) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
  if (min < 60) return `${Math.max(1, min)} phút trước`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.round(h / 24)} ngày trước`;
}

function Rules({ rules: r }) {
  return (
    <details className="vb-rules">
      <summary>📜 Luật chơi &amp; thưởng 🔥</summary>
      <ul>
        <li><b>Mời bạn ({KIND_EMOJI.quiz} các trò câu hỏi):</b> mọi người làm <b>cùng một bộ câu</b>. Trả lời đúng được 100 điểm, càng nhanh càng được thưởng thêm (tối đa +50). Không cần online cùng lúc: các bạn có <b>{r.inviteHours} giờ</b> để nhận lời và làm bài.</li>
        <li><b>{KIND_EMOJI.chain} Nối chữ:</b> chủ phòng bấm bắt đầu khi mọi người đã vào. Phòng chờ chỉ mở <b>{r.lobbyMinutes || 5} phút</b>: chưa bắt đầu thì tự hủy (🔥 cược trả lại). Ai vào phòng khác sẽ tự rời phòng chờ này và cả phòng được báo. Mỗi lượt có vài giây để gõ một từ tiếng Anh (ít nhất {r.chainMinLen} chữ cái) bắt đầu bằng <b>chữ cuối</b> của từ trước, không được trùng từ đã dùng. Hết giờ thì mất 1 ❤️. Từ đã học trên web được +{r.chainBankBonus} điểm ⭐.</li>
        <li><b>Có cược:</b> ai vào trận cũng đặt số 🔥 như nhau, người thắng ẵm cả pot (hòa thì chia đều, cả trận hòa thì trả lại).</li>
        <li><b>Giao hữu (0 🔥):</b> người thắng được +{r.friendlyWin} 🔥, tối đa {r.friendlyDaily} trận được thưởng mỗi ngày, và chỉ khi mọi người đều chơi thật.</li>
        <li><b>🎯 Chơi một mình:</b> luyện tập, không cược và không nhận 🔥, nhưng điểm cao nhất được lưu thành <b>kỷ lục</b> của từng trò. Nối chữ một mình là đấu với Lulu 🤖.</li>
        <li><b>🏆 Bảng xếp hạng:</b> &quot;Vua thách đấu&quot; xếp theo số trận thắng (chỉ tính trận mà mọi người đều chơi thật, tối đa 3 trận thắng mỗi ngày với cùng đối thủ). &quot;Kỷ lục một mình&quot; xếp theo điểm cao nhất của từng trò.</li>
        <li>Chơi xong, xem lại đáp án và <b>lưu từ làm sai vào Sổ tay</b> để ôn.</li>
      </ul>
    </details>
  );
}
