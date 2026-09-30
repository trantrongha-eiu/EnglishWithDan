'use strict';

/**
 * Write the Vietnamese answer explanations of the mini-ielts Reading passages
 * (data/miniIeltsReading/explanations/<passageId>.json) into
 * questionGroups[].questions[].explanation.
 *
 * Data file: { title, q: { "<questionNumber>": { d, v, t, p } } }
 *   d = Vietnamese translation of the statement / question
 *   v = where to look ("Đoạn C"), optional
 *   t = quote(s) from the passage — string or array, each must appear verbatim
 *   p = analysis, ending with "→ <answer>" (the answer key)
 *   key, why = optional correction of a wrong answer key found while writing
 *              the explanation (written to correctAnswer; `why` is required)
 *
 * Checks before writing (a passage with any problem is skipped): the passage
 * exists and is tagged mini-ielts, the title matches, every question has an
 * entry and no extra ones, every quote is found in the passage text, and the
 * text after the last "→" contains the key's main answer. Only `explanation`
 * changes (the doc is replaced conditionally on updatedAt); questions that
 * already have an explanation are left alone unless --force.
 *
 * Run:  node backend/scripts/setMiniExplanations.js [file.json…]           (dry run; default: all files)
 *       node backend/scripts/setMiniExplanations.js [file.json…] --apply [--force]
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'data', 'miniIeltsReading', 'explanations');
const norm = s => ' ' + String(s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').toLowerCase()
  .replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—−-]/g, '-').replace(/­/g, '').replace(/…/g, '...').replace(/\s+/g, ' ') + ' ';
const quotes = t => (Array.isArray(t) ? t : [t]).filter(Boolean);

function compose(e) {
  const parts = [`Dịch: ${e.d}`];
  if (e.v) parts.push(`Vị trí: ${e.v}`);
  const qs = quotes(e.t);
  if (qs.length) parts.push(`Trích: ${qs.map(x => `“${x}”`).join(' … ')}`);
  parts.push(`Phân tích: ${e.p}`);
  return parts.join('\n\n');
}

function check(p, data) {
  const problems = [];
  if (!(p.tags || []).includes('mini-ielts')) problems.push('not a mini-ielts passage');
  if (data.title && data.title.trim() !== p.title.trim()) problems.push(`title "${data.title}" ≠ "${p.title}"`);
  const qs = (p.questionGroups || []).flatMap(g => g.questions);
  const body = norm(p.content);
  const nums = new Set(qs.map(q => String(q.questionNumber)));
  for (const n of Object.keys(data.q || {})) if (!nums.has(n)) problems.push(`Q${n}: no such question`);
  for (const q of qs) {
    const e = (data.q || {})[q.questionNumber];
    if (!e) { problems.push(`Q${q.questionNumber}: missing`); continue; }
    if (!e.d || !e.p) problems.push(`Q${q.questionNumber}: empty d/p`);
    for (const t of quotes(e.t)) if (!body.includes(norm(t).trim())) problems.push(`Q${q.questionNumber}: quote not in passage: "${t.slice(0, 70)}"`);
    const tail = norm(String(e.p).split('→').pop());
    if (e.key !== undefined && !e.why) problems.push(`Q${q.questionNumber}: key change without "why"`);
    let key = String(e.key !== undefined ? e.key : q.correctAnswer || '');
    try { const j = JSON.parse(key); if (Array.isArray(j)) key = j.join(' '); } catch { /* plain key */ }
    const main = norm(key.split(/\s*\/\s*/)[0]).trim();
    if (!String(e.p).includes('→') || !tail.includes(main)) problems.push(`Q${q.questionNumber}: analysis must end "→ ${key.split(/\s*\/\s*/)[0]}"`);
  }
  return problems;
}

async function run() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const force = args.includes('--force');
  let files = args.filter(a => !a.startsWith('--')).map(f => path.resolve(f));
  if (!files.length) files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).map(f => path.join(DIR, f));

  // --local: validate against the miniIelts/passages.json dump, no DB connection
  if (args.includes('--local')) {
    const dump = require('./miniIelts/passages.json');
    let bad = 0;
    for (const f of files) {
      const id = path.basename(f, '.json');
      const p = dump.find(x => String(x._id) === id);
      const problems = p ? check(p, JSON.parse(fs.readFileSync(f, 'utf8'))) : ['passage not in dump'];
      if (problems.length) bad++;
      console.log(`${problems.length ? '✗' : '✓'} ${p ? p.title : id}${problems.length ? '\n   ' + problems.join('\n   ') : ''}`);
    }
    console.log(`\n${files.length - bad}/${files.length} valid`);
    return;
  }

  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const Passage = require('../models/Passage');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    let ok = 0, bad = 0, written = 0;
    for (const f of files) {
      const id = path.basename(f, '.json');
      const data = JSON.parse(fs.readFileSync(f, 'utf8'));
      const p = await Passage.findById(id).lean();
      if (!p) { console.log(`✗ ${id}: passage not found`); bad++; continue; }
      const problems = check(p, data);
      if (problems.length) { console.log(`✗ ${p.title}\n   ${problems.join('\n   ')}`); bad++; continue; }
      let changes = 0;
      const keyChanges = [];
      const groups = p.questionGroups.map(g => ({ ...g, questions: g.questions.map(q => {
        const e = data.q[q.questionNumber];
        let out = q;
        if (e.key !== undefined && e.key !== q.correctAnswer) {
          keyChanges.push(`Q${q.questionNumber}: "${q.correctAnswer}" → "${e.key}" (${e.why})`);
          out = { ...out, correctAnswer: e.key };
        }
        if (q.explanation && !force) return out;
        const explanation = compose(e);
        if (explanation !== q.explanation) changes++;
        return { ...out, explanation };
      }) }));
      ok++;
      console.log(`${apply ? '→' : '✓'} ${p.title}: ${changes} explanation(s) to write${keyChanges.map(k => `\n   KEY CHANGE ${k}`).join('')}`);
      changes += keyChanges.length;
      if (!apply || !changes) continue;
      const r = await Passage.collection.updateOne({ _id: p._id, updatedAt: p.updatedAt }, { $set: { questionGroups: groups, updatedAt: new Date() } });
      if (r.modifiedCount) written++; else console.log(`   ✗ changed meanwhile — skipped`);
    }
    console.log(`\n${ok} passage(s) valid, ${bad} with problems${apply ? `, ${written} written` : ' — dry run, re-run with --apply'}`);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) run().catch(e => { console.error('[explanations] FAILED', e); process.exit(1); });
module.exports = { compose, check, norm };
