import { useEffect, useRef, useState } from 'react';
import { battleApi, GAMES, PERIODS } from '../../utils/vocabBattle';
import Avatar from './Avatar';

// 🏆 BXH Đấu trường (services/vocabBattleLeaderboard.js):
//   ⚔️ Thách đấu — most wins in trận thách đấu (only rooms everyone really
//                  played; a few wins a day per opponent at most)
//   🎯 Kỷ lục    — best Chơi một mình score per game
// + "Kỳ phùng địch thủ": the viewer's head-to-head record.
// `onChallenge(user)` opens the game list with that student pre-picked.
const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const SOLO_GAMES = GAMES;

export default function Ranking({ onChallenge }) {
  const [board, setBoard] = useState('pvp');
  const [period, setPeriod] = useState('week');
  const [scope, setScope] = useState('all');
  const [game, setGame] = useState('mix');
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    const n = ++seq.current;
    const qs = new URLSearchParams({ board, period, scope, game }).toString();
    battleApi('GET', `/leaderboard?${qs}`).then((d) => {
      if (n !== seq.current) return;
      setFailed(!d.success);
      if (d.success) setData(d);
    });
  }, [board, period, scope, game]);

  const loading = !data || data.board !== board || data.period !== period || data.scope !== scope || (board === 'solo' && data.game !== game);
  const rows = data?.rows || [];
  const podium = rows.length >= 3 ? rows.slice(0, 3) : [];
  const rest = podium.length ? rows.slice(3) : rows;
  const meOff = data?.me && !rows.some((r) => r.me);
  const gameInfo = SOLO_GAMES.find((g) => g.key === game);

  return (
    <div className="vb-rank">
      <div className="vb-rank-tabs" role="tablist">
        <button role="tab" aria-selected={board === 'pvp'} className={board === 'pvp' ? 'on' : ''} onClick={() => setBoard('pvp')}>⚔️ Vua thách đấu</button>
        <button role="tab" aria-selected={board === 'solo'} className={board === 'solo' ? 'on' : ''} onClick={() => setBoard('solo')}>🎯 Kỷ lục một mình</button>
      </div>

      <div className="vb-rank-filters">
        <div className="vb-seg">
          {PERIODS.map((p) => <button key={p.key} className={period === p.key ? 'on' : ''} onClick={() => setPeriod(p.key)}>{p.label}</button>)}
        </div>
        <div className="vb-seg">
          <button className={scope === 'all' ? 'on' : ''} onClick={() => setScope('all')}>🌏 Cả web</button>
          <button className={scope === 'class' ? 'on' : ''} onClick={() => setScope('class')} disabled={data && !data.className}
            title={data && !data.className ? 'Bạn chưa có lớp' : undefined}>
            🏫 {data?.className ? `Lớp ${data.className}` : 'Lớp mình'}
          </button>
        </div>
      </div>

      {board === 'solo' && (
        <div className="vb-rank-games">
          {SOLO_GAMES.map((g) => (
            <button key={g.key} className={`vb-chip${game === g.key ? ' vb-chip--on' : ''}`} onClick={() => setGame(g.key)}>
              {g.emoji} {g.name}
            </button>
          ))}
        </div>
      )}

      {failed && <div className="vb-empty">Không tải được bảng xếp hạng.</div>}
      {!failed && loading && <div className="vb-skel" aria-busy="true" />}
      {!failed && !loading && !rows.length && (
        <div className="vb-empty">
          <div className="vb-empty-emoji">{board === 'pvp' ? '⚔️' : gameInfo?.emoji}</div>
          {board === 'pvp'
            ? <>Chưa có trận thách đấu nào được tính trong {PERIODS.find((p) => p.key === period).label} qua.<br />Thách bạn bè ngay để lên đầu bảng!</>
            : <>Chưa ai có kỷ lục {gameInfo?.name} trong {PERIODS.find((p) => p.key === period).label} qua.<br />Chơi một mình để ghi tên đầu tiên!</>}
        </div>
      )}

      {!failed && !loading && rows.length > 0 && (
        <>
          {podium.length > 0 && (
            <div className="vb-podium">
              {[podium[1], podium[0], podium[2]].map((r) => (
                <div key={r.id} className={`vb-pod vb-pod--${r.rank}${r.me ? ' me' : ''}`}>
                  <div className="vb-pod-medal">{MEDAL[r.rank] || r.rank}</div>
                  <button className="vb-pod-ava" onClick={() => !r.me && window.openPeerProfile?.(r.id)} aria-label={`Xem ${r.name}`}>
                    <Avatar p={r} />
                  </button>
                  <div className="vb-pod-name">{r.name}{r.me && ' (bạn)'}</div>
                  <div className="vb-pod-val">{board === 'pvp' ? `🏆 ${r.wins}` : `⭐ ${r.best}`}</div>
                  <div className="vb-pod-step" />
                </div>
              ))}
            </div>
          )}
          <div className="vb-rank-list">
            {rest.map((r) => <Row key={r.id} r={r} board={board} onChallenge={onChallenge} />)}
            {meOff && (
              <>
                <div className="vb-rank-gap">⋯</div>
                <Row r={data.me} board={board} onChallenge={onChallenge} />
              </>
            )}
          </div>
          {!data.me && (
            <p className="vb-muted vb-rank-note">
              {board === 'pvp' ? 'Bạn chưa có trận thách đấu nào được tính ở đây.' : `Bạn chưa chơi ${gameInfo?.name} một mình ở đây.`}
            </p>
          )}
        </>
      )}

      {board === 'pvp' && !loading && data?.rivals?.length > 0 && (
        <section className="vb-rivals">
          <h3 className="vb-h3">🤺 Kỳ phùng địch thủ của bạn <small>({PERIODS.find((p) => p.key === period).label})</small></h3>
          <div className="vb-rivals-list">
            {data.rivals.map((r) => {
              const ahead = r.w > r.l;
              const behind = r.l > r.w;
              return (
                <div key={r.id} className={`vb-rival${ahead ? ' ahead' : behind ? ' behind' : ''}`}>
                  <Avatar p={r} small />
                  <div className="vb-rival-main">
                    <div className="vb-rival-name">{r.name}</div>
                    <div className="vb-rival-rec">
                      <b className="w">{r.w} thắng</b> · <b className="l">{r.l} thua</b>{r.t ? ` · ${r.t} hòa` : ''}
                    </div>
                  </div>
                  <button className="vb-btn vb-btn--ghost vb-btn--sm" onClick={() => onChallenge(r)}>
                    {behind ? '🔥 Phục thù' : '⚔️ Đấu tiếp'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <p className="vb-muted vb-rank-note">
        {board === 'pvp'
          ? `Xếp theo số trận thắng, rồi tỉ lệ thắng. Chỉ tính trận mà mọi người đều chơi thật, và tối đa ${data?.winCap || 3} trận thắng mỗi ngày với cùng đối thủ.`
          : 'Điểm cao nhất của mỗi bạn khi chơi một mình trò này. Trả lời đúng và nhanh để được nhiều điểm.'}
      </p>
    </div>
  );
}

function Row({ r, board, onChallenge }) {
  return (
    <div className={`vb-rank-row${r.me ? ' me' : ''}`}>
      <span className={`vb-rank-no${r.rank <= 3 ? ' top' : ''}`}>{MEDAL[r.rank] || r.rank}</span>
      <button className="vb-rank-who" onClick={() => !r.me && window.openPeerProfile?.(r.id)} disabled={r.me}>
        <Avatar p={r} small />
        <span className="vb-rank-name">
          {r.name}{r.me && ' (bạn)'}
          {r.classmate && !r.me && <span className="vb-tag">cùng lớp</span>}
          <small>
            {board === 'pvp'
              ? <>{r.played} trận · thắng {r.winRate}%{r.streak >= 2 ? <> · <span className="vb-streak">🔥 chuỗi {r.streak}</span></> : ''}</>
              : <>{r.plays} lượt chơi</>}
          </small>
        </span>
      </button>
      <span className="vb-rank-val">{board === 'pvp' ? <>🏆 {r.wins}</> : <>⭐ {r.best}</>}</span>
      {r.me ? <span className="vb-rank-duel vb-rank-duel--none" aria-hidden="true" /> : (
        <button className="vb-rank-duel" onClick={() => onChallenge(r)} title={`Thách đấu ${r.name}`} aria-label={`Thách đấu ${r.name}`}>⚔️</button>
      )}
    </div>
  );
}
