// ④ Nói thử: the 2-minute clock (optionally after 1 minute of preparation)
// and an optional recording to listen back to. A talk of 60 s or more
// counts as "đã nói" (onSpoken), also when the story is left mid-talk.
import { useEffect, useRef, useState } from 'react';
import { PREP_SECONDS, SPEAK_SECONDS, fmt } from '../../utils/speakingPart2';
import { siteToast } from '../../utils/shell';
import { stopTts } from './tts';

export default function SpeakTimer({ whyBy, prefs, onPref, onSpoken }) {
  const [t, setT] = useState({ phase: 'idle', left: 0, elapsed: 0, rec: false, url: null });
  const live = useRef({ phase: 'idle', t0: 0, tick: null, rec: null, stream: null, chunks: [], url: null });
  const cb = useRef({ onSpoken, prefs });
  useEffect(() => { cb.current = { onSpoken, prefs }; });

  function clearRec() {
    const L = live.current;
    if (L.rec && L.rec.state !== 'inactive') { try { L.rec.stop(); } catch { /* stopped */ } }
    if (L.stream) { L.stream.getTracks().forEach((x) => x.stop()); L.stream = null; }
  }

  // quiet: leaving the story (no celebration, no repaint)
  function stop(natural, quiet) {
    const L = live.current;
    clearInterval(L.tick); L.tick = null;
    const wasTalk = L.phase === 'talk';
    const elapsed = wasTalk ? Math.min(SPEAK_SECONDS, (Date.now() - L.t0) / 1000) : 0;
    clearRec();
    L.phase = wasTalk ? 'done' : 'idle';
    if (wasTalk && elapsed >= 60) cb.current.onSpoken(quiet);
    if (quiet) return;
    if (natural && window.playOk) window.playOk();
    setT((x) => ({ ...x, phase: L.phase, elapsed, rec: false }));
  }

  function begin(ph) {
    const L = live.current;
    clearInterval(L.tick);
    L.phase = ph;
    const total = ph === 'prep' ? PREP_SECONDS : SPEAK_SECONDS;
    L.t0 = Date.now();
    setT((x) => ({ ...x, phase: ph, left: total, rec: ph === 'prep' ? false : x.rec }));
    L.tick = setInterval(() => {
      const left = Math.max(0, total - (Date.now() - L.t0) / 1000);
      setT((x) => ({ ...x, left }));
      if (left <= 0) { if (ph === 'prep') beginTalk(); else stop(true); }
    }, 250);
  }

  function beginTalk() {
    begin('talk');
    if (!cb.current.prefs.rec) return;
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)) { siteToast('Trình duyệt này không ghi âm được', 'warn'); return; }
    const L = live.current;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
      if (L.phase !== 'talk') { s.getTracks().forEach((x) => x.stop()); return; }
      L.stream = s; L.chunks = [];
      try {
        const mr = new MediaRecorder(s);
        L.rec = mr;
        mr.ondataavailable = (e) => { if (e.data && e.data.size) L.chunks.push(e.data); };
        mr.onstop = () => {
          if (L.chunks.length) {
            L.url = URL.createObjectURL(new Blob(L.chunks, { type: mr.mimeType || 'audio/webm' }));
            const url = L.url;
            setT((x) => ({ ...x, url }));
          }
          L.rec = null;
        };
        mr.start();
        setT((x) => ({ ...x, rec: true }));
      } catch { s.getTracks().forEach((x) => x.stop()); }
    }).catch(() => siteToast('Chưa có quyền dùng micro — vẫn luyện nói được, chỉ không ghi âm', 'warn'));
  }

  function start() {
    stopTts();
    const L = live.current;
    if (L.url) { try { URL.revokeObjectURL(L.url); } catch { /* gone */ } L.url = null; }
    setT((x) => ({ ...x, url: null }));
    if (cb.current.prefs.prep) begin('prep'); else beginTalk();
  }

  // Leaving the story stops the clock (a long enough talk still counts)
  useEffect(() => () => {
    const L = live.current;
    if (L.phase === 'prep' || L.phase === 'talk') stop(false, true);
    else clearRec();
    if (L.url) { try { URL.revokeObjectURL(L.url); } catch { /* gone */ } }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ph = t.phase;
  if (ph === 'prep' || ph === 'talk') {
    const total = ph === 'prep' ? PREP_SECONDS : SPEAK_SECONDS;
    const gone = total - t.left;
    const whyHint = 'Đã ' + fmt(whyBy) + ' — phải đang ở phần WHY rồi nha!';
    const hint = ph === 'prep' ? 'Chuẩn bị — ghi vài từ khoá theo khung xương sống' : gone >= whyBy ? whyHint : 'Đang nói phần FIXED…';
    return (
      <div className="sp2-timer" id="sp2-timer">
        <div className={`sp2-timer-box is-${ph}`}>
          <div className="sp2-timer-lbl">{ph === 'prep' ? '⏳ Chuẩn bị' : '🎙️ Đang nói'}{t.rec && <> · <span className="sp2-rec-dot" /> đang ghi âm</>}</div>
          <div className="sp2-timer-num" id="sp2-timer-num">{fmt(t.left)}</div>
          <div className={`sp2-timer-bar${ph === 'talk' ? ' has-mark' : ''}`} style={{ '--why-at': ((whyBy / SPEAK_SECONDS) * 100).toFixed(1) + '%' }}>
            <i id="sp2-timer-fill" style={{ width: Math.round((gone / total) * 100) + '%' }} />
          </div>
          <div className="sp2-timer-hint" id="sp2-timer-hint">{hint}</div>
          <div className="t2-actions">
            {ph === 'prep' && <button type="button" className="t2-primary" onClick={beginTalk}><i className="fas fa-forward" /> Bắt đầu nói luôn</button>}
            <button type="button" className="t2-secondary" onClick={() => stop(false)}><i className="fas fa-stop" /> {ph === 'talk' ? 'Nói xong' : 'Huỷ'}</button>
          </div>
        </div>
      </div>
    );
  }
  const e = t.elapsed;
  return (
    <div className="sp2-timer" id="sp2-timer">
      {ph === 'done' && (
        <div className="sp2-timer-res">✅ Bạn đã nói <b>{fmt(e)}</b>
          {e < 90 ? ' — hơi ngắn, cố nói đủ 1:30–2:00 nha.' : e >= SPEAK_SECONDS ? ' — hết giờ! Giám khảo sẽ dừng bạn ở đây, đã kịp tới phần WHY chưa?' : ' — độ dài ổn!'}</div>
      )}
      {ph === 'done' && t.url && <audio controls src={t.url} className="sp2-audio" />}
      <div className="t2-actions">
        <button type="button" className="t2-primary is-lg" onClick={start}><i className="fas fa-play" /> {ph === 'done' ? 'Nói lại' : 'Bắt đầu nói'} (2:00)</button>
        <button type="button" className={`t2-pill-toggle${prefs.prep ? ' on' : ''}`} title="Có 1 phút chuẩn bị như thi thật" onClick={() => onPref('prep')}>1 phút chuẩn bị</button>
        <button type="button" className={`t2-pill-toggle${prefs.rec ? ' on' : ''}`} title="Ghi âm để nghe lại giọng mình" onClick={() => onPref('rec')}>🎙️ Ghi âm</button>
      </div>
    </div>
  );
}
