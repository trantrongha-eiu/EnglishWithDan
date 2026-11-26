import { useCallback, useEffect, useRef, useState } from 'react';
import { battleApi, battleFocus } from '../../utils/vocabBattle';
import { playSound } from '../../utils/vocab';
import { setActivePractice, siteToast, useLeaveWarning } from '../../utils/shell';
import Board from './Board';
import Question from './Question';

// The player's own run: one question at a time from /next (timed on the
// server), the answer to /answer, a short "đúng/sai" beat, then the next.
//   • At 0s whatever is on screen goes in (typed text, the pairs made so
//     far, the words placed): a half-done Nối từ still scores its pairs.
//   • A failed send never loops: the question is re-read after a pause.
//   • 🔥 Combo = right answers in a row (just for show; scoring is the server's).
export default function QuizRun({ b, id, onBattle, onExit }) {
  const [q, setQ] = useState(null);
  const [deadline, setDeadline] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [left, setLeft] = useState(0);
  const [combo, setCombo] = useState(0);
  const sending = useRef(false);
  const stuck = useRef(false); // a send failed: no auto-submit until the next /next
  const qRef = useRef(null);
  const draft = useRef(null);
  const alive = useRef(true);
  const beat = useRef(null);
  // The room re-renders on every poll: its callbacks are read through refs
  // so a poll never re-fetches (or skips) a question.
  const cb = useRef({ onBattle, onExit });
  useEffect(() => { cb.current = { onBattle, onExit }; }, [onBattle, onExit]);
  useLeaveWarning(true);
  useEffect(() => {
    alive.current = true;
    setActivePractice(true);
    const unfocus = battleFocus(() => true);
    return () => { alive.current = false; clearTimeout(beat.current); setActivePractice(false); unfocus(); };
  }, []);

  const fetchNext = useCallback(() => battleApi('POST', `/${id}/next`).then((d) => {
    if (!alive.current) return;
    if (!d.success) {
      if (d.code !== 'finished') siteToast(d.message || 'Không tải được câu hỏi', 'error');
      cb.current.onExit();
      return;
    }
    qRef.current = d.question;
    draft.current = null;
    stuck.current = false;
    setFeedback(null);
    setQ(d.question);
    setLeft(d.remainingMs);
    setDeadline(Date.now() + d.remainingMs);
  }), [id]);

  useEffect(() => { fetchNext(); }, [fetchNext]);

  const submit = useCallback(async (answer, byTimer = false) => {
    const cur = qRef.current;
    if (!cur || sending.current || stuck.current) return;
    sending.current = true;
    const d = await battleApi('POST', `/${id}/answer`, { answer, idx: cur.i });
    sending.current = false;
    if (!alive.current) return;
    if (!d.success) {
      // Timed out by the server meanwhile: just move on
      if (d.code === 'stale' || d.code === 'no_question') { fetchNext(); return; }
      if (d.code === 'finished') { cb.current.onExit(); return; }
      siteToast(d.message || 'Không gửi được câu trả lời', 'error');
      // Don't hammer the server every tick: re-read the question in a moment
      stuck.current = true;
      clearTimeout(beat.current);
      beat.current = setTimeout(() => fetchNext(), 1800);
      return;
    }
    qRef.current = null;
    playSound(d.frac === 1 ? 'correct' : 'wrong');
    const nextCombo = d.frac === 1 ? combo + 1 : 0;
    setCombo(nextCombo);
    setFeedback({ ...d, given: answer, combo: nextCombo, timeout: byTimer });
    cb.current.onBattle(d.battle);
    beat.current = setTimeout(() => {
      if (d.done) cb.current.onExit();
      else fetchNext();
    }, d.frac === 1 ? 900 : 2200);
  }, [id, fetchNext, combo]);

  // Countdown; at 0 what's on screen goes in
  useEffect(() => {
    if (!q || feedback) return undefined;
    const tick = () => {
      const ms = Math.max(0, deadline - Date.now());
      setLeft(ms);
      if (ms <= 0) submit(draft.current, true);
    };
    const t = setInterval(tick, 200);
    return () => clearInterval(t);
  }, [q, deadline, feedback, submit]);

  const onDraft = useCallback((v) => { draft.current = v; }, []);

  if (!q) return <div className="vb-skel" aria-busy="true" />;
  const pct = q.limit ? Math.min(100, (left / (q.limit * 1000)) * 100) : 0;
  const me = b.players.find((p) => p.me);
  const secs = Math.ceil(left / 1000);

  return (
    <div className="vb-run">
      <div className="vb-run-head">
        <span className="vb-run-count">Câu {q.i + 1}/{b.total}</span>
        <span className="vb-run-type">{q.label}</span>
        {combo >= 2 && !feedback && <span className="vb-combo" key={combo}>🔥 x{combo}</span>}
        <span className="vb-run-score">⭐ {me?.score || 0}</span>
      </div>
      <div className="vb-timer-wrap">
        <div className={`vb-timer${left < 5000 ? ' low' : ''}`}><i style={{ width: `${feedback ? 0 : pct}%` }} /></div>
        <span className={`vb-secs${left < 5000 && !feedback ? ' low' : ''}`}>{feedback ? '—' : `${secs}s`}</span>
      </div>
      <Question key={q.i} q={q} feedback={feedback} onSubmit={submit} onDraft={onDraft} />
      {feedback && (
        <div className={`vb-feedback ${feedback.frac === 1 ? 'ok' : feedback.frac > 0 ? 'part' : 'bad'}`} role="status">
          {feedback.frac === 1 && <b>✅ Chính xác! +{feedback.pts}{feedback.combo >= 2 ? ` · 🔥 Combo x${feedback.combo}!` : ''}</b>}
          {feedback.frac > 0 && feedback.frac < 1 && <b>👍 Đúng {Math.round(feedback.frac * 100)}%: +{feedback.pts}</b>}
          {feedback.frac === 0 && <b>{feedback.late || feedback.timeout ? '⏰ Hết giờ!' : '❌ Chưa đúng'}</b>}
          {feedback.frac < 1 && <div className="vb-feedback-ans">Đáp án: <b>{feedback.correct}</b></div>}
          {feedback.meaning && <div className="vb-feedback-mean">{feedback.meaning}</div>}
        </div>
      )}
      {!b.solo && <div className="vb-run-board"><Board b={b} /></div>}
    </div>
  );
}
