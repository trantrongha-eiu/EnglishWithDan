import { useCallback, useEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import WbwDrill from '../../components/WbwDrill';
import SlowSpeechButton from '../../components/SlowSpeechButton';
import { ConfirmDialog } from '../../components/Modal';
import { hasPremiumAccess } from '../../utils/plan';
import { speakWord, prefetchAudio, playSound } from '../../utils/vocab';
import { reportPracticeComplete } from '../../utils/practiceSync';
import {
  buildQuizQueue, requeueQuestion, letterHint, savedTerms, markTermsSaved, savedCount, quizUnlocked,
} from '../../utils/lessonQuiz';
import {
  bindDict, mascotHtml, openUpgrade, resultImage, scoreMessage, setActivePractice, spawnConfetti,
} from '../../utils/shell';

// Vocab Topic lesson: Learn / Quiz / Results (port of dashboard-lesson.js).
//   /dashboard/lesson/:lessonId   ?from=topics → Back returns to the list

const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const mmss = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const pad = (n) => String(n).padStart(2, '0');
function fmtDate(iso) {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Only http(s) images; empty alt in the quiz so it never spells the answer
function WordImage({ word, className, alt = '' }) {
  const url = String(word?.imageUrl || '').trim();
  if (!/^https?:\/\//i.test(url)) return null;
  return <img className={className} src={url} alt={alt} loading="lazy" decoding="async"
    onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
}

function Mascot({ html, children }) {
  return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : children;
}

/* ── Learn ── */
function LearnTab({ words }) {
  if (!words.length) return <div className="classroom-empty">Bài học chưa có từ vựng</div>;
  return words.map((w, i) => (
    <div className="vocab-card" key={w._id || i}>
      <WordImage word={w} className="vocab-card-img" alt={w.word} />
      <div className="vocab-card-top">
        <span className="vocab-num">{i + 1}</span>
        <span className="vocab-word-big">{w.word}</span>
        {w.partOfSpeech && <span className="vocab-pos">{w.partOfSpeech}</span>}
      </div>
      {w.ipa && <div className="vocab-phonetic">{w.ipa}</div>}
      <div className="vocab-meaning">{w.meaning}</div>
      {w.example && <div className="vocab-example">"{w.example}"</div>}
      {w.definition && <div className="vocab-example" style={{ marginTop: 4, fontStyle: 'normal' }}>{w.definition}</div>}
      {w.collocations?.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}><b>Collocations:</b> {w.collocations.join(', ')}</div>
      )}
      <button className="btn-save-to-book" onClick={() => speakWord(w.word)}><i className="fas fa-volume-up" /> Nghe phát âm</button>
    </div>
  ));
}

/* ── Quiz questions ── */
function ChoiceQuestion({ q, label, answered, onAnswer }) {
  const [picked, setPicked] = useState(null);
  return (
    <>
      <div className="question-number">{label}</div>
      <div className="question-text">{q.prompt}</div>
      <div className="answer-options" id="qOptions">
        {q.options.map((o, i) => {
          let cls = 'answer-option';
          if (answered) {
            cls += ' opt-locked';
            if (o === q.answer) cls += ' correct';
            else if (o === picked) cls += ' wrong';
          }
          return (
            <button key={i} className={cls} onClick={() => {
              if (answered) return;
              setPicked(o);
              onAnswer(o === q.answer);
            }}>{o}</button>
          );
        })}
      </div>
    </>
  );
}

function TypedQuestion({ q, answered, onAnswer }) {
  const listen = q.type === 'listen';
  const word = q.word.word;
  useEffect(() => { if (listen) speakWord(word); }, [listen, word]);
  // 3rd wrong try = failed: graded wrong, and the question comes back later
  const done = (ok) => onAnswer(ok, !ok);
  return (
    <>
      <div className="question-number">{listen ? 'Listening' : 'Fill in the Blank'}</div>
      {listen ? (
        <>
          <button className="btn-play-audio" onClick={() => speakWord(word)}><i className="fas fa-volume-up" /> Play Audio</button>
          <div style={{ textAlign: 'center' }}><SlowSpeechButton word={word} /></div>
        </>
      ) : <div className="question-text">{q.sentence}</div>}
      <div className="fb-meaning-hint"><i className="fas fa-lightbulb" /> Gợi ý (nghĩa): {q.word.meaning || ''}</div>
      <div className="listen-hint">💡 {letterHint(word, 'vi')}</div>
      {!answered && <WbwDrill answer={word} onDone={done} placeholder={listen ? 'Nhập từ bạn vừa nghe...' : 'Nhập từ còn thiếu...'} />}
    </>
  );
}

// Google Translate hint: best effort, 7s cap, dropped once the question changes
function useSentenceHint(sentence) {
  const [hint, setHint] = useState({ sentence: null, text: '' });
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(sentence)}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setHint({ sentence, text: d?.[0]?.map(s => s?.[0]).filter(Boolean).join('') || '' }))
      .catch(() => setHint({ sentence, text: '' }))
      .finally(() => clearTimeout(t));
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [sentence]);
  return hint.sentence === sentence ? hint.text : null;
}

function RearrangeQuestion({ q, answered, onAnswer }) {
  const [picked, setPicked] = useState([]);
  const hint = useSentenceHint(q.word.example);
  const remaining = q.tiles.filter(t => !picked.includes(t));
  const pick = (tile) => {
    if (answered) return;
    const next = [...picked, tile];
    setPicked(next);
    if (next.length === q.tiles.length) onAnswer(next.map(t => t.t).join(' ') === q.original);
  };
  return (
    <>
      <div className="question-number">Rearrange — sắp xếp lại câu đúng chứa từ "{q.word.word}" ({q.word.meaning})</div>
      <div className="rearrange-hint">
        {hint === null ? <><i className="fas fa-spinner fa-spin" /> Đang dịch câu...</> : hint && <><i className="fas fa-language" /> {hint}</>}
      </div>
      <div className="rearrange-slots">
        {picked.map(t => (
          <button key={t.id} className="rearrange-slot-tile" onClick={() => { if (!answered) setPicked(picked.filter(x => x !== t)); }}>{t.t}</button>
        ))}
      </div>
      <div className="rearrange-tiles">
        {remaining.map(t => <button key={t.id} className="rearrange-tile" onClick={() => pick(t)}>{t.t}</button>)}
      </div>
    </>
  );
}

function Feedback({ correct, word, answer }) {
  return (
    <div>
      {correct
        ? <div className="feedback-correct"><i className="fas fa-check-circle" /> Chính xác!</div>
        : <div className="feedback-wrong"><i className="fas fa-times-circle" /> Chưa đúng — đáp án: <b>{answer}</b></div>}
      <div className="quiz-answer-detail">
        <div><b>Nghĩa:</b> {word.meaning}</div>
        {word.example && <div className="quiz-answer-example">"{word.example}"</div>}
      </div>
    </div>
  );
}

function Elapsed({ since }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="quiz-elapsed-time"><i className="fas fa-stopwatch" /> {mmss(Math.max(0, Math.floor((now - since) / 1000)))}</span>;
}

const CHOICE_LABEL = {
  mcq: 'Multiple Choice — chọn từ đúng',
  translateViEn: 'Vietnamese → English',
  translateEnVi: 'English → Vietnamese',
};

/* ── Results ── */
function ResultsTab({ lesson, session, onRetake }) {
  const [data, setData] = useState(null);
  const id = lesson._id;
  useEffect(() => {
    let alive = true;
    const get = (p) => apiFetch(`/vocabulary-lessons/${id}${p}`).catch(() => null);
    Promise.all([get('/attempt'), get('/attempt/history'), get('/leaderboard')]).then(([a, h, l]) => {
      if (alive) setData({ attempt: a?.attempt || null, history: h?.history || [], leaderboard: l?.leaderboard || [] });
    });
    return () => { alive = false; };
  }, [id, session]);

  if (!data) return <div className="classroom-empty">Đang tải...</div>;
  const { attempt, history, leaderboard } = data;
  if (!attempt && !session) {
    return (
      <div className="practice-container" style={{ textAlign: 'center', padding: '40px 0' }}>
        <p style={{ color: 'var(--text2)' }}>Bạn chưa làm Quiz cho bài học này.</p>
        <button className="btn-next" style={{ maxWidth: 220, margin: '14px auto 0' }} onClick={onRetake}>Làm Quiz ngay</button>
      </div>
    );
  }
  const me = (() => { try { const u = JSON.parse(localStorage.getItem('user') || '{}'); return String(u.id || u._id || ''); } catch { return ''; } })();
  const msg = session ? scoreMessage(session.score) : null;
  return (
    <div className="practice-container">
      {session && (
        <>
          <div className="lesson-results-stat-row">
            <div className="lesson-results-stat"><div className="lesson-results-stat-value">{session.score}%</div><div className="lesson-results-stat-label">Score</div></div>
            <div className="lesson-results-stat"><div className="lesson-results-stat-value" style={{ color: 'var(--green)' }}>{session.correct}</div><div className="lesson-results-stat-label">Correct</div></div>
            <div className="lesson-results-stat"><div className="lesson-results-stat-value" style={{ color: 'var(--brand)' }}>{session.wrong}</div><div className="lesson-results-stat-label">Wrong</div></div>
            <div className="lesson-results-stat"><div className="lesson-results-stat-value">{mmss(session.timeSpentSec)}</div><div className="lesson-results-stat-label">Time</div></div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Mascot html={mascotHtml({ pct: session.score, text: msg.message, stacked: true })}>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>{msg.emoji} {msg.message}</div>
            </Mascot>
            <img src={resultImage(session.score)} alt="" style={{ width: '100%', maxWidth: 200, borderRadius: 12, objectFit: 'cover' }} />
          </div>
          {session.wrongWords.length > 0 && (
            <div className="fb-card" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}><i className="fas fa-redo" /> Review Wrong Answers</div>
              {session.wrongWords.map((w, i) => (
                <div key={i} style={{ padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                  <b>{w.word}</b> — {w.meaning}
                  {w.example && <div style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic' }}>"{w.example}"</div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {attempt && (
        <div className="lesson-results-stat-row">
          <div className="lesson-results-stat"><div className="lesson-results-stat-value" style={{ color: 'var(--blue)' }}>{attempt.bestScore}%</div><div className="lesson-results-stat-label">Best Score</div></div>
          <div className="lesson-results-stat"><div className="lesson-results-stat-value">{attempt.attemptCount}</div><div className="lesson-results-stat-label">Attempt Count</div></div>
        </div>
      )}
      <div style={{ marginBottom: 20 }}>
        <div className="dan-lb-title"><i className="fas fa-trophy" /> Bảng xếp hạng bài này</div>
        <div className="dan-lb-list">
          {!leaderboard.length && <div className="dan-lb-empty">Chưa có ai làm quiz này — hãy là người đầu tiên!</div>}
          {leaderboard.map((r, i) => {
            const rank = i + 1;
            const medal = RANK_MEDAL[rank];
            const isMe = String(r.userId) === me;
            return (
              <div key={r.userId || i} className={`dan-lb-row${isMe ? ' is-me' : ' dan-lb-clickable'}`}
                onClick={isMe ? undefined : () => window.openPeerProfile?.(r.userId)}>
                <span className={`dan-lb-rank${medal ? ` top${rank}` : ''}`}>{medal || rank}</span>
                {r.avatar
                  ? <img className="dan-lb-avatar" src={r.avatar} alt="" />
                  : <span className="dan-lb-avatar-placeholder">{(r.name || '?')[0].toUpperCase()}</span>}
                <span className="dan-lb-name">{r.name}{isMe ? ' (Bạn)' : ''}</span>
                <span className="dan-lb-quiz-score">{r.bestScore}% <span className="dan-lb-quiz-time">· {r.attemptCount} lần</span></span>
              </div>
            );
          })}
        </div>
      </div>
      {history.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}><i className="fas fa-history" /> Lịch sử làm bài</div>
          <div className="table-wrap" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <table className="lesson-history-table">
              <thead><tr><th>Lần làm</th><th>Điểm</th><th>Thời gian</th></tr></thead>
              <tbody>{history.map((h, i) => <tr key={i}><td>{fmtDate(h.createdAt)}</td><td>{h.score}%</td><td>{mmss(h.timeSpent)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
      <button className="btn-next" onClick={onRetake}><i className="fas fa-redo" /> Làm lại Quiz</button>
    </div>
  );
}

/* ── Screen ── */
function LessonScreen({ lessonId, backTo }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { loadBooks, refreshHomeworkSoon } = useOutletContext();
  const [loaded, setLoaded] = useState(null); // { lesson } | { error }
  const [reload, setReload] = useState(0);
  const [tab, setTab] = useState('learn');
  const [quiz, setQuiz] = useState(null);
  const [session, setSession] = useState(null); // last finished run
  const [saveFailed, setSaveFailed] = useState(null); // retry function
  const [saving, setSaving] = useState(false); // last answer given, result on its way
  const [, setSavedTick] = useState(0);
  const quizRef = useRef(null);
  const inProgress = !!quiz;
  // Back button, browser Back, sidebar…: anything leaving a running quiz asks first
  const blocker = useBlocker(({ currentLocation, nextLocation }) => inProgress && currentLocation.pathname !== nextLocation.pathname);
  const inProgressRef = useRef(false);
  useEffect(() => { inProgressRef.current = inProgress; setActivePractice(inProgress); }, [inProgress]);
  useEffect(() => () => setActivePractice(false), []);

  const allowed = hasPremiumAccess();
  useEffect(() => {
    if (allowed) return;
    openUpgrade();
    navigate(backTo, { replace: true });
  }, [allowed, backTo, navigate]);

  useEffect(() => {
    if (!allowed) return undefined;
    let alive = true;
    apiFetch(`/vocabulary-lessons/${lessonId}`)
      .then((d) => { if (alive) { setLoaded({ lesson: d.lesson }); prefetchAudio((d.lesson.words || []).map(w => w.word)); } })
      .catch((error) => { if (alive) setLoaded({ error }); });
    return () => { alive = false; };
  }, [allowed, lessonId, reload]);

  const lesson = loaded?.lesson;
  const words = lesson?.words || [];
  const unlocked = lesson ? quizUnlocked(lesson) : false;
  const ready = !!lesson;

  // Double-click lookup: never on a running quiz (it would give answers away)
  useEffect(() => {
    if (!ready) return;
    bindDict('lesson-learn-grid', 'vocab-lesson-learn');
    bindDict('lesson-tab-quiz', 'vocab-lesson-quiz', () => !inProgressRef.current);
    bindDict('lesson-tab-results', 'vocab-lesson-results');
  }, [ready]);

  const commit = useCallback((q) => { quizRef.current = q; setQuiz(q); }, []);

  const switchTab = (t) => {
    if (t !== 'quiz' && inProgress) { toast('Hoàn thành Quiz trước khi xem tab khác!', 'error'); return; }
    setTab(t);
  };

  const saveAll = () => {
    if (!words.length || !window.openVocabBookPickerBulk) return;
    const wasUnlocked = quizUnlocked(lesson);
    const items = words.map(w => ({ word: w.word, meaning: w.meaning || '', example: w.example || '', collocations: w.collocations || [] }));
    window.openVocabBookPickerBulk(items, (terms) => {
      markTermsSaved(lesson._id, terms);
      setSavedTick(n => n + 1);
      loadBooks();
      if (!wasUnlocked && quizUnlocked(lesson)) toast('🔓 Đã mở khoá Quiz — vào làm thôi!', 'success');
    });
  };

  const start = () => {
    if (!quizUnlocked(lesson)) { toast('Lưu từ vựng vào sổ trước để mở Quiz nha!', 'error'); return; }
    setSession(null);
    commit({ queue: buildQuizQueue(words), index: 0, correct: 0, wrong: 0, wrongWords: [], startTime: Date.now(), answered: false, lastCorrect: null });
  };

  const answer = useCallback((correct, failedDrill = false) => {
    const q = quizRef.current;
    if (!q || q.answered) return;
    const item = q.queue[q.index];
    playSound(correct ? 'correct' : 'wrong');
    const counted = !item._redo; // a redo copy is practice only
    commit({
      ...q,
      answered: true,
      lastCorrect: correct,
      queue: failedDrill ? requeueQuestion(q.queue, q.index) : q.queue,
      correct: q.correct + (counted && correct ? 1 : 0),
      wrong: q.wrong + (counted && !correct ? 1 : 0),
      wrongWords: counted && !correct ? [...q.wrongWords, item.word] : q.wrongWords,
    });
  }, [commit]);

  const finish = useCallback(async (q) => {
    setSaving(true);
    commit(null);
    const total = q.queue.filter(x => !x._redo).length;
    const timeSpentSec = Math.max(1, Math.round((Date.now() - q.startTime) / 1000));
    const run = {
      score: total > 0 ? Math.round((q.correct / total) * 100) : 0,
      correct: q.correct, wrong: q.wrong, total, timeSpentSec, wrongWords: q.wrongWords,
    };
    const body = JSON.stringify({ correctCount: q.correct, totalCount: total, timeSpent: timeSpentSec, wrongWords: q.wrongWords.map(w => w.word) });
    const save = () => apiFetch(`/vocabulary-lessons/${lessonId}/attempt`, { method: 'POST', body });
    try {
      await save();
    } catch {
      // without this the homework item would silently stay "chưa xong"
      setSaveFailed(() => save);
    }
    // Same streak endpoint as notebook practice (under 5 answers is a no-op there)
    reportPracticeComplete({ wordsAnswered: total, correctAnswered: q.correct, unitId: null, unitType: null }).catch(() => {});
    refreshHomeworkSoon(true);
    if (run.score === 100) setTimeout(() => spawnConfetti(100), 400);
    setSession(run);
    setSaving(false);
    setTab('results');
  }, [commit, lessonId, refreshHomeworkSoon]);

  const next = useCallback(() => {
    const q = quizRef.current;
    if (!q?.answered) return;
    const index = q.index + 1;
    if (index >= q.queue.length) { finish(q); return; }
    commit({ ...q, index, answered: false, lastCorrect: null });
  }, [commit, finish]);

  const answered = !!quiz?.answered;
  useEffect(() => {
    if (!answered) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Enter' || document.querySelector('.modal-overlay:not(.hidden)')) return;
      e.preventDefault();
      next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [answered, next]);

  const leave = () => navigate(backTo);

  if (!allowed) return null;
  if (loaded?.error) {
    const locked = loaded.error.body?.requiresPremium;
    return (
      <div className="book-view-error">
        <p>{loaded.error.message}</p>
        {locked
          ? <button className="btn btn-primary" onClick={() => openUpgrade()}>Xem gói Premium</button>
          : <button className="btn btn-primary" onClick={() => { setLoaded(null); setReload(n => n + 1); }}>Thử lại</button>}
        <button className="btn btn-ghost" onClick={leave}>← Back</button>
      </div>
    );
  }

  const savedSet = lesson ? savedTerms(lesson._id) : new Set();
  const allSaved = words.length > 0 && words.every(w => savedSet.has(w.word));
  const item = quiz?.queue[quiz.index];
  const lockHtml = !unlocked ? mascotHtml({ solo: true, stacked: true, mood: 'think', text: 'Lưu hết từ vựng vào sổ trước rồi mới được làm Quiz nha ní!' }) : null;

  return (
    <div id="view-lesson" className="practice-shell" style={{ display: 'flex' }}>
      <div className="unit-header-bar">
        <button className="btn btn-ghost btn-sm" onClick={leave}>← Back</button>
        <h3 id="lesson-title">{lesson ? lesson.title : 'Đang tải...'}</h3>
        <div />
      </div>
      <div className="mode-tabs-wrap">
        <div className="mode-tabs" id="lesson-tabs">
          <button className={`tab-btn${tab === 'learn' ? ' active' : ''}`} onClick={() => switchTab('learn')}><i className="fas fa-book-open" /> Learn</button>
          <button className={`tab-btn${tab === 'quiz' ? ' active' : ''}${lesson && !unlocked ? ' is-locked' : ''}`} onClick={() => switchTab('quiz')}
            title={lesson && !unlocked ? 'Lưu từ vựng vào sổ để mở Quiz' : ''}>
            <i className={`fas ${lesson && !unlocked ? 'fa-lock' : 'fa-check-circle'}`} /> Quiz
          </button>
          <button className={`tab-btn${tab === 'results' ? ' active' : ''}`} onClick={() => switchTab('results')}><i className="fas fa-chart-bar" /> Results</button>
          {words.length > 0 && (
            <button className="lesson-saveall-btn" id="lesson-saveall-btn" onClick={saveAll} disabled={allSaved}>
              <i className={`fas fa-${allSaved ? 'check-circle' : 'save'}`} /> {allSaved ? 'Đã lưu tất cả' : `Lưu tất cả (${words.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="mode-body" id="lesson-tab-body" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <div id="lesson-tab-learn" style={{ display: tab === 'learn' ? 'block' : 'none' }}>
          <div className="vocab-grid" id="lesson-learn-grid">{lesson ? <LearnTab words={words} /> : <div className="classroom-empty">Đang tải...</div>}</div>
        </div>

        <div id="lesson-tab-quiz" style={{ display: tab === 'quiz' ? 'block' : 'none' }}>
          {lesson && !words.length && <div className="classroom-empty">Bài học chưa có từ vựng</div>}
          {saving && <div className="classroom-empty">Đang lưu kết quả...</div>}
          {lesson && words.length > 0 && !item && !saving && !unlocked && (
            <div className="practice-container lesson-quiz-locked">
              <Mascot html={lockHtml}><p style={{ fontWeight: 700 }}>Lưu hết từ vựng vào sổ trước rồi mới được làm Quiz nha ní!</p></Mascot>
              <div className="lesson-quiz-locked-count"><i className="fas fa-lock" /> Đã lưu <b>{savedCount(lesson)}/{words.length}</b> từ</div>
              <button className="btn-next" onClick={saveAll}><i className="fas fa-save" /> Lưu tất cả vào sổ ({words.length})</button>
              <button className="btn btn-ghost btn-sm lesson-quiz-locked-learn" onClick={() => switchTab('learn')}><i className="fas fa-book-open" /> Xem lại từ vựng</button>
            </div>
          )}
          {lesson && words.length > 0 && !item && !saving && unlocked && (
            <div className="practice-container">
              <div className="practice-header">
                <h3><i className="fas fa-check-circle" /> Quiz</h3>
                <p>{words.length} câu hỏi — trộn ngẫu nhiên: Trắc nghiệm, Điền từ, Nghe, Dịch, Sắp xếp câu</p>
              </div>
              <button className="btn-next" onClick={start}>Bắt đầu Quiz <i className="fas fa-arrow-right" /></button>
            </div>
          )}
          {item && (
            <div className="practice-container">
              <div className="practice-progress">
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.round(((quiz.index + 1) / quiz.queue.length) * 100)}%` }} /></div>
                <div className="practice-progress-meta">
                  <Elapsed since={quiz.startTime} />
                  <span className="progress-text">{quiz.index + 1}/{quiz.queue.length}</span>
                </div>
              </div>
              <div className="question-card" key={quiz.index}>
                <WordImage word={item.word} className="quiz-word-img" />
                {CHOICE_LABEL[item.type] && <ChoiceQuestion q={item} label={CHOICE_LABEL[item.type]} answered={quiz.answered} onAnswer={answer} />}
                {(item.type === 'fill' || item.type === 'listen') && <TypedQuestion q={item} answered={quiz.answered} onAnswer={answer} />}
                {item.type === 'rearrange' && <RearrangeQuestion q={item} answered={quiz.answered} onAnswer={answer} />}
                {quiz.answered && <Feedback correct={quiz.lastCorrect} word={item.word} answer={item.answer} />}
                {quiz.answered && <button className="btn-next" style={{ display: 'flex' }} onClick={next}>Next <i className="fas fa-arrow-right" /></button>}
              </div>
            </div>
          )}
        </div>

        <div id="lesson-tab-results" style={{ display: tab === 'results' ? 'block' : 'none' }}>
          {lesson && tab === 'results' && <ResultsTab lesson={lesson} session={session} onRetake={() => setTab('quiz')} />}
        </div>
      </div>

      {blocker.state === 'blocked' && (
        <ConfirmDialog title="Thoát bài quiz?" message="Bạn đang làm dở quiz, tiến độ lần này sẽ không được lưu."
          confirmLabel="Thoát" confirmClass="btn-primary" onClose={() => {}} onCancel={() => blocker.reset()}
          onConfirm={() => { commit(null); blocker.proceed(); }} />
      )}
      {saveFailed && (
        <ConfirmDialog title="Chưa lưu được kết quả" message="Chưa lưu được kết quả bài học — bài tập về nhà sẽ chưa được tính. Thử lưu lại ngay?"
          confirmLabel="Lưu lại" confirmClass="btn-primary" onClose={() => setSaveFailed(null)}
          onConfirm={() => saveFailed()
            .then(() => { toast('✔ Đã lưu kết quả bài học', 'success'); refreshHomeworkSoon(true); setSession(s => (s ? { ...s } : s)); })
            .catch(() => toast('Vẫn chưa lưu được — kiểm tra mạng rồi làm lại bài nhé.', 'error'))} />
      )}
    </div>
  );
}

export default function Lesson() {
  const { lessonId } = useParams();
  const [params] = useSearchParams();
  const backTo = params.get('from') === 'topics' ? '/dashboard/topics' : '/dashboard';
  return <LessonScreen key={lessonId} lessonId={lessonId} backTo={backTo} />;
}

