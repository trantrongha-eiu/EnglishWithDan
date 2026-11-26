import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { siteToast } from '../../utils/shell';
import {
  conclAsksOpinion, conclChecks, DRILL_MODES, ESSAY_LABELS, GF_MAX_TRIES, gfBlanks, gfHint, gfNorm, gfOptions, isGfQuestion, isOrdQuestion,
  isStaff, MC_TYPES, ORD_MAX_TRIES, ordChunks, Q_LABELS, qid, sentenceParts, spanPieces, speakSentence, templateFor, tplSection,
  WBW_MAX_ASKS, WBW_MAX_WORD_ERRORS, WBW_TYPES, wbwTokenize, wc,
} from '../../utils/task2Practice';
import { ideaSides } from './lib';
import { InfoBody, InfoBtn, TplLine } from './Parts';

// One question of a practice / exam run — the old renderQuestion() and its
// drills. Practice: the card grades the "Dịch câu" drills itself and hands
// the result to onSubmit; the run sends the rest to /api/task2/check.
// Exam: no drills, no hints — onNext(answer) moves on.

const play = (ok) => (ok ? window.playOk?.() : window.playWrong?.());
const lulu = (btn, text) => window.AskLulu?.say?.(btn, text);
const isTyping = (t) => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

function usePasteGuard(ref, hint) {
  useEffect(() => {
    const el = ref.current;
    if (el && !isStaff() && window.PasteGuard) window.PasteGuard.attach(el, { hint });
  }, [ref, hint]);
}

function AskButton({ id, onClick, left, disabled, title, btnRef }) {
  return (
    <button type="button" className="wbw-ask ask-lulu" id={id} ref={btnRef} onClick={onClick} title={title} disabled={disabled || left <= 0}>
      <span className="ask-lulu-ic" /> <span>Hỏi Lulu</span><span className="ask-lulu-left"> ({Math.max(0, left)})</span>
    </button>
  );
}

const StructureHint = ({ q }) => (q.sentenceStructure
  ? <div className="t2-structure-hint"><span className="t2-structure-hint-label">💡 Gợi ý:</span><span>{q.sentenceStructure}</span></div> : null);
function KeywordRow({ q }) {
  const kw = q.fallbackKeywords && q.fallbackKeywords.length ? q.fallbackKeywords : (q.hints && q.hints.length ? q.hints : []);
  if (!kw.length) return null;
  return <div className="t2-kw-row"><span className="t2-kw-label">🔑 Từ khóa</span>{kw.map((w, i) => <span key={i} className="t2-kw-chip">{w}</span>)}</div>;
}
const ViRow = ({ q }) => (q.promptVi ? <div className="t2-vi-row"><span className="t2-vi-label">🇻🇳 Nghĩa</span><span className="t2-vi-text">{q.promptVi}</span></div> : null);

// The instruction line + the Vietnamese sentence (type / order formats)
function DrillPrompt({ q }) {
  if (q.type !== 'translation') return <div className="t2-question-text">{q.questionText}</div>;
  const parts = String(q.questionText || '').trim().split(/\n\s*\n/);
  const { vi } = sentenceParts(q.questionText, true);
  const head = parts.length > 1 ? parts[0].trim().replace(/[:：]\s*$/, '') : '';
  return <div className="t2-drill-prompt">{head && <div className="t2-drill-ask">{head}</div>}<div className="t2-vi-main"><span className="t2-flag">VI</span><span>{vi}</span></div></div>;
}

// ── Gõ cả câu: word by word, letter by letter ───────────────────────────
function WbwDrill({ q, answered, meta, onMeta, onSubmit, onBridge, info }) {
  const tokens = useMemo(() => wbwTokenize(q.translationAnswer), [q.translationAnswer]);
  const [st, setSt] = useState(() => ({ active: answered ? tokens.length : 0, typed: '', erroring: false, errors: 0, failed: false, done: answered, just: -1 }));
  const [asks, setAsks] = useState(meta.asks || 0);
  const input = useRef(null);
  const ask = useRef(null);
  const composing = useRef(false);
  const S = useRef(st);
  const timers = useRef([]);
  const set = (next) => { S.current = next; setSt(next); };
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const locked = st.done;
  const para = q.type !== 'translation';

  useEffect(() => { if (!answered) { const id = setTimeout(() => input.current?.focus(), 30); return () => clearTimeout(id); } return undefined; }, [answered]);
  const focus = () => { if (!S.current.done) input.current?.focus(); };

  function complete(s) {
    const next = { ...s, done: true };
    set(next);
    input.current?.blur();
    onBridge(q.translationAnswer);
    later(() => onSubmit({ answer: q.translationAnswer, verbatim: true }), 550);
  }
  function fail(s) {
    const stuck = tokens[s.active];
    set({ ...s, failed: true, done: true, erroring: false });
    if (input.current) { input.current.value = ''; input.current.blur(); }
    const partial = tokens.slice(0, s.active).map((t) => t.raw).join(' ');
    later(() => onSubmit({ answer: partial, wbwFail: { word: stuck ? stuck.raw.replace(/[^A-Za-z0-9'-]/g, '') : '' } }), 450);
  }
  function onInput() {
    const s = S.current;
    if (s.done || composing.current) return;
    const el = input.current;
    const tok = tokens[s.active];
    const raw = el.value.replace(/[^A-Za-z0-9]/g, '');
    let good = ''; let rejected = false;
    for (const ch of raw) {
      const expected = tok.target[good.length];
      if (expected === undefined) break;
      if (ch.toLowerCase() === expected.toLowerCase()) good += ch;
      else { rejected = true; break; }
    }
    el.value = good; // active recall: never auto-fill
    if (rejected) {
      // A second wrong key during the 260ms shake isn't a separate try
      const errors = s.erroring ? s.errors : s.errors + 1;
      if (errors >= WBW_MAX_WORD_ERRORS) { fail({ ...s, typed: good, errors }); return; }
      if (s.erroring) { set({ ...s, typed: good }); return; }
      set({ ...s, typed: good, errors, erroring: true });
      later(() => { if (!S.current.done) set({ ...S.current, erroring: false }); }, 260);
      return;
    }
    if (good.length < tok.target.length) { set({ ...s, typed: good }); return; }
    // the active word is complete
    const next = { ...s, active: s.active + 1, typed: '', errors: 0, just: s.active };
    el.value = '';
    play(true);
    onBridge(tokens.slice(0, next.active).map((t) => t.raw).join(' '));
    if (next.active >= tokens.length) complete(next);
    else { set(next); focus(); }
  }
  // "Hỏi Lulu": the next letter of the word being typed — never typed in
  function askLulu() {
    const s = S.current;
    if (s.done || asks >= WBW_MAX_ASKS) return;
    const tok = tokens[s.active];
    if (!tok) return;
    const nextCh = tok.target.charAt(s.typed.length);
    if (nextCh && window.AskLulu) {
      const n = asks + 1;
      setAsks(n);
      onMeta({ asks: n });
      const so = s.typed + nextCh;
      lulu(ask.current, `Chữ tiếp theo là “${nextCh}” nè — từ này bắt đầu “${so}${so.length < tok.target.length ? '…' : ''}” 🍊`);
    }
    focus();
  }

  const cur = tokens[st.active];
  return (
    <>
      <DrillPrompt q={q} />
      {para && <ViRow q={q} />}
      <StructureHint q={q} />
      <KeywordRow q={q} />
      <div className="wp-hints-row" id="hints-row" />
      <div className="t2-wbw" id="wbw">
        <div className="t2-wbw-bar">
          <span className={`t2-wbw-count${(st.done && !st.failed ? tokens.length : st.active) === tokens.length && tokens.length > 0 ? ' is-full' : ''}`} id="wbw-count">{st.done && !st.failed ? tokens.length : st.active} / {tokens.length} từ</span>
          <AskButton id="wbw-ask" btnRef={ask} onClick={askLulu} left={WBW_MAX_ASKS - asks} disabled={locked} title="Hỏi Lulu chữ cái tiếp theo" />
          <InfoBtn k="drill-type" info={info} />
        </div>
        <InfoBody k="drill-type" info={info}>
          {para ? 'Gõ lại đoạn mẫu từng chữ — đúng thì tự mở từ tiếp theo.' : 'Gõ từng chữ cái — đúng thì tự mở từ tiếp theo. Dấu câu tự thêm, Backspace để xoá, bí chữ nào thì hỏi Lulu.'} <b>Gõ sai 1 từ {WBW_MAX_WORD_ERRORS} lần là câu tính sai</b> và quay lại sau.
        </InfoBody>
        <div className="t2-wbw-words" id="wbw-words" onClick={focus}>
          {tokens.map((t, i) => {
            if (i < st.active) return <span key={i} className={`t2-wbw-word is-done${st.just === i ? ' just-done' : ''}`} data-i={i}>{t.raw}</span>;
            if (i === st.active && st.failed) return <span key={i} className="t2-wbw-word is-active is-error" data-i={i}>{t.raw}</span>;
            if (i === st.active && !st.done) {
              return (
                <span key={i} className={`t2-wbw-word is-active${st.erroring ? ' is-error' : ''}`} data-i={i}>
                  {st.typed}{st.erroring ? <span className="t2-wbw-err">✕</span> : <span className="t2-wbw-caret" />}<span className="t2-wbw-star">{'*'.repeat(Math.max(0, t.target.length - st.typed.length))}</span>
                </span>
              );
            }
            return <span key={i} className="t2-wbw-word is-locked" data-i={i}>{t.mask}</span>;
          })}
        </div>
        <input className={`t2-wbw-input${st.erroring ? ' is-error' : ''}`} id="wbw-input" type="text" autoComplete="off" ref={input}
          autoCapitalize="off" autoCorrect="off" spellCheck="false" aria-label="Gõ từng từ" disabled={locked}
          placeholder={!locked && cur ? cur.mask : ''}
          onInput={onInput} onPaste={(e) => e.preventDefault()}
          onKeyDown={(e) => { if (!S.current.done && (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar')) e.preventDefault(); }}
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={() => { composing.current = false; onInput(); }} />
      </div>
    </>
  );
}

// ── Ghép cụm: click the phrases into order ──────────────────────────────
function OrdDrill({ q, answered, meta, onMeta, onSubmit, submitting, info, bank, regSubmit }) {
  const chunks = useMemo(() => ordChunks(q.translationAnswer), [q.translationAnswer]);
  const [o, setO] = useState(() => ({ picked: answered ? chunks.map((_, i) => i) : [], wrongFrom: -1, done: answered }));
  const [tries, setTries] = useState(meta.ordTries || 0);
  const [asks, setAsks] = useState(meta.asks || 0);
  const ask = useRef(null);
  const firstWrong = (picked) => { for (let k = 0; k < picked.length; k++) if (chunks[picked[k]] !== chunks[k]) return k; return -1; };
  const text = o.picked.map((i) => chunks[i]).join(' ');
  const blocked = o.done || submitting;

  function pick(ci) { if (blocked || o.picked.includes(ci)) return; setO({ ...o, picked: [...o.picked, ci], wrongFrom: -1 }); }
  function unpick(k) { if (blocked) return; const picked = o.picked.slice(); picked.splice(k, 1); setO({ ...o, picked, wrongFrom: -1 }); }
  // "Hỏi Lulu": takes back the phrases from the first wrong one on, or puts the next right phrase in place
  function askLulu() {
    if (blocked || asks >= WBW_MAX_ASKS) return;
    const k = firstWrong(o.picked);
    let msg; let picked;
    if (k >= 0) {
      picked = o.picked.slice(0, k);
      msg = `Từ cụm thứ ${k + 1} là lạc chỗ rồi — tớ gỡ ra giúp cậu nè. Cụm đúng tiếp theo bắt đầu bằng “${chunks[k].split(' ')[0]}…” 🍊`;
    } else if (o.picked.length < chunks.length) {
      const nx = o.picked.length;
      const ci = chunks.findIndex((c, i) => c === chunks[nx] && !o.picked.includes(i));
      picked = [...o.picked, ci];
      msg = `Cụm tiếp theo là “${chunks[nx]}” nè 🍊`;
    } else { lulu(ask.current, 'Xếp đúng hết rồi đó, bấm Kiểm tra thôi! 🎉'); return; }
    const n = asks + 1;
    setAsks(n); onMeta({ asks: n });
    setO({ ...o, picked, wrongFrom: -1 });
    lulu(ask.current, msg);
  }
  // Checked here, no AI: a wrong order below the cap marks the slip
  function submit() {
    if (o.picked.length < chunks.length) { siteToast('Hãy xếp hết các cụm đã nhé.', 'warn'); return; }
    const fw = firstWrong(o.picked);
    const ok = fw < 0;
    if (!ok) {
      const n = tries + 1;
      setTries(n); onMeta({ ordTries: n });
      if (n < ORD_MAX_TRIES) {
        setO({ ...o, wrongFrom: fw });
        play(false);
        siteToast(`Chưa đúng thứ tự — từ cụm tô đỏ trở đi là sai chỗ. Còn ${ORD_MAX_TRIES - n} lần thử.`, 'warn', 2800);
        return;
      }
    }
    setO({ ...o, done: true, wrongFrom: ok ? -1 : fw });
    onSubmit({ answer: text, ord: { ok } });
  }
  useEffect(() => { regSubmit(submit, !o.done && o.picked.length === chunks.length); });

  const tr = q.type === 'translation';
  const left = bank.filter((ci) => !o.picked.includes(ci));
  return (
    <>
      <DrillPrompt q={q} />
      {!tr && <ViRow q={q} />}
      <KeywordRow q={q} />
      <div className="t2-ord" id="t2-ord">
        <div className="t2-wbw-bar">
          <span className={`t2-wbw-count${o.picked.length === chunks.length ? ' is-full' : ''}`} id="ord-count">{o.picked.length} / {chunks.length} cụm</span>
          <button type="button" className="wbw-ask ask-lulu" id="ord-ask" ref={ask} onClick={askLulu} title="Hỏi Lulu cụm tiếp theo" disabled={answered || asks >= WBW_MAX_ASKS}>
            <span className="ask-lulu-ic" /> <span>Hỏi Lulu</span><span className="ask-lulu-left"> ({Math.max(0, WBW_MAX_ASKS - asks)})</span>
          </button>
          <InfoBtn k="drill-order" info={info} />
        </div>
        <InfoBody k="drill-order" info={info}>
          Bấm các cụm theo đúng thứ tự để ghép thành {q.type === 'short_writing' ? 'đoạn kết bài' : 'câu tiếng Anh'}. Bấm vào cụm đã chọn để gỡ ra. <b>Xếp sai {ORD_MAX_TRIES} lần là câu tính sai</b> và quay lại sau.
        </InfoBody>
        <div className="wp-rearrange-answer t2-ord-answer" id="ord-answer">
          {o.picked.length
            ? o.picked.map((ci, k) => <span key={k} className={`wp-answer-chip${o.wrongFrom >= 0 && k >= o.wrongFrom ? ' is-wrong' : ''}${o.done ? ' is-locked' : ''}`} onClick={() => unpick(k)}>{chunks[ci]}</span>)
            : <span className="wp-rearrange-placeholder">Bấm các cụm bên dưới theo đúng thứ tự...</span>}
        </div>
        <div className={`wp-rearrange-bank t2-ord-bank${left.length ? '' : ' hidden'}`} id="ord-bank">
          {left.map((ci) => <span key={ci} className="wp-word-chip" onClick={() => pick(ci)}>{chunks[ci]}</span>)}
        </div>
      </div>
    </>
  );
}

// ── Chọn cụm / Điền cụm / Nghe & điền ───────────────────────────────────
function GfDrill({ q, answered, meta, onMeta, onSubmit, submitting, info, pool, regSubmit }) {
  const mode = q._mode;
  const blanks = useMemo(() => gfBlanks(q), [q]);
  const options = useMemo(() => (mode === 'mcq' ? gfOptions(q, pool) : null), [q, mode, pool]);
  const { vi } = sentenceParts(q.questionText, true);
  const [vals, setVals] = useState(() => blanks.map((b) => (answered ? b.text : '')));
  const [marks, setMarks] = useState(() => blanks.map(() => (answered ? 'ok' : null)));
  const [picked, setPicked] = useState(null);
  const [tries, setTries] = useState(meta.gfTries || 0);
  const [asks, setAsks] = useState(meta.asks || 0);
  const [done, setDone] = useState(answered);
  const [viOpen, setViOpen] = useState(false);
  const inputs = useRef([]);
  const ask = useRef(null);
  const results = (v = vals) => v.map((x, k) => !!blanks[k] && gfNorm(x) === gfNorm(blanks[k].text));

  useEffect(() => {
    if (answered) return undefined;
    const a = setTimeout(() => inputs.current[0]?.focus({ preventScroll: true }), 30);
    const b = mode === 'listen' ? setTimeout(() => speakSentence(q.translationAnswer, false), 350) : 0;
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [answered, mode, q.translationAnswer]);

  const filled = (o) => {
    const v = mode === 'mcq' ? blanks.map(() => (o ? o.text : '')) : vals.map((x) => x.trim());
    const ans = q.translationAnswer;
    let out = ''; let pos = 0;
    blanks.forEach((b, k) => { out += ans.slice(pos, b.start) + (v[k] || '___'); pos = b.end; });
    return out + ans.slice(pos);
  };
  // The sentence as the student completed it, fills right / wrong (feedback card)
  const studentPieces = (o, res) => spanPieces(q.translationAnswer, blanks).map((p) => (p.span == null ? p
    : { text: mode === 'mcq' ? (o ? o.text : '___') : (vals[p.span].trim() || '___'), fill: mode === 'mcq' ? !!(o && o.ok) : res[p.span] }));

  function finish(ok, o) {
    setDone(true);
    const res = results();
    onSubmit({ answer: ok ? q.translationAnswer : filled(o), gf: { ok, mode, student: studentPieces(o, res) } });
  }
  function pick(i) {
    if (done || submitting || !options[i]) return;
    setPicked(i);
    finish(!!options[i].ok, options[i]);
  }
  function submit() {
    if (mode === 'mcq') { if (picked == null) { siteToast('Hãy chọn một đáp án.', 'warn'); return; } return; }
    const empty = vals.findIndex((v) => !v.trim());
    if (empty >= 0) { siteToast('Hãy điền hết các chỗ trống nhé.', 'warn'); inputs.current[empty]?.focus(); return; }
    const res = results();
    const ok = res.every(Boolean);
    if (!ok) {
      const n = tries + 1;
      setTries(n); onMeta({ gfTries: n });
      if (n < GF_MAX_TRIES) {
        setMarks(res.map((r) => (r ? 'ok' : 'wrong')));
        play(false);
        siteToast(`Chưa đúng — ô tô đỏ cần sửa. Còn ${GF_MAX_TRIES - n} lần thử.`, 'warn', 2800);
        inputs.current[res.findIndex((r) => !r)]?.select();
        return;
      }
    }
    finish(ok, null);
  }
  useEffect(() => { regSubmit(submit, !done && (mode === 'mcq' ? picked != null : vals.every((v) => v.trim()))); });

  // 1–4 picks an option (not while typing somewhere)
  useEffect(() => {
    if (mode !== 'mcq' || done) return undefined;
    const key = (e) => {
      if (!/^[1-4]$/.test(e.key) || isTyping(e.target)) return;
      e.preventDefault();
      pick(Number(e.key) - 1);
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  });

  // "Hỏi Lulu" on a gap/listen sentence: the next letter of the first blank that isn't right
  function askLulu() {
    if (done || mode === 'mcq' || asks >= WBW_MAX_ASKS) return;
    const k = results().findIndex((r) => !r);
    if (k < 0) { lulu(ask.current, 'Điền đúng hết rồi đó, bấm Kiểm tra thôi! 🎉'); return; }
    const target = blanks[k].text;
    const typed = vals[k];
    let n = 0;
    while (n < typed.length && n < target.length && typed[n].toLowerCase() === target[n].toLowerCase()) n++;
    const nextCh = target.charAt(n);
    const c = asks + 1;
    setAsks(c); onMeta({ asks: c });
    lulu(ask.current, `Ô ${k + 1}: chữ tiếp theo là “${nextCh === ' ' ? 'dấu cách' : nextCh}” — bắt đầu “${target.slice(0, n + 1)}${n + 1 < target.length ? '…' : ''}” 🍊`);
    inputs.current[k]?.focus();
  }
  function onKey(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    e.stopPropagation();
    const empty = vals.findIndex((v) => !v.trim());
    if (empty >= 0) inputs.current[empty]?.focus(); else submit();
  }

  const how = {
    mcq: 'Chọn cụm từ đúng điền vào chỗ trống để câu tiếng Anh có nghĩa giống câu tiếng Việt. Chọn 1 lần — sai thì câu quay lại sau và lần đó bạn phải tự điền. Phím 1–4 để chọn nhanh.',
    gap: `Điền cụm từ còn thiếu (ô trống có gợi ý chữ cái đầu). Enter để kiểm tra. Sai ${GF_MAX_TRIES} lần là câu tính sai và quay lại sau.`,
    listen: `Nghe câu rồi điền các từ còn thiếu — nghe lại hoặc nghe chậm bao nhiêu lần cũng được. Sai ${GF_MAX_TRIES} lần là câu tính sai và quay lại sau.`,
  }[mode];
  const pieces = spanPieces(q.translationAnswer, blanks);
  return (
    <>
      {mode === 'listen' ? (
        <div className="t2-drill-prompt is-listen">
          <div className="t2-listen-bar">
            <button type="button" className="t2-listen-btn" onClick={() => speakSentence(q.translationAnswer, false)}><i className="fas fa-volume-up" /> Nghe</button>
            <button type="button" className="t2-listen-btn is-slow" onClick={() => speakSentence(q.translationAnswer, true)}><i className="fas fa-person-walking" /> Nghe chậm</button>
            <button type="button" className="t2-link" onClick={() => setViOpen(!viOpen)} aria-expanded={viOpen ? 'true' : 'false'}><span className="t2-flag">VI</span> Xem nghĩa</button>
          </div>
          <div className="t2-vi-main" id="gf-vi" hidden={!viOpen}><span className="t2-flag">VI</span><span>{vi}</span></div>
        </div>
      ) : <div className="t2-drill-prompt"><div className="t2-vi-main"><span className="t2-flag">VI</span><span>{vi}</span></div></div>}
      <div className={`t2-gf ${DRILL_MODES[mode].cls}`} id="t2-gf">
        <div className="t2-wbw-bar">
          <span className={`t2-wbw-count${mode !== 'mcq' && tries > 0 && !done ? ' is-warn' : ''}`} id="gf-count">
            {mode === 'mcq' ? `Chọn 1 trong ${options.length}` : `${blanks.length} chỗ trống · còn ${Math.max(0, GF_MAX_TRIES - tries)} lần thử`}
          </span>
          {mode !== 'mcq' && (
            <button type="button" className="wbw-ask ask-lulu" id="gf-ask" ref={ask} onClick={askLulu} title="Hỏi Lulu chữ cái tiếp theo" disabled={done || asks >= WBW_MAX_ASKS}>
              <span className="ask-lulu-ic" /> <span>Hỏi Lulu</span>{!answered && <span className="ask-lulu-left"> ({Math.max(0, WBW_MAX_ASKS - asks)})</span>}
            </button>
          )}
          <InfoBtn k={'drill-' + mode} info={info} />
        </div>
        <InfoBody k={'drill-' + mode} info={info}>{how}</InfoBody>
        <div className="t2-gf-sentence"><span className="t2-flag is-en">EN</span>
          {pieces.map((p, i) => {
            if (p.span == null) return <Fragment key={i}>{p.text}</Fragment>;
            const k = p.span;
            if (mode === 'mcq') return <span key={i} className="t2-gf-slot" id="gf-slot">{picked != null ? options[picked].label : '?'}</span>;
            return (
              <input key={i} ref={(el) => { inputs.current[k] = el; }} className={`t2-gf-in${marks[k] === 'wrong' ? ' is-wrong' : marks[k] === 'ok' ? ' is-ok' : ''}`} id={`gf-in-${k}`} data-k={k} type="text"
                autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck="false" style={{ width: `${Math.max(5, p.text.length + 2)}ch` }}
                placeholder={mode === 'gap' ? gfHint(p.text) : ''} aria-label={`Chỗ trống ${k + 1}`} disabled={done} value={vals[k]}
                onChange={(e) => { const v = vals.slice(); v[k] = e.target.value; setVals(v); const m = marks.slice(); m[k] = null; setMarks(m); }}
                onPaste={(e) => e.preventDefault()} onKeyDown={onKey} />
            );
          })}
        </div>
        {mode === 'mcq' && (
          <div className="t2-mc-options t2-gf-opts">
            {options.map((o, i) => (
              <button key={i} type="button" className={`t2-mc-option${picked === i ? ' selected' : ''}${answered && o.ok ? ' correct' : ''}`} data-i={i} onClick={() => pick(i)} disabled={done}>
                <span className="t2-opt-letter">{i + 1}</span><span>{o.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Tự viết kết bài (short_writing): the student's own conclusion, AI-graded ──
function Conclusion({ q, ctx, regSubmit, onSubmit }) {
  const t = ctx.t;
  const asks = conclAsksOpinion(t);
  const sides = ideaSides(t).map((s) => s.side);
  const L = ctx.lesson.status === 'ready' ? ctx.lesson : null;
  const prev = L ? (L.sentences.find((s) => s.questionId === qid(q)) || {}).en || '' : '';
  const [text, setText] = useState(prev);
  const ta = useRef(null);
  usePasteGuard(ta, 'tự viết kết bài bằng lời của bạn nha!');
  const sec = L ? L.sections : {};
  const mine = [
    ...((sec.body1 || '').trim() ? [['Thân bài 1 của bạn', sec.body1]] : []),
    ...((sec.body2 || '').trim() ? [['Thân bài 2 của bạn', sec.body2]] : []),
    ...sides.map((s, i) => [s, ctx.notes[i] || '']).filter(([, n]) => n.trim()),
  ];
  const tplSec = ctx.tplData ? tplSection(templateFor(ctx.tplData, t, 'band7'), 'conclusion') : null;
  const canSubmit = wc(text) >= 15;
  useEffect(() => { regSubmit(() => onSubmit({ answer: text.trim() }), canSubmit); });
  return (
    <>
      <div className="wp-task-label">✍️ Tự viết đoạn kết bài</div>
      <div className="t2-concl">
        <div className="t2-concl-block">
          <div className="t2-concl-k">📘 Template kết bài · Band 7+ <span>{ESSAY_LABELS[t.essayType] || ''}</span></div>
          <ol className="t2-concl-tpl" id="t2-concl-tpl">
            {ctx.tplData == null ? <p className="t2c-note"><i className="fas fa-spinner fa-spin" /> Đang tải template...</p>
              : !tplSec ? <p className="t2c-note">Chưa có template kết bài cho dạng này.</p>
                : (tplSec.lines || []).map((ln, i) => (
                  <li key={i}>{ln.label && <div className="t2-concl-tpl-vi">{ln.label}</div>}<div className="t2-concl-tpl-en"><TplLine en={ln.en} /></div>{ln.vi && <div className="t2-concl-tpl-vi">{String(ln.vi).replace(/^→\s*/, '')}</div>}</li>
                ))}
          </ol>
          <p className="t2-concl-note">Thay phần <mark>(…)</mark> bằng ý của đề này — dùng khung câu, <b>đừng chép nguyên văn</b>.</p>
        </div>
        <div className="t2-concl-block is-hint">
          <div className="t2-concl-k">💡 Gợi ý viết</div>
          <ul className="t2-concl-hints">
            <li>Mở đầu bằng <b>In conclusion,</b> / <b>To sum up,</b></li>
            <li><b>Tóm tắt lại các ý đã viết ở thân bài</b>{sides.length > 1 ? ` (${sides.join(' + ')})` : ''} — diễn đạt ngắn gọn, <b>không thêm ý mới</b>.</li>
            {asks
              ? <li>Đề <b>hỏi ý kiến</b> của bạn → nhắc lại rõ quan điểm: <i>I believe / In my view, …</i></li>
              : <li>Đề không hỏi ý kiến → có thể kết bằng một lời khuyến nghị hoặc dự đoán ngắn.</li>}
            <li>Cố gắng dùng <b>câu điều kiện loại 1 hoặc 2</b>:
              <div className="t2-concl-cond"><span className="t2-concl-tag">Loại 1</span> <i>If governments invest in …, … <b>will</b> be significantly reduced.</i></div>
              <div className="t2-concl-cond"><span className="t2-concl-tag is-2">Loại 2</span> <i>If more people <b>were</b> aware of …, they <b>would</b> …</i></div>
            </li>
          </ul>
          {mine.length > 0 && (
            <details className="t2-concl-mine"><summary>Xem lại ý bạn đã có để tóm tắt</summary>
              {mine.map(([k, v], i) => <Fragment key={i}><div className="t2-concl-mine-k">{k}</div><div className="t2-concl-mine-v">{v}</div></Fragment>)}
            </details>
          )}
        </div>
        <textarea ref={ta} className="wp-answer-box t2-writing-area t2-concl-ta" id="answer-box" rows={6} spellCheck="false" placeholder="In conclusion, …" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="t2-concl-checks" id="t2-concl-checks" aria-live="polite">
          {conclChecks(text, t).map((c, i) => <span key={i} className={`t2-concl-chk${c.ok ? ' ok' : ''}${c.bonus ? ' is-bonus' : ''}`}><i className={`fas fa-${c.ok ? 'check' : c.bonus ? 'star' : 'circle'}`} /> {c.label}</span>)}
        </div>
      </div>
    </>
  );
}

// ── The classic types (also Thi thử) ────────────────────────────────────
function Classic({ q, exam, regSubmit, onSubmit, prep, onAnswer }) {
  const typeLbl = Q_LABELS[q.type] || q.type;
  const [mc, setMc] = useState(null);
  const [picked, setPicked] = useState([]); // rearrange: chip indices
  const [text, setText] = useState('');
  const words = prep.words || [];
  let answer; let canSubmit;
  if (MC_TYPES.has(q.type)) { answer = mc == null ? '' : String(mc); canSubmit = mc != null; }
  else if (q.type === 'rearrange') { answer = picked.map((i) => words[i]).join(' ').trim(); canSubmit = picked.length > 0; }
  else { answer = text.trim(); canSubmit = q.type === 'short_writing' && !exam ? wc(text) >= 15 : !!answer; }
  useEffect(() => { regSubmit(() => onSubmit({ answer }), canSubmit); onAnswer?.(answer); });
  const enter = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!exam) onSubmit({ answer }); } };

  if (MC_TYPES.has(q.type)) {
    return (
      <>
        <div className="wp-task-label">{typeLbl}</div>
        <div className="t2-question-text">{q.questionText}</div>
        <KeywordRow q={q} />
        <div className="t2-mc-options">
          {(q.options || []).map((opt, i) => (
            <button key={i} className={`t2-mc-option${mc === i ? ' selected' : ''}`} data-idx={i} onClick={() => setMc(i)}>
              <span className="t2-opt-letter">{'ABCD'[i]}</span><span>{opt}</span>
            </button>
          ))}
        </div>
      </>
    );
  }
  if (q.type === 'rearrange') {
    const displayText = q.questionText.replace(/\n?\[.*\]/s, '').trim();
    return (
      <>
        <div className="wp-task-label">{typeLbl}</div>
        <div className="t2-question-text">{displayText}</div>
        <ViRow q={q} />
        <StructureHint q={q} />
        <KeywordRow q={q} />
        <div className="wp-rearrange-answer" id="rearrange-answer">
          {picked.length
            ? picked.map((ci, k) => <span key={k} className="wp-answer-chip" onClick={() => { const p = picked.slice(); p.splice(k, 1); setPicked(p); }}>{words[ci]}</span>)
            : <span className="wp-rearrange-placeholder">Bấm vào các từ để sắp xếp...</span>}
        </div>
        <div className="wp-rearrange-bank" id="rearrange-bank">
          {words.map((w, i) => {
            const used = picked.includes(i);
            return <span key={i} className={`wp-word-chip${used ? ' wp-chip-used' : ''}`} data-index={i} data-word={w} data-used={used ? 'true' : 'false'} onClick={() => { if (!used) setPicked([...picked, i]); }}>{w}</span>;
          })}
        </div>
      </>
    );
  }
  if (q.type === 'fill_blank') {
    return (
      <>
        <div className="wp-task-label">{typeLbl}</div>
        <div className="t2-question-text">{q.questionText}</div>
        <StructureHint q={q} />
        <KeywordRow q={q} />
        <input className="wp-fill-input" id="fill-input" type="text" placeholder="Nhập từ cần điền..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={enter} />
      </>
    );
  }
  // translation / paraphrase / short_writing with no model shipped, error_correction
  const isLong = ['short_writing', 'paraphrase'].includes(q.type);
  const n = text.trim().split(/\s+/).filter(Boolean).length;
  return (
    <>
      <div className="wp-task-label">{typeLbl}</div>
      <div className="t2-question-text">{q.questionText}</div>
      {q.answerWordCount && (
        <div className="t2-answer-hint">
          <span className="t2-answer-hint-count">📏 {q.answerWordCount} từ</span>
          <span className="t2-answer-hint-pattern">{q.answerLetterHint || ''}</span>
        </div>
      )}
      <StructureHint q={q} />
      <KeywordRow q={q} />
      {q.type === 'translation' && <div className="wp-hints-row" id="hints-row" />}
      <textarea className={`wp-answer-box${isLong ? ' t2-writing-area' : ''}`} id="answer-box" rows={isLong ? 6 : 3} placeholder={isLong ? 'Viết đoạn văn tại đây...' : 'Nhập câu trả lời tại đây...'}
        value={text} onChange={(e) => setText(e.target.value)} onKeyDown={isLong ? undefined : enter} />
      {isLong && <div className={`t2-word-count${n >= 60 ? ' good' : ''}`} id="word-count">{n} từ</div>}
    </>
  );
}

// The card: question + "Kiểm tra" (practice) or the drills' own submit.
// regSubmit(fn, canSubmit) lets the widget own what "Kiểm tra" does.
export function QuestionCard({ q, exam = false, answered, submitting, hidden, ctx, metaOf, onMeta, onSubmit, prep, onAnswer, children }) {
  const [meta] = useState(() => (metaOf ? metaOf(q._uid) : {}));
  const sub = useRef({ fn: null });
  const [can, setCan] = useState(false);
  const regSubmit = (fn, ok) => { sub.current.fn = fn; if (ok !== can) setCan(ok); };
  const [bridge, setBridge] = useState(answered && q.translationAnswer ? q.translationAnswer : '');

  let body;
  const common = { q, answered, meta, onMeta, onSubmit, submitting, info: ctx.info, regSubmit };
  if (!exam && q.type === 'short_writing') body = <Conclusion q={q} ctx={ctx} regSubmit={regSubmit} onSubmit={onSubmit} />;
  else if (!exam && isGfQuestion(q)) body = <GfDrill {...common} pool={ctx.pool} />;
  else if (!exam && isOrdQuestion(q)) body = <OrdDrill {...common} bank={prep.bank || []} />;
  else if (!exam && WBW_TYPES.has(q.type) && q.translationAnswer) {
    body = <WbwDrill {...common} onBridge={setBridge} />;
  } else body = <Classic q={q} exam={exam} regSubmit={regSubmit} onSubmit={onSubmit} prep={prep} onAnswer={onAnswer} />;
  const isWbw = !exam && !isGfQuestion(q) && !isOrdQuestion(q) && q.type !== 'short_writing' && WBW_TYPES.has(q.type) && !!q.translationAnswer;
  const hideSubmit = !exam && isGfQuestion(q) && q._mode === 'mcq'; // a pick submits by itself

  // The typing drill's "Kiểm tra" sends the words typed so far (old hidden #answer-box)
  function check() {
    if (submitting) return;
    if (isWbw) onSubmit({ answer: bridge.trim() });
    else sub.current.fn?.();
  }
  const enabled = isWbw ? !!bridge.trim() : can;
  return (
    <div className={`wp-card${hidden ? ' hidden' : ''}`} style={{ margin: '0 20px' }} id={exam ? undefined : 'qcard'}>
      {body}
      {isWbw && <textarea className="wp-answer-box hidden" id="answer-box" rows={3} aria-hidden="true" tabIndex={-1} value={bridge} readOnly />}
      {exam ? children : (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="wp-submit-btn" id="submit-btn" onClick={check} style={{ flex: 1, ...(hideSubmit ? { display: 'none' } : null) }} disabled={!enabled || submitting}>
            <i className="fas fa-check" /> Kiểm tra
          </button>
        </div>
      )}
    </div>
  );
}
