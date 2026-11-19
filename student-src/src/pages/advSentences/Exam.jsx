import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { mascotHtml, siteConfirm, siteToast } from '../../utils/shell';
import { Mascot, Spinner } from './common';

const SECONDS_PER_QUESTION = 90;

function mmss(s) {
  const n = Math.max(0, s);
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
}

// 🎓 Thi thử cả tuần: 12 random sentences of the week, no hints, 90 s each.
// Time running out hands the paper in.
export default function Exam({ week, questions, onQuit, onGraded }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [text, setText] = useState('');
  const [left, setLeft] = useState(questions.length * SECONDS_PER_QUESTION);
  const [grading, setGrading] = useState(false);
  const live = useRef({ idx, answers, text });
  useEffect(() => { live.current = { idx, answers, text }; });
  const submitted = useRef(false);
  const submitRef = useRef(null);
  const inputRef = useRef(null);

  async function submit() {
    if (submitted.current) return;
    submitted.current = true;
    const { idx: i, answers: a, text: t } = live.current;
    const all = { ...a, [questions[i]._id]: t.trim() };
    setGrading(true);
    const payload = questions.map((q) => ({ groupId: q.groupId, sentenceId: q._id, userAnswer: all[q._id] || '' }));
    try {
      const d = await apiFetch('/adv-sentence/exam/submit', { method: 'POST', body: JSON.stringify({ answers: payload }), timeout: 30000 });
      await apiFetch('/adv-sentence/save-attempt', {
        method: 'POST',
        body: JSON.stringify({
          sessionType: 'exam', week, groupName: `Thi thử Tuần ${week}`,
          sentencesAttempted: (d.results || []).filter((r) => !r.error).map((r) => ({
            sentenceId: r.sentenceId, userAnswer: r.userAnswer, isCorrect: r.isCorrect, score: r.score,
          })),
          totalQuestions: d.total, correctCount: d.correct,
        }),
      }).catch(() => {});
      onGraded(d);
    } catch {
      siteToast('Lỗi chấm bài', 'error');
      onGraded(null);
    }
  }
  useEffect(() => { submitRef.current = submit; });

  useEffect(() => {
    const deadline = Date.now() + questions.length * SECONDS_PER_QUESTION * 1000;
    const timer = setInterval(() => {
      const rest = Math.ceil((deadline - Date.now()) / 1000);
      setLeft(rest);
      if (rest <= 0) { clearInterval(timer); submitRef.current?.(); }
    }, 1000);
    return () => clearInterval(timer);
  }, [questions]);

  useEffect(() => { inputRef.current?.focus(); }, [idx]);

  if (grading) return <Spinner text="Đang chấm..." />;

  const q = questions[idx];
  const pct = Math.round(((idx + 1) / questions.length) * 100);
  const last = idx >= questions.length - 1;

  function nextQuestion() {
    if (last) { submit(); return; }
    const saved = { ...answers, [q._id]: text.trim() };
    setAnswers(saved);
    setText(saved[questions[idx + 1]._id] || '');
    setIdx(idx + 1);
  }

  return (
    <>
      <div className="as-topbar">
        <button className="as-btn" id="as-exam-quit" onClick={() => siteConfirm('Thoát khỏi bài thi thử?', 'Kết quả sẽ không được lưu.', 'Thoát', onQuit)}>
          <i className="fas fa-times" /> Thoát
        </button>
        <span className={`as-exam-timer${left <= 60 ? ' low' : ''}`} id="as-exam-timer">{mmss(left)}</span>
      </div>
      <div className="as-ctx">🎓 Thi thử · <b>Tuần {week}</b> · không gợi ý</div>
      <div className="as-progress-wrap"><div className="as-progress-bar" style={{ width: `${pct}%` }} /></div>
      <div className="as-counter">{idx + 1} / {questions.length} câu · {q.groupName || ''}</div>
      <div className="as-prompt"><div className="as-prompt-label">📝 Dịch sang tiếng Anh</div><p>{q.promptVi}</p></div>
      <div className="as-card">
        <textarea ref={inputRef} className="as-textarea" id="as-exam-input" rows={3} placeholder="Nhập bản dịch..." value={text} onChange={(e) => setText(e.target.value)} />
        <button className="as-submit" id="as-exam-next" onClick={nextQuestion}>{last ? 'Nộp bài' : 'Câu tiếp theo'}</button>
      </div>
    </>
  );
}

export function ExamResult({ result, onDone }) {
  const d = result || { results: [], correct: 0, total: 0, score: 0 };
  return (
    <>
      <div className="as-result-hero">
        <Mascot html={mascotHtml({ pct: d.score, stacked: true })}>
          <div style={{ fontSize: 44 }}>{d.score >= 70 ? '🎉' : '💪'}</div>
        </Mascot>
        <div className="as-result-score">{d.score}%</div>
        <div style={{ color: 'var(--text2,#6b7280)' }}>{d.correct} / {d.total} câu đúng</div>
        <button className="as-next" style={{ width: 'auto', marginTop: 16 }} id="as-exam-done" onClick={onDone}>Về danh sách tuần</button>
      </div>
      {(d.results || []).map((r, i) => (r.error ? null : (
        <div key={i} className={`as-review-item ${r.isCorrect ? 'ok' : 'bad'}`}>
          <div style={{ fontSize: 12, fontWeight: 800 }}>
            {r.isCorrect ? '✅' : '❌'} Câu {i + 1} — {r.groupName || ''}{r.structureNote ? ` · ${r.structureNote}` : ''}
          </div>
          <div style={{ fontSize: 13, marginTop: 6, color: 'var(--text2,#6b7280)' }}>{r.promptVi}</div>
          <div className="as-fb-row"><span className="lbl">📝 Bạn:</span> {r.userAnswer || <i>(bỏ trống)</i>}</div>
          {!r.isCorrect && <div className="as-fb-row"><span className="lbl">✅ Mẫu:</span> <span className="as-fb-model">{r.modelAnswer}</span></div>}
        </div>
      )))}
      <div style={{ height: 20 }} />
    </>
  );
}
