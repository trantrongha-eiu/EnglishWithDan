/**
 * Seed script – WritingTask1 / WritingTask2 pools (real IELTS Writing exam
 * questions, used by writing.html's Practice + Exam modes via
 * writingService.js's randomDoc()).
 *
 * Source: real IELTS Writing exam questions reported for May–July 2026,
 * transcribed from https://zim.vn/de-thi-ielts-writing-2026 (12 Task 1 +
 * 12 Task 2 = 24 topics). Task 1 chart/map images are hotlinked directly
 * from zim.vn's CDN (media.zim.vn) — they carry a faint zim.vn watermark;
 * that trade-off was a deliberate choice, not an oversight.
 *
 * Upserts on `prompt` (the only field guaranteed unique per topic in these
 * schemas) so re-running this script is safe and won't create duplicates.
 *
 * Run: node backend/scripts/seedWritingTasks2026Q3.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const TASK1 = [
  {
    imageUrl: 'https://media.zim.vn/6a7e9b971188ddcc80cc3439/the-charts-below-show-the-use-of-water-for-agricultural-products-in-australia-in-2004-and-the-value-of-these-products-to-the-australian-economy-in-the-same-year.webp',
    prompt: 'The charts below show the use of water for agricultural products in Australia in 2004 and the value of these products to the Australian economy in the same year. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
  },
  {
    imageUrl: 'https://media.zim.vn/6a7ebfc48e28ee778ffb81bd/the-chart-and-table-provide-data-on-online-shopping-among-australian-and-new-zealand-customers-in-2012.webp',
    prompt: 'The chart and table provide data on online shopping among Australian and New Zealand customers in 2012. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
  },
  {
    imageUrl: 'https://media.zim.vn/6a7eddf21188ddcc80ef205b/the-chart-below-shows-the-number-of-items-borrowed-from-public-libraries-in-the-uk-over-the-ten-year-period-from-1995-to-2005.webp',
    prompt: 'The chart below shows the number of items borrowed from public libraries in the UK over the ten-year period from 1995 to 2005. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
  },
  {
    imageUrl: 'https://media.zim.vn/6a83ca2ab920f563f423f19d/the-maps-below-show-recent-archaeological-findings-at-a-historic-site-in-2004-and-2014.webp',
    prompt: 'The maps below show recent archaeological findings at a historic site in 2004 and 2014. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
  },
  {
    imageUrl: 'https://media.zim.vn/6a50c0965fa19138146f28aa/de-ielts-writing-task-1-thang-6-2026-de-so-1-xlarge.webp',
    prompt: 'The pie charts illustrate the proportions of different course types chosen by students in the years 1984, 1994, and 2004. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
  },
  {
    imageUrl: 'https://media.zim.vn/6a55f77aa1fb42c436de307d/de-goc-co-watermark4x-xlarge.webp',
    prompt: 'The graph below shows the percentage of adults living in urban and rural areas who participated in four leisure activities in 1990 and 2010. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
  },
  {
    imageUrl: 'https://media.zim.vn/6a52f8aa4aad66e7a2c23e4d/de-ielts-writing-task-1-thang-6-2026-de-so-3-xlarge.webp',
    prompt: 'The line graph provides information about the number of international conferences that took place in three different cities. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
  },
  {
    imageUrl: 'https://media.zim.vn/6a52f52c4aad66e7a2c05956/de-ielts-writing-task-1-thang-6-2026-de-so-4-xlarge.webp',
    prompt: 'The graph below shows the percentage of female members of parliament in five European countries between 2000 and 2012. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate. Your report should comprise a minimum of 150 words.',
  },
  {
    imageUrl: 'https://media.zim.vn/6a2b6c15f73017201cfe3e28/de-ielts-writing-task-1-thang-52026-de-so-1.webp',
    prompt: 'The diagrams below show the changes that took place in a coastal area called Pentland between 1950 and 2007. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
  },
  {
    imageUrl: 'https://media.zim.vn/6a2b6c30f73017201cfe4805/de-ielts-writing-task-1-thang-52026-de-so-2.webp',
    prompt: 'The diagram below shows the recycling process of aluminium cans. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
  },
  {
    imageUrl: 'https://media.zim.vn/6a2b6c44f73017201cfe4d6a/de-ielts-writing-task-1-thang-52026-de-so-3.webp',
    prompt: 'The table shows the amount of money donated by charities in the USA, EU countries, and other countries to developing nations between 2006 and 2010, measured in millions of dollars. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
  },
  {
    imageUrl: 'https://media.zim.vn/6a2b6c590825e9df73b5f30b/de-ielts-writing-task-1-thang-52026-de-so-4.webp',
    prompt: 'The maps below show a housing estate as it is now and a plan for developing it in the future. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
  },
];

const TASK2 = [
  { prompt: 'Nowadays, more and more people expect things to be done instantly, such as receiving services, obtaining information, or purchasing goods without having to wait. Do you think this is a beneficial or harmful development?' },
  { prompt: 'Many celebrities complain about the way the media publicises their private lives. Some people believe that they should accept this as part of being famous. To what extent do you agree or disagree with this belief?' },
  { prompt: 'Nowadays, many children spend a considerable amount of time playing computer games and less time participating in sports. Why is this the case? Is this a beneficial or harmful trend?' },
  { prompt: 'In both education and employment, some people work harder than others. Why do some people work harder than others? Is working hard always a good thing?' },
  { prompt: 'The international community must take immediate action to ensure that all nations reduce their consumption of fossil fuels, such as gas and oil. To what extent do you agree or disagree with this belief?' },
  { prompt: 'Children can learn effectively by watching television, so they should be encouraged to watch TV both at home and at school. To what extent do you agree or disagree with this belief?' },
  { prompt: 'Too much emphasis is placed on education for young people. Some people believe that governments should spend more money on leisure activities for the youth instead. To what extent do you agree or disagree with this belief?' },
  { prompt: 'Some people believe that economic growth is essential for eliminating global poverty and hunger, while others argue that it can have harmful effects on the environment. Consider both arguments and present your viewpoint.' },
  { prompt: 'Some people believe that detailed reporting of crimes in newspapers and on TV can lead to harmful consequences and should therefore be limited. To what extent do you agree or disagree with this belief?' },
  { prompt: 'Nowadays, many celebrities are famous for their glamour and wealth rather than their achievements, which may set a negative example for young people. To what extent do you agree or disagree with this belief?' },
  { prompt: 'Some people believe that it is acceptable to use animals in any way that benefits humans, while others argue that this is morally wrong. Consider both arguments and present your viewpoint.' },
  { prompt: "Some people believe that showing imported films and TV programmes is beneficial for a country's culture, while others argue that countries should produce their own films and television programmes. Consider both arguments and present your viewpoint." },
];

async function runSeed() {
  const WritingTask1 = require('../models/WritingTask1');
  const WritingTask2 = require('../models/WritingTask2');

  const t1Ops = TASK1.map(t => ({
    updateOne: { filter: { prompt: t.prompt }, update: { $set: t }, upsert: true }
  }));
  const t2Ops = TASK2.map(t => ({
    updateOne: { filter: { prompt: t.prompt }, update: { $set: t }, upsert: true }
  }));

  const [r1, r2] = await Promise.all([
    WritingTask1.bulkWrite(t1Ops),
    WritingTask2.bulkWrite(t2Ops),
  ]);
  console.log(`[WritingTasksSeed] Task 1: upserted ${r1.upsertedCount}, modified ${r1.modifiedCount}`);
  console.log(`[WritingTasksSeed] Task 2: upserted ${r2.upsertedCount}, modified ${r2.modifiedCount}`);
}

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => runSeed())
    .then(() => { console.log('[WritingTasksSeed] Done'); mongoose.disconnect(); })
    .catch(err => { console.error('[WritingTasksSeed] Failed:', err); process.exit(1); });
}

module.exports = { runSeed, TASK1, TASK2 };
