import { useEffect, useRef, useState } from 'react';

// Streak message + Lulu's mood (dashboard.js getMascotState), shared by the
// home card and the notebook banner.
export function getMascotMsg(streak) {
  if (streak === 0) return 'Bắt đầu luyện từ hôm nay để xây dựng streak!';
  if (streak < 3) return 'Streak đang bắt đầu! Giữ vững nhé 💪';
  if (streak < 7) return `${streak} ngày liên tiếp — bạn đang tiến bộ rất tốt!`;
  if (streak < 14) return `🔥 ${streak} ngày streak! Thật tuyệt vời!`;
  return `🌟 ${streak} ngày streak! Bạn là chiến thần vocab rồi!`;
}

const ANGRY_MSGS = [
    n => `😡 Lulu CỰC KỲ TỨC GIẬN vì bạn vừa làm bay màu ${n} ngày streak! ${n} NGÀY! Học 1 từ ngay đi, không Lulu giận cả tuần cho xem.`,
    n => `😤 ${n} ngày công sức... đi tong trong một nốt nhạc. Lulu không khóc đâu, Lulu chỉ đang tức giận dữ dội thôi.`,
    n => `🔥💔 Streak ${n} ngày vừa nằm xuống. Lulu đang thắp hương cho nó — còn bạn thì đang làm gì thế?`
];
const SAD_MSGS = [
    '😢 Lulu đang buồn thiu vì hôm nay chưa thấy bạn học từ nào cả...',
    '🥺 0 ngày streak. Lulu ngồi một mình cắn hạt dưa cả ngày, buồn ơi là buồn.',
    '😭 Lulu tưởng bạn quên mất Lulu rồi... học 1 từ thôi là Lulu vui liền!'
];

function streakState(streak, previous, r) {
  if (streak === 0 && previous > 10) return { mood: 'angry', msg: ANGRY_MSGS[Math.floor(r * ANGRY_MSGS.length)](previous) };
  if (streak === 0) return { mood: 'sad', msg: SAD_MSGS[Math.floor(r * SAD_MSGS.length)] };
  return { mood: null, msg: getMascotMsg(streak) };
}

// Refs go on the mascot / fire / number elements
export function useStreakFace(stats) {
  const { streak = 0, previousStreak = 0 } = stats || {};
  const [r] = useState(() => Math.random());
  const state = streakState(streak, previousStreak, r);
  const mascot = useRef(null);
  const fire = useRef(null);
  const num = useRef(null);
  const loaded = !!stats;
  useEffect(() => {
    if (!loaded) return;
    if (window.Mascot && mascot.current) {
      mascot.current.textContent = '';
      window.Mascot.mount(mascot.current, state.mood || window.Mascot.moodForStreak(streak), { label: 'Lulu' });
    }
    window.applyFireTier?.(fire.current, num.current, streak);
  }, [loaded, streak, state.mood]);
  return { state, mascot, fire, num };
}
