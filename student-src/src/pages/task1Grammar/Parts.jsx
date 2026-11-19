import { Fragment, useEffect, useRef, useState } from 'react';
import { answerDiff } from '../../utils/writingPractice';
import { saveWhenGuideClosed, whenGuideClosed } from '../../utils/task1Grammar';

// Pieces both the practice card and the test use.

// The exercise's chart (js/shared/t1-chart.js draws it into the div and hides
// it when there is none). React never renders children or a class here.
export function T1Chart({ id, chart }) {
  const ref = useRef(null);
  useEffect(() => { window.T1Chart?.render(ref.current, chart); }, [chart]);
  return <div id={id} ref={ref} />;
}

// "Khi nào dùng?" on So sánh / Xu hướng exercises; the row of the exercise's
// chart:static|dynamic tag is lit. Open/closed is remembered on this device.
const WHEN_GUIDE_SKILLS = new Set(['comparison', 'trend_language']);
export function WhenGuide({ ex }) {
  const [open, setOpen] = useState(() => !whenGuideClosed());
  if (!WHEN_GUIDE_SKILLS.has(ex.skillType)) return null;
  const tags = ex.tags || [];
  const kind = tags.includes('chart:dynamic') ? 'dynamic' : tags.includes('chart:static') ? 'static' : '';
  return (
    <details className="t1-when" id="t1-when" open={open}
      onToggle={(e) => { const o = e.currentTarget.open; setOpen(o); saveWhenGuideClosed(!o); }}>
      <summary>📌 Khi nào dùng <b>Mô tả xu hướng</b> và <b>So sánh</b>?</summary>
      <div className={`t1-when-row${kind === 'dynamic' ? ' is-current' : ''}`} data-kind="dynamic">
        <span className="t1-when-ic">📈</span>
        <div><b>Biểu đồ XU HƯỚNG</b> — có nhiều mốc thời gian (vd: 2000 → 2020), số liệu thay đổi.<br />
          → Dùng <b>mô tả xu hướng + so sánh</b>: <i>increased, fell, peaked at…</i> kết hợp <i>while / whereas / compared to</i>.</div>
        <span className="t1-when-this">Câu này</span>
      </div>
      <div className={`t1-when-row${kind === 'static' ? ' is-current' : ''}`} data-kind="static">
        <span className="t1-when-ic">📊</span>
        <div><b>Biểu đồ TĨNH</b> — chỉ có 1 mốc thời gian (vd: in 2020), không có tăng giảm.<br />
          → <b>Chỉ so sánh</b>: <i>topped the list, followed by, twice as many as…</i> ❌ Không viết <i>increased / decreased</i>.</div>
        <span className="t1-when-this">Câu này</span>
      </div>
      <div className="t1-when-tip">💡 Nhìn <b>mốc thời gian</b>, đừng nhìn loại biểu đồ — bar, pie hay table đều có thể là tĩnh hoặc xu hướng.</div>
    </details>
  );
}

// "The figure rose ___ 20% ___ 35%." with every blank underlined
export function Blanks({ text }) {
  const parts = String(text || '').split('___');
  return parts.map((p, i) => (
    <Fragment key={i}>{p}{i < parts.length - 1 && <span className="wp-blank-underline">___</span>}</Fragment>
  ));
}

const LETTERS = ['A', 'B', 'C', 'D'];

// ☑️ Trắc nghiệm / 🔁 Paraphrase options. marks = { picked, correct } after grading.
export function McOptions({ id, options, selected, onSelect, marks }) {
  return (
    <div className="t1-mc-options" id={id}>
      {(options || []).map((opt, i) => {
        let cls = 't1-mc-option';
        if (selected === i) cls += ' selected';
        if (marks) {
          if (i === marks.picked) cls += marks.isCorrect ? ' correct' : ' wrong';
          if (!marks.isCorrect && i === marks.correct) cls += ' correct';
        }
        return (
          <button key={i} className={cls} onClick={() => { if (!marks) onSelect(i); }}>
            <span className="t1-opt-letter">{LETTERS[i]}</span><span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

// The student's words, each green when the sample has it
export function DiffText({ user, sample }) {
  if (!sample) return user;
  return answerDiff(user, sample).map((w, i) => (
    <Fragment key={i}>{i > 0 && ' '}<span className={w.ok ? 'wp-diff-ok' : 'wp-diff-err'}>{w.word}</span></Fragment>
  ));
}

export function Toggle({ id, label, title, checked, onChange }) {
  return (
    <label className="t1-toggle-row" title={title}>
      <span className="t1-toggle-label">{label}</span>
      <label className="t1-switch">
        <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="t1-slider" />
      </label>
    </label>
  );
}

// Same box as the old page's quit overlay (task1-practice.css)
export function QuitDialog({ q, onContinue, onConfirm }) {
  return (
    <div className="wp-quit-overlay" id="wp-quit-overlay">
      <div className="wp-quit-box" role="dialog" aria-modal="true">
        <div className="wp-quit-top">
          <div className="wp-quit-mascot">📝</div>
          <div className="wp-quit-title" id="quit-title">{q.title || 'Dừng luyện tập?'}</div>
          <div className="wp-quit-sub" id="quit-sub">{q.sub || ''}</div>
        </div>
        <div className="wp-quit-actions">
          <button className="wp-quit-continue" id="quit-continue-btn" onClick={onContinue}>
            <i className="fas fa-arrow-left" /> {q.continueText || 'Tiếp tục học'}
          </button>
          <button className="wp-quit-leave" id="quit-leave-btn" onClick={onConfirm}>
            <i className="fas fa-sign-out-alt" /> {q.confirmText || 'Dừng lại'}
          </button>
        </div>
      </div>
    </div>
  );
}
