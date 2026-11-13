// Parse what an outside AI (ChatGPT, Claude…) replied to the "📋 Copy
// prompt" text into the teacher form: { band, scores, note }. The prompt asks
// for the same JSON our own grader uses (writing: scores/overallBand/
// feedbackVi/corrections…; speaking: criteria.*.band/overallFeedback…), but
// a reply that isn't JSON still works — it simply becomes the comment.

const NOTE_MAX = 4000;

function extractJson(text) {
  const s = String(text || '');
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : s;
  const m = body.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

function half(v) {
  const n = Number(v);
  if (v === null || v === undefined || v === '' || !Number.isFinite(n) || n < 0 || n > 9) return '';
  return Math.round(n * 2) / 2;
}

const bullets = (title, arr) => (arr.length ? `\n\n${title}\n${arr.map(x => `• ${x}`).join('\n')}` : '');

function writingResult(j, keys) {
  const sc = j.scores || j.bandScores || {};
  const pick = { taskAchievement: sc.taskAchievement ?? sc.task ?? sc.ta, coherence: sc.coherence ?? sc.cc, lexical: sc.lexical ?? sc.lr, grammar: sc.grammar ?? sc.gra };
  const scores = {};
  keys.forEach(k => { scores[k] = half(pick[k]); });
  const fixes = (Array.isArray(j.corrections) ? j.corrections : [])
    .filter(c => c && (c.original || c.corrected))
    .map(c => `${c.original || ''} → ${c.corrected || ''}${c.note ? ` (${c.note})` : ''}`);
  const missing = Array.isArray(j.missingStructures) ? j.missingStructures.filter(Boolean) : [];
  const note = String(j.feedbackVi || j.overallFeedback || j.feedback || '').trim()
    + bullets('Lỗi cần sửa:', fixes)
    + (missing.length ? `\n\nCấu trúc còn thiếu: ${missing.join('; ')}` : '');
  return { band: half(j.overallBand ?? j.bandEstimate ?? j.overall), scores, note };
}

const SPEAKING_CRITERIA = { fluency: 'fluencyCoherence', vocabulary: 'lexicalResource', grammar: 'grammaticalRangeAccuracy', pronunciation: 'pronunciation' };

function speakingResult(j, keys) {
  const cr = j.criteria || {};
  const scores = {};
  keys.forEach(k => { scores[k] = half(cr[SPEAKING_CRITERIA[k]]?.band ?? j[k]); });
  const perCrit = Object.entries(SPEAKING_CRITERIA)
    .map(([, ck]) => cr[ck]?.feedback)
    .filter(Boolean);
  const fixes = Object.values(cr).flatMap(c => (Array.isArray(c?.limitations) ? c.limitations : []))
    .filter(l => l && l.studentQuote && l.correction)
    .slice(0, 8)
    .map(l => `${l.studentQuote} → ${l.correction}${l.explanation ? ` (${l.explanation})` : ''}`);
  const prio = Array.isArray(j.priorityImprovements) ? j.priorityImprovements.filter(Boolean) : [];
  const note = String(j.overallFeedback || j.feedbackVi || j.feedback || '').trim()
    + bullets('Nhận xét theo tiêu chí:', perCrit)
    + bullets('Lỗi cần sửa:', fixes)
    + bullets('Ưu tiên cải thiện:', prio);
  return { band: half(j.overallBand), scores, note };
}

// → { band, scores, note, parsed } ; band/scores entries are '' when absent.
export function parseExternalFeedback(text, kind, keys = []) {
  const j = extractJson(text);
  if (!j || typeof j !== 'object') {
    const scores = {};
    keys.forEach(k => { scores[k] = ''; });
    return { band: '', scores, note: String(text || '').trim().slice(0, NOTE_MAX), parsed: false };
  }
  const r = kind === 'speaking' ? speakingResult(j, keys) : writingResult(j, keys);
  return { ...r, note: r.note.trim().slice(0, NOTE_MAX), parsed: true };
}
