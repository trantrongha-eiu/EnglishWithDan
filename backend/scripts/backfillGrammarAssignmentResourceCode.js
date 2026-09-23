'use strict';

// One-off backfill: grammar resources on assignments created before the
// resourceCompletionService.js REGISTRY.grammar.catalog.deepLinkKey fix had
// resourceCode stuck at '' (deepLinkKeyFor returned '' with no deepLinkKey
// defined), which is exactly why "Bắt đầu" ignored the assigned lesson (see
// dashboard-homework.js's hwResourceHref grammar case). New/edited
// assignments now populate it automatically via buildResources; this just
// catches up docs that predate the fix and won't be re-saved otherwise.

require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const EssentialGrammarLesson = require('../models/EssentialGrammarLesson');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const assignments = await Assignment.find({ 'resources.resourceType': 'grammar', 'resources.resourceCode': '' });
  console.log(`Found ${assignments.length} assignment(s) with an unpatched grammar resource.`);

  let touched = 0;
  for (const a of assignments) {
    let changed = false;
    for (const r of a.resources) {
      if (r.resourceType === 'grammar' && r.resourceId && !r.resourceCode) {
        const lesson = await EssentialGrammarLesson.findById(r.resourceId).select('lessonKey title').lean();
        if (lesson && lesson.lessonKey) {
          console.log(`  ${a.title}: "${r.label}" -> lesson=${lesson.lessonKey}`);
          r.resourceCode = lesson.lessonKey;
          changed = true;
        } else {
          console.log(`  ${a.title}: "${r.label}" -> WARNING, no matching EssentialGrammarLesson found for resourceId ${r.resourceId}`);
        }
      }
    }
    if (changed) { await a.save(); touched++; }
  }
  console.log(`Updated ${touched} assignment document(s).`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
