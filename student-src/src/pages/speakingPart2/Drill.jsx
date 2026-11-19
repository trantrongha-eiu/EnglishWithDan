// ⌨️ Dịch: Việt → Anh, typed word by word (the shared js/shared/wbw-drill.js,
// window.WbwDrill). The 3rd wrong try on one word fails the sentence; it
// comes back 3 questions later (at most twice). Then the result screen.
import { useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { MAX_ASKS, MAX_REQUEUES, MAX_WORD_ERRORS, REQUEUE_GAP, splitAt } from '../../utils/speakingPart2';
import { luluSay } from '../../utils/shell';
import { LuluSays, QuitDialog, RunHead, SayBtn, Sent } from './Parts';

// The drill itself: React never renders into its host
function Wbw({ answer, hostRef, onDone }) {
  const cb = useRef(onDone);
  useEffect(() => { cb.current = onDone; });
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !window.WbwDrill) return undefined;
    window.WbwDrill.mount(host, {
      answer,
      maxWordErrors: MAX_WORD_ERRORS,
      onComplete: () => cb.current(true),
      onFail: () => cb.current(false),
    });
    return () => window.WbwDrill.unmount(host);
  }, [answer, hostRef]);
  return <div id="sp2-wbw" ref={hostRef} />;
}

function Cloze({ ex, ans }) {
  const x = splitAt(ex, ans);
  if (!x) return ex;
  return <>{x[0]}<span className="sp2-blank">{ans.split(/\s+/).map(() => '_____').join(' ')}</span>{x[2]}</>;
}

const shown = (q) => (q.vocab ? q.vocab[3] : q.en);

function runStart(items) {
  return { qs: items, status: items.map(() => 'pending'), idx: 0, first: {}, wrong: {}, answered: false, ok: false, requeued: false, finished: false, asks: 0 };
}

// onQuit: "Thoát" (after "Dừng luyện tập?" while questions are left)
export default function Drill({ st, run, prefs, onRight, onFinish, onQuit, onRetry, onAgain, onBack }) {
  const [r, setR] = useState(() => runStart(run.items));
  const [asking, setAsking] = useState(false);
  const hostRef = useRef(null);
  const askRef = useRef(null);
  const autoT = useRef(null);
  const cur = useRef(r);
  useEffect(() => { cur.current = r; });
  useEffect(() => () => clearTimeout(autoT.current), []);

  const left = r.finished ? 0 : r.qs.length - r.idx - (r.answered ? 1 : 0);
  // Back / a link mid-drill asks first too (what was typed right is kept)
  const blocker = useBlocker(({ currentLocation: a, nextLocation: b }) => left > 0 && (a.pathname !== b.pathname || a.search !== b.search));
  const focusInput = () => {
    const i = hostRef.current?.querySelector('[data-role="input"]');
    if (i && !i.disabled) i.focus();
  };
  const quitBox = blocker.state === 'blocked'
    ? <QuitDialog left={left} onLeave={() => blocker.proceed()} onContinue={() => { blocker.reset(); focusInput(); }} />
    : asking && <QuitDialog left={left} onLeave={() => { setAsking(false); onQuit(); }} onContinue={() => { setAsking(false); focusInput(); }} />;
  const quit = () => { if (left > 0) setAsking(true); else onQuit(); };

  const q = r.qs[r.idx];

  function next() {
    clearTimeout(autoT.current);
    const x = cur.current;
    if (!x || !x.answered || x.finished) return;
    if (x.idx >= x.qs.length - 1) {
      const keys = Object.keys(x.first);
      const right = keys.filter((k) => x.first[k]).length;
      const score = keys.length ? Math.round((right / keys.length) * 100) : 0;
      setR({ ...x, finished: true, score, right, total: keys.length });
      onFinish(score);
      window.scrollTo(0, 0);
      if (score >= 80) { try { window.Mascot?.cheer?.(); } catch { /* none */ } }
      return;
    }
    setR({ ...x, idx: x.idx + 1, answered: false, asks: 0 });
  }

  function answer(ok) {
    const x = cur.current;
    if (!x || x.answered || x.finished) return;
    const qq = x.qs[x.idx];
    const qs = x.qs.slice(); const status = x.status.slice();
    const first = { ...x.first }; const wrong = { ...x.wrong };
    status[x.idx] = ok ? 'correct' : 'wrong';
    if (!(qq.key in first)) first[qq.key] = ok;
    let requeued = false;
    if (ok) { delete wrong[qq.key]; onRight(qq); } else {
      wrong[qq.key] = qq;
      const copies = qs.filter((y) => y.key === qq.key).length - 1;
      if (copies < MAX_REQUEUES) {
        const at = Math.min(x.idx + 1 + REQUEUE_GAP, qs.length);
        qs.splice(at, 0, { ...qq, _repeat: true });
        status.splice(at, 0, 'pending');
        requeued = true;
      }
    }
    const nx = { ...x, qs, status, first, wrong, answered: true, ok, requeued };
    cur.current = nx;
    setR(nx);
    if (ok && prefs.autoNext) { clearTimeout(autoT.current); autoT.current = setTimeout(next, 1100); }
  }

  // At most MAX_ASKS asks per question
  function ask() {
    const x = cur.current;
    const host = hostRef.current;
    const pk = host && window.WbwDrill?.peek(host);
    const btn = askRef.current;
    if (pk && window.AskLulu && btn && x && x.asks < MAX_ASKS) {
      const asks = x.asks + 1;
      setR({ ...x, asks });
      window.AskLulu.left(btn, MAX_ASKS - asks);
      luluSay(btn, 'Chữ tiếp theo là “' + pk.next + '” nè — từ này bắt đầu “' + pk.sofar + (pk.full ? '' : '…') + '” 🍊');
    }
    const inp = host?.querySelector('[data-role="input"]');
    if (inp && !inp.disabled) inp.focus();
  }

  // A new question: "Hỏi Lulu" starts again at 3
  useEffect(() => {
    if (r.finished || !askRef.current) return;
    window.AskLulu?.left?.(askRef.current, MAX_ASKS);
  }, [r.idx, r.finished]);

  // Enter on the answer → next question
  useEffect(() => {
    const onKey = (e) => {
      const x = cur.current;
      if (e.key !== 'Enter' || !x || !x.answered || x.finished) return;
      const t = e.target;
      if (t && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName) && !t.disabled && t.tagName !== 'BUTTON') return;
      e.preventDefault();
      next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }); // a fresh `next` each render

  if (r.finished) {
    const wrong = Object.values(r.wrong);
    const mood = r.score >= 80 ? 'cheer' : r.score >= 50 ? 'happy' : 'think';
    const line = r.score >= 80 ? 'Xuất sắc! Câu chuyện đang vào đầu rồi đó 🎉' : r.score >= 50 ? 'Khá lắm! Ôn lại mấy câu sai là thuộc ngay 💪' : 'Không sao, lần đầu ai cũng vậy — làm lại vài lần là nhớ thôi 🍊';
    return (
      <div className="t2-done sp2-done">
        <LuluSays text={line} mood={mood} />
        <div className="t2-done-score">{r.score}%</div>
        <div className="t2-done-sub">{run.label} · {st.no} {st.title}</div>
        <div className="t2-done-stats">
          <div className="t2-done-stat"><div className="t2-done-stat-num">{r.right}/{r.total}</div><div className="t2-done-stat-lbl">Đúng ngay lần đầu</div></div>
          <div className="t2-done-stat"><div className="t2-done-stat-num">{wrong.length}</div><div className="t2-done-stat-lbl">Vẫn còn sai</div></div>
        </div>
        {wrong.length > 0 && (
          <div className="sp2-wronglist"><div className="sp2-wronglist-h">Câu cần ôn lại</div>
            {wrong.map((w) => <Sent key={w.key} en={shown(w)} vi={w.vi} />)}
          </div>
        )}
        <div className="t2-actions" style={{ justifyContent: 'center' }}>
          {wrong.length > 0 && (
            <button type="button" className="t2-primary is-lg" onClick={() => onRetry(wrong.map((w) => ({ key: w.key, en: w.en, vi: w.vi, ctx: w.ctx, vocab: w.vocab })))}>
              <i className="fas fa-redo-alt" /> Ôn câu sai ({wrong.length})
            </button>
          )}
          <button type="button" className="t2-secondary" onClick={onAgain}><i className="fas fa-sync-alt" /> Làm lại</button>
          <button type="button" className="t2-secondary" onClick={onBack}><i className="fas fa-arrow-left" /> Về câu chuyện</button>
        </div>
      </div>
    );
  }

  const pct = Math.round(((r.idx + 1) / r.qs.length) * 100);
  const last = r.idx >= r.qs.length - 1;
  return (
    <>
      {quitBox}
      <RunHead story={st} label={run.label} onQuit={quit} />
      <div className="wp-progress-bar-wrap"><div className="wp-progress-bar" style={{ width: pct + '%' }} /></div>
      <div className="t2-q-dots">
        {r.qs.map((x, i) => {
          const s = r.status[i];
          return <span key={i} className={`t2-q-dot ${s === 'correct' ? 't2-dot-ok' : s === 'wrong' ? 't2-dot-err' : i === r.idx ? 't2-dot-current' : ''}`} title={'Câu ' + (i + 1)} />;
        })}
      </div>
      <div className="wp-exercise-meta" style={{ padding: '8px 20px' }}>
        <span className="wp-ex-counter">{r.idx + 1} / {r.qs.length}</span>
        <span className="wp-type-tag">{q.ctx}</span>
        {q._repeat && <span className="wp-type-tag" style={{ background: '#fef3c7', color: '#92400e' }}>🔁 Làm lại</span>}
      </div>
      <div className="wp-card sp2-qcard" style={{ margin: '0 20px' }} id="qcard">
        <div className="wp-task-label">{q.vocab ? 'Gõ cụm từ còn thiếu' : 'Dịch câu sang tiếng Anh'}</div>
        <div className="t2-question-text sp2-q-vi">{q.vi}</div>
        {q.vocab && <div className="sp2-q-ex"><Cloze ex={q.vocab[3]} ans={q.vocab[4]} /></div>}
        <div className="sp2-wbw-bar">
          <button ref={askRef} type="button" className="wbw-ask ask-lulu" id="sp2-ask" title="Hỏi Lulu chữ cái tiếp theo" disabled={r.answered || undefined} onClick={ask}>
            <span className="ask-lulu-ic" /> <span>Hỏi Lulu</span>
          </button>
        </div>
        <Wbw key={r.idx} answer={q.en} hostRef={hostRef} onDone={answer} />
        <div className="t2-wbw-hint">Câu tính sai sẽ quay lại sau {REQUEUE_GAP} câu để làm lại.</div>
      </div>
      <div className={`wp-feedback-card${r.answered ? '' : ' hidden'}`} id="sp2-fb" style={{ margin: '12px 20px' }}>
        {r.answered && (
          <>
            <div className={`wp-result-banner ${r.ok ? 'wp-result-correct' : 'wp-result-wrong'}`}>
              {r.ok ? '✅ Chính xác!' : '❌ Câu này tính sai' + (r.requeued ? ' — sẽ quay lại sau ' + REQUEUE_GAP + ' câu' : '')}
            </div>
            <div className="wp-comparison-box"><div className="wp-cmp-row wp-cmp-sample"><span className="wp-cmp-label">✅ Bài mẫu:</span><span className="wp-cmp-text">{shown(q)}</span><SayBtn text={shown(q)} /></div></div>
            <button className="wp-next-btn" onClick={next}>{last ? 'Xem kết quả' : 'Câu tiếp theo'} <i className="fas fa-arrow-right" />
              <span style={{ fontSize: 10, opacity: 0.55, marginLeft: 4, fontWeight: 400 }}>Enter ↵</span></button>
          </>
        )}
      </div>
    </>
  );
}
