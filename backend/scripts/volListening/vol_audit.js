// READ-ONLY deep audit of one VOL's Listening content in the live DB: every "Vol <V> - Test N" full test, the đề lẻ
// each of its parts comes from (matched by title), and the local drafts (web/vol<V>/draft) for the parts we seeded.
//   node vol_audit.js <V>            (NOHEAD=1 skips the HTTP checks of audio / cover / map URLs)
// Checks: test shape (4 parts, Q1–40, 10 per part), full-test copy == đề lẻ (keys, questions, explanations,
// transcript), draft == DB keys, đề lẻ live with audio/cover/transcript/explanations/map images, every URL answers,
// full-test audio length ≈ sum of its parts, quoted transcript in each explanation exists in the transcript.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const VOL = process.argv[2];
if (!VOL) { console.log('usage: node vol_audit.js <vol>'); process.exit(1); }
const W = f => path.join(__dirname, 'web', `vol${VOL}`, f);

// ellipses, quote marks ('Get good shoes.' vs "Get good shoes.") and British/US spelling (centre/center) aren't mismatches
const norm = s => ' ' + String(s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').toLowerCase()
  .replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—−-]/g, ' ').replace(/\.{2,}|…/g, ' ')
  .replace(/[^a-z0-9'£$%. ]+/g, ' ').replace(/(^|\s)'+|'+(?=[\s.]|$)/g, '$1 ').replace(/\b(cent|met|theat|fib)re\b/g, '$1er')
  .replace(/\.(\s|$)/g, ' ').replace(/\s+/g, ' ') + ' ';
const qsOf = s => (s.questionGroups || []).flatMap(g => g.questions || []);
// canonical form: no ids, no null/empty values, sorted keys (the two schemas store defaults differently)
const isEmpty = v => v == null || v === '' || (Array.isArray(v) && !v.length);
const stripIds = o => Array.isArray(o) ? o.map(stripIds) : (o && typeof o === 'object' && !(o instanceof Date) && !o._bsontype)
  ? Object.fromEntries(Object.entries(o).filter(([k, v]) => k !== '_id' && k !== '__v' && !isEmpty(v)).sort(([a], [b]) => a < b ? -1 : 1)
    .map(([k, v]) => [k, stripIds(v)]).filter(([, v]) => !(v && typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length)))
  : (o && o._bsontype ? String(o) : o);
const same = (a, b) => JSON.stringify(stripIds(a)) === JSON.stringify(stripIds(b));

const urlCache = new Map();
async function head(url) {
  if (!url) return 'EMPTY';
  if (process.env.NOHEAD) return 'ok';
  if (urlCache.has(url)) return urlCache.get(url);
  let res = 'ok';
  try {
    const r = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-1023' } });
    if (!(r.ok || r.status === 206)) res = `HTTP ${r.status}`;
    r.body && r.body.cancel && r.body.cancel().catch(() => {});
  } catch (e) { res = `fetch ${e.cause && e.cause.code || e.message}`; }
  urlCache.set(url, res);
  return res;
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const tests = (await db.collection('listeningtests').find({ name: new RegExp(`^Vol ${VOL} - Test \\d+$`) }).toArray())
    .sort((a, b) => a.testNumber - b.testNumber);
  const imported = fs.existsSync(W('imported.json')) ? JSON.parse(fs.readFileSync(W('imported.json'), 'utf8')) : {};
  const newIds = new Set(Object.values(imported));
  const problems = [];
  const P = (where, msg) => problems.push(`${where}: ${msg}`);
  const seenSections = new Map();
  let quotesChecked = 0;

  async function auditSection(s, where, standalone) {
    const qs = qsOf(s);
    const nums = qs.map(q => q.questionNumber).sort((a, b) => a - b);
    const base = (s.partNumber - 1) * 10;
    const want = Array.from({ length: 10 }, (_, i) => base + i + 1);
    if (JSON.stringify(nums) !== JSON.stringify(want)) P(where, `question numbers ${nums.join(',')}`);
    if (!s.questionRange || s.questionRange.start !== base + 1 || s.questionRange.end !== base + 10) P(where, `questionRange ${JSON.stringify(s.questionRange)}`);
    if ((s.transcript || '').length < 1000) P(where, `transcript only ${(s.transcript || '').length} chars`);
    // speaker labels on their own line ("Sally:") sit between two sentences of one quote; "day.It's" lacks a space
    const tr = norm(String(s.transcript || '').replace(/^[A-Z][\w .'-]{0,30}:\s*$/gm, ' ').replace(/([a-z0-9][.?!,])([A-Z])/g, '$1 $2'));
    const glued = String(s.transcript || '').match(/[a-z][.?!,][A-Z][a-z]/g) || [];
    if (glued.length) P(where, `transcript: ${glued.length} missing space(s) after punctuation, e.g. "${glued.slice(0, 3).join('", "')}"`);
    for (const q of qs) {
      const n = q.questionNumber, ca = String(q.correctAnswer || '').trim();
      if (!ca) P(where, `Q${n} empty key`);
      if (!String(q.questionText || '').trim()) P(where, `Q${n} empty questionText`);
      const ex = String(q.explanation || '');
      if (!ex.trim()) { P(where, `Q${n} no explanation`); continue; }
      if (!/Transcript:/.test(ex) || !/Phân tích:/.test(ex)) P(where, `Q${n} explanation not in Vị trí/Transcript/Phân tích form`);
      // every quoted stretch ("…" or “…”) on the Transcript line; text between quotes ("— Steve:", " … ") is not a quote
      const line = (ex.match(/Transcript:([^\n]*)/) || [])[1] || '';
      const quotes = [...line.matchAll(/“([^”]*)”|"([^"]*)"/g)].map(q => q[1] ?? q[2]);
      for (const quote of quotes) {
        // a quote may join two turns with " — " / " ... "
        for (const part of quote.replace(/\[[^\]]*\]/g, ' ').split(/\s*(?:—|\.\.\.|…)\s*/)) {
          const p = norm(part).trim();
          if (p.length > 12) quotesChecked++;
          if (p.length > 12 && !tr.includes(' ' + p + ' ')) P(where, `Q${n} quote not in transcript: "${part.slice(0, 70)}"`);
        }
      }
      if (q.type === 'multiple-choice' && /^[A-Z]$/.test(ca) && ca.charCodeAt(0) - 65 >= (q.options || []).length) P(where, `Q${n} key ${ca} beyond ${q.options.length} options`);
      if (q.type === 'multiple-choice') {
        const opts = (q.options || []).map(o => norm(o));
        if (new Set(opts).size !== opts.length) P(where, `Q${n} duplicate options`);
      }
    }
    for (const g of s.questionGroups || []) {
      if (g.groupType === 'map') {
        if (!g.imageUrl) P(where, `map group has NO IMAGE`);
        else { const h = await head(g.imageUrl); if (h !== 'ok') P(where, `map image ${h} ${g.imageUrl}`); }
      }
      if (/NO WORD ONLY|ONE MORE THAN|NO MORE THAN ONE WORDS/i.test(g.instruction || '')) P(where, `odd instruction "${g.instruction}"`);
      for (const q of g.questions || []) if (q.imageUrl) { const h = await head(q.imageUrl); if (h !== 'ok') P(where, `Q${q.questionNumber} image ${h}`); }
    }
    if (standalone) {
      if (!s.isActive) P(where, 'đề lẻ HIDDEN');
      if (!s.audioUrl) P(where, 'NO AUDIO'); else { const h = await head(s.audioUrl); if (h !== 'ok') P(where, `audio ${h} ${s.audioUrl}`); }
      if (!(s.audioDuration > 60)) P(where, `audioDuration ${s.audioDuration}`);
      if (!s.thumbnailUrl) P(where, 'NO COVER'); else { const h = await head(s.thumbnailUrl); if (h !== 'ok') P(where, `cover ${h}`); }
      if (/–\s*Part\s*\d|^Part \d/i.test(s.title)) P(where, `placeholder title "${s.title}"`);
    }
  }

  const rows = [];
  for (const t of tests) {
    const T = t.name;
    if (!t.isActive) P(T, 'test HIDDEN');
    if (t.seriesName !== `Vol ${VOL}`) P(T, `seriesName "${t.seriesName}"`);
    if (`Vol ${VOL} - Test ${t.testNumber}` !== T) P(T, `testNumber ${t.testNumber}`);
    if ((t.sections || []).map(s => s.partNumber).join() !== '1,2,3,4') P(T, `parts ${(t.sections || []).map(s => s.partNumber)}`);
    if (!t.audioUrl) P(T, 'NO AUDIO'); else { const h = await head(t.audioUrl); if (h !== 'ok') P(T, `audio ${h}`); }
    let sum = 0;
    const row = { test: T, parts: [] };
    for (const s of t.sections || []) {
      const where = `${T} P${s.partNumber}`;
      await auditSection(s, where + ' (full)', false);
      const lone = await db.collection('listeningsections').find({ title: s.title, partNumber: s.partNumber }).toArray();
      if (lone.length !== 1) { P(where, `${lone.length} đề lẻ titled "${s.title}"`); if (!lone.length) continue; }
      const l = lone[0];
      sum += l.audioDuration || 0;
      row.parts.push(`${s.partNumber}:${newIds.has(String(l._id)) ? 'new' : 'old'}`);
      if (!seenSections.has(String(l._id))) { seenSections.set(String(l._id), where); await auditSection(l, `${where} (lẻ ${String(l._id).slice(-6)})`, true); }
      // the full test embeds a COPY → must equal the đề lẻ
      if (!same(s.questionGroups, l.questionGroups)) {
        const a = qsOf(s), b = qsOf(l);
        const diffs = [];
        for (const q of a) {
          const o = b.find(x => x.questionNumber === q.questionNumber);
          if (!o) { diffs.push(`Q${q.questionNumber} missing in lẻ`); continue; }
          for (const k of ['correctAnswer', 'questionText', 'explanation', 'type']) if (String(q[k]) !== String(o[k])) diffs.push(`Q${q.questionNumber}.${k}`);
          if (JSON.stringify(q.options || []) !== JSON.stringify(o.options || [])) diffs.push(`Q${q.questionNumber}.options`);
        }
        P(where, `full-test copy ≠ đề lẻ questionGroups${diffs.length ? ' [' + diffs.slice(0, 8).join(' ') + ']' : ' (group config)'}`);
      }
      if ((s.transcript || '') !== (l.transcript || '')) P(where, 'full-test transcript ≠ đề lẻ transcript');
      // our draft (for parts we seeded) must match the DB
      const key = Object.keys(imported).find(k => imported[k] === String(l._id));
      if (key && fs.existsSync(W(`draft/${key}.json`))) {
        const d = JSON.parse(fs.readFileSync(W(`draft/${key}.json`), 'utf8'));
        const dk = Object.fromEntries(qsOf(d).map(q => [q.questionNumber, q.correctAnswer]));
        for (const q of qsOf(l)) if (dk[q.questionNumber] !== q.correctAnswer) P(where, `Q${q.questionNumber} DB key "${q.correctAnswer}" ≠ draft "${dk[q.questionNumber]}"`);
      }
    }
    if (t.audioDuration && sum && Math.abs(t.audioDuration - sum) > 8) P(T, `audioDuration ${t.audioDuration}s vs parts ${sum}s`);
    row.dur = `${Math.round(t.audioDuration / 60)}m (parts ${Math.round(sum / 60)}m)`;
    rows.push(row);
  }
  // parts of the VOL that were seeded but are in no full test (e.g. Test 5 while P1 has no audio)
  for (const [k, id] of Object.entries(imported)) {
    if ([...seenSections.keys()].includes(id)) continue;
    const l = await db.collection('listeningsections').findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!l) { P(k, `imported section ${id} NOT FOUND`); continue; }
    await auditSection(l, `${k} (lẻ only, ${id.slice(-6)})`, true);
    const d = fs.existsSync(W(`draft/${k}.json`)) && JSON.parse(fs.readFileSync(W(`draft/${k}.json`), 'utf8'));
    if (d) { const dk = Object.fromEntries(qsOf(d).map(q => [q.questionNumber, q.correctAnswer])); for (const q of qsOf(l)) if (dk[q.questionNumber] !== q.correctAnswer) P(k, `Q${q.questionNumber} DB key ≠ draft`); }
    rows.push({ test: `${k} (lẻ only)`, parts: [] });
  }
  for (const r of rows) console.log(`${r.test.padEnd(22)} ${r.parts.join(' ')}  ${r.dur || ''}`);
  console.log(`\n${quotesChecked} explanation quotes checked\n${problems.length} problem(s)`);
  for (const p of problems) console.log('  ' + p);
  await mongoose.disconnect();
})();
