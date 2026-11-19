import { Fragment, useState } from 'react';
import {
  allSentencesOf, bumpMastery, DRILL_STAGES, LULU_MAX, RECALL_PASS_B7, shortTitle, stepDone,
} from '../../utils/task2Template';
import { drillRun, makeItem, stageQueue } from './runs';
import { ActivityHeader, LuluSays, NextStepButton, RoleTag } from './Parts';
import { Build, Fade, Recall } from './Items';

// ③ Luyện từng đoạn. Stage 1 build (chunks) → 2 fade (band 6+: 30% then 60%
// blanks; band 7+: 60%) → 3 recall (band 6+: letter-by-letter drill; band
// 7+: free typing). A sentence answered wrong — or right with Lulu's help —
// comes back at the end of the round (twice at most). A paragraph opens once
// the one before it has all 3 rounds.

export default function Drill({ ctx, init }) {
  const { tpl, row, isB7 } = ctx;
  const paras = tpl.paras;
  const [r, setR] = useState(init);
  const rounds = row.drillRounds || [];
  const sentence = (key) => allSentencesOf(tpl).find((s) => s.key === key);
  const masteryOf = (key) => Number((row.mastery || {})[key] || 0);

  function goPara(i) {
    const n = drillRun(ctx, i, r.id);
    if (n) { setR(n); ctx.onDone(false); }
  }

  // The item was answered (its own screen now shows feedback and "Tiếp")
  function answered(ok, hinted) {
    const it = r.queue[r.pos];
    const clean = ok && !hinted;
    let pending = r.pending;
    let firstOk = r.firstOk;
    if (it.kind === 'recall') {
      if (clean && !it.tries) { firstOk++; pending = bumpMastery(pending, it.key, 1, 3, masteryOf(it.key)); ctx.addXP(2); } else if (clean) pending = bumpMastery(pending, it.key, 0, 2, masteryOf(it.key)); else if (ok) pending = bumpMastery(pending, it.key, 0, 1, masteryOf(it.key)); else pending = bumpMastery(pending, it.key, -1, 0, masteryOf(it.key));
    } else if (ok) {
      pending = bumpMastery(pending, it.key, 0, 1, masteryOf(it.key));
    }
    const queue = !clean && it.tries < 2 ? [...r.queue, makeItem(sentence(it.key), it.kind, it.lvl, it.tries + 1)] : r.queue;
    setR({ ...r, queue, pending, firstOk, answered: true });
  }

  function next() {
    const pos = r.pos + 1;
    if (pos < r.queue.length) { setR({ ...r, pos, answered: false }); return; }
    // Round finished
    const nr = rounds.slice();
    nr[r.p] = Math.max(nr[r.p] || 0, r.stage);
    const allDone = paras.every((_, i) => (nr[i] || 0) >= 3);
    const patch = { drillRounds: nr, mastery: r.pending };
    if (allDone && !stepDone(row, 'drill')) ctx.completeStep('drill', patch); else ctx.save(patch);
    const stage = r.stage + 1;
    const base = { ...r, stage, between: true, pending: {}, answered: false };
    if (stage <= 3) setR({ ...base, queue: stageQueue(paras[r.p], stage, isB7), pos: 0, firstOk: 0 });
    else { setR({ ...base, finished: true }); ctx.onDone(true); }
  }

  const chips = paras.map((p, i) => {
    const n = Math.min(3, rounds[i] || 0);
    const locked = i > 0 && (rounds[i - 1] || 0) < 3;
    return (
      <button key={i} className={`pth-para-chip ${i === r.p ? 'active' : ''} ${n >= 3 ? 'is-done' : ''}`} disabled={locked}
        onClick={() => { if (i !== r.p) goPara(i); }}>
        {locked ? <i className="fas fa-lock" /> : n >= 3 ? <i className="fas fa-check" /> : null} {shortTitle(p.title).split(/[·–-]/)[0].trim()}
        <span className="pth-para-dots">{[1, 2, 3].map((k) => <i key={k} className={n >= k ? 'on' : ''} />)}</span>
      </button>
    );
  });

  let inner;
  if (r.between) inner = <Between ctx={ctx} r={r} rounds={rounds} onContinue={() => setR({ ...r, between: false })} onPara={goPara} />;
  else {
    const it = r.queue[r.pos];
    const s = sentence(it.key);
    const itemKey = `${r.id}-${r.stage}-${r.pos}`;
    let item;
    if (it.kind === 'build') item = <Build key={itemKey} s={s} item={it.build} onDone={answered} onNext={next} />;
    else if (it.kind === 'fade') item = <Fade key={itemKey} s={s} blanks={it.blanks} onDone={answered} onNext={next} />;
    else item = <Recall key={itemKey} s={s} free={isB7} hints={LULU_MAX} passPct={RECALL_PASS_B7} onDone={(ok, _d, hinted) => answered(ok, hinted)} onNext={next} />;
    inner = (
      <>
        <div className="pth-drill-meta">
          <span>Còn {r.queue.length - r.pos} lượt trong vòng này</span>
          <span className="pth-drill-tags"><RoleTag s={s} />{it.tries > 0 && <span className="pth-chip pth-chip--warn">Làm lại — lần này tự làm nha</span>}</span>
        </div>
        <div className="pth-vi-prompt"><i className="fas fa-quote-left" /> {s.vi}</div>
        <div id="pth-item">{item}</div>
      </>
    );
  }

  return (
    <>
      <ActivityHeader step={2} right={`Đoạn ${r.p + 1}/${paras.length}`} onBack={ctx.onBack} />
      <div className="pth-wrap">
        <div className="pth-para-chips">{chips}</div>
        <div className="pth-card">
          <div className="pth-card-title">{shortTitle(paras[r.p].title)}</div>
          <div className="pth-stages">
            {DRILL_STAGES.map((n, i) => (
              <Fragment key={n}>
                {i > 0 && <i className="fas fa-angle-right pth-flow-arr" />}
                <span className={`pth-stage ${i + 1 === r.stage ? 'active' : ''} ${i + 1 < r.stage ? 'done' : ''}`}>{i + 1}. {n}</span>
              </Fragment>
            ))}
          </div>
          {inner}
        </div>
      </div>
    </>
  );
}

function Between({ ctx, r, rounds, onContinue, onPara }) {
  const { paras } = ctx.tpl;
  const st = r.stage;
  if (st <= 3) {
    const next = st === 2 ? (ctx.isB7 ? ' — 60% số chữ bị ẩn.' : ' — ẩn 30% rồi 60% số chữ.') : st === 3 ? (ctx.isB7 ? ' — nhìn tiếng Việt, tự gõ cả câu.' : ' — nhìn tiếng Việt, gõ từng chữ (có chữ cái đầu).') : '';
    return (
      <div className="pth-between">
        <LuluSays mood="happy" stacked text={`Xong vòng ${st - 1}: ${DRILL_STAGES[st - 2]}! Tiếp theo: ${DRILL_STAGES[st - 1]}${next}`} />
        <div className="pth-actions"><button className="pth-btn pth-btn--primary" onClick={onContinue}>Tiếp tục <i className="fas fa-arrow-right" /></button></div>
      </div>
    );
  }
  const allDone = paras.every((_, i) => (rounds[i] || 0) >= 3);
  const nextP = r.p + 1 < paras.length ? r.p + 1 : -1;
  const n = paras[r.p].sentences.length;
  const pct = Math.round((r.firstOk / n) * 100);
  return (
    <div className="pth-between">
      <div className="pth-card-title">🏁 Xong đoạn {shortTitle(paras[r.p].title)}!</div>
      <LuluSays pct={pct} stacked solo={false} text={`Nhớ lại đúng ngay lần đầu, không cần tớ gợi ý: ${r.firstOk}/${n} câu. ${pct >= 80 ? 'Đỉnh quá! 🎉' : 'Luyện lại đoạn này một lần nữa sẽ nhớ chắc hơn đó!'}`} />
      <div className="pth-actions">
        <button className="pth-btn" onClick={() => onPara(r.p)}><i className="fas fa-rotate-right" /> Luyện lại đoạn này</button>
        {nextP >= 0 && !allDone && <button className="pth-btn pth-btn--primary" onClick={() => onPara(nextP)}>Đoạn tiếp theo <i className="fas fa-arrow-right" /></button>}
        {allDone && <NextStepButton stepKey="drill" onStep={ctx.onStep} onBack={ctx.onBack} />}
      </div>
    </div>
  );
}
