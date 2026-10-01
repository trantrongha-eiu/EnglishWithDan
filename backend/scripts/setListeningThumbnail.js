'use strict';

/**
 * Set the practice-list cover image (ListeningSection.thumbnailUrl) of Listening sections.
 *
 * The image (local file or URL) is re-hosted on our Cloudinary as
 * listening/covers/<slug>-<id suffix>; only `thumbnailUrl` (+ updatedAt) is written — the
 * passage content is never touched. The update is conditional on the
 * passage's updatedAt, so a concurrent admin edit is never overwritten.
 * A passage that already has a thumbnailUrl is skipped unless --force.
 *
 * Covers are shown on the card without a credit line, so use only images that
 * need no attribution (Wikimedia Commons CC0 / Public domain). The chosen
 * files and their licences are recorded in data/listeningCovers.json
 * (made by dolListening/lcover_candidates.js → lcover_sheet.js → lcover_pick.js).
 *
 * Run:  node backend/scripts/setListeningThumbnail.js <passageId> <file|url>            (dry run)
 *       node backend/scripts/setListeningThumbnail.js <passageId> <file|url> --apply [--force]
 *       node backend/scripts/setListeningThumbnail.js --batch <covers.json> [--apply] [--force]
 *         covers.json = [{ id, image, ... }]   (image: file path relative to the json, or URL)
 */

const fs = require('fs');
const path = require('path');

const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Wikimedia rejects Cloudinary's own fetches (429), so URLs are downloaded
// here with a descriptive User-Agent and uploaded as a data URI.
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
  const args = process.argv.slice(2);
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
    if (pos.length < 2) throw new Error('Usage: setListeningThumbnail.js <passageId> <file|url> [--apply] [--force] | --batch <covers.json> [--apply] [--force]');
    items = [{ id: pos[0], image: /^https?:\/\//.test(pos[1]) ? pos[1] : path.resolve(pos[1]) }];
  }
  for (const it of items) {
    if (!/^[0-9a-f]{24}$/.test(String(it.id))) throw new Error(`bad passage id: ${it.id}`);
    if (!/^https?:\/\//.test(it.image) && !fs.existsSync(it.image)) throw new Error(`missing file: ${it.image}`);
  }

  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const Passage = /* ListeningSection */ require('../models/ListeningSection');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const docs = await Passage.find({ _id: { $in: items.map(it => it.id) } }).select('title thumbnailUrl updatedAt').lean();
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

    const cloudinary = require('cloudinary').v2;
    cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
    for (const { p, image } of plan) {
      try {
        const res = await cloudinary.uploader.upload(await loadImage(image), {
          // some titles repeat (two "Jewels from the sea"), so the id suffix keeps covers apart
          public_id: `listening/covers/${slugify(p.title)}-${String(p._id).slice(-6)}`, overwrite: true, resource_type: 'image',
          transformation: [{ width: 1200, crop: 'limit' }],
        });
        const r = await Passage.collection.updateOne(
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
