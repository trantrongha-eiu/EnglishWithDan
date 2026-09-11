'use strict';

/**
 * One-off content fix: "Holiday Job" (ListeningSection
 * 6a468c32771254270a7cec36) had the same problem as "Planning a party" —
 * transcript stopped mid-conversation (right after the reception/porter
 * vacancy), leaving Q7-Q10 (benefits + interview details) with nothing to
 * check answers against. Continuation transcribed from the section's own
 * audio via Groq Whisper, verified against every one of Q7-Q10's existing
 * correctAnswer — see chat log 2026-09-11.
 *
 * Run: node backend/scripts/fixHolidayJobTranscript.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');

const SECTION_ID = '6a468c32771254270a7cec36';

const CONTINUATION = `
Officer: I expect you'd like to know a bit more about the general benefits for staff.
Student: Yes please.
Student: Do they provide free accommodation for staff?
Officer: It looks like they only provide it to permanent employees, but staff don't have to pay for transport to and from the island. So you'd have to stay in Port Thomas, but there are plenty of cheap places there.
Student: What about meals?
Officer: Yes, they're provided when you're on duty, so you would save money on groceries.
Officer: If you are interested, we can set up an interview for you. I know the resort personnel manager wants interviews on Wednesday, Thursday and Friday here at the college. Which day would suit you?
Student: Can we do it on Thursday as I work on Wednesdays?
Officer: Fine. Is two o'clock OK?
Student: Perfect.
Officer: OK. I've booked you in for then.
Student: Is there anything I need to take to the interview?
Officer: Let me see. Yes, you need to bring a CV giving details of your work experience and qualifications. And because they are planning on interviewing a lot of people, they've asked everyone to provide a photo as well, so they can remember who is who.`;

async function run() {
  const section = await ListeningSection.findById(SECTION_ID);
  if (!section) throw new Error(`Section ${SECTION_ID} not found`);
  if (section.title !== 'Holiday Job') {
    throw new Error(`Refusing to run: expected title "Holiday Job", found "${section.title}"`);
  }
  if (/Port Thomas/i.test(section.transcript)) {
    console.log('[fix] transcript already extended — nothing to do.');
    return;
  }
  section.transcript = section.transcript.replace(/\s*$/, '') + '\n' + CONTINUATION.trim();
  await section.save();
  console.log(`[fix] transcript extended: ${section.transcript.length} chars total.`);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await run();
  } finally {
    await mongoose.disconnect();
  }
})().catch(e => { console.error('[fix] FAILED', e); process.exit(1); });
