import { Fragment, useState } from 'react';
import {
  allSentencesOf, countWords, firstWords, LULU_MAX, OUTLINE, outlineFor, paraTarget, shortTitle, shuffleNew, stripPh,
} from '../../utils/task2Template';
import { ActivityHeader, AskBtn, En, Html, LuluSays, NextStepButton, RoleTag } from './Parts';
import { lulu } from './helpers';

// ① Khung bài — the paragraph structure, then put each paragraph's lines in order.

// The line `idx` may sit at position `pos` when it is that line, or an
// option of the same slot (book labels) — nothing else is interchangeable.
function okAt(p, idx, pos) {
  if (idx === pos) return true;
  const a = p.sentences[idx]; const b = p.sentences[pos];
  return a.alt != null && a.alt === b.alt;
}

// One paragraph to order (shuffled here, in the click that opens it)
function setupPara(paras, pi, firstTry) {
  const p = paras[pi];
  const one = p.sentences.length === 1;
  return {
    part: 'order', p: pi, pool: shuffleNew(p.sentences.map((_, i) => i)), picked: one ? [0] : [],
    checked: one ? { ok: true, wrong: [] } : null, tried: false, asks: 0, hl: null,
    firstTry: one ? Object.assign([], firstTry, { [pi]: true }) : firstTry,
  };
}

export default function Warmup({ ctx }) {
  const { tpl, typeId } = ctx;
  const paras = tpl.paras;
  const [r, setR] = useState({ part: 'intro', firstTry: [] });

  if (r.part === 'intro') {
    const hasOpt = allSentencesOf(tpl).some((s) => s.opt);
    return (
      <>
        <ActivityHeader step={0} onBack={ctx.onBack} />
        <div className="pth-wrap">
          <div className="pth-card">
            <div className="pth-card-title">🗺️ Bộ khung của dạng bài này</div>
            <p className="pth-muted">Đọc qua: mỗi đoạn có mấy câu, câu nào làm nhiệm vụ gì. Cả bài thật nên dài <b>250–300 chữ</b>.{hasOpt && <> Các câu có nhãn <span className="pth-opt">phương án</span> là lựa chọn thay nhau — khi viết bài thật chỉ chọn một.</>}</p>
            {OUTLINE[typeId] && <Html as="p" className="pth-outline-gist" html={OUTLINE[typeId].gist} />}
            <div className="pth-struct">
              {paras.map((p) => {
                const tgt = paraTarget(p.si, paras.length);
                const words = p.sentences.reduce((s, x) => s + countWords(stripPh(x.en)), 0);
                const what = outlineFor(p, typeId);
                return (
                  <div className="pth-struct-row" key={p.si}>
                    <div className="pth-struct-name">{shortTitle(p.title)}</div>
                    <div className="pth-struct-nums">
                      <span><b>{p.sentences.length}</b> câu mẫu · <b>{words}</b> chữ cố định</span>
                      <span className="pth-struct-tgt">Bài thật: {tgt.sent} · {tgt.words}</span>
                    </div>
                    {what && <Html as="div" className="pth-struct-what" html={'✍️ ' + what} />}
                    <div className="pth-flow">
                      {p.sentences.map((s, i) => (
                        <Fragment key={s.key}>
                          {i > 0 && <i className="fas fa-angle-right pth-flow-arr" />}
                          <span className="pth-flow-item"><RoleTag s={s} /></span>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pth-actions"><button className="pth-btn pth-btn--primary" onClick={() => setR(setupPara(paras, 0, []))}>Bắt đầu sắp xếp câu <i className="fas fa-arrow-right" /></button></div>
          </div>
        </div>
      </>
    );
  }

  if (r.part === 'done') {
    const score = r.score;
    return (
      <>
        <ActivityHeader step={0} onBack={ctx.onBack} />
        <div className="pth-wrap"><div className="pth-card pth-done">
          <div className="pth-card-title">🧩 Xong phần khung bài!</div>
          <LuluSays pct={score} stacked solo={false}
            text={score >= 75 ? `Xếp đúng ngay lần đầu ${score}% số đoạn — cậu nắm khung bài chắc rồi đó! 🧩` : `Xong khung bài! Xếp đúng ngay lần đầu ${score}% số đoạn. Bước ② đọc kỹ vai trò từng câu sẽ giúp nhớ thứ tự hơn nha.`} />
          <div className="pth-actions">
            <button className="pth-btn" onClick={ctx.onRestart}><i className="fas fa-rotate-right" /> Làm lại</button>
            <NextStepButton stepKey="warmup" onStep={ctx.onStep} onBack={ctx.onBack} />
          </div>
        </div></div>
      </>
    );
  }

  // part === 'order'
  const p = paras[r.p];
  const full = r.picked.length === p.sentences.length;
  const solved = r.checked && r.checked.ok;
  const pick = (idx) => { if (!r.checked && !r.picked.includes(idx)) setR({ ...r, picked: [...r.picked, idx], hl: null }); };
  const unpick = (pos) => { if (!r.checked) setR({ ...r, picked: r.picked.filter((_, i) => i !== pos) }); };
  function check() {
    const wrong = [];
    r.picked.forEach((idx, pos) => { if (!okAt(p, idx, pos)) wrong.push(pos); });
    const ok = wrong.length === 0;
    const firstTry = r.tried ? r.firstTry : Object.assign([], r.firstTry, { [r.p]: ok });
    setR({ ...r, checked: { ok, wrong }, tried: true, firstTry });
    if (ok) window.playOk?.(); else window.playWrong?.();
  }
  // Hỏi Lulu: removes a wrong pick, or points at the next line (role + opener)
  function hint(e) {
    if (r.checked || (r.asks || 0) >= LULU_MAX) return;
    const btn = e.currentTarget;
    const firstTry = Object.assign([], r.firstTry, { [r.p]: false });
    let k = 0;
    while (k < r.picked.length && okAt(p, r.picked[k], k)) k++;
    const next = { ...r, tried: true, firstTry };
    let text;
    if (k < r.picked.length) {
      next.picked = r.picked.slice(0, k);
      text = `Câu thứ ${k + 1} chưa đúng chỗ — tớ gỡ từ câu đó trở đi ra rồi, xếp lại nha 🍊`;
    } else if (k < p.sentences.length) {
      const s = p.sentences[k];
      next.hl = k;
      text = `Câu thứ ${k + 1} là câu “${s.role}”${s.opt ? ` (${s.opt})` : ''}, mở đầu bằng “${firstWords(s, 3)}…” nè — tớ tô vàng nó rồi đó!`;
    } else text = 'Xếp đủ rồi, bấm Kiểm tra thôi! 🎉';
    if (k < p.sentences.length) next.asks = (r.asks || 0) + 1;
    setR(next);
    lulu(btn, text, 'think');
  }
  // Keep the lines that were in the right place, return the rest to the pool
  function retry() {
    const keep = [];
    for (let pos = 0; pos < r.picked.length; pos++) { if (r.checked.wrong.includes(pos)) break; keep.push(r.picked[pos]); }
    setR({ ...r, picked: keep, checked: null });
  }
  const showAnswer = () => setR({ ...r, picked: p.sentences.map((_, i) => i), checked: { ok: true, wrong: [] } });
  function next() {
    if (r.p + 1 < paras.length) { setR(setupPara(paras, r.p + 1, r.firstTry)); return; }
    const score = Math.round((paras.filter((_, i) => r.firstTry[i]).length / paras.length) * 100);
    setR({ ...r, part: 'done', score });
    ctx.onDone(true);
    ctx.completeStep('warmup', { warmupScore: score });
  }

  let actions;
  if (solved) actions = <button className="pth-btn pth-btn--primary" onClick={next}>{r.p + 1 < paras.length ? 'Đoạn tiếp theo' : 'Hoàn thành'} <i className="fas fa-arrow-right" /></button>;
  else if (r.checked) actions = <><button className="pth-btn" onClick={showAnswer}><i className="fas fa-eye" /> Xem đáp án</button><button className="pth-btn pth-btn--primary" onClick={retry}><i className="fas fa-rotate-right" /> Sửa lại</button></>;
  else actions = <><AskBtn id="pth-hint" onClick={hint} left={LULU_MAX - (r.asks || 0)} /><button className="pth-btn pth-btn--primary" onClick={check} disabled={!full}><i className="fas fa-check" /> Kiểm tra</button></>;

  const pool = r.pool.filter((idx) => !r.picked.includes(idx));
  return (
    <>
      <ActivityHeader step={0} right={`Đoạn ${r.p + 1}/${paras.length}`} onBack={ctx.onBack} />
      <div className="pth-wrap">
        <div className="pth-card">
          <div className="pth-card-title">{shortTitle(p.title)} <span className="pth-chip">{p.sentences.length} câu</span></div>
          <p className="pth-muted">Bấm các câu bên dưới theo đúng thứ tự trong bản đầy đủ. Bấm lại một câu đã chọn để bỏ ra.</p>
          <div className="pth-order-slots">
            {r.picked.length ? r.picked.map((idx, pos) => {
              const st = r.checked ? (r.checked.wrong.includes(pos) ? 'is-wrong' : 'is-ok') : '';
              return (
                <button key={pos} className={`pth-sent ${st}`} disabled={!!solved} onClick={() => unpick(pos)}>
                  <span className="pth-sent-n">{pos + 1}</span><span className="pth-sent-txt"><En s={p.sentences[idx]} anchors={false} /></span>
                  {solved && <span className="pth-sent-role"><RoleTag s={p.sentences[idx]} /></span>}
                </button>
              );
            }) : <div className="pth-empty-slot">Chưa chọn câu nào</div>}
          </div>
          {pool.length > 0 && (
            <>
              <div className="pth-pool-label">Các câu cần xếp</div>
              <div className="pth-pool">
                {pool.map((idx) => (
                  <button key={idx} className={`pth-sent${r.hl === idx ? ' is-hint' : ''}`} onClick={() => pick(idx)}>
                    <span className="pth-sent-txt"><En s={p.sentences[idx]} anchors={false} /></span>
                  </button>
                ))}
              </div>
            </>
          )}
          {r.checked && !r.checked.ok && <div className="pth-fb pth-fb--bad">Chưa đúng thứ tự — các câu viền đỏ đang ở sai vị trí.</div>}
          {solved && <div className="pth-fb pth-fb--good">✅ Đúng rồi! Nhìn lại vai trò của từng câu trong đoạn.</div>}
          <div className="pth-actions">{actions}</div>
        </div>
      </div>
    </>
  );
}
