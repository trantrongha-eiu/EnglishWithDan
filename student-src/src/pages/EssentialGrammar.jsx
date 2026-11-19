import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';
import { matches } from '../utils/searchMatch';
import { bindDict, siteToast } from '../utils/shell';
import Lesson, { COMPLETE_THRESHOLD } from './grammar/Lesson';

// 📘 Essential Grammar — /app/essential-grammar?lesson=<lessonKey>. The list
// comes without answers; each lesson's blocks load the first time it is opened.
// Scores live on this device and merge with the best scores on the server.

const LAST_LESSON_KEY = 'eg_last_lesson';
const COLLAPSED_KEY = 'eg_collapsed_categories';
const TOUR_PAGE = 'essential-grammar.html';

const keyOf = (l) => `${l.category}||${l.lessonKey}`;
function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota: memory is enough */ }
}
function readText(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function Loading({ icon, children }) {
  return <div className="eg-loading"><div className="eg-loading-icon">{icon}</div>{children}</div>;
}

function Sidebar({ id, style, lessons, categories, current, scores, search, onSearch, collapsed, onToggle, onSelect, done, percent }) {
  const term = search.trim().toLowerCase();
  const groups = categories.map((cat) => ({
    cat,
    lessons: lessons
      .filter((l) => l.category === cat && (!term || matches([l.title, cat], term)))
      .sort((a, b) => a.orderIndex - b.orderIndex),
  })).filter((g) => g.lessons.length);
  return (
    <aside className="eg-sidebar" id={id} style={style}>
      {lessons.length > 0 && (
        <>
          <div className="eg-sidebar-top">
            <div className="eg-search-box">
              <i className="fas fa-search eg-search-icon" />
              <input className="eg-search-input" placeholder="Tìm bài học..." value={search} onChange={(e) => onSearch(e.target.value)} />
            </div>
            <div className="eg-progress-badge">
              <div className="eg-progress-track"><div className="eg-progress-fill" style={{ width: `${percent}%` }} /></div>
              <span className="eg-progress-text">{done}/{lessons.length}</span>
            </div>
          </div>
          <div className="eg-cat-list">
            {groups.map((g) => (
              <div className={`eg-cat-group${collapsed.includes(g.cat) && !term ? ' collapsed' : ''}`} data-cat={g.cat} key={g.cat}>
                <button className="eg-cat-header" onClick={() => onToggle(g.cat)}>
                  <span>{g.cat}</span>
                  <span className="eg-cat-count">{g.lessons.length}</span>
                  <i className="fas fa-chevron-down eg-cat-chevron" />
                </button>
                <div className="eg-lesson-list">
                  {g.lessons.map((l) => (
                    <button className={`eg-lesson-item${keyOf(l) === current ? ' active' : ''}`} key={l._id} onClick={() => onSelect(l)}>
                      <span className="eg-lesson-icon">{l.icon || '📘'}</span>
                      <span className="eg-lesson-title">{l.title}</span>
                      {scores[keyOf(l)]?.completed && <i className="fas fa-check-circle wp-item-done-icon" title={`Đã hoàn thành (≥${COMPLETE_THRESHOLD}%)`} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!groups.length && <div className="eg-no-results">Không tìm thấy bài học phù hợp.</div>}
          </div>
        </>
      )}
    </aside>
  );
}

export default function EssentialGrammar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const urlKey = params.get('lesson');
  const main = useRef(null);

  // Per account: on a shared computer the next student must not see these
  const uid = user?._id || user?.id || user?.username || '';
  const scoreKey = uid ? `eg_lesson_scores:${uid}` : 'eg_lesson_scores';
  const [scores, setScores] = useState(() => readJson(scoreKey, {}));
  const [collapsed, setCollapsed] = useState(() => readJson(COLLAPSED_KEY, []));
  const [savedKey] = useState(() => readText(LAST_LESSON_KEY));
  const [openedOnLesson] = useState(() => !!urlKey);

  const [list, setList] = useState({ status: 'loading', lessons: [] });
  const [blocks, setBlocks] = useState({}); // lesson id → blocks | 'failed'
  const [homework, setHomework] = useState({}); // lesson id → [{ title, deadline, completed }]
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [run, setRun] = useState({ key: null, n: 0 }); // "Làm lại bài" of the open lesson

  const lessons = list.lessons;
  const categories = useMemo(() => [...new Set(lessons.map((l) => l.category))], [lessons]);
  const ready = list.status === 'ready' && lessons.length > 0;
  const urlLesson = urlKey ? lessons.find((l) => l.lessonKey === urlKey) : null;
  const current = urlLesson || lessons.find((l) => keyOf(l) === savedKey) || lessons[0] || null;
  const currentKey = current ? keyOf(current) : null;
  const doneCount = lessons.filter((l) => scores[keyOf(l)]?.completed).length;
  const percent = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;

  const loadHomework = useCallback(() => apiFetch('/assignments/mine').then((data) => {
    if (!data.success) return;
    const map = {};
    (data.assignments || []).forEach((a) => (a.resources || []).forEach((r) => {
      if (r.resourceType !== 'grammar' || !r.resourceId) return;
      (map[String(r.resourceId)] ||= []).push({ title: a.title || '', deadline: a.deadline || null, completed: !!r.completed });
    }));
    setHomework(map);
  }).catch(() => { /* the banner is informational only */ }), []);

  useEffect(() => {
    let alive = true;
    apiFetch('/essential-grammar/lessons').then((data) => {
      if (!data.success) throw new Error('load failed');
      if (alive) setList({ status: 'ready', lessons: data.lessons || [] });
    }).catch(() => {
      if (!alive) return;
      setList({ status: 'error', lessons: [] });
      siteToast('Không tải được bài học', 'error');
    });
    loadHomework();
    return () => { alive = false; };
  }, [loadHomework]);

  useEffect(() => { bindDict('eg-main-content', 'essential-grammar'); }, []);

  // Best scores from the server, so ticks follow the student between devices
  useEffect(() => {
    if (!ready) return undefined;
    let alive = true;
    apiFetch('/essential-grammar/my-progress').then((data) => {
      if (!alive || !data.success) return;
      setScores((local) => {
        const keyById = new Map(lessons.map((l) => [String(l._id), keyOf(l)]));
        const next = { ...local };
        let changed = false;
        (data.progress || []).forEach((p) => {
          const key = keyById.get(String(p.lessonId));
          if (!key) return;
          const prev = next[key];
          const best = Number(p.bestScore) || 0;
          if (prev && best <= (prev.bestScore || 0)) return;
          const completed = Math.max(best, prev?.bestScore || 0) >= COMPLETE_THRESHOLD;
          next[key] = {
            bestScore: Math.max(best, prev?.bestScore || 0),
            latestScore: prev?.latestScore ?? (Number(p.score) || 0),
            completed,
            completedAt: prev?.completedAt || (completed ? p.lastAttempt || null : null),
          };
          changed = true;
        });
        if (!changed) return local;
        writeJson(scoreKey, next);
        return next;
      });
    }).catch(() => { /* offline: the local copy still works */ });
    return () => { alive = false; };
  }, [ready, lessons, scoreKey]);

  // The address always names the open lesson. One that no longer exists has
  // to say so: a student must not finish another lesson thinking it's the
  // assigned one.
  useEffect(() => {
    if (!ready || urlLesson) return;
    if (urlKey) siteToast('Bài được giao không còn tồn tại — đang mở bài học khác.', 'error', 6000);
    navigate(`/essential-grammar?lesson=${encodeURIComponent(current.lessonKey)}`, { replace: true });
  }, [ready, urlLesson, urlKey, current, navigate]);

  useEffect(() => {
    if (currentKey) try { localStorage.setItem(LAST_LESSON_KEY, currentKey); } catch { /* not essential */ }
  }, [currentKey]);

  // First visit only, and not when a homework link opened one lesson
  useEffect(() => {
    if (ready && !openedOnLesson) window.EWSTour?.autoStart?.(TOUR_PAGE);
  }, [ready, openedOnLesson]);

  const currentId = current?._id;
  const needsBlocks = !!currentId && blocks[currentId] === undefined;
  useEffect(() => {
    if (!needsBlocks) return undefined;
    let alive = true;
    apiFetch(`/essential-grammar/lessons/${currentId}`).then((data) => {
      if (!data.success || !data.lesson) throw new Error('load failed');
      if (alive) setBlocks((b) => ({ ...b, [currentId]: data.lesson.blocks || [] }));
    }).catch(() => {
      if (!alive) return;
      setBlocks((b) => ({ ...b, [currentId]: 'failed' }));
      siteToast('Không tải được bài học', 'error');
    });
    return () => { alive = false; };
  }, [needsBlocks, currentId]);

  function select(lesson) {
    setSheetOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (keyOf(lesson) === currentKey) return; // keeps the answers already given
    // A lesson that failed gets another try when it is chosen again
    setBlocks((b) => (b[lesson._id] === 'failed' ? { ...b, [lesson._id]: undefined } : b));
    setParams({ lesson: lesson.lessonKey });
  }
  function toggleCategory(cat) {
    const next = collapsed.includes(cat) ? collapsed.filter((c) => c !== cat) : [...collapsed, cat];
    setCollapsed(next);
    writeJson(COLLAPSED_KEY, next);
  }
  function saveScore(value) {
    const prev = scores[currentKey] || { bestScore: 0, latestScore: 0, completed: false, completedAt: null };
    const bestScore = Math.max(prev.bestScore, value);
    const completed = bestScore >= COMPLETE_THRESHOLD;
    const next = {
      ...scores,
      [currentKey]: { bestScore, latestScore: value, completed, completedAt: completed && !prev.completed ? new Date().toISOString() : prev.completedAt },
    };
    setScores(next);
    writeJson(scoreKey, next);
  }

  const index = current ? lessons.indexOf(current) : -1;
  const attempt = run.key === currentKey ? run.n : 0;
  const lessonBlocks = currentId ? blocks[currentId] : undefined;
  const sidebar = { lessons, categories, current: currentKey, scores, search, onSearch: setSearch, collapsed, onToggle: toggleCategory, onSelect: select, done: doneCount, percent };

  let content = <Loading icon={<i className="fas fa-spinner fa-spin" />}>Đang tải bài học...</Loading>;
  if (list.status === 'error') content = <Loading icon="⚠️">Không tải được nội dung. Vui lòng thử lại sau.</Loading>;
  if (list.status === 'ready' && !lessons.length) content = <Loading icon="📭">Chưa có bài học nào.</Loading>;
  if (lessonBlocks === 'failed') content = <Loading icon="⚠️">Không tải được bài học này. Vui lòng thử lại.</Loading>;
  if (Array.isArray(lessonBlocks)) {
    content = (
      <Lesson key={`${currentKey}:${attempt}`} lesson={current} blocks={lessonBlocks}
        prev={lessons[index - 1] || null} next={lessons[index + 1] || null}
        score={scores[currentKey] || null} doneCount={doneCount} lessonCount={lessons.length} percent={percent}
        homework={homework[String(currentId)] || []} retried={attempt > 0}
        onSelect={select} onScore={saveScore} onHomeworkChange={loadHomework}
        onRetry={() => setRun({ key: currentKey, n: attempt + 1 })} />
    );
  }

  return (
    <>
      <div className="wp-mini-stats">
        <div className="wp-xp-badge" id="eg-header-progress"><i className="fas fa-graduation-cap" /> <span id="header-eg-progress">{doneCount}/{lessons.length}</span></div>
      </div>

      <div className="eg-layout">
        <Sidebar id="eg-sidebar" {...sidebar} />
        <div className="eg-main"><div id="eg-main-content" ref={main}>{content}</div></div>
      </div>

      <button className={`wp-mob-fab${sheetOpen ? ' open' : ''}`} id="eg-mob-fab" aria-label="Danh sách bài học" onClick={() => setSheetOpen(true)}><i className="fas fa-list" /></button>
      <div className={`wp-mob-backdrop${sheetOpen ? ' visible' : ''}`} id="eg-mob-backdrop" onClick={() => setSheetOpen(false)} />
      <div className={`wp-mob-sheet${sheetOpen ? ' open' : ''}`} id="eg-mob-sheet">
        <div className="wp-sheet-handle"><span className="wp-sheet-handle-bar" /></div>
        <div className="wp-sheet-title"><i className="fas fa-book" /> Danh sách bài học</div>
        <div className="wp-sheet-body">
          <Sidebar id="eg-sidebar-mobile" style={{ width: '100%', position: 'static', height: 'auto', border: 'none' }} {...sidebar} />
        </div>
      </div>
    </>
  );
}
