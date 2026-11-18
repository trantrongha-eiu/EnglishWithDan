import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import WbwDrill from '../../components/WbwDrill';
import SlowSpeechButton from '../../components/SlowSpeechButton';
import { ConfirmDialog } from '../../components/Modal';
import UnitStudy from './UnitStudy';
import { hasPremiumAccess } from '../../utils/plan';
import { letterHint } from '../../utils/lessonQuiz';
import { clozeFor } from '../../utils/cloze';
import {
  buildSmartSession, shuffle, speakWord, prefetchAudio, playSound,
} from '../../utils/vocab';
import {
  queueAnswer, flushEvidence, startStreakSession, countStreakAnswer, endStreakSession,
  getSaveState, onSaveState, onStreakResult,
} from '../../utils/practiceSync';
import { goalsForBook, goalProgress, noteGoalAnswer } from '../../utils/vocabGoal';
import VocabGoalCards from './VocabGoalCards';
import {
  bindDict, mascotHtml, openUpgrade, reportLearningResult, resultImage, scoreMessage, setActivePractice, spawnConfetti,
} from '../../utils/shell';

// Notebook practice. Port of dashboard.js's book practice (Quiz /
// Flashcard / Điền từ / Listen / Translate / Mixed), with the homework
// "học N từ" bar live above the questions. Also runs Paraphrase Units
// (/dashboard/unit/:n, with a Study tab) and the cross-book / cross-unit
// review sessions (/dashboard/practice?src=…).
//   ?mode=study|mixed|quiz|flashcard|cloze|listen|translate   &set=hard (từ hay sai)
//   &from=paraphrase → Back returns to that list

const MODES = [
  { key: 'quiz', icon: 'fa-check-circle', label: 'Quiz', title: 'Chọn nghĩa đúng trong 4 lựa chọn' },
  { key: 'flashcard', icon: 'fa-sync-alt', label: 'Flashcard', title: 'Lật thẻ, tự đánh giá đã nhớ hay chưa' },
  { key: 'cloze', icon: 'fa-pen', label: 'Điền từ', title: 'Gõ từ còn thiếu trong câu ví dụ' },
  { key: 'listen', icon: 'fa-headphones', label: 'Listen', title: 'Nghe phát âm, gõ lại từ' },
  { key: 'translate', icon: 'fa-language', label: 'Translate', title: 'Nhìn nghĩa tiếng Việt, gõ từ tiếng Anh' },
  { key: 'mixed', icon: 'fa-random', label: 'Mixed', title: 'Trộn ngẫu nhiên Quiz · Điền từ · Nghe · Dịch' },
];
const STUDY_TAB = { key: 'study', icon: 'fa-book-open', label: 'Study', title: 'Xem lại danh sách từ' };
const MODE_KEYS = new Set(MODES.map(m => m.key));
// ids the old page used in ?mode= links
const LEGACY_MODES = { multipleChoice: 'quiz', fillBlank: 'flashcard', listening: 'listen', translation: 'translate' };
const MIXED_TYPES = ['quiz', 'cloze', 'listen', 'translate'];
const MODE_NAMES = { quiz: 'Quiz', flashcard: 'Flashcard', cloze: 'Điền từ', listen: 'Listen', translate: 'Translate', mixed: 'Mixed' };

// Cross-book sessions (/dashboard/practice?src=…) — dashboard-review.js
// practiceWeakVocab / openReviewDueModal and dashboard.js
// startDifficultWordsPractice. Weak / due words are real notebook words
// tagged with their own book (_reviewBookId) so each answer is saved to it;
// "Từ hay sai" items live in their own list, so they get a local id only.
const fromBookItems = (d) => (d.words || []).map(it => ({ ...it.word, _reviewBookId: it.bookId }));
const CROSS_SOURCES = {
  weak: {
    title: '🔥 Ôn từ yếu', source: 'Ôn từ yếu', empty: '🎉 Bạn chưa có từ nào bị đánh dấu yếu!',
    load: () => apiFetch('/vocabbook/weak?limit=20').then(fromBookItems),
  },
  due: {
    title: '🧠 Ôn tập hôm nay', source: 'Ôn tập hôm nay', empty: '🎉 Không còn từ nào cần ôn lúc này!',
    load: () => apiFetch('/vocabbook/review/due?limit=50').then(fromBookItems),
  },
  // Paraphrase pairs due for review, any unit. The outcome goes back to the
  // per-student schedule (POST /vocab/paraphrase/review), not to a notebook.
  paraphrase: {
    title: '🔑 Ôn Paraphrase', source: 'Ôn Paraphrase', empty: '🎉 Không còn cụm paraphrase nào đến hạn ôn!', unit: 'cụm',
    load: () => apiFetch('/vocab/paraphrase/review-queue?limit=50').then(d => (d.items || []).map((it, i) => ({
      _id: `pr:${i}`, type: 'paraphrase', word: it.word, paraphrase: it.paraphrase, meaning: it.meaning || '',
      explanation: it.explanation || '', _paraUnitId: it.unitId,
    }))),
  },
  difficult: {
    title: '🔥 Ôn lại từ hay sai', source: 'Từ hay sai', empty: 'Chưa có từ nào trong danh sách từ hay sai.',
    load: () => apiFetch('/difficult-words').then(d => (d.words || []).map(w => ({
      _id: `dw:${w._id}`, word: w.word, meaning: w.meaning || '', phonetic: w.phonetic || '',
      partOfSpeech: w.partOfSpeech || '', example: w.example || '',
    }))),
  },
};
// Điền từ needs an example sentence that contains the word.
const typeFits = (t, w) => t !== 'cloze' || !!clozeFor(w);

// Each word takes the type used least so far (random tie-break), never the
// same type 3 times in a row; Điền từ only for words it fits.
function assignMixedTypes(words) {
  const used = Object.fromEntries(MIXED_TYPES.map(t => [t, 0]));
  const out = [];
  for (const w of words) {
    const streak = out.length >= 2 && out[out.length - 1] === out[out.length - 2] ? out[out.length - 1] : null;
    let fits = MIXED_TYPES.filter(t => typeFits(t, w) && t !== streak);
    if (!fits.length) fits = MIXED_TYPES.filter(t => typeFits(t, w));
    const least = Math.min(...fits.map(t => used[t]));
    const cands = fits.filter(t => used[t] === least);
    const t = cands[Math.floor(Math.random() * cands.length)];
    used[t]++;
    out.push(t);
  }
  return out;
}

// The right meaning + up to 3 other meanings from the whole notebook.
function quizOptions(w, pool) {
  const opts = [w.meaning];
  const other = pool.filter(x => x.word !== w.word && x.meaning && x.meaning !== w.meaning);
  while (opts.length < 4 && other.length) {
    const i = Math.floor(Math.random() * other.length);
    if (!opts.includes(other[i].meaning)) opts.push(other[i].meaning);
    other.splice(i, 1);
  }
  return shuffle(opts);
}

function makeItem(word, type, pool, repeat = false) {
  return { word, type, repeat, options: type === 'quiz' ? quizOptions(word, pool) : null };
}

/* ── Question types ── */

function QuizQuestion({ item, answered, onAnswer }) {
  const w = item.word;
  const options = item.options;
  const [picked, setPicked] = useState(null);

  const pick = useCallback((o) => {
    if (answered) return;
    setPicked(o);
    onAnswer(o === w.meaning);
  }, [answered, onAnswer, w.meaning]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input,textarea,select')) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= options.length) pick(options[n - 1]);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [options, pick]);

  return (
    <>
      <div className="question-text">
        “<strong>{w.word}</strong>” nghĩa là gì?
        <button className="btn-audio" onClick={() => speakWord(w.word)} title="Phát âm"
          style={{ fontSize: 17, verticalAlign: 'middle', marginLeft: 6, opacity: 0.75 }}>🔊</button>
      </div>
      <div className="answer-options">
        {options.map((o, i) => {
          let cls = 'answer-option';
          if (answered) {
            cls += ' opt-locked';
            if (o === w.meaning) cls += ' correct';
            else if (o === picked) cls += ' wrong';
          }
          return (
            <button key={i} className={cls} onClick={() => pick(o)}>
              <span className="opt-key">{i + 1}</span>{o}
            </button>
          );
        })}
      </div>
    </>
  );
}

function FlashcardQuestion({ item, answered, onAnswer, onNext }) {
  const w = item.word;
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState(null);
  const flip = useCallback(() => {
    if (!flipped) speakWord(w.word);
    setFlipped(f => !f);
  }, [flipped, w.word]);
  // Space / → / Enter turn the card over until it has been rated
  useEffect(() => {
    if (answered) return undefined;
    const onKey = (e) => {
      if (e.target.closest?.('input,textarea,select') || document.querySelector('.modal-overlay:not(.hidden)')) return;
      if (e.key === ' ' || e.key === 'ArrowRight' || (e.key === 'Enter' && !flipped)) { e.preventDefault(); flip(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [answered, flipped, flip]);
  const mark = (ok) => {
    if (answered) return;
    setResult(ok);
    onAnswer(ok);
    if (ok) setTimeout(onNext, 1200);
  };
  return (
    <>
      <div className="flashcard-wrap">
        <div className={`flashcard${flipped ? ' flipped' : ''}`} onClick={flip}>
          <div className="fc-face fc-front">
            <div className="fc-label">Nghĩa tiếng Việt</div>
            <div className="fc-main">{w.meaning}</div>
            <button className="btn-flip-hint" type="button">Bấm để lật 🔄</button>
          </div>
          <div className="fc-face fc-back">
            <div className="fc-label">{w.type === 'paraphrase' ? 'Cụm trong đoạn văn' : 'Từ tiếng Anh'}</div>
            <div className="fc-main">{w.word}</div>
            <div className="fc-sub">{w.phonetic || ''}</div>
            {w.paraphrase && (
              <div className="fc-sub" style={{ color: 'var(--orange,#f59e0b)', fontStyle: 'italic', marginTop: 4, fontSize: '0.9em' }}>→ Diễn đạt lại: {w.paraphrase}</div>
            )}
            <button className="btn-audio" type="button" onClick={(e) => { e.stopPropagation(); speakWord(w.word); }}
              style={{ marginTop: 6, fontSize: 18, color: 'var(--blue)' }}>🔊</button>
          </div>
        </div>
      </div>
      {flipped && !answered && (
        <div className="quick-btns" style={{ display: 'flex' }}>
          <button className="btn-remembered" onClick={() => mark(true)}><i className="fas fa-check-circle" /> Đã nhớ</button>
          <button className="btn-not-remembered" onClick={() => mark(false)}><i className="fas fa-times-circle" /> Chưa nhớ</button>
        </div>
      )}
      {result === true && <div className="feedback-correct">✅ Tuyệt vời! Bạn đã nhớ từ này! 🎉</div>}
      {result === false && <div className="feedback-wrong">💪 Cố lên! Từ: <strong>{w.word}</strong> – {w.meaning}</div>}
    </>
  );
}

function TypedQuestion({ item, answered, result, onAnswer }) {
  const w = item.word;
  const isListen = item.type === 'listen';
  return (
    <>
      {isListen ? (
        <div className="question-text" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Bấm nghe rồi gõ lại từ bạn nghe được</div>
          <button className="btn-play-audio" onClick={() => speakWord(w.word)}><i className="fas fa-volume-up" style={{ fontSize: 24 }} /> Play Audio</button>
          <div><SlowSpeechButton word={w.word} /></div>
          {w.meaning && <div className="fb-meaning-hint"><i className="fas fa-language" /> {w.meaning}</div>}
          <div className="listen-hint" style={{ fontSize: 13, color: 'var(--text2)', margin: '10px 0' }}>💡 {letterHint(w.word, 'en')}</div>
        </div>
      ) : (
        <div className="question-text">
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>Gõ từ tiếng Anh có nghĩa:</div>
          <div className="trans-meaning practice-prompt-meaning">{w.meaning}</div>
          {w.partOfSpeech && <span className="colloc-chip">{w.partOfSpeech}</span>}
        </div>
      )}
      {!answered && <WbwDrill answer={w.word} onDone={onAnswer} />}
      {answered && (
        <div className="practice-feedback">
          {result
            ? <div className="feedback-correct">✅ Chính xác! <strong>{w.word}</strong> – {w.meaning}</div>
            : <div className="feedback-wrong">❌ Đáp án: <strong>{w.word}</strong> {w.phonetic && <span style={{ opacity: 0.7 }}>{w.phonetic}</span>} – {w.meaning}</div>}
        </div>
      )}
    </>
  );
}

// Example sentence with the word blanked out; the drill takes the form used
// in the sentence ("analysed" for "analyse"). Once answered, the blank is
// filled in place (green/red) so the student re-reads the whole sentence.
function ClozeQuestion({ item, answered, result, onAnswer }) {
  const w = item.word;
  const c = clozeFor(w);
  const [showMeaning, setShowMeaning] = useState(false);
  if (!c) return null;
  return (
    <>
      <div className="cloze-sentence">
        {c.before}
        {answered
          ? <strong className={`cloze-filled ${result ? 'is-ok' : 'is-wrong'}`}>{c.answer}</strong>
          : <span className="cloze-blank" aria-label="chỗ trống">{'_'.repeat(Math.min(Math.max(c.answer.length, 5), 14))}</span>}
        {c.after}
      </div>
      <div className="cloze-meta">
        {w.partOfSpeech && <span className="pos-chip">{w.partOfSpeech}</span>}
        {showMeaning
          ? <span className="cloze-meaning">{w.meaning || '(chưa có nghĩa)'}</span>
          : <button type="button" className="btn-reveal-meaning" onClick={() => setShowMeaning(true)}><i className="fas fa-eye" /> Xem nghĩa</button>}
      </div>
      {!answered && <WbwDrill answer={c.answer} onDone={onAnswer} placeholder="Gõ từ còn thiếu..." />}
      {answered && (
        <div className="practice-feedback">
          {result
            ? <div className="feedback-correct">✅ Chính xác! <strong>{c.answer}</strong> – {w.meaning}</div>
            : <div className="feedback-wrong">❌ Đáp án: <strong>{c.answer}</strong> ({w.word}) – {w.meaning}</div>}
        </div>
      )}
    </>
  );
}

function ClozeEmpty({ onSwitch }) {
  return (
    <div className="practice-container">
      <div className="cloze-empty">
        <div className="cloze-empty-emoji">📝</div>
        <p><b>Chưa có từ nào luyện Điền từ được.</b></p>
        <p>Dạng này cần câu ví dụ có chứa từ đó. Thêm câu ví dụ trong sổ, hoặc luyện dạng khác:</p>
        <div className="cloze-empty-btns">
          <button className="btn btn-primary btn-sm" onClick={() => onSwitch('translate')}><i className="fas fa-language" /> Luyện Dịch</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onSwitch('mixed')}><i className="fas fa-random" /> Luyện Mixed</button>
        </div>
      </div>
    </div>
  );
}

/* ── Results ── */
function Results({ s, hammer, backLabel, onRetryWrong, onRestart, onBack }) {
  const answered = s.correct + s.wrong;
  const pct = answered ? Math.round((s.correct / answered) * 100) : 0;
  const circ = 2 * Math.PI * 68;
  const [offset, setOffset] = useState(circ);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOffset(circ - (pct / 100) * circ));
    return () => cancelAnimationFrame(id);
  }, [circ, pct]);
  useEffect(() => {
    if (pct !== 100) return undefined;
    const t = setTimeout(() => spawnConfetti(100), 400);
    return () => clearTimeout(t);
  }, [pct]);
  const msg = scoreMessage(pct);
  const lulu = mascotHtml({ pct, text: msg.message, size: 80 });
  const wrongWords = s.words.filter(w => s.wrongSet.has(w._id));
  return (
    <div className="results-wrap">
      <div className="results-card">
        <h2>Kết quả</h2>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Mode: {MODE_NAMES[s.mode]}</div>
        <div className="score-ring-wrap">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle className="score-ring-track" cx="80" cy="80" r="68" fill="none" strokeWidth="10" />
            <circle cx="80" cy="80" r="68" fill="none" strokeWidth="10" strokeLinecap="round"
              stroke={pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#e53935'}
              strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)' }} />
          </svg>
          <div className="score-ring-text">
            <span className="score-pct">{pct}%</span>
            <span className="score-lbl">Độ chính xác</span>
          </div>
        </div>
        <div className="results-counts">
          <span className="res-correct">✓ Correct: <b>{s.correct}</b></span>
          <span className="res-wrong">✗ Wrong: <b>{s.wrong}</b></span>
        </div>
        {lulu
          ? <div style={{ margin: '6px 0' }} dangerouslySetInnerHTML={{ __html: lulu }} />
          : <div style={{ fontSize: 13, color: 'var(--text2)', margin: '6px 0' }}>{msg.emoji} {msg.message}</div>}
        {hammer && (
          <div className="hammer-earned-banner" style={{ display: 'block' }}>
            <img src="/img/buaDaniel.jpg" alt="Búa Daniel" className="hammer-earned-icon" /> 🎉 Bạn vừa nhận <b>1 búa Daniel</b>!
          </div>
        )}
        <img src={resultImage(pct)} alt="" style={{ width: '100%', maxWidth: 200, borderRadius: 12, margin: '12px auto 4px', objectFit: 'cover', display: 'block' }} />
        {wrongWords.length > 0 && (
          <>
            <div style={{ marginBottom: 10, textAlign: 'center' }}>
              <button className="btn btn-blue" onClick={onRetryWrong} style={{ width: '100%' }}>
                <i className="fas fa-redo-alt" /> Ôn lại {wrongWords.length} từ sai
              </button>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div className="wl-title">Từ cần ôn lại ({wrongWords.length}):</div>
              {wrongWords.map(w => (
                <div className="wl-item" key={w._id}>
                  <span className="wl-word">{w.word}</span>
                  {w.meaning && <span className="wl-meaning">{w.meaning}</span>}
                </div>
              ))}
            </div>
          </>
        )}
        <div className="results-btns">
          <button className="btn btn-ghost" onClick={onBack}><i className="fas fa-book" /> {backLabel}</button>
          <button className="btn btn-primary" onClick={onRestart}><i className="fas fa-redo" /> Luyện lại</button>
        </div>
      </div>
    </div>
  );
}

/* ── Session ── */
function newSession(mode, words, { smart: useSmart, pool, streakUnit }) {
  const usable = words.filter(w => w.word && w.meaning);
  const smart = useSmart ? buildSmartSession(usable) : null;
  let list = smart ? [...smart.list] : shuffle([...usable]);
  const before = new Set(list).size;
  if (mode === 'cloze') list = list.filter(w => clozeFor(w));
  const clozeSkipped = before - new Set(list).size;
  const types = mode === 'mixed' ? assignMixedTypes(list) : list.map(() => mode);
  prefetchAudio(list.map(w => w.word));
  return {
    mode,
    words: usable,
    smart,
    pool,
    clozeSkipped,
    queue: list.map((word, i) => makeItem(word, types[i], pool)),
    index: 0,
    correct: 0,
    wrong: 0,
    wrongSet: new Set(),
    requeued: new Map(),
    para: new Map(), // paraphrase pairs answered: sig → { item, correct }
    answered: false,
    lastResult: null,
    done: false,
    streak: startStreakSession(streakUnit),
  };
}

// Goals whose "reached" popup already showed in this tab (dashboard.js _goalDoneToasted)
const goalReachedShown = new Set();

function GoalReachedModal({ g, p, onContinue, onStop }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box modal-sm" role="dialog" aria-modal="true" style={{ overflow: 'hidden', padding: 0 }}>
        <div className="quit-mascot-wrap">
          <div className="quit-mascot">🎉</div>
          <p className="quit-title">Bạn đã học đạt số từ yêu cầu trong ngày hôm nay!</p>
          <p className="quit-sub">
            Chỉ tiêu: học <b>{g.target} từ</b> trong {g.requiredSlot ? `Sổ ${g.requiredSlot}` : 'sổ này'} — bạn đã luyện{' '}
            <b>{Math.min(p.practiced, g.target)}/{g.target}</b> từ, đúng <b>{p.correct}</b> (cần ≥{g.needCorrect}).
            <br />Bạn muốn tiếp tục học hay dừng lại?
          </p>
        </div>
        <div className="quit-actions">
          <button className="quit-btn-continue" onClick={onContinue} autoFocus><i className="fas fa-play-circle" /> Tiếp tục học</button>
          <button className="quit-btn-leave" onClick={onStop}>Dừng lại</button>
        </div>
      </div>
    </div>
  );
}

// Must mirror paraphraseSrsService.normalisePart on the server
const paraNorm = (x) => String(x || '').trim().replace(/\s+/g, ' ').toLowerCase();

function syncParaphrase(s, unitId) {
  for (const { item, correct } of s.para.values()) {
    const id = item._paraUnitId || unitId;
    if (!id) continue;
    apiFetch('/vocab/paraphrase/review', {
      method: 'POST',
      body: JSON.stringify({
        unitId: id, word: item.word, paraphrase: item.paraphrase || '', meaning: item.meaning || '',
        explanation: item.explanation || '', rating: correct ? 'da-thuoc' : 'chua-thuoc',
      }),
    }).catch(() => {});
  }
}

function QuitModal({ s, onStay, onLeave }) {
  const remaining = Math.max(0, s.queue.length - s.index);
  const wrong = s.wrongSet.size;
  const parts = [];
  if (remaining > 0) parts.push(`còn ${remaining} từ`);
  if (wrong > 0) parts.push(`${wrong} từ đang ôn lại`);
  return (
    <div className="modal-overlay">
      <div className="modal-box modal-sm" role="dialog" aria-modal="true" style={{ overflow: 'hidden', padding: 0 }}>
        <div className="quit-mascot-wrap">
          <div className="quit-mascot">{wrong > 0 ? '🥺' : '🐼'}</div>
          <p className="quit-title">{wrong > 0 ? 'Bạn vẫn còn từ cần ôn!' : 'Bạn có muốn học tiếp không?'}</p>
          <p className="quit-sub">{parts.join(' · ')}</p>
        </div>
        <div className="quit-actions">
          <button className="quit-btn-continue" onClick={onStay} autoFocus><i className="fas fa-play-circle" /> Học tiếp</button>
          <button className="quit-btn-leave" onClick={onLeave}>Thoát</button>
        </div>
      </div>
    </div>
  );
}

function KbdHints({ mode }) {
  const hints = mode === 'flashcard' ? [['Space', 'Lật thẻ'], ['Enter', 'Câu tiếp']]
    : mode === 'quiz' ? [['1 – 4', 'Chọn đáp án'], ['Enter / →', 'Câu tiếp']]
      : mode === 'mixed' ? [['1 – 4', 'Chọn đáp án (câu Quiz)'], ['Enter / →', 'Câu tiếp']]
        : [['Enter / →', 'Câu tiếp']];
  return (
    <div id="kbd-hint-panel" style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 50, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', boxShadow: 'var(--shadow-md)', minWidth: 150, pointerEvents: 'none' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>⌨️ Shortcuts</div>
      {[...hints, ['Esc', 'Dừng học']].map(([k, label]) => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, justifyContent: 'space-between' }}>
          <kbd style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 5, padding: '2px 7px', fontSize: 11, fontFamily: 'inherit' }}>{k}</kbd>
          <span style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'right' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function SaveState() {
  const [st, setSt] = useState(getSaveState);
  useEffect(() => onSaveState(setSt), []);
  const m = {
    pending: ['', <><i className="fas fa-circle-notch fa-spin" /> Đang lưu…</>],
    saving: ['', <><i className="fas fa-circle-notch fa-spin" /> Đang lưu…</>],
    saved: ['', <><i className="fas fa-cloud-arrow-up" /> Đã lưu từng câu lên hệ thống</>],
    retry: ['is-retry', <><i className="fas fa-triangle-exclamation" /> Chưa lưu được (mạng yếu?) — đang tự thử lại</>],
  }[st];
  if (!m) return null;
  return <span className={`practice-save-state ${m[0]}`}>{m[1]}</span>;
}

export default function Practice() {
  const { bookId, unitNumber } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { book: cached, loadBook, bookError, vocabGoals, refreshHomeworkSoon } = useOutletContext();
  const book = bookId && cached?._id === bookId ? cached : null;
  const goals = goalsForBook(vocabGoals, book);
  const [reached, setReached] = useState(null); // { g, p } — homework quota just reached
  const reachedOpen = useRef(false);

  // Cross-book sessions (/dashboard/practice?src=weak|due|difficult)
  const src = !bookId && !unitNumber && CROSS_SOURCES[params.get('src')] ? params.get('src') : null;
  const [srcList, setSrcList] = useState(null); // { src, words } | { src, error }
  const [srcReload, setSrcReload] = useState(0);
  const srcData = srcList?.src === src ? srcList : null;
  useEffect(() => {
    if (!src) return undefined;
    let alive = true;
    CROSS_SOURCES[src].load()
      .then(words => { if (alive) setSrcList({ src, words }); })
      .catch(error => { if (alive) setSrcList({ src, error }); });
    return () => { alive = false; };
  }, [src, srcReload]);

  // Paraphrase Unit (/dashboard/unit/:n) — premium-gated like the API
  const [unitData, setUnitData] = useState(null); // { n, unit } | { n, error }
  const [unitReload, setUnitReload] = useState(0);
  const unitAllowed = !unitNumber || hasPremiumAccess();
  const current = unitNumber && unitData?.n === unitNumber ? unitData : null;
  const unit = current?.unit || null;
  const unitError = current?.error || null;
  useEffect(() => {
    if (!unitNumber || !unitAllowed) return undefined;
    let alive = true;
    apiFetch(`/vocab/unit/${encodeURIComponent(unitNumber)}`)
      .then((d) => {
        if (!alive) return;
        if (!d.words) { setUnitData({ n: unitNumber, error: new Error('Không tải được Unit') }); return; }
        // paraphrase items have no _id of their own
        setUnitData({ n: unitNumber, unit: { ...d, words: d.words.map((w, i) => ({ ...w, _id: w._id || `u:${i}` })) } });
        try { localStorage.setItem('ews_pb_last_unit', String(d.unitNumber ?? unitNumber)); } catch { /* private mode */ }
      })
      .catch((error) => { if (alive) setUnitData({ n: unitNumber, error }); });
    return () => { alive = false; };
  }, [unitNumber, unitAllowed, unitReload]);

  const words0 = book ? book.words || [] : unit ? unit.words : srcData?.words || null;
  const from = params.get('from');
  const listBack = from === 'paraphrase' ? '/dashboard/paraphrase' : from === 'topics' ? '/dashboard/topics' : '/dashboard';
  const backTo = bookId ? `/dashboard/book/${bookId}` : listBack;

  useEffect(() => {
    if (unitAllowed) return;
    openUpgrade();
    navigate(listBack, { replace: true });
  }, [unitAllowed, listBack, navigate]);

  const rawMode = LEGACY_MODES[params.get('mode')] || params.get('mode');
  const studying = !!unitNumber && (rawMode === 'study' || !MODE_KEYS.has(rawMode));
  const mode = studying ? 'study' : MODE_KEYS.has(rawMode) ? rawMode : 'mixed';
  const set = params.get('set'); // 'hard' | null
  const [session, setS] = useState(null);
  const s = studying ? null : session; // the Study tab has no session
  const [startKey, setStartKey] = useState(0); // bump = restart
  const retryWords = useRef(null);
  const practiceAll = useRef(false);
  const sRef = useRef(null); // live session for the event handlers (see answer())
  const [hammerFor, setHammerFor] = useState(null); // streak session that earned a Búa Daniel
  const [quit, setQuit] = useState(null); // { go } while the "học tiếp?" popup is open
  const [confirmSwitch, setConfirmSwitch] = useState(null); // mode tab pressed mid-session

  useEffect(() => { if (bookId && !book) loadBook(bookId); }, [book, bookId, loadBook]);

  // (Re)start whenever the word source, mode, set or startKey changes
  const sourceKey = book ? book._id : unit ? `unit:${unit._id || unitNumber}` : srcData?.words ? `src:${src}` : null;
  useEffect(() => {
    if (!words0) return;
    if (studying) { sRef.current = null; return; }
    let words = words0;
    const isRetry = !!retryWords.current;
    if (isRetry) words = retryWords.current;
    else if (set === 'hard') {
      words = words.filter(w => (w.wrongCount || 0) >= 3).sort((a, b) => (b.wrongCount || 0) - (a.wrongCount || 0));
    }
    retryWords.current = null;
    // smart session (due words first, mastered ones hidden) only for a whole book
    const useSmart = !!book && !isRetry && set !== 'hard' && !practiceAll.current;
    practiceAll.current = false;
    // Búa Daniel counts per Paraphrase Unit
    const streakUnit = unit?._id && unit.words.some(w => w.type === 'paraphrase') ? { unitId: unit._id, unitType: 'paraphrase' } : null;
    const next = newSession(mode, words, { smart: useSmart, pool: words0, streakUnit });
    if (!next.queue.length && mode === 'cloze' && next.words.length) {
      // nothing has an example sentence containing the word → empty state
      sRef.current = null;
      setS({ ...next, clozeEmpty: true });
      return () => endStreakSession(next.streak);
    }
    if (next.clozeSkipped) {
      toast(`Bỏ qua ${next.clozeSkipped} từ chưa có câu ví dụ chứa từ đó — luyện các từ này ở Dịch hoặc Mixed nhé`, 'info');
    }
    if (!next.queue.length) {
      toast(src ? CROSS_SOURCES[src].empty
        : unit ? 'Unit này chưa có từ nào để luyện'
          : set === 'hard' ? 'Chưa có từ nào sai từ 3 lần trở lên.' : 'Sổ này chưa có từ (có nghĩa) để luyện', src ? 'success' : 'info');
      if (unit) {
        const p = new URLSearchParams(params);
        p.set('mode', 'study');
        setParams(p, { replace: true });
        return;
      }
      navigate(backTo, { replace: true });
      return;
    }
    sRef.current = next;
    setS(next);
    // leaving / restarting: send what is still queued + the streak leftover
    return () => { flushEvidence(); endStreakSession(next.streak); };
  }, [sourceKey, mode, set, startKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const item = s && !s.done ? s.queue[s.index] : null;

  // nav.js holds its full-screen notices while questions are on screen
  const running = !!item;
  useEffect(() => { setActivePractice(running); return () => setActivePractice(false); }, [running]);
  // Lookups stay off while a question is on screen (they would give it away)
  const runningRef = useRef(false);
  useEffect(() => { runningRef.current = running; }, [running]);
  const hasBody = !!words0;
  useEffect(() => { if (hasBody) bindDict('practice-area', 'vocab-quiz', () => !runningRef.current); }, [hasBody, studying]);
  // Búa Daniel: announced now and again on the results screen
  useEffect(() => onStreakResult((d) => {
    if (!d.hammerEarned) return;
    toast('🔨 Bạn vừa nhận 1 búa Daniel vì học Paraphrase Unit xuất sắc (>=90%)!', 'success');
    setHammerFor(sRef.current?.streak || null);
  }), [toast]);

  // Side effects (sounds, saving, streak) must run once per answer, so the
  // handlers read the live session from a ref instead of inside a setState
  // updater (StrictMode runs updaters twice).
  const commit = useCallback((nextS) => { sRef.current = nextS; setS(nextS); }, []);

  const answer = useCallback((correct) => {
    const prev = sRef.current;
    if (!prev || prev.answered || prev.done) return;
    const it = prev.queue[prev.index];
    const w = it.word;
    const wrongSet = new Set(prev.wrongSet);
    let queue = prev.queue;
    const requeued = new Map(prev.requeued);
    if (!correct) {
      wrongSet.add(w._id);
      // comes back ~4 questions later (max 2 times), in mixed as another type
      const n = requeued.get(w._id) || 0;
      if (n < 2) {
        requeued.set(w._id, n + 1);
        const type = prev.mode === 'mixed'
          ? (() => {
            const types = MIXED_TYPES.filter(t => t !== it.type && typeFits(t, w));
            return types[Math.floor(Math.random() * types.length)] || 'quiz';
          })()
          : it.type;
        queue = [...queue];
        queue.splice(Math.min(prev.index + 4, queue.length), 0, makeItem(w, type, prev.pool, true));
      }
    }
    playSound(correct ? 'correct' : 'wrong');
    // "wrong at any point this session" = wrong (same rule as the server)
    // cross-book words carry their own book (_reviewBookId); "Từ hay sai"
    // items aren't notebook words, so they have none and aren't saved
    const wordBook = w._reviewBookId || bookId;
    queueAnswer({ bookId: wordBook, word: w, correct: !wrongSet.has(w._id), sid: prev.streak.sid });
    countStreakAnswer(prev.streak, correct);
    // homework "học N từ" bar — same right/wrong rule as the server
    if (wordBook) noteGoalAnswer(w._id, !wrongSet.has(w._id));
    if (w.type === 'paraphrase' && w.paraphrase) {
      const sig = `${paraNorm(w.word)} ∴ ${paraNorm(w.paraphrase)}`;
      const had = prev.para.get(sig);
      prev.para.set(sig, { item: w, correct: had ? had.correct && correct : correct });
    }
    for (const g of goals) {
      if (g.completed || goalReachedShown.has(g.key)) continue;
      const p = goalProgress(g, book?.words);
      if (!p.done) continue;
      goalReachedShown.add(g.key);
      flushEvidence(); // the ✔ lands now, whichever button they pick
      reachedOpen.current = true;
      setReached({ g, p });
      break;
    }
    commit({
      ...prev, queue, wrongSet, requeued, answered: true, lastResult: correct,
      correct: prev.correct + (correct ? 1 : 0), wrong: prev.wrong + (correct ? 0 : 1),
    });
  }, [bookId, commit, goals, book?.words]);

  const finish = useCallback((cur) => {
    endStreakSession(cur.streak);
    flushEvidence().then(() => refreshHomeworkSoon(true));
    reportLearningResult({ correct: cur.correct, answered: cur.correct + cur.wrong, wrong: cur.wrongSet.size });
    syncParaphrase(cur, unit?._id);
    const wrong = cur.words.filter(w => cur.wrongSet.has(w._id));
    if (wrong.length) {
      apiFetch('/difficult-words/report', {
        method: 'POST',
        body: JSON.stringify({
          words: wrong.map(w => ({ word: w.word, meaning: w.meaning || '', phonetic: w.phonetic || '', partOfSpeech: w.partOfSpeech || '', example: w.example || '' })),
          source: book?.name || (unit && `Unit ${unit.unitNumber}`) || (src && CROSS_SOURCES[src].source) || 'Sổ cá nhân',
        }),
      }).catch(() => {});
    }
  }, [book?.name, src, unit, refreshHomeworkSoon]);

  const next = useCallback(() => {
    const prev = sRef.current;
    // flashcard auto-advance / Enter must not move on behind the "reached" popup
    if (!prev || !prev.answered || prev.done || reachedOpen.current) return;
    const index = prev.index + 1;
    if (index >= prev.queue.length) { finish(prev); commit({ ...prev, done: true }); return; }
    commit({ ...prev, index, answered: false, lastResult: null });
  }, [finish, commit]);

  const stopNow = () => {
    const prev = sRef.current;
    if (!prev || prev.done) return;
    finish(prev);
    commit({ ...prev, done: true });
  };
  const stop = () => askQuit(stopNow);

  // Some answer given and the session not finished → leaving needs a word
  const inSession = !!s && !s.done && !s.clozeEmpty && s.correct + s.wrong > 0;
  const askQuit = useCallback((go) => {
    const cur = sRef.current;
    if (cur && !cur.done && cur.correct + cur.wrong > 0) setQuit({ go });
    else go();
  }, []);

  // Enter / Space / → = next once answered; Esc = stop (with the same question)
  const showNext = !!s?.answered && !s.done;
  useEffect(() => {
    if (!s || s.done || s.clozeEmpty) return undefined;
    const onKey = (e) => {
      if (e.target.closest?.('input,textarea,select') || document.querySelector('.modal-overlay:not(.hidden)')) return;
      if (e.key === 'Escape') { askQuit(stopNow); return; }
      if (showNext && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')) { e.preventDefault(); next(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const applyMode = (m) => {
    const p = new URLSearchParams(params);
    p.set('mode', m);
    setParams(p, { replace: true });
  };
  const switchToStudy = () => applyMode('study');
  const switchMode = (m) => {
    if (inSession) { setConfirmSwitch(m); return; }
    if (m === mode) { if (m !== 'study') restart(); return; }
    applyMode(m);
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) { document.exitFullscreen?.(); return; }
    document.getElementById('view-unit')?.requestFullscreen?.();
  };
  const restart = () => setStartKey(k => k + 1);
  const retryWrong = () => {
    retryWords.current = s.words.filter(w => s.wrongSet.has(w._id));
    restart();
  };
  const playAll = () => { practiceAll.current = true; restart(); };
  const back = () => askQuit(() => navigate(backTo));

  if (!unitAllowed) return null;
  if (!bookId && !src && !unitNumber) return <div className="book-view-error"><p>Không rõ bộ từ cần luyện.</p></div>;
  if (!words0) {
    const err = bookId ? bookError : unitNumber ? unitError : srcData?.error;
    const locked = err?.body?.requiresPremium;
    return (
      <div className="book-view-error">
        {locked ? <>
          <h3>Tính năng cần gói Premium</h3>
          <button className="btn btn-primary" onClick={() => openUpgrade()}>Xem gói Premium</button>
        </> : err ? <>
          <p>{err.message}</p>
          <button className="btn btn-primary" onClick={() => {
            if (bookId) loadBook(bookId);
            else if (unitNumber) { setUnitData(null); setUnitReload(k => k + 1); }
            else { setSrcList(null); setSrcReload(k => k + 1); }
          }}>Thử lại</button>
        </> : 'Đang tải…'}
      </div>
    );
  }

  const title = unit ? `Unit ${unit.unitNumber}: ${unit.title || ''}`
    : src ? `${CROSS_SOURCES[src].title} – ${s?.words.length ?? 0} ${CROSS_SOURCES[src].unit || 'từ'}`
    : set === 'hard' ? `🔥 Ôn lại từ hay sai – ${s?.words.length ?? 0} từ` : `📘 ${book.name}`;
  const total = s?.queue.length || 0;
  const smart = s?.smart;
  const showSmartBar = smart && (smart.masteredHidden > 0 || smart.weakCount || smart.allMastered);

  return (
    <div id="view-unit" className="practice-shell" style={{ display: 'flex' }}>
      <div className="unit-header-bar">
        <button className="btn btn-ghost btn-sm" onClick={back}>← Back</button>
        <h3>{title}</h3>
        <SaveState />
        <button className="btn btn-ghost btn-sm" onClick={toggleFullscreen} title="Toàn màn hình"><i className="fas fa-expand" /></button>
      </div>
      <div className="mode-tabs-wrap">
        <div className="mode-tabs">
          {(unitNumber ? [STUDY_TAB, ...MODES] : MODES).map(m => (
            <button key={m.key} className={`tab-btn${m.key === mode ? ' active' : ''}`} onClick={() => switchMode(m.key)} title={m.title}>
              <i className={`fas ${m.icon}`} /> {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mode-body" id="practice-area">
        <VocabGoalCards goals={goals} words={words0} inSession />
        {studying && unit && <UnitStudy unit={unit} />}
        {quit && s && (
          <QuitModal s={s} onStay={() => setQuit(null)} onLeave={() => { const { go } = quit; setQuit(null); go(); }} />
        )}
        {confirmSwitch && (
          <ConfirmDialog
            title={confirmSwitch === mode ? 'Làm lại từ đầu?' : 'Đổi chế độ học?'}
            message={confirmSwitch === mode ? 'Thao tác này sẽ xoá tiến độ hiện tại. Làm lại?' : 'Tiến độ hiện tại sẽ bị mất. Bạn có muốn đổi không?'}
            confirmLabel={confirmSwitch === mode ? 'Restart' : 'Switch'} confirmClass="btn-primary"
            onClose={() => setConfirmSwitch(null)}
            onConfirm={() => { const m = confirmSwitch; if (m === mode) restart(); else applyMode(m); }} />
        )}
        {running && window.innerWidth > 1024 && <KbdHints mode={mode} />}
        {reached && (
          <GoalReachedModal
            g={reached.g}
            p={reached.p}
            onContinue={() => {
              reachedOpen.current = false;
              setReached(null);
              // a right flashcard would have auto-advanced — do it now
              const cur = sRef.current;
              if (cur?.answered && cur.lastResult && cur.queue[cur.index]?.type === 'flashcard') next();
            }}
            onStop={() => {
              reachedOpen.current = false;
              setReached(null);
              const cur = sRef.current;
              if (cur && !cur.done) finish(cur); // answers so far count for the homework
              navigate(backTo);
            }}
          />
        )}
        {showSmartBar && !s.done && !s.clozeEmpty && (
          <div className="smart-session-bar" style={{ display: 'flex' }}>
            <span>
              {smart.allMastered
                ? <>🎉 Tất cả từ đều đã thuộc và chưa tới hạn ôn — ôn nhanh <b>{smart.list.length}</b> từ lâu chưa gặp nhất</>
                : <>🧠 Phiên thông minh: <b>{smart.dueCount}</b> từ cần học</>}
              {smart.weakCount > 0 && <> · <b>{smart.weakCount}</b> từ hay sai được lặp lại</>}
              {smart.masteredSample > 0 && <> · <b>{smart.masteredSample}</b> từ đã thuộc (ôn nhẹ)</>}
              {smart.masteredHidden > 0 && !smart.allMastered && <> · <b>{smart.masteredHidden}</b> từ đã thuộc tạm ẩn tới hạn ôn</>}
            </span>
            <button type="button" className="ssb-all" onClick={playAll}>Luyện tất cả {s.words.length} từ</button>
          </div>
        )}

        {s?.clozeEmpty && <ClozeEmpty onSwitch={switchMode} />}
        {s?.done && (
          <Results s={s} hammer={!!hammerFor && hammerFor === s.streak} backLabel={unit ? 'View words' : src ? 'Về trang chính' : 'Về sổ từ'}
            onRetryWrong={retryWrong} onRestart={restart} onBack={unit ? switchToStudy : back} />
        )}

        {item && (
          <div className="practice-container">
            <div className="practice-header">
              <h3><i className={`fas ${MODES.find(m => m.key === (mode === 'mixed' ? item.type : mode)).icon}`} /> {MODE_NAMES[mode]}</h3>
            </div>
            <div className="practice-progress vp-progress">
              <div className="vp-progress-track">
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(s.index / total) * 100}%` }} /></div>
                <div className="progress-text">{s.index}/{total}</div>
              </div>
              <button className="vp-stop-btn" onClick={stop} title="Dừng và xem kết quả"><i className="fas fa-stop-circle" /> Dừng lại</button>
            </div>
            <div className="question-card" key={s.index}>
              <div className="question-number">Câu {s.index + 1}/{total}{item.repeat ? ' · ôn lại' : ''}</div>
              {item.type === 'quiz' && <QuizQuestion item={item} answered={s.answered} onAnswer={answer} />}
              {item.type === 'flashcard' && <FlashcardQuestion item={item} answered={s.answered} onAnswer={answer} onNext={next} />}
              {item.type === 'cloze' && (
                <ClozeQuestion item={item} answered={s.answered} result={s.lastResult} onAnswer={answer} />
              )}
              {(item.type === 'listen' || item.type === 'translate') && (
                <TypedQuestion item={item} answered={s.answered} result={s.lastResult} onAnswer={answer} />
              )}
              {s.answered && !(item.type === 'flashcard' && s.lastResult) && (
                <button className="btn-next" style={{ display: 'flex' }} onClick={next}>Tiếp <i className="fas fa-arrow-right" /></button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
