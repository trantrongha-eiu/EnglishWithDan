import { useState } from 'react';
import { resultImage, spawnConfetti } from '../../utils/shell';
import { GUIDE_PASS, passedPct } from './guideQuizRules';
import MemeImg from '../../components/MemeImg';

// One reading-check quiz on a guide section: one question at a time, the
// answer and the reason right after each pick, then the score. Passing
// (>= GUIDE_PASS %) opens the next section.
export default function GuideQuiz({ items, sectionTitle, nextLabel, onFinish, onExit, onRetry, onNext }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]); // [{ ok, picked }]
  const [done, setDone] = useState(false);

  const n = items.length;
  const it = items[i];
  const correct = answers.filter((a) => a.ok).length;

  function choose(opt) {
    if (picked != null) return;
    setPicked(opt);
    setAnswers((a) => [...a, { ok: opt === it.answer, picked: opt }]);
  }
  function next() {
    if (i + 1 < n) { setI(i + 1); setPicked(null); return; }
    setDone(true);
    const c = answers.filter((a) => a.ok).length;
    if (passedPct(c, n)) { try { spawnConfetti(50); } catch { /* none */ } }
    onFinish(c, n);
  }

  if (done) {
    const pct = Math.round((correct / n) * 100);
    const pass = passedPct(correct, n);
    const wrong = items.map((x, k) => ({ x, a: answers[k] })).filter((r) => r.a && !r.a.ok);
    return (
      <div className="gq gq-result">
        <MemeImg className="gq-res-img" src={resultImage(pass ? 95 : pct >= 70 ? 75 : 55)} />
        <div className="gq-res-score">{correct}/{n} · {pct}%</div>
        {pass ? (
          <div className="gq-res-msg is-pass">🎉 Đạt rồi! Cậu đã hiểu mục “{sectionTitle}”.{nextLabel ? ` Mục tiếp theo đã mở: ${nextLabel}.` : ''}</div>
        ) : (
          <div className="gq-res-msg">Gần được rồi nè! Cần đúng ≥ {GUIDE_PASS}% để mở mục tiếp theo. Đọc lại những câu bên dưới rồi thử lại nha 💪</div>
        )}
        {wrong.length > 0 && (
          <div className="gq-wrong">
            <b>Xem lại {wrong.length} câu chưa đúng</b>
            {wrong.map(({ x, a }, k) => (
              <div className="gq-wrong-it" key={k}>
                <div className="gq-wrong-q">{x.q}</div>
                {x.prompt && <div className="gq-wrong-p">{x.prompt}</div>}
                <div className="gq-wrong-a"><span className="no">✗ {a.picked}</span><span className="ok">✓ {x.answer}</span></div>
                {x.why && <div className="gq-wrong-why">{x.why}</div>}
              </div>
            ))}
          </div>
        )}
        <div className="gq-actions">
          {pass ? (
            <>
              {onNext && <button className="pth-btn pth-btn--primary" onClick={onNext}><i className="fas fa-arrow-right" /> {nextLabel ? `Học tiếp: ${nextLabel}` : 'Vào lộ trình luyện'}</button>}
              <button className="pth-btn" onClick={onExit}>Đóng</button>
            </>
          ) : (
            <>
              <button className="pth-btn pth-btn--primary" onClick={onExit}><i className="fas fa-book-open" /> Đọc lại mục này</button>
              <button className="pth-btn" onClick={onRetry}><i className="fas fa-rotate-right" /> Làm lại ngay</button>
            </>
          )}
        </div>
      </div>
    );
  }

  const isOk = picked != null && picked === it.answer;
  return (
    <div className="gq">
      <div className="gq-top">
        <span className="gq-count">Câu {i + 1}/{n}</span>
        <span className="gq-score">✓ {correct}</span>
        <button className="gq-exit" onClick={onExit} title="Thoát quiz, quay lại đọc"><i className="fas fa-xmark" /> Thoát</button>
      </div>
      <div className="gq-bar"><i style={{ width: `${(i / n) * 100}%` }} /></div>
      {it.tag && <div className="gq-tag">{it.tag}</div>}
      <div className="gq-q">{it.q}</div>
      {it.prompt && <div className="gq-prompt">{it.promptLabel && <span className="gq-prompt-lbl">{it.promptLabel}</span>}{it.prompt}</div>}
      <div className={`gq-opts${it.tf ? ' is-tf' : ''}`}>
        {it.opts.map((o) => {
          let cls = 'gq-opt';
          if (picked != null) {
            if (o === it.answer) cls += ' is-ok';
            else if (o === picked) cls += ' is-no';
            else cls += ' is-dim';
          }
          return <button key={o} className={cls} disabled={picked != null} onClick={() => choose(o)}>{o}</button>;
        })}
      </div>
      {picked != null && (
        <>
          <div className={`gq-why ${isOk ? 'is-ok' : 'is-no'}`}><b>{isOk ? '✓ Chính xác!' : '✗ Chưa đúng.'}</b> {it.why}</div>
          <div className="gq-actions">
            <button className="pth-btn pth-btn--primary" onClick={next} autoFocus>{i + 1 < n ? <>Câu tiếp <i className="fas fa-arrow-right" /></> : 'Xem kết quả'}</button>
          </div>
        </>
      )}
    </div>
  );
}
