// Build + validate đề lẻ drafts from a hand-written spec (specs/vol<V>_t<T>.js) of a VOL test:
// questions typed from the scanned PDF, key from its KEY LISTENING page (checked against the transcript),
// our own Vietnamese explanations, transcript = the test's .docx cleaned by vol_transcript.js.
//   node vol_build.js specs/vol1_t6.js      → web/vol<V>/draft/t<T>p<P>.json + problems list
// Spec helpers (exported): note, table, mc, multi, map, matching, short — each returns a question group.
const fs = require('fs'), path = require('path');
const { splitParts, cleanPart, fromWhisper, applyTurns } = require('./vol_transcript');

// Vol 7: one TurboScribe-style transcript per test (.docx, or the PDF of Test 11) — heading lines "Section N" /
// "Part N" between paragraphs of "(m:ss - m:ss)" timestamps → { part: text } without the timestamps
function splitHeadings(text) {
  const out = {};
  let cur = 0;
  for (const l of text.replace(/\r/g, '').split('\n')) {
    const h = l.trim().match(/^(?:Section|Part)\s*(\d)\s*:?$/i);
    if (h) { cur = +h[1]; continue; }
    if (!cur || /^\(\d+:\d+\s*-\s*\d+:\d+\)$/.test(l.trim())) continue;
    out[cur] = (out[cur] ? out[cur] + ' ' : '') + l.trim();
  }
  return out;
}

const q = (n, type, text, a, extra = {}) => ({ questionNumber: n, type, questionText: text, options: [], correctAnswer: a, ...extra });
const placeholders = s => [...String(s).matchAll(/__Q(\d+)__/g)].map(m => +m[1]);
const base = (groupType, instruction, title) => ({ groupType, groupTitle: title || '', instruction });

// notes/form: lines with __Qn__; answers { n: 'key/variant' }
function note(instruction, title, lines, answers, groupTitle) {
  const nums = lines.flatMap(placeholders);
  return { ...base('note-form', instruction, groupTitle), noteConfig: { title, lines }, questions: nums.map(n => q(n, 'fill-blank', `Q${n}`, answers[n])) };
}
function table(instruction, headers, rows, answers, groupTitle) {
  const nums = rows.flat().flatMap(placeholders);
  return { ...base('table', instruction, groupTitle), tableConfig: { headers, rows }, questions: nums.map(n => q(n, 'fill-blank', `Q${n}`, answers[n])) };
}
// single-answer multiple choice: items [[n, question, [options…], 'B'], …]
function mc(instruction, items, groupTitle) {
  return { ...base('plain', instruction, groupTitle), questions: items.map(([n, text, options, a]) => q(n, 'multiple-choice', text, a, { options })) };
}
// choose TWO/THREE: one cluster, answers ['A','D'] → consecutive questions from n
function multi(instruction, n, text, options, answers, groupTitle) {
  return { ...base('plain', instruction, groupTitle), questions: answers.map((a, i) => q(n + i, 'multi-answer-group', text, a, { options, checkboxCount: answers.length })) };
}
// map with letters on the image: items [[n, label, 'C'], …]; crop = { page, box: [x0,y0,x1,y1] in PDF points } or imageUrl
function map(instruction, items, crop, groupTitle) {
  return { ...base('map', instruction, groupTitle), imageUrl: '', _crop: crop, questions: items.map(([n, label, a]) => q(n, 'map-labelling', label, a)) };
}
// matching: options ['…','…'] lettered A…; items [[n, text, 'C'], …]
function matching(instruction, options, items, { title = '', reuse = false, groupTitle } = {}) {
  return { ...base('matching-options', instruction, groupTitle), matchingOptions: options, matchingOptionsTitle: title, matchingReuseAllowed: reuse, questions: items.map(([n, text, a]) => q(n, 'matching-info', text, a)) };
}
// short answers / sentence completion as plain fill-blank: items [[n, 'question text', 'key'], …]
function short(instruction, items, groupTitle) {
  return { ...base('plain', instruction, groupTitle), questions: items.map(([n, text, a]) => q(n, 'fill-blank', text, a)) };
}

const norm = s => ' ' + String(s || '').toLowerCase().replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—−]/g, '-').replace(/…/g, '...').replace(/\s+/g, ' ') + ' ';
const quotes = t => (Array.isArray(t) ? t : [t]).filter(Boolean);
const compose = e => [`Vị trí: ${e.v}`, `Transcript: ${quotes(e.t).map(x => `“${x}”`).join(' … ')}`, `Phân tích: ${e.p}`].join('\n\n');

// Gemini transcript (label line "Name:" then one sentence per line) → bank shape: no blank lines, repeated labels of
// the same speaker merged; spec.fix = [[from, to], …] applied first (every one must match)
function geminiTranscript(text, fix = []) {
  let t = text.replace(/\r/g, '');
  for (const [a, b] of fix) { if (!t.includes(a)) throw new Error(`transcript fix not found: ${a}`); t = t.split(a).join(b); }
  const out = [];
  let prev = null;
  for (const l of t.split('\n').map(x => x.trim()).filter(Boolean)) {
    if (/^[A-Z][A-Za-z.' ]{0,30}:$/.test(l)) { if (l !== prev) out.push(l); prev = l; continue; }
    out.push(l);
  }
  return out.join('\n');
}

function build(specFile) {
  const spec = require(path.resolve(specFile));
  const W = f => path.join(__dirname, 'web', `vol${spec.vol}`, f);
  const ex = JSON.parse(fs.readFileSync(W('extract.json'), 'utf8'));
  // Vol 1: one .docx machine transcript per test; Vol 2+: none → Gemini transcript per part (gemini_transcribe.js)
  // spec.docx (Vol 7): that transcript file of the vol (docx, or pdf pages), split by its heading lines
  const docKey = spec.docx || Object.keys(ex.files).find(k => k.startsWith(`test ${spec.test}/`) && ex.files[k].type === 'docx');
  let parts = {};
  if (docKey) {
    const f = ex.files[docKey];
    if (!f) throw new Error(`no ${docKey} in extract.json`);
    let docText = f.text || f.pages.join('\n');
    for (const [a, b] of spec.rawFix || []) { if (!docText.includes(a)) throw new Error(`rawFix not found: ${a}`); docText = docText.split(a).join(b); }
    // spec.rawRe = [[regex source, replacement], …] on the whole file (Vol 7 Test 11's transcript marks answers "Q7 …")
    for (const [re, b] of spec.rawRe || []) docText = docText.replace(new RegExp(re, 'g'), b);
    parts = spec.docx ? splitHeadings(docText) : splitParts(docText);
  }
  fs.mkdirSync(W('draft'), { recursive: true });
  const report = [];
  for (const s of spec.sections) {
    if (s.reuse) { report.push({ part: s.part, title: `${s.title} — reuse bank ${s.reuse}`, problems: [] }); continue; }
    const problems = [];
    const gem = W(`gemini/t${spec.test}p${s.part}.txt`);
    let raw = parts[s.part];
    // s.cut = [[from, to], …]: drop the raw text from `from` through `to` (Part 1's example played first, then again)
    for (const [a, b] of s.cut || []) {
      const i = raw ? raw.indexOf(a) : -1, j = i < 0 ? -1 : raw.indexOf(b, i);
      if (j < 0) { problems.push(`cut not found: ${a.slice(0, 40)} … ${b.slice(0, 40)}`); continue; }
      raw = raw.slice(0, i) + raw.slice(j + b.length);
    }
    const whf = W(`whisper/t${spec.test}p${s.part}.json`);
    if (!s.transcript && !raw && !fs.existsSync(gem) && !fs.existsSync(whf)) { report.push({ part: s.part, problems: ['no transcript part'] }); continue; }
    // .docx transcript is complete but has ASR slips; Whisper (web/vol<V>/whisper) drops passages at long pauses,
    // so the docx stays the base and diff_whisper.js lists where the two disagree → spec.fix
    // Vol 2+: Gemini transcript when one was made, else Whisper words + Otter's dropped passages and turns
    // s.transcript: the whole part written out in the spec (Otter's turns too wrong to patch with fix pairs)
    const transcript = s.transcript ? s.transcript.trim().split('\n').map(l => l.trim()).filter(Boolean).join('\n')
      : raw ? (() => {
        const t = cleanPart(raw, s);
        if (!s.turns) return t;
        // one sentence per line first, then "Label:" lines where each turn starts (s.turns, Vol 3 style)
        const st = {}, r = applyTurns(t, s.turns, st);
        for (const a of st.missingFix || []) problems.push(`transcript ${a.slice(0, 90)}`);
        return r;
      })() : fs.existsSync(gem) ? geminiTranscript(fs.readFileSync(gem, 'utf8'), s.fix)
      : (() => { const r = require('./merge_preview').merged(spec.vol, spec.test, s.part, s); for (const a of r.stats.missingFix || []) problems.push(`transcript fix not found: ${a.replace(/\n/g, '⏎').slice(0, 80)}`); return r.text; })();
    const groups = s.groups.map(g => ({ ...g }));
    const qs = groups.flatMap(g => g.questions);
    const want = Array.from({ length: 10 }, (_, i) => (s.part - 1) * 10 + 1 + i);
    const nums = qs.map(x => x.questionNumber).sort((a, b) => a - b);
    if (nums.join() !== want.join()) problems.push(`question numbers ${nums.join(',')}`);
    for (const g of groups) {
      for (const x of g.questions) {
        if (!x.correctAnswer) problems.push(`Q${x.questionNumber}: no key`);
        if (['multiple-choice', 'multi-answer-group'].includes(x.type) && !/^[A-Z]$/.test(x.correctAnswer)) problems.push(`Q${x.questionNumber}: MC key "${x.correctAnswer}"`);
        if (x.options.length && /^[A-Z]$/.test(x.correctAnswer) && x.correctAnswer.charCodeAt(0) - 65 >= x.options.length) problems.push(`Q${x.questionNumber}: key ${x.correctAnswer} beyond options`);
        if (g.groupType === 'matching-options' && x.correctAnswer.charCodeAt(0) - 65 >= g.matchingOptions.length) problems.push(`Q${x.questionNumber}: matching key beyond options`);
        const e = (s.expl || {})[x.questionNumber];
        if (!e) { problems.push(`Q${x.questionNumber}: no explanation`); continue; }
        for (const t of quotes(e.t)) if (!norm(transcript).includes(norm(t).trim())) problems.push(`Q${x.questionNumber}: quote not in transcript: "${t.slice(0, 70)}"`);
        const variants = String(x.correctAnswer).split('/').map(v => norm(v).trim());
        if (!String(e.p).includes('→') || !variants.some(v => norm(String(e.p).split('→').pop()).includes(v))) problems.push(`Q${x.questionNumber}: analysis must end "→ ${x.correctAnswer.split('/')[0]}"`);
        x.explanation = compose(e);
        // fill-blank keys should be heard: warn when no variant occurs in the transcript
        const spelledOut = transcript.replace(/\b[A-Za-z0-9](?:-[A-Za-z0-9])+\b/g, m => m.replace(/-/g, '')); // "G-O-1-9" → "GO19"
        const heard = v => [transcript, spelledOut].some(tr => norm(tr.replace(/(\d)[.,:](\d)/g, '$1$2')).includes(norm(v.replace(/(\d)[.,:](\d)/g, '$1$2')).trim()));
        if (x.type === 'fill-blank' && !variants.some(heard)) problems.push(`Q${x.questionNumber}: key "${x.correctAnswer}" not in transcript (check)`);
      }
    }
    const draft = {
      partNumber: s.part, title: s.title, description: '', transcript,
      questionRange: { start: want[0], end: want[9] }, questionGroups: groups,
      isActive: false, isActualTest: true, audioFileName: `vol${spec.vol}_t${spec.test}_p${s.part}.mp3`,
      _audio: s.audio, _clip: s.clip, _vol: spec.vol, _test: spec.test, _cover: s.cover || '',
    };
    fs.writeFileSync(W(`draft/t${spec.test}p${s.part}.json`), JSON.stringify(draft, null, 1));
    report.push({ part: s.part, title: s.title, problems });
  }
  for (const r of report) console.log(`${r.problems.length ? '✗' : '✓'} Vol ${spec.vol} T${spec.test} P${r.part} ${r.title || ''}${r.problems.length ? '\n   ' + r.problems.join('\n   ') : ''}`);
  return report;
}

module.exports = { note, table, mc, multi, map, matching, short, geminiTranscript, splitHeadings };
if (require.main === module) for (const f of process.argv.slice(2)) build(f);
