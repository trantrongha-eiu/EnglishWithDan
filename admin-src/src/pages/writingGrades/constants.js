export const PAGE = 30;

export const STATUS = {
  pending:   { label: 'Chờ chấm',      cls: 'badge-red'   },
  ai_done:   { label: 'AI đã chấm',    cls: 'badge-blue'  },
  confirmed: { label: 'Đã xác nhận',   cls: 'badge-green' },
};

export const EMPTY_MANUAL = () => ({
  bandScore: '',
  ta:  { score: '', comment: '' },
  cc:  { score: '', comment: '' },
  lr:  { score: '', comment: '' },
  gra: { score: '', comment: '' },
  overallFeedback: ''
});

// ── IELTS / IDP–BC band arithmetic ───────────────────────────────────
// Round an average to the nearest half band. IELTS rounds an average
// ending in .25 UP to .5 and one ending in .75 UP to the next whole;
// Math.round (halves up) produces exactly that for every average that can
// come out of 0.5-step scores.
export const roundHalfBand = avg => Math.round(avg * 2) / 2;

// One writing task's band = the equally-weighted average of the four
// criteria (TA/TR, CC, LR, GRA), rounded. '' until all four are numeric.
export function taskBandFromCriteria(c) {
  const s = ['ta', 'cc', 'lr', 'gra'].map(k => parseFloat(c?.[k]?.score));
  if (s.some(n => isNaN(n))) return '';
  return String(roundHalfBand(s.reduce((a, b) => a + b, 0) / 4));
}

// Overall Writing band from the two task bands. IELTS weights Task 2 twice
// as heavily as Task 1: (T1 + 2·T2) / 3, rounded. With only one task
// present, that task's band. '' when neither is numeric.
export function overallWritingBand(t1, t2) {
  const a = parseFloat(t1), b = parseFloat(t2);
  const hasA = !isNaN(a), hasB = !isNaN(b);
  if (hasA && hasB) return String(roundHalfBand((a + 2 * b) / 3));
  if (hasB) return String(roundHalfBand(b));
  if (hasA) return String(roundHalfBand(a));
  return '';
}
