import Avatar from './Avatar';

// Live scoreboard (quiz): progress bar + score per player
export default function Board({ b }) {
  const rows = b.players.filter((p) => p.state !== 'declined' && p.state !== 'left')
    .slice().sort((x, y) => (b.status === 'done' ? x.rank - y.rank : y.score - x.score));
  return (
    <div className="vb-board">
      {rows.map((p) => {
        const pct = b.total ? Math.round(((p.finished ? b.total : p.idx) / b.total) * 100) : 0;
        const win = b.winnerIds.includes(p.id);
        return (
          <div key={p.id} className={`vb-board-row${p.me ? ' me' : ''}${win ? ' win' : ''}`}>
            <Avatar p={p} small online={p.online} />
            <div className="vb-board-main">
              <div className="vb-board-name">
                {win && '👑 '}{p.name}{p.me && ' (bạn)'}
                {p.state === 'invited' && <span className="vb-tag">chưa nhận lời</span>}
                {p.finished && b.status !== 'done' && <span className="vb-tag vb-tag--ok">xong</span>}
              </div>
              <div className="vb-bar"><i style={{ width: `${pct}%` }} /></div>
            </div>
            <div className="vb-board-score">{p.score}</div>
          </div>
        );
      })}
    </div>
  );
}
