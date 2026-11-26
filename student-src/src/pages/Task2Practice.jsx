import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { hasPremiumAccess } from '../utils/plan';
import { bindDict, openUpgrade, siteToast } from '../utils/shell';
import { addXP, BASE, hubUrl, isLoggedIn, isStudent, loadPrefs, loadVocabProgress, loadXP, savePrefs } from '../utils/task2Practice';
import { Topics, Weeks } from './task2Practice/Weeks';
import { TopicScreen } from './task2Practice/Topic';
import { fetchTopicData, prefetched } from './task2Practice/lib';
import { HistoryDialog } from './task2Practice/Dialogs';

// 📝 Task 2 Luyện đề tuần — /app/task2-practice (was task2-practice.html).
//   (nothing)            the lessons, grouped by essay type ("Buổi 1..N")
//   ?week=N              one week's topics
//   ?week=N&topicId=ID   one lesson: 6 steps (+ practice / exam runs)
//   …&write=1            the split-screen writer
// Old links: ?mode=vocab|exam scrolls to that step; /task2-practice/<id> = ?topicId=<id>.
// Same API (/api/task2/*) and localStorage keys as the old page.

const TOUR_PAGE = 'task2-practice.html';
const INVITE_POLL_MS = 6000;

function every(fn, ms) {
  if (window.ActivityGate) return window.ActivityGate.poll(fn, ms);
  const id = setInterval(fn, ms);
  return { stop: () => clearInterval(id) };
}

export default function Task2Practice() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const q = new URLSearchParams(location.search);
  const week = parseInt(q.get('week'), 10) || null;
  const topicId = params.topicId || q.get('topicId') || null;
  const write = !!q.get('write');
  const mode = q.get('mode');
  const focus = mode === 'vocab' || mode === 'exam' ? mode : null;

  const [base, setBase] = useState(null); // { weeks, sessions } · 'error'
  const [allDrafts, setAllDrafts] = useState([]);
  const [lessonProgress, setLessonProgressState] = useState({});
  const [topicsBy, setTopicsBy] = useState({}); // week → topics
  const [xp, setXp] = useState(loadXP);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [infoOpen, setInfoOpen] = useState(() => new Set());
  const [promptOpen, setPromptOpen] = useState(true);
  const [examCount, setExamCount] = useState(10);
  const [hist, setHist] = useState(false);
  const [view, setView] = useState('weeks');
  const [stats, setStats] = useState({ done: 0, correct: 0 });
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; });

  useEffect(() => {
    document.title = 'IELTS Task 2 Practice – EnglishWithDan';
    window.WritingRewriteReminder?.check?.();
    // Double-click lookup — off only while a Thi thử run is on screen
    bindDict('app', 'task2-practice', () => viewRef.current !== 'exam');
    window.__ewsExamActive = () => viewRef.current === 'exam';
    // Classmates' "viết cùng" invites pop up within seconds on this page
    const poll = isStudent() && window.CowriteInvites ? every(() => window.CowriteInvites.check(), INVITE_POLL_MS) : null;
    return () => {
      delete window.__ewsExamActive;
      poll?.stop();
      document.body.classList.remove('t2-on-weeks', 't2-no-session-stats', 't2-composing');
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const logged = isLoggedIn();
    Promise.all([
      apiFetch('/task2/weeks'),
      logged ? apiFetch('/task2/drafts').catch(() => ({ drafts: [] })) : { drafts: [] },
      apiFetch('/task2/sessions').catch(() => ({ sessions: [] })),
      logged ? apiFetch('/task2/lessons/progress').catch(() => ({ progress: [] })) : { progress: [] },
      loadVocabProgress(),
    ]).then(([w, d, s, p]) => {
      if (!alive) return;
      const prog = {};
      (p.progress || []).forEach((x) => { prog[x.topicId] = x; });
      setAllDrafts(d.drafts || []);
      setLessonProgressState(prog);
      setBase({ weeks: w.weeks || [], sessions: s.sessions || [] });
    }).catch(() => { if (alive) setBase('error'); });
    return () => { alive = false; };
  }, []);

  const weeks = base && base !== 'error' ? base.weeks : [];
  const sessions = useMemo(() => (base && base !== 'error' ? base.sessions : []), [base]);
  const fetchTopics = (w) => apiFetch(`/task2/topics/week/${w}`).then((d) => d.topics || []);
  const keepTopics = useCallback((w, list) => setTopicsBy((m) => ({ ...m, [w]: list })), []);
  const loadTopics = async (w) => { const list = await fetchTopics(w); keepTopics(w, list); return list; };

  // A topic link whose ?week= is missing or stale (an admin moved the topic):
  // find the week that owns it now
  const resolving = useRef(null); // topicId being looked up
  useEffect(() => {
    if (!base || base === 'error' || !topicId) return undefined;
    if (week && topicsBy[week] && topicsBy[week].some((t) => t._id === topicId)) return undefined;
    if (week && !topicsBy[week]) { fetchTopics(week).catch(() => []).then((list) => keepTopics(week, list)); return undefined; }
    if (resolving.current === topicId) return undefined;
    resolving.current = topicId;
    let alive = true;
    Promise.all(weeks.map((w) => apiFetch(`/task2/topics/week/${w.week}`).then((d) => ({ week: w.week, topics: d.topics || [] })).catch(() => null)))
      .then((all) => {
        if (!alive) return;
        const hit = all.find((x) => x && x.topics.some((t) => t._id === topicId));
        if (hit) {
          keepTopics(hit.week, hit.topics);
          navigate(hubUrl(hit.week, topicId, { ...(write ? { write: 1 } : {}), ...(focus ? { mode: focus } : {}) }), { replace: true, state: location.state });
        } else navigate(BASE, { replace: true });
        resolving.current = null;
      });
    return () => { alive = false; resolving.current = null; };
  }, [base, topicId, week, topicsBy]); // eslint-disable-line react-hooks/exhaustive-deps
  // ?week=N alone: that week's topics
  useEffect(() => {
    if (!base || base === 'error' || !week || topicId || topicsBy[week]) return;
    fetchTopics(week).catch(() => []).then((list) => keepTopics(week, list));
  }, [base, week, topicId]); // eslint-disable-line react-hooks/exhaustive-deps

  // First visit on the list: the onboarding tour
  const toured = useRef(false);
  useEffect(() => {
    if (!base || base === 'error' || toured.current || topicId || week) return;
    toured.current = true;
    window.EWSTour?.autoStart?.(TOUR_PAGE);
  }, [base, topicId, week]);

  const topics = week ? topicsBy[week] : null;
  const topic = topicId && topics ? topics.find((t) => t._id === topicId) : null;
  const screen = !base ? 'loading' : base === 'error' ? 'error' : topic ? 'topic' : topicId ? 'loading' : week ? (topics ? 'topics' : 'loading') : 'weeks';
  const shownView = screen === 'topic' ? view : screen === 'weeks' ? 'weeks' : 'topics';
  const inSession = shownView === 'practice' || shownView === 'done';

  // Body classes the old page's CSS keys on
  useEffect(() => {
    const b = document.body.classList;
    b.toggle('t2-on-weeks', shownView === 'weeks');
    b.toggle('t2-no-session-stats', !inSession);
    b.toggle('t2-composing', shownView === 'compose');
  }, [shownView, inSession]);

  const sessionNumber = useCallback((id) => { const i = sessions.findIndex((s) => s._id === id); return i >= 0 ? i + 1 : null; }, [sessions]);
  const sessionLabel = useCallback((id) => { const n = sessionNumber(id); return n ? `Buổi ${n}` : ''; }, [sessionNumber]);

  async function openTopic(w, id, autoResume) {
    try {
      if (!hasPremiumAccess()) { openUpgrade(); return; }
      let list = topicsBy[w];
      if (!list || !list.some((t) => t._id === id)) list = await loadTopics(w);
      if (!list.some((t) => t._id === id)) { siteToast('Không tìm thấy chủ đề này nữa', 'warn'); return; }
      prefetched.set(id, await fetchTopicData(id));
      navigate(hubUrl(w, id), { state: autoResume ? { autoResume: true } : null });
      window.scrollTo(0, 0);
    } catch { siteToast('Lỗi tải chủ đề', 'error'); }
  }
  async function selectWeek(w) {
    try { await loadTopics(w); navigate(hubUrl(w)); } catch { siteToast('Lỗi tải topics', 'error'); }
  }
  const page = {
    weeks, sessions, lessonProgress, allDrafts, xp, week, topics: topics || [],
    sessionNumber, sessionLabel, openTopic, selectWeek,
    goWeeks: () => navigate(BASE),
    openHistory: () => setHist(true),
    info: { has: (k) => infoOpen.has(k), toggle: (k) => setInfoOpen((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; }) },
    prefs, togglePref: (k) => setPrefs((p) => { const n = { ...p, [k]: !p[k] }; savePrefs(n); return n; }),
    promptOpen, setPromptOpen, examCount, setExamCount,
    addXP: (n, streak) => setXp(addXP(n, streak)),
    reportView: setView,
    reportStats: (st) => { if (st.done != null) setStats({ done: st.done, correct: st.correct }); },
    setLessonProgress: (id, p) => setLessonProgressState((m) => ({ ...m, [id]: p })),
    removeDraft: (id) => setAllDrafts((ds) => ds.filter((d) => String(d.topicId) !== String(id))),
    upsertDraft: (draft) => setAllDrafts((ds) => { const i = ds.findIndex((d) => d.topicId === draft.topicId); const n = ds.slice(); if (i >= 0) n[i] = draft; else n.push(draft); return n; }),
  };

  let content;
  if (screen === 'loading') content = <div style={{ textAlign: 'center', padding: 40 }}><div className="wp-spinner" /><p>Đang tải...</p></div>;
  else if (screen === 'error') content = <p style={{ textAlign: 'center', color: 'red', padding: 40 }}>Lỗi tải dữ liệu</p>;
  else if (screen === 'topic') {
    content = <TopicScreen key={topic._id} t={topic} page={page} write={write} focus={focus} autoResume={!!location.state?.autoResume} />;
  } else if (screen === 'topics') content = <Topics page={page} />;
  else content = <Weeks page={page} />;

  const pct = stats.done > 0 ? Math.round((stats.correct / stats.done) * 100) + '%' : '–';
  const maxWidth = shownView === 'compose' ? 1320 : shownView === 'weeks' ? 1160 : 900;
  return (
    <>
      {/* XP / streak — floats top-right (hidden on the weeks hero and in the writer) */}
      <div className="wp-mini-stats">
        <div className="wp-xp-badge"><i className="fas fa-star" /> <span id="header-xp">{xp.xp}</span> XP</div>
        <div className="wp-streak-badge">🔥 <span id="header-streak">{xp.streak}</span></div>
      </div>
      <div className="wp-stats-widget" id="t2-stats-widget" style={inSession ? undefined : { display: 'none' }}>
        <div className="wp-stats-widget-title"><i className="fas fa-chart-bar" /> Phiên học</div>
        <div className="wp-stats-row">
          <div className="wp-stat-box"><div className="wp-stat-num" id="widget-done">{stats.done}</div><div className="wp-stat-label">Bài làm</div></div>
          <div className="wp-stat-box"><div className="wp-stat-num" id="widget-xp">{xp.xp}</div><div className="wp-stat-label">XP</div></div>
          <div className="wp-stat-box"><div className="wp-stat-num" id="widget-correct">{pct}</div><div className="wp-stat-label">Đúng</div></div>
        </div>
      </div>
      <div className="wp-mobile-stats" id="wp-mobile-stats" style={inSession ? undefined : { display: 'none' }}>
        <div className="wp-mob-stat"><div className="wp-mob-stat-num" id="mob-stat-done">{stats.done}</div><div className="wp-mob-stat-lbl">Bài làm</div></div>
        <div className="wp-mob-stat"><div className="wp-mob-stat-num" id="mob-stat-xp">{xp.xp}</div><div className="wp-mob-stat-lbl">XP</div></div>
        <div className="wp-mob-stat"><div className="wp-mob-stat-num" id="mob-stat-correct">{pct}</div><div className="wp-mob-stat-lbl">Đúng</div></div>
      </div>
      <div id="app" style={{ maxWidth, margin: '0 auto', paddingBottom: 40 }}>{content}</div>
      {hist && <HistoryDialog onClose={() => setHist(false)} />}
    </>
  );
}

