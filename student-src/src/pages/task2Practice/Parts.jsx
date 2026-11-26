import { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DRILL_MODES, termSplit, tplPieces } from '../../utils/task2Practice';

// Pieces every screen of Task 2 Luyện đề tuần uses.

// The page's dialogs sit on <body>, like the old page's overlays
const toBody = (node) => createPortal(node, document.body);

// Trusted HTML from this page's own constants or the shared mascot
export function Html({ html, as: Tag = 'span', className, ...rest }) {
  return <Tag className={className} {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}

// Disabled with a spinner while `onClick` runs (old _withBusy)
export function BusyButton({ onClick, children, disabled, ...rest }) {
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  async function run(e) {
    if (busy) return;
    setBusy(true);
    try { await onClick(e); } finally { if (alive.current) setBusy(false); }
  }
  return (
    <button type="button" {...rest} disabled={busy || disabled} onClick={run}>
      {busy ? <><i className="fas fa-spinner fa-spin" /> Đang tải...</> : children}
    </button>
  );
}

// ⓘ — long explanations stay folded; open/closed is kept for the whole page
export function InfoBtn({ k, info }) {
  const open = info.has(k);
  return (
    <button type="button" className={`t2-info-btn${open ? ' is-open' : ''}`} data-info-btn={k} onClick={() => info.toggle(k)}
      aria-expanded={open ? 'true' : 'false'} title="Xem hướng dẫn" aria-label="Xem hướng dẫn"><i className="fas fa-circle-info" /></button>
  );
}
export function InfoBody({ k, info, children, as: Tag = 'div' }) {
  return <Tag className="t2-info-body" data-info={k} hidden={!info.has(k)}>{children}</Tag>;
}

export function ModeBadge({ m }) {
  const d = DRILL_MODES[m];
  return d ? <span className={`t2-mode ${d.cls}`}><i className={`fas ${d.icon}`} /> {d.label}</span> : null;
}

// `term` (with -s/-ed/-ing endings) marked in `text`
export function TermMark({ text, term }) {
  const p = termSplit(text, term);
  if (!p) return text;
  return <>{p[0]}<mark className="t2-key">{p[1]}</mark>{p[2]}</>;
}

// A template frame with each "(slot)" marked
export function TplLine({ en }) {
  return tplPieces(en).map((p, i) => (p.slot ? <mark key={i}>{p.text}</mark> : <Fragment key={i}>{p.text}</Fragment>));
}

// "Dừng luyện tập?" — the old page's #t2-quit-overlay. opts: mascot, title,
// sub, confirmText, continueText; onSave adds "Thoát và lưu tiến độ".
export function QuitDialog({ opts, onStay, onLeave, onSave }) {
  return toBody(
    <div className="t2-quit-overlay" id="t2-quit-overlay" onClick={(e) => { if (e.target === e.currentTarget) onStay(); }}>
      <div className="t2-quit-box" role="dialog" aria-modal="true">
        <div className="t2-quit-top">
          <div className="t2-quit-mascot" id="t2-quit-mascot">{opts.mascot || '✏️'}</div>
          <div className="t2-quit-title" id="t2-quit-title">{opts.title || 'Dừng luyện tập?'}</div>
          <div className="t2-quit-sub" id="t2-quit-sub">{opts.sub || ''}</div>
        </div>
        <div className="t2-quit-actions">
          <button className="t2-quit-continue" id="t2-quit-continue-btn" onClick={onStay}><i className="fas fa-arrow-left" /> {opts.continueText || 'Tiếp tục học'}</button>
          {onSave && <button className="t2-quit-save" id="t2-quit-save-btn" onClick={onSave}><i className="fas fa-bookmark" /> Thoát và lưu tiến độ</button>}
          <button className="t2-quit-leave" id="t2-quit-leave-btn" onClick={onLeave}><i className="fas fa-sign-out-alt" /> {opts.confirmText || 'Dừng lại'}</button>
        </div>
      </div>
    </div>,
  );
}

// The history / preview box (old #t2-hist-overlay, #t2-preview-overlay)
export function HistShell({ id, title, titleId, onClose, children, bodyId, bodyRef }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);
  return toBody(
    <div id={id} className="t2p-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="t2-hist-modal">
        <div className="t2-hist-hdr">
          <h3 id={titleId}>{title}</h3>
          <button className="t2-hist-close" onClick={onClose}><i className="fas fa-times" /></button>
        </div>
        <div className="t2-hist-body2" id={bodyId} ref={bodyRef}>{children}</div>
      </div>
    </div>,
  );
}

// Guideline for teacher / Mời bạn viết cùng (old .t2-tg-overlay)
export function TgShell({ id, onClose, children, focusClose = true }) {
  const close = useRef(null);
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    if (focusClose) close.current?.focus();
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [onClose, focusClose]);
  return toBody(
    <div id={id} className="t2-tg-overlay is-open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {children(close)}
    </div>,
  );
}

export const Spinner = ({ text = 'Đang tải...', pad = 32 }) => (
  <div style={{ textAlign: 'center', padding: pad }}><div className="wp-spinner" /><p style={{ color: '#9ca3af', marginTop: 10, fontSize: 13 }}>{text}</p></div>
);
