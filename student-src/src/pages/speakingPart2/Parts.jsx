// Small shared pieces of the Speaking Part 2 page (/app/speaking-part2).
// Markup = the old js/speaking-part2.js, so speaking-part2.css and
// task2-practice.css style it unchanged.
import { useContext } from 'react';
import { createPortal } from 'react-dom';
import { SpeakCtx } from './context';

// HTML from the shared mascot (js/shared/playful.js), placed as if it were
// written straight into the parent (display: contents keeps the layout)
export function Html({ html }) {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}

// Lulu with a line, or the plain text when the mascot script is missing
export function LuluSays({ text, mood, fallback = 'p' }) {
  const html = window.Mascot?.reactHtml?.({ text, mood, solo: true, compact: true });
  if (html) return <Html html={html} />;
  return fallback === 'coach' ? <div className="t2w-coach-txt">🍊 {text}</div> : <p>{text}</p>;
}

export function SayBtn({ text }) {
  const { say } = useContext(SpeakCtx);
  return (
    <button type="button" className="sp2-say" title="Nghe câu này" aria-label="Nghe" onClick={() => say(text)}>
      <i className="fas fa-volume-up" />
    </button>
  );
}

// One sentence with its 🔊 (and the Vietnamese line when shown)
export function Sent({ en, vi, children }) {
  const { speaking } = useContext(SpeakCtx);
  return (
    <p className={`sp2-sent${speaking === en ? ' is-speaking' : ''}`}>
      <SayBtn text={en} />
      <span className="sp2-sent-txt"><span className="sp2-en">{en}</span>{vi != null && <span className="sp2-vi">{vi}</span>}</span>
      {children}
    </p>
  );
}

export function Meter({ n, of }) {
  const ok = of && n >= of;
  return <div className={`t2-meter${ok ? ' ok' : ''}`}><span style={{ width: (of ? Math.round((n / of) * 100) : 0) + '%' }} /></div>;
}

export function StepHead({ num, title, extra, done }) {
  return (
    <div className="t2-step-head">
      <span className={`t2-step-num${done ? ' is-done' : ''}`}>{done ? <i className="fas fa-check" /> : num}</span>
      <div className="t2-step-title">{title}</div>
      {extra}
    </div>
  );
}

// Header of the Dịch / Nhại screens
export function RunHead({ story, label, onQuit }) {
  return (
    <div className="t2-prac-head">
      <button className="t2-back-btn" onClick={onQuit}><i className="fas fa-times" /> Thoát</button>
      <div className="t2-prac-ctx">
        <span className="t2-ctx-week">{story.no} · {story.group}</span>
        <span className="t2-ctx-name" title={story.title}>{story.emoji} {story.title}</span>
      </div>
      <span className="sp2-run-tag">{label}</span>
    </div>
  );
}

// "Dừng luyện tập?" (same box as Luyện đề Task 2, task2-practice.css)
export function QuitDialog({ left, onContinue, onLeave }) {
  return createPortal(
    <div className="t2-quit-overlay" id="t2-quit-overlay">
      <div className="t2-quit-box" role="dialog" aria-modal="true">
        <div className="t2-quit-top">
          <div className="t2-quit-mascot">🎤</div>
          <div className="t2-quit-title">Dừng luyện tập?</div>
          <div className="t2-quit-sub" id="t2-quit-sub">Còn {left} câu chưa làm. Các câu đã gõ đúng vẫn được tính là đã thuộc.</div>
        </div>
        <div className="t2-quit-actions">
          <button className="t2-quit-continue" id="t2-quit-continue-btn" onClick={onContinue}><i className="fas fa-arrow-left" /> Tiếp tục học</button>
          <button className="t2-quit-leave" id="t2-quit-leave-btn" onClick={onLeave}>Dừng lại</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
