import { Fragment, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { hasPremiumAccess } from '../utils/plan';
import { bindDict, openUpgrade, siteToast } from '../utils/shell';
import {
  createShadowing, hasSpeechRecognition, hintText, loadPrefs, maskText, savePrefs, scoreClass, SPEEDS,
} from './shadowing/controller';

// 🎬 Luyện Shadowing — /app/shadowing?lesson=<slug>&mode=watch|dictation. Each
// lesson is a clip of a public YouTube video, embedded and never downloaded.

const PAGE_SIZE = 24; // fills 2, 3 or 4 grid columns evenly
const CATEGORY_LABEL = {
  'ielts-part1': 'Speaking Part 1', 'ielts-part2': 'Speaking Part 2', 'ielts-part3': 'Speaking Part 3',
  '6-minute-english': '6 Minute English', 'fun-shorts': 'Video ngắn vui',
  comedy: 'Hài Stand-up', 'ted-shorts': 'TED ngắn', 'everyday-english': 'Everyday English',
  'spelling-numbers': 'Đánh vần & số', grammar: 'Ngữ pháp', 'kids-stories': 'Truyện kể BBC',
  'connected-speech': 'Nối âm cơ bản', 'connected-speech-advanced': 'Nối âm nâng cao',
  animated: 'Hoạt hình kiến thức', '6-minute-grammar': '6 Minute Grammar', 'ielts-mock-test': 'Mock test Speaking',
};
const CATEGORY_CHIPS = [
  ['', 'Tất cả'], ['ielts-part1', 'Speaking Part 1'], ['ielts-part2', 'Speaking Part 2'], ['ielts-part3', 'Speaking Part 3'],
  ['ielts-mock-test', '🎙️ Mock test Speaking (Band 5–9)'], ['6-minute-english', 'BBC 6 Minute English'],
  ['6-minute-grammar', 'BBC 6 Minute Grammar'], ['kids-stories', '📖 Truyện kể BBC'], ['fun-shorts', '😄 Video ngắn vui'],
  ['comedy', '🎭 Hài Stand-up'], ['ted-shorts', '🎤 TED Talks ngắn'], ['animated', '🎨 Hoạt hình kiến thức'],
  ['everyday-english', '💬 Everyday English'], ['spelling-numbers', '🔤 Đánh vần tên & số (Listening)'],
  ['grammar', '📘 Ngữ pháp'], ['connected-speech', '🔗 Nối âm cơ bản'], ['connected-speech-advanced', '🔗 Nối âm nâng cao'],
];
const LEVELS = ['', 'A2', 'B1', 'B2', 'C1', 'C2'];
const CHOICES = [
  ['watch', '🎬', '1. Xem video', 'Xem liền mạch từ đầu đến cuối, có phụ đề Anh – Việt. Muốn dừng thì bấm tạm dừng.'],
  ['shadowing', '🎙️', '2. Shadowing', 'Video tự dừng sau mỗi câu để bạn nói theo. Bấm "Câu tiếp" là phát luôn câu sau.'],
  ['dictation', '⌨️', '3. Dictation', 'Nghe từng câu rồi gõ lại. Chép đúng cả câu sẽ hiện nghĩa tiếng Việt.'],
];

const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

function Score({ id, score }) {
  return (
    <div className={`sh-score${score ? ` show ${score.cls}` : ''}`} id={id}>
      {score?.title}{score?.sub && <small>{score.sub}</small>}
    </div>
  );
}

const Words = ({ words }) => words.map((x, k) => <Fragment key={k}>{k > 0 && ' '}<span className={x.hit ? 'w-match' : 'w-miss'}>{x.w}</span></Fragment>);

// Rendered apart from the player: the sentence nodes stay put while the video
// plays, so a double-click on a word keeps its selection for the dictionary.
const Transcript = memo(function Transcript({ segments, idx, mode, done, hide, showVi, onPick }) {
  const list = useRef(null);
  useEffect(() => {
    const box = list.current;
    const cur = box?.querySelector('.sh-item.current');
    if (!cur) return;
    // The box only: scrollIntoView would also move the page on phones
    const top = cur.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top + cur.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTo({ top: Math.max(0, top - box.clientHeight / 3), behavior: 'smooth' });
    }
  }, [idx]);
  return (
    <div className="sh-list" id="sh-list" ref={list}>
      {segments.map((s, i) => {
        const a = done[i];
        const pct = a ? Math.round((a.matched / a.total) * 100) : null;
        // A sentence not tried yet stays hidden while the exercise hides it
        const masked = !a && (mode === 'dictation' || (mode === 'shadowing' && hide));
        const vi = !masked && showVi && (mode !== 'dictation' || (a && a.matched === a.total)) ? s.vi || '' : '';
        return (
          // The 2nd click of a double-click is a word lookup, not a replay
          <div key={i} className={`sh-item${i === idx ? ' current' : ''}`} data-i={i} onClick={(e) => { if (e.detail < 2) onPick(i); }}>
            <span className="sh-item-num">{i + 1}</span>
            <span className={`sh-item-text${masked ? ' masked' : ''}`}>
              {masked ? '•••' : <>{s.text}{vi && <span className="sh-item-vi">{vi}</span>}</>}
            </span>
            {pct != null && <span className={`sh-item-score ${scoreClass(pct)}`}>{pct}%</span>}
          </div>
        );
      })}
    </div>
  );
});

function Practice({ lesson, onModeChange, onBack, onLeave }) {
  const [ctrl] = useState(() => createShadowing({ lesson, onModeChange }));
  const [v, setV] = useState(ctrl.view);
  const [descOpen, setDescOpen] = useState(false);
  const host = useRef(null);
  const input = useRef(null);
  const hintBtn = useRef(null);
  const chooser = useRef(null);

  useEffect(() => {
    ctrl.attach({ host: host.current, input: () => input.current, hintBtn: () => hintBtn.current }, setV);
    bindDict('screen-practice', 'shadowing', (e) => !e.target.closest?.('.sh-vi, .sh-item-vi, .masked'));
    return () => onLeave(ctrl.detach());
  }, [ctrl, onLeave]);

  useEffect(() => {
    if (v.chooser) chooser.current?.querySelector('.sh-choice.last')?.focus({ preventScroll: true });
  }, [v.chooser]);

  const seg = lesson.segments[v.idx];
  const count = lesson.segments.length;
  const last = v.idx === count - 1;
  const vi = v.vi ? seg.vi || '' : '';
  const done = v.answers[v.mode] || {};
  const burned = !!lesson.burnedInCaptions;
  const watching = v.mode === 'watch';
  const subtitleOn = watching && v.sub && !v.subGap && (!burned || !!vi);
  const covered = v.mode === 'dictation' && !v.coverLifted;
  const playLabel = v.playing ? <><i className="fas fa-pause" /> Dừng</> : <><i className="fas fa-play" /> Nghe</>;
  const source = `https://www.youtube.com/watch?v=${encodeURIComponent(lesson.youtubeId)}&t=${Math.floor(lesson.clipStart)}s`;
  const showViToggle = <input type="checkbox" checked={v.vi} onChange={(e) => ctrl.setOption('vi', e.target.checked)} />;

  return (
    <div id="screen-practice" className={`active${v.bigVideo ? ' sh-theater' : ''}`}>
      <div className="sh-top">
        <button className="sh-back" title="Quay lại" onClick={onBack}><i className="fas fa-arrow-left" /></button>
        <div className="sh-top-text">
          <div className="sh-title" id="sh-title">{lesson.title}</div>
          <div className="sh-sub" id="sh-sub">{CATEGORY_LABEL[lesson.category] || ''} · {lesson.channel} · {lesson.level || ''} · {count} câu</div>
          <div className={`sh-desc${descOpen ? ' open' : ''}`} id="sh-desc" title="Bấm để xem đầy đủ / thu gọn" style={lesson.description ? undefined : { display: 'none' }} onClick={() => setDescOpen((o) => !o)}>{lesson.description || ''}</div>
        </div>
        <button className="sh-size" id="sh-size" title={v.bigVideo ? 'Thu nhỏ để video, câu và nút bấm vừa một màn hình' : 'Phóng to video toàn chiều rộng'} onClick={ctrl.toggleBigVideo}>
          {v.bigVideo ? <><i className="fas fa-compress" /> Thu nhỏ video</> : <><i className="fas fa-expand" /> Video lớn</>}
        </button>
        <div className="sh-modes" role="tablist">
          <button className={`sh-mode${v.mode === 'watch' ? ' active' : ''}`} data-mode="watch" onClick={() => ctrl.setMode('watch')}><i className="fas fa-film" /> Xem video</button>
          <button className={`sh-mode${v.mode === 'shadowing' ? ' active' : ''}`} data-mode="shadowing" onClick={() => ctrl.setMode('shadowing')}><i className="fas fa-microphone" /> Shadowing</button>
          <button className={`sh-mode${v.mode === 'dictation' ? ' active' : ''}`} data-mode="dictation" onClick={() => ctrl.setMode('dictation')}><i className="fas fa-keyboard" /> Dictation</button>
        </div>
      </div>

      <div className="sh-layout">
        <div className="sh-main">
          <div className="sh-video-box">
            <div className={`sh-video${v.paused ? ' paused' : ''}`}>
              {/* YouTube replaces what's inside: React leaves this node's content alone */}
              <div ref={host} style={{ display: 'contents' }} />
              <div className={`sh-subtitle${burned ? ' top' : ''}`} id="sh-subtitle" hidden={!subtitleOn}>
                {subtitleOn && <>{!burned && <span>{seg.text}</span>}{vi && <span className="sh-subtitle-vi"><span>{vi}</span></span>}</>}
              </div>
              <button className={`sh-cc-btn${v.sub ? '' : ' off'}`} id="sh-cc-btn" type="button" hidden={!watching} title="Bật / tắt phụ đề (phím C)" onClick={(e) => { e.currentTarget.blur(); ctrl.toggleSubtitles(); }}>
                <i className="fas fa-closed-captioning" /> <span>{v.sub ? 'Phụ đề: bật' : 'Phụ đề: tắt'}</span>
              </button>
              {/* Dictation: captions on the video would give the answer away */}
              <div className="sh-video-cover" style={{ position: 'absolute', inset: 0, background: 'var(--surface2)', display: covered ? 'flex' : 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text2)', fontSize: 14, textAlign: 'center', padding: 16 }}>
                <i className="fas fa-eye-slash" style={{ fontSize: 28 }} />
                <div>Video đang được che để bạn tập trung nghe.</div>
                <button className="sh-btn sh-btn-ghost" type="button" onClick={ctrl.liftCover}>Hiện video</button>
              </div>
            </div>
          </div>

          <div className="sh-panel">
            <div className="sh-nav-row">
              <button className="sh-arrow" id="sh-prev" title="Câu trước (←)" disabled={v.idx === 0} onClick={() => ctrl.step(-1)}><i className="fas fa-chevron-left" /></button>
              <span className="sh-counter">Câu <span id="sh-cur">{v.idx + 1}</span>/<span id="sh-total">{count}</span></span>
              <button className="sh-arrow" id="sh-next" title="Câu sau (→)" disabled={last} onClick={() => ctrl.step(1)}><i className="fas fa-chevron-right" /></button>
              <button className={`sh-playall${v.continuous ? ' on' : ''}`} id="sh-playall" title="Phát liên tục từ câu này đến hết bài, transcript tự chạy theo" style={v.mode === 'shadowing' ? undefined : { display: 'none' }} onClick={ctrl.playAll}>
                {v.continuous ? <><i className="fas fa-pause" /> Dừng phát</> : <><i className="fas fa-forward" /> Phát liên tục</>}
              </button>
              <button className="sh-speed" id="sh-speed" title="Tốc độ phát" onClick={ctrl.cycleSpeed}>{SPEEDS[v.speedIdx]}x</button>
            </div>

            <div id="pane-watch" style={watching ? undefined : { display: 'none' }}>
              <div className="sh-sentence" id="wt-sentence">{seg.text}</div>
              <div className="sh-vi" id="wt-vi">{vi}</div>
              <div className="sh-actions">
                <button className="sh-btn sh-btn-primary" id="wt-play" title="Xem / tạm dừng (Space)" onClick={ctrl.watchToggle}>
                  {v.playing ? <><i className="fas fa-pause" /> Tạm dừng</> : <><i className="fas fa-play" /> Xem</>}
                </button>
                <button className="sh-btn sh-btn-ghost" title="Xem lại từ câu đầu" onClick={() => ctrl.watchFrom(0)}><i className="fas fa-rotate-left" /> Xem lại từ đầu</button>
              </div>
              <div className="sh-opts">
                <label className="sh-toggle"><input type="checkbox" id="opt-sub" checked={v.sub} onChange={(e) => ctrl.setOption('sub', e.target.checked)} /> Phụ đề trên video</label>
                <label className="sh-toggle">{showViToggle} Hiện tiếng Việt</label>
                <div className="sh-hint sh-kbd" style={{ margin: '0 0 0 auto' }}>Phím tắt: <kbd>Space</kbd> xem / tạm dừng · <kbd>←</kbd>/<kbd>→</kbd> câu trước / sau</div>
              </div>
              <Score id="wt-done" score={v.wtDone} />
            </div>

            <div id="pane-shadowing" style={v.mode === 'shadowing' ? undefined : { display: 'none' }}>
              <div className={`sh-notice${hasSpeechRecognition() ? '' : ' show'}`} id="sh-sr-notice">
                <i className="fas fa-circle-info" /> Trình duyệt này không hỗ trợ nhận diện giọng nói nên không chấm điểm được — bạn vẫn có thể ghi âm và tự nghe lại để so sánh. Hãy dùng <b>Chrome</b> hoặc <b>Edge</b> để được chấm điểm.
              </div>
              <div className={`sh-sentence${v.hide && !v.spoken ? ' masked' : ''}`} id="sh-sentence">
                {v.spoken ? <Words words={v.spoken} /> : v.hide ? maskText(seg.text) : seg.text}
              </div>
              <div className="sh-vi" id="sh-vi">{vi}</div>
              <div className="sh-interim" id="sh-interim">{v.interim}</div>
              <div className="sh-actions">
                <button className="sh-btn sh-btn-primary" id="sh-play" title="Nghe câu (Space)" onClick={ctrl.playSegment}>{playLabel}</button>
                <button className={`sh-btn sh-btn-rec${v.recording ? ' recording' : ''}`} id="sh-rec" title="Nói theo (R)" onClick={ctrl.toggleRecord}>
                  {v.recording ? <><i className="fas fa-stop" /> Dừng</> : <><i className="fas fa-microphone" /> Nói theo</>}
                </button>
                <button className="sh-btn sh-btn-ghost" id="sh-mine" disabled={!v.hasMine} title="Nghe lại giọng của bạn" onClick={ctrl.playMine}><i className="fas fa-user" /> Giọng của tôi</button>
                <button className="sh-btn sh-btn-primary" id="sh-nextbtn" disabled={last} title="Sang câu sau và nghe luôn (→)" onClick={() => ctrl.step(1)}>Câu tiếp <i className="fas fa-arrow-right" /></button>
              </div>
              <div className="sh-opts">
                <label className="sh-toggle"><input type="checkbox" id="opt-autorec" checked={v.autorec} onChange={(e) => ctrl.setOption('autorec', e.target.checked)} /> Tự ghi âm sau khi nghe xong</label>
                <label className="sh-toggle"><input type="checkbox" id="opt-hide" checked={v.hide} onChange={(e) => ctrl.setOption('hide', e.target.checked)} /> Ẩn câu (thử thách)</label>
                <label className="sh-toggle">{showViToggle} Hiện tiếng Việt</label>
                <div className="sh-hint sh-kbd" style={{ margin: '0 0 0 auto' }}>Phím tắt: <kbd>Space</kbd> nghe · <kbd>R</kbd> ghi âm · <kbd>←</kbd>/<kbd>→</kbd> chuyển câu (tự phát)</div>
              </div>
              <Score id="sh-score" score={v.shScore} />
            </div>

            <div id="pane-dictation" style={v.mode === 'dictation' ? undefined : { display: 'none' }}>
              <div className="sh-actions" style={{ marginBottom: 12 }}>
                <button className="sh-btn sh-btn-primary" id="dc-play" title="Nghe câu (Ctrl+Space)" onClick={ctrl.playSegment}>{playLabel}</button>
                <button className="sh-btn sh-btn-ghost ask-lulu" id="dc-hint-btn" ref={hintBtn} title="Hỏi Lulu gợi ý từng chữ" onClick={ctrl.toggleHint}><span className="ask-lulu-ic" /> Hỏi Lulu</button>
              </div>
              <div className="sh-sentence masked" id="dc-hint" style={{ display: v.hintOpen ? 'block' : 'none' }}>{v.hint || hintText(seg)}</div>
              <textarea className="sh-input" id="dc-input" ref={input} placeholder={seg.answer ? 'Chỉ cần gõ tên / con số bạn nghe được...' : 'Nhập những gì bạn nghe được...'}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' || e.shiftKey) return;
                  e.preventDefault();
                  if (v.dcChecked) ctrl.dcNext(); else ctrl.dcCheck();
                }}
                onPaste={(e) => { e.preventDefault(); window.showToast?.('Không thể dán văn bản vào đây — hãy nghe và gõ lại.', 'warn', 3000); }}
                onDrop={(e) => e.preventDefault()} />
              <div className="sh-hint"><kbd>Enter</kbd> kiểm tra / câu tiếp<span className="sh-kbd"> · <kbd>Ctrl</kbd>+<kbd>Space</kbd> nghe lại · <kbd>Shift</kbd>+<kbd>Enter</kbd> xuống dòng</span></div>
              <div className="sh-actions">
                <button className="sh-btn sh-btn-ghost" onClick={ctrl.dcRetry}>Làm lại</button>
                <button className="sh-btn sh-btn-primary" id="dc-check" disabled={v.dcChecked} style={v.dcChecked ? { display: 'none' } : undefined} onClick={ctrl.dcCheck}>Kiểm tra</button>
                <button className="sh-btn sh-btn-primary" id="dc-next" style={v.dcChecked && !last ? undefined : { display: 'none' }} onClick={ctrl.dcNext}>Câu tiếp <i className="fas fa-arrow-right" /></button>
              </div>
              <Score id="dc-score" score={v.dcScore} />
              <div className={`sh-diff${v.dcDiff ? ' show' : ''}`} id="dc-diff">
                {v.dcDiff && <><Words words={v.dcDiff.ref} />{v.dcDiff.extra.map((w, k) => <Fragment key={k}> <span className="w-extra">{w}</span></Fragment>)}</>}
              </div>
              <div className="sh-vi" id="dc-vi">{v.dcVi}</div>
            </div>
          </div>
          <div className="sh-credit" id="sh-credit">
            Video gốc: <a href={source} target="_blank" rel="noopener noreferrer">{lesson.sourceTitle || lesson.title}</a> — {lesson.channel}. Bản quyền thuộc kênh gốc, video được nhúng trực tiếp từ YouTube.
          </div>
        </div>

        <aside className="sh-side">
          <div className="sh-side-head"><span>Transcript</span><span id="sh-progress">{watching ? `${count} câu` : `${Object.keys(done).length}/${count} câu`}</span></div>
          <Transcript segments={lesson.segments} idx={v.idx} mode={v.mode} done={done} hide={v.hide} showVi={v.vi} onPick={ctrl.clickSentence} />
        </aside>
      </div>

      {/* Shown when a lesson opens: the click that picks also allows the video to start */}
      <div className="sh-chooser" id="sh-chooser" ref={chooser} hidden={!v.chooser} onClick={(e) => { if (e.target === e.currentTarget) ctrl.closeChooser(); }}>
        <div className="sh-chooser-box" role="dialog" aria-modal="true" aria-labelledby="sh-chooser-title">
          <h2 id="sh-chooser-title">Bạn muốn luyện bài này thế nào?</h2>
          <p className="sh-chooser-lesson" id="sh-chooser-lesson">{lesson.title}</p>
          <div className="sh-chooser-grid">
            {CHOICES.map(([mode, icon, name, text]) => (
              <button key={mode} className={`sh-choice${v.lastMode === mode ? ' last' : ''}`} data-mode={mode} type="button" onClick={() => ctrl.chooseMode(mode)}>
                <span className="sh-choice-ic">{icon}</span><b>{name}</b>
                <span>{text}</span>
              </button>
            ))}
          </div>
          <button className="sh-chooser-back" type="button" onClick={onBack}><i className="fas fa-arrow-left" /> Chọn bài khác</button>
        </div>
      </div>
    </div>
  );
}

function LessonCard({ l, onOpen }) {
  const p = l.progress || {};
  const done = l.answered || {};
  const pill = (mode, icon, name) => p[mode] != null && (
    <span className={`sh-pill ${p[mode] >= 85 ? 'good' : ''}`} title={`${name}: đã làm ${done[mode] || 0}/${l.segmentCount} câu — điểm tính trên cả bài`}><i className={`fas ${icon}`} /> {p[mode]}%</span>
  );
  return (
    <div className="sh-card" data-slug={l.slug} onClick={() => onOpen(l.slug)}>
      <div className="sh-thumb">
        <img src={`https://i.ytimg.com/vi/${encodeURIComponent(l.youtubeId)}/hqdefault.jpg`} alt="" loading="lazy" />
        <span className="sh-cat">{CATEGORY_LABEL[l.category] || l.category}</span>
        <span className="sh-dur">{fmtDur(l.duration)}</span>
      </div>
      <div className="sh-card-body">
        <div className="sh-card-title">{l.title}</div>
        {l.description && <div className="sh-card-desc">{l.description}</div>}
        <div className="sh-card-meta"><span>{l.channel}</span><span>{l.segmentCount} câu</span></div>
        <div className="sh-card-progress"><span className={`sh-pill sh-level lv-${l.level}`}>{l.level}</span>{pill('shadowing', 'fa-microphone', 'Shadowing')}{pill('dictation', 'fa-keyboard', 'Dictation')}</div>
      </div>
    </div>
  );
}

// ‹ 1 … 4 5 6 … 22 › · Trang x/y · n bài (same pager as Listening / Reading)
function Pager({ page, pages, total, onGo }) {
  if (pages <= 1) return null;
  let start = Math.max(1, page - 2);
  let end = Math.min(pages, page + 2);
  if (end - start < 4) {
    if (start === 1) end = Math.min(pages, 5); else start = Math.max(1, end - 4);
  }
  const numbers = [];
  for (let i = start; i <= end; i++) numbers.push(i);
  const btn = (p) => <button key={p} className={`pg-btn${p === page ? ' pg-active' : ''}`} data-page={p} onClick={() => onGo(p)}>{p}</button>;
  return (
    <div className="pg-wrap">
      <button className="pg-btn" data-page={page - 1} disabled={page === 1} onClick={() => onGo(page - 1)}><i className="fas fa-chevron-left" /></button>
      {start > 1 && btn(1)}
      {start > 2 && <span className="pg-ellipsis">…</span>}
      {numbers.map(btn)}
      {end < pages - 1 && <span className="pg-ellipsis">…</span>}
      {end < pages && btn(pages)}
      <button className="pg-btn" data-page={page + 1} disabled={page === pages} onClick={() => onGo(page + 1)}><i className="fas fa-chevron-right" /></button>
      <span className="pg-info">Trang {page}/{pages} · {total} bài</span>
    </div>
  );
}

export default function Shadowing() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const slug = params.get('lesson') || '';
  const [premium] = useState(() => hasPremiumAccess());
  const opening = !!slug && premium;

  const [list, setList] = useState({ status: 'loading', lessons: [] });
  const [listVersion, setListVersion] = useState(0);
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [wantedPage, setWantedPage] = useState(1);
  const [tipsOpen, setTipsOpen] = useState(() => !loadPrefs().tipsClosed);
  const [opened, setOpened] = useState(null);
  const filtersRef = useRef(null);

  useEffect(() => {
    let alive = true;
    apiFetch('/shadowing/lessons').then((d) => {
      if (alive) setList({ status: 'ready', lessons: d.lessons || [] });
    }).catch(() => {
      if (alive) setList((l) => ({ ...l, status: 'error' }));
    });
    return () => { alive = false; };
  }, [listVersion]);

  // These stay the same for the whole visit (setParams changes with the
  // address, which would reopen the lesson on every mode change).
  const closeLesson = useCallback(() => navigate('/shadowing', { replace: true }), [navigate]);
  // The list refreshes its progress once the scores are on the server
  const onLeave = useCallback((saved) => { saved.then(() => setListVersion((n) => n + 1)); }, []);
  const onModeChange = useCallback((mode) => {
    const now = window.location.search.slice(1);
    const next = new URLSearchParams(now);
    if (!next.get('lesson')) return;
    if (mode === 'shadowing') next.delete('mode'); else next.set('mode', mode);
    if (next.toString() !== now) navigate(`/shadowing?${next}`, { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!slug) return undefined;
    if (!premium) { openUpgrade(); return undefined; }
    window.scrollTo(0, 0);
    let alive = true;
    const fail = (msg) => { siteToast(msg, 'error'); closeLesson(); };
    apiFetch(`/shadowing/lessons/${encodeURIComponent(slug)}`).then((data) => {
      if (!alive) return;
      if (!data.lesson?.segments?.length) { fail('Bài này chưa có dữ liệu.'); return; }
      setOpened({ slug, lesson: data.lesson });
    }).catch(() => { if (alive) fail('Không tải được bài này.'); });
    return () => {
      alive = false;
      setOpened(null);
    };
  }, [slug, premium, closeLesson]);

  function openCard(s) {
    if (!premium) { openUpgrade(); return; }
    setParams({ lesson: s }, { replace: true });
  }
  function toggleTips(e) {
    const open = e.currentTarget.open;
    setTipsOpen(open);
    savePrefs({ tipsClosed: !open });
  }
  function goPage(p) {
    setWantedPage(p);
    filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Counts follow the other filter; a chip with nothing behind it is hidden
  const match = (l, cat, lv) => (!cat || l.category === cat) && (!lv || l.level === lv);
  const countBy = (cat, lv) => list.lessons.filter((l) => match(l, cat, lv)).length;
  const ready = list.status === 'ready';
  const shown = list.lessons.filter((l) => match(l, category, level));
  const pages = Math.ceil(shown.length / PAGE_SIZE);
  const page = Math.min(Math.max(1, wantedPage), Math.max(1, pages));
  const lesson = opened?.slug === slug ? opened.lesson : null;

  return (
    <div className="sh-wrap">
      <div id="screen-list" className={opening ? 'hidden' : undefined}>
        <div className="sh-head pf-hero pf-hero-teal" data-mascot="excited">
          <div className="pf-hero-body">
            <h1>Luyện <span className="pf-tag">Shadowing</span></h1>
            <p className="pf-hero-sub">Nghe từng câu trong video rồi nói theo (Shadowing) hoặc chép lại (Dictation). Từ video ngắn vui, TED Talks, tiếng Anh giao tiếp hằng ngày (A2–B1) đến bài nói mẫu IELTS Speaking Part 1–3 trình độ C1–C2.</p>
          </div>
        </div>

        <details className="sh-tips" id="sh-tips" open={tipsOpen} onToggle={toggleTips}>
          <summary>💡 Bí quyết: xem 1 video nhiều lần, đừng xem nhiều video 1 lần</summary>
          <ol>
            <li><b>Chọn 1 video vừa sức và luyện nó đến khi thành thạo</b> rồi mới sang bài mới. Nhại lại 1 video 5–10 lần giúp bạn tiến bộ hơn nhiều so với xem lướt 10 video.</li>
            <li><b>Lần đầu: chọn chế độ &quot;Xem video&quot;</b> để xem liền mạch kèm phụ đề Anh – Việt và hiểu nội dung.</li>
            <li><b>Những lần sau: nghe từng câu rồi nhại lại y hệt.</b> Bắt chước ngữ điệu (lên/xuống giọng), trọng âm, nối âm và chỗ ngắt nghỉ, không chỉ đọc đúng từ. Câu nhanh thì giảm tốc độ xuống 0.75x.</li>
            <li><b>Bấm &quot;Giọng của tôi&quot; để nghe lại và so với giọng gốc.</b> Sửa từng chỗ khác rồi nói lại.</li>
            <li><b>Gặp từ mới thì bấm đúp vào từ để tra nghĩa và lưu vào Sổ từ vựng.</b> Ôn lại mỗi ngày và thử dùng từ đó khi nói.</li>
            <li><b>Khi đã thuộc, bật &quot;Ẩn câu&quot; và &quot;Phát liên tục&quot;</b> để nói theo cả đoạn mà không nhìn chữ, rồi thử chép lại bằng Dictation.</li>
          </ol>
        </details>

        {!premium && (
          <div id="premium-promo-banner" style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg,rgba(229,57,53,.08),rgba(198,40,40,.06))', border: '1px solid rgba(229,57,53,.2)', borderRadius: 14, padding: '14px 18px', margin: '0 0 16px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 22 }}>⭐</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand,#e53935)', marginBottom: 2 }}>Nâng cấp Premium để luyện Shadowing</div>
              <div style={{ fontSize: 12, color: 'var(--text2,#555)' }}>Nói theo và chép chính tả từng câu với video IELTS Speaking và BBC</div>
            </div>
            <button onClick={() => openUpgrade()} style={{ background: 'linear-gradient(135deg,var(--brand,#e53935),var(--brand-dark,#c62828))', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Upgrade Premium</button>
          </div>
        )}

        <div className="sh-filters" id="sh-filters" ref={filtersRef}>
          {CATEGORY_CHIPS.map(([value, label]) => {
            const n = countBy(value, level);
            const hide = ready && !n && value && value !== category;
            return (
              <button key={value} className={`sh-chip${category === value ? ' active' : ''}`} data-cat={value} style={hide ? { display: 'none' } : undefined} onClick={() => { setCategory(value); setWantedPage(1); }}>
                {label}{ready && <span className="n">({n})</span>}
              </button>
            );
          })}
        </div>
        <div className="sh-levels" id="sh-levels">
          <span>Trình độ:</span>
          {LEVELS.map((value) => {
            const hide = ready && value && value !== level && !countBy(category, value);
            return <button key={value} className={`sh-chip${level === value ? ' active' : ''}`} data-level={value} style={hide ? { display: 'none' } : undefined} onClick={() => { setLevel(value); setWantedPage(1); }}>{value || 'Tất cả'}</button>;
          })}
        </div>

        <div id="sh-grid" className="sh-grid">
          {list.status === 'loading' && <div className="sh-loading"><i className="fas fa-spinner fa-spin" />Đang tải danh sách...</div>}
          {list.status === 'error' && <div className="sh-empty"><i className="fas fa-triangle-exclamation" />Không tải được danh sách. Vui lòng thử lại.</div>}
          {ready && !shown.length && <div className="sh-empty"><i className="fas fa-video" />Chưa có bài nào trong mục này.</div>}
          {ready && shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((l) => <LessonCard key={l.slug} l={l} onOpen={openCard} />)}
        </div>
        <div id="sh-pagination">{ready && <Pager page={page} pages={pages} total={shown.length} onGo={goPage} />}</div>
      </div>

      {opening && !lesson && (
        <div id="screen-practice" className="active">
          <div className="sh-top">
            <button className="sh-back" title="Quay lại" onClick={closeLesson}><i className="fas fa-arrow-left" /></button>
            <div className="sh-top-text"><div className="sh-title" id="sh-title">Đang tải...</div></div>
          </div>
        </div>
      )}
      {opening && lesson && <Practice key={slug} lesson={lesson} onModeChange={onModeChange} onBack={closeLesson} onLeave={onLeave} />}
    </div>
  );
}
