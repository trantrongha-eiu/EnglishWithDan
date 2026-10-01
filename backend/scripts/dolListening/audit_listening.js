// READ-ONLY audit of every Listening section (đề lẻ) and every full test's embedded sections, from the
// dump in web/ (run dump_listening.js first). Prints one line per problem; summary at the end.
//   node audit_listening.js [--active] [--tests] [titleRegex]
const fs = require('fs'), path = require('path');
const W = f => path.join(__dirname, 'web', f);
const args = process.argv.slice(2);
const onlyActive = args.includes('--active');
const withTests = args.includes('--tests');
const re = args.find(a => !a.startsWith('--')) ? new RegExp(args.find(a => !a.startsWith('--')), 'i') : null;

const norm = s => ' ' + String(s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').toLowerCase()
  .replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—−]/g, '-').replace(/[^a-z0-9'£$%.\- ]+/g, ' ').replace(/\s+/g, ' ') + ' ';
const numWords = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, hundred: 100 };

function templateText(g) {
  return [g.noteConfig && g.noteConfig.lines && g.noteConfig.lines.join('\n'), g.tableConfig && JSON.stringify(g.tableConfig.rows),
    g.summaryConfig && g.summaryConfig.text, g.dragDropConfig && g.dragDropConfig.text, g.bulletConfig && (g.bulletConfig.items || []).join('\n')].filter(Boolean).join('\n');
}

function audit(s, label) {
  const P = [];
  const qs = (s.questionGroups || []).flatMap(g => g.questions || []);
  const nums = qs.map(q => q.questionNumber).sort((a, b) => a - b);
  const { start, end } = s.questionRange || {};
  if (qs.length !== 10) P.push(`${qs.length} questions`);
  if (start && end) for (let n = start; n <= end; n++) if (!nums.includes(n)) P.push(`missing Q${n}`);
  if (new Set(nums).size !== nums.length) P.push('duplicate question numbers');
  if (!s.audioUrl && label === 'lẻ') P.push('NO AUDIO');
  const tr = norm(s.transcript);
  if ((s.transcript || '').length < 400) P.push(`transcript ${(s.transcript || '').length} chars`);
  const noExpl = qs.filter(q => !String(q.explanation || '').trim()).map(q => q.questionNumber);
  if (noExpl.length) P.push(`no explanation Q${noExpl.join(',')}`);
  for (const g of s.questionGroups || []) {
    const tmpl = templateText(g);
    const ph = [...tmpl.matchAll(/__Q(\d+)__/g)].map(m => +m[1]);
    const gq = (g.questions || []).map(q => q.questionNumber);
    if (['table', 'note-form', 'summary-completion', 'drag-drop', 'bullet-list'].includes(g.groupType)) {
      for (const n of gq) if (!ph.includes(n) && !(g.groupType === 'drag-drop' && !tmpl)) P.push(`Q${n}: no __Q${n}__ in ${g.groupType} template`);
      for (const n of ph) if (!gq.includes(n)) P.push(`placeholder __Q${n}__ without question`);
    }
    if (/__\d+__|\[Q?\d+\]/.test(tmpl)) P.push(`odd placeholder in ${g.groupType}`);
    if (g.groupType === 'map' && !g.imageUrl) P.push(`map group ${gq[0]}-${gq[gq.length - 1]} has NO IMAGE`);
    if (g.groupType === 'summary-completion' && !(g.summaryConfig && g.summaryConfig.wordBank || []).length) P.push('summary without word bank');
    if (g.groupType === 'matching-options' && !(g.matchingOptions || []).length && !(g.endingsConfig && g.endingsConfig.endings || []).length) P.push('matching without options');
    for (const q of g.questions || []) {
      const ca = String(q.correctAnswer || '').trim();
      if (!ca) { P.push(`Q${q.questionNumber}: empty key`); continue; }
      if (q.type === 'multiple-choice') {
        if (!/^[A-Z]$/.test(ca)) P.push(`Q${q.questionNumber}: MC key "${ca}"`);
        else if ((q.options || []).length && ca.charCodeAt(0) - 65 >= q.options.length) P.push(`Q${q.questionNumber}: key ${ca} beyond options`);
        if ((q.options || []).some(o => /^[A-H][.)\s]\s/.test(o))) P.push(`Q${q.questionNumber}: options carry their own letter`);
      }
      if (['matching-info', 'map-labelling'].includes(q.type) && g.groupType !== 'map' && !/^[A-Z]$/.test(ca)) P.push(`Q${q.questionNumber}: matching key "${ca}"`);
      if (g.groupType === 'drag-drop') {
        const words = (g.dragDropConfig && g.dragDropConfig.words) || [];
        if (words.length && !words.includes(ca)) P.push(`Q${q.questionNumber}: drag-drop key "${ca}" is not a chip`);
      }
      if (g.groupType === 'summary-completion') {
        const bank = ((g.summaryConfig && g.summaryConfig.wordBank) || []).map(w => w.word);
        if (bank.length && !bank.includes(ca)) P.push(`Q${q.questionNumber}: summary key "${ca}" not in word bank`);
      }
      if (q.type === 'fill-blank' && g.groupType !== 'summary-completion' && g.groupType !== 'drag-drop' && tr.length > 400) {
        const vs = ca.split('/').map(v => v.trim()).filter(Boolean);
        const found = vs.some(v => {
          const n = norm(v).trim();
          if (tr.includes(' ' + n + ' ') || tr.includes(n)) return true;
          const digits = n.replace(/[^0-9]/g, '');
          if (digits.length >= 3 && tr.replace(/[^0-9]/g, '').includes(digits)) return true;   // spelled-out numbers / phone
          return n.split(' ').every(w => tr.includes(' ' + w) || numWords[w] !== undefined);
        });
        if (!found) P.push(`Q${q.questionNumber}: key "${ca}" not in transcript`);
        if (/\(s\)|\(es\)/.test(ca)) P.push(`Q${q.questionNumber}: key with "(s)"`);
      }
    }
  }
  return P;
}

const sections = JSON.parse(fs.readFileSync(W('sections.json'), 'utf8'));
let bad = 0, total = 0;
const rows = [];
for (const s of sections) {
  if (onlyActive && !s.isActive) continue;
  if (re && !re.test(s.title)) continue;
  total++;
  const P = audit(s, 'lẻ');
  if (P.length) bad++;
  rows.push({ kind: 'lẻ', id: String(s._id), title: s.title, part: s.partNumber, active: s.isActive, dol: /^dol_/.test(s.audioFileName || ''), problems: P });
}
if (withTests) {
  for (const t of JSON.parse(fs.readFileSync(W('tests.json'), 'utf8'))) {
    if (onlyActive && t.isActive === false) continue;
    (t.sections || []).forEach((s, i) => {
      total++;
      const P = audit(s, 'full');
      if (!t.audioUrl) P.push('FULL TEST HAS NO AUDIO');
      if (P.length) bad++;
      rows.push({ kind: 'full', id: String(t._id), title: `${t.name} P${i + 1} ${s.title || ''}`, part: i + 1, active: t.isActive !== false, problems: P });
    });
  }
}
fs.writeFileSync(W('audit.json'), JSON.stringify(rows, null, 1));
for (const r of rows.filter(r => r.problems.length)) console.log(`${r.kind} ${r.active ? 'ON ' : 'off'} ${r.id} ${r.dol ? '[dol] ' : ''}${r.title}\n   ${r.problems.join('\n   ')}`);
const cnt = {};
rows.forEach(r => r.problems.forEach(p => { const k = p.replace(/Q\d+(,\d+)*/g, 'Q#').replace(/"[^"]*"/g, '"…"').replace(/\d+ (questions|chars)/, 'N $1').replace(/\d+-\d+/, 'a-b'); cnt[k] = (cnt[k] || 0) + 1; }));
console.log(`\n${bad}/${total} with problems`);
console.log(Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => `${String(v).padStart(4)}  ${k}`).join('\n'));
