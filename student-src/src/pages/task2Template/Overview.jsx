import {
  allSentencesOf, ASSEMBLE_PASS, FIX_MAX, knownCount, reviewDue, STEP_KEYS, STEPS, stepUnlocked, TYPE_META, weakSentences,
} from '../../utils/task2Template';
import { LuluSays } from './Parts';

// The path of one essay type: Lulu's tip, homework, Ôn nhanh / câu yếu
// cards, the 5 steps, and "Làm lại từ đầu".

// What Lulu suggests next
function coachLine(ctx, homework) {
  const { row, tpl, typeId } = ctx;
  const firstOpen = STEP_KEYS.findIndex((k) => !(row.steps || {})[k]);
  const weak = weakSentences(row, tpl);
  const known = knownCount(row, tpl); const total = allSentencesOf(tpl).length;
  if (!ctx.guideOk) return { mood: 'think', text: `Trước khi luyện, đọc “Hướng dẫn dạng bài này” ở trên và làm quiz từng mục (đúng ≥ 90%) nha — đã qua ${ctx.guideDone}/6 mục. Nhất là 🔍 Nhận diện đề: nhìn đề là biết dạng gì, cần viết gì!` };
  if (reviewDue(row)) return { mood: 'think', text: 'Đến hạn ôn rồi nè! Ôn nhanh 3 phút bây giờ thì mấy câu template sẽ nằm trong đầu lâu hơn nhiều đó 🔔' };
  if (homework.some((h) => h.typeId === typeId && h.level === ctx.level && !h.completed) && firstOpen >= 0) return { mood: 'wink', text: `Cô/thầy giao dạng này làm bài về nhà đó. Mình làm tiếp bước ${STEPS[firstOpen].num} ${STEPS[firstOpen].title} nha 📌` };
  if (firstOpen === 0 && !(row.drillRounds || []).some(Boolean)) return { mood: 'excited', text: `Chào cậu! Tớ là Lulu 🍊 Dạng này có ${total} câu mẫu. Bắt đầu với ① Khung bài nha — chỉ 3 phút thôi!` };
  if (weak.length >= 3 && firstOpen !== 0) return { mood: 'think', text: `Có ${weak.length} câu cậu hay quên. Luyện câu yếu 3–5 phút rồi đi tiếp sẽ nhớ chắc hơn đó!` };
  if (firstOpen >= 0) return { mood: 'happy', text: `Cậu thuộc ${known}/${total} câu rồi! Bước tiếp theo: ${STEPS[firstOpen].num} ${STEPS[firstOpen].title}. Bí chỗ nào cứ bấm “Hỏi Lulu” nha.` };
  return { mood: 'cheer', text: 'Cậu xong cả lộ trình rồi, giỏi quá! Thử Thi thử để xem còn nhớ bao nhiêu, hoặc viết thêm một bài ở bước ⑤ nha 🏆' };
}

// A teacher can assign one essay type at one level. The tick (server side)
// needs all 5 steps done AND one whole-template recall (④ or the mock test)
// with >= 70% of the sentences memorised since it was assigned.
function Homework({ ctx, homework, onLevel }) {
  const mine = homework.filter((h) => h.typeId === ctx.typeId);
  return mine.map((h) => {
    const lvlName = h.level === 'band6' ? 'Band 6+' : 'Band 7+';
    const when = h.deadline ? ` · hạn ${new Date(h.deadline).toLocaleDateString('vi-VN')}` : '';
    const from = `${h.title}${h.className ? ` · ${h.className}` : ''}${when}`;
    if (h.level !== ctx.level) {
      return (
        <div className="pth-hw" key={h.key}>
          <div className="pth-hw-ic">📌</div>
          <div className="pth-hw-txt"><b>Bài tập về nhà ở {lvlName}</b><span>{from}</span></div>
          <button className="pth-btn" onClick={() => onLevel(h.level)}>Chuyển sang {lvlName}</button>
        </div>
      );
    }
    if (h.completed) {
      return (
        <div className="pth-hw is-done" key={h.key}>
          <div className="pth-hw-ic">✅</div>
          <div className="pth-hw-txt"><b>Đã đạt bài tập về nhà</b><span>{from}</span></div>
        </div>
      );
    }
    const steps = STEP_KEYS.filter((k) => (ctx.row.steps || {})[k]).length;
    const all = steps === STEP_KEYS.length;
    return (
      <div className="pth-hw" key={h.key}>
        <div className="pth-hw-ic">📌</div>
        <div className="pth-hw-txt"><b>Bài tập về nhà — cần làm để được tick</b><span>{from}</span>
          <ul className="pth-hw-req">
            <li className={all ? 'ok' : ''}>{all ? '✓' : '○'} Học xong cả 5 bước ({steps}/5)</li>
            <li>○ Thuộc ≥ {ASSEMBLE_PASS}% số câu khi nhớ lại cả bài — ở bước ④ Ghép cả bài hoặc Thi thử, làm sau khi được giao bài</li>
          </ul>
        </div>
      </div>
    );
  });
}

export default function Overview({ ctx, homework, onLevel, onReset }) {
  const { tpl, row, typeId, isB7 } = ctx;
  const meta = TYPE_META[typeId] || {};
  const paras = tpl.paras;
  const total = allSentencesOf(tpl).length;
  const known = knownCount(row, tpl);
  const steps = row.steps || {};
  const firstOpen = STEP_KEYS.findIndex((k) => !steps[k]);
  const due = reviewDue(row);
  const next = row.nextReviewAt ? new Date(row.nextReviewAt) : null;
  const weak = weakSentences(row, tpl);
  const c = coachLine(ctx, homework);
  const started = STEP_KEYS.some((k) => steps[k]) || (row.drillRounds || []).some(Boolean);

  return (
    <div className="pth-wrap">
      <div className="t2-type-info-card" style={{ '--tab-color': meta.color || '#4d63d8' }}>
        <div className="t2-type-info-left">
          <div className="t2-type-info-icon"><i className={`fas ${meta.icon || 'fa-file'}`} /></div>
          <div>
            <div className="t2-type-info-name">{meta.label || ''} · {tpl.name} <span className="t2-type-lvl">{isB7 ? '🏆 Band 7+' : '🌱 Band 6+'}</span></div>
            {meta.desc && <div className="t2-type-info-desc">{meta.desc}</div>}
          </div>
        </div>
        <div className="t2-type-structure"><i className="fas fa-route" /> {paras.length} đoạn · {total} câu · thuộc {known}</div>
      </div>
      <div className="pth-coach"><LuluSays text={c.text} mood={c.mood} /></div>
      <Homework ctx={ctx} homework={homework} onLevel={onLevel} />
      {steps.assemble && (
        <div className={`pth-review ${due ? 'is-due' : ''}`}>
          <div className="pth-review-ic">{due ? '🔔' : '🗓️'}</div>
          <div className="pth-review-txt">
            <b>{due ? 'Đến hạn ôn nhanh' : 'Ôn nhanh'}</b>
            <span>{due ? 'Khoảng 3 phút: nhớ lại những câu bạn hay sai nhất.' : `Lần ôn tiếp theo: ${next ? next.toLocaleDateString('vi-VN') : '—'}. Ôn đúng hẹn giúp nhớ lâu hơn.`}</span>
          </div>
          <button className={`pth-btn ${due ? 'pth-btn--primary' : ''}`} onClick={ctx.onReview}><i className="fas fa-bolt" /> {due ? 'Ôn ngay' : 'Ôn sớm'}</button>
        </div>
      )}
      {weak.length > 0 && (
        <div className="pth-review pth-weak">
          <div className="pth-review-ic">🎯</div>
          <div className="pth-review-txt">
            <b>Luyện câu yếu · {weak.length} câu</b>
            <span>Những câu bạn đã học nhưng chưa thuộc chắc — nhớ lại từ tiếng Việt, có Lulu gợi ý.</span>
          </div>
          <button className="pth-btn" onClick={() => ctx.onFix()}><i className="fas fa-crosshairs" /> Luyện {Math.min(FIX_MAX, weak.length)} câu</button>
        </div>
      )}
      <div className="pth-steps">
        {STEPS.map((s, i) => {
          const done = !!steps[s.key];
          const guideLock = i === 0 && !ctx.guideOk;
          const open = stepUnlocked(row, i) && !guideLock;
          const current = i === firstOpen;
          let meta2 = '';
          if (s.key === 'warmup' && done) meta2 = `Xếp đúng ngay lần đầu: ${row.warmupScore || 0}%`;
          if (s.key === 'drill') meta2 = `Đoạn xong: ${paras.filter((_, k) => Math.min(3, (row.drillRounds || [])[k] || 0) >= 3).length}/${paras.length}`;
          if (s.key === 'assemble') meta2 = row.assembleBest ? `Tốt nhất: thuộc ${row.assembleBest}% số câu · cần ≥ ${ASSEMBLE_PASS}%` : `Cần thuộc ≥ ${ASSEMBLE_PASS}% số câu để hoàn thành`;
          const state = done ? 'is-done' : current ? 'is-current' : open ? '' : 'is-locked';
          return (
            <div className={`pth-step ${state}`} key={s.key}>
              <div className="pth-step-num">{done ? <i className="fas fa-check" /> : s.num}</div>
              <div className="pth-step-body">
                <div className="pth-step-title"><i className={`fas ${s.icon}`} /> {s.title}</div>
                <div className="pth-step-desc">{s.desc}</div>
                {meta2 && <div className="pth-step-meta">{meta2}</div>}
                {guideLock && <div className="pth-step-meta">🔒 Qua 6 quiz ở “Hướng dẫn dạng bài này” để mở ({ctx.guideDone}/6)</div>}
              </div>
              <div className="pth-step-act">
                {guideLock ? <button className="pth-btn pth-btn--primary" onClick={ctx.onOpenGuide}><i className="fas fa-book-open" /> Học hướng dẫn</button>
                  : !open ? <span className="pth-lock" title="Làm xong bước trước để mở"><i className="fas fa-lock" /></span>
                  : <button className={`pth-btn ${current ? 'pth-btn--primary' : ''}`} onClick={() => ctx.onStep(s.key)}>
                    {done ? <><i className="fas fa-rotate-right" /> Luyện lại</> : current ? <><i className="fas fa-play" /> Bắt đầu</> : <><i className="fas fa-play" /> Mở</>}
                  </button>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="pth-foot">
        <span>🧠 Đã thuộc <b>{known}/{total}</b> câu</span>
        <span className="pth-foot-sep">·</span>
        <span>{isB7 ? 'Band 7+: ít gợi ý hơn, ghép cả bài có tính giờ.' : 'Band 6+: nhiều gợi ý hơn, ghép từng đoạn một.'}</span>
        {started && <button className="pth-link" onClick={onReset}><i className="fas fa-eraser" /> Làm lại từ đầu</button>}
      </div>
    </div>
  );
}
