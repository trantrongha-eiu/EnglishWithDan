'use strict';

/**
 * Import standalone Reading passages ("đề lẻ") prepared from
 * mini-ielts.com "Recent Actual Tests" (see data/miniIeltsReading/*.json).
 *
 * Each data file is an array of { source, imageUrl, doc } where `doc` is a
 * ready Passage document (questionGroups in our schema, questions renumbered
 * to the passage's category range, keys hand-checked — mini-ielts's own
 * solutions are wrong in places). Passages are inserted INACTIVE
 * (isActive:false) so a teacher reviews them in admin before students see
 * them.
 *
 *  - Duplicate guard: skipped when a passage with the same title already
 *    exists, or when ≥15% of its 8-word sequences already appear in any
 *    existing passage (same article under another title).
 *  - The illustration is re-hosted on our Cloudinary (reading/mini-ielts/<slug>)
 *    and placed under the title; a failed image upload never blocks the
 *    passage (it is imported without an image and reported).
 *  - Inserts only (insertOne per passage); nothing existing is modified.
 *
 * Run:  node backend/scripts/importMiniIeltsReading.js <data.json>            (dry run)
 *       node backend/scripts/importMiniIeltsReading.js <data.json> --apply
 */

const fs = require('fs');
const path = require('path');

const norm = s => String(s).replace(/<[^>]+>/g, ' ').toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/);
function grams(words, n = 8) { const o = new Set(); for (let i = 0; i + n <= words.length; i++) o.add(words.slice(i, i + n).join(' ')); return o; }
const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function rehost(cloudinary, url, slug) {
  const res = await cloudinary.uploader.upload(url, {
    public_id: `reading/mini-ielts/${slug}`, overwrite: true, resource_type: 'image',
    transformation: [{ width: 900, crop: 'limit' }],
  });
  return res.secure_url;
}

function withImage(content, url, title) {
  const img = `<p style="text-align:center"><img src="${url}" alt="${title.replace(/"/g, '&quot;')}" style="max-width:100%;max-height:320px;height:auto;border-radius:6px"></p>`;
  return content.replace(/(<h2>[\s\S]*?<\/h2>)/, `$1\n\n${img}`);
}

// --image <passageId> <imageUrl> [credit]: add a (replacement) illustration to
// an already-imported passage that has none — e.g. a free-licence Wikimedia
// Commons photo when the source image link is dead. `credit` is shown as a
// caption (required by CC BY / BY-SA).
async function addImage([id, url, credit]) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const Passage = require('../models/Passage');
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const p = await Passage.findById(id).select('title content updatedAt').lean();
    if (!p) throw new Error(`no passage ${id}`);
    if (/<img\s/.test(p.content)) { console.log(`"${p.title}" already has an image — skipped`); return; }
    const hosted = await rehost(cloudinary, url, slugify(p.title));
    let content = withImage(p.content, hosted, p.title);
    if (credit) content = content.replace(/(<img [^>]+>)<\/p>/, `$1<br><small style="color:#888">${credit}</small></p>`);
    const r = await Passage.collection.updateOne({ _id: p._id, updatedAt: p.updatedAt }, { $set: { content, updatedAt: new Date() } });
    console.log(`${r.modifiedCount ? '✓' : '✗ changed meanwhile'} ${p.title} → ${hosted}`);
  } finally {
    await mongoose.disconnect();
  }
}

// --activate <data.json…> [--apply]: publish (isActive:true) the passages of the
// given batch files once they have passed review. Matched by exact title + the
// mini-ielts tag, then updated by an explicit _id list — never an open filter.
async function activate(args) {
  const apply = args.includes('--apply');
  const titles = args.filter(a => a !== '--apply').flatMap(f => JSON.parse(fs.readFileSync(path.resolve(f), 'utf8')).map(it => it.doc.title.trim()));
  if (!titles.length) throw new Error('Usage: importMiniIeltsReading.js --activate <data.json…> [--apply]');
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const Passage = require('../models/Passage');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const found = await Passage.find({ title: { $in: titles }, tags: 'mini-ielts' }).select('title isActive').lean();
    const missing = titles.filter(t => !found.some(p => p.title.trim() === t));
    const ids = found.filter(p => !p.isActive).map(p => p._id);
    console.log(`${titles.length} titles → ${found.length} found, ${found.length - ids.length} already active, ${ids.length} to activate${missing.length ? `; NOT FOUND: ${missing.join(' | ')}` : ''}`);
    if (!apply || !ids.length) { if (ids.length) console.log('dry run — re-run with --apply.'); return; }
    const r = await Passage.updateMany({ _id: { $in: ids }, tags: 'mini-ielts' }, { $set: { isActive: true } });
    console.log(`✓ activated ${r.modifiedCount}/${ids.length}`);
  } finally {
    await mongoose.disconnect();
  }
}

async function run() {
  if (process.argv[2] === '--image') return addImage(process.argv.slice(3));
  if (process.argv[2] === '--activate') return activate(process.argv.slice(3));
  const [file, ...flags] = process.argv.slice(2);
  if (!file) throw new Error('Usage: importMiniIeltsReading.js <data.json> [--apply]');
  const apply = flags.includes('--apply');
  const items = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));

  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const mongoose = require('mongoose');
  const Passage = require('../models/Passage');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const existing = await Passage.find({}).select('title content').lean();
    const pool = existing.map(p => ({ title: p.title, g: grams(norm(p.content)) }));
    const plan = [];
    for (const it of items) {
      const d = it.doc;
      const sameTitle = existing.find(p => p.title.trim().toLowerCase() === d.title.trim().toLowerCase());
      const g = grams(norm(d.content));
      let dup = null;
      for (const p of pool) { let h = 0; for (const k of g) if (p.g.has(k)) h++; if (h / (g.size || 1) >= 0.15) { dup = p.title; break; } }
      const reason = sameTitle ? `title exists` : dup ? `same text as "${dup}"` : null;
      const n = d.questionGroups.reduce((a, x) => a + x.questions.length, 0);
      console.log(`${reason ? 'SKIP' : 'NEW '} ${d.title} → ${d.category} Q${d.questionRange.start}-${d.questionRange.end} (${n} q)${reason ? ' — ' + reason : ''}${it.imageUrl ? '' : ' [no image]'}${d.questionGroups.some(x => x.imageUrl) ? ' [diagram]' : ''}`);
      if (!reason) { plan.push(it); pool.push({ title: d.title, g }); }
    }
    console.log(`\n${plan.length} to import (inactive).`);
    if (!apply || !plan.length) { if (plan.length) console.log('dry run — re-run with --apply.'); return; }

    const cloudinary = require('cloudinary').v2;
    cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
    for (const it of plan) {
      const d = { ...it.doc, isActive: false };
      if (it.imageUrl) {
        try { d.content = withImage(d.content, await rehost(cloudinary, it.imageUrl, slugify(d.title)), d.title); }
        catch (e) { console.log(`  ! image failed for "${d.title}": ${e.message}`); }
      }
      // diagram/map images belong to the questions — without them the group is unanswerable, so skip the passage
      let diagramFailed = false;
      for (const [i, g] of d.questionGroups.entries()) {
        if (!g.imageUrl || /res\.cloudinary\.com/.test(g.imageUrl)) continue;
        try { g.imageUrl = await rehost(cloudinary, g.imageUrl, `${slugify(d.title)}-q${i + 1}`); }
        catch (e) { console.log(`  ! diagram failed for "${d.title}" group ${i + 1}: ${e.message} — passage skipped`); diagramFailed = true; break; }
      }
      if (diagramFailed) continue;
      const created = await Passage.create(d);
      console.log(`  ✓ ${created._id} ${d.title}`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(e => { console.error('[import] FAILED', e); process.exit(1); });
