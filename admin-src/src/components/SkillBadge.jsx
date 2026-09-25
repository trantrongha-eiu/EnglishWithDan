// Shared skill-label map + badge renderer — was three byte-identical copies
// (StudentDetail.jsx, StudentHistory.jsx) plus a fourth, DIVERGENT copy in
// Dashboard.jsx that was missing 5 real, common skill types (reading-practice,
// listening-practice, writing-practice, task1-practice, task2-practice),
// which fell back to showing the raw API slug to a teacher instead of a
// label (audit finding BUG-014). One shared source of truth now — add a new
// skill here once and every consumer picks it up.
export const SKILL_META = {
  'reading':            { color: 'var(--blue)', label: 'Reading' },
  'listening':          { color: 'var(--green)', label: 'Listening' },
  'writing':            { color: 'var(--yellow)', label: 'Writing' },
  'speaking':           { color: 'var(--purple)', label: 'Speaking' },
  'reading-practice':   { color: '#93c5fd', label: '📄 Reading lẻ' },
  'listening-practice': { color: '#6ee7b7', label: '🎵 Listening lẻ' },
  'writing-practice':   { color: '#f97316', label: '✍ Writing lẻ' },
  'task1-practice':     { color: '#fb923c', label: '📊 Task 1' },
  'task2-practice':     { color: 'var(--danger)', label: '📝 Task 2' },
  'task2-template':     { color: '#8b5cf6', label: '📚 Task 2 Templates' },
  'essential-grammar':  { color: '#0ea5e9', label: '📘 Ngữ pháp' },
  'vocabulary-lesson':  { color: '#14b8a6', label: '🗂 Từ vựng' },
  'dictation':          { color: '#22d3ee', label: '🎧 Dictation' },
  'listening-gapfill':  { color: '#06b6d4', label: '📝 Gap-fill' },
  'adv-sentence':       { color: '#ea580c', label: '🧩 Viết câu nâng cao' },
  // Task 1/Task 2/Speaking/Noun Phrase course exercises all share one
  // collection (WT1Submission) — the backend tells them apart by the
  // lessonCode prefix (T1-/T2-/SPK-/NP-) and reports a distinct `skill` per
  // course (see routes/admin/stats.js wt1SkillFromLessonCode) so a Speaking
  // submission no longer shows up mislabelled as "Khoá học (T1/T2)".
  // testMeta still carries the raw lessonCode for the exact lesson.
  'wt1-t1':             { color: '#0284c7', label: '📘 Khoá học Task 1' },
  'wt1-t2':             { color: '#0891b2', label: '📗 Khoá học Task 2' },
  'wt1-speaking':       { color: 'var(--purple)', label: '🎤 Khoá học Speaking' },
  'wt1-noun-phrase':    { color: '#8b5cf6', label: '🔤 Khoá học Noun Phrase' },
  // Fallback only — a lessonCode that doesn't match any known prefix.
  'wt1-course':         { color: '#0284c7', label: '📖 Khoá học (khác)' },
};

export function skillBadge(skill) {
  const { color, label } = SKILL_META[skill] || { color: '#8b92a8', label: skill };
  return <span style={{ background: color + '22', color, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{label}</span>;
}
