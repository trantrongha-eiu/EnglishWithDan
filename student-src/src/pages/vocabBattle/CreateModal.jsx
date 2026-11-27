import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../../components/Modal';
import { battleApi, battleFocus, STAKES, TYPE_EMOJI } from '../../utils/vocabBattle';
import Avatar from './Avatar';

// Settings for one game from the Đấu trường list.
//   solo=false → "Mời bạn": opponents (1–3), how many, word source, stake
//   solo=true  → "Chơi một mình": just how many + word source (Nối chữ: vs Lulu 🤖)
// `initialPicked` = opponents already chosen (⚔️ on a BXH row).
// Someone mid Listening/Reading test (`busy`, backend/services/presenceService.js)
// gets a "📝 đang thi / đang luyện đề" tag and a warning; the server also
// asks for a confirm (code opponent_busy) before inviting them.

// "đang làm đề Reading (chế độ thi): …" — what the invitee will see
function busyLine(a) {
  if (!a) return '';
  return a.mode === 'simulation'
    ? `đang làm ${a.label} — lời mời chỉ hiện popup khi bạn ấy làm xong bài.`
    : `đang làm ${a.label} — popup lời mời sẽ hiện ngay, có thể làm bạn ấy mất tập trung.`;
}

export default function CreateModal({ game, solo, rules, wallet, initialPicked = [], onClose, onCreated }) {
  const kind = game.kind;
  const [q, setQ] = useState('');
  const [players, setPlayers] = useState(null);
  const [picked, setPicked] = useState(() => (solo ? [] : initialPicked.slice(0, rules.maxPlayers - 1))); // [{ id, name, avatar }]
  const [types, setTypes] = useState(game.types || rules.types.map((t) => t.key));
  const [lessons, setLessons] = useState(null);
  const [bankStats, setBankStats] = useState(null); // { sources: { key: words }, antonyms, chain }
  const [lessonId, setLessonId] = useState('');
  const [count, setCount] = useState(10);
  const [turnSeconds, setTurnSeconds] = useState(15);
  const [lives, setLives] = useState(2);
  const [stake, setStake] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Picked opponents who are mid Listening/Reading test (the server said so
  // on create) → confirm before the invite goes out
  const [busyWarn, setBusyWarn] = useState(null); // [{ id, name, activity: { mode, label } }]
  const seq = useRef(0);

  // Only the word sources that can feed this game
  const sources = useMemo(
    () => rules.sources.filter((s) => (game.types || rules.types.map((t) => t.key)).some((t) => s.types.includes(t))),
    [rules, game],
  );
  const [source, setSource] = useState(sources[0]?.key || 'all');

  // The site's floating cards (daily-goal nudge "Từ vựng hôm nay", shop
  // ticker…) sat over the modal's buttons on a laptop: none while it's open
  useEffect(() => battleFocus(() => true), []);

  // Opponent search (classmates + who's online when empty)
  useEffect(() => {
    if (solo) return undefined;
    const n = ++seq.current;
    const t = setTimeout(() => {
      battleApi('GET', `/players?q=${encodeURIComponent(q.trim())}`).then((d) => {
        if (n === seq.current) setPlayers(d.success ? d.players : []);
      });
    }, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [q, solo]);

  useEffect(() => {
    if (lessons) return;
    battleApi('GET', '/lessons').then((d) => {
      setLessons(d.success ? d.lessons : []);
      if (d.success) setBankStats(d.stats || null);
    });
  }, [lessons]);

  const src = useMemo(() => rules.sources.find((s) => s.key === source), [rules, source]);
  const allowed = src?.types || [];
  // The sets (lesson / topic / test) this source can be narrowed to
  const sets = useMemo(
    () => (lessons || []).filter((l) => !src?.sets || src.sets.includes(l.src)),
    [lessons, src],
  );
  const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
  const usable = types.filter((t) => allowed.includes(t));
  const maxPick = rules.maxPlayers - 1;
  const maxStake = Math.min(rules.maxStake, wallet);
  const mix = kind === 'quiz' && !game.types;

  function toggle(p) {
    setBusyWarn(null);
    setPicked((cur) => {
      if (cur.some((x) => x.id === p.id)) return cur.filter((x) => x.id !== p.id);
      if (cur.length >= maxPick) return cur;
      return [...cur, p];
    });
  }
  function toggleType(key) {
    setTypes((cur) => (cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key]));
  }

  // confirmBusy: the host saw the "đang làm đề" warning and still invites
  async function submit(confirmBusy = false) {
    setError('');
    setBusyWarn(null);
    if (!solo && !picked.length) { setError('Chọn ít nhất 1 bạn để thách đấu.'); return; }
    if (kind === 'quiz' && !usable.length) { setError('Chọn ít nhất 1 dạng câu hỏi.'); return; }
    setBusy(true);
    const d = await battleApi('POST', '', {
      kind, solo, opponents: solo ? [] : picked.map((p) => p.id), stake: solo ? 0 : stake, count,
      types: usable, source, lessonId: lessonId || undefined, turnSeconds, lives, confirmBusy,
    });
    setBusy(false);
    if (d.code === 'opponent_busy' && Array.isArray(d.busy)) { setBusyWarn(d.busy); return; }
    if (!d.success) { setError(d.message || 'Không tạo được trận.'); return; }
    onCreated(d.battle);
  }

  let cta = busy ? 'Đang tạo…' : `Gửi lời thách đấu${stake ? ` · ${stake} 🔥` : ''}`;
  if (solo && !busy) cta = kind === 'chain' ? '🤖 Đấu với Lulu' : '🎯 Bắt đầu chơi';

  return (
    <Modal
      title={`${solo ? '🎯 Chơi một mình' : '⚔️ Mời bạn thách đấu'}: ${game.emoji} ${game.name}`}
      onClose={onClose}
      size={solo ? 'modal-sm' : 'modal-lg'}
      footer={busyWarn ? (
        <div className="vb-busy-confirm" role="alert">
          <div className="vb-busy-text">
            {busyWarn.map((b) => <div key={b.id}>📝 <b>{b.name}</b> {busyLine(b.activity)}</div>)}
            <div className="vb-muted">Vẫn gửi lời mời?</div>
          </div>
          <div className="vb-busy-btns">
            <button className="btn btn-ghost" onClick={() => setBusyWarn(null)}>Để sau</button>
            <button className="btn btn-primary" onClick={() => submit(true)} disabled={busy}>{busy ? 'Đang tạo…' : 'Vẫn mời'}</button>
          </div>
        </div>
      ) : (
        <>
          {error && <span className="vb-form-err">{error}</span>}
          <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button className="btn btn-primary" onClick={() => submit(false)} disabled={busy}>{cta}</button>
        </>
      )}
    >
      <div className="vb-form">
        <p className="vb-muted vb-form-desc">{game.desc}</p>

        {!solo && (
          <div className="vb-field">
            <div className="vb-label">Đối thủ <small>({picked.length}/{maxPick}: 1 vs 1 hoặc tối đa {rules.maxPlayers} người)</small></div>
            {picked.length > 0 && (
              <div className="vb-picked">
                {picked.map((p) => (
                  <button key={p.id} className="vb-chip vb-chip--on" onClick={() => toggle(p)} title="Bỏ chọn">
                    <Avatar p={p} small /> {p.name} ×
                  </button>
                ))}
              </div>
            )}
            {picked.filter((p) => p.busy).map((p) => (
              <div key={p.id} className="vb-busy-note">⚠️ <b>{p.name}</b> {busyLine(p.busy)}</div>
            ))}
            <input className="vb-input" placeholder="🔍 Tìm theo tên…" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="vb-people">
              {players === null && <div className="vb-muted">Đang tải…</div>}
              {players?.length === 0 && <div className="vb-muted">{q ? 'Không tìm thấy bạn nào.' : 'Gõ tên để tìm bạn muốn thách đấu.'}</div>}
              {players?.map((p) => {
                const on = picked.some((x) => x.id === p.id);
                return (
                  <button key={p.id} className={`vb-person${on ? ' on' : ''}`} onClick={() => toggle(p)}
                    disabled={!on && picked.length >= maxPick}>
                    <Avatar p={p} small online={p.online} />
                    <span className="vb-person-name">{p.name}</span>
                    {p.classmate && <span className="vb-tag">cùng lớp</span>}
                    {p.busy && (
                      <span className="vb-tag vb-tag--busy" title={`Đang làm ${p.busy.label}`}>
                        📝 {p.busy.mode === 'simulation' ? 'đang thi' : 'đang luyện đề'}
                      </span>
                    )}
                    <span className="vb-check">{on ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {kind === 'quiz' && (
          <div className="vb-field">
            <div className="vb-label">Nguồn từ vựng</div>
            <div className="vb-seg vb-seg--wrap">
              {sources.map((s) => (
                <button key={s.key} className={source === s.key ? 'on' : ''} onClick={() => { setSource(s.key); setLessonId(''); }}>
                  {s.label}{bankStats?.sources?.[s.key] ? <small className="vb-seg-n"> · {fmt(bankStats.sources[s.key])} từ</small> : null}
                </button>
              ))}
            </div>
            {usable.some((t) => !['synonym', 'antonym'].includes(t)) && sets.length > 0 && (
              <select className="vb-input" value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
                <option value="">Mọi bộ từ ({sets.length} bộ)</option>
                {sets.map((l) => <option key={l.id} value={l.id}>{l.title} ({l.count} từ)</option>)}
              </select>
            )}
          </div>
        )}

        {mix && (
          <div className="vb-field">
            <div className="vb-label">
              Dạng câu hỏi
              <button className="vb-link" onClick={() => setTypes(usable.length === allowed.length ? [] : allowed)}>
                {usable.length === allowed.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
              </button>
            </div>
            <div className="vb-types">
              {rules.types.map((t) => {
                const ok = allowed.includes(t.key);
                const on = ok && types.includes(t.key);
                return (
                  <button key={t.key} className={`vb-type${on ? ' on' : ''}`} disabled={!ok} onClick={() => toggleType(t.key)}
                    title={ok ? `${t.limit} giây/câu` : 'Nguồn từ này không có dạng câu này'}>
                    <span>{TYPE_EMOJI[t.key]}</span> {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="vb-field">
          <div className="vb-label">{kind === 'quiz' ? 'Số câu hỏi' : 'Số từ cả trận'}</div>
          <div className="vb-seg vb-seg--wrap">
            {rules.counts.map((n) => <button key={n} className={count === n ? 'on' : ''} onClick={() => setCount(n)}>{n}</button>)}
          </div>
        </div>

        {kind === 'chain' && bankStats?.chain && (
          <div className="vb-muted">
            📚 Gõ được mọi từ tiếng Anh có trong từ điển (hơn {fmt(bankStats.chain.accepted)} từ).
            {' '}{solo ? 'Lulu 🤖' : 'Từ mở đầu'} dùng {fmt(bankStats.chain.lulu)} từ thông dụng và từ trong bài học, Reading, Listening trên web.
          </div>
        )}

        {kind === 'chain' && (
          <div className="vb-field vb-field--row">
            <div>
              <div className="vb-label">Thời gian mỗi lượt</div>
              <div className="vb-seg">
                {rules.turnSeconds.map((n) => <button key={n} className={turnSeconds === n ? 'on' : ''} onClick={() => setTurnSeconds(n)}>{n}s</button>)}
              </div>
            </div>
            <div>
              <div className="vb-label">Số mạng</div>
              <div className="vb-seg">
                {rules.lives.map((n) => <button key={n} className={lives === n ? 'on' : ''} onClick={() => setLives(n)}>{'❤️'.repeat(n)}</button>)}
              </div>
            </div>
          </div>
        )}

        {solo ? (
          <div className="vb-muted">🎯 Luyện tập: không cược, không nhận 🔥. Điểm cao nhất sẽ thành kỷ lục của bạn ở trò này.</div>
        ) : (
          <div className="vb-field">
            <div className="vb-label">Cược 🔥 <small>(ví của bạn: {wallet} 🔥)</small></div>
            <div className="vb-seg vb-seg--wrap">
              {STAKES.map((n) => (
                <button key={n} className={stake === n ? 'on' : ''} disabled={n > 0 && n > maxStake} onClick={() => setStake(n)}>
                  {n ? `${n} 🔥` : 'Giao hữu'}
                </button>
              ))}
            </div>
            <div className="vb-muted">
              {stake
                ? `Mỗi bạn vào trận đặt ${stake} 🔥. Người thắng ẵm cả pot (tối đa ${stake * (picked.length + 1)} 🔥).`
                : `Không mất gì. Người thắng được +${rules.friendlyWin} 🔥 (tối đa ${rules.friendlyDaily} trận/ngày).`}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
