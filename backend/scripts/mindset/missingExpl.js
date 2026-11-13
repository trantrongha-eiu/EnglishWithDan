// scripts/mindset/missingExpl.js — list course exercise items that still have no
// per-item explanation (after buildMindset merged <level>/expl/uNN.js).
//
//   node scripts/mindset/missingExpl.js mindset0            # counts per unit
//   node scripts/mindset/missingExpl.js mindset0 u03        # full dump of one unit to write against
//
// Explanations live in scripts/mindset/<m0|m1|m2>/expl/uNN.js:
//   module.exports = { 'M0-U03-L1-E02': ['giải thích câu 1', 'câu 2', …], … }
// one string per item, in item order ('' / null = keep the DSL's own).
'use strict';

const fs = require('fs');
const path = require('path');

const [book, unit] = process.argv.slice(2);
if (!book) { console.error('Usage: node scripts/mindset/missingExpl.js <mindset0|mindset1|mindset2> [uNN]'); process.exit(1); }
const dir = path.join(__dirname, '..', 'data', book);
const files = fs.readdirSync(dir).filter((f) => /^exercises-u\d+\.json$/.test(f)).sort();

const show = (e, it) => {
  switch (e.type) {
    case 'mcq': return `${it.prompt} | ${it.options.map((o) => `${o.id}) ${o.text}`).join(' · ')} → ${it.answer}`;
    case 'gap_fill': return `${it.prompt} → ${it.blanks.map((b) => b.accept.join('/')).join(' ; ')}`;
    case 'matching': return `${it.left} ⇒ ${it.right}`;
    case 'categorize': return `${it.text} ⇒ ${(e.categories.find((c) => c.id === it.category) || {}).label || it.category}`;
    case 'ordering': return it.answer.join(' ');
    case 'error_correction': return `${it.prompt} → ${it.answer}`;
    default: return JSON.stringify(it);
  }
};

let total = 0;
for (const f of files) {
  const tag = f.match(/u\d+/)[0];
  if (unit && tag !== unit) continue;
  const { exercises } = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  let n = 0;
  for (const e of exercises) {
    if (!e.items || !e.autoGrade) continue;
    const miss = e.items.filter((i) => !String(i.explanation || '').trim());
    if (!miss.length) continue;
    n += miss.length;
    if (unit) {
      console.log(`\n## ${e.code} [${e.type}] ${e.title}\n   ${String(e.instruction || '').replace(/\s+/g, ' ').slice(0, 300)}`);
      e.items.forEach((it, k) => console.log(`${k + 1}${miss.includes(it) ? '' : ' (có sẵn)'}. ${show(e, it)}`));
    }
  }
  total += n;
  if (!unit) console.log(`${tag}: ${n}`);
}
console.log(`total missing: ${total}`);
