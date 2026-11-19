// Browser text-to-speech for ② Đọc & nghe (en-GB voice when there is one).
import { siteToast } from '../../utils/shell';

let voice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return null;
  const vs = window.speechSynthesis.getVoices() || [];
  return vs.find((v) => /en-GB/i.test(v.lang) && /Google|Natural|Online/i.test(v.name))
    || vs.find((v) => /en-GB/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || null;
}
export function initVoices() {
  if (!('speechSynthesis' in window)) return;
  voice = pickVoice();
  window.speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); };
}
export function speak(text, rate = 0.95) {
  if (!('speechSynthesis' in window)) { siteToast('Trình duyệt không hỗ trợ đọc to.', 'warn', 2500); return; }
  window.speechSynthesis.cancel();
  if (!voice) voice = pickVoice();
  // Placeholders are read as "something"; "a / b" as "a or b".
  const u = new SpeechSynthesisUtterance(String(text).replace(/\([^()]*\)/g, 'something').replace(/\s\/\s/g, ' or '));
  u.lang = voice ? voice.lang : 'en-GB';
  if (voice) u.voice = voice;
  u.rate = rate;
  window.speechSynthesis.speak(u);
}
export function stopSpeak() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
