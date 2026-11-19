// Helpers of "Task 1 Grammar" (/app/task1-practice, was task1-practice.html).
// Same localStorage keys as the old page (t1_progress, t1_skill_scores,
// t1_autonext, t1_shuffle, t1_when_guide_closed), so XP, the "Đã hoàn thành"
// ticks and the options carry over.

export const SKILLS = [
  { id: 'all', label: '🎯 Tất cả' },
  { id: 'noun_phrase', label: '🔤 Noun Phrase' },
  { id: 'data_description', label: '📊 Mô tả Data' },
  { id: 'comparison', label: '⚖️ So sánh' },
  { id: 'trend_language', label: '📈 Xu hướng' },
  { id: 'paraphrase', label: '✏️ Paraphrase' },
  { id: 'introduction', label: '📝 Introduction' },
  { id: 'overview', label: '🔭 Overview' },
];

// Bộ bài: '' = whole bank, set1 / set2 = Task1Exercise.tags
export const SETS = [
  { id: '', label: '📚 Tất cả' },
  { id: 'set1', label: '📘 Bộ 1' },
  { id: 'set2', label: '🆕 Bộ 2' },
];

export const TEST_LEVELS = [
  { id: 'beginner', label: '🌱 Beginner' },
  { id: 'elementary', label: '📘 Elementary' },
  { id: 'intermediate', label: '📗 Intermediate' },
  { id: 'all', label: '🎯 Tất cả' },
];

export const TYPE_LABELS = {
  fill_blank: '✏️ Điền chỗ trống', translation: '🔄 Dịch câu',
  rearrange: '🔀 Sắp xếp từ', multiple_choice: '☑️ Trắc nghiệm',
  error_correction: '🔧 Sửa lỗi', paraphrase_choose: '🔁 Paraphrase',
  data_transform: '✏️ Viết lại câu',
};

export const SKILL_LABELS = {
  noun_phrase: 'Noun Phrase', data_description: 'Mô tả Data',
  comparison: 'So sánh', trend_language: 'Xu hướng',
  paraphrase: 'Paraphrase', overview: 'Overview', introduction: 'Introduction',
};

export const TEXT_TYPES = ['translation', 'error_correction', 'data_transform'];
export const MC_TYPES = ['multiple_choice', 'paraphrase_choose'];

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) ?? fallback);
  } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); } catch { /* private mode */ }
}

// ── The address: ?skill=&set=&mode= (invalid values are ignored) ──
export function stateFromSearch(search) {
  const q = new URLSearchParams(search);
  const skill = SKILLS.some((s) => s.id === q.get('skill')) ? q.get('skill') : null;
  const set = ['set1', 'set2'].includes(q.get('set')) ? q.get('set') : '';
  const mode = q.get('mode') === 'test' ? 'test' : 'practice';
  return { skill, set, mode };
}
export const stateQuery = ({ skill, set, mode }) => `?skill=${skill}${set ? `&set=${set}` : ''}&mode=${mode}`;

// ── "Đã hoàn thành" per skill: a session on one skill scoring ≥80% ──
const SKILL_SCORE_KEY = 't1_skill_scores';
const SKILL_COMPLETE_THRESHOLD = 80;
const SKILL_IDS = Object.keys(SKILL_LABELS);

export const loadSkillScores = () => read(SKILL_SCORE_KEY, {}) || {};

export function saveSkillScore(skill, score) {
  const all = loadSkillScores();
  const prev = all[skill] || { bestScore: 0, latestScore: 0, completed: false, completedAt: null };
  const bestScore = Math.max(prev.bestScore, score);
  const completed = bestScore >= SKILL_COMPLETE_THRESHOLD;
  const completedAt = (completed && !prev.completed) ? new Date().toISOString() : prev.completedAt;
  all[skill] = { bestScore, latestScore: score, completed, completedAt };
  write(SKILL_SCORE_KEY, all);
  return all;
}
export const completedSkillCount = (scores) => SKILL_IDS.filter((s) => scores[s]?.completed).length;
export const SKILL_COUNT = SKILL_IDS.length;

// ── XP shown top right (t1_progress); the 🔥 there is the session combo ──
export function loadXP() {
  const stored = read('t1_progress', { xp: 0, lastDate: '' }) || {};
  const today = new Date().toISOString().slice(0, 10);
  if (stored.lastDate !== today) {
    stored.lastDate = today;
    write('t1_progress', stored);
  }
  return stored.xp || 0;
}
export function addXP(earned) {
  const stored = read('t1_progress', { xp: 0, lastDate: '' }) || {};
  stored.xp = (stored.xp || 0) + earned;
  write('t1_progress', stored);
  return stored.xp;
}

// ── Options ──
export const loadOption = (key) => { try { return localStorage.getItem(key) === 'on'; } catch { return false; } };
export const saveOption = (key, on) => write(key, on ? 'on' : 'off');

// The "Khi nào dùng?" box remembers being closed
const WHEN_GUIDE_KEY = 't1_when_guide_closed';
export const whenGuideClosed = () => { try { return localStorage.getItem(WHEN_GUIDE_KEY) === '1'; } catch { return false; } };
export const saveWhenGuideClosed = (closed) => write(WHEN_GUIDE_KEY, closed ? '1' : '0');

// What the server gives a wrong answer (task1PracticeService)
export const wrongXP = (ex) => Math.max(1, Math.floor((ex?.xpReward || 5) * 0.1));

// The question of one attempt, as the history and admin pages show it
export const questionText = (ex) => ex.questionVi || ex.questionEn || '';

export function doneTitle(pct) {
  return pct >= 80 ? 'Giỏi dữ hen!' : pct >= 50 ? 'Tạm ổn thôi...' : 'Học đàng hoàng zô!';
}

// "📋 Ngữ cảnh dữ liệu": Subject · Year · Value unit
export function dataLine(dc, sep = ' · ') {
  if (!dc) return '';
  let line = dc.subject || '';
  if (dc.year) line += sep + dc.year;
  if (dc.value) line += sep + dc.value + (dc.unit ? ' ' + dc.unit : '');
  return line;
}

export const blankCount = (text) => (String(text || '').match(/___/g) || []).length;
