import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { hasPremiumAccess } from '../../utils/plan';
import { openUpgrade, siteToast } from '../../utils/shell';

export const SECONDS_PER_QUESTION = 90;

// 📋 Thi thử: random Task 1 questions, no hints, 90 s each; graded on submit.
export function useT1Test() {
  const [level, setLevel] = useState('beginner');
  const [count, setCount] = useState(10);
  const [phase, setPhase] = useState('intro'); // intro | loading | progress | results
  const [run, setRun] = useState({ exercises: [], answers: [], idx: 0 });
  const [deadline, setDeadline] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null); // { status: 'grading'|'done'|'error', data, msg, answers }
  const live = useRef({});
  useEffect(() => { live.current = { run }; });

  const running = phase === 'progress';

  async function start() {
    if (!hasPremiumAccess()) { openUpgrade(); return; }
    if (phase === 'loading') return;
    setPhase('loading');
    try {
      const d = await apiFetch(`/task1/test-questions?level=${level}&count=${count}`);
      if (!d.success || !d.exercises?.length) {
        siteToast('Chưa có bài tập. Vui lòng thử lại!', 'error');
        setPhase('intro');
        return;
      }
      const seconds = d.exercises.length * SECONDS_PER_QUESTION;
      setRun({ exercises: d.exercises, answers: [], idx: 0 });
      setTimeLeft(seconds);
      setDeadline(Date.now() + seconds * 1000);
      setResult(null);
      setPhase('progress');
    } catch (e) {
      if (e?.status === 403) openUpgrade();
      else siteToast('Lỗi tải đề: ' + e.message, 'error');
      setPhase('intro');
    }
  }

  const grading = useRef(false);
  async function submit(answers) {
    if (grading.current) return;
    grading.current = true;
    setPhase('results');
    setResult({ status: 'grading', answers });
    try {
      const d = await apiFetch('/task1/check-test', { method: 'POST', body: JSON.stringify({ answers }), timeout: 45000 });
      if (!d.success) throw new Error(d.message || 'Lỗi chấm bài');
      setResult({ status: 'done', data: d, answers });
    } catch (err) {
      const msg = err?.coldStart
        ? 'Chấm bài quá lâu — server có thể đang khởi động. Bài làm của bạn vẫn còn, hãy thử chấm lại.'
        : 'Lỗi chấm bài: ' + (err?.message || '');
      setResult({ status: 'error', msg, answers });
    } finally {
      grading.current = false;
    }
  }
  const submitRef = useRef(submit);
  useEffect(() => { submitRef.current = submit; });

  // The clock: hands the paper in at 0
  useEffect(() => {
    if (!running || !deadline) return undefined;
    const timer = setInterval(() => {
      const rest = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(rest);
      if (rest <= 0) {
        clearInterval(timer);
        siteToast('Hết giờ! Tự động nộp bài.', 'warn', 4000);
        submitRef.current(live.current.run.answers);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [running, deadline]);

  function next(answer) {
    const { exercises, answers, idx } = run;
    const ex = exercises[idx];
    if (!answer) { siteToast('Vui lòng nhập/chọn câu trả lời trước khi tiếp tục!', 'warn'); return; }
    const all = [...answers, { exerciseId: ex._id, userAnswer: answer }];
    setRun({ exercises, answers: all, idx: idx + 1 });
    if (idx + 1 >= exercises.length) submit(all);
  }

  // Back to the intro (Dừng / Thi lại / leaving the mode)
  function reset() {
    setRun({ exercises: [], answers: [], idx: 0 });
    setResult(null);
    setDeadline(0);
    setPhase('intro');
  }

  return {
    level, setLevel, count, setCount, phase, run, timeLeft, result, running,
    start, next, reset, retry: () => submit(result?.answers || run.answers),
    started: running && run.idx > 0,
    starting: phase === 'loading',
  };
}
