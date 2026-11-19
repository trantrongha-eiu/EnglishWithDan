// Helpers of the "Viết câu nâng cao" page (/app/advanced-sentences)

// Best score per group on this device, same key as the old static page so the
// "Đã hoàn thành" ticks carry over.
const LS_SCORES = 'as_group_scores';

export function loadScores() {
  try { return JSON.parse(localStorage.getItem(LS_SCORES) || '{}') || {}; } catch { return {}; }
}

export function saveGroupScore(id, score) {
  const all = loadScores();
  const prev = all[id] || { best: 0 };
  all[id] = { best: Math.max(prev.best || 0, score), completed: (prev.completed || score >= 80), at: Date.now() };
  try { localStorage.setItem(LS_SCORES, JSON.stringify(all)); } catch { /* private mode */ }
}

// Sentences of a draft still to do
export const remainingOf = (d) => ((d?.sentenceIds?.length) || 0) - (d?.currentIdx || 0);

export function fmtDate(d) {
  const x = new Date(d);
  return `${String(x.getDate()).padStart(2, '0')}/${String(x.getMonth() + 1).padStart(2, '0')}/${x.getFullYear()}`;
}

export const accClass = (p) => (p >= 70 ? 'good' : p >= 50 ? 'mid' : 'bad');
