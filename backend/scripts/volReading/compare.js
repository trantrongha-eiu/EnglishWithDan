'use strict';
// READ-ONLY: compare the OCR text of a Vol passage (web/vol<V>/text/t<T>p<P>.txt) with a bank passage (web/passages.json):
// 6-gram coverage both ways for the passage text and for the questions, plus the OCR sentences missing from the bank.
//   node compare.js <vol> <T> <P> <passageId|idSuffix> [--missing]
const fs = require('fs'), path = require('path');
const [vol, T, P, pid] = process.argv.slice(2);
const showMissing = process.argv.includes('--missing');
const ps = require('./web/passages.json');
const bank = ps.find(p => String(p._id) === pid || String(p._id).endsWith(pid));
if (!bank) throw new Error('no passage ' + pid);
const raw = fs.readFileSync(path.join(__dirname, 'web', `vol${vol}`, 'text', `t${T}p${P}.txt`), 'utf8');
const [ptext, qtext] = raw.split('=== QUESTIONS ===');
const words = s => s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').toLowerCase().replace(/[‘’`]/g, "'").replace(/-\s*\n\s*/g, '').replace(/[^a-z0-9']+/g, ' ').trim().split(/\s+/).filter(Boolean);
const grams = (w, n = 6) => { const s = new Set(); for (let i = 0; i + n <= w.length; i++) s.add(w.slice(i, i + n).join(' ')); return s; };
const cov = (a, b) => { let h = 0; for (const g of a) if (b.has(g)) h++; return a.size ? h / a.size : 0; };
const qs = [];
for (const g of bank.questionGroups || []) {
  qs.push(g.instruction, g.groupTitle, g.matchingOptionsTitle, ...(g.matchingOptions || []), g.noteConfig?.title, ...(g.noteConfig?.lines || []), ...(g.bulletConfig?.items || []),
    g.summaryConfig?.text, ...(g.summaryConfig?.wordBank || []).map(w => w.word), ...(g.endingsConfig?.endings || []).map(e => e.text),
    ...(g.headingsConfig?.headings || []).map(h => h.text), ...(g.tableConfig?.headers || []), ...(g.tableConfig?.rows || []).flat(), g.dragDropConfig?.text);
  for (const q of g.questions || []) qs.push(q.questionText, ...(q.options || []));
}
const A = grams(words(ptext)), B = grams(words(bank.content));
const QA = grams(words(qtext || '')), QB = grams(words(qs.filter(Boolean).join(' \n ')));
console.log(`T${T}P${P} ↔ "${bank.title}" [${bank._id}] text: ocr→bank ${(cov(A, B) * 100).toFixed(0)}%, bank→ocr ${(cov(B, A) * 100).toFixed(0)}% | questions: ocr→bank ${(cov(QA, QB) * 100).toFixed(0)}%, bank→ocr ${(cov(QB, QA) * 100).toFixed(0)}%`);
if (showMissing) {
  // OCR lines whose 6-grams mostly don't occur in the bank text (passage part) — candidates for missing / different sentences
  const bw = B;
  for (const line of ptext.split('\n')) {
    const g = grams(words(line), 4); if (g.size < 3) continue;
    const g6 = grams(words(line)); if (!g6.size) continue;
    const c = cov(g6, bw); if (c < 0.5) console.log(`   OCR-only (${(c * 100).toFixed(0)}%): ${line}`);
  }
}
