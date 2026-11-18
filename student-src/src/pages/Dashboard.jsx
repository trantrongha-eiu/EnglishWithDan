import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { onStreakResult, onSaveState } from '../utils/practiceSync';
import { buildWeekDays } from '../utils/streak';
import { collectVocabGoals, readHomeworkCache, writeHomeworkCache } from '../utils/homework';
import { useToast } from '../contexts/ToastContext';
import BookMenu from './dashboard/BookMenu';
import DifficultWordsModal from './dashboard/DifficultWordsModal';
import GuideModal from './dashboard/GuideModal';
import { hasPremiumAccess } from '../utils/plan';
import { autoShowLearningPopup, isActivePractice } from '../utils/shell';

// Vocab notebook page shell: notebook sidebar + the routed view
//   /dashboard                         → Welcome (streak, weekly progress)
//   /dashboard/book/:bookId            → BookView (word table)
//   /dashboard/book/:bookId/practice   → Practice (Quiz / Flashcard / Điền từ / Nghe / Dịch / Mixed)
// Shared state goes down via the Outlet context.

function BookItem({ book, isActive, onClick, onMenu, drag }) {
  return (
    <div
      className={`book-item${isActive ? ' active' : ''}${drag.dragging ? ' dragging' : ''}${drag.over ? ' drag-over' : ''}`}
      onClick={() => onClick(book)} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(book); }}
      draggable onDragStart={drag.onDragStart} onDragOver={drag.onDragOver} onDragLeave={drag.onDragLeave}
      onDrop={drag.onDrop} onDragEnd={drag.onDragEnd}
    >
      <span className="book-drag-handle" title="Kéo để sắp xếp">⠿</span>
      <span className="book-emoji">{book.emoji || '📘'}</span>
      <span className="book-name">{book.name}</span>
      <span className="book-count">{book.totalWords ?? 0}</span>
      <button className="book-menu-btn" title="Tùy chọn" aria-label={`Tùy chọn ${book.name}`}
        onClick={(e) => { e.stopPropagation(); onMenu(book); }}>⋯</button>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const { bookId: activeBookId } = useParams();
  const { pathname } = useLocation();
  // on a study screen the button would only sit on top of the content
  const studyScreen = /\/(lesson|unit)\/|\/practice$/.test(pathname);
  const [books, setBooks] = useState(null);
  const [booksError, setBooksError] = useState(null);
  const [stats, setStats] = useState(null);
  const [weekDays, setWeekDays] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menu, setMenu] = useState(null); // { bookId, view }
  const [dwOpen, setDwOpen] = useState(false);   // 🔥 từ hay sai popup
  const [dwCount, setDwCount] = useState(0);     // sidebar badge
  const [guideOpen, setGuideOpen] = useState(false);
  // Vocab Topics lessons + Paraphrase units (null = loading, [] on error)
  const [lessons, setLessons] = useState(null);
  const [units, setUnits] = useState(null);
  const [drag, setDrag] = useState({ from: null, over: null });
  const saveOrderTimer = useRef(null);

  // The open notebook (with its words) — cached here so BookView ⇄ Practice
  // don't refetch, and practice results written onto the word objects show
  // up in the table straight away.
  const [book, setBook] = useState(null);
  const [bookError, setBookError] = useState(null);
  const loadingId = useRef(null);

  const loadBooks = useCallback(() => apiFetch('/vocabbook')
    .then((res) => { setBooksError(null); setBooks(res.books || []); })
    .catch((err) => setBooksError(err.coldStart ? 'Server đang khởi động, thử lại sau vài giây.' : 'Không tải được danh sách sổ.')), []);

  const loadWeek = useCallback(() => apiFetch('/user/activity-heatmap?days=8')
    .then((res) => { if (res.activity) setWeekDays(buildWeekDays(res.activity)); })
    .catch(() => { /* non-critical */ }), []);

  const loadBook = useCallback(async (id, { quiet = false } = {}) => {
    loadingId.current = id;
    if (!quiet) setBookError(null);
    try {
      const res = await apiFetch(`/vocabbook/${id}`);
      if (loadingId.current !== id) return null; // switched to another book meanwhile
      setBook(res.book);
      return res.book;
    } catch (err) {
      if (loadingId.current !== id) return null;
      if (!quiet) setBookError(err);
      return null;
    }
  }, []);

  // 📚 Homework (GET /assignments/mine): the Welcome card + the "học N từ"
  // bars in BookView / Practice. Painted from the localStorage copy first
  // (stale: true) while the live answer is on its way.
  const [homework, setHomework] = useState(() => {
    const c = readHomeworkCache();
    return c ? { data: c, stale: true } : null;
  });
  const hwLast = useRef(0);
  const loadHomework = useCallback(() => {
    hwLast.current = Date.now();
    return apiFetch('/assignments/mine')
      .then((d) => { writeHomeworkCache(d); setHomework({ data: d, stale: false }); })
      .catch(() => setHomework(h => (h ? { ...h, stale: false } : h)));
  }, []);
  const vocabGoals = useMemo(() => collectVocabGoals(homework?.data), [homework]);
  const goalsPending = vocabGoals.some(g => !g.completed);

  // While practising: practice answers reach the server → refresh the
  // homework at most every 10s (right away when asked with now=true).
  const hwTimer = useRef(null);
  const refreshHomeworkSoon = useCallback((now = false) => {
    const wait = now ? 0 : Math.max(0, hwLast.current + 10000 - Date.now());
    if (hwTimer.current) { if (!now) return; clearTimeout(hwTimer.current); }
    hwTimer.current = setTimeout(() => { hwTimer.current = null; loadHomework(); }, wait);
  }, [loadHomework]);
  useEffect(() => {
    if (!goalsPending) return undefined;
    return onSaveState((st) => { if (st === 'saved') refreshHomeworkSoon(false); });
  }, [goalsPending, refreshHomeworkSoon]);
  useEffect(() => () => clearTimeout(hwTimer.current), []);

  // "Bắt đầu" opens exercises in a new tab — re-fetch when the student comes back (≤ 1/15s)
  const hasClasses = !!homework?.data?.hasClasses;
  useEffect(() => {
    if (!hasClasses) return undefined;
    const onVis = () => {
      if (document.visibilityState === 'visible' && Date.now() - hwLast.current >= 15000) loadHomework();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [hasClasses, loadHomework]);

  useEffect(() => {
    loadBooks();
    loadWeek();
    loadHomework();
    apiFetch('/vocabulary-lessons').then(d => setLessons(d.lessons || [])).catch(() => setLessons([]));
    apiFetch('/vocab/units').then(d => setUnits(Array.isArray(d) ? d : [])).catch(() => setUnits([]));
    // 🔥 badge (premium-only endpoint)
    if (hasPremiumAccess()) apiFetch('/difficult-words').then(d => setDwCount((d.words || []).length)).catch(() => {});
    apiFetch('/user/stats').then(r => { if (r.success) setStats(r.stats); }).catch(() => {});
  }, [loadBooks, loadWeek, loadHomework]);

  // Entry points nav.js and the learning popups call on the vocab home
  useEffect(() => {
    const hooks = {
      openReviewDueModal: () => navigate('/dashboard/practice?src=due'),
      practiceWeakVocab: () => navigate('/dashboard/practice?src=weak'),
      openParaphraseReviewModal: () => navigate('/dashboard/practice?src=paraphrase'),
      openSheet: () => setSidebarOpen(true),
      _isActivePractice: isActivePractice,
    };
    Object.assign(window, hooks);
    return () => { Object.keys(hooks).forEach((k) => { delete window[k]; }); };
  }, [navigate]);
  useEffect(() => { autoShowLearningPopup(); }, []);

  // Streak reported mid-practice → update the welcome card + week dots
  useEffect(() => onStreakResult((d) => {
    setStats(s => ({ ...(s || {}), streak: d.streak, streakHammers: d.streakHammers ?? s?.streakHammers }));
    loadWeek();
  }), [loadWeek]);

  function openBook(b) {
    setSidebarOpen(false);
    navigate(`/dashboard/book/${b._id}`);
  }

  const openBookMenu = useCallback((bookId, view = 'menu') => setMenu({ bookId, view }), []);

  // After move / merge / delete: refresh the list and whatever is open.
  function onBooksChanged(ev) {
    loadBooks();
    const removed = ev.removedIds || [];
    if (activeBookId && removed.includes(activeBookId)) {
      navigate(ev.type === 'merge' ? `/dashboard/book/${ev.destId}` : '/dashboard', { replace: true });
    } else if (activeBookId && (activeBookId === ev.srcId || activeBookId === ev.destId)) {
      loadBook(activeBookId, { quiet: true });
    }
  }

  // Drag & drop reorder (PUT /vocabbook/reorder, saved 600ms after the last drop)
  function dropOn(targetIdx) {
    const from = drag.from;
    setDrag({ from: null, over: null });
    if (from === null || from === targetIdx || !books) return;
    const next = [...books];
    const [moved] = next.splice(from, 1);
    next.splice(targetIdx, 0, moved);
    setBooks(next);
    clearTimeout(saveOrderTimer.current);
    saveOrderTimer.current = setTimeout(() => {
      apiFetch('/vocabbook/reorder', { method: 'PUT', body: JSON.stringify({ order: next.map((b, i) => ({ _id: b._id, sortOrder: i })) }) })
        .catch((err) => {
          toast(err.body?.requiresPremium ? err.message : 'Không lưu được thứ tự sổ từ vựng, đang tải lại danh sách...', 'error');
          loadBooks();
        });
    }, 600);
  }
  const dragProps = (i) => ({
    dragging: drag.from === i,
    over: drag.over === i && drag.from !== i,
    onDragStart: (e) => { e.dataTransfer.effectAllowed = 'move'; setDrag({ from: i, over: null }); },
    onDragOver: (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (drag.over !== i) setDrag(d => ({ ...d, over: i })); },
    onDragLeave: () => setDrag(d => (d.over === i ? { ...d, over: null } : d)),
    onDrop: (e) => { e.preventDefault(); dropOn(i); },
    onDragEnd: () => setDrag({ from: null, over: null }),
  });

  const menuBook = menu && (book?._id === menu.bookId ? { ...books?.find(b => b._id === menu.bookId), ...book } : books?.find(b => b._id === menu.bookId));

  const ctx = {
    books, loadBooks, setBooks, stats, setStats, weekDays, book, setBook, loadBook, bookError, openBookMenu,
    homework, loadHomework, vocabGoals, refreshHomeworkSoon, openGuide: () => setGuideOpen(true),
    lessons, units,
  };

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="mobile-nav-overlay" style={{ background: 'rgba(0,0,0,.35)' }} onClick={() => setSidebarOpen(false)} />}
      <aside className={`vocab-sidebar${sidebarOpen ? ' mobile-open' : ''}`} id="vocabSidebar">
        <div className="sidebar-head">
          <span>
            My Notebooks{' '}
            {books && <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.7, letterSpacing: 0, textTransform: 'none' }}>({books.length})</span>}
          </span>
        </div>

        <div id="book-list-sidebar">
          {books === null && !booksError && (
            <div style={{ padding: '12px 16px', color: 'var(--text3)', fontSize: 13 }}>Đang tải...</div>
          )}
          {booksError && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
              <div style={{ marginBottom: 10 }}>{booksError}</div>
              <button className="btn btn-primary btn-sm" onClick={() => { setBooksError(null); loadBooks(); }}>Thử lại</button>
            </div>
          )}
          {books?.length === 0 && (
            <div style={{ padding: '12px 16px', color: 'var(--text3)', fontSize: 13 }}>Chưa có sổ nào.</div>
          )}
          {books?.map((b, i) => (
            <BookItem key={b._id} book={b} isActive={b._id === activeBookId} onClick={openBook}
              onMenu={(x) => openBookMenu(x._id)} drag={dragProps(i)} />
          ))}
        </div>

        <div className="sidebar-divider" />

        <div className="practice-section">
          <div className="practice-tabs">
            <NavLink className="practice-tab" to="/dashboard/paraphrase" onClick={() => setSidebarOpen(false)}>
              <i className="fas fa-graduation-cap" /> Paraphrase
            </NavLink>
            <NavLink className="practice-tab" to="/dashboard/topics" onClick={() => setSidebarOpen(false)}>
              <i className="fas fa-layer-group" /> Vocab Topics
            </NavLink>
          </div>
          <button className="btn-difficult-words" onClick={() => { setSidebarOpen(false); setDwOpen(true); }}>
            <i className="fas fa-fire" /> Ôn lại từ hay sai
            {dwCount > 0 && <span className="difficult-count-badge" style={{ display: 'flex' }}>{dwCount}</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div id="view-mybook" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Outlet context={ctx} />
        </div>

        {dwOpen && <DifficultWordsModal onClose={() => setDwOpen(false)} onCount={setDwCount} />}
        {guideOpen && <GuideModal onClose={() => setGuideOpen(false)} />}

        {menuBook && (
          <BookMenu
            key={menu.bookId + menu.view}
            book={menuBook}
            books={books}
            initialView={menu.view}
            onClose={() => setMenu(null)}
            onRename={() => navigate(`/dashboard/book/${menuBook._id}`, { state: { rename: Date.now() } })}
            onChanged={onBooksChanged}
          />
        )}

        {!studyScreen && (
          <button className="mobile-sidebar-btn dash-mobile-books-btn" onClick={() => setSidebarOpen(o => !o)} aria-label="Chọn sổ">
            <i className="fas fa-book" /> Sổ từ
          </button>
        )}
      </main>
    </div>
  );
}
