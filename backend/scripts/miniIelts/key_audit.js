// Static audit of fill-in answer keys for the imported mini-ielts passages (reads passages.json — run dump_passages.js first).
// For every fill-blank question, each "/"-separated alternative must: appear in the passage text, respect the
// group's word limit, carry no stray punctuation/quotes, and have a straight-apostrophe variant if it uses ’.
// Usage: node key_audit.js [TAG]   (default tag: mini-ielts)
const ps = require('./passages.json');
const tag = process.argv[2] || 'mini-ielts';
const norm = s => String(s).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/­/g, '').toLowerCase().replace(/\s+/g, ' ');
const LIMIT = { 'ONE WORD': 1, 'TWO WORDS': 2, 'THREE WORDS': 3, 'FOUR WORDS': 4 };
let bad = 0, checked = 0;
for (const p of ps.filter(p => (p.tags || []).includes(tag))) {
  const text = norm(p.content);
  const issues = [];
  for (const g of p.questionGroups || []) {
    const m = String(g.instruction || '').toUpperCase().match(/(ONE WORD|TWO WORDS|THREE WORDS|FOUR WORDS)/);
    const limit = m ? LIMIT[m[1]] : 3;
    const allowNumber = /NUMBER/i.test(g.instruction || '');
    for (const q of g.questions || []) {
      if (q.type !== 'fill-blank') continue;
      checked++;
      const alts = String(q.correctAnswer || '').split(/\s*\/\s*/).filter(Boolean);
      if (!alts.length) { issues.push(`Q${q.questionNumber} empty key`); continue; }
      for (const a of alts) {
        const words = a.trim().split(/\s+/).filter(w => !(allowNumber && /^[\d.,]+$/.test(w)));
        if (words.length > limit) issues.push(`Q${q.questionNumber} "${a}" is ${words.length} words > limit ${limit}`);
        if (/^[\s'"‘’“”.,;:]|[\s'"‘’“”,;:]$|\.$/.test(a)) issues.push(`Q${q.questionNumber} "${a}" has leading/trailing punctuation or quotes`);
        if (!text.includes(norm(a).trim())) issues.push(`Q${q.questionNumber} "${a}" not found in passage`);
      }
      if (alts.some(a => a.includes('’')) && !alts.some(a => a.includes("'"))) issues.push(`Q${q.questionNumber} only a curly-apostrophe variant: "${q.correctAnswer}"`);
    }
  }
  if (issues.length) { bad++; console.log(`✗ ${p.title}\n   ${issues.join('\n   ')}`); }
}
console.log(`\n${checked} fill-in keys checked; ${bad} passages with issues`);
