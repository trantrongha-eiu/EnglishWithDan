import { Fragment, useEffect, useRef, useState } from 'react';
import { luluSay } from '../../utils/shell';
import { Block } from './blocks';

// Self-checked practice inside a grammar lesson (V0 → V2/V3, verb tenses,
// Vietnamese → English). The score stays in the block: only the Mini Quiz and
// multiple-choice exercises count towards completing the lesson.

const match = (typed, answers) => {
  if (window.AnswerMatch) return window.AnswerMatch.isMatch(typed, answers);
  const u = String(typed).trim().toLowerCase();
  return answers.some((a) => a.trim().toLowerCase() === u);
};
const sound = (ok) => (ok ? window.playOk?.() : window.playWrong?.());

function shuffled(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shared by the two fill-in drills: Enter moves on, the last Enter checks
function useFillDrill(box, items) {
  const [results, setResults] = useState(null); // [{ ok, typed }] after a check
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (round > 0) box.current?.querySelector('.eg-drill-input')?.focus();
  }, [box, round]);

  function check() {
    const typed = [...box.current.querySelectorAll('.eg-drill-input')].map((el) => el.value.trim());
    const next = items.map((it, i) => ({ typed: typed[i], ok: !!typed[i] && match(typed[i], it.answers) }));
    setResults(next);
    sound(next.every((r) => r.ok));
  }
  function onKey(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const inputs = [...box.current.querySelectorAll('.eg-drill-input')];
    const next = inputs[inputs.indexOf(e.target) + 1];
    if (next) next.focus(); else check();
  }
  function restart() {
    setResults(null);
    setRound((r) => r + 1);
  }
  return { results, round, check, onKey, restart };
}

function DrillActions({ results, total, shuffle, onCheck, onReset }) {
  const correct = results ? results.filter((r) => r.ok).length : 0;
  const cls = results ? (correct / total >= 0.8 ? ' eg-drill-score-good' : ' eg-drill-score-bad') : '';
  return (
    <div className="eg-drill-actions">
      <button type="button" className="eg-ex-reveal-btn" onClick={onCheck}><i className="fas fa-check" /> Kiểm tra</button>
      <button type="button" className="eg-drill-btn-ghost" onClick={onReset}><i className="fas fa-redo" /> Làm lại{shuffle ? ' (xáo trộn)' : ''}</button>
      <span className={`eg-drill-score${cls}`}>{results ? `Đúng ${correct}/${total}${correct === total ? ' 🎉' : ''}` : ''}</span>
    </div>
  );
}

const rowClass = (base, r) => `eg-drill-row ${base}${r ? (r.ok ? ' eg-drill-ok' : ' eg-drill-bad') : ''}`;

function WrongLead({ r, answer }) {
  return <><i className="fas fa-times" /> {r.typed ? '' : 'Bỏ trống. '}Đáp án: <b>{answer}</b></>;
}

export function VerbForms({ data }) {
  const isPast = data.target === 'past';
  const [items, setItems] = useState(() => (data.items || []).map((verb) => ({ verb, answers: isPast ? verb.past : verb.pastParticiple })));
  const box = useRef(null);
  const drill = useFillDrill(box, items);
  if (!items.length) return null;
  const tag = isPast ? 'V2' : 'V3';
  const triple = (v) => `${v.base} – ${v.past.join(' / ')} – ${v.pastParticiple.join(' / ')}`;
  return (
    <Block icon="fa-exchange-alt" title={isPast ? 'Luyện chuyển động từ V0 → V2 (quá khứ)' : 'Luyện chuyển động từ V0 → V3 (quá khứ phân từ)'}>
      <div className="eg-drill-intro">
        {isPast
          ? `Viết dạng quá khứ V2 của ${items.length} động từ. Động từ có quy tắc thêm -ed (chú ý quy tắc chính tả); động từ bất quy tắc phải học thuộc. Nhấn Enter để sang ô tiếp theo.`
          : `Viết dạng quá khứ phân từ V3 (dùng sau have/has) của ${items.length} động từ. Nhiều động từ có V3 khác V2 (go – went – gone). Nhấn Enter để sang ô tiếp theo.`}
      </div>
      <div className="eg-vf-grid" ref={box}>
        {items.map((it, i) => {
          const r = drill.results?.[i];
          return (
            <div className={rowClass('eg-vf-row', r)} key={`${drill.round}-${it.verb.base}`}>
              <span className="eg-vf-num">{i + 1}.</span>
              <span className="eg-vf-word"><span className="eg-vf-base">{it.verb.base}</span><span className="eg-vf-mean">{it.verb.meaning}</span></span>
              <input className="eg-drill-input" type="text" autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder={tag} aria-label={`${tag} của ${it.verb.base}`} onKeyDown={drill.onKey} />
              <div className={`eg-drill-fb${r ? ' vis' : ''}`}>
                {r && (
                  <>
                    {r.ok ? <><i className="fas fa-check" /> </> : <><WrongLead r={r} answer={it.answers.join(' / ')} /> · </>}
                    <span className="eg-vf-triple">{triple(it.verb)}</span>
                    {!r.ok && it.verb.note && <div className="eg-drill-note">{it.verb.note}</div>}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <DrillActions results={drill.results} total={items.length} shuffle onCheck={drill.check} onReset={() => { setItems(shuffled); drill.restart(); }} />
    </Block>
  );
}

export function Conjugation({ data }) {
  const [items] = useState(() => (data.items || []).map((it) => ({ sentence: it.sentence, answers: it.answers || [], explanation: it.explanation || '' })));
  const box = useRef(null);
  const drill = useFillDrill(box, items);
  if (!items.length) return null;
  return (
    <Block icon="fa-pen" title={`${data.title || 'Luyện tập thêm: Chia động từ'} (${items.length} câu)`}>
      <div className="eg-drill-intro">
        {data.intro || <>Chia động từ trong ngoặc cho đúng thì. Viết cả trợ động từ (ví dụ: <b>has been working</b>, <b>doesn&apos;t open</b>). Nhấn Enter để sang câu tiếp theo.</>}
      </div>
      <div ref={box}>
        {items.map((it, i) => {
          const r = drill.results?.[i];
          const parts = String(it.sentence).split('___');
          const longest = Math.max(0, ...it.answers.map((a) => a.length));
          return (
            <div className={rowClass('eg-conj-row', r)} key={`${drill.round}-${i}`}>
              <div className="eg-conj-sentence">
                <span className="eg-vf-num">{i + 1}.</span> {parts[0]}
                <input className="eg-drill-input eg-conj-input" type="text" autoComplete="off" autoCapitalize="off" spellCheck={false} size={Math.max(8, longest + 2)} aria-label={`Câu ${i + 1}`} onKeyDown={drill.onKey} />
                {parts.slice(1).join('___')}
              </div>
              <div className={`eg-drill-fb${r ? ' vis' : ''}`}>
                {r && <>{r.ok ? <><i className="fas fa-check" /> Đúng. </> : <><WrongLead r={r} answer={it.answers[0]} />. </>}{it.explanation}</>}
              </div>
            </div>
          );
        })}
      </div>
      <DrillActions results={drill.results} total={items.length} onCheck={drill.check} onReset={drill.restart} />
    </Block>
  );
}

const DiffWords = ({ parts, missClass }) => parts.map((p, i) => (
  <Fragment key={i}>{i > 0 && ' '}{p.ok ? p.w : <span className={missClass}>{p.w}</span>}</Fragment>
));
const AnswerList = ({ list }) => list.map((a, i) => <div className="eg-tr-answer" key={i}>• {a}</div>);

function TranslationItem({ it, i, onStatus }) {
  const input = useRef(null);
  const [result, setResult] = useState(null);
  const [selfOk, setSelfOk] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  function check() {
    const typed = input.current.value.trim();
    const AM = window.AnswerMatch;
    setSelfOk(false);
    if (!typed) {
      onStatus(i, false);
      setResult({ kind: 'skip' });
    } else if (match(typed, it.answers)) {
      onStatus(i, true);
      setResult({ kind: 'ok', others: AM ? it.answers.filter((a) => !AM.isMatch(a, [typed])) : [] });
      sound(true);
    } else {
      onStatus(i, false);
      const best = AM ? AM.closest(typed, it.answers) : it.answers[0];
      setResult({ kind: 'bad', typed, best, diff: AM ? AM.diff(typed, best) : null, others: it.answers.filter((a) => a !== best) });
      sound(false);
    }
  }

  return (
    <div className="eg-tr-item">
      <div className="eg-tr-vi"><span className="eg-vf-num">{i + 1}.</span> {it.vi}</div>
      <textarea className="eg-ex-input eg-tr-input" ref={input} rows={2} placeholder="Viết câu tiếng Anh... (Ctrl+Enter để kiểm tra)"
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); check(); } }} />
      <div className="eg-tr-actions">
        <button type="button" className="eg-ex-reveal-btn" onClick={check}>Kiểm tra</button>
        {it.hint && (
          // Lulu says it in a bubble; it also stays written under the buttons
          <button type="button" className="eg-drill-btn-ghost ask-lulu" title="Hỏi Lulu gợi ý" onClick={(e) => { setHintOpen(true); luluSay(e.currentTarget, `${it.hint} 🍊`); }}><span className="ask-lulu-ic" /> Hỏi Lulu</button>
        )}
      </div>
      {it.hint && <div className={`eg-tr-hint${hintOpen ? ' vis' : ''}`}>🍊 Lulu gợi ý: <span className="eg-tr-hint-txt">{it.hint}</span></div>}
      <div className={`eg-tr-result${result ? ' vis' : ''}`}>
        {result?.kind === 'skip' && <><div className="eg-tr-head eg-tr-head-skip"><i className="fas fa-eye" /> Đáp án gợi ý:</div><AnswerList list={it.answers} /></>}
        {result?.kind === 'ok' && (
          <>
            <div className="eg-tr-head eg-tr-head-ok"><i className="fas fa-check-circle" /> Chính xác!</div>
            {result.others.length > 0 && <><div className="eg-tr-sub">Cách dịch khác:</div><AnswerList list={result.others} /></>}
          </>
        )}
        {result?.kind === 'bad' && (
          <>
            <div className="eg-tr-head eg-tr-head-bad"><i className="fas fa-exclamation-circle" /> Chưa khớp với đáp án gợi ý</div>
            <div className="eg-tr-line"><b>Bạn viết:</b> {result.diff ? <DiffWords parts={result.diff.user} missClass="eg-tr-extra" /> : result.typed}</div>
            <div className="eg-tr-line"><b>Đáp án gần nhất:</b> {result.diff ? <DiffWords parts={result.diff.answer} missClass="eg-tr-miss" /> : result.best}</div>
            {result.diff && <div className="eg-tr-legend"><span className="eg-tr-extra">chữ đỏ</span> = khác đáp án · <span className="eg-tr-miss">chữ xanh</span> = phần bạn thiếu hoặc viết khác</div>}
            {result.others.length > 0 && <><div className="eg-tr-sub">Cách dịch khác:</div><AnswerList list={result.others} /></>}
            <button type="button" className="eg-drill-btn-ghost eg-tr-self" disabled={selfOk} onClick={() => { setSelfOk(true); onStatus(i, true); }}>
              {selfOk ? <><i className="fas fa-check" /> Đã tính là đúng</> : <><i className="fas fa-user-check" /> Câu của tôi cũng đúng</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function Translation({ data }) {
  const [items] = useState(() => (data.items || []).map((it) => ({ vi: it.vi, answers: it.answers || [], hint: it.hint || '' })));
  const [status, setStatus] = useState(() => items.map(() => null));
  if (!items.length) return null;
  const done = status.filter((s) => s !== null).length;
  const correct = status.filter((s) => s === true).length;
  const cls = done === items.length ? (correct / done >= 0.8 ? ' eg-drill-score-good' : ' eg-drill-score-bad') : '';
  const setOne = (i, ok) => setStatus((list) => list.map((s, k) => (k === i ? ok : s)));
  return (
    <Block icon="fa-language" title={`${data.title || 'Luyện dịch câu Việt → Anh'} (${items.length} câu)`}>
      <div className="eg-drill-intro">{data.intro ? `${data.intro} ` : 'Dịch sang tiếng Anh, dùng đúng thì của bài. '}Máy so với các đáp án gợi ý (không phân biệt viết tắt, chữ hoa/thường, dấu câu). Nếu câu của bạn khác đáp án nhưng vẫn đúng, bấm <b>&quot;Câu của tôi cũng đúng&quot;</b>.</div>
      {items.map((it, i) => <TranslationItem key={i} it={it} i={i} onStatus={setOne} />)}
      <div className="eg-drill-actions"><span className={`eg-drill-score${cls}`}>{done ? `Đã làm ${done}/${items.length} câu · Đúng ${correct}` : ''}</span></div>
    </Block>
  );
}
