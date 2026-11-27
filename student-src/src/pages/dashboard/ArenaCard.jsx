import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { battleApi, GAMES, gameOf, initials, KIND_LABEL, outcome } from '../../utils/vocabBattle';

// ⚔️ "Đấu trường từ vựng" card in the home vocab hero (under the streak +
// Học vocab theo topic cards). Shows the arena's 3 tabs at a glance —
// 🎲 Trò chơi · 🏆 BXH tuần · 🏁 Lịch sử — each linking to /vocab-battle?tab=…
// Data: GET /vocab-battle (wallet, stats, battles) + the weekly ⚔️ board.
// vocab-battle.css is page-scoped (PageCss), so styles live in dashboard.css
// (.dash-arena-*).

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const SHOWN_GAMES = 6;

function Ava({ p }) {
  return (
    <span className="dash-arena-ava" aria-hidden="true">
      {p?.avatar ? <img src={p.avatar} alt="" loading="lazy" /> : initials(p?.name)}
    </span>
  );
}

export default function ArenaCard() {
  const [data, setData] = useState(null);
  const [board, setBoard] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    battleApi('GET', '').then((d) => { if (alive) { if (d.success) setData(d); else setFailed(true); } });
    battleApi('GET', '/leaderboard?board=pvp&period=week&scope=all&game=mix')
      .then((d) => { if (alive) setBoard(d.success ? d : { rows: [] }); });
    return () => { alive = false; };
  }, []);

  const battles = data?.battles || [];
  const invites = battles.filter((b) => b.status === 'open' && b.me?.state === 'invited').length;
  const live = battles.filter((b) => (b.status === 'open' || b.status === 'playing') && b.me?.state === 'joined').length;
  const past = battles.filter((b) => b.status === 'done' || b.status === 'cancelled').slice(0, 3);
  const games = GAMES.filter((g) => !data || !g.types || g.types.some((t) => data.rules.types.some((x) => x.key === t)));
  const closed = !!data && data.rules.enabled === false;
  const stats = data?.stats;
  const top = (board?.rows || []).slice(0, 3);
  const meOff = board?.me && !top.some((r) => r.me) ? board.me : null;

  return (
    <div className="dash-arena-card">
      <div className="dash-arena-head">
        <div className="dash-arena-title">
          <span className="dash-arena-emoji" aria-hidden="true">⚔️</span>
          <div>
            <div className="dash-arena-name">Đấu trường từ vựng</div>
            <div className="dash-arena-sub">Thách bạn bè hoặc chơi một mình để phá kỷ lục</div>
          </div>
        </div>
        <div className="dash-arena-head-side">
          {data && <span className="dash-arena-wallet" title="Ví lửa">🔥 <b>{data.wallet}</b></span>}
          {invites > 0 && <Link className="dash-arena-alert" to="/vocab-battle">📨 {invites} lời mời</Link>}
          {live > 0 && <Link className="dash-arena-alert dash-arena-alert--live" to="/vocab-battle">🎮 {live} trận đang chơi</Link>}
          <Link className="btn btn-primary dash-arena-go" to="/vocab-battle">Vào Đấu trường</Link>
        </div>
      </div>

      {closed && <div className="dash-arena-closed">⛔ Đấu trường đang tạm đóng — chưa tạo được trận mới.</div>}

      <div className="dash-arena-cols">
        <section className="dash-arena-col">
          <Link className="dash-arena-col-h" to="/vocab-battle">🎲 Trò chơi <i className="fas fa-chevron-right" /></Link>
          <div className="dash-arena-games">
            {games.slice(0, SHOWN_GAMES).map((g) => (
              <Link key={g.key} className="dash-arena-game" to="/vocab-battle" title={g.desc}>
                <span aria-hidden="true">{g.emoji}</span> {g.name}
                {data?.bests?.[g.key] > 0 && <small>🏅 {data.bests[g.key]}</small>}
              </Link>
            ))}
            {games.length > SHOWN_GAMES && (
              <Link className="dash-arena-game dash-arena-game--more" to="/vocab-battle">+{games.length - SHOWN_GAMES} trò khác</Link>
            )}
          </div>
        </section>

        <section className="dash-arena-col">
          <Link className="dash-arena-col-h" to="/vocab-battle?tab=rank">🏆 BXH tuần <i className="fas fa-chevron-right" /></Link>
          {!board ? <div className="dash-arena-skel" aria-busy="true" />
            : !top.length ? <div className="dash-arena-empty">Chưa có trận thách đấu nào tuần này — thách bạn bè để lên đầu bảng!</div>
              : (
                <ol className="dash-arena-rank">
                  {top.map((r) => (
                    <li key={r.id} className={r.me ? 'me' : ''}>
                      <span className="dash-arena-medal">{MEDAL[r.rank] || r.rank}</span>
                      <Ava p={r} />
                      <span className="dash-arena-who">{r.name}{r.me && ' (bạn)'}</span>
                      <b>🏆 {r.wins}</b>
                    </li>
                  ))}
                  {meOff && (
                    <li className="me">
                      <span className="dash-arena-medal">{meOff.rank}</span>
                      <Ava p={meOff} />
                      <span className="dash-arena-who">Bạn</span>
                      <b>🏆 {meOff.wins}</b>
                    </li>
                  )}
                </ol>
              )}
          {stats && (
            <div className="dash-arena-mine">
              Bạn: <b>{stats.wins}</b> thắng · hạng <b>{stats.rank ? `#${stats.rank}` : '—'}</b>
              {stats.streak >= 2 && <> · <span className="hot">🔥 chuỗi {stats.streak}</span></>}
            </div>
          )}
        </section>

        <section className="dash-arena-col">
          <Link className="dash-arena-col-h" to="/vocab-battle?tab=history">🏁 Lịch sử <i className="fas fa-chevron-right" /></Link>
          {!data && !failed ? <div className="dash-arena-skel" aria-busy="true" />
            : !past.length ? <div className="dash-arena-empty">Chưa có trận nào trong 2 tuần qua. Chơi thử một trận nhé!</div>
              : (
                <ul className="dash-arena-hist">
                  {past.map((b) => {
                    const g = gameOf(b);
                    const out = outcome(b);
                    const others = b.players.filter((p) => !p.me && p.state !== 'declined');
                    const who = b.solo ? (b.kind === 'chain' ? 'vs Lulu 🤖' : 'một mình') : `với ${others.map((p) => p.name.split(' ').slice(-1)[0]).join(', ') || '—'}`;
                    return (
                      <li key={b.id}>
                        <Link to={`/vocab-battle/${b.id}`}>
                          <span className="dash-arena-hist-g">{g.emoji} {b.kind === 'chain' ? KIND_LABEL.chain : g.name} <small>{who}</small></span>
                          {out && <span className={`dash-arena-out ${out.cls}`}>{out.text}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
        </section>
      </div>
    </div>
  );
}
