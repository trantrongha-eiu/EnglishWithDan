// Validate freshly generated gap-fills and publish the clean ones.
// Dry-run by default; --apply writes gapFillPublished:true for passing ids ONLY.
// Usage: node backend/scripts/_publish_gapfill.js <idsFile> [--apply] [--allow id1,id2]
//   --allow: ids a human reviewed whose only issue is a heuristic flag (names/long/few)
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');

// Same fidelity rule as geminiService.normalizeGapFillText (annotations like "(31)" ignored).
const norm = (s) => String(s || '').replace(/[ \t]*\(\d{1,3}\)|[ \t]*\bQ\d{1,3}\b\.?/g, '').replace(/\s+/g, ' ').trim();
const NON_NAME = new Set(['i', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']);
function looksName(a) {
  const w = String(a || '').trim().split(/\s+/).filter(Boolean);
  if (!w.length) return false;
  return w.every((x) => { const c = x.replace(/[^A-Za-z]/g, ''); if (c.length < 2) return false; if (NON_NAME.has(c.toLowerCase())) return false; return /^[A-Z][a-z]+$/.test(c); });
}

// hard = structural (never publish); soft = heuristic (publish only with --allow)
function check(s) {
  const hard = [];
  const soft = [];
  const tpl = s.gapFillTemplate || '';
  const ans = s.gapFillAnswers || [];
  const tokens = [...tpl.matchAll(/\[\[(\d+)\]\]/g)].map((m) => Number(m[1]));
  if (!tpl) hard.push('no_template');
  if (!tokens.length) hard.push('no_tokens');
  if (!tokens.every((n, i) => n === i + 1)) hard.push('token_sequence');
  if (tokens.length !== ans.length) hard.push(`token_count(${tokens.length})!=answers(${ans.length})`);
  const rebuilt = tpl.replace(/\[\[(\d+)\]\]/g, (_m, n) => ans[Number(n) - 1] ?? '\u0000');
  if (rebuilt.includes('\u0000')) hard.push('missing_answer');
  else if (norm(rebuilt) !== norm(s.transcript)) hard.push('transcript_mismatch');
  if (ans.some((a) => !String(a).trim())) hard.push('empty_answer');
  if (!s.audioUrl) hard.push('no_audio');
  const wc = norm(s.transcript).split(' ').filter(Boolean).length;
  if (ans.length < 18) soft.push(`few_blanks(${ans.length}, ${wc} words)`);
  const long = ans.filter((a) => String(a).trim().split(/\s+/).length > 3);
  if (long.length) soft.push(`long:${long.join(' | ')}`);
  const names = [...new Set(ans.filter(looksName))];
  if (names.length) soft.push(`names:${names.join(', ')}`);
  return { hard, soft, blanks: ans.length };
}

(async () => {
  const ids = fs.readFileSync(process.argv[2], 'utf8').split(/[\s,]+/).filter(Boolean);
  const apply = process.argv.includes('--apply');
  const ai = process.argv.indexOf('--allow');
  const allow = new Set(ai > 0 ? process.argv[ai + 1].split(',') : []);
  await mongoose.connect(process.env.MONGO_URI);
  const secs = await ListeningSection.find({ _id: { $in: ids }, isActive: true })
    .select('title partNumber transcript audioUrl gapFillTemplate gapFillAnswers gapFillPublished gapFillSkipReason').lean();
  const toPublish = [];
  for (const s of secs) {
    const r = check(s);
    const ok = !r.hard.length && (!r.soft.length || allow.has(String(s._id)));
    if (ok) toPublish.push(s._id);
    const tag = ok ? 'OK  ' : (r.hard.length ? 'HARD' : 'SOFT');
    console.log(`${tag} ${s._id} P${s.partNumber} ${s.title} — ${r.blanks} blanks ${[...r.hard, ...r.soft].join(' ; ')}${s.gapFillSkipReason ? ` [skip: ${s.gapFillSkipReason}]` : ''}`);
  }
  console.log(`\n${secs.length} checked, ${toPublish.length} publishable${apply ? '' : ' (dry run)'}`);
  if (apply && toPublish.length) {
    const r = await ListeningSection.updateMany({ _id: { $in: toPublish } }, { $set: { gapFillPublished: true } });
    console.log('published:', r.modifiedCount);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
