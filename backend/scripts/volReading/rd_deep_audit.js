'use strict';
// READ-ONLY deep audit of EVERY Reading passage (all series, standalone passages included). Complements
// ../_audit_reading_warnings.js (structure) and vr_audit.js (Vol tests only). Checks:
//  KEY      – fill keys the grader can never match (brackets, " or ", trailing punctuation, en-dash…), fill keys not found
//             in the passage, keys over the instruction's word limit, "/" alternatives inside an interchangeable group
//             (the pool grader does not split "/"), duplicate keys inside a single-answer TFNG-free cluster
//  EXPL     – the explanation's conclusion ("→ X", "Đáp án: X", "Chọn: X") disagrees with the key; a TFNG explanation that
//             names exactly one other label; a fill key absent from its explanation; the same explanation on two
//             questions with different keys; quoted "Trích/Transcript" text absent from the passage
//  FORMAT   – what the student sees: HTML tags/entities inside escaped fields (question text, options, titles), letters
//             doubled by the renderer ("A. A. …"), glued / broken placeholders ("__Q3__is", "__Q2__. surrounds"),
//             fill questions in plain groups with no sentence ("Q8"), mojibake, literal "\n", markdown, empty paragraphs,
//             matching-paragraph keys whose paragraph label is missing from the passage
//   node rd_deep_audit.js [out.json] [--active]      (--active: skip inactive passages)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const fs = require('fs');

const ent = s => String(s).replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&[a-z]+;/g, ' ');
const plain = s => ent(String(s || '').replace(/<[^>]+>/g, ' '));
const nrm = s => plain(s).toLowerCase().replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—‑]/g, '-')
  .replace(/[^a-z0-9'%£$€-]+/g, ' ').replace(/\s+/g, ' ').trim();
const nrmLoose = s => nrm(s).replace(/-/g, ' ').replace(/'s\b/g, '').replace(/'/g, '').replace(/\s+/g, ' ');
const FILL = new Set(['fill-blank', 'sentence-completion', 'map-labelling', 'short-answer']);
const LIMIT = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4 };

// The answer an explanation settles on, as a letter / numeral / TFNG label (free-text conclusions are not compared).
// Takes the LAST "→ X", "Đáp án (đúng) (là): X", "Chọn (phương án): X" in the text; "A bị loại" (A eliminated) is skipped.
const CONCL = /(?:→|=>|⇒)\s*(?:✅\s*)?(?:(?:Đáp án(?: đúng)?|Chọn)\s*[:：]?\s*)?([^\n→]+)|Đáp án(?: đúng)?(?: là)?\s*[:：]?\s*([^\n]+)|\b[Cc]họn(?: phương án| đáp án)?\s*[:：]?\s*([^\n]+)/g;
function conclusion(e) {
  let last = null;
  for (const m of String(e || '').matchAll(CONCL)) last = (m[1] || m[2] || m[3] || '').replace(/[*“”"]+/g, '').trim();
  if (!last) return null;
  last = last.replace(/^(?:đáp án(?: đúng)?(?: là)?|chọn(?: phương án)?|là)\s*[:：]?\s*/i, '');
  const m = last.match(/^(NOT GIVEN|TRUE|FALSE|YES|NO|[A-L]|[ivx]{1,5}|[IVX]{1,5})(?=$|[\s.,;:)–—-])/i);
  if (!m) return null;
  if (/^[A-L]$/i.test(m[1]) && m[1] !== m[1].toUpperCase()) return null; // "a map"
  if (/^\s*(bị loại|sai|không|is wrong|incorrect|,\s*[A-L]|và [A-L]|thêm)/i.test(last.slice(m[1].length))) return null;
  return { raw: last.slice(0, 60), tok: m[1] };
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const activeOnly = process.argv.includes('--active');
  const outFile = process.argv.slice(2).find(a => !a.startsWith('--')) || 'deep_audit.json';
  try {
    const ps = await db.collection('passages').find(activeOnly ? { isActive: { $ne: false } } : {}).toArray();
    const ts = await db.collection('readingtests').find({}).toArray();
    const inT = {};
    ts.forEach(t => (t.passageIds || []).forEach((id, i) => (inT[String(id)] ||= []).push(`${t.name} P${i + 1}${t.isActive === false ? ' (off)' : ''}`)));
    const out = [];
    const tally = {};
    for (const p of ps) {
      const W = [];
      const add = (kind, msg) => { W.push(`${kind}: ${msg}`); tally[kind] = (tally[kind] || 0) + 1; };
      const C = nrm(p.content), CL = nrmLoose(p.content);
      const content = String(p.content || '');
      // ── passage body format ──
      if (/\\n|\\t/.test(content)) add('FORMAT', 'content has literal \\n');
      if (/â€|Ã[\x80-\xbf]|Â |�/.test(content)) add('FORMAT', 'content mojibake');
      if (/^#{1,3} |\*\*[A-Za-z][^*]{2,}\*\*/m.test(plain(content))) add('FORMAT', 'content has markdown');
      if (/<p>\s*(&nbsp;|<br\s*\/?>)?\s*<\/p>\s*<p>\s*(&nbsp;|<br\s*\/?>)?\s*<\/p>/.test(content)) add('FORMAT', 'content has consecutive empty paragraphs');
      const opens = (content.match(/<(p|strong|em|b|i|ul|ol|li|table|h\d)\b[^>]*>/g) || []).length;
      const closes = (content.match(/<\/(p|strong|em|b|i|ul|ol|li|table|h\d)>/g) || []).length;
      if (opens !== closes) add('FORMAT', `content tags unbalanced (${opens} open / ${closes} close)`);
      if (!plain(content).trim()) add('FORMAT', 'content empty');
      if (/<!DOCTYPE|<\/?(html|head|body|meta|title|style|script|link)/i.test(content)) add('FORMAT', 'content holds page markup (doctype/html/head/style/script)');

      const explSeen = {};
      for (const [gi, g] of (p.questionGroups || []).entries()) {
        const qs = g.questions || [];
        const L = `G${gi + 1}[${g.groupType}]`;
        const instr = `${g.groupTitle || ''} ${g.instruction || ''}`;
        // escaped fields — tags/entities show up literally
        for (const [f, v] of [['groupTitle', g.groupTitle], ['instruction', g.instruction], ['matchingOptionsTitle', g.matchingOptionsTitle], ['noteTitle', g.noteConfig?.title]])
          if (/<\/?[a-z][^>]*>|&[a-z]+;|&#\d+;/i.test(v || '')) add('FORMAT', `${L} ${f} shows raw HTML: "${String(v).slice(0, 70)}"`);
        if (/â€|Ã[\x80-\xbf]|�/.test(JSON.stringify(g))) add('FORMAT', `${L} mojibake`);
        // letters doubled by the renderer
        (g.matchingOptions || []).forEach((o, i) => { if (/^\s*\(?[A-Z]\s*[.):]\s+\S/.test(o) && String(o).trim().length > 3) add('FORMAT', `${L} matchingOption ${i + 1} has its own letter: "${o.slice(0, 50)}"`); });
        (g.endingsConfig?.endings || []).forEach(e => { if (/^\s*\(?[A-Z]\s*[.):]\s+\S/.test(e.text || '')) add('FORMAT', `${L} ending ${e.letter} has its own letter: "${e.text.slice(0, 50)}"`); });
        (g.headingsConfig?.headings || []).forEach(h => { if (/^\s*\(?[ivx]+\s*[.):]\s+\S/i.test(h.text || '')) add('FORMAT', `${L} heading ${h.numeral} has its own numeral: "${h.text.slice(0, 50)}"`); });
        (g.summaryConfig?.wordBank || []).forEach(w => { if (/^\s*[A-Z]\s*[.):]\s+\S/.test(w.word || '')) add('FORMAT', `${L} bank word has its own letter: "${w.word}"`); });
        // template placeholders
        const tpls = [...(g.tableConfig?.rows || []).flat(), ...(g.noteConfig?.lines || []), ...(g.bulletConfig?.items || []), g.summaryConfig?.text || '', g.dragDropConfig?.text || ''];
        for (const t of tpls) {
          const s = String(t || '');
          const glued = s.match(/[A-Za-z0-9]__Q\d+__|__Q\d+__[A-Za-z0-9]/g);
          if (glued) add('FORMAT', `${L} placeholder glued to a word: ${glued.join(', ')} in "${plain(s).slice(0, 80)}"`);
          const dot = s.match(/__Q\d+__\s*\.\s+[a-z]{2,}/g);
          if (dot) add('FORMAT', `${L} stray punctuation after blank: "${dot.join(' | ')}"`);
          if (/_{3,}|…{2,}|\.{4,}/.test(s.replace(/__Q\d+__/g, ''))) add('FORMAT', `${L} printed blank left in template: "${plain(s).slice(0, 80)}"`);
          if (/(^|[^_])_Q\d+__|__Q\d+_(?!_)|\[\d+\]|\{\d+\}/.test(s)) add('FORMAT', `${L} odd placeholder: "${s.slice(0, 80)}"`);
        }
        // word limit
        const lm = instr.toUpperCase().match(/\b(ONE|TWO|THREE|FOUR) WORDS?\b(?: ONLY)?/);
        const limit = lm ? LIMIT[lm[1]] : null;
        const allowNum = /NUMBER/i.test(instr);
        const fromPassage = /from the (reading )?passage|from the text/i.test(instr);
        const isTemplate = ['table', 'note-form', 'bullet-list'].includes(g.groupType);
        const hasBank = (g.summaryConfig?.wordBank || []).length || (g.dragDropConfig?.words || []).length || (g.matchingOptions || []).length;

        for (const q of qs) {
          const n = q.questionNumber, key = String(q.correctAnswer || '').trim(), e = String(q.explanation || '');
          const alts = key.split(/\s*\/\s*/).filter(Boolean);
          const isFill = !hasBank && ((FILL.has(q.type) && !(q.wordBank || []).length) || isTemplate);
          // escaped question fields
          if (/<\/?[a-z][^>]*>|&[a-z]+;|&#\d+;/i.test(q.questionText || '')) add('FORMAT', `Q${n} text shows raw HTML: "${q.questionText.slice(0, 70)}"`);
          if (/â€|Ã[\x80-\xbf]|�/.test(JSON.stringify(q))) add('FORMAT', `Q${n} mojibake`);
          if (/\\n/.test(q.questionText || '') || /\\n/.test(e)) add('FORMAT', `Q${n} literal \\n`);
          if (/^\s*(Q(uestion)?\s*)?\d+\s*([.):]\s*|\s{2,}|\s+(?=[A-Z]))\S/.test(q.questionText || '') && !/^\s*(Q(uestion)?\s*)?\d+\s*$/i.test(q.questionText || '') && !/^\d{3,4}/.test(q.questionText || '')) add('FORMAT', `Q${n} text starts with its own number: "${q.questionText.slice(0, 50)}"`);
          (q.options || []).forEach((o, i) => {
            if (/<\/?[a-z][^>]*>|&[a-z]+;/i.test(o)) add('FORMAT', `Q${n} option ${i + 1} raw HTML`);
            if (q.type === 'multiple-choice' && /^\s*\(?[A-H]\s*[.):]\s*\S/.test(o)) add('FORMAT', `Q${n} MC option has its own letter (renders "A. A."): "${o.slice(0, 40)}"`);
            if (q.type === 'multi-answer-group' && /^\s*\(?[A-J]\s*[.):]\s*\S/.test(o)) add('FORMAT', `Q${n} multi option has its own letter: "${o.slice(0, 40)}"`);
            if (!String(o).trim()) add('FORMAT', `Q${n} empty option ${i + 1}`);
          });
          if (g.groupType === 'plain' && FILL.has(q.type) && !(q.wordBank || []).length && /^\s*(Q(uestion)?\s*)?\d*\s*$/i.test(q.questionText || ''))
            add('FORMAT', `Q${n} fill question in plain group has no sentence ("${q.questionText}")`);
          if (g.groupType === 'plain' && FILL.has(q.type) && /__Q\d+__/.test(q.questionText || '')) add('FORMAT', `Q${n} plain-group text shows raw marker "${q.questionText.slice(0, 60)}"`);
          if (!/^[A-Z]$/.test(key) && /^\s|\s$/.test(String(q.correctAnswer || ''))) add('KEY', `Q${n} key has surrounding spaces`);
          // ── KEY ──
          if (isFill && key) {
            if (/[()[\]]/.test(key)) add('KEY', `Q${n} key "${key}" has brackets (grader needs exact text → use "a / b")`);
            // keys already split into "/" alternatives may keep "a, b" / "a or b" as one of them (two-word answers, ranges)
            if (alts.length < 2 && /\s(or|OR)\s|;|,(?!\d{3})/.test(key)) add('KEY', `Q${n} key "${key}" lists alternatives without "/"`);
            if (/[.!?:]$/.test(key) && !/\b[a-z]\.[a-z]\.$/i.test(key)) add('KEY', `Q${n} key "${key}" ends with punctuation`);
            if (/[–—‑’‘“”]/.test(key) && !alts.some(a => !/[–—‑’‘“”]/.test(a))) add('KEY', `Q${n} key "${key}" has a typographic dash/quote students cannot type`);
            if (/\S\s{2,}\S/.test(key.replace(/\s*\/\s*/g, '/'))) add('KEY', `Q${n} key "${key}" has double space`);
            // over the word limit only when NO accepted alternative fits ("the Persian wars / Persian wars" is fine)
            const fits = a => {
              const words = a.split(/\s+/).filter(w => !/^[-–]$/.test(w));
              const nonNum = words.filter(w => !/^[\d.,:%£$€-]+(st|nd|rd|th|s|m|km|kg|cm|bc|ad)?$/i.test(w));
              return !limit || (allowNum ? nonNum.length : words.length) <= limit;
            };
            if (!alts.some(fits)) add('KEY', `Q${n} key "${key}" over word limit (${lm[0]}${allowNum ? ' +number' : ''})`);
            const found = a => { const na = nrm(a); return !na || /^\d/.test(na) || C.includes(na) || CL.includes(nrmLoose(a)); };
            if (!alts.some(found) && (fromPassage || !/list|box/i.test(instr))) add('KEY', `Q${n} key "${key}" not found in passage`);
            if (e && !alts.some(a => nrmLoose(e).includes(nrmLoose(a)))) add('EXPL', `Q${n} fill key "${key}" not mentioned in explanation`);
          }
          if (g.interchangeableAnswers && alts.length > 1 && !qs.some(x => ['true-false-ng', 'yes-no-ng', 'multi-answer-group'].includes(x.type)))
            add('KEY', `Q${n} "/" alternatives "${key}" inside interchangeable group (pool grader compares whole key)`);
          // ── EXPL ──
          if (!e.trim()) add('EXPL', `Q${n} no explanation`);
          else {
            const c = conclusion(e);
            if (c && key) {
              const T = c.tok.toUpperCase(), K = alts.map(x => x.toUpperCase());
              const bank = (g.summaryConfig?.wordBank || []).map(w => [String(w.letter || '').toUpperCase(), w.word])
                .concat((g.matchingOptions || []).map((o, i) => [String.fromCharCode(65 + i), o]))
                .concat((g.dragDropConfig?.words || []).map((o, i) => [String.fromCharCode(65 + i), o]));
              const byLetter = Object.fromEntries(bank);
              // a "choose TWO" pair often shares one explanation naming both letters
              const pair = q.type === 'multi-answer-group' || (g.interchangeableAnswers && /TWO|THREE/i.test(instr));
              let ok = K.includes(T) || (pair && qs.some(x => String(x.correctAnswer || '').toUpperCase() === T) && new RegExp(`(^|[^A-Za-z])${String(q.correctAnswer).trim()}([^A-Za-z]|$)`).test(e));
              if (!ok && /^[A-L]$/.test(T) && byLetter[T]) ok = alts.some(x => nrm(x) === nrm(byLetter[T]) || nrm(String(byLetter[T]).replace(/^[A-L][.)]\s*/, '')) === nrm(x));
              if (!ok && ['YES', 'NO', 'TRUE', 'FALSE', 'NOT GIVEN'].includes(T) && !['true-false-ng', 'yes-no-ng'].includes(q.type)) ok = true; // "Not Given" in prose about an option
              if (!ok && /^[IVX]+$/.test(T) && !/^[ivx]+$/i.test(alts[0] || '')) ok = true;                       // roman numeral prose
              if (!ok && /^[A-L]$/.test(T) && !/^[A-L]$/i.test(alts[0] || '') && !byLetter[T]) ok = true;      // letter vs word without a lettered bank
              if (!ok) add('EXPL', `Q${n} explanation concludes "${c.raw}" but key is "${key}"`);
            }
            if (['true-false-ng', 'yes-no-ng'].includes(q.type)) {
              const lab = q.type === 'true-false-ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
              const named = lab.filter(l => new RegExp(`(^|[^A-Za-z])${l}([^A-Za-z]|$)`).test(e));
              const kU = alts.map(a => a.toUpperCase());
              if (named.length === 1 && !kU.includes(named[0])) add('EXPL', `Q${n} TFNG explanation names ${named[0]} but key is ${key}`);
              const other = q.type === 'true-false-ng' ? ['YES', 'NO'] : ['TRUE', 'FALSE'];
              if (other.some(l => new RegExp(`→\\s*${l}\\b`).test(e))) add('EXPL', `Q${n} explanation uses ${q.type === 'true-false-ng' ? 'YES/NO' : 'TRUE/FALSE'} labels`);
            }
            const ek = nrm(e);
            if (ek.length > 40) {
              if (explSeen[ek] && explSeen[ek].key !== key) add('EXPL', `Q${n} same explanation as Q${explSeen[ek].n} (keys ${explSeen[ek].key} vs ${key})`);
              explSeen[ek] ||= { n, key };
            }
            // quoted passage text
            const quoteLines = (e.match(/^(?:📌\s*)?(?:Trích(?: dẫn)?|Transcript|Dẫn chứng|Vị trí & Transcript)\s*:(.*)$/gm) || []).map(l => l.replace(/^[^:]*:/, ''));
            for (const ql of quoteLines) {
              const parts = (ql.match(/[“"]([^”"]{8,})[”"]/g) || []).map(s => s.slice(1, -1));
              const segs = (parts.length ? parts : [ql]).flatMap(s => s.split(/\s*(?:…|\.\.\.|\[\.\.\.\])\s*/));
              for (const s of segs) {
                const ns = nrmLoose(s);
                if (ns.split(' ').length < 4) continue;
                if (CL.includes(ns)) continue;
                // tolerate small typos: ≥ 85% of the 4-word shingles must occur
                const w = ns.split(' '); let hit = 0, tot = 0;
                for (let i = 0; i + 4 <= w.length; i++) { tot++; if (CL.includes(w.slice(i, i + 4).join(' '))) hit++; }
                const r = tot ? hit / tot : 0;
                if (r < 0.85) add('EXPL', `Q${n} quote ${r < 0.3 ? 'NOT FROM THIS PASSAGE' : 'differs from passage'} (${Math.round(r * 100)}%): "${s.trim().slice(0, 90)}"`);
              }
            }
            if (/^Transcript\s*:/m.test(e)) tally.TRANSCRIPT_LABEL = (tally.TRANSCRIPT_LABEL || 0) + 1;
          }
          // paragraph matching: label must exist in passage
          if (/(which|following|correct) (paragraph|section)|paragraphs?,?\s+[A-Z]\s*[-–]/i.test(instr) && /^[A-J]$/.test(key)) {
            const has = new RegExp(`<(strong|b)>\\s*(Paragraph\\s+|Section\\s+)?${key}\\s*\\.?\\s*</(strong|b)>|<p>\\s*${key}\\s+[A-Z]|^${key}\\s`, 'm').test(content);
            if (!has) add('FORMAT', `Q${n} paragraph ${key} label not visible in passage`);
          }
        }
      }
      if (W.length) out.push({ id: String(p._id), title: p.title, cat: p.category, active: p.isActive !== false, tests: inT[String(p._id)] || [], warns: W });
    }
    fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
    console.log(`passages=${ps.length} withWarnings=${out.length}`, tally);
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error(e); process.exit(1); });
