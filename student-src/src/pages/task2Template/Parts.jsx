import { Fragment, useEffect, useRef } from 'react';
import { mascotHtml } from '../../utils/shell';
import { toBody } from './helpers';
import { normWord, STEPS, STEP_KEYS, tokenize } from '../../utils/task2Template';

// Pieces every step of Task 2 Templates uses.

// Fixed copy from the shared mascot (results, coach)
export function LuluSays({ text, pct = 70, mood, solo = true, stacked = false }) {
  const html = mascotHtml({ pct, text, mood, solo, stacked, compact: !stacked });
  if (!html) return <div className="pth-fb pth-fb--good">🍊 {text}</div>;
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}

// Trusted HTML from this page's own constants (the outline uses <b>)
export function Html({ html, as: Tag = 'span', className }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

// "Hỏi Lulu (n)"; `left` omitted = no count
export function AskBtn({ id, onClick, left, label = 'Hỏi Lulu', disabled }) {
  const counted = left != null;
  return (
    <button className="pth-btn ask-lulu" id={id} onClick={onClick} disabled={disabled ?? (counted && left <= 0)}>
      <span className="ask-lulu-ic" /> {label}{counted && <span className="ask-lulu-left"> ({Math.max(0, left)})</span>}
    </button>
  );
}

export function RoleTag({ s }) {
  return <><span className="pth-role">{s.role}</span>{s.opt && <span className="pth-opt">{s.opt}</span>}</>;
}

// English sentence: placeholders as chips, key words underlined
export function En({ s, anchors = true }) {
  return tokenize(s.en).map((t, i) => {
    const sep = i > 0 ? ' ' : null;
    if (t.ph) return <Fragment key={i}>{sep}<span className="pth-ph">{t.text}</span></Fragment>;
    if (t.text === '/') return <Fragment key={i}>{sep}<span className="pth-or">/</span></Fragment>;
    if (anchors && s.anchors && s.anchors.has(normWord(t.core))) return <Fragment key={i}>{sep}{t.lead}<span className="pth-anchor">{t.core}</span>{t.trail}</Fragment>;
    return <Fragment key={i}>{sep}{t.text}</Fragment>;
  });
}

export function Diff({ ops }) {
  return ops.map((o, i) => {
    const sep = i > 0 ? ' ' : null;
    if (o.type === 'ok') return <Fragment key={i}>{sep}<span className="pth-d-ok">{o.word}</span></Fragment>;
    if (o.type === 'miss') return <Fragment key={i}>{sep}<span className="pth-d-miss" title="Thiếu">{o.word}</span></Fragment>;
    if (o.type === 'extra') return <Fragment key={i}>{sep}<span className="pth-d-extra" title="Thừa">{o.word}</span></Fragment>;
    return <Fragment key={i}>{sep}<span className="pth-d-wrong" title={`Đúng là: ${o.expected}`}>{o.word}</span><span className="pth-d-fix">{o.expected}</span></Fragment>;
  });
}

export function ActivityHeader({ step, right, onBack }) {
  const s = STEPS[step];
  return (
    <div className="pth-act-hdr">
      <button className="pth-back" onClick={onBack}><i className="fas fa-arrow-left" /> Lộ trình</button>
      <div className="pth-act-title"><span className="pth-act-num">{s.num}</span> {s.title}</div>
      <div className="pth-act-right">{right}</div>
    </div>
  );
}

// "Sang bước ④ …" after a step, or back to the path after the last one
export function NextStepButton({ stepKey, onStep, onBack }) {
  const n = STEPS[STEP_KEYS.indexOf(stepKey) + 1];
  if (!n) return <button className="pth-btn pth-btn--primary" onClick={onBack}>Về lộ trình <i className="fas fa-arrow-right" /></button>;
  return <button className="pth-btn pth-btn--primary" onClick={() => onStep(n.key)}>Sang bước {n.num} {n.title} <i className="fas fa-arrow-right" /></button>;
}

// "Rời bài đang luyện?" — leaving a step half done
export function LeaveDialog({ sub, onStay, onLeave }) {
  // Dan thinking (js/shared/playful.js) — React leaves this box's inside alone
  const dan = useRef(null);
  useEffect(() => {
    const el = dan.current;
    if (window.Mascot?.mount) window.Mascot.mount(el, 'think'); else el.textContent = '🔀';
  }, []);
  return toBody(
    <div className="t2-quit-overlay" id="tpl-switch-overlay" onClick={(e) => { if (e.target === e.currentTarget) onStay(); }}>
      <div className="t2-quit-box" role="dialog" aria-modal="true">
        <div className="t2-quit-top">
          <div className="t2-quit-mascot" data-dan="think" ref={dan} />
          <div className="t2-quit-title">Rời bài đang luyện?</div>
          <div className="t2-quit-sub" id="tpl-switch-sub">{sub}</div>
        </div>
        <div className="t2-quit-actions">
          <button className="t2-quit-continue" onClick={onStay}><i className="fas fa-arrow-left" /> Ở lại làm tiếp</button>
          <button className="t2-quit-leave" id="tpl-switch-confirm-btn" onClick={onLeave}><i className="fas fa-exchange-alt" /> Vẫn rời đi</button>
        </div>
      </div>
    </div>,
  );
}
