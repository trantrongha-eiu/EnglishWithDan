import { Fragment, useEffect, useRef, useState } from 'react';
import { siteToast } from '../../utils/shell';
import { alignWords, HINTED_NOTE, LULU_MAX, normWord, targetWords, tokenize, wbwAnswer, wordHint } from '../../utils/task2Template';
import { AskBtn, Diff, En } from './Parts';
import { lulu } from './helpers';

// The three kinds of exercise on one sentence. Each calls onDone(ok, …) once
// when answered, then shows a "Tiếp" button that calls onNext. The parent
// gives each item a new key, so the state below always starts fresh.

const play = (ok) => (ok ? window.playOk?.() : window.playWrong?.());

function NextBtn({ label = 'Tiếp', onNext }) {
  const ref = useRef(null);
  useEffect(() => { const t = setTimeout(() => ref.current?.focus(), 30); return () => clearTimeout(t); }, []);
  return <button className="pth-btn pth-btn--primary" id="pth-next" ref={ref} onClick={onNext}>{label} <i className="fas fa-arrow-right" /></button>;
}

// ── Ghép cụm: put the chunks of one sentence in order ──
// item = { target: [text], bank: [{id, text}] } (shuffled by the parent)
export function Build({ s, item, onDone, onNext }) {
  const [picked, setPicked] = useState([]);
  const [state, setState] = useState(null); // null · 'bad' · 'ok'
  const [wrongs, setWrongs] = useState(0);
  const [hints, setHints] = useState(0);
  const { bank, target } = item;
  const textOf = (id) => bank.find((x) => x.id === id).text;
  const done = state === 'ok';

  // A full answer is checked at once
  function place(next, hinted = hints) {
    setPicked(next);
    if (next.length !== bank.length) { setState(null); return null; }
    if (next.map(textOf).join(' ') === target.join(' ')) {
      setState('ok'); play(true); onDone(wrongs === 0, hinted > 0);
      return 'ok';
    }
    setState('bad'); setWrongs(wrongs + 1); play(false);
    return 'bad';
  }
  function pick(id) { if (!done) place([...picked, id]); }
  function unpick(pos) { if (done) return; setPicked(picked.filter((_, i) => i !== pos)); setState(null); }
  // Hỏi Lulu: takes back the wrong chunks, or places the next right one
  function hint(e) {
    if (done || hints >= LULU_MAX) return;
    const btn = e.currentTarget;
    const n = hints + 1;
    setHints(n);
    const texts = picked.map(textOf);
    let k = 0;
    while (k < texts.length && texts[k] === target[k]) k++;
    if (k < texts.length) {
      setPicked(picked.slice(0, k)); setState(null);
      lulu(btn, `Từ cụm thứ ${k + 1} là lạc chỗ rồi — tớ gỡ ra giúp cậu nè. Cụm đúng tiếp theo mở đầu bằng “${target[k].split(' ')[0]}…”`, 'think');
      return;
    }
    const pc = bank.find((x) => x.text === target[k] && !picked.includes(x.id));
    const res = pc ? place([...picked, pc.id], n) : null;
    if (res !== 'ok') lulu(btn, `Cụm tiếp theo là “${target[k]}” nè 🍊`, 'think');
  }
  function reveal() {
    const used = new Set();
    setPicked(target.map((t) => { const pc = bank.find((x) => x.text === t && !used.has(x.id)); used.add(pc.id); return pc.id; }));
    setState('ok');
    onDone(false, false);
  }

  return (
    <>
      <div className={`pth-build-ans ${state === 'bad' ? 'is-bad' : ''} ${done ? 'is-ok' : ''}`}>
        {picked.length
          ? picked.map((id, pos) => <button key={pos} className="pth-chunk is-picked" disabled={done} onClick={() => unpick(pos)}>{textOf(id)}</button>)
          : <span className="pth-empty-slot">Bấm các cụm bên dưới theo đúng thứ tự</span>}
      </div>
      <div className="pth-build-bank">
        {bank.filter((x) => !picked.includes(x.id)).map((x) => <button key={x.id} className="pth-chunk" onClick={() => pick(x.id)}>{x.text}</button>)}
      </div>
      {state === 'bad' && <div className="pth-fb pth-fb--bad">Chưa đúng thứ tự — bấm vào cụm để gỡ ra và sửa lại, hoặc hỏi Lulu.</div>}
      {done && <div className="pth-fb pth-fb--good">✅ <En s={s} />{hints > 0 && <div className="pth-muted pth-fb-note">{HINTED_NOTE}</div>}</div>}
      <div className="pth-actions">
        {done ? <NextBtn onNext={onNext} />
          : <><AskBtn id="pth-hint" onClick={hint} left={LULU_MAX - hints} />{wrongs >= 2 && <button className="pth-btn" onClick={reveal}><i className="fas fa-eye" /> Xem đáp án</button>}</>}
      </div>
    </>
  );
}

// ── Điền dần: type the hidden words ── blanks = token indexes (from the parent)
export function Fade({ s, blanks, onDone, onNext }) {
  const toks = tokenize(s.en);
  const order = blanks.slice().sort((a, b) => a - b);
  const [vals, setVals] = useState({});
  const [checked, setChecked] = useState(null); // { [i]: ok } after Kiểm tra
  const [hints, setHints] = useState(0);
  const shown = useRef({});
  const last = useRef(null);
  const inputs = useRef({});

  useEffect(() => {
    const t = setTimeout(() => inputs.current[order[0]]?.focus(), 30);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isRight = (i) => normWord(vals[i]) === normWord(toks[i].core);
  function check() {
    if (checked) return;
    const empty = order.find((i) => !String(vals[i] || '').trim());
    if (empty != null) { siteToast('Hãy điền hết các ô trống (bí thì hỏi Lulu nha).', 'warn', 1800); inputs.current[empty]?.focus(); return; }
    const res = {};
    order.forEach((i) => { res[i] = isRight(i); });
    const allOk = order.every((i) => res[i]);
    setChecked(res);
    play(allOk);
    onDone(allOk, hints > 0);
  }
  function key(e, i) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (checked) { onNext(); return; }
    const nextEmpty = order.slice(order.indexOf(i) + 1).find((j) => !String(vals[j] || '').trim());
    if (nextEmpty != null) inputs.current[nextEmpty]?.focus(); else check();
  }
  // Hỏi Lulu: one more letter in the box being typed (or the first wrong one)
  function hint(e) {
    if (checked || hints >= LULU_MAX) return;
    const btn = e.currentTarget;
    const i = last.current != null && order.includes(last.current) && !isRight(last.current) ? last.current : order.find((j) => !isRight(j));
    if (i == null) { lulu(btn, 'Các ô đều đúng hết rồi, bấm Kiểm tra thôi! 🎉', 'excited'); return; }
    const core = toks[i].core;
    const v = vals[i] || '';
    let p = 0;
    while (p < v.length && p < core.length && v[p].toLowerCase() === core[p].toLowerCase()) p++;
    const n = Math.min(core.length, Math.max(p + 1, (shown.current[i] || 0) + 1));
    shown.current[i] = n;
    setHints(hints + 1);
    setVals({ ...vals, [i]: core.slice(0, n) });
    inputs.current[i]?.focus();
    lulu(btn, n >= core.length ? `Chữ này là “${core}” nè 💪` : `Chữ này bắt đầu bằng “${core.slice(0, n)}…” nè 🍊`, 'think');
  }

  const allOk = checked && order.every((i) => checked[i]);
  return (
    <>
      <div className="pth-fade">
        {toks.map((t, i) => {
          const sep = i > 0 ? ' ' : null;
          if (t.ph) return <Fragment key={i}>{sep}<span className="pth-ph">{t.text}</span></Fragment>;
          if (t.text === '/') return <Fragment key={i}>{sep}<span className="pth-or">/</span></Fragment>;
          if (!blanks.includes(i)) return <Fragment key={i}>{sep}{t.text}</Fragment>;
          const st = checked ? (checked[i] ? ' is-ok' : ' is-bad') : '';
          return (
            <Fragment key={i}>{sep}{t.lead}
              <input className={'pth-blank' + st} data-i={i} style={{ width: `${Math.max(3, t.core.length) + 1}ch` }}
                ref={(el) => { inputs.current[i] = el; }} value={vals[i] || ''} readOnly={!!checked}
                autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
                onChange={(e) => setVals({ ...vals, [i]: e.target.value })} onKeyDown={(e) => key(e, i)} onFocus={() => { last.current = i; }} />
              {checked && !checked[i] && <span className="pth-blank-fix">{t.core}</span>}
              {t.trail}
            </Fragment>
          );
        })}
      </div>
      <div className="pth-hint-line">Gõ các chữ bị ẩn · <b>Enter</b> để sang ô tiếp theo / kiểm tra</div>
      <div id="pth-fade-fb">
        {checked && (allOk
          ? <div className="pth-fb pth-fb--good">✅ Chính xác!{hints > 0 && <div className="pth-muted pth-fb-note">{HINTED_NOTE}</div>}</div>
          : <div className="pth-fb pth-fb--bad">Câu đúng: <En s={s} /><div className="pth-muted pth-fb-note">Câu này sẽ quay lại cuối vòng.</div></div>)}
      </div>
      <div className="pth-actions" id="pth-fade-actions">
        {checked ? <NextBtn onNext={onNext} />
          : <><AskBtn id="pth-hint" onClick={hint} left={LULU_MAX - hints} /><button className="pth-btn pth-btn--primary" onClick={check}><i className="fas fa-check" /> Kiểm tra</button></>}
      </div>
    </>
  );
}

// ── Nhớ lại: the whole sentence from its Vietnamese meaning ──
//   free=false → WbwDrill (word masks with first letter, wrong letters rejected;
//                the 3rd wrong try on one word fails the sentence)
//   free=true  → plain textarea, graded by word diff (≥ passPct %)
//   hints      → how many times Lulu may be asked (0 = mock test)
//   note       → 'drill' (the line comes back at the end of the round) or 'run'
// onDone(ok, diff, hinted, drillFailed)
export function Recall({ s, free, hints = 0, passPct, nextLabel = 'Tiếp', note = 'drill', exam = false, onDone, onNext }) {
  const answer = wbwAnswer(s.en);
  const [res, setRes] = useState(null); // { ok, diff, failed }
  const [left, setLeft] = useState(hints);
  const [used, setUsed] = useState(0);
  const [wbw, setWbw] = useState(false);
  const host = useRef(null);
  const input = useRef(null);
  const shown = useRef([]);
  const finished = useRef(false);
  const cb = useRef(null);

  function finish(ok, diff, failed) {
    if (finished.current) return;
    finished.current = true;
    setRes({ ok, diff, failed: !!failed });
    play(ok);
    onDone(ok, diff, used > 0, !!failed);
  }
  useEffect(() => { cb.current = finish; });

  useEffect(() => {
    const h = host.current;
    if (free || !h || !window.WbwDrill) { setTimeout(() => input.current?.focus(), 30); return undefined; }
    // The drill writes what was typed into the hidden textarea (Lulu reads it)
    const ok = window.WbwDrill.mount(h, {
      answer, bridgeInput: input.current, maxWordErrors: 3,
      onComplete: () => cb.current(true, null),
      onFail: () => cb.current(false, null, true),
    });
    if (ok) setWbw(true); else setTimeout(() => input.current?.focus(), 30);
    return () => window.WbwDrill.unmount(h);
  }, [answer, free]);

  function check() {
    if (finished.current) return;
    const value = input.current ? input.current.value : '';
    if (!value.trim()) { siteToast('Hãy gõ câu trả lời.', 'warn', 1800); return; }
    const d = alignWords(targetWords([s]), value);
    finish(d.pct >= passPct, d);
  }
  function giveUp() {
    if (finished.current) return;
    if (host.current && window.WbwDrill) window.WbwDrill.unmount(host.current);
    setWbw(false);
    finish(false, null);
  }
  // Hỏi Lulu: one more letter of the next word not typed yet
  function hint(e) {
    const btn = e.currentTarget;
    if (finished.current) return;
    if (left <= 0) { lulu(btn, 'Hết lượt gợi ý cho câu này rồi — cố nhớ thêm chút, hoặc bấm “Không nhớ” để xem đáp án nha 🤗', 'sad'); return; }
    const typed = input.current ? input.current.value : '';
    let text;
    if (!free && window.AskLulu) {
      const r = window.AskLulu.letterHint(answer, typed, shown.current);
      if (r.done) { lulu(btn, window.AskLulu.line(r), 'excited'); return; }
      text = window.AskLulu.line(r);
    } else {
      const r = wordHint(targetWords([s]), typed, shown.current);
      if (r.done) { lulu(btn, 'Cậu gõ đủ chữ rồi đó, bấm Kiểm tra thôi! 🎉', 'excited'); return; }
      text = r.text;
    }
    setUsed(used + 1);
    setLeft(left - 1);
    lulu(btn, text, 'think');
    (host.current?.querySelector('.wbwd-input') || input.current)?.focus();
  }

  const diffPart = res?.diff && (
    <><div className="pth-diff"><Diff ops={res.diff.ops} /></div><div className="pth-muted">Đúng {res.diff.pct}% số chữ{free ? ` (cần ≥ ${passPct}%)` : ''}</div></>
  );
  const noteText = used && res?.ok ? (note === 'drill' ? HINTED_NOTE : 'Có Lulu gợi ý — lần ôn sau thử tự nhớ nha!') : '';
  return (
    <>
      <div id="pth-wbw" ref={host} style={wbw ? undefined : { display: 'none' }} />
      <textarea className="pth-textarea" id="pth-recall-in" rows={3} ref={input} readOnly={!!res}
        style={wbw ? { display: 'none' } : undefined}
        placeholder="Gõ lại cả câu tiếng Anh... (không cần gõ phần trong ngoặc)"
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); check(); } }} />
      <div id="pth-recall-fb">
        {res && (res.ok
          ? <div className="pth-fb pth-fb--good">✅ Nhớ đúng!{diffPart}{noteText && <div className="pth-muted pth-fb-note">{noteText}</div>}</div>
          : <div className="pth-fb pth-fb--bad">{res.failed && <div>Gõ sai 1 từ 3 lần nên câu này tính sai — xem câu đúng rồi làm lại nha.</div>}{diffPart}<div><b>Câu đúng:</b> <En s={s} /></div></div>)}
      </div>
      <div className="pth-actions" id="pth-recall-actions">
        {res ? <NextBtn label={nextLabel} onNext={onNext} /> : (
          <>
            <button className="pth-btn" id="pth-giveup" onClick={giveUp}>{exam ? <><i className="fas fa-forward" /> Bỏ qua</> : <><i className="fas fa-eye" /> Không nhớ</>}</button>
            {hints > 0 && <AskBtn id="pth-hint" onClick={hint} left={left} />}
            <button className="pth-btn pth-btn--primary" id="pth-recall-check" style={wbw ? { display: 'none' } : undefined} onClick={check}><i className="fas fa-check" /> Kiểm tra</button>
          </>
        )}
      </div>
    </>
  );
}
