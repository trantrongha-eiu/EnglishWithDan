// Homework "học N từ trong sổ" progress — port of dashboard.js
// _goalsForCurrentBook / _goalProgress (server: services/vocabGoalService.js).
// A word counts once it got a graded practice answer after the assignment
// was created; its latest answer decides right/wrong. Done = the book holds
// ≥ N words, ≥ N of them practised, ≥ needCorrect (70% of N) answered right.

// word _id → right? (latest session's outcome, "wrong at any point" = wrong).
// Module-level like the old page: answers given in this tab move the bar
// before the server sync lands, and survive going Practice → BookView.
const answers = new Map();
export function noteGoalAnswer(wordId, right) {
  if (wordId) answers.set(String(wordId), !!right);
}

// Goals the book counts for: a fixed slot ("Sổ 2") or any of Sổ 1–5.
export function goalsForBook(goals, book) {
  if (!book || !goals?.length) return [];
  return goals.filter(g => (g.requiredSlot
    ? (g.bookId === String(book._id) || book.defaultSlot === g.requiredSlot)
    : !!book.isDefault));
}

// undefined = not practised for this goal yet, true/false = latest answer
function wordState(w, sinceMs) {
  if (w._id && answers.has(String(w._id))) return answers.get(String(w._id));
  if (w.lastPracticedAt && new Date(w.lastPracticedAt).getTime() >= sinceMs) return w.lastPracticeCorrect === true;
  return undefined;
}

export function goalProgress(g, words = []) {
  const sinceMs = g.since ? new Date(g.since).getTime() : 0;
  let practiced = 0, correct = 0, fresh = 0, noMeaning = 0;
  for (const w of words) {
    const st = wordState(w, sinceMs);
    if (st === undefined) {
      // practice skips a word without a meaning, so it can't count until it has one
      if (w.word && String(w.meaning || '').trim()) fresh++; else noMeaning++;
      continue;
    }
    practiced++;
    if (st) correct++;
  }
  const size = words.length;
  const done = g.completed || (size >= g.target && practiced >= g.target && correct >= g.needCorrect);
  return { practiced, correct, size, done, fresh, noMeaning };
}
