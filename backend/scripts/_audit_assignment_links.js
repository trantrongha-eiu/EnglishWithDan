'use strict';
// READ-ONLY audit of class homework (Assignment.resources):
//  1. every internal item still points at a real, still-assignable resource
//     of its type (not deleted / unpublished / in another course);
//  2. its stored label snapshot still matches the resource's real name
//     (catches mixed-up / wrong-name assignments);
//  3. its resourceCode deep-link key matches the resource (week / lessonKey /
//     lesson code), so the student "Bắt đầu" link opens the right thing;
//  4. fixed mock bundles point at real tests with matching name snapshots;
//  5. catalog coverage: how many items of each type the picker can offer
//     (default page = 100, speaking = 300 — the rest only via search).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const ClassGroup = require('../models/ClassGroup');
const WT1Module = require('../models/WT1Module');
const ListeningTest = require('../models/ListeningTest');
const ReadingTest = require('../models/ReadingTest');
const WritingExam = require('../models/WritingExam');
const SpeakingQuestion = require('../models/SpeakingQuestion');
const rcs = require('../services/resourceCompletionService');

const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const { REGISTRY } = rcs;
  const classes = new Map((await ClassGroup.find().select('name').lean()).map((c) => [String(c._id), c.name]));
  const asgs = await Assignment.find().sort({ createdAt: 1 }).lean();
  const issues = [];
  let internalCount = 0;
  const byType = {};

  const scopeCache = {};
  async function scopeOf(entry) {
    if (!entry.catalog.courseScope) return null;
    const c = entry.catalog.courseScope;
    if (!scopeCache[c]) scopeCache[c] = (await WT1Module.find({ courseCode: c }).select('code').lean()).map((m) => m.code);
    return scopeCache[c];
  }

  for (const a of asgs) {
    const where = `[${classes.get(String(a.classId)) || a.classId}] "${a.title}" (${a.status})`;
    for (const r of a.resources) {
      if (r.kind !== 'internal') continue;
      internalCount++;
      byType[r.resourceType] = (byType[r.resourceType] || 0) + 1;
      const entry = REGISTRY[r.resourceType];
      if (!entry) { issues.push(`${where}: unknown type ${r.resourceType}`); continue; }
      if (r.resourceType === 'mock_test') {
        const b = r.mockBundle;
        if (!b) { issues.push(`${where}: mock_test legacy (random per student)`); continue; }
        const checks = [
          [ListeningTest, b.listeningTestId, b.listeningTestName, (d) => d.name],
          [ReadingTest, b.readingTestId, b.readingTestName, (d) => d.name],
          [WritingExam, b.writingExamId, b.writingExamName, (d) => d.name],
          [SpeakingQuestion, b.speakingQuestionId, b.speakingTopic, (d) => d.topic],
        ];
        for (const [M, id, snap, nameOf] of checks) {
          const d = await M.findById(id).lean();
          if (!d) issues.push(`${where}: mock ${M.modelName} ${id} MISSING`);
          else if (snap && norm(snap) !== norm(nameOf(d))) issues.push(`${where}: mock ${M.modelName} name snapshot "${snap}" != real "${nameOf(d)}"`);
        }
        continue;
      }
      if (entry.catalog.static) continue; // fixed list (task1_skill) — nothing to drift
      const doc = await entry.catalog.model.findById(r.resourceId).lean();
      if (!doc) { issues.push(`${where}: ${r.resourceType} ${r.resourceId} "${r.label}" — RESOURCE DELETED`); continue; }
      const realLabel = entry.catalog.shape(doc).label;
      const filterOk = await entry.catalog.model.exists({ _id: r.resourceId, ...entry.catalog.filter });
      if (!filterOk) issues.push(`${where}: ${r.resourceType} "${r.label}" — no longer active/published`);
      const scope = await scopeOf(entry);
      if (scope && !scope.includes(doc.moduleCode)) issues.push(`${where}: ${r.resourceType} "${r.label}" — lesson belongs to ANOTHER course (module ${doc.moduleCode})`);
      if (norm(r.label) !== norm(realLabel)) issues.push(`${where}: ${r.resourceType} label "${r.label}" != real "${realLabel}"`);
      if (entry.catalog.deepLinkKey) {
        const want = entry.catalog.deepLinkKey(doc);
        if (String(r.resourceCode || '') !== String(want || '')) issues.push(`${where}: ${r.resourceType} "${r.label}" resourceCode "${r.resourceCode || ''}" != expected "${want}"`);
      }
    }
  }

  console.log(`assignments: ${asgs.length} · internal items: ${internalCount}`);
  console.log('items by type:', byType);
  console.log(`\n=== ISSUES (${issues.length}) ===`);
  for (const i of issues) console.log(' -', i);

  console.log('\n=== CATALOG COVERAGE (assignable items per type) ===');
  for (const [type, entry] of Object.entries(REGISTRY)) {
    if (!entry.catalog) { console.log(`  ${type}: synthetic`); continue; }
    if (entry.catalog.static) { console.log(`  ${type}: ${entry.catalog.static.length} (fixed list)`); continue; }
    const q = { ...entry.catalog.filter };
    const scope = await scopeOf(entry);
    if (scope) q.moduleCode = { $in: scope };
    const n = await entry.catalog.model.countDocuments(q);
    const cap = type === 'speaking' ? 300 : 100;
    console.log(`  ${type}: ${n}${n > cap ? `  <-- picker shows only ${cap} without search` : ''}`);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
