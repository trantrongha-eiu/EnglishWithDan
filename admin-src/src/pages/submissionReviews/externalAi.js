// Parse what an outside AI (ChatGPT, Claude…) replied to the "📋 Copy
// prompt" text into the teacher form: { band, scores, note }. The prompt asks
// for the same JSON our own grader uses (writing: scores/overallBand/
// feedbackVi/corrections…; speaking: criteria.*.band/overallFeedback…), but
// a reply that isn't JSON still works — it simply becomes the comment.

const NOTE_MAX = 4000;

// Every balanced {...} block in `s`, in order (braces inside JSON strings
// don't count). The old single greedy /\{[\s\S]*\}/ spanned from the first
// "{" to the last "}", so any brace in the AI's chatter around the JSON
// ("{band}", a second example object) made the whole reply unparseable.
function objectBlocks(s) {
  const out = [];
  for (let i = s.indexOf('{'); i !== -1; i = s.indexOf('{', i + 1)) {
    let depth = 0, inStr = false, esc = false;
    for (let j = i; j < s.length; j++) {
      const c = s[j];
      if (inStr) {
        if (esc) esc = false;
        else if (c === '\\') esc = true;
        else if (c === '"') inStr = false;
      } else if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) { out.push(s.slice(i, j + 1)); break; }
    }
  }
  return out;
}

// Chat UIs often hand back “smart quotes” and trailing commas — retried
// with those repaired before giving up.
function tryParse(block) {
  try { return JSON.parse(block); } catch { /* repair below */ }
  const fixed = block.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/,\s*([}\]])/g, '$1');
  try { return JSON.parse(fixed); } catch { return null; }
}

const KNOWN_KEYS = ['scores', 'bandScores', 'overallBand', 'bandEstimate', 'criteria', 'feedbackVi', 'overallFeedback'];

function extractJson(text) {
  const s = String(text || '');
  const fences = [...s.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map(m => m[1]);
  let first = null;
  for (const body of [...fences, s]) {
    for (const block of objectBlocks(body)) {
      const j = tryParse(block);
      if (!j || typeof j !== 'object' || Array.isArray(j)) continue;
      if (KNOWN_KEYS.some(k => k in j)) return j; // the grading object itself
      if (!first) first = j;
    }
  }
  return first;
}

// A band as a number or text ("6.5", "Band 6.5", "6,5").
function half(v) {
  if (v === null || v === undefined || v === '') return '';
  const m = typeof v === 'number' ? [String(v)] : String(v).replace(',', '.').match(/\d+(?:\.\d+)?/);
  const n = m ? Number(m[0]) : NaN;
  if (!Number.isFinite(n) || n < 0 || n > 9) return '';
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
