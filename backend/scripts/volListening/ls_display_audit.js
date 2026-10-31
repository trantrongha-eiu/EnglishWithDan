'use strict';
// READ-ONLY display audit of every Listening section (đề lẻ) and every full-test part — what the student SEES,
// complementing ls_deep_audit.js (keys / explanations):
//  BLANK  – a template group (table / note / bullet / summary / drag-drop) whose question has no __Qn__ (never shown),
//           a __Qn__ with no question (raw "__Q5__" on screen), a question placed twice
//  NUM    – question numbers not consecutive / duplicated, "Questions X-Y" title ≠ the numbers, full test parts out of
//           order or numbered outside their part (P1 = 1–10 …)
//  OPT    – MC with < 3 options, option text the renderer strips ("a new road" → "new road"), duplicate options,
//           multi-answer cluster with mixed options / repeated key / size ≠ "Choose TWO|THREE", matching without options
//  TEXT   – MC / matching / plain question without text, map group without image
//  MEDIA  – audio/image not on R2 (cloudinary / http)
//   node ls_display_audit.js [out.json]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const fs = require('fs');

const TPL = ['table', 'note-form', 'bullet-list', 'summary-completion', 'drag-drop'];
const NUMW = { TWO: 2, THREE: 3, FOUR: 4 };
const ARTICLE = /^(a|A)\s+(?![A-Z]\b)/;               // what renderRadioOpts strips besides "A." / "A)"

function auditUnit(u, add, partNo) {
  const nums = [];
  for (const [gi, g] of (u.questionGroups || []).entries()) {
    const qs = g.questions || [];
    const L = `G${gi + 1}[${g.groupType}]`;
    qs.forEach(q => nums.push(q.questionNumber));
    // title range
    const tm = String(g.groupTitle || '').match(/(\d+)\s*(?:-|–|—|to|and|&)\s*(\d+)/);
    if (tm && qs.length) {
      const lo = Math.min(...qs.map(q => q.questionNumber)), hi = Math.max(...qs.map(q => q.questionNumber));
      if (+tm[1] !== lo || +tm[2] !== hi) add('NUM', `${L} title "${g.groupTitle}" but questions ${lo}-${hi}`);
    }
    // template blanks
    if (TPL.includes(g.groupType) || (g.groupType === 'map' && (g.dragDropConfig?.text || '').includes('__Q'))) {
      const tpl = [...(g.tableConfig?.rows || []).flat(), ...(g.tableConfig?.headers || []), ...(g.noteConfig?.lines || []),
        ...(g.bulletConfig?.items || []), g.summaryConfig?.text || '', g.dragDropConfig?.text || ''].join('\n');
      const ph = [...tpl.matchAll(/__Q(\d+)__/g)].map(m => +m[1]);
      for (const q of qs) {
        const c = ph.filter(n => n === q.questionNumber).length;
        if (c === 0) add('BLANK', `${L} Q${q.questionNumber} has no __Q${q.questionNumber}__ in the template (not shown)`);
        if (c > 1) add('BLANK', `${L} Q${q.questionNumber} placed ${c} times`);
      }
      for (const n of new Set(ph)) if (!qs.some(q => q.questionNumber === n)) add('BLANK', `${L} __Q${n}__ has no question (raw text on screen)`);
    }
    if (g.groupType === 'map' && !g.imageUrl) add('TEXT', `${L} map without image`);
    if (g.groupType === 'matching-options' && !(g.matchingOptions || []).filter(o => String(o).trim()).length) add('OPT', `${L} matching without options`);
    for (const [f, url] of [['image', g.imageUrl]]) if (url && !/r2\.dev|r2\.cloudflarestorage|media.ieltsthayha.com/i.test(url)) add('MEDIA', `${L} ${f} not on R2: ${url.slice(0, 80)}`);
    // questions
    for (const q of qs) {
      const n = q.questionNumber, opts = (q.options || []).map(String);
      if (['multiple-choice', 'matching-info'].includes(q.type) && !String(q.questionText || '').trim()) add('TEXT', `Q${n} ${q.type} without text`);
      if (g.groupType === 'plain' && q.type === 'fill-blank' && !String(q.questionText || '').trim()) add('TEXT', `Q${n} plain fill-blank without text`);
      if (q.type === 'multiple-choice' && opts.length < 3) add('OPT', `Q${n} MC with ${opts.length} options`);
      if (['multiple-choice', 'multi-answer-group'].includes(q.type)) {
        // listening.js renderRadioOpts / renderMultiAnswerCluster strip a typed "A. " / "A) " label only
        opts.forEach((o, i) => {
          const shown = o.replace(/^[A-J][.)]\s+/, '').trim();
          if (shown !== o.trim() && !new RegExp(`^${String.fromCharCode(65 + i)}[.)]`).test(o)) add('OPT', `Q${n} option ${String.fromCharCode(65 + i)} "${o.slice(0, 40)}" shown as "${shown.slice(0, 40)}"`);
        });
        const low = opts.map(o => o.replace(/^[A-J][.)]\s+/, '').trim().toLowerCase());
        if (new Set(low).size !== low.length) add('OPT', `Q${n} duplicate options`);
        if (opts.some(o => !o.trim())) add('OPT', `Q${n} empty option`);
      }
    }
    // multi-answer clusters (same grouping as renderPlainGroup)
    const norm = o => JSON.stringify((o || []).map(x => String(x || '').trim().toLowerCase()));
    for (let i = 0; i < qs.length; i++) {
      if (qs[i].type !== 'multi-answer-group') continue;
      const cl = [qs[i]];
      while (i + 1 < qs.length && qs[i + 1].type === 'multi-answer-group' && norm(qs[i + 1].options) === norm(qs[i].options)) cl.push(qs[++i]);
      const ns = cl.map(q => q.questionNumber).join('/');
      if (cl.length === 1) add('OPT', `Q${ns} multi-answer alone (options differ from neighbour?)`);
      const keys = cl.map(q => String(q.correctAnswer || '').trim().toUpperCase());
      if (new Set(keys).size !== keys.length) add('OPT', `Q${ns} multi-answer repeats key ${keys.join(',')}`);
      const cm = `${g.instruction || ''} ${cl[0].questionText || ''}`.toUpperCase().match(/CHOOSE\s+(TWO|THREE|FOUR)\b/);
      if (cm && NUMW[cm[1]] !== cl.length && qs.filter(q => q.type === 'multi-answer-group').length !== NUMW[cm[1]] * Math.round(cl.length / NUMW[cm[1]]))
        add('OPT', `Q${ns} cluster of ${cl.length} but "Choose ${cm[1]}"`);
    }
  }
  const s = [...nums].sort((a, b) => a - b);
  if (new Set(s).size !== s.length) add('NUM', `duplicate question numbers ${s.join(',')}`);
  if (s.some((n, i) => i && n !== s[i - 1] + 1)) add('NUM', `numbers not consecutive: ${s.join(',')}`);
  const order = nums.join(',') === s.join(',');
  if (!order) add('NUM', `questions out of order: ${nums.join(',')}`);
  if (partNo && s.length && (s[0] < (partNo - 1) * 10 + 1 || s[s.length - 1] > partNo * 10)) add('NUM', `P${partNo} numbered ${s[0]}-${s[s.length - 1]}`);
  if (u.audioUrl && !/r2\.dev|r2\.cloudflarestorage|media.ieltsthayha.com/i.test(u.audioUrl)) add('MEDIA', `audio not on R2: ${u.audioUrl.slice(0, 80)}`);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const outFile = process.argv[2] || 'ls_display_audit.json';
  try {
    const secs = await db.collection('listeningsections').find({}).toArray();
    const tests = await db.collection('listeningtests').find({}).toArray();
    const out = [], tally = {};
    const run = (label, u, part, extra) => {
      const W = []; const add = (k, m) => { W.push(`${k}: ${m}`); tally[k] = (tally[k] || 0) + 1; };
      auditUnit(u, add, part); if (extra) extra(add);
      if (W.length) out.push({ label, id: String(u._id), warns: W });
    };
    for (const s of secs) run(`S ${s.title}`, s, null, add => {
      if (s.thumbnail && !/r2\.dev|media.ieltsthayha.com/i.test(s.thumbnail)) add('MEDIA', `thumbnail not on R2: ${s.thumbnail.slice(0, 80)}`);
      const n = (s.questionGroups || []).reduce((a, g) => a + (g.questions || []).length, 0);
      if (n !== 10) add('NUM', `${n} questions`);
    });
    for (const t of tests) {
      const parts = t.sections || [];
      run(`T ${t.name}`, { _id: t._id, audioUrl: t.audioUrl }, null, add => {
        const pn = parts.map(p => p.partNumber);
        if (pn.join(',') !== '1,2,3,4') add('NUM', `parts in order ${pn.join(',')}`);
      });
      for (const p of parts) run(`T ${t.name} P${p.partNumber}`, p, p.partNumber);
    }
    fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
    console.log(`sections=${secs.length} tests=${tests.length} units with warnings=${out.length}`, tally);
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error(e); process.exit(1); });
