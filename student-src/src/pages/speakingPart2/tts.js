// Read sentences aloud with the browser's voice (🔊, "Nghe cả bài", Nhại's
// sample). One queue for the page; onEach(text) marks the sentence being read.
import { siteToast } from '../../utils/shell';

let queue = null;
let onSpeaking = () => {};

export function setSpeakingListener(fn) { onSpeaking = fn || (() => {}); }

function bestVoice() {
  const v = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  const en = v.filter((x) => /^en[-_]/i.test(x.lang));
  const good = /Google|Natural|Neural|Online|Samantha|Aria|Jenny|Ava|Allison|Sonia|Libby/i;
  return en.find((x) => /GB/i.test(x.lang) && good.test(x.name)) || en.find((x) => good.test(x.name)) || en[0] || null;
}

export function stopTts() {
  queue = null;
  try { window.speechSynthesis?.cancel(); } catch { /* none */ }
  onSpeaking(null);
}

// mark: highlight each sentence while it is read (the 🔊 lists)
export function speak(list, { mark = false, rate } = {}) {
  stopTts();
  if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') { siteToast('Trình duyệt này không hỗ trợ đọc to', 'warn'); return; }
  const q = { list: list.slice(), i: 0 };
  queue = q;
  (function next() {
    if (queue !== q || q.i >= q.list.length) { if (queue === q) queue = null; onSpeaking(null); return; }
    const text = q.list[q.i++];
    if (mark) onSpeaking(text);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB'; u.rate = rate || 0.95;
    const v = bestVoice();
    if (v) { u.voice = v; u.lang = v.lang; }
    u.onend = u.onerror = () => { setTimeout(next, 120); };
    window.speechSynthesis.speak(u);
  })();
}
