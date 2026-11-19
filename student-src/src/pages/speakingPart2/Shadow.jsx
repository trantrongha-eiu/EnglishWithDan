// 🎙️ Nhại: listen to a sentence → say it → scored like Shadowing (share of
// the sentence's words heard). Best score per sentence is kept. Then the
// result screen of the frame.
import { Fragment, useEffect, useRef, useState } from 'react';
import { SHADOW_PASS, gradeTake, maskWords, scoreClass } from '../../utils/speakingPart2';
import { LuluSays, RunHead, Sent } from './Parts';
import { IS_ANDROID, IS_IOS, IS_ZALO, canShadow, createRecorder } from './recorder';
import { speak, stopTts } from './tts';

// Step-by-step mic fixes for the device the student is on
function MicHelp() {
  let steps;
  if (IS_IOS && IS_ZALO) steps = [<>Mở <b>Cài đặt</b> iPhone → <b>Zalo</b> → bật <b>Micrô</b>.</>, <>Hoặc bấm <b>⋯</b> góc trên → <b>Mở bằng trình duyệt</b> (Safari) rồi thử lại.</>];
  else if (IS_IOS) steps = [<>Bấm <b>aA</b> (hoặc biểu tượng ở thanh địa chỉ) → <b>Cài đặt trang web</b> → <b>Micrô</b> → <b>Cho phép</b>.</>, <>Hoặc vào <b>Cài đặt</b> iPhone → <b>Safari</b> → <b>Micrô</b> → <b>Cho phép</b>, rồi tải lại trang.</>, <>Tắt chế độ im lặng không ảnh hưởng — nhưng hãy ngắt tai nghe Bluetooth nếu đang kết nối.</>];
  else if (IS_ANDROID) steps = [<>Bấm biểu tượng <b>ⓘ / ổ khóa</b> cạnh địa chỉ web → <b>Quyền</b> → <b>Micrô</b> → <b>Cho phép</b>.</>, <>Đang mở trong Zalo/Facebook? Bấm <b>⋮</b> → <b>Mở bằng Chrome</b>.</>, <>Kiểm tra không có app khác (gọi điện, ghi âm) đang dùng micro.</>];
  else steps = [<>Bấm biểu tượng <b>ổ khóa</b> cạnh địa chỉ web → <b>Micrô</b> → <b>Cho phép</b>, rồi tải lại trang.</>, <>Kiểm tra đúng micro trong <b>Cài đặt âm thanh</b> của máy, và micro không bị tắt tiếng.</>, <>Đóng Zoom / Meet / Teams nếu đang mở — các app đó có thể giữ micro.</>];
  return (
    <>
      <b className="sp2-sh-help-h"><i className="fas fa-screwdriver-wrench" /> Cách bật micro</b>
      <ol>{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      <p className="sp2-sh-help-note">Bấm micro xong mà vòng tròn quanh nút <b>không rung</b> theo giọng bạn = máy chưa nhận được tiếng.</p>
    </>
  );
}

function ScoreBox({ score }) {
  if (!score) return <div className="sp2-sh-score" id="sp2-sh-score" aria-live="polite" />;
  return (
    <div className={`sp2-sh-score show ${score.cls}`} id="sp2-sh-score" aria-live="polite">
      {score.pct != null
        ? <span className="sp2-sh-ring" style={{ '--p': score.pct }}><b>{score.pct}<small>%</small></b></span>
        : <span className="sp2-sh-ring is-ico"><i className="fas fa-microphone-slash" /></span>}
      <span className="sp2-sh-score-txt"><strong>{score.title}</strong>{score.sub && <small>{score.sub}</small>}</span>
    </div>
  );
}

const STEP_ORDER = ['listen', 'say', 'score'];

// sh: { f, k, label, qs }. p: this story's progress; onScore(q, pct) saves a better score.
export default function Shadow({ st, sh, prefs, onPref, p, frameMastery, onScore, onQuit, onDich, onNextFrame, onBack, onWeak }) {
  const ok = canShadow();
  const idle = ok ? '' : 'Mở trang bằng Chrome, Edge hoặc Safari để nhại nha.';
  const [idx, setIdx] = useState(0);
  const [runSc, setRunSc] = useState({});   // this run: best score per sentence
  const [said, setSaid] = useState({});     // this run: last take per sentence
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [step, setStep] = useState(null);
  const [interim, setInterim] = useState(idle);
  const [score, setScore] = useState(null);
  const [result, setResult] = useState(null); // { words } of the take on screen
  const [help, setHelp] = useState(false);
  const [mine, setMine] = useState(false);
  const wrapRef = useRef(null);
  const autoT = useRef(null);
  const keysRef = useRef({ next: () => {}, mic: () => {} }); // keys and timers call the latest handlers
  const liveRef = useRef({ idx: 0, done: false, sh, prefs, onScore });
  useEffect(() => { liveRef.current = { idx, done, sh, prefs, onScore }; });

  const q = sh.qs[idx];

  // The take on screen gets graded: words in colour, the score and the step
  function showResult(qq, text, pct, restored) {
    const g = gradeTake(qq.en, text);
    setResult({ words: g.words });
    setInterim('Máy nghe được: “' + text + '”');
    const cls = scoreClass(pct); const passed = pct >= SHADOW_PASS;
    const msg = cls === 'good' ? 'Tuyệt vời!' : passed ? 'Đạt rồi — luyện thêm các từ màu đỏ.' : 'Chưa đạt ' + SHADOW_PASS + '% — nghe lại rồi thử thêm lần nữa nhé.';
    const miss = g.total - g.hits;
    setScore({ cls, title: (restored ? 'Lần này: ' : '') + msg, sub: 'Đúng ' + g.hits + '/' + g.total + ' từ' + (miss ? ' · ' + miss + ' từ đỏ cần luyện' : '') + '. Bấm “Giọng tôi” để so với câu mẫu.', pct });
    setStep('score');
  }

  const [rec] = useState(createRecorder);
  useEffect(() => rec.setUi({
    active: () => !liveRef.current.done,
    phase: (ph) => {
      setPhase(ph);
      if (wrapRef.current) wrapRef.current.style.setProperty('--lvl', 0);
      if (ph === 'rec') setStep('say');
    },
    interim: (t) => setInterim(t),
    level: (v) => { if (wrapRef.current) wrapRef.current.style.setProperty('--lvl', v); },
    mine: (has) => setMine(has),
    failed: (title, sub) => setScore({ cls: 'low', title, sub }),
    noVoice: ({ denied, noMic, silent }) => {
      if (denied) { setScore({ cls: 'low', title: 'Trình duyệt đang chặn micro', sub: 'Làm theo hướng dẫn bên dưới để cho phép micro, rồi thử lại.' }); setHelp(true); return; }
      if (noMic) { setScore({ cls: 'low', title: 'Không mở được micro', sub: 'Máy không có micro, hoặc app khác (Zalo call, Zoom…) đang dùng micro.' }); setHelp(true); return; }
      setScore({ cls: 'low', title: 'Chưa nghe thấy bạn nói', sub: silent ? 'Micro không thu được tiếng nào — nói to hơn, gần micro hơn, hoặc xem cách bật micro bên dưới.' : 'Bấm micro rồi đọc to câu trên, gần micro hơn một chút.' });
      if (silent) setHelp(true);
    },
    heard: (text) => {
      const L = liveRef.current;
      const qq = L.sh.qs[L.idx];
      const g = gradeTake(qq.en, text);
      setRunSc((x) => ({ ...x, [qq.key]: Math.max(x[qq.key] || 0, g.pct) }));
      setSaid((x) => ({ ...x, [qq.key]: text }));
      L.onScore(qq, g.pct);
      showResult(qq, text, g.pct, false);
      if (g.pct >= 85 && window.playOk) window.playOk();
      if (g.pct >= SHADOW_PASS && L.prefs.autoNext) { clearTimeout(autoT.current); autoT.current = setTimeout(() => keysRef.current.next(), 1800); }
    },
  }));

  // Another sentence: its take of this run comes back, or the sample plays once
  function go(i) {
    if (i < 0 || i >= sh.qs.length) return;
    clearTimeout(autoT.current);
    rec.reset(); stopTts();
    setMine(false); setHelp(false); setScore(null); setResult(null); setStep(null); setInterim(idle);
    setIdx(i);
    const qq = sh.qs[i];
    if (runSc[qq.key] != null && said[qq.key] != null) showResult(qq, said[qq.key], runSc[qq.key], true);
  }
  function goNext() {
    if (done) return;
    if (idx >= sh.qs.length - 1) {
      clearTimeout(autoT.current);
      rec.reset(); stopTts();
      setDone(true);
      window.scrollTo(0, 0);
      return;
    }
    go(idx + 1);
  }
  function toggleMic() {
    if (rec.on) { rec.stop(); return; }
    if (rec.busy || !ok) return;
    stopTts();
    clearTimeout(autoT.current);
    setScore(null);
    rec.start(q.en, idx);
  }
  function listen(rate) {
    if (rec.busy) return;
    rec.stop(true);
    setStep('listen');
    speak([q.en], { rate });
  }
  useEffect(() => { keysRef.current = { next: goNext, mic: toggleMic }; });

  // A sentence not yet said in this run plays its sample once
  const fresh = !done && !(runSc[q.key] != null && said[q.key] != null);
  useEffect(() => {
    if (!fresh) return undefined;
    const t = setTimeout(() => {
      if (rec.on) return;
      setStep('listen');
      speak([sh.qs[idx].en]);
    }, 250);
    return () => clearTimeout(t);
  }, [idx, done]); // eslint-disable-line react-hooks/exhaustive-deps

  // Leaving the screen stops the mic, the voice and the clock
  useEffect(() => () => { clearTimeout(autoT.current); rec.dispose(); stopTts(); }, [rec]);

  // Space = mic on/off (a focused button keeps its own Space); Enter = next sentence
  useEffect(() => {
    if (done) return undefined;
    const onKey = (e) => {
      const tag = e.target?.tagName || '';
      if (e.key === 'Enter' && !/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(tag)) { e.preventDefault(); keysRef.current.next(); return; }
      if ((e.key === ' ' || e.code === 'Space') && !e.repeat && !/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(tag)) { e.preventDefault(); keysRef.current.mic(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [done]);

  if (done) {
    const rows = sh.qs.map((x) => ({ q: x, run: runSc[x.key], best: p.shadow[x.key] || 0 }));
    const tried = rows.filter((x) => x.run != null);
    const avg = tried.length ? Math.round(tried.reduce((a, x) => a + x.run, 0) / tried.length) : 0;
    const weak = rows.filter((x) => x.best < SHADOW_PASS);
    const { fm, nextF } = frameMastery(sh.f);
    const mood = !weak.length ? 'cheer' : avg >= 60 ? 'happy' : 'think';
    const line = !weak.length ? 'Cả khung nhại đạt hết rồi! Giờ thử ⌨️ Dịch khung này nha 🎉' : tried.length ? 'Còn ' + weak.length + ' câu chưa đạt ' + SHADOW_PASS + '% — nhại lại mấy câu đó là xong 💪' : 'Cậu chưa nhại câu nào — bấm “Nói theo” để máy chấm nha 🍊';
    return (
      <div className="t2-done sp2-done">
        <LuluSays text={line} mood={mood} />
        <div className="t2-done-score">{avg}%</div>
        <div className="t2-done-sub">{sh.label} · điểm phát âm trung bình lần này</div>
        <div className="t2-done-stats">
          <div className="t2-done-stat"><div className="t2-done-stat-num">{rows.length - weak.length}/{rows.length}</div><div className="t2-done-stat-lbl">Câu nhại đạt</div></div>
          <div className="t2-done-stat"><div className="t2-done-stat-num">{fm.pct}%</div><div className="t2-done-stat-lbl">Khung {sh.f + 1} đã thuộc</div></div>
        </div>
        <div className="sp2-shlist">
          {rows.map((x) => {
            const c = x.best >= SHADOW_PASS ? 'is-ok' : x.best ? 'is-mid' : '';
            return <Sent key={x.q.key} en={x.q.en} vi={x.q.vi}><span className={`sp2-shlist-pct ${c}`}>{x.best ? x.best + '%' : '—'}</span></Sent>;
          })}
        </div>
        <div className="t2-actions" style={{ justifyContent: 'center' }}>
          {weak.length > 0 && <button type="button" className="t2-primary is-lg" onClick={() => onWeak(weak.map((x) => x.q))}><i className="fas fa-redo-alt" /> Nhại lại câu chưa đạt ({weak.length})</button>}
          <button type="button" className={weak.length ? 't2-secondary' : 't2-primary is-lg'} onClick={() => onDich(sh.f, sh.k)}><i className="fas fa-keyboard" /> Dịch khung này</button>
          {nextF && nextF.open && <button type="button" className="t2-secondary" onClick={() => onNextFrame(sh.f + 1)}><i className="fas fa-microphone" /> Nhại khung {sh.f + 2}</button>}
          <button type="button" className="t2-secondary" onClick={onBack}><i className="fas fa-arrow-left" /> Về câu chuyện</button>
        </div>
      </div>
    );
  }

  const best = p.shadow[q.key];
  const pct = Math.round(((idx + 1) / sh.qs.length) * 100);
  const last = idx >= sh.qs.length - 1;
  const graded = runSc[q.key] != null;
  const masked = prefs.shMask && !graded && !result;
  const side = (onClick, icon, label, extra = {}) => (
    <button type="button" className="sp2-sh-side" onClick={onClick} {...extra}>
      <span className="sp2-sh-ico"><i className={`fas ${icon}`} /></span><span className="sp2-sh-lbl">{label}</span>
    </button>
  );
  const pill = (k, label, title) => (
    <button type="button" className={`sp2-sh-pill${prefs[k] ? ' on' : ''}`} aria-pressed={!!prefs[k]} title={title} onClick={() => onPref(k)}>{label}</button>
  );
  const at = STEP_ORDER.indexOf(step);
  const stepCls = (i) => [i === at ? 'is-on' : '', at > -1 && i < at ? 'is-done' : ''].filter(Boolean).join(' ') || undefined;
  return (
    <>
      <RunHead story={st} label={sh.label} onQuit={onQuit} />
      <div className="wp-progress-bar-wrap"><div className="wp-progress-bar" style={{ width: pct + '%' }} /></div>
      <div className="t2-q-dots">
        {sh.qs.map((x, i) => {
          const sc = runSc[x.key] != null ? runSc[x.key] : null;
          const c = sc == null ? (i === idx ? 't2-dot-current' : '') : sc >= SHADOW_PASS ? 't2-dot-ok' : 't2-dot-err';
          const lbl = 'Câu ' + (i + 1) + (sc != null ? ' · ' + sc + '%' : '');
          return <button key={i} type="button" className={`t2-q-dot ${c}`} aria-label={lbl} title={lbl} onClick={() => go(i)} />;
        })}
      </div>
      <div className="sp2-sh-wrap" style={{ '--g-c': st.color }}>
        <div className="sp2-shcard">
          <div className="sp2-sh-top">
            <span className="sp2-sh-count">Câu <b>{idx + 1}</b> / {sh.qs.length}</span>
            <span className="sp2-sh-ctx">{q.ctx}</span>
            {best != null && (
              <span className={`sp2-sh-best${best >= SHADOW_PASS ? ' is-ok' : ''}`} title="Điểm nhại cao nhất của câu này">
                {best >= SHADOW_PASS && <><i className="fas fa-check" /> </>}Cao nhất {best}%
              </span>
            )}
          </div>
          <ol className="sp2-sh-steps" id="sp2-sh-steps" aria-hidden="true">
            <li className={stepCls(0)}><span>1</span>Nghe mẫu</li>
            <li className={stepCls(1)}><span>2</span>Nói theo</li>
            <li className={stepCls(2)}><span>3</span>Xem điểm</li>
          </ol>
          <div className="sp2-sh-stage">
            <div className={`sp2-sh-sent${masked ? ' is-masked' : ''}`} id="sp2-sh-sent" lang="en">
              {result
                ? result.words.map((w, k) => <Fragment key={k}>{k > 0 && ' '}<span className={w.hit ? 'w-match' : 'w-miss'}>{w.w}</span></Fragment>)
                : masked ? maskWords(q.en) : q.en}
            </div>
            {prefs.vi && <div className="sp2-sh-vi">{q.vi}</div>}
          </div>
          <div className="sp2-sh-ctrl">
            {side(() => listen(), 'fa-volume-up', 'Nghe')}
            {side(() => listen(0.7), 'fa-walking', 'Nghe chậm')}
            <div ref={wrapRef} className={`sp2-sh-micwrap${phase === 'rec' ? ' is-rec' : ''}${phase === 'busy' ? ' is-busy' : ''}`} id="sp2-sh-micwrap">
              <span className="sp2-sh-lvl" aria-hidden="true" />
              <button type="button" className="sp2-sh-mic" id="sp2-sh-rec" aria-label={phase === 'rec' ? 'Dừng' : 'Nói theo'} disabled={phase === 'busy' || !ok} onClick={toggleMic}>
                <i className={phase === 'rec' ? 'fas fa-stop' : phase === 'busy' ? 'fas fa-spinner fa-spin' : 'fas fa-microphone'} />
              </button>
            </div>
            {side(() => { stopTts(); rec.playMine(); }, 'fa-user', 'Giọng tôi', { id: 'sp2-sh-mine', disabled: !mine, title: 'Nghe lại giọng của bạn' })}
          </div>
          <div className="sp2-sh-miclbl" id="sp2-sh-miclbl">
            {!ok ? 'Trình duyệt này không ghi âm được' : phase === 'rec' ? 'Đang nghe… nói xong bấm để dừng' : phase === 'busy' ? 'Đang chấm…' : 'Bấm micro rồi đọc to câu trên'}
          </div>
          <div className="sp2-sh-interim" id="sp2-sh-interim" aria-live="polite">{interim}</div>
          <ScoreBox score={score} />
          <div className="sp2-sh-help" id="sp2-sh-help" hidden={!help}><MicHelp /></div>
          <div className="sp2-sh-foot">
            <div className="sp2-sh-pills">
              {pill('shMask', <><i className="fas fa-eye-slash" /> Che câu</>, 'Che câu mẫu, chỉ hiện chữ cái đầu — nói từ trí nhớ')}
              {pill('vi', <><i className="fas fa-language" /> Tiếng Việt</>, 'Hiện nghĩa tiếng Việt')}
              {pill('autoNext', <><i className="fas fa-forward" /> Tự chuyển câu</>, 'Nhại đạt thì tự sang câu tiếp')}
            </div>
            <button type="button" className="sp2-sh-helpbtn" onClick={() => setHelp((h) => !h)}><i className="fas fa-circle-question" /> Micro không thu được tiếng?</button>
          </div>
        </div>
        <div className="sp2-sh-nav">
          <button type="button" className="t2-secondary" disabled={!idx} onClick={() => go(idx - 1)}><i className="fas fa-arrow-left" /> <span>Câu trước</span></button>
          <button type="button" className="t2-primary" onClick={goNext}><span>{last ? 'Xem kết quả' : 'Câu tiếp'}</span> <i className="fas fa-arrow-right" /></button>
        </div>
        <p className="sp2-sh-kbd">Mẹo: <kbd>Space</kbd> bật/tắt micro · <kbd>Enter</kbd> sang câu tiếp</p>
      </div>
    </>
  );
}
