// Explanations for OLD Listening content (sections already in the bank, and Cam 20 parts that exist only inside
// full tests). Same JSON format as set_dol_expl.js: ../data/listeningExplanationsOld/<file>.json
//   { title, target: "<sectionId>" | "test:<test name>:<part 1-4>", q: { "<n>": { v, t, p, key?, why? } } }
//
//   node old_expl.js ctx <target …>          print questions + keys + numbered transcript (from the web/ dump)
//   node old_expl.js check [file …]          validate against the dump (quotes verbatim, "→ <key>" ending)
//   node old_expl.js apply [file …]          write to DB: the target, plus every full-test copy / đề lẻ copy whose
//                                            answer keys are identical (same question numbers) — only questions
//                                            that have no explanation yet (or all with --force)
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'data', 'listeningExplanationsOld');
const W = f => path.join(__dirname, 'web', f);
const [cmd, ...rest] = process.argv.slice(2);
const force = rest.includes('--force');
const args = rest.filter(a => !a.startsWith('--'));

const ss = () => JSON.parse(fs.readFileSync(W('sections.json'), 'utf8'));
const ts = () => JSON.parse(fs.readFileSync(W('tests.json'), 'utf8'));
function resolve(target) {
  if (target.startsWith('test:')) {
    const [, name, part] = target.split(':');
    const t = ts().find(x => x.name === name);
    return { kind: 'test', doc: t, part: +part, s: t.sections[+part - 1] };
  }
  return { kind: 'section', s: ss().find(x => String(x._id) === target) };
}
const norm = s => ' ' + String(s || '').toLowerCase().replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—−]/g, '-').replace(/…/g, '...').replace(/\s+/g, ' ') + ' ';
const quotes = t => (Array.isArray(t) ? t : [t]).filter(Boolean);
const compose = e => [`Vị trí: ${e.v}`, ...(quotes(e.t).length ? [`Transcript: ${quotes(e.t).map(x => `“${x}”`).join(' … ')}`] : []), `Phân tích: ${e.p}`].join('\n\n');
const keySig = s => (s.questionGroups || []).flatMap(g => g.questions || []).map(q => `${q.questionNumber}=${String(q.correctAnswer).trim().toLowerCase()}`).join('|');

function check(s, data) {
  const P = [];
  const qs = s.questionGroups.flatMap(g => g.questions);
  const body = norm(s.transcript);
  for (const n of Object.keys(data.q)) if (!qs.some(q => String(q.questionNumber) === n)) P.push(`Q${n}: no such question`);
  for (const q of qs) {
    const e = data.q[q.questionNumber];
    if (!e) { P.push(`Q${q.questionNumber}: missing`); continue; }
    if (!e.v || !e.p) P.push(`Q${q.questionNumber}: empty v/p`);
    if (!quotes(e.t).length) P.push(`Q${q.questionNumber}: no quote`);
    for (const t of quotes(e.t)) if (!body.includes(norm(t).trim())) P.push(`Q${q.questionNumber}: quote not in transcript: "${t.slice(0, 80)}"`);
    if (e.key !== undefined && !e.why) P.push(`Q${q.questionNumber}: key change without why`);
    const key = String(e.key !== undefined ? e.key : q.correctAnswer);
    const variants = key.split('/').map(v => norm(v).trim()).filter(Boolean);
    const tail = norm(String(e.p).split('→').pop());
    if (!String(e.p).includes('→') || !variants.some(v => tail.includes(v))) P.push(`Q${q.questionNumber}: analysis must end "→ … ${key.split('/')[0].trim()}"`);
  }
  return P;
}
const files = () => (args.length ? args.map(a => a.endsWith('.json') ? a : a + '.json') : fs.readdirSync(DIR).filter(f => f.endsWith('.json'))).map(f => path.isAbsolute(f) ? f : path.join(DIR, path.basename(f)));

if (cmd === 'ctx') {
  for (const target of args) {
    const { s } = resolve(target);
    console.log(`\n######## ${target} | P${s.partNumber || ''} | ${s.title}`);
    for (const g of s.questionGroups) {
      console.log(`== ${g.groupTitle} [${g.groupType}] ${String(g.instruction || '').replace(/\n/g, ' / ')}`);
      const opts = g.matchingOptions && g.matchingOptions.length ? g.matchingOptions : (g.endingsConfig && g.endingsConfig.endings || []).map(e => e.text);
      if (opts.length) console.log('   options: ' + opts.map((o, i) => `${'ABCDEFGHIJ'[i]}=${o}`).join(' | '));
      if (g.dragDropConfig && (g.dragDropConfig.words || []).length) console.log('   box: ' + g.dragDropConfig.words.join(' | '));
      if (g.summaryConfig && (g.summaryConfig.wordBank || []).length) console.log('   bank: ' + g.summaryConfig.wordBank.map(w => `${w.letter}=${w.word}`).join(' | '));
      const tmpl = [].concat((g.noteConfig && g.noteConfig.lines) || [], (g.tableConfig && (g.tableConfig.rows || []).map(r => r.join(' | '))) || [],
        (g.summaryConfig && g.summaryConfig.text) || [], (g.dragDropConfig && g.dragDropConfig.text) || [], (g.bulletConfig && g.bulletConfig.items) || [])
        .join('\n').replace(/<br\s*\/?>/g, '\n').replace(/<\/(p|div|tr|li)>/g, '\n').replace(/<[^>]+>/g, ' ').split('\n');
      for (const q of g.questions) {
        const line = tmpl.find(l => l.includes(`__Q${q.questionNumber}__`));
        let qt = line ? line.replace(/\s+/g, ' ').trim() : q.questionText;
        if (q.options && q.options.length) qt += '  {' + q.options.map((o, i) => `${'ABCDEFGH'[i]}. ${o}`).join('  ') + '}';
        console.log(`Q${q.questionNumber} [${q.correctAnswer}] ${String(qt).slice(0, 400)}`);
      }
    }
    console.log('-- transcript');
    console.log(String(s.transcript || '').replace(/❓ Transcript\n?/, '').replace(/\n(?=[A-Za-z .'-]{1,25}:\n)/g, '\n').replace(/([A-Za-z .'-]{1,25}):\n/g, '$1: ').replace(/\n{2,}/g, '\n'));
  }
} else if (cmd === 'check' || cmd === 'apply') {
  (async () => {
    let mongoose, db;
    if (cmd === 'apply') {
      require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });
      mongoose = require('mongoose'); await mongoose.connect(process.env.MONGO_URI); db = mongoose.connection.db;
    }
    let ok = 0, n = 0;
    try {
      for (const f of files()) {
        n++;
        const data = JSON.parse(fs.readFileSync(f, 'utf8'));
        const { s } = resolve(data.target);
        const P = check(s, data);
        if (P.length) { console.log(`✗ ${data.title}\n   ${P.join('\n   ')}`); continue; }
        ok++;
        if (cmd === 'check') { console.log(`✓ ${data.title}`); continue; }
        const sig = keySig(s);
        const fill = groups => groups.map(g => ({ ...g, questions: g.questions.map(q => {
          const e = data.q[q.questionNumber];
          if (!e || (q.explanation && !force)) return q;
          return { ...q, explanation: compose(e), ...(e.key !== undefined ? { correctAnswer: e.key } : {}) };
        }) }));
        const out = [];
        for (const sec of await db.collection('listeningsections').find({}).toArray()) {
          if (keySig(sec) !== sig) continue;
          const r = await db.collection('listeningsections').updateOne({ _id: sec._id }, { $set: { questionGroups: fill(sec.questionGroups), updatedAt: new Date() } });
          out.push(`lẻ "${sec.title}" ${r.modifiedCount ? '✓' : '='}`);
        }
        for (const t of await db.collection('listeningtests').find({}).toArray()) {
          for (let i = 0; i < (t.sections || []).length; i++) {
            if (keySig(t.sections[i]) !== sig) continue;
            const r = await db.collection('listeningtests').updateOne({ _id: t._id }, { $set: { [`sections.${i}.questionGroups`]: fill(t.sections[i].questionGroups), updatedAt: new Date() } });
            out.push(`${t.name} P${i + 1} ${r.modifiedCount ? '✓' : '='}`);
          }
        }
        console.log(`→ ${data.title}: ${out.join(', ')}`);
      }
    } finally { if (mongoose) await mongoose.disconnect(); }
    console.log(`${ok}/${n} valid`);
  })();
} else console.log('usage: old_expl.js ctx|check|apply …');
