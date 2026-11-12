// Shared by ReviewGradeModal (and its test) — kept out of the .jsx so the
// component file only exports components (react-refresh lint rule).

export const SCORE_LABELS = {
  taskAchievement: 'Task Achievement', coherence: 'Coherence & Cohesion', lexical: 'Lexical Resource', grammar: 'Grammar',
  fluency: 'Fluency & Coherence', vocabulary: 'Lexical Resource', pronunciation: 'Pronunciation',
};

// IELTS rounding of the 4-criterion mean: .25 → up to .5, .75 → up to the
// next whole band. null until every criterion has a band.
export function overallFromScores(scores, keys) {
  const vals = keys.map(k => scores[k]).filter(v => v !== '' && v != null).map(Number);
  if (!keys.length || vals.length !== keys.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 2) / 2;
}
