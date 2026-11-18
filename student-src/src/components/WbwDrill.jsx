import { useEffect, useRef, useState } from 'react';
import { normAnswer } from '../utils/vocab';
import { buildLetterHint } from '../utils/lessonQuiz';
import { luluSay } from '../utils/shell';

const HINT_MAX = 3;

// React wrapper around the site-wide "gõ từng chữ" drill
// (/js/shared/wbw-drill.js → window.WbwDrill, loaded in index.html).
// Site rule: the 3rd wrong try fails the item (maxErrors: 3).
// Falls back to a plain input + "Kiểm tra" (also 3 tries) when the script
// is missing or declines the answer; with `hint`, that input also gets the
// "Hỏi Lulu" letter reveal (3 asks), as on the old page.
export default function WbwDrill({ answer, onDone, placeholder = 'Gõ từ tiếng Anh…', hint = false }) {
  const hostRef = useRef(null);
  const doneRef = useRef(onDone);
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState('');
  const [tries, setTries] = useState(0);
  const [hints, setHints] = useState(0);
  const finished = useRef(false);

  useEffect(() => { doneRef.current = onDone; });

  useEffect(() => {
    finished.current = false;
    const host = hostRef.current;
    const finish = (correct) => {
      if (finished.current) return;
      finished.current = true;
      doneRef.current(correct);
    };
    const ok = !!(host && window.WbwDrill && window.WbwDrill.mount(host, {
      answer,
      maxErrors: 3,
      silent: true,
      autoFocus: true,
      onComplete: () => finish(true),
      onFail: () => finish(false),
    }));
    setMounted(ok);
    return () => { if (host && window.WbwDrill) window.WbwDrill.unmount(host); };
  }, [answer]);

  function check() {
    if (finished.current || !value.trim()) return;
    if (normAnswer(value) === normAnswer(answer)) {
      finished.current = true;
      onDone(true);
      return;
    }
    const n = tries + 1;
    setTries(n);
    if (n >= 3) { finished.current = true; onDone(false); }
  }

  function askLulu(e) {
    if (hints >= HINT_MAX) return;
    const n = hints + 1;
    setHints(n);
    luluSay(e.currentTarget, `Lulu mách nè: ${buildLetterHint(answer, n)} 🍊`);
  }

  return (
    <>
      <div ref={hostRef} style={{ display: mounted ? '' : 'none' }} />
      {!mounted && hints > 0 && <div className="listen-hint">💡 {buildLetterHint(answer, hints)}</div>}
      {!mounted && (
        <div className="fb-input-row">
          <input
            className="fb-input"
            value={value}
            placeholder={placeholder}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
          />
          {hint && (
            <button type="button" className="btn-hint-sm ask-lulu" disabled={hints >= HINT_MAX} onClick={askLulu} title="Hỏi Lulu chữ cái tiếp theo">
              <span className="ask-lulu-ic" /> {hints < HINT_MAX ? `Hỏi Lulu (${HINT_MAX - hints})` : 'Hỏi Lulu'}
            </button>
          )}
          <button className="btn-check" onClick={check}>Kiểm tra</button>
          {tries > 0 && tries < 3 && (
            <span style={{ fontSize: 12, color: 'var(--red, #e53935)' }}>Chưa đúng — còn {3 - tries} lần</span>
          )}
        </div>
      )}
    </>
  );
}
