import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { hasPremiumAccess } from '../utils/plan';
import { bindDict, openUpgrade, setActivePractice, siteToast, useLeaveWarning } from '../utils/shell';
import {
  addXP, completedSkillCount, doneTitle, loadOption, loadSkillScores, loadXP, MC_TYPES, questionText, saveOption,
  saveSkillScore, SETS, SKILL_COUNT, SKILL_LABELS, SKILLS, stateFromSearch, stateQuery, TEST_LEVELS, TYPE_LABELS, wrongXP,
} from '../utils/task1Grammar';
import { failFeedbackVi, requeue, shuffle } from '../utils/writingPractice';
import { ExerciseCard, FeedbackCard } from './task1Grammar/Exercise';
import { QuitDialog, Toggle } from './task1Grammar/Parts';
import { TestPanel } from './task1Grammar/Test';
import { useT1Test } from './task1Grammar/useT1Test';
import { HistoryDialog } from './task1Grammar/History';

// 📊 Task 1 Grammar — /app/task1-practice?skill=&set=&mode= (was
// task1-practice.html). Practice: one exercise at a time with instant
// grading, XP and combos, per skill and set (Bộ 1 / Bộ 2); Thi thử: a timed
// random set graded at the end. A link with a skill (homework) only selects it.

const BASE = '/task1-practice';
const AUTO_NEXT_MS = 1500;
const TOUR_PAGE = 'task1-practice.html';

const noSession = { exercises: [], idx: 0, done: 0, xp: 0, correct: 0, combo: 0, skipped: [], run: 0 };

function floatXP(amount) {
  const anchor = document.getElementById('header-xp');
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

function copyLink() {
  const url = window.location.href;
  const ok = () => siteToast('Đã sao chép link chia sẻ! 🔗', 'info', 2500);
  const fallback = () => {
    const el = document.createElement('textarea');
    el.value = url; el.style.position = 'fixed'; el.style.opacity = '0';
    document.body.appendChild(el); el.select();
    try { document.execCommand('copy'); ok(); } catch { siteToast('Không sao chép được, hãy copy thủ công.', 'warn'); }
    el.remove();
  };
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok).catch(fallback);
  else fallback();
}

// The Writing "viết lại" reminder (bottom of js/shared/review-required-popup.js)
function useRewriteReminder() {
  useEffect(() => {
    window.WritingRewriteReminder?.check();
    return () => document.getElementById('writing-rewrite-banner')?.remove();
  }, []);
}

function SkillList({ meta, set, skill, scores, onPick }) {
  const data = (set ? meta?.setCounts?.[set] : meta?.counts?.all) || {};
  return (
    <div className="t1-skill-list">
      {SKILLS.map((s) => {
        const n = s.id === 'all' ? (data._total || 0) : (data[s.id] || 0);
        const done = s.id !== 'all' && scores[s.id]?.completed;
        return (
          <button key={s.id} className={`t1-skill-tab${s.id === skill ? ' active' : ''}`} data-skill={s.id}
            style={meta && !n && s.id !== 'all' ? { opacity: 0.6 } : undefined} onClick={() => onPick(s.id)}>
            {s.label}
            {done && <i className="fas fa-check-circle wp-item-done-icon" title="Đã hoàn thành (≥80%)" />}
            {done && <span className="t1-skill-redo-pill" title="Bấm để luyện lại kỹ năng này"><i className="fas fa-redo" style={{ fontSize: 8 }} /> Làm lại</span>}
            {meta && <span className="wp-lc-badge">{n || ''}</span>}
          </button>
        );
      })}
    </div>
  );
}

function SetList({ set, onPick }) {
  return (
    <div className="t1-set-list">
      {SETS.map((s) => (
        <button key={s.id || 'all'} className={`t1-set-tab${s.id === set ? ' active' : ''}`} data-set={s.id} onClick={() => onPick(s.id)}>{s.label}</button>
      ))}
    </div>
  );
}

function TestLevelList({ meta, level, onPick }) {
  return (
    <div className="wp-level-list">
      {TEST_LEVELS.map((l) => {
        const n = meta?.counts?.[l.id]?._total || 0;
        return (
          <button key={l.id} className={`wp-level-btn${l.id === level ? ' active' : ''}`} data-tlevel={l.id} onClick={() => onPick(l.id)}>
            {l.label}{n > 0 && <span className="wp-lc-badge">{n}</span>}
          </button>
        );
      })}
    </div>
  );
}

function TestCountList({ count, onPick }) {
  return (
    <div className="wp-level-list">
      {[10, 15, 20].map((n) => (
        <button key={n} className={`wp-level-btn${n === count ? ' active' : ''}`} data-tcount={n} onClick={() => onPick(n)}>{n} câu</button>
      ))}
    </div>
  );
}

function Welcome({ onStart, onHistory }) {
  return (
    <div className="wp-state-welcome" id="state-welcome">
      <div className="wp-welcome-hero pf-hero pf-hero-sky">
        <div className="pf-hero-body">
          <h2 className="wp-welcome-title">Task 1 <span className="pf-tag">Writing Practice</span></h2>
          <p className="wp-welcome-sub pf-hero-sub">Luyện từng kỹ năng riêng biệt để viết Task 1 đạt điểm cao. Chọn cấp độ và kỹ năng, rồi bắt đầu!</p>
        </div>
      </div>
      <div style={{ marginBottom: 28 }}>
        <button className="wp-welcome-start" onClick={onStart}><i className="fas fa-play-circle" /> Bắt đầu luyện tập</button>
        <div style={{ marginTop: 4, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="t1-hist-open-btn" onClick={onHistory}><i className="fas fa-history" /> Xem lịch sử</button>
          <button className="t1-hist-open-btn" onClick={copyLink} id="copy-url-btn"><i className="fas fa-link" /> Sao chép link</button>
        </div>
        <p className="wp-welcome-hint">Chọn cấp độ &amp; kỹ năng trước khi bắt đầu</p>
      </div>
      <div className="wp-welcome-cards">
        <div className="wp-welcome-card">
          <div className="wp-welcome-card-icon">📝</div>
          <div className="wp-welcome-card-title">6 kỹ năng Task 1</div>
          <div className="wp-welcome-card-desc">Noun Phrase, Mô tả Data, So sánh, Xu hướng, Paraphrase, Overview — mỗi kỹ năng luyện riêng.</div>
        </div>
        <div className="wp-welcome-card">
          <div className="wp-welcome-card-icon">⚡</div>
          <div className="wp-welcome-card-title">Chấm bài tức thì</div>
          <div className="wp-welcome-card-desc">Tất cả dạng bài đều được chấm tự động ngay lập tức — không cần chờ đợi.</div>
        </div>
        <div className="wp-welcome-card">
          <div className="wp-welcome-card-icon">🎯</div>
          <div className="wp-welcome-card-title">3 cấp độ</div>
          <div className="wp-welcome-card-desc">Beginner → Elementary → Intermediate. Bắt đầu từ cơ bản, nâng dần khi tự tin hơn.</div>
        </div>
        <div className="wp-welcome-card">
          <div className="wp-welcome-card-icon">💡</div>
          <div className="wp-welcome-card-title">Giải thích ngữ pháp</div>
          <div className="wp-welcome-card-desc">Mỗi câu đều có giải thích Grammar Point rõ ràng bằng tiếng Việt.</div>
        </div>
      </div>
      <div className="wp-welcome-types">
        <div className="wp-welcome-types-lbl">7 dạng bài luyện tập</div>
        <div className="wp-welcome-chips">
          <span>🔤 Điền chỗ trống</span>
          <span>🔄 Dịch câu</span>
          <span>🔀 Sắp xếp từ</span>
          <span>☑️ Trắc nghiệm</span>
          <span>🔧 Sửa lỗi sai</span>
          <span>🔁 Chọn paraphrase</span>
          <span>✏️ Viết lại câu</span>
        </div>
      </div>
    </div>
  );
}

function DoneScreen({ summary, onRetryWrong, onRestart, onMore }) {
  const iconRef = useRef(null);
  useEffect(() => {
    const M = window.Mascot;
    if (M?.mount && iconRef.current) M.mount(iconRef.current, M.moodForScore(summary.pct));
  }, [summary]);
  const { done, pct, correct, wrong, xp, skill } = summary;
  return (
    <div className="wp-state-done" id="state-done">
      <div className="wp-done-icon" id="done-icon" ref={iconRef}>{pct >= 80 ? '😎' : pct >= 50 ? '🤔' : '😤'}</div>
      <h2 id="done-title">{doneTitle(pct)}</h2>
      <p id="done-summary">Hoàn thành {done} câu — tỉ lệ đúng {pct}%</p>
      <div className="wp-done-stats" id="done-stats">
        <span>✅ Đúng: {correct}</span><span>❌ Sai: {wrong.length}</span><span>⭐ XP: +{xp}</span>
      </div>
      <div className="wp-status-row" id="done-skill-status" style={{ justifyContent: 'center' }}>
        {skill && (
          <>
            {skill.score?.completed && <span className="wp-status-badge wp-status-done"><i className="fas fa-check-circle" /> Đã hoàn thành</span>}
            {skill.score && <span className="wp-status-badge wp-status-best"><i className="fas fa-star" /> Điểm cao nhất: {skill.score.bestScore}%</span>}
            <span className="wp-status-badge"><i className="fas fa-chart-line" /> Tiến trình: {skill.completed}/{SKILL_COUNT} kỹ năng</span>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', margin: '12px 0' }}>
        {wrong.length > 0 && (
          <button id="done-retry-wrong-btn" className="wp-restart-btn" onClick={onRetryWrong} style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', color: '#fff' }}>
            <i className="fas fa-redo-alt" /> <span id="done-retry-count">Làm lại {wrong.length} câu sai</span>
          </button>
        )}
        <button className="wp-restart-btn" onClick={onRestart}><i className="fas fa-redo" /> Làm lại từ đầu</button>
        <button className="wp-more-btn" onClick={onMore}><i className="fas fa-brain" /> Chọn kỹ năng khác</button>
      </div>
      <div id="done-wrong-review" style={{ width: '100%', textAlign: 'left' }}>
        {wrong.length > 0 ? (
          <>
            <h3 className="wp-wr-title">📋 Chi tiết câu sai ({wrong.length})</h3>
            {wrong.map((a, i) => (
              <div key={i} className="wp-wr-item">
                <div className="wp-wr-num">❌ Câu {i + 1} — {TYPE_LABELS[a.type] || a.type}<span className="wp-wr-skill">{SKILL_LABELS[a.skillType] || ''}</span></div>
                <div className="wp-wr-q">{a.instruction ? a.instruction + ' ' : ''}{a.questionText || ''}</div>
                <div className="wp-wr-row"><span className="wp-wr-lbl-you">Bạn:</span> <span className="wp-wr-your">{a.shownAnswer || a.userAnswer || '(bỏ trống)'}</span></div>
                <div className="wp-wr-row"><span className="wp-wr-lbl-ans">Đáp án:</span> <span className="wp-wr-ans">{a.sampleAnswer || ''}</span></div>
                {a.feedbackVi && <div className="wp-wr-gp">{a.feedbackVi}</div>}
              </div>
            ))}
          </>
        ) : <div className="wp-wr-all-ok">🌟 Không có câu nào sai!</div>}
      </div>
    </div>
  );
}

export default function Task1Grammar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [init] = useState(() => stateFromSearch(location.search));
  const [skill, setSkill] = useState(init.skill || 'all');
  const [set, setSet] = useState(init.set);
  const [mode, setModeState] = useState(init.mode);
  const [meta, setMeta] = useState(null);
  const [scores, setScores] = useState(loadSkillScores);
  const [headerXP, setHeaderXP] = useState(loadXP);
  const [autoNext, setAutoNext] = useState(() => loadOption('t1_autonext'));
  const [shuffleOn, setShuffleOn] = useState(() => loadOption('t1_shuffle'));
  const [view, setView] = useState('welcome'); // welcome | loading | empty | exercise | done
  const [sess, setSess] = useState(noSession);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [quit, setQuit] = useState(null);
  const [histOpen, setHistOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const t = useT1Test();

  const attempts = useRef([]); // answers not yet sent (on the result screen, a change, leaving)
  const original = useRef(null); // the whole set while "Làm lại câu sai" runs a part of it
  const loadSeq = useRef(0);
  const submittingRef = useRef(false);
  const written = useRef(null); // the query this page last put in the address
  const live = useRef({});
  useEffect(() => { live.current = { sess, view, feedback, quit, mode, skill, set, testRunning: t.running, testReset: t.reset }; });

  const ex = view === 'exercise' ? sess.exercises[sess.idx] : null;

  function saveBatch() {
    const list = attempts.current;
    if (!list.length) return;
    attempts.current = [];
    // Never retried: /save-batch inserts rows, a lost reply would duplicate them.
    // keepalive lets it finish while the page closes.
    const rows = list.map(({ shownAnswer, ...a }) => a); // eslint-disable-line no-unused-vars
    apiFetch('/task1/save-batch', { method: 'POST', body: JSON.stringify({ attempts: rows, sessionId: Date.now().toString() }), keepalive: true })
      .catch(() => siteToast('Không lưu được kết quả buổi luyện tập lên server.', 'warn'));
  }

  function writeUrl(st, push) {
    written.current = stateQuery(st);
    navigate(BASE + written.current, { replace: !push });
  }
  const current = () => ({ skill: live.current.skill, set: live.current.set, mode: live.current.mode });

  function startSession(list) {
    attempts.current = [];
    setFeedback(null);
    setSummary(null);
    setSess({ ...noSession, exercises: list, run: ++loadSeq.current });
    setView('exercise');
  }

  async function loadExercises(sk, st) {
    original.current = null;
    setFeedback(null);
    setSummary(null);
    setView('loading');
    const seq = ++loadSeq.current;
    try {
      const q = new URLSearchParams({ level: 'all', skillType: sk });
      if (st) q.set('tag', st);
      const d = await apiFetch(`/task1/exercises?${q}`);
      if (seq !== loadSeq.current) return;
      if (!d.success || !d.exercises?.length) { setView('empty'); return; }
      startSession(shuffleOn ? shuffle(d.exercises) : d.exercises);
    } catch (e) {
      if (seq !== loadSeq.current) return;
      if (e?.status === 403) { openUpgrade(); setView('welcome'); return; }
      setView('empty');
    }
  }

  function startPractice() {
    if (!hasPremiumAccess()) { openUpgrade(); return; }
    loadExercises(skill, set);
  }

  function askQuit(opts, onConfirm) {
    setFeedback((fb) => (fb?.countdown ? { ...fb, countdown: 0 } : fb)); // no auto-next behind the popup
    setQuit({ ...opts, onConfirm });
  }

  // ── address ── (a link with a skill/set/mode only selects them)
  useEffect(() => {
    if (written.current !== null) return;
    writeUrl({ skill, set, mode }, false);
    window.EWSTour?.autoStart?.(TOUR_PAGE);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Back / Forward: apply that address (progress is saved)
  useEffect(() => {
    const onPop = () => {
      if (window.location.pathname.replace(/\/+$/, '') !== '/app' + BASE) return;
      const st = stateFromSearch(window.location.search);
      const next = { skill: st.skill || 'all', set: st.set, mode: st.mode };
      if (stateQuery(next) === written.current) return;
      written.current = stateQuery(next);
      saveBatch();
      live.current.testReset();
      setSkill(next.skill);
      setSet(next.set);
      setModeState(next.mode);
      if (next.mode === 'practice') loadExercises(next.skill, next.set);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let alive = true;
    apiFetch('/task1/meta').then((d) => { if (alive && d.success) setMeta(d); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // ── page-wide hooks ──
  useEffect(() => {
    bindDict('wp-main', 'task1-practice', () => !live.current.testRunning);
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

  // "Tự chuyển câu": the next exercise 1.5 s after a right answer
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
  function record(exercise, { userAnswer, shownAnswer, isCorrect, score, xpEarned, sampleAnswer, feedbackVi }) {
    const s = live.current.sess;
    const combo = isCorrect ? s.combo + 1 : 0;
    setSess((x) => ({ ...x, done: x.done + 1, xp: x.xp + xpEarned, correct: x.correct + (isCorrect ? 1 : 0), combo }));
    (isCorrect ? window.playOk : window.playWrong)?.();
    setHeaderXP(addXP(xpEarned));
    floatXP(xpEarned);
    attempts.current.push({
      exerciseId: exercise._id, userAnswer, shownAnswer,
      isCorrect: !!isCorrect, score: score || 0,
      xpEarned, skillType: exercise.skillType, module: exercise.module,
      questionText: questionText(exercise),
      instruction: exercise.instruction || '',
      sampleAnswer: sampleAnswer || '',
      feedbackVi: feedbackVi || '',
      type: exercise.type,
    });
  }

  async function submitAnswer(answer, mcIdx) {
    if (submittingRef.current) return;
    const s = live.current.sess;
    const exercise = s.exercises[s.idx];
    if (!exercise) return;
    if (answer === '' || answer == null) { siteToast('Vui lòng nhập/chọn câu trả lời!', 'warn'); return; }
    const run = s.run;
    const idx = s.idx;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const d = await apiFetch('/task1/check', { method: 'POST', body: JSON.stringify({ exerciseId: exercise._id, userAnswer: answer }), timeout: 30000 });
      if (!d.success) throw new Error(d.message || 'Lỗi server');
      if (live.current.sess.run !== run || live.current.sess.idx !== idx) return; // moved on meanwhile
      const isMc = MC_TYPES.includes(exercise.type);
      const shownAnswer = isMc ? (exercise.options?.[mcIdx] ?? answer) : answer;
      const earned = d.xpEarned || 5;
      setFeedback({
        userAnswer: answer, isCorrect: !!d.isCorrect, sampleAnswer: d.sampleAnswer, feedbackVi: d.feedbackVi,
        grammarPoint: d.grammarPoint, explanation: d.explanation,
        mc: isMc ? { options: exercise.options || [], picked: mcIdx, correct: d.correctOptionIndex ?? (exercise.options || []).indexOf(d.sampleAnswer), isCorrect: !!d.isCorrect } : null,
        countdown: autoNext && d.isCorrect ? AUTO_NEXT_MS : 0,
      });
      record(exercise, { userAnswer: answer, shownAnswer, isCorrect: d.isCorrect, score: d.score, xpEarned: earned, sampleAnswer: d.sampleAnswer, feedbackVi: d.feedbackVi });
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
    const feedbackVi = failFeedbackVi(info, requeued);
    setFeedback({
      userAnswer: partial ? partial + ' …' : '(chưa gõ xong từ nào)', isCorrect: false,
      sampleAnswer: exercise.translationAnswer || '', feedbackVi, grammarPoint: '', explanation: '', mc: null, countdown: 0,
    });
    record(exercise, { userAnswer: partial, isCorrect: false, score: 0, xpEarned: wrongXP(exercise), sampleAnswer: exercise.translationAnswer || '', feedbackVi });
  }

  function skip() {
    if (submittingRef.current) return;
    const s = live.current.sess;
    const exercise = s.exercises[s.idx];
    if (!exercise || s.skipped.includes(exercise._id)) { siteToast('Câu này đã bỏ qua rồi – hãy trả lời nhé! 😊', 'warn'); return; }
    const list = [...s.exercises];
    list.splice(s.idx, 1);
    list.push(exercise);
    setSess({ ...s, exercises: list, skipped: [...s.skipped, exercise._id] });
    siteToast('Đã bỏ qua – câu này sẽ xuất hiện lại ở cuối 👋', 'info', 2000);
  }

  function finish() {
    const s = live.current.sess;
    const pct = s.done > 0 ? Math.round((s.correct / s.done) * 100) : 0;
    const wrong = attempts.current.filter((a) => !a.isCorrect);
    const sk = live.current.skill;
    let skillInfo = null;
    if (sk !== 'all') {
      const all = s.done > 0 ? saveSkillScore(sk, pct) : loadSkillScores();
      setScores(all);
      skillInfo = { score: all[sk], completed: completedSkillCount(all) };
    }
    setSummary({ done: s.done, pct, correct: s.correct, wrong, xp: s.xp, skill: skillInfo });
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
    const base = original.current || live.current.sess.exercises;
    original.current = null;
    startSession(base.filter((x) => !x._isRepeat));
  }

  function retryWrong() {
    const ids = new Set((summary?.wrong || []).map((a) => String(a.exerciseId)));
    const seen = new Set();
    const list = live.current.sess.exercises
      .filter((x) => ids.has(String(x._id)))
      .filter((x) => { const id = String(x._id); if (seen.has(id)) return false; seen.add(id); return true; })
      .map(({ _isRepeat, ...rest }) => rest); // eslint-disable-line no-unused-vars
    if (!list.length) { siteToast('Không còn câu sai!', 'info'); return; }
    if (!original.current) original.current = live.current.sess.exercises; // the real set, kept once
    startSession(list);
  }

  function moreSkills() {
    saveBatch();
    setSess(noSession);
    setSummary(null);
    setView('welcome');
  }

  function stopPractice() {
    if (sess.done === 0) { setFeedback(null); setView('welcome'); return; }
    askQuit({ title: 'Dừng luyện tập?', sub: `Bạn đã làm ${sess.done} câu. Xem tổng kết nhé!`, confirmText: 'Xem kết quả', continueText: 'Tiếp tục học' }, finish);
  }

  // ── filters (the sidebar: each change loads its set; progress is saved) ──
  function pickSkill(value) {
    if (value === skill) return;
    const go = () => {
      saveBatch();
      setSkill(value);
      writeUrl({ ...current(), skill: value }, true);
      loadExercises(value, live.current.set);
    };
    if (sess.done > 0) askQuit({ title: 'Đổi kỹ năng?', sub: 'Tiến độ sẽ được lưu.', confirmText: 'Đổi ngay', continueText: 'Giữ nguyên' }, go);
    else go();
  }
  function pickSet(value) {
    if (value === set) return;
    const go = () => {
      saveBatch();
      setSet(value);
      writeUrl({ ...current(), set: value }, true);
      if (live.current.mode === 'practice') loadExercises(live.current.skill, value);
    };
    if (sess.done > 0) askQuit({ title: 'Đổi bộ bài?', sub: 'Tiến độ sẽ được lưu.', confirmText: 'Đổi ngay', continueText: 'Giữ nguyên' }, go);
    else go();
  }

  // The phone sheet only picks; "Bắt đầu học" loads
  function sheetSet(value) {
    setSet(value);
    writeUrl({ ...current(), set: value }, false);
  }
  function sheetStart() {
    setSheetOpen(false);
    if (!hasPremiumAccess()) { openUpgrade(); return; }
    const go = () => {
      saveBatch();
      writeUrl(current(), false);
      loadExercises(live.current.skill, live.current.set);
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
      t.reset(); // the test always starts from its intro (and stops its clock)
      setModeState(m);
      writeUrl({ ...current(), mode: m }, true);
    };
    if ((mode === 'practice' && sess.done > 0) || (mode === 'test' && t.started)) {
      askQuit({ title: 'Đổi chế độ?', sub: 'Tiến độ hiện tại sẽ bị mất.', confirmText: 'Đổi chế độ', continueText: 'Giữ nguyên' }, go);
    } else go();
  }

  function stopTest() {
    if (t.run.idx === 0) { t.reset(); return; }
    askQuit({ title: 'Dừng bài thi?', sub: `Câu ${t.run.idx + 1}/${t.run.exercises.length}. Kết quả sẽ bị mất.`, confirmText: 'Dừng lại', continueText: 'Tiếp tục thi' }, t.reset);
  }

  const pctStr = sess.done > 0 ? Math.round((sess.correct / sess.done) * 100) + '%' : '–';
  const statsShown = mode === 'practice' && (view === 'exercise' || view === 'done');
  const startBtn = t.starting
    ? <><i className="fas fa-spinner fa-spin" /> Đang tải...</>
    : <><i className="fas fa-play" /> Bắt đầu thi</>;
  const modeToggle = (prefix, style, after) => (
    <div className="wp-mode-toggle" style={style}>
      <button className={`wp-mode-btn${mode === 'practice' ? ' active' : ''}`} id={`${prefix}btn-mode-practice`} onClick={() => { switchMode('practice'); after?.(); }}>
        <i className="fas fa-pencil-alt" /> Luyện tập
      </button>
      <button className={`wp-mode-btn${mode === 'test' ? ' active' : ''}`} id={`${prefix}btn-mode-test`} onClick={() => { switchMode('test'); after?.(); }}>
        <i className="fas fa-clipboard-check" /> Thi thử
      </button>
    </div>
  );
  const options = (prefix, style) => (
    <div className="t1-settings-section" style={style}>
      <Toggle id={`${prefix}toggle-autonext`} label="⚡ Tự chuyển câu" title="Tự động chuyển sang câu tiếp theo sau khi trả lời đúng"
        checked={autoNext} onChange={(on) => { setAutoNext(on); saveOption('t1_autonext', on); }} />
      <Toggle id={`${prefix}toggle-shuffle`} label="🔀 Xáo trộn câu" title="Xáo trộn thứ tự câu hỏi ngẫu nhiên"
        checked={shuffleOn} onChange={(on) => { setShuffleOn(on); saveOption('t1_shuffle', on); }} />
    </div>
  );

  return (
    <>
      <div className="wp-mini-stats">
        <div className="wp-xp-badge"><i className="fas fa-star" /> <span id="header-xp">{headerXP}</span> XP</div>
        <div className="wp-streak-badge">🔥 <span id="header-streak">{sess.combo}</span></div>
      </div>

      <div className="wp-stats-widget" id="t1-stats-widget" style={statsShown ? undefined : { display: 'none' }}>
        <div className="wp-stats-widget-title"><i className="fas fa-chart-bar" /> Phiên học</div>
        <div className="wp-stats-row">
          <div className="wp-stat-box"><div className="wp-stat-num" id="widget-done">{sess.done}</div><div className="wp-stat-label">Bài làm</div></div>
          <div className="wp-stat-box"><div className="wp-stat-num" id="widget-xp">{sess.xp}</div><div className="wp-stat-label">XP</div></div>
          <div className="wp-stat-box"><div className="wp-stat-num" id="widget-correct">{pctStr}</div><div className="wp-stat-label">Đúng</div></div>
        </div>
      </div>

      <div className="wp-mobile-stats" id="wp-mobile-stats">
        <div className="wp-mob-stat"><div className="wp-mob-stat-num" id="mob-stat-done">{sess.done}</div><div className="wp-mob-stat-lbl">Bài làm</div></div>
        <div className="wp-mob-stat"><div className="wp-mob-stat-num" id="mob-stat-xp">{sess.xp}</div><div className="wp-mob-stat-lbl">XP</div></div>
        <div className="wp-mob-stat"><div className="wp-mob-stat-num" id="mob-stat-correct">{pctStr}</div><div className="wp-mob-stat-lbl">Đúng</div></div>
      </div>

      <div className="wp-layout">
        <aside className="wp-sidebar" id="wp-sidebar">
          {modeToggle('')}
          {mode === 'practice' ? (
            <div id="practice-filters">
              <div className="wp-sidebar-section">
                <div className="wp-sidebar-title"><i className="fas fa-layer-group" /> Bộ bài</div>
                <SetList set={set} onPick={pickSet} />
                <div className="wp-sidebar-title"><i className="fas fa-brain" /> Kỹ năng</div>
                <SkillList meta={meta} set={set} skill={skill} scores={scores} onPick={pickSkill} />
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
              <button className="wp-start-test-btn" disabled={t.starting} onClick={t.start}>{startBtn}</button>
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
                  <p>Thử chọn cấp độ hoặc kỹ năng khác.</p>
                </div>
              )}
              {view === 'exercise' && ex && (
                <div className="wp-state-exercise" id="state-exercise">
                  <div className="wp-progress-bar-wrap">
                    <div className="wp-progress-bar" id="progress-bar" style={{ width: `${Math.round((sess.idx / sess.exercises.length) * 100)}%` }} />
                  </div>
                  <div className="wp-exercise-meta">
                    <button className="wp-stop-btn" onClick={stopPractice} title="Dừng học"><i className="fas fa-stop-circle" /> Dừng</button>
                    <span className="wp-grammar-badge" id="grammar-badge">{ex.skillType ? (SKILL_LABELS[ex.skillType] || ex.skillType) : ''}</span>
                    <span className="wp-ex-counter" id="ex-counter">{sess.idx + 1} / {sess.exercises.length}</span>
                    <span className="wp-type-tag" id="type-tag">{(TYPE_LABELS[ex.type] || ex.type) + (ex._isRepeat ? ' · 🔁 Làm lại' : '')}</span>
                    {sess.combo >= 3 && <span className="wp-combo-badge" id="combo-badge">🔥 ×{sess.combo}</span>}
                  </div>
                  <ExerciseCard
                    key={`${sess.run}-${sess.idx}-${ex._id}`}
                    ex={ex}
                    hidden={!!feedback}
                    submitting={submitting}
                    skipped={sess.skipped.includes(ex._id)}
                    onSubmit={submitAnswer}
                    onFail={onWbwFail}
                    onSkip={skip}
                  />
                  {feedback && <FeedbackCard fb={feedback} onNext={nextExercise} />}
                  {submitting && <div className="wp-checking-loader" id="checking-loader"><div className="wp-spinner" /><p>Đang chấm bài...</p></div>}
                </div>
              )}
              {view === 'done' && summary && <DoneScreen summary={summary} onRetryWrong={retryWrong} onRestart={restart} onMore={moreSkills} />}
            </div>
          ) : (
            <div id="mode-test">
              <TestPanel t={t} onStop={stopTest} onPractice={() => switchMode('practice')} />
            </div>
          )}
        </main>
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
              <div className="wp-sheet-section-title"><i className="fas fa-layer-group" /> Bộ bài</div>
              <div className="wp-sheet-filters"><SetList set={set} onPick={sheetSet} /></div>
              <div className="wp-sheet-section-title"><i className="fas fa-brain" /> Kỹ năng</div>
              <div className="wp-sheet-filters"><SkillList meta={meta} set={set} skill={skill} scores={scores} onPick={setSkill} /></div>
              {options('sheet-', { padding: '10px 0 2px' })}
              <button className="wp-start-learn-btn" onClick={sheetStart}><i className="fas fa-play" /> Bắt đầu học</button>
            </div>
          ) : (
            <div id="sheet-test-setup">
              <div className="wp-sheet-section-title"><i className="fas fa-layer-group" /> Cấp độ</div>
              <div className="wp-sheet-filters"><TestLevelList meta={meta} level={t.level} onPick={t.setLevel} /></div>
              <div className="wp-sheet-section-title"><i className="fas fa-list-ol" /> Số câu</div>
              <div className="wp-sheet-filters"><TestCountList count={t.count} onPick={t.setCount} /></div>
              <button className="wp-start-test-btn" disabled={t.starting} onClick={() => { setSheetOpen(false); t.start(); }}>{startBtn}</button>
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
