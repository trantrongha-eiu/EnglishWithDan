'use strict';

/**
 * Set the practice-list cover image (`thumbnailUrl`) of one kind of content:
 *
 *   reading    Passage          covers list: data/passageCovers.json
 *   listening  ListeningSection              data/listeningCovers.json
 *   vocab      VocabularyLesson              data/vocabLessonCovers.json
 *   writing    WritingTask2                  data/writingTask2Covers.json
 *
 * The image (local file or URL) is uploaded to R2 as a pre-cropped card
 * cover; only `thumbnailUrl` (+ updatedAt) is written — the content itself is
 * never touched. The update is conditional on the doc's updatedAt, so a
 * concurrent admin edit is never overwritten. A doc that already has a
 * thumbnailUrl is skipped unless --force.
 *
 * Covers are shown on the card without a credit line, so use only images that
 * need no attribution (Wikimedia Commons CC0 / Public domain). The covers
 * lists are made by the cover_candidates.js → cover_sheet.js → cover_pick.js
 * tools in miniIelts/, dolListening/ (lcover_*), vocabCovers/, writingCovers/.
 *
 * Run:  node backend/scripts/setThumbnail.js <kind> <id> <file|url>            (dry run)
 *       node backend/scripts/setThumbnail.js <kind> <id> <file|url> --apply [--force]
 *       node backend/scripts/setThumbnail.js <kind> --batch <covers.json> [--apply] [--force]
 *         covers.json = [{ id, image, ... }]   (image: file path relative to the json, or URL)
 */

const KINDS = {
  reading: { model: 'Passage' },
  listening: { model: 'ListeningSection' },
  vocab: { model: 'VocabularyLesson' },
  // prompts have no title: their opening words stand in for one (logs only)
  writing: { model: 'WritingTask2', titleField: 'prompt' },
};
const USAGE = 'Usage: setThumbnail.js <' + Object.keys(KINDS).join('|') + '> <id> <file|url> [--apply] [--force] | <kind> --batch <covers.json> [--apply] [--force]';

const fs = require('fs');
const path = require('path');

// Wikimedia throttles anonymous fetches (429), so URLs are downloaded here
// with a descriptive User-Agent (retrying on 429) and passed on as a data URI.
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function loadImage(image) {
  if (!/^https?:\/\//.test(image)) return image;
  let res;
  for (let i = 0; i < 4; i++) {
    res = await fetch(image, { headers: { 'User-Agent': 'EnglishWithDan-covers/1.0 (https://ieltsthayha.com)' } });
    if (res.status !== 429) break;
    await sleep(5000 * (i + 1));
  }
  if (!res.ok) throw new Error(`download ${res.status} ${image}`);
  const type = (res.headers.get('content-type') || '').split(';')[0];
  if (!/^image\//.test(type)) throw new Error(`not an image (${type}) ${image}`);
  return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
}

async function run() {
  const [kindName, ...args] = process.argv.slice(2);
  const kind = KINDS[kindName];
  if (!kind) throw new Error(USAGE);
  const apply = args.includes('--apply');
  const force = args.includes('--force');
  const pos = args.filter(a => !a.startsWith('--'));
  let items;
  if (args[0] === '--batch') {
    const file = path.resolve(pos[0] || '');
    const base = path.dirname(file);
    items = JSON.parse(fs.readFileSync(file, 'utf8')).map(it => ({
      id: it.id, image: /^https?:\/\//.test(it.image) ? it.image : path.resolve(base, it.image),
    }));
  } else {
    if (pos.length < 2) throw new Error(USAGE);
    items = [{ id: pos[0], image: /^https?:\/\//.test(pos[1]) ? pos[1] : path.resolve(pos[1]) }];
  }
  for (const it of items) {
    if (!/^[0-9a-f]{24}$/.test(String(it.id))) throw new Error(`bad id: ${it.id}`);
    if (!/^https?:\/\//.test(it.image) && !fs.existsSync(it.image)) throw new Error(`missing file: ${it.image}`);
  }

  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const Model = require('../models/' + kind.model);
  const titleField = kind.titleField || 'title';
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const docs = await Model.find({ _id: { $in: items.map(it => it.id) } }).select(titleField + ' thumbnailUrl updatedAt').lean();
    docs.forEach(d => { d.title = String(d[titleField] || '').replace(/\s+/g, ' ').slice(0, 60); });
    const byId = new Map(docs.map(d => [String(d._id), d]));
    const plan = [];
    for (const it of items) {
      const p = byId.get(String(it.id));
      if (!p) { console.log(`✗ ${it.id} not found`); continue; }
      if (p.thumbnailUrl && !force) { console.log(`- ${p.title} already has a cover (${p.thumbnailUrl}) — skipped (use --force)`); continue; }
      console.log(`${apply ? '→' : 'would set'} ${p.title} ← ${path.basename(it.image)}`);
      plan.push({ p, image: it.image });
    }
    console.log(`\n${plan.length} cover(s) to set.`);
    if (!apply || !plan.length) { if (plan.length) console.log('dry run — re-run with --apply.'); return; }

    const r2 = require('../services/r2Service');
    if (!r2.isConfigured()) throw new Error('R2_* env vars missing — see services/r2Service.js');
    for (const { p, image } of plan) {
      try {
        // Pre-cropped 640×320 card cover on R2, same as an admin upload (routes/admin/_shared.js).
        const res = { secure_url: await r2.uploadCoverImage(await r2.loadBuffer(await loadImage(image))) };
        const r = await Model.collection.updateOne(
          { _id: p._id, updatedAt: p.updatedAt },
          { $set: { thumbnailUrl: res.secure_url, updatedAt: new Date() } });
        console.log(`${r.modifiedCount ? '✓' : '✗ changed meanwhile'} ${p.title} → ${res.secure_url}`);
      } catch (e) {
        console.log(`✗ ${p.title}: ${e.message}`);
      }
      await sleep(800);
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(e => { console.error('[cover] FAILED', e); process.exit(1); });
