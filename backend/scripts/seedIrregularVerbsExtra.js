'use strict';

/**
 * Add 50 more common irregular verbs to the "Irregular Verbs (động từ bất quy
 * tắc)" VocabUnit. Same shape as the existing entries:
 *   word    = "base (nghĩa tiếng Việt)"
 *   meaning = past simple (V2)
 *   example = a past-simple sentence
 *
 * Idempotent: skips any verb whose base form is already in the unit, then
 * re-sorts words[] alphabetically by base form (existing entries are already
 * alphabetical, so their relative order is unchanged). One scoped updateOne
 * by _id — no mass writes.
 *
 * Run:  node backend/scripts/seedIrregularVerbsExtra.js [--dry]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const VocabUnit = require('../models/VocabUnit');

const DRY = process.argv.includes('--dry');

// [base (nghĩa), V2, example, level]
const VERBS = [
  ['arise (nảy sinh, phát sinh)', 'arose', 'A problem arose during the meeting.', 'B2'],
  ['awake (thức dậy, đánh thức)', 'awoke', 'She awoke early this morning.', 'B1'],
  ['bear (chịu đựng, mang)', 'bore', 'She bore the pain bravely.', 'B2'],
  ['broadcast (phát sóng)', 'broadcast', 'The BBC broadcast the match live.', 'B1'],
  ['burn (đốt cháy, làm bỏng)', 'burnt / burned', 'He burnt his hand on the stove.', 'A2'],
  ['dream (mơ)', 'dreamt / dreamed', 'I dreamt about my old school.', 'A2'],
  ['forbid (cấm)', 'forbade', 'My parents forbade me to go out.', 'B2'],
  ['forecast (dự báo)', 'forecast', 'Experts forecast a sharp rise in prices last year.', 'B1'],
  ['kneel (quỳ)', 'knelt', 'He knelt down to tie his shoes.', 'B2'],
  ['learn (học)', 'learnt / learned', 'I learnt English at school.', 'A1'],
  ['lend (cho mượn)', 'lent', 'She lent me her umbrella.', 'A2'],
  ['let (để, cho phép)', 'let', 'My mum let me stay up late.', 'A2'],
  ['lie (nằm)', 'lay', 'He lay on the sofa all afternoon.', 'B1'],
  ['mean (có nghĩa là, ý muốn)', 'meant', 'I meant to call you yesterday.', 'A2'],
  ['mislead (đánh lừa, gây hiểu lầm)', 'misled', 'The advert misled many customers.', 'B2'],
  ['mistake (nhầm lẫn)', 'mistook', 'I mistook him for his brother.', 'B1'],
  ['misunderstand (hiểu lầm)', 'misunderstood', 'She misunderstood the question.', 'B1'],
  ['overcome (vượt qua)', 'overcame', 'He overcame his fear of flying.', 'B1'],
  ['overtake (vượt lên, vượt mặt)', 'overtook', 'The red car overtook us on the motorway.', 'B2'],
  ['quit (bỏ, từ bỏ)', 'quit', 'He quit smoking last year.', 'B1'],
  ['seek (tìm kiếm)', 'sought', 'They sought advice from a lawyer.', 'B2'],
  ['shake (lắc, rung)', 'shook', 'The earthquake shook the whole city.', 'A2'],
  ['shed (rụng, loại bỏ)', 'shed', 'The company shed 200 jobs last year.', 'C1'],
  ['shoot (bắn)', 'shot', 'The hunter shot a deer.', 'B1'],
  ['shrink (co lại, thu nhỏ)', 'shrank', 'My sweater shrank in the wash.', 'B2'],
  ['shut (đóng)', 'shut', 'She shut the door quietly.', 'A2'],
  ['sink (chìm)', 'sank', 'The Titanic sank in 1912.', 'B1'],
  ['slide (trượt)', 'slid', 'The children slid down the hill.', 'B1'],
  ['smell (ngửi, có mùi)', 'smelt / smelled', 'The kitchen smelt of fresh bread.', 'A2'],
  ['speak (nói)', 'spoke', 'She spoke to the manager.', 'A1'],
  ['spend (tiêu, dành)', 'spent', 'We spent two weeks in Japan.', 'A1'],
  ['spill (làm đổ, tràn)', 'spilt / spilled', 'He spilt coffee on his shirt.', 'B1'],
  ['spin (quay, xoay)', 'spun', 'The wheel spun faster and faster.', 'B1'],
  ['split (chia, tách)', 'split', 'We split the bill between us.', 'B1'],
  ['spread (lan rộng, trải ra)', 'spread', 'The news spread quickly.', 'B1'],
  ['stick (dán, dính)', 'stuck', 'She stuck a note on the fridge.', 'B1'],
  ['sting (chích, đốt)', 'stung', 'A bee stung me on the arm.', 'B2'],
  ['strike (đánh, tấn công)', 'struck', 'Lightning struck the old tree.', 'B2'],
  ['strive (cố gắng, phấn đấu)', 'strove', 'She strove to improve her English.', 'C1'],
  ['swear (thề, chửi thề)', 'swore', 'He swore to tell the truth.', 'B1'],
  ['sweep (quét)', 'swept', 'She swept the floor after dinner.', 'B1'],
  ['swing (đu, đung đưa)', 'swung', 'The door swung open.', 'B1'],
  ['tear (xé, làm rách)', 'tore', 'He tore the letter into pieces.', 'B1'],
  ['throw (ném)', 'threw', 'She threw the ball to her dog.', 'A2'],
  ['undergo (trải qua)', 'underwent', 'The city underwent major changes in the 1990s.', 'B2'],
  ['understand (hiểu)', 'understood', 'I understood the lesson clearly.', 'A1'],
  ['undertake (đảm nhận)', 'undertook', 'The team undertook a large research project.', 'C1'],
  ['upset (làm buồn, làm đảo lộn)', 'upset', 'The news upset her deeply.', 'B1'],
  ['weep (khóc)', 'wept', 'She wept at the end of the film.', 'B2'],
  ['withdraw (rút lui, rút tiền)', 'withdrew', 'He withdrew £100 from the bank.', 'B2'],
];

const base = (w) => String(w || '').split('(')[0].trim().toLowerCase();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const unit = await VocabUnit.findOne({ title: /^Irregular Verbs/i });
    if (!unit) throw new Error('Irregular Verbs unit not found');

    const have = new Set(unit.words.map(w => base(w.word)));
    const toAdd = VERBS.filter(([w]) => !have.has(base(w))).map(([word, meaning, example, level]) => ({
      type: 'vocab', word, meaning, example, level, difficulty: 1,
    }));

    console.log(`Unit ${unit.unitNumber} "${unit.title}": ${unit.words.length} words, adding ${toAdd.length}`);
    if (!toAdd.length || DRY) return;

    const merged = [...unit.words.map(w => w.toObject()), ...toAdd]
      .sort((a, b) => base(a.word).localeCompare(base(b.word)));

    await VocabUnit.updateOne({ _id: unit._id }, { $set: { words: merged } });
    console.log(`Done → ${merged.length} words`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
