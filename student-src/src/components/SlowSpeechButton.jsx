import { useState } from 'react';
import { isSlowSpeech, setSlowSpeech, speakWord } from '../utils/vocab';

// 🐢 toggle (remembered, same key as the static pages). Turning it on or off
// replays the word at the new speed.
export default function SlowSpeechButton({ word }) {
  const [slow, setSlow] = useState(isSlowSpeech);
  return (
    <button type="button" className={`btn-slow-audio${slow ? ' active' : ''}`} aria-pressed={slow}
      title={slow ? 'Bấm để về tốc độ bình thường' : 'Đọc chậm lại để nghe rõ hơn'}
      onClick={() => { setSlowSpeech(!slow); setSlow(!slow); speakWord(word); }}>
      {slow ? '🐢 Đang đọc chậm' : '🐢 Đọc chậm'}
    </button>
  );
}
