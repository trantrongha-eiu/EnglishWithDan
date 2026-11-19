import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { hasPremiumAccess } from '../utils/plan';
import { bindDict, openUpgrade, setActivePractice, siteToast, useLeaveWarning } from '../utils/shell';
import {
  completedTopicCount, failFeedbackVi, filtersFromSearch, filtersQuery, loadOption, loadProgress, loadTopicScores,
  recordProgress, requeue, saveOption, saveTopicScore, shuffle, TOPIC_COUNT, TYPE_LABELS,
} from '../utils/writingPractice';
import { LevelList, TestCountList, TestLevelList, Toggle, TopicList, TypeList } from './writingPractice/Filters';
import { ExerciseCard, FeedbackCard } from './writingPractice/Exercise';
import { TestPanel } from './writingPractice/Test';
import { useWpTest } from './writingPractice/useWpTest';
import { HistoryDialog, QuitDialog } from './writingPractice/Dialogs';

// ✏️ Luyện viết câu giao tiếp — /app/writing-practice?level=&topic=&type=
// (was writing-practice.html). Practice: one sentence at a time with instant
// feedback, XP and combos; Thi thử: a timed random set graded at the end.
// A link with filters in it (homework) starts practising straight away.

const BASE = '/writing-practice';
const XP_WRONG = 5; // what the server gives a wrong answer (writingPracticeService.xpFor)
const AUTO_NEXT_MS = 2000;
const TOUR_PAGE = 'writing-practice.html';

const noSession = { exercises: [], idx: 0, done: 0, xp: 0, correct: 0, combo: 0, skipped: [], startedAt: 0, run: 0 };

function floatXP(amount) {
  const anchor = document.getElementById('header-xp') || document.getElementById('stat-xp');
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'wp-xp-float';
  el.textContent = `+${amount} XP ⭐`;
  el.style.left = rect.left + 'px';
  el.style.top = rect.top + 'px';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

const fmtClock = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

// The Writing "viết lại" reminder (bottom of js/shared/review-required-popup.js)
function useRewriteReminder() {
  useEffect(() => {
    window.WritingRewriteReminder?.check();
    return () => document.getElementById('writing-rewrite-banner')?.remove();
  }, []);
}

function DoneScreen({ summary, onRestart, onMore }) {
  const iconRef = useRef(null);
  useEffect(() => {
    const M = window.Mascot;
    if (M?.mount && iconRef.current) M.mount(iconRef.current, M.moodForScore(summary.pct));
  }, [summary]);
  const { done, xp, correct, gradable, expandCount, pct, elapsed, topic } = summary;
  return (
    <div className="wp-state-done" id="state-done">
      <div className="wp-done-icon" id="done-icon" ref={iconRef}>🎉</div>
      <h2>Xuất sắc!</h2>
      <p id="done-summary">Bạn đã hoàn thành {done} bài và kiếm được {xp} XP!</p>
      <div className="wp-done-stats" id="done-stats">
        <span>🎯 Đúng: {correct}/{gradable}{expandCount > 0 ? ` (+${expandCount} mở rộng)` : ''} ({pct}%)</span>
        <span>⭐ XP: {xp}</span>
        <span>⏱ {fmtClock(elapsed)}</span>
      </div>
      <div className="wp-status-row" id="done-topic-status" style={{ justifyContent: 'center' }}>
        {topic && (
          <>
            {topic.score?.completed && <span className="wp-status-badge wp-status-done"><i className="fas fa-check-circle" /> Đã hoàn thành</span>}
            {topic.score && <span className="wp-status-badge wp-status-best"><i className="fas fa-star" /> Điểm cao nhất: {topic.score.bestScore}%</span>}
            <span className="wp-status-badge"><i className="fas fa-chart-line" /> Tiến trình: {topic.completed}/{TOPIC_COUNT} chủ đề</span>
          </>
        )}
      </div>
      <button className="wp-restart-btn" onClick={onRestart}><i className="fas fa-redo" /> Làm lại từ đầu</button>
      <button className="wp-more-btn" onClick={onMore}><i className="fas fa-th" /> Chọn chủ đề khác</button>
    </div>
  );
}

// The wrong answers under the result (the empty box is always there, as before)
function WrongReview({ summary }) {
  const done = summary?.done || 0;
  const wrong = summary?.wrong || [];
  return (
    <div id="done-wrong-review" style={{ width: '100%', textAlign: 'left', marginTop: 8 }}>
      {wrong.length > 0 ? (
        <>
          <h3 className="wp-wr-title">📋 Chi tiết câu sai ({wrong.length})</h3>
          {wrong.map((a, i) => (
            <div key={i} className="wp-wr-item">
              <div className="wp-wr-num">❌ Câu {i + 1} — {TYPE_LABELS[a.type] || a.type}</div>
              <div className="wp-wr-q">{a.question || ''}</div>
              <div className="wp-wr-row"><span className="wp-wr-lbl-you">Bạn:</span> <span className="wp-wr-your">{a.userAnswer || '(bỏ trống)'}</span></div>
              <div className="wp-wr-row"><span className="wp-wr-lbl-ans">Đáp án:</span> <span className="wp-wr-ans">{a.sampleAnswer || ''}</span></div>
              {a.grammarPoint && <div className="wp-wr-gp">📌 {a.grammarPoint}</div>}
            </div>
          ))}
        </>
      ) : done > 0 && (
        <div style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700, fontSize: 14, marginTop: 8 }}>🌟 Không có câu nào sai!</div>
      )}
    </div>
  );
}

function Welcome({ onStart, onHistory }) {
  return (
    <div className="wp-state-welcome" id="state-welcome">
      <div className="wp-welcome-hero pf-hero pf-hero-pink">
        <div className="pf-hero-body">
          <h2 className="wp-welcome-title">Luyện viết <span className="pf-tag">câu giao tiếp</span></h2>
          <p className="wp-welcome-sub pf-hero-sub">Cải thiện kỹ năng viết câu tiếng Anh thông dụng qua các bài tập tương tác — khác với bài thi Writing thật hoặc luyện Task 1 riêng. Chọn cấp độ và chủ đề phù hợp, rồi bắt đầu!</p>
        </div>
      </div>
      {!hasPremiumAccess() && (
        <div id="premium-promo-banner" style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg,rgba(229,57,53,.08),rgba(198,40,40,.06))', border: '1px solid rgba(229,57,53,.2)', borderRadius: 14, padding: '14px 18px', margin: '0 0 20px', flexWrap: 'wrap', textAlign: 'left' }}>
          <div style={{ fontSize: 22 }}>⭐</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand,#e53935)', marginBottom: 2 }}>Nâng cấp Premium để luyện tập không giới hạn</div>
            <div style={{ fontSize: 12, color: 'var(--text2,#555)' }}>Toàn bộ bài luyện câu giao tiếp, Task 1 Grammar, Task 2 Writing và Templates</div>
          </div>
          <button onClick={() => openUpgrade()} style={{ background: 'linear-gradient(135deg,var(--brand,#e53935),var(--brand-dark,#c62828))', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Upgrade Premium</button>
        </div>
      )}
      <div style={{ marginBottom: 28 }}>
        <button className="wp-welcome-start" onClick={onStart}><i className="fas fa-play-circle" /> Bắt đầu luyện tập</button>
        <div style={{ marginTop: 4 }}>
          <button className="t1-hist-open-btn" onClick={onHistory}><i className="fas fa-history" /> Xem lịch sử luyện tập</button>
        </div>
        <p className="wp-welcome-hint">Chọn cấp độ &amp; chủ đề trước khi bắt đầu</p>
      </div>
      <div className="wp-welcome-cards">
        <div className="wp-welcome-card">
          <div className="wp-welcome-card-icon">✏️</div>
          <div className="wp-welcome-card-title">Chế độ Luyện tập</div>
          <div className="wp-welcome-card-desc">Làm từng câu, nhận phản hồi tức thì sau mỗi câu trả lời. Tích lũy XP và theo dõi combo liên tiếp.</div>
        </div>
        <div className="wp-welcome-card">
          <div className="wp-welcome-card-icon">📋</div>
          <div className="wp-welcome-card-title">Chế độ Thi thử</div>
          <div className="wp-welcome-card-desc">Làm bộ đề ngẫu nhiên không có gợi ý — giống thi thật. Xem kết quả chi tiết và đáp án sau khi nộp bài.</div>
        </div>
        <div className="wp-welcome-card">
          <div className="wp-welcome-card-icon">🎯</div>
          <div className="wp-welcome-card-title">3 cấp độ học</div>
          <div className="wp-welcome-card-desc">Beginner → Elementary → Intermediate. Bắt đầu từ cấp thấp và nâng dần khi bạn đã tự tin hơn.</div>
        </div>
        <div className="wp-welcome-card">
          <div className="wp-welcome-card-icon">🔥</div>
          <div className="wp-welcome-card-title">XP &amp; Streak combo</div>
          <div className="wp-welcome-card-desc">Đúng liên tiếp 3–10 câu sẽ kích hoạt combo thưởng. Duy trì thói quen học mỗi ngày để tăng streak.</div>
        </div>
      </div>
      <div className="wp-welcome-types">
        <div className="wp-welcome-types-lbl">5 dạng bài luyện tập</div>
        <div className="wp-welcome-chips">
          <span>🔄 Dịch câu</span>
          <span>🔀 Sắp xếp từ</span>
          <span>✏️ Điền chỗ trống</span>
          <span>🔡 Mở rộng câu</span>
          <span>🔗 Nối câu</span>
        </div>
      </div>
    </div>
  );
}

export default function WritingPractice() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState(() => {
    const f = filtersFromSearch(location.search);
    return { level: f.level || 'beginner', topic: f.topic || 'all', type: f.type || 'all' };
  });
  const [deepLink] = useState(() => filtersFromSearch(location.search).any);
  const [mode, setModeState] = useState('practice');
  const [meta, setMeta] = useState(null);
  const [scores, setScores] = useState(loadTopicScores);
  const [progress, setProgress] = useState(loadProgress);
  const [autoAdvance, setAutoAdvance] = useState(() => loadOption('wp_auto_advance'));
  const [shuffleOn, setShuffleOn] = useState(() => loadOption('wp_shuffle'));
  const [view, setView] = useState(() => (deepLink && hasPremiumAccess() ? 'loading' : 'welcome')); // welcome | loading | empty | exercise | done
  const [sess, setSess] = useState(noSession);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [quit, setQuit] = useState(null);
  const [histOpen, setHistOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [now, setNow] = useState(0);
  const t = useWpTest();

  const attempts = useRef([]); // answers not yet sent (sent at the end, on a change, on leaving)
  const loadSeq = useRef(0);
  const submittingRef = useRef(false);
  const written = useRef(null); // the query this page last put in the address
  const live = useRef({});
  useEffect(() => { live.current = { sess, view, feedback, quit, mode, filters, testRunning: t.running }; });

  const ex = view === 'exercise' ? sess.exercises[sess.idx] : null;

  function saveBatch() {
    const list = attempts.current;
    if (!list.length) return;
    attempts.current = [];
    // Never retried: /save-batch inserts rows, a lost reply would duplicate them.
    // keepalive lets it finish while the page closes.
    apiFetch('/writing-practice/save-batch', { method: 'POST', body: JSON.stringify({ attempts: list }), keepalive: true })
      .catch(() => siteToast('Không lưu được kết quả buổi luyện tập lên server.', 'warn'));
  }

  function writeUrl(f, replace) {
    written.current = filtersQuery(f);
    navigate(BASE + written.current, { replace: !!replace });
  }

  function loadExercises(f) {
    setFeedback(null);
    setSummary(null);
    setView('loading');
    fetchExercises(f, ++loadSeq.current);
  }

  async function fetchExercises(f, seq) {
    try {
      const d = await apiFetch(`/writing-practice/exercises${filtersQuery(f)}`);
      if (seq !== loadSeq.current) return;
      if (!d.success || !d.exercises?.length) { setView('empty'); return; }
      attempts.current = [];
      setSess({ ...noSession, exercises: shuffleOn ? shuffle(d.exercises) : d.exercises, startedAt: Date.now(), run: seq });
      setView('exercise');
    } catch (e) {
      if (seq !== loadSeq.current) return;
      if (e?.status === 403) { openUpgrade(); setView('welcome'); return; }
      setView('empty');
    }
  }

  function startPractice() {
    if (!hasPremiumAccess()) { openUpgrade(); return; }
    loadExercises(filters);
  }

  // The session's results ring in the quit popup, when there is something to show
  function askQuit(opts, onConfirm) {
    const s = live.current.sess;
    const showResults = s.done > 0 && live.current.mode === 'practice';
    let sub = opts.sub;
    if (sub === undefined) {
      sub = showResults ? 'Chuyển sẽ mất tiến độ hiện tại.'
        : s.done ? `Bạn đã làm ${s.done} bài và kiếm được ${s.xp} XP hôm nay.` : 'Tiến độ hôm nay chưa được lưu.';
    }
    const pct = s.done ? Math.round((s.correct / s.done) * 100) : 0;
    // a pending auto-next must not move on behind the popup
    setFeedback((fb) => (fb?.countdown ? { ...fb, countdown: 0 } : fb));
    setQuit({ ...opts, sub, onConfirm, results: showResults ? { pct, correct: s.correct, wrong: s.done - s.correct, xp: s.xp } : null });
  }

  // ── address ── (a link with filters starts practising: view began as 'loading')
  useEffect(() => {
    if (written.current !== null) return;
    writeUrl(filters, true);
    if (!deepLink) window.EWSTour?.autoStart?.(TOUR_PAGE); // first visit; not over a practice a link opened
    else if (!hasPremiumAccess()) openUpgrade();
    else fetchExercises(filters, ++loadSeq.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Back / Forward between filter sets reloads that set (progress is saved)
  useEffect(() => {
    const onPop = () => {
      if (window.location.pathname.replace(/\/+$/, '') !== '/app' + BASE) return;
      const f = filtersFromSearch(window.location.search);
      if (!f.any || filtersQuery(f) === written.current) return;
      const cur = live.current.filters;
      const next = { level: f.level || cur.level, topic: f.topic || cur.topic, type: f.type || cur.type };
      written.current = filtersQuery(next);
      setFilters(next);
      saveBatch();
      loadExercises(next);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let alive = true;
    apiFetch('/writing-practice/meta').then((d) => { if (alive && d.success) setMeta(d); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // ── page-wide hooks ──
  useEffect(() => {
    bindDict('wp-main', 'writing-practice', () => !live.current.testRunning);
    // the "tra câu" sentence lookup stays off during a test as well
    window.__ewsExamActive = () => !!live.current.testRunning;
    return () => { delete window.__ewsExamActive; };
  }, []);
  useRewriteReminder();

  const practising = (mode === 'practice' && view === 'exercise') || t.running;
  useEffect(() => {
    setActivePractice(practising);
    return () => setActivePractice(false);
  }, [practising]);
  useLeaveWarning(t.started);

  // Unsent answers go on leaving (tab closed, or another page of the app)
  useEffect(() => {
    const onUnload = () => saveBatch();
    window.addEventListener('beforeunload', onUnload);
    return () => { window.removeEventListener('beforeunload', onUnload); saveBatch(); };
  }, []);

  // Session clock in the stats widget
  const clockOn = mode === 'practice' && view === 'exercise' && !!sess.startedAt;
  useEffect(() => {
    if (!clockOn) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [clockOn]);

  // Enter on the feedback goes to the next exercise
  const nextRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Enter' || e.shiftKey || live.current.quit || !live.current.feedback) return;
      if (live.current.mode !== 'practice' || live.current.view !== 'exercise') return;
      e.preventDefault();
      nextRef.current?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // "Tự chuyển câu": the next exercise 2 s after the feedback
  useEffect(() => {
    if (!feedback?.countdown) return undefined;
    const timer = setTimeout(() => nextRef.current?.(), feedback.countdown);
    return () => clearTimeout(timer);
  }, [feedback]);

  // The phone sheet keeps the page behind it still
  useEffect(() => {
    if (!sheetOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [sheetOpen]);

  // ── practice ──
  function showFeedback(exercise, userAnswer, { isCorrect, feedbackVi, sampleAnswer }) {
    const isExpand = exercise.type === 'expand';
    if (!isExpand) (isCorrect ? window.playOk : window.playWrong)?.();
    setFeedback({ userAnswer, isExpand, isCorrect, feedbackVi, sampleAnswer, explanation: exercise.explanation || '', countdown: autoAdvance ? AUTO_NEXT_MS : 0 });
  }

  function addProgress(xpEarned, isCorrect) {
    const s = live.current.sess;
    const combo = isCorrect === true ? s.combo + 1 : isCorrect === false ? 0 : s.combo;
    setSess((x) => ({ ...x, done: x.done + 1, xp: x.xp + xpEarned, correct: x.correct + (isCorrect === true ? 1 : 0), combo }));
    if (isCorrect === true) {
      if (combo === 3) siteToast('🔥 3 đúng liên tiếp! Tuyệt vời!', 'info', 2500);
      else if (combo === 5) siteToast('🔥🔥 5 đúng liên tiếp! Xuất sắc!', 'info', 2500);
      else if (combo === 10) siteToast('🏆 10 đúng liên tiếp! Bạn là thiên tài!', 'info', 3000);
      floatXP(xpEarned);
    }
    const r = recordProgress(xpEarned);
    setProgress((p) => ({ xp: r.xp, streak: r.streak ?? p.streak }));
  }

  async function submitAnswer(answer) {
    if (submittingRef.current) return;
    const exercise = live.current.sess.exercises[live.current.sess.idx];
    if (!exercise) return;
    if (!answer) { siteToast('Vui lòng nhập câu trả lời!', 'warn'); return; }
    const run = live.current.sess.run;
    const idx = live.current.sess.idx;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const d = await apiFetch('/writing-practice/check', { method: 'POST', body: JSON.stringify({ exerciseId: exercise._id, userAnswer: answer }) });
      if (!d.success) throw new Error(d.message || 'Lỗi server');
      if (live.current.sess.run !== run || live.current.sess.idx !== idx) return; // moved on meanwhile
      showFeedback(exercise, answer, { isCorrect: d.feedback?.isCorrect, feedbackVi: d.feedback?.feedbackVi, sampleAnswer: d.sampleAnswer });
      addProgress(d.xpEarned || 5, d.feedback?.isCorrect);
      attempts.current.push({
        exerciseId: exercise._id, userAnswer: answer, xpEarned: d.xpEarned || 5,
        isCorrect: d.feedback?.isCorrect ?? null,
        sampleAnswer: d.sampleAnswer || '',
        question: exercise.type === 'combine' ? (exercise.sentences || []).join(' + ') : (exercise.question || ''),
        type: exercise.type,
        grammarPoint: exercise.grammarPoint || '',
      });
    } catch (err) {
      if (err?.status === 403) openUpgrade();
      else if (err?.coldStart) siteToast('Chấm bài quá lâu — server có thể đang khởi động. Hãy thử lại sau vài giây.', 'error', 7000);
      else siteToast('Lỗi khi chấm bài: ' + err.message, 'error');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  // 3 wrong tries on one word: graded wrong here (no /check — the server would
  // only grade the half-typed words) and it comes back later to redo
  function onWbwFail(info) {
    if (submittingRef.current) return;
    const s = live.current.sess;
    const exercise = s.exercises[s.idx];
    if (!exercise) return;
    const { list, requeued } = requeue(s.exercises, s.idx);
    setSess((x) => ({ ...x, exercises: list }));
    const partial = info?.sofar || '';
    showFeedback(exercise, partial ? partial + ' …' : '(chưa gõ xong từ nào)', {
      isCorrect: false, feedbackVi: failFeedbackVi(info, requeued), sampleAnswer: exercise.translationAnswer || '',
    });
    addProgress(XP_WRONG, false);
    attempts.current.push({
      exerciseId: exercise._id, userAnswer: partial, xpEarned: XP_WRONG, isCorrect: false,
      sampleAnswer: exercise.translationAnswer || '', question: exercise.question || '', type: exercise.type, grammarPoint: exercise.grammarPoint || '',
    });
  }

  function skip() {
    const s = live.current.sess;
    const exercise = s.exercises[s.idx];
    if (!exercise) return;
    if (s.skipped.includes(exercise._id)) { siteToast('Câu này đã bỏ qua rồi – hãy trả lời nhé! 😊', 'warn'); return; }
    const list = [...s.exercises];
    list.splice(s.idx, 1);
    list.push(exercise);
    setSess({ ...s, exercises: list, skipped: [...s.skipped, exercise._id] });
    siteToast('Đã bỏ qua – câu này sẽ xuất hiện lại ở cuối 👋', 'info', 2000);
  }

  function finish() {
    const s = live.current.sess;
    const list = attempts.current;
    const gradable = list.filter((a) => a.type !== 'expand').length;
    const pct = gradable ? Math.round((s.correct / gradable) * 100) : (s.done ? 100 : 0);
    const topicId = live.current.filters.topic;
    let topic = null;
    if (topicId !== 'all') {
      const all = gradable > 0 ? saveTopicScore(topicId, pct) : loadTopicScores();
      setScores(all);
      topic = { score: all[topicId], completed: completedTopicCount(all) };
    }
    setSummary({
      done: s.done, xp: s.xp, correct: s.correct, gradable, expandCount: s.done - gradable, pct, topic,
      elapsed: s.startedAt ? Math.floor((Date.now() - s.startedAt) / 1000) : 0,
      wrong: list.filter((a) => a.isCorrect === false),
    });
    setFeedback(null);
    setView('done');
    saveBatch();
  }

  function nextExercise() {
    const s = live.current.sess;
    setFeedback(null);
    if (s.idx + 1 >= s.exercises.length) { finish(); return; }
    setSess({ ...s, idx: s.idx + 1 });
  }
  useEffect(() => { nextRef.current = nextExercise; });

  function restart() {
    const s = live.current.sess;
    let list = s.exercises.filter((x) => !x._isRepeat);
    if (shuffleOn) list = shuffle(list);
    attempts.current = [];
    setFeedback(null);
    setSummary(null);
    setSess({ ...noSession, exercises: list, startedAt: Date.now(), run: ++loadSeq.current });
    setView('exercise');
  }

  function stopPractice() {
    if (sess.done > 0) askQuit({}, finish);
    else { setFeedback(null); setView('welcome'); }
  }

  function moreTopics() {
    if (window.innerWidth <= 768) setSheetOpen(true);
    else document.getElementById('wp-sidebar')?.scrollIntoView({ behavior: 'smooth' });
  }

  // ── filters (the sidebar: each change loads its set; progress is saved) ──
  const CHANGE = {
    level: { title: 'Đổi cấp độ?', sub: 'Bắt đầu lại với bộ bài mới. Tiến độ hiện tại sẽ được lưu.' },
    topic: { title: 'Đổi chủ đề?', sub: 'Bắt đầu lại với chủ đề mới. Tiến độ hiện tại sẽ được lưu.' },
    type: { title: 'Đổi dạng bài?', sub: 'Bắt đầu lại với dạng bài mới. Tiến độ hiện tại sẽ được lưu.' },
  };
  function pick(key, value) {
    if (filters[key] === value) return;
    const go = () => {
      saveBatch();
      const f = { ...live.current.filters, [key]: value };
      setFilters(f);
      writeUrl(f);
      loadExercises(f);
    };
    if (sess.done > 0) askQuit({ ...CHANGE[key], confirmText: 'Đổi ngay', continueText: 'Giữ nguyên' }, go);
    else go();
  }

  // The phone sheet only picks; "Bắt đầu học" loads
  const sheetPick = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }));
  function sheetStart() {
    setSheetOpen(false);
    if (!hasPremiumAccess()) { openUpgrade(); return; }
    const go = () => {
      saveBatch();
      const f = live.current.filters;
      writeUrl(f, true);
      loadExercises(f);
    };
    if (sess.done > 0) askQuit({ title: 'Bắt đầu bộ mới?', sub: 'Tiến độ hiện tại sẽ được lưu.', confirmText: 'Bắt đầu', continueText: 'Tiếp tục' }, go);
    else go();
  }

  // ── modes ──
  function switchMode(m) {
    if (m === mode) return;
    const go = () => {
      saveBatch();
      setFeedback((fb) => (fb ? { ...fb, countdown: 0 } : fb));
      if (m === 'test' && t.phase !== 'intro') t.reset();
      if (mode === 'test' && t.running) t.reset();
      setModeState(m);
    };
    if (mode === 'practice' && sess.done > 0) {
      askQuit({ title: 'Đổi chế độ học?', sub: `Bạn đã làm ${sess.done} bài. Chuyển chế độ sẽ mất tiến độ hiện tại.`, confirmText: 'Đổi chế độ', continueText: 'Giữ nguyên' }, go);
    } else if (mode === 'test' && t.started) {
      askQuit({ title: 'Đổi chế độ học?', sub: `Bài thi đang dở (câu ${t.run.idx + 1}/${t.run.exercises.length}). Tiến độ sẽ bị mất.`, confirmText: 'Đổi chế độ', continueText: 'Giữ nguyên' }, go);
    } else go();
  }

  function stopTest() {
    if (t.run.idx > 0) {
      askQuit({ title: 'Dừng bài thi?', sub: `Câu ${t.run.idx + 1}/${t.run.exercises.length} đang dở. Tiến độ sẽ bị mất.`, confirmText: 'Dừng lại', continueText: 'Tiếp tục thi' }, t.reset);
    } else t.reset();
  }

  function startTest() {
    setSheetOpen(false);
    t.start();
  }

  const correctStr = sess.done ? `${sess.correct}/${sess.done}` : '–';
  const statsShown = mode === 'practice' && (view === 'exercise' || view === 'done');
  const elapsed = clockOn ? Math.max(0, Math.floor((now - sess.startedAt) / 1000)) : (summary?.elapsed ?? 0);
  const startBtn = t.starting
    ? <><i className="fas fa-spinner fa-spin" /> Đang tải...</>
    : <><i className="fas fa-play" /> Bắt đầu thi</>;
  const modeToggle = (prefix, extra, after) => (
    <div className="wp-mode-toggle" style={extra}>
      <button className={`wp-mode-btn${mode === 'practice' ? ' active' : ''}`} id={`${prefix}btn-mode-practice`} onClick={() => { switchMode('practice'); after?.(); }}>
        <i className="fas fa-pencil-alt" /> Luyện tập
      </button>
      <button className={`wp-mode-btn${mode === 'test' ? ' active' : ''}`} id={`${prefix}btn-mode-test`} onClick={() => { switchMode('test'); after?.(); }}>
        <i className="fas fa-clipboard-check" /> Thi thử
      </button>
    </div>
  );
  const options = (prefix) => (
    <>
      <div className="wp-option-row">
        <span className="wp-option-label"><span>⚡</span> Tự chuyển câu</span>
        <Toggle id={`${prefix}toggle-auto-advance`} checked={autoAdvance} onChange={(on) => { setAutoAdvance(on); saveOption('wp_auto_advance', on); }} />
      </div>
      <div className="wp-option-row">
        <span className="wp-option-label"><span>🔀</span> Xáo trộn câu</span>
        <Toggle id={`${prefix}toggle-shuffle`} checked={shuffleOn} onChange={(on) => { setShuffleOn(on); saveOption('wp_shuffle', on); }} />
      </div>
    </>
  );

  return (
    <>
      <div className="wp-mini-stats">
        <div className="wp-xp-badge"><i className="fas fa-star" /> <span id="header-xp">{progress.xp}</span> XP</div>
        <div className="wp-streak-badge">🔥 <span id="header-streak">{progress.streak}</span></div>
      </div>
      <div className="wp-mobile-stats" id="wp-mobile-stats">
        <div className="wp-mob-stat"><div className="wp-mob-stat-num" id="mob-stat-done">{sess.done}</div><div className="wp-mob-stat-lbl">Bài làm</div></div>
        <div className="wp-mob-stat"><div className="wp-mob-stat-num" id="mob-stat-xp">{sess.xp}</div><div className="wp-mob-stat-lbl">XP</div></div>
        <div className="wp-mob-stat"><div className="wp-mob-stat-num" id="mob-stat-correct">{correctStr}</div><div className="wp-mob-stat-lbl">Đúng</div></div>
      </div>

      <div className="wp-layout">
        <aside className="wp-sidebar" id="wp-sidebar">
          {modeToggle('')}
          {mode === 'practice' ? (
            <div id="practice-filters">
              <div className="wp-sidebar-section">
                <div className="wp-sidebar-title"><i className="fas fa-layer-group" /> Cấp độ</div>
                <LevelList meta={meta} level={filters.level} onPick={(v) => pick('level', v)} />
              </div>
              <div className="wp-sidebar-section">
                <div className="wp-sidebar-title"><i className="fas fa-tags" /> Chủ đề</div>
                <TopicList meta={meta} level={filters.level} topic={filters.topic} scores={scores} onPick={(v) => pick('topic', v)} />
              </div>
              <div className="wp-sidebar-section">
                <div className="wp-sidebar-title"><i className="fas fa-tasks" /> Dạng bài</div>
                <TypeList type={filters.type} onPick={(v) => pick('type', v)} />
              </div>
              <div className="wp-sidebar-section">
                <div className="wp-sidebar-title"><i className="fas fa-sliders-h" /> Tùy chọn</div>
                {options('')}
              </div>
            </div>
          ) : (
            <div id="test-setup">
              <div className="wp-sidebar-section">
                <div className="wp-sidebar-title"><i className="fas fa-layer-group" /> Cấp độ</div>
                <TestLevelList meta={meta} level={t.level} onPick={t.setLevel} />
              </div>
              <div className="wp-sidebar-section">
                <div className="wp-sidebar-title"><i className="fas fa-list-ol" /> Số câu</div>
                <TestCountList count={t.count} onPick={t.setCount} />
              </div>
              <button className="wp-start-test-btn" disabled={t.starting} onClick={startTest}>{startBtn}</button>
            </div>
          )}
        </aside>

        <main className="wp-main" id="wp-main">
          {mode === 'practice' ? (
            <div id="mode-practice">
              {view === 'welcome' && <Welcome onStart={startPractice} onHistory={() => setHistOpen(true)} />}
              {view === 'loading' && <div className="wp-state-loading" id="state-loading"><div className="wp-spinner" /><p>Đang tải bài tập...</p></div>}
              {view === 'empty' && (
                <div className="wp-state-empty" id="state-empty">
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                  <h3>Chưa có bài tập</h3>
                  <p>Thử chọn cấp độ hoặc chủ đề khác.</p>
                </div>
              )}
              {view === 'exercise' && ex && (
                <div className="wp-state-exercise" id="state-exercise">
                  <div className="wp-progress-bar-wrap">
                    <div className="wp-progress-bar" id="progress-bar" style={{ width: `${Math.round((sess.idx / sess.exercises.length) * 100)}%` }} />
                  </div>
                  <div className="wp-exercise-meta">
                    <button className="wp-stop-btn" onClick={stopPractice} title="Dừng học"><i className="fas fa-stop-circle" /> Dừng</button>
                    <span className="wp-grammar-badge" id="grammar-badge">{ex.grammarPoint || ''}</span>
                    <span className="wp-ex-counter" id="ex-counter">{sess.idx + 1} / {sess.exercises.length}</span>
                    <span className="wp-type-tag" id="type-tag">{(TYPE_LABELS[ex.type] || ex.type) + (ex._isRepeat ? ' · 🔁 Làm lại' : '')}</span>
                    {sess.combo >= 3 && <span className="wp-combo-badge" id="combo-badge">🔥 ×{sess.combo}</span>}
                  </div>
                  <ExerciseCard
                    key={`${sess.run}-${sess.idx}-${ex._id}`}
                    ex={ex}
                    answered={!!feedback}
                    submitting={submitting}
                    skipped={sess.skipped.includes(ex._id)}
                    onSubmit={submitAnswer}
                    onFail={onWbwFail}
                    onSkip={skip}
                  />
                  {feedback && <FeedbackCard fb={feedback} countdown={feedback.countdown} onNext={nextExercise} />}
                  {submitting && <div className="wp-checking-loader" id="checking-loader"><div className="wp-spinner" /><p>Đang chấm bài...</p></div>}
                </div>
              )}
              {view === 'done' && summary && <DoneScreen summary={summary} onRestart={restart} onMore={moreTopics} />}
              <WrongReview summary={view === 'done' ? summary : null} />
            </div>
          ) : (
            <div id="mode-test">
              <TestPanel t={t} onStop={stopTest} onPractice={() => switchMode('practice')} />
            </div>
          )}
        </main>
      </div>

      <div className="wp-stats-widget" id="wp-stats-widget" style={statsShown ? undefined : { display: 'none' }}>
        <div className="wp-stats-widget-title"><i className="fas fa-chart-bar" /> Phiên này</div>
        <div className="wp-stats-row">
          <div className="wp-stat-box"><div className="wp-stat-num" id="stat-done">{sess.done}</div><div className="wp-stat-label">Bài làm</div></div>
          <div className="wp-stat-box"><div className="wp-stat-num" id="stat-xp">{sess.xp}</div><div className="wp-stat-label">XP</div></div>
          <div className="wp-stat-box"><div className="wp-stat-num" id="stat-correct">{correctStr}</div><div className="wp-stat-label">Đúng</div></div>
          <div className="wp-stat-box"><div className="wp-stat-num" id="stat-timer">{fmtClock(elapsed)}</div><div className="wp-stat-label">Thời gian</div></div>
        </div>
      </div>

      <button className={`wp-mob-fab${sheetOpen ? ' open' : ''}`} id="wp-mob-fab" onClick={() => setSheetOpen(true)} aria-label="Bộ lọc & Cài đặt">
        <i className="fas fa-sliders-h" />
      </button>
      <div className={`wp-mob-backdrop${sheetOpen ? ' visible' : ''}`} id="wp-mob-backdrop" onClick={() => setSheetOpen(false)} />
      <div className={`wp-mob-sheet${sheetOpen ? ' open' : ''}`} id="wp-mob-sheet">
        <div className="wp-sheet-handle"><div className="wp-sheet-handle-bar" /></div>
        <div className="wp-sheet-title">⚙️ Cài đặt luyện tập</div>
        <div className="wp-sheet-body">
          <div className="wp-sheet-section-title"><i className="fas fa-play-circle" /> Chế độ</div>
          {modeToggle('sheet-', { padding: 0, marginBottom: 4 }, () => setSheetOpen(false))}
          {mode === 'practice' ? (
            <div id="sheet-practice-filters">
              <div className="wp-sheet-section-title"><i className="fas fa-layer-group" /> Cấp độ</div>
              <div className="wp-sheet-filters"><LevelList meta={meta} level={filters.level} onPick={sheetPick('level')} /></div>
              <div className="wp-sheet-section-title"><i className="fas fa-tags" /> Chủ đề</div>
              <div className="wp-sheet-filters"><TopicList meta={meta} level={filters.level} topic={filters.topic} scores={scores} onPick={sheetPick('topic')} /></div>
              <div className="wp-sheet-section-title"><i className="fas fa-tasks" /> Dạng bài</div>
              <div className="wp-sheet-filters"><TypeList type={filters.type} onPick={sheetPick('type')} /></div>
              <div className="wp-sheet-section-title"><i className="fas fa-sliders-h" /> Tùy chọn</div>
              <div style={{ padding: '0 0 4px' }}>{options('sheet-')}</div>
              <button className="wp-start-learn-btn" onClick={sheetStart}><i className="fas fa-play" /> Bắt đầu học</button>
            </div>
          ) : (
            <div id="sheet-test-setup">
              <div className="wp-sheet-section-title"><i className="fas fa-layer-group" /> Cấp độ</div>
              <div className="wp-sheet-filters"><TestLevelList meta={meta} level={t.level} onPick={t.setLevel} /></div>
              <div className="wp-sheet-section-title"><i className="fas fa-list-ol" /> Số câu</div>
              <div className="wp-sheet-filters"><TestCountList count={t.count} onPick={t.setCount} /></div>
              <button className="wp-start-test-btn" disabled={t.starting} onClick={startTest}>{startBtn}</button>
            </div>
          )}
        </div>
      </div>

      {histOpen && <HistoryDialog onClose={() => setHistOpen(false)} />}
      {quit && (
        <QuitDialog
          q={quit}
          onContinue={() => setQuit(null)}
          onConfirm={() => { const cb = quit.onConfirm; setQuit(null); cb?.(); }}
        />
      )}
    </>
  );
}
