import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { hasPremiumAccess } from '../../utils/plan';
import { openUpgrade, siteToast } from '../../utils/shell';
import { clearTest, loadResumableTest, saveTest } from '../../utils/writingPractice';

export const SECONDS_PER_QUESTION = 90;

// 📋 Thi thử: random questions, no hints, 90 s each; graded on submit.
// A test in progress is kept on this device for 4 hours (resume banner).
export function useWpTest() {
  const [level, setLevel] = useState('beginner');
  const [count, setCount] = useState(10);
  const [phase, setPhase] = useState('intro'); // intro | loading | progress | results
  const [run, setRun] = useState({ exercises: [], answers: [], idx: 0 });
  const [deadline, setDeadline] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null); // { status: 'grading'|'done'|'error', data, msg }
  const [resume, setResume] = useState(() => loadResumableTest());

  const live = useRef({});
  useEffect(() => { live.current = { phase, run, timeLeft, level, count }; });

  const running = phase === 'progress';

  function begin(exercises, answers, idx, seconds) {
    setRun({ exercises, answers, idx });
    setTimeLeft(seconds);
    setDeadline(Date.now() + seconds * 1000);
    setResult(null);
    setPhase('progress');
  }

  async function start() {
    if (!hasPremiumAccess()) { openUpgrade(); return; }
    if (phase === 'loading') return;
    setPhase('loading');
    try {
      const d = await apiFetch(`/writing-practice/test-questions?level=${level}&count=${count}`);
      if (!d.success || !d.exercises?.length) {
        siteToast('Không tải được câu hỏi. Vui lòng thử lại.', 'error');
        setPhase('intro');
        return;
      }
      const seconds = d.exercises.length * SECONDS_PER_QUESTION;
      begin(d.exercises, [], 0, seconds);
      saveTest({ exercises: d.exercises, answers: [], idx: 0, timeLeft: seconds, level, count });
    } catch (e) {
      if (e?.status === 403) openUpgrade();
      else siteToast('Lỗi tải câu hỏi: ' + e.message, 'error');
      setPhase('intro');
    }
  }

  function resumeTest() {
    const data = resume;
    if (!data) return;
    setResume(null);
    if (data.level) setLevel(data.level);
    if (data.count) setCount(data.count);
    begin(data.exercises, data.answers || [], data.idx || 0, data.timeLeft ?? data.exercises.length * SECONDS_PER_QUESTION);
  }
  function dismissResume() { setResume(null); clearTest(); }

  const grading = useRef(false);
  async function submit(answers) {
    if (grading.current) return;
    grading.current = true;
    clearTest();
    setPhase('results');
    setResult({ status: 'grading' });
    try {
      const d = await apiFetch('/writing-practice/check-test', { method: 'POST', body: JSON.stringify({ answers }), timeout: 45000 });
      if (!d.success) throw new Error('Lỗi chấm bài');
      setResult({ status: 'done', data: d });
    } catch (err) {
      const msg = err?.coldStart
        ? 'Chấm bài quá lâu — server có thể đang khởi động. Bài làm của bạn vẫn còn, hãy thử chấm lại.'
        : 'Lỗi khi nộp bài: ' + (err?.message || '');
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
    if (!answer && ex?.type !== 'expand') { siteToast('Vui lòng nhập câu trả lời!', 'warn'); return; }
    const all = [...answers, { exerciseId: ex._id, userAnswer: answer }];
    if (idx + 1 >= exercises.length) {
      setRun({ exercises, answers: all, idx: idx + 1 });
      submit(all);
      return;
    }
    setRun({ exercises, answers: all, idx: idx + 1 });
    saveTest({ exercises, answers: all, idx: idx + 1, timeLeft, level, count });
  }

  // Back to the intro (Dừng / Thi lại)
  function reset() {
    clearTest();
    setRun({ exercises: [], answers: [], idx: 0 });
    setResult(null);
    setPhase('intro');
  }

  // Leaving the page mid-test (another app page, or the tab closed) keeps it,
  // clock included, for the resume banner
  useEffect(() => {
    const keep = () => {
      const { phase: ph, run: r, timeLeft: t, level: l, count: c } = live.current;
      if (ph === 'progress' && r.idx > 0) saveTest({ ...r, timeLeft: t, level: l, count: c });
    };
    window.addEventListener('beforeunload', keep);
    return () => { window.removeEventListener('beforeunload', keep); keep(); };
  }, []);

  return {
    level, setLevel, count, setCount, phase, run, timeLeft, result, resume, running,
    start, resumeTest, dismissResume, next, reset, retry: () => submit(result?.answers || run.answers),
    // the "Đổi chế độ" / "Dừng" confirms are only needed once something is answered
    started: running && run.idx > 0,
    starting: phase === 'loading',
  };
}
