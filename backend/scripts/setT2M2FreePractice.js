// scripts/setT2M2FreePractice.js
//
// One-off: turn on freePractice for T2-M2 ("Bảy dạng đề" / Seven Essay
// Types) so students can open any of its lessons without the sequential
// gate. Needed because T2-L10 (now displayed as "Buổi 17") was assigned as
// homework to students who hadn't organically progressed through the
// module's earlier lessons, and the hard sequential gate added 2026-09-18
// (commit 0e30bd3c) was blocking them from opening it.
//
//   node scripts/setT2M2FreePractice.js
'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const WT1Module = require('../models/WT1Module');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Đã kết nối MongoDB');

  const before = await WT1Module.findOne({ code: 'T2-M2' }).lean();
  if (!before) { console.log('Không tìm thấy module T2-M2'); return; }
  console.log('Trước:', before.code, before.title, 'freePractice =', !!before.freePractice);

  const after = await WT1Module.findOneAndUpdate(
    { code: 'T2-M2' }, { freePractice: true }, { new: true },
  ).lean();
  console.log('Sau:', after.code, after.title, 'freePractice =', after.freePractice);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
