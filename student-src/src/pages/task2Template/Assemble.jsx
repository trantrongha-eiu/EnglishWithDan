import { useEffect, useState } from 'react';
import { siteToast } from '../../utils/shell';
import {
  alignWords, ASSEMBLE_PASS, bumpMastery, FIX_MAX, firstWords, fmtMMSS, LULU_MAX, OUTLINE, outlineFor, SENT_KNOWN, shortTitle,
  targetWords, TYPE_META, wordHint,
} from '../../utils/task2Template';
import { ActivityHeader, AskBtn, Diff, Html, LuluSays, NextStepButton, RoleTag } from './Parts';
import { lulu } from './helpers';

// ④ Ghép cả bài — write the template again from memory.
// Band 6+: one paragraph at a time, cue = role + first two words of each
// sentence. Band 7+: every paragraph on one screen, cue = roles only, timed.
// Pass = ≥ 70% of the sentences "thuộc" (≥ 80% of their words right).

const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// The "Sườn bài" card: the type's gist + one line per paragraph
function OutlineCard({ ctx, current = -1 }) {
  const o = OUTLINE[ctx.typeId];
  if (!o) return null;
  const meta = TYPE_META[ctx.typeId] || {};
  return (
    <details className="pth-outline" open>
      <summary>🗺️ Sườn bài dạng {meta.sub || ''} — đoạn nào viết gì?</summary>
      <Html as="p" className="pth-outline-gist" html={o.gist} />
      <ul className="pth-outline-list">
        {ctx.tpl.paras.map((p, i) => {
          const what = outlineFor(p, ctx.typeId);
          return what ? <Html key={i} as="li" className={i === current ? 'is-cur' : ''} html={`<b>${escHtml(shortTitle(p.title))}:</b> ${what}`} /> : null;
        })}
      </ul>
    </details>
  );
}

function grade(p, text) {
  const tw = targetWords(p.sentences);
  const d = alignWords(tw, text || '');
  // Per-sentence accuracy → mastery
  const per = {};
  tw.forEach((t, k) => { per[t.sid] = per[t.sid] || [0, 0]; per[t.sid][1]++; if (d.matched[k]) per[t.sid][0]++; });
  const known = Object.values(per).filter(([a, b]) => b && (a / b) * 100 >= SENT_KNOWN).length;
  const sent = p.sentences.length;
  return { ops: d.ops, pct: d.pct, right: d.matched.filter(Boolean).length, total: tw.length, per, known, sent, knownPct: sent ? Math.round((known / sent) * 100) : 0 };
}
function totals(results) {
  let right = 0; let total = 0; let sent = 0; let goodSent = 0;
  results.forEach((r) => { if (!r) return; right += r.right; total += r.total; sent += r.sent; goodSent += r.known; });
  return { right, total, sent, goodSent, knownPct: sent ? Math.round((goodSent / sent) * 100) : 0 };
}
// Sentences under the "thuộc" bar, weakest first
function weakKeys(results) {
  const rows = [];
  results.forEach((r) => r && Object.entries(r.per).forEach(([key, [a, b]]) => { if (!b || (a / b) * 100 < SENT_KNOWN) rows.push([key, b ? a / b : 0]); }));
  return rows.sort((x, y) => x[1] - y[1]).map((x) => x[0]);
}

export default function Assemble({ ctx }) {
  const { tpl, isB7 } = ctx;
  const paras = tpl.paras;
  const n = paras.length;
  const [r, setR] = useState(() => ({
    p: 0, texts: new Array(n).fill(''), results: new Array(n).fill(null), hints: new Array(n).fill(0),
    shown: Array.from({ length: n }, () => []), start: Date.now(), submitted: false, secs: 0,
  }));
  const [now, setNow] = useState(r.start);

  // Band 7+ is timed
  useEffect(() => {
    if (!isB7 || r.submitted) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isB7, r.submitted]);
  // The box being written gets the cursor
  useEffect(() => {
    if (r.submitted) return undefined;
    const t = setTimeout(() => document.querySelector('.pth-asm-in')?.focus(), 30);
    return () => clearTimeout(t);
  }, [r.p, r.submitted]);

  const setText = (i, v) => setR({ ...r, texts: r.texts.map((x, k) => (k === i ? v : x)) });
  const hintsLeft = (i) => LULU_MAX - (r.hints[i] || 0);
  // Hỏi Lulu: the next word of the paragraph that's missing
  function hint(e, i) {
    if (r.results[i]) return;
    const btn = e.currentTarget;
    if (hintsLeft(i) <= 0) { lulu(btn, 'Hết lượt gợi ý cho đoạn này rồi — viết tiếp những gì cậu nhớ nha!', 'sad'); return; }
    const shown = r.shown[i].slice();
    const res = wordHint(targetWords(paras[i].sentences), r.texts[i] || '', shown);
    if (res.done) { lulu(btn, 'Đoạn này cậu viết đủ chữ rồi đó, kiểm tra thôi! 🎉', 'excited'); return; }
    setR({ ...r, hints: r.hints.map((x, k) => (k === i ? x + 1 : x)), shown: r.shown.map((x, k) => (k === i ? shown : x)) });
    lulu(btn, res.text, 'think');
    document.getElementById(`pth-asm-${i}`)?.focus();
  }

  function finish(results) {
    const secs = Math.round((Date.now() - r.start) / 1000);
    const tot = totals(results);
    let pending = {};
    const cur = (key) => Number((ctx.row.mastery || {})[key] || 0);
    results.forEach((x) => x && Object.entries(x.per).forEach(([key, [a, b]]) => {
      const acc = b ? a / b : 1;
      if (acc >= 0.9) pending = bumpMastery(pending, key, 1, 0, cur(key));
      else if (acc < 0.6) pending = bumpMastery(pending, key, -1, 0, cur(key));
    }));
    const patch = { mastery: pending, assembleBest: tot.knownPct };
    if (tot.knownPct >= ASSEMBLE_PASS) ctx.completeStep('assemble', patch); else ctx.save(patch);
    ctx.saveAttempt({ mode: 'path', total: tot.sent, correct: tot.goodSent, timeTakenSec: secs });
    if (tot.knownPct >= ASSEMBLE_PASS) window.playOk?.();
    setR({ ...r, results, secs, submitted: true });
    ctx.onDone(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function checkPara() {
    const i = r.p;
    if (!(r.texts[i] || '').trim()) { siteToast('Hãy viết đoạn văn trước khi kiểm tra.', 'warn', 2000); return; }
    const res = grade(paras[i], r.texts[i]);
    if (res.knownPct >= ASSEMBLE_PASS) window.playOk?.(); else window.playWrong?.();
    setR({ ...r, results: r.results.map((x, k) => (k === i ? res : x)) });
  }
  function nextPara() {
    if (r.p + 1 < n) { setR({ ...r, p: r.p + 1 }); return; }
    finish(r.results);
  }
  function submitAll() {
    if (r.texts.every((t) => !t.trim())) { siteToast('Bạn chưa viết gì.', 'warn', 2000); return; }
    finish(paras.map((p, i) => grade(p, r.texts[i])));
  }

  function box(i) {
    const p = paras[i];
    const res = r.results[i];
    const what = outlineFor(p, ctx.typeId);
    return (
      <div className="pth-asm-para" key={i}>
        <div className="pth-read-hdr">
          <span>{shortTitle(p.title)} <span className="pth-chip">{p.sentences.length} câu</span></span>
          {res
            ? <span className={`pth-chip ${res.knownPct >= ASSEMBLE_PASS ? 'pth-chip--ok' : 'pth-chip--warn'}`}>Thuộc {res.known}/{res.sent} câu · {res.knownPct}%{r.hints[i] ? ` · ${r.hints[i]} gợi ý` : ''}</span>
            : <AskBtn id={`pth-asm-hint-${i}`} onClick={(e) => hint(e, i)} label={`Hỏi Lulu (${hintsLeft(i)})`} disabled={hintsLeft(i) <= 0} />}
        </div>
        {isB7 && !res && what && <Html as="div" className="pth-struct-what" html={'✍️ ' + what} />}
        <ol className="pth-cues">
          {p.sentences.map((s) => <li key={s.key}><RoleTag s={s} />{!isB7 && <> — <i>{firstWords(s, 2)}…</i></>}</li>)}
        </ol>
        {res ? <div className="pth-diff pth-diff--box"><Diff ops={res.ops} /></div>
          : <textarea className="pth-textarea pth-asm-in" id={`pth-asm-${i}`} rows={Math.max(4, p.sentences.length + 1)} value={r.texts[i]}
            placeholder="Viết lại cả đoạn từ trí nhớ... (bỏ qua phần trong ngoặc)" onChange={(e) => setText(i, e.target.value)} />}
      </div>
    );
  }

  const right = isB7
    ? <span className="pth-timer"><i className="fas fa-stopwatch" /> <span id="pth-asm-time">{fmtMMSS(((r.submitted ? r.start + r.secs * 1000 : now) - r.start) / 1000)}</span></span>
    : `Đoạn ${Math.min(r.p + 1, n)}/${n}`;
  let body;
  if (r.submitted) {
    const tot = totals(r.results);
    const pass = tot.knownPct >= ASSEMBLE_PASS;
    const weak = weakKeys(r.results);
    const hintTotal = r.hints.reduce((a, b) => a + b, 0);
    body = (
      <div className="pth-card pth-done">
        <LuluSays pct={tot.knownPct} stacked solo={false}
          text={pass ? `Thuộc ${tot.knownPct}% số câu — cậu viết lại được cả bài từ trí nhớ rồi! 🎉` : `Thuộc ${tot.knownPct}% số câu, cần ≥ ${ASSEMBLE_PASS}%. Mình luyện riêng ${weak.length} câu chưa thuộc rồi ghép lại nha — sẽ lên nhanh lắm!`} />
        <div className={`pth-score ${pass ? 'is-ok' : 'is-bad'}`}>{tot.knownPct}%</div>
        <p className="pth-muted" style={{ textAlign: 'center' }}>Thuộc <b>{tot.goodSent}/{tot.sent}</b> câu (một câu được tính là thuộc khi đúng ≥ {SENT_KNOWN}% số chữ) · nhớ đúng {tot.right}/{tot.total} chữ{r.secs ? ` · ⏱ ${fmtMMSS(r.secs)}` : ''}{hintTotal ? ` · 🍊 ${hintTotal} gợi ý` : ''}</p>
        <div className="pth-legend"><span className="pth-d-ok">đúng</span> <span className="pth-d-wrong">sai</span><span className="pth-d-fix">đáp án</span> <span className="pth-d-miss">thiếu</span> <span className="pth-d-extra">thừa</span></div>
        {paras.map((p, i) => box(i))}
        <div className="pth-actions">
          {weak.length > 0 && <button className={`pth-btn ${pass ? '' : 'pth-btn--primary'}`} onClick={() => ctx.onFix(weak, 'assemble')}><i className="fas fa-crosshairs" /> Luyện lại {Math.min(FIX_MAX, weak.length)} câu chưa thuộc</button>}
          <button className="pth-btn" onClick={ctx.onRestart}><i className="fas fa-rotate-right" /> Làm lại</button>
          {pass && <NextStepButton stepKey="assemble" onStep={ctx.onStep} onBack={ctx.onBack} />}
        </div>
      </div>
    );
  } else if (isB7) {
    body = (
      <div className="pth-card">
        <p className="pth-muted">Viết lại toàn bộ template từ trí nhớ, mỗi ô một đoạn. Chỉ có vai trò của từng câu làm gợi ý. Không cần gõ phần trong ngoặc. Mỗi đoạn được hỏi Lulu {LULU_MAX} lần.</p>
        <OutlineCard ctx={ctx} />
        {paras.map((p, i) => box(i))}
        <div className="pth-actions"><button className="pth-btn pth-btn--primary" onClick={submitAll}><i className="fas fa-paper-plane" /> Nộp bài</button></div>
      </div>
    );
  } else {
    const res = r.results[r.p];
    body = (
      <div className="pth-card">
        <p className="pth-muted">Viết lại cả đoạn từ trí nhớ. Gợi ý: vai trò và 2 chữ đầu của mỗi câu. Không cần gõ phần trong ngoặc. Bí từ nào thì hỏi Lulu ({LULU_MAX} lần mỗi đoạn).</p>
        <OutlineCard ctx={ctx} current={r.p} />
        {box(r.p)}
        <div className="pth-actions">
          {res ? <button className="pth-btn pth-btn--primary" onClick={nextPara}>{r.p + 1 < n ? 'Đoạn tiếp theo' : 'Xem kết quả'} <i className="fas fa-arrow-right" /></button>
            : <button className="pth-btn pth-btn--primary" onClick={checkPara}><i className="fas fa-check" /> Kiểm tra đoạn này</button>}
        </div>
      </div>
    );
  }
  return <><ActivityHeader step={3} right={right} onBack={ctx.onBack} /><div className="pth-wrap">{body}</div></>;
}
