// Adds ["Cam XX", "Cam XX - Test Y"] tags (matching the existing Cam21
// convention) to untagged Passage docs identified — via web search against
// public IELTS-prep answer-key sites — as belonging to Cambridge IELTS 15,
// 16, 17 and 20. Metadata-only change: titles/book/test attribution, no
// passage content is touched.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

const MAP = [
  // Cam 20
  ['The kākāpō', 20, 1], ['To Britain', 20, 1], ['How stress affects our judgement', 20, 1],
  ['Manatees(kon bòa bỉn á)', 20, 2], ['Procrastination', 20, 2], ['Invasion of the Robot Umpires', 20, 2],
  ['Frozen Food', 20, 3], ["Can the planet’s coral reefs be saved?", 20, 3], ['Robots and us', 20, 3],
  ['Georgia O’Keeffe', 20, 4], ['Adapting to the effects of climate change', 20, 4], ['A new role for livestock guard dogs', 20, 4],
  // Cam 15
  ['Nutmeg – a valuable spice', 15, 1], ['Driverless cars', 15, 1], ['What is exploration?', 15, 1],
  ['Could urban engineers learn from dance ?', 15, 2], ['Should we try to bring extinct species back to life?', 15, 2], ['Having a laugh', 15, 2],
  ['Henry Moore (1898-1986)', 15, 3], ['The Desolenator: producing clean water', 15, 3], ['Why fairy tales are really scary tales', 15, 3],
  ['The return of the huarango', 15, 4], ['Silbo Gomero – the whistle ‘language’ of the Canary Islands', 15, 4], ['Environmental practices of big businesses', 15, 4],
  // Cam 16
  ['Why we need to protect polar bears', 16, 1], ['The Step Pyramid of Djoser', 16, 1], ['The future of work', 16, 1],
  ['The White Horse of Uffington', 16, 2], ['I contain multitudes', 16, 2], ['How to make wise decisions', 16, 2],
  ['Roman shipbuilding and navigation', 16, 3], ['Climate change reveals ancient artefacts in Norway’s glaciers', 16, 3], ["Plant ‘thermometer’ triggers springtime growth by measuring night-time heat", 16, 3],
  ['Roman tunnels', 16, 4], ['Changes in reading habits', 16, 4], ['Attitudes towards Artificial Intelligence', 16, 4],
  // Cam 17
  ['The development of the London underground railway', 17, 1], ['Stadiums: past, present and future', 17, 1], ['To catch a king', 17, 1],
  ['The Dead Sea Scrolls', 17, 2], ['A second attempt at domesticating the tomato', 17, 2], ['Insight or evolution?', 17, 2],
  ['The thylacine', 17, 3], ['Palm oil', 17, 3], ["Building the Skyline: The Birth and Growth of Manhattan's Skyscrapers", 17, 3],
  ['Bats to the rescue', 17, 4], ['Does education fuel economic growth?', 17, 4], ['Timur Gareyev – blindfold chess champion', 17, 4],
];

async function runTag() {
  let tagged = 0, notFound = 0, alreadyTagged = 0;
  for (const [title, book, testNum] of MAP) {
    const p = await Passage.findOne({ title });
    if (!p) {
      console.log(`NOT FOUND: "${title}"`);
      notFound++;
      continue;
    }
    if (p.tags && p.tags.some(t => t.startsWith('Cam'))) {
      alreadyTagged++;
      continue;
    }
    p.tags = [`Cam ${book}`, `Cam ${book} - Test ${testNum}`];
    await p.save();
    tagged++;
  }
  console.log(`\n[TagCambridgeReadingPassages] Done. tagged=${tagged} notFound=${notFound} alreadyTagged=${alreadyTagged} (out of ${MAP.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runTag();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[TagCambridgeReadingPassages] FAILED', e); process.exit(1); });
}

module.exports = { runTag, MAP };
