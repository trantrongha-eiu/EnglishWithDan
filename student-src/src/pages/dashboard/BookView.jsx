import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { bindDict, openUpgrade, showBadges, spawnConfetti } from '../../utils/shell';
import { useStreakFace } from '../../utils/streak';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmDialog } from '../../components/Modal';
import WordModal from './WordModal';
import BulkImportModal from './BulkImportModal';
import VocabGoalCards from './VocabGoalCards';
import { goalsForBook } from '../../utils/vocabGoal';
import {
  STATUSES, VOCAB_BOOK_MAX_WORDS, countByStatus, sortWords, filterWords, speakWord, prefetchAudio,
} from '../../utils/vocab';

function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* unsupported */ }
    ta.remove();
    if (ok) resolve(); else reject(new Error('copy blocked'));
  });
}

// Counts up to the new value; after the first paint a change also "pops"
function CountUp({ value }) {
  const ref = useRef(null);
  const shown = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const first = shown.current === null;
    const from = shown.current ?? 0;
    shown.current = value;
    if (!el || from === value) { if (el) el.textContent = value; return undefined; }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { el.textContent = value; return undefined; }
    const ms = first ? 550 : 380;
    const start = performance.now();
    let raf = requestAnimationFrame(function step(now) {
      const t = Math.min((now - start) / ms, 1);
      el.textContent = Math.round(from + (value - from) * (1 - (1 - t) ** 3));
      if (t < 1) raf = requestAnimationFrame(step);
    });
    if (!first) {
      el.classList.remove('stat-pop');
      void el.offsetWidth; // restart the animation
      el.classList.add('stat-pop');
    }
    return () => { cancelAnimationFrame(raf); el.textContent = value; };
  }, [value]);
  return <span ref={ref} onAnimationEnd={(e) => e.currentTarget.classList.remove('stat-pop')}>0</span>;
}

function WordRow({ w, index, selected, flash, onSelect, onStatus, onEdit, onDelete }) {
  const wc = w.wrongCount || 0;
  return (
    <tr className={`word-row-anim${selected ? ' selected' : ''}${flash ? ' word-mastered-flash' : ''}`}
      style={{ animationDelay: `${Math.min(index * 22, 380)}ms` }}>
      <td className="cb-wrap">
        <input type="checkbox" checked={selected} onChange={(e) => onSelect(w._id, e.target.checked)} aria-label={`Chọn ${w.word}`} />
      </td>
      <td>
        <select className={`status-select ${w.status}`} value={w.status} onChange={(e) => onStatus(w, e.target.value)}>
          {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <span className="word-chip-main">{w.word}</span>
          {wc >= 3 && <span className="diff-badge diff-hard" title={`${wc}x wrong`}>🔥 {wc}</span>}
          {wc >= 1 && wc < 3 && <span className="diff-badge diff-medium" title={`${wc}x wrong`}>⚡ {wc}</span>}
          <button className="btn-audio" onClick={() => speakWord(w.word)} title="Phát âm">🔊</button>
        </div>
        {w.phonetic && (
          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'JetBrains Mono',monospace" }}>{w.phonetic}</div>
        )}
      </td>
      <td style={{ color: 'var(--text2)' }}>{w.meaning || '–'}</td>
      <td style={{ maxWidth: 240 }}>
        {w.example && <div style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text2)' }}>{w.example}</div>}
        {w.collocations?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
            {w.collocations.map((c, i) => <span key={i} className="colloc-chip">{c}</span>)}
          </div>
        )}
      </td>
      <td style={{ color: 'var(--text3)', fontSize: 12 }}>{w.note || ''}</td>
      <td>
        <div className="word-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(w)} title="Sửa từ">✏️</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onDelete(w)} title="Xoá từ">🗑</button>
        </div>
      </td>
    </tr>
  );
}

// Keyed by bookId, so switching notebooks starts with a fresh search,
// filter and selection.
function StreakBanner({ stats }) {
  const { state, mascot, fire, num } = useStreakFace(stats);
  return (
    <div className="mascot-banner">
      <div className="mascot-panda" ref={mascot}>🐼</div>
      <div className="mascot-speech">
        <div className="mascot-streak-row">
          <span className="mascot-fire" ref={fire}><i className="fas fa-fire" /></span>
          <span className="mascot-streak-num" ref={num}>{stats?.streak ?? 0}</span>
          <span className="mascot-streak-label">day streak</span>
        </div>
        <div className="mascot-msg">{stats ? state.msg : "Let's study! I believe in you! 💪"}</div>
      </div>
    </div>
  );
}

// "Mách nhỏ": shown on every notebook until the student closes it
const ADD_TIP_KEY = 'dash_book_add_tip_dismissed';
function AddTip() {
  const [open, setOpen] = useState(() => { try { return localStorage.getItem(ADD_TIP_KEY) !== '1'; } catch { return true; } });
  if (!open) return null;
  return (
    <div className="book-add-tip">
      <span className="book-add-tip-emoji">💡</span>
      <div className="book-add-tip-body">
        <strong>Mách nhỏ:</strong> Có nhiều cách thêm từ vào sổ này —
        <ul>
          <li>Khi đang <strong>làm bài</strong> (Reading, Listening, luyện tập…): <strong>double-click</strong> vào một từ hoặc <strong>bôi đen</strong> một cụm để tra nghĩa rồi lưu ngay.</li>
          <li>Bấm <strong>+ Add word</strong> ở đây để nhập tay.</li>
          <li>Ở các <strong>danh sách từ vựng có sẵn</strong> (bài học từ vựng), bấm <strong>“Lưu tất cả”</strong> để lưu cả danh sách vào sổ.</li>
        </ul>
      </div>
      <button type="button" className="book-add-tip-close" aria-label="Đóng mách nhỏ" onClick={() => {
        setOpen(false);
        try { localStorage.setItem(ADD_TIP_KEY, '1'); } catch { /* private mode */ }
      }}>×</button>
    </div>
  );
}

const CLASSIFY_KEY = 'dash_classify_float_seen';
function readClassifySeen() {
  try { return JSON.parse(localStorage.getItem(CLASSIFY_KEY) || '{}') || {}; } catch { return {}; }
}
function localDay() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function BookViewRoute() {
  const { bookId } = useParams();
  return <BookView key={bookId} bookId={bookId} />;
}

function BookView({ bookId }) {
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const { stats, loadStats, book: cached, setBook, loadBook, bookError, loadBooks, books, setBooks, openBookMenu, vocabGoals, openGuide } = useOutletContext();
  const book = cached?._id === bookId ? cached : null;

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [nameDraft, setNameDraft] = useState(null); // null = not editing
  const [bulkOpen, setBulkOpen] = useState(false);
  const nameRef = useRef(null);
  const renameAsk = location.state?.rename;
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = add, word = edit
  const [confirm, setConfirm] = useState(null);
  const [flashId, setFlashId] = useState(null); // row just marked Mastered
  const [completePulse, setCompletePulse] = useState(false);
  const checkAllRef = useRef(null);
  const [, setTick] = useState(0); // re-render after optimistic edits on word objects
  const rerender = () => setTick(t => t + 1);

  // Load — or quietly refresh the cached copy, which practice may have
  // updated in place.
  const hadCache = useRef(cached?._id === bookId);
  useEffect(() => {
    loadBook(bookId, { quiet: hadCache.current });
    loadStats();
  }, [bookId, loadBook, loadStats]);

  const bookLoaded = !!book;
  // "Đổi tên sổ" from the ⋯ menu → focus the name field once it is there
  useEffect(() => {
    if (renameAsk && bookLoaded && nameRef.current && !nameRef.current.readOnly) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, [renameAsk, bookLoaded]);

  useEffect(() => {
    if (bookLoaded && book.words?.length) prefetchAudio(book.words.slice(0, 30).map(w => w.word));
  }, [bookLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const words = book?.words || [];
  const counts = countByStatus(words);
  const visible = sortWords(filterWords(words, query, statusFilter));
  const hardCount = words.filter(w => (w.wrongCount || 0) >= 3).length;
  const pct = words.length ? Math.round((counts['da-thuoc'] / words.length) * 100) : 0;
  const isFiltered = !!(query.trim() || statusFilter);

  const refresh = () => { loadBook(bookId, { quiet: true }); loadBooks(); };

  useEffect(() => { if (bookLoaded) bindDict('words-tbody', 'vocab-list'); }, [bookLoaded, bookId]);

  // "Select all" shows a dash while only some of the visible words are ticked
  const someVisibleSelected = visible.some(w => selected.has(w._id));
  const everyVisibleSelected = visible.length > 0 && visible.every(w => selected.has(w._id));
  useEffect(() => {
    if (checkAllRef.current) checkAllRef.current.indeterminate = someVisibleSelected && !everyVisibleSelected;
  }, [someVisibleSelected, everyVisibleSelected]);

  // Every word mastered → celebrate (after the server confirmed the change)
  const celebrateIfDone = () => {
    if (!words.length || words.some(w => w.status !== 'da-thuoc')) return;
    setCompletePulse(true);
    setTimeout(() => setCompletePulse(false), 2800);
    spawnConfetti(90);
    toast(`🎉 Excellent! You've mastered all ${words.length} words!`, 'success');
  };

  // "Bạn đã thuộc kĩ chưa?" — once per notebook per day, shortly after opening
  const [classify, setClassify] = useState(null); // book id it is showing for
  const hasWords = words.length > 0;
  useEffect(() => {
    if (!bookLoaded || !hasWords) return undefined;
    const seen = readClassifySeen();
    const today = localDay();
    if (seen[bookId] === today) return undefined;
    const t = setTimeout(() => {
      try { localStorage.setItem(CLASSIFY_KEY, JSON.stringify({ ...seen, [bookId]: today })); } catch { /* private mode */ }
      setClassify(bookId);
    }, 900);
    return () => clearTimeout(t);
  }, [bookLoaded, hasWords, bookId]);
  const classifyNow = () => {
    setClassify(null);
    document.querySelector('.words-table-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const boxes = document.querySelectorAll('#words-tbody .status-select');
    boxes.forEach(s => s.classList.add('status-pulse'));
    setTimeout(() => boxes.forEach(s => s.classList.remove('status-pulse')), 3200);
  };

  /* ── Errors / loading ── */
  if (!book) {
    if (bookError?.body?.requiresPremium) {
      return (
        <div className="book-view-error">
          <div style={{ fontSize: 40 }}>⭐</div>
          <h3>Sổ từ vựng cần gói Premium</h3>
          <p>{bookError.message}</p>
          <button className="btn btn-primary" onClick={() => openUpgrade()}>Xem gói Premium</button>
        </div>
      );
    }
    if (bookError) {
      return (
        <div className="book-view-error">
          <div style={{ fontSize: 40 }}>⚠️</div>
          <p>{bookError.status === 404 ? 'Không tìm thấy sổ này.' : `Lỗi tải sổ từ vựng: ${bookError.message}`}</p>
          <button className="btn btn-primary" onClick={() => loadBook(bookId)}>Thử lại</button>
        </div>
      );
    }
    return (
      <div className="words-table-wrap" style={{ padding: 24 }}>
        <table className="words-table"><tbody>
          {Array.from({ length: 6 }, (_, i) => (
            <tr key={i}>
              <td /><td><div className="skeleton-cell" style={{ width: 80 }} /></td>
              <td><div className="skeleton-cell" style={{ width: 100 }} /></td>
              <td><div className="skeleton-cell" style={{ width: 140 }} /></td>
              <td><div className="skeleton-cell" style={{ width: 180 }} /></td>
            </tr>
          ))}
        </tbody></table>
      </div>
    );
  }

  /* ── Actions ── */
  async function changeStatus(w, status) {
    const prev = w.status;
    w.status = status;
    rerender();
    if (status === 'da-thuoc') {
      setFlashId(w._id);
      setTimeout(() => setFlashId(id => (id === w._id ? null : id)), 850);
    }
    try {
      showBadges(await apiFetch(`/vocabbook/${bookId}/words/${w._id}`, { method: 'PATCH', body: JSON.stringify({ status }) }));
      if (status === 'da-thuoc') celebrateIfDone();
    } catch {
      w.status = prev;
      rerender();
      toast('Lỗi cập nhật', 'error');
    }
  }

  async function bulkStatus(status) {
    const prev = new Map();
    words.forEach(w => { if (selected.has(w._id)) { prev.set(w._id, w.status); w.status = status; } });
    rerender();
    try {
      showBadges(await apiFetch(`/vocabbook/${bookId}/words`, { method: 'PATCH', body: JSON.stringify({ wordIds: [...prev.keys()], status }) }));
      if (status === 'da-thuoc') celebrateIfDone();
      setSelected(new Set());
      toast(`Đã chuyển ${prev.size} từ sang ${STATUSES.find(s => s.key === status).label}`, 'success');
    } catch (err) {
      words.forEach(w => { if (prev.has(w._id)) w.status = prev.get(w._id); });
      rerender();
      toast(err.message || 'Cập nhật thất bại', 'error');
    }
  }

  function askDelete(w) {
    setConfirm({
      title: 'Xoá từ',
      message: `Xoá "${w.word}" khỏi sổ?`,
      onConfirm: async () => {
        try {
          await apiFetch(`/vocabbook/${bookId}/words/${w._id}`, { method: 'DELETE' });
          setBook(b => ({ ...b, words: b.words.filter(x => x._id !== w._id) }));
          setSelected(s => { const n = new Set(s); n.delete(w._id); return n; });
          setBooks(bs => bs?.map(b => (b._id === bookId ? { ...b, totalWords: Math.max(0, (b.totalWords || 1) - 1) } : b)));
          toast('Đã xoá từ', 'success');
        } catch (err) { toast(err.message || 'Xoá thất bại', 'error'); }
      },
    });
  }

  function askBulkDelete() {
    const ids = [...selected];
    setConfirm({
      title: 'Xoá nhiều từ',
      message: `Xoá ${ids.length} từ đã chọn?`,
      onConfirm: async () => {
        try {
          await apiFetch(`/vocabbook/${bookId}/words`, { method: 'DELETE', body: JSON.stringify({ wordIds: ids }) });
          setSelected(new Set());
          toast('Đã xoá', 'success');
          refresh();
        } catch (err) { toast(err.message || 'Xoá thất bại', 'error'); }
      },
    });
  }

  async function rename() {
    if (nameDraft === null) return;
    const n = nameDraft.trim();
    setNameDraft(null);
    if (book.isDefault || book.classBook || n === book.name) return;
    if (!n) { toast('Tên sổ không được để trống', 'error'); return; }
    try {
      await apiFetch(`/vocabbook/${bookId}`, { method: 'PUT', body: JSON.stringify({ name: n }) });
      setBook(b => ({ ...b, name: n }));
      setBooks(bs => bs?.map(b => (b._id === bookId ? { ...b, name: n } : b)));
      toast('Đã đổi tên sổ', 'success');
    } catch (err) {
      toast(err.message || 'Đổi tên thất bại', 'error');
    }
  }

  function addWord() {
    if (words.length >= VOCAB_BOOK_MAX_WORDS) {
      toast(`Sổ này đã đạt giới hạn ${VOCAB_BOOK_MAX_WORDS} từ. Hãy chuyển bớt sang sổ khác hoặc xóa từ cũ.`, 'error');
      return;
    }
    setEditing(null);
  }

  function copyList() {
    if (!words.length) { toast('Sổ này chưa có từ nào', 'error'); return; }
    let list = visible;
    if (selected.size) {
      const shown = visible.filter(w => selected.has(w._id));
      const hidden = words.filter(w => selected.has(w._id) && !shown.includes(w));
      list = [...shown, ...hidden];
    }
    const oneLine = s => String(s || '').replace(/\s*[\r\n]+\s*/g, '; ').trim();
    const lines = list.map(w => (w.meaning ? `${oneLine(w.word)}: ${oneLine(w.meaning)}` : oneLine(w.word))).filter(Boolean);
    if (!lines.length) { toast('Không có từ nào để copy', 'error'); return; }
    copyText(lines.join('\n'))
      .then(() => toast(`Đã copy ${lines.length} từ ✅ Bạn nhận dán vào “Nhập hàng loạt” là lưu được.`, 'success'))
      .catch(() => toast('Trình duyệt chặn copy — hãy thử lại', 'error'));
  }

  function practice(mode, set) {
    if (!words.length) { toast('Sổ này chưa có từ nào', 'error'); return; }
    if (set === 'hard' && !hardCount) {
      toast('Chưa có từ nào sai từ 3 lần trở lên. Hãy tiếp tục luyện tập!', 'info');
      return;
    }
    navigate(`/dashboard/book/${bookId}/practice?mode=${mode}${set ? `&set=${set}` : ''}`);
  }

  const toggleSelect = (id, on) => setSelected(s => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });
  const toggleAll = (on) => setSelected(s => {
    const n = new Set(s);
    visible.forEach(w => (on ? n.add(w._id) : n.delete(w._id)));
    return n;
  });

  return (
    <div id="book-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {classify === bookId && (
        <div className="classify-float show" role="dialog" aria-live="polite">
          <button type="button" className="classify-float-close" aria-label="Đóng" onClick={() => setClassify(null)}>×</button>
          <div className="classify-float-title"><span className="classify-float-emoji">🏷️</span> Bạn đã thuộc kĩ chưa?</div>
          <p className="classify-float-text">Xem lại mức độ nhớ của từng từ — bấm ô trạng thái ở mỗi dòng để cập nhật.</p>
          <div className="classify-float-counts">
            <span className="status-select-hint chua-thuoc">Not yet <b>{counts['chua-thuoc']}</b></span>
            <span className="status-select-hint nho-so-so">So-so <b>{counts['nho-so-so']}</b></span>
            <span className="status-select-hint da-thuoc">Mastered <b>{counts['da-thuoc']}</b></span>
          </div>
          {counts['chua-thuoc'] === words.length
            ? <p className="classify-float-note">Tất cả từ đang ở <b>Not yet</b> — từ nào đã nhớ thì đổi sang So-so hoặc Mastered nhé.</p>
            : counts['nho-so-so'] > 0 && <p className="classify-float-note">Có <b>{counts['nho-so-so']}</b> từ <b>So-so</b> — từ nào giờ đã nhớ chắc thì nâng lên Mastered.</p>}
          <p className="classify-float-hint">Đổi nhiều từ cùng lúc: tick ô vuông đầu dòng rồi chọn trạng thái mới. Phân loại càng đúng, hệ thống nhắc ôn càng chính xác.</p>
          <div className="classify-float-btns">
            <button type="button" className="btn btn-primary btn-sm" onClick={classifyNow}><i className="fas fa-tags" /> Phân loại ngay</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setClassify(null)}>Để sau</button>
          </div>
        </div>
      )}
      <div className="book-topbar">
        <div className="book-top-title">
          <span className="book-top-emoji">{book.emoji || '📘'}</span>
          <input
            ref={nameRef}
            className="book-editable-name"
            value={nameDraft ?? book.name}
            readOnly={!!(book.isDefault || book.classBook)}
            title={book.classBook ? 'Sổ bộ từ giáo viên giao — không đổi tên được' : book.isDefault ? 'Sổ mặc định — không đổi tên được' : 'Click để đổi tên'}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
            onBlur={rename}
            aria-label="Tên sổ"
          />
          {!book.isDefault && !book.classBook && (
            <button className="btn-rename" onClick={() => nameRef.current?.focus()} title="Đổi tên" aria-label="Đổi tên sổ"><i className="fas fa-pen" /></button>
          )}
          <button className="btn-book-options" onClick={() => openBookMenu(bookId)} title="Tùy chọn sổ" aria-label="Tùy chọn sổ">⋯</button>
          <button className="btn-help-guide" onClick={openGuide} title="Hướng dẫn sử dụng" aria-label="Hướng dẫn sử dụng"><i className="fas fa-question-circle" /></button>
        </div>
        <div className="book-stats">
          {[...STATUSES].reverse().map(s => (
            <span
              key={s.key}
              className={`stat-dot${statusFilter === s.key ? ' active' : ''}`}
              title={`Lọc: chỉ hiện từ ${s.label}`}
              onClick={() => setStatusFilter(f => (f === s.key ? null : s.key))}
            >
              <span className={s.dot} /><CountUp value={counts[s.key]} /> {s.label}
            </span>
          ))}
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>·</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
            <CountUp value={isFiltered ? visible.length : words.length} />
            {isFiltered ? ` / ${words.length} từ` : ` / ${VOCAB_BOOK_MAX_WORDS} từ`}
          </span>
        </div>
      </div>
      <div className="book-progress-bar"><div className={`book-progress-fill${completePulse ? ' complete' : ''}`} style={{ width: `${pct}%` }} /></div>
      <StreakBanner stats={stats} />

      {/* homework "học N từ trong sổ" this book counts for */}
      <VocabGoalCards goals={goalsForBook(vocabGoals, book)} words={words} onStart={() => practice('mixed')} />
      <AddTip />

      <div className="book-action-bar">
        <button className="btn btn-primary btn-sm" onClick={() => practice('mixed')}
          title="Trộn ngẫu nhiên Quiz / Điền từ / Nghe / Dịch — có thể đổi sang từng dạng riêng ở thanh tab">
          <i className="fas fa-random" /> Luyện tập (Mixed)
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => practice('flashcard')}>
          <i className="fas fa-sync-alt" /> Flashcard
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => practice('study')}>
          <i className="fas fa-eye" /> Preview
        </button>
        <button className="btn btn-ghost btn-sm" onClick={addWord}>
          <i className="fas fa-plus" /> Add word
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setBulkOpen(true)} title="Nhập nhiều từ một lúc từ danh sách">
          <i className="fas fa-file-import" /> Nhập hàng loạt
        </button>
        <button className="btn btn-ghost btn-sm" onClick={copyList}
          title="Copy danh sách dạng “word: nghĩa”. Đang tick chọn từ thì chỉ copy các từ đã chọn; đang lọc/tìm thì copy các từ đang hiện.">
          <i className="fas fa-copy" /> Copy danh sách
        </button>
        <button className={`btn btn-sm btn-hard-words${hardCount ? ' has-hard-words' : ''}`} onClick={() => practice('mixed', 'hard')}>
          <i className="fas fa-fire" /> Ôn lại từ hay sai{hardCount ? ` (${hardCount})` : ''}
        </button>
        {words.length > 0 && (books?.length || 0) > 1 && (
          <button className="btn btn-ghost btn-sm" onClick={() => openBookMenu(bookId, 'move')} title="Chuyển toàn bộ từ của sổ này sang sổ khác">
            <i className="fas fa-share-square" style={{ color: '#0891b2' }} /> Chuyển sang sổ khác
          </button>
        )}

        <div className={`bulk-bar${selected.size ? ' show' : ''}`}>
          <span>Đã chọn <span className="bulk-count">{selected.size}</span> từ · chuyển sang:</span>
          {STATUSES.map(s => (
            <button key={s.key} type="button" className={`bulk-status-btn ${s.key}`} onClick={() => bulkStatus(s.key)}>{s.label}</button>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={copyList}><i className="fas fa-copy" /> Copy</button>
          <button className="btn btn-danger btn-sm" onClick={askBulkDelete}><i className="fas fa-trash" /> Delete</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>Bỏ chọn</button>
        </div>

        <div className="book-search-wrap">
          <i className="fas fa-search" />
          <input className="book-search-input" type="search" placeholder="Tìm từ..." autoComplete="off"
            value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="words-table-wrap">
        <table className="words-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input ref={checkAllRef} type="checkbox" checked={everyVisibleSelected} onChange={(e) => toggleAll(e.target.checked)} aria-label="Chọn tất cả" />
              </th>
              <th>Status</th>
              <th>Word</th>
              <th>Meaning</th>
              <th>Example / Insight</th>
              <th>Notes</th>
              <th style={{ width: 60 }} />
            </tr>
          </thead>
          <tbody id="words-tbody">
            {!words.length && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text3)' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                <div>Sổ này chưa có từ nào</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>Bấm “Add word”, hoặc double-click một từ khi làm bài Reading/Listening để lưu vào sổ</div>
              </td></tr>
            )}
            {words.length > 0 && !visible.length && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                <div>Không tìm thấy từ phù hợp</div>
              </td></tr>
            )}
            {visible.map((w, i) => (
              <WordRow key={w._id} w={w} index={i} flash={flashId === w._id} selected={selected.has(w._id)} onSelect={toggleSelect}
                onStatus={changeStatus} onEdit={setEditing} onDelete={askDelete} />
            ))}
          </tbody>
        </table>
      </div>

      {editing !== undefined && (
        <WordModal bookId={bookId} word={editing} onClose={() => setEditing(undefined)} onSaved={refresh} />
      )}
      {bulkOpen && <BulkImportModal book={book} onClose={() => setBulkOpen(false)} onSaved={refresh} />}
      {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
    </div>
  );
}
