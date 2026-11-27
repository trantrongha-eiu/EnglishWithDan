import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { hasPremiumAccess } from '../utils/plan';
import SearchMatch from '../utils/searchMatch';
import { bindDict, luluSay, openUpgrade, siteToast } from '../utils/shell';
import { PASS_RATIO, fmtTime, diffSentence } from '../utils/dictation';
import { LULU_MAX, MISTAKE_TYPES, analyzeMistakes, linkingGuide, luluDrillMask, luluHintWord, tallyMistakes } from '../utils/dictationInsights';
import Modal from '../components/Modal';

// Homework counts a dictation once this share of its sentences were typed
// right (resourceCompletionService PRACTICE_PASS_PERCENT).
const HOMEWORK_PCT = 50;
const CAPS_TIP = 'Mẹo thi thật: bật Caps Lock suốt bài Listening — viết IN HOA toàn bộ thì tên riêng không bao giờ bị sai vì viết thường.';

// ⌨️ Luyện Dictation — /app/dictation, ?sectionId= (a Listening section, one
// audio file) or ?drill= (spelling / numbers clips from many files). The
// Shadowing page's spelling videos are listed here too and open over there.
// The student works every sentence out alone: the answer — and whatever
// gives it away (right words beside wrong ones, the transcript) — shows only
// once the sentence is typed right. "Hỏi Lulu" gives the Vietnamese meaning
// or a few words (3 asks); "Bỏ qua" moves on.

const PREFS_KEY = 'dictation-prefs-v2';
const SPEEDS = [0.75, 1, 1.25, 1.5];
const CHIPS = [
  ['', 'Tất cả'], ['1', 'Part 1'], ['2', 'Part 2'], ['3', 'Part 3'], ['4', 'Part 4'],
  ['drill-spelling', '🔤 Đánh vần tên'], ['drill-numbers', '🔢 Số dài & mã số'], ['spell', '🎬 Video đánh vần & số'],
];
const TIPS = [
  'Luyện ít nhất 30 phút mỗi ngày để tiến bộ nhanh hơn!',
  'Nghe lại một câu nhiều lần — phím Ctrl để nghe lại nhanh. Bí quá thì bấm "Hỏi Lulu" lấy gợi ý.',
  'Đánh vần: "double L" = LL, "triple 5" = 555, "oh" = số 0.',
  'Tên riêng phải viết hoa chữ cái đầu — bật Caps Lock suốt bài thi Listening (viết IN HOA hết) là không bao giờ sai.',
  'Số điện thoại: viết theo nhóm 3–4 số trong lúc nghe để không bị sót.',
  'Bẫy "13 hay 30": -teen nhấn âm cuối và kéo dài, -ty nhấn âm đầu.',
  'Chép xong câu khó, đọc to lại một lần theo băng để nhớ cách nối âm.',
  'Gặp từ mới, nháy đúp vào từ trong đáp án để tra nghĩa và lưu vào sổ từ.',
];
const LOADING_LESSON = { kind: 'loading', title: 'Đang tải...', sub: '', sentences: [], transcript: '' };
const NO_SET = new Set();

function loadPrefs() {
  let p;
  try { p = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') || {}; } catch { p = {}; }
  return {
    autoplay: typeof p.autoplay === 'boolean' ? p.autoplay : true,
    autonext: typeof p.autonext === 'boolean' ? p.autonext : true,
    loop: typeof p.loop === 'boolean' ? p.loop : false,
    speed: SPEEDS.includes(p.speed) ? p.speed : 1,
  };
}

function shake(el) {
  if (!el) return;
  el.classList.remove('dict-shake');
  void el.offsetWidth;
  el.classList.add('dict-shake');
  setTimeout(() => el.classList.remove('dict-shake'), 450);
}

const PASS_PCT = Math.round(PASS_RATIO * 100);

// The check, word by word: right words green, a wrong word underlined, a
// missing word as a gap, an extra one struck out. The right words of the
// mistakes show only once the sentence is passed (showAnswer).
function DiffLine({ r, showAnswer, stale }) {
  return (
    <div className={`dx-diff${stale ? ' stale' : ''}`} id="dict-diff">
      {r.tokens.map((t, i) => {
        let body;
        if (t.kind === 'ok') body = <span className="dx-ok">{t.word}</span>;
        // the letters are right, only the capital is missing: always shown
        else if (t.kind === 'case') body = <><span className="dx-bad case" title="Tên riêng phải viết hoa chữ cái đầu">{t.typed}</span><span className="dx-fix">→ {t.word}</span></>;
        else if (t.kind === 'typo' || t.kind === 'wrong') {
          body = <><span className={`dx-bad ${t.kind}`}>{t.typed}</span>{showAnswer && <span className="dx-fix">→ {t.word}</span>}</>;
        } else if (t.kind === 'miss') body = <span className="dx-miss">{showAnswer ? t.word : '＿＿'}</span>;
        else body = <span className="dx-extra" title="Từ thừa">{t.typed}</span>;
        return <Fragment key={i}>{i > 0 && ' '}{body}</Fragment>;
      })}
    </div>
  );
}

function ScoreLine({ r }) {
  const pct = Math.round(r.ratio * 100);
  return (
    <div className="dx-score" id="dict-score">
      <span>Đúng <b>{r.ok}/{r.total}</b> từ ({pct}%)</span>
      {!!r.typos && <span className="dx-legend typo"><u>abc</u> {r.typos} từ sai chữ</span>}
      {!!r.wrong && <span className="dx-legend wrong"><u>abc</u> {r.wrong} từ sai</span>}
      {!!r.missing && <span className="dx-legend miss"><i>＿</i> {r.missing} từ thiếu</span>}
      {!!r.extra && <span className="dx-legend extra"><s>abc</s> {r.extra} từ thừa</span>}
      {!!r.caseErrors?.length && <span className="dx-legend case"><u>abc</u> {r.caseErrors.length} từ chưa viết hoa</span>}
    </div>
  );
}

// 🔍 After a check: what kind of mistake each wrong word was. The right
// word is named only when it may be seen (answer shown / "Hiện từ đúng").
function MistakeList({ mistakes, showWord }) {
  if (!mistakes.length) return null;
  return (
    <div className="dx-insight dx-mistakes" id="dict-mistakes">
      <div className="dx-insight-head"><i className="fas fa-magnifying-glass" /> Phân tích lỗi</div>
      <ul>
        {mistakes.map((m, i) => {
          const t = MISTAKE_TYPES[m.type] || MISTAKE_TYPES.wrong_word;
          const pair = m.typed && m.word
            ? <><s>{m.typed}</s>{showWord && <> → <b>{m.word}</b></>}</>
            : m.word ? (showWord ? <b>{m.word}</b> : <i>(một từ)</i>) : <s>{m.typed}</s>;
          return (
            <li key={i} data-type={m.type}>
              <span className="dx-mtag">{t.icon} {t.label}</span> <span className="dx-mpair">{pair}</span>
              {/* a note may name the right word: hidden until it may be seen
                  (a sound note names only the sound, a case note only the capital) */}
              <div className="dx-mnote">{showWord || m.type === 'case' || m.type === 'sound' ? m.note || t.tip : t.tip}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// 🔗 How the sentence links when it's spoken
function LinkingCard({ text }) {
  const g = useMemo(() => linkingGuide(text), [text]);
  if (!g.notes.length && !g.weak.length) return null;
  return (
    <div className="dx-insight dx-linking" id="dict-linking">
      <div className="dx-insight-head"><i className="fas fa-link" /> Cách nối âm câu này</div>
      <div className="dx-link-line">
        {g.words.map((w, i) => (
          <Fragment key={i}>
            <span className="dx-link-word">{w.text}</span>
            {w.link ? <span className={`dx-link-mark k-${w.link}`} title="nối âm">‿</span> : i < g.words.length - 1 && ' '}
          </Fragment>
        ))}
      </div>
      {!!g.notes.length && (
        <ul className="dx-link-notes">
          {g.notes.map((n, i) => <li key={i}><b>{n.pair}</b> → đọc như <span className="dx-say">“{n.say}”</span>: {n.why}</li>)}
        </ul>
      )}
      {!!g.weak.length && (
        <div className="dx-weak">Đọc nhẹ (dạng yếu): {g.weak.map((w) => <span key={w.word} className="dx-weak-chip">{w.word} <i>{w.ipa}</i></span>)}</div>
      )}
    </div>
  );
}

// 🎯 This session's mistakes, most frequent first
function MistakeTally({ tally, title }) {
  if (!tally.length) return null;
  return (
    <div className="dx-tally">
      <span className="dx-tally-title">{title}</span>
      {tally.slice(0, 5).map(({ type, count }) => {
        const t = MISTAKE_TYPES[type] || MISTAKE_TYPES.wrong_word;
        return <span key={type} className="dx-tally-chip" title={t.tip}>{t.icon} {t.label} <b>×{count}</b></span>;
      })}
    </div>
  );
}

function Meaning({ index, translations, done }) {
  if (!translations) return <div className="dict-vi" id="dict-vi">{done && <><i className="fas fa-spinner fa-spin" /> Đang tải nghĩa...</>}</div>;
  const vi = translations[index] || '';
  return <div className="dict-vi" id="dict-vi" style={vi ? undefined : { display: 'none' }}>{vi && <><b>Nghĩa:</b> {vi}</>}</div>;
}

// 🚩 "Báo lỗi câu này": the student picks a reason (set on admin
// /dictation-reports → Cấu hình) and may describe it; the sentence itself
// is looked up on the server by lesson + index.
function ReportModal({ lesson, index, sentence, solved, typed, config, onClose, onSent }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const needNote = reason === 'other';

  async function send() {
    if (!reason) { siteToast('Chọn lý do báo lỗi nhé.', 'warn'); return; }
    if (needNote && !note.trim()) { siteToast('Ghi rõ lỗi ở ô mô tả giúp thầy cô nhé.', 'warn'); return; }
    setSending(true);
    try {
      const target = lesson.kind === 'drill' ? { drillSlug: lesson.slug } : { sectionId: lesson._id };
      const d = await apiFetch('/listening/dictation/report', {
        method: 'POST',
        body: JSON.stringify({ ...target, sentenceIndex: index, reason, note: note.trim(), typedText: typed.trim() }),
      });
      siteToast(d.message || 'Đã gửi báo lỗi — cảm ơn bạn!', 'success');
      onSent(index);
      onClose();
    } catch (e) {
      siteToast(e.message || 'Không gửi được báo lỗi, thử lại sau nhé.', 'error');
      setSending(false);
    }
  }

  return (
    <Modal title={`🚩 Báo lỗi câu ${index + 1}`} onClose={onClose}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose} disabled={sending}>Huỷ</button>
        <button className="btn btn-primary" id="dict-report-send" onClick={send} disabled={sending}>{sending ? 'Đang gửi…' : 'Gửi báo lỗi'}</button>
      </>}>
      <div className="dx-report">
        <p className="dx-report-intro">Câu này có gì sai? Thầy cô sẽ kiểm tra và sửa lại — cảm ơn bạn đã giúp bài luyện tốt hơn 💛</p>
        <div className="dx-report-reasons" role="radiogroup" aria-label="Lý do báo lỗi">
          {config.reasons.map((r) => (
            <label key={r.key} className={`dx-report-reason${reason === r.key ? ' on' : ''}`}>
              <input type="radio" name="dict-report-reason" value={r.key} checked={reason === r.key} onChange={() => setReason(r.key)} />
              {r.label}
            </label>
          ))}
        </div>
        <textarea className="dx-report-note" id="dict-report-note" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)}
          placeholder={needNote ? 'Mô tả lỗi (bắt buộc)…' : 'Mô tả thêm (không bắt buộc) — vd: audio nói "eleven" nhưng đáp án ghi "ten"'} />
        {/* never the answer of a sentence not typed right yet */}
        {lesson.kind === 'drill' && sentence?.answer && solved && <div className="dx-report-hint">Đáp án hiện tại: <b>{sentence.answer}</b></div>}
      </div>
    </Modal>
  );
}

function Practice({ lesson, onBack, reportConfig }) {
  const { sentences } = lesson;
  const total = sentences.length;
  const audioRef = useRef(null);
  const fullAudioRef = useRef(null);
  const inputRef = useRef(null);
  const screenRef = useRef(null);
  const [prefs, setPrefs] = useState(loadPrefs);
  // What the audio callbacks and timers need right now
  const live = useRef({ index: 0, prefs, answers: [], saved: false, autoNext: null, loopTimer: null, lastKey: 0, onClipEnd: null });

  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(NO_SET);
  // each sentence's mistakes at its FIRST check (later ones come after the
  // red marks and Lulu's hints) — the "hay nghe sai" tally
  const [firstMistakes, setFirstMistakes] = useState({});
  // 🍊 Hỏi Lulu per sentence: { n: asks used, vi: meaning given, words: [], step: drill letters shown }
  const [hints, setHints] = useState({});
  const [results, setResults] = useState({});
  const [typed, setTyped] = useState('');
  const [tab, setTab] = useState('dictation');
  const [playing, setPlaying] = useState(false);
  const [clock, setClock] = useState({ ratio: 0, now: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tip, setTip] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [translations, setTranslations] = useState(lesson.kind === 'section' ? null : []);
  const [reportFor, setReportFor] = useState(null); // sentence index whose 🚩 dialog is open
  const [reported, setReported] = useState(NO_SET);
  const canReport = !!reportConfig?.enabled && !!reportConfig.reasons?.length && lesson.kind !== 'loading';
  const openReport = (i) => {
    audioRef.current?.pause();
    setPlaying(false);
    setReportFor(i);
  };

  const sentence = sentences[index];
  const result = results[index];
  const isDrill = !!sentence?.answer;
  const passed = !!result?.passed;
  // typed right once: from then on the answer, meaning and linking show
  const revealed = done.has(index);
  const hint = hints[index] || { n: 0, vi: false, words: [], step: 0 };
  // typed something new since the last check: its marks are out of date
  const stale = !!result && typed.trim() !== result.typedText;

  // notify: the lesson was just finished — say what was saved and whether
  // it's enough for homework (leaving the page saves silently)
  const save = useCallback((notify) => {
    const l = live.current;
    if (l.saved || !l.answers.length) return;
    l.saved = true;
    const body = lesson.kind === 'drill'
      ? { drillSlug: lesson.slug, sectionTitle: lesson.title, answers: l.answers }
      : { sectionId: lesson._id, sectionTitle: lesson.title, partNumber: lesson.partNumber, answers: l.answers };
    // keepalive: it has to outlive the page when the tab closes
    apiFetch('/listening/dictation/save-attempt', { method: 'POST', keepalive: true, body: JSON.stringify(body) })
      .then((d) => {
        if (notify !== true || !d?.success) return;
        const pct = d.totalSentences ? Math.round((d.correctCount / d.totalSentences) * 100) : 0;
        siteToast(pct >= HOMEWORK_PCT
          ? `Đã lưu kết quả: ${d.correctCount}/${d.totalSentences} câu đúng (${pct}%) ✓`
          : `Đã lưu: ${d.correctCount}/${d.totalSentences} câu đúng (${pct}%) — bài tập cần ≥${HOMEWORK_PCT}% số câu làm đúng.`,
        pct >= HOMEWORK_PCT ? 'success' : 'warn');
      })
      .catch(() => {
        l.saved = false; // try again when leaving
        if (notify === true) siteToast('Chưa lưu được kết quả — kiểm tra mạng, kết quả sẽ được lưu lại khi bạn rời trang.', 'error');
      });
  }, [lesson]);

  const play = useCallback((silent) => {
    const audio = audioRef.current;
    audio.playbackRate = live.current.prefs.speed;
    audio.play().then(() => setPlaying(true)).catch(() => {
      setPlaying(false);
      if (!silent) siteToast('Không phát được audio — thử lại hoặc tải lại trang.', 'error');
    });
  }, []);

  // Seeking before metadata has loaded is ignored by some browsers
  const seekThen = useCallback((t, then) => {
    const audio = audioRef.current;
    if (audio.readyState >= 1) { audio.currentTime = t; then(); return; }
    audio.addEventListener('loadedmetadata', () => { audio.currentTime = t; then(); }, { once: true });
    audio.load();
  }, []);

  // silent = an automatic play (sentence change): an autoplay block is no error
  const restart = useCallback((silent) => {
    const s = sentences[live.current.index];
    if (s) seekThen(s.start, () => play(silent === true));
  }, [sentences, seekThen, play]);

  // The audio element, for as long as this lesson is open
  useEffect(() => {
    const audio = audioRef.current;
    const fullAudio = fullAudioRef.current;
    const l = live.current;
    if (!sentences.length) return undefined;
    audio.src = sentences[0].audioUrl;
    audio.playbackRate = l.prefs.speed;
    let frame = 0;
    const current = () => sentences[l.index];
    // atEnd: the clip played to its end (🔁 may replay it), not a pause
    const stop = (atEnd) => {
      const wasPlaying = !audio.paused;
      audio.pause();
      setPlaying(false);
      if (atEnd && wasPlaying) l.onClipEnd?.();
    };
    const onError = () => {
      setPlaying(false);
      siteToast('Lỗi tải audio của bài này — vui lòng liên hệ giáo viên.', 'error');
    };
    const onTime = () => {
      const s = current();
      const length = s.end - s.start || 1;
      setClock({ ratio: Math.min(1, Math.max(0, (audio.currentTime - s.start) / length)), now: Math.max(0, audio.currentTime - s.start) });
      if (audio.currentTime >= s.end) stop(true);
    };
    // timeupdate fires ~4×/s, too late to stop before the next word: while
    // playing, the clip end is watched every frame.
    const onPlay = () => {
      cancelAnimationFrame(frame);
      const tick = () => {
        if (audio.paused) return;
        if (audio.currentTime >= current().end) { stop(true); return; }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const onEnded = () => setPlaying(false);
    audio.addEventListener('error', onError);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('ended', onEnded);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(l.autoNext);
      clearTimeout(l.loopTimer);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      fullAudio?.pause();
    };
  }, [sentences]);

  // Results are saved on leaving, also when the tab closes or the phone
  // switches app (pagehide doesn't always fire on mobile)
  useEffect(() => {
    const quiet = () => save();
    const hidden = () => { if (document.visibilityState === 'hidden') save(); };
    window.addEventListener('pagehide', quiet);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('pagehide', quiet);
      document.removeEventListener('visibilitychange', hidden);
      save();
    };
  }, [save]);

  useEffect(() => {
    if (lesson.kind !== 'section') return undefined;
    let alive = true;
    apiFetch(`/listening/dictation/section/${lesson._id}/translations`)
      .then((d) => (d?.success && Array.isArray(d.translations) ? d.translations : []))
      .catch(() => [])
      .then((list) => { if (alive) setTranslations(list); });
    return () => { alive = false; };
  }, [lesson]);

  useEffect(() => {
    bindDict('screen-practice', 'dictation');
    if (total && window.matchMedia('(min-width: 800px)').matches) inputRef.current?.focus();
  }, [total]);

  // Ctrl pressed and released on its own = replay (Ctrl+C etc. still work)
  useEffect(() => {
    if (!total) return undefined;
    let alone = false;
    const down = (e) => { alone = e.key === 'Control' ? (!e.repeat || alone) : false; };
    const up = (e) => {
      // not while the 🚩 report dialog is open
      if (e.key === 'Control' && alone && !document.querySelector('.modal-overlay')) restart();
      alone = false;
    };
    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('keyup', up);
    };
  }, [total, restart]);

  useEffect(() => {
    if (!settingsOpen) return undefined;
    const close = (e) => { if (!e.target.closest('.dict-gear-wrap')) setSettingsOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [settingsOpen]);

  function changePrefs(patch) {
    const next = { ...live.current.prefs, ...patch };
    live.current.prefs = next;
    setPrefs(next);
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch { /* prefs just don't stick */ }
  }

  function goTo(i, { noAutoplay = false } = {}) {
    if (i < 0 || i >= total) return;
    const l = live.current;
    const audio = audioRef.current;
    clearTimeout(l.autoNext);
    clearTimeout(l.loopTimer);
    l.lastKey = 0; // 🔁 waits for the first key on the new sentence
    audio.pause();
    setPlaying(false);
    l.index = i;
    setIndex(i);
    // A drill's clips come from different files
    if (audio.getAttribute('src') !== sentences[i].audioUrl) {
      audio.src = sentences[i].audioUrl;
      audio.playbackRate = l.prefs.speed;
    }
    setTyped('');
    setClock({ ratio: 0, now: 0 });
    if (window.matchMedia('(min-width: 800px)').matches) inputRef.current?.focus();
    if (!noAutoplay && l.prefs.autoplay) restart(true);
  }

  function togglePlay() {
    if (!sentence) return;
    const audio = audioRef.current;
    clearTimeout(live.current.loopTimer);
    if (!audio.paused) { audio.pause(); setPlaying(false); return; }
    if (audio.readyState < 1 || audio.currentTime < sentence.start - 0.05 || audio.currentTime >= sentence.end) seekThen(sentence.start, () => play());
    else play();
  }

  function skip() {
    if (index < total - 1) goTo(index + 1);
    else if (total) siteToast('Đây là câu cuối rồi.', 'info');
  }

  function nextUndone(doneSet) {
    for (let k = 1; k <= total; k++) {
      const i = (index + k) % total;
      if (!doneSet.has(i)) return i;
    }
    return -1;
  }

  // A sentence's row in the saved attempt. Once right it stays right (a
  // later re-check with a slip doesn't take it back); the mistakes kept are
  // those of its first check.
  function record(isCorrect, matchedWords, totalWords, mistakes) {
    const l = live.current;
    const at = l.answers.findIndex((a) => a.sentenceIndex === index);
    const prev = at >= 0 ? l.answers[at] : null;
    const row = {
      sentenceIndex: index,
      isCorrect: isCorrect || !!prev?.isCorrect,
      matchedWords: Math.max(matchedWords, prev?.matchedWords || 0),
      totalWords,
      mistakes: prev ? prev.mistakes : mistakes.slice(0, 8).map(({ type, typed, word }) => ({ type, typed, word })),
    };
    if (at >= 0) l.answers[at] = row; else l.answers.push(row);
    l.saved = false;
  }

  // 🔁: while the sentence is being worked on, the clip plays again 1–3 s
  // after it ends (longer sentences get a longer pause to type). Stops once
  // it's passed, or after 20 s without a key pressed.
  useEffect(() => {
    live.current.onClipEnd = () => {
      const l = live.current;
      clearTimeout(l.loopTimer);
      if (!l.prefs.loop || !sentence || done.has(index) || Date.now() - l.lastKey > 20000) return;
      const wait = Math.min(3, Math.max(1, (sentence.end - sentence.start) * 0.3));
      l.loopTimer = setTimeout(() => { if (l.index === index) restart(true); }, wait * 1000);
    };
  });

  function check() {
    if (!sentence) return null;
    const text = typed.trim();
    if (!text) { shake(inputRef.current); inputRef.current?.focus(); return null; }
    const d = diffSentence(text, sentence);
    const r = { ...d, typedText: text, mistakes: analyzeMistakes(d, sentence) };
    setResults((all) => ({ ...all, [index]: r }));
    if (!(index in firstMistakes)) setFirstMistakes((m) => ({ ...m, [index]: r.mistakes }));
    record(r.passed, r.ok, r.total, r.mistakes);
    if (!r.passed) {
      shake(inputRef.current);
      window.playWrong?.();
      inputRef.current?.focus();
      return r;
    }
    clearTimeout(live.current.loopTimer);
    window.playOk?.();
    if (done.has(index)) return r; // a re-check after fixing the red words
    const nextDone = new Set(done).add(index);
    setDone(nextDone);
    if (nextDone.size === total) window.Mascot?.cheer?.(100, 'Chép đúng hết cả bài luôn! Tai cậu thính quá trời 🎧🍊');
    else window.Mascot?.hop?.('excited');
    if (nextDone.size === total) { save(true); return r; }
    // only a perfect sentence moves on by itself — at 80–99% the student
    // may still want to fix the red words
    if (r.perfect && live.current.prefs.autonext) {
      const next = nextUndone(nextDone);
      if (next >= 0) live.current.autoNext = setTimeout(() => goTo(next), 1600);
    }
    return r;
  }

  // 🍊 Hỏi Lulu (3 per sentence) — never the whole answer:
  //   a sentence: its Vietnamese meaning first, then one word at a time
  //     (a word not typed right yet, the longest — content words first)
  //   a drill: the first letters / digits, a few more each ask, at most half
  function askLulu(e) {
    if (!sentence || revealed || hint.n >= LULU_MAX) return;
    const btn = e.currentTarget;
    let next;
    let say;
    if (isDrill) {
      const m = luluDrillMask(sentence.answer, hint.step + 1);
      next = { ...hint, n: hint.n + 1, step: hint.step + 1 };
      say = `Gồm ${m.count} ${m.unit}: ${m.masked}`;
    } else if (!hint.vi && translations?.[index]) {
      next = { ...hint, n: hint.n + 1, vi: true };
      say = `Câu này nghĩa là: “${translations[index]}”`;
    } else {
      const okRefs = new Set(result && !stale ? result.tokens.filter((t) => t.kind === 'ok').map((t) => t.r) : []);
      const word = luluHintWord(sentence.text, okRefs, hint.words);
      if (!word) { luluSay(btn, 'Cậu gõ được gần hết rồi — nghe lại (Ctrl) thêm lần nữa nha! 🍊'); return; }
      next = { ...hint, n: hint.n + 1, words: [...hint.words, word] };
      say = `Trong câu có từ “${word}” đó!`;
    }
    setHints((all) => ({ ...all, [index]: next }));
    luluSay(btn, `${say} 🍊`);
    inputRef.current?.focus();
  }

  function goNext() {
    const next = nextUndone(done);
    if (next >= 0) goTo(next);
    else if (index < total - 1) goTo(index + 1);
  }

  // Enter = check; on a passed sentence with nothing changed since = next
  function onInputKey(e) {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    if (passed && !stale) { goNext(); return; }
    check();
  }

  // Typed from what was heard, never pasted in
  const blockPaste = (e) => {
    e.preventDefault();
    window.showToast?.('Không thể dán văn bản vào đây — hãy nghe và gõ lại.', 'warn', 3000);
  };
  const blockDrop = (e) => {
    e.preventDefault();
    window.showToast?.('Không thể kéo-thả văn bản vào đây — hãy nghe và gõ lại.', 'warn', 3000);
  };

  const paragraphs = (lesson.transcript || '').split(/\n+/).filter(Boolean);
  const length = sentence ? sentence.end - sentence.start || 1 : 0;
  const prompt = lesson.slug?.startsWith('spelling')
    ? <>Nghe và gõ lại <b>cái tên / từ được đánh vần</b>.</>
    : <>Nghe và gõ lại <b>con số / mã số / địa chỉ</b>.</>;

  return (
    <div id="screen-practice" className="active" ref={screenRef}>
      <div className="dict-practice-top">
        <button className="dict-back-btn" title="Quay lại" onClick={onBack}><i className="fas fa-arrow-left" /></button>
        <div>
          <div className="dict-practice-title" id="dict-section-title">{lesson.title}</div>
          <div className="dict-practice-sub" id="dict-section-sub">{total ? `${lesson.sub} · ${total} câu` : ''}</div>
        </div>
      </div>

      <div className="dx-tabs" role="tablist">
        <button className={`dx-tab${tab === 'dictation' ? ' active' : ''}`} data-tab="dictation" role="tab" onClick={() => setTab('dictation')}>Dictation</button>
        <button className={`dx-tab${tab === 'transcript' ? ' active' : ''}`} data-tab="transcript" role="tab" onClick={() => setTab('transcript')}>Full transcript</button>
      </div>

      <div className="dict-card-box">
        <div className={`dict-pane${tab === 'dictation' ? '' : ' hidden'}`} id="dict-pane-dictation">
          <div className="dict-media">
            <div className="dict-media-cover">
              <div className="dict-media-icon"><i className="fas fa-headphones" /></div>
              <div className="dict-media-title" id="dict-media-title">{total ? lesson.title : '—'}</div>
              <div className="dict-media-src" id="dict-media-src">{sentence?.sourceTitle ? `🎧 ${sentence.sourceTitle}` : ''}</div>
            </div>
            <div className="dict-sidebar-head"><span>Danh sách câu</span> <span id="dict-session-score">{total ? `${done.size}/${total} ✓` : ''}</span></div>
            <div className="dict-num-grid" id="dict-num-grid">
              {sentences.map((_, i) => (
                <button key={i} className={`dict-num-btn${i === index ? ' current' : ''}${done.has(i) ? ' done' : ''}`} data-i={i} onClick={() => goTo(i)}>{i + 1}</button>
              ))}
            </div>
            <MistakeTally tally={tallyMistakes(Object.values(firstMistakes))} title="Bạn hay sai:" />
          </div>

          <div className="dict-panel">
            <div className="dict-panel-top">
              <button className="dict-nav-arrow" id="dict-prev-btn" title="Câu trước" disabled={index === 0} onClick={() => goTo(index - 1)}><i className="fas fa-arrow-left" /></button>
              <span className="dict-counter">Câu <span id="dict-cur-num">{index + 1}</span>/<span id="dict-total-num">{total || 1}</span></span>
              <button className="dict-nav-arrow" id="dict-next-btn" title="Câu sau" disabled={index >= total - 1} onClick={() => goTo(index + 1)}><i className="fas fa-arrow-right" /></button>
              {done.has(index) && <span className="dx-done-pill"><i className="fas fa-check" /> Đã xong</span>}
              {canReport && total > 0 && (
                <button className={`dx-report-btn${reported.has(index) ? ' sent' : ''}`} id="dict-report-btn"
                  title={reported.has(index) ? 'Bạn đã báo lỗi câu này — bấm để sửa lại báo lỗi' : 'Báo lỗi câu này (đáp án sai, audio bị cắt…)'}
                  onClick={() => openReport(index)}>
                  <i className="fas fa-flag" /> <span>{reported.has(index) ? 'Đã báo lỗi' : 'Báo lỗi'}</span>
                </button>
              )}
              <div className="dict-gear-wrap">
                <button className="dict-gear" id="dict-gear-btn" title="Cài đặt" onClick={() => setSettingsOpen((o) => !o)}><i className="fas fa-cog" /></button>
                <div className={`dict-settings${settingsOpen ? ' show' : ''}`} id="dict-settings">
                  <label className="dict-check"><input type="checkbox" id="opt-autoplay" checked={prefs.autoplay} onChange={(e) => changePrefs({ autoplay: e.target.checked })} /> Tự phát khi sang câu mới</label>
                  <label className="dict-check"><input type="checkbox" id="opt-autonext" checked={prefs.autonext} onChange={(e) => changePrefs({ autonext: e.target.checked })} /> Đúng 100% thì tự sang câu tiếp</label>
                  <div className="dict-settings-note">Phím tắt: <kbd>Enter</kbd> kiểm tra / câu tiếp · <kbd>Shift</kbd>+<kbd>Enter</kbd> xuống dòng · <kbd>Ctrl</kbd> nghe lại câu</div>
                </div>
              </div>
            </div>

            {/* The sentence's own player: play, replay, where it is, speed, 🔁 */}
            <div className="dx-player">
              <button className="dict-play-btn" id="dict-play-btn" title="Phát / dừng" onClick={togglePlay}><i className={`fas ${playing ? 'fa-pause' : 'fa-play'}`} /></button>
              <button className="dict-restart-btn" title="Nghe lại câu này (phím Ctrl)" onClick={() => restart()}><i className="fas fa-rotate-left" /></button>
              <div className="dict-progress-wrap"><div className="dict-progress-fill" id="dict-progress-fill" style={{ width: `${clock.ratio * 100}%` }} /></div>
              <span className="dict-time" id="dict-time">{fmtTime(clock.now)} / {fmtTime(length)}</span>
              <select className="dx-speed" id="dict-speed-sel" title="Tốc độ" value={String(prefs.speed)} onChange={(e) => {
                const speed = Number(e.target.value) || 1;
                audioRef.current.playbackRate = speed;
                changePrefs({ speed });
              }}>
                {SPEEDS.map((sp) => <option key={sp} value={String(sp)}>{sp}×</option>)}
              </select>
              <button className={`dx-loop${prefs.loop ? ' on' : ''}`} id="dict-loop-btn" aria-pressed={prefs.loop}
                title={prefs.loop ? 'Đang bật: tự nghe lại câu sau 1–3 giây khi bạn đang gõ' : 'Bật tự nghe lại câu sau 1–3 giây khi bạn đang gõ'}
                onClick={() => { changePrefs({ loop: !prefs.loop }); clearTimeout(live.current.loopTimer); }}><i className="fas fa-repeat" /></button>
            </div>

            <div className="dict-prompt" id="dict-prompt">{isDrill && prompt}</div>
            <textarea className="dict-input" id="dict-input" ref={inputRef} placeholder="Gõ những gì bạn nghe được rồi nhấn Enter..."
              autoComplete="off" autoCapitalize="off" spellCheck={false} value={typed}
              onChange={(e) => { live.current.lastKey = Date.now(); setTyped(e.target.value); }}
              onKeyDown={onInputKey} onPaste={blockPaste} onDrop={blockDrop} onDragOver={(e) => e.preventDefault()} />

            {/* what Lulu has told about this sentence so far (until it's typed right) */}
            {!revealed && hint.n > 0 && (
              <div className="dx-lulu-hint" id="dict-lulu-hint">
                <span className="dx-lulu-title">🍊 Lulu gợi ý:</span>
                {hint.vi && translations?.[index] && <div><b>Nghĩa:</b> {translations[index]}</div>}
                {!!hint.words.length && <div><b>Có các từ:</b> {hint.words.map((w) => <span key={w} className="dx-lulu-word">{w}</span>)}</div>}
                {isDrill && hint.step > 0 && (() => {
                  const m = luluDrillMask(sentence.answer, hint.step);
                  return <div><span className="dx-lulu-mask">{m.masked}</span> <span className="dx-lulu-count">({m.count} {m.unit})</span></div>;
                })()}
              </div>
            )}

            {result && <DiffLine r={result} showAnswer={revealed} stale={stale} />}
            {result && <ScoreLine r={result} />}
            {result && (
              <div className={`dict-status dx-verdict${passed ? ' ok' : ' bad'}`} id="dict-status">
                {result.perfect && <><i className="fas fa-circle-check" /> Correct! Chính xác 100%.</>}
                {passed && !result.perfect && <><i className="fas fa-circle-check" /> Đạt {Math.round(result.ratio * 100)}%, câu đã xong. Sửa các từ tô đỏ rồi bấm Kiểm tra lại, hoặc sang câu tiếp.</>}
                {!passed && !!result.caseErrors?.length && <><i className="fas fa-triangle-exclamation" /> Incorrect — tên riêng phải <b>viết hoa chữ cái đầu</b>: {result.caseErrors.map((c) => `${c.typed} → ${c.word}`).join(', ')}.</>}
                {!passed && !result.caseErrors?.length && <><i className="fas fa-triangle-exclamation" /> Incorrect — {isDrill ? 'tên / con số phải đúng hết.' : `chưa đạt ${PASS_PCT}%. Nghe lại (Ctrl) rồi sửa các từ tô đỏ — bí thì bấm "Hỏi Lulu".`}</>}
              </div>
            )}
            {result && !!result.caseErrors?.length && <div className="dx-caps-tip" id="dict-caps-tip">💡 {CAPS_TIP}</div>}
            {result && <MistakeList mistakes={result.mistakes || []} showWord={revealed} />}

            {/* typed right: the answer, its meaning and how it links */}
            <div className="dict-reveal" id="dict-reveal">
              {sentence && revealed && (
                <>
                  {isDrill && <div className="dict-reveal-answer">{sentence.answer}</div>}
                  <div className="dict-correct-en">{sentence.text}</div>
                  {!isDrill && <Meaning index={index} translations={translations} done />}
                </>
              )}
            </div>
            {!isDrill && sentence && revealed && <LinkingCard text={sentence.text} />}

            <div className="dx-actions">
              {passed && !stale
                ? <button className="dict-btn dict-btn-ok" id="dict-next-sentence-btn" onClick={goNext}>Câu tiếp (Enter)</button>
                : <button className="dict-btn dict-btn-primary" id="dict-check-btn" onClick={check}>{result ? 'Kiểm tra lại' : 'Kiểm tra'} (Enter)</button>}
              {passed && !stale && !result.perfect && <button className="dict-btn dict-btn-ghost" id="dict-recheck-btn" onClick={check}>Kiểm tra lại</button>}
              {!revealed && (
                <button className="dict-btn dict-btn-ghost ask-lulu" id="dict-lulu-btn" disabled={hint.n >= LULU_MAX} onClick={askLulu}
                  title={isDrill ? 'Hỏi Lulu: vài chữ cái / chữ số đầu' : 'Hỏi Lulu: nghĩa tiếng Việt, rồi vài từ trong câu'}>
                  <span className="ask-lulu-ic" /> Hỏi Lulu ({LULU_MAX - hint.n})
                </button>
              )}
              {!passed && <button className="dict-btn dict-btn-ghost" id="dict-skip-btn" onClick={skip}>Bỏ qua</button>}
            </div>
            {total > 0 && done.size === total && (
              <div className="dx-summary" id="dict-summary">
                <div className="dx-summary-score">🎉 Xong cả bài! Cậu tự chép đúng cả <b>{total}</b> câu — đạt yêu cầu bài tập ✓</div>
                <MistakeTally tally={tallyMistakes(Object.values(firstMistakes))} title="Lỗi hay gặp trong bài:" />
              </div>
            )}
            <div className="dx-foot">
              <div>{isDrill ? 'Tên / con số phải đúng hết mới xong câu. Tên riêng phải viết hoa chữ cái đầu.' : `Đạt từ ${PASS_PCT}% số từ là xong câu.`}</div>
              {isDrill && <div className="dx-foot-caps">💡 {CAPS_TIP}</div>}
              <div><kbd>Shift</kbd>+<kbd>Enter</kbd> xuống dòng · <kbd>Ctrl</kbd> nghe lại · <i className="fas fa-repeat" /> tự nghe lại câu sau 1–3 giây khi đang gõ</div>
            </div>
          </div>
        </div>

        <div className={`dict-pane${tab === 'transcript' ? '' : ' hidden'}`} id="dict-pane-transcript">
          <p className="dict-transcript-note">Câu nào chép đúng rồi mới hiện ở đây. Bấm vào một câu để luyện câu đó.</p>
          <ol className="dict-transcript-list" id="dict-transcript-list">
            {tab === 'transcript' && sentences.map((s, i) => (
              <li key={i} className={`${done.has(i) ? 'done' : 'locked'}${i === index ? ' current' : ''}`} onClick={() => { setTab('dictation'); goTo(i); }}>
                {done.has(i)
                  ? <>{s.answer && <><b className="dict-t-answer">{s.answer}</b> — </>}{s.text}</>
                  : <span className="dict-t-locked"><i className="fas fa-lock" /> Chưa chép đúng — bấm để luyện</span>}
                {s.sourceTitle && <> <span className="dict-t-src">{s.sourceTitle}</span></>}
                {done.has(i) && translations?.[i] && <div className="dict-t-vi">{translations[i]}</div>}
                {canReport && (
                  <button className={`dict-t-report${reported.has(i) ? ' sent' : ''}`} title={`Báo lỗi câu ${i + 1}`} aria-label={`Báo lỗi câu ${i + 1}`}
                    onClick={(e) => { e.stopPropagation(); openReport(i); }}><i className="fas fa-flag" /></button>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="dict-tip" id="dict-tip">
        <span className="dict-tip-ic">💡</span>
        <span id="dict-tip-text">{TIPS[tip]}</span>
        <button className="dict-tip-next" title="Mẹo khác" onClick={() => setTip((t) => (t + 1) % TIPS.length)}><i className="fas fa-rotate-right" /></button>
      </div>

      {/* Sections only: a drill's clips come from many files */}
      <details className="dict-full" id="dict-full" style={lesson.kind === 'section' ? undefined : { display: 'none' }}>
        <summary>Full Audio &amp; Plain Transcript</summary>
        <div className="dict-full-body">
          <audio id="dict-full-audio" ref={fullAudioRef} controls preload="none" src={lesson.kind === 'section' ? lesson.audioUrl : undefined} />
          {/* the whole text = every answer: only once the lesson is done */}
          <div className="dict-full-text" id="dict-full-text">
            {total > 0 && done.size === total
              ? paragraphs.map((p, i) => <p key={i}>{p}</p>)
              : <p className="dict-t-locked"><i className="fas fa-lock" /> Transcript hiện khi bạn chép đúng hết {total} câu.</p>}
          </div>
        </div>
      </details>

      <audio id="dict-audio" ref={audioRef} preload="metadata" />
      {reportFor !== null && sentences[reportFor] && (
        <ReportModal lesson={lesson} index={reportFor} sentence={sentences[reportFor]} solved={done.has(reportFor)} config={reportConfig}
          typed={reportFor === index ? typed : ''} onClose={() => setReportFor(null)}
          onSent={(i) => setReported((s) => new Set(s).add(i))} />
      )}
    </div>
  );
}

// 🎯 "Bạn hay nghe sai": the 3 most frequent kinds of mistake over the
// student's dictation (last 3 months), each with its tip and examples
function HabitsCard({ habits }) {
  const top = habits.types.slice(0, 3);
  return (
    <div className="dx-habits" id="dict-habits">
      <div className="dx-habits-head">🎯 Bạn hay nghe sai <span>(từ {habits.sentences} câu đã luyện gần đây)</span></div>
      <div className="dx-habits-list">
        {top.map((h) => {
          const t = MISTAKE_TYPES[h.type] || MISTAKE_TYPES.wrong_word;
          return (
            <div key={h.type} className="dx-habit" data-type={h.type}>
              <div className="dx-habit-title">{t.icon} {t.label} <b>×{h.count}</b></div>
              {!!h.examples.length && (
                <div className="dx-habit-ex">
                  {h.examples.map((e, i) => <span key={i}>{e.typed ? <s>{e.typed}</s> : <i>(sót)</i>}{e.word && <> → <b>{e.word}</b></>}</span>)}
                </div>
              )}
              <div className="dx-habit-tip">{t.tip}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const sectionLesson = (s) => ({
  kind: 'section', _id: s._id, title: s.title, partNumber: s.partNumber,
  sub: s.isActualTest ? `Part ${s.partNumber} · Actual Test` : `Part ${s.partNumber}`,
  transcript: s.transcript || '', audioUrl: s.audioUrl,
  sentences: s.dictationSentences.map((x) => ({ text: x.text, start: x.start, end: x.end, audioUrl: s.audioUrl })),
});
const drillLesson = (d) => ({
  kind: 'drill', _id: d._id, slug: d.slug, title: d.title,
  sub: d.category === 'spelling' ? '🔤 Đánh vần tên — gõ đúng chính tả cái tên' : '🔢 Số dài & mã số — gõ lại con số / mã',
  transcript: '', audioUrl: '',
  sentences: d.items.map((x) => ({ text: x.text, start: x.start, end: x.end, audioUrl: x.audioUrl, answer: x.answer, sourceTitle: x.sourceTitle })),
});

function searchText(s) {
  if (s.kind === 'drill') return [s.title, s.category === 'spelling' ? 'đánh vần spelling names tên' : 'số numbers phone price postcode'];
  if (s.kind === 'spell') return [s.title, 'video đánh vần spelling names numbers số'];
  return [s.title, `part ${s.partNumber}${s.isActualTest ? ' actual test' : ''}`];
}

function LessonCard({ s, onOpen }) {
  if (s.kind === 'drill') {
    return (
      <div className="dict-card" onClick={() => onOpen(s)}>
        <div className="dict-card-badges">
          <span className={`dict-badge ${s.category === 'spelling' ? 'spell' : 'num'}`}>{s.category === 'spelling' ? '🔤 Đánh vần tên' : '🔢 Số & mã số'}</span>
        </div>
        <div className="dict-card-title">{s.title}</div>
        <div className="dict-card-meta"><span><i className="fas fa-list-ol" /> {s.itemCount} câu</span><span><i className="fas fa-headphones" /> Audio đề thi</span></div>
      </div>
    );
  }
  const spell = s.kind === 'spell';
  const count = spell ? s.segmentCount || 0 : s.sentenceCount;
  const seconds = spell ? s.duration : s.audioDuration;
  return (
    <div className="dict-card" onClick={() => onOpen(s)}>
      <div className="dict-card-badges">
        {spell
          ? <><span className="dict-badge">Đánh vần &amp; số</span><span className="dict-badge video"><i className="fab fa-youtube" /> Video</span></>
          : <span className="dict-badge">{s.isActualTest ? `Part ${s.partNumber} · Actual Test` : `Part ${s.partNumber}`}</span>}
      </div>
      <div className="dict-card-title">{s.title}</div>
      <div className="dict-card-meta">
        <span><i className="fas fa-list-ol" /> {count} câu</span>
        {!!seconds && <span><i className="fas fa-clock" /> {fmtTime(seconds)}</span>}
      </div>
    </div>
  );
}

export default function Dictation() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const drill = params.get('drill');
  const sectionId = params.get('sectionId');
  const target = drill ? `drill:${drill}` : sectionId ? `section:${sectionId}` : '';
  const [premium] = useState(() => hasPremiumAccess());
  const opening = !!target && premium;

  const [list, setList] = useState({ status: 'loading', sections: [], drills: [], spell: [] });
  const [part, setPart] = useState('');
  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState({ target: '', lesson: null });
  const [habits, setHabits] = useState(null); // 🎯 the student's mistakes by type

  // Re-read on coming back from a lesson (it just saved new mistakes)
  useEffect(() => {
    if (target) return undefined;
    let alive = true;
    apiFetch('/listening/dictation/my-mistakes')
      .then((d) => { if (alive && d?.success) setHabits(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, [target]);

  useEffect(() => {
    let alive = true;
    // The spelling videos are a bonus: without them the rest is still listed
    const spell = apiFetch('/shadowing/lessons')
      .then((d) => (d.lessons || []).filter((l) => l.category === 'spelling-numbers'))
      .catch(() => []);
    Promise.all([apiFetch('/listening/dictation/list'), spell]).then(([data, videos]) => {
      if (alive) setList({ status: 'ready', sections: data.sections || [], drills: data.drills || [], spell: videos, reportConfig: data.reportConfig || null });
    }).catch(() => {
      if (alive) setList((l) => ({ ...l, status: 'error' }));
    });
    return () => { alive = false; };
  }, []);

  // Not setParams: it changes with the address, and this must stay the same
  const closeLesson = useCallback(() => navigate('/dictation', { replace: true }), [navigate]);

  useEffect(() => {
    if (!target) return undefined;
    if (!premium) { openUpgrade(); return undefined; }
    window.scrollTo(0, 0);
    let alive = true;
    const fail = (msg) => { siteToast(msg, 'error'); closeLesson(); };
    const url = drill
      ? `/listening/dictation/drill/${encodeURIComponent(drill)}`
      : `/listening/dictation/section/${sectionId}`;
    apiFetch(url).then((data) => {
      if (!alive) return;
      if (drill) {
        if (!data.drill?.items?.length) { fail('Bài này chưa có dữ liệu.'); return; }
        setOpened({ target, lesson: drillLesson(data.drill) });
      } else {
        if (!data.section?.dictationSentences?.length) { fail('Bài này chưa có dữ liệu dictation.'); return; }
        setOpened({ target, lesson: sectionLesson(data.section) });
      }
    }).catch(() => { if (alive) fail('Không tải được bài này.'); });
    return () => {
      alive = false;
      setOpened({ target: '', lesson: null });
    };
  }, [target, drill, sectionId, premium, closeLesson]);

  const pools = useMemo(() => {
    const drills = list.drills.map((d) => ({ ...d, kind: 'drill' }));
    const spell = list.spell.map((l) => ({ ...l, kind: 'spell' }));
    const sections = list.sections.map((s) => ({ ...s, kind: 'section' }));
    return (p) => {
      if (p === 'spell') return spell;
      if (p === 'drill-spelling') return drills.filter((d) => d.category === 'spelling');
      if (p === 'drill-numbers') return drills.filter((d) => d.category === 'numbers');
      // every section of that part — Actual Test parts included
      if (p) return sections.filter((s) => String(s.partNumber) === p);
      return [...drills, ...spell, ...sections];
    };
  }, [list]);

  function openCard(s) {
    if (s.kind === 'spell') {
      navigate(`/shadowing?lesson=${encodeURIComponent(s.slug)}&mode=dictation`);
      return;
    }
    if (!premium) { openUpgrade(); return; }
    setParams(s.kind === 'drill' ? { drill: s.slug } : { sectionId: s._id }, { replace: true });
  }

  const ready = list.status === 'ready';
  const nothing = ready && !list.sections.length && !list.drills.length && !list.spell.length;
  const shown = ready && !nothing ? SearchMatch.filter(pools(part), query, searchText) : [];
  const lesson = opened.target === target && opened.lesson ? opened.lesson : LOADING_LESSON;

  return (
    <div className="dict-wrap">
      <div id="screen-list" className={opening ? 'hidden' : undefined}>
        <div className="dict-picker-head pf-hero pf-hero-blue" data-mascot="wink">
          <div className="pf-hero-body">
            <h1>Luyện <span className="pf-tag">Dictation</span></h1>
            <p className="pf-hero-sub">Nghe và chép chính tả từng câu — chọn một bài Listening bên dưới để bắt đầu.</p>
          </div>
          <div className="dict-search">
            <i className="fas fa-search" />
            <input type="search" id="dict-search" placeholder="Tìm bài... (vd: Quýt 18, festival, flights)" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {!premium && (
          <div id="premium-promo-banner" style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg,rgba(229,57,53,.08),rgba(198,40,40,.06))', border: '1px solid rgba(229,57,53,.2)', borderRadius: 14, padding: '14px 18px', margin: '0 0 16px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 22 }}>⭐</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand,#e53935)', marginBottom: 2 }}>Nâng cấp Premium để luyện Dictation</div>
              <div style={{ fontSize: 12, color: 'var(--text2,#555)' }}>Nghe và chép chính tả toàn bộ bài Listening — cập nhật thường xuyên</div>
            </div>
            <button onClick={() => openUpgrade()} style={{ background: 'linear-gradient(135deg,var(--brand,#e53935),var(--brand-dark,#c62828))', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Upgrade Premium</button>
          </div>
        )}

        {!!habits?.types?.length && <HabitsCard habits={habits} />}

        <div className="dict-filters" id="dict-filters">
          {CHIPS.map(([value, label]) => (
            <button key={value} className={`dict-chip${part === value ? ' active' : ''}`} data-part={value} onClick={() => setPart(value)}>
              {label}{ready && <span className="n">({pools(value).length})</span>}
            </button>
          ))}
        </div>

        <div id="dict-grid" className="dict-grid">
          {list.status === 'loading' && <div className="dict-loading"><i className="fas fa-spinner fa-spin" />Đang tải danh sách...</div>}
          {list.status === 'error' && <div className="dict-empty"><i className="fas fa-triangle-exclamation" />Không tải được danh sách. Vui lòng thử lại.</div>}
          {nothing && <div className="dict-empty"><i className="fas fa-keyboard" />Chưa có bài nào sẵn sàng để luyện Dictation.</div>}
          {ready && !nothing && !shown.length && <div className="dict-empty"><i className="fas fa-search" />Không tìm thấy bài nào khớp với từ khóa.</div>}
          {shown.map((s) => <LessonCard key={`${s.kind}-${s._id || s.slug}`} s={s} onOpen={openCard} />)}
        </div>
      </div>

      {opening && <Practice key={lesson === LOADING_LESSON ? 'loading' : target} lesson={lesson} onBack={closeLesson} reportConfig={list.reportConfig} />}
    </div>
  );
}
