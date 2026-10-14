require('dotenv').config();
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');
const SKIP = new Set(['6a469adf0c7fb73f80bccb4a']); // known transcript/question mismatch, needs manual repair
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const sections = await ListeningSection.find().select('title transcript questionGroups').lean();
  const pending = [];
  for (const s of sections) {
    if (SKIP.has(s._id.toString())) continue;
    const qs = [];
    (s.questionGroups||[]).forEach(g => (g.questions||[]).forEach(q => qs.push(q)));
    const hasTranscript = s.transcript && s.transcript.trim().length >= 200;
    const missing = qs.filter(q => !q.explanation || !q.explanation.trim()).length;
    if (hasTranscript && missing > 0) pending.push(s._id.toString());
  }
  console.log(pending.slice(0, 4).join(' '));
  console.log('remaining total (excluding flagged):', pending.length);
  await mongoose.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});
