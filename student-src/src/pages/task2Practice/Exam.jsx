import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { mascotHtml, scoreMessage, siteToast, useLeaveWarning } from '../../utils/shell';
import { cheerImage, LEVEL_COLORS, Q_LABELS, qid } from '../../utils/task2Practice';
import { BusyButton, Html, QuitDialog } from './Parts';
import { prepFor } from './lib';
import { QuestionCard } from './Question';

// "Thi thử cả tuần": random questions from the week's topics, 2 minutes a
// question, no hints; graded together by /api/task2/exam/submit.

const fmt = (s) => { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

function ExamDone({ r, ctx }) {
  const scoreClass = r.score >= 70 ? 'wp-score-good' : r.score >= 40 ? 'wp-score-mid' : 'wp-score-bad';
  const { emoji, message } = scoreMessage(r.score);
  const mascot = mascotHtml({ pct: r.score, text: message, stacked: true });
  return (
    <>
      <div style={{ textAlign: 'center', padding: '32px 20px 16px' }}>
        <img src={cheerImage(r.score).slice(1)} alt="" style={{ display: 'block', width: '100%', maxWidth: 220, borderRadius: 12, margin: '0 auto 12px', objectFit: 'cover' }} />
        {mascot ? <Html html={mascot} style={{ display: 'contents' }} /> : <div style={{ fontSize: 52 }}>{emoji}</div>}
        <div className={`t2-done-score ${scoreClass}`}>{r.score}%</div>
        <div style={{ fontSize: 15, color: '#6b7280', marginBottom: 16 }}>{mascot ? '' : message + ' '}Đúng {r.correct} / {r.total} câu</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <BusyButton className="wp-restart-btn" onClick={ctx.startExam}><i className="fas fa-redo" /> Thi lại</BusyButton>
          <button className="wp-more-btn" onClick={ctx.backToHub}><i className="fas fa-arrow-left" /> Về chủ đề</button>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px' }}>
        {(r.results || []).map((item, i) => (
          <div key={i} className={item.isCorrect ? 'wp-wr-item-ok' : 'wp-wr-item'}>
            <div className={item.isCorrect ? 'wp-wr-num-ok' : 'wp-wr-num'}>
              {item.isCorrect ? '✅' : '❌'} Câu {i + 1} — {Q_LABELS[item.type] || item.type}
              {' '}<span className="wp-wr-skill">{item.level} · {item.topicName || ''}</span>
            </div>
            <div className="wp-wr-q">{item.questionText || ''}</div>
            <div className="wp-wr-row"><span className="wp-wr-lbl-you">Bạn:</span> <span className={item.isCorrect ? 'wp-wr-ans' : 'wp-wr-your'}>{item.userAnswer || '(bỏ trống)'}</span></div>
            {!item.isCorrect && <div className="wp-wr-row"><span className="wp-wr-lbl-ans">Đáp án:</span> <span className="wp-wr-ans">{item.modelAnswer || ''}</span></div>}
            {item.explanationVi && <div className="wp-wr-gp">💡 {item.explanationVi}</div>}
          </div>
        ))}
      </div>
    </>
  );
}

// run = { seq, questions }
export function ExamRun({ run, ctx }) {
  const total = run.questions.length * 120;
  const [idx, setIdx] = useState(0);
  const [prep, setPrep] = useState(() => prepFor(run.questions[0]));
  const [left, setLeft] = useState(total);
  const [phase, setPhase] = useState('run'); // run · grading · error · done
  const [err, setErr] = useState('');
  const [result, setResult] = useState(null);
  const [quit, setQuit] = useState(false);
  const answers = useRef([]);
  const current = useRef('');
  const timer = useRef(0);
  const idxRef = useRef(0);
  const t = ctx.t;
  useLeaveWarning(phase === 'run');
  useEffect(() => { ctx.onRunState({ view: phase === 'done' ? 'examDone' : 'exam' }); }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = () => { clearInterval(timer.current); timer.current = 0; };
  async function submitAll() {
    stop();
    setPhase('grading');
    try {
      const d = await apiFetch('/task2/exam/submit', { method: 'POST', timeout: 45000, body: JSON.stringify({ answers: answers.current }) });
      if (!d.success) throw new Error(d.message);
      setResult(d);
      setPhase('done');
    } catch (e) {
      setErr(e && e.coldStart && /quá lâu/.test(e.message || '')
        ? 'Chấm bài quá lâu — server có thể đang khởi động. Bài làm của bạn vẫn còn, hãy thử chấm lại.'
        : 'Lỗi chấm bài: ' + (e.message || ''));
      setPhase('error');
    }
  }
  // The clock: shows the time, then counts down; at 0 the test goes in by itself
  useEffect(() => {
    let n = total;
    timer.current = setInterval(() => {
      n--;
      if (n <= 0) {
        setLeft(0);
        stop();
        siteToast('Hết giờ! Tự động nộp bài.', 'warn', 4000);
        submitAll();
        return;
      }
      setLeft(n);
    }, 1000);
    return stop;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function next() {
    if (phase !== 'run') return;
    const q = run.questions[idxRef.current];
    const answer = current.current;
    if (!answer && answer !== '0') { siteToast('Vui lòng trả lời câu hỏi trước khi tiếp tục!', 'warn', 2500); return; }
    answers.current.push({ topicId: q.topicId || t._id, questionId: qid(q), userAnswer: answer });
    const i = idxRef.current + 1;
    if (i >= run.questions.length) { submitAll(); return; }
    idxRef.current = i;
    current.current = '';
    setIdx(i);
    setPrep(prepFor(run.questions[i]));
  }
  // Enter = Tiếp theo (not inside a textarea)
  useEffect(() => {
    if (phase !== 'run') return undefined;
    const key = (e) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
      e.preventDefault();
      next();
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  });
  function quitExam() {
    if (!answers.current.length) { stop(); ctx.backToHub(); return; }
    setQuit(true);
  }
  useEffect(() => { ctx.regQuit(phase === 'run' && answers.current.length ? () => setQuit('nav') : null); return () => ctx.regQuit(null); });

  if (phase === 'grading') return <div style={{ textAlign: 'center', padding: 40 }}><div className="wp-spinner" /><p>Đang chấm bài...</p></div>;
  if (phase === 'error') {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ color: '#dc2626', marginBottom: 14 }}>{err}</p>
        <button onClick={submitAll} style={{ background: 'var(--brand,#e53935)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Thử chấm lại</button>
      </div>
    );
  }
  if (phase === 'done') return <ExamDone r={result} ctx={ctx} />;

  const q = run.questions[idx];
  const n = run.questions.length;
  const isLast = idx === n - 1;
  const tp = total > 0 ? left / total : 1;
  return (
    <>
      <div className="t2-nav" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="t2-back-btn" onClick={quitExam}><i className="fas fa-times" /> Thoát</button>
        <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>🎓 Thi thử</span>
      </div>
      <div className="wp-progress-bar-wrap"><div className="wp-progress-bar" style={{ width: `${Math.round((idx / n) * 100)}%` }} /></div>
      <div className="t2-q-dots" style={{ padding: '4px 20px 2px', justifyContent: 'center' }}>
        {run.questions.map((_, i) => <span key={i} className={`t2-q-dot ${i < idx ? 't2-dot-ok' : i === idx ? 't2-dot-current' : ''}`} title={`Câu ${i + 1}`} />)}
      </div>
      <div className="wp-exercise-meta" style={{ padding: '8px 20px' }}>
        <span className="wp-ex-counter">{idx + 1} / {n}</span>
        <span className={`wp-test-timer${tp <= 0.1 ? ' danger' : tp <= 0.25 ? ' warn' : ''}`} id="exam-timer">⏱ {left > 0 ? fmt(left) : '--:--'}</span>
        <span style={{ color: LEVEL_COLORS[q.level] || '#6b7280', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{q.level}</span>
        {q.topicName && <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 12, marginLeft: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }} title={q.topicName}>{q.topicName}</span>}
      </div>
      {q.prompt && <div className="t2-prompt-box"><div className="t2-prompt-box-label">📋 Đề bài</div><p>{q.prompt}</p></div>}
      <QuestionCard key={idx} q={q} exam ctx={ctx} meta={{}} prep={prep} onMeta={() => {}} onSubmit={() => {}} onAnswer={(a) => { current.current = a; }}>
        <button className="wp-submit-btn" style={{ marginTop: 12, width: '100%' }} onClick={next}>
          {isLast ? <><i className="fas fa-check" /> Nộp bài</> : <>Tiếp theo <i className="fas fa-arrow-right" /> <span style={{ fontSize: 10, opacity: 0.55, marginLeft: 4, fontWeight: 400 }}>Enter ↵</span></>}
        </button>
      </QuestionCard>
      {quit && (
        <QuitDialog opts={{ mascot: '📋', title: 'Dừng bài thi?', sub: `Câu ${idx + 1}/${n}. Kết quả sẽ bị mất.`, confirmText: 'Dừng lại', continueText: 'Tiếp tục thi' }}
          onStay={() => { setQuit(false); ctx.navStay(); }}
          onLeave={() => { const nav = quit === 'nav'; setQuit(false); stop(); if (nav) ctx.navGo(); else ctx.backToHub(); }} />
      )}
    </>
  );
}
