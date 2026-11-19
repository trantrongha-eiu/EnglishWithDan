import { useEffect, useRef, useState } from 'react';
import { tokenize } from '../utils/sentenceWbw';

// The "Dịch câu" word-by-word typing drill of the sentence pages (Luyện viết
// câu giao tiếp, Task 1 Grammar), with the same .wbw-* markup and CSS
// (writing-practice.css) as js/shared/sentence-drill.js:
// one word open at a time, letter by letter; a wrong letter shakes and is
// removed (never typed in for the student); punctuation fills itself.
// Site rule: the 3rd wrong try on one word fails the sentence (onFail).
// "Hỏi Lulu" tells the next letter, 3 times per sentence.
const MAX_WORD_ERRORS = 3;
const MAX_ASKS = 3;

const start = { active: 0, typed: '', errors: 0, asks: 0, erroring: false, done: false, failed: false, justDone: -1 };

export default function SentenceWbw({ answer, onComplete, onFail }) {
  const [tokens] = useState(() => tokenize(answer));
  const [s, setS] = useState(start);
  const inputRef = useRef(null);
  const askRef = useRef(null);
  const composing = useRef(false);
  const cb = useRef({ onComplete, onFail });
  useEffect(() => { cb.current = { onComplete, onFail }; });
  const live = useRef(s);
  useEffect(() => { live.current = s; });

  useEffect(() => {
    window.AskLulu?.left?.(askRef.current, MAX_ASKS);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, []);

  // Hand over to the page once the last word is in (or the drill failed)
  useEffect(() => {
    if (!s.done) return undefined;
    const t = setTimeout(() => {
      if (s.failed) {
        cb.current.onFail?.({
          word: tokens[s.active]?.target || '',
          sofar: tokens.slice(0, s.active).map((x) => x.raw).join(' '),
        });
      } else {
        cb.current.onComplete?.(answer);
      }
    }, s.failed ? 450 : 500);
    return () => clearTimeout(t);
  }, [s.done, s.failed, s.active, tokens, answer]);

  useEffect(() => {
    if (!s.erroring) return undefined;
    const t = setTimeout(() => setS((x) => ({ ...x, erroring: false })), 260);
    return () => clearTimeout(t);
  }, [s.erroring]);

  function focus() {
    if (!live.current.done) inputRef.current?.focus();
  }

  function onInput(e) {
    const cur = live.current;
    if (cur.done || composing.current) return;
    const input = e.currentTarget;
    const tok = tokens[cur.active];
    const raw = input.value.replace(/[^A-Za-z0-9]/g, '');
    let good = '';
    let rejected = false;
    for (const ch of raw) {
      const expected = tok.target[good.length];
      if (expected === undefined) break;
      if (ch.toLowerCase() === expected.toLowerCase()) good += ch;
      else { rejected = true; break; }
    }
    input.value = good;
    if (rejected) {
      // a second wrong key during the shake isn't a separate try
      const errors = cur.erroring ? cur.errors : cur.errors + 1;
      if (errors >= MAX_WORD_ERRORS) {
        input.value = '';
        input.blur();
        live.current = { ...cur, typed: good, errors, erroring: false, done: true, failed: true, justDone: -1 };
      } else {
        live.current = { ...cur, typed: good, errors, erroring: true, justDone: -1 };
      }
      setS(live.current);
      return;
    }
    if (good.length < tok.target.length) {
      live.current = { ...cur, typed: good, justDone: -1 }; // the pop only lasts until the next key
      setS(live.current);
      return;
    }
    // the open word is complete
    input.value = '';
    window.playOk?.();
    const active = cur.active + 1;
    const done = active >= tokens.length;
    if (done) input.blur();
    live.current = { ...cur, active, typed: '', errors: 0, done, justDone: cur.active };
    setS(live.current);
  }

  function askLulu() {
    const cur = live.current;
    if (cur.done || cur.asks >= MAX_ASKS) return;
    const tok = tokens[cur.active];
    const next = tok?.target.charAt(cur.typed.length);
    if (next && window.AskLulu) {
      const asks = cur.asks + 1;
      live.current = { ...cur, asks };
      setS(live.current);
      window.AskLulu.left(askRef.current, MAX_ASKS - asks);
      const so = cur.typed + next;
      window.AskLulu.say(askRef.current, `Chữ tiếp theo là “${next}” nè — từ này bắt đầu “${so}${so.length < tok.target.length ? '…' : ''}” 🍊`);
    }
    focus();
  }

  const total = tokens.length;
  const doneCount = s.done && !s.failed ? total : s.active;
  return (
    <div className="wbw" id="wbw">
      <div className="wbw-bar">
        <span className={`wbw-count${doneCount === total && total > 0 && !s.failed ? ' is-full' : ''}`} id="wbw-count">{doneCount} / {total} từ</span>
        <button type="button" ref={askRef} className="wbw-ask ask-lulu" id="wbw-ask" disabled={s.done} onClick={askLulu} title="Hỏi Lulu chữ cái tiếp theo">
          <span className="ask-lulu-ic" /> <span>Hỏi Lulu</span>
        </button>
      </div>
      <div className="wbw-words" id="wbw-words" onClick={focus}>
        {tokens.map((t, i) => {
          if (i < s.active) return <span key={i} className={`wbw-word is-done${i === s.justDone ? ' just-done' : ''}`} data-i={i}>{t.raw}</span>;
          if (i === s.active && s.failed) return <span key={i} className="wbw-word is-active is-error" data-i={i}>{t.raw}</span>;
          if (i === s.active && !s.done) {
            return (
              <span key={i} className={`wbw-word is-active${s.erroring ? ' is-error' : ''}`} data-i={i}>
                {s.typed}{s.erroring ? <span className="wbw-err">✕</span> : <span className="wbw-caret" />}
                <span className="wbw-star">{'*'.repeat(Math.max(0, t.target.length - s.typed.length))}</span>
              </span>
            );
          }
          return <span key={i} className="wbw-word is-locked" data-i={i}>{t.mask}</span>;
        })}
      </div>
      <input
        ref={inputRef}
        className={`wbw-input${s.erroring ? ' is-error' : ''}`}
        id="wbw-input"
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Gõ từng từ"
        disabled={s.done}
        placeholder={s.done ? undefined : (tokens[s.active]?.mask || '')}
        onInput={onInput}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') e.preventDefault(); }}
        onPaste={(e) => e.preventDefault()}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={(e) => { composing.current = false; onInput(e); }}
      />
      <div className="wbw-hint">Gõ từng chữ cái — đúng thì tự mở từ tiếp theo. Dấu câu tự thêm. Backspace để xoá. Bí chữ nào thì hỏi Lulu nha.</div>
    </div>
  );
}
