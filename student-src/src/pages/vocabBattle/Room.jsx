import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { battleApi, fmtLeft, gameLine, gameOf, replayBody, stakeLine } from '../../utils/vocabBattle';
import { resultImage, siteConfirm, siteToast, spawnConfetti } from '../../utils/shell';
import Board from './Board';
import QuizRun from './QuizRun';
import Chain from './Chain';
import Review from './Review';

// One room: lobby / live scoreboard, the player's own run, the result.
// Polls the room (2s, 1s during Nối chữ; paused while the tab is hidden).
export default function Room({ id }) {
  const [b, setB] = useState(null);
  const [rules, setRules] = useState(null);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [offset, setOffset] = useState(0); // server clock − ours
  const [best, setBest] = useState(null); // solo: the personal best before this run
  const celebrated = useRef(false);
  const autoStarted = useRef(false);

  const take = useCallback((battle) => {
    if (!battle) return;
    setOffset(new Date(battle.serverNow).getTime() - Date.now());
    setB(battle);
    // Chơi một mình: straight into the questions
    const me = battle.players.find((p) => p.me);
    if (!autoStarted.current && battle.solo && battle.kind === 'quiz' && battle.status === 'open' && me && !me.finished) {
      autoStarted.current = true;
      setPlaying(true);
    }
  }, []);

  const load = useCallback(() => battleApi('GET', `/${id}`).then((d) => {
    if (d.success) {
      take(d.battle);
      setError('');
      if (d.rules) setRules((cur) => cur || d.rules);
      if (d.best !== undefined) setBest(d.best);
    } else if (d.code === 'gone') setError(d.message);
  }), [id, take]);

  useEffect(() => { load(); }, [load]);

  // A solo run that just ended: one more read for the personal best
  const soloDone = !!b && b.solo && b.status === 'done';
  useEffect(() => { if (soloDone && best === null) load(); }, [soloDone, best, load]);

  const live = b && (b.status === 'open' || b.status === 'playing');
  const fast = b && b.kind === 'chain' && b.status === 'playing';
  useEffect(() => {
    if (!live) return undefined;
    const t = setInterval(() => { if (!document.hidden) load(); }, fast ? 1000 : 2000);
    return () => clearInterval(t);
  }, [live, fast, load]);

  // Confetti once for a win
  useEffect(() => {
    if (!b || b.status !== 'done' || celebrated.current) return;
    celebrated.current = true;
    const me = b.players.find((p) => p.me);
    if (!me) return;
    if (b.solo) {
      if (best === null) { celebrated.current = false; return; } // wait for the best
      if (me.score > best || b.winnerIds.includes(me.id)) spawnConfetti(80);
    } else if (b.winnerIds.includes(me.id)) spawnConfetti(80);
  }, [b, best]);

  async function act(path, confirmMsg) {
    const go = async () => {
      setBusy(true);
      const d = await battleApi('POST', `/${id}/${path}`);
      setBusy(false);
      if (!d.success) { siteToast(d.message || 'Không thực hiện được', 'error'); load(); return; }
      take(d.battle);
    };
    if (confirmMsg) siteConfirm('Chắc chưa?', confirmMsg, 'Đồng ý', go);
    else go();
  }

  if (error) {
    return (
      <div className="vb-page">
        <div className="vb-empty">{error} <Link className="vb-link" to="/vocab-battle">← Về Đấu trường</Link></div>
      </div>
    );
  }
  if (!b) return <div className="vb-page"><div className="vb-skel" aria-busy="true" /></div>;

  const me = b.players.find((p) => p.me);
  const others = b.players.filter((p) => !p.me);
  // Stays up through the last answer's beat; QuizRun calls onExit when it's done
  const inRun = b.kind === 'quiz' && playing && me?.state === 'joined';

  return (
    <div className="vb-page">
      <div className="vb-room-top">
        <Link to="/vocab-battle" className="vb-link">← Đấu trường</Link>
        <div className="vb-room-title">
          <h1 className="pf-head">{gameOf(b).emoji} {gameOf(b).name}</h1>
          <div className="vb-card-sub">
            {gameLine(b, rules)} · {stakeLine(b)}{b.pot ? ` · Pot ${b.pot} 🔥` : ''}
            {b.status === 'open' && ` · ${fmtLeft(b.expiresAt, offset)}`}
          </div>
        </div>
      </div>

      {!inRun && b.kind === 'quiz' && !b.solo && <Board b={b} />}

      {b.kind === 'quiz' && b.status === 'open' && me?.state === 'invited' && (
        <div className="vb-panel">
          <p>Bạn được mời vào trận này{b.stake ? ` (cược ${b.stake} 🔥)` : ''}.</p>
          <div className="vb-row">
            <button className="vb-btn vb-btn--primary" disabled={busy} onClick={() => act('accept')}>Nhận lời</button>
            <button className="vb-btn vb-btn--ghost" disabled={busy} onClick={() => act('decline')}>Từ chối</button>
          </div>
        </div>
      )}

      {b.kind === 'quiz' && b.status === 'open' && me?.state === 'joined' && !me.finished && !inRun && (
        <div className="vb-panel vb-panel--go">
          <p>{me.idx ? `Bạn đã làm ${me.idx}/${b.total} câu.` : `${b.total} câu đang chờ bạn. Câu nào cũng tính giờ, trả lời nhanh được thêm điểm!`}</p>
          <button className="vb-btn vb-btn--primary vb-btn--big" onClick={() => setPlaying(true)}>
            {me.idx ? '▶️ Làm tiếp' : '🚀 Bắt đầu'}
          </button>
          {b.isHost && !b.solo && !others.some((p) => p.state === 'joined') && (
            <button className="vb-btn vb-btn--ghost" disabled={busy} onClick={() => act('cancel', 'Hủy trận này? 🔥 cược sẽ được trả lại.')}>Hủy trận</button>
          )}
        </div>
      )}

      {inRun && <QuizRun b={b} id={id} onBattle={take} onExit={() => setPlaying(false)} />}

      {b.kind === 'quiz' && b.status === 'open' && me?.finished && !inRun && (
        <div className="vb-panel vb-panel--wait">
          <p>✅ Bạn đã xong: <b>{me.score} điểm</b>. Đợi các bạn khác làm bài nhé, kết quả sẽ hiện ở đây và trong Hộp thư.</p>
        </div>
      )}

      {b.kind === 'chain' && (
        <Chain b={b} id={id} offset={offset} busy={busy} onAct={act} onBattle={take} />
      )}

      {(b.status === 'done' || b.status === 'cancelled') && !inRun && <Result b={b} best={best} />}
      {b.kind === 'quiz' && (b.status === 'done' || b.status === 'cancelled' || me?.finished) && !inRun && (
        <Review id={id} key={`${b.status}-${me?.finished}`} />
      )}
    </div>
  );
}

// 🔁 Chơi lại (alone) / Đấu lại (same people, same stake): same game + settings
function PlayAgain({ b, solo = true, label = '🔁 Chơi lại', ghost = false }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function again() {
    setBusy(true);
    const d = await battleApi('POST', '', replayBody(b, { solo }));
    setBusy(false);
    if (!d.success) { siteToast(d.message || 'Không tạo được trận mới', 'error'); return; }
    if (!solo) siteToast('⚔️ Đã gửi lời mời đấu lại!', 'success');
    navigate(`/vocab-battle/${d.battle.id}`);
  }
  return <button className={`vb-btn ${ghost ? 'vb-btn--ghost' : 'vb-btn--primary'}`} disabled={busy} onClick={again}>{busy ? 'Đang tạo…' : label}</button>;
}

function Result({ b, best }) {
  const me = b.players.find((p) => p.me);
  if (b.status === 'cancelled') {
    return <div className="vb-panel">Trận đã hủy{me?.reward ? `, ${me.reward} 🔥 cược đã về lại ví lửa` : ''}.</div>;
  }
  if (b.solo) {
    const won = b.kind === 'chain' && me && b.winnerIds.includes(me.id);
    const record = b.kind === 'quiz' && best !== null && me && me.score > best;
    let title;
    let line;
    let pct;
    if (b.kind === 'quiz') {
      const pctRight = b.total ? Math.round(((me?.correct || 0) / b.total) * 100) : 0;
      pct = pctRight;
      title = `🎯 ${me?.score || 0} điểm · đúng ${me?.correct || 0}/${b.total}`;
      if (record) line = best ? `🏅 Kỷ lục mới! (trước đó: ${best}) Giỏi quá!` : '🏅 Kỷ lục đầu tiên của bạn ở trò này. Lần sau phá nó nhé!';
      else line = best ? `Kỷ lục của bạn: ${best}. Chơi lại để vượt qua nhé! 💪` : 'Chơi lại để làm tốt hơn nhé! 💪';
    } else {
      pct = won ? 100 : 40;
      const chainRecord = best !== null && me && me.score > best && me.score > 0;
      title = won ? '🏆 Bạn thắng Lulu 🤖 rồi!' : 'Lulu 🤖 thắng ván này!';
      line = won ? `${me.score} điểm. Vốn từ của bạn thật đáng nể!` : `Bạn được ${me?.score || 0} điểm. Thử lại để hạ gục Lulu nhé! 💪`;
      if (chainRecord) line += best ? ` 🏅 Kỷ lục mới (trước đó: ${best})!` : ' 🏅 Kỷ lục đầu tiên của bạn!';
      else if (best) line += ` Kỷ lục của bạn: ${best}.`;
    }
    return (
      <div className={`vb-result${won || record ? ' vb-result--win' : ''}`}>
        <img src={resultImage(pct)} alt="" className="vb-result-img" />
        <div>
          <h2 className="pf-head">{title}</h2>
          <p>{line}</p>
          <div className="vb-row">
            <PlayAgain b={b} />
            <Link className="vb-btn vb-btn--ghost" to="/vocab-battle">⚔️ Thách bạn bè</Link>
          </div>
        </div>
      </div>
    );
  }
  const won = me && b.winnerIds.includes(me.id);
  const tie = !b.winnerIds.length;
  const canRematch = b.players.some((p) => !p.me && !p.bot && p.state === 'joined');
  const pct = won ? 100 : tie ? 70 : me?.rank === 2 ? 50 : 20;
  let title = 'Trận đấu kết thúc!';
  let line = 'Thua keo này ta bày keo khác. Xem lại từ sai bên dưới rồi thách đấu lại nhé! 💪';
  if (won) { title = '🏆 Bạn thắng rồi!'; line = me.reward ? `Bạn nhận ${me.reward} 🔥 vào ví lửa. Quá đỉnh!` : 'Vốn từ của bạn thật đáng nể!'; }
  else if (tie) { title = '🤝 Hòa!'; line = 'Ngang tài ngang sức! Đấu thêm trận nữa để phân thắng bại nhé.'; }
  return (
    <div className={`vb-result${won ? ' vb-result--win' : ''}`}>
      <img src={resultImage(pct)} alt="" className="vb-result-img" />
      <div>
        <h2 className="pf-head">{title}</h2>
        <p>{line}</p>
        <div className="vb-row">
          {canRematch && <PlayAgain b={b} solo={false} label={won ? '🔁 Đấu lại' : '🔥 Phục thù'} />}
          <Link className={`vb-btn ${canRematch ? 'vb-btn--ghost' : 'vb-btn--primary'}`} to="/vocab-battle">⚔️ Trận mới</Link>
          <Link className="vb-btn vb-btn--ghost" to="/vocab-battle?tab=rank">🏆 BXH</Link>
        </div>
      </div>
    </div>
  );
}
