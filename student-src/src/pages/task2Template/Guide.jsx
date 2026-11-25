import { useRef, useState } from 'react';
import { siteToast } from '../../utils/shell';
import GuideQuiz from './GuideQuiz';
import {
  buildSectionQuiz, GUIDE_KEYS, GUIDE_PASS, GUIDE_SECTIONS, guideAllPassed, guidePassedCount, QUIZ_SIZE, sectionOpen, sectionPassed,
} from './guideQuizRules';

// The type guide above the path (recognise / outline / 6+→7+ / useful
// language / model essay / mistakes, GET /api/task2/type-guides) and the
// model essay ⑤ compares with. Highlights: js/shared/task2-highlight.js.

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// The essay as the old page built it: one HTML string (prompt, legend,
// sections, copy button), so the highlight script's own toggle keeps working.
function EssayBody({ me, prompt = false, copy = false }) {
  const T2H = window.T2Highlight;
  const hl = !!(T2H && T2H.hasAny(me.sections));
  const sections = me.sections || [];
  const html = (prompt ? `<div class="t2-g-prompt">${esc(me.prompt)}</div>` : '')
    + (hl ? T2H.legend(sections) : '')
    + sections.map((s) => `<h5>${esc(s.title)}</h5><div>${hl ? T2H.html(s.text, s.highlights) : esc(s.text)}</div>`).join('')
    + (copy ? '<button class="t2-g-copy"><i class="fas fa-copy"></i> Chép cả bài</button>' : '');
  function onClick(e) {
    const btn = e.target.closest('.t2-g-copy');
    if (!btn || !navigator.clipboard) return;
    const text = sections.map((s) => `${s.title}\n${s.text}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      const old = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Đã chép';
      setTimeout(() => { btn.innerHTML = old; }, 1500);
    });
  }
  return (
    <div className={`t2-g-essay${hl ? ' t2hl-root' + (T2H.isOff() ? ' t2hl-off' : '') : ''}`}
      onClick={copy ? onClick : undefined} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function ModelEssay({ me, open }) {
  return (
    <details className="pth-model" open={open}>
      <summary>📖 Bài mẫu Band 7+{me.wordCount ? ' · ' + me.wordCount : ''}</summary>
      <EssayBody me={me} />
    </details>
  );
}

// One guide section. Locked until the section before it is passed; open
// ones end with their reading-check quiz (the content hides while the quiz
// runs, so it checks what was understood, not what can be looked up).
function Sub({ icon, title, locked, passed, best, open, onToggle, quiz, onQuiz, children }) {
  return (
    <details className={`t2-g-sec${locked ? ' is-locked' : ''}${passed ? ' is-passed' : ''}`} open={!locked && open}
      onToggle={(e) => { if (!locked) onToggle(e.currentTarget.open); }}>
      <summary onClick={(e) => { if (locked) { e.preventDefault(); siteToast('Làm đúng ≥ 90% quiz của mục trước để mở mục này nha 🔒', 'info', 2500); } }}>
        {icon} {title}
        {locked && <span className="t2-g-badge is-lock"><i className="fas fa-lock" /> Khoá</span>}
        {passed && <span className="t2-g-badge is-ok">✓ Đạt {best}%</span>}
      </summary>
      {!locked && (
        <div className="t2-g-inner">
          {quiz || (
            <>
              {children}
              <div className={`t2-g-quizbox${passed ? ' is-passed' : ''}`}>
                <div className="t2-g-quizbox-txt">
                  {passed
                    ? <><b>✅ Đã đạt quiz mục này</b><span>Muốn chắc hơn thì làm lại — điểm cao nhất được giữ.</span></>
                    : <><b>📝 Kiểm tra đọc hiểu · {QUIZ_SIZE} câu</b><span>Đọc kỹ mục trên rồi làm quiz — đúng ≥ {GUIDE_PASS}% để mở mục tiếp theo. Khi làm quiz, nội dung sẽ được ẩn đi.</span></>}
                </div>
                <button className={`pth-btn${passed ? '' : ' pth-btn--primary'}`} onClick={onQuiz}>
                  {passed ? <><i className="fas fa-rotate-right" /> Làm lại</> : <><i className="fas fa-play" /> Làm quiz</>}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </details>
  );
}

// qp = this type's quiz results ({ sections }) · null while loading ·
// 'off' when they could not be loaded (nothing is locked then).
export default function TypeGuide({ g, guides, typeId, hidden, qp, onQuizDone, onGuideDone }) {
  const style = hidden ? { display: 'none' } : undefined;
  const off = qp === 'off';
  const all = off || guideAllPassed(qp);
  const firstOpen = off ? -1 : GUIDE_KEYS.findIndex((k) => !sectionPassed(qp, k));
  const [guideOpen, setGuideOpen] = useState(!all);
  const [openKey, setOpenKey] = useState(firstOpen >= 0 ? GUIDE_KEYS[firstOpen] : null);
  const [quiz, setQuiz] = useState(null); // { key, items, seq }
  const rootRef = useRef(null);
  // Results arrive after the first paint: open the first section still to pass
  const loaded = qp != null;
  const [seenLoaded, setSeenLoaded] = useState(loaded);
  if (loaded && !seenLoaded) {
    setSeenLoaded(true);
    setGuideOpen(!all);
    setOpenKey(firstOpen >= 0 ? GUIDE_KEYS[firstOpen] : null);
  }

  if (!g) return <div id="tpl-guide-area" style={style} />;
  const me = g.modelEssay || {};

  function startQuiz(key) {
    setQuiz({ key, items: buildSectionQuiz(key, typeId, guides || {}), seq: Date.now() });
    setOpenKey(key);
  }
  function goNext(key) {
    const i = GUIDE_KEYS.indexOf(key);
    setQuiz(null);
    if (i + 1 < GUIDE_KEYS.length) {
      setOpenKey(GUIDE_KEYS[i + 1]);
      setTimeout(() => rootRef.current?.querySelector(`[data-gsec="${GUIDE_KEYS[i + 1]}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    } else {
      setGuideOpen(false);
      onGuideDone?.();
    }
  }
  function sec(i, content) {
    const s = GUIDE_SECTIONS[i];
    const locked = !off && qp != null ? !sectionOpen(qp, i) : (!off && i > 0);
    const st = (!off && qp && qp.sections && qp.sections[s.key]) || {};
    const passed = !off && sectionPassed(qp, s.key);
    const title = s.key === 'essay' ? s.title + (me.wordCount ? ' · ' + me.wordCount : '') : s.title;
    const next = GUIDE_SECTIONS[i + 1];
    const q = quiz && quiz.key === s.key ? (
      <GuideQuiz key={quiz.seq} items={quiz.items} sectionTitle={s.title} nextLabel={next ? next.title : ''}
        onFinish={(c, n) => onQuizDone?.(s.key, c, n)}
        onExit={() => setQuiz(null)} onRetry={() => startQuiz(s.key)} onNext={() => goNext(s.key)} />
    ) : null;
    return (
      <div data-gsec={s.key} key={s.key}>
        <Sub icon={s.icon} title={title} locked={locked} passed={passed} best={st.best || 0}
          open={openKey === s.key} onToggle={(o) => { setOpenKey(o ? s.key : (openKey === s.key ? null : openKey)); if (!o && quiz && quiz.key === s.key) setQuiz(null); }}
          quiz={q} onQuiz={() => startQuiz(s.key)}>
          {content}
        </Sub>
      </div>
    );
  }
  const done = off ? 0 : guidePassedCount(qp);
  return (
    <div id="tpl-guide-area" style={style} ref={rootRef}>
      <details className="t2-guide" open={guideOpen} onToggle={(e) => setGuideOpen(e.currentTarget.open)}>
        <summary>
          <i className="fas fa-book-open" /> Hướng dẫn dạng bài này — {g.name}{g.nameVi ? ' · ' + g.nameVi : ''}
          {!off && <span className={`t2-g-prog${all ? ' is-ok' : ''}`}>{all ? '✓ Đã qua 6/6 quiz' : `Quiz ${done}/6`}</span>}
        </summary>
        <div className="t2-guide-body">
          {!off && !all && (
            <div className="t2-g-intro">
              🍊 Đọc từng mục rồi làm <b>quiz đọc hiểu</b> (đúng ≥ {GUIDE_PASS}%) để mở mục tiếp theo. Qua đủ 6 mục là mở <b>lộ trình 5 bước</b> bên dưới.
              Mục <b>🔍 Nhận diện đề</b> quan trọng nhất: nhìn đề là biết ngay dạng gì và bài cần viết gì!
            </div>
          )}
          {sec(0, <>
            <ul>{((g.recognise || {}).stems || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
            {(g.recognise || {}).note && <div className="t2-g-note">{g.recognise.note}</div>}
          </>)}
          {sec(1, <>
            <div className="t2-g-flow">{(g.outline || {}).flow}</div>
            {(g.outline || {}).perBody && <div style={{ marginTop: 6 }}>{g.outline.perBody}</div>}
          </>)}
          {sec(2, (
            <div style={{ overflowX: 'auto' }}>
              <table className="t2-g-up"><thead><tr><th>Band 6+</th><th>Band 7+</th></tr></thead>
                <tbody>{(g.upgradePairs || []).map((p, i) => <tr key={i}><td>{p[0]}</td><td>{p[1]}</td></tr>)}</tbody>
              </table>
            </div>
          ))}
          {sec(3, (g.usefulLanguage || []).map((grp, i) => (
            <div className="t2-g-ul-grp" key={i}><b>{grp.label}</b><ul>{(grp.lines || []).map((l, k) => <li key={k}>{l}</li>)}</ul></div>
          )))}
          {sec(4, <EssayBody me={me} prompt copy />)}
          {sec(5, <ul>{(g.mistakes || []).map((m, i) => <li key={i}>{m}</li>)}</ul>)}
        </div>
      </details>
    </div>
  );
}
