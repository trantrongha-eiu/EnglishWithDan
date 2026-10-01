'use strict';

/**
 * Build new fixed full Reading tests ("Actual Mocktest N") out of the active
 * standalone passages that no full test uses yet: one random passage1 +
 * passage2 + passage3 each, every passage used at most once (thầy, 2026-10-01).
 *
 * Excluded: passages whose text is ≥15% the same (8-gram) as a passage already
 * in a full test or as another candidate (keeps the first), and passages whose
 * question range is not the standard one (P1 1-13, P2 14-26, P3 27-40).
 *
 *   node createMixedReadingTests.js --plan        random pairing → data/mixedReadingTests.json (no DB write)
 *   node createMixedReadingTests.js               dry run of that plan against the live DB
 *   node createMixedReadingTests.js --apply       insert the planned tests (re-checks every passage is still
 *                                                 active and unused, and that no test has the same name/number)
 * PLAN=<file in data/> picks another plan file (runs so far: mixedReadingTests.json = Actual Mocktest 38-73,
 * mixedReadingTests_74-76.json = 74-76).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PLAN = path.join(__dirname, 'data', process.env.PLAN || 'mixedReadingTests.json');
const SERIES = 'Actual Mocktest';
const RANGE = { passage1: [1, 13], passage2: [14, 26], passage3: [27, 40] };

const norm = s => String(s || '').replace(/<[^>]+>/g, ' ').toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/);
const grams = w => { const o = new Set(); for (let i = 0; i + 8 <= w.length; i++) o.add(w.slice(i, i + 8).join(' ')); return o; };
const overlap = (a, b) => { let h = 0; for (const k of a) if (b.has(k)) h++; return h / (a.size || 1); };
const qCount = p => (p.questionGroups || []).reduce((s, g) => s + (g.questions || []).length, 0);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

async function loadState(db) {
  const passages = await db.collection('passages').find({ isActive: true }).project({ title: 1, category: 1, content: 1, questionRange: 1, questionGroups: 1 }).toArray();
  const tests = await db.collection('readingtests').find({}).toArray();
  const used = new Set(tests.flatMap(t => (t.passageIds || []).map(String)));
  return { passages, tests, used };
}

function candidates({ passages, used }) {
  const inTests = passages.filter(p => used.has(String(p._id))).map(p => grams(norm(p.content)));
  const kept = [], dropped = [];
  for (const p of passages.filter(p => !used.has(String(p._id)))) {
    const r = RANGE[p.category], q = p.questionRange || {};
    if (!r || q.start !== r[0] || q.end !== r[1] || qCount(p) !== r[1] - r[0] + 1) { dropped.push(`${p.title} — question range ${q.start}-${q.end} (${qCount(p)} q)`); continue; }
    const g = grams(norm(p.content));
    if (inTests.some(t => overlap(g, t) >= 0.15)) { dropped.push(`${p.title} — same text as a passage already in a full test`); continue; }
    if (kept.some(k => overlap(g, k.g) >= 0.15)) { dropped.push(`${p.title} — same text as another candidate`); continue; }
    kept.push({ p, g });
  }
  return { kept: kept.map(k => k.p), dropped };
}

async function run() {
  const args = process.argv.slice(2);
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  try {
    const state = await loadState(db);
    const byId = new Map(state.passages.map(p => [String(p._id), p]));

    if (args.includes('--plan')) {
      const { kept, dropped } = candidates(state);
      dropped.forEach(d => console.log(`skip: ${d}`));
      const pools = Object.keys(RANGE).map(c => shuffle(kept.filter(p => p.category === c)));
      const n = Math.min(...pools.map(x => x.length));
      const start = Math.max(0, ...state.tests.filter(t => t.seriesName === SERIES).map(t => t.testNumber || 0)) + 1;
      const plan = Array.from({ length: n }, (_, i) => ({
        name: `${SERIES} ${start + i}`, testNumber: start + i,
        passages: pools.map(pool => ({ id: String(pool[i]._id), title: pool[i].title })),
      }));
      fs.writeFileSync(PLAN, JSON.stringify({ createdAt: new Date().toISOString(), series: SERIES, tests: plan,
        unused: pools.flatMap(pool => pool.slice(n).map(p => ({ id: String(p._id), category: p.category, title: p.title }))) }, null, 1));
      console.log(`\npool sizes P1/P2/P3: ${pools.map(x => x.length).join('/')} → ${n} tests (${plan[0]?.name} … ${plan[n - 1]?.name}); plan written to ${path.relative(process.cwd(), PLAN)}`);
      return;
    }

    const { tests } = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
    const apply = args.includes('--apply');
    const problems = [];
    const seen = new Set();
    for (const t of tests) {
      if (state.tests.some(x => x.name === t.name || (x.seriesName === SERIES && x.testNumber === t.testNumber))) problems.push(`${t.name}: name/number already exists`);
      t.passages.forEach((pp, i) => {
        const p = byId.get(pp.id);
        if (!p) problems.push(`${t.name}: passage ${pp.title} not active / missing`);
        else if (p.category !== Object.keys(RANGE)[i]) problems.push(`${t.name}: ${p.title} is ${p.category}, slot P${i + 1}`);
        if (state.used.has(pp.id)) problems.push(`${t.name}: ${pp.title} already in a full test`);
        if (seen.has(pp.id)) problems.push(`${t.name}: ${pp.title} used twice in the plan`);
        seen.add(pp.id);
      });
      console.log(`${t.name}: ${t.passages.map(p => p.title).join(' | ')}`);
    }
    if (problems.length) { console.log(`\n✗ ${problems.length} problem(s) — nothing written:\n  ${problems.join('\n  ')}`); return; }
    if (!apply) { console.log(`\n${tests.length} tests OK — dry run, re-run with --apply`); return; }
    const now = new Date();
    const docs = tests.map(t => ({ name: t.name, seriesName: SERIES, testNumber: t.testNumber, isActive: true,
      passageIds: t.passages.map(p => new mongoose.Types.ObjectId(p.id)), createdAt: now, updatedAt: now, __v: 0 }));
    const r = await db.collection('readingtests').insertMany(docs);
    console.log(`\n✓ inserted ${r.insertedCount}/${docs.length} tests`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(e => { console.error('[mixed-tests] FAILED', e); process.exit(1); });
