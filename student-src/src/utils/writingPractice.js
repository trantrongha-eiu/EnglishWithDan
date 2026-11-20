// Helpers of "Luyện viết câu giao tiếp" (/app/writing-practice, was
// writing-practice.html). Same localStorage keys as the old page, so XP,
// streak, the "Đã hoàn thành" ticks, options and a test in progress carry over.

export const LEVELS = [
  { id: 'beginner', label: '🌱 Beginner' },
  { id: 'elementary', label: '📘 Elementary' },
  { id: 'intermediate', label: '📗 Intermediate' },
];

export const TOPICS = [
  { id: 'all', label: '🎯 Tất cả' },
  { id: 'myself', label: '👤 Bản thân' },
  { id: 'family', label: '👨‍👩‍👧 Gia đình' },
  { id: 'hobbies', label: '🎮 Sở thích' },
  { id: 'school', label: '🏫 Trường học' },
  { id: 'friends', label: '👫 Bạn bè' },
  { id: 'food', label: '🍜 Ăn uống' },
  { id: 'technology', label: '💻 Công nghệ' },
  { id: 'travel', label: '✈️ Du lịch' },
  { id: 'health', label: '❤️ Sức khỏe' },
  { id: 'environment', label: '🌿 Môi trường' },
];

export const TYPES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'translation', label: '🔄 Dịch câu' },
  { id: 'rearrange', label: '🔀 Sắp xếp từ' },
  { id: 'fill_blank', label: '✏️ Điền chỗ trống' },
  { id: 'expand', label: '🔡 Mở rộng câu' },
  { id: 'combine', label: '🔗 Nối câu' },
];

export const TYPE_LABELS = {
  translation: '🔄 Dịch câu', rearrange: '🔀 Sắp xếp từ',
  fill_blank: '✏️ Điền chỗ trống', expand: '🔡 Mở rộng câu', combine: '🔗 Nối câu',
};
export const HISTORY_TYPE_LABELS = { translation: 'Dịch câu', rearrange: 'Sắp xếp từ', fill_blank: 'Điền chỗ trống', expand: 'Viết lại', combine: 'Kết hợp' };
export const HISTORY_LEVEL_LABELS = { beginner: 'Beginner', elementary: 'Elementary', intermediate: 'Intermediate' };

const TOPIC_IDS = TOPICS.filter((t) => t.id !== 'all').map((t) => t.id);

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) ?? fallback);
  } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); } catch { /* private mode */ }
}

// The address: ?level=&topic=&type= (invalid values are ignored)
export function filtersFromSearch(search) {
  const q = new URLSearchParams(search);
  const pick = (list, v) => (list.some((x) => x.id === v) ? v : null);
  const level = LEVELS.some((l) => l.id === q.get('level')) ? q.get('level') : null;
  const topic = pick(TOPICS, q.get('topic'));
  const type = pick(TYPES, q.get('type'));
  return { level, topic, type, any: !!(level || topic || type) };
}
export const filtersQuery = (f) => `?level=${f.level}&topic=${f.topic}&type=${f.type}`;

// ── "Đã hoàn thành" per topic: a session on one topic scoring ≥80% ──
const TOPIC_SCORE_KEY = 'wp_topic_scores';
const TOPIC_COMPLETE_THRESHOLD = 80;

export const loadTopicScores = () => read(TOPIC_SCORE_KEY, {}) || {};

export function saveTopicScore(topic, score) {
  const all = loadTopicScores();
  const prev = all[topic] || { bestScore: 0, latestScore: 0, completed: false, completedAt: null };
  const bestScore = Math.max(prev.bestScore, score);
  const completed = bestScore >= TOPIC_COMPLETE_THRESHOLD;
  const completedAt = (completed && !prev.completed) ? new Date().toISOString() : prev.completedAt;
  all[topic] = { bestScore, latestScore: score, completed, completedAt };
  write(TOPIC_SCORE_KEY, all);
  return all;
}
export const completedTopicCount = (scores) => TOPIC_IDS.filter((t) => scores[t]?.completed).length;
export const TOPIC_COUNT = TOPIC_IDS.length;

// ── XP + day streak shown top right (wp_progress) ──
const today = () => new Date().toISOString().slice(0, 10);

export function loadProgress() {
  const stored = read('wp_progress', { xp: 0, streak: 0, lastDate: '' }) || {};
  if (stored.lastDate !== today()) {
    stored.todayXP = 0; stored.todayDone = 0; stored.lastDate = today();
    write('wp_progress', stored);
  }
  return { xp: stored.xp || 0, streak: stored.streak || 0 };
}

// One answered exercise: adds its XP; the first of the day moves the streak
export function recordProgress(xpEarned) {
  const stored = read('wp_progress', { xp: 0, streak: 0 }) || {};
  const t = today();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let streakShown = null;
  if (!stored.todayDone) {
    if (stored.lastPracticeDate === yesterday) stored.streak = (stored.streak || 0) + 1;
    else if (stored.lastPracticeDate !== t) stored.streak = 1;
    streakShown = stored.streak || 1;
  }
  stored.todayDone = (stored.todayDone || 0) + 1;
  stored.lastPracticeDate = t;
  stored.xp = (stored.xp || 0) + xpEarned;
  stored.lastDate = t;
  write('wp_progress', stored);
  return { xp: stored.xp, streak: streakShown };
}

// ── Options ──
export const loadOption = (key) => { try { return localStorage.getItem(key) === 'on'; } catch { return false; } };
export const saveOption = (key, on) => write(key, on ? 'on' : 'off');

// ── A test in progress, kept 4 hours (ews_wp_test) ──
const TEST_KEY = 'ews_wp_test';
export function saveTest(t) {
  if (!t.exercises.length || t.idx >= t.exercises.length) return;
  write(TEST_KEY, { exercises: t.exercises, answers: t.answers, idx: t.idx, timeLeft: t.timeLeft, level: t.level, count: t.count, savedAt: Date.now() });
}
export function clearTest() { try { localStorage.removeItem(TEST_KEY); } catch { /* private mode */ } }
export function loadResumableTest() {
  const data = read(TEST_KEY, null);
  if (!data) return null;
  if (!data.exercises?.length || data.idx == null || Date.now() - data.savedAt > 4 * 60 * 60 * 1000) { clearTest(); return null; }
  return data;
}

export function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  return `${Math.floor(s / 3600)} giờ trước`;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Words of the student's answer, each marked whether the sample has it
export function answerDiff(userAnswer, sampleAnswer) {
  const norm = (s) => s.toLowerCase().replace(/[.,!?;:'"]/g, '').trim();
  const sampleSet = new Set(norm(sampleAnswer).split(/\s+/));
  return userAnswer.split(/\s+/).map((word) => ({ word, ok: sampleSet.has(norm(word)) }));
}

// Site-wide typing rule (sentence-drill.js): a sentence failed by 3 wrong
// tries comes back 3 exercises later, at most twice.
const REQUEUE_GAP = 3;
const MAX_REQUEUES = 2;
export function requeue(list, idx) {
  const ex = list[idx];
  if (!ex) return { list, requeued: false };
  const copies = list.filter((x) => x._id === ex._id).length - 1;
  if (copies >= MAX_REQUEUES) return { list, requeued: false };
  const next = [...list];
  next.splice(Math.min(idx + 1 + REQUEUE_GAP, list.length), 0, { ...ex, _isRepeat: true });
  return { list: next, requeued: true };
}

export function failFeedbackVi(info, requeued) {
  const stuckWord = info && info.word ? `từ “${info.word}”` : 'một từ';
  return `Bạn gõ sai ${stuckWord} 3 lần nên câu này tính là sai. `
    + (requeued
      ? 'Xem kỹ đáp án mẫu nhé — câu này sẽ quay lại ở phía sau để bạn làm lại 💪'
      : 'Xem kỹ đáp án mẫu và ghi nhớ nhé — câu này đã quay lại đủ số lần rồi.');
}

export function testResultImage(score) {
  if (score >= 90) return '/img/cheer/cheer-top.jpg';
  if (score >= 70) return '/img/cheer/cheer-great.jpg';
  if (score >= 60) return '/img/cheer/cheer-good.jpg';
  if (score >= 50) return '/img/cheer/cheer-ok.jpg';
  if (score >= 45) return '/img/cheer/cheer-try.jpg';
  return '/img/cheer/cheer-rest.jpg';
}
