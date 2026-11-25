'use strict';
// Task2Template (DB) ← the Writing book's Band 6+ / Band 7+ templates.
//
// The only template text students see is frontend/js/task2-generic-templates.js
// (= writing/IELTS_Writing_EnglishWithDan_Ban_Hoc_Vien (2).docx, Phần II ·
// Template Bank). The 14 Task2Template rows (7 types × band6/band7) stay only
// as anchors — homework assignments point at their _id — so this script
// overwrites their content with the book's, in place (same _id), and the old
// pre-book sets are gone. Rows for other typeIds/levels are deactivated.
//
//   node backend/scripts/syncTask2TemplatesFromBook.js --dry   # show what changes
//   node backend/scripts/syncTask2TemplatesFromBook.js         # apply (backup first)
//   node backend/scripts/syncTask2TemplatesFromBook.js --restore <backup.json>
//
// Backups: backend/scripts/data/task2TemplateBackup/<timestamp>.json
// Re-run after every edit of task2-generic-templates.js.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const mongoose = require('mongoose');
const Task2Template = require('../models/Task2Template');

const BOOK_FILE = path.join(__dirname, '..', '..', 'frontend', 'js', 'task2-generic-templates.js');
const BACKUP_DIR = path.join(__dirname, 'data', 'task2TemplateBackup');
const META = {
  type01: { label: 'Type 01', sub: 'Adv & Disadv' },
  type02: { label: 'Type 02', sub: 'Discuss Both' },
  type03: { label: 'Type 03', sub: 'Cause–Solution' },
  type04: { label: 'Type 04', sub: 'Effect–Solution' },
  type05: { label: 'Type 05', sub: 'Cause–Effect' },
  type06: { label: 'Type 06', sub: 'Agree/Disagree' },
  type07: { label: 'Type 07', sub: 'Pos/Neg Dev' },
};

function loadBook() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(BOOK_FILE, 'utf8'), ctx);
  const G = ctx.window.TASK2_GENERIC_TEMPLATES;
  if (!G || !G.band6 || !G.band7) throw new Error('task2-generic-templates.js: no band6/band7');
  return G;
}

// Book line { label?, en, vi } → DB item { en, vi, answer:'' } (the label, an
// option name like "Đồng ý một phần", goes in front of the Vietnamese).
function toDoc(G, level, typeId, orderIndex) {
  const t = G[level][typeId];
  return {
    typeId, level, ...META[typeId], name: t.name, orderIndex, isActive: true,
    sections: t.sections.map((s) => ({
      title: s.title,
      items: s.lines.map((ln) => ({ en: ln.en, answer: '', vi: `→ ${ln.label ? `[${ln.label}] ` : ''}${ln.vi || ''}`.trim() })),
    })),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  await mongoose.connect(process.env.MONGO_URI);

  if (args.includes('--restore')) {
    const file = args[args.indexOf('--restore') + 1];
    const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const r of rows) {
      const { _id, ...rest } = r;
      await Task2Template.replaceOne({ _id }, rest, { upsert: true });
    }
    console.log(`restored ${rows.length} rows from ${file}`);
    return mongoose.disconnect();
  }

  const G = loadBook();
  const before = await Task2Template.find({}).lean();
  if (!dry) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const file = path.join(BACKUP_DIR, `${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, JSON.stringify(before, null, 1));
    console.log(`backup: ${file} (${before.length} rows)`);
  }

  const keep = new Set();
  for (const level of ['band6', 'band7']) {
    Object.keys(META).forEach((typeId, i) => {
      if (!G[level][typeId]) throw new Error(`book has no ${level} ${typeId}`);
      keep.add(`${typeId}|${level}`);
    });
  }
  let n = 0;
  for (const level of ['band6', 'band7']) {
    for (const [i, typeId] of Object.keys(META).entries()) {
      const doc = toDoc(G, level, typeId, i);
      const old = before.find((r) => r.typeId === typeId && (r.level || 'band7') === level);
      const oldCount = old ? old.sections.reduce((a, s) => a + s.items.length, 0) : 0;
      const newCount = doc.sections.reduce((a, s) => a + s.items.length, 0);
      console.log(`${level} ${typeId}: ${old ? `update ${old._id}` : 'insert'} · ${oldCount} → ${newCount} câu · "${doc.sections[0].items[0].en.slice(0, 60)}…"`);
      if (!dry) await Task2Template.updateOne({ typeId, level }, { $set: doc }, { upsert: true });
      n++;
    }
  }
  const stray = before.filter((r) => !keep.has(`${r.typeId}|${r.level || 'band7'}`) && r.isActive !== false);
  for (const r of stray) {
    console.log(`deactivate ${r._id} ${r.typeId} ${r.level} (not in the book)`);
    if (!dry) await Task2Template.updateOne({ _id: r._id }, { $set: { isActive: false } });
  }
  console.log(`${dry ? '[dry] ' : ''}${n} rows synced from the book, ${stray.length} deactivated`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
