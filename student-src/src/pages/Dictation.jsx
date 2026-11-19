import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { hasPremiumAccess } from '../utils/plan';
import SearchMatch from '../utils/searchMatch';
import { bindDict, openUpgrade, siteToast } from '../utils/shell';
import { firstDiff, fmtTime, gradeSentence, maskWords } from '../utils/dictation';

// ⌨️ Luyện Dictation — /app/dictation, ?sectionId= (a Listening section, one
// audio file) or ?drill= (spelling / numbers clips from many files). The
// Shadowing page's spelling videos are listed here too and open over there.

const PREFS_KEY = 'dictation-prefs-v2';
const SPEEDS = [0.75, 1, 1.25, 1.5];
const CHIPS = [
  ['', 'Tất cả'], ['1', 'Part 1'], ['2', 'Part 2'], ['3', 'Part 3'], ['4', 'Part 4'],
  ['drill-spelling', '🔤 Đánh vần tên'], ['drill-numbers', '🔢 Số dài & mã số'], ['spell', '🎬 Video đánh vần & số'],
];
const TIPS = [
  'Luyện ít nhất 30 phút mỗi ngày để tiến bộ nhanh hơn!',
  'Nghe lại một câu nhiều lần trước khi xem đáp án — phím Ctrl để nghe lại nhanh.',
  'Đánh vần: "double L" = LL, "triple 5" = 555, "oh" = số 0.',
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
    showAnswer: typeof p.showAnswer === 'boolean' ? p.showAnswer : true,
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

function MaskLine({ sentence, result, showAnswer }) {
  return maskWords(sentence, result, showAnswer).map((w, i) => {
    let body = <span className="m-hide">{w.word}</span>;
    if (w.kind === 'ok') body = <span className="m-ok">{w.word}</span>;
    if (w.kind === 'show') {
      const k = firstDiff(w.word, result.typedFor);
      body = (
        <span className="m-show">
          {k < 0 ? w.word : <>{w.word.slice(0, k)}<u className="m-err">{w.word[k]}</u>{w.word.slice(k + 1)}</>}
        </span>
      );
    }
    return <Fragment key={i}>{i > 0 && ' '}{body}</Fragment>;
  });
}

function Meaning({ index, translations, done }) {
  if (!translations) return <div className="dict-vi" id="dict-vi">{done && <><i className="fas fa-spinner fa-spin" /> Đang tải nghĩa...</>}</div>;
  const vi = translations[index] || '';
  return <div className="dict-vi" id="dict-vi" style={vi ? undefined : { display: 'none' }}>{vi && <><b>Nghĩa:</b> {vi}</>}</div>;
}

function Practice({ lesson, onBack }) {
  const { sentences } = lesson;
  const total = sentences.length;
  const audioRef = useRef(null);
  const fullAudioRef = useRef(null);
  const inputRef = useRef(null);
  const screenRef = useRef(null);
  const [prefs, setPrefs] = useState(loadPrefs);
  // What the audio callbacks and timers need right now
  const live = useRef({ index: 0, prefs, answers: [], saved: false, autoNext: null });

  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(NO_SET);
  const [peeked, setPeeked] = useState(NO_SET);
  const [results, setResults] = useState({});
  const [typed, setTyped] = useState('');
  const [tab, setTab] = useState('dictation');
  const [showFull, setShowFull] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [clock, setClock] = useState({ ratio: 0, now: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tip, setTip] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [translations, setTranslations] = useState(lesson.kind === 'section' ? null : []);

  const sentence = sentences[index];
  const result = results[index];
  const isDrill = !!sentence?.answer;
  const correct = !!result?.perfect;

  const save = useCallback(() => {
    const l = live.current;
    if (l.saved || !l.answers.length) return;
    l.saved = true;
    const body = lesson.kind === 'drill'
      ? { drillSlug: lesson.slug, sectionTitle: lesson.title, answers: l.answers }
      : { sectionId: lesson._id, sectionTitle: lesson.title, partNumber: lesson.partNumber, answers: l.answers };
    // keepalive: it has to outlive the page when the tab closes
    apiFetch('/listening/dictation/save-attempt', { method: 'POST', keepalive: true, body: JSON.stringify(body) }).catch(() => {});
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
    const stop = () => { audio.pause(); setPlaying(false); };
    const onError = () => {
      setPlaying(false);
      siteToast('Lỗi tải audio của bài này — vui lòng liên hệ giáo viên.', 'error');
    };
    const onTime = () => {
      const s = current();
      const length = s.end - s.start || 1;
      setClock({ ratio: Math.min(1, Math.max(0, (audio.currentTime - s.start) / length)), now: Math.max(0, audio.currentTime - s.start) });
      if (audio.currentTime >= s.end) stop();
    };
    // timeupdate fires ~4×/s, too late to stop before the next word: while
    // playing, the clip end is watched every frame.
    const onPlay = () => {
      cancelAnimationFrame(frame);
      const tick = () => {
        if (audio.paused) return;
        if (audio.currentTime >= current().end) { stop(); return; }
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
      audio.removeEventListener('error', onError);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      fullAudio?.pause();
    };
  }, [sentences]);

  // Results are saved on leaving, also when the tab closes
  useEffect(() => {
    window.addEventListener('pagehide', save);
    return () => {
      window.removeEventListener('pagehide', save);
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
      if (e.key === 'Control' && alone) restart();
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
    setShowFull(false);
    setClock({ ratio: 0, now: 0 });
    if (window.matchMedia('(min-width: 800px)').matches) inputRef.current?.focus();
    if (!noAutoplay && l.prefs.autoplay) restart(true);
  }

  function togglePlay() {
    if (!sentence) return;
    const audio = audioRef.current;
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

  function record(isCorrect, matchedWords, totalWords) {
    const l = live.current;
    const row = { sentenceIndex: index, isCorrect, matchedWords, totalWords };
    const at = l.answers.findIndex((a) => a.sentenceIndex === index);
    if (at >= 0) l.answers[at] = row; else l.answers.push(row);
    l.saved = false;
  }

  function check() {
    if (!sentence) return;
    const text = typed.trim();
    if (!text) { shake(inputRef.current); inputRef.current?.focus(); return; }
    const r = gradeSentence(text, sentence);
    setResults((all) => ({ ...all, [index]: r }));
    record(r.perfect && !peeked.has(index), r.okRefs.size, r.refCount);
    if (!r.perfect) {
      shake(inputRef.current);
      window.playWrong?.();
      inputRef.current?.focus();
      return;
    }
    window.playOk?.();
    const nextDone = new Set(done).add(index);
    setDone(nextDone);
    if (nextDone.size === total) window.Mascot?.cheer?.(100, 'Chép đúng hết cả bài luôn! Tai cậu thính quá trời 🎧🍊');
    else window.Mascot?.hop?.('excited');
    if (nextDone.size === total) { save(); return; }
    if (live.current.prefs.autonext) {
      const next = nextUndone(nextDone);
      if (next >= 0) live.current.autoNext = setTimeout(() => goTo(next), 1600);
    }
  }

  function onInputKey(e) {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    if (!done.has(index)) { check(); return; }
    const next = nextUndone(done);
    if (next >= 0) goTo(next);
  }

  function toggleShowFull(on) {
    setShowFull(on);
    // A sentence whose answer was seen isn't scored as correct
    if (on && !correct) setPeeked((p) => new Set(p).add(index));
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
              <div className="dict-audio-row">
                <button className="dict-restart-btn" title="Nghe lại câu này (phím Ctrl)" onClick={() => restart()}><i className="fas fa-undo" /></button>
                <div className="dict-progress-wrap"><div className="dict-progress-fill" id="dict-progress-fill" style={{ width: `${clock.ratio * 100}%` }} /></div>
                <span className="dict-time" id="dict-time">{fmtTime(clock.now)} / {fmtTime(length)}</span>
              </div>
            </div>
            <div className="dict-sidebar-head"><span>Danh sách câu</span> <span id="dict-session-score">{total ? `${done.size}/${total} ✓` : ''}</span></div>
            <div className="dict-num-grid" id="dict-num-grid">
              {sentences.map((_, i) => (
                <button key={i} className={`dict-num-btn${i === index ? ' current' : ''}${done.has(i) ? ' done' : ''}`} data-i={i} onClick={() => goTo(i)}>{i + 1}</button>
              ))}
            </div>
          </div>

          <div className="dict-panel">
            <div className="dict-panel-top">
              <button className="dict-play-btn" id="dict-play-btn" title="Phát / dừng (phím Ctrl để nghe lại)" onClick={togglePlay}><i className={`fas ${playing ? 'fa-pause' : 'fa-play'}`} /></button>
              <button className="dict-nav-arrow" id="dict-prev-btn" title="Câu trước" disabled={index === 0} onClick={() => goTo(index - 1)}><i className="fas fa-arrow-left" /></button>
              <span className="dict-counter"><span id="dict-cur-num">{index + 1}</span> / <span id="dict-total-num">{total || 1}</span></span>
              <button className="dict-nav-arrow" id="dict-next-btn" title="Câu sau" disabled={index >= total - 1} onClick={() => goTo(index + 1)}><i className="fas fa-arrow-right" /></button>
              <div className="dict-gear-wrap">
                <button className="dict-gear" id="dict-gear-btn" title="Cài đặt" onClick={() => setSettingsOpen((o) => !o)}><i className="fas fa-cog" /></button>
                <div className={`dict-settings${settingsOpen ? ' show' : ''}`} id="dict-settings">
                  <label>Tốc độ
                    <select id="dict-speed-sel" value={String(prefs.speed)} onChange={(e) => {
                      const speed = Number(e.target.value) || 1;
                      audioRef.current.playbackRate = speed;
                      changePrefs({ speed });
                    }}>
                      {SPEEDS.map((s) => <option key={s} value={String(s)}>{s}x</option>)}
                    </select>
                  </label>
                  <label className="dict-check"><input type="checkbox" id="opt-autoplay" checked={prefs.autoplay} onChange={(e) => changePrefs({ autoplay: e.target.checked })} /> Tự phát khi sang câu mới</label>
                  <label className="dict-check"><input type="checkbox" id="opt-autonext" checked={prefs.autonext} onChange={(e) => changePrefs({ autonext: e.target.checked })} /> Đúng thì tự sang câu tiếp</label>
                  <div className="dict-settings-note">Phím tắt: <kbd>Enter</kbd> kiểm tra · <kbd>Ctrl</kbd> nghe lại câu</div>
                </div>
              </div>
            </div>

            <div className="dict-prompt" id="dict-prompt">{isDrill && prompt}</div>
            <textarea className="dict-input" id="dict-input" ref={inputRef} placeholder="Gõ những gì bạn nghe được rồi nhấn Enter..."
              autoComplete="off" autoCapitalize="off" spellCheck={false} value={typed} onChange={(e) => setTyped(e.target.value)}
              onKeyDown={onInputKey} onPaste={blockPaste} onDrop={blockDrop} onDragOver={(e) => e.preventDefault()} />

            <div className="dict-status-row">
              <div className={`dict-status${result ? (correct ? ' ok' : ' bad') : ''}`} id="dict-status">
                {correct && <><i className="fas fa-circle-check" /> Correct!</>}
                {result && !correct && <><i className="fas fa-triangle-exclamation" /> Incorrect{result.firstWrong < 0 && <> <small>— bạn gõ thừa từ</small></>}</>}
              </div>
              <button className="dict-btn dict-btn-ghost" id="dict-skip-btn" onClick={skip}>Bỏ qua</button>
              <button className="dict-btn dict-btn-primary" id="dict-check-btn" disabled={done.has(index)} onClick={check}>Kiểm tra</button>
            </div>

            <div className="dict-mask" id="dict-mask">
              {sentence && result && !correct && !showFull && <MaskLine sentence={sentence} result={result} showAnswer={prefs.showAnswer} />}
            </div>
            <div className="dict-reveal" id="dict-reveal">
              {sentence && (correct || showFull) && (
                <>
                  {isDrill && <div className="dict-reveal-answer">{sentence.answer}</div>}
                  <div className="dict-correct-en">{sentence.text}</div>
                  {!isDrill && <Meaning index={index} translations={translations} done={correct} />}
                  {correct && peeked.has(index) && <div className="dict-peek-note">Câu này đã xem đáp án nên không tính điểm.</div>}
                </>
              )}
            </div>

            <label className="dict-check dict-check-lg"><input type="checkbox" id="opt-show-answer" checked={prefs.showAnswer} onChange={(e) => changePrefs({ showAnswer: e.target.checked })} /> Show answer immediately <span className="dict-check-hint">— lộ chữ sai đầu tiên khi bạn gõ sai</span></label>
            <label className="dict-check dict-check-lg"><input type="checkbox" id="opt-show-full" checked={showFull} onChange={(e) => toggleShowFull(e.target.checked)} /> Show full answer <span className="dict-check-hint">— câu xem đáp án không tính điểm</span></label>
          </div>
        </div>

        <div className={`dict-pane${tab === 'transcript' ? '' : ' hidden'}`} id="dict-pane-transcript">
          <p className="dict-transcript-note">Bấm vào một câu để quay lại luyện câu đó.</p>
          <ol className="dict-transcript-list" id="dict-transcript-list">
            {tab === 'transcript' && sentences.map((s, i) => (
              <li key={i} className={`${done.has(i) ? 'done' : ''}${i === index ? ' current' : ''}`} onClick={() => { setTab('dictation'); goTo(i); }}>
                {s.answer && <><b className="dict-t-answer">{s.answer}</b> — </>}{s.text}
                {s.sourceTitle && <> <span className="dict-t-src">{s.sourceTitle}</span></>}
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
          <div className="dict-full-text" id="dict-full-text">{paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
        </div>
      </details>

      <audio id="dict-audio" ref={audioRef} preload="metadata" />
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

  useEffect(() => {
    let alive = true;
    // The spelling videos are a bonus: without them the rest is still listed
    const spell = apiFetch('/shadowing/lessons')
      .then((d) => (d.lessons || []).filter((l) => l.category === 'spelling-numbers'))
      .catch(() => []);
    Promise.all([apiFetch('/listening/dictation/list'), spell]).then(([data, videos]) => {
      if (alive) setList({ status: 'ready', sections: data.sections || [], drills: data.drills || [], spell: videos });
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
            <input type="search" id="dict-search" placeholder="Tìm bài... (vd: Cam 18, festival, flights)" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
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

      {opening && <Practice key={lesson === LOADING_LESSON ? 'loading' : target} lesson={lesson} onBack={closeLesson} />}
    </div>
  );
}
