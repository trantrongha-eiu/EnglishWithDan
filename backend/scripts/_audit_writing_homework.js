'use strict';
// READ-ONLY: for every assignment with a Writing item, list each enrolled
// student's Writing attempts since the assignment was created and whether the
// homework check (resourceCompletionService.checkCompleted) counts it.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const ClassEnrollment = require('../models/ClassEnrollment');
const WritingAttempt = require('../models/WritingAttempt');
const WT1Progress = require('../models/WT1Progress');
const WT1Lesson = require('../models/WT1Lesson');
const User = require('../models/User');
const { checkCompleted } = require('../services/resourceCompletionService');

const TYPES = ['task1_practice', 'task2_practice', 'writing_exam', 'task1_lesson'];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const asgs = await Assignment.find({ 'resources.resourceType': { $in: TYPES } }).sort({ createdAt: 1 }).lean();
  console.log('assignments with writing items:', asgs.length);
  for (const a of asgs) {
    const items = a.resources.filter((r) => r.kind === 'internal' && TYPES.includes(r.resourceType));
    console.log(`\n=== "${a.title}" class=${a.classId} created=${a.createdAt.toISOString()} status=${a.status} deadline=${a.deadline ? a.deadline.toISOString() : '-'}`);
    for (const it of items) console.log(`  item ${it.resourceType} ${it.resourceId} "${(it.label || '').slice(0, 60)}"`);
    const enr = await ClassEnrollment.find({ classId: a.classId }).select('studentId status').lean();
    for (const e of enr) {
      const u = await User.findById(e.studentId).select('name username').lean();
      const done = await checkCompleted(e.studentId, items, a.createdAt);
      const atts = await WritingAttempt.find({ userId: e.studentId, createdAt: { $gte: a.createdAt } })
        .select('submissionType examId task1Id task2Id wordCount1 wordCount2 status mode createdAt submittedAt examName').sort({ createdAt: 1 }).lean();
      const flags = items.map((it) => {
        const r = done.get(`${it.resourceType}:${it.resourceId}`);
        return r && r.completed ? 'DONE' : 'not';
      });
      const anyNot = flags.includes('not');
      if (!anyNot && !atts.length) continue;
      console.log(`  - ${u?.name || '?'} (${u?.username}) [${e.status}] check=${flags.join(',')}`);
      for (const t of atts) {
        const matches = items.some((it) => String(it.resourceId) === String(t.task1Id || t.task2Id || t.examId));
        console.log(`      att ${t._id} ${t.submissionType}/${t.mode} st=${t.status} t1=${t.task1Id || '-'} t2=${t.task2Id || '-'} exam=${t.examId || '-'} wc=${t.wordCount1}/${t.wordCount2} created=${t.createdAt.toISOString()} sub=${t.submittedAt ? t.submittedAt.toISOString() : '-'} ${matches ? 'MATCHES-ITEM' : ''} "${t.examName}"`);
      }
      const lessonItems = items.filter((it) => it.resourceType === 'task1_lesson');
      if (lessonItems.length) {
        const lessons = await WT1Lesson.find({ _id: { $in: lessonItems.map((i) => i.resourceId) } }).select('code').lean();
        const prog = await WT1Progress.find({ userId: e.studentId, lessonCode: { $in: lessons.map((l) => l.code) } }).lean();
        for (const p of prog) console.log(`      wt1 ${p.lessonCode} completedAt=${p.completedAt ? p.completedAt.toISOString() : '-'} keys=${Object.keys(p).join(',')}`);
      }
    }
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
