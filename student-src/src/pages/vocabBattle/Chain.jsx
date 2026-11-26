import { useEffect, useRef, useState } from 'react';
import { battleApi, battleFocus, shortName } from '../../utils/vocabBattle';
import { playSound } from '../../utils/vocab';
import Avatar from './Avatar';

// 🔗 Nối chữ: lobby (host starts), then turns. The server decides
// timeouts; the countdown here is the room's deadline on the server clock.
export default function Chain({ b, id, offset, busy, onAct, onBattle }) {
  const me = b.players.find((p) => p.me);
  const players = b.players.filter((p) => p.state === 'joined' || (b.status !== 'open' && p.state !== 'declined' && p.state !== 'invited'));

  if (b.status === 'open') {
    const ready = b.players.filter((p) => p.state === 'joined').length;
    return (
      <div className="vb-panel vb-lobby">
        <h3 className="pf-head">Phòng chờ</h3>
        <div className="vb-lobby-list">
          {b.players.filter((p) => p.state !== 'declined' && p.state !== 'left').map((p) => (
            <div key={p.id} className="vb-lobby-p">
              <Avatar p={p} online={p.online} />
              <div>{p.name}{p.me && ' (bạn)'}</div>
              <span className={`vb-tag${p.state === 'joined' ? ' vb-tag--ok' : ''}`}>
                {p.state === 'joined' ? (p.online ? 'đã vào · online' : 'đã vào') : 'đang chờ nhận lời'}
              </span>
            </div>
          ))}
        </div>
        {me?.state === 'invited' && (
          <div className="vb-row">
            <button className="vb-btn vb-btn--primary" disabled={busy} onClick={() => onAct('accept')}>Vào phòng{b.stake ? ` (${b.stake} 🔥)` : ''}</button>
            <button className="vb-btn vb-btn--ghost" disabled={busy} onClick={() => onAct('decline')}>Từ chối</button>
          </div>
        )}
        {b.isHost && (
          <>
            <p className="vb-muted">Khi các bạn đã vào và đang online, bấm bắt đầu. Ai chưa nhận lời sẽ không được chơi trận này.</p>
            <div className="vb-row">
              <button className="vb-btn vb-btn--primary vb-btn--big" disabled={busy || ready < 2} onClick={() => onAct('start')}>
                🚀 Bắt đầu ({ready} người)
              </button>
              <button className="vb-btn vb-btn--ghost" disabled={busy} onClick={() => onAct('cancel', 'Hủy phòng này? 🔥 cược sẽ được trả lại.')}>Hủy phòng</button>
            </div>
          </>
        )}
        {!b.isHost && me?.state === 'joined' && (
          <div className="vb-row">
            <span className="vb-muted">⏳ Đợi chủ phòng bắt đầu… giữ trang này mở nhé.</span>
            <button className="vb-btn vb-btn--ghost" disabled={busy} onClick={() => onAct('leave', 'Rời phòng? 🔥 cược sẽ được trả lại.')}>Rời phòng</button>
          </div>
        )}
      </div>
    );
  }

  return <ChainGame b={b} id={id} offset={offset} players={players} onBattle={onBattle} />;
}

function ChainGame({ b, id, offset, players, onBattle }) {
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const input = useRef(null);
  const list = useRef(null);
  const c = b.chain;
  const myTurn = b.status === 'playing' && c.turnId && b.players.find((p) => p.me)?.id === c.turnId;
  const turnP = b.players.find((p) => p.id === c.turnId);
  const total = b.config.turnSeconds * 1000;
  const left = c.deadline ? Math.max(0, new Date(c.deadline).getTime() - (now + offset)) : 0;
  const words = c.words.filter((w) => w.w || w.timeout);
  const lastWord = [...c.words].reverse().find((w) => w.w);

  useEffect(() => {
    if (b.status !== 'playing') return undefined;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [b.status]);
  useEffect(() => { if (myTurn) input.current?.focus(); }, [myTurn, c.letter]);
  const playing = b.status === 'playing';
  useEffect(() => (playing ? battleFocus(() => true) : undefined), [playing]);
  useEffect(() => { list.current?.scrollTo?.({ left: 99999, behavior: 'smooth' }); }, [words.length]);

  async function send(e) {
    e.preventDefault();
    const w = text.trim().toLowerCase();
    if (!w || sending) return;
    setSending(true);
    const d = await battleApi('POST', `/${id}/word`, { word: w });
    setSending(false);
    if (d.battle) onBattle(d.battle);
    if (!d.success) { setErr(d.message || 'Từ không hợp lệ'); playSound('wrong'); return; }
    playSound('correct');
    setText('');
    setErr('');
  }

  return (
    <div className="vb-chain">
      <div className="vb-chain-players">
        {players.map((p) => (
          <div key={p.id} className={`vb-chain-p${p.id === c.turnId ? ' turn' : ''}${p.out ? ' out' : ''}${b.winnerIds.includes(p.id) ? ' win' : ''}`}>
            <Avatar p={p} small online={p.online} />
            <div className="vb-chain-pname">{b.winnerIds.includes(p.id) && '👑 '}{p.name}{p.me && ' (bạn)'}</div>
            <div className="vb-chain-lives">{p.out ? '💀' : '❤️'.repeat(p.lives) + '🤍'.repeat(Math.max(0, b.config.lives - p.lives))}</div>
            <div className="vb-chain-score">{p.score}</div>
          </div>
        ))}
      </div>

      <div className="vb-chain-words" ref={list}>
        {words.map((w, i) => {
          const by = b.players.find((p) => p.id === w.by);
          if (w.timeout) return <span key={i} className="vb-cw timeout" title={`${by?.name} hết giờ`}>⏰ {by?.name}</span>;
          return (
            <span key={i} className={`vb-cw${w.by ? '' : ' start'}${w.bank ? ' bank' : ''}`}
              title={`${by ? `${by.name} +${w.pts}` : 'Từ mở đầu'}${w.vi ? ` · ${w.vi}` : ''}`}>
              {w.w}{w.bank && ' ⭐'}
              {by && <small>{shortName(by)}</small>}
            </span>
          );
        })}
      </div>

      {b.status === 'playing' && (
        <div className={`vb-chain-stage${myTurn ? ' mine' : ''}`}>
          <div className="vb-chain-letter">
            <small>{lastWord?.w ? `${lastWord.w} →` : 'Bắt đầu bằng'}</small>
            <b>{c.letter.toUpperCase()}</b>
          </div>
          {lastWord?.vi && <div className="vb-chain-vi">📖 {lastWord.w}: {lastWord.vi}</div>}
          <div className={`vb-timer${left < 4000 ? ' low' : ''}`}><i style={{ width: `${Math.min(100, (left / total) * 100)}%` }} /></div>
          <div className="vb-chain-turn">
            {myTurn ? `Lượt của bạn! Còn ${Math.ceil(left / 1000)}s` : `Lượt của ${turnP?.name || '…'} · ${Math.ceil(left / 1000)}s`}
          </div>
          {myTurn && (
            <form className="vb-typed" onSubmit={send}>
              <input ref={input} className="vb-input vb-input--big" value={text}
                onChange={(e) => { setText(e.target.value.replace(/[^A-Za-z-]/g, '')); setErr(''); }}
                placeholder={`Một từ bắt đầu bằng "${c.letter}"…`} autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={30} />
              <button className="vb-btn vb-btn--primary" disabled={sending || !text.trim()}>Gửi</button>
            </form>
          )}
          {err && <div className="vb-form-err">{err}</div>}
        </div>
      )}
    </div>
  );
}
