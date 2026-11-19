// Small non-component helpers of Task 2 Templates.
import { createPortal } from 'react-dom';
import { siteToast } from '../../utils/shell';

// Lulu says `text` in a bubble next to the button (js/shared/playful.js AskLulu)
export function lulu(el, text, mood = 'wink') {
  if (window.AskLulu) window.AskLulu.say(el, text, mood);
  else siteToast(text, 'info', 3500);
}

// The page's dialogs sit on <body> (student.css resets line-height inside the app)
export const toBody = (node) => createPortal(node, document.body);


export function copyText(text, okMsg) {
  const ok = () => siteToast(okMsg, 'info', 2500);
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); ok(); } catch { siteToast('Không thể sao chép', 'warn', 2000); }
    ta.remove();
  };
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok).catch(fallback);
  else fallback();
}
