// One story: its 7 frames at a glance, Lulu, the step rail, then
// ① Đọc bài mẫu ② Từ vựng ③ Học thuộc 7 khung (🎙️ Nhại + ⌨️ Dịch) ④ Nói thử,
// "Ghi nhớ" and the pager.
import { Fragment } from 'react';
import {
  CAT_HEAD, PASS, SHADOW_PASS, STEPS, WPM, assembled, budgetClass, coachState, countOk, curFrame, firstLetters,
  fmt, frameKindTag, framesOf, mastery, pctOf, pointsOf, splitAt, targets, variantPct, vocabItems, wc, whyItems, whyNeed,
} from '../../utils/speakingPart2';
import { Meter, Sent, StepHead, SayBtn } from './Parts';
import { luluSvg } from './context';
import { canShadow } from './recorder';
import SpeakTimer from './SpeakTimer';

function FrameMap({ st, m, onScroll }) {
  const cur = curFrame(m);
  return (
    <div className="sp2-fmap" aria-label="7 khung nói">
      {framesOf(st).map((f, i) => {
        const fm = m.frames[i];
        const cls = !fm.open ? ' is-locked' : fm.pct >= PASS ? ' is-ok' : i === cur ? ' is-cur' : '';
        return (
          <button key={i} type="button" className={`sp2-fmap-i is-${f.kind}${cls}`} title={'Khung ' + (i + 1) + ' · ' + f.h + ' — đã thuộc ' + fm.pct + '%'} onClick={() => onScroll(i)}>
            <span className="sp2-fmap-n">{!fm.open ? <i className="fas fa-lock" /> : fm.pct >= PASS ? <i className="fas fa-check" /> : i + 1}</span>
            <span className="sp2-fmap-h">{f.kind === 'why' ? 'WHY' : f.h}</span>
            <span className="sp2-fmap-bar"><i style={{ width: fm.pct + '%' }} /></span>
          </button>
        );
      })}
    </div>
  );
}

// Lulu at the top of the story; a poke (or a finished step) changes her line
function Coach({ c, enter, say, onPoke }) {
  const mood = say?.mood || c.mood;
  return (
    <div className="t2-coach" id="t2-coach">
      <button key={say?.n || 0} type="button" className={`t2-coach-lulu${enter && !say ? ' is-enter' : ''}${say?.jump ? ' is-jump' : ''}`} data-mood={mood}
        onClick={onPoke} title="Bấm để nghe mẹo từ Lulu" aria-label="Lulu — bấm để nghe mẹo" dangerouslySetInnerHTML={{ __html: luluSvg(mood) }} />
      <div className="t2-coach-body">
        <div key={say?.n || 0} className={`t2-coach-bubble${enter || say ? ' is-say' : ''}`} id="t2-coach-say" role="status" aria-live="polite">{say?.text || c.text}</div>
        <div className="t2-coach-prog" aria-label={'Đã xong ' + c.n + '/' + STEPS.length + ' bước'}>
          {c.steps.map((s) => <i key={s.key} className={(s.done ? 'on' : '') + (s.key === c.cur ? ' cur' : '')} />)}
          <span>{c.n}/{STEPS.length} bước</span>
        </div>
      </div>
    </div>
  );
}

function Rail({ steps, cur, onScroll }) {
  return (
    <nav className="t2-rail" aria-label="Các bước">
      {steps.map((x, i) => (
        <button key={x.key} type="button" className={`t2-rail-item${x.done ? ' is-done' : ''}${x.key === cur ? ' is-current' : ''}`} onClick={() => onScroll(x.key)}>
          <span className="t2-rail-num">{x.done ? <i className="fas fa-check" style={{ fontSize: 9 }} /> : i + 1}</span>{x.label}
        </button>
      ))}
    </nav>
  );
}

function VariantChips({ st, p, variant, onPick }) {
  return (
    <div className="sp2-vchips" role="tablist" aria-label="Chọn đề (cue card)">
      {st.why.map((w, k) => {
        const pct = variantPct(st, p, k);
        return (
          <button key={k} type="button" role="tab" aria-selected={k === variant} className={`sp2-vchip${k === variant ? ' is-on' : ''}${pct >= PASS ? ' is-ok' : ''}`} title={w.vi} onClick={() => onPick(k)}>
            {w.q}{w.isNew && <> <span className="sp2-new">mới</span></>}{pct > 0 && <> <em>{pct}%</em></>}
          </button>
        );
      })}
    </div>
  );
}

// ① Đọc bài mẫu: the sample answer laid out as its 7 frames
function ReadStep({ st, p, isCur, ui, act }) {
  const frames = framesOf(st);
  const vi = (x) => (ui.prefs.vi ? x : null);
  return (
    <section className={`t2-step${isCur ? ' is-current' : ''}`} id="sp2-step-read">
      <StepHead num={1} title="Đọc bài mẫu theo 7 khung nói" done={!!p.read}
        extra={<button type="button" className={`t2-pill-toggle${ui.prefs.vi ? ' on' : ''}`} onClick={act.toggleVi}>Hiện tiếng Việt</button>} />
      <p className="t2-step-desc">Bài nói nào cũng đi theo 7 khung: <b>khung 1–5 (FIXED)</b> giữ nguyên với mọi đề trong nhóm → <b>khung 6 (WHY)</b> đổi theo cue card → <b>khung 7</b> kết luận. Đọc to 1–2 lần, bấm 🔊 để nghe từng câu.</p>
      <div className="t2-actions" style={{ marginBottom: 6 }}>
        <button type="button" className="t2-secondary" onClick={act.listenAll}><i className="fas fa-headphones" /> <span>Nghe cả bài</span></button>
      </div>
      <details className="sp2-read" open={isCur || ui.readOpen} onToggle={(e) => act.readOpen(e.currentTarget.open)}>
        <summary>Bài mẫu · 7 khung</summary>
        <div className="sp2-frames">
          {frames.map((f, i) => (
            <FrameBlock key={i} f={f} i={i} st={st} p={p} ui={ui} act={act} vi={vi} />
          ))}
        </div>
      </details>
      <div className="t2-actions">
        {p.read
          ? <span className="t2-step-chip ok"><i className="fas fa-check" /> Đã đọc</span>
          : <button type="button" className="t2-primary" onClick={act.markRead}><i className="fas fa-check" /> Đã đọc xong</button>}
      </div>
    </section>
  );
}
function FrameBlock({ f, i, st, p, ui, act, vi }) {
  let body;
  if (f.kind === 'why') {
    body = (
      <>
        <p className="sp2-frame-lead">Đề hỏi gì thì chọn đoạn WHY đó (Reason 1 + Example → Reason 2 + Example):</p>
        <VariantChips st={st} p={p} variant={ui.variant} onPick={act.variant} />
        <div className="sp2-frame-sents">{st.why[ui.variant].s.map((x, j) => <Sent key={j} en={x[0]} vi={vi(x[1])} />)}</div>
      </>
    );
  } else {
    body = f.parts.map((part, j) => (
      <Fragment key={j}>
        {f.parts.length > 1 && <div className="sp2-frame-sub">{part.h}</div>}
        {part.note && <div className="sp2-sec-note">💡 {part.note}</div>}
        <div className="sp2-frame-sents">{part.items.map((it) => <Sent key={it.key} en={it.en} vi={vi(it.vi)} />)}</div>
      </Fragment>
    ));
  }
  return (
    <>
      {f.kind === 'why' && <div className="sp2-divider"><span>▼ TỪ ĐÂY THAY ĐỔI THEO CUE CARD</span></div>}
      <div className={`sp2-frame is-${f.kind}`}>
        <div className="sp2-frame-h"><span className="sp2-frame-n">{i + 1}</span><b>{f.h}</b><span className="sp2-frame-tag">{frameKindTag(f)}</span></div>
        {body}
      </div>
    </>
  );
}

function Highlight({ ex, ans }) {
  const x = splitAt(ex, ans);
  return x ? <>{x[0]}<mark>{x[1]}</mark>{x[2]}</> : ex;
}

// ② Từ vựng
function VocabStep({ st, p, isCur, act }) {
  const it = vocabItems(st); const n = countOk(p, it); const done = n === it.length;
  return (
    <section className={`t2-step${isCur ? ' is-current' : ''}`} id="sp2-step-vocab">
      <StepHead num={2} title={'Từ vựng ăn điểm — Nhóm ' + st.group} done={done} />
      <p className="t2-step-desc">Ví dụ đều gắn với câu chuyện gốc — chèn thẳng vào bài nói được. Luyện: đọc nghĩa + câu ví dụ bị che, gõ lại cụm từ.</p>
      <Meter n={n} of={it.length} />
      <div className="t2-wc-row"><span className={`t2-step-chip${done ? ' ok' : ''}`}>Đã thuộc {n}/{it.length} cụm</span></div>
      <div className="t2-actions">
        <button type="button" className="t2-primary is-lg" onClick={() => act.run('vocab')}>
          <i className="fas fa-keyboard" /> {!n ? 'Luyện từ vựng' : done ? 'Luyện lại' : 'Luyện tiếp ' + (it.length - n) + ' cụm'}
        </button>
      </div>
      <details className="sp2-vlist" open={isCur}>
        <summary>Bảng Collocations – Idioms – Adjectives ({it.length})</summary>
        {['col', 'idiom', 'adj'].map((cat) => (
          <div key={cat} className="sp2-vgroup">
            <div className="sp2-vgroup-h"><b>{CAT_HEAD[cat][0]}</b> — {CAT_HEAD[cat][1]}</div>
            {st.vocab.map((v, i) => ({ v, i })).filter((x) => x.v[0] === cat).map(({ v, i }) => (
              <div key={i} className={`t2-vitem sp2-vitem${p.ok['v' + i] ? ' is-ok' : ''}`}>
                <div className="t2-vitem-main">
                  <div className="t2-vitem-term">{v[1]}<SayBtn text={v[1]} />
                    {p.ok['v' + i] && <i className="fas fa-check-circle sp2-ok-ic" title="Đã thuộc" />}</div>
                  <div className="t2-vitem-def">{v[2]}</div>
                  <div className="t2-vitem-ex"><Highlight ex={v[3]} ans={v[4]} /></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </details>
      {st.phrases && (
        <div className="sp2-callout"><b>★ {st.phrases.title}</b>
          <div className="sp2-phrases">{st.phrases.items.map((x, i) => <span key={i} className="sp2-phrase"><b>{x[0]}</b> {x[1]}</span>)}</div>
          {st.phrases.more && <p className="sp2-muted" style={{ marginTop: 6 }}>{st.phrases.more}</p>}
        </div>
      )}
    </section>
  );
}

// ③ Học thuộc theo 7 khung: 🎙️ Nhại + ⌨️ Dịch, one frame after another
function Counts({ x }) {
  return (
    <span className="sp2-rung-cnt"><span title={'Câu nhại đạt ≥' + SHADOW_PASS + '%'}>🎙️ {x.sh}/{x.n}</span>
      <span title="Câu dịch đúng">⌨️ {x.tr}/{x.n}</span></span>
  );
}
function DrillBtns({ fi, k, act }) {
  return (
    <div className="sp2-rung-btns">
      <button type="button" className="t2-primary is-sm" onClick={() => act.shadow(fi, k)}><i className="fas fa-microphone" /> Nhại</button>
      <button type="button" className="t2-secondary is-sm" onClick={() => act.run('frame', fi, k)}><i className="fas fa-keyboard" /> Dịch</button>
    </div>
  );
}
function FrameRow({ st, p, f, fm, isCur, act }) {
  const i = f.i; const locked = !fm.open; const ok = fm.pct >= PASS;
  const cls = locked ? ' is-locked' : ok ? ' is-ok' : isCur ? ' is-cur' : '';
  let body;
  if (locked) {
    body = <div className="sp2-rung-lock"><i className="fas fa-lock" /> Thuộc Khung {i} ≥{PASS}% để mở khung này</div>;
  } else if (f.kind === 'why') {
    body = (
      <div className="sp2-rung-whys">
        {st.why.map((w, k) => {
          const x = pointsOf(p, whyItems(st, k)); const pct = pctOf(x);
          return (
            <div key={k} className={`sp2-whyrow${pct >= PASS ? ' is-ok' : ''}`}>
              <div className="sp2-whyrow-main"><b>{w.q}</b>{w.isNew && <> <span className="sp2-new">mới</span></>}
                <span>{w.vi}</span><Counts x={x} /></div>
              <span className={`t2-step-chip${pct >= PASS ? ' ok' : pct ? ' mid' : ''}`}>{pct}%</span>
              <DrillBtns fi={i} k={k} act={act} />
            </div>
          );
        })}
      </div>
    );
  } else {
    body = <div className="sp2-rung-foot"><Counts x={pointsOf(p, f.items)} /><DrillBtns fi={i} k={null} act={act} /></div>;
  }
  return (
    <li className={`sp2-rung is-${f.kind}${cls}`} id={'sp2-frame-' + i}>
      <div className="sp2-rung-head">
        <span className="sp2-rung-n">{locked ? <i className="fas fa-lock" /> : ok ? <i className="fas fa-check" /> : i + 1}</span>
        <div className="sp2-rung-main"><b>Khung {i + 1} · {f.h}</b>
          <span className="sp2-rung-sub">{f.kind === 'why' ? st.why.length + ' đề · luyện ít nhất ' + whyNeed(st) + ' đề' : f.items.length + ' câu · ' + frameKindTag(f)}</span></div>
        <span className="sp2-rung-pct">{fm.pct}%</span>
      </div>
      <div className="sp2-rung-bar"><i style={{ width: fm.pct + '%' }} /></div>
      {body}
    </li>
  );
}
function LearnStep({ st, p, m, isCur, ui, act }) {
  const pass = m.pct >= PASS; const cur = curFrame(m);
  const pill = (k, label, title) => (
    <button type="button" className={`t2-pill-toggle${ui.prefs[k] ? ' on' : ''}`} title={title} onClick={() => act.pref(k)}>{label}</button>
  );
  return (
    <section className={`t2-step${isCur ? ' is-current' : ''}`} id="sp2-step-learn">
      <StepHead num={3} title="Học thuộc từng khung · Nhại & Dịch" done={pass}
        extra={<span className={`t2-step-tag${pass ? ' ok' : ''}`}>Đã thuộc {m.pct}%</span>} />
      <p className="t2-step-desc">Mỗi câu có 2 phần: 🎙️ <b>Nhại</b> — nghe câu mẫu rồi nói theo, máy chấm phát âm (đạt khi ≥{SHADOW_PASS}%); ⌨️ <b>Dịch</b> — đọc tiếng Việt, gõ lại câu tiếng Anh. Khung trước thuộc <b>≥{PASS}%</b> mới mở khung sau. Cả bài thuộc <b>≥{PASS}%</b> là <b>đạt</b> (bài tập giáo viên giao).</p>
      <div className={`sp2-pass-meter${pass ? ' is-ok' : ''}`}><span style={{ width: m.pct + '%' }} /><i style={{ left: PASS + '%' }} title={'Mốc đạt ' + PASS + '%'} /></div>
      <div className="t2-wc-row"><span className={`t2-step-chip${pass ? ' ok' : ''}`}>{pass && <><i className="fas fa-medal" /> Đạt — </>}Thuộc {m.pct}% cả bài{pass ? '' : ' · cần ≥' + PASS + '%'}</span></div>
      {!canShadow() && (
        <div className="sp2-callout is-warn" style={{ margin: '8px 0' }}><b>Trình duyệt này không ghi âm được.</b><p>Mở trang bằng Chrome, Edge hoặc Safari để luyện Nhại — phần Dịch vẫn làm được ở đây.</p></div>
      )}
      <ol className="sp2-ladder">{framesOf(st).map((f, i) => <FrameRow key={i} st={st} p={p} f={f} fm={m.frames[i]} isCur={i === cur} act={act} />)}</ol>
      <div className="t2-opts-row" style={{ marginTop: 10 }}>
        {pill('shMask', 'Che câu khi nhại', 'Nhại: che câu mẫu, chỉ hiện chữ cái đầu — nói từ trí nhớ')}
        {pill('autoNext', 'Tự chuyển câu', 'Tự chuyển câu khi làm đúng / nhại đạt')}
        {pill('shuffle', 'Xáo trộn câu', 'Dịch: xáo trộn thứ tự câu')}
      </div>
    </section>
  );
}

// ④ Ghép bài & nói thử
function BudgetCell({ lbl, n, range, noUnder }) {
  return <div className={`sp2-budget-cell${budgetClass(n, range, noUnder)}`}><b>{lbl}: {n} từ</b><span>mục tiêu {range}</span></div>;
}
function SpeakStep({ st, p, isCur, data, ui, act }) {
  const k = ui.variant; const a = assembled(st, k); const tg = targets(data);
  const fw = a.fixed.reduce((n, sec) => n + sec.s.reduce((x, s) => x + wc(s), 0), 0);
  const ww = a.why.reduce((n, s) => n + wc(s), 0);
  const cw = a.con.reduce((n, s) => n + wc(s), 0);
  const total = fw + ww + cw; const secs = (total / WPM) * 60;
  const mem = ui.memMode;
  const memText = (s) => (mem === 'letters' ? firstLetters(s) : s);
  const seg = (mode, label) => (
    <button type="button" className={mem === mode ? 'active' : ''} role="tab" aria-selected={mem === mode} onClick={() => act.mem(mode)}>{label}</button>
  );
  let body;
  if (mem === 'skeleton') {
    body = (
      <div className="sp2-skel">
        <p><b>FIXED:</b> {st.remember.fixed}</p>
        <ol>{a.fixed.map((sec, i) => <li key={i}>{sec.h}</li>)}
          <li><b>WHY — {st.why[k].q}:</b> {st.remember.flexible}</li>
          <li><b>Kết luận:</b> So overall, …</li></ol>
      </div>
    );
  } else {
    body = (
      <>
        {a.fixed.map((sec, i) => <p key={i} className="sp2-asm-p"><span className="sp2-asm-h">{i + 1} · {sec.h}</span>{sec.s.map(memText).join(' ')}</p>)}
        <p className="sp2-asm-p is-why"><span className="sp2-asm-h">{a.fixed.length + 1} · WHY · {st.why[k].q}</span>{a.why.map(memText).join(' ')}</p>
        <p className="sp2-asm-p is-con"><span className="sp2-asm-h">{a.fixed.length + 2} · Kết luận</span>{a.con.map(memText).join(' ')}</p>
      </>
    );
  }
  return (
    <section className={`t2-step${isCur ? ' is-current' : ''}`} id="sp2-step-speak">
      <StepHead num={4} title="Ghép bài & nói thử 2 phút" done={(p.speak || 0) > 0}
        extra={p.speak ? <span className="t2-step-tag ok">Đã nói {p.speak} lần</span> : null} />
      <p className="t2-step-desc">Chọn một đề, đọc lướt bài ghép, rồi bấm <b>Bắt đầu nói</b> và nói to không nhìn bài. Đồng hồ 2 phút như phòng thi — đến khoảng {fmt(tg.whyBy)} nên đang ở khung 6 (WHY).</p>
      <label className="sp2-field"><span>Đề (cue card):</span>
        <select id="sp2-variant" className="sp2-select" value={k} onChange={(e) => act.variant(+e.target.value)}>
          {st.why.map((w, i) => <option key={i} value={i}>{w.q} — {w.vi}</option>)}
        </select></label>
      <div className="sp2-budget">
        <BudgetCell lbl="FIXED" n={fw} range={tg.fixed} /><BudgetCell lbl="WHY" n={ww} range={tg.why} noUnder /><BudgetCell lbl="Kết luận" n={cw} range={tg.con} />
        <div className="sp2-budget-cell is-total"><b>{total} từ</b><span>≈ {fmt(secs)} ở {WPM} từ/phút</span></div>
      </div>
      <div className="t2-seg sp2-seg" role="tablist" aria-label="Chế độ xem bài">
        {seg('full', 'Cả bài')}{seg('letters', 'Chữ cái đầu')}{seg('skeleton', 'Chỉ 7 khung')}
      </div>
      <div className={`sp2-asm${mem === 'letters' ? ' is-letters' : ''}`} id="sp2-asm">{body}</div>
      <SpeakTimer whyBy={tg.whyBy} prefs={ui.prefs} onPref={act.pref} onSpoken={act.spoken} />
    </section>
  );
}

function Remember({ st }) {
  const r = st.remember;
  return (
    <section className="t2-step sp2-remember">
      <div className="t2-step-head"><span className="t2-step-num is-alt">📌</span><div className="t2-step-title">GHI NHỚ — chỉ cần nhớ</div></div>
      <p><b>FIXED (học thuộc):</b> {r.fixed}</p>
      <p><b>FLEXIBLE (đổi theo đề):</b> {r.flexible}</p>
      {r.map && <p><b>Ví dụ ánh xạ:</b> {r.map}</p>}
      <p><b>Đề bài dùng được:</b> {r.topics.join(' · ')}</p>
      <p><b>Mượn sang được:</b> {st.borrow}</p>
      {(st.notes || []).map((n, i) => (
        <div key={i} className={`sp2-callout${n.kind === 'warn' ? ' is-warn' : ''}`}><b>{n.kind === 'warn' ? '⚠ ' : '★ '}{n.title}</b><p>{n.text}</p></div>
      ))}
    </section>
  );
}

// enter: Lulu jumps in (the first time a story is opened, not when coming back to it)
export default function Story({ st, stories, p, data, ui, act, coachSay, enter }) {
  const coach = coachState(st, p);
  const { cur, steps } = coach;
  const m = mastery(st, p);
  const i = stories.indexOf(st);
  const prev = stories[i - 1]; const next = stories[i + 1];
  return (
    <>
      <div className="t2-nav t2-nav-row">
        <div className="t2-nav-crumb"><span onClick={act.home}>7 câu chuyện</span> › <b>{st.no} · {st.group}</b></div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="sp2-full-btn is-nav" onClick={() => act.full(st.id)}><i className="fas fa-file-alt" /> Xem full bài mẫu</button>
          <button className="t2-icon-btn" onClick={act.copyLink} title="Sao chép link" aria-label="Sao chép link"><i className="fas fa-link" /></button>
        </div>
      </div>
      <div className="t2-hub sp2-hub" style={{ '--g-c': st.color }}>
        <div className="t2-hub-head">
          <div className="t2-hub-emoji">{st.emoji}</div>
          <div style={{ minWidth: 0 }}><div className="t2-hub-kicker">Câu chuyện {st.no} · {st.group}</div>
            <h2 className="t2-hub-title">{st.title}</h2>
            <span className="sp2-rootq">Câu hỏi gốc: {st.rootQ}</span></div>
        </div>
        <div className="t2-selector-prompt sp2-skeleton"><strong>🦴 Khung xương sống (FIXED):</strong> {st.skeleton}</div>
        <FrameMap st={st} m={m} onScroll={act.scrollFrame} />
        <Coach c={coach} enter={enter} say={coachSay} onPoke={act.poke} />
        <Rail steps={steps} cur={cur} onScroll={act.scrollStep} />
        <div className="t2-phase"><span className="t2-phase-k">Giai đoạn 1</span><b>Hiểu bài</b></div>
        <ReadStep st={st} p={p} isCur={cur === 'read'} ui={ui} act={act} />
        <VocabStep st={st} p={p} isCur={cur === 'vocab'} act={act} />
        <div className="t2-phase is-class"><span className="t2-phase-k">Giai đoạn 2</span><b>Học thuộc theo 7 khung nói</b></div>
        <LearnStep st={st} p={p} m={m} isCur={cur === 'learn'} ui={ui} act={act} />
        <div className="t2-phase is-home"><span className="t2-phase-k">Giai đoạn 3</span><b>Nói</b></div>
        <SpeakStep st={st} p={p} isCur={cur === 'speak'} data={data} ui={ui} act={act} />
        <Remember st={st} />
        <div className="sp2-pager">
          {prev
            ? <button type="button" className="t2-secondary" onClick={() => act.open(prev.id)}><i className="fas fa-arrow-left" /> {prev.no} · {prev.group}</button>
            : <span />}
          {next && <button type="button" className="t2-secondary" onClick={() => act.open(next.id)}>{next.no} · {next.group} <i className="fas fa-arrow-right" /></button>}
        </div>
      </div>
    </>
  );
}
