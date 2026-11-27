import { useEffect, useRef, useState } from 'react';
import { speakWord } from '../../utils/vocab';

// One battle question. `feedback` (after the reply) = the server's grading:
// { frac, right (MCQ index / match columns), correct (text) }.
// onDraft(value) = the answer as it stands, sent if the time runs out.
export default function Question({ q, attempt = 0, feedback, onSubmit, onDraft = () => {} }) {
  if (q.options) return <Choice q={q} attempt={attempt} feedback={feedback} onSubmit={onSubmit} onDraft={onDraft} />;
  if (q.type === 'match') return <Match q={q} feedback={feedback} onSubmit={onSubmit} onDraft={onDraft} />;
  if (q.type === 'order') return <Order q={q} feedback={feedback} onSubmit={onSubmit} onDraft={onDraft} />;
  return <Typed q={q} feedback={feedback} onSubmit={onSubmit} onDraft={onDraft} />;
}

const ASK = {
  synonym: 'Chọn cụm ĐỒNG NGHĨA với',
  antonym: 'Chọn từ TRÁI NGHĨA với',
  'meaning:en-vi': 'Nghĩa của từ này là gì?',
  'meaning:vi-en': 'Từ/cụm tiếng Anh nào mang nghĩa',
  image: 'Hình này là từ nào?',
};

// A pick locks the buttons while it's sent; if the send failed the question
// is read again (`attempt` changes) and they unlock.
function Choice({ q, attempt, feedback, onSubmit, onDraft }) {
  const [pickedAt, setPickedAt] = useState({ attempt, i: null });
  const chosen = pickedAt.attempt === attempt ? pickedAt.i : null;
  const pick = (i) => { setPickedAt({ attempt, i }); onDraft(i); onSubmit(i); };
  const ask = ASK[q.type === 'meaning' ? `meaning:${q.dir}` : q.type];

  // 1–4 on the keyboard (once: the first key is the answer)
  useEffect(() => {
    if (feedback || chosen !== null) return undefined;
    const onKey = (e) => {
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length && e.target.tagName !== 'INPUT') pick(n - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, feedback, chosen, onSubmit]);

  return (
    <div className="vb-q">
      <div className="vb-q-ask">{ask}</div>
      {q.image ? <img className="vb-q-img" src={q.image} alt="" /> : (
        <div className={`vb-q-prompt${q.dir === 'vi-en' ? ' vi' : ''}`}>
          {q.prompt}
          {q.dir !== 'vi-en' && <button className="vb-say" onClick={() => speakWord(q.prompt)} aria-label="Nghe">🔊</button>}
        </div>
      )}
      <div className="vb-opts">
        {q.options.map((o, i) => {
          let cls = 'vb-opt';
          if (feedback) {
            if (i === feedback.right) cls += ' right';
            else if (i === chosen) cls += ' wrong';
            else cls += ' dim';
          } else if (i === chosen) cls += ' picked';
          return (
            <button key={i} className={cls} disabled={!!feedback || chosen !== null}
              onClick={() => pick(i)}>
              <span className="vb-opt-key">{i + 1}</span>{o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Nối từ: tap a word, then its meaning (tap a pair again to undo)
function Match({ q, feedback, onSubmit, onDraft }) {
  const [pairs, setPairs] = useState(() => q.left.map(() => -1)); // left i → right index
  useEffect(() => { onDraft(pairs.some((r) => r >= 0) ? pairs : null); }, [pairs, onDraft]);
  const [sel, setSel] = useState(null);
  const done = pairs.every((r) => r >= 0);
  const COLORS = ['c0', 'c1', 'c2', 'c3', 'c4'];

  function pickLeft(i) {
    if (feedback) return;
    if (pairs[i] >= 0) { setPairs((p) => p.map((r, k) => (k === i ? -1 : r))); setSel(null); return; }
    setSel(i);
  }
  function pickRight(r) {
    if (feedback) return;
    const owner = pairs.indexOf(r);
    if (owner >= 0) { setPairs((p) => p.map((x, k) => (k === owner ? -1 : x))); return; }
    if (sel === null) return;
    setPairs((p) => p.map((x, k) => (k === sel ? r : x)));
    setSel(null);
  }

  return (
    <div className="vb-q">
      <div className="vb-q-ask">Nối từ với nghĩa đúng <small>({q.prompt})</small></div>
      <div className="vb-match">
        <div className="vb-match-col">
          {q.left.map((w, i) => {
            let cls = `vb-mitem${sel === i ? ' sel' : ''}${pairs[i] >= 0 ? ` paired ${COLORS[i]}` : ''}`;
            if (feedback) cls += feedback.right?.[i] === pairs[i] ? ' right' : ' wrong';
            return <button key={i} className={cls} onClick={() => pickLeft(i)} disabled={!!feedback}>{w}</button>;
          })}
        </div>
        <div className="vb-match-col">
          {q.right.map((m, r) => {
            const owner = pairs.indexOf(r);
            return (
              <button key={r} className={`vb-mitem vi${owner >= 0 ? ` paired ${COLORS[owner]}` : ''}`}
                onClick={() => pickRight(r)} disabled={!!feedback}>{m}</button>
            );
          })}
        </div>
      </div>
      {!feedback && (
        <button className="vb-btn vb-btn--primary vb-submit" disabled={!done} onClick={() => onSubmit(pairs)}>Nộp bài</button>
      )}
    </div>
  );
}

// Ghép câu: tap the words in order
function Order({ q, feedback, onSubmit, onDraft }) {
  const [line, setLine] = useState([]); // token indices
  useEffect(() => { onDraft(line.length ? line : null); }, [line, onDraft]);
  const full = line.length === q.tokens.length;
  return (
    <div className="vb-q">
      <div className="vb-q-ask">Sắp xếp thành câu đúng</div>
      <div className="vb-q-hint">💡 {q.prompt}</div>
      <div className={`vb-line${feedback ? (feedback.frac === 1 ? ' right' : ' wrong') : ''}`}>
        {line.length === 0 && <span className="vb-muted">Chạm vào các từ bên dưới theo đúng thứ tự…</span>}
        {line.map((ti, k) => (
          <button key={k} className="vb-tok on" disabled={!!feedback} onClick={() => setLine((l) => l.filter((_, j) => j !== k))}>{q.tokens[ti]}</button>
        ))}
      </div>
      <div className="vb-bank">
        {q.tokens.map((t, i) => (
          <button key={i} className="vb-tok" disabled={!!feedback || line.includes(i)} onClick={() => setLine((l) => [...l, i])}>{t}</button>
        ))}
      </div>
      {!feedback && (
        <div className="vb-row">
          <button className="vb-btn vb-btn--ghost" onClick={() => setLine([])} disabled={!line.length}>Làm lại</button>
          <button className="vb-btn vb-btn--primary" disabled={!full} onClick={() => onSubmit(line)}>Nộp bài</button>
        </div>
      )}
    </div>
  );
}

// Nghe & điền từ (sentence with a gap) / Nghe & gõ từ (the word alone)
function Typed({ q, feedback, onSubmit, onDraft }) {
  const [text, setText] = useState('');
  useEffect(() => { onDraft(text.trim() || null); }, [text, onDraft]);
  const input = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => speakWord(q.speak), 300);
    input.current?.focus();
    return () => clearTimeout(t);
  }, [q]);
  const send = () => { if (!feedback && text.trim()) onSubmit(text.trim()); };
  return (
    <div className="vb-q">
      <div className="vb-q-ask">{q.type === 'listen' ? 'Nghe câu rồi điền từ còn thiếu' : 'Nghe rồi gõ lại từ/cụm từ'}</div>
      <button className="vb-play" onClick={() => speakWord(q.speak)}>🔊 Nghe lại</button>
      {q.type === 'listen' && <div className="vb-q-sentence">{q.prompt}</div>}
      <div className="vb-q-hint">💡 {q.hint} · {q.len} chữ cái</div>
      <form className="vb-typed" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input ref={input} className={`vb-input vb-input--big${feedback ? (feedback.frac === 1 ? ' right' : ' wrong') : ''}`}
          value={text} onChange={(e) => setText(e.target.value)} disabled={!!feedback}
          autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="Gõ câu trả lời…" />
        {!feedback && <button className="vb-btn vb-btn--primary" disabled={!text.trim()}>Nộp</button>}
      </form>
    </div>
  );
}
