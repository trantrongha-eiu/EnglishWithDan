/**
 * Builds backend/scripts/data/dictationDrills.json — the "Đánh vần tên & số
 * dài" dictation lessons on dictation.html — from the site's OWN Listening
 * audio (standalone sections + full tests, all on R2). No new audio: every
 * item is a clip (start/end seconds) of an existing Listening file.
 *
 * It scans each verified transcript for the IELTS Part 1 "write it exactly"
 * items — spelled names (J-O-A-N, "double L", "S A M"), phone / account
 * numbers, postcodes and reference codes, addresses, prices, big numbers —
 * and cuts the sentence around each one using the transcript's word timing
 * (transcriptTiming, from scripts/alignTranscriptTiming.js). The student
 * types only the `answer` (name / number), like the answer sheet.
 *
 *   node scripts/dictationDrills/buildDictationDrills.js   → data JSON + stats
 *   node scripts/seedDictationDrills.js                    → upsert into Mongo
 *
 * Re-run both after adding Listening content (and after its timing step).
 * Lessons are numbered per category; adding content can reshuffle which
 * item lands in which lesson — fine, attempts store the lesson title.
 */
'use strict';

require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'data', 'dictationDrills.json');
const LESSON_SIZE = 10;

const SPELL_TOK = /^[“"(]?(?:(?:[A-Z]|double|Double|DOUBLE|triple)[-–]){1,}[A-Z][.,?!;:”")]*$/; // J-O-A-N / M-O-double-R
const POSTCODE = /\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/;
const PRICE = /([£$€]\s?\d[\d,]*(?:\.\d{2})?)/;
const LONGNUM = /(?<![\w£$€.])(\d[\d -]{4,}\d)(?![\w%])/; // ≥6 digits, spaces / hyphens allowed
const ADDRESS = /\b(\d{1,4}[A-Z]?)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(Road|Street|Avenue|Lane|Close|Drive|Way|Crescent|Place|Square|Terrace|Gardens|Hill|Park)\b/;
const BIGNUM = /(?<![\w£$€.,-])(\d{1,3}(?:,\d{3})+|\d{4,}|\d+\.\d+%?|\d{2,}%)(?![\w,-])/;
const REFCODE = /\b([A-Z]{1,4}\s?\d{2,6}[A-Z]{0,2}|\d{2,5}[A-Z]{1,3})\b/;

// Lesson groups, in display order. `kinds` = which mined items go in;
// `max` caps the lesson count (prices / numbers are plentiful).
const GROUPS = [
  { key: 'spelling', category: 'spelling', kinds: ['spell'], title: 'Spelling names & words', max: 8 },
  { key: 'phone', category: 'numbers', kinds: ['phone', 'code', 'postcode', 'address'], title: 'Phone numbers, codes & addresses', max: 8 },
  { key: 'prices', category: 'numbers', kinds: ['price'], title: 'Prices', max: 7 },
  { key: 'numbers', category: 'numbers', kinds: ['number'], title: 'Big numbers, decimals & times', max: 8 },
];

function lettersOf(tok) {
  const parts = tok.replace(/[^A-Za-z-–]/g, '').split(/[-–]/).filter(Boolean);
  let out = '';
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i].toLowerCase();
    if ((p === 'double' || p === 'triple') && parts[i + 1]) { out += parts[i + 1].repeat(p === 'double' ? 2 : 3); i++; }
    else if (parts[i].length === 1) out += parts[i];
    else return null;
  }
  return out;
}

// [startIdx, endIdx] per sentence (not split after Mr. / Dr. …).
function sentenceSpans(tokens) {
  const spans = [];
  let s = 0;
  tokens.forEach((t, i) => {
    if (/[.?!]["”)]*$/.test(t) && !/^(Mr|Mrs|Ms|Dr|St)\.$/.test(t)) { spans.push([s, i]); s = i + 1; }
  });
  if (s < tokens.length) spans.push([s, tokens.length - 1]);
  return spans;
}

const cleanText = (s) => s
  .replace(/\s*\(Q\d{1,2}\)/g, '').replace(/(^|\s)Q\d{1,2}\b\.?/g, '$1')
  .replace(/(^|\s)[A-Z][A-Za-z.]*( [A-Z][A-Za-z]*)?:\s/g, '$1') // speaker labels inside a turn
  // …and colon-less ones ("How's it spelt? MAN A-U-D-L-E-Y.")
  .replace(/(^|\s)(MAN|WOMAN|BOY|GIRL|STUDENT|TUTOR|LECTURER|RECEPTIONIST|CUSTOMER|AGENT|CALLER|ASSISTANT|OFFICER|INTERVIEWER|PRESENTER|SPEAKER|CLERK|EMPLOYEE|MANAGER)(?=\s)/g, '$1')
  .replace(/\s+/g, ' ').trim();

function mineSource(src, decodeTiming) {
  const tokens = (src.transcript || '').split(/\s+/).filter(Boolean);
  const timing = decodeTiming(src.transcriptTiming);
  if (!timing || timing.length !== tokens.length) return [];
  const items = [];

  // A spelling written with spaces ("J A M I E S O N") → keyed by its first token.
  const spacedStart = new Map();
  for (let i = 0; i < tokens.length;) {
    let k = i, letters = '';
    while (k < tokens.length && (/^[A-Z][.,]?$/.test(tokens[k]) || (/^double$/i.test(tokens[k]) && /^[A-Z][.,]?$/.test(tokens[k + 1] || '')))) {
      if (/^double$/i.test(tokens[k])) { letters += tokens[k + 1][0].repeat(2); k += 2; } else { letters += tokens[k][0]; k++; }
    }
    if (letters.length >= 3 && k - i >= 3) { spacedStart.set(i, { letters, last: k - 1 }); i = k; } else i++;
  }

  const sents = sentenceSpans(tokens);
  const sentOf = (i) => sents.findIndex(([a, b]) => i >= a && i <= b);
  const used = new Set();
  const push = (kind, hitIdx, answer) => {
    const si = sentOf(hitIdx);
    if (si < 0 || used.has(si)) return;
    let [a, b] = sents[si];
    // a sentence that is only the spelling ("E-L-L-I-S-O-N.") → take the one before too
    if ((b - a + 1 <= 4 || a === hitIdx) && si > 0) a = sents[si - 1][0];
    while (a <= b && /^[A-Z][A-Z' ]*:$/.test(tokens[a])) a++;
    if (b - a + 1 > 30) { a = Math.max(a, hitIdx - 12); b = Math.min(b, hitIdx + 12); }
    const span = timing.slice(a, b + 1).filter(Boolean);
    if (span.length < 2) return;
    const start = Math.max(0, span[0][0] - 0.25);
    const nextT = timing.slice(b + 1).find(Boolean);
    const end = Math.min(span[span.length - 1][1] + 0.6, nextT ? nextT[0] - 0.05 : Infinity);
    if (end - start > 14 || end - start < 1.2) return;
    const text = cleanText(tokens.slice(a, b + 1).join(' '));
    // Two candidates in one clip ("£650 … £675", "40% of men and 30% of
    // women"): which one to type would be a guess — skip it.
    if ((text.match(/\d[\d -]{4,}\d/g) || []).length > 1) return;
    if (kind === 'price' && (text.match(/[£$€]\s?\d/g) || []).length > 1) return;
    if (kind === 'number' && text.split(/\s+/).filter((w) => /\d/.test(w)).length > 1) return;
    used.add(si);
    items.push({
      kind, answer, text,
      start: +start.toFixed(2), end: +end.toFixed(2),
      audioUrl: src.audioUrl, sourceType: src.sourceType, sourceId: String(src._id), sourceTitle: src.title, partNumber: src.partNumber,
    });
  };

  // ── spelled words, per sentence: "S-A-M, D-R-E-S-S-L-E-R" → "Sam Dressler"
  const spellAt = (i) => {
    const sp = spacedStart.get(i);
    if (sp) {
      // must match a nearby word — catches transcript typos ("W 00 D S I D E")
      const near = tokens.slice(Math.max(0, i - 8), sp.last + 3).map((w) => w.replace(/[^A-Za-z]/g, '').toLowerCase());
      return near.includes(sp.letters.toLowerCase()) ? { L: sp.letters, next: sp.last + 1 } : null;
    }
    const t = tokens[i];
    if (!SPELL_TOK.test(t) && !/^[A-Z](?:[-–](?:[A-Z]|double|triple))+[-–]?$/i.test(t)) return null;
    let str = t, k = i + 1;
    // broken over tokens: "P-A-R-G-E-double" "T-E-R"
    while (/[-–](double|triple)?$/i.test(str.replace(/[.,?!]+$/, '')) && tokens[k] && /^[A-Z]([-–]|[.,?!]*$)/.test(tokens[k])) { str += '-' + tokens[k]; k++; }
    let L = lettersOf(str.replace(/[-–]{2,}/g, '-'));
    // "double A-R-O-N" (the "double" written as its own word)
    if (L && /^double$/i.test((tokens[i - 1] || '').replace(/[^A-Za-z]/g, ''))) L = L[0] + L;
    return L && L.length >= 2 ? { L, next: k } : null;
  };
  const capWord = (L, i) => {
    const near = tokens.slice(Math.max(0, i - 10), i + 4).map((w) => w.replace(/[^A-Za-z']/g, ''));
    const hit = near.find((w) => w.toLowerCase() === L.toLowerCase());
    return hit && /^[A-Z][a-z]/.test(hit) ? hit : L[0].toUpperCase() + L.slice(1).toLowerCase();
  };
  sents.forEach(([a, b], si) => {
    const found = [];
    for (let i = a; i <= b;) { const r = spellAt(i); if (r) { found.push({ i, L: r.L }); i = Math.max(r.next, i + 1); } else i++; }
    if (!found.some((f) => f.L.length >= 3)) return;
    if (/\b[A-Z] for [A-Z][a-z]+/.test(tokens.slice(a, b + 1).join(' '))) return; // "N for November, D-E-R" = fragment
    // a spelled question corrected in the next sentence ("L-double-E?" → "L-E-I-G-H"): keep the correction only
    // ("Is that L-double-E?" … "No. It's L-E-I-G-H." — look two sentences ahead)
    if (/\?["”]*$/.test(tokens[b]) && sents[si + 1]) {
      const na = sents[si + 1][0], nb = (sents[si + 2] || sents[si + 1])[1];
      for (let i = na; i <= nb; i++) if (spellAt(i)) return;
    }
    // "C-H-E-R-V for Victor I-L": a ≤2-letter piece continues the word before it
    const words = [];
    found.forEach((f) => { if (words.length && f.L.length <= 2) words[words.length - 1].L += f.L; else words.push({ ...f }); });
    push('spell', found[0].i, words.map((f) => capWord(f.L, f.i)).join(' '));
  });

  // ── numbers, one per sentence (most specific pattern first)
  sents.forEach(([a, b]) => {
    const toks = tokens.slice(a, b + 1);
    const txt = toks.join(' ');
    const at = (needle) => { const k = toks.findIndex((w) => w.includes(needle)); return k < 0 ? -1 : a + k; };
    let m;
    if ((m = txt.match(POSTCODE))) push('postcode', at(m[1].split(/\s/)[0]), m[1]);
    else if ((m = txt.match(ADDRESS))) push('address', at(m[1]), `${m[1]} ${m[2]} ${m[3]}`);
    else if ((m = txt.match(PRICE))) push('price', at(m[1].replace(/\s/g, '').slice(0, 3)), m[1].replace(/\s/g, '').replace(/[.,]$/, ''));
    else if ((m = txt.match(LONGNUM)) && m[1].replace(/\D/g, '').length >= 6) push('phone', at(m[1].split(/[ -]/)[0]), m[1].trim());
    else if ((m = txt.replace(/\(?Q\d{1,2}\)?/g, ' ').match(REFCODE)) && /\d/.test(m[1]) && /[A-Z]/.test(m[1])
      && !/^\d{1,2}(am|pm|th|st|nd|rd|K)$/i.test(m[1]) && !/\b00\b/.test(m[1])
      && !/^[-–]/.test(txt.slice(txt.indexOf(m[1]) + m[1].length))) push('code', at(m[1].split(' ')[0]), m[1]);
    else if ((m = txt.match(BIGNUM)) && !/^(1[89]|20)\d\d$/.test(m[1])) push('number', at(m[1]), m[1]);
  });
  return items.filter((x) => x.answer && x.answer.length >= 2);
}

// Stable pseudo-random order (so lessons mix sources but rebuilds are stable).
function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

function groupLessons(items) {
  const lessons = [];
  let order = 0;
  for (const g of GROUPS) {
    const seenAns = new Set();
    let pool = items.filter((x) => g.kinds.includes(x.kind)).filter((x) => {
      const k = x.answer.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenAns.has(k)) return false;
      seenAns.add(k);
      return true;
    });
    // prices: prefer the harder ones (pence / cents, 3+ digits)
    if (g.key === 'prices') pool.sort((x, y) => (/\.\d|\d{3}/.test(y.answer) - /\.\d|\d{3}/.test(x.answer)));
    pool = pool.slice(0, g.max * LESSON_SIZE).sort((x, y) => hash(x.text) - hash(y.text));
    const n = Math.min(g.max, Math.max(1, Math.round(pool.length / LESSON_SIZE)));
    for (let i = 0; i < n; i++) {
      const chunk = pool.slice(i * LESSON_SIZE, i === n - 1 ? pool.length : (i + 1) * LESSON_SIZE);
      if (chunk.length < 5) continue;
      lessons.push({
        slug: `${g.key}-${i + 1}`,
        title: `${g.title} · Set ${i + 1}`,
        category: g.category,
        order: order++,
        items: chunk.map(({ kind, answer, text, start, end, audioUrl, sourceType, sourceId, sourceTitle, partNumber }) =>
          ({ kind, answer, text, start, end, audioUrl, sourceType, sourceId, sourceTitle, partNumber })),
      });
    }
  }
  return lessons;
}

async function run() {
  const ListeningSection = require('../../models/ListeningSection');
  const ListeningTest = require('../../models/ListeningTest');
  const mongoose = ListeningSection.base;
  const { decodeTiming } = require('../../services/transcriptTimingService');
  const { NOT_COURSE } = require('../../utils/courseContent');
  await mongoose.connect(process.env.MONGO_URI);

  const sources = (await ListeningSection.find({ isActive: true, ...NOT_COURSE, transcriptTiming: { $ne: '' } })
    .select('title partNumber audioUrl transcript +transcriptTiming').lean())
    .filter((s) => s.audioUrl).map((s) => ({ ...s, sourceType: 'section' }));
  const tests = await ListeningTest.find({ isActive: true })
    .select('name audioUrl sections.partNumber sections.transcript sections.transcriptTiming').lean();
  for (const t of tests) {
    if (!t.audioUrl) continue;
    for (const p of t.sections || []) {
      if (p.transcript && p.transcriptTiming) sources.push({ _id: t._id, sourceType: 'test', title: `${t.name} – Part ${p.partNumber}`, partNumber: p.partNumber, audioUrl: t.audioUrl, transcript: p.transcript, transcriptTiming: p.transcriptTiming });
    }
  }

  // Standalone sections are often the same Cambridge part as a full test's
  // part — keep one copy (the standalone one: smaller audio file to load).
  sources.sort((x, y) => (x.sourceType === 'section' ? 0 : 1) - (y.sourceType === 'section' ? 0 : 1));
  const seen = new Set();
  const items = [];
  for (const src of sources) {
    for (const it of mineSource(src, decodeTiming)) {
      const key = it.answer.toLowerCase().replace(/\s/g, '') + '|' + it.text.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(it);
    }
  }
  const lessons = groupLessons(items);
  fs.writeFileSync(OUT, JSON.stringify(lessons, null, 1) + '\n');

  const byKind = {};
  items.forEach((x) => { byKind[x.kind] = (byKind[x.kind] || 0) + 1; });
  console.log(`[dictationDrills] ${sources.length} transcripts → ${items.length} items`, byKind);
  console.log(`[dictationDrills] ${lessons.length} lessons, ${lessons.reduce((n, l) => n + l.items.length, 0)} items → ${path.relative(process.cwd(), OUT)}`);
  lessons.forEach((l) => console.log(`  ${l.slug.padEnd(12)} ${l.items.length} · ${l.items.slice(0, 4).map((x) => x.answer).join(' | ')}`));
  await mongoose.disconnect();
}

if (require.main === module) run().catch((e) => { console.error('[dictationDrills] FAILED', e); process.exit(1); });

module.exports = { mineSource, groupLessons, lettersOf };
