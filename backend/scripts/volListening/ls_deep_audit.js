'use strict';
// READ-ONLY deep audit of EVERY Listening section (đề lẻ) and every part of every full test. Same idea as
// ../volReading/rd_deep_audit.js, with the transcript in place of the passage:
//  STRUCT – active test without 4 parts / Q1–40, part without audio or transcript, question without key/explanation
//  KEY    – fill keys the grader can't match (brackets, " or ", trailing punctuation, typographic quotes), keys absent from
//           the transcript (spelled-out names and numbers tolerated), over the word limit, letter keys beyond the options,
//           MC keys with "/" (review screen only highlights a single letter), "/" inside an interchangeable group
//  EXPL   – conclusion "→ X" ≠ key, quoted "Transcript:" text absent from the transcript, the same explanation on two
//           questions with different keys, chatbot leftovers
//  FORMAT – HTML/entities inside escaped fields, glued blanks, question text repeating its number, mojibake
//  COPY   – a full-test part whose keys differ from the đề lẻ with the same title
//   node ls_deep_audit.js [out.json]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const fs = require('fs');

const plain = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, ' ');
const nrm = s => ' ' + plain(s).toLowerCase().replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—−-]/g, ' ')
  .replace(/\.{2,}|…/g, ' ').replace(/[^a-z0-9'£$%. ]+/g, ' ').replace(/(^|\s)'+|'+(?=[\s.]|$)/g, '$1 ')
  .replace(/\b(cent|met|theat|fib)re\b/g, '$1er').replace(/our\b/g, 'or').replace(/is(e|ed|es|ing|ation)\b/g, 'iz$1')
  .replace(/'s\b/g, '').replace(/'/g, '').replace(/\.(\s|$)/g, ' ').replace(/\s+/g, ' ') + ' ';
const FILL = new Set(['fill-blank', 'short-answer', 'map-labelling', 'table', 'note-form', 'flow-chart', 'form']);
const LIMIT = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4 };
const CHATBOT = /dưới đây là|để bạn copy|chúc bạn|nếu bạn cần|as an ai|ChatGPT|bạn muốn mình/i;

function conclusion(e) {
  let last = null;
  for (const m of String(e || '').matchAll(/(?:→|=>|⇒)\s*(?:✅\s*)?(?:(?:Đáp án(?: đúng)?|Chọn)\s*[:：]?\s*)?([^\n→]+)|Đáp án(?: đúng)?(?: là)?\s*[:：]\s*([^\n]+)/g)) last = (m[1] || m[2] || '').replace(/[*“”"]+/g, '').trim();
  if (!last) return null;
  const m = last.match(/^([A-J])(?=$|[\s.,;:)–—-])/);
  if (!m || /^\s*(bị loại|sai|không|,\s*[A-J]\b|và [A-J]\b)/i.test(last.slice(1))) return null;
  return { raw: last.slice(0, 60), tok: m[1] };
}

function auditUnit(u, add) {
  const T = nrm(u.transcript);
  const tFlat = T.replace(/\s/g, '');
  if (!plain(u.transcript).trim()) add('STRUCT', 'no transcript');
  if (u.needsAudio && !u.audioUrl) add('STRUCT', 'no audio');
  const seen = {};
  for (const [gi, g] of (u.questionGroups || []).entries()) {
    const qs = g.questions || [];
    const L = `G${gi + 1}[${g.groupType}]`;
    const instr = `${g.groupTitle || ''} ${g.instruction || ''}`;
    for (const [f, v] of [['groupTitle', g.groupTitle], ['instruction', g.instruction], ['noteTitle', g.noteConfig?.title]])
      if (/<\/?[a-z][^>]*>|&[a-z]+;|&#\d+;/i.test(v || '')) add('FORMAT', `${L} ${f} shows raw HTML: "${String(v).slice(0, 60)}"`);
    if (/\b(ONL Y|WOR DS|NUM BER)\b/.test(instr)) add('FORMAT', `${L} split word in instruction: "${instr.slice(0, 70)}"`);
    if (/â€|Ã[\x80-\xbf]|�/.test(JSON.stringify(g))) add('FORMAT', `${L} mojibake`);
    const tpls = [...(g.tableConfig?.rows || []).flat(), ...(g.noteConfig?.lines || []), ...(g.bulletConfig?.items || []), g.summaryConfig?.text || '', g.dragDropConfig?.text || ''];
    for (const s of tpls.map(String)) {
      const glued = s.match(/[A-Za-z0-9]__Q\d+__|__Q\d+__[A-Za-z0-9]/g);
      if (glued) add('FORMAT', `${L} blank glued to a word: ${glued.join(', ')} in "${plain(s).slice(0, 70)}"`);
      if (/__Q\d+__\s*\.\s+[a-z]{2,}/.test(s)) add('FORMAT', `${L} stray full stop after blank: "${plain(s).slice(0, 70)}"`);
    }
    const lm = instr.toUpperCase().match(/\b(ONE|TWO|THREE|FOUR) WORDS?\b/);
    const limit = lm ? LIMIT[lm[1]] : null;
    const allowNum = /NUMBER/i.test(instr);
    const hasBank = (g.summaryConfig?.wordBank || []).length || (g.dragDropConfig?.words || []).length || (g.matchingOptions || []).length || (g.endingsConfig?.endings || []).length;
    const nOpts = Math.max((g.matchingOptions || []).length, (g.endingsConfig?.endings || []).length, (g.dragDropConfig?.words || []).length);
    for (const q of qs) {
      const n = q.questionNumber, key = String(q.correctAnswer || '').trim(), e = String(q.explanation || '');
      const alts = key.split(/\s*\/\s*/).filter(Boolean);
      if (!key) add('STRUCT', `Q${n} no key`);
      if (!e.trim()) add('STRUCT', `Q${n} no explanation`);
      if (/<\/?[a-z][^>]*>|&[a-z]+;/i.test(q.questionText || '')) add('FORMAT', `Q${n} text shows raw HTML: "${q.questionText.slice(0, 60)}"`);
      const m = String(q.questionText || '').match(/^\s*(\d{1,2})(?:\s*[.):]\s*|\s{2,}|\s+(?=[A-Z]))\S/);
      if (m && +m[1] === n) add('FORMAT', `Q${n} text repeats its number: "${q.questionText.slice(0, 50)}"`);
      (q.options || []).forEach((o, i) => { if (!String(o).trim()) add('FORMAT', `Q${n} empty option ${i + 1}`); if (/<\/?[a-z][^>]*>|&[a-z]+;/i.test(o)) add('FORMAT', `Q${n} option raw HTML`); });
      if (CHATBOT.test(e)) add('EXPL', `Q${n} chatbot leftover: "${e.match(CHATBOT)[0]}"`);
      // KEY
      if (q.type === 'multiple-choice') {
        if (!alts.every(a => /^[A-J]$/i.test(a))) add('KEY', `Q${n} MC key "${key}" not a letter`);
        else if (alts.some(a => a.toUpperCase().charCodeAt(0) - 65 >= (q.options || []).length)) add('KEY', `Q${n} MC key ${key} beyond ${(q.options || []).length} options`);
        if (alts.length > 1) add('KEY', `Q${n} MC key "${key}" has alternatives (review highlights none)`);
      }
      if (q.type === 'multi-answer-group' && !/^[A-J]$/i.test(key)) add('KEY', `Q${n} multi key "${key}" not one letter`);
      if (q.type === 'multi-answer-group' && /^[A-J]$/i.test(key) && key.toUpperCase().charCodeAt(0) - 65 >= (q.options || []).length) add('KEY', `Q${n} multi key ${key} beyond options`);
      if (hasBank && nOpts && /^[A-J]$/i.test(key) && key.toUpperCase().charCodeAt(0) - 65 >= nOpts && !(g.dragDropConfig?.words || []).length) add('KEY', `Q${n} key ${key} beyond ${nOpts} options`);
      if ((g.dragDropConfig?.words || []).length && !alts.some(a => g.dragDropConfig.words.map(w => String(w).trim().toLowerCase()).includes(a.toLowerCase()))) add('KEY', `Q${n} drag key "${key}" not in words`);
      const isFill = !hasBank && (FILL.has(q.type) || ['table', 'note-form', 'bullet-list', 'flow-chart', 'form'].includes(g.groupType)) && !['multiple-choice', 'multi-answer-group', 'checkbox', 'matching', 'true-false-ng', 'yes-no-ng'].includes(q.type);
      if (isFill && key) {
        if (/[()[\]]/.test(key)) add('KEY', `Q${n} key "${key}" has brackets`);
        if (alts.length < 2 && /\s(or|OR)\s|;/.test(key)) add('KEY', `Q${n} key "${key}" lists alternatives without "/"`);
        if (/[.!?:,]$/.test(key) && !/\b[a-z]\.[a-z]\.$/i.test(key)) add('KEY', `Q${n} key "${key}" ends with punctuation`);
        if (/[–—’‘“”]/.test(key) && !alts.some(a => !/[–—’‘“”]/.test(a))) add('KEY', `Q${n} key "${key}" has typographic quote/dash only`);
        const fits = a => { const w = a.split(/\s+/); const nn = w.filter(x => !/^[\d.,:%£$€/-]+(st|nd|rd|th|s|am|pm|m|km|kg|cm)?$/i.test(x)); return !limit || (allowNum ? nn.length : w.length) <= limit; };
        if (!alts.some(fits)) add('KEY', `Q${n} key "${key}" over word limit (${lm[0]}${allowNum ? ' +number' : ''})`);
        const found = a => {
          const na = nrm(a).trim();
          if (!na || /\d/.test(na)) return true;                       // numbers, times, prices, postcodes: spoken in words
          if (T.includes(` ${na} `)) return true;
          const letters = na.replace(/\s/g, '');                        // spelled out: "H-A-R-D-I-E", "double S"
          if (tFlat.includes(letters.split('').join('')) && new RegExp(letters.split('').join('[\\s,.-]*'), 'i').test(plain(u.transcript))) return true;
          return na.split(' ').every(w => T.includes(` ${w} `));       // words split by the speaker
        };
        if (!alts.some(found)) add('KEY', `Q${n} key "${key}" not found in transcript`);
      }
      if (g.interchangeableAnswers && alts.length > 1 && !qs.some(x => ['multi-answer-group', 'true-false-ng'].includes(x.type))) add('KEY', `Q${n} "/" alternatives "${key}" inside interchangeable group`);
      // EXPL
      if (e) {
        const c = conclusion(e);
        if (c && /^[A-J]$/i.test(alts[0] || '') && !alts.map(a => a.toUpperCase()).includes(c.tok)) {
          const pair = q.type === 'multi-answer-group' || g.interchangeableAnswers;
          if (!(pair && qs.some(x => String(x.correctAnswer).trim().toUpperCase() === c.tok))) add('EXPL', `Q${n} explanation concludes "${c.raw}" but key is "${key}"`);
        }
        const ek = nrm(e);
        if (ek.length > 50) { if (seen[ek] && seen[ek].key !== key && !(q.type === 'multi-answer-group' || g.interchangeableAnswers)) add('EXPL', `Q${n} same explanation as Q${seen[ek].n} (keys ${seen[ek].key} vs ${key})`); seen[ek] ||= { n, key }; }
        const ql = (e.match(/^(?:Transcript|Trích(?: dẫn)?)\s*:(.*)$/m) || [])[1] || '';
        const parts = (ql.match(/[“"]([^”"]{8,})[”"]/g) || []).map(s => s.slice(1, -1));
        for (const seg of (parts.length ? parts : [ql]).flatMap(s => s.split(/\s*(?:…|\.\.\.|\[\.\.\.\])\s*/))) {
          const ns = nrm(seg).trim(); const w = ns.split(' ');
          if (w.length < 4 || T.includes(` ${ns} `)) continue;
          let hit = 0, tot = 0; for (let i = 0; i + 4 <= w.length; i++) { tot++; if (T.includes(` ${w.slice(i, i + 4).join(' ')} `)) hit++; }
          const r = tot ? hit / tot : 0;
          if (r < 0.8) add('EXPL', `Q${n} quote ${r < 0.3 ? 'NOT IN TRANSCRIPT' : 'differs from transcript'} (${Math.round(r * 100)}%): "${seg.trim().slice(0, 80)}"`);
        }
      }
    }
  }
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const outFile = process.argv[2] || 'ls_deep_audit.json';
  try {
    const secs = await db.collection('listeningsections').find({}).toArray();
    const tests = await db.collection('listeningtests').find({}).toArray();
    const out = [], tally = {};
    const run = (label, u, extra) => {
      const W = []; const add = (k, m) => { W.push(`${k}: ${m}`); tally[k] = (tally[k] || 0) + 1; };
      auditUnit(u, add); if (extra) extra(add);
      if (W.length) out.push({ label, id: String(u._id), active: u.isActive !== false, warns: W });
    };
    for (const s of secs) run(`S ${s.title}${s.isActive === false ? ' (off)' : ''}`, { ...s, needsAudio: true });
    const byTitle = {}; secs.forEach(s => (byTitle[s.title.trim().toLowerCase()] ||= []).push(s));
    for (const t of tests) {
      const parts = t.sections || [];
      const all = parts.flatMap(p => (p.questionGroups || []).flatMap(g => g.questions || []).map(q => q.questionNumber)).sort((a, b) => a - b);
      run(`T ${t.title || t.name}${t.isActive === false ? ' (off)' : ''}`, { _id: t._id, transcript: 'x', questionGroups: [] }, add => {
        if (t.isActive !== false && (parts.length !== 4 || all.length !== 40 || all.some((n, i) => n !== i + 1))) add('STRUCT', `${parts.length} parts, ${all.length} questions`);
        if (t.isActive !== false && !t.audioUrl && parts.some(p => !p.audioUrl)) add('STRUCT', 'no audio');
      });
      for (const p of parts) {
        run(`T ${t.title || t.name} P${p.partNumber}${t.isActive === false ? ' (off)' : ''}`, { ...p, _id: t._id }, add => {
          const src = (byTitle[String(p.title || '').trim().toLowerCase()] || []);
          if (!src.length) return;
          const keysOf = u => (u.questionGroups || []).flatMap(g => g.questions || []).map(q => String(q.correctAnswer || '').trim().toLowerCase());
          const mine = keysOf(p).join('|');
          if (!src.some(s => keysOf(s).join('|') === mine)) add('COPY', `keys differ from đề lẻ "${p.title}": test [${keysOf(p).join(', ')}] vs lẻ [${keysOf(src[0]).join(', ')}]`);
        });
      }
    }
    fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
    console.log(`sections=${secs.length} tests=${tests.length} units with warnings=${out.length}`, tally);
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error(e); process.exit(1); });
