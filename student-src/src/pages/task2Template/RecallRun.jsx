import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { siteToast } from '../../utils/shell';
import {
  allStepsDone, ASSEMBLE_PASS, bumpMastery, EXAM_SECONDS, examTierImage, fmtMMSS, LULU_MAX, RECALL_PASS_B7, SENT_KNOWN,
  shortTitle, TYPE_META, weakSentences,
} from '../../utils/task2Template';
import { LuluSays, RoleTag } from './Parts';
import { Recall } from './Items';
import MemeImg from '../../components/MemeImg';

// Recall runs, one sentence at a time from its Vietnamese meaning:
//   review: up to 6 weakest sentences, band rules, schedules the next review
//   fix:    the given (or weakest practised) sentences, band rules, mastery only
//   exam:   every sentence, plain typing, no hints, 30-minute timer
// The 3-wrong-tries rule sends a sentence back to the end of a review / fix
// run (that redo copy is practice only — the first try is the mark).
// `ref.submit()` = the toolbar's "Thoát thi thử" / the bar's "Nộp bài".

export default function RecallRun({ ctx, mode, items: startItems, from = '', start, ref }) {
  const isExam = mode === 'exam';
  const [r, setR] = useState(() => ({ items: startItems, pos: 0, results: [], pending: {}, finished: false, secs: 0 }));
  const [left, setLeft] = useState(EXAM_SECONDS);
  const live = useRef(r);
  useEffect(() => { live.current = r; });
  const done = useRef(false);

  function finish() {
    const x = live.current;
    if (done.current || x.finished) return;
    done.current = true;
    const secs = Math.round((Date.now() - start) / 1000);
    const answered = x.results.filter((v) => v !== undefined);
    const total = isExam ? x.items.length : answered.length;
    const correct = x.results.filter(Boolean).length;
    // An exam counts every sentence (unanswered = wrong); a review only what was answered
    const results = isExam ? x.items.map((_, i) => !!x.results[i]) : x.results;
    if (mode === 'review' && total) {
      ctx.save({ reviewDone: true, reviewScore: Math.round((correct / total) * 100), mastery: x.pending });
      ctx.saveAttempt({ mode: 'review', total, correct, timeTakenSec: secs });
      ctx.addXP(5);
    }
    if (mode === 'fix' && total) { ctx.save({ mastery: x.pending }); ctx.addXP(3); }
    if (isExam && answered.length) ctx.saveAttempt({ mode: 'path', total, correct, isExam: true, timeTakenSec: secs });
    setR({ ...x, results, finished: true, secs });
    ctx.onDone(true);
  }

  useImperativeHandle(ref, () => ({
    submit: () => { if (live.current.finished) ctx.onBack(); else finish(); },
  }));

  // The exam clock
  useEffect(() => {
    if (!isExam) return undefined;
    const t = setInterval(() => {
      if (done.current) { clearInterval(t); return; }
      const l = EXAM_SECONDS - Math.floor((Date.now() - start) / 1000);
      setLeft(l);
      if (l <= 0) { clearInterval(t); siteToast('⏰ Hết giờ!', 'warn', 2500); finish(); }
    }, 1000);
    return () => clearInterval(t);
  }, [isExam, start]); // eslint-disable-line react-hooks/exhaustive-deps

  const meta = TYPE_META[ctx.typeId] || {};
  const title = mode === 'fix' ? '🎯 Luyện câu yếu' : '⚡ Ôn nhanh';
  const bar = isExam ? (
    <div className="t2-exam-bar">
      <span className={`t2-exam-timer${left <= 300 ? ' warn' : ''}`} id="pth-exam-time">{fmtMMSS(left)}</span>
      <span className="t2-exam-label"><i className="fas fa-clock" /> {meta.label || ''} · {ctx.tpl.name} · Thi thử</span>
      <button className="t2-exam-exit-btn" onClick={() => (r.finished ? ctx.onBack() : finish())}><i className="fas fa-times" /> Nộp bài</button>
    </div>
  ) : (
    <div className="pth-act-hdr">
      <button className="pth-back" onClick={ctx.onBack}><i className="fas fa-arrow-left" /> Lộ trình</button>
      <div className="pth-act-title">{title}</div><div className="pth-act-right">Câu {Math.min(r.pos + 1, r.items.length)}/{r.items.length}</div>
    </div>
  );

  if (r.finished) {
    const correct = r.results.filter(Boolean).length; const total = r.results.length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const next = ctx.row.nextReviewAt;
    const line = isExam
      ? (pct >= ASSEMBLE_PASS ? `Nhớ đúng ${correct}/${total} câu không cần gợi ý — trí nhớ của cậu xịn ghê! 🏆` : `Nhớ đúng ${correct}/${total} câu. Luyện câu yếu vài lượt rồi thi lại nha, Lulu tin cậu!`)
      : mode === 'fix' ? `Xong ${total} câu yếu, nhớ đúng ${correct}! ${from === 'assemble' ? 'Giờ ghép lại cả bài thử xem nha 💪' : 'Mấy câu này sẽ lên dần mức “thuộc” đó.'}`
        : `Ôn xong rồi! Nhớ đúng ${correct}/${total} câu. Hẹn cậu lần ôn tiếp theo nha 🗓️`;
    const weak = weakSentences(ctx.row, ctx.tpl).length > 0;
    const fixThenAssemble = mode === 'fix' && from === 'assemble';
    return (
      <>
        {!isExam && bar}
        <div className="pth-wrap"><div className="pth-card pth-done">
          {isExam && <MemeImg src={examTierImage(pct)} loading="lazy" className="pth-tier-img" />}
          <LuluSays text={line} pct={pct} stacked solo={false} />
          <div className={`pth-score ${pct >= 60 ? 'is-ok' : 'is-bad'}`}>{pct}%</div>
          <p className="pth-muted">{correct}/{total} câu nhớ đúng{isExam ? ` · ⏱ ${fmtMMSS(r.secs)}` : ''}</p>
          {isExam && ctx.homeworkPending && (
            <p className="pth-muted">{pct >= ASSEMBLE_PASS ? '✅ Đủ ≥ 70% số câu cho bài tập về nhà' + (allStepsDone(ctx.row) ? '.' : ' — còn cần học xong cả 5 bước.') : `Bài tập về nhà cần thuộc ≥ ${ASSEMBLE_PASS}% số câu.`}</p>
          )}
          {mode === 'review' && next && <p className="pth-muted">Lần ôn tiếp theo: <b>{new Date(next).toLocaleDateString('vi-VN')}</b></p>}
          <div className="pth-actions">
            {isExam && <button className="pth-btn" onClick={ctx.onExam}><i className="fas fa-redo" /> Thi lại</button>}
            {(isExam || mode === 'review') && weak && <button className="pth-btn" onClick={() => ctx.onFix()}><i className="fas fa-crosshairs" /> Luyện câu yếu</button>}
            {fixThenAssemble && <button className="pth-btn pth-btn--primary" onClick={() => ctx.onStep('assemble')}><i className="fas fa-pen-nib" /> Ghép lại cả bài</button>}
            <button className={`pth-btn ${fixThenAssemble ? '' : 'pth-btn--primary'}`} onClick={ctx.onBack}>Về lộ trình <i className="fas fa-arrow-right" /></button>
          </div>
        </div></div>
      </>
    );
  }

  const s = r.items[r.pos];
  const last = r.pos + 1 >= r.items.length;
  const mastery = (key) => Number((ctx.row.mastery || {})[key] || 0);
  function onAnswer(ok, _d, hinted, failed) {
    if (s.redo) return;
    const results = r.results.slice();
    results[r.pos] = ok;
    const pending = isExam ? r.pending : bumpMastery(r.pending, s.key, ok && !hinted ? 1 : ok ? 0 : -1, 0, mastery(s.key));
    const items = failed && !isExam ? [...r.items, { ...s, redo: true }] : r.items;
    setR({ ...r, results, pending, items });
  }
  function next() {
    const pos = r.pos + 1;
    if (pos >= live.current.items.length) { finish(); return; }
    setR({ ...live.current, pos });
  }
  return (
    <>
      {bar}
      <div className="pth-wrap"><div className="pth-card">
        <div className="pth-drill-meta">
          <span>Câu {r.pos + 1} / {r.items.length}</span>
          <span className="pth-drill-tags"><span className="pth-chip">{shortTitle(ctx.tpl.paras[s.si].title)}</span><RoleTag s={s} /></span>
        </div>
        <div className="pth-vi-prompt"><i className="fas fa-quote-left" /> {s.vi}</div>
        <div id="pth-item">
          <Recall key={r.pos} s={s} free={isExam || ctx.isB7} hints={isExam ? 0 : LULU_MAX} exam={isExam} note="run"
            passPct={isExam ? SENT_KNOWN : RECALL_PASS_B7} nextLabel={last ? 'Xem kết quả' : 'Câu tiếp'}
            onDone={onAnswer} onNext={next} />
        </div>
      </div></div>
    </>
  );
}
