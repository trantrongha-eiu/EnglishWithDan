// READ-ONLY: print the group (type, instruction, word bank / options) of given questions in a draft/final file.
// Usage: node q_info.js <file.json> <qnum…>
const fs = require('fs');
const [file, ...nums] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const body = String(d.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
for (const n of nums.map(Number)) {
  const g = d.questionGroups.find(g => g.questions.some(q => q.questionNumber === n));
  const q = g.questions.find(q => q.questionNumber === n);
  console.log(`Q${n} [${g.groupType}/${q.type}] key="${q.correctAnswer}"\n  ins: ${g.instruction}`);
  const bank = [...(g.summaryConfig?.wordBank || []), ...(g.dragDropConfig?.words || []), ...(g.matchingOptions || [])];
  if (bank.length) console.log('  bank:', bank.join(' | '));
  const line = (g.noteConfig?.lines || []).find(l => l.includes(`__Q${n}__`)) || q.questionText;
  console.log('  text:', String(line).replace(/<[^>]+>/g, ''));
  const k = String(q.correctAnswer).split(/\s*\/\s*/)[0];
  const i = body.toLowerCase().indexOf(k.toLowerCase().split(' ')[0]);
  console.log('  passage@key:', i >= 0 ? body.slice(Math.max(0, i - 150), i + 150) : '(first word not found)');
}
