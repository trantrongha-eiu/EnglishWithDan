import { useEffect, useRef, useState } from 'react';
import { siteToast } from '../../utils/shell';
import { applyFrames, countWords, firstWords, paraTarget, shortTitle } from '../../utils/task2Template';
import { ActivityHeader, AskBtn, En, LuluSays } from './Parts';
import { lulu } from './helpers';
import { ModelEssay } from './Guide';

// ⑤ Áp dụng đề thật — write a real essay with the frames. A checklist under
// each paragraph ticks the template frames already used (options of one
// slot count once; "tuỳ chọn" lines are a bonus); after "Nộp" it is
// compared with the model essay. The draft is saved to the account a few
// seconds after typing stops, on "Lưu nháp", and when leaving.

const stateIcon = (st) => (st === 'is-ok' ? '✓' : st === 'is-part' ? '~' : '○');

export default function Apply({ ctx }) {
  const { tpl, isB7 } = ctx;
  const paras = tpl.paras;
  const [texts, setTexts] = useState(() => paras.map((_, i) => (ctx.row.applyText || [])[i] || ''));
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const hintLvl = useRef({});
  // Latest draft for the timers and the unmount save
  const live = useRef({ texts, dirty: false, result: null });
  const saveRef = useRef(ctx.save);
  useEffect(() => { saveRef.current = ctx.save; });
  useEffect(() => { live.current.result = result; }, [result]);

  // Leaving (or closing the tab) with unsaved typing saves the draft
  useEffect(() => {
    const l = live.current;
    const flush = () => {
      if (l.dirty && !l.result) { l.dirty = false; saveRef.current({ applyText: l.texts }); }
    };
    window.addEventListener('beforeunload', flush);
    return () => { window.removeEventListener('beforeunload', flush); clearTimeout(l.timer); flush(); };
  }, []);

  const me = ctx.guides?.[ctx.typeId]?.modelEssay || null;
  const prompt = me && me.prompt
    ? <div className="pth-prompt"><div className="pth-prompt-lbl">📝 Đề bài</div>{me.prompt}</div>
    : <div className="pth-prompt">Tự chọn một đề IELTS thuộc dạng bài này và viết bài theo template.</div>;

  function input(i, v) {
    const next = texts.map((t, k) => (k === i ? v : t));
    setTexts(next);
    const l = live.current;
    l.texts = next; l.dirty = true;
    clearTimeout(l.timer);
    // Draft autosave a few seconds after the student stops typing
    l.timer = setTimeout(() => {
      if (l.dirty && !l.result) { l.dirty = false; saveRef.current({ applyText: l.texts }); setSaved(true); }
    }, 4000);
  }
  function saveDraft() {
    const l = live.current;
    l.dirty = false; clearTimeout(l.timer);
    ctx.save({ applyText: texts });
    siteToast('Đã lưu nháp vào tài khoản.', 'info', 2000);
  }
  // Hỏi Lulu: the next frame this paragraph hasn't used yet
  function hint(e, i) {
    const btn = e.currentTarget;
    const g = applyFrames(paras[i], texts[i]).find((x) => x.state !== 'is-ok' && !x.optional);
    if (!g) { lulu(btn, 'Đoạn này cậu dùng đủ các khung rồi đó! Giờ chú ý nội dung cho sát đề nha 💯', 'excited'); return; }
    const lvl = (hintLvl.current[g.id] || 0) + 1;
    hintLvl.current[g.id] = lvl;
    const s = g.best;
    const frame = s.en.replace(/\([^()]*\)/g, '(…)');
    const pick = g.options.length > 1 ? ` (chọn 1 trong ${g.options.length} phương án: ${g.options.map((o) => o.opt).join(' / ')})` : '';
    const text = !isB7 || lvl >= 2
      ? `Đoạn này còn thiếu câu “${g.role}”${pick}. Thử khung này: “${frame}” rồi điền ý của cậu vào chỗ (…) nha 🍊`
      : `Đoạn này còn thiếu câu “${g.role}”${pick} — mở đầu bằng “${firstWords(s, 3)}…”. Hỏi lần nữa tớ đọc cả khung cho!`;
    lulu(btn, text, 'think');
    document.getElementById(`pth-apply-in-${i}`)?.focus();
  }
  function submit() {
    const words = texts.reduce((s, t) => s + countWords(t), 0);
    if (words < 120) { siteToast('Bài còn quá ngắn — hãy viết ít nhất 120 chữ trước khi nộp.', 'warn', 3000); return; }
    const l = live.current;
    clearTimeout(l.timer); l.dirty = false;
    let used = 0; let total = 0;
    const resParas = paras.map((p, i) => {
      const frames = applyFrames(p, texts[i]);
      frames.forEach((f) => {
        if (f.optional && f.state !== 'is-ok') return; // bonus line — not counted when unused
        total++;
        if (f.state === 'is-ok') used++;
      });
      const tgt = paraTarget(i, paras.length);
      const n = countWords(texts[i]);
      return { title: shortTitle(p.title), text: texts[i].trim(), words: n, target: tgt.words, wcOk: n >= tgt.lo && n <= tgt.hi + 20, frames };
    });
    setResult({ words, used, total, usedPct: total ? Math.round((used / total) * 100) : 0, paras: resParas });
    ctx.onDone(true);
    ctx.completeStep('apply', { applyText: texts });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const edit = () => { setResult(null); ctx.onDone(false); };

  let body;
  if (result) {
    body = (
      <div className="pth-card">
        <LuluSays pct={result.usedPct} stacked solo={false}
          text={result.usedPct >= 70 ? `Cậu dùng ${result.used}/${result.total} khung câu — áp dụng template ngon lành rồi! Giờ so với bài mẫu để học cách triển khai ý nha 📖` : `Cậu mới dùng ${result.used}/${result.total} khung câu. Bấm “Sửa bài” rồi hỏi tớ khung còn thiếu nha — dùng đủ khung là bài mạch lạc hơn hẳn!`} />
        {prompt}
        <div className={`pth-score ${result.usedPct >= 50 ? 'is-ok' : 'is-bad'}`}>{result.words} chữ</div>
        <p className="pth-muted" style={{ textAlign: 'center' }}>Đã dùng <b>{result.used}/{result.total}</b> khung câu của bản đầy đủ{result.words < 250 && <> · bài thật cần ít nhất <b>250 chữ</b></>}</p>
        {result.paras.map((pr, i) => (
          <div className="pth-asm-para" key={i}>
            <div className="pth-read-hdr"><span>{pr.title}</span><span className={`pth-wc ${pr.wcOk ? 'is-ok' : 'is-warn'}`}>{pr.words} chữ · nên {pr.target}</span></div>
            <div className="pth-mine">{pr.text || <i className="pth-muted">(trống)</i>}</div>
            <ul className="pth-check">
              {pr.frames.map((x) => (
                <li key={x.id} className={x.state}>
                  <span className="pth-check-ic">{x.state === 'is-ok' ? '✓' : x.state === 'is-part' ? '~' : x.optional ? '·' : '✗'}</span>
                  <span className="pth-role">{x.role}</span>{x.optional && <span className="pth-opt">tuỳ chọn</span>} <span className="pth-check-en"><En s={x.best} anchors={false} /></span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {me && <ModelEssay me={me} open />}
        <div className="pth-actions">
          <button className="pth-btn" onClick={edit}><i className="fas fa-pen" /> Sửa bài</button>
          <button className="pth-btn pth-btn--primary" onClick={ctx.onBack}>Về lộ trình <i className="fas fa-arrow-right" /></button>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="pth-card">
        {prompt}
        <p className="pth-muted">Viết bài hoàn chỉnh bằng các khung câu vừa học, điền nội dung của đề vào chỗ <span className="pth-ph">(…)</span>. Bài thật cần <b>250–300 chữ</b>. Danh sách dưới mỗi ô tự đánh dấu <b>✓</b> khi bạn đã dùng một khung. Nộp xong sẽ so với bài mẫu.</p>
        {paras.map((p, i) => {
          const tgt = paraTarget(i, paras.length);
          const n = countWords(texts[i]);
          const wc = n >= tgt.lo && n <= tgt.hi + 20 ? 'is-ok' : n ? 'is-warn' : '';
          return (
            <div className="pth-asm-para" key={i}>
              <div className="pth-read-hdr">
                <span>{shortTitle(p.title)}</span>
                <span className="pth-apply-tools"><span id={`pth-wc-${i}`}><span className={`pth-wc ${wc}`}>{n} chữ · nên {tgt.words}</span></span><AskBtn id={`pth-apply-hint-${i}`} onClick={(e) => hint(e, i)} /></span>
              </div>
              <textarea className="pth-textarea" id={`pth-apply-in-${i}`} rows={i === 0 || i === paras.length - 1 ? 4 : 7} value={texts[i]}
                onChange={(e) => input(i, e.target.value)} placeholder={`${shortTitle(p.title)}...`} />
              <ul className="pth-check pth-frames" id={`pth-frames-${i}`}>
                {applyFrames(p, texts[i]).map((g) => (
                  <li key={g.id} className={g.state}>
                    <span className="pth-check-ic">{stateIcon(g.state)}</span><span className="pth-role">{g.role}</span>
                    {g.options.length > 1 ? <> <span className="pth-opt">{g.options.length} phương án</span></> : g.optional ? <> <span className="pth-opt">tuỳ chọn</span></> : null}
                    {!isB7 && <> <span className="pth-frame-cue">{firstWords(g.best, 3)}…</span></>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <div className="pth-actions">
          <span className="pth-muted pth-total">Tổng: <b id="pth-wc-total">{texts.reduce((s, t) => s + countWords(t), 0)}</b> chữ <span id="pth-autosave">{saved ? '☁️ Đã tự lưu nháp' : ''}</span></span>
          <button className="pth-btn" onClick={saveDraft}><i className="fas fa-floppy-disk" /> Lưu nháp</button>
          <button className="pth-btn pth-btn--primary" onClick={submit}><i className="fas fa-paper-plane" /> Nộp &amp; so với bài mẫu</button>
        </div>
      </div>
    );
  }
  return <><ActivityHeader step={4} onBack={ctx.onBack} />{<div className="pth-wrap">{body}</div>}</>;
}
