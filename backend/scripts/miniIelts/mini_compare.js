// READ-ONLY: print a live mini passage's question groups next to the original mini-ielts extract (web/mini/x_<id>.json)
// so hand-rebuilt groups (tables, headings, question lists in mini_patches.js) can be compared by eye.
// Usage: node mini_compare.js <miniId> [groupIndex…]      (reads passages.json + ../data/miniIeltsReading/*.json)
const fs = require('fs');
const path = require('path');
const [id, ...gi] = process.argv.slice(2);
const dir = path.join(__dirname, '..', 'data', 'miniIeltsReading');
let item;
for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.json'))) {
  for (const it of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) if (new RegExp(`[/=_-]${id}(\\D|$)`).test(String(it.source))) item = { ...it, file: f };
}
if (!item) { console.log('not in any batch file'); process.exit(1); }
const p = require('./passages.json').find(x => x.title === item.doc.title && (x.tags || []).includes('mini-ielts'));
const x = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', 'mini', `x_${id}.json`), 'utf8'));
console.log(`${p.title} (${p._id}, ${item.file}) Q${p.questionRange.start}-${p.questionRange.end}; mini answers:`, JSON.stringify(x.answers).replace(/ \(adsbygoogle[^"]*/g, ''));
const strip = s => String(s).replace(/<[^>]+>/g, '');
p.questionGroups.forEach((g, i) => {
  if (gi.length && !gi.includes(String(i))) return;
  console.log(`\n=== DB G${i} ${g.groupType} | ${g.instruction}`);
  if (g.noteConfig?.lines?.length) console.log('NOTE', g.noteConfig.title, '\n  ' + g.noteConfig.lines.map(strip).join('\n  '));
  if (g.tableConfig?.rows?.length) console.log('TABLE', g.tableConfig.headers.join(' | '), '\n  ' + g.tableConfig.rows.map(r => r.join(' | ')).join('\n  '));
  if (g.headingsConfig?.headings?.length) console.log('HEADINGS\n  ' + g.headingsConfig.headings.map((h, k) => `${['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'][k]} ${h.text || h}`).join('\n  '));
  if (g.endingsConfig?.endings?.length) console.log('ENDINGS\n  ' + g.endingsConfig.endings.map((e, k) => `${'ABCDEFGHIJ'[k]} ${e.text || e}`).join('\n  '));
  if (g.matchingOptions?.length) console.log('OPTIONS', g.matchingOptions.map((o, k) => `${'ABCDEFGHIJKL'[k]} ${o}`).join(' | '));
  for (const q of g.questions) console.log(`  Q${q.questionNumber} [${q.type}] ${strip(q.questionText).slice(0, 150)}${q.options?.length ? ' {' + q.options.join(' | ') + '}' : ''}  => ${q.correctAnswer}`);
});
console.log('\n=== ORIGINAL');
for (const s of x.sections) {
  console.log(`--- ${s.heading}${s.imgs?.length ? ' [img]' : ''}`);
  for (const b of s.blocks) console.log('  ' + b.text.slice(0, 1500));
}
