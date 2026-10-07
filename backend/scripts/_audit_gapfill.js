// READ-ONLY audit of Listening gap-fill state across active sections.
// Usage: node backend/scripts/_audit_gapfill.js [--json out.json]
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');

const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const NON_NAME = new Set(['i', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']);
function looksName(a) {
  const w = String(a || '').trim().split(/\s+/).filter(Boolean);
  if (!w.length) return false;
  return w.every((x) => { const c = x.replace(/[^A-Za-z]/g, ''); if (c.length < 2) return false; if (NON_NAME.has(c.toLowerCase())) return false; return /^[A-Z][a-z]+$/.test(c); });
}

function check(s) {
  const issues = [];
  const tpl = s.gapFillTemplate || '';
  const ans = s.gapFillAnswers || [];
  const tokens = [...tpl.matchAll(/\[\[(\d+)\]\]/g)].map((m) => Number(m[1]));
  if (!tokens.length) issues.push('no_tokens');
  const seqOk = tokens.every((n, i) => n === i + 1);
  if (!seqOk) issues.push('token_sequence');
  if (tokens.length !== ans.length) issues.push(`token_count(${tokens.length})!=answers(${ans.length})`);
  let missing = false;
  const rebuilt = tpl.replace(/\[\[(\d+)\]\]/g, (_m, n) => { const a = ans[Number(n) - 1]; if (a == null) { missing = true; return ''; } return a; });
  if (missing) issues.push('missing_answer');
  else if (s.transcript && norm(rebuilt) !== norm(s.transcript)) issues.push('transcript_mismatch');
  if (!s.transcript) issues.push('no_transcript');
  const wc = norm(s.transcript).split(' ').filter(Boolean).length;
  if (wc >= 300 && ans.length < 25) issues.push(`few_blanks(${ans.length})`);
  const empty = ans.filter((a) => !String(a).trim());
  if (empty.length) issues.push(`empty_answers(${empty.length})`);
  const long = ans.filter((a) => String(a).trim().split(/\s+/).length > 3);
  if (long.length) issues.push(`long_answers:${long.join(' | ')}`);
  const names = [...new Set(ans.filter(looksName))];
  if (names.length) issues.push(`names:${names.join(', ')}`);
  if (!s.audioUrl) issues.push('no_audio');
  return { issues, blanks: ans.length, words: wc };
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const secs = await ListeningSection.find({ isActive: true })
    .select('title partNumber transcript audioUrl gapFillTemplate gapFillAnswers gapFillPublished gapFillGeneratedAt gapFillSkippedAt gapFillSkipReason')
    .lean();
  const out = { published: [], unpubWithContent: [], skipped: [], noTranscript: [], untried: [] };
  for (const s of secs) {
    const base = { id: String(s._id), title: s.title, part: s.partNumber };
    if (s.gapFillPublished) { out.published.push({ ...base, ...check(s) }); continue; }
    if (s.gapFillTemplate) { out.unpubWithContent.push({ ...base, ...check(s), generatedAt: s.gapFillGeneratedAt }); continue; }
    if (!norm(s.transcript)) { out.noTranscript.push(base); continue; }
    if (s.gapFillSkippedAt) { out.skipped.push({ ...base, reason: s.gapFillSkipReason }); continue; }
    out.untried.push(base);
  }
  console.log('active sections:', secs.length);
  for (const k of Object.keys(out)) console.log(k, out[k].length);
  const pubBad = out.published.filter((x) => x.issues.length);
  console.log('\npublished WITH issues:', pubBad.length);
  pubBad.slice(0, 15).forEach((x) => console.log(' ', x.id, x.title, x.issues.join(' ; ')));
  const issueCount = {};
  for (const x of out.unpubWithContent) for (const i of x.issues) { const k = i.split(/[:(]/)[0]; issueCount[k] = (issueCount[k] || 0) + 1; }
  console.log('\nunpublished-with-content issue kinds:', issueCount, 'clean:', out.unpubWithContent.filter((x) => !x.issues.length).length);
  const reasons = {};
  for (const x of out.skipped) { const k = String(x.reason).slice(0, 90); reasons[k] = (reasons[k] || 0) + 1; }
  console.log('\nskip reasons:', reasons);
  const i = process.argv.indexOf('--json');
  if (i > 0) require('fs').writeFileSync(process.argv[i + 1], JSON.stringify(out, null, 1));
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
