'use strict';

/**
 * One-off content fix: "Planning a party" (ListeningSection
 * 6a43ec06e56e021a6ea684d8) had a transcript that stopped mid-conversation
 * right after Q4 — Q5-Q10 had no transcript text to check answers against.
 * The real audio (audioUrl on the doc) covers the whole conversation; the
 * continuation below is transcribed from that audio via Groq Whisper
 * (same engine already used for the app's dictation-alignment feature),
 * lightly cleaned up (punctuation, obvious ASR slips), and verified against
 * every one of Q5-Q10's existing correctAnswer before writing this file —
 * see chat log 2026-09-11.
 *
 * Run: node backend/scripts/fixPlanningAPartyTranscript.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');

const SECTION_ID = '6a43ec06e56e021a6ea684d8';

const CONTINUATION = `
Michelle: Okay, then. I'll book that today. They're very good, and they might even sing at your table.
Michelle: Okay, now we need to talk about the type of service you want for the dinner. We have two options. A self-service buffet or table?
Brian Troy: Let's go with the last choice.
Michelle: Just so you know, the price is the same for either chicken or a vegetarian plate. One last thing to decide on. Are you planning anything special for your wife?
Brian Troy: Well, I was thinking that at 8 o'clock or so, I would like to have a cake brought out.
Michelle: Very nice. And because you're making reservations for such a large group, the cake is complimentary. What flavor would you like?
Brian Troy: Well, it would have to be lemon. I really love chocolate, but it is her day, so let's go with her favorite.
Michelle: Good decision. Now, let me tell you about the cakes. We have a square cake which would easily serve all of your guests, or you could have two cheesecakes. They're really popular right now.
Brian Troy: I prefer the first option because I would like to have something special written on it. But let's keep it simple. How about congratulations?
Michelle: Okay, I can have our baker take care of that. He's happy to show you what it would look like if you wish. Now, is there anything else?
Brian Troy: No, I don't think so. I think that we have pretty well talked about everything.
Michelle: So let's look after the reservation details. I'll need to have a deposit of $50.
Brian Troy: Let's make it for $100, and I'll put it on my MasterCard. Is that okay?
Michelle: Sure. What's the 16-digit account number?
Brian Troy: 5544 1200 4326 8887, and it expires in November.
Michelle: Is there another name on the card beside Brian Troy? A middle name or initial?
Brian Troy: Yes, Sebastian. I'll spell it for you. S-E-B-A-S-T-I-A-N.
Michelle: Is there anything else?
Brian Troy: No, I think that's it.
Michelle: However, you need to be aware of an additional fee. For large groups, there is an extra charge which covers service. But I think that that's all for now. We look forward to having your celebration dinner here.`;

async function run() {
  const section = await ListeningSection.findById(SECTION_ID);
  if (!section) throw new Error(`Section ${SECTION_ID} not found`);
  if (section.title !== 'Planning a party') {
    throw new Error(`Refusing to run: expected title "Planning a party", found "${section.title}"`);
  }
  if (/Sebastian/i.test(section.transcript)) {
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
